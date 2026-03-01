/* ============================================
   CODZY — templates.js
   Template data, rendering, filtering, add-to-cart
   ============================================ */

(function () {
    'use strict';

    /* ── Template Data ── */
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

    const grid = document.getElementById('templates-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    /* ── Render Templates ── */
    function render(filter = 'all') {
        const filtered = filter === 'all' ? templates : templates.filter(t => t.category === filter);
        grid.innerHTML = '';

        filtered.forEach((t, i) => {
            const card = document.createElement('div');
            card.className = 'template-card reveal';
            card.style.transitionDelay = `${i * 0.08}s`;

            card.innerHTML = `
        <div class="template-card-img-wrapper">
          <div class="template-preview-gradient" style="background: ${t.gradient};">${t.icon}</div>
        </div>
        <div class="template-card-body">
          <span class="template-card-tag">${t.category}</span>
          <h3>${t.name}</h3>
          <p>${t.description}</p>
        </div>
        <div class="template-card-footer">
          <span class="template-price">$${t.price}</span>
          <div class="template-actions">
            <button class="btn btn-primary btn-sm" onclick="addToCart('${t.id}')">Add to Cart</button>
            <button class="btn btn-outline btn-sm" onclick="showToast('Preview coming soon', '👁️')">Preview</button>
          </div>
        </div>
      `;

            grid.appendChild(card);

            // Trigger reveal
            requestAnimationFrame(() => {
                requestAnimationFrame(() => card.classList.add('revealed'));
            });
        });
    }

    /* ── Filter ── */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            render(btn.dataset.filter);
        });
    });

    /* ── Add to Cart ── */
    window.addToCart = function (id) {
        const template = templates.find(t => t.id === id);
        if (!template) return;

        let cart = JSON.parse(localStorage.getItem('codzy-cart') || '[]');
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: template.id,
                name: template.name,
                price: template.price,
                gradient: template.gradient,
                icon: template.icon,
                qty: 1,
            });
        }
        localStorage.setItem('codzy-cart', JSON.stringify(cart));

        if (window.updateCartBadge) window.updateCartBadge();
        if (window.showToast) window.showToast(`${template.name} added to cart`, '🛒');
    };

    // Initial render
    render();

})();
