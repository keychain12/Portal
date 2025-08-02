package com.example.intercation.dto.response;

import com.example.intercation.entity.Channel;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChannelDetailResponse {
    private Long id;
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

        public static MemberInfo from(WorkspaceMemberResponse member) {
            return MemberInfo.builder()
                    .userId(member.getUserId())
                    .nickName(member.getNickname())
                    .profileImgUrl(member.getProfileImgUrl())
                    .build();
        }

    }

    public static ChannelDetailResponse from(Channel channel, List<WorkspaceMemberResponse> workspaceMembers) {
        List<MemberInfo> memberInfoList = workspaceMembers.stream()
                .map(MemberInfo::from)
                .collect(Collectors.toList());

        return ChannelDetailResponse.builder()
                .id(channel.getId())
                .channelName(channel.getChannelName())
                .topic(channel.getTopic())
                .description(channel.getDescription())
                .createdAt(channel.getCreatedAt())
                .members(memberInfoList)
                .build();
    }
}
