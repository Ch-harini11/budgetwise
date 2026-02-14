package com.example.backend.controller;

import com.example.backend.model.Expense;
import com.example.backend.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/expenses")
@CrossOrigin(origins="*")
public class ExpenseController {

    private final ExpenseRepository repo;

    public ExpenseController(ExpenseRepository repo){
        this.repo = repo;
    }

    // SAVE expense
    @PostMapping
    public Expense saveExpense(@RequestBody Expense e){
        return repo.save(e);
    }

    // GET expenses by user
    @GetMapping("/{userId}")
    public List<Expense> getByUser(@PathVariable String userId){
        return repo.findByUserId(userId);
    }

    // DELETE expense
    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable String id){
        repo.deleteById(id);
    }

    // UPDATE expense
    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable String id,
                                 @RequestBody Expense exp){
        exp.setId(id);
        return repo.save(exp);
    }
}
