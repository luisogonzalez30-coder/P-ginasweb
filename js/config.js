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

  // Mensualidad de la página web (la gestiona /api/estado; ver docs/MENSUALIDAD.md)
  mensualidad: { payUrl: 'https://mpago.la/27s4bGN' },

  instagram: { url: 'https://www.instagram.com/germanarredondonativos', handle: '@germanarredondonativos' },

  // ⚠️ REEMPLAZAR: link de pago de Mercado Pago (checkout pro / link de pago).
  // Si queda vacío, el botón "Pagar con Mercado Pago" abre WhatsApp con el pedido ya armado.
  mercadoPagoUrl: '',

  // Qué % del valor se abona para iniciar la fabricación (solo se muestra como texto)
  anticipoPct: 50,

  /* ---------- Opciones de materialidad (recargo sobre el precio base) ---------- */
  // Los precios son fijos por producto y ancho (ver products[].prices). Las opciones visuales no alteran el precio.
  // Mismo valor para las 4 maderas (confirmado por el taller)
  woods: {
    lenga:  { name: 'Lenga',          hex: '#e3bb8c' },
    rauli:  { name: 'Raulí',          hex: '#b86b3a' },
    coigue: { name: 'Coigüe',         hex: '#d6a46a' },
    roble:  { name: 'Roble nacional', hex: '#a85f33' }
  },
  woodsNote: 'Mismo valor en Lenga, Raulí, Coigüe y Roble nacional',
  fronts: {
    cane:  { name: 'Junco',    add: 0 },
    slats: { name: 'Puertas ranuradas', add: 0 },
    plain: { name: 'Liso',     add: 0 }
  },
  bases: {
    legs:     { name: 'Con patas',  add: 0 },
    floating: { name: 'Flotante',   add: 0 },
    floor:    { name: 'Zócalo',     add: 0 }
  },
  handles: {
    brass: { name: 'Latón',  add: 0 },
    wood:  { name: 'Madera', add: 0 },
    none:  { name: 'Sin tiradores', add: 0 }
  },
  drawersAdd: 0,

  /* ---------- Productos ----------
     prices = precio CLP por largo (cm) · mp = link de pago de Mercado Pago por largo (del taller) */
  products: [
    {
      id: 'aparador',
      type: 'aparador',
      name: 'Buffet Boho Atacama',
      kicker: 'Línea Atacama',
      tagline: 'Puertas de junco, cajones y herrajes de latón.',
      desc: 'Buffet de diseño Boho con frentes de junco y cajones superiores. Almacenaje de sobra y presencia de pieza de colección.',
      img: 'img/aparador-atacama.jpg',
      defaults: { width: 180, wood: 'coigue', front: 'cane', base: 'legs', handle: 'brass', drawers: true, depth: 45, height: 90 },
      widths: [180],
      frontsAllowed: ['cane'],
      basesAllowed: ['legs'],
      hasDrawers: true,
      handlesAllowed: ['brass', 'none'],
      handleLabels: { brass: 'Con tiradores', none: 'Sin tiradores' },
      prices: { 180: 1100000 },
      mp: { 180: 'https://mpago.la/2iH29Pg' },
      specs: ['Largo 180 cm · Fondo 45 cm · Alto 90 cm', 'Con o sin tirador', 'Lenga, Raulí, Coigüe o Roble nacional (mismo valor)']
    },
    {
      id: 'nordico',
      type: 'nordico',
      name: 'Aparador Nórdico Cascada',
      kicker: 'Línea Nórdica',
      tagline: 'Puertas ranuradas y cubierta en cascada.',
      desc: 'Diseño nórdico de puertas ranuradas con cierre push to open y estructura cascada: las vetas de la madera nativa cruzan desde un lateral, pasan por la cubierta y terminan en el otro lateral, para apreciar vetas continuas en la madera que elijas.',
      img: 'img/nordico-real.jpg',
      hover: 'img/buffet-listones.jpg',
      defaults: { width: 180, wood: 'lenga', front: 'slats', base: 'legs', handle: 'wood', drawers: false, depth: 45, height: 80 },
      widths: [180],
      frontsAllowed: ['slats'],
      basesAllowed: ['legs'],
      hasDrawers: false,
      prices: { 180: 1100000 },
      mp: { 180: 'https://mpago.la/1S4TvCo' },
      specs: ['Largo 180 cm · Fondo 45 cm · Alto 80 cm', 'Puertas acanaladas, apertura push to open', 'Lenga, Raulí, Coigüe o Roble nacional (mismo valor)']
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
      defaults: { width: 180, wood: 'lenga', front: 'cane', base: 'floating', handle: 'brass', drawers: false, led: false, depth: 35, height: 45 },
      widths: [180, 200],
      frontsAllowed: ['cane'],
      basesAllowed: ['floating'],
      hasDrawers: false,
      hasLed: true,
      prices: { 180: 800000, 200: 900000 },
      mp: { 180: 'https://mpago.la/1AQQ3VD' },
      specs: ['Puertas de junco · Largo 180 o 200 cm', 'Fondo 35 cm · Alto 45 cm · Incluye kit de anclaje', 'Lenga, Raulí, Coigüe o Roble nacional (mismo valor)']
    },
    {
      id: 'rack-tv',
      type: 'tv',
      name: 'Rack TV Roble Nacional',
      kicker: 'Línea Nativa',
      tagline: 'Veta a la vista, nicho abierto y cajones.',
      desc: 'Rack de TV en roble nacional vaporizado, con nicho abierto para equipos y tres cajones amplios. También en lenga, raulí o coigüe.',
      img: 'img/rack-tv-nativo-ambiente.jpg',
      hover: 'img/rack-tv-nativo-real.jpg',
      defaults: { width: 150, wood: 'roble', front: 'plain', base: 'floor', handle: 'wood', drawers: false, depth: 45, height: 65 },
      widths: [150, 200],
      frontsAllowed: ['plain'],
      basesAllowed: ['floor'],
      hasDrawers: false,
      prices: { 150: 900000, 200: 990000 },
      mp: { 150: 'https://mpago.la/1a3YBfX', 200: 'https://mpago.la/31kQGA5' },
      specs: ['Roble nacional vaporizado · Largo 150 o 200 cm', 'Fondo 45 cm · Alto 65 cm · Nicho abierto + 3 cajones', 'Lenga, Raulí, Coigüe o Roble nacional (mismo valor)']
    }
  ],

  works: [
    { src: 'img/trabajos/t06.jpg', title: 'Aparador de junco' },
    { src: 'img/trabajos/t12.jpg', title: 'Rack TV de junco y latón' },
    { src: 'img/trabajos/t10.jpg', title: 'Rack TV con cajones' },
    { src: 'img/trabajos/t03.jpg', title: 'Vitrina con luz LED' },
    { src: 'img/trabajos/t11.jpg', title: 'Vinoteca con vitrinas' },
    { src: 'img/trabajos/t05.jpg', title: 'Vanitorio doble' },
    { src: 'img/trabajos/t01.jpg', title: 'Muebles de cocina' },
    { src: 'img/trabajos/t13.jpg', title: 'Vitrina con puertas de vidrio' },
    { src: 'img/trabajos/t02.jpg', title: 'Vanitorio con cajones' },
    { src: 'img/trabajos/t07.jpg', title: 'Vanitorio doble' },
    { src: 'img/trabajos/t04.jpg', title: 'Vitrina con cajón y LED' },
    { src: 'img/trabajos/t08.jpg', title: 'Vanitorio doble' },
    { src: 'img/trabajos/t09.jpg', title: 'Rack TV de junco' }
  ],

  gallery: [
    { src: 'img/nordico-real.jpg', alt: 'Aparador nórdico de puertas ranuradas con cubierta en cascada' },
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
