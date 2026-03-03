package com.budgetwise.repository;

import com.budgetwise.model.Budget;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends MongoRepository<Budget, String> {
    Optional<Budget> findByUserIdAndMonthAndYear(String userId, int month, int year);
    List<Budget> findByUserIdOrderByYearDescMonthDesc(String userId);
}
