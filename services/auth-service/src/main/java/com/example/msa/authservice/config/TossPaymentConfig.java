package com.example.msa.authservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Configuration
public class TossPaymentConfig {

    @Value("${toss.payments.secret-key}")
    private String secretKey;

    @Bean
    public RestTemplate tossRestTemplate() {
        return new RestTemplate();
    }

    // Base64 인코딩된 시크릿 키 (토스 인증용)
    public String getEncodedSecretKey() {
        return Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes());
    }
}
