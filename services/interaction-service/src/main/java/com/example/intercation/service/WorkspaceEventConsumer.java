package com.example.intercation.service;

import com.example.intercation.dto.request.CreateChannelRequest;
import com.example.intercation.dto.response.WorkspaceCreateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WorkspaceEventConsumer {
    private final ChannelService channelService;

    @KafkaListener(topics = "workspace.created", groupId = "workspace-group")
    public void consumerWorkspaceEvent(WorkspaceCreateDto dto) {
        Long workspaceId = dto.getWorkspaceId();
        String workspaceName = dto.getWorkspaceName();
        Long creatorId = dto.getCreatorId();

        CreateChannelRequest request = new CreateChannelRequest();
        request.setChannelName(workspaceName);

        channelService.createChannel(workspaceId, request, creatorId);
    }
}
