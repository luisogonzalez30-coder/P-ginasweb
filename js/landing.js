(function () {
  'use strict';
  const A = window.AED, canvas = document.getElementById('stage');
  const enter = document.getElementById('enter');
  const curtain = document.getElementById('curtain');
  const nav = document.getElementById('models');

  function go(e) {
    if (e) e.preventDefault();
    if (go.done) return; go.done = true;
    curtain.classList.add('on');
    if (stage) { stage.setAutoRotate(false); stage.cam.tTheta = 0; stage.cam.tPhi = 1.45; stage.cam.tZoom = 0.42; }
    setTimeout(() => (location.href = 'tienda.html'), 950);
  }
  enter.addEventListener('click', go);
  document.addEventListener('keydown', e => { if (e.key === 'Enter') go(e); });

  let stage = null;
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) throw new Error('nowebgl');
    stage = window.AEDStage.createStage(canvas, { dark: true, fit: 2.6, floatY: 0.62, autoRotate: true, theta: 0.3, phi: 1.36, thetaLim: 0.9 });
  } catch (err) {
    document.body.classList.add('no-webgl');
  }
  if (!stage) return;
  const place = () => { stage.mount.position.x = innerWidth > 760 ? 0.95 : 0; };
  place(); addEventListener('resize', place);

  /* --- polvo de luz --- */
  const T = THREE, N = 160;
  const pos = new Float32Array(N * 3), spd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 6; pos[i * 3 + 1] = Math.random() * 3.2; pos[i * 3 + 2] = Math.random() * 3 - 0.2; spd[i] = 0.02 + Math.random() * 0.06;
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
  const sprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,214,170,1)'); gr.addColorStop(1, 'rgba(255,214,170,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c);
  })();
  const dust = new T.Points(g, new T.PointsMaterial({ map: sprite, size: 0.05, transparent: true, depthWrite: false, opacity: 0.55, blending: T.AdditiveBlending }));
  stage.scene.add(dust);

  /* --- resplandor cálido bajo el mueble --- */
  const glow = new T.PointLight(0xffa860, 1.6, 3.2, 2); glow.position.set(0, 0.35, 0.5); stage.scene.add(glow);

  /* --- modelos --- */
  const SETS = A.products.map(p => Object.assign({ type: p.type, width: p.defaults.width }, p.defaults, p.id === 'rack-tv' ? { base: 'floating' } : {}));
  let idx = 0, userPicked = false;
  const btns = A.products.map((p, i) => {
    const b = document.createElement('button');
    b.innerHTML = '<i>0' + (i + 1) + '</i>' + p.name;
    b.addEventListener('click', () => { userPicked = true; show(i); });
    nav.appendChild(b); return b;
  });
  function show(i) {
    idx = i; btns.forEach((b, k) => b.classList.toggle('on', k === i));
    const cab = stage.setCabinet(SETS[i]);
    glow.position.y = cab.floating ? 0.28 : 0.2;
    cab.group.scale.setScalar(0.001); intro = 0;
  }
  let intro = 1;
  stage.onFrame((dt, t) => {
    const cab = stage.getCabinet();
    if (cab && intro < 1) { intro = Math.min(1, intro + dt * 1.6); const e = 1 - Math.pow(1 - intro, 3); cab.group.scale.setScalar(0.001 + e * 0.999); }
    if (cab && cab.floating) cab.group.position.y = 0.62 + Math.sin(t * 0.9) * 0.012;
    const p = g.attributes.position;
    for (let i = 0; i < N; i++) {
      let y = p.getY(i) + spd[i] * dt; if (y > 3.4) y = 0;
      p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(t * 0.3 + i) * 0.0008);
    }
    p.needsUpdate = true;
    glow.intensity = 1.5 + Math.sin(t * 1.3) * 0.15;
  });
  show(1);
  setInterval(() => { if (!userPicked && !go.done) show((idx + 1) % SETS.length); }, 6500);
})();
