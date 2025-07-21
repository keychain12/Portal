package com.example.workspaceservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "MY_SECRET_KEY_MUST_BE_LONG_ENOUGH_FOR_HS256_ALGORITHM";
    private static final long INVITATION_EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24시간

    // JWT 검증에 사용할 SecretKey 반환
    private static Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // JWT 토큰에서 userId 꺼내기
    public Long validateAndGetUserId(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(getSignKey())
                .parseClaimsJws(token)
                .getBody();

        return claims.get("userId", Long.class);
    }

    // 초대 토큰 생성
    public String createInvitationToken(Long workspaceId, String inviteeEmail) {
        return Jwts.builder()
                .claim("workspaceId", workspaceId)
                .claim("email", inviteeEmail)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + INVITATION_EXPIRATION_MS))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 초대 토큰 검증 및 정보 파싱
    public InvitationPayload parseInvitationToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(getSignKey())
                .parseClaimsJws(token)
                .getBody();

        Long workspaceId = claims.get("workspaceId", Integer.class).longValue(); // 타입캐스팅 주의
        String email = claims.get("email", String.class);

        return new InvitationPayload(workspaceId, email);
    }

    @Getter
    @AllArgsConstructor
    public static class InvitationPayload {
        private final Long workspaceId;
        private final String email;

    }
}
