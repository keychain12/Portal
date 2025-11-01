package com.example.msa.authservice;

import com.example.msa.authservice.config.TossPaymentConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class TossPaymentClient {

    private final RestTemplate tossRestTemplate;
    private final TossPaymentConfig config;

    @Value("${toss.payments.api-url}")
    private String apiUrl;

    public void confirmPayment(String paymentKey, String orderId, Long amount) {
        String url = apiUrl + "/v1/payments/confirm";

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + config.getEncodedSecretKey());
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 바디 설정
        Map<String, Object> body = Map.of(
                "paymentKey", paymentKey,
                "orderId", orderId,
                "amount", amount
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        // API 호출
        ResponseEntity<String> response = tossRestTemplate.postForEntity(
                url,
                request,
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("토스 결제 승인 실패");
        }
    }
}
