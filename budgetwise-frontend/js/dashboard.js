// dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    populateUser();
    initSidebar();
    setGreeting();

    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [expenses, summary, budgetRes] = await Promise.allSettled([
            api.getExpenses(),
            api.getExpenseSummary(month, year),
            api.getBudget(month, year),
        ]);

        const allExpenses = expenses.status === 'fulfilled' ? expenses.value : [];
        const catSummary = summary.status === 'fulfilled' ? summary.value : {};
        const budget = budgetRes.status === 'fulfilled' ? budgetRes.value : null;

        // KPIs
        const totalSpent = Object.values(catSummary).reduce((a, b) => a + b, 0);
        document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
        document.getElementById('txnCount').textContent = allExpenses.length;

        const topCat = Object.entries(catSummary).sort((a, b) => b[1] - a[1])[0];
        document.getElementById('topCategory').textContent = topCat ? `${getCategoryIcon(topCat[0])} ${topCat[0]}` : '—';

        if (budget && budget.totalBudget) {
            const left = budget.totalBudget - totalSpent;
            document.getElementById('budgetLeft').textContent = formatCurrency(Math.max(left, 0));
        }

        // Category chart (Doughnut)
        if (Object.keys(catSummary).length > 0) {
            const palette = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
            new Chart(document.getElementById('categoryChart'), {
                type: 'doughnut',
                data: {
                    labels: Object.keys(catSummary),
                    datasets: [{ data: Object.values(catSummary), backgroundColor: palette, borderWidth: 2, borderColor: 'transparent' }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 12 } } },
                        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` } }
                    }
                }
            });
        }

        // Daily spending chart (Line)
        buildDailyChart(allExpenses, month, year);

        // Recent 5
        renderRecentTable(allExpenses.slice(0, 5));

    } catch (err) {
        showToast('Error', err.message, 'error');
    }
});

function setGreeting() {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const user = api.getUser();
    document.getElementById('greetingText').textContent = `${greet}, ${user?.name?.split(' ')[0] || ''} 👋`;
}

function buildDailyChart(expenses, month, year) {
    const days = new Date(year, month, 0).getDate();
    const daily = Array(days).fill(0);
    expenses.forEach(e => {
        const d = new Date(e.date);
        if (d.getMonth() + 1 === month && d.getFullYear() === year) {
            daily[d.getDate() - 1] += e.amount;
        }
    });
    const labels = Array.from({ length: days }, (_, i) => i + 1);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    new Chart(document.getElementById('dailyChart'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Spent (₹)',
                data: daily,
                backgroundColor: 'rgba(99,102,241,0.5)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: gridColor } },
                y: { ticks: { color: '#64748b', font: { size: 11 }, callback: v => '₹' + v }, grid: { color: gridColor } }
            }
        }
    });
}

function renderRecentTable(expenses) {
    const tbody = document.getElementById('recentBody');
    if (!expenses.length) return;
    tbody.innerHTML = expenses.map(e => `
    <tr>
      <td>${formatDate(e.date)}</td>
      <td>${getCategoryIcon(e.category)} ${e.category}</td>
      <td>${e.description || '—'}</td>
      <td style="color:var(--danger);font-weight:600;">${formatCurrency(e.amount)}</td>
    </tr>
  `).join('');
}
