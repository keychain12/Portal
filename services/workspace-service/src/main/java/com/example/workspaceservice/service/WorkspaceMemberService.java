package com.example.workspaceservice.service;

import com.example.workspaceservice.dto.response.WorkspaceMemberResponse;
import com.example.workspaceservice.entity.Workspace;
import com.example.workspaceservice.entity.WorkspaceMember;
import com.example.workspaceservice.repository.WorkspaceMemberRepository;
import com.example.workspaceservice.repository.WorkspaceRepository;
import com.example.workspaceservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceMemberService {


    private final S3Service s3Service;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;

    public void updateMyProfileInWorkspace(Long userId, String workspaceSlug, String newNickname, MultipartFile newProfileImage) throws IOException {
        // 1. slug로 워크스페이스 조회
        Workspace workspace = workspaceRepository.findByUrlSlug(workspaceSlug)
                .orElseThrow(() -> new ResourceNotFoundException("워크스페이스를 찾을 수 없습니다."));

        // 2. userId와 workspaceId로 정확한 멤버 정보를 조회
        WorkspaceMember member = memberRepository.findByWorkspaceIdAndUserId(workspace.getId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("멤버 정보를 찾을 수 없습니다."));

        // 3. S3에 새 이미지 업로드
        String newProfileUrl = s3Service.upload(newProfileImage);

        // 4. 멤버 정보 업데이트 Dirty Checking 활용
        member.updateProfile(newNickname, newProfileUrl);
    }

    public WorkspaceMemberResponse findByWorkspaceIdAndUserId(Long workspaceId, Long userId) {
        WorkspaceMember workspaceMember = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 워크스페이스 멤버가 존재하지 않습니다."));

        return WorkspaceMemberResponse.toResponse(workspaceMember);
    }

    //워크스페이스 멤버들 조회
    public List<WorkspaceMemberResponse> findMembersInWorkspace(Long workspaceId, List<Long> userId) {
        List<WorkspaceMember> workspaceMembers = memberRepository.findByWorkspaceIdAndUserIdIn(workspaceId, userId);

        return workspaceMembers.stream()
                .map(WorkspaceMemberResponse::toResponse)
                .toList();
    }

    public List<WorkspaceMemberResponse> findAllByWorkspaceId(Long workspaceId) {
        List<WorkspaceMember> members = memberRepository.findAllByWorkspaceId(workspaceId);

        return members.stream()
                .map(WorkspaceMemberResponse::toResponse)
                .collect(Collectors.toList());
    }
}
