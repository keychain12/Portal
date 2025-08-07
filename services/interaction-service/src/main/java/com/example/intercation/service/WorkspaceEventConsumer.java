package com.example.intercation.service;

import com.example.intercation.dto.request.CreateChannelRequest;
import com.example.intercation.dto.request.InteractionChannelStatusUpdate;
import com.example.intercation.dto.response.WorkspaceCreateDto;
import com.example.intercation.entity.ChannelType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceEventConsumer { // 워크스페이스 생성시 기본채널 만들기
    private final ChannelService channelService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC_SUCCESS = "interaction.channel.creation.succeeded";
    private static final String TOPIC_FAILURE = "interaction.channel.creation.failed";

    @KafkaListener(topics = "workspace.created", groupId = "workspace-group")
    public void consumerWorkspaceEvent(WorkspaceCreateDto dto) { // kafka 메세지로 기본채널 만들기
        Long workspaceId = dto.getWorkspaceId();
        String workspaceName = dto.getWorkspaceName();
        Long creatorId = dto.getCreatorId();

        try {
            CreateChannelRequest request = new CreateChannelRequest();
            request.setChannelName(workspaceName);
            request.setChannelType(ChannelType.PUBLIC);
            //채널생성
            channelService.createChannel(workspaceId, request, creatorId);
            // 성공했을경우 메세지
            kafkaTemplate.send(TOPIC_SUCCESS, new InteractionChannelStatusUpdate(workspaceId));
        } catch (Exception e) {
            //실패 했을경우
            kafkaTemplate.send(TOPIC_FAILURE, new InteractionChannelStatusUpdate(workspaceId));
        }
    }
}
