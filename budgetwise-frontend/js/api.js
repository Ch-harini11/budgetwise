// api.js — Fetch wrapper for BudgetWise backend
const API_BASE = 'http://localhost:8082/api';
const TOKEN_KEY = 'bw_token';
const USER_KEY = 'bw_user';

const api = {
    // ── Token helpers ──────────────────────────────
    getToken() { return localStorage.getItem(TOKEN_KEY); },
    setToken(t) { localStorage.setItem(TOKEN_KEY, t); },
    clearToken() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },

    getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
    setUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); },

    isLoggedIn() { return !!this.getToken(); },

    // ── Request helper ─────────────────────────────
    async request(path, options = {}) {
        const token = this.getToken();
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = data.error || data.message || Object.values(data)[0] || 'Request failed.';
            throw new Error(msg);
        }
        return data;
    },

    // ── Auth ───────────────────────────────────────
    signup(body) { return this.request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }); },
    login(body) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) }); },
    verifyEmail(token) { return this.request(`/auth/verify?token=${token}`); },
    forgotPassword(email) { return this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); },
    resetPassword(b) { return this.request('/auth/reset-password', { method: 'POST', body: JSON.stringify(b) }); },

    // ── Expenses ───────────────────────────────────
    getExpenses(params = '') { return this.request(`/expenses${params}`); },
    addExpense(body) { return this.request('/expenses', { method: 'POST', body: JSON.stringify(body) }); },
    updateExpense(id, body) { return this.request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(body) }); },
    deleteExpense(id) { return this.request(`/expenses/${id}`, { method: 'DELETE' }); },
    getExpenseSummary(m, y) { return this.request(`/expenses/summary?month=${m}&year=${y}`); },

    // ── Budget ─────────────────────────────────────
    setBudget(body) { return this.request('/budget', { method: 'POST', body: JSON.stringify(body) }); },
    getBudget(m, y) { return this.request(`/budget?month=${m}&year=${y}`); },
    getAllBudgets() { return this.request('/budget/all'); },

    // ── AI Advisor ─────────────────────────────────
    getTips() { return this.request('/advisor/tips'); },
};

// Guard: redirect to login if not authenticated (for app pages)
function requireAuth() {
    if (!api.isLoggedIn()) {
        window.location.href = '/login.html';
    }
}

// Guard: redirect to dashboard if already logged in (for auth pages)
function requireGuest() {
    if (api.isLoggedIn()) {
        window.location.href = '/dashboard.html';
    }
}

window.api = api;
window.requireAuth = requireAuth;
window.requireGuest = requireGuest;
