package com.example.workspaceservice.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericToStringSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableCaching
public class RedisConfig {
    // 1) Redis 커넥션 팩토리 (Lettuce)
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory();  // 기본 localhost:6379
    }

    // 2) RedisTemplate<String, Long> 빈
    @Bean
    public RedisTemplate<String, Long> redisTemplate(RedisConnectionFactory cf) {
        RedisTemplate<String, Long> template = new RedisTemplate<>();
        template.setConnectionFactory(cf);
        // 키는 문자열
        template.setKeySerializer(new StringRedisSerializer());
        // 값은 Long → String 으로 직렬화
        template.setValueSerializer(new GenericToStringSerializer<>(Long.class));
        // SortedSet 의 score 는 Double 이므로 추가 설정 필요 없어요
        return template;
    }
}
