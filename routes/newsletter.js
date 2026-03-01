/* ============================================
   CODZY — routes/newsletter.js
   Newsletter email subscriptions
   ============================================ */

const express = require('express');
const db = require('../db/database');
const { sendSubscriptionNotification } = require('../utils/email');

const router = express.Router();

/* ── POST /api/newsletter ── */
router.post('/', (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        }

        // Upsert — ignore if already subscribed
        const existing = db.prepare('SELECT id FROM newsletter WHERE email = ?').get(email.toLowerCase().trim());
        if (existing) {
            return res.json({ success: true, message: 'You\'re already subscribed!' });
        }

        db.prepare('INSERT INTO newsletter (email) VALUES (?)').run(email.toLowerCase().trim());

        res.status(201).json({ success: true, message: 'Subscribed successfully! Welcome aboard.' });

        // Notify admin
        sendSubscriptionNotification(email.toLowerCase().trim()).catch(err => console.error('Sub email failed:', err));
    } catch (err) {
        console.error('Newsletter error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

/* ── GET /api/newsletter — list subscribers (admin use) ── */
router.get('/', (req, res) => {
    try {
        const subscribers = db.prepare('SELECT * FROM newsletter ORDER BY subscribed_at DESC').all();
        res.json({ success: true, count: subscribers.length, data: subscribers });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
