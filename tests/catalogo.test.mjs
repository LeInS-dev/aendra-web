import { describe, it, expect } from 'vitest';
import { toPublicProduct } from '../src/lib/catalogo.js';

const fila = {
  slug: 'funda-lino-natural',
  nombre: 'Fundas Lino Natural x4',
  categoria: 'fundas-cojines',
  precio_aendra: '45.00',
  descripcion: 'Juego de 4 fundas de lino.',
  ambientes: ['sala', 'terraza'],
  estilos: ['japandi'],
  paletas: ['arena-y-lino'],
  galeria: ['/img/productos/funda-lino-natural-1.webp', '/img/productos/funda-lino-natural-2.webp', '/img/productos/funda-lino-natural-3.webp'],
  entrega_dias: '6-17',
  // campos privados que podrían colarse si alguien amplía la vista
  precio_temu: '29.68', margen: '15.32', temu_goods_id: '601100637213015', link_temu: 'https://www.temu.com/goods.html?goods_id=1', imagenes_origen: ['https://img.kwcdn.com/x.jpg'],
};

describe('toPublicProduct', () => {
  it('convierte el precio a entero en soles', () => {
    expect(toPublicProduct(fila).precio).toBe(45);
  });

  it('solo deja pasar campos públicos', () => {
    expect(Object.keys(toPublicProduct(fila)).sort()).toEqual(
      ['ambientes', 'categoria', 'descripcion', 'entrega', 'estilos', 'galeria', 'nombre', 'paletas', 'precio', 'slug']);
  });

  it('usa listas vacías y entrega por defecto cuando faltan datos', () => {
    const p = toPublicProduct({ slug: 'x', nombre: 'X', categoria: 'velas', precio_aendra: 30 });
    expect(p).toMatchObject({ ambientes: [], estilos: [], paletas: [], galeria: [], descripcion: '', entrega: '6-19' });
  });

  it('descarta imágenes que no son del propio sitio', () => {
    const p = toPublicProduct({ ...fila, galeria: ['https://img.kwcdn.com/a.jpg', '/img/productos/ok.webp'] });
    expect(p.galeria).toEqual(['/img/productos/ok.webp']);
  });
});
