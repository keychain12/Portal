package com.example.workspaceservice.controller;

import com.example.workspaceservice.dto.response.WorkspaceMemberResponse;
import com.example.workspaceservice.service.InvitationService;
import com.example.workspaceservice.service.WorkspaceMemberService;
import com.example.workspaceservice.util.LoginUserId;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class WorkspaceMemberController {

    private final WorkspaceMemberService workspaceMemberService;


    @PatchMapping("/workspace/{slug}/members/me")
    @Operation(summary = "워크스페이스내에 내 닉네임,프로필 수정")
    public ResponseEntity<Void> acceptProfile(@PathVariable String slug,
                                              @RequestParam String nickname,
                                              @RequestPart(value = "profileImage", required = false) MultipartFile multipartFile,
                                              @LoginUserId Long userId) throws IOException {

       workspaceMemberService.updateMyProfileInWorkspace(userId, slug, nickname, multipartFile);

        return ResponseEntity.ok().build();

    }

    @GetMapping("/workspace/{workspaceId}/user/{userId}")
    @Operation(summary = "페인으로가져올 워크스페이스맴버정보")
    public ResponseEntity<WorkspaceMemberResponse> findByWorkspaceIdAndUserId(@PathVariable Long workspaceId,
                                                                    @PathVariable Long userId) {
        WorkspaceMemberResponse workspaceMember = workspaceMemberService.findByWorkspaceIdAndUserId(workspaceId, userId);

        return ResponseEntity.ok(workspaceMember);
    }

    @GetMapping("/workspace/{workspaceId}/members")
    @Operation(summary = "workspaceMember 조회" , description = "Role,NickName,프로필url 리턴")
    public ResponseEntity<?> getWorkspaceMembers(@PathVariable Long workspaceId,
                                                 @RequestParam List<Long> userId) {

        List<WorkspaceMemberResponse> membersInWorkspace = workspaceMemberService.findMembersInWorkspace(workspaceId, userId);

        return ResponseEntity.ok(membersInWorkspace);
    }

    @GetMapping("/workspaces/{workspaceId}/members")
    public ResponseEntity<?> getAllWorkspaceMembers(@PathVariable Long workspaceId) {
        List<WorkspaceMemberResponse> membersInWorkspace = workspaceMemberService.findAllByWorkspaceId(workspaceId);

        return ResponseEntity.ok(membersInWorkspace);
    }


}
