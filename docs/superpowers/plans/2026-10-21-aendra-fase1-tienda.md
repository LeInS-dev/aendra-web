# AENDRA Fase 1 — Tienda de diseño de interiores · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir aendra.lat de una landing estática a una tienda de diseño de interiores multipágina (Inicio, Tienda, Producto, Paletas, Ideas, Kits, Test de estilo, Mi moodboard, Servicios) con estética "Pietra" suave y acogedora.

**Architecture:** Sitio estático generado con Astro en el mismo repo. Las páginas se construyen desde archivos JSON en `src/data/`; el catálogo (`productos.json`) se exporta desde una vista pública de Supabase (`catalogo_publico`, sin costos ni proveedor) con un script; las imágenes se alojan en `public/img/`. Los módulos JS existentes (carrito, login, checkout) se reutilizan sin cambios en `public/js/`; la lógica nueva del navegador (filtros, test, moodboard) son funciones puras en `src/lib/` probadas con Vitest.

**Tech Stack:** Astro 7, `@astrojs/sitemap`, Vitest, GSAP 3.12.5 (CDN con SRI, como hoy), Supabase JS 2.47.2 (CDN con SRI), Node 24, Vercel (Git integration, rama → preview).

**Spec:** `docs/superpowers/specs/2026-10-21-aendra-tienda-design.md`

## Global Constraints

- Idioma español; precios `S/` enteros; regla precio = costo Temu + S/15 redondeado.
- Paleta: café `#3D1F0D`, dorado `#B89A6A`, crema `#F5EFE6`, beige `#E8DDD0`, café medio `#8B5E3C`. Tipos: Cormorant Garamond (serif) + Jost (sans).
- Mobile-first; `prefers-reduced-motion` desactiva animaciones.
- **Ninguna salida pública** (HTML, JSON, JS en `dist/`) contiene: `kwcdn`, `temu`, `goods_id`, `precio_temu`, `margen`, `link_temu`, `variante_temu`.
- Carrito: `localStorage` `aendra_cart`, item `{ tipo, item_name, item_slug, item_price, quantity, image_url }`; `item_slug` = `slug` de `catalogo_productos`.
- WhatsApp +51 965 104 352; Instagram @aendra_interiormood; email vasquezalejandra669@gmail.com.
- Dominio canónico `https://www.aendra.lat`. Nada se publica en producción sin merge a `master`; el trabajo vive en la rama `fase1-tienda` (preview de Vercel).
- Mantener: SRI en CDNs, `renderSidebar()` sin innerHTML, Modo Demo del checkout, RLS.
- Imágenes de ambiente: Unsplash/Pexels (licencia libre) o entregadas por Alejandra. Fotos genéricas no llevan puntos sobre objetos: tira "Para lograr este look".

## Review Focus

- Producto sin galería completa (1–2 fotos) → la página de producto muestra las que haya, sin huecos ni imágenes rotas.
- Moodboard con un producto que ya no existe en `productos.json` (guardado antes de despublicarlo) → se ignora en silencio, sin romper la página.
- Filtros de la tienda sin resultados → mensaje "No encontramos piezas con esos filtros" y botón para limpiar.
- Mensaje de WhatsApp del moodboard con muchos productos → el link sigue funcionando (texto bajo ~1800 caracteres; si se pasa, se corta con "y N más").
- Página abierta sin JavaScript o con GSAP bloqueado → todo el contenido visible (las animaciones solo agregan movimiento).

---

### Task 1: Base Astro + layout compartido + chequeo de proveedor

**Files:**
- Create: `astro.config.mjs`, `src/layouts/Base.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/Overlays.astro` (auth, cart, checkout: markup copiado tal cual de `index.html` líneas 1480–1607), `src/styles/tokens.css`, `src/styles/global.css`, `scripts/check-no-supplier.mjs`, `vitest.config.mjs`, `vercel.json` (versionado)
- Move: `js/*.js` → `public/js/` (sin `waitlist.js`), `assets/` → `public/assets/`, `robots.txt`, `google404d110745b67324.html` → `public/`
- Modify: `package.json` (scripts `dev`, `build`, `preview`, `test`, `check:supplier`; deps `astro`, `@astrojs/sitemap`, `vitest`)
- Delete del build: `index.html`, `css/styles.css`, `sitemap.xml` (los reemplaza Astro; quedan en el historial)

**Interfaces:**
- Produces: `<Base title description canonicalPath ogImage? schema?>` con slot; carga en orden Supabase CDN → `/js/supabase-client.js` → GSAP CDN → `/js/cart.js` → `/js/auth.js` → `/js/checkout.js` → `/js/site.js` y llama `Auth.init(); Cart.init(); Checkout.init();`. `public/js/site.js` = `main.js` sin las partes del hero/galería viejos, conserva `openWhatsApp(product, price)`.

- [ ] Step 1: `scripts/check-no-supplier.mjs` recorre `dist/**/*.{html,js,json,css}` y sale con código 1 listando archivo + palabra si encuentra alguna de las prohibidas (Global Constraints). Probar creando `dist/x.html` con "kwcdn" → falla; borrarlo → pasa.
- [ ] Step 2: Configurar Astro (`site: 'https://www.aendra.lat'`, integración sitemap, `trailingSlash: 'never'`, `build.format: 'directory'`), `vercel.json` con `framework: "astro"`, `buildCommand: "npm run build"`, `outputDirectory: "dist"` y los 3 headers actuales.
- [ ] Step 3: `Base.astro` + Nav (Inicio, Tienda, Ideas, Paletas, Kits, Tu estilo, ♡ Moodboard con contador, carrito) + Footer + Overlays. Página temporal `src/pages/index.astro` con "Hola".
- [ ] Step 4: `npm run build && npm run check:supplier` → pasa. Abrir `npm run preview`: carrito abre, login abre, checkout muestra Modo Demo, consola sin errores.
- [ ] Step 5: Commit `feat: base Astro con layout compartido`.

### Task 2: Catálogo desde Supabase (vista pública + export + imágenes propias)

**Files:**
- Create: `supabase/migrations/20261021_catalogo_publico.sql`, `scripts/export-catalogo.mjs`, `src/lib/catalogo.js`, `tests/catalogo.test.js`, `src/data/productos.json`, `public/img/productos/`

**Interfaces:**
- Migración: agrega a `catalogo_productos` `descripcion text`, `ambientes text[]`, `estilos text[]`, `paletas text[]`, `imagenes_origen text[]` (privado), `galeria text[]` (rutas `/img/productos/<slug>-<n>.webp`), `publicado boolean default false`; crea vista `catalogo_publico` (slug, nombre, categoria slug, precio_aendra, descripcion, ambientes, estilos, paletas, galeria, entrega_dias, variante pública = null) solo `where publicado`; `grant select on catalogo_publico to anon`.
- Produces: `toPublicProduct(row) -> { slug, nombre, categoria, precio, descripcion, ambientes, estilos, paletas, galeria, entrega }` (precio entero); `productos.json` = array ordenado por categoría y nombre.
- Export: `node scripts/export-catalogo.mjs` lee la vista con la clave anon de `public/js/supabase-client.js`; las imágenes se bajan con `node scripts/export-catalogo.mjs --imagenes <archivo-privado.json>` desde un JSON local fuera del repo (slug → URLs de origen), las convierte a webp 1200px (sharp) en `public/img/productos/`.

- [ ] Step 1: Test `toPublicProduct` — fila con `precio_aendra: "45.00"`, `galeria` de 3 → `precio === 45`; y `Object.keys(result)` no contiene `precio_temu`, `margen`, `temu_goods_id`, `link_temu`, `imagenes_origen`. Correr → falla.
- [ ] Step 2: Implementar `src/lib/catalogo.js`. Test pasa.
- [ ] Step 3: Ejecutar la migración en el SQL Editor del panel; cargar en `catalogo_productos` etiquetas, descripción, galería y `publicado=true` para los productos vigentes (los 14 verificados; los `sin_verificar` tras Task 4; los 11 `no_disponible` quedan `publicado=false`).
- [ ] Step 4: Correr export (imágenes + JSON); `productos.json` sin palabras prohibidas.
- [ ] Step 5: Commit.

### Task 3: Contenido — paletas, ideas, kits, test, ambientes

**Files:**
- Create: `src/data/paletas.json`, `src/data/ideas.json`, `src/data/kits.json`, `src/data/taxonomias.json` (ambientes, categorías, estilos con slug + nombre), `src/data/quiz.json`, `src/data/creditos.json`, `public/img/ambientes/*.webp`

**Interfaces:**
- `paletas.json`: `[{ slug, nombre, frase, colores: [{ nombre, hex }] (5), imagenes: [ruta], idea: slugIdea }]` para `arena-y-lino`, `verde-salvia`, `terracota-andina`, `noche-japandi`.
- `ideas.json`: `[{ slug, titulo, bajada, imagen, paleta, estilo, ambiente, productos: [slug], texto: [párrafos] }]` — 4 ideas, una por paleta.
- `kits.json`: los 5 kits del 2026-10-20 `{ slug: 'kit-mood-cozy'…, nombre, badge, precio, items: [texto], productos: [slug], imagenes: [4 rutas], destacado }`.
- `quiz.json`: `{ preguntas: [{ id, texto, opciones: [{ id, texto, imagen, puntos: { estilo?: {slug: n}, paleta?: {slug: n} } }] }] }` — 4 preguntas.

- [ ] Step 1: Bajar 8–12 fotos de ambientes de Unsplash (licencia Unsplash) acordes a cada paleta, a webp 1600px; registrar autor + URL en `creditos.json`.
- [ ] Step 2: Escribir los JSON. Un test `tests/contenido.test.js`: todo slug citado en ideas/kits/paletas existe en `productos.json`; toda imagen citada existe en `public/`; cada paleta tiene ≥ 6 productos (`productos.filter(p => p.paletas.includes(slug))`). Debe pasar al terminar Task 4.
- [ ] Step 3: Commit.

### Task 4: Productos para las 4 paletas (Temu)

- [ ] Buscar en Temu Perú (sesión de Alejandra en Chrome) productos para que cada paleta tenga ≥ 6: Verde Salvia (fundas salvia, jarrón verde, vela salvia, planta artificial, manta), Terracota Andina (fundas terracota, jarrón terracota, alfombra yute/óxido, vela canela), Noche Japandi (cerámica negra/carbón, madera oscura). Criterios: ★ ≥ 4.6, stock, envío 6–19 días, foto sin texto. Verificar también los 6 `sin_verificar`.
- [ ] Insertar en `catalogo_productos` (SQL en el panel, archivo en `supabase/migrations/`), con costo, variante, link, etiquetas, `publicado=true`; guardar URLs de imágenes en el JSON privado; re-export (Task 2 Step 4). `tests/contenido.test.js` pasa.
- [ ] Commit.

### Task 5: Sistema visual y movimiento

**Files:** `src/styles/tokens.css`, `src/styles/global.css`, `src/components/{Button,SectionHeading,Reveal}.astro`, `public/js/motion.js`

- [ ] Tokens: colores de marca, `--radius-soft: 18px`, escala tipográfica serif display (clamp 3rem→7rem), espaciado generoso, sombras suaves.
- [ ] `motion.js`: `[data-reveal]` aparece con fade/slide al entrar en viewport (IntersectionObserver + GSAP); `[data-split]` titulares línea por línea; salida inmediata si `prefers-reduced-motion` o si falta GSAP (contenido visible por defecto). Microinteracciones: `.cart-bump` (rebote del ícono al `Cart.add`), check de éxito.
- [ ] Commit.

### Task 6: Inicio
**Files:** `src/pages/index.astro`, `src/components/{Hero,Manifesto,Stats,EntryGrid,KitFan,Testimonials}.astro`
- [ ] Hero foto cálida a pantalla completa + "Transforma *tu* espacio" + botón "Ver la tienda"; frase gigante; historia de Alejandra (estudiante de Arquitectura de Interiores); cifras ("5 kits · N piezas · envíos a todo Perú · desde S/63", N = `productos.length`); accesos a Tienda/Ideas/Paletas/Kits/Test; kits destacados; testimonios actuales (sin cambiar su texto). Schema `Organization` + `LocalBusiness` portados (email nuevo, `priceRange` "S/25 - S/209").
- [ ] Build + check proveedor + revisión visual móvil (375px) y escritorio. Commit.

### Task 7: Tienda con filtros
**Files:** `src/pages/tienda/index.astro`, `src/components/{ProductCard,HeartButton,Filters}.astro`, `src/lib/filtros.js`, `public/js/tienda.js`, `tests/filtros.test.js`
**Interfaces:** `filtrarProductos(productos, { ambiente?, categoria?, estilo?, paleta? }) -> producto[]` (AND entre filtros, sin filtro = todos); estado en la URL (`?paleta=verde-salvia`).
- [ ] Tests: sin filtros → todos; `{paleta:'verde-salvia'}` → solo los que la incluyen; `{paleta:'verde-salvia', categoria:'velas'}` → intersección; filtro inexistente → `[]`. Implementar. Tarjeta: foto, nombre, precio, ♡, "+ Carrito" (`Cart.add` con el shape del carrito). Vacío → mensaje + "Limpiar filtros". Commit.

### Task 8: Página de producto
**Files:** `src/pages/producto/[slug].astro`, `src/components/Gallery.astro`, `src/lib/relacionados.js`, `tests/relacionados.test.js`
**Interfaces:** `relacionados(producto, productos, n=4) -> producto[]` (comparte paleta o estilo, excluye el mismo, prioriza más coincidencias).
- [ ] Tests de `relacionados`. Página: galería (1–3 fotos, sin huecos), nombre, precio, descripción, entrega "6–19 días hábiles" (o la del producto), "+ Carrito", "Pedir por WhatsApp" (`openWhatsApp(nombre, 'S/'+precio)`), ♡, "Combina con", kits que lo incluyen, schema `Product` (precio, PEN, imagen absoluta del sitio). Commit.

### Task 9: Paletas · Task 10: Ideas · Task 11: Kits
- [ ] Paletas: índice con muestras; página por paleta (colores con nombre y hex copiable, imagen, productos que combinan vía `filtrarProductos({paleta})`, idea relacionada).
- [ ] Ideas: índice; página por idea (imagen grande, texto, tira "Para lograr este look" con sus productos y "Agregar todo al carrito").
- [ ] Kits: página con los 5 kits; `KitFan` abre en abanico las 4 fotos al tocar/hover; "+ Carrito" con `tipo:'kit'` y slug `kit-…`, WhatsApp con nombre y precio. Commit por página.

### Task 12: Test "¿Cuál es tu mood?"
**Files:** `src/pages/tu-estilo.astro`, `src/lib/quiz.js`, `public/js/quiz.js`, `tests/quiz.test.js`
**Interfaces:** `puntuarQuiz(quiz, respuestas: {preguntaId: opcionId}) -> { estilo, paleta }` (mayor puntaje; empate → primero en el orden de `taxonomias.json`); `recomendar(resultado, productos, kits) -> { productos: producto[≤6], kit }`.
- [ ] Tests: respuestas que suman más a japandi/noche-japandi → `{estilo:'japandi', paleta:'noche-japandi'}`; empate → orden de taxonomías; respuestas incompletas → igual devuelve resultado con lo respondido. Página: una pregunta por pantalla con fotos, resultado con productos, kit y "Guardar en mi moodboard". Commit.

### Task 13: Mi moodboard
**Files:** `src/pages/mi-moodboard.astro`, `src/lib/moodboard.js`, `public/js/moodboard.js`, `tests/moodboard.test.js`
**Interfaces:** storage `localStorage['aendra_moodboard'] = [slug]`; `alternar(lista, slug) -> lista`; `mensajeWhatsApp(productos, baseUrl) -> string` ("Hola Alejandra, armé mi moodboard en AENDRA: …" una línea por producto "• Nombre (S/precio) baseUrl/producto/slug"; si supera 1800 caracteres, corta y agrega "…y N más").
- [ ] Tests (incluye el caso largo y slugs desconocidos ignorados). Página lee `productos.json` embebido, muestra el tablero, botón "Enviar a Alejandra por WhatsApp", links a servicios. Contador ♡ en el nav. Commit.

### Task 14: Servicios, 404, SEO
- [ ] `servicios.astro` (3 servicios + cómo funciona + contacto), `404.astro`, `robots.txt` apuntando a `/sitemap-index.xml`, canonical/og por página. Commit.

### Task 15: Verificación final y preview
- [ ] `npm test` verde; `npm run build && npm run check:supplier` verde.
- [ ] Navegador: móvil 375px y escritorio — inicio, tienda (filtros), producto (carrito suma, checkout con Modo Demo), paletas, ideas, kits (abanico), test, moodboard (WhatsApp link), consola sin errores.
- [ ] Push de `fase1-tienda` → preview de Vercel; verificar el preview en vivo.
- [ ] Actualizar `CLAUDE.md` (stack Astro, comandos, cómo subir productos). Commit + push.
