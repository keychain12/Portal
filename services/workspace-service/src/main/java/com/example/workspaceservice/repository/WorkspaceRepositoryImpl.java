package com.example.workspaceservice.repository;

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
    public Page<Workspace> findAllByUserId(Long userId, Pageable pageable) {
        QWorkspace w = QWorkspace.workspace;
        QWorkspaceMember wm = QWorkspaceMember.workspaceMember;

        List<Workspace> content = queryFactory
                .selectFrom(w)
                .join(wm).on(wm.workspace.eq(w))
                .where(wm.userId.eq(userId))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(w.count())
                .from(w)
                .join(wm).on(wm.workspace.eq(w))
                .where(wm.userId.eq(userId))
                .fetchOne();

        return new PageImpl<>(content, pageable, total != null ? total : 0);

    }


}
