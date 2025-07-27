package com.example.workspaceservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresenceService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final long ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5분
    private static final long IDLE_THRESHOLD_MS = 15 * 60 * 1000; // 15분
    private static final long KEY_EXPIRATION_HOURS = 24; // 키 만료 시간 (24시간)

    private String presenceKey(Long workspaceId) {
        return "presence:" + workspaceId;
    }

    // [개선] 하트비트 업데이트: 키 만료 시간 설정 추가
    public void updateHeartbeat(Long workspaceId, Long userId) {
        String key = presenceKey(workspaceId);
        String member = String.valueOf(userId);
        long now = System.currentTimeMillis();

        redisTemplate.opsForZSet().add(key, member, now);
        // 워크스페이스가 오랫동안 비활성화 상태일 때 메모리를 절약하기 위해 만료 시간을 설정합니다.
        redisTemplate.expire(key, KEY_EXPIRATION_HOURS, TimeUnit.HOURS);
    }

    // [핵심 리팩토링] 상태 조회: 명확한 3가지 상태(ACTIVE, IDLE, OFFLINE)를 반환
    public Map<Long, String> getPresenceStatus(Long workspaceId, List<Long> allMemberIds) {
        String key = presenceKey(workspaceId);
        long now = System.currentTimeMillis();
        long idleSince = now - IDLE_THRESHOLD_MS;

        // 1. [최적화] Redis를 한 번만 호출하여 '자리비움' 기준 시간 내에 활동한 모든 유저와 점수(시간)를 가져옵니다.
        Set<ZSetOperations.TypedTuple<String>> presentMembers = redisTemplate.opsForZSet()
                .rangeByScoreWithScores(key, idleSince, now);

        // 2. 가져온 결과를 <UserId, Timestamp> 형태의 Map으로 변환하여 조회하기 쉽게 만듭니다.
        Map<Long, Double> presentMemberScores = presentMembers.stream()
                .collect(Collectors.toMap(
                        member -> Long.parseLong(member.getValue()),
                        ZSetOperations.TypedTuple::getScore
                ));

        // 3. 전체 멤버를 기준으로 루프를 돌며 최종 상태 맵을 만듭니다.
        Map<Long, String> finalStatus = new HashMap<>();
        long activeSince = now - ONLINE_THRESHOLD_MS;

        for (Long memberId : allMemberIds) {
            if (presentMemberScores.containsKey(memberId)) {
                // 활동 기록이 있는 경우
                if (presentMemberScores.get(memberId) >= activeSince) {
                    finalStatus.put(memberId, "ACTIVE"); // '온라인' 기준 시간 내에 있으면 ACTIVE
                } else {
                    finalStatus.put(memberId, "IDLE"); // '자리비움' 기준 시간 내에 있으면 IDLE
                }
            } else {
                // 활동 기록이 전혀 없는 경우
                finalStatus.put(memberId, "OFFLINE"); // OFFLINE 상태 명시
            }
        }

        return finalStatus;
    }
}