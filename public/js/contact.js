/* ============================================
   CODZY — contact.js
   Contact form validation
   ============================================ */

(function () {
    'use strict';

    const form = document.getElementById('contact-form');
    if (!form) return;

    const fields = {
        name: { el: document.getElementById('contact-name'), err: document.getElementById('name-error') },
        email: { el: document.getElementById('contact-email'), err: document.getElementById('cemail-error') },
        subject: { el: document.getElementById('contact-subject'), err: document.getElementById('subject-error') },
        message: { el: document.getElementById('contact-message'), err: document.getElementById('message-error') },
    };

    function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    function setErr(key, msg) {
        fields[key].el.closest('.form-group').classList.add('error');
        fields[key].err.textContent = msg;
    }

    function clearErr(key) {
        fields[key].el.closest('.form-group').classList.remove('error');
        fields[key].err.textContent = '';
    }

    // Clear on input
    Object.keys(fields).forEach(key => {
        fields[key].el.addEventListener('input', () => clearErr(key));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        // Name
        if (!fields.name.el.value.trim()) { setErr('name', 'Name is required'); valid = false; }
        else clearErr('name');

        // Email
        if (!fields.email.el.value.trim()) { setErr('email', 'Email is required'); valid = false; }
        else if (!validateEmail(fields.email.el.value.trim())) { setErr('email', 'Enter a valid email'); valid = false; }
        else clearErr('email');

        // Subject
        if (!fields.subject.el.value.trim()) { setErr('subject', 'Subject is required'); valid = false; }
        else clearErr('subject');

        // Message
        if (!fields.message.el.value.trim()) { setErr('message', 'Message is required'); valid = false; }
        else if (fields.message.el.value.trim().length < 10) { setErr('message', 'Message must be at least 10 characters'); valid = false; }
        else clearErr('message');

        if (valid) {
            const btn = form.querySelector('.submit-btn');
            btn.textContent = 'Sending...';
            btn.disabled = true;

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fields.name.el.value.trim(),
                    email: fields.email.el.value.trim(),
                    subject: fields.subject.el.value.trim(),
                    message: fields.message.el.value.trim(),
                }),
            })
                .then(res => res.json())
                .then(data => {
                    if (window.showToast) window.showToast(data.message || 'Message sent!', data.success ? '📧' : '✕');
                    if (data.success) form.reset();
                })
                .catch(() => {
                    if (window.showToast) window.showToast('Network error. Please try again.', '✕');
                })
                .finally(() => {
                    btn.textContent = 'Send Message';
                    btn.disabled = false;
                });
        }
    });

})();
