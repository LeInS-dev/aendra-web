// Mi moodboard: lista de slugs guardada en el navegador y mensaje para WhatsApp.
export const CLAVE = 'aendra_moodboard';
const LIMITE = 1800; // los links de wa.me muy largos fallan en algunos celulares

export function alternar(lista, slug) {
  return lista.includes(slug) ? lista.filter(s => s !== slug) : [...lista, slug];
}

export function mensajeWhatsApp(productos, baseUrl) {
  let texto = 'Hola Alejandra, armé mi moodboard en AENDRA y me gustaría tu ayuda:\n';
  for (let i = 0; i < productos.length; i++) {
    const p = productos[i];
    const linea = `• ${p.nombre} (S/${p.precio}) ${baseUrl}/producto/${p.slug}\n`;
    const resto = productos.length - i;
    if ((texto + linea).length + `…y ${resto} más`.length > LIMITE) return texto + `…y ${resto} más`;
    texto += linea;
  }
  return texto.trimEnd();
}
