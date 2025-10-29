package com.example.intercation.dto.request;


import com.example.intercation.entity.Channel;
import com.example.intercation.entity.MentionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class MentionNotificationRequest {  // 알림 dto

    @NotNull
    private Long workspaceId;

    @NotNull
    private Long recipientId; // 수신자 id
    private Long senderId; // 발신자 id

    @NotNull
    private Long channelId;

    @NotBlank
    @Size(max = 1000)
    private String message;

    //멘션된 사용자 ID 리스트
    private List<Long> mentionedUserIds = new ArrayList<>();


    // 옵션: 멘션 타입 (@user, @channel, @here)
    private MentionType mentionType = MentionType.USER;

}
