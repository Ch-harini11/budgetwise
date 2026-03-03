package com.budgetwise.repository;

import com.budgetwise.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByUserIdOrderByDateDesc(String userId);
    List<Expense> findByUserIdAndDateBetweenOrderByDateDesc(String userId, LocalDate start, LocalDate end);
    List<Expense> findByUserIdAndCategory(String userId, String category);
    List<Expense> findByUserIdAndDateBetween(String userId, LocalDate start, LocalDate end);
}
