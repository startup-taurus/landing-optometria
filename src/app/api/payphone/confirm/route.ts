import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/confirm-payment";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ConfirmBody {
  id?: number | string;
  clientTransactionId?: string;
}

// NOTA: el flujo principal ahora confirma del lado servidor en /payphone/response
// (ver src/app/payphone/response/page.tsx), independiente del JS del navegador.
// Esta ruta se mantiene como endpoint de respaldo / reintento manual y comparte
// exactamente la misma lógica idempotente vía confirmPayment().
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

  const outcome = await confirmPayment({
    id: body.id,
    clientTransactionId: body.clientTransactionId,
  });

  return NextResponse.json(
    {
      success: outcome.success,
      alreadyConfirmed: outcome.alreadyConfirmed,
      reference: outcome.reference,
      payment: outcome.payment,
      error: outcome.error,
    },
    { status: outcome.httpStatus }
  );
}
