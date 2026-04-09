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

## Tech stack

- **Pure HTML/CSS/JS** — no build step, no framework, no bundler
- **GSAP 3.12.5** via CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/`
  - gsap.min.js, ScrollTrigger.min.js, ScrollToPlugin.min.js
- **Supabase JS v2** via CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Script load order in index.html: Supabase CDN → supabase-client.js → GSAP CDNs → cart.js → auth.js → checkout.js → main.js

## File structure

```
REINA/
├── index.html              ← Main landing page (~1900+ lines)
├── css/
│   └── styles.css          ← All styles (~950+ lines)
├── js/
│   ├── supabase-client.js  ← Supabase init, exports global `sb`
│   ├── auth.js             ← Auth IIFE module (login/register/logout)
│   ├── cart.js             ← Cart IIFE module (localStorage)
│   ├── checkout.js         ← Checkout IIFE module (3-step, Culqi-ready)
│   └── main.js             ← GSAP animations, cursor, particles
├── assets/                 ← Static assets
├── AENDRA_Catalogo_Productos.html   ← Print-friendly catalog
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
| Kits | `#kits` | 5 kits with S/ prices, Unsplash images, WhatsApp + Add to Cart CTAs |
| Productos | `#productos` | 6 individual product categories with S/ prices |
| Fundas | `#fundas` | 8 funda de cojín products — real Temu images (kwcdn.com) |
| Alfombras | `#alfombras` | 5 alfombra products — real Temu images |
| Velas | `#velas` | 6 vela products — real Temu images |
| Adornos | `#adornos` | 2 adornos para sala — real Temu images |
| Servicios | `#servicios` | 3 services: S/25, S/40, S/15 |
| Cómo Funciona | `#como-funciona` | 3 steps + progress line scrub |
| Testimonios | `#testimonios` | Lima, Arequipa, Cusco |
| Contacto | `#contacto` | WhatsApp + IG + Email CTAs |
| Footer | — | Copyright 2026 |

## Product pricing (Peruvian Soles)

Temu-sourced products: AENDRA price = Temu sale price + S/15

### Kits
- Kit Mood Cozy — S/35
- Kit Gift Mood — S/45
- Kit Japandi Edit — S/75
- Kit Sala Aesthetic — S/90
- Kit Cuarto Dream — S/150 (badge: "Más Popular")

### Fundas de Cojín (8 products, S/28–S/56)
Real Temu images from img.kwcdn.com

### Alfombras (5 products, S/63–S/107)
Real Temu images from img.kwcdn.com

### Velas (6 products, S/33–S/62)
Real Temu images from img.kwcdn.com

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
- Checkout requires Supabase session (redirects to login if not authenticated)
- 3-step checkout: Shipping info → Payment (simulated) → Confirmation
- On success: inserts into `pedidos` + `pedido_items` tables, clears cart
- **Culqi activation**: replace only the `processPayment()` function body in checkout.js

## Auth (js/auth.js)

- Supabase email/password auth
- On register: creates auth user + inserts row into `clientes` table
- Navbar shows user's first name when logged in (fetched from `clientes`)
- `Auth.open('login')` / `Auth.open('register')` — call from anywhere

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
- `.fundas-grid` — 4-col → 3 → 2 → 1 responsive (reused for all product grids)
- `.funda-card`, `.funda-img`, `.funda-body`, `.funda-price`, `.funda-btn` — product card classes
- `.catalogo-section` — generic section wrapper for product catalogs
- `.bg-white` / `.bg-cream` — background helpers for alternating sections
- `.btn-add-cart` — gold cart button used across all product sections

## Animation conventions (GSAP)

- Register plugins: `gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)`
- Load CDNs before `</body>` (no `defer` — scripts need DOM)
- Use `gsap.from()` so elements are visible without JS
- `prefers-reduced-motion` check wraps all animations
- Custom gold cursor (`.cursor-dot`, `.cursor-ring`) — desktop only
- All scroll animations use `ScrollTrigger`

## Key selectors

- `.kit-card` — 5 kit cards (data-kit, data-price attributes)
- `.product-card` — all individual product cards (kits, fundas, alfombras, velas, adornos)
- `.gallery-item` — mood gallery items
- `.floating-wa` — fixed WhatsApp button bottom-right
- `#cart-badge` — cart item count bubble on nav
- `#auth-modal`, `#cart-sidebar`, `#checkout-modal` — modal/sidebar overlays

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
2. Run JS in browser console to get sale price: `[...document.querySelectorAll('*')].filter(el => el.children.length === 0 && el.textContent.match(/S\/\s*\d+/)).map(el => el.textContent.trim()).slice(0,6)`
3. AENDRA price = Temu sale price + S/15 (round to nearest integer)
4. Add `<section class="catalogo-section [bg-white]" id="CATEGORY">` after last product section, before `#servicios`
5. Add to navbar: desktop `<li><a href="#CATEGORY">...</a></li>` + mobile menu `<a href="#CATEGORY">...</a>`
6. Deploy: `scp index.html root@167.71.127.223:/var/www/aendra/`
7. Push: `git add index.html && git commit && git push origin master`

## Pending integrations

- **Culqi** payment gateway (Peru) — awaiting Alejandra's API keys; replace `processPayment()` in checkout.js
- **Supabase** dynamic product loading — DB exists but products are currently static HTML
- **Instagram** page (@aendra_interiormood) — Alejandra creates content manually

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

## No build/test commands

Open `index.html` directly in a browser or visit `http://167.71.127.223:8080`. No compilation or server required locally.
