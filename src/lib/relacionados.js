// "Combina con": productos que comparten paleta o estilo, los que comparten más primero.
const comunes = (a = [], b = []) => a.filter(x => b.includes(x)).length;

export function relacionados(producto, productos, n = 4) {
  return productos
    .filter(p => p.slug !== producto.slug)
    .map(p => ({ p, puntos: comunes(producto.paletas, p.paletas) + comunes(producto.estilos, p.estilos) }))
    .filter(x => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, n)
    .map(x => x.p);
}
