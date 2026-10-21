-- Catálogo de productos individuales de AENDRA, con su origen en Temu.
-- Objetivo: no volver a perder los links ni los costos de Temu (antes solo vivían en la cabeza de Alejandra).
-- La tabla "productos" existente son las 6 CATEGORÍAS; esta tabla cuelga de ella por categoria_id.
--
-- Convenciones:
--   precio_temu    = costo TOTAL en Temu para armar 1 producto AENDRA (ya multiplicado por unidades_temu)
--   unidades_temu  = cuántas unidades del artículo de Temu hay que comprar (ej. "Velas Cubo x2" = 2)
--   link_temu      = se arma solo a partir de temu_goods_id (no se escribe a mano)
--   margen         = precio_aendra - precio_temu (se calcula solo)
--   estado         = disponible | sin_verificar | no_disponible
--   en_web         = true si tiene tarjeta propia en index.html (los reemplazos nuevos solo están dentro de kits)
--
-- Seguridad: RLS activado SIN políticas públicas. Costos y proveedor no deben ser visibles con la clave
-- pública de la web; solo se leen desde el panel de Supabase (o con service_role).

create table public.catalogo_productos (
    id              bigint generated always as identity primary key,
    slug            text not null unique,
    nombre          text not null,
    categoria_id    bigint not null references public.productos (id),
    precio_aendra   numeric(10,2) not null check (precio_aendra > 0),
    precio_temu     numeric(10,2) check (precio_temu > 0),
    margen          numeric(10,2) generated always as (precio_aendra - precio_temu) stored,
    temu_goods_id   text check (temu_goods_id ~ '^[0-9]+$'),
    link_temu       text generated always as ('https://www.temu.com/goods.html?goods_id=' || temu_goods_id) stored,
    variante_temu   text,
    unidades_temu   smallint not null default 1 check (unidades_temu >= 1),
    imagen_url      text,
    entrega_dias    text,
    estado          text not null default 'sin_verificar'
                    check (estado in ('disponible', 'sin_verificar', 'no_disponible')),
    en_web          boolean not null default false,
    fecha_revision  date,
    notas           text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

comment on table public.catalogo_productos is 'Productos individuales de AENDRA con costo y link de Temu. Privada (RLS sin políticas).';
comment on column public.catalogo_productos.precio_temu is 'Costo total en Temu para 1 producto AENDRA (ya multiplicado por unidades_temu)';

create index catalogo_productos_categoria_idx on public.catalogo_productos (categoria_id);

alter table public.catalogo_productos enable row level security;

create or replace function public.catalogo_productos_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger catalogo_productos_touch_updated_at
    before update on public.catalogo_productos
    for each row execute function public.catalogo_productos_touch_updated_at();

-- Datos iniciales: 20 productos que hoy están en la web + 11 reemplazos elegidos el 2026-10-20 (31 en total)
insert into public.catalogo_productos
    (slug, nombre, categoria_id, precio_aendra, precio_temu, temu_goods_id, variante_temu, unidades_temu,
     imagen_url, entrega_dias, estado, en_web, fecha_revision, notas)
values
    ('funda-felpa-jacquard', 'Fundas Felpa Jacquard Geométrico x4', (select id from public.productos where slug = 'fundas-cojines'), 59.00, 44.00, null, null, 1, 'https://img.kwcdn.com/product/open/b28c9931f93042fe916979227f72dff2-goods.jpeg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('funda-lino-natural', 'Fundas Lino Natural Exterior x4', (select id from public.productos where slug = 'fundas-cojines'), 59.00, 29.68, '601100637213015', '44.96x44.96 cm, juego de 4', 1, 'https://img.kwcdn.com/product/fancy/159f91ba-5ea5-4493-8446-c34df0b42025.jpg', '6-17', 'disponible', true, '2026-10-20'::date, 'Precio web desactualizado: con el costo de hoy la regla +S/15 da S/45'),
    ('funda-chenilla-beige', 'Fundas Chenilla Beige Clásico x2', (select id from public.productos where slug = 'fundas-cojines'), 43.00, 28.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/5d28cdfe-90c5-4080-9979-6dfa9190b6c4.jpg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('funda-chenilla-vintage', 'Fundas Chenilla Texturizada Vintage x2', (select id from public.productos where slug = 'fundas-cojines'), 53.00, 38.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/37da1f2a-6134-4100-80f9-fdc259601359.jpg', null, 'sin_verificar', true, null, 'Costo = estimado de abril 2026 (precio web - 15). Falta verificar en Temu y guardar link.'),
    ('funda-rayas-boho', 'Fundas Beige Marron Rayas Boho x4', (select id from public.productos where slug = 'fundas-cojines'), 71.00, 56.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/3f95d9a4-7178-40b8-996b-af8fcce700d3.jpg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('funda-geometrico-diamantes', 'Fundas Patrón Geométrico Diamantes x4', (select id from public.productos where slug = 'fundas-cojines'), 48.00, 33.00, null, null, 1, 'https://img.kwcdn.com/product/open/eebb680371b94bfaa6f229b6112c73eb-goods.jpeg', null, 'sin_verificar', true, null, 'Costo = estimado de abril 2026 (precio web - 15). Falta verificar en Temu y guardar link.'),
    ('funda-abstracto-boho', 'Fundas Abstracto Linea Boho Felpa x4', (select id from public.productos where slug = 'fundas-cojines'), 57.00, 42.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/f654d006-7c93-47f7-bcf7-22edc80b78b5.jpg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('alfombra-vintage-minimalista', 'Alfombra Vintage Minimalista', (select id from public.productos where slug = 'alfombras'), 82.00, 216.52, '605745894532022', '160x230 cm (unica talla con stock, 1 ud)', 1, 'https://img.kwcdn.com/product/fancy/331654a0-7596-42fa-a77f-4e4b6a7fe3fe.jpg', '34-58', 'no_disponible', true, '2026-10-20'::date, 'Tallas chicas agotadas (100x160 costaba S/116.86). Reemplazada en kits por alfombra-vintage-90x150.'),
    ('alfombra-terciopelo-vintage', 'Alfombra Terciopelo Vintage Europea', (select id from public.productos where slug = 'alfombras'), 107.00, 92.00, null, null, 1, 'https://img.kwcdn.com/product/open/58729c5614f5496c9774c2549ce6ba33-goods.jpeg', null, 'sin_verificar', true, null, 'Costo = estimado de abril 2026 (precio web - 15). Falta verificar en Temu y guardar link.'),
    ('alfombra-beige-pelo-largo', 'Alfombra Beige Pelo Largo Nórdica', (select id from public.productos where slug = 'alfombras'), 95.00, 80.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/2cbb4588-08b7-4396-8389-d559728effc2.jpg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('alfombra-vintage-floral', 'Alfombra Vintage Floral', (select id from public.productos where slug = 'alfombras'), 63.00, 48.00, null, null, 1, 'https://img.kwcdn.com/product/open/695832bff2f248cc981005c8da6cf268-goods.jpeg', null, 'sin_verificar', true, null, 'Costo = estimado de abril 2026 (precio web - 15). Falta verificar en Temu y guardar link.'),
    ('alfombra-bohemia-terciopelo', 'Alfombra Bohemia Marroquí Terciopelo', (select id from public.productos where slug = 'alfombras'), 66.00, 51.00, null, null, 1, 'https://img.kwcdn.com/product/open/e3579d5e622c4de499f73dc5be4cecbb-goods.jpeg', null, 'sin_verificar', true, null, 'Costo = estimado de abril 2026 (precio web - 15). Falta verificar en Temu y guardar link.'),
    ('velas-escultorica-blanca', 'Velas Escultorica Blancas Estriadas x2', (select id from public.productos where slug = 'velas'), 62.00, 48.04, '605798843411839', 'Estilo 2 (pack x2)', 1, 'https://img.kwcdn.com/product/open/b23c6aea8cbb468ea7247bce92089f98-goods.jpeg', '6-17', 'disponible', true, '2026-10-20'::date, 'Precio web desactualizado: con el costo de hoy la regla +S/15 da S/63'),
    ('velas-esfera-burbujas', 'Vela Esfera de Burbujas', (select id from public.productos where slug = 'velas'), 33.00, 18.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/bd41627e-3d55-468f-8eed-ab9d3d067fb3.jpg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('vela-bola-torsionada', 'Vela Bola Torsionada', (select id from public.productos where slug = 'velas'), 34.00, 19.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/f449c12d-5fd1-43d2-b379-e2569ff2a3a4.jpg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('velas-esfericas-aromaticas', 'Velas Esféricas Aromáticas', (select id from public.productos where slug = 'velas'), 33.00, 18.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/0004695f-d03c-4871-88a6-b6766e8f5e39.jpg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('velas-artisticas-ondas', 'Velas Artísticas Diseño Ondas', (select id from public.productos where slug = 'velas'), 41.00, 14.01, '601103733301961', 'F226 125 g', 1, 'https://img.kwcdn.com/product/fancy/e3b85ded-8fb8-4ef1-8a0f-9624bebe1195.jpg', '6-17', 'disponible', true, '2026-10-20'::date, 'Precio web desactualizado: con el costo de hoy la regla +S/15 da S/29'),
    ('velas-aromaticas-hexagonales', 'Velas Aromáticas Hexagonales x2', (select id from public.productos where slug = 'velas'), 43.00, 28.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/32b12064-e034-4856-8f53-dad842569207.jpg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('figuras-elefantes-minimalistas', 'Figuras Elefantes Minimalistas', (select id from public.productos where slug = 'accesorios'), 101.00, 86.00, null, null, 1, 'https://img.kwcdn.com/product/fancy/7592c7f2-beb2-45be-b526-552e9989e505.jpg', null, 'sin_verificar', true, null, 'Costo = estimado de abril 2026 (precio web - 15). Falta verificar en Temu y guardar link.'),
    ('jarron-ceramica-rustica', 'Jarron de Cerámica Rústica', (select id from public.productos where slug = 'accesorios'), 77.00, 62.00, null, null, 1, 'https://img.kwcdn.com/product/fancyalgo/toaster-api/toaster-processor-image-cm2in/48ef4ffe-6d0c-11ef-a40f-0a580a665804.jpg', null, 'no_disponible', true, '2026-10-20'::date, 'No aparece en Temu (busqueda por imagen exacta). Costo = estimado de abril 2026. Reemplazado en kits.'),
    ('velas-cubo-burbujas', 'Velas Cubo de Burbujas x2', (select id from public.productos where slug = 'velas'), 25.00, 10.28, '605856959720368', 'Blanco', 2, 'https://img.kwcdn.com/product/fancy/175fdcd4-db11-44ce-895f-5e194ab1dcf3.jpg', '6-17', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('funda-chenilla-camello', 'Fundas Chenilla Camello x2', (select id from public.productos where slug = 'fundas-cojines'), 45.00, 29.77, '601101356457553', 'Camello 45x45 cm', 1, 'https://img.kwcdn.com/product/open/f1c9245f72cc4d1497a72eb77c67cfb0-goods.jpeg', '6-17', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('vela-esferica-onda', 'Vela Esférica de Ondas', (select id from public.productos where slug = 'velas'), 27.00, 12.37, '601103352872317', 'J-1279 Sándalo de Almendras', 1, 'https://img.kwcdn.com/product/fancy/b72ca863-2000-46bb-9695-2ae39204ff24.jpg', '6-17', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('vela-bola-espiral', 'Vela Bola Espiral Grande', (select id from public.productos where slug = 'velas'), 41.00, 26.02, '605971900409156', 'Blanco/Vainilla Francesa, grande 247 g', 1, 'https://img.kwcdn.com/product/fancy/33343a98-3354-4826-a24c-b34aef42f88f.jpg', '6-17', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('funda-boho-felpa-beige', 'Fundas Boho Felpa Beige x4', (select id from public.productos where slug = 'fundas-cojines'), 49.00, 34.06, '601100114979884', 'Beige 45x45 cm (pack de 2)', 2, 'https://img.kwcdn.com/product/fancy/46a1f866-4290-497f-b095-ca855c11da41.jpg', '6-17', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('jarron-ceramica-blanco', 'Jarrón de Cerámica Rústico Blanco', (select id from public.productos where slug = 'accesorios'), 34.00, 19.22, '601099524793401', 'YCSQ267 Punto Negro Beige', 1, 'https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/fd1342d9aba63a25d5d72cfa0f46baa7.jpg', '6-17', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('alfombra-vintage-90x150', 'Alfombra Vintage Terciopelo 90x150', (select id from public.productos where slug = 'alfombras'), 91.00, 75.65, '605563962364250', '90x150 cm', 1, 'https://img.kwcdn.com/product/201365d8925/89571e61-ffb3-473c-ad5b-ca71235bf47b_1000x1000.jpeg', '6-19', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('funda-pana-rayas-boho', 'Fundas Pana Rayas Boho x4', (select id from public.productos where slug = 'fundas-cojines'), 52.00, 37.14, '605891369733936', 'Marrón Neutro 45x45 cm', 1, 'https://img.kwcdn.com/product/fancy/4ca2a086-5838-4f88-b7f5-544370d40c3e.jpg', '6-19', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('alfombra-felpa-beige-120x160', 'Alfombra Felpa Pelo Largo Beige 120x160', (select id from public.productos where slug = 'alfombras'), 79.00, 64.03, '601099564281457', 'Tie-dye Beige 120x160 cm', 1, 'https://img.kwcdn.com/product/fancy/3c61af85-003d-446f-b204-a80a6296cc53.jpg', '6-17', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('funda-jacquard-geometrico', 'Fundas Jacquard Geométrico x4', (select id from public.productos where slug = 'fundas-cojines'), 67.00, 52.04, '605918498521318', '45.72x45.72 cm', 1, 'https://img.kwcdn.com/product/fancy/b29f82b4-fb9e-403c-a2fd-a135941e23fe.jpg', '6-19', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit'),
    ('velas-columna-estriada', 'Velas Columna Estriada x2', (select id from public.productos where slug = 'velas'), 48.00, 33.44, '601099664389673', 'Columna a Rayas Blancas J-0747', 2, 'https://img.kwcdn.com/product/fancy/8340d2a1-c0e4-4f07-87a6-badfd17c1564.jpg', '6-17', 'disponible', false, '2026-10-20'::date, 'Reemplazo elegido el 2026-10-20; por ahora solo se vende dentro de un kit');
