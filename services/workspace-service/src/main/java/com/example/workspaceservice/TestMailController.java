package com.example.workspaceservice;

import com.example.workspaceservice.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestMailController {

    @Autowired
    private  MailService mailService;

    @GetMapping("/test-mail")
    public String testMail() {
        mailService.sendHtmlInvitationMail(
                "hyoung88ha@gmail.com", "테스터", "테스트 워크스페이스", "https://example.com"
        );
        return "메일 전송 시도됨";
    }
}