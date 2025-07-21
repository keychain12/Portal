package com.example.workspaceservice.service;

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
    private final WorkspaceEventProducer workspaceEventProducer;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    // 워크스페이스 생성
    @CacheEvict(value = "workspaceDetails", allEntries = true)
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request, Long userId, MultipartFile profileImage) throws IOException {
        String randomSlug = generateRandomSlug(); // url슬러그 생성
        // 이미지 확인
        String profileUrl = null;
        if (profileImage != null && !profileImage.isEmpty()) {
            profileUrl = s3Service.upload(profileImage);
        }
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

        // 카프카 이벤트 저장이 되야 id 가 생기니까.. 저장이후에
//        WorkspaceCreateDto dto = WorkspaceCreateDto.from(workspace,userId);
        //workspaceEventProducer.sendWorkspaceCreatedEvent(dto);

        return WorkspaceResponse.toResponse(savedWorkspace);
    }



    private String generateRandomSlug() {
        String slug;
        do {
            // w + 10자리 랜덤 숫자-8자리 랜덤 문자열
            String part1 = "w" + (long)(Math.random() * 1_000_000_0000L); // w + 10자리 숫자
            String part2 = randomAlphaNumeric(8).toLowerCase();
            slug = part1 + "-" + part2;
        } while (workspaceRepository.existsByUrlSlug(slug));
        return slug;
    }

    private String randomAlphaNumeric(int count) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            sb.append(chars.charAt((int)(Math.random() * chars.length())));
        }
        return sb.toString();
    }


    @Transactional(readOnly = true)
    public Page<WorkspaceResponse> getMyWorkspace(Long userId, Pageable pageable) {
        return workspaceRepository.findAllByUserId(userId, pageable)
                .map(WorkspaceResponse::toResponse);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "workspaceDetails", key = "#slug")
    public WorkspaceDetailResponse findByUrlSlug(String slug) {
        Workspace workspace = workspaceRepository.findByUrlSlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "워크스페이스를 찾을 수 없습니다."));
        return WorkspaceDetailResponse.from(workspace);
    }


    public List<WorkspaceMemberResponse> findMembersInWorkspace(Long workspaceId, List<Long> userId) {
        List<WorkspaceMember> workspaceMembers = workspaceMemberRepository.findByWorkspaceIdAndUserIdIn(workspaceId, userId);

        return workspaceMembers.stream()
                .map(WorkspaceMemberResponse::toResponse)
                .toList();
    }
}
