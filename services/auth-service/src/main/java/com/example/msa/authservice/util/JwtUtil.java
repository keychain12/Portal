package com.example.msa.authservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "MY_SECRET_KEY_MUST_BE_LONG_ENOUGH_FOR_HS256_ALGORITHM";
    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1시간

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    /**
     *  userId + email을 함께 담아 토큰 생성
     */
    public String generateToken(Long userId, String email) {
        Claims claims = Jwts.claims().setSubject(email);
        claims.put("userId", userId);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     *  토큰에서 이메일(subject) 추출
     */
    public String validateAndGetUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     *   토큰에서 userId 추출
     */
    public Long extractUserId(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("userId", Long.class);
    }
}
