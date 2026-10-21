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
      item.quantity = Math.min(Math.max(1, qty), 99);
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

    list.innerHTML = '';

    if (items.length === 0) {
      emptyEl.style.display = 'block';
      actionsEl.style.display = 'none';
    } else {
      emptyEl.style.display = 'none';
      actionsEl.style.display = 'flex';

      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.dataset.slug = item.item_slug;

        // Image — validate URL before setting as background
        const imgDiv = document.createElement('div');
        imgDiv.className = 'cart-item-img';
        imgDiv.style.backgroundColor = 'var(--beige)';
        try {
          const url = new URL(item.image_url || '');
          if (['https:', 'http:'].includes(url.protocol)) {
            imgDiv.style.backgroundImage = `url('${url.href}')`;
            imgDiv.style.backgroundSize = 'cover';
            imgDiv.style.backgroundPosition = 'center';
            imgDiv.style.backgroundRepeat = 'no-repeat';
          }
        } catch { /* invalid URL — skip background image */ }

        // Info block
        const infoDiv = document.createElement('div');
        infoDiv.className = 'cart-item-info';

        const nameEl = document.createElement('p');
        nameEl.className = 'cart-item-name';
        nameEl.textContent = item.item_name;

        const priceEl = document.createElement('p');
        priceEl.className = 'cart-item-price';
        priceEl.textContent = `S/${item.item_price}`;

        // Quantity controls
        const qtyDiv = document.createElement('div');
        qtyDiv.className = 'cart-item-qty';

        const minusBtn = document.createElement('button');
        minusBtn.type = 'button';
        minusBtn.textContent = '−';
        minusBtn.addEventListener('click', () => Cart.updateQty(item.item_slug, item.quantity - 1));

        const qtySpan = document.createElement('span');
        qtySpan.textContent = item.quantity;

        const plusBtn = document.createElement('button');
        plusBtn.type = 'button';
        plusBtn.textContent = '+';
        plusBtn.addEventListener('click', () => Cart.updateQty(item.item_slug, item.quantity + 1));

        qtyDiv.append(minusBtn, qtySpan, plusBtn);
        infoDiv.append(nameEl, priceEl, qtyDiv);

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'cart-item-remove';
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => Cart.remove(item.item_slug));

        div.append(imgDiv, infoDiv, removeBtn);
        list.appendChild(div);
      });
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
