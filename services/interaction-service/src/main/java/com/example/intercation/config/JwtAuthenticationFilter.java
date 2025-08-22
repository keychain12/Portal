package com.example.intercation.config;

import com.example.intercation.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // permitAll 경로들은 JWT 검증을 건너뜀
        String requestURI = request.getRequestURI();
        
        if (requestURI.contains("/api/chat/search/") ||
            requestURI.startsWith("/api/login") ||
            requestURI.startsWith("/api/signup") ||
            requestURI.startsWith("/swagger-ui/") ||
            requestURI.startsWith("/v3/api-docs/") ||
            requestURI.startsWith("/actuator/") ||
            requestURI.startsWith("/eureka/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. 헤더에서 토큰 추출
        String token = jwtUtil.resolveToken(request);

        // 2. 토큰 유효성 검사
        if (token != null && jwtUtil.validateToken(token)) {
            // 3. 토큰이 유효하면 인증 정보 생성
            Authentication authentication = jwtUtil.getAuthentication(token);
            // 4. SecurityContext에 인증 정보 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}