import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const leer = f => JSON.parse(readFileSync(`src/data/${f}.json`, 'utf8'));
const productos = leer('productos');
const paletas = leer('paletas');
const ideas = leer('ideas');
const kits = leer('kits');
const quiz = leer('quiz');
const tax = leer('taxonomias');
const slugs = new Set(productos.map(p => p.slug));
const existeImagen = src => existsSync('public' + src);

describe('contenido de la tienda', () => {
  it('ideas y kits solo citan productos publicados', () => {
    const citados = [...ideas.flatMap(i => i.productos), ...kits.flatMap(k => k.productos)];
    expect(citados.filter(s => !slugs.has(s))).toEqual([]);
  });

  it('todas las imágenes citadas existen en public/', () => {
    const imgs = [
      ...productos.flatMap(p => p.galeria), ...paletas.flatMap(p => p.imagenes), ...ideas.map(i => i.imagen),
      ...kits.flatMap(k => k.imagenes), ...tax.estilos.map(e => e.imagen),
      ...quiz.preguntas.flatMap(q => q.opciones.map(o => o.imagen).filter(Boolean)),
    ];
    expect(imgs.filter(src => !existeImagen(src))).toEqual([]);
  });

  it('cada paleta tiene al menos 6 productos que combinan', () => {
    for (const p of paletas) {
      expect(productos.filter(x => x.paletas.includes(p.slug)).length, p.slug).toBeGreaterThanOrEqual(6);
    }
  });

  it('cada paleta apunta a una idea existente y las etiquetas de productos son conocidas', () => {
    const ideasSlugs = new Set(ideas.map(i => i.slug));
    expect(paletas.filter(p => !ideasSlugs.has(p.idea)).map(p => p.slug)).toEqual([]);
    const validas = {
      ambientes: new Set(tax.ambientes.map(a => a.slug)), estilos: new Set(tax.estilos.map(e => e.slug)),
      paletas: new Set(tax.paletas), categoria: new Set(tax.categorias.map(c => c.slug)),
    };
    const raras = productos.flatMap(p => [
      ...p.ambientes.filter(a => !validas.ambientes.has(a)), ...p.estilos.filter(e => !validas.estilos.has(e)),
      ...p.paletas.filter(x => !validas.paletas.has(x)), ...(validas.categoria.has(p.categoria) ? [] : [p.categoria]),
    ].map(v => `${p.slug}:${v}`));
    expect(raras).toEqual([]);
  });

  it('el precio de cada kit es menor que la suma de sus productos sueltos', () => {
    const precio = Object.fromEntries(productos.map(p => [p.slug, p.precio]));
    for (const k of kits) {
      const suelto = k.productos.reduce((s, sl) => s + precio[sl], 0) + (k.items.some(i => /moodboard/i.test(i)) ? 40 : 0);
      expect(k.precio, k.slug).toBeLessThan(suelto);
    }
  });
});
