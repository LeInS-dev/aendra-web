// Genera supabase/migrations/20261021_catalogo_fase1_datos.sql (datos de la Fase 1, verificados en Temu el 2026-10-21).
import { readFileSync, writeFileSync } from 'node:fs';

const REV = '2026-10-21';
const galerias = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const q = v => v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`;
const arr = a => `array[${a.map(q).join(', ')}]::text[]`;

// Productos que ya estaban en la tabla: datos públicos nuevos
const existentes = {
  'funda-lino-natural': ['Juego de 4 fundas de lino natural de 45×45 cm. Textura orgánica y color avena que calma cualquier sofá.', ['sala', 'terraza'], ['japandi', 'minimal', 'nordico'], ['arena-y-lino', 'verde-salvia']],
  'velas-artisticas-ondas': ['Vela escultórica con textura de ondas (125 g) y aroma suave. Linda encendida y también apagada.', ['sala', 'dormitorio'], ['japandi', 'minimal'], ['noche-japandi', 'arena-y-lino']],
  'velas-escultorica-blanca': ['Dúo de velas blancas acanaladas: una en U y otra columna. Minimalismo nórdico para tu mesa de centro.', ['sala', 'comedor'], ['nordico', 'minimal', 'japandi'], ['arena-y-lino', 'noche-japandi']],
  'velas-cubo-burbujas': ['Dos velas cubo de burbujas en blanco. El detalle cute que vuelve acogedora cualquier mesa de noche.', ['dormitorio', 'bano'], ['minimal', 'nordico'], ['arena-y-lino']],
  'funda-chenilla-camello': ['Par de fundas de chenilla color camello de 45×45 cm. Suaves al tacto y con textura cálida.', ['sala', 'dormitorio'], ['nordico', 'boho'], ['arena-y-lino', 'terracota-andina']],
  'vela-esferica-onda': ['Vela esférica con forma de onda en tono sándalo. Una pequeña escultura de cera para repisas y bandejas.', ['sala', 'dormitorio'], ['japandi', 'boho'], ['terracota-andina', 'arena-y-lino']],
  'vela-bola-espiral': ['Vela en espiral de 247 g en blanco vainilla. Pieza protagonista para centros de mesa.', ['sala', 'comedor'], ['minimal', 'nordico'], ['arena-y-lino']],
  'funda-boho-felpa-beige': ['4 fundas boho de felpa beige con relieve de rombos, 45×45 cm. Suavidad de nube para tu cama o sofá.', ['dormitorio', 'sala'], ['boho', 'nordico'], ['arena-y-lino']],
  'jarron-ceramica-blanco': ['Jarrón de cerámica rústica blanco con pequeños puntos. Perfecto con ramas secas, pampas o eucalipto.', ['sala', 'comedor', 'home-office'], ['nordico', 'minimal', 'mediterraneo'], ['arena-y-lino', 'verde-salvia']],
  'alfombra-vintage-90x150': ['Alfombra de terciopelo estilo vintage en beige y arena, 90×150 cm. Lavable y antideslizante.', ['sala', 'dormitorio'], ['mediterraneo', 'nordico'], ['arena-y-lino']],
  'funda-pana-rayas-boho': ['4 fundas de pana a rayas en marrón neutro y crema, 45×45 cm. Calidez boho para el sofá.', ['sala'], ['boho', 'mediterraneo'], ['terracota-andina', 'arena-y-lino']],
  'alfombra-felpa-beige-120x160': ['Alfombra de pelo largo color beige, 120×160 cm. Mullida para pisar descalza al levantarte.', ['dormitorio'], ['nordico', 'boho'], ['arena-y-lino']],
  'funda-jacquard-geometrico': ['4 fundas jacquard con patrón geométrico en marrón claro y crema, 45×45 cm.', ['sala', 'dormitorio'], ['boho', 'japandi'], ['noche-japandi', 'terracota-andina']],
  'velas-columna-estriada': ['Dos velas columna estriadas en blanco vainilla. Altura y textura para tu repisa o baño.', ['sala', 'comedor', 'bano'], ['minimal', 'japandi'], ['verde-salvia', 'noche-japandi', 'arena-y-lino']],
  'figuras-elefantes-minimalistas': ['Familia de tres elefantes de cerámica en tonos tierra. Un detalle con historia para repisas y libreros.', ['sala', 'home-office'], ['boho', 'mediterraneo'], ['terracota-andina', 'arena-y-lino']],
};

// Productos nuevos (búsqueda 2026-10-21): [slug, nombre, categoria, goods_id, variante, unidades, costo, entrega, precio, desc, ambientes, estilos, paletas]
const nuevos = [
  ['fundas-pana-salvia', 'Fundas Rayas Texturizadas Salvia x2', 'fundas-cojines', '606076539904547', 'verde salvia / 45,72 x 45,72 cm', 1, 17.92, '6-19', 33, 'Par de fundas con rayas en relieve color verde salvia, 45×45 cm. Frescura serena para tu sofá.', ['sala', 'dormitorio'], ['nordico', 'mediterraneo'], ['verde-salvia']],
  ['fundas-pana-diagonal-salvia', 'Fundas Pana Diagonal Salvia x2', 'fundas-cojines', '601103682164994', 'verde salvia / 45 x 45 cm', 1, 27.39, '6-17', 42, 'Dos fundas de pana con textura diagonal en verde salvia claro, 45×45 cm.', ['sala'], ['nordico', 'boho'], ['verde-salvia']],
  ['jarron-botanico-verde', 'Jarrón Botánico Verde', 'accesorios', '601104370726623', '[M] 11.5 cm', 1, 34.29, '6-17', 49, 'Jarrón de cerámica crema con hojas verdes pintadas, 11,5 cm. Encantador con flores o una rama de eucalipto.', ['comedor', 'sala'], ['mediterraneo', 'nordico'], ['verde-salvia']],
  ['eucalipto-artificial-10', 'Tallos de Eucalipto x10', 'accesorios', '606403024500548', 'Especificación uno (10 tallos)', 1, 5.17, '6-17', 20, '10 tallos de eucalipto artificial en verde salvia. Llenan de vida un jarrón sin necesitar agua ni luz.', ['sala', 'comedor', 'bano', 'home-office'], ['nordico', 'mediterraneo', 'minimal'], ['verde-salvia', 'arena-y-lino']],
  ['manta-ondulada-salvia', 'Manta Ondulada Salvia', 'mantas', '605705746667981', 'verde salvia / 127 x 152 cm', 1, 62.89, '6-17', 78, 'Manta tejida con ondas y flecos en verde salvia, 127×152 cm. Para envolverte en el sofá las tardes frías.', ['sala', 'dormitorio'], ['nordico', 'boho'], ['verde-salvia']],
  ['fundas-pana-terracota', 'Fundas Pana Boho Terracota x2', 'fundas-cojines', '607532701579091', 'Terracota / 45,72 x 45,72 cm', 1, 24.27, '6-19', 39, 'Par de fundas de pana tejida color terracota, 45×45 cm. El calor de la tierra en tu sala.', ['sala'], ['boho', 'mediterraneo'], ['terracota-andina']],
  ['fundas-pana-diagonal-oxido', 'Fundas Pana Diagonal Óxido x2', 'fundas-cojines', '601103682164994', 'Óxido / 45 x 45 cm', 1, 27.09, '6-17', 42, 'Dos fundas de pana diagonal en color óxido, 45×45 cm. Combínalas con crema y madera.', ['sala', 'dormitorio'], ['boho'], ['terracota-andina']],
  ['vela-acanalada-sandalo', 'Vela Acanalada Sándalo', 'velas', '601103830454428', 'Marrón No. 2/Sándalo J-0268 (78 g)', 1, 15.38, '6-17', 30, 'Vela escultórica acanalada color sándalo (78 g). Forma facetada que juega con la luz.', ['sala', 'dormitorio'], ['japandi', 'boho'], ['terracota-andina', 'noche-japandi']],
  ['alfombra-yute-redonda-60', 'Alfombra Redonda de Yute 60 cm', 'alfombras', '601099756640791', 'Beige natural / 60 cm', 1, 50.62, '6-17', 66, 'Alfombra redonda tejida a mano en fibra natural, 60 cm de diámetro. Ideal junto a la cama, bajo una planta o en la terraza.', ['sala', 'terraza', 'dormitorio'], ['boho', 'mediterraneo', 'japandi'], ['terracota-andina', 'arena-y-lino']],
  ['manta-naranja-morandi', 'Manta Tejida Terracota', 'mantas', '601099525818516', 'Morandi Quema Naranja / 130 x 170 cm', 1, 53.97, '6-17', 69, 'Manta tejida con flecos en terracota quemado, 130×170 cm. Un golpe de color cálido sobre el sofá o la cama.', ['sala', 'dormitorio'], ['boho'], ['terracota-andina']],
  ['fundas-pana-carbon', 'Fundas Rayas Texturizadas Carbón x2', 'fundas-cojines', '606076539904547', 'Carbón / 45,72 x 45,72 cm', 1, 17.92, '6-19', 33, 'Par de fundas con rayas en relieve color carbón, 45×45 cm. Profundidad y calma para un rincón japandi.', ['sala', 'home-office'], ['japandi', 'minimal'], ['noche-japandi']],
  ['jarron-negro-mate', 'Jarrón Negro Mate', 'accesorios', '605501869907501', 'Tarro pequeño cerámica mate', 1, 33.19, '6-17', 48, 'Jarrón pequeño de cerámica negro mate, de boca estrecha. Perfecto con una sola rama seca.', ['sala', 'comedor', 'home-office'], ['japandi', 'minimal'], ['noche-japandi']],
  ['bandeja-madera-negra', 'Bandeja de Madera Negra', 'accesorios', '601100529844067', 'Negro', 1, 15.31, '6-17', 30, 'Bandeja rectangular de madera negra con patas. Ordena velas, jabones o perfumes con estilo.', ['bano', 'sala', 'comedor'], ['japandi', 'minimal'], ['noche-japandi']],
  ['candelabros-negros-3', 'Candelabros Negros x3', 'accesorios', '601105356311505', 'Conjunto de 3 piezas L', 1, 12.49, '6-17', 27, 'Set de 3 candelabros de metal negro en distintas alturas para velas largas. Elegancia minimalista para tu mesa.', ['comedor', 'sala'], ['minimal', 'nordico', 'japandi'], ['noche-japandi']],
];

let sql = `-- Fase 1 (2026-10-21): datos públicos del catálogo + 14 productos nuevos para las paletas.
-- Generado por scripts/sql-catalogo-fase1.mjs. Costos verificados en Temu (sesión de Alejandra) el ${REV}.

insert into public.productos (name, slug, description, price_from, currency, sort_order, active)
select 'Mantas', 'mantas', 'Mantas tejidas para sofá y cama', 69, 'PEN', 7, true
where not exists (select 1 from public.productos where slug = 'mantas');

`;

for (const [slug, [desc, amb, est, pal]] of Object.entries(existentes)) {
  sql += `update public.catalogo_productos set descripcion = ${q(desc)}, ambientes = ${arr(amb)}, estilos = ${arr(est)}, paletas = ${arr(pal)}, galeria = ${arr(galerias[slug])}, publicado = true where slug = ${q(slug)};\n`;
}

sql += `
-- Elefantes: verificado de nuevo (más barato que en abril)
update public.catalogo_productos set estado = 'disponible', precio_temu = 60.72, precio_aendra = 76, temu_goods_id = '601101432289972', variante_temu = 'Familia de tres', entrega_dias = '6-17', fecha_revision = '${REV}', notas = 'Verificado ${REV}: S/60.72 (abril estimado S/86).' where slug = 'figuras-elefantes-minimalistas';

-- Alfombra bohemia: solo talla 100x160 a S/112.94 y envío marítimo 34-58 días
update public.catalogo_productos set estado = 'no_disponible', precio_temu = 112.94, temu_goods_id = '605729788394247', variante_temu = '100x160 cm (la más chica)', entrega_dias = '34-58', fecha_revision = '${REV}', notas = 'Verificado ${REV}: sube a S/112.94 y llega por barco. Fuera de la web.' where slug = 'alfombra-bohemia-terciopelo';

-- No aparecen en Temu (búsqueda por imagen exacta)
update public.catalogo_productos set estado = 'no_disponible', fecha_revision = '${REV}', notas = 'No aparece en Temu (búsqueda por imagen exacta, ${REV}).'
where slug in ('funda-chenilla-vintage', 'funda-geometrico-diamantes', 'alfombra-terciopelo-vintage', 'alfombra-vintage-floral');

-- Lo que ya no se puede comprar deja de figurar como "en la web"
update public.catalogo_productos set en_web = false, publicado = false where estado = 'no_disponible';

insert into public.catalogo_productos
    (slug, nombre, categoria_id, precio_aendra, precio_temu, temu_goods_id, variante_temu, unidades_temu, imagen_url, entrega_dias, estado, en_web, fecha_revision, notas, descripcion, ambientes, estilos, paletas, galeria, publicado)
values
`;
sql += nuevos.map(([slug, nombre, cat, gid, variante, uds, costo, entrega, precio, desc, amb, est, pal]) =>
  `    (${q(slug)}, ${q(nombre)}, (select id from public.productos where slug = ${q(cat)}), ${precio}.00, ${costo.toFixed(2)}, ${q(gid)}, ${q(variante)}, ${uds}, ${q(galerias[slug][0])}, ${q(entrega)}, 'disponible', true, '${REV}'::date, 'Elegido para la paleta ${pal[0]} (${REV})', ${q(desc)}, ${arr(amb)}, ${arr(est)}, ${arr(pal)}, ${arr(galerias[slug])}, true)`
).join(',\n') + ';\n';

sql += `
update public.catalogo_productos set en_web = true where publicado;

select p.slug as categoria, count(*) as publicados from public.catalogo_publico c join public.productos p on p.slug = c.categoria group by p.slug order by 1;
`;

writeFileSync('supabase/migrations/20261021_catalogo_fase1_datos.sql', sql);
console.log('SQL listo:', sql.length, 'caracteres;', Object.keys(existentes).length, 'actualizados +', nuevos.length, 'nuevos');
