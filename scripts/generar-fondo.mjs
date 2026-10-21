// Genera el fondo "marca de agua" del sitio: una foto de Pexels (licencia libre)
// fundida en modo multiply con el crema de la marca, ya horneada en el .webp
// para no pagar mix-blend-mode ni filtros en cada scroll del celular.
// Uso: node scripts/generar-fondo.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const FOTO = 35688473; // Mauricio Krupka Buendia — artistic-shadows-of-vines-on-rustic-wall (ver src/data/creditos.json)
const SALIDA = 'public/img/fondos/enredadera.webp';
const CREMA = [0xF5, 0xEF, 0xE6];
const OPACIDAD = 0.24;   // cuánto se nota la sombra sobre el crema
const SATURACION = 0.6;  // menos color = más "marca de agua"

const url = `https://images.pexels.com/photos/${FOTO}/pexels-photo-${FOTO}.jpeg?auto=compress&cs=tinysrgb&w=1920`;
const res = await fetch(url);
if (!res.ok) throw new Error(`No se pudo descargar la foto (${res.status})`);
const original = Buffer.from(await res.arrayBuffer());

const { data, info } = await sharp(original)
  .resize({ width: 1600, withoutEnlargement: true })
  .modulate({ saturation: SATURACION })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// multiply con opacidad: crema × (1 − a + a × foto)
for (let i = 0; i < data.length; i += 3) {
  for (let c = 0; c < 3; c++) {
    data[i + c] = Math.round(CREMA[c] * (1 - OPACIDAD + OPACIDAD * data[i + c] / 255));
  }
}

await mkdir('public/img/fondos', { recursive: true });
const out = await sharp(data, { raw: info }).webp({ quality: 70 }).toFile(SALIDA);
console.log(`${SALIDA}: ${out.width}×${out.height}, ${(out.size / 1024).toFixed(0)} KB`);
