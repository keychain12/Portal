package com.example.intercation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@EntityListeners(AuditingEntityListener.class)
@Getter
public class Subscription { // 구독
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MembershipStatus membershipStatus; // 맴버십 상태 FREE, PAID

    private Long ragUsageCount; // rag 사용횟수 / 정책이 프리유저는 하루 5개 제한

    @Builder.Default
    private Long dailyLimitCount = 5L; // 하루제한
    @Column
    private LocalDateTime startDate; //구독일

    private LocalDateTime endDate; //종료날짜

    public static Subscription createFreeSubscription(Long userId) {
        return Subscription.builder()
                .userId(userId)
                .membershipStatus(MembershipStatus.FREE)
                .ragUsageCount(0L)
                .dailyLimitCount(5L)
                .build();
    }

    // RAG 사용 가능 여부 확인
    public boolean canUseRag() {
        return (this.ragUsageCount == null ? 0 : this.ragUsageCount) < this.dailyLimitCount;
    }

    // RAG 사용 횟수 증가 및 상태 업데이트
    public void incrementRagUsage() {
        if (!canUseRag()) {
            throw new IllegalStateException("RAG 일일 사용 제한 초과");
        }
        this.ragUsageCount++;
    }

    // ️ PAID 상태로 변경하고, 일일 제한 횟수를 큰 값으로 설정
    public void switchToPaid(Long subscriptionMonths) {
        LocalDateTime endDate = LocalDateTime.now().plusMonths(subscriptionMonths);

        this.membershipStatus = MembershipStatus.PAID; // 맴버십 상태변경
        this.dailyLimitCount = 9999L; // rag 개수 9999개
        this.ragUsageCount = 0L; // rag 사용한 횟수 일단 0개로
        this.startDate = LocalDateTime.now(); //시작 시간
        this.endDate = endDate;
    }

    // ️ FREE 상태로 변경하고, 제한 횟수를 기본값으로 설정
    public void switchToFree() {
        this.membershipStatus = MembershipStatus.FREE;
        this.dailyLimitCount = 5L;
        this.ragUsageCount = 0L;
        this.endDate = null;
    }
}
