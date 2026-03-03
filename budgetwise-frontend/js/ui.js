// ui.js — Shared UI helpers: toast, modal, loading states, sidebar
// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

function showToast(title, message = '', type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${ICONS[type]}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ─────────────────────────────────────────────
// LOADING STATE
// ─────────────────────────────────────────────
function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span>';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText || 'Submit';
        btn.disabled = false;
    }
}

// ─────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────
function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name = '') {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const CATEGORY_ICONS = {
    Food: '🍽️', Dining: '🍕', Transport: '🚗', Shopping: '🛍️',
    Entertainment: '🎬', Healthcare: '🏥', Education: '📚',
    Utilities: '💡', Rent: '🏠', Savings: '💰', Travel: '✈️',
    Fitness: '💪', Personal: '👤', Other: '📦'
};
function getCategoryIcon(cat) { return CATEGORY_ICONS[cat] || '📦'; }

// ─────────────────────────────────────────────
// SIDEBAR (mobile toggle)
// ─────────────────────────────────────────────
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const hamburger = document.querySelector('.hamburger');
    if (!sidebar) return;
    hamburger?.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('visible');
    });
    overlay?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
    });
}

// ─────────────────────────────────────────────
// POPULATE USER INFO IN SIDEBAR
// ─────────────────────────────────────────────
function populateUser() {
    const user = window.api?.getUser();
    if (!user) return;
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) avatarEl.textContent = getInitials(user.name);
}

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
function logout() {
    window.api?.clearToken();
    window.location.href = '/login.html';
}

// Expose globally
window.showToast = showToast;
window.setLoading = setLoading;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.getCategoryIcon = getCategoryIcon;
window.getInitials = getInitials;
window.initSidebar = initSidebar;
window.populateUser = populateUser;
window.logout = logout;
