/* GET /api/estado  ->  { estado: 'ok'|'aviso'|'gracia'|'suspendido', vence, dias, diasBloqueo, dueno }
   Consulta a Mercado Pago si la mensualidad del ciclo ya fue pagada. Sin webhooks ni base de datos.
   Variables de entorno (Vercel):
     MP_ACCESS_TOKEN  token de producción de TU cuenta Mercado Pago (secreto)
     MP_MATCH         texto que identifica el pago (título/descripción del link o plan, p. ej. "Mensualidad Arredondo")
     MP_AMOUNT        (opcional) monto exacto de la mensualidad para afinar la coincidencia
     OWNER_TOKEN      clave del link privado del dueño
     BILLING_START    (opcional) inicio del primer ciclo de cobro, por defecto 2026-12-10 (aviso 15-dic, bloqueo 24-dic)
   Si falta algo o MP no responde, devuelve 'ok': el sitio NUNCA se bloquea por un error. */
const { calcular, pared, limites } = require('./_lib/ciclo');

let cache = { t: 0, estado: null };

async function pagosAprobados(ahora) {
  const token = process.env.MP_ACCESS_TOKEN, match = (process.env.MP_MATCH || '').toLowerCase().trim();
  if (!token || !match) return null; // sin configurar -> función inactiva
  const L = limites(pared(ahora));
  const desde = new Date(L.inicio - 3 * 3600e3).toISOString(), hasta = new Date(ahora).toISOString();
  const url = 'https://api.mercadopago.com/v1/payments/search?sort=date_approved&criteria=desc&status=approved&range=date_approved&limit=50' +
    '&begin_date=' + encodeURIComponent(desde) + '&end_date=' + encodeURIComponent(hasta);
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) throw new Error('mp ' + r.status);
  const j = await r.json();
  const monto = process.env.MP_AMOUNT ? Number(process.env.MP_AMOUNT) : null;
  return (j.results || [])
    .filter(p => {
      const txt = [p.description, p.external_reference, p.metadata && JSON.stringify(p.metadata), p.additional_info && JSON.stringify(p.additional_info)].join(' ').toLowerCase();
      return txt.includes(match) && (monto == null || Number(p.transaction_amount) === monto);
    })
    .map(p => p.date_approved);
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
  const dueno = !!(process.env.OWNER_TOKEN && q.token && q.token === process.env.OWNER_TOKEN);
  const ahora = Date.now();
  try {
    // simulación solo para el dueño (para probar los textos): /api/estado?token=...&simular=aviso
    if (dueno && ['aviso', 'gracia', 'suspendido', 'ok'].includes(q.simular)) {
      const base = calcular(ahora, [], null);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).end(JSON.stringify({ ...base, estado: q.simular, dueno }));
    }
    // diagnóstico solo para el dueño: lista los últimos pagos aprobados (sin datos del pagador) para elegir MP_MATCH
    if (dueno && q.debug) {
      res.setHeader('Cache-Control', 'no-store');
      if (!process.env.MP_ACCESS_TOKEN) return res.status(200).end(JSON.stringify({ debug: 'Falta MP_ACCESS_TOKEN' }));
      const d = new Date(ahora - 40 * 86400e3).toISOString(), h = new Date(ahora).toISOString();
      const r = await fetch('https://api.mercadopago.com/v1/payments/search?sort=date_approved&criteria=desc&status=approved&range=date_approved&limit=15&begin_date=' + encodeURIComponent(d) + '&end_date=' + encodeURIComponent(h), { headers: { Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN } });
      const j = await r.json();
      return res.status(200).end(JSON.stringify({ http: r.status, MP_MATCH: process.env.MP_MATCH ? 'definida' : 'no definida', pagos: (j.results || []).map(p => ({ fecha: p.date_approved, monto: p.transaction_amount, descripcion: p.description, referencia: p.external_reference || null })) }));
    }
    if (!cache.estado || ahora - cache.t > 5 * 60e3) {
      const pagos = await pagosAprobados(ahora);
      cache = { t: ahora, estado: pagos === null ? { estado: 'ok', vence: null, dias: 0, diasBloqueo: 0, pagado: true } : calcular(ahora, pagos, process.env.BILLING_START || '2026-12-10') };
    }
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    if (dueno) res.setHeader('Cache-Control', 'no-store');
    return res.status(200).end(JSON.stringify({ ...cache.estado, dueno }));
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).end(JSON.stringify({ estado: 'ok', error: true, dueno }));
  }
};
