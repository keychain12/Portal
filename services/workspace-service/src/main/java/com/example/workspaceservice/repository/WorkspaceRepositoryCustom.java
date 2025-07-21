package com.example.workspaceservice.repository;

import com.example.workspaceservice.entity.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WorkspaceRepositoryCustom {
    Page<Workspace> findAllByUserId(Long userId, Pageable pageable);


}
