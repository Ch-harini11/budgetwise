
package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document("budgets")


public class Budget {


  @Id
  private String id;

  private String userId;

  private double primaryIncome;
  private double additionalIncome;
  private double totalIncome;

  private double monthlyGoal;

  private LocalDateTime updatedAt = LocalDateTime.now();
}
