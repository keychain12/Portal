package com.example.msa.authservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    @NotBlank(message = "이름은 필수 입니다.")
    @Pattern(
            // 한글 또는 영문 대소문자 2~20자
            regexp = "^[A-Za-z가-힣]{2,20}$",
            message = "사용할 수 없는 이름 입니다. 2~20자의 한글/영문만 가능합니다."
    )
    private String username;

    @NotBlank(message = "비밀번호 입력은 필수입니다.")
    @Pattern(
            // 8~20자, 영문자·숫자·특수문자 최소 각 1회 포함
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}:\";'<>?,./]).{8,20}$",
            message = "비밀번호는 8~20자이며, 영문, 숫자, 특수문자를 포함해야 합니다."
    )
    private String password;

    @NotBlank(message = "이메일 입력은 필수 입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;
}
