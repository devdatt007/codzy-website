/* ============================================
   CODZY — login.js
   Front-end form validation + Admin login
   ============================================ */

(function () {
    'use strict';

    // Load Google Client ID from server
    fetch('/api/config').then(r => r.json()).then(c => { window.__GOOGLE_CLIENT_ID = c.googleClientId; }).catch(() => { });

    /* ── DOM refs ── */
    const userForm = document.getElementById('login-form');

    if (!userForm) return;

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    /* ── Helpers ── */
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function clearError(group, errorEl) {
        group.classList.remove('error');
        errorEl.textContent = '';
    }

    function setError(group, errorEl, message) {
        group.classList.add('error');
        errorEl.textContent = message;
    }

    /* ── User Login: Live validation on blur ── */
    emailInput.addEventListener('blur', () => {
        const group = emailInput.closest('.form-group');
        if (!emailInput.value.trim()) {
            setError(group, emailError, 'Email is required');
        } else if (!validateEmail(emailInput.value.trim())) {
            setError(group, emailError, 'Please enter a valid email');
        } else {
            clearError(group, emailError);
        }
    });

    passwordInput.addEventListener('blur', () => {
        const group = passwordInput.closest('.form-group');
        if (!passwordInput.value) {
            setError(group, passwordError, 'Password is required');
        } else if (passwordInput.value.length < 6) {
            setError(group, passwordError, 'Password must be at least 6 characters');
        } else {
            clearError(group, passwordError);
        }
    });

    // Clear errors on input
    emailInput.addEventListener('input', () => clearError(emailInput.closest('.form-group'), emailError));
    passwordInput.addEventListener('input', () => clearError(passwordInput.closest('.form-group'), passwordError));

    /* ── User Login Submit ── */
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        // Validate email
        const emailGroup = emailInput.closest('.form-group');
        if (!emailInput.value.trim()) {
            setError(emailGroup, emailError, 'Email is required');
            valid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            setError(emailGroup, emailError, 'Please enter a valid email');
            valid = false;
        }

        // Validate password
        const pwGroup = passwordInput.closest('.form-group');
        if (!passwordInput.value) {
            setError(pwGroup, passwordError, 'Password is required');
            valid = false;
        } else if (passwordInput.value.length < 6) {
            setError(pwGroup, passwordError, 'Password must be at least 6 characters');
            valid = false;
        }

        if (valid) {
            const btn = userForm.querySelector('.login-btn');
            btn.textContent = 'Signing in...';
            btn.disabled = true;

            const emailVal = emailInput.value.trim().toLowerCase();
            const passVal = passwordInput.value;

            // Unified Login: Endpoint now handles both regular and admin users
            fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailVal,
                    password: passVal,
                }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        if (data.isAdmin) {
                            if (window.showToast) window.showToast('Admin login successful! Opening dashboard...', '✓');
                            userForm.reset();
                            setTimeout(() => { window.location.href = '/admin'; }, 1200);
                        } else {
                            if (window.showToast) window.showToast('Login successful! Redirecting...', '✓');
                            userForm.reset();
                            setTimeout(() => { window.location.href = '/home'; }, 1200);
                        }
                    } else {
                        if (window.showToast) window.showToast(data.message || 'Login failed', '✕');
                        setError(pwGroup, passwordError, data.message || 'Login failed');
                    }
                })
                .catch(() => {
                    if (window.showToast) window.showToast('Network error. Please try again.', '✕');
                })
                .finally(() => {
                    btn.textContent = 'Sign In';
                    btn.disabled = false;
                });
        }
    });



    /* ── Google Sign-In ── */
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            if (typeof google === 'undefined' || !google.accounts) {
                if (window.showToast) window.showToast('Google Sign-In is loading, try again', '⏳');
                return;
            }

            google.accounts.id.initialize({
                client_id: window.__GOOGLE_CLIENT_ID || '',
                callback: (response) => {
                    if (response.credential) {
                        fetch('/api/auth/google', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_token: response.credential }),
                        })
                            .then(r => r.json())
                            .then(data => {
                                if (data.success) {
                                    if (window.showToast) window.showToast('Welcome! Redirecting...', '✓');
                                    setTimeout(() => { window.location.href = '/home'; }, 1200);
                                } else {
                                    if (window.showToast) window.showToast(data.message || 'Google sign-in failed', '✕');
                                }
                            });
                    }
                },
            });

            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    const client = google.accounts.oauth2.initTokenClient({
                        client_id: window.__GOOGLE_CLIENT_ID || '',
                        scope: 'openid email profile',
                        callback: (tokenResponse) => {
                            if (tokenResponse.access_token) {
                                fetch('/api/auth/google', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ access_token: tokenResponse.access_token }),
                                })
                                    .then(r => r.json())
                                    .then(data => {
                                        if (data.success) {
                                            if (window.showToast) window.showToast('Welcome! Redirecting...', '✓');
                                            setTimeout(() => { window.location.href = '/home'; }, 1200);
                                        } else {
                                            if (window.showToast) window.showToast(data.message || 'Failed', '✕');
                                        }
                                    });
                            }
                        },
                    });
                    client.requestAccessToken();
                }
            });
        });
    }

})();
