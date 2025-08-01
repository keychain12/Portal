package com.example.intercation.client;

import com.example.intercation.dto.response.UserProfileResponse;
import lombok.Getter;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "auth-service",url = "http://localhost:8081")
public interface AuthClient {

    @GetMapping("/user/info")
    UserProfileResponse getUserProfileById(@RequestParam("userId") Long id);

    @GetMapping("/users")
    List<UserProfileResponse> getUsersById(@RequestParam List<Long> userIds);

    @GetMapping("/user/profile")
    UserProfileResponse getUserProfileByEmail(@RequestParam("email") String email);
}


