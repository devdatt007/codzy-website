/* ============================================
   CODZY — routes/templates.js
   Return template data as JSON
   ============================================ */

const express = require('express');
const router = express.Router();

/* ── Template data (same as frontend, single source of truth) ── */
const templates = [
    {
        id: 'nova-business',
        name: 'Nova Business',
        category: 'business',
        description: 'A sleek corporate template with bold typography and conversion-focused layouts.',
        price: 79,
        gradient: 'linear-gradient(135deg, #0A192F 0%, #1A3A6B 100%)',
        icon: '🏢',
    },
    {
        id: 'vertex-portfolio',
        name: 'Vertex Portfolio',
        category: 'portfolio',
        description: 'Showcase your creative work with stunning grid layouts and smooth transitions.',
        price: 59,
        gradient: 'linear-gradient(135deg, #0F1E3D 0%, #162A50 50%, #D4AF37 200%)',
        icon: '🎨',
    },
    {
        id: 'luxe-ecommerce',
        name: 'Luxe Store',
        category: 'ecommerce',
        description: 'Premium e-commerce experience with cart, product pages, and checkout flow.',
        price: 129,
        gradient: 'linear-gradient(135deg, #1C1C1C 0%, #2E2E2E 50%, #C5A100 200%)',
        icon: '🛍️',
    },
    {
        id: 'pulse-landing',
        name: 'Pulse Landing',
        category: 'landing',
        description: 'High-converting landing page with animated sections and lead capture.',
        price: 49,
        gradient: 'linear-gradient(135deg, #0A192F 0%, #0F1E3D 60%, #D4AF37 180%)',
        icon: '🚀',
    },
    {
        id: 'orbit-saas',
        name: 'Orbit SaaS',
        category: 'saas',
        description: 'Modern SaaS dashboard & marketing site with pricing tables and feature grids.',
        price: 99,
        gradient: 'linear-gradient(135deg, #162A50 0%, #0A192F 100%)',
        icon: '☁️',
    },
    {
        id: 'prism-portfolio',
        name: 'Prism Creative',
        category: 'portfolio',
        description: 'Minimal yet bold portfolio template perfect for agencies and freelancers.',
        price: 69,
        gradient: 'linear-gradient(135deg, #2E2E2E 0%, #1C1C1C 50%, #D4AF37 200%)',
        icon: '✨',
    },
    {
        id: 'apex-business',
        name: 'Apex Corporate',
        category: 'business',
        description: 'Enterprise-grade template with team sections, case studies, and blog layouts.',
        price: 89,
        gradient: 'linear-gradient(135deg, #0F1E3D 0%, #0A192F 100%)',
        icon: '📊',
    },
    {
        id: 'spark-landing',
        name: 'Spark Launch',
        category: 'landing',
        description: 'Eye-catching product launch page with countdown timer and social proof.',
        price: 39,
        gradient: 'linear-gradient(135deg, #0A192F 0%, #C5A100 250%)',
        icon: '⚡',
    },
];

/* ── GET /api/templates ── */
router.get('/', (req, res) => {
    const { category } = req.query;
    let result = templates;

    if (category && category !== 'all') {
        result = templates.filter(t => t.category === category);
    }

    res.json({ success: true, count: result.length, data: result });
});

/* ── GET /api/templates/:id ── */
router.get('/:id', (req, res) => {
    const template = templates.find(t => t.id === req.params.id);
    if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found.' });
    }
    res.json({ success: true, data: template });
});

module.exports = router;
