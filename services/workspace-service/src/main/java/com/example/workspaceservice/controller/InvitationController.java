package com.example.workspaceservice.controller;

import com.example.workspaceservice.client.AuthClient;
import com.example.workspaceservice.dto.response.InvitationDetailsResponse;
import com.example.workspaceservice.dto.response.UserProfileResponse;
import com.example.workspaceservice.dto.response.WorkspaceJoinResponse;
import com.example.workspaceservice.entity.Workspace;
import com.example.workspaceservice.entity.WorkspaceMember;
import com.example.workspaceservice.repository.WorkspaceMemberRepository;
import com.example.workspaceservice.repository.WorkspaceRepository;
import com.example.workspaceservice.service.InvitationService;
import com.example.workspaceservice.util.JwtUtil;
import com.example.workspaceservice.util.LoginUserId;
import feign.FeignException;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;


    @GetMapping("/{token}")
    @Operation(summary = "초대 정보 조회", description = "토큰으로 초대 정보를 조회합니다.")
    public ResponseEntity<InvitationDetailsResponse> getInvitationDetails(@PathVariable String token) {
        InvitationDetailsResponse details = invitationService.getInvitationDetails(token);
        return ResponseEntity.ok(details);
    }


    @PostMapping("/accept")
    @Operation(summary = "사용자 워크스페이스 초대", description = "토큰정보 워크스페이스id,초대받은사람email")
    public ResponseEntity<?> acceptInvitation(@RequestParam String token,@LoginUserId Long userId)  {
        // 유저 존재 여부에따라 회원가입페이지 or 워크스페이스 프로필 설정페이지 리다이렉트
        WorkspaceJoinResponse redirectUrl = invitationService.acceptInvitation(token,userId);

        return ResponseEntity.ok(Map.of("redirectUrl", redirectUrl));
    }


}
