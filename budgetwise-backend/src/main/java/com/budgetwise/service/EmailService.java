package com.budgetwise.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String name, String token) {
        String verifyLink = frontendUrl + "/verify.html?token=" + token;
        String subject = "✅ Verify Your BudgetWise Account";
        String body = buildVerificationEmailBody(name, verifyLink);
        sendHtmlEmail(toEmail, subject, body);
    }

    public void sendPasswordResetOtpEmail(String toEmail, String name, String otp) {
        String subject = "🔐 Your Password Reset OTP";
        String body = buildResetOtpEmailBody(name, otp);
        sendHtmlEmail(toEmail, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        System.out.println("\n================ EMAIL INTERCEPTED ================");
        System.out.println("TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY SIZE: " + htmlBody.length() + " chars.");
        System.out.println("===================================================\n");
        // We log the text so the user can see the OTP in development
        if (subject.contains("OTP")) {
             System.out.println("--> TIP: Your OTP is usually contained in the email body above if you're developing locally.");
             System.out.println("--> Complete HTML Body:\n" + htmlBody);
        }



        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail != null ? fromEmail : "chharini2004@gmail.com", "BudgetWise");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (org.springframework.mail.MailAuthenticationException e) {
            System.err.println("SMTP Authentication Failed. Please check MAIL_USER and MAIL_PASS in application.properties.");
            System.err.println("The OTP/Link was printed to the console above.");
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    private String buildVerificationEmailBody(String name, String verifyLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#0f172a;font-family:Inter,sans-serif;">
              <div style="max-width:560px;margin:40px auto;background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:16px;overflow:hidden;border:1px solid #334155;">
                <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
                  <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">💰 BudgetWise</h1>
                  <p style="color:#c4b5fd;margin:8px 0 0;font-size:14px;">AI-Driven Expense Tracker</p>
                </div>
                <div style="padding:40px 32px;">
                  <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 12px;">Welcome, %s! 👋</h2>
                  <p style="color:#94a3b8;line-height:1.6;margin:0 0 28px;">
                    Thanks for signing up to BudgetWise. Please verify your email address to activate your account and start tracking your finances smarter.
                  </p>
                  <div style="text-align:center;margin:28px 0;">
                    <a href="%s" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
                      ✅ Verify Email Address
                    </a>
                  </div>
                  <p style="color:#64748b;font-size:13px;text-align:center;margin:24px 0 0;">
                    Link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
                  </p>
                </div>
                <div style="background:#0f172a;padding:20px;text-align:center;border-top:1px solid #1e293b;">
                  <p style="color:#475569;font-size:12px;margin:0;">© 2024 BudgetWise. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(name, verifyLink);
    }

    private String buildResetOtpEmailBody(String name, String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#0f172a;font-family:Inter,sans-serif;">
              <div style="max-width:560px;margin:40px auto;background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:16px;overflow:hidden;border:1px solid #334155;">
                <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px;text-align:center;">
                  <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">💰 BudgetWise</h1>
                  <p style="color:#fca5a5;margin:8px 0 0;font-size:14px;">Password Reset OTP</p>
                </div>
                <div style="padding:40px 32px;">
                  <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 12px;">Reset Your Password, %s</h2>
                  <p style="color:#94a3b8;line-height:1.6;margin:0 0 28px;">
                    We received a request to reset your BudgetWise password. Use the following 6-digit OTP to verify your request. This OTP is valid for <strong style="color:#f1f5f9;">15 minutes</strong>.
                  </p>
                  <div style="text-align:center;margin:28px 0;background:rgba(255,255,255,0.05);padding:24px;border-radius:12px;border:1px dashed #475569;">
                    <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#f8fafc;">%s</span>
                  </div>
                  <p style="color:#64748b;font-size:13px;text-align:center;margin:24px 0 0;">
                    If you didn't request a password reset, please ignore this email. Your password will not be changed without this OTP.
                  </p>
                </div>
                <div style="background:#0f172a;padding:20px;text-align:center;border-top:1px solid #1e293b;">
                  <p style="color:#475569;font-size:12px;margin:0;">© 2024 BudgetWise. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(name, otp);
    }
}
