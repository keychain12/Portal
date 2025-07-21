package com.example.intercation.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkspaceMemberResponse {
    private Long userId;
    private String nickname;
    private String profileImgUrl;
    private String role;
}
