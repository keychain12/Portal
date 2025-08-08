package com.example.workspaceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.AbstractAggregateRoot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class Workspace extends AbstractAggregateRoot<Workspace> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; //워크스페이스 이름

    private String description; // 워크스페이스 설명

    @Column(nullable = false)
    private Long ownerId; // 방장

    @Column(nullable = false, unique = true, length = 100)
    private String urlSlug; // 슬러그url

    @Enumerated(EnumType.STRING)
    private WorkspaceStatus status; // 워크스페이스 상태

    private int retryCount; // 재시도 횟수

    private LocalDateTime createdAt; // 생성날짜

    @Builder.Default
    @OneToMany(mappedBy = "workspace",cascade = CascadeType.ALL , orphanRemoval = true)
    private List<WorkspaceMember> members = new ArrayList<>(); // 맴버

    @Builder.Default
    @OneToMany(mappedBy = "workspace", cascade = CascadeType.PERSIST)
    private List<WorkspaceInvitation> invitations = new ArrayList<>(); // 초대한 사람들

    //초대 편의메서드
    public void addInvitation(Long userId, List<String> inviteeEmail) {

        if (inviteeEmail == null && inviteeEmail.isEmpty()) return;

        List<WorkspaceInvitation> collect = inviteeEmail
                .stream()
                .map(email -> WorkspaceInvitation.create(this, userId, email))
                .toList();
        this.invitations.addAll(collect);
    }

    // 정적 팩토리 메서드
    public static Workspace create(String name, String description, Long ownerId, String urlSlug) {

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("워크스페이스 이름은 필수입니다.");
        }
        if (ownerId == null) {
            throw new IllegalArgumentException("소유자 ID는 필수입니다.");
        }

        return Workspace.builder()
                .name(name)
                .description(description)
                .ownerId(ownerId)
                .urlSlug(urlSlug)
                .status(WorkspaceStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }
    // 맴버 연관관계
    public void addOwnerMember(Long userId, String nickname, String profileImgUrl) {

        if (nickname == null || nickname.length() > 10) {
            throw new IllegalArgumentException("닉네임은 10자 이하로 입력해주세요.");
        }

        WorkspaceMember member = WorkspaceMember.createOwner(userId, this, nickname, profileImgUrl);
        this.members.add(member);
    }

    public void changeStatus(WorkspaceStatus status) { // 상태 변경
        this.status = status;
    }

    public void activate() {
        if (this.status != WorkspaceStatus.PENDING) {
            throw new IllegalArgumentException("PENDING 상태 에서만 활성가능");
        }
        if (this.members.isEmpty()) {
            throw new IllegalArgumentException("최소 맴버 1명 필요 ");
        }
        this.status = WorkspaceStatus.ACTIVE;
    }

    public void increaseRetryCount() { // 재시도 횟수 ++
        this.retryCount++;
    }



}
