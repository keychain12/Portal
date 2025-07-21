package com.example.workspaceservice.service;

import com.example.workspaceservice.dto.response.WorkspaceCreateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WorkspaceEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate; // value값 Object로 해주기 그리고 야물파읾만 value값에 JSON 어쩌구넣으면끝

    @Value("${kafka.topic.workspace}")
    private String topic;

        public void sendWorkspaceCreatedEvent(WorkspaceCreateDto dto) {
        kafkaTemplate.send(topic, dto);
    }

}
