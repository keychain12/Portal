package com.example.workspaceservice.repository;

import com.example.workspaceservice.entity.WorkspaceInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation,Long> {
    List<WorkspaceInvitation> findAllByWorkspaceId(Long workspaceId);

    Optional<WorkspaceInvitation> findByWorkspaceIdAndInviteeEmail(Long workspaceId, String email);

}
