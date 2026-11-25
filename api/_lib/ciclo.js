/* Lógica del ciclo de la mensualidad (hora de Chile).
   Ciclo: abre el día 10; vence el 20; aviso desde el 15; gracia hasta el 23 (3 días); desde el 24 se suspende.
   Un pago aprobado desde el día 10 del ciclo lo da por pagado. Al llegar el 10 siguiente, se abre un nuevo ciclo. */
const TZ = 'America/Santiago';
const CFG = { abre: 10, aviso: 15, vence: 20, graciaDias: 3 };

// Hora "de pared" de Chile expresada como ms UTC (para comparar sin problemas de zona horaria)
function pared(d) {
  const p = {};
  new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
    .formatToParts(new Date(d)).forEach(x => { p[x.type] = x.value; });
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
}

function limites(ahoraPared) {
  const a = new Date(ahoraPared), y = a.getUTCFullYear(), m = a.getUTCMonth();
  const [y0, m0] = a.getUTCDate() >= CFG.abre ? [y, m] : (m === 0 ? [y - 1, 11] : [y, m - 1]);
  return {
    inicio: Date.UTC(y0, m0, CFG.abre),
    aviso: Date.UTC(y0, m0, CFG.aviso),
    vence: Date.UTC(y0, m0, CFG.vence, 23, 59, 59),
    bloqueo: Date.UTC(y0, m0, CFG.vence + CFG.graciaDias, 23, 59, 59)
  };
}

/* ahora: Date | ms · pagos: lista de fechas (ISO) de pagos aprobados de la mensualidad */
function calcular(ahora, pagos, primerCiclo) {
  const n = pared(ahora), L = limites(n);
  // antes del primer ciclo de cobro (ISO, p. ej. '2026-12-10') nunca se avisa ni se bloquea
  if (primerCiclo && L.inicio < Date.parse(primerCiclo + 'T00:00:00Z')) return { estado: 'ok', vence: null, dias: 0, diasBloqueo: 0, pagado: true };
  const pagado = (pagos || []).some(f => { const t = pared(f); return t >= L.inicio && t <= n; });
  const dias = Math.max(0, Math.ceil((L.vence - n) / 86400000));
  const diasBloqueo = Math.max(0, Math.ceil((L.bloqueo - n) / 86400000));
  const vence = new Date(L.vence).toISOString().slice(0, 10);
  let estado = 'ok';
  if (!pagado) {
    if (n > L.bloqueo) estado = 'suspendido';
    else if (n > L.vence) estado = 'gracia';
    else if (n >= L.aviso) estado = 'aviso';
  }
  return { estado, vence, dias, diasBloqueo, pagado };
}

module.exports = { calcular, pared, limites, CFG };
