package com.example.aiassistant.service;

import com.example.aiassistant.AssistantConversation;
import com.example.aiassistant.dto.MessageDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class MessageService {
    private final Firestore firestore;
    private Map<String, AssistantConversation> assistantConversations;

    public MessageService(Firestore firestore) {
        this.firestore = firestore;
        this.assistantConversations = new HashMap<>();
    }

    private AssistantConversation getOrCreateAssistantConversation(String assistantId) {
        return assistantConversations.computeIfAbsent(assistantId, id -> {
            AssistantConversation conversation = new AssistantConversation(id);
            conversation.setThread();
            return conversation;
        });
    }

    public MessageDTO addMessage(String assistantId, String userId, MessageDTO messageDTO) {
        try {
            // First, get the OpenAI assistant ID from Firestore
            DocumentSnapshot assistantDoc = firestore.collection("agents")
                    .document(assistantId)
                    .get()
                    .get();

            if (!assistantDoc.exists()) {
                throw new RuntimeException("Assistant not found: " + assistantId);
            }

            String openAiAssistantId = assistantDoc.getString("openAiAssistantId");
            if (openAiAssistantId == null) {
                throw new RuntimeException("Assistant missing OpenAI ID");
            }

            String chatId = messageDTO.getChatId();
            boolean isNewChat = chatId == null || chatId.equals("undefined");

            if (isNewChat) {
                chatId = UUID.randomUUID().toString();
                Map<String, Object> chatData = new HashMap<>();
                chatData.put("id", chatId);
                chatData.put("assistantId", assistantId);
                chatData.put("userId", userId);
                chatData.put("createdAt", FieldValue.serverTimestamp());
                chatData.put("lastMessageAt", FieldValue.serverTimestamp());

                firestore.collection("users")
                        .document(userId)
                        .collection("chats")
                        .document(chatId)
                        .set(chatData);
            }

            // Save user message with original content
            String messageId = UUID.randomUUID().toString();
            Map<String, Object> messageData = new HashMap<>();
            messageData.put("id", messageId);
            messageData.put("chatId", chatId);
            messageData.put("content", messageDTO.getContent());
            messageData.put("sender", messageDTO.getSender());
            messageData.put("userId", userId);
            messageData.put("timestamp", FieldValue.serverTimestamp());

            DocumentReference userMessageRef = firestore.collection("users")
                    .document(userId)
                    .collection("chats")
                    .document(chatId)
                    .collection("messages")
                    .document(messageId);

            userMessageRef.set(messageData);

            // Wait for assistant reply using OpenAI assistant ID
            String assistantResponse = getAssistantResponse(openAiAssistantId, chatId, messageDTO.getContent());

            // Save assistant response as a new message
            String assistantMessageId = UUID.randomUUID().toString();
            Map<String, Object> assistantMessageData = new HashMap<>();
            assistantMessageData.put("id", assistantMessageId);
            assistantMessageData.put("chatId", chatId);
            assistantMessageData.put("content", assistantResponse);
            assistantMessageData.put("sender", "assistant");
            assistantMessageData.put("userId", userId);
            assistantMessageData.put("timestamp", FieldValue.serverTimestamp());

            DocumentReference assistantMessageRef = firestore.collection("users")
                    .document(userId)
                    .collection("chats")
                    .document(chatId)
                    .collection("messages")
                    .document(assistantMessageId);

            assistantMessageRef.set(assistantMessageData);

            // Update chat's last message timestamp
            firestore.collection("users")
                    .document(userId)
                    .collection("chats")
                    .document(chatId)
                    .update("lastMessageAt", FieldValue.serverTimestamp());

            // Return the assistant's message
            MessageDTO responseDTO = new MessageDTO();
            responseDTO.setId(assistantMessageId);
            responseDTO.setChatId(chatId);
            responseDTO.setContent(assistantResponse);
            responseDTO.setSender("assistant");
            responseDTO.setUserId(userId);
            responseDTO.setTimestamp(LocalDateTime.now());

            return responseDTO;
        } catch (Exception e) {
            throw new RuntimeException("Error adding message: " + e.getMessage(), e);
        }
    }

    private String getAssistantResponse(String assistantId, String chatId, String userMessage) {
        try {
            AssistantConversation conversation = getOrCreateAssistantConversation(assistantId);

            // Check if thread is initialized
            if (conversation.thread == null || conversation.thread.getThreadId() == null) {
                conversation.setThread();
            }

            System.out.println("Using thread ID: " + conversation.thread.getThreadId());
            System.out.println("Using assistant ID: " + conversation.assistantId);

            // Create user message
            Object userMessageResponse = conversation.createUserMessage(
                    conversation.thread.getThreadId(),
                    userMessage
            );

            // Get assistant's reply and wait for completion
            Object assistantReplyObj = conversation.assistantReply();

            // Parse the run response to get run ID
            ObjectMapper mapper = new ObjectMapper();
            JsonNode runNode = mapper.readTree(assistantReplyObj.toString());
            String runId = runNode.get("id").asText();

            // Poll for completion (max 30 seconds)
            boolean isComplete = false;
            int attempts = 0;
            String status = "";
            while (!isComplete && attempts < 30) {
                try {
                    // Make request to check run status
                    URL url = new URL("https://api.openai.com/v1/threads/" + conversation.thread.getThreadId() + "/runs/" + runId);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.setRequestProperty("Authorization", "Bearer " + conversation.API_KEY);
                    conn.setRequestProperty("OpenAI-Beta", "assistants=v2");

                    int responseCode = conn.getResponseCode();
                    if (responseCode == 200) {
                        JsonNode statusResponse = mapper.readTree(conn.getInputStream());
                        status = statusResponse.get("status").asText();

                        if (status.equals("completed")) {
                            isComplete = true;
                        } else if (status.equals("failed") || status.equals("cancelled") || status.equals("expired")) {
                            throw new RuntimeException("Run failed with status: " + status);
                        } else {
                            // Wait before next polling attempt
                            Thread.sleep(1000);
                            attempts++;
                        }
                    }
                    conn.disconnect();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            if (!isComplete) {
                throw new RuntimeException("Assistant response timed out. Last status: " + status);
            }

            // Now get messages after the run is complete
            Object messagesResponse = conversation.getMessages(conversation.thread.getThreadId());
            JsonNode messages = mapper.readTree(messagesResponse.toString());

            if (messages == null) {
                return "I apologize, but I encountered an error processing your message. Please try again.";
            }

            // Extract and return response
            String response = conversation.getMostRecentMessage(messages);
            return response != null ? response : "No response received";

        } catch (Exception e) {
            System.err.println("Error getting assistant response: " + e.getMessage());
            e.printStackTrace();
            return "Sorry, I encountered an error while processing your message: " + e.getMessage();
        }
    }

    public List<MessageDTO> getMessages(String chatId, String userId) {
        try {
            List<MessageDTO> messages = new ArrayList<>();

            var messageDocs = firestore.collection("users")
                    .document(userId)
                    .collection("chats")
                    .document(chatId)
                    .collection("messages")
                    .orderBy("timestamp", Query.Direction.ASCENDING)
                    .get()
                    .get();

            for (var doc : messageDocs.getDocuments()) {
                MessageDTO message = new MessageDTO();
                message.setId(doc.getId());
                message.setChatId(chatId);
                message.setContent(doc.getString("content"));
                message.setSender(doc.getString("sender"));
                message.setUserId(doc.getString("userId"));

                Timestamp timestamp = doc.getTimestamp("timestamp");
                if (timestamp != null) {
                    message.setTimestamp(LocalDateTime.ofInstant(
                            timestamp.toDate().toInstant(),
                            ZoneId.systemDefault()
                    ));
                }

                messages.add(message);
            }

            return messages;
        } catch (Exception e) {
            throw new RuntimeException("Error fetching messages: " + e.getMessage());
        }
    }
}