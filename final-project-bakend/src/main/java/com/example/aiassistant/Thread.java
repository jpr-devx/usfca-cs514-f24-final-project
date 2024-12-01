package com.example.aiassistant;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

public class Thread {
    private String threadId;
    private String object;
    private long created_at;
    private Map<String, String> metadata;
    private Map<String, String> tool_resources;

    public Thread(Object response) {
        if (response == null) {
            throw new IllegalArgumentException("Response cannot be null");
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.toString());

            if (!rootNode.has("id")) {
                throw new IllegalArgumentException("Response missing required 'id' field");
            }

            this.threadId = rootNode.get("id").asText();
            this.object = rootNode.get("object").asText();
            this.created_at = rootNode.get("created_at").asLong();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse thread response: " + e.getMessage(), e);
        }
    }

    public String getThreadId() {
        return threadId;
    }

    public String getObject() {
        return object;
    }

    public long getCreated_at() {
        return created_at;
    }
}