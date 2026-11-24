/* ============================================================
   CONFIGURACIÓN DEL NEGOCIO  —  edita SOLO este archivo
   para cambiar precios, WhatsApp, textos de productos, etc.
   ============================================================ */
window.AED = {
  brand: {
    name: 'Arredondo Estudio & Diseño',
    short: 'AED',
    tagline: 'Carpintería Nativa • Chile',
    domain: 'arredondoestudioydiseño.cl'
  },

  // ⚠️ REEMPLAZAR: número en formato internacional sin "+" ni espacios (Chile = 56 + celular)
  whatsapp: '56900000000',

  // ⚠️ REEMPLAZAR: link de pago de Mercado Pago (checkout pro / link de pago).
  // Si queda vacío, el botón "Pagar con Mercado Pago" abre WhatsApp con el pedido ya armado.
  mercadoPagoUrl: '',

  // Qué % del valor se abona para iniciar la fabricación (solo se muestra como texto)
  anticipoPct: 50,

  /* ---------- Opciones de materialidad (recargo sobre el precio base) ---------- */
  woods: {
    natural: { name: 'Natural',  hex: '#d8a566', pct: 0    },
    miel:    { name: 'Miel',     hex: '#c27f40', pct: 0    },
    nogal:   { name: 'Nogal',    hex: '#7d4f31', pct: 0.06 },
    ebano:   { name: 'Ébano',    hex: '#43332b', pct: 0.08 }
  },
  fronts: {
    cane:  { name: 'Ratán',    add: 0     },
    slats: { name: 'Listones', add: 35000 },
    plain: { name: 'Liso',     add: -30000 }
  },
  bases: {
    legs:     { name: 'Con patas',  add: 0 },
    floating: { name: 'Flotante',   add: 15000 },
    floor:    { name: 'Zócalo',     add: 0 }
  },
  handles: {
    brass: { name: 'Latón',  add: 0 },
    wood:  { name: 'Madera', add: 0 }
  },
  drawersAdd: 70000,

  /* ---------- Productos ----------
     ⚠️ LOS PRECIOS SON DE EJEMPLO (CLP). Ajusta base.price y perCm. */
  products: [
    {
      id: 'aparador',
      type: 'aparador',
      name: 'Aparador Atacama',
      kicker: 'Línea Atacama',
      tagline: 'Puertas de ratán, cajones y herrajes de latón.',
      desc: 'Aparador de madera nativa con frentes de ratán natural y cajones superiores. Almacenaje de sobra, presencia de pieza de colección.',
      img: 'img/aparador-atacama.jpg',
      hover: 'img/buffet-listones.jpg',
      gallery: ['img/aparador-atacama.jpg', 'img/buffet-listones.jpg', 'img/buffet-listones-abierto.jpg'],
      defaults: { width: 180, wood: 'natural', front: 'cane', base: 'legs', handle: 'brass', drawers: true },
      widths: [140, 160, 180, 200],
      frontsAllowed: ['cane', 'slats', 'plain'],
      basesAllowed: ['legs', 'floating'],
      hasDrawers: true,
      price: { width: 180, price: 489990, perCm: 1900 },
      specs: ['Madera nativa maciza', 'Alto 86 cm · Fondo 45 cm', 'Ancho a medida']
    },
    {
      id: 'flotante',
      type: 'flotante',
      name: 'Rack Flotante Bosque',
      kicker: 'Línea Bosque',
      tagline: 'Liviano a la vista, firme en la pared.',
      desc: 'Rack suspendido con frentes de ratán y tiradores de madera. Libera el piso, ordena tu living y deja luz bajo el mueble.',
      img: 'img/rack-flotante-bosque.jpg',
      hover: 'img/flotante-living.jpg',
      gallery: ['img/rack-flotante-bosque.jpg', 'img/flotante-living.jpg', 'img/flotante-dormitorio.jpg', 'img/flotante-estudio-1.jpg', 'img/flotante-estudio-2.jpg'],
      defaults: { width: 160, wood: 'natural', front: 'cane', base: 'floating', handle: 'wood', drawers: false },
      widths: [120, 140, 160, 180, 200],
      frontsAllowed: ['cane', 'slats', 'plain'],
      basesAllowed: ['floating', 'legs'],
      hasDrawers: false,
      price: { width: 160, price: 359990, perCm: 1500 },
      specs: ['Madera nativa maciza', 'Alto 42 cm · Fondo 38 cm', 'Incluye kit de anclaje']
    },
    {
      id: 'rack-tv',
      type: 'tv',
      name: 'Rack TV Nativo',
      kicker: 'Línea Nativa',
      tagline: 'Veta a la vista, nicho abierto y cajones.',
      desc: 'Mueble de TV de madera nativa con nicho abierto para equipos y tres cajones amplios. Cantos limpios y veta continua.',
      img: 'img/rack-tv-nativo-ambiente.jpg',
      hover: 'img/rack-tv-nativo-real.jpg',
      gallery: ['img/rack-tv-nativo-ambiente.jpg', 'img/rack-tv-nativo-real.jpg'],
      defaults: { width: 150, wood: 'miel', front: 'plain', base: 'floor', handle: 'wood', drawers: false },
      widths: [120, 150, 180],
      frontsAllowed: ['plain', 'slats'],
      basesAllowed: ['floor', 'floating'],
      hasDrawers: false,
      price: { width: 150, price: 329990, perCm: 1400 },
      specs: ['Madera nativa maciza', 'Alto 55 cm · Fondo 42 cm', 'Nicho abierto + 3 cajones']
    }
  ],

  gallery: [
    { src: 'img/flotante-dormitorio.jpg', alt: 'Rack flotante de ratán en dormitorio' },
    { src: 'img/buffet-listones.jpg', alt: 'Buffet de listones en dormitorio rústico' },
    { src: 'img/rack-tv-nativo-ambiente.jpg', alt: 'Rack TV en living con vista al bosque' },
    { src: 'img/flotante-living.jpg', alt: 'Rack flotante frente a ventanal' },
    { src: 'img/aparador-atacama-limpia.jpg', alt: 'Aparador Atacama con piso de baldosa' }
  ],

  faq: [
    ['¿Cuánto demora la fabricación?', 'Cada mueble se fabrica a pedido. El plazo exacto se confirma al cotizar según medidas y carga de taller; te lo informamos antes de que pagues.'],
    ['¿El envío realmente es gratis?', 'Sí. Despachamos sin costo a todo Chile en cada mueble de la colección.'],
    ['¿Qué medios de pago aceptan?', 'Todos los que ofrece Mercado Pago: tarjetas de crédito y débito, transferencia y saldo en cuenta. Las cuotas dependen de tu tarjeta y banco.'],
    ['¿Puedo pedir medidas o acabados distintos?', 'Sí. Lo que ves en el configurador 3D es el punto de partida: escríbenos por WhatsApp y lo ajustamos a tu espacio.'],
    ['¿Qué madera usan?', 'Madera nativa maciza de origen chileno, tratada y sellada con aceites y barnices de uso interior.'],
    ['¿Viene armado?', 'Sí. Llega armado y protegido; los modelos flotantes incluyen kit de anclaje para pared.']
  ]
};
