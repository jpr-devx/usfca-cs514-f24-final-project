package com.example.aiassistant.service;
import java.util.*;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {
    private Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }

    public void saveAssistant(String userId, String assistantId, String name) {
        try {
            Map<String, Object> assistantData = new HashMap<>();
            assistantData.put("assistantId", assistantId);
            assistantData.put("name", name);
            assistantData.put("createdAt", new Date());

            getFirestore()
                    .collection("users")
                    .document(userId)
                    .collection("assistants")
                    .document(assistantId)
                    .set(assistantData)
                    .get(); // Wait for completion
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to save assistant", e);
        } catch (Exception e) {
            throw new RuntimeException("Error saving assistant", e);
        }
    }

    public List<Map<String, Object>> getUserAssistants(String userId) {
        List<Map<String, Object>> assistants = new ArrayList<>();

        try {
            getFirestore()
                    .collection("users")
                    .document(userId)
                    .collection("assistants")
                    .get()
                    .get()
                    .getDocuments()
                    .forEach(doc -> assistants.add(doc.getData()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to fetch user assistants", e);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching user assistants", e);
        }

        return assistants;
    }

    public void saveChatMessage(String userId, String assistantId, String threadId, String message, String role) {
        try {
            Map<String, Object> messageData = new HashMap<>();
            messageData.put("content", message);
            messageData.put("role", role);
            messageData.put("timestamp", new Date());

            getFirestore()
                    .collection("users")
                    .document(userId)
                    .collection("chats")
                    .document(threadId)
                    .collection("messages")
                    .add(messageData)
                    .get(); // Wait for completion
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to save chat message", e);
        } catch (Exception e) {
            throw new RuntimeException("Error saving chat message", e);
        }
    }
}