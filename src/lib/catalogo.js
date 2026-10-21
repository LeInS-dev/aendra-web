// Convierte una fila de la vista `catalogo_publico` en el producto que ve la web.
// Lista blanca de campos: aunque la vista se amplíe, costos y proveedor nunca llegan al sitio.

const lista = v => (Array.isArray(v) ? v : []);

export function toPublicProduct(fila) {
  return {
    slug: fila.slug,
    nombre: fila.nombre,
    categoria: fila.categoria,
    precio: Math.round(Number(fila.precio_aendra)),
    descripcion: fila.descripcion || '',
    ambientes: lista(fila.ambientes),
    estilos: lista(fila.estilos),
    paletas: lista(fila.paletas),
    galeria: lista(fila.galeria).filter(src => typeof src === 'string' && src.startsWith('/img/')),
    entrega: fila.entrega_dias || '6-19',
  };
}
