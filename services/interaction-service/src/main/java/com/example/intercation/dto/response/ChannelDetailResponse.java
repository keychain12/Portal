package com.example.intercation.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChannelDetailResponse {
    private String channelName;
    private String topic;
    private String description;
    private LocalDateTime createdAt;
    private List<MemberInfo> members;

    @Getter
    @Builder
    public static class MemberInfo {
        private Long userId;
        private String nickName;
        private String profileImgUrl;

    }

}
