/* AENDRA — comportamiento común del sitio: WhatsApp, avisos, nav, menú móvil */

function openWhatsApp(product, price) {
  const msg = 'Hola Alejandra, me interesa ' + product + ' (' + price + '). Quisiera más información.';
  window.open('https://wa.me/51965104352?text=' + encodeURIComponent(msg), '_blank', 'noopener');
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

(function () {
  const nav = document.getElementById('navbar');
  if (nav && nav.dataset.sobreFoto) {
    const actualizar = () => nav.classList.toggle('nav--solida', window.scrollY > 60);
    actualizar();
    window.addEventListener('scroll', actualizar, { passive: true });
  }

  const hamb = document.getElementById('nav-hamburguesa');
  const menu = document.getElementById('menu-movil');
  if (hamb && menu) {
    const cerrar = () => {
      document.body.classList.remove('menu-abierto');
      hamb.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    hamb.addEventListener('click', () => {
      const abierto = document.body.classList.toggle('menu-abierto');
      hamb.setAttribute('aria-expanded', String(abierto));
      menu.setAttribute('aria-hidden', String(!abierto));
      document.body.style.overflow = abierto ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrar));
  }

  const wa = document.querySelector('.floating-wa');
  if (wa) {
    const mostrar = () => wa.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
    mostrar();
    window.addEventListener('scroll', mostrar, { passive: true });
  }

  // El ícono del carrito rebota cuando cambia la cantidad (cart.js actualiza #cart-badge)
  const badge = document.getElementById('cart-badge');
  const boton = document.getElementById('nav-cart-btn');
  if (badge && boton && 'MutationObserver' in window) {
    let anterior = badge.textContent;
    new MutationObserver(() => {
      if (badge.textContent !== anterior && Number(badge.textContent) > Number(anterior || 0)) {
        boton.classList.remove('rebote'); void boton.offsetWidth; boton.classList.add('rebote');
      }
      anterior = badge.textContent;
    }).observe(badge, { childList: true, characterData: true, subtree: true });
  }
})();
