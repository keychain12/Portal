package com.example.workspaceservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkspaceInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @Column(nullable = false)
    private Long inviterId; // 초대 한 사람 id

    @Column(nullable = false)
    private String inviteeEmail; // 초대받는 사람 이메일

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InviteStatus inviteStatus; // 초대 상태

    @Column(nullable = false,updatable = false)
    private LocalDateTime createdAt;  // 초대 날짜

    private LocalDateTime respondedAt;   // 초대 응답 날짜

    //  정적 팩토리 메서드
    public static WorkspaceInvitation create(Workspace workspace, Long inviterId,String inviteeEmail) {
        return WorkspaceInvitation.builder()
                .workspace(workspace)
                .inviterId(inviterId)
                .inviteeEmail(inviteeEmail)
                .createdAt(LocalDateTime.now())
                .inviteStatus(InviteStatus.PENDING)
                .build();
    }

    // 초대받은후 초대상태, 초대 응답 날짜 업데이트
    public void updateStatus() {
        this.inviteStatus = InviteStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
    }


}
