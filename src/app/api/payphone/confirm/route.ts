import { NextResponse } from "next/server";
import {
  confirmTransactionWithPayphone,
  isApproved,
  sanitizeForClient,
  verifyClientTransactionId,
} from "@/lib/payphone";
import { getTransaction, saveTransaction } from "@/lib/transactions";
import { sendCustomerReceipt, sendInternalNotification } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ConfirmBody {
  id?: number | string;
  clientTransactionId?: string;
}

export async function POST(req: Request) {
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

  const approved = isApproved(payphoneResponse);

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
