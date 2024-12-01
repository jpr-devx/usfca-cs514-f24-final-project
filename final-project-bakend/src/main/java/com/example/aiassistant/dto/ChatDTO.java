// src/main/java/com/example/aiassistant/dto/ChatDTO.java
package com.example.aiassistant.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ChatDTO {
    private String id;
    private String assistantId;
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private List<MessageDTO> messages;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAssistantId() { return assistantId; }
    public void setAssistantId(String assistantId) { this.assistantId = assistantId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public List<MessageDTO> getMessages() { return messages; }
    public void setMessages(List<MessageDTO> messages) { this.messages = messages; }
}