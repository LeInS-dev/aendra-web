/* AENDRA — movimiento suave al hacer scroll.
   El HTML es visible sin JS; aquí solo se agrega la animación de entrada.
   [data-reveal]            aparece con fade + subida
   [data-reveal-hijos]      sus hijos aparecen escalonados
   [data-parallax="0.15"]   la imagen se desplaza más lento que el scroll */
(function () {
  window.__aendraMotion = true;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raiz = document.documentElement;
  if (reducir || !('IntersectionObserver' in window)) {
    raiz.classList.remove('js-motion');
    return;
  }

  document.querySelectorAll('[data-reveal-hijos]').forEach(padre => {
    Array.from(padre.children).forEach((hijo, i) => {
      hijo.setAttribute('data-reveal', '');
      hijo.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
    });
  });

  const io = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  // Red de seguridad: si algo quedó oculto (pestaña en segundo plano, IO que no dispara), mostrarlo
  setTimeout(() => document.querySelectorAll('[data-reveal]:not(.visible)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('visible');
  }), 1500);

  const parallax = Array.from(document.querySelectorAll('[data-parallax]'));
  if (parallax.length) {
    let pendiente = false;
    const mover = () => {
      pendiente = false;
      parallax.forEach(el => {
        const f = parseFloat(el.dataset.parallax) || 0.15;
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        el.style.transform = `translate3d(0, ${(-r.top * f).toFixed(1)}px, 0) scale(1.08)`;
      });
    };
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(mover); } }, { passive: true });
    mover();
  }
})();
