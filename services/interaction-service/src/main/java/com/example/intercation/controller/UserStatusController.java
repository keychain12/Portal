package com.example.intercation.controller;

import com.example.intercation.client.WorkspaceClient;
import com.example.intercation.dto.response.WorkspaceMemberResponse;
import com.example.intercation.dto.response.WorkspaceMemberWithStatusResponse;
import com.example.intercation.service.UserStatusService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workspaces")
public class UserStatusController { // 유저상태

    private final UserStatusService userStatusService;
    private final WorkspaceClient workspaceClient;

    @GetMapping("/{workspaceId}/members/status")
    @Operation(summary = "유저 실시간상태 조회")
    public List<WorkspaceMemberWithStatusResponse> getWorkspaceMembersWithStatus(@PathVariable Long workspaceId) {
        // 워크스페이스 멤버 정보 다가져오기
        List<WorkspaceMemberResponse> members = workspaceClient.getAllWorkspaceMembers(workspaceId);
            //상태 넣고 넘기기
        return members.stream()
                .map(member -> {
                    String status = userStatusService.getUserStatus(member.getUserId());
                    return WorkspaceMemberWithStatusResponse.from(member, status);
                })
                .collect(Collectors.toList());
    }

}
