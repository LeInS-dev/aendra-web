# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: AENDRA

Spanish-language interior design & home mood brand for **Peru**. All content is in Spanish. Founded by **Alejandra Vasquezz** (Lima, Peru). The business sells curated product kits and interior design consultation services via WhatsApp.

**Currency**: Peruvian Soles (S/)  
**WhatsApp**: +51 965 104 352  
**Instagram**: @aendra_interiormood  
**Email**: hola@aendra.com

## Supabase

- **Project ID**: `ffwuvaifwqjpkntfrppm` (region: sa-east-1, São Paulo)
- Tables: `kits` (5 rows), `productos` (6 rows), `servicios` (3 rows), `clientes`, `pedidos`, `testimonios` (3 rows)
- RLS enabled: public read on active/approved rows, public insert on clientes/pedidos

## Tech stack

- **Pure HTML/CSS/JS** — no build step, no framework, no bundler
- **Node.js packages** installed but only available via CDN (no bundler):
  - `animejs` ^4.3.6
  - `gsap` ^3.14.2 (+ ScrollTrigger, ScrollToPlugin)
- Reference GSAP via CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/`

## File structure

Each HTML file is standalone and self-contained (CSS + JS embedded):

| File | Purpose |
|------|---------|
| `AENDRA_Landing_Page.html` | Main public-facing landing page (primary file, ~1500 lines) |
| `AENDRA_Catalogo_Productos.html` | Print-friendly product catalog (8.5×11 layout) |
| `AENDRA_Estrategia_Crecimiento.html` | Internal business growth strategy doc |
| `AENDRA_Guion_Reels.html` | Instagram Reels script guide |
| `AENDRA_Templates_Instagram.html` | Canva template reference for Instagram |

## Landing page structure (11 sections)

| Section | ID | Notes |
|---------|-----|-------|
| Navbar | — | Fixed, transparent→solid on scroll, hamburger mobile |
| Hero | `#inicio` | 100vh, custom gold cursor, floating particles, parallax glows |
| About | `#nosotros` | Alejandra's story (Naval School → interior design), Unsplash image |
| Gallery Mood | `#galeria` | 7 Unsplash images, masonry-style pop-in |
| Kits | `#kits` | 5 kits with S/ prices, Unsplash images, WhatsApp CTA |
| Productos | `#productos` | 6 individual product categories with S/ prices |
| Servicios | `#servicios` | 3 services: S/25, S/40, S/15 |
| Cómo Funciona | `#como-funciona` | 3 steps + progress line scrub |
| Testimonios | `#testimonios` | Lima, Arequipa, Cusco |
| Contacto | `#contacto` | WhatsApp + IG + Email CTAs |
| Footer | — | Copyright 2026 |

## Product pricing (Peruvian Soles)

### Kits
- Kit Mood Cozy — S/35
- Kit Gift Mood — S/45
- Kit Japandi Edit — S/75
- Kit Sala Aesthetic — S/90
- Kit Cuarto Dream — S/150 (badge: "Más Popular")

### Servicios
- Mini Asesoría Express — S/25
- Moodboard Digital Personalizado — S/40
- Lista de Compras con Links — S/15

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

## Animation conventions (GSAP)

- Register plugins: `gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)`
- Load CDNs before `</body>` (no `defer` — scripts need DOM)
- Use `gsap.from()` so elements visible without JS
- `prefers-reduced-motion` check wraps all animations
- Custom gold cursor (`.cursor-dot`, `.cursor-ring`) — desktop only
- All scroll animations use `ScrollTrigger`

## Key selectors in AENDRA_Landing_Page.html

- `.hero`, `.hero h1`, `.hero .tagline`, `.hero-badge` — hero
- `.kit-card` — 5 kit cards (data-kit, data-price attributes)
- `.product-card` — 6 individual product cards
- `.gallery-item` — mood gallery items
- `.floating-wa` — fixed WhatsApp button bottom-right
- `openWhatsApp(product, price)` — sends pre-filled WhatsApp message
- `orderKit(btn)` — reads kit name/price from closest `.kit-card`

## WhatsApp integration

```javascript
function openWhatsApp(product, price) {
    const msg = 'Hola Alejandra, me interesa ' + product + ' (' + price + '). Quisiera mas informacion.';
    window.open('https://wa.me/51965104352?text=' + encodeURIComponent(msg), '_blank');
}
```

## Pending integrations

- **Culqi** payment gateway (Peru) — awaiting Alejandra's API keys
- **Supabase** dynamic content loading — DB exists but page is currently static
- **Instagram** page (@aendra_interiormood) — Alejandra creates manually

## No build/test commands

Open any `.html` file directly in a browser. No compilation or server required.
