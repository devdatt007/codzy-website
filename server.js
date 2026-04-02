/* ============================================
   CODZY — server.js
   Express application entry point
   ============================================ */

// Load .env only in development — Render injects env vars natively
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Initialize database (creates tables on first run)
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

/* ── Middleware ── */
if (isProduction) app.set('trust proxy', 1); // trust Render's reverse proxy
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'codzy-fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: isProduction,   // true over HTTPS in production
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
}));

/* ── Clean URL Redirects (Executes before static files) ── */
app.get('/', (req, res) => {
    res.redirect(301, '/home');
});

const redirects = {
    '/index.html': '/home',
    '/contact.html': '/contact',
    '/login.html': '/login',
    '/about.html': '/about',
    '/templates.html': '/templates',
    '/cart.html': '/cart',
    '/signup.html': '/signup'
};

Object.keys(redirects).forEach(oldUrl => {
    app.get(oldUrl, (req, res) => {
        res.redirect(301, redirects[oldUrl]);
    });
});

/* ── Clean URL Routes ── */
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/templates', (req, res) => res.sendFile(path.join(__dirname, 'public', 'templates.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cart.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));

/* ── Static Files (Assets) ── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── Inject Google Client ID for frontend ── */
app.get('/api/config', (req, res) => {
    res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || '' });
});

/* ── API Routes ── */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

/* ── SPA fallback: serve index.html for any unmatched route ── */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Global error handler ── */
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

/* ── Start ── */
app.listen(PORT, () => {
    console.log(`\n  ✦ Codzy server running at http://localhost:${PORT}\n`);
});
