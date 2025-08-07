package com.example.intercation.controller;

import com.example.intercation.dto.request.ChatMessageRequest;
import com.example.intercation.dto.response.ChatMessageResponse;
import com.example.intercation.entity.UserDetailsImpl;
import com.example.intercation.service.ChatService;
import feign.Response;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

import static org.hibernate.query.sqm.tree.SqmNode.log;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat/{channelId}")
    @Operation(summary = "채팅보내기")
    public void sendMessage(@DestinationVariable Long channelId, //  @PathVariable
                            @Payload ChatMessageRequest request,  // @RequestBody
                            Principal principal){

        if (principal == null) { // 유저 인증 안될시 돌아가
            return;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) ((Authentication) principal).getPrincipal();

        Long userId = userDetails.getUserId();

        chatService.sendMessage(channelId, userId, request);
    }

    @GetMapping("/api/channels/{channelId}/messages")
    @Operation(summary = "채팅내역 보내기")
    public ResponseEntity<?> getChatHistory(@PathVariable Long channelId) {

        List<ChatMessageResponse> history = chatService.findByChannelId(channelId);

        return ResponseEntity.ok(history);
    }



}
