package com.example.intercation.util;

import com.example.intercation.util.UserDetailsServiceImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {

    private final Key key;
    private final UserDetailsServiceImpl userDetailsService; // UserDetailsService 주입
    private static final long AUTH_TOKEN_EXPIRATION_MS = 1000 * 60 * 60; // 1시간 (인증용)
    private static final long INVITATION_EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24시간 (초대용)

    public JwtUtil(@Value("${jwt.secret.key}") String secret, UserDetailsServiceImpl userDetailsService) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.userDetailsService = userDetailsService;
    }

    // --- 인증(Authentication) 토큰 관련 ---

    // 인증 토큰 생성
    public String createAuthToken(String email) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + AUTH_TOKEN_EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // JWT에서 인증 정보 조회
    public Authentication getAuthentication(String token) {
        String email = getEmailFromToken(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    // Request Header에서 토큰 정보 추출
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT Token: {}", e.getMessage());
        }
        return false;
    }

    // --- 초대(Invitation) 토큰 관련 ---

    // 초대 토큰 생성 (기존 코드 유지)
    public String createInvitationToken(Long workspaceId, String inviteeEmail) {
        return Jwts.builder()
                .claim("workspaceId", workspaceId)
                .claim("email", inviteeEmail)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + INVITATION_EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 초대 토큰 검증 및 정보 파싱 (기존 코드 유지)
    public InvitationPayload parseInvitationToken(String token) {
        Claims claims = getClaims(token);
        Long workspaceId = claims.get("workspaceId", Integer.class).longValue();
        String email = claims.get("email", String.class);
        return new InvitationPayload(workspaceId, email);
    }

    // --- 공통 로직 ---

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    @Getter
    @AllArgsConstructor
    public static class InvitationPayload {
        private final Long workspaceId;
        private final String email;
    }
}