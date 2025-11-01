package com.example.intercation.service;

import com.example.intercation.dto.event.PaymentSuccessEvent;
import com.example.intercation.entity.Subscription;
import com.example.intercation.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    @Transactional
    public void createOrUpdateSubscription(PaymentSuccessEvent event) {

        Subscription subscription = subscriptionRepository.findByUserId(event.userId())
                .orElseGet(() -> {
                    Subscription freeSubscription = Subscription.createFreeSubscription(event.userId());
                    return subscriptionRepository.save(freeSubscription);
                }); // 기존 구독정보 없으면 새로만들기(프리) 후 저장

        subscription.switchToPaid(event.subscriptionMonths());
    }

}
