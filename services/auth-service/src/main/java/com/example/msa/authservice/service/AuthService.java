package com.example.msa.authservice.service;

import com.example.msa.authservice.domain.Role;
import com.example.msa.authservice.domain.User;
import com.example.msa.authservice.dto.request.LoginRequest;
import com.example.msa.authservice.dto.request.SignupRequest;
import com.example.msa.authservice.repository.UserRepository;
import com.example.msa.authservice.util.JwtUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper; // 유저 객체를 JSON 문자열로 바꿔줄 때 필요

    //회원가입
    public String signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 가입된 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .username(request.getUsername())  // 닉네임 용도
                .email(request.getEmail())
                .password(encodedPassword)
                .role(Role.USER)
                .build();

        User saved = null;

        try {  // 회원가입을 동시에 하는경우 이메일 중복검증을 둘다 통과할 수 도 있기때문에 엔티티에서 유니크제약건것도 예외처리 해준다. 뭐그렇다네
            saved = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        return jwtUtil.generateToken(saved.getId(), saved.getEmail());
    }

    // 이메일 로그인
    public String login(LoginRequest request) throws JsonProcessingException {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("등록된 이메일이 아닙니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 틀렸습니다.");
        }

        //redis에 정보저장
        String redisKey = "user:" + user.getId();   // 키값저장
//        String redisValue = "{\"id\":" + user.getId() + ",\"email\":\"" + user.getEmail() + "\"}";
        String redisValue = objectMapper.writeValueAsString(user);
        redisTemplate.opsForValue().set(redisKey, redisValue, Duration.ofMinutes(30)); // TTL 30분
        //  redisTemplate.opsForValue() < 단순 String 기반 키벨류 저장,   set(키,벨류,만료시간)


        //  이메일 + userId 같이 넣기
        return jwtUtil.generateToken(user.getId(), user.getEmail());
    }
}

