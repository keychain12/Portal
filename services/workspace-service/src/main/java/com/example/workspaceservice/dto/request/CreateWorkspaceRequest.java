package com.example.workspaceservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class CreateWorkspaceRequest {

    @NotBlank(message = "워크스페이스 이름을 입력해주세요.")
    private String name; // 워크스페이스 이름

    @Size(max = 100, message = "설명은 최대 100자까지 입력할 수 있습니다.")
    private String description; // 설명

    @NotBlank(message = "닉네임을 입력해주세요.")
    private String nickname;  // 사용자 닉네임

    private List<@Email String> emails;
}
