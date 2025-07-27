package com.example.workspaceservice.service;

import com.example.workspaceservice.common.SlugGenerator;
import com.example.workspaceservice.dto.request.CreateWorkspaceRequest;
import com.example.workspaceservice.dto.response.*;
import com.example.workspaceservice.entity.Workspace;
import com.example.workspaceservice.entity.WorkspaceMember;
import com.example.workspaceservice.repository.WorkspaceMemberRepository;
import com.example.workspaceservice.repository.WorkspaceRepository;
import com.example.workspaceservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final S3Service s3Service;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final SlugGenerator slugGenerator;

    // 워크스페이스 생성
    @CacheEvict(value = "workspaceDetails", allEntries = true)
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request, Long userId, MultipartFile profileImage) throws IOException {
        // 랜덤 url 만들기
        String randomSlug = slugGenerator.generate();
        // 이미지 확인
        String profileUrl = s3Service.upload(profileImage);
        // 워크스페이스 정적팩토리메서드
        Workspace workspace = Workspace.create(request.getName(), request.getDescription(), userId, randomSlug);
        // 맴버 연관관계 설정
        workspace.addOwnerMember(userId, request.getNickname(), profileUrl);
        // 초대 한사람이 있을경우..
        workspace.addInvitation(userId, request.getEmails());
        // 저장
        Workspace savedWorkspace = workspaceRepository.save(workspace);
        // 어플리케이션 이벤트 퍼블리셔 사용시 @TransactionalEventListener 붙은애 실행 해서  메일실패시 같은 워크스페이스 생성도 실패하는걸 방지하기위해 에프터커밋사용
        applicationEventPublisher.publishEvent(new WorkspaceCreatedEvent(savedWorkspace.getId()));

        return WorkspaceResponse.toResponse(savedWorkspace);
    }


    //내 워크 스페이스 목록조회
    @Transactional(readOnly = true)
    public Page<WorkspaceResponse> getMyWorkspace(Long userId, Pageable pageable) {
        return workspaceRepository.findAllByUserId(userId, pageable);
    }
    // 워크스페이스 상세 조회
    @Transactional(readOnly = true)
//    @Cacheable(value = "workspaceDetails", key = "#slug")
    public WorkspaceDetailResponse findByUrlSlug(String slug) {
        Workspace workspace = workspaceRepository.findByUrlSlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "워크스페이스를 찾을 수 없습니다."));
        return WorkspaceDetailResponse.from(workspace);
    }

    //워크스페이스 멤버들 조회
    public List<WorkspaceMemberResponse> findMembersInWorkspace(Long workspaceId, List<Long> userId) {
        List<WorkspaceMember> workspaceMembers = workspaceMemberRepository.findByWorkspaceIdAndUserIdIn(workspaceId, userId);

        return workspaceMembers.stream()
                .map(WorkspaceMemberResponse::toResponse)
                .toList();
    }
}
