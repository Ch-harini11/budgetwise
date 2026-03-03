// theme.js — Dark/Light mode toggle
const THEME_KEY = 'bw_theme';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    // Update all toggle buttons
    document.querySelectorAll('.theme-toggle, .theme-toggle-auth').forEach(btn => {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });
}

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(saved);
}

function toggleTheme() {
    const current = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    document.querySelectorAll('.theme-toggle, .theme-toggle-auth').forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });
});

window.BW = window.BW || {};
window.BW.theme = { applyTheme, initTheme, toggleTheme };
