package com.example.workspaceservice.util;

import com.example.workspaceservice.dto.event.InteractionChannelStatusUpdate;
import com.example.workspaceservice.entity.Workspace;
import com.example.workspaceservice.entity.WorkspaceStatus;
import com.example.workspaceservice.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Transactional
public class InteractionChannelEventConsumer { // 보상트랜잭션 채널 생성 결과 메시지 구독

    private final WorkspaceRepository workspaceRepository;
    private static final int MAX_RETRY_COUNT = 3;

    @KafkaListener(topics = "interaction.channel.creation.succeeded", groupId = "workspace-service-group")
    public void handleChannelCreationSuccess(InteractionChannelStatusUpdate message) { //성공했을ㄱ경우
        updateWorkspaceStatus(message.getWorkspaceId(), WorkspaceStatus.ACTIVE);
    }

    @KafkaListener(topics = "interaction.channel.creation.failed", groupId = "workspace-service-group")
    public void handleChannelCreationFailure(InteractionChannelStatusUpdate message) { //실패했을경우
        Workspace workspace = workspaceRepository.findById(message.getWorkspaceId())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않는 워크스페이스 입니다. : " + message.getWorkspaceId()));

        workspace.increaseRetryCount(); // 실패 횟수 증가

        if (workspace.getRetryCount() >= MAX_RETRY_COUNT) { // 재시도 최대 횟수 넘겼을경우
            workspace.changeStatus(WorkspaceStatus.PERMANENTLY_FAILED); // 아에실패
        } else {
            workspace.changeStatus(WorkspaceStatus.FAILED);
        }
    }

    private void updateWorkspaceStatus(Long workspaceId, WorkspaceStatus status) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않는 워크스페이ㅡ싱빈다 : " + workspaceId));
        workspace.changeStatus(status);
    }
}
