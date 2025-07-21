package com.example.workspaceservice.service;


import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;
    @Async
    public void sendHtmlInvitationMail(String to, String inviter, String workspaceName, String inviteLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("[초대] " + inviter + "님이 " + workspaceName + "에 초대했어요!");
            helper.setText(buildHtmlContent(inviter, workspaceName, inviteLink), true); // true: HTML

            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("메일 전송 실패", e);
        }
    }

    private String buildHtmlContent(String inviter, String workspaceName, String inviteLink) {
        return """
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
                    <div style="background: #9C5EFF; padding: 20px; color: white; text-align: center;">
                        <h2 style="margin: 0;">워크스페이스 초대</h2>
                    </div>
                    <div style="padding: 30px; text-align: center;">
                        <p style="font-size: 16px;">
                            <strong>%s</strong>님이 당신을 <strong>%s</strong> 워크스페이스에 초대했어요!
                        </p>
                        <a href="%s" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #9C5EFF; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            초대 수락하기
                        </a>
                        <p style="margin-top: 30px; font-size: 13px; color: #888;">
                            이 메일은 자동 발송되었으며, 직접 회신하지 마세요.
                        </p>
                    </div>
                </div>
            </div>
        """.formatted(inviter, workspaceName, inviteLink);
    }
}

