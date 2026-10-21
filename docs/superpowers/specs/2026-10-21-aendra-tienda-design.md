# AENDRA — Fase 1: tienda de diseño de interiores

Fecha: 2026-10-21 · Rama de trabajo: `fase1-tienda` (desde `master`) · Estado: **aprobado** — Alejandra respondió las preguntas abiertas y autorizó el trabajo completo sin más consultas ("hazlo todo, AUTORIZADO", 2026-10-21)

## 0. Respuestas de Alejandra (2026-10-21)

1. **Fotos de Ideas/"shop the look"**: OK al enfoque (ambientes creados a partir de las fotos reales de los productos). Mientras no haya productos físicos ni fotos propias: imágenes genéricas (bancos libres) o las que ella cree y entregue. Las fotos genéricas **no llevan puntos tocables sobre objetos que no son el producto**: se usa una tira de productos debajo ("Para lograr este look").
2. **Paletas**: se mantienen las 4 (Arena y Lino, Verde Salvia, Terracota Andina, Noche Japandi) y **hay que conseguir productos para todas** → la Fase 1 incluye buscar en Temu productos de cada paleta (verificados, con link y costo) y cargarlos al catálogo.
3. **Precios**: aplicar la regla +S/15 → Lino S/45, Ondas S/29, Escultóricas S/63. **Hecho** (web + Supabase, commit `0c784d4`).
4. **Arreglos antes del rediseño**: publicar ya. **Hecho**: kits nuevos, checkout (Waitlist/Modo Demo), precios y correo publicados en master → Vercel. Previews de Vercel autorizados para revisar el rediseño.
5. **Correo de contacto**: `vasquezalejandra669@gmail.com`. **Hecho** en la web y `CLAUDE.md`.

Criterio para lo que no se pudo preguntar: el rediseño completo se publica en un **preview de Vercel** (no en www.aendra.lat) para que Alejandra lo vea antes; el cambio a producción es un merge a `master` que queda listo.

## 1. Intención y por qué

Hoy aendra.lat es una landing con 5 kits, un catálogo de 20 productos escrito a mano en `index.html` y un look "plantilla". La clienta llega desde Instagram/TikTok, ve los kits y se va.

Alejandra quiere **la mejor tienda de diseño de interiores del Perú**: muchos productos, ideas de decoración, paletas de color y todo lo que inspire. No una tienda de kits. La idea de fondo: si la clienta encuentra ideas, paletas y su propio moodboard, **se queda, vuelve y comparte**, y eso vende más que una lista de productos.

Lo que debe sentir en los primeros segundos (palabras de Alejandra): **curiosidad y algo "cute"**, entendido como **suave y acogedor** (crema, lino, luz de vela), no juguetón ni de colores fuertes.

Público: mujeres jóvenes en Perú que llegan desde Instagram/TikTok **en el celular**, buscando un cuarto "aesthetic" o "cozy" con presupuesto accesible.

## 2. Referencia visual

Referencia principal elegida: **Pietra** (plantilla de Godly: https://godly.design/templates/pietra/ · captura: https://cdn.godly.design/templates/pietra/desktop-full.png).

Lo que se toma de Pietra:
- Portada con **foto cálida a pantalla completa** y titular **serif enorme** encima, en blanco.
- Secciones sobre fondo claro con **una sola frase gigante** en serif y mucho aire.
- Texto corto en dos columnas (etiqueta pequeña + párrafo), fila de cifras, "trabajos seleccionados" en fotos grandes.

Otras referencias vistas y descartadas como dirección principal: Royal (le gustó lo inmersivo, pero es oscuro y de lujo serio; solo se toma "foto que llena la pantalla"), Harmoni/Serenity (toques útiles: palabra en cursiva dentro de una píldora, fotos con esquinas muy redondeadas).

Se mantiene la **paleta actual de marca**: café `#3D1F0D`, dorado `#B89A6A`, crema `#F5EFE6`, beige `#E8DDD0`, café medio `#8B5E3C`. Tipografías actuales: Cormorant Garamond (serif) + Jost (sans), ambas de Google Fonts.

**Movimiento**: entradas suaves al hacer scroll, titulares que aparecen línea por línea, y microinteracciones "cute" (el carrito rebota al agregar, check de éxito al confirmar, fotos de un kit que se abren en abanico al tocar). Nada que salte o distraiga. Respetar `prefers-reduced-motion`. Ya existe GSAP 3.12.5 en el proyecto.

## 3. Objetivos, no-objetivos y anti-objetivos

**Objetivos de la Fase 1**
1. Nueva identidad visual estilo Pietra en todo el sitio.
2. Pasar de una landing a una tienda con secciones y páginas propias: Inicio, Tienda, Producto, Paletas, Ideas, Kits, Test de estilo, Mi moodboard, Servicios/Contacto.
3. Que los productos vengan de una fuente de datos única, no escritos a mano en el HTML, para poder crecer a 100+ productos.
4. Que la clienta pueda descubrir: por ambiente, categoría, estilo y paleta; por "shop the look"; por un test de estilo; y guardar lo que le gusta en un moodboard que envía por WhatsApp a Alejandra.

**No-objetivos (fuera de la Fase 1)**
- 3D / Blender, AR, blog, panel de administración, cobro real con Culqi, decidir proveedor (se investiga en otra sesión: `docs/proveedores-2026-10.md`), cargar productos nuevos más allá de los vigentes hoy.

**Anti-objetivos (aunque funcione, sería un fracaso si…)**
- Se ve oscuro, frío o de lujo inaccesible.
- Se ve "hecho por IA" o genérico.
- Es lento o pesado en un celular con datos móviles.
- Muestra productos que ya no existen o precios que no corresponden (lo que pasó con los kits).
- Rompe lo que hoy funciona: carrito, checkout, login, botón de WhatsApp, pedidos en Supabase.
- Las fotos de ambiente generadas con IA hacen pasar un producto por otro.
- Cualquier página pública deja ver el proveedor (nombre, link, `goods_id`, costo o margen), ni siquiera en el código fuente o en el archivo de catálogo público.

## 4. Restricciones

- Español, precios en soles (S/), envíos a todo Perú. Mobile-first.
- Dominio `www.aendra.lat` en Vercel (proyecto `leins-devs-projects/aendra-web`), repo `LeInS-dev/aendra-web`. **No push a master ni deploy sin preguntar a Alejandra.**
- Supabase `ffwuvaifwqjpkntfrppm` (plan free: **se pausa por inactividad**). El conector MCP de Supabase de esta máquina no tiene acceso al proyecto; los cambios de esquema se han ejecutado en el SQL Editor del panel con OK de Alejandra y se guardan en `supabase/migrations/`.
- Mantener lo ya implementado en seguridad (ver `CLAUDE.md`): SRI en CDNs, render del carrito sin `innerHTML`, RLS, Modo Demo en checkout.
- Los productos se consiguen de proveedores que rotan (Temu hoy). Alejandra irá consiguiendo productos y pedirá ayuda para subirlos; no habrá un panel.
- Fotos: del chat, de bancos con licencia comercial libre (Unsplash, Pexels) o generadas con IA. **No** imágenes de Google/Pinterest sin licencia.

## 5. Decisiones tomadas

**Por Alejandra**
- Dirección visual: suave y acogedora, referencia Pietra.
- Alcance de la Fase 1: la lista de la sección 6.
- Los productos los consigue ella y pide ayuda para subirlos.
- Fotos: chat, internet con licencia libre o IA.

- **La clienta le compra a AENDRA, nunca al proveedor.** Tienda y páginas de producto son la vitrina de AENDRA con el precio AENDRA; se compra con el carrito o por WhatsApp. Ninguna página pública muestra proveedor, link de Temu, costo ni margen.

**Por Claude (Alejandra puede objetar)**
- **Fuente única de productos: tabla privada `catalogo_productos`** (Supabase, creada el 2026-10-20, ver `supabase/migrations/20261020_create_catalogo_productos.sql`). Costos, links y proveedor quedan privados ahí.
- **La web no lee Supabase en vivo para el catálogo.** Al subir productos se genera un archivo público del catálogo (sin costos ni links de proveedor) que se versiona en el repo y del que se construyen las páginas. Motivo: si Supabase se pausa, la tienda no puede quedar vacía.
- **Migrar a Astro (generador de sitio estático)** para tener muchas páginas (una por producto, idea y paleta) con URL propia, buen SEO y menú/pie compartidos, sin repetir HTML a mano. Vercel lo construye solo. Los módulos JS actuales (`js/cart.js`, `js/auth.js`, `js/checkout.js`, `js/supabase-client.js`) se reutilizan.
- Fotos de producto = siempre las reales del proveedor. Fotos de ambientes (Ideas, Paletas, portada) = IA o bancos libres.
- El slug del carrito (`item_slug`) es el mismo `slug` de `catalogo_productos`, para poder cruzar pedidos con costos.
- **Las imágenes se alojan en el propio sitio** (copiadas y optimizadas), no enlazadas a `img.kwcdn.com`: el dominio del proveedor en el código fuente rompería el anti-objetivo de no mostrar proveedor, y además esas imágenes desaparecen cuando el producto sale de Temu.
- **Etiquetas de cada producto** (ambiente, estilo, paleta) y **colores de cada paleta**: los propone Claude y Alejandra los revisa antes de publicar.
- **Los 6 productos `sin_verificar`** los verifica Claude en Temu (sesión de Alejandra en Chrome, como el 2026-10-20) antes del lanzamiento; los que no aparezcan salen de la web.

## 6. Contenido de la Fase 1

**Páginas**
| Página | Qué tiene |
|---|---|
| Inicio | Portada inmersiva (foto cálida a pantalla completa + titular serif "Transforma tu espacio", con una palabra en cursiva, y un botón). Frase de marca gigante. Historia de Alejandra (estudiante de Arquitectura de Interiores; confirmar biografía, ver §9). Cifras ("5 kits · 20+ piezas · envíos a todo Perú · desde S/63"). Accesos a Tienda, Ideas, Paletas, Kits, Test. Testimonios. |
| Tienda | Todos los productos publicados, filtrables por **ambiente** (sala, dormitorio, comedor, baño, terraza, home office), **categoría** (fundas/textiles, velas, alfombras, cerámica/adornos, iluminación, cuadros, plantas, organización — las que tengan productos), **estilo** (Japandi, Nórdico, Boho, Minimal, Mediterráneo) y **paleta**. Tarjetas con esquinas suaves, corazón de moodboard y "+ Carrito". |
| Producto | Una página por producto: galería de 3 fotos reales, nombre, precio, descripción corta, medidas/variante, entrega estimada, "+ Carrito", "Pedir por WhatsApp", corazón, "combina con" (misma paleta/estilo), kits que lo incluyen. Schema `Product`. |
| Paletas | Índice + 4 páginas: **Arena y Lino, Verde Salvia, Terracota Andina, Noche Japandi**. Cada una: muestras de color con nombre y código, 1–2 fotos de ambiente, productos que combinan, idea relacionada. |
| Ideas | Índice + 4 ideas "shop the look": foto de ambiente con **puntos tocables** que abren el producto (precio, + Carrito, corazón). Una idea por paleta. |
| Kits | Los 5 kits actuales como "looks completos" (contenido y precios del 2026-10-20, ver `CLAUDE.md`). Al tocar un kit, sus fotos se abren en abanico. |
| Test "¿Cuál es tu mood?" | 3–4 preguntas visuales; resultado = estilo + paleta + 4–6 productos + kit recomendado + CTA al moodboard. Todo en el navegador. |
| Mi moodboard | Lo marcado con corazón (guardado en el navegador). Botón **"Enviar a Alejandra por WhatsApp"** con la lista de productos y links. Enlace a servicios (Moodboard personalizado S/40, Asesoría S/25). |
| Servicios / Contacto | Los 3 servicios actuales (S/25, S/40, S/15), cómo funciona, contacto (WhatsApp +51 965 104 352, Instagram @aendra_interiormood, email vasquezalejandra669@gmail.com). |

**Productos al lanzar**: los vigentes de `catalogo_productos` (estado `disponible` + los `sin_verificar` que se confirmen; ~20) **más los necesarios para que cada una de las 4 paletas tenga al menos 6 productos** (buscados y verificados en Temu, misma regla de precio +S/15, preferir envío 6–19 días y buenas reseñas). Los 11 `no_disponible` salen de la web. Cada producto necesita además: ambiente(s), estilo(s), paleta(s), descripción corta, 3 fotos.

**Se mantiene**: carrito (`localStorage aendra_cart`), checkout de 3 pasos con Modo Demo, login/registro, pedidos en `pedidos`/`pedido_items`, botón flotante de WhatsApp, Google site verification, robots/sitemap (regenerados).

## 7. Arreglos ya hechos en la rama que deben conservarse

- `index.html`: kits nuevos (commit `0b9084e`).
- Commit `0c784d4` (publicado): quitar `Waitlist.init()` (cortaba `Checkout.init()`), quitar el `<div id="payment-demo-notice">` vacío (impedía el aviso de Modo Demo), precios Lino/Ondas/Escultóricas y correo de contacto. Verificados en navegador el 2026-10-21.

## 8. Lo que queda a criterio del constructor

- Estructura del proyecto Astro, componentes, estilos (CSS propio o utilidades), cómo integrar GSAP.
- Cómo se genera el archivo público de catálogo desde Supabase (p. ej. una vista pública sin costos + script de export con la clave anon) y su formato.
- Dónde viven paletas, ideas, estilos y ambientes (archivos de datos en el repo es lo esperable, ya que los mantiene Claude a pedido).
- Columnas nuevas en `catalogo_productos` (ambientes, estilos, paletas, descripción, galería, publicado), vía migración en `supabase/migrations/` ejecutada con OK.
- Hosting de imágenes: hoy se enlazan directo a `img.kwcdn.com` (pueden desaparecer si el producto sale de Temu). Decidir si se copian/optimizan.
- Herramientas opcionales vistas con Alejandra: **Impeccable** (skill de pulido de UI) y **transitions.dev** (recetas de microinteracciones). Instalarlas requiere OK de Alejandra.

## 9. Pendientes conocidos (no bloquean el diseño)

- Las fotos de producto son las del proveedor: una clienta podría encontrarlas con búsqueda inversa de imágenes. A futuro conviene usar fotos propias o ambientadas para los productos más vendidos.

- Biografía de Alejandra: el schema dice "Arquitecta de Interiores egresada de la Universidad de Lima"; `CLAUDE.md` dice estudiante. Confirmar.
- Testimonio "Compre el kit de S/90": confirmar si es cita real antes de editarlo.
- `vercel.json` (headers de seguridad) no está commiteado.
- Slugs de la tabla `kits` (`mood-cozy`) vs carrito (`kit-mood-cozy`).
