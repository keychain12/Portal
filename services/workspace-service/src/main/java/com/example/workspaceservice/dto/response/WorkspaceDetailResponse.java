package com.example.workspaceservice.dto.response;

import com.example.workspaceservice.entity.Workspace;
import lombok.*;
import org.springframework.cache.annotation.CacheEvict;

import java.io.Serializable;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class WorkspaceDetailResponse implements Serializable {
    private final Long id;
    private final String name;
    private final String description;
    private final String urlSlug;
    private final List<MemberSummery> members;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class MemberSummery implements Serializable {
        private Long userId;
        private String nickname;
        private String profileUrl;
    }

    public  static WorkspaceDetailResponse from(Workspace workspace) {
        List<MemberSummery> memberSummeryList = workspace.getMembers().stream()
                .map(member -> MemberSummery.builder()
                        .userId(member.getUserId())
                        .nickname(member.getNickname())
                        .profileUrl(member.getProfileImgUrl())
                        .build())
                        .collect(Collectors.toList());

        return WorkspaceDetailResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .urlSlug(workspace.getUrlSlug())
                .members(memberSummeryList)
                .build();
    }
}



