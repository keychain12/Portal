package com.example.workspaceservice.dto.response;

import com.example.workspaceservice.entity.WorkspaceMember;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class WorkspaceMemberResponse { //페인클라이언트로 내보낼 dto
    private Long userId;
    private String role;
    private String nickname;
    private String profileImgUrl;

    public static WorkspaceMemberResponse toResponse(WorkspaceMember workspaceMember) {
        return WorkspaceMemberResponse.builder()
                .userId(workspaceMember.getUserId())
                .role(workspaceMember.getRole().name())
                .nickname(workspaceMember.getNickname())
                .profileImgUrl(workspaceMember.getProfileImgUrl())
                .build();
    }
}
