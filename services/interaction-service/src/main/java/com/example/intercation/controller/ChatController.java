package com.example.intercation.controller;

import com.example.intercation.dto.request.ChatMessageRequest;
import com.example.intercation.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat/{channelId}")
    @SendTo("/topic/channel/{channelId}")
    public ChatMessageRequest sendMessage(@DestinationVariable Long channelId, ChatMessageRequest chatMessage) {



        return new ChatMessageRequest();

    }
}
