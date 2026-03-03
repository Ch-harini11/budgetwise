package com.budgetwise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private String message;

    public AuthResponse(String message) {
        this.message = message;
    }
}
