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
