package com.example.workspaceservice.service;

import com.example.workspaceservice.client.AuthClient;
import com.example.workspaceservice.dto.response.UserProfileResponse;
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
import java.rmi.AlreadyBoundException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class InvitationService {

    private final JwtUtil jwtUtil;
    private final AuthClient authClient;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceInvitationRepository invitationRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final S3Service s3Service;

    @Value("${spring.app.base-url}")
    private String appBaseUrl; // 프론트엔드 URL

    public String processInvitation(String invitationToken) {
        // 1. 토큰 파싱
        JwtUtil.InvitationPayload payload = jwtUtil.parseInvitationToken(invitationToken);
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

        try {
            //Feign 으로 유저가있는지 조회
            UserProfileResponse userProfileResponse = authClient.getUserProfileByEmail(email);
            // 회원일때
            // 해당유저가 이미 워크스페이스에 들어있는지 확인..
            boolean alreadyJoined = memberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), userProfileResponse.getId());
            // 이미 참여중인지 확
            if (alreadyJoined) {
                return String.format("%s/workspace/%s", appBaseUrl, workspace.getUrlSlug());
            } else {

            // 참여전 일시 프로필 설정 페이지로 이동
            return appBaseUrl + "/accept-profile?token=" + invitationToken;
            }

        } catch (FeignException e) {// 회원가입이 안된 유저일시

            return appBaseUrl + "/signup";

        }
    }

    public String acceptProfile(String token, String nickname, MultipartFile profileImage,Long userId) throws IOException {

        // 이미지 확인
        String profileUrl = null;
        if (profileImage != null && !profileImage.isEmpty()) {
            profileUrl = s3Service.upload(profileImage);
        }
        // 토큰 파싱
        JwtUtil.InvitationPayload payload = jwtUtil.parseInvitationToken(token);
        Long workspaceId = payload.getWorkspaceId();
        String email = payload.getEmail();
        // 워크스페이스 꺼내오기
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 워크스페이스 입니다."));
        // 정적팩토리메서드
        WorkspaceMember member = WorkspaceMember.createMember(userId, workspace, nickname, profileUrl);
        // 초대 확인
        WorkspaceInvitation invitation = invitationRepository.findByWorkspaceIdAndInviteeEmail(workspaceId, email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대 입니다."));
        // 워크스페이스멤버 저장
        memberRepository.save(member);

        // 초대상태, 초대응답시간 변경
        invitation.updateStatus();

        return workspace.getUrlSlug();

    }
}
