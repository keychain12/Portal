package com.example.intercation.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
public class AskRequest {
    private String question; //질문
    private String workspaceId;
    private String channelId;
}
