package com.example.intercation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateChannelRequest {

    @NotBlank(message = "채널 이름은 비워둘수 없습니다.")
    private String channelName;

}
