package com.example.workspaceservice.repository;

import com.example.workspaceservice.dto.response.WorkspaceDetailResponse;
import com.example.workspaceservice.entity.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace,Long> , WorkspaceRepositoryCustom{

    Page<Workspace> findAllByUserId(@Param("userId") Long userId, Pageable pageable);

    boolean existsByUrlSlug(String slug);

    Optional<Workspace> findByUrlSlug(String slug);

    Optional<Workspace> findById(Long workspaceId);

}
