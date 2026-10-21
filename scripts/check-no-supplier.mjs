// Falla el build si alguna salida pública deja ver al proveedor o datos privados del catálogo.
// Uso: node scripts/check-no-supplier.mjs dist
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PALABRAS_PROHIBIDAS = ['kwcdn', 'temu', 'goods_id', 'precio_temu', 'margen', 'link_temu', 'variante_temu'];
const EXTENSIONES_TEXTO = new Set(['.html', '.js', '.mjs', '.json', '.css', '.xml', '.txt', '.webmanifest']);

function* archivos(dir) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) yield* archivos(ruta);
    else yield ruta;
  }
}

export function buscarFiltraciones(dir) {
  const hallazgos = [];
  for (const ruta of archivos(dir)) {
    if (!EXTENSIONES_TEXTO.has(extname(ruta).toLowerCase())) continue;
    const texto = readFileSync(ruta, 'utf8').toLowerCase();
    for (const palabra of PALABRAS_PROHIBIDAS) {
      // "temu" también aparece dentro de "precio_temu"/"link_temu"; se reporta solo como palabra suelta
      const patron = palabra === 'temu' ? /(^|[^a-z_])temu([^a-z_]|$)/ : new RegExp(palabra);
      if (patron.test(texto)) hallazgos.push({ archivo: relative(dir, ruta), palabra });
    }
  }
  return hallazgos;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2] || 'dist';
  const hallazgos = buscarFiltraciones(dir);
  if (hallazgos.length) {
    console.error('Datos del proveedor en la salida pública:');
    for (const h of hallazgos) console.error(`  ${h.archivo}: "${h.palabra}"`);
    process.exit(1);
  }
  console.log(`OK: sin datos del proveedor en ${dir}`);
}
