package com.example.msa.authservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class RedisController {
    private final StringRedisTemplate redisTemplate;

    @GetMapping("/redis/set")
    public String set() {
        redisTemplate.opsForValue().set("testKey", "hello redis!");
        return "saved";
    }

    @GetMapping("/redis/get")
    public String get() {
        return redisTemplate.opsForValue().get("testKey");
    }
}
