// Filtros de la tienda: todos los filtros activos deben cumplirse a la vez.
const CAMPOS = { ambiente: 'ambientes', estilo: 'estilos', paleta: 'paletas' };

export function filtrarProductos(productos, filtros = {}) {
  return productos.filter(p => Object.entries(filtros).every(([clave, valor]) => {
    if (!valor) return true;
    if (clave === 'categoria') return p.categoria === valor;
    const campo = CAMPOS[clave];
    return campo ? (p[campo] || []).includes(valor) : true;
  }));
}
