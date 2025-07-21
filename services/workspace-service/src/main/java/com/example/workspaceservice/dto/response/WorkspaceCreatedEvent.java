package com.example.workspaceservice.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WorkspaceCreatedEvent {
    private final Long workspaceId;
}
