// advisor.js
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    populateUser();
    initSidebar();
    loadTips();
});

async function loadTips() {
    const grid = document.getElementById('tipsGrid');
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Loading your personalized tips...</p></div>`;
    try {
        const tips = await api.getTips();
        if (!tips.length) {
            grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><h3>No tips yet</h3><p>Add some expenses and set a budget to get personalized advice.</p></div>`;
            return;
        }
        grid.innerHTML = tips.map(tip => `
      <div class="tip-card">
        <div class="tip-header">
          <div class="tip-title">${tip.title}</div>
          <span class="badge badge-${tip.priority?.toLowerCase() === 'high' ? 'high' : tip.priority?.toLowerCase() === 'medium' ? 'medium' : 'low'}">
            ${tip.priority}
          </span>
        </div>
        <p class="tip-message">${tip.message}</p>
      </div>
    `).join('');
    } catch (err) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><h3>Couldn't load tips</h3><p>${err.message}</p></div>`;
        showToast('Error', err.message, 'error');
    }
}

window.loadTips = loadTips;
