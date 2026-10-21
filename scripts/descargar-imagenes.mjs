// Descarga las fotos de producto del proveedor y las guarda como WebP propios en public/img/productos/.
// Uso: node scripts/descargar-imagenes.mjs [--solo slug1,slug2] [--hoja salida.jpg]
//   --hoja arma una hoja de contacto (todas las fotos generadas) para revisarlas a ojo.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const BASE = 'https://img.kwcdn.com/product/';
const SALIDA = 'public/img/productos';
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const solo = opt('--solo')?.split(',');
const hoja = opt('--hoja');

const fuentes = JSON.parse(readFileSync('datos-privados/imagenes-origen.json', 'utf8'));
mkdirSync(SALIDA, { recursive: true });

const generadas = [];
for (const [slug, rutas] of Object.entries(fuentes)) {
  if (slug.startsWith('_') || (solo && !solo.includes(slug))) continue;
  for (const [i, ruta] of rutas.entries()) {
    const destino = join(SALIDA, `${slug}-${i + 1}.webp`);
    if (!existsSync(destino)) {
      const res = await fetch(BASE + ruta);
      if (!res.ok) { console.error(`✗ ${slug} #${i + 1}: HTTP ${res.status}`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      await sharp(buf).rotate().resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 }).toFile(destino);
      console.log(`✓ ${destino}`);
    }
    generadas.push({ slug, n: i + 1, destino });
  }
}

if (hoja) {
  const T = 220, cols = 6;
  const filas = Math.ceil(generadas.length / cols);
  const tiles = await Promise.all(generadas.map(async (g, k) => ({
    input: await sharp(g.destino).resize(T, T, { fit: 'cover' }).toBuffer(),
    left: (k % cols) * T, top: Math.floor(k / cols) * T,
  })));
  await sharp({ create: { width: cols * T, height: filas * T, channels: 3, background: '#ffffff' } })
    .composite(tiles).jpeg({ quality: 70 }).toFile(hoja);
  writeFileSync(hoja + '.txt', generadas.map((g, k) => `${k}\t${g.slug}-${g.n}`).join('\n'));
  console.log(`Hoja: ${hoja} (${generadas.length} fotos)`);
}
