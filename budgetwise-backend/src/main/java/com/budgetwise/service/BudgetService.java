package com.budgetwise.service;

import com.budgetwise.dto.BudgetRequest;
import com.budgetwise.model.Budget;
import com.budgetwise.repository.BudgetRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public Budget setBudget(String userId, BudgetRequest request) {
        Optional<Budget> existing = budgetRepository.findByUserIdAndMonthAndYear(
                userId, request.getMonth(), request.getYear());
        Budget budget = existing.orElseGet(Budget::new);
        budget.setUserId(userId);
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setTotalBudget(request.getTotalBudget());
        budget.setCategoryBudgets(request.getCategoryBudgets());
        budget.setUpdatedAt(LocalDateTime.now());
        if (budget.getCreatedAt() == null) {
            budget.setCreatedAt(LocalDateTime.now());
        }
        return budgetRepository.save(budget);
    }

    public Optional<Budget> getBudget(String userId, int month, int year) {
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
    }

    public List<Budget> getAllBudgets(String userId) {
        return budgetRepository.findByUserIdOrderByYearDescMonthDesc(userId);
    }
}
