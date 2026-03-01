/* ============================================
   CODZY — signup.js
   Front-end signup form + Google Sign-Up
   ============================================ */

(function () {
    'use strict';

    // Load Google Client ID from server
    fetch('/api/config').then(r => r.json()).then(c => { window.__GOOGLE_CLIENT_ID = c.googleClientId; }).catch(() => { });

    const form = document.getElementById('signup-form');
    if (!form) return;

    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmInput = document.getElementById('signup-confirm');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmError = document.getElementById('confirm-error');

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

    /* ── Live validation on blur ── */
    nameInput.addEventListener('blur', () => {
        const group = nameInput.closest('.form-group');
        if (!nameInput.value.trim()) {
            setError(group, nameError, 'Full name is required');
        } else if (nameInput.value.trim().length < 2) {
            setError(group, nameError, 'Name must be at least 2 characters');
        } else {
            clearError(group, nameError);
        }
    });

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

    confirmInput.addEventListener('blur', () => {
        const group = confirmInput.closest('.form-group');
        if (!confirmInput.value) {
            setError(group, confirmError, 'Please confirm your password');
        } else if (confirmInput.value !== passwordInput.value) {
            setError(group, confirmError, 'Passwords do not match');
        } else {
            clearError(group, confirmError);
        }
    });

    /* ── Clear errors on input ── */
    nameInput.addEventListener('input', () => clearError(nameInput.closest('.form-group'), nameError));
    emailInput.addEventListener('input', () => clearError(emailInput.closest('.form-group'), emailError));
    passwordInput.addEventListener('input', () => clearError(passwordInput.closest('.form-group'), passwordError));
    confirmInput.addEventListener('input', () => clearError(confirmInput.closest('.form-group'), confirmError));

    /* ── Submit ── */
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        // Validate name
        const nameGroup = nameInput.closest('.form-group');
        if (!nameInput.value.trim()) {
            setError(nameGroup, nameError, 'Full name is required');
            valid = false;
        } else if (nameInput.value.trim().length < 2) {
            setError(nameGroup, nameError, 'Name must be at least 2 characters');
            valid = false;
        }

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

        // Validate confirm
        const cfGroup = confirmInput.closest('.form-group');
        if (!confirmInput.value) {
            setError(cfGroup, confirmError, 'Please confirm your password');
            valid = false;
        } else if (confirmInput.value !== passwordInput.value) {
            setError(cfGroup, confirmError, 'Passwords do not match');
            valid = false;
        }

        if (valid) {
            const btn = form.querySelector('.login-btn');
            btn.textContent = 'Creating account...';
            btn.disabled = true;

            fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    password: passwordInput.value,
                }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        if (window.showToast) window.showToast('Account created! Redirecting...', '✓');
                        form.reset();
                        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
                    } else {
                        if (window.showToast) window.showToast(data.message || 'Registration failed', '✕');
                    }
                })
                .catch(() => {
                    if (window.showToast) window.showToast('Network error. Please try again.', '✕');
                })
                .finally(() => {
                    btn.textContent = 'Create Account';
                    btn.disabled = false;
                });
        }
    });

    /* ── Google Sign-Up ── */
    const googleBtn = document.getElementById('googleSignupBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            // Check if Google Identity Services loaded
            if (typeof google === 'undefined' || !google.accounts) {
                if (window.showToast) window.showToast('Google Sign-In is loading, try again', '⏳');
                return;
            }

            google.accounts.id.initialize({
                client_id: window.__GOOGLE_CLIENT_ID || '',
                callback: handleGoogleCredential,
                auto_select: false,
            });

            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback: use popup
                    const client = google.accounts.oauth2.initTokenClient({
                        client_id: window.__GOOGLE_CLIENT_ID || '',
                        scope: 'openid email profile',
                        callback: (tokenResponse) => {
                            if (tokenResponse.access_token) {
                                // Send token to our backend
                                fetch('/api/auth/google', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ access_token: tokenResponse.access_token }),
                                })
                                    .then(r => r.json())
                                    .then(data => {
                                        if (data.success) {
                                            if (window.showToast) window.showToast('Welcome! Redirecting...', '✓');
                                            setTimeout(() => { window.location.href = 'index.html'; }, 1200);
                                        } else {
                                            if (window.showToast) window.showToast(data.message || 'Google sign-in failed', '✕');
                                        }
                                    })
                                    .catch(() => {
                                        if (window.showToast) window.showToast('Network error', '✕');
                                    });
                            }
                        },
                    });
                    client.requestAccessToken();
                }
            });
        });
    }

    function handleGoogleCredential(response) {
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
                        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
                    } else {
                        if (window.showToast) window.showToast(data.message || 'Google sign-in failed', '✕');
                    }
                })
                .catch(() => {
                    if (window.showToast) window.showToast('Network error', '✕');
                });
        }
    }

})();
