package com.example.workspaceservice.dto.response;

import com.example.workspaceservice.entity.Workspace;
import com.querydsl.core.annotations.QueryProjection;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
public class WorkspaceResponse {
    private Long id;
    private String name;
    private String description;
    private String urlSlug;
    private Long memberCount;

    @QueryProjection
    @Builder
    public WorkspaceResponse(Long id, String name, String description, String urlSlug, Long memberCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.urlSlug = urlSlug;
        this.memberCount = memberCount;
    }

    public static WorkspaceResponse toResponse(Workspace entity) {
        return WorkspaceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .urlSlug(entity.getUrlSlug())
                .build();
    }
}
