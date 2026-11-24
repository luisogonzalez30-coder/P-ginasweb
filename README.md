# Arredondo Estudio & Diseño — sitio web

Sitio estático (sin build). Abrir `index.html` con cualquier servidor estático (`python3 -m http.server`).

- `index.html` — intro 3D (clic en "Entrar" → `tienda.html`)
- `tienda.html` — tienda: banner de envío gratis, 3 productos, configurador 3D, banners Mercado Pago / WhatsApp
- `js/config.js` — **único archivo a editar**: WhatsApp, link Mercado Pago, precios, textos, FAQ
- `js/furniture.js` — motor 3D procedural (Three.js r128 local en `js/vendor`)

Pendientes antes de publicar: número real de WhatsApp (`whatsapp`), link de Mercado Pago (`mercadoPagoUrl`) y precios reales (los actuales son de ejemplo).
