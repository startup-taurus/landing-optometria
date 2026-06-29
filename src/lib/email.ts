import type { StoredTransaction } from "./payphone";
import { WHATSAPP_DISPLAY } from "./contact";

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
}

function fmtAmountCents(cents?: number): string {
  if (typeof cents !== "number") return "$30.00";
  return `$${(cents / 100).toFixed(2)}`;
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
  cancelUrl?: string
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
  const body = `
    <p>¡Hola ${escapeHtml(tx.lead.name)}! Recibimos tu pago correctamente.</p>
    <p>En las próximas <strong>24 horas hábiles</strong> te enviaremos tus credenciales de acceso y un correo del equipo de soporte con los pasos para empezar a usar Dioptrika.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Plan", "Dioptrika — Plan Único mensual")}
      ${row("Monto", fmtAmountCents(tx.amount))}
      ${row("Referencia", tx.clientTransactionId)}
      ${tx.authorizationCode ? row("Autorización", tx.authorizationCode) : ""}
      ${tx.cardBrand && tx.lastDigits ? row("Tarjeta", `${tx.cardBrand} ···· ${tx.lastDigits}`) : ""}
    </table>
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
    subject: `Nueva venta Dioptrika $30 — ${tx.lead.name}`,
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
      ${row("Esperado", "$30.00")}
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
      ${row("Monto", fmtAmountCents(input.amountCents))}
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
      ${row("Monto", fmtAmountCents(input.amountCents))}
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

// Alerta interna: un cobro quedó ambiguo y la suscripción se pausó para conciliar.
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
    <p>Un cobro recurrente quedó en estado ambiguo y la suscripción se <strong>pausó</strong> para evitar doble cobro. Revisa en Payphone si el cobro se realizó y reactiva la suscripción manualmente.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Suscripción", input.subscriptionId)}
      ${row("Cliente", input.customerEmail)}
      ${row("Detalle", input.message)}
    </table>
  `;
  await sendViaResend({
    to: recipients,
    subject: "Cobro a conciliar — Dioptrika",
    html: shell("Cobro recurrente a conciliar", body),
  });
}
