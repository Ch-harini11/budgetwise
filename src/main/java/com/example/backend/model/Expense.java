package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "expenses")
public class Expense {

    @Id
    private String id;

    private String userId; // link to logged-in user
    private double amount;
    private String category;
    private LocalDate date;
    private String type; // past/present/future

    public Expense() {}

    public Expense(String userId, double amount, String category, LocalDate date, String type) {
        this.userId = userId;
        this.amount = amount;
        this.category = category;
        this.date = date;
        this.type = type;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
