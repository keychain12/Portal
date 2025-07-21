package com.example.msa.authservice.controller;

import com.example.msa.authservice.dto.response.UserProfileResponse;
import com.example.msa.authservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/user/profile")
    public ResponseEntity<UserProfileResponse> getUserProfileByEmail(@RequestParam("email") String email) {

        UserProfileResponse user = userService.getUserProfileByEmail(email);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/user/info")
    public ResponseEntity<UserProfileResponse> getUserProfileById(@RequestParam("userId") Long userId){
        UserProfileResponse user = userService.findById(userId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsersById(@RequestParam List<Long> usersIds){
        List<UserProfileResponse> users = userService.findUsersByIds(usersIds);
        return ResponseEntity.ok(users);
    }


}
