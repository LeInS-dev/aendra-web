// Exporta la vista pública `catalogo_publico` de Supabase a src/data/productos.json.
// Usa la clave anon (la misma de la web): solo puede leer la vista, nunca costos ni proveedor.
// Uso: node scripts/export-catalogo.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { toPublicProduct } from '../src/lib/catalogo.js';

const cliente = readFileSync('public/js/supabase-client.js', 'utf8');
const url = cliente.match(/https:\/\/[a-z0-9]+\.supabase\.co/)[0];
const clave = cliente.match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/)[0];

const res = await fetch(`${url}/rest/v1/catalogo_publico?select=*`, { headers: { apikey: clave, Authorization: `Bearer ${clave}` } });
if (!res.ok) throw new Error(`Supabase respondió ${res.status}: ${await res.text()}`);
const filas = await res.json();

const productos = filas.map(toPublicProduct)
  .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre, 'es'));

const faltantes = productos.flatMap(p => p.galeria.filter(src => !existsSync('public' + src)).map(src => `${p.slug}: ${src}`));
if (faltantes.length) throw new Error('Fotos que no existen en public/:\n' + faltantes.join('\n'));
const sinFoto = productos.filter(p => !p.galeria.length).map(p => p.slug);
if (sinFoto.length) throw new Error('Productos sin fotos: ' + sinFoto.join(', '));

writeFileSync('src/data/productos.json', JSON.stringify(productos, null, 2) + '\n');
console.log(`src/data/productos.json: ${productos.length} productos`);
