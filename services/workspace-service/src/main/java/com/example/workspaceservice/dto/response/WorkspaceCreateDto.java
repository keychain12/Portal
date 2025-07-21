package com.example.workspaceservice.dto.response;


import com.example.workspaceservice.entity.Workspace;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class WorkspaceCreateDto { // 카프카 dto
    private Long workspaceId;
    private Long creatorId;
    private String workspaceName;

    public static WorkspaceCreateDto from(Workspace workspace,Long creatorId) {
        return WorkspaceCreateDto.builder()
                .workspaceId(workspace.getId())
                .creatorId(creatorId)
                .workspaceName(workspace.getName())
                .build();
    }

}
