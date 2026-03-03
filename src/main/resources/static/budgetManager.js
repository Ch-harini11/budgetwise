/* ===============================
   🌍 GLOBAL BUDGET MANAGER
   One source of truth for BudgetWise
================================= */

const BudgetManager = {

  /* ---------- SETTINGS ---------- */

  saveSettings({ monthlyIncome, currency }) {
    const settings = {
      monthlyIncome: Number(monthlyIncome) || 0,
      currency: currency || "INR (₹)"
    };

    localStorage.setItem(
      "budgetSettings",
      JSON.stringify(settings)
    );
  },

  getSettings() {
    return JSON.parse(
      localStorage.getItem("budgetSettings")
    ) || { monthlyIncome: 0, currency: "INR (₹)" };
  },

  getMonthlyIncome() {
    return this.getSettings().monthlyIncome || 0;
  },

  getCurrency() {
    return this.getSettings().currency || "INR (₹)";
  },

  /* ---------- EXPENSES ---------- */

  getExpenses() {
    return JSON.parse(
      localStorage.getItem("expenses")
    ) || [];
  },

  saveExpenses(expenses) {
    localStorage.setItem(
      "expenses",
      JSON.stringify(expenses)
    );
  },

  addExpense(exp) {
    const list = this.getExpenses();
    list.push(exp);
    this.saveExpenses(list);
  },

  /* ---------- CALCULATIONS ---------- */

  getMonthlySpent() {
    const expenses = this.getExpenses();
    const now = new Date();

    return expenses.reduce((sum, e) => {
      const d = new Date(e.date);
      if (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      ) {
        return sum + Number(e.amount);
      }
      return sum;
    }, 0);
  },

  getYearlySpent() {
    const expenses = this.getExpenses();
    const now = new Date();

    return expenses.reduce((sum, e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === now.getFullYear()) {
        return sum + Number(e.amount);
      }
      return sum;
    }, 0);
  },

  getRemaining() {
    return this.getMonthlyIncome() - this.getMonthlySpent();
  },

  /* ---------- UI HELPERS ---------- */

  updateDashboardUI() {
    const income = this.getMonthlyIncome();
    const monthly = this.getMonthlySpent();
    const yearly = this.getYearlySpent();
    const remaining = this.getRemaining();

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    set("monthlyTotal", `Monthly: ₹${monthly}`);
    set("yearlyTotal", `Yearly: ₹${yearly}`);
    set("remainingTotal", `Remaining: ₹${remaining}`);
  },

  updateBudgetRing(progressId, percentId) {
    const income = this.getMonthlyIncome();
    const spent = this.getMonthlySpent();

    if (!income) return;

    const percent = Math.min(
      Math.round((spent / income) * 100),
      100
    );

    const circle = document.getElementById(progressId);
    const text = document.getElementById(percentId);

    if (!circle || !text) return;

    const offset = 251 - (251 * percent) / 100;

    circle.style.strokeDashoffset = offset;
    text.innerText = percent + "%";
  }
};


/* ---------- AUTO SYNC BETWEEN TABS ---------- */

window.addEventListener("storage", () => {
  location.reload();
});