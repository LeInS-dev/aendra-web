# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: AENDRA

Tienda peruana de diseño de interiores (todo el contenido en español). Fundadora: **Alejandra Vásquez** — estudiante de Arquitectura de Interiores (no "diseñadora"). Vende piezas de decoración (fundas, mantas, alfombras, velas, jarrones y accesorios), kits, paletas e ideas, y servicios de asesoría por WhatsApp. La clienta **le compra a AENDRA**: el proveedor (hoy Temu) nunca aparece en la web.

**Moneda**: soles (S/) · **WhatsApp**: +51 965 104 352 · **Instagram**: @aendra_interiormood · **Email**: vasquezalejandra669@gmail.com
**Dominio**: www.aendra.lat (Vercel, proyecto `leins-devs-projects/aendra-web`, team `team_DRvXiIWNW9k0pN8RHqD4CGIS`, project `prj_fbvARHgDCkOwqAi66AoKQuVpsdjv`)
**GitHub**: https://github.com/LeInS-dev/aendra-web (privado). Vercel despliega solo desde GitHub: `master` → producción; cualquier otra rama → preview.

## Estado (2026-10-21)

- **En vivo (master)**: sitio anterior de una sola página (`index.html` estático) con los kits nuevos, checkout arreglado, precios y correo actualizados.
- **Rama `fase1-tienda`** (preview en Vercel): la nueva tienda multipágina en Astro. Lista para que Alejandra la revise; **no hacer merge a master sin su OK**.
- Diseño aprobado: `docs/superpowers/specs/2026-10-21-aendra-tienda-design.md` · Plan: `docs/superpowers/plans/2026-10-21-aendra-fase1-tienda.md`.
- Informe de proveedores: `docs/proveedores-2026-10.md` (conclusión: ningún proveedor le gana a Temu en pedidos de 1 unidad).

## Stack (rama fase1-tienda)

- **Astro 7** (sitio estático, `npm run build` → `dist/`), `@astrojs/sitemap`, Vitest. `package.json` es `"type": "module"`.
- `vercel.json`: framework astro, `dist`, headers de seguridad, redirect `/sitemap.xml` → `/sitemap-index.xml`.
- JS heredado sin cambios en `public/js/` (scripts clásicos): `supabase-client.js` (global `sb`), `cart.js` (`const Cart`), `auth.js` (`const Auth`), `checkout.js` (`const Checkout`), `site.js` (`openWhatsApp`, `showToast`, nav, menú móvil, rebote del carrito), `motion.js` (aparición al hacer scroll sin GSAP; sin JS todo queda visible).
- `Base.astro` llama a `Auth.init()`, `Cart.init()`, `Checkout.init()` **cada uno en su propio try/catch** (un error no debe apagar a los demás — así se rompió el checkout con `Waitlist.init()`). Son `const` globales: no existen en `window`.
- Lógica nueva del navegador: scripts empaquetados por Astro que importan funciones puras de `src/lib/` (probadas en `tests/`).
- Supabase JS 2.47.2 por CDN con SRI. Google Fonts: Cormorant Garamond + Jost.

## Comandos

```bash
npm install
npm run build            # genera dist/
npm test                 # Vitest (lógica + contenido + chequeo de proveedor)
npm run check:supplier   # falla si dist/ contiene kwcdn, temu, goods_id, precio_temu, margen...
node scripts/export-catalogo.mjs          # Supabase (vista catalogo_publico) → src/data/productos.json
node scripts/descargar-imagenes.mjs [--solo slug1,slug2] [--hoja hoja.jpg]   # fotos de producto → public/img/productos/
node scripts/descargar-ambientes.mjs [--hoja hoja.jpg]                      # fotos de Pexels (src/data/creditos.json) → public/img/ambientes/
```
Preview local: servir `dist/` (p. ej. `npx http-server dist -c-1 -p 3002`).

## Estructura

```text
src/
  layouts/Base.astro            head/SEO, nav, footer, overlays (carrito/login/checkout), scripts
  components/                   Nav, Footer, Overlays (markup heredado: NO renombrar IDs), ProductoCard, KitCard
  pages/                        index, tienda/, producto/[slug], paletas/ + [slug], ideas/ + [slug], kits, tu-estilo, mi-moodboard, servicios, 404
  lib/                          catalogo.js (toPublicProduct, lista blanca), filtros.js, relacionados.js, quiz.js, moodboard.js
  scripts/interacciones.js      ♡ moodboard (localStorage aendra_moodboard), [data-agregar] → Cart.add, [data-whatsapp], abanico de kits
  data/                         productos.json (GENERADO), kits, paletas, ideas, quiz, taxonomias, creditos
  styles/                       tokens.css, global.css, componentes.css, overlays.css (heredado del carrito/checkout)
public/
  js/                           módulos heredados + site.js + motion.js
  img/productos/<slug>-<n>.webp fotos propias (copiadas del proveedor, sin tablas de medidas ni colores equivocados)
  img/ambientes/*.webp          fotos de Pexels (licencia libre)
datos-privados/imagenes-origen.json   URLs de origen de las fotos (privado; nunca va a dist)
scripts/                        export, descargas, generador SQL, check-no-supplier
supabase/migrations/            todo cambio de BD ejecutado (en el SQL Editor del panel)
tests/                          catalogo, logica, contenido, check-no-supplier
```

## Datos del catálogo

- **Fuente de verdad**: tabla privada `catalogo_productos` (Supabase). La web NO lee Supabase en vivo (el plan free se pausa por inactividad): se exporta a `src/data/productos.json` y se versiona.
- Vista pública `catalogo_publico` (solo `publicado and estado='disponible'`): slug, nombre, categoria (slug de `productos`), precio_aendra, descripcion, ambientes, estilos, paletas, galeria, entrega_dias. `grant select` a anon.
- Columnas privadas: `precio_temu` (costo TOTAL, ya × `unidades_temu`), `margen` (generada), `temu_goods_id`, `link_temu` (generada), `variante_temu`, `estado`, `en_web`, `fecha_revision`, `notas`.
- Taxonomías (slugs): ambientes `sala, dormitorio, comedor, home-office, bano, terraza`; categorías `fundas-cojines, mantas, alfombras, velas, accesorios`; estilos `japandi, nordico, boho, minimal, mediterraneo`; paletas `arena-y-lino, verde-salvia, terracota-andina, noche-japandi`.
- 2026-10-21: 29 productos publicados (Arena y Lino 16, Terracota 10, Noche Japandi 9, Verde Salvia 8).

### Cómo subir un producto nuevo (Alejandra pide, Claude lo hace)
1. Verificar en Temu Perú con la sesión de Alejandra (Chrome): precio de la **variante exacta**, stock y entrega (preferir 6–19 días; evitar envío marítimo 34–58).
   - Búsqueda: `window.rawData` de `/search_result.html?search_key=…` (thumbUrl, priceInfo). Ficha: `rawData` de `/goods.html?goods_id=…` (`normalPriceStr`, `stockQuantity`, `isOnsale`, `specs`, `thumbUrl` por SKU, galería, `deliveryTimeValue`).
   - Para encontrar un producto ya conocido: comparar el ID de imagen kwcdn con `thumbUrl`.
2. Precio AENDRA = costo + S/15 (redondeado).
3. Agregar sus fotos a `datos-privados/imagenes-origen.json`, correr `descargar-imagenes.mjs --solo <slug> --hoja …` y revisar la hoja (fuera tablas de medidas, otros colores u otras tallas).
4. SQL (archivo en `supabase/migrations/`, ejecutar en el SQL Editor del panel — el conector MCP de Supabase de esta máquina NO tiene acceso al proyecto): insert en `catalogo_productos` con costo, variante, goods_id, etiquetas, descripción, galería y `publicado=true`.
5. `node scripts/export-catalogo.mjs` → `npm test` → `npm run build && npm run check:supplier` → commit.

## Kits (src/data/kits.json; tabla `kits` sincronizada)

| Kit | Productos (slugs) | Precio |
|---|---|---|
| Mood Cozy | velas-cubo-burbujas, funda-chenilla-camello | S/63 |
| Gift Mood | vela-esferica-onda, vela-bola-espiral, funda-boho-felpa-beige | S/105 |
| Japandi Edit | funda-lino-natural, velas-artisticas-ondas, jarron-ceramica-blanco | S/97 |
| Sala Aesthetic | alfombra-vintage-90x150, funda-pana-rayas-boho, velas-escultorica-blanca | S/185 |
| Cuarto Dream (más popular) | alfombra-felpa-beige-120x160, funda-jacquard-geometrico, velas-columna-estriada + Moodboard digital (S/40) | S/209 |

La prueba de contenido exige que cada kit cueste menos que sus piezas por separado.

## Carrito y checkout (sin cambios)

- `localStorage` `aendra_cart`; item `{ tipo, item_name, item_slug, item_price, quantity, image_url }`; `item_slug` = slug de `catalogo_productos` (o `kit-…`).
- Checkout de 3 pasos, requiere sesión Supabase, pago **simulado** (Modo Demo: aviso + campos de tarjeta deshabilitados). Al confirmar inserta en `pedidos` + `pedido_items`.
- `renderSidebar()` solo con `createElement`/`textContent`; `image_url` validada con `new URL()`.

## Supabase (`ffwuvaifwqjpkntfrppm`, sa-east-1)

Tablas: `catalogo_productos` (privada, RLS sin políticas), vista `catalogo_publico`, `productos` (categorías), `kits`, `servicios`, `clientes`, `pedidos`, `pedido_items`, `testimonios`. RLS en todas; la clave anon de `public/js/supabase-client.js` es pública por diseño.

## Diseño

Referencia: plantilla **Pietra** (Godly) — suave, acogedora, editorial. Tokens en `src/styles/tokens.css`: café `#3D1F0D`, dorado `#B89A6A`, crema `#F5EFE6`, beige `#E8DDD0`, café medio `#8B5E3C`; serif Cormorant Garamond (titulares grandes, cursiva para acentos) + Jost. Mobile-first. Movimiento suave y respetando `prefers-reduced-motion`.

## Reglas

- No push a `master` ni deploy a producción sin preguntar a Alejandra. Las ramas generan previews.
- Ninguna salida pública muestra proveedor, link, goods_id, costo ni margen (`npm run check:supplier`).
- Fotos: de producto = reales del proveedor; de ambiente = Pexels/Unsplash con licencia libre o IA / fotos de Alejandra. Nunca imágenes de Google/Pinterest.

## Pendientes

- Merge de `fase1-tienda` a `master` tras la revisión de Alejandra.
- Testimonio "Compre el kit de S/90" (Valeria Paredes): sin confirmar si es cita real; se mantiene el texto original.
- Biografía: el sitio antiguo decía "Arquitecta egresada de la U. de Lima"; la nueva web dice estudiante (según esta guía). Confirmar.
- Unificar slugs de la tabla `kits` (`mood-cozy`) con los del carrito (`kit-mood-cozy`).
- Cobro real (Culqi o Yape/Plin), notificación automática de pedidos, panel de admin.
- Fotos propias o ambientadas para los productos más vendidos (las del proveedor se pueden rastrear por búsqueda inversa).
- 3D en Blender (pausado por decisión de Alejandra).
