package com.example.msa.authservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@EntityListeners(AuditingEntityListener.class)
public class Payment { //결제
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;

    @Column(nullable = false)
    private Long amount; //결제 금액
    // 결제 상태 (성공, 실패, 대기, 취소, 환불 등)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus paymentStatus;
    // 결제 수단 (카드, 계좌이체, 간편결제 등)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod;
    // PG사 거래 고유 번호 (토스, 아임포트 등에서 제공)
    @Column(unique = true, length = 100)
    private String pgTransactionId;
    // 주문 번호 (자체 생성)
    @Column(unique = true, nullable = true, length = 50)
    private String orderNumber;
    // 구독 플랜 정보 (Basic, Pro, Enterprise 등)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionPlan subscriptionPlan;
    // 구독 기간 (월 단위)
    private Long subscriptionMonths;
    // 결제 실패/취소 사유
    @Column(length = 500)
    private String failureReason;
    // 환불 금액 (부분 환불 가능)
    private Long refundAmount;
    // 결제 승인 시각
    private LocalDateTime approvedAt;
    // 취소/환불 시각
    @Column
    private LocalDateTime cancelledAt;
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    @Column
    private LocalDateTime updatedAt;

    // ===== 정적 팩토리 메서드 =====

    /**
     * 구독 결제 생성 (결제 요청 단계)
     */
    public static Payment createSubscriptionPayment(
            User user,
            SubscriptionPlan subscriptionPlan,
            Long subscriptionMonths,
            PaymentMethod paymentMethod
    ) {
        Long baseAmount = subscriptionPlan.getAmount();
        //  기본 금액 * 구독 개월수
        Long finalAmount = baseAmount * subscriptionMonths;

        return Payment.builder()
                .user(user)
                .amount(finalAmount)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(paymentMethod)
                .subscriptionPlan(subscriptionPlan)
                .subscriptionMonths(subscriptionMonths)
                .orderNumber(generateOrderNumber())
                .build();
    }

    // ===== 비즈니스 로직 메서드 =====
    public void approve(String pgTransactionId) { //결제승인
        if (paymentStatus.equals(PaymentStatus.SUCCESS))return;
        this.paymentStatus = PaymentStatus.SUCCESS;
        this.pgTransactionId = pgTransactionId;
        this.approvedAt = LocalDateTime.now();
    }


    // ===== 유틸 메서드 =====
    private static String generateOrderNumber() {
        String date = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return String.format("ORD-%s-%s", date, uuid);
    }


}
