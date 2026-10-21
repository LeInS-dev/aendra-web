import { describe, it, expect } from 'vitest';
import { filtrarProductos } from '../src/lib/filtros.js';
import { relacionados } from '../src/lib/relacionados.js';
import { puntuarQuiz, recomendar } from '../src/lib/quiz.js';
import { alternar, mensajeWhatsApp } from '../src/lib/moodboard.js';

const p = (slug, extra = {}) => ({ slug, nombre: slug, categoria: 'velas', precio: 30, ambientes: ['sala'], estilos: ['japandi'], paletas: ['arena-y-lino'], galeria: [], ...extra });
const productos = [
  p('a', { paletas: ['verde-salvia'], categoria: 'velas' }),
  p('b', { paletas: ['verde-salvia', 'arena-y-lino'], categoria: 'fundas-cojines', estilos: ['nordico'] }),
  p('c', { paletas: ['terracota-andina'], categoria: 'velas', ambientes: ['dormitorio'], estilos: ['boho'] }),
];

describe('filtrarProductos', () => {
  it('sin filtros devuelve todos', () => { expect(filtrarProductos(productos, {}).map(x => x.slug)).toEqual(['a', 'b', 'c']); });
  it('filtra por paleta', () => { expect(filtrarProductos(productos, { paleta: 'verde-salvia' }).map(x => x.slug)).toEqual(['a', 'b']); });
  it('combina filtros con Y', () => { expect(filtrarProductos(productos, { paleta: 'verde-salvia', categoria: 'velas' }).map(x => x.slug)).toEqual(['a']); });
  it('un filtro desconocido no devuelve nada', () => { expect(filtrarProductos(productos, { estilo: 'gotico' })).toEqual([]); });
  it('ignora filtros vacíos', () => { expect(filtrarProductos(productos, { paleta: '', ambiente: null })).toHaveLength(3); });
});

describe('relacionados', () => {
  it('excluye el mismo producto y prioriza más coincidencias', () => {
    const lista = [p('x', { paletas: ['verde-salvia'], estilos: ['nordico'] }), ...productos];
    expect(relacionados(lista[0], lista, 2).map(r => r.slug)).toEqual(['b', 'a']);
  });
  it('no devuelve productos sin nada en común', () => {
    const solo = p('z', { paletas: ['noche-japandi'], estilos: ['minimal'] });
    expect(relacionados(solo, [solo, ...productos])).toEqual([]);
  });
});

const quiz = {
  preguntas: [
    { id: 'foto', opciones: [{ id: 'j', puntos: { estilo: { japandi: 3 } } }, { id: 'n', puntos: { estilo: { nordico: 3 } } }] },
    { id: 'col', opciones: [{ id: 'noche', puntos: { paleta: { 'noche-japandi': 3 } } }, { id: 'arena', puntos: { paleta: { 'arena-y-lino': 3 } } }] },
    { id: 'dom', opciones: [{ id: 'vela', puntos: { estilo: { japandi: 1 }, paleta: { 'noche-japandi': 1 } } }, { id: 'des', puntos: { estilo: { nordico: 1 }, paleta: { 'arena-y-lino': 1 } } }] },
    { id: 'esp', opciones: [{ id: 'sala', ambiente: 'sala' }] },
  ],
};
const orden = { estilos: [{ slug: 'japandi' }, { slug: 'nordico' }], paletas: ['arena-y-lino', 'noche-japandi'] };

describe('puntuarQuiz', () => {
  it('elige el estilo y la paleta con más puntos y el ambiente elegido', () => {
    expect(puntuarQuiz(quiz, { foto: 'j', col: 'noche', dom: 'vela', esp: 'sala' }, orden)).toEqual({ estilo: 'japandi', paleta: 'noche-japandi', ambiente: 'sala' });
  });
  it('en empate gana el primero según las taxonomías', () => {
    expect(puntuarQuiz(quiz, { foto: 'n', dom: 'vela', col: 'arena' }, orden).estilo).toBe('nordico');
    expect(puntuarQuiz(quiz, { foto: 'j', dom: 'des' }, orden)).toMatchObject({ estilo: 'japandi', paleta: 'arena-y-lino', ambiente: null });
  });
  it('sin respuestas devuelve los primeros de cada lista', () => {
    expect(puntuarQuiz(quiz, {}, orden)).toEqual({ estilo: 'japandi', paleta: 'arena-y-lino', ambiente: null });
  });
});

describe('recomendar', () => {
  const kits = [{ slug: 'k1', productos: ['c'] }, { slug: 'k2', productos: ['a', 'b'] }];
  it('prioriza paleta, luego estilo y ambiente, máximo 6, y elige el kit con más coincidencias', () => {
    const r = recomendar({ estilo: 'nordico', paleta: 'verde-salvia', ambiente: 'sala' }, productos, kits);
    expect(r.productos.map(x => x.slug)).toEqual(['b', 'a']);
    expect(r.kit.slug).toBe('k2');
  });
});

describe('moodboard', () => {
  it('alternar agrega y quita sin duplicar', () => {
    expect(alternar(['a'], 'b')).toEqual(['a', 'b']);
    expect(alternar(['a', 'b'], 'a')).toEqual(['b']);
  });
  it('arma el mensaje de WhatsApp con nombre, precio y link', () => {
    const m = mensajeWhatsApp([p('a', { nombre: 'Vela A', precio: 30 })], 'https://www.aendra.lat');
    expect(m).toContain('Hola Alejandra');
    expect(m).toContain('• Vela A (S/30) https://www.aendra.lat/producto/a');
  });
  it('corta los mensajes largos y avisa cuántos faltan', () => {
    const muchos = Array.from({ length: 60 }, (_, i) => p('producto-con-nombre-largo-' + i, { nombre: 'Producto con un nombre bastante largo ' + i }));
    const m = mensajeWhatsApp(muchos, 'https://www.aendra.lat');
    expect(m.length).toBeLessThanOrEqual(1800);
    expect(m).toMatch(/…y \d+ más/);
  });
});
