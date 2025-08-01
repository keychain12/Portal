package com.example.intercation.dto.response;

import com.example.intercation.entity.ChatMessage;
import com.example.intercation.entity.MessageType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {
    private Long messageId;
    private Long channelId;
    private Long senderId;
    private String senderNickname;
    private String senderProfileImgUrl;
    private String content;
    private MessageType messageType;
    private LocalDateTime createdAt;

    public static ChatMessageResponse toResponse(ChatMessage entity) {
        return ChatMessageResponse.builder()
                .messageId(entity.getId())
                .channelId(entity.getChannel().getId())
                .senderId(entity.getSenderId())
                .senderNickname(entity.getSenderNickname())
                .senderProfileImgUrl(entity.getSenderProfileImgUrl())
                .content(entity.getContent())
                .messageType(entity.getMessageType())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}