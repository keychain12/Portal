package com.example.intercation.entity;

public enum Permission {
    // 채널 관련 권한
    EDIT_CHANNEL_PROFILE,   // 채널 이름, 주제 등 수정
    DELETE_CHANNEL,         // 채널 삭제

    // 멤버 관련 권한
    INVITE_MEMBER,          // 멤버 초대
    KICK_MEMBER,            // 멤버 내보내기

    // 메시지 관련 권한
    DELETE_ANY_MESSAGE,     // 모든 메시지 삭제
    POST_NOTICE;            // 공지사항 작성
}
