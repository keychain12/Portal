package com.example.msa.authservice.dto.request;

import com.example.msa.authservice.domain.PaymentMethod;
import com.example.msa.authservice.domain.SubscriptionPlan;

public record PaymentRequest(Long userId, PaymentMethod paymentMethod, SubscriptionPlan subscriptionPlan,Long subscriptionMonths) {

}
