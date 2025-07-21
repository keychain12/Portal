package com.example.msa.authservice.controller;

import com.example.msa.authservice.dto.request.LoginRequest;
import com.example.msa.authservice.dto.request.SignupRequest;
import com.example.msa.authservice.service.AuthService;
import com.example.msa.authservice.util.CustomUserDetails;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "사용자 API" ,description = "로그인, 회원가입 기능")
public class AuthController {

    private final AuthService authService;

    //회원가입 API
    @PostMapping("/signup")
    @Operation(summary = "회원가입" , description = "회원가입 API")
    public ResponseEntity<?> signup(@RequestBody @Valid SignupRequest request, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) { // 회원가입 검증처리
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            return ResponseEntity
                    .badRequest()
                    .body(errorMsg);
        }

        String jwt = authService.signup(request);

         return ResponseEntity.ok(Map.of(
                "message", "회원가입이 성공적으로 완료되었습니다.",
                "token", jwt// "token" 또는 "accessToken"으로 키를 지정
        ));
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "사용자 로그인 API")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) throws JsonProcessingException {

        String jwt = authService.login(request);

        return ResponseEntity.ok(Map.of("token", jwt));
    }




    @GetMapping("/profile")
    @Operation(summary = "사용자 프로필" , description = "사용자 프로필 호출 API")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {

        Map<String, Object> profile = new HashMap<>();
        profile.put("username", userDetails.getUsername());
        profile.put("email", userDetails.getUserEmail());
        profile.put("message", "profile api!");

        return ResponseEntity.ok(profile);

    }
}
