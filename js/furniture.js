/* ============================================================
   Motor 3D compartido (landing + configurador)
   Muebles 100 % procedurales: sin modelos externos, sin build.
   Requiere js/vendor/three.min.js (r128).
   ============================================================ */
(function (g) {
  'use strict';
  const T = g.THREE;

  const WOODS = {
    natural: { base: '#d8a566', dark: '#a8723a' },
    miel:    { base: '#c27f40', dark: '#8c5222' },
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

  /* ---------- texturas procedurales ---------- */
  const _wood = {};
  function woodBase(key) {
    if (_wood[key]) return _wood[key];
    const w = WOODS[key], c = document.createElement('canvas');
    c.width = c.height = 512;
    const x = c.getContext('2d'), r = rng(11);
    x.fillStyle = w.base; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 180; i++) {
      const y = r() * 512, amp = 1 + r() * 5, k = 1 + Math.floor(r() * 3), ph = r() * 6.28, dark = r() > 0.25;
      x.strokeStyle = dark ? rgba(w.dark, 0.05 + r() * 0.15) : rgba('#ffffff', 0.04 + r() * 0.07);
      x.lineWidth = 0.6 + r() * 2.4;
      x.beginPath();
      for (let px = 0; px <= 512; px += 16) {
        const yy = y + Math.sin(px / 512 * 6.283 * k + ph) * amp;
        px ? x.lineTo(px, yy) : x.moveTo(px, yy);
      }
      x.stroke();
    }
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    return (_wood[key] = t);
  }

  const _mat = {};
  function woodMat(key, a, b, shade) {
    shade = shade || 1;
    const rx = Math.max(0.3, a / 0.7), ry = Math.max(0.3, b / 0.7);
    const k = key + '|' + rx.toFixed(1) + '|' + ry.toFixed(1) + '|' + shade;
    if (_mat[k]) return _mat[k];
    const t = woodBase(key).clone(); t.repeat.set(rx, ry); t.needsUpdate = true;
    return (_mat[k] = new T.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: 0, color: new T.Color(shade, shade, shade) }));
  }

  let _caneBase;
  function caneMat(w, h) {
    if (!_caneBase) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d');
      x.fillStyle = '#6b4a2b'; x.fillRect(0, 0, 128, 128);
      x.strokeStyle = '#e2bd84'; x.lineWidth = 7; x.lineCap = 'round';
      for (let i = 0; i < 128; i += 32) {
        x.beginPath(); x.moveTo(i + 16, 0); x.lineTo(i + 16, 128); x.stroke();
        x.beginPath(); x.moveTo(0, i + 16); x.lineTo(128, i + 16); x.stroke();
      }
      x.strokeStyle = '#c99d62'; x.lineWidth = 5;
      for (let i = -128; i < 256; i += 64) {
        x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke();
        x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke();
      }
      _caneBase = new T.CanvasTexture(c);
      _caneBase.wrapS = _caneBase.wrapT = T.RepeatWrapping; _caneBase.encoding = T.sRGBEncoding; _caneBase.anisotropy = 4;
    }
    const k = 'cane|' + Math.round(w * 100) + '|' + Math.round(h * 100);
    if (_mat[k]) return _mat[k];
    const t = _caneBase.clone(); t.repeat.set(w / 0.05, h / 0.05); t.needsUpdate = true;
    return (_mat[k] = new T.MeshStandardMaterial({ map: t, roughness: 0.85, metalness: 0 }));
  }

  const brass = new T.MeshStandardMaterial({ color: 0xc9a456, metalness: 0.5, roughness: 0.35 });

  /* ---------- mueble paramétrico ----------
     cfg: { type:'aparador'|'flotante'|'tv', width:cm, wood, front:'cane'|'slats'|'plain',
            base:'legs'|'floating'|'floor', handle:'brass'|'wood', drawers:boolean }  */
  const BODY = {
    aparador: { h: 0.70, d: 0.45 },
    flotante: { h: 0.42, d: 0.38 },
    tv:       { h: 0.50, d: 0.42 }
  };

  function buildCabinet(cfg) {
    const spec = BODY[cfg.type] || BODY.aparador;
    const W = cfg.width / 100, D = spec.d, t = 0.025, wk = cfg.wood;
    const legH = cfg.base === 'legs' ? 0.16 : cfg.base === 'floor' ? 0.05 : 0;
    const bodyH = spec.h;
    const root = new T.Group();
    const body = new T.Group(); body.position.y = legH; root.add(body);
    const doors = [];
    const meshes = [];

    function box(parent, w, h, d, mat, x, y, z, shadow) {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z); m.castShadow = shadow !== false; m.receiveShadow = true;
      parent.add(m); meshes.push(m); return m;
    }
    const inner = woodMat(wk, W, D, 0.7);

    /* carcasa */
    box(body, W + 0.02, t, D + 0.012, woodMat(wk, W, D), 0, bodyH - t / 2, 0.002);            // tapa
    box(body, W, t, D, inner, 0, t / 2, 0);                                                  // base
    box(body, t, bodyH, D, woodMat(wk, D, bodyH), -(W / 2 - t / 2), bodyH / 2, 0);           // lateral izq
    box(body, t, bodyH, D, woodMat(wk, D, bodyH), (W / 2 - t / 2), bodyH / 2, 0);            // lateral der
    box(body, W - 2 * t, bodyH - 2 * t, 0.01, inner, 0, bodyH / 2, -D / 2 + 0.005);          // fondo
    if (cfg.type !== 'tv') box(body, W - 2 * t, 0.015, D - 0.03, inner, 0, bodyH * 0.45, -0.01); // repisa

    /* patas / zócalo */
    if (cfg.base === 'legs') {
      const lm = woodMat(wk, 0.1, 0.3, 0.92);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        const leg = new T.Mesh(new T.CylinderGeometry(0.03, 0.017, legH, 4), lm);
        leg.rotation.y = Math.PI / 4;
        leg.position.set(sx * (W / 2 - 0.07), legH / 2, sz * (D / 2 - 0.07));
        leg.castShadow = true; root.add(leg); meshes.push(leg);
      });
    } else if (cfg.base === 'floor') {
      box(root, W - 0.06, legH, D - 0.06, inner, 0, legH / 2, 0);
    }

    const Wi = W - 2 * t, z0 = D / 2;
    const handleMat = cfg.handle === 'wood' ? woodMat(wk, 0.1, 0.1, 0.85) : brass;

    /* zonas */
    let doorsTop = bodyH - t, doorsBot = t, drawTop = 0, drawBot = 0, nDrawers = 0, drawerStyle = 'handle';
    if (cfg.type === 'aparador' && cfg.drawers) {
      const dh = 0.15; drawTop = bodyH - t; drawBot = drawTop - dh; doorsTop = drawBot - 0.004; nDrawers = W > 1.5 ? 4 : 3;
    } else if (cfg.type === 'tv') {
      const oh = 0.17; doorsTop = bodyH - t - oh - 0.004; // nicho abierto arriba
      drawTop = doorsTop; drawBot = doorsBot; nDrawers = 3; drawerStyle = 'flush';
      box(body, Wi, 0.012, D - 0.04, inner, 0, doorsTop + 0.002, -0.01);
    }

    /* cajones */
    if (nDrawers) {
      const gap = 0.004, dw = Wi / nDrawers - gap, dh = drawTop - drawBot - (cfg.type === 'tv' ? 0 : 0.002);
      for (let i = 0; i < nDrawers; i++) {
        const x = -Wi / 2 + (i + 0.5) * (Wi / nDrawers);
        const y = (drawTop + drawBot) / 2;
        box(body, dw, dh, 0.022, woodMat(wk, dw, dh), x, y, z0 - 0.002);
        if (drawerStyle === 'handle') {
          const hb = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, Math.min(0.16, dw * 0.55), 10), handleMat);
          hb.rotation.z = Math.PI / 2; hb.position.set(x, y + dh * 0.25, z0 + 0.022); hb.castShadow = true; body.add(hb);
        }
      }
    }

    /* puertas */
    const nDoors = W <= 1.3 ? 2 : 4;
    const dW = Wi / nDoors, dH = doorsTop - doorsBot - 0.004, dY = (doorsTop + doorsBot) / 2;
    const FR = 0.055, TH = 0.022;
    if (cfg.type !== 'tv') {
      for (let i = 0; i < nDoors; i++) {
        const left = i % 2 === 0;
        const dw = dW - 0.004;
        const xl = -Wi / 2 + i * dW + 0.002;
        const hingeX = left ? xl : xl + dw;
        const pivot = new T.Group(); pivot.position.set(hingeX, dY, z0 - 0.002 + TH / 2);
        const door = new T.Group(); door.position.x = left ? dw / 2 : -dw / 2;
        pivot.add(door);

        if (cfg.front === 'cane') {
          const sm = woodMat(wk, FR, dH);
          box(door, FR, dH, TH, sm, -dw / 2 + FR / 2, 0, 0);
          box(door, FR, dH, TH, sm, dw / 2 - FR / 2, 0, 0);
          box(door, dw - 2 * FR, FR, TH, woodMat(wk, dw, FR), 0, dH / 2 - FR / 2, 0);
          box(door, dw - 2 * FR, FR, TH, woodMat(wk, dw, FR), 0, -dH / 2 + FR / 2, 0);
          const pw = dw - 2 * FR + 0.01, ph = dH - 2 * FR + 0.01;
          const pane = new T.Mesh(new T.PlaneGeometry(pw, ph), caneMat(pw, ph));
          pane.position.z = -0.002; pane.receiveShadow = true; door.add(pane); meshes.push(pane);
        } else if (cfg.front === 'slats') {
          box(door, dw, dH, 0.008, woodMat(wk, dw, dH, 0.62), 0, 0, -TH / 2 + 0.004);
          const pitch = 0.027, n = Math.floor(dw / pitch), sm = woodMat(wk, 0.05, dH);
          const x0 = -((n - 1) * pitch) / 2;
          for (let s = 0; s < n; s++) box(door, 0.019, dH, 0.016, sm, x0 + s * pitch, 0, 0.003, false);
        } else {
          box(door, dw, dH, TH, woodMat(wk, dw, dH), 0, 0, 0);
        }

        /* tirador en el borde de encuentro */
        const edge = (left ? 1 : -1) * (dw / 2 - 0.04);
        if (cfg.type === 'aparador') {
          const bar = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, Math.min(0.2, dH * 0.4), 10), handleMat);
          bar.position.set(edge, dH * 0.0, TH / 2 + 0.018); bar.castShadow = true; door.add(bar);
          [-1, 1].forEach(s => { const st = new T.Mesh(new T.CylinderGeometry(0.003, 0.003, 0.02, 8), handleMat); st.rotation.x = Math.PI / 2; st.position.set(edge, s * Math.min(0.2, dH * 0.4) * 0.38, TH / 2 + 0.009); door.add(st); });
        } else {
          const kn = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.018, 20), handleMat);
          kn.rotation.x = Math.PI / 2; kn.position.set(edge, dH * 0.28, TH / 2 + 0.009); kn.castShadow = true; door.add(kn);
        }
        pivot.userData.door = { index: i, left };
        body.add(pivot);
        doors.push({ pivot, left, angle: 0, target: 0 });
      }
    } else {
      // tv: cajones al frente (ya construidos arriba) + separadores finos
    }

    const total = legH + bodyH;
    return {
      group: root, width: W, depth: D, height: total, meshes, doors,
      toggleDoor(pivot) {
        const d = doors.find(o => o.pivot === pivot); if (!d) return;
        d.target = d.target ? 0 : 1.75;
      },
      openAll(open) { doors.forEach(d => (d.target = open ? 1.75 : 0)); },
      update(dt) {
        const k = 1 - Math.exp(-8 * dt);
        doors.forEach(d => {
          d.angle += (d.target - d.angle) * k;
          d.pivot.rotation.y = d.left ? -d.angle : d.angle;
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
      const rad = 20 + r() * 90;
      const gr = x.createRadialGradient(r() * 512, r() * 512, 0, 0, 0, rad);
      const px = r() * 512, py = r() * 512;
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
    renderer.toneMappingExposure = dark ? 0.82 : 0.95;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;

    const scene = new T.Scene();
    const bg = new T.Color(o.bg || (dark ? '#0d0a07' : '#eadfce'));
    scene.background = bg; scene.fog = new T.Fog(bg, 6, 14);

    const camera = new T.PerspectiveCamera(32, 1, 0.1, 40);

    scene.add(new T.HemisphereLight(0xfff1dc, dark ? 0x2a1c12 : 0x8a7358, dark ? 0.35 : 0.6));
    const key = new T.DirectionalLight(0xffecd0, dark ? 1.15 : 1.5);
    key.position.set(2.4, 3.2, 3.4); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 12 });
    key.shadow.bias = -0.0004; key.shadow.radius = 8;
    scene.add(key);
    const rim = new T.DirectionalLight(0xffc690, 0.6); rim.position.set(-3, 2, -1); scene.add(rim);

    const tone = dark
      ? { base: '#3b2f25', light: '#5a4a3b', dark: '#1d1611' }
      : { base: '#d9c8ae', light: '#efe4d0', dark: '#b79f7e' };
    const wall = new T.Mesh(new T.PlaneGeometry(10, 5), new T.MeshStandardMaterial({ map: plasterTexture(tone), roughness: 0.95 }));
    wall.position.set(0, 2.5, 0); wall.receiveShadow = true; scene.add(wall);

    const floorMat = new T.MeshStandardMaterial({ color: dark ? 0x2a211a : 0xb39c7c, roughness: dark ? 0.35 : 0.8, metalness: dark ? 0.15 : 0 });
    const floor = new T.Mesh(new T.PlaneGeometry(14, 10), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); floor.receiveShadow = true; scene.add(floor);

    const mount = new T.Group(); scene.add(mount);

    /* órbita propia (arrastrar) */
    const cam = {
      theta: o.theta == null ? 0.32 : o.theta, phi: o.phi == null ? 1.38 : o.phi, zoom: 1,
      tTheta: 0, tPhi: 0, tZoom: 1,
      target: new T.Vector3(0, 0.45, 0.2), baseR: 3
    };
    cam.tTheta = cam.theta; cam.tPhi = cam.phi;
    const lim = { th: o.thetaLim || 0.85, pMin: 1.2, pMax: 1.55 };
    let cabinet = null, autoRot = o.autoRotate !== false, t0 = 0, userTouched = false;
    let downX = 0, downY = 0, dragging = false, moved = 0, lx = 0, ly = 0;

    function frame() {
      if (!cabinet) return;
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, aspect = w / h;
      const fov = camera.fov * Math.PI / 180;
      const needW = cabinet.width * (o.fit || 1.55), needH = cabinet.height * 2.4 + 0.3;
      const rW = needW / (2 * Math.tan(fov / 2) * aspect), rH = needH / (2 * Math.tan(fov / 2));
      cam.baseR = Math.max(rW, rH, 1.8);
      cam.target.set(0, (o.floatY != null && cabinet.floating ? o.floatY : 0) + cabinet.height * 0.55, 0.15);
    }

    function setCabinet(cfg) {
      if (cabinet) { mount.remove(cabinet.group); cabinet.dispose(); }
      cabinet = buildCabinet(cfg);
      cabinet.floating = cfg.base === 'floating';
      cabinet.group.position.set(0, cabinet.floating ? (o.floatY == null ? 0.55 : o.floatY) : 0, cabinet.depth / 2 + 0.004);
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
      if (!cabinet || !cabinet.doors.length) return null;
      const r = canvas.getBoundingClientRect();
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(cabinet.doors.map(d => d.pivot), true)[0];
      if (!hit) return null;
      let o2 = hit.object; while (o2 && !(o2.userData && o2.userData.door)) o2 = o2.parent;
      return o2;
    }
    if (o.interactive !== false) {
      canvas.style.touchAction = 'pan-y';
      canvas.addEventListener('pointerdown', e => {
        dragging = true; moved = 0; downX = lx = e.clientX; downY = ly = e.clientY; userTouched = true;
        canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
        canvas.classList.add('is-drag');
      });
      canvas.addEventListener('pointermove', e => {
        if (dragging) {
          const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
          cam.tTheta = Math.max(-lim.th, Math.min(lim.th, cam.tTheta - dx * 0.006));
          cam.tPhi = Math.max(lim.pMin, Math.min(lim.pMax, cam.tPhi - dy * 0.004));
        } else if (cabinet && cabinet.doors.length) {
          canvas.style.cursor = pick(e) ? 'pointer' : 'grab';
        }
      });
      const up = e => {
        if (!dragging) return; dragging = false; canvas.classList.remove('is-drag');
        if (moved < 6) { const p = pick(e); if (p) { cabinet.toggleDoor(p); if (o.onDoor) o.onDoor(); } }
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
    // pausa fuera de pantalla
    if (g.IntersectionObserver) {
      new IntersectionObserver(es => {
        const vis = es[0].isIntersecting;
        if (vis && !running) { running = true; clock.getDelta(); loop(); }
        else if (!vis) running = false;
      }, { threshold: 0.01 }).observe(canvas);
    }
    resize(); loop();

    return {
      THREE: T, renderer, scene, camera, cam, mount, wall, floor, key,
      setCabinet, getCabinet: () => cabinet,
      setAutoRotate(v) { autoRot = v; },
      setZoom(z) { cam.tZoom = Math.max(0.55, Math.min(1.5, z)); },
      getZoom: () => cam.tZoom,
      onFrame(fn) { extra = fn; },
      resetView() { userTouched = false; cam.tTheta = 0.32; cam.tPhi = 1.38; cam.tZoom = 1; }
    };
  }

  g.AEDStage = { createStage, buildCabinet, WOODS };
})(window);
