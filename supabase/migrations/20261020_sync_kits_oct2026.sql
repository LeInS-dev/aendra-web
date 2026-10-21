-- Sincroniza la tabla kits con los kits nuevos publicados en index.html (rama kits-reales-oct2026).
-- Productos verificados en Temu el 2026-10-20. Precio kit ~10% bajo la suma de productos sueltos.
-- Solo cambia items, price, image_url y updated_at. No toca slug, description, is_featured, sort_order ni active.
-- Si no se actualizan exactamente 5 filas, el bloque lanza un error y no se guarda nada.

do $$
declare
    n integer;
begin
    update public.kits as k
    set items      = v.items,
        price      = v.price,
        image_url  = v.image_url,
        updated_at = now()
    from (values
        ('mood-cozy',
         array['2 Velas cubo de burbujas', '2 Fundas de cojín chenilla camello'],
         63.00,
         'https://img.kwcdn.com/product/fancy/175fdcd4-db11-44ce-895f-5e194ab1dcf3.jpg'),
        ('gift-mood',
         array['Vela esférica de ondas', 'Vela bola espiral', '4 Fundas de cojín boho de felpa'],
         105.00,
         'https://img.kwcdn.com/product/fancy/b72ca863-2000-46bb-9695-2ae39204ff24.jpg'),
        ('japandi-edit',
         array['4 Fundas de cojín de lino natural', 'Vela artística de ondas', 'Jarrón de cerámica rústico'],
         97.00,
         'https://img.kwcdn.com/product/fancy/159f91ba-5ea5-4493-8446-c34df0b42025.jpg'),
        ('sala-aesthetic',
         array['Alfombra vintage 90×150 cm', '4 Fundas de cojín de pana a rayas', '2 Velas escultóricas blancas'],
         185.00,
         'https://img.kwcdn.com/product/201365d8925/89571e61-ffb3-473c-ad5b-ca71235bf47b_1000x1000.jpeg'),
        ('cuarto-dream',
         array['Alfombra de pelo largo beige 120×160 cm', '4 Fundas de cojín jacquard geométrico', '2 Velas columna estriada', 'Moodboard digital personalizado'],
         209.00,
         'https://img.kwcdn.com/product/fancy/3c61af85-003d-446f-b204-a80a6296cc53.jpg')
    ) as v(slug, items, price, image_url)
    where k.slug = v.slug;

    get diagnostics n = row_count;
    if n <> 5 then
        raise exception 'Se esperaban 5 kits actualizados y fueron %', n;
    end if;
end $$;

select slug, price, items, image_url, updated_at from public.kits order by sort_order;
