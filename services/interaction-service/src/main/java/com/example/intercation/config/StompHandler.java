package com.example.intercation.config;

import com.example.intercation.util.UserDetailsImpl;
import com.example.intercation.service.UserStatusService;
import com.example.intercation.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
class StompHandler implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserStatusService userStatusService;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String WORKSPACE_ID_HEADER = "workspaceId";

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        //// StompHeaderAccessor를 사용하여 STOMP 메시지 헤더에 접근합니다.
        //StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);   << 원래 코드 였는데 이러면 null 되어서 밑에껄로 바꿔주란다.
        StompHeaderAccessor accessor = MessageHeaderAccessor
                .getAccessor(message, StompHeaderAccessor.class);
        try {
            switch (accessor.getCommand()) {
                case CONNECT:
                    handleConnect(accessor);
                    break;
                case DISCONNECT:
                    handleDisconnect(accessor);
                    break;
                case SUBSCRIBE:
                    handleSubscribe(accessor);
                    break;
                default:
                    break;
            }
        } catch (Exception e) {
            log.error("STOMP 에러 {} processing error: {}", accessor.getCommand(), e.getMessage(), e);
        }
        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        String jwtToken = accessor.getFirstNativeHeader(AUTHORIZATION_HEADER);
        String workspaceId = accessor.getFirstNativeHeader(WORKSPACE_ID_HEADER);

        if (workspaceId == null || jwtToken == null || !jwtToken.startsWith(BEARER_PREFIX)) {
            log.warn(" 여결 안됨. workspaceId: {}, token: {}", workspaceId, jwtToken);
            return;
        }

        String token = jwtToken.substring(BEARER_PREFIX.length());
        if(!jwtUtil.validateToken(token)) {
            log.warn("토큰 이상함 ㅇㅇ");
            return;
        }

        Authentication authentication = jwtUtil.getAuthentication(token);
        accessor.setUser(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // 1. 호출하는 메서드를 새 메서드로 변경
        String userId = String.valueOf(userDetails.getUserId());
        String sessionId = accessor.getSessionId();
        userStatusService.handleUserConnect(userId, workspaceId, sessionId);
    }

    private void handleDisconnect(StompHeaderAccessor accessor) {
        String sessionId = accessor.getSessionId();
        if (sessionId == null) return;

        // 2. 호출하는 메서드를 새 메서드로 변경
        userStatusService.handleUserDisconnect(sessionId);
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        String sessionId = accessor.getSessionId();
        if (sessionId != null) {
            userStatusService.extendUserSession(sessionId);
        }
    }
}