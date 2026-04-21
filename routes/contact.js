/* ============================================
   CODZY — routes/contact.js
   Save contact form submissions
   ============================================ */

const express = require('express');
const db = require('../db/database');
const { sendContactNotification } = require('../utils/email');

const router = express.Router();

/* ── POST /api/contact ── */
router.post('/', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
        }
        if (message.trim().length < 10) {
            return res.status(400).json({ success: false, message: 'Message must be at least 10 characters.' });
        }

        const result = db.prepare('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)')
            .run(name.trim(), email.toLowerCase().trim(), subject.trim(), message.trim());

        res.status(201).json({ success: true, message: 'Message sent successfully. We\'ll be in touch!' });

        // Notify admin via email
        sendContactNotification({ name, email, subject, message }).catch(err => console.error('Contact email failed:', err));
    } catch (err) {
        console.error('Contact error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

/* ── GET /api/contact — list all submissions (admin use) ── */
router.get('/', (req, res) => {
    try {
        const submissions = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
        res.json({ success: true, data: submissions });
    } catch (err) {
        console.error('Contact list error:', err.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
