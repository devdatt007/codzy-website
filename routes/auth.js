/* ============================================
   CODZY — routes/auth.js
   Register, Login, Logout, Get Current User
   ============================================ */

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { sendWelcomeEmail } = require('../utils/email');

const router = express.Router();

/* ── POST /api/auth/register ── */
router.post('/register', (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
        }

        // Check if user exists
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        // Hash password and insert
        const hash = bcrypt.hashSync(password, 10);
        const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name.trim(), email.toLowerCase().trim(), hash);

        // Auto-login after register
        req.session.userId = result.lastInsertRowid;
        req.session.userName = name.trim();
        req.session.userEmail = email.toLowerCase().trim();

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            user: { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase().trim() },
        });

        // Send welcome email (first time)
        sendWelcomeEmail(email.toLowerCase().trim(), name.trim(), true).catch(err => console.error('Welcome email failed:', err));
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

/* ── POST /api/auth/login ── */
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const match = bcrypt.compareSync(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        res.json({
            success: true,
            message: 'Login successful.',
            user: { id: user.id, name: user.name, email: user.email },
        });

        // Send welcome back email (returning user)
        sendWelcomeEmail(user.email, user.name, false).catch(err => console.error('Welcome email failed:', err));
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

/* ── POST /api/auth/logout ── */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out.' });
        }
        res.json({ success: true, message: 'Logged out successfully.' });
    });
});

/* ── GET /api/auth/me ── */
router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    // Verify the user still exists in the database
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.session.userId);
    if (!user) {
        // User was deleted (e.g. database reset) — clear the stale session
        req.session.userId = null;
        req.session.userName = null;
        req.session.userEmail = null;
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });
});

/* ── POST /api/auth/google ── */
router.post('/google', async (req, res) => {
    try {
        const { id_token, access_token } = req.body;
        let email, name;

        if (id_token) {
            // Verify Google ID token
            const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
            const payload = await response.json();
            if (payload.error) {
                return res.status(401).json({ success: false, message: 'Invalid Google token' });
            }
            email = payload.email;
            name = payload.name || payload.email.split('@')[0];
        } else if (access_token) {
            // Use access token to get user info
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const userInfo = await response.json();
            if (!userInfo.email) {
                return res.status(401).json({ success: false, message: 'Could not get Google user info' });
            }
            email = userInfo.email;
            name = userInfo.name || userInfo.email.split('@')[0];
        } else {
            return res.status(400).json({ success: false, message: 'No token provided' });
        }

        // Find or create user
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
        let isNewUser = false;

        if (!user) {
            // Create new user (no password for Google users)
            isNewUser = true;
            const result = db.prepare(
                'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
            ).run(name.trim(), email.toLowerCase(), 'google-oauth');

            user = { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase() };
        }

        // Set session
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        res.json({
            success: true,
            message: 'Google login successful.',
            user: { id: user.id, name: user.name, email: user.email },
        });

        // Send welcome email (first time if new, welcome back if existing)
        sendWelcomeEmail(user.email, user.name, isNewUser).catch(err => console.error('Welcome email failed:', err));
    } catch (err) {
        console.error('Google auth error:', err.message);
        res.status(500).json({ success: false, message: 'Google authentication failed.' });
    }
});

/* ── GET /api/auth/google-client-id ── */
router.get('/google-client-id', (req, res) => {
    // Serve Google Client ID to frontend (safe to expose, it's public)
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '' });
});

module.exports = router;
