/* ============================================
   CODZY — particles.js
   Canvas-based floating geometric shapes
   ============================================ */

(function () {
    'use strict';

    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H;
    let particles = [];
    let animId;

    const COLORS = [
        'rgba(212, 175, 55, 0.12)',
        'rgba(212, 175, 55, 0.08)',
        'rgba(197, 161, 0, 0.10)',
        'rgba(232, 200, 74, 0.06)',
        'rgba(176, 176, 176, 0.06)',
        'rgba(255, 255, 255, 0.04)',
    ];

    function resize() {
        W = canvas.width = canvas.parentElement.clientWidth;
        H = canvas.height = canvas.parentElement.clientHeight;
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function createParticle() {
        const type = Math.random();
        return {
            x: rand(0, W),
            y: rand(0, H),
            size: rand(4, 28),
            speedX: rand(-0.3, 0.3),
            speedY: rand(-0.15, -0.5),
            rotation: rand(0, Math.PI * 2),
            rotationSpeed: rand(-0.008, 0.008),
            color: COLORS[Math.floor(rand(0, COLORS.length))],
            shape: type < 0.33 ? 'circle' : type < 0.66 ? 'triangle' : 'hexagon',
            opacity: rand(0.3, 0.9),
        };
    }

    function init() {
        resize();
        const count = Math.min(Math.floor((W * H) / 18000), 50);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    function drawCircle(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawTriangle(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        const r = p.size / 2;
        for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawHexagon(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        const r = p.size / 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        particles.forEach(p => {
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;

            if (p.shape === 'circle') drawCircle(p);
            else if (p.shape === 'triangle') drawTriangle(p);
            else drawHexagon(p);

            // Move
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;

            // Wrap
            if (p.y + p.size < 0) { p.y = H + p.size; p.x = rand(0, W); }
            if (p.x < -p.size) p.x = W + p.size;
            if (p.x > W + p.size) p.x = -p.size;
        });

        ctx.globalAlpha = 1;
        animId = requestAnimationFrame(draw);
    }

    init();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 200);
    });

    // Pause when off-screen
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!animId) draw();
            } else {
                cancelAnimationFrame(animId);
                animId = null;
            }
        });
    });
    observer.observe(canvas);

})();
