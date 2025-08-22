package com.example.intercation.controller;

import com.example.intercation.dto.request.ChatMessageRequest;
import com.example.intercation.dto.request.SearchRequest;
import com.example.intercation.dto.response.ChatMessageResponse;
import com.example.intercation.dto.response.SearchResponse;
import com.example.intercation.entity.ChatMessageDocument;
import com.example.intercation.service.ChatMessageSearchService;
import com.example.intercation.util.UserDetailsImpl;
import com.example.intercation.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatMessageSearchService chatMessageSearchService;

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

    @PostMapping("/api/chat/search/{workspaceId}")
    @Operation(summary = "채팅내역 검색")
    public List<SearchResponse> searchChat(@PathVariable Long workspaceId, @RequestBody SearchRequest request) {

        List<ChatMessageDocument> result = chatMessageSearchService.searchByContent(request.getContent(), workspaceId);

        return result.stream()
                .map(SearchResponse::toResponse)
                .collect(Collectors.toList());
    }

}
