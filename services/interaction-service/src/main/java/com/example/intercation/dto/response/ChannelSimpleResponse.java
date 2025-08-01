package com.example.intercation.dto.response;

import com.example.intercation.entity.Channel;
import jakarta.persistence.Column;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class ChannelSimpleResponse {

    private Long id;
    private String channelName; // 채널이름


    public static ChannelSimpleResponse toResponse(Channel channel) {
        return ChannelSimpleResponse.builder()
                .id(channel.getId())
                .channelName(channel.getChannelName())
                .build();
    }

}
