package com.budgetwise.service;

import com.budgetwise.dto.ExpenseRequest;
import com.budgetwise.model.Expense;
import com.budgetwise.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Expense addExpense(String userId, ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setDate(request.getDate());
        expense.setTags(request.getTags());
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses(String userId) {
        return expenseRepository.findByUserIdOrderByDateDesc(userId);
    }

    public List<Expense> getExpensesByDateRange(String userId, LocalDate start, LocalDate end) {
        return expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, start, end);
    }

    public Expense updateExpense(String userId, String expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found."));
        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized.");
        }
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setDate(request.getDate());
        expense.setTags(request.getTags());
        expense.setUpdatedAt(LocalDateTime.now());
        return expenseRepository.save(expense);
    }

    public void deleteExpense(String userId, String expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found."));
        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized.");
        }
        expenseRepository.delete(expense);
    }

    public Map<String, Double> getExpenseSummaryByCategory(String userId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, start, end);
        return expenses.stream()
                .collect(Collectors.groupingBy(Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)));
    }

    public double getTotalSpentThisMonth(String userId) {
        LocalDate now = LocalDate.now();
        LocalDate start = now.withDayOfMonth(1);
        LocalDate end = now.withDayOfMonth(now.lengthOfMonth());
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, start, end);
        return expenses.stream().mapToDouble(Expense::getAmount).sum();
    }
}
