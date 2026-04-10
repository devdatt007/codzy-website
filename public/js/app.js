/* ============================================
   CODZY — app.js
   Global: Theme, Navbar, Cursor, Scroll, Loader
   ============================================ */

(function () {
  'use strict';

  /* ── Loading Screen ── */
  window.addEventListener('load', () => {
    const loader = document.querySelector('.loading-screen');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 600);
      setTimeout(() => {
        loader.remove();
        if (window.initCounterObserver) window.initCounterObserver();
      }, 1200);
    } else {
      if (window.initCounterObserver) window.initCounterObserver();
    }
  });

  /* ── Theme Toggle ── */
  const themeToggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('codzy-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('codzy-theme', next);
    });
  }

  /* ── Sticky Navbar ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── Active Nav Link ── */
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/home')) {
      link.classList.add('active');
    }
  });

  /* ── Mobile Hamburger ── */
  const hamburger = document.querySelector('.hamburger');
  const navLinksContainer = document.querySelector('.nav-links');
  const overlay = document.querySelector('.mobile-overlay');

  function closeMenu() {
    hamburger?.classList.remove('active');
    navLinksContainer?.classList.remove('open');
    overlay?.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinksContainer.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        hamburger.classList.add('active');
        navLinksContainer.classList.add('open');
        overlay?.classList.add('visible');
        document.body.style.overflow = 'hidden';
      }
    });
  }
  overlay?.addEventListener('click', closeMenu);

  /* ── Custom Cursor ── */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.left = mx + 'px';
      cursorDot.style.top = my + 'px';
    });

    // Smooth follow for ring
    function animateCursor() {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cursorRing.style.left = cx + 'px';
      cursorRing.style.top = cy + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    document.querySelectorAll('a, button, input, textarea, select, .glass-card, .template-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hover');
        cursorRing.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover');
        cursorRing.classList.remove('hover');
      });
    });
  }

  /* ── Scroll Reveal (Intersection Observer) ── */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger');

  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* ── Back to Top ── */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Button Ripple Effect ── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      this.style.setProperty('--ripple-x', x + '%');
      this.style.setProperty('--ripple-y', y + '%');
    });
  });

  /* ── Smooth Page Transitions ── */
  const transitionOverlay = document.querySelector('.page-transition');
  if (transitionOverlay) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          transitionOverlay.style.transformOrigin = 'left';
          transitionOverlay.style.animation = 'wipeIn 0.35s ease forwards';
          setTimeout(() => {
            window.location.href = href;
          }, 350);
        });
      }
    });
  }

  /* ── Cart Count Badge Update ── */
  function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (!badge) return;
    const cart = JSON.parse(localStorage.getItem('codzy-cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');
  }
  updateCartBadge();
  window.addEventListener('storage', updateCartBadge);
  window.updateCartBadge = updateCartBadge;

  /* ── Toast Notifications ── */
  window.showToast = function (message, icon = '✓') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  };

  /* ── Animated Counters ── */
  window.animateCounters = function () {
    document.querySelectorAll('[data-count]').forEach(counter => {
      if (counter.dataset.animated) return;
      const target = parseInt(counter.dataset.count, 10);
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        counter.textContent = Math.floor(target * eased).toLocaleString();
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          counter.textContent = target.toLocaleString();
          counter.dataset.animated = 'true';
        }
      }
      requestAnimationFrame(tick);
    });
  };

  // Observe stat counters
  window.initCounterObserver = function () {
    const statEls = document.querySelectorAll('.stats-grid, .stat-counters');
    statEls.forEach(el => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            window.animateCounters();
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      obs.observe(el);
    });
  };

  /* ── Newsletter Forms → API ── */
  document.querySelectorAll('.newsletter-form, .newsletter-form-hero').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input?.value?.trim();
      if (!email) return;

      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then(res => res.json())
        .then(data => {
          if (window.showToast) window.showToast(data.message || 'Subscribed!', data.success ? '🎉' : '✕');
          if (data.success) form.reset();
        })
        .catch(() => {
          if (window.showToast) window.showToast('Network error. Please try again.', '✕');
        });
    });
  });

  /* ── User Account in Navbar ── */
  async function checkAuthAndUpdateNav() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (data.success && data.user) {
        window.__user = data.user;

        // Replace "Login" link with user avatar
        const loginLink = document.querySelector('.nav-links a[href="/login"]');
        if (loginLink) {
          loginLink.style.display = 'none';
        }

        // Create user account element in nav-right
        const navRight = document.querySelector('.nav-right');
        if (navRight && !document.querySelector('.nav-user')) {
          const userEl = document.createElement('div');
          userEl.className = 'nav-user';

          const initial = data.user.name ? data.user.name.charAt(0).toUpperCase() : '?';
          userEl.innerHTML = `
            <button class="nav-user-btn" aria-label="Account menu">
              <span class="nav-user-avatar">${initial}</span>
            </button>
            <div class="nav-user-dropdown">
              <div class="nav-user-info">
                <span class="nav-user-name">${data.user.name}</span>
                <span class="nav-user-email">${data.user.email}</span>
              </div>
              <div class="nav-user-divider"></div>
              <a href="/cart" class="nav-user-item">🛒 My Cart</a>
              <button class="nav-user-item nav-logout-btn">🚪 Logout</button>
            </div>
          `;

          // Insert before hamburger
          const hamburgerBtn = navRight.querySelector('.hamburger');
          if (hamburgerBtn) {
            navRight.insertBefore(userEl, hamburgerBtn);
          } else {
            navRight.appendChild(userEl);
          }

          // Toggle dropdown
          const btn = userEl.querySelector('.nav-user-btn');
          const dropdown = userEl.querySelector('.nav-user-dropdown');
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
          });
          document.addEventListener('click', () => dropdown.classList.remove('open'));

          // Logout
          userEl.querySelector('.nav-logout-btn').addEventListener('click', async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.__user = null;
            window.location.reload();
          });
        }
      }
    } catch (e) {
      // Not logged in or server not running — keep Login link
    }
  }
  checkAuthAndUpdateNav();

})();
