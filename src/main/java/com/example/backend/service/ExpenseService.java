package com.example.backend.service;

import com.example.backend.model.Expense;
import com.example.backend.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository repo;

    public ExpenseService(ExpenseRepository repo) {
        this.repo = repo;
    }

    public Expense saveExpense(Expense expense) {
        return repo.save(expense);
    }

    public List<Expense> getUserExpenses(String userId) {
        return repo.findByUserId(userId);
    }

    public void deleteExpense(String id) {
        repo.deleteById(id);
    }
}
