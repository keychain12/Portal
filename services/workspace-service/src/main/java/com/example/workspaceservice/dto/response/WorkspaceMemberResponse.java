package com.example.workspaceservice.dto.response;

import com.example.workspaceservice.entity.WorkspaceMember;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class WorkspaceMemberResponse {
    private String role;
    private String nickname;
    private String profileImgUrl;

    public static WorkspaceMemberResponse toResponse(WorkspaceMember workspaceMember) {
        return WorkspaceMemberResponse.builder()
                .role(workspaceMember.getRole().name())
                .nickname(workspaceMember.getNickname())
                .profileImgUrl(workspaceMember.getProfileImgUrl())
                .build();
    }
}
