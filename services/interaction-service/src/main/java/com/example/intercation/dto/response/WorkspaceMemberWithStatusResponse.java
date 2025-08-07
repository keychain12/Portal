package com.example.intercation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMemberWithStatusResponse {
    private Long userId;
    private String nickname;
    private String profileImageUrl;
    private String role;
    private String status; // 온라인 / 오프라인

    public static WorkspaceMemberWithStatusResponse from(WorkspaceMemberResponse member, String status) {
        return WorkspaceMemberWithStatusResponse.builder()
                .userId(member.getUserId())
                .nickname(member.getNickname())
                .profileImageUrl(member.getProfileImgUrl())
                .role(member.getRole())
                .status(status)
                .build();
    }
}
