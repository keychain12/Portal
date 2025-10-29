package com.example.nortificationservice.controller

import com.example.nortificationservice.service.NotificationService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/notifications")
class NotificationController (
    private val notificationService: NotificationService
){

    @GetMapping()
    fun home(): String {

        return "hello"
    }

}
