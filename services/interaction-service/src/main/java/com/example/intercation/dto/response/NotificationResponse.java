package com.example.intercation.dto.response;


import com.example.intercation.entity.Notification;
import com.example.intercation.entity.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private final Long id;
    private final Long channelId;
    private final String message;
    private final LocalDateTime cratedAt;
    private final NotificationType type;
    private final Boolean isRead;
    private final Long senderId;
    private final String senderName;
    private final String channelName;

    public static NotificationResponse toResponse(Notification notification,String senderName,String channelName) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .channelId(notification.getChannel().getId())
                .message(notification.getMessage())
                .cratedAt(notification.getCreateAt())
                .type(notification.getType())
                .isRead(notification.isRead())
                .senderId(notification.getSenderId())
                .senderName(senderName)
                .channelName(channelName)
                .build();
    }
}
