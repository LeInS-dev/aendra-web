import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buscarFiltraciones } from '../scripts/check-no-supplier.mjs';

let dir;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'aendra-dist-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('buscarFiltraciones', () => {
  it('no encuentra nada en un dist limpio', () => {
    writeFileSync(join(dir, 'index.html'), '<img src="/img/productos/funda-1.webp">');
    expect(buscarFiltraciones(dir)).toEqual([]);
  });

  it('detecta el dominio de imágenes del proveedor en HTML anidado', () => {
    mkdirSync(join(dir, 'producto', 'x'), { recursive: true });
    writeFileSync(join(dir, 'producto', 'x', 'index.html'), '<img src="https://img.kwcdn.com/a.jpg">');
    expect(buscarFiltraciones(dir)).toEqual([{ archivo: join('producto', 'x', 'index.html'), palabra: 'kwcdn' }]);
  });

  it('detecta campos privados en JSON y JS sin importar mayúsculas', () => {
    writeFileSync(join(dir, 'datos.json'), '{"precio_temu": 10}');
    writeFileSync(join(dir, 'app.js'), 'const url = "https://www.TEMU.com/goods.html?goods_id=1"');
    const palabras = buscarFiltraciones(dir).map(f => f.palabra).sort();
    expect(palabras).toEqual(['goods_id', 'precio_temu', 'temu']);
  });

  it('ignora archivos binarios como imágenes', () => {
    writeFileSync(join(dir, 'foto.webp'), 'kwcdn temu');
    expect(buscarFiltraciones(dir)).toEqual([]);
  });
});
