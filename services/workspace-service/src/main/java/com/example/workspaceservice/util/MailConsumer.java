package com.example.workspaceservice.util;

import com.example.workspaceservice.dto.response.MailEventDto;
import com.example.workspaceservice.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MailConsumer {

    private final MailService mailService;

    @KafkaListener(topics = "send-invitation-mail", groupId = "mail-group-v2")
    public void handleMailEvent(MailEventDto mailEvent) {
        log.info("메일 발송 요청 수신: {}", mailEvent.getToEmail());
/*

        // 테스트를 위해 의도적으로 에러 발생
        if (true) {
            log.error("메일 서버 접속 강제 실패!");
            throw new RuntimeException("메일 서버 접속 실패!");
        }
*/

        // 실제 메일 발송 로직
        mailService.sendHtmlInvitationMail(
                mailEvent.getToEmail(),
                mailEvent.getInviterNickname(),
                mailEvent.getWorkspaceName(),
                mailEvent.getInviteLink()
        );
    }

}