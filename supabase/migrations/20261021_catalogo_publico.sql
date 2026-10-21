-- Fase 1: datos públicos de cada producto + vista que la web puede leer con la clave anon.
-- La vista expone SOLO campos públicos. Costos, proveedor, links y variantes siguen privados en catalogo_productos.

alter table public.catalogo_productos
    add column if not exists descripcion text,
    add column if not exists ambientes   text[] not null default '{}',
    add column if not exists estilos     text[] not null default '{}',
    add column if not exists paletas     text[] not null default '{}',
    add column if not exists galeria     text[] not null default '{}',
    add column if not exists publicado   boolean not null default false;

create or replace view public.catalogo_publico as
select c.slug,
       c.nombre,
       p.slug          as categoria,
       c.precio_aendra,
       c.descripcion,
       c.ambientes,
       c.estilos,
       c.paletas,
       c.galeria,
       c.entrega_dias
from public.catalogo_productos c
join public.productos p on p.id = c.categoria_id
where c.publicado and c.estado = 'disponible';

comment on view public.catalogo_publico is 'Catálogo público de la web (sin costos ni proveedor). Lo lee scripts/export-catalogo.mjs con la clave anon.';

revoke all on public.catalogo_publico from anon, authenticated;
grant select on public.catalogo_publico to anon, authenticated;

select count(*) as publicados from public.catalogo_publico;
