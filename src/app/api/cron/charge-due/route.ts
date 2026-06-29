import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  chargeTokenizedTransaction,
  isTokenChargeApproved,
  isTokenChargeDeclined,
  isTokenChargeValidationError,
  describeTokenChargeError,
  computeAmounts,
  getPlanTotalCents,
  getPlanLabel,
  generateClientTransactionId,
  type PayphoneOrder,
  type Billing,
} from "@/lib/payphone";
import { encryptCardHolder } from "@/lib/payphone-crypto";
import {
  listDueSubscriptions,
  recordChargeAttempt,
  markChargeApproved,
  markChargeDeclined,
  markChargeNeedsReconciliation,
  getChargeCredentials,
  type Subscription,
} from "@/lib/subscriptions";
import {
  sendRenewalReceipt,
  sendDunningEmail,
  sendReconcileAlert,
  sendChargeRejectedAlert,
} from "@/lib/email";
import { hasDatabase, withAdvisoryLock } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Disparador del COBRO RECURRENTE. Lo invoca un cron del sistema (o CronJob de
// Docker) 1×/día con el secreto. No es un endpoint público ni de polling.
const ADVISORY_LOCK_KEY = 778_899; // clave fija para pg_try_advisory_lock
const MAX_RETRIES = 3;
const BATCH_LIMIT = 50;

// Comparación en tiempo constante del secreto del cron.
function authorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET || "";
  if (expected.length < 16) return false; // sin configurar / demasiado débil
  const auth = req.headers.get("authorization") || "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Backoff entre reintentos de cobro rechazado.
function backoffMs(sub: Subscription): number {
  if (sub.cycle === "test2min") return 30 * 1000; // prueba: 30s
  const days = [1, 3, 5][sub.failureCount] ?? 5; // 1º +1d, 2º +3d, 3º +5d
  return days * 24 * 60 * 60 * 1000;
}

// Devuelve `ip` si parece una IP (v4/v6) válida; si no, el fallback (loopback).
function validIpOr(ip: string | null, fallback: string): string {
  if (ip && (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || ip.includes(":"))) return ip;
  return fallback;
}

// Construye el `order` (obligatorio en tokenización). Payphone valida que billTo
// incluya `ipAddress` ("El campo Ip Address es requerido"); en un cobro recurrente
// server-side usamos la IP con la que el cliente consintió, o loopback si no es válida.
function buildOrder(
  sub: Subscription,
  amounts: { amount: number; amountWithTax: number; tax: number }
): PayphoneOrder {
  const [firstName, ...rest] = sub.name.trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;
  const productName = sub.reference || `Dioptrika — ${sub.planId}`;
  return {
    billTo: {
      firstName,
      lastName,
      email: sub.email,
      phoneNumber: sub.phone,
      country: "EC",
      ipAddress: validIpOr(sub.consentIp, "127.0.0.1"),
    },
    lineItems: [
      {
        // Doc Payphone: totalAmount = unitPrice*quantity + taxAmount; unitPrice es
        // el NETO (base imponible), no el total con IVA.
        productName,
        unitPrice: amounts.amountWithTax,
        quantity: 1,
        totalAmount: amounts.amountWithTax + amounts.tax, // === amounts.amount
        taxAmount: amounts.tax,
      },
    ],
  };
}

async function chargeOne(sub: Subscription): Promise<"approved" | "declined" | "skipped" | "reconcile"> {
  if (!sub.nextChargeAt) return "skipped";

  // Precio CONGELADO en la suscripción (no se re-tarifa). Validamos que el plan
  // siga existiendo y que la moneda sea USD.
  if (sub.currency !== "USD") {
    console.error(`[cron] moneda no soportada sub=${sub.id} (${sub.currency})`);
    return "skipped";
  }
  if (getPlanTotalCents(sub.planId, sub.billing as Billing) === null) {
    console.error(`[cron] plan inexistente sub=${sub.id} plan=${sub.planId}`);
    return "skipped";
  }
  const amounts = computeAmounts(sub.amountCents);

  // Gate de idempotencia: crea (y commitea) la fila `pending` ANTES del HTTP.
  // Si el periodo ya fue cobrado/intentado → null → saltar (no recobrar).
  const clientTxId = generateClientTransactionId();
  const chargeId = await recordChargeAttempt({
    subscriptionId: sub.id,
    clientTxId,
    periodStart: sub.nextChargeAt,
    amountCents: sub.amountCents,
  });
  if (!chargeId) return "skipped";

  const reference = sub.reference || getPlanLabel(sub.planId, sub.billing as Billing);

  let resp;
  try {
    const { cardToken, cardHolderName } = getChargeCredentials(sub);
    resp = await chargeTokenizedTransaction({
      cardToken,
      cardHolder: encryptCardHolder(cardHolderName),
      documentId: sub.documentId,
      phoneNumber: sub.phone,
      email: sub.email,
      amount: amounts.amount,
      amountWithTax: amounts.amountWithTax,
      amountWithoutTax: amounts.amountWithoutTax,
      tax: amounts.tax,
      clientTransactionId: clientTxId,
      reference,
      order: buildOrder(sub, amounts),
    });
  } catch (err) {
    // TRANSITORIO/ambiguo (timeout, red, crash): NO reintentar a ciegas.
    console.error(`[cron] cobro ambiguo sub=${sub.id} ref=${clientTxId}:`, (err as Error).message);
    await markChargeNeedsReconciliation({
      chargeId,
      subscriptionId: sub.id,
      message: (err as Error).message,
    });
    try {
      await sendReconcileAlert({
        subscriptionId: sub.id,
        customerEmail: sub.email,
        message: (err as Error).message,
      });
    } catch {
      /* best-effort */
    }
    return "reconcile";
  }

  if (isTokenChargeApproved(resp)) {
    await markChargeApproved({
      chargeId,
      subscriptionId: sub.id,
      scheduledPeriod: sub.nextChargeAt,
      cycle: sub.cycle,
      anchorDay: sub.billingAnchorDay,
      ppTransactionId: typeof resp.transactionId === "number" ? resp.transactionId : null,
      authorizationCode: resp.authorizationCode ?? null,
      newCardToken: resp.cardToken ?? null,
    });
    try {
      await sendRenewalReceipt({
        name: sub.name,
        email: sub.email,
        planLabel: reference,
        amountCents: sub.amountCents,
        reference: clientTxId,
        authorizationCode: resp.authorizationCode ?? null,
        cardBrand: sub.cardBrand,
        lastDigits: sub.lastDigits,
      });
    } catch {
      /* best-effort */
    }
    return "approved";
  }

  if (isTokenChargeDeclined(resp)) {
    const { pastDue } = await markChargeDeclined({
      chargeId,
      subscriptionId: sub.id,
      statusCode: typeof resp.statusCode === "number" ? resp.statusCode : null,
      message: resp.message ?? "declined",
      maxRetries: MAX_RETRIES,
      backoffMs: backoffMs(sub),
      nowIso: new Date().toISOString(),
    });
    try {
      await sendDunningEmail({
        name: sub.name,
        email: sub.email,
        planLabel: reference,
        amountCents: sub.amountCents,
        willRetry: !pastDue,
      });
    } catch {
      /* best-effort */
    }
    return "declined";
  }

  // Payphone RECHAZÓ la solicitud por validación (HTTP 4xx) → NO tocó la tarjeta, NO
  // hubo cobro. NO es ambiguo (≠ timeout): es SEGURO reintentar. En el sandbox este
  // rechazo es INTERMITENTE (el mismo teléfono +593… se aprueba en un cobro y se
  // rechaza minutos después con "Número de teléfono inválido" — verificado: 5 cobros OK
  // seguidos con el mismo formato). Por eso NO pausamos ni conciliamos: reprogramamos
  // con backoff para que el siguiente ciclo lo cobre. El cliente NO recibe ningún correo
  // técnico; el teléfono + detalle quedan en la TERMINAL, y solo si el rechazo se vuelve
  // PERSISTENTE se avisa a soporte (interno).
  if (isTokenChargeValidationError(resp)) {
    const vdetail = describeTokenChargeError(resp);
    console.error(
      `[cron] validación rechazada por Payphone (SIN cobro) sub=${sub.id} ref=${clientTxId} ` +
        `tel=${sub.phone} doc=${sub.documentId} ip=${validIpOr(sub.consentIp, "127.0.0.1")}: ` +
        `${vdetail} → reintento programado`
    );
    const { pastDue } = await markChargeDeclined({
      chargeId,
      subscriptionId: sub.id,
      statusCode: null,
      message: vdetail,
      maxRetries: MAX_RETRIES,
      backoffMs: backoffMs(sub),
      nowIso: new Date().toISOString(),
    });
    if (pastDue) {
      // Rechazo PERSISTENTE (no fue un parpadeo del sandbox) → algo está mal de verdad.
      // Avisar a SOPORTE (interno), nunca al cliente: no es problema de su tarjeta.
      console.error(
        `[cron] validación rechazada PERSISTENTE sub=${sub.id} (${MAX_RETRIES} intentos) ` +
          `→ suscripción en pausa, avisando a soporte`
      );
      try {
        await sendChargeRejectedAlert({
          subscriptionId: sub.id,
          customerEmail: sub.email,
          phone: sub.phone,
          message: vdetail,
          attempts: MAX_RETRIES,
        });
      } catch {
        /* best-effort */
      }
    }
    return "declined";
  }

  // Respuesta NO clara (ni aprobada ni rechazada ni validación) → conciliar, nunca rechazar.
  const detail = describeTokenChargeError(resp);
  console.error(`[cron] respuesta desconocida sub=${sub.id} ref=${clientTxId}: ${detail}`);
  await markChargeNeedsReconciliation({
    chargeId,
    subscriptionId: sub.id,
    message: detail,
  });
  try {
    await sendReconcileAlert({
      subscriptionId: sub.id,
      customerEmail: sub.email,
      message: detail,
    });
  } catch {
    /* best-effort */
  }
  return "reconcile";
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: "DATABASE_URL no configurado" },
      { status: 503 }
    );
  }
  // Defensa en profundidad (además del secreto).
  const limit = rateLimit(`cron:${clientIp(req)}`, { capacity: 4, refillPerSec: 0.1 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  // Un solo run concurrente, aunque haya varias instancias/contenedores.
  const result = await withAdvisoryLock(
    ADVISORY_LOCK_KEY,
    async () => {
      const now = new Date().toISOString();
      const due = await listDueSubscriptions(now, BATCH_LIMIT);
      const summary = { processed: 0, approved: 0, declined: 0, skipped: 0, reconcile: 0 };
      for (const sub of due) {
        summary.processed += 1;
        try {
          const outcome = await chargeOne(sub);
          summary[outcome] += 1;
        } catch (err) {
          summary.skipped += 1;
          console.error(`[cron] error procesando sub=${sub.id}:`, (err as Error).message);
        }
      }
      return summary;
    },
    null as
      | null
      | { processed: number; approved: number; declined: number; skipped: number; reconcile: number }
  );

  if (result === null) {
    return NextResponse.json({ skipped: "locked" });
  }
  console.log("[cron] charge-due:", JSON.stringify(result));
  return NextResponse.json(result);
}
