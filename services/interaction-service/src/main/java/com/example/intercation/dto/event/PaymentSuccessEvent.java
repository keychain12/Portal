package com.example.intercation.dto.event;

import java.io.Serializable;

public record PaymentSuccessEvent (Long userId,
                                   Long subscriptionMonths) implements Serializable {
}
