package com.example.workspaceservice.controller;

import com.example.workspaceservice.service.InvitationService;
import com.example.workspaceservice.service.WorkspaceMemberService;
import com.example.workspaceservice.util.LoginUserId;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workspaces/{slug}/members")
public class WorkspaceMemberController {

    private final WorkspaceMemberService workspaceMemberService;

    @PatchMapping("/me")
    @Operation(summary = "워크스페이스내에 내 닉네임,프로필 수정")
    public ResponseEntity<Void> acceptProfile(@PathVariable String slug,
                                              @RequestParam String nickname,
                                              @RequestPart(value = "profileImage", required = false) MultipartFile multipartFile,
                                              @LoginUserId Long userId) throws IOException {

       workspaceMemberService.updateMyProfileInWorkspace(userId, slug, nickname, multipartFile);

        return ResponseEntity.ok().build();

    }

}
