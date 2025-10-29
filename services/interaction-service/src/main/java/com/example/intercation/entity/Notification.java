package com.example.intercation.entity;

import io.netty.channel.pool.ChannelHealthChecker;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access =AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class) // 추가
public class Notification { // 알람
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workspaceId; //workspaceId

    @Column(nullable = false)
    private Long recipientId; // 수신자 id

    private Long senderId; // 발신자 id  / 시스템이 보낼수있으니 null 허용

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id")
    private Channel channel; //채널

    @Column(length = 200)
    private String messagePreview; //메시지 미리보기

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type; // 알람 타입

    @Column(nullable = false,length = 1000)
    private String message; //메세지

    @Column(nullable = false)
    private boolean isRead = false; // 읽음 여부

    @Column(nullable = false,updatable = false)
    @CreationTimestamp
    private LocalDateTime createAt; //알람 보낸시간

    private LocalDateTime readAt; //읽은 시간

    //알림 그룹
    @Column(name = "notification_group")
    private String notificationsGroup;

    //정적 팩토리 메서드
    //DM
    public static Notification createDirectMessage(Long workspaceId, Long recipientId, Long senderId, Channel channel, String message) {


        validateCommonFields(workspaceId, recipientId, message);

        return Notification.builder()
                .workspaceId(workspaceId)
                .recipientId(recipientId)
                .senderId(senderId)
                .channel(channel)
                .messagePreview(truncateMessage(message))
                .type(NotificationType.DIRECT_MESSAGE)
                .message(message)
                .notificationsGroup("dm" + senderId)
                .build();
    }


    //채널 멘션 알림
    public static Notification createChannelMention(Long workspaceId, Long recipientId, Long senderId, Channel channel, String message) {
        //검증
        validateChannelNotification(workspaceId, recipientId, channel, message);

        return Notification.builder()
                .workspaceId(workspaceId)
                .recipientId(recipientId)
                .senderId(senderId)
                .channel(channel)
                .messagePreview(truncateMessage(message))
                .type(NotificationType.CHANNEL_MENTION)
                .message(message)
                .notificationsGroup("channel_" + channel.getId())
                .build();
    }
    // 채널 알림 전용 검증
    private static void validateChannelNotification(
            Long workspaceId, Long recipientId, Channel channel, String message) {

        validateCommonFields(workspaceId, recipientId, message);

        if (channel == null) {
            throw new IllegalArgumentException("채널 정보가 필요합니다");
        }
    }

    private static void validateCommonFields(Long workspaceId, Long recipientId, String message) { // 공통 검증
        if (workspaceId == null || workspaceId <= 0) {
            throw new IllegalArgumentException("워크스페이스id가 없음..");
        }
        if (recipientId == null || recipientId <= 0) {
            throw new IllegalArgumentException("받는사람 id 없음.");
        }
        if (message == null || message.isEmpty()) {
            throw new IllegalArgumentException("메세지 없음.");
        }
    }
    // 읽음 처리 메서드
    public void markAsRead() {
        if (!this.isRead) {
            this.isRead = true;
            this.readAt = LocalDateTime.now(); //읽은시간 처리
        }
    }

    // DM 알림인지 확인
    public boolean isDirectMessage() {
      return  this.type == NotificationType.DIRECT_MESSAGE;
    }

    // 채널 관련 알림인지 확인
    public boolean isChannelRelate() {
        return this.channel != null;
    }

    // 메세지 짜르기 (미리보기용)
    private static String truncateMessage(String message) {
        if (message == null) return "";
        return message.length() > 197 ?
                message.substring(0, 197) + "..." : message;
    }

}
