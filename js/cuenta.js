/* Aviso de mensualidad.
   - Aviso/gracia: banner SOLO para el dueño (se activa una vez con su link privado ?dueno=CLAVE).
   - Suspendido: pantalla para todos ("sitio no disponible"); el dueño ve además el botón de pago.
   Si la API no responde, no se muestra nada (nunca bloquea por error). */
(function () {
  'use strict';
  var PAY = (window.AED && window.AED.mensualidad && window.AED.mensualidad.payUrl) || '';
  var KEY = 'aed_dueno', DISM = 'aed_aviso_cerrado';
  var qs = new URLSearchParams(location.search), tok = qs.get('dueno') || '';
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  var url = '/api/estado' + (tok ? '?token=' + encodeURIComponent(tok) + (qs.get('simular') ? '&simular=' + encodeURIComponent(qs.get('simular')) : '') : '');
  fetch(url, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d) return;
    if (tok && d.dueno) { ls(KEY, '1'); try { qs.delete('dueno'); qs.delete('simular'); var q = qs.toString(); history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash); } catch (e) {} }
    var dueno = ls(KEY) === '1';
    if (d.estado === 'suspendido') return suspender(dueno);
    if ((d.estado === 'aviso' || d.estado === 'gracia') && dueno) banner(d);
  }).catch(function () {});

  function fecha(iso) { var p = (iso || '').split('-'); if (p.length < 3) return ''; return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' }); }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  function banner(d) {
    var hoy = new Date().toISOString().slice(0, 10);
    if (ls(DISM) === hoy) return; // se puede cerrar: vuelve a aparecer mañana
    var gracia = d.estado === 'gracia';
    var txt = gracia
      ? '<b>Mensualidad vencida.</b> Si no se registra el pago, tu tienda se bloqueará automáticamente' + (d.diasBloqueo ? ' en ' + d.diasBloqueo + (d.diasBloqueo === 1 ? ' día' : ' días') : ' hoy') + '.'
      : '<b>Tu mensualidad de la página vence el ' + fecha(d.vence) + '</b>' + (d.dias ? ' (en ' + d.dias + (d.dias === 1 ? ' día' : ' días') + ')' : ' (hoy)') + '. Págala para que tu tienda siga funcionando.';
    var b = el('<div class="cuenta-bar' + (gracia ? ' is-warn' : '') + '" role="alert"><p>' + txt + '</p><a class="cuenta-btn" href="' + PAY + '" target="_blank" rel="noopener">Pagar mensualidad</a><button class="cuenta-x" aria-label="Cerrar">×</button></div>');
    b.querySelector('.cuenta-x').addEventListener('click', function () { ls(DISM, hoy); b.remove(); document.documentElement.classList.remove('has-cuenta'); });
    document.body.insertBefore(b, document.body.firstChild);
    document.documentElement.classList.add('has-cuenta');
  }

  function suspender(dueno) {
    var o = el('<div class="cuenta-lock" role="alertdialog" aria-modal="true"><div class="cuenta-lock__box"><p class="cuenta-lock__k">Sitio temporalmente no disponible</p><h1>Volvemos pronto</h1><p>Esta tienda está en pausa por un trámite administrativo. Vuelve a intentarlo en unas horas.</p>' +
      (dueno ? '<p class="cuenta-lock__own"><b>Mensualidad pendiente.</b> Al registrarse el pago, el sitio se reactiva automáticamente.</p><a class="cuenta-btn" href="' + PAY + '" target="_blank" rel="noopener">Pagar mensualidad</a>' : '') + '</div></div>');
    document.documentElement.classList.add('cuenta-locked');
    document.body.appendChild(o);
  }
})();
