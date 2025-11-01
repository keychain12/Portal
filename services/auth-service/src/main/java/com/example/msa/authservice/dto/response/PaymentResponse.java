package com.example.msa.authservice.dto.response;

import com.example.msa.authservice.domain.PaymentMethod;

public record PaymentResponse(Long amount, PaymentMethod paymentMethod, String orderNumber) {

}
