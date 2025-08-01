package com.example.intercation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Builder
@AllArgsConstructor
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workspaceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel; // 채널

    @Column(nullable = false)
    private Long senderId; // 채팅보낸사람 Id

    // 원래 senderId로 페인클라이언트를 사용해 user 정보를 가져올랬지만 너무많은 api를 호출해야해서 비정규화처리...
    @Column(nullable = false)
    private String senderNickname;  // 보낸사람 닉네임

    @Column(nullable = false)
    private String senderProfileImgUrl; // 보낸사람 프로필사진

    @Column(nullable = false, length = 1000)
    private String content;  // 메세지내용

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType messageType; // 메세지타입 Text,Img, File,System

    @CreatedDate
    private LocalDateTime createdAt; // 메세지보낸날짜

    //정적 팩토리 메서드
    public static ChatMessage create(Long workspaceId, Channel channel, Long senderId, String senderNickname, String senderProfileImgUrl, String content, MessageType messageType) {
        return ChatMessage.builder()
                .workspaceId(workspaceId)
                .channel(channel)
                .senderId(senderId)
                .senderNickname(senderNickname)
                .senderProfileImgUrl(senderProfileImgUrl)
                .content(content)
                .messageType(messageType)
                .build();
    }
}
