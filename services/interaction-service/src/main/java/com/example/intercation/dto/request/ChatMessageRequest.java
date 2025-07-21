package com.example.intercation.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {

    private Long senderId;    // 메세지 보낸사람 id
    private String senderNickname; // 메세지 보낸사람 닉넨임
    private String sendAt;  // 보낸시간
    private String content; // 보낸 내용

}
