package com.example.workspaceservice.entity;

public enum WorkspaceStatus {
    PENDING, //머기중
    ACTIVE,  //활동중
    FAILED, //실패
    PERMANENTLY_FAILED // 재시도 회수 끝난 상태
}
