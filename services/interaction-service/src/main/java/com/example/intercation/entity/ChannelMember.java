package com.example.intercation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "channel_member",
        uniqueConstraints = @UniqueConstraint(
                name = "channel_member_uk",
                columnNames = { "channel_id", "user_id" }  // ← 올바른 physical 컬럼명
        )
)
public class ChannelMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id")
    private Channel channel;

    // 정적 팩토리 메서드
    public static ChannelMember from(Long userId, Channel channel) {
        return ChannelMember.builder()
                .userId(userId)
                .channel(channel)
                .build();
    }
}
