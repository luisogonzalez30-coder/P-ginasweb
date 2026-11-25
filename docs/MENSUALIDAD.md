# Mensualidad de la página web (aviso + bloqueo automático)

**Calendario (hora de Chile)** — ciclo mensual:

| Día | Estado |
|---|---|
| 10 | Se abre el ciclo. Un pago aprobado desde este día lo da por pagado. |
| 15 al 20 | Aviso diario (solo al dueño) con botón "Pagar mensualidad". |
| 21 al 23 | Gracia de 3 días: el aviso advierte que la tienda se bloqueará. |
| 24 en adelante | Si no hay pago: pantalla "Sitio temporalmente no disponible" para todo el público. |
| Al pagar | Se reactiva y el aviso desaparece solo (consulta a Mercado Pago, caché de ~2–5 min). |

El primer ciclo de cobro empieza el **10-dic-2026** (`BILLING_START`): aviso el 15-dic, bloqueo el 24-dic.
Si `/api/estado` falla o no está configurada, el sitio **nunca se bloquea** (queda en "ok").

## Variables de entorno (Vercel → Project → Settings → Environment Variables)
| Variable | Qué es |
|---|---|
| `OWNER_TOKEN` | Clave del link privado del dueño (ya configurada). |
| `MP_ACCESS_TOKEN` | Access Token de **producción** de TU cuenta de Mercado Pago (secreto). |
| `MP_MATCH` | Texto que identifica los pagos de ESTE cliente: el **título/descripción del link o plan** (ej. `Mensualidad Arredondo`). Sin esto, la función queda inactiva. |
| `MP_AMOUNT` | (opcional) Monto exacto de la mensualidad en CLP, para afinar. |
| `BILLING_START` | (opcional) Inicio del primer ciclo, `AAAA-MM-DD`. Por defecto `2026-12-10`. |

Tras cambiar variables hay que **volver a desplegar**.

## Link privado del dueño
`https://<tu-sitio>/tienda.html?dueno=<OWNER_TOKEN>` — se abre una vez desde su celular/computador; queda guardado en ese navegador y la clave se borra de la barra de direcciones. Para probar los textos: agregar `&simular=aviso|gracia|suspendido`.

## Dónde se cambia el link de pago
`js/config.js` → `mensualidad.payUrl`.

## Para otro cliente
Duplicar el proyecto, cambiar `payUrl`, `MP_MATCH`, `MP_AMOUNT`, `OWNER_TOKEN` y `BILLING_START`.
