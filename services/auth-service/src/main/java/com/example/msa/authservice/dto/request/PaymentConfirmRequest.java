package com.example.msa.authservice.dto.request;

public record PaymentConfirmRequest(String paymentKey,String orderId,Long amount) {
}
