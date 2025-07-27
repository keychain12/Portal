package com.example.workspaceservice.service;

import com.example.workspaceservice.client.AuthClient;
import com.example.workspaceservice.common.SlugGenerator;
import com.example.workspaceservice.dto.response.InvitationDetailsResponse;
import com.example.workspaceservice.dto.response.UserProfileResponse;
import com.example.workspaceservice.dto.response.WorkspaceJoinResponse;
import com.example.workspaceservice.entity.InviteStatus;
import com.example.workspaceservice.entity.Workspace;
import com.example.workspaceservice.entity.WorkspaceInvitation;
import com.example.workspaceservice.entity.WorkspaceMember;
import com.example.workspaceservice.repository.WorkspaceInvitationRepository;
import com.example.workspaceservice.repository.WorkspaceMemberRepository;
import com.example.workspaceservice.repository.WorkspaceRepository;
import com.example.workspaceservice.util.JwtUtil;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.rmi.AlreadyBoundException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final JwtUtil jwtUtil;
    private final AuthClient authClient;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceInvitationRepository invitationRepository;
    private final WorkspaceMemberRepository memberRepository;

    @Value("${spring.app.base-url}")
    private String appBaseUrl; // 프론트엔드 URL

    @Value("${spring.app.default-profile-image-url}")
    private String defaultProfileImageUrl;

    public InvitationDetailsResponse getInvitationDetails(String token) {
        // 1. 토큰 파싱
        JwtUtil.InvitationPayload payload = jwtUtil.parseInvitationToken(token);
        Long workspaceId = payload.getWorkspaceId();
        String email = payload.getEmail();

        // 2.초대 정보 조회
        WorkspaceInvitation invitation = invitationRepository.findByWorkspaceIdAndInviteeEmail(workspaceId, email)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않거나 만료된 초대입니다."));
        // 이미 처리된 경우 확인
        if (invitation.getInviteStatus() != InviteStatus.PENDING) {
            throw new IllegalArgumentException("이미 처리된 초대입니다.");
        }

        // 3. 워크스페이스 정보 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("초대 대상 워크스페이스가 존재하지 않거나 삭제되었습니다."));


        return new InvitationDetailsResponse(workspace.getName(), email);
    }
    @Transactional
    public WorkspaceJoinResponse acceptInvitation(String invitationToken, Long userId) {
        // 1. 토큰 파싱
        JwtUtil.InvitationPayload payload = jwtUtil.parseInvitationToken(invitationToken);
        Long workspaceId = payload.getWorkspaceId();
        String email = payload.getEmail();

        //유저정보 가져오기
        UserProfileResponse user = authClient.getUserProfileById(userId);
        // 로그인한 유저가 초대받은 사람이 맞는지 확인
        if (!user.getEmail().equals(email)) {
            throw new IllegalArgumentException("초대받은 사용자만 수락할 수 있습니다.");
        }

        // 2.초대 정보 조회
        WorkspaceInvitation invitation = invitationRepository.findByWorkspaceIdAndInviteeEmail(workspaceId, email)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않거나 만료된 초대입니다."));

        // 이미 처리된 경우 확인
        if (invitation.getInviteStatus() != InviteStatus.PENDING) {
            throw new IllegalArgumentException("이미 처리된 초대입니다.");
        }

        // 3. 워크스페이스 정보 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("워크스페이스를 찾을수 없습니다."));

        // 이미 워크스페이스 멤버인 경우...
        if (memberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), userId)) {
            return new WorkspaceJoinResponse(workspace.getUrlSlug(), "이미 참여중인 워크스페이스입니다.");
        }
        // 워크스페이스멤버 정적팩토리메서드
        WorkspaceMember newMember = WorkspaceMember.createMember(userId, workspace, user.getUsername(), defaultProfileImageUrl);
            //저장
        memberRepository.save(newMember);
        // 초대 상태 변경
        invitation.accept();

        return new WorkspaceJoinResponse(workspace.getUrlSlug(), "워크스페이스 참여가 완료되었습니다.");
    }




}
