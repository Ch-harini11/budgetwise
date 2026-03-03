package com.budgetwise.controller;

import com.budgetwise.dto.ExpenseRequest;
import com.budgetwise.model.Expense;
import com.budgetwise.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<Expense> addExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.addExpense(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String userId = userDetails.getUsername();
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(expenseService.getExpensesByDateRange(userId, startDate, endDate));
        }
        return ResponseEntity.ok(expenseService.getAllExpenses(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(userDetails.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        expenseService.deleteExpense(userDetails.getUsername(), id);
        return ResponseEntity.ok(Map.of("message", "Expense deleted successfully."));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Double>> getMonthlySummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(expenseService.getExpenseSummaryByCategory(userDetails.getUsername(), month, year));
    }
}
