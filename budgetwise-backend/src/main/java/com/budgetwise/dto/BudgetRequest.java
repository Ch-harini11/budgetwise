package com.budgetwise.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.Map;

@Data
public class BudgetRequest {
    @NotNull
    private Integer month;

    @NotNull
    private Integer year;

    @Positive(message = "Total budget must be positive")
    private double totalBudget;

    private Map<String, Double> categoryBudgets;
}
