package com.example.intercation.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateChannelRequest {

    private String channelName;

    private String topic;

    private String description;
}
