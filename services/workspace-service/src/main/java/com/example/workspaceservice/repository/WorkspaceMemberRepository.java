package com.example.workspaceservice.repository;

import com.example.workspaceservice.entity.Workspace;
import com.example.workspaceservice.entity.WorkspaceMember;
import com.example.workspaceservice.entity.WorkspaceRole;
import org.hibernate.jdbc.Work;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    WorkspaceMember findByWorkspaceIdAndRole(Long workspaceId, WorkspaceRole workspaceRole);

    boolean existsByWorkspaceIdAndUserId(Long workspace_id, Long userId);

    List<WorkspaceMember> findByWorkspaceIdAndUserIdIn(Long workspaceId, List<Long> userId);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long id, Long userId);

    List<WorkspaceMember> findAllByWorkspaceId(Long workspaceId);
}
