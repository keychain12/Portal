package com.example.workspaceservice.dto.response;

import com.example.workspaceservice.entity.Workspace;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class WorkspaceResponse {
    private Long id;
    private String name;
    private String description;
    private String urlSlug;

    public static WorkspaceResponse toResponse(Workspace entity) {
        return WorkspaceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .urlSlug(entity.getUrlSlug())
                .build();
    }
}
