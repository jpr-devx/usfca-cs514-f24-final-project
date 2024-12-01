package com.example.aiassistant.service;

import com.example.aiassistant.dto.ChatDTO;
import com.example.aiassistant.repository.ChatRepository;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

// src/main/java/com/example/aiassistant/service/ChatService.java
@Service
public class ChatService {
    private final Firestore firestore;

    public ChatService(Firestore firestore) {
        this.firestore = firestore;
    }

    // Option 1: Simpler query without ordering (no index needed)
    public List<ChatDTO> getChatHistory(String assistantId, String userId) {
        try {
            List<ChatDTO> chats = new ArrayList<>();

            var chatDocs = firestore.collection("users")
                    .document(userId)
                    .collection("chats")
                    .whereEqualTo("assistantId", assistantId)
                    .get()
                    .get();

            for (var doc : chatDocs.getDocuments()) {
                ChatDTO chat = new ChatDTO();
                chat.setId(doc.getId());
                chat.setAssistantId(assistantId);
                chat.setUserId(userId);

                Timestamp createdAt = doc.getTimestamp("createdAt");
                if (createdAt != null) {
                    chat.setCreatedAt(LocalDateTime.ofInstant(
                            createdAt.toDate().toInstant(),
                            ZoneId.systemDefault()
                    ));
                }

                chats.add(chat);
            }

            chats.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            return chats;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch chat history: " + e.getMessage());
        }
    }

    /*
    // Option 2: If you want to use the index-based query, you'll need to:
    // 1. Visit the URL in the error message to create the index
    // 2. Use this version of the method:

    public List<ChatDTO> getChatHistory(String assistantId, String userId) {
        try {
            List<ChatDTO> chats = new ArrayList<>();

            var chatDocs = firestore.collection("users")
                .document(userId)
                .collection("chats")
                .whereEqualTo("assistantId", assistantId)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get()
                .get();

            // Rest of the method remains the same...
        }
    }
    */

    public ChatDTO createChat(String assistantId, String userId) {
        try {
            String chatId = UUID.randomUUID().toString();

            // Create chat document in Firestore
            Map<String, Object> chatData = new HashMap<>();
            chatData.put("id", chatId);
            chatData.put("assistantId", assistantId);
            chatData.put("userId", userId);
            chatData.put("createdAt", FieldValue.serverTimestamp());
            chatData.put("lastMessageAt", FieldValue.serverTimestamp());

            // Save in user's chats collection
            firestore.collection("users")
                    .document(userId)
                    .collection("chats")
                    .document(chatId)
                    .set(chatData);

            // Convert to DTO
            ChatDTO chat = new ChatDTO();
            chat.setId(chatId);
            chat.setAssistantId(assistantId);
            chat.setUserId(userId);
            chat.setCreatedAt(LocalDateTime.now());

            return chat;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create chat: " + e.getMessage());
        }
    }
}