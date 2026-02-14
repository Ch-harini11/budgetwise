package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    class OtpData {
        String otp;
        long expiry;
    }

    private Map<String, OtpData> otpStorage = new HashMap<>();

    // Generate OTP
    public void generateOtp(String email){
        String otp = String.valueOf(new Random().nextInt(900000)+100000);

        OtpData data = new OtpData();
        data.otp = otp;
        data.expiry = System.currentTimeMillis() + 5*60*1000;

        otpStorage.put(email, data);

        sendEmail(email, otp);
    }

    // Send Email
    private void sendEmail(String to, String otp){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your OTP Code");
        message.setText("Your OTP is: " + otp + "\nValid for 5 minutes.");

        mailSender.send(message);
    }

    // Validate OTP
    public boolean validateOtp(String email,String otp){
        OtpData data = otpStorage.get(email);

        if(data == null) return false;

        if(System.currentTimeMillis() > data.expiry){
            otpStorage.remove(email);
            return false;
        }

        return data.otp.equals(otp);
    }

    // 🔥 ADD THIS
    public void clearOtp(String email){
        otpStorage.remove(email);
    }
}
