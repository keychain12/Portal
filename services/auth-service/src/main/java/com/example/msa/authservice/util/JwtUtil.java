package com.example.msa.authservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1시간

    private final Key key;

    // @Value로 yml에서 키를 주입받도록 수정
    public JwtUtil(@Value("${jwt.secret.key}") String secret) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    private Key getSignKey() {
        return this.key; // 멤버 변수 key를 반환
    }
    /**
     *  userId + email을 함께 담아 토큰 생성
     */
    public String generateToken(Long userId, String email) {
        // Claims claims = Jwts.claims().setSubject(email); // 👈 이 두 줄을 삭제하고
        // claims.put("userId", userId);

        return Jwts.builder()
                // .setClaims(claims) // 👈 이 부분을 아래와 같이 직접 설정하는 방식으로 변경합니다.
                .setSubject(email) // subject를 직접 설정
                .claim("userId", userId) // custom claim도 직접 추가
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
