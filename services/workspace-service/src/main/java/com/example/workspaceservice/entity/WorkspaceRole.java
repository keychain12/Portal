package com.example.workspaceservice.entity;


import java.util.Arrays;

public enum WorkspaceRole { //맴버역할
    OWNER, //주인장
    MEMBER, //맴버
    GUEST; // 게스트

    public boolean hasPermission(String permission) { //Todo 권한주기
        switch (this) {
            case OWNER:
                return true; // 모든 권한
            case MEMBER:
                return Arrays.asList(Permission.INVITE_MEMBER.name(),Permission.DELETE_ANY_MESSAGE).contains(permission);
            case GUEST:
                return permission.equals("POST_MESSAGE");
            default:
                return false;
        }
    }


}
