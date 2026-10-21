// Descarga las fotos de ambiente listadas en src/data/creditos.json (Pexels) a public/img/ambientes/<archivo>.webp
// Uso: node scripts/descargar-ambientes.mjs [--hoja salida.jpg]
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const SALIDA = 'public/img/ambientes';
const { fotos } = JSON.parse(readFileSync('src/data/creditos.json', 'utf8'));
mkdirSync(SALIDA, { recursive: true });

for (const f of fotos) {
  const destino = `${SALIDA}/${f.archivo}.webp`;
  if (existsSync(destino)) continue;
  const url = `https://images.pexels.com/photos/${f.pexels}/pexels-photo-${f.pexels}.jpeg?auto=compress&cs=tinysrgb&w=2000`;
  const res = await fetch(url);
  if (!res.ok) { console.error(`✗ ${f.archivo}: HTTP ${res.status}`); continue; }
  await sharp(Buffer.from(await res.arrayBuffer())).rotate()
    .resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 74 }).toFile(destino);
  console.log(`✓ ${destino}`);
}

const hoja = process.argv[process.argv.indexOf('--hoja') + 1];
if (process.argv.includes('--hoja')) {
  const T = 300, cols = 5, filas = Math.ceil(fotos.length / cols);
  const tiles = await Promise.all(fotos.map(async (f, k) => ({
    input: await sharp(`${SALIDA}/${f.archivo}.webp`).resize(T, Math.round(T * 0.66), { fit: 'cover' }).toBuffer(),
    left: (k % cols) * T, top: Math.floor(k / cols) * Math.round(T * 0.66),
  })));
  await sharp({ create: { width: cols * T, height: filas * Math.round(T * 0.66), channels: 3, background: '#fff' } })
    .composite(tiles).jpeg({ quality: 70 }).toFile(hoja);
  console.log('Hoja:', hoja);
}
