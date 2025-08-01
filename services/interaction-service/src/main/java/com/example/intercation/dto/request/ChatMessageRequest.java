package com.example.intercation.dto.request;

import com.example.intercation.entity.MessageType;
import lombok.Getter;
import lombok.Setter;

public record ChatMessageRequest( // 채팅 리퀘스트 DTO
        String content, // 보낸 내용
        MessageType messageType) {}
