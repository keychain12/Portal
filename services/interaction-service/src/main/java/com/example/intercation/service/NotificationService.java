package com.example.intercation.service;

import com.example.intercation.client.AuthClient;
import com.example.intercation.dto.request.MentionNotificationRequest;
import com.example.intercation.dto.response.NotificationResponse;
import com.example.intercation.dto.response.UserProfileResponse;
import com.example.intercation.entity.Channel;
import com.example.intercation.entity.ChannelMember;
import com.example.intercation.entity.Notification;
import com.example.intercation.repository.ChannelMemberRepository;
import com.example.intercation.repository.ChannelRepository;
import com.example.intercation.repository.NotificationRepository;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final ChannelRepository channelRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuthClient authClient;
    private final ChannelMemberRepository channelMemberRepository;
    private final UserStatusService userStatusService;

    @Transactional
    public void createMentionNotification(MentionNotificationRequest request) {
       //채널 확인
        Channel channel = channelRepository.findById(request.getChannelId())
                .orElseThrow(() -> new NotFoundException("채널없음"));

        //멘션 타입에 따라 처리
        List<Long> targetUserIds = switch (request.getMentionType()) {
            case USER -> request.getMentionedUserIds();
            case CHANNEL -> channel.getMemberList().stream().map(ChannelMember::getUserId).collect(Collectors.toList());
            case HERE -> getActiveChannelMember(request.getChannelId(), request.getWorkspaceId());
        };
        // 중복제거 및 발신자 제외
        targetUserIds = targetUserIds.stream()
                .distinct()
                .filter(id -> !id.equals(request.getSenderId()))
                .collect(Collectors.toList());

        List<Notification> notifications = new ArrayList<>();

        for (Long userId : targetUserIds) {
            Notification notification = Notification.createChannelMention(
                    request.getWorkspaceId(),
                    userId,
                    request.getSenderId(),
                    channel,
                    request.getMessage()
            );
            notifications.add(notification); //연관관계 설정
        }
        // 저장
        notificationRepository.saveAll(notifications);


        //알림 전송
        UserProfileResponse sender = authClient.getUserProfileById(request.getSenderId()); // 보낸사람 닉네임
        sendRealTimeNotifications(notifications,sender.getUsername(), channel.getChannelName());

    }

    // 채널의 모든 멤버id값 조회
    public List<Long> getChannelMembers(Long channelId) {
        return channelMemberRepository.findByChannelId(channelId)
                .stream()
                .map(ChannelMember::getUserId)
                .toList();
    }

    // @here - 채널의 온라인 멤버만 조회
    public List<Long> getActiveChannelMember(Long channelId, Long workspaceId) {
        List<Long> channelMembers = getChannelMembers(channelId);
        return userStatusService.getOlineUsersInWorkspace(workspaceId, channelMembers);
    }

    @Async // 비동기처리 / 배운거  "/queue/notifications" << 이거일단 웹소켓config 에서 경로 추가해줘야하고...,convertAndSendToUser << 이거 첫번쨰 인자가 내가설정한게 이메일이라 이메일 넘겨줘야함 id값 말고 .. 몰랐네이걸
    protected void sendRealTimeNotifications(List<Notification> notifications,String senderName, String channelName) { //알림 전송
        for (Notification notification : notifications) {
            UserProfileResponse userProfileById = authClient.getUserProfileById(notification.getRecipientId());
            messagingTemplate.convertAndSendToUser(
                    userProfileById.getEmail(),
                    "/queue/notifications",
                    NotificationResponse.toResponse(notification, senderName, channelName)
            );
        }

    }

}
