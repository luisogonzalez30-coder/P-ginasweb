(function () {
  'use strict';
  const A = window.AED;
  // orden: del más económico al más caro; los "a cotizar" al final
  A.products.sort((a, b) => {
    const pa = Object.values(a.prices), pb = Object.values(b.prices);
    const ma = pa.length ? Math.min.apply(null, pa) : Infinity, mb = pb.length ? Math.min.apply(null, pb) : Infinity;
    return ma - mb;
  });
  document.documentElement.classList.add('js');
  const $ = (s, r) => (r || document).querySelector(s);
  const clp = n => '$' + Math.round(n).toLocaleString('es-CL');
  const waUrl = msg => 'https://wa.me/' + A.whatsapp + '?text=' + encodeURIComponent(msg);

  /* ---------- precio ---------- */
  const priceOf = (p, c) => (p.prices[c.width] == null ? null : p.prices[c.width]);
  const mpFor = (p, c) => (p.mp && p.mp[c.width]) || '';
  const cheapMp = p => { const k = Object.keys(p.prices).sort((a, b) => p.prices[a] - p.prices[b])[0]; return p.mp && k ? p.mp[k] : ''; };
  const hasPrice = p => Object.keys(p.prices).length > 0;
  const minPrice = p => Math.min.apply(null, Object.values(p.prices));
  const priceTxt = (p, c) => (priceOf(p, c) == null ? 'A cotizar' : clp(priceOf(p, c)));
  function describe(p, c) {
    const parts = [p.name, c.width + ' cm', 'madera ' + A.woods[c.wood].name, 'frente ' + A.fronts[c.front].name.toLowerCase(), A.bases[c.base].name.toLowerCase()];
    if (p.hasDrawers && c.front === 'cane') parts.push(c.drawers ? 'con cajones' : 'sin cajones');
    if (p.hasLed && c.led) parts.push('con luz LED inferior');
    if (c.handle === 'none') parts.push('sin tiradores');
    return parts;
  }
  function message(p, c, pay) {
    return 'Hola Arredondo Estudio & Diseño 👋\n' + (pay ? 'Quiero pagar con Mercado Pago este diseño:' : 'Quiero cotizar este diseño:') + '\n• ' +
      describe(p, c).join('\n• ') + (priceOf(p, c) == null ? '\nQuiero conocer precio y plazo (envío gratis).' : '\nPrecio: ' + clp(priceOf(p, c)) + ' (envío gratis)\n¿Me confirman plazo y disponibilidad?');
  }

  /* ---------- WhatsApp genérico ---------- */
  document.querySelectorAll('[data-wa]').forEach(a => {
    a.href = waUrl('Hola Arredondo Estudio & Diseño 👋 Quiero cotizar un mueble de madera nativa a medida.');
  });

  /* ---------- marquee ---------- */
  const msgs = [
    ['ENVÍO GRATIS', 'a todo Chile'],
    ['PAGA CON MERCADO PAGO', 'con todo medio de pago'],
    ['DISEÑA TU MUEBLE EN 3D', 'a tu medida'],
    ['WHATSAPP DIRECTO', 'cotiza en minutos'],
    ['MADERA NATIVA MACIZA', 'carpintería chilena']
  ];
  const mk = () => msgs.map(m => '<span class="marquee__item"><b>' + m[0] + '</b> ' + m[1] + '<i>◆</i></span>').join('');
  $('#marquee').innerHTML = mk() + mk() + mk() + mk();

  /* ---------- nav móvil ---------- */
  const burger = $('#burger'), links = $('#navLinks');
  burger.addEventListener('click', () => { const o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

  /* ---------- tarjetas ---------- */
  const cards = $('#cards');
  A.products.forEach((p, i) => {
    const el = document.createElement('article'); el.className = 'card reveal'; el.style.transitionDelay = (i * 90) + 'ms';
    el.innerHTML =
      '<div class="card__media"><span class="card__badge">0' + (i + 1) + ' · ' + p.kicker + '</span>' +
      '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy">' + (p.hover ? '<img src="' + p.hover + '" alt="' + p.name + ' en ambiente" loading="lazy">' : '') + '</div>' +
      '<div class="card__body"><p class="card__kicker">' + p.tagline + '</p><h3>' + p.name + '</h3><p class="card__desc">' + p.desc + '</p>' +
      '<ul class="card__specs">' + p.specs.map(s => '<li>' + s + '</li>').join('') + '</ul>' +
      '<div class="card__foot"><div class="price">' + (hasPrice(p) ? '<small>' + (Object.keys(p.prices).length > 1 ? 'Desde' : 'Precio') + '</small><strong>' + clp(minPrice(p)) + '</strong>' : '<small>Precio</small><strong>A cotizar</strong>') + '</div>' +
      '<div class="card__actions">' + (cheapMp(p) ? '<a class="btn btn--mp" target="_blank" rel="noopener" href="' + cheapMp(p) + '">Comprar con Mercado Pago</a>' : '') + '<button class="btn btn--primary" data-cfg="' + p.id + '">Personalizar en 3D</button>' +
      '<a class="btn btn--line" target="_blank" rel="noopener" href="' + waUrl('Hola 👋 Me interesa el ' + p.name + '. ¿Me envían información?') + '">Consultar por WhatsApp</a></div></div></div>';
    cards.appendChild(el);
  });
  cards.addEventListener('click', e => {
    const b = e.target.closest('[data-cfg]'); if (!b) return;
    select(b.dataset.cfg); $('#configurador').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- galería / faq ---------- */
  $('#gal').innerHTML = A.gallery.map(g => '<figure class="reveal"><img src="' + g.src + '" alt="' + g.alt + '" loading="lazy"></figure>').join('');
  $('#faq-list').innerHTML = A.faq.map(f => '<details class="reveal"><summary>' + f[0] + '</summary><p>' + f[1] + '</p></details>').join('');

  /* ---------- configurador ---------- */
  let opened = false;
  const tabs = $('#cfgTabs'), panel = $('#cfgPanel'), canvas = $('#cfgCanvas');
  let stage = null, cur = A.products[0], cfg = Object.assign({}, cur.defaults);

  A.products.forEach(p => {
    const b = document.createElement('button'); b.role = 'tab'; b.textContent = p.name; b.dataset.id = p.id;
    b.addEventListener('click', () => select(p.id)); tabs.appendChild(b);
  });

  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) throw 0;
    stage = window.AEDStage.createStage(canvas, { dark: false, autoRotate: true, fit: 1.6 });
  } catch (e) { $('#noGl').hidden = false; canvas.style.display = 'none'; }

  const optBtns = (key, ids, map) =>
    '<div class="seg" data-key="' + key + '">' + ids.map(id => '<button data-v="' + id + '" class="' + (String(cfg[key]) === String(id) ? 'on' : '') + '">' + map(id) + '</button>').join('') + '</div>';
  const group = (title, html, show) => show === false ? '' : '<div class="opt"><h4>' + title + '</h4>' + html + '</div>';

  function render() {
    const p = cur;
    if (p.hasDrawers && cfg.front !== 'cane') cfg.drawers = false;
    panel.innerHTML =
      '<div class="cfg__title"><small>' + p.kicker + '</small>' + p.name + '</div>' +
      '<div class="opt"><h4>Madera <em>' + A.woods[cfg.wood].name + '</em></h4><div class="sw" data-key="wood">' +
      Object.keys(A.woods).map(k => '<button data-v="' + k + '" class="' + (cfg.wood === k ? 'on' : '') + '" style="background:' + A.woods[k].hex + '" aria-label="' + A.woods[k].name + '"></button>').join('') + '</div><p class="cfg__note">' + A.woodsNote + '</p></div>' +
      group('Largo <em>' + cfg.width + ' cm</em>', optBtns('width', p.widths, w => w + ' cm'), p.widths.length > 1) +
      group('Frente', optBtns('front', p.frontsAllowed, id => A.fronts[id].name), p.frontsAllowed.length > 1) +
      group('Base', optBtns('base', p.basesAllowed, id => A.bases[id].name), p.basesAllowed.length > 1) +
      group('Cajones superiores', optBtns('drawers', [true, false], v => v ? 'Con cajones' : 'Sin cajones'), p.hasDrawers && cfg.front === 'cane') +
      group('Luz LED inferior', optBtns('led', [true, false], v => v ? 'Encendida' : 'Apagada'), !!p.hasLed) +
      group('Herrajes', optBtns('handle', p.handlesAllowed || ['brass', 'wood'], id => ((p.handleLabels && p.handleLabels[id]) || A.handles[id].name)), p.type === 'aparador' || p.type === 'flotante') +
      '<div class="cfg__sum"><ul>' + describe(p, cfg).slice(1).map(s => '<li>' + s + '</li>').join('') + '</ul>' +
      '<div class="cfg__price"><span>Tu diseño</span><strong id="cfgPrice">' + priceTxt(p, cfg) + '</strong></div>' +
      '<div class="cfg__ctas">' + (priceOf(p, cfg) == null ? '' : '<button class="btn btn--mp btn--block" id="payMp">Pagar con Mercado Pago</button>') +
      '<a class="btn btn--wa btn--block" id="quoteWa" target="_blank" rel="noopener" href="' + waUrl(message(p, cfg)) + '">Cotizar por WhatsApp</a></div>' +
      '<p class="cfg__fine" id="payHint"></p></div>';
    tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.id === p.id));
  }

  function apply(bump) {
    if (stage) stage.setCabinet(Object.assign({ type: cur.type }, cfg));
    const pr = $('#cfgPrice'), q = $('#quoteWa');
    pr.textContent = priceTxt(cur, cfg);
    if (bump) { pr.classList.add('bump'); setTimeout(() => pr.classList.remove('bump'), 350); }
    q.href = waUrl(message(cur, cfg));
    const ph = $('#payHint'); if (ph) ph.textContent = 'Envío gratis a todo Chile · ' + (priceOf(cur, cfg) != null && !mpFor(cur, cfg) ? 'Para este largo te enviamos el link de pago por WhatsApp' : 'Pago seguro con Mercado Pago');
    const t = $('.cfg__sum ul'); t.innerHTML = describe(cur, cfg).slice(1).map(s => '<li>' + s + '</li>').join('');
  }

  panel.addEventListener('click', e => {
    const b = e.target.closest('button[data-v]');
    if (b) {
      const key = b.parentElement.dataset.key; let v = b.dataset.v;
      if (key === 'width') v = +v; if (key === 'drawers' || key === 'led') v = v === 'true';
      cfg[key] = v;
      if (key === 'front') { render(); apply(true); return; }
      b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      const h = b.parentElement.previousElementSibling; // actualiza etiqueta
      if (key === 'width' && h) h.querySelector('em').textContent = v + ' cm';
      if (key === 'wood' && h) h.querySelector('em').textContent = A.woods[v].name;
      apply(true); return;
    }
    if (e.target.id === 'payMp') {
      const link = mpFor(cur, cfg);
      if (link) window.open(link, '_blank', 'noopener');
      else window.open(waUrl(message(cur, cfg, true)), '_blank', 'noopener');
    }
  });

  function select(id) {
    cur = A.products.find(p => p.id === id) || A.products[0];
    cfg = Object.assign({}, cur.defaults);
    render(); apply(false);
    if (stage) { stage.resetView(); stage.getCabinet().openAll(false); opened = false; $('#openAll').textContent = 'Abrir'; vbtns.forEach(x => x.classList.remove('on')); }
  }

  $('#zIn').addEventListener('click', () => stage && stage.setZoom(stage.getZoom() - 0.15));
  $('#zOut').addEventListener('click', () => stage && stage.setZoom(stage.getZoom() + 0.15));
  $('#resetView').addEventListener('click', () => stage && stage.resetView());
  $('#openAll').addEventListener('click', e => {
    if (!stage) return; opened = !opened; stage.getCabinet().openAll(opened); e.target.textContent = opened ? 'Cerrar' : 'Abrir';
  });
  const vbtns = document.querySelectorAll('[data-view]');
  vbtns.forEach(b => b.addEventListener('click', () => {
    if (!stage) return; stage.setView(b.dataset.view);
    vbtns.forEach(x => x.classList.toggle('on', x === b));
  }));
  $('#dimsBtn').addEventListener('click', e => { if (!stage) return; const on = e.currentTarget.classList.toggle('on'); stage.setDims(on); });
  $('#snapBtn').addEventListener('click', () => {
    if (!stage) return; const a = document.createElement('a');
    a.href = stage.snapshot(); a.download = (cur.id + '-' + cfg.width + 'cm.jpg'); a.click();
  });
  select(A.products[0].id);

  /* ---------- carrusel de trabajos ---------- */
  (function () {
    const track = $('#wTrack'), dots = $('#wDots'); if (!track) return;
    track.innerHTML = A.works.map(w => '<figure class="slide"><div class="slide__shot"><img src="' + w.src + '" alt="' + w.title + '" loading="lazy" draggable="false"><figcaption class="slide__cap">' + w.title + '</figcaption></div><div class="slide__refl" aria-hidden="true"><img src="' + w.src + '" alt="" loading="lazy" draggable="false"></div></figure>').join('');
    const slides = Array.from(track.children);
    dots.innerHTML = slides.map((_, i) => '<button aria-label="Ir a la foto ' + (i + 1) + '"></button>').join('');
    const db = Array.from(dots.children);
    let idx = 0, paused = false, resumeT;
    function fx() {
      const c = track.scrollLeft + track.clientWidth / 2; let best = 0, bd = 1e9;
      slides.forEach((s, i) => {
        const d = (s.offsetLeft + s.offsetWidth / 2 - c) / s.offsetWidth, a = Math.min(Math.abs(d), 2.4);
        s.style.transform = 'rotateY(' + (-Math.max(-1.6, Math.min(1.6, d)) * 22) + 'deg) scale(' + (1 - a * 0.1) + ')';
        s.style.opacity = 1 - a * 0.2; s.style.zIndex = 10 - Math.round(a);
        if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
      });
      if (best !== idx || !db[best].classList.contains('on')) { idx = best; db.forEach((d, i) => d.classList.toggle('on', i === idx)); }
    }
    function go(i) { i = (i + slides.length) % slides.length; const s = slides[i]; track.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2, behavior: 'smooth' }); }
    let raf; track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fx); }, { passive: true });
    $('#wPrev').addEventListener('click', () => { pause(); go(idx - 1); });
    $('#wNext').addEventListener('click', () => { pause(); go(idx + 1); });
    db.forEach((d, i) => d.addEventListener('click', () => { pause(); go(i); }));
    function pause() { paused = true; clearTimeout(resumeT); resumeT = setTimeout(() => (paused = false), 7000); }
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(ev => track.addEventListener(ev, pause, { passive: true }));
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(idx + 1); if (e.key === 'ArrowLeft') go(idx - 1); });
    /* arrastrar con el mouse */
    let down = false, sx = 0, sl = 0;
    track.addEventListener('mousedown', e => { down = true; sx = e.pageX; sl = track.scrollLeft; track.style.scrollSnapType = 'none'; track.style.cursor = 'grabbing'; });
    window.addEventListener('mouseup', () => { if (!down) return; down = false; track.style.scrollSnapType = ''; track.style.cursor = ''; go(idx); });
    window.addEventListener('mousemove', e => { if (down) track.scrollLeft = sl - (e.pageX - sx); });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { if (!paused && !document.hidden) go(idx + 1); }, 3800);
    window.addEventListener('resize', fx); setTimeout(() => { go(0); fx(); }, 120); fx();
  })();

  /* ---------- reveal ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
})();
