package com.example.msa.authservice.dto.event;

import java.io.Serializable;
import java.time.LocalDateTime;

public record PaymentSuccessEvent(Long userId, Long subscriptionMonths) implements Serializable {

}
