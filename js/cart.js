/* ========================================
   AENDRA — Cart
   ======================================== */

const Cart = (() => {
  const KEY = 'aendra_cart';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateUI();
  }

  function add(item) {
    // item: { tipo, item_name, item_slug, item_price, quantity, image_url }
    const items = get();
    const existing = items.find(i => i.item_slug === item.item_slug);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...item, quantity: 1 });
    }
    save(items);
    openSidebar();
    showToast(`${item.item_name} agregado al carrito 🛒`);
  }

  function remove(slug) {
    save(get().filter(i => i.item_slug !== slug));
  }

  function updateQty(slug, qty) {
    const items = get();
    const item = items.find(i => i.item_slug === slug);
    if (item) {
      item.quantity = Math.max(1, qty);
      save(items);
    }
  }

  function clear() {
    localStorage.removeItem(KEY);
    updateUI();
  }

  function total() {
    return get().reduce((sum, i) => sum + i.item_price * i.quantity, 0);
  }

  function count() {
    return get().reduce((sum, i) => sum + i.quantity, 0);
  }

  // ---- Sidebar UI ----
  function openSidebar() {
    document.getElementById('cart-sidebar').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    renderSidebar();
  }

  function closeSidebar() {
    document.getElementById('cart-sidebar').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderSidebar() {
    const items = get();
    const list  = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total-amount');
    const emptyEl = document.getElementById('cart-empty');
    const actionsEl = document.getElementById('cart-actions');

    if (items.length === 0) {
      list.innerHTML = '';
      emptyEl.style.display = 'block';
      actionsEl.style.display = 'none';
    } else {
      emptyEl.style.display = 'none';
      actionsEl.style.display = 'flex';
      list.innerHTML = items.map(item => `
        <div class="cart-item" data-slug="${item.item_slug}">
          <div class="cart-item-img" style="background:url('${item.image_url || ''}') center/cover no-repeat; background-color:var(--beige);"></div>
          <div class="cart-item-info">
            <p class="cart-item-name">${item.item_name}</p>
            <p class="cart-item-price">S/${item.item_price}</p>
            <div class="cart-item-qty">
              <button onclick="Cart.updateQty('${item.item_slug}', ${item.quantity - 1})">−</button>
              <span>${item.quantity}</span>
              <button onclick="Cart.updateQty('${item.item_slug}', ${item.quantity + 1})">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="Cart.remove('${item.item_slug}')">✕</button>
        </div>
      `).join('');
    }

    if (totalEl) totalEl.textContent = `S/${total().toFixed(2)}`;
  }

  function updateUI() {
    const badge = document.getElementById('cart-badge');
    const c = count();
    if (badge) {
      badge.textContent = c;
      badge.style.display = c > 0 ? 'flex' : 'none';
    }
    renderSidebar();
  }

  function init() {
    document.getElementById('cart-overlay')?.addEventListener('click', closeSidebar);
    document.getElementById('cart-close-btn')?.addEventListener('click', closeSidebar);
    document.getElementById('nav-cart-btn')?.addEventListener('click', openSidebar);
    document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
      closeSidebar();
      Checkout.open();
    });
    updateUI();
  }

  return { get, add, remove, updateQty, clear, total, count, openSidebar, closeSidebar, renderSidebar, updateUI, init };
})();
