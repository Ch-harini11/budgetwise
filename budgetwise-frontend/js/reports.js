// reports.js
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PALETTE = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#a855f7'];

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    populateUser();
    initSidebar();
    document.getElementById('reportYear').value = new Date().getFullYear();
    loadReports();
});

async function loadReports() {
    const year = parseInt(document.getElementById('reportYear').value) || new Date().getFullYear();
    const now = new Date();
    const curMonth = now.getMonth() + 1;

    // Fetch all 12 months in parallel
    const promises = Array.from({ length: 12 }, (_, i) =>
        api.getExpenseSummary(i + 1, year).catch(() => ({}))
    );
    const results = await Promise.all(promises);
    const monthlyTotals = results.map(r => Object.values(r).reduce((a, b) => a + b, 0));

    // Monthly trend — Line
    renderLine(monthlyTotals);

    // Current month category pie
    const curSummary = results[curMonth - 1] || {};
    renderPie(curSummary);

    // Budget vs Actual — current month
    try {
        const budget = await api.getBudget(curMonth, year);
        renderBudgetCompare(curSummary, budget);
    } catch {
        renderBudgetCompare(curSummary, null);
    }

    // Monthly summary table
    renderMonthlyTable(results, year);
}

function getChartDefaults() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
        gridColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
        tickColor: '#64748b',
    };
}

function renderLine(totals) {
    const ctx = document.getElementById('monthlyTrendChart');
    if (window._trendChart) window._trendChart.destroy();
    const { gridColor, tickColor } = getChartDefaults();
    window._trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: MONTHS,
            datasets: [{
                label: 'Monthly Spending (₹)',
                data: totals,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointRadius: 5,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: tickColor }, grid: { color: gridColor } },
                y: { ticks: { color: tickColor, callback: v => '₹' + v.toLocaleString('en-IN') }, grid: { color: gridColor } }
            }
        }
    });
}

function renderPie(summary) {
    const ctx = document.getElementById('categoryPieChart');
    if (window._pieChart) window._pieChart.destroy();
    if (!Object.keys(summary).length) {
        ctx.parentElement.innerHTML += `<div class="empty-state" style="padding:20px;"><div class="empty-icon">🥧</div><p>No data this month</p></div>`;
        return;
    }
    window._pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(summary),
            datasets: [{ data: Object.values(summary), backgroundColor: PALETTE, borderWidth: 0 }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 12 } },
                tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` } }
            }
        }
    });
}

function renderBudgetCompare(summary, budget) {
    const ctx = document.getElementById('budgetCompareChart');
    if (window._compareChart) window._compareChart.destroy();
    if (!budget || !budget.categoryBudgets) {
        ctx.parentElement.innerHTML += `<div class="empty-state" style="padding:20px;"><div class="empty-icon">💼</div><p>Set a budget to compare</p></div>`;
        return;
    }
    const cats = Object.keys(budget.categoryBudgets);
    const budgeted = cats.map(c => budget.categoryBudgets[c]);
    const spent = cats.map(c => summary[c] || 0);
    const { gridColor, tickColor } = getChartDefaults();
    window._compareChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cats,
            datasets: [
                { label: 'Budget', data: budgeted, backgroundColor: 'rgba(99,102,241,0.5)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 4 },
                { label: 'Spent', data: spent, backgroundColor: 'rgba(239,68,68,0.5)', borderColor: '#ef4444', borderWidth: 1, borderRadius: 4 },
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                x: { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor } },
                y: { ticks: { color: tickColor, callback: v => '₹' + v }, grid: { color: gridColor } }
            }
        }
    });
}

function renderMonthlyTable(results, year) {
    const tbody = document.getElementById('monthlyBody');
    tbody.innerHTML = results.map((summary, i) => {
        const total = Object.values(summary).reduce((a, b) => a + b, 0);
        const txns = '—'; // no count in this endpoint
        const topCat = Object.entries(summary).sort((a, b) => b[1] - a[1])[0];
        return `<tr>
      <td>${MONTHS[i]} ${year}</td>
      <td>—</td>
      <td>${total > 0 ? formatCurrency(total) : '<span style="color:var(--text-muted)">₹0.00</span>'}</td>
      <td>${topCat ? `${getCategoryIcon(topCat[0])} ${topCat[0]}` : '<span style="color:var(--text-muted)">—</span>'}</td>
    </tr>`;
    }).join('');
}

window.loadReports = loadReports;
