package com.example.msa.authservice.domain;

import lombok.Getter;

@Getter
public enum SubscriptionPlan {
    BASIC(9900L), // 베이식
    PRO(19900L),    //프로
    ENTERPRISE(49900L); // 엔터프라이즈
    private final Long amount;

    SubscriptionPlan(long amount) {
        this.amount = amount;
    }
}
