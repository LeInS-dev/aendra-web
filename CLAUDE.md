# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: AENDRA

Spanish-language interior design & home mood brand for **Peru**. All content is in Spanish. Founded by **Alejandra Vasquez** (Lima, Peru). The business sells curated product kits, individual home decor products, and interior design consultation services via WhatsApp and an integrated cart/checkout.

**Founder**: Alejandra Vasquez — estudiante de Arquitectura de Interiores (not "diseñadora")  
**Currency**: Peruvian Soles (S/)  
**WhatsApp**: +51 965 104 352  
**Instagram**: @aendra_interiormood  
**Email**: hola@aendra.com  
**VPS**: 167.71.127.223 — served on port 8080 via nginx (port 80 is used by stock bot scrap-jein)  
**GitHub**: https://github.com/LeInS-dev/aendra-web (private)

## Supabase

- **Project ID**: `ffwuvaifwqjpkntfrppm` (region: sa-east-1, São Paulo)
- **Client file**: `js/supabase-client.js` — exports global `sb`
- Tables:
  - `kits` (5 rows) — currency: PEN
  - `productos` (6 rows) — currency: PEN
  - `servicios` (3 rows) — currency: PEN
  - `clientes` — auth_user_id (uuid FK → auth.users), name, email, phone
  - `pedidos` — auth_user_id, tipo, item_name, item_price, total, status, payment_status, payment_method, shipping_address (jsonb), whatsapp_sent
  - `pedido_items` — pedido_id FK, tipo, item_name, item_slug, item_price, quantity, image_url
  - `testimonios` (3 rows) — Lima, Arequipa, Cusco
- RLS enabled: public read on active/approved rows, public insert on clientes/pedidos/pedido_items
- Anon key in `js/supabase-client.js` is intentionally public (Supabase by design) — protection is via RLS

## Tech stack

- **Pure HTML/CSS/JS** — no build step, no framework, no bundler
- **GSAP 3.12.5** via CDN (cdnjs) with SRI hashes — gsap.min.js, ScrollTrigger.min.js, ScrollToPlugin.min.js
- **Supabase JS v2.47.2** via CDN (jsdelivr, pinned exact version) with SRI hash
- Script load order in index.html: Supabase CDN → supabase-client.js → GSAP CDNs → cart.js → auth.js → checkout.js → main.js
- `js/waitlist.js` exists on disk but is **NOT loaded** — waitlist feature was removed

## File structure

```
REINA/
├── index.html              ← Main landing page (~2000+ lines)
├── css/
│   └── styles.css          ← All styles (~1000+ lines)
├── js/
│   ├── supabase-client.js  ← Supabase init, exports global `sb`
│   ├── auth.js             ← Auth IIFE module (login/register/logout)
│   ├── cart.js             ← Cart IIFE module (localStorage, XSS-safe DOM methods)
│   ├── checkout.js         ← Checkout IIFE module (3-step, Culqi-ready, demo mode)
│   └── main.js             ← GSAP animations, cursor, particles
├── assets/                 ← Static assets
├── AENDRA_Catalogo_Productos.html
├── AENDRA_Estrategia_Crecimiento.html
├── AENDRA_Guion_Reels.html
├── AENDRA_Templates_Instagram.html
└── CLAUDE.md
```

## Landing page sections (index.html)

| Section | ID | Notes |
|---------|-----|-------|
| Navbar | — | Fixed, transparent→solid on scroll, hamburger mobile, cart badge + auth buttons |
| Hero | `#inicio` | 100vh, custom gold cursor, floating particles, parallax glows |
| About | `#nosotros` | Alejandra's story — Arquitecta de Interiores, Unsplash image |
| Gallery Mood | `#galeria` | 7 Unsplash images, masonry-style pop-in |
| Kits | `#kits` | 5 kits — **2×2 collage of real product photos** per kit, WhatsApp + Cart CTAs |
| Productos | `#productos` | 6 category cards with **photo carousels** — click navigates to section or opens WA |
| Fundas | `#fundas` | 8 funda de cojín products — real Temu images, 3-image carousel per card |
| Alfombras | `#alfombras` | 5 alfombra products — real Temu images, 3-image carousel per card |
| Velas | `#velas` | 6 vela products — real Temu images, 3-image carousel per card |
| Adornos | `#adornos` | 2 adornos para sala — real Temu images, 3-image carousel per card |
| Servicios | `#servicios` | 3 services: S/25, S/40, S/15 |
| Cómo Funciona | `#como-funciona` | 3 steps + progress line scrub |
| Testimonios | `#testimonios` | Lima, Arequipa, Cusco |
| Contacto | `#contacto` | WhatsApp + IG + Email CTAs |
| Footer | — | Copyright 2026 |

## Product pricing (Peruvian Soles)

Temu-sourced products: AENDRA price = Temu sale price + S/15

### Kits (each has a 2×2 collage of 4 real product photos)
- Kit Mood Cozy — S/35 (vela burbujas + funda chenilla beige + vela torsionada + funda lino)
- Kit Gift Mood — S/45 (vela escultorica + funda felpa jacquard + vela esfericas + funda boho)
- Kit Japandi Edit — S/75 (funda chenilla vintage + vela hexagonales + funda lino + vela ondas)
- Kit Sala Aesthetic — S/90 (alfombra vintage + funda rayas boho + alfombra floral + funda diamantes)
- Kit Cuarto Dream — S/150 (alfombra terciopelo + vela escultorica + funda felpa + adorno elefantes) — badge "Mas Popular"

### Fundas de Cojín (7 products, S/43–S/71)
Real Temu images from img.kwcdn.com — 3-image carousel per card

### Alfombras (5 products, S/63–S/107)
Real Temu images from img.kwcdn.com — 3-image carousel per card

### Velas (6 products, S/33–S/62)
Real Temu images from img.kwcdn.com — 3-image carousel per card

### Adornos para la Sala (2 products)
- Figuras Elefantes Minimalistas — S/101
- Jarrón de Cerámica Rústica — S/77

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

### nginx VPS (`/etc/nginx/sites-enabled/aendra`)
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://ffwuvaifwqjpkntfrppm.supabase.co wss://ffwuvaifwqjpkntfrppm.supabase.co; frame-ancestors 'none';" always;
```

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

## Pending: Domain Setup & SEO Activation

**CRITICAL**: SEO implementation is complete but USELESS until domain is configured. Google does NOT index sites on raw IPs.

### Current state:
- Site: `http://167.71.127.223:8080` (raw IP — NOT indexed by Google)
- SEO files (robots.txt, sitemap.xml, schema markup) all point to `https://aendra.com/` (does NOT exist yet)

### User action required:
1. **Purchase domain** (recommend aendra.pe for Peru SEO, or aendra.com)
2. **Point DNS A record** to `167.71.127.223`
3. **Provide Claude with**:
   - Domain name purchased
   - SSH access to VPS (root@167.71.127.223)
   - Email for Let's Encrypt SSL certificate

### Once domain is active, Claude will:
1. Configure nginx for new domain (HTTP → HTTPS redirect)
2. Install Let's Encrypt SSL certificate (free)
3. Update ALL SEO files with real domain:
   - `robots.txt` → `https://DOMAIN.COM/sitemap.xml`
   - `sitemap.xml` → all URLs to `https://DOMAIN.COM/...`
   - `index.html` → canonical tag, og:url, schema markup
4. Deploy updated files to VPS
5. Verify SSL and HTTPS redirect

### After nginx + SSL setup:
1. Submit sitemap to Google Search Console: `https://DOMAIN.COM/sitemap.xml`
2. Request indexing for homepage
3. Monitor with `site:DOMAIN.COM` search

### Files created (awaiting domain):
- `robots.txt` — crawler rules
- `sitemap.xml` — 6 pages listed with priorities
- `assets/images/favicon.svg` — brand icon
- `assets/images/og-image.svg` — social media preview (placeholder)

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

## Pending integrations

- **Cobro real**: integrar Culqi (Peru) o mostrar Yape/Plin al confirmar pedido
  - Culqi: replace `processPayment()` en checkout.js + re-enable card fields en `init()`
- **Notificación automática** al entrar un pedido: email a Alejandra vía Supabase Edge Function o webhook
- **Panel de admin** simple para ver/gestionar pedidos sin entrar a Supabase Dashboard
- **Supabase** dynamic product loading — DB existe pero productos son HTML estático
- **Instagram** page (@aendra_interiormood) — Alejandra crea contenido manualmente

## Deployment

```bash
# Deploy single file
scp -o StrictHostKeyChecking=no index.html root@167.71.127.223:/var/www/aendra/
scp -o StrictHostKeyChecking=no css/styles.css root@167.71.127.223:/var/www/aendra/css/

# Deploy all JS
scp -o StrictHostKeyChecking=no js/*.js root@167.71.127.223:/var/www/aendra/js/

# Push to GitHub
git add . && git commit -m "message" && git push origin master
```

## CSS cache busting

CSS and JS links use `?v=N` query strings. Current versions:
- `css/styles.css?v=4`
- `js/main.js?v=2`

Increment version number when deploying CSS/JS changes to bust browser cache.

## No build/test commands

Open `index.html` directly in a browser or visit `http://167.71.127.223:8080`. No compilation or server required locally.
