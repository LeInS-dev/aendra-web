import { describe, it, expect, beforeAll } from 'vitest';

let C;
beforeAll(async () => {
  await import('../public/js/limpiar-carrito.js'); // script clásico: se registra en globalThis
  C = globalThis.AendraCarrito;
});

const origen = 'https://www.aendra.lat';
const validos = { 'funda-lino-natural': '/img/productos/funda-lino-natural-1.webp', 'kit-mood-cozy': '/img/productos/velas-cubo-burbujas-1.webp' };

describe('AendraCarrito.absoluta', () => {
  it('convierte rutas del sitio en URLs absolutas (cart.js las valida con new URL)', () => {
    expect(C.absoluta('/img/productos/x.webp', origen)).toBe('https://www.aendra.lat/img/productos/x.webp');
  });
  it('deja intactas las URLs que ya son absolutas', () => {
    expect(C.absoluta('https://www.aendra.lat/a.webp', origen)).toBe('https://www.aendra.lat/a.webp');
  });
});

describe('AendraCarrito.limpiar', () => {
  it('quita productos que ya no se venden (carritos guardados del sitio anterior)', () => {
    const items = [
      { item_slug: 'funda-chenilla-beige', item_price: 43, image_url: 'https://img.kwcdn.com/product/x.jpg' },
      { item_slug: 'funda-lino-natural', item_price: 45, image_url: 'https://img.kwcdn.com/product/y.jpg' },
    ];
    const r = C.limpiar(items, validos, origen);
    expect(r.map(i => i.item_slug)).toEqual(['funda-lino-natural']);
  });
  it('reemplaza la foto del proveedor por la foto propia', () => {
    const r = C.limpiar([{ item_slug: 'kit-mood-cozy', image_url: 'https://img.kwcdn.com/product/z.jpg' }], validos, origen);
    expect(r[0].image_url).toBe('https://www.aendra.lat/img/productos/velas-cubo-burbujas-1.webp');
  });
  it('tolera datos corruptos', () => {
    expect(C.limpiar(null, validos, origen)).toEqual([]);
    expect(C.limpiar([null, 3, { sin: 'slug' }], validos, origen)).toEqual([]);
  });
});
