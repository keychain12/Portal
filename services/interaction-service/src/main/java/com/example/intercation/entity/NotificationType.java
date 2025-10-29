package com.example.intercation.entity;


public enum NotificationType { // 알람 타입
    // DM
    DIRECT_MESSAGE("다이렉트 메시지"),

    // 채널
    CHANNEL_MESSAGE("채널 메시지"),
    CHANNEL_MENTION("채널 멘션"),

    // 스레드
    THREAD_REPLY("스레드 답글"),

    // 시스템
    ADDED_TO_CHANNEL("채널 초대"),
    REMOVED_FROM_CHANNEL("채널 퇴장"),

    // 반응
    MESSAGE_REACTION("메시지 반응");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }
}
