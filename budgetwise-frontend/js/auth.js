// auth.js — Signup, Login, Verify, Forgot Password, Reset Password
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page === 'signup') initSignup();
    else if (page === 'login') initLogin();
    else if (page === 'verify') initVerify();
    else if (page === 'forgot') initForgot();
    else if (page === 'reset') initReset();
});

// ─────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────
function initSignup() {
    requireGuest?.();
    const form = document.getElementById('signupForm');
    const alertEl = document.getElementById('authAlert');
    const passEl = document.getElementById('password');

    // Password strength meter
    passEl?.addEventListener('input', () => updateStrength(passEl.value));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        hideAlert(alertEl);
        setLoading(btn, true);
        try {
            const data = {
                name: form.name.value.trim(),
                email: form.email.value.trim(),
                password: form.password.value,
            };
            await api.signup(data);
            showAlert(alertEl, '✅ Verification email sent! Check your inbox.', 'success');
            form.reset();
        } catch (err) {
            showAlert(alertEl, err.message, 'error');
        } finally {
            setLoading(btn, false);
        }
    });
}

function updateStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');
    if (!fill || !text) return;
    const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#6366f1', '#10b981'];
    const widths = ['0%', '25%', '50%', '75%', '100%'];
    fill.style.width = widths[score];
    fill.style.background = colors[score];
    text.textContent = score > 0 ? levels[score] : '';
    text.style.color = colors[score];
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
function initLogin() {
    requireGuest?.();
    const form = document.getElementById('loginForm');
    const alertEl = document.getElementById('authAlert');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        hideAlert(alertEl);
        setLoading(btn, true);
        try {
            const data = await api.login({
                email: form.email.value.trim(),
                password: form.password.value,
            });
            api.setToken(data.token);
            api.setUser({ name: data.name, email: data.email });
            window.location.href = 'dashboard.html';
        } catch (err) {
            showAlert(alertEl, err.message, 'error');
        } finally {
            setLoading(btn, false);
        }
    });
}

// ─────────────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────────────
async function initVerify() {
    const statusEl = document.getElementById('verifyStatus');
    const token = new URLSearchParams(location.search).get('token');
    if (!token) {
        showStatus(statusEl, '❌ No verification token found.', 'error');
        return;
    }
    try {
        const res = await api.verifyEmail(token);
        showStatus(statusEl, res.message, 'success');
        setTimeout(() => window.location.href = 'login.html', 3000);
    } catch (err) {
        showStatus(statusEl, err.message, 'error');
    }
}

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────
function initForgot() {
    requireGuest?.();
    const form = document.getElementById('forgotForm');
    const alertEl = document.getElementById('authAlert');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        hideAlert(alertEl);
        setLoading(btn, true);
        try {
            await api.forgotPassword(form.email.value.trim());
            showAlert(alertEl, '📧 Password reset OTP sent! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'reset-password.html';
            }, 2000);
        } catch (err) {
            showAlert(alertEl, err.message, 'error');
        } finally {
            setLoading(btn, false);
        }
    });
}

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────
function initReset() {
    const form = document.getElementById('resetForm');
    const alertEl = document.getElementById('authAlert');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = form.otp.value.trim();
        const pw1 = form.password.value;
        const pw2 = form.confirmPassword.value;
        if (pw1 !== pw2) { showAlert(alertEl, 'Passwords do not match.', 'error'); return; }
        if (token.length !== 6) { showAlert(alertEl, 'OTP must be 6 digits.', 'error'); return; }

        const btn = form.querySelector('button[type="submit"]');
        hideAlert(alertEl);
        setLoading(btn, true);
        try {
            await api.resetPassword({ token, password: pw1 });
            showAlert(alertEl, '✅ Password reset! Redirecting to login...', 'success');
            setTimeout(() => window.location.href = 'login.html', 2500);
        } catch (err) {
            showAlert(alertEl, err.message, 'error');
        } finally {
            setLoading(btn, false);
        }
    });
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function showAlert(el, msg, type) {
    if (!el) return;
    el.className = `alert alert-${type}`;
    el.textContent = msg;
    el.classList.remove('hidden');
}
function hideAlert(el) { el?.classList.add('hidden'); }

function showStatus(el, msg, type) {
    if (!el) return;
    el.innerHTML = type === 'success'
        ? `<div class="verify-icon">✅</div><h3 style="color:var(--success)">${msg}</h3><p style="color:var(--text-muted);margin-top:8px">Redirecting to login...</p>`
        : `<div class="verify-icon" style="border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.1)">❌</div><h3 style="color:var(--danger)">${msg}</h3>`;
}

// Eye toggle visibility
function toggleEye(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
}
window.toggleEye = toggleEye;
