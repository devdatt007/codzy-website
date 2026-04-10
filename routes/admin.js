/* ============================================
   CODZY — Admin Routes
   Owner-only access to client data
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../db/database');

/* ── Admin credentials from .env ── */
const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

/* ── Middleware: check admin session ── */
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) return next();
    return res.status(401).json({ success: false, message: 'Unauthorized — admin access required' });
}

/* ── POST /api/admin/login ── */
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    if (username === ADMIN_USER && password === ADMIN_PASS && ADMIN_USER) {
        req.session.isAdmin = true;
        return res.json({ success: true, message: 'Admin login successful' });
    }

    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
});

/* ── POST /api/admin/logout ── */
router.post('/logout', (req, res) => {
    req.session.isAdmin = false;
    res.json({ success: true, message: 'Admin logged out' });
});

/* ── GET /api/admin/check ── */
router.get('/check', (req, res) => {
    res.json({ success: true, isAdmin: !!(req.session && req.session.isAdmin) });
});

/* ── GET /api/admin/contacts ── */
router.get('/contacts', requireAdmin, (req, res) => {
    try {
        const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
        res.json({ success: true, data: contacts, total: contacts.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/admin/newsletter ── */
router.get('/newsletter', requireAdmin, (req, res) => {
    try {
        const subs = db.prepare('SELECT * FROM newsletter ORDER BY subscribed_at DESC').all();
        res.json({ success: true, data: subs, total: subs.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/admin/users ── */
router.get('/users', requireAdmin, (req, res) => {
    try {
        const users = db.prepare('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC').all();
        res.json({ success: true, data: users, total: users.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/admin/orders ── */
router.get('/orders', requireAdmin, (req, res) => {
    try {
        const orders = db.prepare(`
            SELECT o.*, u.name as user_name, u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `).all();
        res.json({ success: true, data: orders, total: orders.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/admin/stats ── */
router.get('/stats', requireAdmin, (req, res) => {
    try {
        const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get().count;
        const newsletterCount = db.prepare('SELECT COUNT(*) as count FROM newsletter').get().count;
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
        const revenue = db.prepare('SELECT COALESCE(SUM(total), 0) as total FROM orders').get().total;

        res.json({
            success: true,
            stats: {
                contacts: contactCount,
                subscribers: newsletterCount,
                users: userCount,
                orders: orderCount,
                revenue: revenue,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── DELETE /api/admin/contacts/:id ── */
router.delete('/contacts/:id', requireAdmin, (req, res) => {
    try {
        db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
        res.json({ success: true, message: 'Contact deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── DELETE /api/admin/newsletter/:id ── */
router.delete('/newsletter/:id', requireAdmin, (req, res) => {
    try {
        db.prepare('DELETE FROM newsletter WHERE id = ?').run(req.params.id);
        res.json({ success: true, message: 'Subscriber removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── POST /api/admin/reset-database ── */
/* Highly secure: requires admin session + password re-entry + confirmation phrase */
router.post('/reset-database', requireAdmin, (req, res) => {
    try {
        const { password, confirmPhrase } = req.body;

        // Security layer 1: Must be admin session (already checked by middleware)
        // Security layer 2: Must re-enter admin password
        if (!password || !ADMIN_PASS || password !== ADMIN_PASS) {
            return res.status(403).json({ success: false, message: 'Invalid admin password.' });
        }

        // Security layer 3: Must type exact confirmation phrase
        if (confirmPhrase !== 'RESET ALL DATA') {
            return res.status(400).json({ success: false, message: 'Confirmation phrase does not match.' });
        }

        // Execute reset
        db.prepare('DELETE FROM contacts').run();
        db.prepare('DELETE FROM newsletter').run();
        db.prepare('DELETE FROM orders').run();
        db.prepare('DELETE FROM users').run();
        // Reset auto-increment so IDs start from 1 again
        db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('contacts','newsletter','orders','users')").run();

        res.json({ success: true, message: 'Database has been completely reset.' });
    } catch (err) {
        console.error('Database reset error:', err.message);
        res.status(500).json({ success: false, message: 'Reset failed: ' + err.message });
    }
});

module.exports = router;
