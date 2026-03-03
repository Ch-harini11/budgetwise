// budget.js
const CATEGORIES = ['Food', 'Dining', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Utilities', 'Rent', 'Travel', 'Fitness', 'Other'];
let budgetChart = null;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    populateUser();
    initSidebar();
    const now = new Date();
    document.getElementById('budgetMonth').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    renderCategoryFields();
    loadBudget();
});

function renderCategoryFields() {
    const container = document.getElementById('categoryBudgets');
    container.innerHTML = CATEGORIES.map(cat => `
    <div class="flex items-center gap-2" style="margin-bottom:10px;">
      <label style="width:140px;font-size:13px;color:var(--text-secondary);">${getCategoryIcon(cat)} ${cat}</label>
      <input type="number" id="cat_${cat}" class="form-input" style="flex:1;" placeholder="0" min="0"/>
    </div>
  `).join('');
}

async function loadBudget() {
    const monthStr = document.getElementById('budgetMonth').value;
    if (!monthStr) return;
    const [y, m] = monthStr.split('-');
    try {
        const [budgetRes, summaryRes] = await Promise.allSettled([
            api.getBudget(parseInt(m), parseInt(y)),
            api.getExpenseSummary(parseInt(m), parseInt(y)),
        ]);
        const budget = budgetRes.status === 'fulfilled' ? budgetRes.value : null;
        const summary = summaryRes.status === 'fulfilled' ? summaryRes.value : {};
        renderBudgetContent(budget, summary, parseInt(m), parseInt(y));
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

function renderBudgetContent(budget, summary, month, year) {
    const el = document.getElementById('budgetContent');
    if (!budget || !budget.totalBudget) {
        el.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><h3>No budget set</h3><p>Click "Set Budget" to define your spending limits.</p></div>`;
        return;
    }
    const totalSpent = Object.values(summary).reduce((a, b) => a + b, 0);
    const pct = Math.min((totalSpent / budget.totalBudget) * 100, 100);
    const barClass = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'success';

    let categoryHtml = '';
    if (budget.categoryBudgets) {
        categoryHtml = Object.entries(budget.categoryBudgets).map(([cat, budgeted]) => {
            const spent = summary[cat] || 0;
            const cp = Math.min((spent / budgeted) * 100, 100);
            const cClass = cp >= 100 ? 'danger' : cp >= 75 ? 'warning' : 'success';
            return `
        <div class="budget-item">
          <div class="budget-item-header">
            <div class="budget-category">${getCategoryIcon(cat)} ${cat}</div>
            <div class="budget-amounts">${formatCurrency(spent)} / <span>${formatCurrency(budgeted)}</span></div>
          </div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill ${cClass}" style="width:${cp}%"></div></div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:6px;">${cp.toFixed(1)}% used${cp >= 100 ? ' — <span style="color:var(--danger)">Over budget!</span>' : ''}</div>
        </div>`;
        }).join('');
    }

    el.innerHTML = `
    <div class="card" style="padding:28px;margin-bottom:20px;">
      <h3 style="font-size:20px;margin-bottom:6px;">Monthly Budget Overview</h3>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:24px;">${new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
      <div class="flex justify-between items-center" style="margin-bottom:10px;">
        <span style="font-size:14px;color:var(--text-secondary);">Total Budget</span>
        <span style="font-size:24px;font-weight:800;">${formatCurrency(budget.totalBudget)}</span>
      </div>
      <div class="progress-bar-wrap" style="height:12px;margin-bottom:12px;">
        <div class="progress-bar-fill ${barClass}" style="width:${pct}%"></div>
      </div>
      <div class="flex justify-between" style="font-size:13px;color:var(--text-secondary);">
        <span>Spent: <strong style="color:var(--text-primary)">${formatCurrency(totalSpent)}</strong></span>
        <span>Left: <strong style="color:var(--success)">${formatCurrency(Math.max(budget.totalBudget - totalSpent, 0))}</strong></span>
      </div>
    </div>
    ${categoryHtml ? `<div class="budget-list">${categoryHtml}</div>` : ''}
  `;
}

function openBudgetModal() {
    // Prefill from existing budget
    const monthStr = document.getElementById('budgetMonth').value;
    if (monthStr) {
        const [y, m] = monthStr.split('-');
        api.getBudget(parseInt(m), parseInt(y)).then(b => {
            if (b && b.totalBudget) {
                document.getElementById('totalBudget').value = b.totalBudget;
                if (b.categoryBudgets) {
                    Object.entries(b.categoryBudgets).forEach(([cat, val]) => {
                        const input = document.getElementById(`cat_${cat}`);
                        if (input) input.value = val;
                    });
                }
            }
        }).catch(() => { });
    }
    document.getElementById('budgetModal').classList.remove('hidden');
}

function closeBudgetModal() {
    document.getElementById('budgetModal').classList.add('hidden');
}

async function saveBudget(e) {
    e.preventDefault();
    const btn = document.getElementById('budgetSaveBtn');
    setLoading(btn, true);
    const monthStr = document.getElementById('budgetMonth').value;
    const [y, m] = monthStr.split('-');
    const categoryBudgets = {};
    CATEGORIES.forEach(cat => {
        const val = parseFloat(document.getElementById(`cat_${cat}`)?.value || 0);
        if (val > 0) categoryBudgets[cat] = val;
    });
    try {
        await api.setBudget({
            month: parseInt(m), year: parseInt(y),
            totalBudget: parseFloat(document.getElementById('totalBudget').value),
            categoryBudgets,
        });
        showToast('Saved', 'Budget saved successfully!', 'success');
        closeBudgetModal();
        loadBudget();
    } catch (err) {
        showToast('Error', err.message, 'error');
    } finally {
        setLoading(btn, false);
    }
}

window.openBudgetModal = openBudgetModal;
window.closeBudgetModal = closeBudgetModal;
window.loadBudget = loadBudget;
