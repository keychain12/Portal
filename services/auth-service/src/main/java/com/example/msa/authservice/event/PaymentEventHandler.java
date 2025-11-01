package com.example.msa.authservice.event;

import com.example.msa.authservice.dto.event.PaymentSuccessEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class PaymentEventHandler { // 결제 정보 -> 구독서비스로 넘기기

    private final KafkaTemplate<String, Object> kafkaTemplate;    // 메일 발송 요청용

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void paymentEvent(PaymentSuccessEvent event) {
        System.out.println("================카프카 보내기전 ====================");
        kafkaTemplate.send("payment-success", event);
        System.out.println("================카프카 보내짐  ====================");

    }
}

