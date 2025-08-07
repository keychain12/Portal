package com.example.workspaceservice.util;

import com.example.workspaceservice.dto.response.WorkspaceCreateDto;
import com.example.workspaceservice.entity.Workspace;
import com.example.workspaceservice.entity.WorkspaceStatus;
import com.example.workspaceservice.repository.WorkspaceRepository;
import com.example.workspaceservice.service.WorkspaceEventProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WorkspaceRetryScheduler { //채널 재시도를 위한 스케쥴러

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceEventProducer workspaceEventProducer;
    private static final int MAX_RETRY_COUNT = 3; // 재시도 횟수 3회

    @Scheduled(fixedRate = 60000) // 1분마다 실행
    @Transactional
    public void retryFailedWorkspaces() {                   //LessThan 은 재시도 횟수가 3회보다 < 적을경우
        List<Workspace> failedWorkspaces = workspaceRepository.findByStatusAndRetryCountLessThan(WorkspaceStatus.FAILED, MAX_RETRY_COUNT);

        for (Workspace workspace : failedWorkspaces) {
            workspace.changeStatus(WorkspaceStatus.PENDING);
            // 카프카 재시도 보내기
            workspaceEventProducer.sendWorkspaceCreatedEvent(WorkspaceCreateDto.from(workspace, workspace.getOwnerId()));
        }
    }
}
