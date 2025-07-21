package com.example.msa.authservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    @Schema(description = "사용자 이름" , example = "홍길동")
    private String userName;
    @Schema(description = "이메일", example = "test@email.com")
    private String email;
    @Schema(description = "응답 메세지" , defaultValue = "profile")
    private String message;

}
