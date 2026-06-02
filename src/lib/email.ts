import type { StoredTransaction } from "./payphone";

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

export async function sendCustomerReceipt(tx: StoredTransaction): Promise<void> {
  const body = `
    <p>¡Hola ${escapeHtml(tx.lead.name)}! Recibimos tu pago correctamente.</p>
    <p>En las próximas <strong>24 horas hábiles</strong> te enviaremos tus credenciales de acceso y un correo del equipo de soporte con los pasos para empezar a usar Dioptrika.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-top:1px solid #1D4650">
      ${row("Plan", "Dioptrika — Plan Único mensual")}
      ${row("Monto", fmtAmountCents(tx.payphoneTransactionId ? 3000 : 3000))}
      ${row("Referencia", tx.clientTransactionId)}
      ${tx.authorizationCode ? row("Autorización", tx.authorizationCode) : ""}
      ${tx.cardBrand && tx.lastDigits ? row("Tarjeta", `${tx.cardBrand} ···· ${tx.lastDigits}`) : ""}
    </table>
    <p style="color:#7d9999;font-size:13px">Guarda este correo como comprobante. Si tienes dudas, escríbenos por WhatsApp al <strong>+593 99 592 3599</strong>.</p>
  `;
  await sendViaResend({
    to: tx.lead.email,
    subject: "Pago recibido — Dioptrika",
    html: shell("¡Gracias por tu pago!", body),
  });
}

export async function sendInternalNotification(tx: StoredTransaction): Promise<void> {
  // NOTIFY_EMAIL admite varios correos separados por coma (ej: "a@x.com,b@y.com").
  const recipients = (process.env.NOTIFY_EMAIL || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
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
