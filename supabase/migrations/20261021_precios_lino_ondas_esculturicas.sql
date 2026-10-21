-- Aprobado por Alejandra el 2026-10-21: aplicar la regla costo Temu + S/15 a los 3 productos verificados
-- que seguían con el precio de abril. La web (index.html) se actualizó en el mismo cambio.

do $$
declare
    n integer;
begin
    update public.catalogo_productos as c
    set precio_aendra = v.precio,
        notas = 'Precio actualizado a la regla +S/15 el 2026-10-21'
    from (values
        ('funda-lino-natural', 45.00),
        ('velas-artisticas-ondas', 29.00),
        ('velas-escultorica-blanca', 63.00)
    ) as v(slug, precio)
    where c.slug = v.slug;

    get diagnostics n = row_count;
    if n <> 3 then
        raise exception 'Se esperaban 3 productos actualizados y fueron %', n;
    end if;
end $$;

select slug, precio_aendra, precio_temu, margen from public.catalogo_productos
where slug in ('funda-lino-natural', 'velas-artisticas-ondas', 'velas-escultorica-blanca')
order by slug;
