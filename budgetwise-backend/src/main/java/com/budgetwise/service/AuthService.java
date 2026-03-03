package com.budgetwise.service;

import com.budgetwise.dto.*;
import com.budgetwise.model.User;
import com.budgetwise.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered. Please log in.");
        }
        String verificationToken = UUID.randomUUID().toString();
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setVerified(false);
        user.setVerificationToken(verificationToken);
        userRepository.save(user);
        emailService.sendVerificationEmail(request.getEmail(), request.getName(), verificationToken);
        return new AuthResponse("Verification email sent. Please check your inbox.");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));
        if (!user.isVerified()) {
            throw new RuntimeException("Email not verified. Please check your inbox.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName(), "Login successful.");
    }

    public AuthResponse verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token."));
        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        return new AuthResponse("Email verified successfully! You can now log in.");
    }

    public AuthResponse forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email."));
        
        // Generate a 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        
        user.setResetToken(otp);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15)); // OTP valid for 15 mins
        userRepository.save(user);
        
        emailService.sendPasswordResetOtpEmail(email, user.getName(), otp);
        return new AuthResponse("OTP sent to your email. Check your inbox.");
    }

    public AuthResponse resetPassword(String otp, String newPassword) {
        User user = userRepository.findByResetToken(otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP."));
        if (user.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        return new AuthResponse("Password reset successful. You can now log in.");
    }
}
