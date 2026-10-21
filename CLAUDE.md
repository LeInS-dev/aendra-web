# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: AENDRA

Spanish-language interior design & home mood brand for **Peru**. All content is in Spanish. Founded by **Alejandra Vasquez** (Lima, Peru). The business sells curated product kits, individual home decor products, and interior design consultation services via WhatsApp and an integrated cart/checkout.

**Founder**: Alejandra Vasquez — estudiante de Arquitectura de Interiores (not "diseñadora")  
**Currency**: Peruvian Soles (S/)  
**WhatsApp**: +51 965 104 352  
**Instagram**: @aendra_interiormood  
**Email**: vasquezalejandra669@gmail.com (confirmado por Alejandra 2026-10-21; antes la web decía hola@aendra.com, que no existe)  
**Domain**: www.aendra.lat (hosted on Vercel)  
**Vercel project**: leins-devs-projects/aendra-web  
**GitHub**: https://github.com/LeInS-dev/aendra-web (private)  
**Legacy VPS**: 167.71.127.223 — ya NO se usa (la web se sirvió ahí en puerto 8080 hasta 2026-04-14)

## Estado actual (verificado 2026-10-20)

- Web en vivo en Vercel → https://www.aendra.lat. Lo que está en `origin/master` es lo publicado.
- `robots.txt`, `sitemap.xml`, canonical, og:url y schema ya usan `https://www.aendra.lat/`.
- Supabase estuvo **pausado** por inactividad (plan free) y se reactivó en octubre 2026.
- Las 60 imágenes de Temu (`img.kwcdn.com`) del catálogo siguen cargando.
- Links, costos y variantes de Temu ahora viven en la tabla privada `catalogo_productos` de Supabase (creada 2026-10-20).
- Trabajo en curso en la rama `kits-reales-oct2026` (no hacer push ni deploy a master sin preguntar). Los kits nuevos ya están en `index.html` de esa rama y en la tabla `kits` de Supabase, pero **la web en vivo aún muestra los kits viejos** hasta que se haga merge/deploy.

## Supabase

- **Project ID**: `ffwuvaifwqjpkntfrppm` (region: sa-east-1, São Paulo)
- **Client file**: `js/supabase-client.js` — exports global `sb`
- La web **no lee** catálogo de Supabase: kits, productos y precios son HTML estático en `index.html`. Supabase solo se usa para auth, carrito→pedidos.
- Tables:
  - `kits` (5 rows) — currency: PEN. Sincronizada 2026-10-20 con los kits nuevos (items, price, image_url). Slugs sin prefijo (`mood-cozy`), mientras el carrito usa `kit-mood-cozy`. SQL: `supabase/migrations/20261020_sync_kits_oct2026.sql`
  - `productos` (6 rows) — currency: PEN. **Son 6 CATEGORÍAS** con "precio desde", NO los productos individuales.
  - `catalogo_productos` (31 rows) — **productos individuales con costo y link de Temu**. FK `categoria_id` → `productos`. Columnas generadas: `margen` (= precio_aendra − precio_temu) y `link_temu` (desde `temu_goods_id`). `precio_temu` = costo TOTAL (ya × `unidades_temu`). `estado`: disponible / sin_verificar / no_disponible. `en_web` = tiene tarjeta propia en index.html. **RLS sin políticas → privada** (la clave pública devuelve `[]`). SQL: `supabase/migrations/20261020_create_catalogo_productos.sql`
  - `servicios` (3 rows) — currency: PEN. Mini Asesoría S/25, Moodboard S/40, Lista de Compras S/15.
  - `clientes` — auth_user_id (uuid FK → auth.users), name, email, phone
  - `pedidos` — auth_user_id, tipo, item_name, item_price, total, status, payment_status, payment_method, shipping_address (jsonb), whatsapp_sent
  - `pedido_items` — pedido_id FK, tipo, item_name, item_slug, item_price, quantity, image_url
  - `testimonios` (3 rows) — Lima, Arequipa, Cusco
- RLS enabled on all tables:
  - `kits`, `productos`, `servicios`, `testimonios` — public SELECT only (where active/approved = true)
  - `clientes` — INSERT/SELECT/UPDATE only own record (`auth.uid() = auth_user_id`)
  - `pedidos` — INSERT/SELECT only own records (`auth.uid() = auth_user_id`)
  - `pedido_items` — INSERT/SELECT only for own pedidos (subquery check)
  - No public INSERT without auth — fixed 2026-04-14 (removed permissive "Anyone can create" policies)
- Anon key in `js/supabase-client.js` is intentionally public (Supabase by design) — protection is via RLS

## Tech stack

- **Pure HTML/CSS/JS** — no build step, no framework, no bundler
- **GSAP 3.12.5** via CDN (cdnjs) with SRI hashes — gsap.min.js, ScrollTrigger.min.js, ScrollToPlugin.min.js
- **Supabase JS v2.47.2** via CDN (jsdelivr, pinned exact version) with SRI hash
- Script load order in index.html: Supabase CDN → supabase-client.js → GSAP CDNs → cart.js → auth.js → checkout.js → main.js
- `js/waitlist.js` exists on disk but is **NOT loaded** — waitlist feature was removed

## File structure

```text
REINA/
├── index.html              ← Main landing page (~1650 lines)
├── vercel.json             ← Vercel config (static site, security headers) — ⚠ sin commitear
├── robots.txt, sitemap.xml
├── css/
│   └── styles.css          ← All styles (~1450 lines)
├── js/
│   ├── supabase-client.js  ← Supabase init, exports global `sb`
│   ├── auth.js             ← Auth IIFE module (login/register/logout)
│   ├── cart.js             ← Cart IIFE module (localStorage, XSS-safe DOM methods)
│   ├── checkout.js         ← Checkout IIFE module (3-step, Culqi-ready, demo mode)
│   ├── main.js             ← GSAP animations, cursor, particles, orderKit()/openWhatsApp()
│   └── waitlist.js         ← NO se carga (feature eliminada) — sin commitear
├── assets/images/          ← favicon.svg, og-image.svg, hero-interior.jpg (no hay fotos de kits)
├── pages/                  ← Documentos internos (catálogo, estrategia, reels, plan marketing, marketing/01–07)
├── supabase/migrations/    ← create_waitlist_table.sql — sin commitear
├── *_STRATEGY.md, SEO_PLAN.md, AENDRA_Presentacion_Ventas.pptx ← marketing, sin commitear
└── CLAUDE.md
```

## Landing page sections (index.html)

| Section | ID | Notes |
|---------|-----|-------|
| Navbar | — | Fixed, dark background, hamburger mobile, cart badge + auth buttons |
| Hero | `#hero` | Split-screen con foto de interior (`assets/images/hero-interior.jpg`) |
| About | `#about` | Alejandra's story |
| Gallery Mood | `#mood` | Unsplash images, masonry-style pop-in |
| Kits | `#kits` | 5 kits — **2×2 collage of real product photos** per kit, WhatsApp + Cart CTAs |
| Productos | `#productos` | 6 category cards with **photo carousels** — click navigates to section or opens WA |
| Fundas | `#fundas` | 7 funda de cojín products — real Temu images, 3-image carousel per card |
| Alfombras | `#alfombras` | 5 alfombra products — real Temu images, 3-image carousel per card |
| Velas | `#velas` | 6 vela products — real Temu images, 3-image carousel per card |
| Adornos | `#adornos` | 2 adornos para sala — real Temu images, 3-image carousel per card |
| Servicios | `#services` | 3 services: S/25, S/40, S/15 |
| Cómo Funciona | `#process` | 3 steps + progress line scrub |
| Testimonios | `#testimonials` | Lima, Arequipa, Cusco |
| Contacto | `#contact` | WhatsApp + IG + Email CTAs |
| Footer | — | Copyright 2026 |

## Product pricing (Peruvian Soles)

**Regla**: precio AENDRA = precio de venta en Temu + S/15 → costo Temu = precio web − S/15.
**Fuente de verdad de costos/links/estado: tabla `catalogo_productos`** (revisión 2026-10-20). La tabla de abajo son los precios que muestra la web.

**Cómo verificar un producto en Temu** (sesión iniciada, Temu Perú): comparar el ID de imagen kwcdn del producto con `thumbUrl` de los resultados de `/search_result.html?search_key=…` (vienen en `window.rawData`). Para variantes/stock/envío, leer `rawData` de `/goods.html?goods_id=…` (`normalPriceStr`, `stockQuantity`, `isOnsale`, `deliveryTimeValue`). El precio de búsqueda puede diferir del de la ficha.

### Catálogo individual (20 productos, estático en index.html) — ⚠ 11 ya no se pueden comprar en Temu

| Sección | Producto (nombre en carrito) | slug | Precio web | Costo Temu |
|---|---|---|---|---|
| Fundas | Fundas Felpa Jacquard Geométrico x4 | `funda-felpa-jacquard` | S/59 | S/44 |
| Fundas | Fundas Lino Natural Exterior x4 | `funda-lino-natural` | S/45 | S/29.68 |
| Fundas | Fundas Chenilla Beige Clásico x2 | `funda-chenilla-beige` | S/43 | S/28 |
| Fundas | Fundas Chenilla Texturizada Vintage x2 | `funda-chenilla-vintage` | S/53 | S/38 |
| Fundas | Fundas Beige Marron Rayas Boho x4 | `funda-rayas-boho` | S/71 | S/56 |
| Fundas | Fundas Patrón Geométrico Diamantes x4 | `funda-geometrico-diamantes` | S/48 | S/33 |
| Fundas | Fundas Abstracto Linea Boho Felpa x4 | `funda-abstracto-boho` | S/57 | S/42 |
| Alfombras | Alfombra Vintage Minimalista | `alfombra-vintage-minimalista` | S/82 | S/67 |
| Alfombras | Alfombra Terciopelo Vintage Europea | `alfombra-terciopelo-vintage` | S/107 | S/92 |
| Alfombras | Alfombra Beige Pelo Largo Nórdica | `alfombra-beige-pelo-largo` | S/95 | S/80 |
| Alfombras | Alfombra Vintage Floral | `alfombra-vintage-floral` | S/63 | S/48 |
| Alfombras | Alfombra Bohemia Marroquí Terciopelo | `alfombra-bohemia-terciopelo` | S/66 | S/51 |
| Velas | Velas Escultorica Blancas Estriadas x2 | `velas-escultorica-blanca` | S/63 | S/48.04 |
| Velas | Vela Esfera de Burbujas | `velas-esfera-burbujas` | S/33 | S/18 |
| Velas | Vela Bola Torsionada | `vela-bola-torsionada` | S/34 | S/19 |
| Velas | Velas Esféricas Aromáticas | `velas-esfericas-aromaticas` | S/33 | S/18 |
| Velas | Velas Artísticas Diseño Ondas | `velas-artisticas-ondas` | S/29 | S/14.01 |
| Velas | Velas Aromáticas Hexagonales x2 | `velas-aromaticas-hexagonales` | S/43 | S/28 |
| Adornos | Figuras Elefantes Minimalistas | `figuras-elefantes-minimalistas` | S/101 | S/86 |
| Adornos | Jarron de Cerámica Rústica | `jarron-ceramica-rustica` | S/77 | S/62 |

### Kits (aprobados 2026-10-20 — en rama `kits-reales-oct2026` + tabla `kits`; la web en vivo aún tiene los viejos de S/35–S/150)
Solo productos verificados en Temu el 2026-10-20, ninguno se repite entre kits, entrega 6–19 días hábiles, ahorro del cliente ~10% vs suelto.
Los productos suelto = costo Temu + S/15. Slugs entre paréntesis = filas de `catalogo_productos`.

| Kit | Productos | Suelto | Precio kit | Costo Temu | Ganancia |
|---|---|---|---|---|---|
| Mood Cozy | Velas Cubo de Burbujas x2 (`velas-cubo-burbujas`, S/25) + Fundas Chenilla Camello x2 (`funda-chenilla-camello`, S/45) | S/70 | **S/63** | S/40.05 | S/22.95 |
| Gift Mood | Vela Esférica de Ondas (`vela-esferica-onda`, S/27) + Vela Bola Espiral (`vela-bola-espiral`, S/41) + Fundas Boho Felpa x4 (`funda-boho-felpa-beige`, S/49) | S/117 | **S/105** | S/72.45 | S/32.55 |
| Japandi Edit | Fundas Lino Natural x4 (`funda-lino-natural`, S/45) + Velas Ondas (`velas-artisticas-ondas`, S/29) + Jarrón Cerámica Blanco (`jarron-ceramica-blanco`, S/34) | S/108 | **S/97** | S/62.91 | S/34.09 |
| Sala Aesthetic | Alfombra Vintage 90×150 (`alfombra-vintage-90x150`, S/91) + Fundas Pana Rayas x4 (`funda-pana-rayas-boho`, S/52) + Velas Escultóricas x2 (`velas-escultorica-blanca`, S/63) | S/206 | **S/185** | S/160.83 | S/24.17 |
| Cuarto Dream (Mas Popular) | Alfombra Felpa Beige 120×160 (`alfombra-felpa-beige-120x160`, S/79) + Fundas Jacquard x4 (`funda-jacquard-geometrico`, S/67) + Velas Columna x2 (`velas-columna-estriada`, S/48) + Moodboard Digital (S/40) | S/234 | **S/209** | S/149.51 | S/59.49 |

Nota Cuarto Dream: el Moodboard no tiene costo Temu pero sí tiempo de Alejandra; la ganancia solo por productos físicos es S/19.49.
Nota: Japandi (S/97) quedó más barato que Gift Mood (S/105); se mantuvo el orden de las tarjetas.

### Dónde se repiten los precios/contenido de kits (actualizar TODO junto)
- `#kits`: `data-kit`, `data-price`, `.kit-items`, `.kit-price`, `Cart.add({item_price, image_url})`, fotos de `.kit-collage`
- Schema JSON-LD (`<head>`): 5 `Product` con `description`, `image`, `offers.price`
  - `image` = las 4 URLs kwcdn del collage (antes apuntaba a `assets/images/kits/*.jpg`, que no existe); `transitTime` 6–19 días
- FAQ schema: "¿Cuánto cuestan los kits…?" lista los 5 precios
- Meta description, og:description y description de Organization: "desde S/35"
- Testimonio en `#testimonials`: "Compre el kit de S/90"
- Supabase tabla `kits`

### Servicios
- Mini Asesoría Express — S/25
- Moodboard Digital Personalizado — S/40
- Lista de Compras con Links — S/15

## Cart & Checkout (js/cart.js, js/checkout.js)

- Cart stored in `localStorage` key `aendra_cart`
- Item shape: `{ tipo, item_name, item_slug, item_price, quantity, image_url }`
- Cart sidebar opens on add + nav cart button
- **`renderSidebar()` uses DOM methods only** (createElement + textContent) — never innerHTML with user data
- Image URLs validated with `new URL()` before setting as CSS background
- Max quantity per item: 99
- Checkout requires Supabase session (redirects to login if not authenticated)
- 3-step checkout: Shipping info → Payment (DEMO mode) → Confirmation
- **Payment is fully simulated** — card fields are disabled with "Modo Demo" notice
- On success: inserts into `pedidos` + `pedido_items` tables, clears cart
- **Culqi activation**: replace `processPayment()` body + re-enable card fields in `init()`

## Auth (js/auth.js)

- Supabase email/password auth
- On register: creates auth user + inserts row into `clientes` table
- Navbar shows user's first name when logged in (fetched from `clientes`)
- `Auth.open('login')` / `Auth.open('register')` — call from anywhere
- Password minimum: **8 characters**
- Error messages are generic — never expose raw Supabase error text to users

## Brand design system

```
Colors:
  Dark brown (primary):  #3D1F0D
  Gold (accent):         #B89A6A
  Cream (background):    #F5EFE6
  Beige:                 #E8DDD0
  Medium brown:          #8B5E3C

Typography:
  Primary (body):  Georgia, serif
  Secondary:       Jost, Calibri, Segoe UI (sans-serif)
  Google Fonts:    Jost (300,400,500,600)
```

## CSS conventions (css/styles.css)

- Mobile-first, breakpoints: 480px, 768px, 1024px, 1440px
- `.container { max-width: 1600px; padding: 0 3rem; }` — full-width layout
- `.fundas-grid` — **3-col** → 2 → 2 → 1 responsive (reused for ALL product grids including `#productos`)
- `.funda-card` — product card with `.card-gallery` carousel on top + `.funda-body` below
- `.card-gallery { height: 280px; }` — 3-image carousel with prev/next arrows + dot indicators
- `.kit-collage` — 2×2 CSS grid of 4 real product photos (replaces single Unsplash image)
- `.kit-collage-img` — individual cell, `background-size: cover`
- `.catalogo-section` — generic section wrapper for product catalogs
- `.bg-white` / `.bg-cream` — background helpers for alternating sections
- `.btn-add-cart` / `.funda-btn` — cart buttons

## Carousel system (js/main.js → initGalleries())

- Auto-advances every 4s, pauses on hover
- Touch/swipe support
- Arrow + dot navigation with `stopPropagation()` (prevents triggering card click)
- Used in: `#fundas`, `#alfombras`, `#velas`, `#adornos`, `#productos` (category cards)

## Kit collage pattern

Each kit card uses `.kit-collage` instead of a single `.kit-image`:
```html
<div class="kit-collage">
    <div class="kit-collage-img" style="background-image:url('img1')"></div>
    <div class="kit-collage-img" style="background-image:url('img2')"></div>
    <div class="kit-collage-img" style="background-image:url('img3')"></div>
    <div class="kit-collage-img" style="background-image:url('img4')"></div>
</div>
```

## Animation conventions (GSAP)

- Register plugins: `gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)`
- Load CDNs before `</body>` (no `defer` — scripts need DOM)
- Use `gsap.from()` with `once: true` on ScrollTrigger so elements are visible without JS
- `prefers-reduced-motion` check wraps all animations
- Custom gold cursor (`.cursor-dot`, `.cursor-ring`) — desktop only
- `window.addEventListener('load', () => ScrollTrigger.refresh())` ensures correct positions

## Security implementation

All the following are **already implemented** — do not revert:

### Vercel headers (`vercel.json`)
Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) configured in `vercel.json` for all routes.

### index.html — CDN scripts with SRI (pinned versions)
- Supabase `@2.47.2` with sha384 integrity hash
- GSAP 3.12.5 (gsap, ScrollTrigger, ScrollToPlugin) with sha384 integrity hashes

### js/cart.js — XSS-safe rendering
- `renderSidebar()` uses `createElement` + `textContent` only
- `image_url` validated with `new URL()` — `javascript:` protocol blocked
- Quantity capped at 99

### js/auth.js — Error hardening
- Generic error messages only (no Supabase internals exposed)
- Password minimum: 8 characters

### js/checkout.js — Demo mode + input sanitization
- Card fields disabled with "⚠ Modo Demo" banner
- Shipping fields sanitized (trim, substring, phone regex) before Supabase insert

## Key selectors

- `.kit-card` — 5 kit cards (data-kit, data-price attributes)
- `.kit-collage` — 2×2 photo collage inside each kit card
- `.funda-card` — all product cards (fundas, alfombras, velas, adornos, category cards)
- `.card-gallery` — carousel container (height: 280px)
- `.gallery-slides`, `.gallery-slide`, `.gallery-arrow`, `.gallery-dot` — carousel internals
- `.gallery-item` — mood gallery items
- `.floating-wa` — fixed WhatsApp button bottom-right
- `#cart-badge` — cart item count bubble on nav
- `#auth-modal`, `#cart-sidebar`, `#checkout-modal` — modal/sidebar overlays
- `#payment-demo-notice` — injected by checkout.js init()

## WhatsApp integration

```javascript
function openWhatsApp(product, price) {
    const msg = 'Hola Alejandra, me interesa ' + product + ' (' + price + '). Quisiera mas informacion.';
    window.open('https://wa.me/51965104352?text=' + encodeURIComponent(msg), '_blank');
}
```

## Adding new product sections

Pattern for new Temu-sourced categories:
1. Navigate to each Temu URL in browser, extract `top_gallery_url` param for image
2. AENDRA price = Temu sale price + S/15 (round to nearest integer)
3. Add section using `.catalogo-section` + `.fundas-grid` + `.funda-card` pattern with `.card-gallery` carousels
4. Add to navbar: desktop `<li><a href="#CATEGORY">...</a></li>` + mobile menu `<a href="#CATEGORY">...</a>`
5. Also add a category card in `#productos` section (with real carousel images, `onclick` navigates to section)
6. Deploy + push (see Deployment section)

## Domain & SEO

- **Domain**: `www.aendra.lat` — active, hosted on Vercel with automatic SSL
- **SEO files**: all canonical URLs, og:url, schema markup, robots.txt, sitemap.xml point to `https://www.aendra.lat/`
- **Google Search Console**: submit sitemap at `https://www.aendra.lat/sitemap.xml` and request indexing
- **SEO assets**: `robots.txt`, `sitemap.xml`, `assets/images/favicon.svg`, `assets/images/og-image.svg`

## Business model: reseller intermediaria

Los productos son de Temu (u otras tiendas). AENDRA actúa como intermediaria:

**Flujo operativo cuando entra un pedido:**
1. Cliente llena checkout → pedido guardado en Supabase (`pedidos` + `pedido_items`)
2. Alejandra recibe notificación (WhatsApp o email)
3. Alejandra cobra al cliente (Yape / Plin / transferencia)
4. Alejandra compra el producto en Temu **con la dirección del cliente** (dropshipping directo) o a su dirección propia y reempaca con branding AENDRA
5. Temu / Alejandra envía al cliente
6. Alejandra actualiza `status` del pedido en Supabase Dashboard

**Precio AENDRA** = precio de venta Temu + S/15 de margen

## Plan en curso (octubre 2026)

1. ✅ Actualizar CLAUDE.md con el estado real
2. ✅ Verificar en Temu los 14 productos de los kits → solo 4 seguían disponibles (y la alfombra solo en talla grande); 11 reemplazados por equivalentes
3. ✅ `#kits` de index.html actualizado (textos, precios, data-price, carrito, collage, schema con transitTime 6–19, FAQ, "desde S/63", priceRange)
4. ✅ Tabla `kits` de Supabase sincronizada
5. ✅ Tabla `catalogo_productos` creada (31 filas)

Reglas: mostrar cambios y esperar OK antes de tocar la web o Supabase. No deploy ni push a master sin preguntar.

### Pendientes detectados (octubre 2026)
- **Deploy**: merge de `kits-reales-oct2026` a master (la web en vivo sigue con kits viejos y `kits` de Supabase ya tiene los nuevos).
- **Bug en vivo**: `Waitlist.init()` al final de index.html lanza `ReferenceError` (waitlist.js no se carga) y corta la ejecución → `Checkout.init()` nunca corre (no aparece el aviso "Modo Demo"). Arreglo: quitar esa línea.
- **Catálogo**: 11 productos de `#fundas/#alfombras/#velas/#adornos` ya no se pueden comprar en Temu (`estado = 'no_disponible' and en_web`), 6 sin verificar, Lino/Ondas/Escultóricas ya actualizados a S/45/29/63 (2026-10-21). Los 11 reemplazos nuevos no tienen tarjeta propia.
- **Testimonio** "Compre el kit de S/90" (Valeria Paredes): ya no existe kit de S/90. No se cambió porque falta confirmar si es una cita real.
- Unificar slugs de `kits` (`mood-cozy`) con los del carrito (`kit-mood-cozy`) si se quieren cruzar pedidos con kits.

### Preguntas abiertas
- Bio de Alejandra: el schema FAQ dice "Arquitecta de Interiores egresada de la Universidad de Lima", pero arriba figura como estudiante. Confirmar cuál es la correcta.
- `vercel.json` (headers de seguridad) no está commiteado: si Vercel despliega desde GitHub, esos headers no estarían en vivo. Verificar.

## Pending integrations

- **Cobro real**: integrar Culqi (Peru) o mostrar Yape/Plin al confirmar pedido
  - Culqi: replace `processPayment()` en checkout.js + re-enable card fields en `init()`
- **Notificación automática** al entrar un pedido: email a Alejandra vía Supabase Edge Function o webhook
- **Panel de admin** simple para ver/gestionar pedidos sin entrar a Supabase Dashboard
- **Supabase** dynamic product loading — DB existe pero productos son HTML estático
- **Instagram** page (@aendra_interiormood) — Alejandra crea contenido manualmente

## Deployment (Vercel)

Hosting migrated from VPS (nginx) to **Vercel** on 2026-04-14.

```bash
# Preview deploy (creates isolated URL)
vercel

# Production deploy (pushes to www.aendra.lat)
vercel --prod

# Push to GitHub (Vercel also auto-deploys from GitHub pushes)
git add . && git commit -m "message" && git push origin master
```

- Vercel project: `leins-devs-projects/aendra-web`
- Config: `vercel.json` — static site, no build command, security headers
- Aliases: `www.aendra.lat`, `aendra-web.vercel.app`

## CSS cache busting

CSS and JS links use `?v=N` query strings. Current versions:
- `css/styles.css?v=9`
- `js/main.js?v=3`

Increment version number when deploying CSS/JS changes to bust browser cache.

## No build/test commands

Open `index.html` directly in a browser or visit `https://www.aendra.lat`. No compilation or server required locally.
