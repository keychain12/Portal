package com.example.intercation.service;

import com.example.intercation.dto.response.UserStatusUpdateResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserStatusService {

    private final StringRedisTemplate stringRedisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String USER_CONNECTIONS_PREFIX = "user:connections:"; //연결 카운터 를위해..
    private static final String USER_STATUS_PREFIX = "user:status:";
    private static final String SESSION_USER_PREFIX = "session:user:";
    private static final long SESSION_TTL_MINUTES = 5;


    public void handleUserConnect(String userId, String workspaceId, String sessionId) { //유저 연결시
        // 유저연결 키 만들기
        String connectionKey = USER_CONNECTIONS_PREFIX + userId;

        //  해당 유저 카운트 증가시키기
        Long connectionCount = stringRedisTemplate.opsForValue().increment(connectionKey);

        // 첫연결이면 카운트 1 / 온라인 상태로 변경 / 온라인으로 변경됐따 알리기
        if (connectionCount != null && connectionCount == 1) {
            stringRedisTemplate.opsForValue().set(USER_STATUS_PREFIX + userId, "ONLINE");
            broadcastUserStatus(workspaceId, userId, "ONLINE");
        }

        // 유저 세션정보 , 만료시간 저장
        saveSessionInfo(sessionId, userId, workspaceId);
        extendAllRelatedKeys(userId, sessionId);
    }
    public String getUserStatus(Long userId) { //유저 상태 꺼내기
        String statusKey = USER_STATUS_PREFIX + userId;
        String status = stringRedisTemplate.opsForValue().get(statusKey);
        // 상태 null이거나 오프면 오프라인
        return status != null ? status : "OFFLINE";
    }


    public void handleUserDisconnect(String sessionId) { // 연결 끊을시
        // 세션 ID로 유저 정보를 먼저 조회
        Map<Object, Object> sessionInfo = getSessionInfo(sessionId);
        if (sessionInfo.isEmpty()) {
            log.warn("세션이 만료되었습니다.: {}. ", sessionId);
            return;
        }

        String userId = String.valueOf(sessionInfo.get("userId"));
        String workspaceId = String.valueOf(sessionInfo.get("workspaceId"));

        String connectionKey = USER_CONNECTIONS_PREFIX + userId;

        // 연결 카운트 키가 존재하는지 확인
        String currentCountStr = stringRedisTemplate.opsForValue().get(connectionKey);
        if (currentCountStr == null) {
            log.warn("만료됨 ㅇㅇ {}.", userId);
            // 세션 정보만 정리하고 종료
            stringRedisTemplate.delete(SESSION_USER_PREFIX + sessionId);
            return;
        }

        // 연결 카운트 감소
        Long connectionCount = stringRedisTemplate.opsForValue().decrement(connectionKey);

        // 마지막 연결이면 (카운트0일시) 오프라인으로 변경 후 알림
        if (connectionCount != null && connectionCount <= 0) {
            // 유저상태 오프라인 변경
            stringRedisTemplate.opsForValue().set(USER_STATUS_PREFIX + userId, "OFFLINE");
            // 카운트 키삭제
            stringRedisTemplate.delete(connectionKey); // 카운트 키만 정리 (상태는 OFFLINE으로 유지)
            // 오프라인 알림
            broadcastUserStatus(workspaceId, userId, "OFFLINE");
        }

        //세선 정보 삭제
        stringRedisTemplate.delete(SESSION_USER_PREFIX + sessionId);
    }


    public void extendUserSession(String sessionId) {
        // 세션조회
        Map<Object, Object> sessionInfo = getSessionInfo(sessionId);
        if (!sessionInfo.isEmpty()) {
            String userId = String.valueOf(sessionInfo.get("userId"));
            // 세선 TTL 설ㅈㅓㅇ
            extendAllRelatedKeys(userId, sessionId);
        }
    }

    public Map<Object, Object> getSessionInfo(String sessionId) { //세션조회
        return stringRedisTemplate.opsForHash().entries(SESSION_USER_PREFIX + sessionId);
    }


    private void saveSessionInfo(String sessionId, String userId, String workspaceId) { //세선정보 저장
        String sessionKey = SESSION_USER_PREFIX + sessionId;
        stringRedisTemplate.opsForHash().put(sessionKey, "userId", userId);
        stringRedisTemplate.opsForHash().put(sessionKey, "workspaceId", workspaceId);
    }

    private void extendAllRelatedKeys(String userId, String sessionId) {
        // 세션 정보만 TTL 설정 (5분)
        stringRedisTemplate.expire(SESSION_USER_PREFIX + sessionId, SESSION_TTL_MINUTES, TimeUnit.MINUTES);
        // 사용자 상태와 연결 카운트는 영구 보존 명시적 연결해제시에만 삭제
    }

    private void broadcastUserStatus(String workspaceId, String userId, String status) { // 유저 상태 알림
        if (workspaceId == null || userId == null) return;
        String destination = "/sub/workspace/" + workspaceId + "/status";
        UserStatusUpdateResponse statusUpdate = UserStatusUpdateResponse.builder()
                .userId(userId)
                .status(status)
                .build();
        messagingTemplate.convertAndSend(destination, statusUpdate);
    }
}