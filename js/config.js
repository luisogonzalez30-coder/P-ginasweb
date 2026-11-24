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

  // WhatsApp +56 9 7242 2825 (formato internacional sin "+")
  whatsapp: '56972422825',

  // ⚠️ REEMPLAZAR: link de pago de Mercado Pago (checkout pro / link de pago).
  // Si queda vacío, el botón "Pagar con Mercado Pago" abre WhatsApp con el pedido ya armado.
  mercadoPagoUrl: '',

  // Qué % del valor se abona para iniciar la fabricación (solo se muestra como texto)
  anticipoPct: 50,

  /* ---------- Opciones de materialidad (recargo sobre el precio base) ---------- */
  // Los precios son fijos por producto y ancho (ver products[].prices). Las opciones visuales no alteran el precio.
  woods: {
    natural: { name: 'Natural',  hex: '#d8a566' },
    miel:    { name: 'Miel',     hex: '#c27f40' },
    nogal:   { name: 'Nogal',    hex: '#7d4f31' },
    ebano:   { name: 'Ébano',    hex: '#43332b' }
  },
  fronts: {
    cane:  { name: 'Junco',    add: 0 },
    slats: { name: 'Listones', add: 0 },
    plain: { name: 'Liso',     add: 0 }
  },
  bases: {
    legs:     { name: 'Con patas',  add: 0 },
    floating: { name: 'Flotante',   add: 0 },
    floor:    { name: 'Zócalo',     add: 0 }
  },
  handles: {
    brass: { name: 'Latón',  add: 0 },
    wood:  { name: 'Madera', add: 0 }
  },
  drawersAdd: 0,

  /* ---------- Productos ----------
     ⚠️ LOS PRECIOS SON DE EJEMPLO (CLP). Ajusta base.price y perCm. */
  products: [
    {
      id: 'aparador',
      type: 'aparador',
      name: 'Buffet Boho Atacama',
      kicker: 'Línea Atacama',
      tagline: 'Puertas de junco, cajones y herrajes de latón.',
      desc: 'Buffet de diseño Boho con frentes de junco y cajones superiores. Almacenaje de sobra y presencia de pieza de colección.',
      img: 'img/aparador-atacama.jpg',
      hover: 'img/buffet-listones.jpg',
      defaults: { width: 180, wood: 'natural', front: 'cane', base: 'legs', handle: 'brass', drawers: true, depth: 45, height: 90 },
      widths: [180],
      frontsAllowed: ['cane', 'slats'],
      basesAllowed: ['legs'],
      hasDrawers: true,
      prices: { 180: 1200000 },
      specs: ['Largo 180 cm · Fondo 45 cm · Alto 90 cm', 'Diseño Boho con puertas de junco', 'Otras medidas: cotiza por WhatsApp']
    },
    {
      id: 'flotante',
      type: 'flotante',
      name: 'Rack Flotante Boho',
      kicker: 'Línea Boho',
      tagline: 'Liviano a la vista, firme en la pared.',
      desc: 'Rack flotante Boho de lenga con puertas de junco. Libera el piso y ordena tu living.',
      img: 'img/rack-flotante-bosque.jpg',
      hover: 'img/flotante-real.jpg',
      defaults: { width: 180, wood: 'natural', front: 'cane', base: 'floating', handle: 'brass', drawers: false, depth: 35, height: 45 },
      widths: [180, 200],
      frontsAllowed: ['cane'],
      basesAllowed: ['floating'],
      hasDrawers: false,
      prices: { 180: 800000, 200: 900000 },
      specs: ['Lenga con puertas de junco', 'Largo 180 o 200 cm · Fondo 35 cm · Alto 45 cm', 'Incluye kit de anclaje']
    },
    {
      id: 'rack-tv',
      type: 'tv',
      name: 'Rack TV Roble Nacional',
      kicker: 'Línea Nativa',
      tagline: 'Veta a la vista, nicho abierto y cajones.',
      desc: 'Rack de TV en roble nacional vaporizado, con nicho abierto para equipos y tres cajones amplios.',
      img: 'img/rack-tv-nativo-ambiente.jpg',
      hover: 'img/rack-tv-nativo-real.jpg',
      defaults: { width: 150, wood: 'miel', front: 'plain', base: 'floor', handle: 'wood', drawers: false, depth: 45, height: 65 },
      widths: [150, 200],
      frontsAllowed: ['plain'],
      basesAllowed: ['floor'],
      hasDrawers: false,
      prices: { 150: 1000000, 200: 1200000 },
      specs: ['Roble nacional vaporizado', 'Largo 150 o 200 cm · Fondo 45 cm · Alto 65 cm', 'Nicho abierto + 3 cajones']
    }
  ],

  gallery: [
    { src: 'img/flotante-real.jpg', alt: 'Rack flotante Boho de lenga con puertas de junco' },
    { src: 'img/flotante-dormitorio.jpg', alt: 'Rack flotante de junco en dormitorio' },
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
