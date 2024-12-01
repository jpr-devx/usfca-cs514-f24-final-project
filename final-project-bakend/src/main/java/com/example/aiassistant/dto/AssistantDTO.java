// src/main/java/com/example/aiassistant/dto/AssistantDTO.java
package com.example.aiassistant.dto;

import java.time.LocalDateTime;

public class AssistantDTO {
    private String id;
    private String name;
    private String description;
    private String parameters;
    private boolean isPublic;
    private String userId;
    private String fileUrl;
    private LocalDateTime createdAt;

    // Existing getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Added getters and setters
    public String getParameters() { return parameters; }
    public void setParameters(String parameters) { this.parameters = parameters; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}