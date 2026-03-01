/* ============================================
   CODZY — cart.js
   Cart management: read/write localStorage,
   render items, quantity stepper, remove, totals
   ============================================ */

(function () {
  'use strict';

  const layout = document.getElementById('cart-layout');
  if (!layout) return;

  function getCart() {
    return JSON.parse(localStorage.getItem('codzy-cart') || '[]');
  }

  function saveCart(cart) {
    localStorage.setItem('codzy-cart', JSON.stringify(cart));
    if (window.updateCartBadge) window.updateCartBadge();
  }

  function render() {
    const cart = getCart();

    if (cart.length === 0) {
      layout.innerHTML = `
        <div class="cart-empty reveal revealed">
          <div class="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any templates yet.</p>
          <a href="templates.html" class="btn btn-primary btn-lg">Browse Templates</a>
        </div>
      `;
      return;
    }

    const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;

    let itemsHTML = cart.map((item, idx) => `
      <div class="cart-item" data-index="${idx}">
        <div class="cart-item-icon" style="background: ${item.gradient || 'var(--bg-card)'};">
          ${item.icon || '📦'}
        </div>
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <p>$${item.price} each</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${idx}, -1)" aria-label="Decrease">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${idx}, 1)" aria-label="Increase">+</button>
        </div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <button class="cart-item-remove" onclick="removeItem(${idx})" aria-label="Remove">✕</button>
      </div>
    `).join('');

    layout.innerHTML = `
      <div class="cart-items">${itemsHTML}</div>
      <div class="cart-summary">
        <h2>Order Summary</h2>
        <div class="summary-row"><span>Subtotal</span><span class="summary-value">$${subtotal.toFixed(2)}</span></div>
        <div class="summary-row"><span>Tax (8%)</span><span class="summary-value">$${tax.toFixed(2)}</span></div>
        <div class="summary-row total"><span>Total</span><span class="summary-value">$${total.toFixed(2)}</span></div>
        <button class="btn btn-primary checkout-btn" onclick="doCheckout()">Proceed to Checkout</button>
        <a href="templates.html" class="continue-shopping">← Continue Shopping</a>
      </div>
    `;
  }

  /* ── Quantity Change ── */
  window.changeQty = function (index, delta) {
    const cart = getCart();
    if (!cart[index]) return;
    cart[index].qty = Math.max(1, cart[index].qty + delta);
    saveCart(cart);
    render();
  };

  /* ── Remove Item ── */
  window.removeItem = function (index) {
    const cartItemEl = document.querySelector(`.cart-item[data-index="${index}"]`);
    if (cartItemEl) {
      cartItemEl.classList.add('removing');
      setTimeout(() => {
        const cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        render();
      }, 300);
    } else {
      const cart = getCart();
      cart.splice(index, 1);
      saveCart(cart);
      render();
    }
  };

  /* ── Checkout ── */
  window.doCheckout = async function () {
    // Check if user is logged in
    if (!window.__user) {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          window.__user = data.user;
        }
      } catch (e) { }
    }

    if (!window.__user) {
      if (window.showToast) window.showToast('Please sign in to checkout', '🔒');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      return;
    }

    const cart = getCart();
    const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;

    // Send order to backend with user ID
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: window.__user.id,
        items: cart,
        subtotal,
        tax,
        total,
      }),
    })
      .then(res => res.json())
      .then(data => {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
        localStorage.removeItem('codzy-cart');
        if (window.updateCartBadge) window.updateCartBadge();
        if (data.orderId && window.showToast) {
          window.showToast(`Order #${data.orderId} confirmed!`, '🎉');
        }
      })
      .catch(() => {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
        localStorage.removeItem('codzy-cart');
        if (window.updateCartBadge) window.updateCartBadge();
      });
  };

  window.closeCheckout = function () {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      render();
    }
  };

  document.getElementById('checkout-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) window.closeCheckout();
  });

  // Initial render
  render();

})();
