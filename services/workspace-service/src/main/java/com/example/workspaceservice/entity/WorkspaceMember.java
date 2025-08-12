package com.example.workspaceservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;   // 유저 id

    @Enumerated(EnumType.STRING)
    private WorkspaceRole role; // 역할 / 오너 ,맴버, 게스트

    @Column(nullable = false)
    private String nickname;  // 유저닉네임

    @Column(length = 1024)
    private String profileImgUrl; // 유저 프로필사진 s3 url

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    // 정적 팩토리 메서드 워크스페이스 주인용
    public static WorkspaceMember createOwner(Long userId, Workspace workspace,String nickname,String profileImgUrl) {
       return WorkspaceMember.builder()
                .userId(userId)
                .workspace(workspace)
                .role(WorkspaceRole.OWNER)
                .nickname(nickname)
                .profileImgUrl(profileImgUrl)
                .build();
    }
    // 정적 팩토리 메서드 워크스페이스 멤버용
    public static WorkspaceMember createMember(Long userId, Workspace workspace, String nickname, String profileImgUrl) {
        return WorkspaceMember.builder()
                .userId(userId)
                .workspace(workspace)
                .role(WorkspaceRole.MEMBER)
                .nickname(nickname)
                .profileImgUrl(profileImgUrl)
                .build();
    }

    public void updateProfile(String nickname, String profileImgUrl) {
        WorkspaceMember.builder()
                .nickname(nickname)
                .profileImgUrl(profileImgUrl)
                .build();
    }

}
