package com.example.intercation.entity;

import com.example.intercation.dto.request.UpdateChannelRequest;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@EntityListeners(AuditingEntityListener.class)
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workspaceId;

    @Column(nullable = false)
    private Long creatorId;

    @Column(nullable = false)
    private String channelName; // 채널이름

    private String topic;   // 주제

    private String description; //설명

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChannelType channelType; //채널타입 ,Pubic,private,DM

    @CreatedDate
    private LocalDateTime createdAt;    //생성날짜

    @Builder.Default
    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChannelMember> memberList = new ArrayList<>(); // 채널맴버

    @Builder.Default
    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> chatMessages = new ArrayList<>();

    // 정적 팩토리 메서드
    public static Channel from(Long workspaceId, Long creatorId, String channelName,ChannelType channelType) {
        return Channel.builder()
                .workspaceId(workspaceId)
                .creatorId(creatorId)
                .channelName(channelName)
                .channelType(channelType)
                .build();
    }
    //연관관계 메서드
    public void addMemberList(Long userId) {

        ChannelMember channelMember = ChannelMember.from(userId, this);

        this.memberList.add(channelMember);
    }

    public void update(UpdateChannelRequest request) {
        this.channelName = request.getChannelName();
        this.topic = request.getTopic();
        this.description = request.getDescription();
    }

}
