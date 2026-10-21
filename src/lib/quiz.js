// Test "¿Cuál es tu mood?": suma puntos por estilo y paleta según las respuestas.

function ganador(puntos, orden) {
  // Mayor puntaje; en empate (o sin puntos) gana el que aparece primero en las taxonomías
  return orden.reduce((mejor, slug) => ((puntos[slug] || 0) > (puntos[mejor] || 0) ? slug : mejor), orden[0]);
}

export function puntuarQuiz(quiz, respuestas, taxonomias) {
  const total = { estilo: {}, paleta: {} };
  let ambiente = null;
  for (const pregunta of quiz.preguntas) {
    const opcion = pregunta.opciones.find(o => o.id === respuestas[pregunta.id]);
    if (!opcion) continue;
    if (opcion.ambiente) ambiente = opcion.ambiente;
    for (const tipo of ['estilo', 'paleta']) {
      for (const [slug, n] of Object.entries(opcion.puntos?.[tipo] || {})) total[tipo][slug] = (total[tipo][slug] || 0) + n;
    }
  }
  return {
    estilo: ganador(total.estilo, taxonomias.estilos.map(e => e.slug)),
    paleta: ganador(total.paleta, taxonomias.paletas),
    ambiente,
  };
}

export function recomendar({ estilo, paleta, ambiente }, productos, kits) {
  const puntos = p => (p.paletas.includes(paleta) ? 3 : 0) + (p.estilos.includes(estilo) ? 2 : 0) + (ambiente && p.ambientes.includes(ambiente) ? 1 : 0);
  const elegidos = productos
    .map(p => ({ p, n: puntos(p) }))
    .filter(x => x.n >= 2)
    .sort((a, b) => b.n - a.n)
    .slice(0, 6)
    .map(x => x.p);
  const slugs = new Set(elegidos.map(p => p.slug));
  const kit = kits
    .map(k => ({ k, n: k.productos.filter(s => slugs.has(s)).length }))
    .sort((a, b) => b.n - a.n)[0]?.k || null;
  return { productos: elegidos, kit };
}
