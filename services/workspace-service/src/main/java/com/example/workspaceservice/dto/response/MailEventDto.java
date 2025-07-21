package com.example.workspaceservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MailEventDto {
    private String toEmail;
    private String inviterNickname;
    private String workspaceName;
    private String inviteLink;
}