package com.example.aiassistant.controller;

import com.example.aiassistant.dto.*;
import com.example.aiassistant.service.AssistantService;
import com.example.aiassistant.service.ChatService;
import com.example.aiassistant.service.MessageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
//@CrossOrigin(origins = "http://localhost:3000")
public class AssistantController {
    private final AssistantService assistantService;
    private final ChatService chatService;
    private final MessageService messageService;

    public AssistantController(
            AssistantService assistantService,
            ChatService chatService,
            MessageService messageService) {
        this.assistantService = assistantService;
        this.chatService = chatService;
        this.messageService = messageService;
    }

    @PostMapping("/login")
    public UserSessionDTO login() {
        return assistantService.createUserSession();
    }

    @GetMapping("/assistants")
    public List<AssistantDTO> getAllAssistants(@RequestHeader("User-Id") String userId) {
        try {
            return assistantService.getAllAssistants(userId);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/assistants")
    public AssistantDTO createAssistant(
            @RequestParam("file") MultipartFile file,
            @RequestParam("callsign") String callsign,
            @RequestParam("parameters") String parameters,
            @RequestParam("isPublic") boolean isPublic,
            @RequestHeader("User-Id") String userId) {
        return assistantService.createAssistant(file, callsign, parameters, isPublic, userId);
    }

    @GetMapping("/assistants/{assistantId}/chats")
    public List<ChatDTO> getChats(
            @PathVariable String assistantId,
            @RequestHeader("User-Id") String userId) {
        return chatService.getChatHistory(assistantId, userId);
    }

    @PostMapping("/assistants/{assistantId}/chats")
    public ChatDTO createChat(
            @PathVariable String assistantId,
            @RequestHeader("User-Id") String userId) {
        return chatService.createChat(assistantId, userId);
    }

    @PostMapping("/assistants/{assistantId}/messages")
    public MessageDTO addMessage(
            @PathVariable String assistantId,
            @RequestHeader("User-Id") String userId,
            @RequestBody MessageDTO messageDTO) {
        return messageService.addMessage(assistantId, userId, messageDTO);
    }

    @GetMapping("/chats/{chatId}/messages")
    public List<MessageDTO> getMessages(
            @PathVariable String chatId,
            @RequestHeader("User-Id") String userId) {
        return messageService.getMessages(chatId, userId);
    }
}