package com.example.workspaceservice.util;

import com.example.workspaceservice.dto.response.MailEventDto;
import com.example.workspaceservice.dto.response.WorkspaceCreateDto;
import com.example.workspaceservice.dto.response.WorkspaceCreatedEvent;
import com.example.workspaceservice.entity.Workspace;
import com.example.workspaceservice.entity.WorkspaceInvitation;
import com.example.workspaceservice.entity.WorkspaceMember;
import com.example.workspaceservice.entity.WorkspaceRole;
import com.example.workspaceservice.repository.WorkspaceInvitationRepository;
import com.example.workspaceservice.repository.WorkspaceMemberRepository;
import com.example.workspaceservice.repository.WorkspaceRepository;
import com.example.workspaceservice.service.MailService;
import com.example.workspaceservice.service.WorkspaceEventProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Component
public class WorkspaceInvitationEventHandler {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceInvitationRepository invitationRepository;
    private final JwtUtil jwtUtil;
    private final WorkspaceEventProducer workspaceEventProducer; // 다른 서비스 알림용
    private final KafkaTemplate<String, Object> kafkaTemplate;    // 메일 발송 요청용

    // WorkspaceInvitationEventHandler.java 내부

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleInvitationEvent(WorkspaceCreatedEvent event) {
        Long workspaceId = event.getWorkspaceId();

        // 1. 후속 처리에 필요한 정보 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스가 존재하지 않습니다."));
        WorkspaceMember owner = workspaceMemberRepository.findByWorkspaceIdAndRole(workspaceId, WorkspaceRole.OWNER);
        List<WorkspaceInvitation> invitations = invitationRepository.findAllByWorkspaceId(workspaceId);

        // 2. 다른 서비스에 워크스페이스 생성을 알리는 Kafka 메시지 발행
        WorkspaceCreateDto createDto = WorkspaceCreateDto.from(workspace, owner.getUserId());
        workspaceEventProducer.sendWorkspaceCreatedEvent(createDto);

        // 3. 초대 메일 발송을 '요청'하는 Kafka 메시지 발행
        for (WorkspaceInvitation invitation : invitations) {
            String token = jwtUtil.createInvitationToken(workspace.getId(), invitation.getInviteeEmail());
            String inviteLink = "http://localhost:3000/accept?token=" + token;
            MailEventDto mailEvent = new MailEventDto(
                    invitation.getInviteeEmail(),
                    owner.getNickname(),
                    workspace.getName(),
                    inviteLink
            );
            kafkaTemplate.send("send-invitation-mail", mailEvent);
            log.info("Kafka 메시지 발행 (메일 발송 요청): {}", mailEvent.getToEmail());
        }
    }
}
