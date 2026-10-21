// Interacciones comunes del sitio (se empaqueta con Astro y corre después de cart.js/site.js).
import { CLAVE, alternar } from '../lib/moodboard.js';

function leerMoodboard() {
  try { const v = JSON.parse(localStorage.getItem(CLAVE) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function guardarMoodboard(lista) {
  try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* navegación privada: el corazón sigue funcionando en la página */ }
  document.dispatchEvent(new CustomEvent('moodboard:cambio', { detail: lista }));
}

function pintarCorazones(lista) {
  document.querySelectorAll('[data-moodboard]').forEach(b => b.setAttribute('aria-pressed', String(lista.includes(b.dataset.moodboard))));
  const c = document.getElementById('moodboard-contador');
  if (c) { c.textContent = String(lista.length); c.classList.toggle('activo', lista.length > 0); }
}

document.addEventListener('click', e => {
  const corazon = e.target.closest('[data-moodboard]');
  if (corazon) {
    e.preventDefault();
    const lista = alternar(leerMoodboard(), corazon.dataset.moodboard);
    guardarMoodboard(lista);
    corazon.classList.remove('rebote'); void corazon.offsetWidth; corazon.classList.add('rebote');
    if (typeof showToast === 'function') showToast(lista.includes(corazon.dataset.moodboard) ? 'Guardado en tu moodboard ♡' : 'Quitado de tu moodboard');
    return;
  }
  const agregar = e.target.closest('[data-agregar]');
  if (agregar) {
    e.preventDefault();
    try { Cart.add(JSON.parse(agregar.dataset.agregar)); } catch (err) { console.error('No se pudo agregar al carrito', err); }
    return;
  }
  const wa = e.target.closest('[data-whatsapp]');
  if (wa) { e.preventDefault(); openWhatsApp(wa.dataset.whatsapp, wa.dataset.precio || ''); return; }
  const abanico = e.target.closest('[data-abanico]');
  if (abanico) abanico.classList.toggle('abierto');
});

document.addEventListener('moodboard:cambio', e => pintarCorazones(e.detail));
pintarCorazones(leerMoodboard());
window.addEventListener('storage', ev => { if (ev.key === CLAVE) pintarCorazones(leerMoodboard()); });
