package com.budgetwise.service;

import com.budgetwise.model.Budget;
import com.budgetwise.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class AIAdvisorService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseService expenseService;
    private final BudgetService budgetService;

    public AIAdvisorService(ExpenseRepository expenseRepository,
                            ExpenseService expenseService,
                            BudgetService budgetService) {
        this.expenseRepository = expenseRepository;
        this.expenseService = expenseService;
        this.budgetService = budgetService;
    }

    public List<Map<String, String>> getAdvice(String userId) {
        List<Map<String, String>> tips = new ArrayList<>();
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        Map<String, Double> categorySpend = expenseService.getExpenseSummaryByCategory(userId, month, year);
        double totalSpent = expenseService.getTotalSpentThisMonth(userId);
        Optional<Budget> budgetOpt = budgetService.getBudget(userId, month, year);

        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            double totalBudget = budget.getTotalBudget();
            double usagePercent = (totalSpent / totalBudget) * 100;

            if (usagePercent > 90) {
                addTip(tips, "🚨 Critical Budget Alert",
                        "You've used " + String.format("%.1f", usagePercent) + "% of your monthly budget. Consider pausing non-essential spending immediately.",
                        "HIGH");
            } else if (usagePercent > 70) {
                addTip(tips, "⚠️ Budget Warning",
                        "You've spent " + String.format("%.1f", usagePercent) + "% of your budget with more days ahead. Consider reviewing discretionary categories.",
                        "MEDIUM");
            } else {
                addTip(tips, "✅ Budget On Track",
                        "Great job! You've only used " + String.format("%.1f", usagePercent) + "% of your monthly budget. Keep it up!",
                        "LOW");
            }

            // Category-level analysis
            if (budget.getCategoryBudgets() != null) {
                budget.getCategoryBudgets().forEach((cat, catBudget) -> {
                    double spent = categorySpend.getOrDefault(cat, 0.0);
                    if (spent > catBudget) {
                        addTip(tips, "📊 Overspent in " + cat,
                                "You exceeded your " + cat + " budget by ₹" + String.format("%.2f", spent - catBudget) + ". Consider reallocating from another category.",
                                "HIGH");
                    }
                });
            }
        } else {
            addTip(tips, "📋 Set Your Budget",
                    "You haven't set a budget for this month yet. Setting a budget helps you stay on track and build savings.",
                    "MEDIUM");
        }

        // Spending pattern tips
        if (!categorySpend.isEmpty()) {
            String topCategory = categorySpend.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey).orElse("Unknown");
            double topAmount = categorySpend.getOrDefault(topCategory, 0.0);
            addTip(tips, "🏆 Top Spending Category",
                    "Your highest spending category this month is " + topCategory + " at ₹" + String.format("%.2f", topAmount) + ". Consider reviewing if this aligns with your priorities.",
                    "LOW");

            // Food tip
            double foodSpend = categorySpend.getOrDefault("Food", 0.0) + categorySpend.getOrDefault("Dining", 0.0);
            if (foodSpend > 5000) {
                addTip(tips, "🍽️ Food Spending Tip",
                        "You're spending ₹" + String.format("%.2f", foodSpend) + " on food this month. Cooking at home more often could save you up to 40%.",
                        "MEDIUM");
            }

            // Entertainment tip
            double entSpend = categorySpend.getOrDefault("Entertainment", 0.0);
            if (entSpend > 3000) {
                addTip(tips, "🎬 Entertainment Optimization",
                        "Consider reviewing your entertainment subscriptions. Sharing or cancelling unused services could save you ₹500–₹1500/month.",
                        "LOW");
            }
        }

        // Savings tip
        if (totalSpent < 10000) {
            addTip(tips, "💰 Great Savings Potential",
                    "Your spending is low this month. Consider investing the surplus in a SIP or high-yield savings account.",
                    "LOW");
        }

        addTip(tips, "📈 Track Your Progress",
                "Regular expense tracking increases savings by an average of 20%. Keep logging every transaction for best results!",
                "LOW");

        return tips;
    }

    private void addTip(List<Map<String, String>> tips, String title, String message, String priority) {
        Map<String, String> tip = new LinkedHashMap<>();
        tip.put("title", title);
        tip.put("message", message);
        tip.put("priority", priority);
        tips.add(tip);
    }
}
