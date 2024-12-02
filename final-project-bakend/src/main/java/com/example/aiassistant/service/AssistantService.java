package com.example.aiassistant.service;

import com.example.aiassistant.AssistantConversation;
import com.example.aiassistant.dto.*;
import com.example.aiassistant.model.*;
import com.example.aiassistant.repository.*;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssistantService {
    private final AssistantRepository assistantRepository;
    private final ChatService chatService;
    private final MessageService messageService;
    private final Firestore firestore;
    private final AssistantConversation assistantConversation;

    public AssistantService(
            AssistantRepository assistantRepository,
            ChatService chatService,
            MessageService messageService,
            Firestore firestore) {
        this.assistantRepository = assistantRepository;
        this.chatService = chatService;
        this.messageService = messageService;
        this.firestore = firestore;
        this.assistantConversation = new AssistantConversation();
    }

    public AssistantDTO createAssistant(MultipartFile file, String callsign,
                                        String parameters, boolean isPublic,
                                        String userId) {
        try {
            // Handle OpenAI integration
            Path tempFile = Files.createTempFile("upload_", "_" + file.getOriginalFilename());
            file.transferTo(tempFile.toFile());

            // Create OpenAI assistant and upload file
            assistantConversation.createAssistantForFileUpload();
            String openAiFileId = assistantConversation.uploadFile(tempFile.toString());

            if (openAiFileId == null) {
                throw new RuntimeException("Failed to upload file to OpenAI");
            }

            // Get OpenAI file info
            AssistantConversation.FileResponse fileInfo =
                    assistantConversation.getFileInfo(openAiFileId);

            // Attach file to OpenAI assistant
            boolean attached = assistantConversation.attachFileToAssistant(openAiFileId);

            if (!attached) {
                throw new RuntimeException("Failed to attach file to OpenAI assistant");
            }

            // Create Firestore document
            DocumentReference docRef = firestore.collection("agents").document();
            Map<String, Object> data = new HashMap<>();
            data.put("id", docRef.getId());
            data.put("name", callsign);
            data.put("parameters", parameters);
            data.put("isPublic", isPublic);
            data.put("userId", userId);
            data.put("openAiFileId", openAiFileId);
            data.put("openAiAssistantId", assistantConversation.assistantId);
            data.put("fileInfo", Map.of(
                    "name", file.getOriginalFilename(),
                    "size", fileInfo.getBytes(),
                    "status", fileInfo.getStatus()
            ));
            data.put("createdAt", FieldValue.serverTimestamp());

            // Save to Firestore
            docRef.set(data);

            // Add to user's agents collection
            firestore.collection("users")
                    .document(userId)
                    .collection("userAgents")
                    .document(docRef.getId())
                    .set(data);

            // Clean up temp file
            Files.deleteIfExists(tempFile);

            // Create and save to JPA repository if needed
            Assistant assistant = new Assistant();
            assistant.setId(docRef.getId());
            assistant.setName(callsign);
            assistant.setDescription(parameters);
            assistant.setPublic(isPublic);
            assistantRepository.save(assistant);

            // Convert and return DTO
            AssistantDTO dto = new AssistantDTO();
            dto.setId(docRef.getId());
            dto.setName(callsign);
            dto.setParameters(parameters);
            dto.setPublic(isPublic);
            dto.setUserId(userId);

            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create assistant: " + e.getMessage(), e);
        }
    }

    // Existing methods remain the same
    public UserSessionDTO createUserSession() {
        UserSessionDTO session = new UserSessionDTO();
        session.setUserId(UUID.randomUUID().toString());
        return session;
    }

    public List<AssistantDTO> getAllAssistants(String userId) {
        try {
            List<AssistantDTO> assistants = new ArrayList<>();
            var assistantDocs = firestore.collection("agents").get().get();

            for (var doc : assistantDocs.getDocuments()) {
                boolean isPublic = doc.getBoolean("isPublic");
                String creatorId = doc.getString("userId");

                if (isPublic || (creatorId != null && creatorId.equals(userId))) {
                    AssistantDTO assistant = new AssistantDTO();
                    assistant.setId(doc.getId());
                    assistant.setName(doc.getString("name"));
                    assistant.setParameters(doc.getString("parameters"));
                    assistant.setPublic(isPublic);  // Make sure this is set
                    assistant.setUserId(creatorId);
                    assistants.add(assistant);
                }
            }
            return assistants;
        } catch (Exception e) {
            throw new RuntimeException("Error fetching assistants: " + e.getMessage());
        }
    }

    public List<ChatDTO> getChats(String assistantId, String userId) {
        return chatService.getChatHistory(assistantId, userId);
    }

    public ChatDTO createChat(String assistantId, String userId) {
        return chatService.createChat(assistantId, userId);
    }

    private ChatDTO convertToChatDTO(Chat chat) {
        ChatDTO dto = new ChatDTO();
        dto.setId(chat.getId());
        dto.setAssistantId(chat.getAssistant().getId());
        dto.setUserId(chat.getUserId());
        dto.setCreatedAt(chat.getCreatedAt());
        return dto;
    }

    // Existing helper methods remain the same
    private AssistantDTO convertToAssistantDTO(Assistant assistant) {
        AssistantDTO dto = new AssistantDTO();
        dto.setId(assistant.getId());
        dto.setName(assistant.getName());
        dto.setDescription(assistant.getDescription());
        dto.setCreatedAt(assistant.getCreatedAt());
        dto.setPublic(assistant.isPublic());
        return dto;
    }

    private MessageDTO convertToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setSender(message.getSender());
        dto.setTimestamp(message.getTimestamp());
        return dto;
    }
}