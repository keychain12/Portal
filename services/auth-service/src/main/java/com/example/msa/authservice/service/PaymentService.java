package com.example.msa.authservice.service;

import com.example.msa.authservice.TossPaymentClient;
import com.example.msa.authservice.domain.Payment;
import com.example.msa.authservice.domain.User;
import com.example.msa.authservice.dto.event.PaymentSuccessEvent;
import com.example.msa.authservice.dto.request.PaymentConfirmRequest;
import com.example.msa.authservice.dto.request.PaymentRequest;
import com.example.msa.authservice.repository.PaymentRepository;
import com.example.msa.authservice.repository.UserRepository;
import io.micrometer.core.instrument.binder.jersey.server.MetricsApplicationEventListener;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.EventListener;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final TossPaymentClient tossPaymentClient;

    @Transactional
    public Payment requestPayment(PaymentRequest request) {
        // 유저 찾기
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 결제정보생성
        Payment payment = Payment.createSubscriptionPayment(
                user, request.subscriptionPlan(), request.subscriptionMonths(), request.paymentMethod()
        );
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment paymentConfirm(PaymentConfirmRequest request) {
        //결제 정보찾기
        Payment payment = paymentRepository.findByOrderNumber(request.orderId())
                .orElseThrow(() -> new IllegalArgumentException("결제 정보없음.."));
        // 토스 요청...
        tossPaymentClient.confirmPayment(
                request.paymentKey(),
                request.orderId(),
                request.amount()
        );
        // 결제 승인
        payment.approve(request.paymentKey());

        applicationEventPublisher.publishEvent(new PaymentSuccessEvent(payment.getUser().getId(),payment.getSubscriptionMonths()));

        return payment;
    }

}
