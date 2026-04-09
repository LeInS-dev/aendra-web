/* ========================================
   AENDRA — Checkout (simulado / Culqi-ready)
   ======================================== */

const Checkout = (() => {

  let currentStep = 1;

  function open() {
    const session = sb.auth.getSession ? null : null; // checked async below
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        showToast('Inicia sesion para continuar con tu compra 🔐');
        Auth.open('login');
        return;
      }
      if (Cart.count() === 0) {
        showToast('Tu carrito esta vacio');
        return;
      }
      document.getElementById('checkout-modal').classList.add('open');
      document.getElementById('checkout-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
      goToStep(1);
      renderOrderSummary();
    });
  }

  function close() {
    document.getElementById('checkout-modal').classList.remove('open');
    document.getElementById('checkout-overlay').classList.remove('open');
    document.body.style.overflow = '';
    currentStep = 1;
  }

  function goToStep(step) {
    currentStep = step;
    document.querySelectorAll('.checkout-step').forEach(s =>
      s.classList.toggle('active', parseInt(s.dataset.step) === step));
    document.querySelectorAll('.step-dot').forEach(d =>
      d.classList.toggle('active', parseInt(d.dataset.step) <= step));
  }

  function renderOrderSummary() {
    const items = Cart.get();
    const container = document.getElementById('checkout-summary-items');
    if (!container) return;
    container.innerHTML = items.map(i => `
      <div class="summary-item">
        <span>${i.item_name} × ${i.quantity}</span>
        <span>S/${(i.item_price * i.quantity).toFixed(2)}</span>
      </div>
    `).join('');
    document.getElementById('checkout-summary-total').textContent = `S/${Cart.total().toFixed(2)}`;
  }

  // ---- Card number formatting ----
  function formatCard(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    input.value = v;
  }

  // ---- Simulate payment ----
  async function processPayment(shippingData, cardData) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 2000));

    // Simulate 90% success (for demo)
    const success = Math.random() > 0.1;
    if (!success) throw new Error('Pago rechazado. Verifica los datos de tu tarjeta.');

    return { transactionId: 'SIM-' + Date.now(), status: 'aprobado' };
  }

  async function submitOrder(shippingData, cardData) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('No autenticado');

    const items = Cart.get();
    const total = Cart.total();

    // 1. Process payment (simulado)
    const payment = await processPayment(shippingData, cardData);

    // 2. Insert pedido
    const { data: pedido, error: pedidoError } = await sb.from('pedidos').insert({
      auth_user_id:     session.user.id,
      tipo:             'kit',
      item_name:        items.length === 1 ? items[0].item_name : `Pedido (${items.length} items)`,
      item_price:       total,
      total:            total,
      status:           'pagado',
      payment_status:   payment.status,
      payment_method:   'culqi_simulado',
      shipping_address: shippingData,
      whatsapp_sent:    false
    }).select().single();

    if (pedidoError) throw pedidoError;

    // 3. Insert pedido_items
    const pedidoItems = items.map(i => ({
      pedido_id:  pedido.id,
      tipo:       i.tipo,
      item_name:  i.item_name,
      item_slug:  i.item_slug,
      item_price: i.item_price,
      quantity:   i.quantity,
      image_url:  i.image_url || null
    }));

    await sb.from('pedido_items').insert(pedidoItems);

    // 4. Clear cart
    Cart.clear();

    return pedido;
  }

  function init() {
    document.getElementById('checkout-overlay')?.addEventListener('click', close);
    document.getElementById('checkout-close-btn')?.addEventListener('click', close);

    // Card formatting
    document.getElementById('card-number')?.addEventListener('input', e => formatCard(e.target));
    document.getElementById('card-expiry')?.addEventListener('input', e => formatExpiry(e.target));

    // Step 1 → Step 2
    document.getElementById('btn-to-payment')?.addEventListener('click', () => {
      const form = document.getElementById('shipping-form');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      renderOrderSummary();
      goToStep(2);
    });

    // Step 2 → back
    document.getElementById('btn-back-shipping')?.addEventListener('click', () => goToStep(1));

    // Step 2 → Confirm payment
    document.getElementById('btn-confirm-payment')?.addEventListener('click', async () => {
      const payForm = document.getElementById('payment-form');
      if (!payForm.checkValidity()) { payForm.reportValidity(); return; }

      const btn = document.getElementById('btn-confirm-payment');
      const origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Procesando pago...';

      // Show processing animation
      document.getElementById('payment-processing').style.display = 'flex';
      document.getElementById('payment-form-fields').style.display = 'none';

      const shipping = {
        name:    document.getElementById('shipping-name').value,
        phone:   document.getElementById('shipping-phone').value,
        address: document.getElementById('shipping-address').value,
        city:    document.getElementById('shipping-city').value,
        district: document.getElementById('shipping-district').value
      };

      const card = {
        number: document.getElementById('card-number').value,
        expiry: document.getElementById('card-expiry').value,
        cvv:    document.getElementById('card-cvv').value
      };

      try {
        const pedido = await submitOrder(shipping, card);
        goToStep(3);
        document.getElementById('confirm-order-id').textContent = pedido.id.substring(0, 8).toUpperCase();
        document.getElementById('confirm-total').textContent = `S/${pedido.total.toFixed(2)}`;
      } catch (err) {
        document.getElementById('payment-processing').style.display = 'none';
        document.getElementById('payment-form-fields').style.display = 'block';
        document.getElementById('payment-error').textContent = err.message;
        btn.disabled = false;
        btn.textContent = origText;
      }
    });

    // Done button
    document.getElementById('btn-checkout-done')?.addEventListener('click', () => {
      close();
      showToast('Pedido confirmado. Alejandra se contactara pronto 🤍');
    });
  }

  return { open, close, init };
})();
