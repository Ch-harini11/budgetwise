// expenses.js
let editingId = null;
let allExpenses = [];

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    populateUser();
    initSidebar();
    // Set current month as default filter
    const now = new Date();
    document.getElementById('filterMonth').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('expenseForm').addEventListener('submit', saveExpense);
    loadExpenses();
});

async function loadExpenses() {
    const catFilter = document.getElementById('filterCategory').value;
    const monthFilter = document.getElementById('filterMonth').value;
    let params = '';
    if (monthFilter) {
        const [y, m] = monthFilter.split('-');
        const start = `${y}-${m}-01`;
        const end = `${y}-${m}-${new Date(y, m, 0).getDate()}`;
        params = `?startDate=${start}&endDate=${end}`;
    }
    try {
        allExpenses = await api.getExpenses(params);
        let filtered = allExpenses;
        if (catFilter) filtered = filtered.filter(e => e.category === catFilter);
        renderTable(filtered);
        const total = filtered.reduce((s, e) => s + e.amount, 0);
        document.getElementById('totalLabel').textContent = `Total: ${formatCurrency(total)}`;
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

function renderTable(expenses) {
    const tbody = document.getElementById('expenseBody');
    if (!expenses.length) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">💸</div><h3>No expenses found</h3><p>Add your first expense using the button above.</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = expenses.map(e => `
    <tr>
      <td>${formatDate(e.date)}</td>
      <td>${getCategoryIcon(e.category)} ${e.category}</td>
      <td>${e.description || '—'}</td>
      <td>${(e.tags || []).map(t => `<span class="badge badge-info">${t}</span>`).join(' ')}</td>
      <td style="color:var(--danger);font-weight:700;">${formatCurrency(e.amount)}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-secondary btn-sm" onclick="openEditModal('${e.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteExpense('${e.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add Expense';
    document.getElementById('saveBtn').textContent = 'Save Expense';
    document.getElementById('expenseForm').reset();
    document.getElementById('exDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('expenseModal').classList.remove('hidden');
}

function openEditModal(id) {
    const exp = allExpenses.find(e => e.id === id);
    if (!exp) return;
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Expense';
    document.getElementById('saveBtn').textContent = 'Update Expense';
    document.getElementById('exAmount').value = exp.amount;
    document.getElementById('exCategory').value = exp.category;
    document.getElementById('exDesc').value = exp.description || '';
    document.getElementById('exDate').value = exp.date;
    document.getElementById('exTags').value = (exp.tags || []).join(', ');
    document.getElementById('expenseModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('expenseModal').classList.add('hidden');
}

async function saveExpense(e) {
    e.preventDefault();
    const btn = document.getElementById('saveBtn');
    setLoading(btn, true);
    const body = {
        amount: parseFloat(document.getElementById('exAmount').value),
        category: document.getElementById('exCategory').value,
        description: document.getElementById('exDesc').value,
        date: document.getElementById('exDate').value,
        tags: document.getElementById('exTags').value.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
        if (editingId) {
            await api.updateExpense(editingId, body);
            showToast('Updated', 'Expense updated successfully.', 'success');
        } else {
            await api.addExpense(body);
            showToast('Added', 'Expense added successfully.', 'success');
        }
        closeModal();
        loadExpenses();
    } catch (err) {
        showToast('Error', err.message, 'error');
    } finally {
        setLoading(btn, false);
    }
}

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    try {
        await api.deleteExpense(id);
        showToast('Deleted', 'Expense removed.', 'success');
        loadExpenses();
    } catch (err) {
        showToast('Error', err.message, 'error');
    }
}

function clearFilters() {
    document.getElementById('filterCategory').value = '';
    const now = new Date();
    document.getElementById('filterMonth').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    loadExpenses();
}

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.deleteExpense = deleteExpense;
window.loadExpenses = loadExpenses;
window.clearFilters = clearFilters;
