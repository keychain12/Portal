package com.example.workspaceservice.repository;

import com.example.workspaceservice.dto.response.QWorkspaceResponse;
import com.example.workspaceservice.dto.response.WorkspaceResponse;
import com.example.workspaceservice.entity.QWorkspace;
import com.example.workspaceservice.entity.QWorkspaceMember;
import com.example.workspaceservice.entity.Workspace;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@RequiredArgsConstructor
@Repository
public class WorkspaceRepositoryImpl implements WorkspaceRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    @Override
    public Page<WorkspaceResponse> findAllByUserId(Long userId, Pageable pageable) {
        QWorkspace w = QWorkspace.workspace;
        QWorkspaceMember wm = QWorkspaceMember.workspaceMember;
        QWorkspaceMember userMember = new QWorkspaceMember("userMember"); // 필터링을 위한 별칭
        // 내용 조회 쿼리
        List<WorkspaceResponse> content = queryFactory
                .select(new QWorkspaceResponse(
                        w.id,
                        w.name,
                        w.description,
                        w.urlSlug,
                        wm.count()
                ))
                .from(w)
                // 1. 멤버 수를 세기 위한 조인
                .join(w.members, wm)
                // 2. 특정 유저가 속한 워크스페이스를 찾기 위한 조인
                .join(w.members, userMember)
                .where(userMember.userId.eq(userId))
                .groupBy(w.id, w.name) // 카운트를 위해 그룹화
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // 전체 카운트 쿼리
        Long total = queryFactory
                .select(w.id.countDistinct()) // 유저가 속한 워크스페이스의 총 개수
                .from(w)
                .join(w.members, userMember)
                .where(userMember.userId.eq(userId))
                .fetchOne();

        return new PageImpl<>(content, pageable, total != null ? total : 0);
    }


}
