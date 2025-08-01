package com.example.intercation.config;

import com.example.intercation.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class StompHandler implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor
                .getAccessor(message, StompHeaderAccessor.class);

        // 모든 STOMP 명령어에 대해 현재 세션의 사용자 정보 로깅
        log.info("STOMP Command: {}, User: {}", accessor.getCommand(), accessor.getUser());

        // STOMP 연결 시(CONNECT)에만 JWT 인증 처리
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String jwtToken = accessor.getFirstNativeHeader("Authorization");

            if (jwtToken != null && jwtToken.startsWith("Bearer ")) {
                String token = jwtToken.substring(7);
                if (jwtUtil.validateToken(token)) {
                    Authentication authentication = jwtUtil.getAuthentication(token);
                    accessor.setUser(authentication);
                    // setUser 후에 다시 로깅하여 적용되었는지 확인
                    log.info("✅ STOMP User authenticated and set: {}, User: {}", authentication.getName(), accessor.getUser());
                } else {
                    log.error("❌ STOMP Token validation failed.");
                }
            } else {
                log.warn("⚠️ No or invalid Authorization header found for CONNECT command.");
            }
        }

        return message;
    }
}