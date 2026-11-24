/* ============================================================
   Motor 3D compartido (landing + configurador)
   Muebles procedurales modelados sobre las fotos reales:
   - Buffet Boho Atacama  (puertas con marco en inglete + junco, cajones, patas)
   - Rack Flotante Boho   (caja tipo "cascada", 4 puertas en inglete + junco, LED opcional)
   - Rack TV Roble        (cascada de tablas, nicho abierto, 3 cajones que se deslizan)
   Requiere js/vendor/three.min.js (r128).
   ============================================================ */
(function (g) {
  'use strict';
  const T = g.THREE;

  const WOODS = {
    natural: { base: '#d6a46a', dark: '#a8723a' },
    lenga:   { base: '#e3bb8c', dark: '#b98a55' },
    miel:    { base: '#c27f40', dark: '#8c5222' },
    roble:   { base: '#a85f33', dark: '#6b3418' },
    nogal:   { base: '#7d4f31', dark: '#4a2b18' },
    ebano:   { base: '#43332b', dark: '#1f1612' }
  };

  /* ---------- helpers ---------- */
  function rng(seed) {
    let s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return () => (s = s * 16807 % 2147483647) / 2147483647;
  }
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function mkTex(c) {
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 8;
    return t;
  }

  /* ---------- texturas ---------- */
  const _wood = {};
  function grain(x, w, r, n, y0, y1) {
    for (let i = 0; i < n; i++) {
      const y = y0 + r() * (y1 - y0), amp = 1 + r() * 4, k = 1 + Math.floor(r() * 3), ph = r() * 6.28, dark = r() > 0.25;
      x.strokeStyle = dark ? rgba(w.dark, 0.05 + r() * 0.15) : rgba('#ffffff', 0.04 + r() * 0.07);
      x.lineWidth = 0.6 + r() * 2.2;
      x.beginPath();
      for (let px = 0; px <= 512; px += 16) {
        const yy = y + Math.sin(px / 512 * 6.283 * k + ph) * amp;
        px ? x.lineTo(px, yy) : x.moveTo(px, yy);
      }
      x.stroke();
    }
  }
  function woodBase(key) {
    if (_wood[key]) return _wood[key];
    const w = WOODS[key], c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d'), r = rng(11);
    x.fillStyle = w.base; x.fillRect(0, 0, 512, 512);
    grain(x, w, r, 180, 0, 512);
    return (_wood[key] = mkTex(c));
  }
  /* tablones de distinto tono (rack TV de roble): 'h' = bandas horizontales, 'v' = verticales */
  function plankBase(key, orient) {
    const k = 'p' + key + orient;
    if (_wood[k]) return _wood[k];
    const w = WOODS[key], c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d'), r = rng(23), nb = 6, bh = 512 / nb;
    x.fillStyle = w.base; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < nb; i++) {
      const sh = (r() - 0.5) * 0.34;
      x.fillStyle = sh > 0 ? rgba('#ffffff', sh * 0.45) : rgba('#000000', -sh * 0.8);
      x.fillRect(0, i * bh, 512, bh);
      x.save(); x.beginPath(); x.rect(0, i * bh, 512, bh); x.clip();
      grain(x, w, r, 34, i * bh, (i + 1) * bh); x.restore();
      x.fillStyle = rgba('#000000', 0.28); x.fillRect(0, i * bh, 512, 1.5);
    }
    if (orient === 'v') {
      const c2 = document.createElement('canvas'); c2.width = c2.height = 512;
      const x2 = c2.getContext('2d'); x2.translate(256, 256); x2.rotate(Math.PI / 2); x2.drawImage(c, -256, -256);
      return (_wood[k] = mkTex(c2));
    }
    return (_wood[k] = mkTex(c));
  }

  function woodBaseV(key) {
    const k = 'v' + key;
    if (_wood[k]) return _wood[k];
    const src = woodBase(key).image, c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d'); x.translate(256, 256); x.rotate(Math.PI / 2); x.drawImage(src, -256, -256);
    return (_wood[k] = mkTex(c));
  }
  const _mat = {};
  function mat(key, tex, rx, ry, shade, rough) {
    shade = shade || 1;
    const k = key + '|' + rx.toFixed(1) + '|' + ry.toFixed(1) + '|' + shade;
    if (_mat[k]) return _mat[k];
    const t = tex.clone(); t.repeat.set(rx, ry); t.needsUpdate = true;
    return (_mat[k] = new T.MeshStandardMaterial({ map: t, roughness: rough || 0.5, metalness: 0, envMapIntensity: 0.45, color: new T.Color(shade, shade, shade) }));
  }
  function woodMat(key, a, b, shade) { return mat(key + 'w', woodBase(key), Math.max(0.3, a / 0.7), Math.max(0.3, b / 0.7), shade); }
  function woodMatV(key, a, b, shade) { return mat(key + 'wv', woodBaseV(key), Math.max(0.3, a / 0.7), Math.max(0.3, b / 0.7), shade); }
  function plankMat(key, orient, uLen, vLen, shade) {
    const rx = orient === 'h' ? uLen / 1.0 : uLen / 0.48, ry = orient === 'h' ? vLen / 0.48 : vLen / 1.0;
    return mat(key + orient, plankBase(key, orient), Math.max(0.3, rx), Math.max(0.3, ry), shade, 0.42);
  }

  let _caneBase;
  function caneMat(w, h) {
    if (!_caneBase) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d');
      x.fillStyle = '#5a3d22'; x.fillRect(0, 0, 128, 128);
      // trama octogonal abierta (junco)
      x.lineCap = 'round';
      x.strokeStyle = '#e8c58c'; x.lineWidth = 6;
      for (let i = 0; i < 128; i += 32) {
        x.beginPath(); x.moveTo(i + 16, 0); x.lineTo(i + 16, 128); x.stroke();
        x.beginPath(); x.moveTo(0, i + 16); x.lineTo(128, i + 16); x.stroke();
      }
      x.strokeStyle = '#d2a669'; x.lineWidth = 4.5;
      for (let i = -128; i < 256; i += 64) {
        x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke();
        x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke();
      }
      x.fillStyle = 'rgba(30,18,8,.55)';
      for (let i = 0; i < 128; i += 32) for (let j = 0; j < 128; j += 32) { x.beginPath(); x.arc(i + 32, j + 32, 5, 0, 6.3); x.fill(); }
      _caneBase = mkTex(c);
    }
    const k = 'cane|' + Math.round(w * 100) + '|' + Math.round(h * 100);
    if (_mat[k]) return _mat[k];
    const t = _caneBase.clone(); t.repeat.set(w / 0.04, h / 0.04); t.needsUpdate = true;
    return (_mat[k] = new T.MeshStandardMaterial({ map: t, roughness: 0.85, metalness: 0 }));
  }

  const brass = new T.MeshStandardMaterial({ color: 0xc9a456, metalness: 0.75, roughness: 0.32 });
  const darkIn = new T.MeshStandardMaterial({ color: 0x4a3524, roughness: 0.9 });

  /* ---------- marco con inglete y bisel (puertas de la foto) ---------- */
  function bevelFrame(w, h, bw, th, wm) {
    const hw = w / 2, hh = h / 2;
    const loop = (inset, z) => [[-hw + inset, -hh + inset, z], [hw - inset, -hh + inset, z], [hw - inset, hh - inset, z], [-hw + inset, hh - inset, z]];
    const L = [loop(0, 0), loop(0, th), loop(bw * 0.38, th), loop(bw, th * 0.35), loop(bw, 0)];
    const kind = ['wall', 'front', 'front', 'inner'];
    const pos = [], uv = [];
    function tri(a, b, c, e) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
      if (n[0] * e[0] + n[1] * e[1] + n[2] * e[2] < 0) { const t = b; b = c; c = t; }
      [a, b, c].forEach(p => { pos.push(p[0], p[1], p[2]); uv.push(p[0] / w + 0.5, p[1] / h + 0.5); });
    }
    for (let l = 0; l < 4; l++) for (let k = 0; k < 4; k++) {
      const a = L[l][k], b = L[l][(k + 1) % 4], c = L[l + 1][(k + 1) % 4], d = L[l + 1][k];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const e = kind[l] === 'wall' ? [mx, my, 0] : kind[l] === 'inner' ? [-mx, -my, 0] : [0, 0, 1];
      tri(a, b, c, e); tri(a, c, d, e);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals(); geo.translate(0, 0, -th / 2);
    const m = new T.Mesh(geo, wm); m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /* ---------- mueble paramétrico ----------
     cfg: { type:'aparador'|'flotante'|'tv', width, depth, height (cm), wood,
            front:'cane'|'slats'|'plain', base:'legs'|'floating'|'floor',
            handle:'brass'|'wood', drawers:boolean, led:boolean, floatY:m } */
  const DEF = { aparador: [45, 90], nordico: [45, 75], flotante: [35, 45], tv: [45, 65] };

  function buildCabinet(cfg) {
    const type = cfg.type, wk = cfg.wood;
    const dd = DEF[type] || DEF.aparador;
    const W = cfg.width / 100, D = (cfg.depth || dd[0]) / 100, Htot = (cfg.height || dd[1]) / 100;
    const slatsStyle = type === 'nordico' || (type === 'aparador' && cfg.front === 'slats');
    const legH = cfg.base === 'legs' ? (slatsStyle ? 0.2 : 0.16) : cfg.base === 'floor' ? 0.05 : 0;
    const bodyH = Htot - legH;
    const root = new T.Group();
    const body = new T.Group(); body.position.y = legH; root.add(body);
    const movers = [], meshes = [];

    function add(parent, geo, m, x, y, z, shadow) {
      const o = new T.Mesh(geo, m); o.position.set(x, y, z);
      o.castShadow = shadow !== false; o.receiveShadow = true; parent.add(o); meshes.push(o); return o;
    }
    const box = (parent, w, h, d, m, x, y, z, s) => add(parent, new T.BoxGeometry(w, h, d), m, x, y, z, s);
    const inner = woodMat(wk, W, D, 0.62);
    const isTV = type === 'tv', isFlot = type === 'flotante' || type === 'nordico';

    /* ---- carcasa ---- */
    const tt = isTV ? 0.04 : isFlot ? 0.03 : 0.028;   // tapa
    const ts = isTV ? 0.035 : isFlot ? 0.03 : 0.03;    // laterales
    const ovF = isTV ? 0.012 : isFlot ? 0 : 0.012;     // vuelo frontal de la tapa
    const ovS = (isTV || isFlot) ? 0 : 0.012;

    if (isTV) {
      box(body, W, tt, D + ovF, plankMat(wk, 'h', W, D), 0, bodyH - tt / 2, ovF / 2);
      [-1, 1].forEach(s => box(body, ts, bodyH - tt, D, plankMat(wk, 'v', D, bodyH), s * (W / 2 - ts / 2), (bodyH - tt) / 2, 0));
    } else {
      box(body, W + 2 * ovS, tt, D + ovF, woodMat(wk, W, D), 0, bodyH - tt / 2, ovF / 2);
      [-1, 1].forEach(s => box(body, ts, bodyH - tt, D, woodMatV(wk, D, bodyH), s * (W / 2 - ts / 2), (bodyH - tt) / 2, 0));
    }
    box(body, W - 2 * ts, 0.025, D, inner, 0, 0.0125, 0);                                  // base
    box(body, W - 2 * ts, bodyH - tt - 0.025, 0.012, inner, 0, (bodyH - tt + 0.025) / 2, -D / 2 + 0.006); // fondo
    if (!isTV) box(body, W - 2 * ts, 0.016, D - 0.04, inner, 0, bodyH * 0.42, -0.01);       // repisa

    /* ---- base ---- */
    if (cfg.base === 'legs') {
      if (slatsStyle) {
        const lm = woodMat(wk, 0.1, 0.3, 0.95);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
          const leg = new T.Mesh(new T.CylinderGeometry(0.03, 0.017, legH + 0.02, 4), lm);
          leg.rotation.y = Math.PI / 4;
          const px = sx * (W / 2 - 0.07), pz = sz * (D / 2 - 0.07);
          leg.position.set(px + sx * 0.035, legH / 2, pz + sz * 0.012);
          leg.rotation.z = -sx * 0.2; leg.rotation.x = sz * 0.06;
          leg.castShadow = true; root.add(leg); meshes.push(leg);
        });
      } else {
        const lm = woodMat(wk, 0.1, 0.3, 0.95);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
          const leg = new T.Mesh(new T.CylinderGeometry(0.034, 0.02, legH + 0.012, 4), lm);
          leg.rotation.y = Math.PI / 4;
          leg.position.set(sx * (W / 2 - 0.045), legH / 2, sz * (D / 2 - 0.045));
          leg.castShadow = true; root.add(leg); meshes.push(leg);
        });
      }
    } else if (cfg.base === 'floor') {
      box(root, W - 0.07, legH + 0.002, D - 0.07, inner, 0, legH / 2, -0.005);
    }

    const Wi = W - 2 * ts, z0 = D / 2, yBot = 0.025, yTop = bodyH - tt;
    const handleMat = cfg.handle === 'wood' ? woodMat(wk, 0.1, 0.1, 0.8) : brass;

    /* ---- cajón deslizable ---- */
    function drawer(x, y, w, h, frontMat, withHandle) {
      const grp = new T.Group(); grp.position.set(x, y, 0);
      const dep = D - 0.06;
      box(grp, w, h, 0.022, frontMat, 0, 0, z0 - 0.011);
      box(grp, 0.012, h * 0.78, dep, darkIn, -w / 2 + 0.03, 0, z0 - 0.022 - dep / 2, false);
      box(grp, 0.012, h * 0.78, dep, darkIn, w / 2 - 0.03, 0, z0 - 0.022 - dep / 2, false);
      box(grp, w - 0.06, 0.01, dep, darkIn, 0, -h * 0.39, z0 - 0.022 - dep / 2, false);
      box(grp, w - 0.06, h * 0.78, 0.01, darkIn, 0, 0, z0 - 0.022 - dep, false);
      if (withHandle) {
        const hb = new T.Mesh(new T.CylinderGeometry(0.0055, 0.0055, Math.min(0.17, w * 0.5), 12), handleMat);
        hb.rotation.z = Math.PI / 2; hb.position.set(0, h * 0.18, z0 + 0.016); hb.castShadow = true; grp.add(hb);
        [-1, 1].forEach(s => { const st = new T.Mesh(new T.CylinderGeometry(0.003, 0.003, 0.016, 8), handleMat); st.rotation.x = Math.PI / 2; st.position.set(s * Math.min(0.17, w * 0.5) * 0.4, h * 0.18, z0 + 0.008); grp.add(st); });
      }
      grp.userData.mover = true;
      body.add(grp);
      movers.push({ obj: grp, kind: 'drawer', angle: 0, target: 0, slide: Math.min(0.32, dep * 0.7), baseZ: 0 });
    }

    /* ---- zonas ---- */
    let doorsTop = yTop, doorsBot = yBot;
    if (type === 'nordico') { box(body, Wi, 0.05, 0.02, woodMat(wk, Wi, 0.05), 0, yBot + 0.025, z0 - 0.012); doorsBot = yBot + 0.05; }
    if (type === 'aparador' && cfg.front === 'cane' && cfg.drawers) {
      const dh = 0.15, n = W > 1.5 ? 4 : 3, gap = 0.004;
      const dTop = yTop, dBot = yTop - dh; doorsTop = dBot - 0.004;
      const dw = Wi / n - gap;
      for (let i = 0; i < n; i++) drawer(-Wi / 2 + (i + 0.5) * (Wi / n), (dTop + dBot) / 2, dw, dh - 0.003, woodMat(wk, dw, dh), true);
    }
    if (isTV) {
      const oh = 0.19;                               // nicho abierto
      const shelfY = yTop - oh;
      box(body, Wi, 0.022, D - 0.03, plankMat(wk, 'h', Wi, D, 0.9), 0, shelfY - 0.011, -0.012);
      const dTop = shelfY - 0.024, dBot = yBot + 0.004, n = 3, gap = 0.005;
      const dh = dTop - dBot, dw = Wi / n - gap;
      for (let i = 0; i < n; i++) drawer(-Wi / 2 + (i + 0.5) * (Wi / n), (dTop + dBot) / 2, dw, dh, plankMat(wk, 'h', dw, dh), false);
    }

    /* ---- puertas ---- */
    if (!isTV) {
      const nDoors = slatsStyle ? 3 : (W <= 1.3 ? 2 : 4);
      const dW = Wi / nDoors, dH = doorsTop - doorsBot - 0.004, dY = (doorsTop + doorsBot) / 2;
      const TH = 0.026, BW = 0.062;
      for (let i = 0; i < nDoors; i++) {
        const left = slatsStyle ? i < 2 : i % 2 === 0;
        const dw = dW - 0.004, xl = -Wi / 2 + i * dW + 0.002;
        const pivot = new T.Group(); pivot.position.set(left ? xl : xl + dw, dY, z0 - (type === 'nordico' ? 0.022 : 0.004) + TH / 2 - 0.004);
        const door = new T.Group(); door.position.x = left ? dw / 2 : -dw / 2; pivot.add(door);

        if (cfg.front === 'cane') {
          door.add(bevelFrame(dw, dH, BW, TH, woodMat(wk, dw, dH)));
          meshes.push(door.children[0]);
          const pw = dw - 2 * BW + 0.012, ph = dH - 2 * BW + 0.012;
          const pane = new T.Mesh(new T.PlaneGeometry(pw, ph), caneMat(pw, ph));
          pane.position.z = -TH / 2 + TH * 0.3; pane.receiveShadow = true; door.add(pane); meshes.push(pane);
        } else if (slatsStyle) {
          box(door, dw, dH, 0.01, woodMat(wk, dw, dH, 0.55), 0, 0, -0.008, false);
          const pitch = 0.0235, n = Math.floor(dw / pitch), sm = woodMat(wk, 0.05, dH, 1.0);
          const x0 = -((n - 1) * pitch) / 2;
          for (let s = 0; s < n; s++) box(door, 0.016, dH, 0.02, sm, x0 + s * pitch, 0, 0.002, false);
        } else {
          box(door, dw, dH, TH, woodMat(wk, dw, dH), 0, 0, 0);
        }

        /* tiradores (según las fotos) */
        const edge = (left ? 1 : -1) * (dw / 2 - 0.045);
        const hasInnerEdge = slatsStyle ? false : true;
        if (!slatsStyle && type === 'aparador') {
          const L = Math.min(0.24, dH * 0.42);
          const bar = new T.Mesh(new T.CylinderGeometry(0.0065, 0.0065, L, 12), handleMat);
          bar.position.set(edge + (left ? 0.012 : -0.012), 0, TH / 2 + 0.02); bar.castShadow = true; door.add(bar);
          [-1, 1].forEach(s => { const st = new T.Mesh(new T.CylinderGeometry(0.003, 0.003, 0.02, 8), handleMat); st.rotation.x = Math.PI / 2; st.position.set(edge + (left ? 0.012 : -0.012), s * L * 0.4, TH / 2 + 0.01); door.add(st); });
        } else if (!slatsStyle && hasInnerEdge) {
          // perilla redonda en la unión de puertas
          const kn = new T.Mesh(new T.CylinderGeometry(0.0145, 0.0145, 0.022, 24), handleMat);
          kn.rotation.x = Math.PI / 2; kn.position.set((left ? 1 : -1) * (dw / 2 - 0.03), dH * 0.12, TH / 2 + 0.011); kn.castShadow = true; door.add(kn);
        }
        pivot.userData.mover = true;
        body.add(pivot);
        movers.push({ obj: pivot, kind: 'door', left, angle: 0, target: 0 });
      }
    }

    /* ---- LED inferior (rack flotante) ---- */
    let led = null;
    if (isFlot && cfg.led && cfg.base === 'floating') {
      led = new T.Group();
      const strip = new T.Mesh(new T.BoxGeometry(W - 0.08, 0.006, 0.02), new T.MeshBasicMaterial({ color: 0xffd9a0 }));
      strip.position.set(0, -0.003, D / 2 - 0.06); led.add(strip);
      const gc = document.createElement('canvas'); gc.width = gc.height = 128;
      const gx = gc.getContext('2d'), gr = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,190,110,.95)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
      gx.fillStyle = gr; gx.fillRect(0, 0, 128, 128);
      const gt = new T.CanvasTexture(gc);
      const gm = new T.MeshBasicMaterial({ map: gt, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.4 });
      const wallGlow = new T.Mesh(new T.PlaneGeometry(W * 1.15, 0.5), gm);
      wallGlow.position.set(0, -0.12, -D / 2 + 0.02); led.add(wallGlow);
      const fy = -(cfg.floatY || 0.55) + 0.004;
      const floorGlow = new T.Mesh(new T.PlaneGeometry(W * 1.1, D * 2.2), gm);
      floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.set(0, fy, D * 0.9); led.add(floorGlow);
      const pl = new T.PointLight(0xffb36b, 0.9, 2.2, 2); pl.position.set(0, -0.12, D / 2); led.add(pl);
      body.add(led);
    }

    /* ---- cotas (medidas) ---- */
    const dims = new T.Group(); dims.visible = false; root.add(dims);
    (function buildDims() {
      const m = new T.LineBasicMaterial({ color: 0xa3694a, depthTest: false, transparent: true });
      const line = (a, b) => { const l = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(...a), new T.Vector3(...b)]), m); l.renderOrder = 10; dims.add(l); };
      const tick = (p, ax) => { const d = 0.025, a = p.slice(), b = p.slice(); a[ax] -= d; b[ax] += d; line(a, b); };
      function label(txt, p) {
        const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d');
        x.fillStyle = 'rgba(23,17,12,.88)'; const r = 22; x.beginPath(); x.roundRect ? x.roundRect(8, 16, 240, 64, r) : x.rect(8, 16, 240, 64); x.fill();
        x.fillStyle = '#f6ecdc'; x.font = '700 38px Lato, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 128, 50);
        const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false, transparent: true }));
        sp.scale.set(0.3, 0.112, 1); sp.position.set(...p); sp.renderOrder = 11; dims.add(sp);
      }
      const yb = -0.06, zf = D / 2 + 0.05;
      line([-W / 2, yb, zf], [W / 2, yb, zf]); tick([-W / 2, yb, zf], 1); tick([W / 2, yb, zf], 1);
      label(Math.round(W * 100) + ' cm', [0, yb - 0.05, zf]);
      const xs = W / 2 + 0.07;
      line([xs, 0, -D / 2], [xs, 0, D / 2]); tick([xs, 0, -D / 2], 1); tick([xs, 0, D / 2], 1);
      label(Math.round(D * 100) + ' cm', [xs + 0.02, 0.0, 0]);
      const xl = -W / 2 - 0.07;
      line([xl, 0, zf], [xl, Htot, zf]); tick([xl, 0, zf], 0); tick([xl, Htot, zf], 0);
      label(Math.round(Htot * 100) + ' cm', [xl - 0.02, Htot / 2, zf]);
    })();

    return {
      group: root, width: W, depth: D, height: Htot, meshes, movers, doors: movers.filter(m => m.kind === 'door'),
      hasMovers: movers.length > 0,
      toggle(obj) { const m = movers.find(o => o.obj === obj); if (m) m.target = m.target ? 0 : 1; },
      openAll(open) { movers.forEach(m => (m.target = open ? 1 : 0)); },
      setDims(v) { dims.visible = !!v; },
      update(dt) {
        const k = 1 - Math.exp(-8 * dt);
        movers.forEach(m => {
          m.angle += (m.target - m.angle) * k;
          if (m.kind === 'door') m.obj.rotation.y = (m.left ? -1 : 1) * m.angle * 1.75;
          else m.obj.position.z = m.angle * m.slide;
        });
      },
      dispose() { meshes.forEach(m => m.geometry && m.geometry.dispose()); }
    };
  }

  /* ---------- escenario (renderer, luces, pared, piso, órbita) ---------- */
  function plasterTexture(tone) {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d'), r = rng(5);
    x.fillStyle = tone.base; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 420; i++) {
      const rad = 20 + r() * 90, px = r() * 512, py = r() * 512;
      const g2 = x.createRadialGradient(px, py, 0, px, py, rad);
      g2.addColorStop(0, rgba(r() > 0.5 ? tone.light : tone.dark, 0.035));
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g2; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 2); t.encoding = T.sRGBEncoding;
    return t;
  }

  function createStage(canvas, o) {
    o = o || {};
    const dark = !!o.dark;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(g.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = dark ? 0.82 : 0.82;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;

    const scene = new T.Scene();
    const bg = new T.Color(o.bg || (dark ? '#0d0a07' : '#eadfce'));
    scene.background = bg; scene.fog = new T.Fog(bg, 6, 14);

    /* entorno procedural para reflejos (latón, barniz) */
    try {
      const pm = new T.PMREMGenerator(renderer);
      const ec = document.createElement('canvas'); ec.width = 512; ec.height = 256;
      const ex = ec.getContext('2d'), eg = ex.createLinearGradient(0, 0, 0, 256);
      eg.addColorStop(0, dark ? '#3a2a1c' : '#fff7ea'); eg.addColorStop(0.55, dark ? '#20160e' : '#e6d3b4'); eg.addColorStop(1, dark ? '#0d0a07' : '#8f7656');
      ex.fillStyle = eg; ex.fillRect(0, 0, 512, 256);
      ex.fillStyle = dark ? '#a8794a' : '#ffffff'; ex.fillRect(300, 40, 120, 90); ex.fillRect(60, 60, 70, 60);
      const et = new T.CanvasTexture(ec); et.mapping = T.EquirectangularReflectionMapping; et.encoding = T.sRGBEncoding;
      const es = new T.Scene(); es.background = et;
      scene.environment = pm.fromEquirectangular(et).texture;
      pm.dispose();
    } catch (e) { /* sin entorno */ }

    const camera = new T.PerspectiveCamera(32, 1, 0.1, 40);

    scene.add(new T.HemisphereLight(0xfff1dc, dark ? 0x2a1c12 : 0x8a7358, dark ? 0.3 : 0.45));
    const key = new T.DirectionalLight(0xffecd0, dark ? 1.15 : 1.35);
    key.position.set(2.4, 3.2, 3.4); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 12 });
    key.shadow.bias = -0.0004; key.shadow.radius = 8;
    scene.add(key);
    const rim = new T.DirectionalLight(0xffc690, 0.5); rim.position.set(-3, 2, -1); scene.add(rim);

    const tone = dark
      ? { base: '#3b2f25', light: '#5a4a3b', dark: '#1d1611' }
      : { base: '#d9c8ae', light: '#efe4d0', dark: '#b79f7e' };
    const wall = new T.Mesh(new T.PlaneGeometry(10, 5), new T.MeshStandardMaterial({ map: plasterTexture(tone), roughness: 0.95 }));
    wall.position.set(0, 2.5, 0); wall.receiveShadow = true; scene.add(wall);

    const floorMat = new T.MeshStandardMaterial({ color: dark ? 0x2a211a : 0xb39c7c, roughness: dark ? 0.35 : 0.8, metalness: dark ? 0.15 : 0 });
    const floor = new T.Mesh(new T.PlaneGeometry(14, 10), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); floor.receiveShadow = true; scene.add(floor);

    const mount = new T.Group(); scene.add(mount);

    const cam = {
      theta: o.theta == null ? 0.32 : o.theta, phi: o.phi == null ? 1.38 : o.phi, zoom: 1,
      tTheta: 0, tPhi: 0, tZoom: 1,
      target: new T.Vector3(0, 0.45, 0.2), baseR: 3
    };
    cam.tTheta = cam.theta; cam.tPhi = cam.phi;
    const lim = { th: o.thetaLim || 1.2, pMin: 0.8, pMax: 1.55 };
    let cabinet = null, autoRot = o.autoRotate !== false, t0 = 0, userTouched = false;
    let dragging = false, moved = 0, lx = 0, ly = 0, dimsOn = false, lastCfg = null;

    function frame() {
      if (!cabinet) return;
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, aspect = w / h;
      const fov = camera.fov * Math.PI / 180;
      const needW = cabinet.width * (o.fit || 1.55) + 0.5, needH = cabinet.height * 2.4 + 0.3;
      const rW = needW / (2 * Math.tan(fov / 2) * aspect), rH = needH / (2 * Math.tan(fov / 2));
      cam.baseR = Math.max(rW, rH, 1.8);
      scene.fog.near = cam.baseR * 1.8; scene.fog.far = cam.baseR * 5;
      cam.target.set(0, (cabinet.floating ? (o.floatY == null ? 0.55 : o.floatY) : 0) + cabinet.height * 0.55, 0.15);
    }

    function setCabinet(cfg) {
      lastCfg = cfg;
      if (cabinet) { mount.remove(cabinet.group); cabinet.dispose(); }
      const fy = o.floatY == null ? 0.55 : o.floatY;
      cabinet = buildCabinet(Object.assign({}, cfg, { floatY: fy }));
      cabinet.floating = cfg.base === 'floating';
      cabinet.group.position.set(0, cabinet.floating ? fy : 0, cabinet.depth / 2 + 0.004);
      cabinet.setDims(dimsOn);
      mount.add(cabinet.group);
      frame();
      return cabinet;
    }

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix(); frame();
    }
    g.addEventListener('resize', resize);
    if (g.ResizeObserver) new ResizeObserver(resize).observe(canvas);

    const ray = new T.Raycaster(), ndc = new T.Vector2();
    function pick(ev) {
      if (!cabinet || !cabinet.hasMovers) return null;
      const r = canvas.getBoundingClientRect();
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(cabinet.movers.map(d => d.obj), true)[0];
      if (!hit) return null;
      let o2 = hit.object; while (o2 && !(o2.userData && o2.userData.mover)) o2 = o2.parent;
      return o2;
    }
    if (o.interactive !== false) {
      canvas.style.touchAction = 'pan-y';
      canvas.addEventListener('pointerdown', e => {
        dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; userTouched = true;
        canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
        canvas.classList.add('is-drag');
      });
      canvas.addEventListener('pointermove', e => {
        if (dragging) {
          const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
          cam.tTheta = Math.max(-lim.th, Math.min(lim.th, cam.tTheta - dx * 0.006));
          cam.tPhi = Math.max(lim.pMin, Math.min(lim.pMax, cam.tPhi - dy * 0.004));
        } else if (cabinet && cabinet.hasMovers) {
          canvas.style.cursor = pick(e) ? 'pointer' : 'grab';
        }
      });
      const up = e => {
        if (!dragging) return; dragging = false; canvas.classList.remove('is-drag');
        if (moved < 6) { const p = pick(e); if (p) { cabinet.toggle(p); if (o.onDoor) o.onDoor(); } }
      };
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointercancel', () => { dragging = false; canvas.classList.remove('is-drag'); });
    }

    const clock = new T.Clock();
    let running = true, extra = null;
    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05); t0 += dt;
      if (autoRot && !userTouched && o.interactive !== false) cam.tTheta = Math.sin(t0 * 0.35) * 0.45;
      else if (autoRot && o.interactive === false) cam.tTheta = (o.baseTheta || 0) + Math.sin(t0 * 0.3) * 0.5;
      const k = 1 - Math.exp(-4 * dt);
      cam.theta += (cam.tTheta - cam.theta) * k; cam.phi += (cam.tPhi - cam.phi) * k; cam.zoom += (cam.tZoom - cam.zoom) * k;
      const r = cam.baseR * cam.zoom;
      camera.position.set(
        cam.target.x + r * Math.sin(cam.phi) * Math.sin(cam.theta),
        cam.target.y + r * Math.cos(cam.phi),
        cam.target.z + r * Math.sin(cam.phi) * Math.cos(cam.theta)
      );
      camera.lookAt(cam.target);
      if (cabinet) cabinet.update(dt);
      if (extra) extra(dt, t0);
      renderer.render(scene, camera);
    }
    if (g.IntersectionObserver) {
      new IntersectionObserver(es => {
        const vis = es[0].isIntersecting;
        if (vis && !running) { running = true; clock.getDelta(); loop(); }
        else if (!vis) running = false;
      }, { threshold: 0.01 }).observe(canvas);
    }
    resize(); loop();

    const views = { front: [0, 1.45], side: [1.1, 1.42], top: [0.25, 0.85], persp: [0.32, 1.38] };
    return {
      THREE: T, renderer, scene, camera, cam, mount, wall, floor, key,
      setCabinet, getCabinet: () => cabinet,
      setAutoRotate(v) { autoRot = v; },
      setZoom(z) { cam.tZoom = Math.max(0.5, Math.min(1.5, z)); },
      getZoom: () => cam.tZoom,
      onFrame(fn) { extra = fn; },
      setView(n) { const v = views[n] || views.persp; userTouched = true; cam.tTheta = v[0]; cam.tPhi = v[1]; cam.tZoom = 1; },
      setDims(v) { dimsOn = !!v; if (cabinet) cabinet.setDims(dimsOn); },
      snapshot() { renderer.render(scene, camera); return canvas.toDataURL('image/jpeg', 0.92); },
      resetView() { userTouched = false; cam.tTheta = 0.32; cam.tPhi = 1.38; cam.tZoom = 1; }
    };
  }

  g.AEDStage = { createStage, buildCabinet, WOODS };
})(window);
