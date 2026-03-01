/* ============================================
   CODZY — routes/orders.js
   Create and list orders
   ============================================ */

const express = require('express');
const db = require('../db/database');
const { sendOrderNotification, sendOrderConfirmation } = require('../utils/email');

const router = express.Router();

/* ── POST /api/orders ── */
router.post('/', (req, res) => {
    try {
        const { items, subtotal, tax, total } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty.' });
        }
        if (typeof subtotal !== 'number' || typeof tax !== 'number' || typeof total !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid totals.' });
        }

        const userId = req.session.userId || null; // null for guest checkout

        const result = db.prepare(
            'INSERT INTO orders (user_id, items_json, subtotal, tax, total) VALUES (?, ?, ?, ?, ?)'
        ).run(userId, JSON.stringify(items), subtotal, tax, total);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            orderId: result.lastInsertRowid,
        });

        // Send order notification to admin (async)
        const user = userId ? db.prepare('SELECT name, email FROM users WHERE id = ?').get(userId) : null;
        sendOrderNotification(
            { id: result.lastInsertRowid, items: JSON.stringify(items), subtotal, tax, total },
            user
        ).catch(err => console.error('Admin order email failed:', err));

        // Send order confirmation to customer
        if (user) {
            sendOrderConfirmation(
                user.email, user.name,
                { id: result.lastInsertRowid, items: JSON.stringify(items), subtotal, tax, total }
            ).catch(err => console.error('Customer order email failed:', err));
        }
    } catch (err) {
        console.error('Order error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

/* ── GET /api/orders — user's orders (requires session) ── */
router.get('/', (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Please log in to view orders.' });
        }

        const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.session.userId);

        // Parse items_json back to array
        const parsed = orders.map(o => ({
            ...o,
            items: JSON.parse(o.items_json),
        }));

        res.json({ success: true, data: parsed });
    } catch (err) {
        console.error('Orders list error:', err.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
