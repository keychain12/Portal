package com.example.intercation.event;

import com.example.intercation.dto.event.PaymentSuccessEvent;
import com.example.intercation.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentEventConsumer {
    private final SubscriptionService service;

    @KafkaListener(topics = "payment-success", groupId = "payment-group")
    public void consumerPaymentEvent(PaymentSuccessEvent event) {
        System.out.println("=============카프카 받음 ==========");
        service.createOrUpdateSubscription(event);
    }
}
