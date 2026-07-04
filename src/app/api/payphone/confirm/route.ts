import { NextResponse } from "next/server";
import {
  confirmTransactionWithPayphone,
  isApproved,
  sanitizeForClient,
  verifyClientTransactionId,
  type PayphoneConfirmResponse,
  type StoredTransaction,
} from "@/lib/payphone";
import { getTransaction, saveTransaction } from "@/lib/transactions";
import {
  sendCustomerReceipt,
  sendInternalNotification,
  sendAmountMismatchAlert,
} from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { hasDatabase } from "@/lib/db";
import { open } from "@/lib/crypto-vault";
import {
  createSubscription,
  getSubscription,
  type BillingCycle,
} from "@/lib/subscriptions";
import {
  optometryEnabled,
  provisionOptometryAccount,
} from "@/lib/optometry";
import { RECURRING_CONSENT_TEXT } from "@/lib/consent";
import { signCancelToken } from "@/lib/cancel-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKENIZATION_ENABLED = process.env.NEXT_PUBLIC_TOKENIZATION_ENABLED === "true";

// Enlace de gestión/cancelación self-service (sin login). El token es HMAC del id
// de la suscripción → solo el titular (con su enlace) puede cancelar lo suyo.
function buildCancelUrl(subscriptionId: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  const t = signCancelToken(subscriptionId);
  return `${base}/suscripcion/cancelar?id=${encodeURIComponent(subscriptionId)}&t=${t}`;
}

// Crea la suscripción tras un primer pago aprobado y TOKENIZADO.
// Captura el cardToken SERVER-SIDE desde el redirect (ctoken) — nunca pasa por el
// navegador (ver GET /api/payphone/response). Si falla la persistencia tras un
// cobro aprobado, NO se traga el error: se loggea ERROR y se intenta avisar
// internamente (un pago se cobró pero la suscripción no se pudo crear).
async function alertSubscriptionGap(
  stored: StoredTransaction,
  pp: PayphoneConfirmResponse,
  reason: string
): Promise<void> {
  try {
    await sendInternalNotification({
      ...stored,
      status: "approved",
      confirmedAt: new Date().toISOString(),
      payphoneTransactionId:
        typeof pp.transactionId === "number" ? pp.transactionId : undefined,
      planLabel: `${stored.planLabel || ""} ⚠️ ${reason} — pago cobrado, conciliar`,
    });
  } catch {
    /* best-effort */
  }
}

async function maybeCreateSubscription(
  stored: StoredTransaction,
  pp: PayphoneConfirmResponse,
  clientTransactionId: string,
  ip: string,
  ctokenFallback?: string
): Promise<{ id: string; created: boolean } | null> {
  try {
    if (!hasDatabase()) {
      console.error(
        "[payphone/confirm] TOKENIZACIÓN activa pero DATABASE_URL no configurado; no se puede crear la suscripción. ref=" +
          clientTransactionId
      );
      await alertSubscriptionGap(stored, pp, "BD no configurada (DATABASE_URL)");
      return null;
    }
    // Token capturado SERVER-SIDE del redirect (ctoken) y guardado cifrado por
    // GET /api/payphone/response. Fallback: por si Payphone también lo devuelve
    // en la respuesta del Confirm (VERIFY-1, a confirmar en sandbox).
    let cardToken: string | undefined;
    if (stored.cardTokenEnc) {
      try {
        cardToken = open(stored.cardTokenEnc);
      } catch (err) {
        console.error(
          "[payphone/confirm] no se pudo descifrar el ctoken guardado:",
          (err as Error).message
        );
      }
    }
    if (!cardToken) cardToken = pp.cardToken;
    // Último recurso: el ctoken que la página reenvió (si Payphone lo dejó en la URL).
    if (!cardToken && ctokenFallback) cardToken = ctokenFallback;
    if (!cardToken) {
      console.error(
        "[payphone/confirm] pago aprobado SIN cardToken; no se crea suscripción (el cliente NO podrá renovarse). ref=" +
          clientTransactionId
      );
      await alertSubscriptionGap(stored, pp, "pago aprobado sin cardToken (no se podrá renovar)");
      return null;
    }

    const planId = stored.planId || "unico";
    const billing = stored.billing || "monthly";
    // Cadencia. En modo PRUEBA (sandbox local, PAYPHONE_TEST_MODE=true) usamos el
    // ciclo rápido `test2min` para VALIDAR la recurrencia y la cancelación en
    // minutos (cada 2 min por defecto) en lugar de esperar un mes. En PRODUCCIÓN
    // (PAYPHONE_TEST_MODE distinto de "true") la cadencia es la REAL: mensual
    // (o anual si el cliente eligió anual).
    const TEST_MODE = process.env.PAYPHONE_TEST_MODE === "true";
    const cycle: BillingCycle = TEST_MODE
      ? "test2min"
      : billing === "annual"
        ? "annual"
        : "monthly";
    const documentId = (stored.documentId || pp.document || "").toString();
    const cardHolderName = (pp.optionalParameter4 || stored.lead.name).toString();
    const nowIso = new Date().toISOString();

    const sub = await createSubscription({
      planId,
      billing,
      cycle,
      amountCents: stored.amount ?? 0,
      currency: "USD",
      reference: stored.planLabel ?? null,
      name: stored.lead.name,
      email: stored.lead.email,
      phone: stored.lead.phone,
      documentId,
      cardHolderName,
      cardToken,
      cardBrand: pp.cardBrand ?? null,
      lastDigits: pp.lastDigits ?? null,
      bin: pp.bin ?? null,
      consentText: stored.consentText ?? RECURRING_CONSENT_TEXT,
      consentAt: stored.consentAt ?? nowIso,
      consentIp: ip,
      startIso: nowIso,
      firstClientTxId: clientTransactionId,
      firstPpTxId:
        typeof pp.transactionId === "number" ? pp.transactionId : null,
    });
    if (sub.duplicate) {
      console.error(
        `[payphone/confirm] POSIBLE DOBLE COBRO ref=${clientTransactionId} ppTxId=${pp.transactionId}: el cliente ya tenía una suscripción ACTIVA de este plan; NO se creó otra (revisar si hay que reversar el cargo de la alta).`
      );
      await alertSubscriptionGap(stored, pp, "posible doble cobro: ya existía suscripción activa");
    } else {
      console.log(
        `[payphone/confirm] suscripción ${sub.created ? "creada" : "ya existía"} ref=${clientTransactionId}`
      );
    }
    return { id: sub.id, created: sub.created };
  } catch (err) {
    // CRÍTICO: el cliente YA pagó pero no pudimos guardar el token. Avisar.
    console.error(
      `[payphone/confirm] ERROR creando suscripción tras pago aprobado ref=${clientTransactionId} ppTxId=${pp.transactionId}:`,
      (err as Error).message
    );
    try {
      await sendInternalNotification({
        ...stored,
        status: "approved",
        confirmedAt: new Date().toISOString(),
        payphoneTransactionId:
          typeof pp.transactionId === "number" ? pp.transactionId : undefined,
        planLabel:
          (stored.planLabel || "") + " ⚠️ SUSCRIPCIÓN NO GUARDADA — revisar token",
      });
    } catch {
      /* best-effort */
    }
    return null;
  }
}

// El cliente YA pagó pero su cuenta no se pudo crear en el sistema de optometría:
// sin este aviso el fallo solo queda en la terminal y nadie provisiona al cliente.
async function alertProvisioningGap(
  stored: StoredTransaction,
  subscriptionId: string,
  reason: string
): Promise<void> {
  try {
    await sendInternalNotification({
      ...stored,
      planLabel: `${stored.planLabel || ""} ⚠️ ALTA EN OPTOMETRÍA FALLÓ (${reason}) — crear la cuenta manualmente · sub=${subscriptionId}`,
    });
  } catch {
    /* best-effort */
  }
}

// Accesos que optometría devuelve al crear la cuenta, para incluirlos en el recibo
// (un solo correo): enlace para crear contraseña + URL de login del sistema.
type OptometryAccess = { setPasswordUrl?: string; loginUrl?: string };

async function provisionOptometry(
  stored: StoredTransaction,
  pp: PayphoneConfirmResponse,
  subscriptionId: string
): Promise<OptometryAccess> {
  if (!optometryEnabled()) return {};
  try {
    let currentPeriodEnd: string | null = null;
    try {
      const sub = await getSubscription(subscriptionId);
      currentPeriodEnd = sub?.nextChargeAt ?? null;
    } catch (err) {
      console.error(
        "[payphone/confirm] no se pudo leer la suscripción para la provisión:",
        (err as Error).message
      );
    }
    const documentId = (stored.documentId || pp.document || "").toString();
    const result = await provisionOptometryAccount({
      opticaName: (stored.opticaName || stored.lead.name).toString(),
      ownerName: stored.lead.name,
      adminEmail: stored.lead.email,
      phone: stored.lead.phone,
      documentId,
      externalSubscriptionId: subscriptionId,
      planCode: stored.planId || "unico",
      amountCents: typeof stored.amount === "number" ? stored.amount : undefined,
      currency: "USD",
      billingCycle: "monthly",
      cardBrand: pp.cardBrand ?? null,
      cardLast4: pp.lastDigits ?? null,
      currentPeriodEnd,
      status: "active",
    });
    if (!result.ok) {
      console.error(
        `[payphone/confirm] alta en el sistema de optometria fallo sub=${subscriptionId}: ${result.error}`
      );
      await alertProvisioningGap(stored, subscriptionId, result.error ?? "error");
      return {};
    }
    console.log(
      `[payphone/confirm] alta en el sistema de optometria OK sub=${subscriptionId}`
    );
    // La respuesta viene envuelta por el TransformInterceptor: { messageKey, data }.
    const inner =
      (result.data as { data?: OptometryAccess } | null)?.data ?? {};
    return { setPasswordUrl: inner.setPasswordUrl, loginUrl: inner.loginUrl };
  } catch (err) {
    console.error(
      `[payphone/confirm] error avisando al sistema de optometria sub=${subscriptionId}:`,
      (err as Error).message
    );
    await alertProvisioningGap(stored, subscriptionId, (err as Error).message);
    return {};
  }
}

interface ConfirmBody {
  id?: number | string;
  clientTransactionId?: string;
  // Fallback: si el `ctoken` (cardToken) llegó al navegador en la URL de retorno
  // (en vez de capturarlo la ruta server), la página lo reenvía aquí para poder
  // crear la suscripción igualmente. El clientTransactionId va firmado (HMAC) y el
  // pago se verifica server-to-server, así que aceptarlo es seguro.
  ctoken?: string;
}

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "false") {
    return NextResponse.json({ success: false, error: "Pagos próximamente" }, { status: 503 });
  }

  const limit = rateLimit(`confirm:${clientIp(req)}`, { capacity: 10, refillPerSec: 0.5 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento e intenta de nuevo." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: ConfirmBody;
  try {
    body = (await req.json()) as ConfirmBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const idNum = Number(body.id);
  const clientTransactionId = (body.clientTransactionId || "").toString();
  const ctokenFromClient = (body.ctoken || "").toString();

  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }
  if (!verifyClientTransactionId(clientTransactionId)) {
    return NextResponse.json({ error: "Referencia inválida" }, { status: 400 });
  }

  // Lectura de la transacción. Si la BD está caída, NO reventamos con un 500 crudo
  // (el front no podría parsear y se quedaría colgado): devolvemos JSON claro.
  let stored: StoredTransaction | null = null;
  try {
    stored = await getTransaction(clientTransactionId);
  } catch (err) {
    console.error(
      `[payphone/confirm] BD no disponible al leer la transacción ref=${clientTransactionId}:`,
      (err as Error).message
    );
    return NextResponse.json(
      {
        success: false,
        error:
          "Estamos procesando tu pago. Si el cargo se realizó, recibirás la confirmación por correo; por favor no reintentes el pago.",
      },
      { status: 503 }
    );
  }

  if (stored?.status === "approved") {
    return NextResponse.json({
      success: true,
      alreadyConfirmed: true,
      reference: clientTransactionId,
      payment: sanitizeForClient({
        transactionId: stored.payphoneTransactionId,
        clientTransactionId,
        statusCode: 3,
        transactionStatus: "Approved",
        authorizationCode: stored.authorizationCode,
        cardBrand: stored.cardBrand,
        lastDigits: stored.lastDigits,
        amount: stored.amount,
      }),
    });
  }

  let payphoneResponse;
  try {
    payphoneResponse = await confirmTransactionWithPayphone({
      id: idNum,
      clientTransactionId,
    });
  } catch (err) {
    console.error("[payphone/confirm] fallo llamando a Payphone:", (err as Error).message);
    return NextResponse.json(
      { success: false, error: "No pudimos verificar el pago. Intenta nuevamente." },
      { status: 502 }
    );
  }

  // Verificación de estado + monto. payphoneResponse.amount es la fuente confiable
  // del monto cobrado (confirmación server-to-server autenticada). Lo comparamos
  // contra el monto que guardamos al iniciar el plan, para cerrar manipulaciones.
  const expectedAmount = stored?.amount;
  const statusApproved = isApproved(payphoneResponse);
  const amountOk =
    typeof expectedAmount === "number" && Number(payphoneResponse.amount) === expectedAmount;
  const approved = statusApproved && amountOk;

  if (stored && statusApproved && !amountOk) {
    console.error(
      `[payphone/confirm] MONTO NO COINCIDE ref=${clientTransactionId} ` +
        `esperado=${expectedAmount} recibido=${payphoneResponse.amount} ` +
        `ppTxId=${payphoneResponse.transactionId}`
    );
  }

  // RECUPERACIÓN (S1): Payphone APROBÓ pero no tenemos registro local (p.ej. la BD
  // estaba caída en /init). NO le digas al cliente que falló — pagó de verdad y
  // re-pagaría (doble cobro). Registramos lo recuperado, alertamos para conciliar y
  // devolvemos ÉXITO (el pago se recibió).
  if (!stored && statusApproved) {
    console.error(
      `[payphone/confirm] PAGO APROBADO SIN REGISTRO LOCAL ref=${clientTransactionId} ppTxId=${payphoneResponse.transactionId} — conciliar y crear suscripción manual`
    );
    const recovered: StoredTransaction = {
      clientTransactionId,
      status: "approved",
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      lead: { name: "(pago sin registro local)", email: "", phone: "" },
      amount:
        typeof payphoneResponse.amount === "number" ? payphoneResponse.amount : undefined,
      payphoneTransactionId:
        typeof payphoneResponse.transactionId === "number"
          ? payphoneResponse.transactionId
          : undefined,
      authorizationCode: payphoneResponse.authorizationCode,
      cardBrand: payphoneResponse.cardBrand,
      lastDigits: payphoneResponse.lastDigits,
      planLabel: "⚠️ PAGO APROBADO SIN REGISTRO — conciliar",
    };
    try {
      await saveTransaction(recovered);
    } catch (e) {
      console.error(
        "[payphone/confirm] no se pudo persistir el registro recuperado:",
        (e as Error).message
      );
    }
    try {
      await sendInternalNotification(recovered);
    } catch {
      /* best-effort */
    }
    return NextResponse.json({
      success: true,
      reference: clientTransactionId,
      payment: sanitizeForClient(payphoneResponse),
    });
  }

  let subscriptionId: string | null = null;
  if (stored) {
    const willEmail = approved && !stored.emailedAt;
    const updated: StoredTransaction = {
      ...stored,
      status: (approved ? "approved" : "failed") as "approved" | "failed",
      confirmedAt: new Date().toISOString(),
      payphoneTransactionId:
        typeof payphoneResponse.transactionId === "number"
          ? payphoneResponse.transactionId
          : undefined,
      authorizationCode: payphoneResponse.authorizationCode,
      cardBrand: payphoneResponse.cardBrand,
      lastDigits: payphoneResponse.lastDigits,
      emailedAt: willEmail ? new Date().toISOString() : stored.emailedAt,
    };
    try {
      await saveTransaction(updated);
    } catch (err) {
      console.error("[payphone/confirm] error guardando:", (err as Error).message);
    }

    if (statusApproved && !amountOk) {
      try {
        await sendAmountMismatchAlert(updated, Number(payphoneResponse.amount));
      } catch {
        /* best-effort */
      }
    }

    if (approved) {
      // 1) Cobro recurrente: crear la suscripción con la tarjeta tokenizada PRIMERO,
      //    para poder incluir el enlace de cancelación self-service en el recibo.
      if (TOKENIZATION_ENABLED) {
        const subInfo = await maybeCreateSubscription(
          updated,
          payphoneResponse,
          clientTransactionId,
          clientIp(req),
          ctokenFromClient
        );
        subscriptionId = subInfo?.id ?? null;
      }

      // 2) Alta en optometría ANTES del recibo: así el correo (ÚNICO) puede incluir
      //    el enlace para crear la contraseña + la URL de login del sistema. Es
      //    bloqueante pero acotado (timeout ~10s); si falla o está apagado, devuelve
      //    vacío y el recibo usa el texto de respaldo.
      let access: OptometryAccess = {};
      if (subscriptionId) {
        access = await provisionOptometry(
          updated,
          payphoneResponse,
          subscriptionId
        );
      }

      // 3) Recibo al cliente + aviso interno. Con la suscripción creada, el recibo
      //    incluye el enlace para gestionar/cancelar y los accesos al sistema.
      if (willEmail) {
        const cancelUrl = subscriptionId ? buildCancelUrl(subscriptionId) : undefined;
        try {
          await Promise.all([
            sendCustomerReceipt(updated, cancelUrl, access),
            sendInternalNotification(updated),
          ]);
        } catch (err) {
          console.error("[payphone/confirm] error enviando emails:", (err as Error).message);
        }
      }
    }
  }

  const payload: {
    success: boolean;
    reference: string;
    payment: ReturnType<typeof sanitizeForClient>;
    subscriptionId?: string;
    cancelToken?: string;
  } = {
    success: approved,
    reference: clientTransactionId,
    payment: sanitizeForClient(payphoneResponse),
  };
  // Enlace de gestión/cancelación self-service (solo cuando hay suscripción).
  if (subscriptionId) {
    payload.subscriptionId = subscriptionId;
    payload.cancelToken = signCancelToken(subscriptionId);
  }
  return NextResponse.json(payload);
}
