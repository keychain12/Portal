package com.example.workspaceservice.dto.response;


import com.example.workspaceservice.entity.WorkspaceInvitation;

public record InvitationDetailsResponse(String workspaceName, String inviteeEmail) {

    public InvitationDetailsResponse(WorkspaceInvitation workspaceInvitation) {
        this(workspaceInvitation.getWorkspace().getName(), workspaceInvitation.getInviteeEmail());
    }
}
