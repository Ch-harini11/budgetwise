package com.example.backend.controller;

import com.example.backend.service.OtpService;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

@PostMapping("/reset-password")
public String reset(@RequestBody Map<String,String> data){

    String email = data.get("email");
    String otp = data.get("otp");
    String newPassword = data.get("password");

    if(email == null || otp == null || newPassword == null){
        return "MISSING_FIELDS";
    }

    if(!otpService.validateOtp(email, otp)){
    return "INVALID_OTP";
}


    Optional<User> optionalUser = userRepository.findByEmail(email);

    if(optionalUser.isEmpty()){
        return "USER_NOT_FOUND";
    }

    User user = optionalUser.get();
    user.setPassword(newPassword);
    userRepository.save(user);

    return "SUCCESS";
}


    // ================= SEND OTP =================
    @PostMapping("/send-otp")
    public String sendOtp(@RequestBody Map<String,String> req){

        String email = req.get("email");

        otpService.generateOtp(email);

        return "OTP_SENT";
    }


    // ================= VERIFY OTP + SIGNUP =================
    @PostMapping("/verify-signup")
    public String verifySignup(@RequestBody Map<String,String> req){

        String email=req.get("email");
        String otp=req.get("otp");

        if(!otpService.validateOtp(email,otp))
            return "INVALID_OTP";

        User user = new User();
        user.setName(req.get("name"));
        user.setEmail(email);
        user.setPassword(req.get("password"));

        userRepository.save(user);

        otpService.clearOtp(email);

        return "SUCCESS";
    }


    


    // ================= LOGIN =================
    @PostMapping("/login")
   public Map<String,String> login(@RequestBody User loginUser){

    Optional<User> user =
        userRepository.findByEmail(loginUser.getEmail());

    if(user.isPresent() &&user.get().getPassword().equals(loginUser.getPassword())){

        return Map.of(
            "status","SUCCESS",
            "userId", user.get().getId()
        );
    }

    return Map.of("status","INVALID");
  }


}
