package com.budgetwise.controller;

import com.budgetwise.dto.BudgetRequest;
import com.budgetwise.model.Budget;
import com.budgetwise.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<Budget> setBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.setBudget(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<?> getBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int month,
            @RequestParam int year) {
        return budgetService.getBudget(userDetails.getUsername(), month, year)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(Map.of("message", "No budget set for this month.")));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Budget>> getAllBudgets(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(budgetService.getAllBudgets(userDetails.getUsername()));
    }
}
