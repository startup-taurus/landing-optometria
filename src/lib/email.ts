import { computeAmounts, type StoredTransaction } from "./payphone";
import { PLAN_TOTAL_CENTS, TAX_RATE_PCT } from "./payphone-constants";
import { WHATSAPP_DISPLAY } from "./contact";

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
}

function fmtAmountCents(cents?: number): string {
  if (typeof cents !== "number") return fmtAmountCents(PLAN_TOTAL_CENTS);
  return `$${(cents / 100).toFixed(2)}`;
}

// Filas del desglose base + IVA + total para los recibos (el total guardado en la
// transacción/suscripción INCLUYE el IVA; aquí solo se separa para mostrarlo).
function amountBreakdownRows(totalCents?: number): string {
  const total = typeof totalCents === "number" ? totalCents : PLAN_TOTAL_CENTS;
  const parts = computeAmounts(total);
  return `
      ${row("Plan (base)", fmtAmountCents(parts.amountWithTax))}
      ${row(`IVA (${TAX_RATE_PCT}%)`, `+ ${fmtAmountCents(parts.tax)}`)}
      ${row("Total cobrado", fmtAmountCents(parts.amount))}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendViaResend(args: SendArgs): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Dioptrika <no-reply@dioptrika.com>";
  if (!apiKey) {
    console.log(`[email] saltado (RESEND_API_KEY vacío) → ${args.to} :: ${args.subject}`);
    return { ok: false, reason: "no-api-key" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: args.to, subject: args.subject, html: args.html }),
    });
    if (!res.ok) {
      let detail = "";
      try {
        detail = JSON.stringify(await res.json());
      } catch {}
      console.error(`[email] Resend respondió ${res.status} :: ${detail.slice(0, 200)}`);
      return { ok: false, reason: `resend-${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] error enviando vía Resend:", (err as Error).message);
    return { ok: false, reason: "network" };
  }
}

const BRAND_COLOR = "#14B875";
const BG = "#0D252C";

function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:${BG};font-family:Inter,Arial,sans-serif;color:#F8FBFA">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#0B1D22;border:1px solid #1D4650;border-radius:16px;overflow:hidden">
          <tr><td style="padding:28px 32px;border-bottom:1px solid #1D4650">
            <div style="font-size:20px;font-weight:700;color:${BRAND_COLOR};letter-spacing:-0.01em">Dioptrika</div>
          </td></tr>
          <tr><td style="padding:28px 32px">
            <h1 style="margin:0 0 16px;font-size:22px;color:#FFFFFF;font-weight:700">${title}</h1>
            <div style="font-size:15px;line-height:1.6;color:#B7D1D2">${body}</div>
          </td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #1D4650;font-size:12px;color:#7d9999">
            Dioptrika · software clínico para ópticas · Ecuador
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#7d9999;font-size:13px;width:42%">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#FFFFFF;font-size:14px;font-weight:600">${escapeHtml(value)}</td>
  </tr>`;
}

export async function sendCustomerReceipt(
  tx: StoredTransaction,
  cancelUrl?: string,
  access?: { setPasswordUrl?: string; loginUrl?: string }
): Promise<void> {
  // Bloque de gestión/cancelación self-service. Solo cuando hay suscripción
  // (cobro recurrente): el cliente DEBE guardar este enlace para cancelar cuando
  // quiera, sin depender de soporte.
  const cancelBlock = cancelUrl
    ? `
    <div style="margin:18px 0;padding:14px 16px;border:1px solid ${BRAND_COLOR}40;border-radius:12px;background:${BRAND_COLOR}14">
      <p style="margin:0 0 8px;color:#FFFFFF;font-size:14px;font-weight:600">Tu plan se renueva automáticamente cada mes.</p>
      <p style="margin:0 0 10px;color:#B7D1D2;font-size:13px">Puedes cancelarlo cuando quieras desde tu enlace personal. <strong>Guárdalo</strong>, es solo tuyo:</p>
      <p style="margin:0"><a href="${cancelUrl}" style="color:${BRAND_COLOR};font-size:14px;font-weight:700;word-break:break-all">Gestionar o cancelar mi suscripción</a></p>
    </div>`
    : "";
  // Bloque de acceso al sistema. Optometría crea la cuenta al pagar y devuelve estos
  // enlaces: `setPasswordUrl` (cliente nuevo, crea su contraseña) o solo `loginUrl`
  // (re-compra: ya tenía cuenta). Si no llegan (integración apagada/falló), se usa el
  // texto de respaldo de "en 24h te enviamos credenciales".
  const setUrl = access?.setPasswordUrl;
  const loginUrl = access?.loginUrl;
  const introLine =
    setUrl || loginUrl
      ? `<p>¡Hola ${escapeHtml(tx.lead.name)}! Recibimos tu pago y <strong>tu cuenta ya está creada</strong>.</p>`
      : `<p>¡Hola ${escapeHtml(tx.lead.name)}! Recibimos tu pago correctamente.</p>
    <p>En las próximas <strong>24 horas hábiles</strong> te enviaremos tus credenciales de acceso y un correo del equipo de soporte con los pasos para empezar a usar Dioptrika.</p>`;
  const accessBlock = setUrl
    ? `
    <div style="margin:18px 0;padding:16px;border:1px solid ${BRAND_COLOR}40;border-radius:12px;background:${BRAND_COLOR}14">
      <p style="margin:0 0 10px;color:#FFFFFF;font-size:15px;font-weight:700">Activa tu cuenta</p>
      <p style="margin:0 0 12px;color:#B7D1D2;font-size:13px">Crea tu contraseña para empezar a usar Dioptrika (el enlace vence en 72 horas):</p>
      <p style="margin:0 0 14px"><a href="${setUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#04231A;font-size:14px;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:10px">Crear mi contraseña</a></p>
      ${loginUrl ? `<p style="margin:0;color:#B7D1D2;font-size:13px">Luego ingresa en: <a href="${loginUrl}" style="color:${BRAND_COLOR};font-weight:700;word-break:break-all">${loginUrl}</a></p>` : ""}
    </div>`
    : loginUrl
      ? `
    <div style="margin:18px 0;padding:16px;border:1px solid ${BRAND_COLOR}40;border-radius:12px;background:${BRAND_COLOR}14">
      <p style="margin:0 0 8px;color:#FFFFFF;font-size:15px;font-weight:700">Tu cuenta sigue activa</p>
      <p style="margin:0;color:#B7D1D2;font-size:13px">Ingresa con tu cuenta de siempre en: <a href="${loginUrl}" style="color:${BRAND_COLOR};font-weight:700;word-break:break-all">${loginUrl}</a></p>
    </div>`
      : "";
  const body = `
    ${introLine}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Plan", "Dioptrika — Plan Único mensual")}
      ${amountBreakdownRows(tx.amount)}
      ${row("Referencia", tx.clientTransactionId)}
      ${tx.authorizationCode ? row("Autorización", tx.authorizationCode) : ""}
      ${tx.cardBrand && tx.lastDigits ? row("Tarjeta", `${tx.cardBrand} ···· ${tx.lastDigits}`) : ""}
    </table>
    ${accessBlock}
    ${cancelBlock}
    <p style="color:#7d9999;font-size:13px">Guarda este correo como comprobante. Si tienes dudas, escríbenos por WhatsApp al <strong>+593 99 592 3599</strong>.</p>
  `;
  await sendViaResend({
    to: tx.lead.email,
    subject: "Pago recibido — Dioptrika",
    html: shell("¡Gracias por tu pago!", body),
  });
}

// NOTIFY_EMAIL admite varios correos separados por coma (ej: "a@x.com,b@y.com").
function notifyRecipients(): string[] {
  return (process.env.NOTIFY_EMAIL || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function sendInternalNotification(tx: StoredTransaction): Promise<void> {
  const recipients = notifyRecipients();
  if (recipients.length === 0) {
    console.log("[email] NOTIFY_EMAIL vacío, no se envía aviso interno");
    return;
  }
  const body = `
    <p>Nuevo pago aprobado en la landing. Genera y envía las credenciales al cliente.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Nombre", tx.lead.name)}
      ${row("Email", tx.lead.email)}
      ${row("Teléfono", tx.lead.phone)}
      ${row("Referencia", tx.clientTransactionId)}
      ${tx.payphoneTransactionId ? row("ID Payphone", String(tx.payphoneTransactionId)) : ""}
      ${tx.authorizationCode ? row("Autorización", tx.authorizationCode) : ""}
      ${tx.cardBrand && tx.lastDigits ? row("Tarjeta", `${tx.cardBrand} ···· ${tx.lastDigits}`) : ""}
      ${row("Confirmado", tx.confirmedAt || new Date().toISOString())}
    </table>
  `;
  await sendViaResend({
    to: recipients,
    subject: `Nueva venta Dioptrika ${fmtAmountCents(tx.amount)} — ${tx.lead.name}`,
    html: shell("Nueva venta confirmada", body),
  });
}

// Aviso cuando Payphone APRUEBA pero el monto cobrado != plan ($30). No hay
// reconciliación automática, así que un humano debe revisar y reembolsar.
export async function sendAmountMismatchAlert(
  tx: StoredTransaction,
  chargedCents?: number
): Promise<void> {
  const recipients = notifyRecipients();
  if (recipients.length === 0) {
    console.log("[email] NOTIFY_EMAIL vacío, no se envía alerta de monto");
    return;
  }
  const body = `
    <p style="color:#ffb4b4;font-weight:600">⚠️ Pago APROBADO por Payphone con un monto que NO coincide con el plan.</p>
    <p>Revisar en el panel de Payphone y <strong>reembolsar manualmente</strong> si corresponde. NO se entregaron credenciales.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Esperado", fmtAmountCents(tx.amount))}
      ${row("Cobrado", fmtAmountCents(chargedCents))}
      ${row("Nombre", tx.lead.name)}
      ${row("Email", tx.lead.email)}
      ${row("Teléfono", tx.lead.phone)}
      ${row("Referencia", tx.clientTransactionId)}
      ${tx.payphoneTransactionId ? row("ID Payphone", String(tx.payphoneTransactionId)) : ""}
      ${tx.authorizationCode ? row("Autorización", tx.authorizationCode) : ""}
    </table>
  `;
  await sendViaResend({
    to: recipients,
    subject: `⚠️ Monto NO coincide — revisar/reembolsar — ${tx.lead.name}`,
    html: shell("Monto de pago no coincide", body),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COBRO RECURRENTE (tokenización) — recibos de renovación, dunning y conciliación.
// ─────────────────────────────────────────────────────────────────────────────

// Recibo de RENOVACIÓN automática (cobro recurrente aprobado).
export async function sendRenewalReceipt(input: {
  name: string;
  email: string;
  planLabel: string;
  amountCents: number;
  reference: string;
  authorizationCode?: string | null;
  cardBrand?: string | null;
  lastDigits?: string | null;
  nextChargeAt?: string | null;
}): Promise<void> {
  const body = `
    <p>¡Hola ${escapeHtml(input.name)}! Renovamos tu plan automáticamente.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Plan", input.planLabel)}
      ${amountBreakdownRows(input.amountCents)}
      ${row("Referencia", input.reference)}
      ${input.authorizationCode ? row("Autorización", input.authorizationCode) : ""}
      ${input.cardBrand && input.lastDigits ? row("Tarjeta", `${input.cardBrand} ···· ${input.lastDigits}`) : ""}
      ${input.nextChargeAt ? row("Próxima renovación", new Date(input.nextChargeAt).toLocaleDateString("es-EC")) : ""}
    </table>
    <p style="color:#7d9999;font-size:13px">Si quieres cancelar la renovación automática, escríbenos por WhatsApp al <strong>${WHATSAPP_DISPLAY}</strong>.</p>
  `;
  await sendViaResend({
    to: input.email,
    subject: "Renovación procesada — Dioptrika",
    html: shell("Renovación de tu plan", body),
  });
}

// Aviso de cobro FALLIDO (dunning): la tarjeta fue rechazada.
export async function sendDunningEmail(input: {
  name: string;
  email: string;
  planLabel: string;
  amountCents: number;
  willRetry: boolean;
}): Promise<void> {
  const retryLine = input.willRetry
    ? "<p>Volveremos a intentar el cobro en los próximos días. No necesitas hacer nada si tu tarjeta ya tiene fondos.</p>"
    : "<p>No pudimos completar el cobro tras varios intentos. Tu plan quedó en pausa. Escríbenos para reactivarlo.</p>";
  const body = `
    <p>Hola ${escapeHtml(input.name)}, no pudimos procesar la renovación de tu plan.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Plan", input.planLabel)}
      ${row("Monto (IVA incluido)", fmtAmountCents(input.amountCents))}
    </table>
    ${retryLine}
    <p style="color:#7d9999;font-size:13px">¿Necesitas ayuda? Escríbenos por WhatsApp al <strong>${WHATSAPP_DISPLAY}</strong>.</p>
  `;
  await sendViaResend({
    to: input.email,
    subject: "No pudimos renovar tu plan — Dioptrika",
    html: shell("Problema con tu renovación", body),
  });
}

// Alerta INTERNA (soporte): un cobro quedó AMBIGUO (timeout/red) y la suscripción se
// pausó para conciliar. SOLO va a NOTIFY_EMAIL (equipo), NUNCA al cliente — el cliente
// no tiene acceso a Payphone. Aquí SÍ hay que revisar Payphone porque no sabemos si el
// dinero se movió.
export async function sendReconcileAlert(input: {
  subscriptionId: string;
  customerEmail: string;
  message: string;
}): Promise<void> {
  const recipients = notifyRecipients();
  if (recipients.length === 0) {
    console.log("[email] NOTIFY_EMAIL vacío, no se envía alerta de conciliación");
    return;
  }
  const body = `
    <p><strong>[Interno · soporte]</strong> Un cobro recurrente quedó en estado <strong>ambiguo</strong> (timeout o error de red, no sabemos si el dinero se movió) y la suscripción se <strong>pausó</strong> para evitar doble cobro. Revisa en Payphone si el cobro se realizó y reactiva la suscripción manualmente.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Suscripción", input.subscriptionId)}
      ${row("Cliente", input.customerEmail)}
      ${row("Detalle", input.message)}
    </table>
  `;
  await sendViaResend({
    to: recipients,
    subject: "[Interno] Cobro a conciliar — Dioptrika",
    html: shell("Cobro recurrente a conciliar (interno)", body),
  });
}

// Alerta INTERNA (soporte): el cobro recurrente fue RECHAZADO por validación de
// Payphone (HTTP 4xx) de forma PERSISTENTE. A diferencia del caso ambiguo, aquí NO se
// cobró nada a la tarjeta (no hay reembolso ni conciliación de dinero): es un problema
// de datos/configuración. SOLO va a NOTIFY_EMAIL (equipo), NUNCA al cliente. El detalle
// (incl. el teléfono) también se imprime en la terminal del servidor.
export async function sendChargeRejectedAlert(input: {
  subscriptionId: string;
  customerEmail: string;
  phone: string;
  message: string;
  attempts: number;
}): Promise<void> {
  const recipients = notifyRecipients();
  if (recipients.length === 0) {
    console.log("[email] NOTIFY_EMAIL vacío, no se envía alerta de cobro rechazado");
    return;
  }
  const body = `
    <p><strong>[Interno · soporte]</strong> El cobro recurrente fue <strong>rechazado por validación de Payphone</strong> tras ${input.attempts} intento(s). <strong>NO se cobró</strong> a la tarjeta (no hay nada que reembolsar ni conciliar). La suscripción quedó en pausa; revisa los datos del titular y reactívala.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Suscripción", input.subscriptionId)}
      ${row("Cliente", input.customerEmail)}
      ${row("Teléfono", input.phone)}
      ${row("Detalle Payphone", input.message)}
    </table>
  `;
  await sendViaResend({
    to: recipients,
    subject: "[Interno] Cobro recurrente rechazado — revisar — Dioptrika",
    html: shell("Cobro recurrente rechazado (interno)", body),
  });
}
