/* AENDRA — normaliza el carrito guardado antes de Cart.init():
   - quita productos que ya no se venden (carritos del sitio anterior)
   - usa siempre la foto propia del sitio, como URL absoluta (cart.js valida con new URL sin base) */
(function (global) {
  function absoluta(url, origen) {
    try { return new URL(url, origen).href; } catch (e) { return ''; }
  }

  function limpiar(items, validos, origen) {
    if (!Array.isArray(items)) return [];
    return items
      .filter(function (it) { return it && typeof it === 'object' && Object.prototype.hasOwnProperty.call(validos, it.item_slug); })
      .map(function (it) { return Object.assign({}, it, { image_url: absoluta(validos[it.item_slug], origen) }); });
  }

  global.AendraCarrito = { absoluta: absoluta, limpiar: limpiar };

  // En el navegador: limpiar lo guardado (window.AENDRA_VALIDOS lo define Base.astro)
  if (typeof window !== 'undefined' && window.AENDRA_VALIDOS) {
    try {
      var guardado = JSON.parse(localStorage.getItem('aendra_cart') || '[]');
      localStorage.setItem('aendra_cart', JSON.stringify(limpiar(guardado, window.AENDRA_VALIDOS, location.origin)));
    } catch (e) { /* sin almacenamiento disponible: nada que limpiar */ }
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
