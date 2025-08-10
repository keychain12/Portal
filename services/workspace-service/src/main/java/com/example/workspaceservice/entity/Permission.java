package com.example.workspaceservice.entity;

public enum Permission { // 권한

    // 채널 관련
    DELETE_CHANNEL, // 채널삭제
    EDIT_CHANNEL_PROFILE, // 채널 프로필 수정

    // 멤버 관련
    INVITE_MEMBER, // 맴버초대
    KICK_MEMBER,  //맴버 추방


    // 메시지 관련
    DELETE_ANY_MESSAGE, // 메세지삭제
    POST_NOTICE, // 공지사항 추가


}
