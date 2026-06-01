import { NextResponse } from "next/server";
import {
  confirmTransactionWithPayphone,
  isApproved,
  sanitizeForClient,
  verifyClientTransactionId,
  PLAN_AMOUNT_TOTAL,
} from "@/lib/payphone";
import { getTransaction, saveTransaction } from "@/lib/transactions";
import { sendCustomerReceipt, sendInternalNotification } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ConfirmBody {
  id?: number | string;
  clientTransactionId?: string;
}

export async function POST(req: Request) {
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

  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }
  if (!verifyClientTransactionId(clientTransactionId)) {
    return NextResponse.json({ error: "Referencia inválida" }, { status: 400 });
  }

  const stored = await getTransaction(clientTransactionId);

  if (stored?.status === "approved") {
    return NextResponse.json({
      success: true,
      alreadyConfirmed: true,
      reference: clientTransactionId,
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

  // Verificación de estado + monto. Payphone confirma server-to-server (autenticado
  // con PAYPHONE_TOKEN), así que payphoneResponse.amount es la fuente confiable del
  // monto realmente cobrado. Rechazamos cualquier cobro que no sea exactamente el plan
  // ($30.00 = 3000 centavos) para cerrar el hueco de manipulación del cliente.
  const statusApproved = isApproved(payphoneResponse);
  const amountOk = Number(payphoneResponse.amount) === PLAN_AMOUNT_TOTAL;
  const approved = statusApproved && amountOk;

  if (statusApproved && !amountOk) {
    console.error(
      `[payphone/confirm] MONTO NO COINCIDE ref=${clientTransactionId} ` +
        `esperado=${PLAN_AMOUNT_TOTAL} recibido=${payphoneResponse.amount} ` +
        `ppTxId=${payphoneResponse.transactionId}`
    );
  }

  if (stored) {
    const updated = {
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
    };
    try {
      await saveTransaction(updated);
    } catch (err) {
      console.error("[payphone/confirm] error guardando:", (err as Error).message);
    }

    if (approved) {
      try {
        await Promise.all([
          sendCustomerReceipt(updated),
          sendInternalNotification(updated),
        ]);
      } catch (err) {
        console.error("[payphone/confirm] error enviando emails:", (err as Error).message);
      }
    }
  }

  return NextResponse.json({
    success: approved,
    reference: clientTransactionId,
    payment: sanitizeForClient(payphoneResponse),
  });
}
