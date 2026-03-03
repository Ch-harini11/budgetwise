package com.budgetwise.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "budgets")
public class Budget {

    @Id
    private String id;

    private String userId;

    private int month;   // 1-12

    private int year;

    private double totalBudget;

    // Category name -> budget amount
    private Map<String, Double> categoryBudgets;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}
