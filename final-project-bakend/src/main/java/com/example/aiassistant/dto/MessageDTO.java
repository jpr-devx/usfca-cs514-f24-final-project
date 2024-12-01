// src/main/java/com/example/aiassistant/dto/MessageDTO.java
package com.example.aiassistant.dto;

import java.time.LocalDateTime;

public class MessageDTO {
    private String id;
    private String chatId;
    private String content;
    private String sender;
    private LocalDateTime timestamp;
    private String userId;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getChatId() { return chatId; }
    public void setChatId(String chatId) { this.chatId = chatId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}