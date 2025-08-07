package com.example.workspaceservice.repository;

import com.example.workspaceservice.dto.response.WorkspaceDetailResponse;
import com.example.workspaceservice.dto.response.WorkspaceResponse;
import com.example.workspaceservice.entity.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.workspaceservice.entity.WorkspaceStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace,Long> , WorkspaceRepositoryCustom{

    Page<WorkspaceResponse> findAllByUserId(@Param("userId") Long userId, Pageable pageable);

    boolean existsByUrlSlug(String slug);

    // Fetch join 으로 조회하는 워크스페이스의 모든 멤버들을 한번에 조회를해 N + 1 문제를 해결해보자.
    @Query("SELECT w FROM Workspace w JOIN FETCH w.members WHERE w.urlSlug = :slug")
    Optional<Workspace> findByUrlSlug(String slug);

    Optional<Workspace> findById(Long workspaceId);

    List<Workspace> findByStatusAndRetryCountLessThan(WorkspaceStatus status, int retryCount);

}
