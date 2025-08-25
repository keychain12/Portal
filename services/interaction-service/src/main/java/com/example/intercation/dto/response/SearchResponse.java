package com.example.intercation.dto.response;

import com.example.intercation.entity.ChatMessageDocument;
import lombok.Data;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SearchResponse {
    private String id;
    private String workspaceId;
    private String channelId;
    private String userId;
    private String senderNickname;
    private String content;
    private String timestamp;
    private String channelName;
    private String urlSlug;

    public static SearchResponse toResponse(ChatMessageDocument document) {
        SearchResponse response = new SearchResponse();
        response.setId(document.getId());
        response.setWorkspaceId(document.getWorkspaceId());
        response.setChannelId(document.getChannelId());
        response.setUserId(document.getUserId());
        response.setSenderNickname(document.getSenderNickname());
        response.setContent(document.getContent());
        response.setTimestamp(document.getTimestamp());
        response.setChannelName(document.getChannelName());
        response.setUrlSlug(document.getUrlSlug());
        return response;
    }
}