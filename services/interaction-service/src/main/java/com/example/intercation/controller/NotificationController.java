package com.example.intercation.controller;

import com.example.intercation.dto.request.MentionNotificationRequest;
import com.example.intercation.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping("/mention")
    @Operation(summary = "채널 멘션 알림")
    public ResponseEntity<Void> createMentionNotification(@RequestBody @Valid MentionNotificationRequest request) {
        notificationService.createMentionNotification(request);
        return ResponseEntity.ok().build();
    }
}
