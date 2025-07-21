package com.example.workspaceservice.client;

import com.example.workspaceservice.dto.response.UserProfileResponse;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.cloud.openfeign.FeignAutoConfiguration;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
@FeignClient(name = "auth-service",url = "http://localhost:8081")
public interface AuthClient {

    @GetMapping("/user/profile")
    UserProfileResponse getUserProfileByEmail(@RequestParam("email") String email);

}


