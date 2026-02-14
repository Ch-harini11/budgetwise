package com.example.backend.model;

import org.springframework.data.annotation.Id;

public class Profile {

    @Id
    private String id;

    private String userId;
    private double primaryIncome;
    private double additionalIncome;
    private double goal;

    // getters & setters
}
