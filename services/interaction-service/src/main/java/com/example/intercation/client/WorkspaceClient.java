package com.example.intercation.client;

import com.example.intercation.dto.response.WorkspaceMemberResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "workspace-service",url = "http://localhost:8082")
public interface WorkspaceClient {


    @GetMapping("/api/workspace/{workspaceId}/members")
    List<WorkspaceMemberResponse> getWorkspaceMembers(@PathVariable Long workspaceId,
                                                    @RequestParam List<Long> userId);

    @GetMapping("/api/workspaces/{workspaceId}/members")
    List<WorkspaceMemberResponse> getAllWorkspaceMembers(@PathVariable Long workspaceId);

    @GetMapping("/api/workspace/{workspaceId}/user/{userId}")
    WorkspaceMemberResponse findByWorkspaceIdAndUserId(@PathVariable Long workspaceId,
                                                                @PathVariable Long userId);

}
