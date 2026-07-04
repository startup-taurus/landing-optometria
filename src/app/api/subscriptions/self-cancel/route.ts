import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/db";
import { cancelSubscription, getSubscription } from "@/lib/subscriptions";
import { verifyCancelToken } from "@/lib/cancel-token";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { optometryEnabled, syncOptometrySubscription } from "@/lib/optometry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cancelación SELF-SERVICE del cliente. No requiere login: la autorización es el
// token firmado (HMAC del id de la suscripción). Sin un token válido para ESE id,
// se rechaza con 403 → nadie puede cancelar la suscripción de otra persona.
export async function POST(req: Request) {
  const limit = rateLimit(`selfcancel:${clientIp(req)}`, { capacity: 8, refillPerSec: 0.2 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento e intenta de nuevo." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });
  }

  let body: { id?: string; token?: string };
  try {
    body = (await req.json()) as { id?: string; token?: string };
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const id = (body.id || "").toString();
  const token = (body.token || "").toString();
  if (!id || !token || !verifyCancelToken(id, token)) {
    return NextResponse.json({ error: "Enlace de cancelación inválido o vencido." }, { status: 403 });
  }

  const sub = await getSubscription(id);
  if (!sub) {
    return NextResponse.json({ error: "Suscripción no encontrada." }, { status: 404 });
  }
  if (sub.status === "canceled") {
    return NextResponse.json({ success: true, alreadyCanceled: true });
  }

  const canceled = await cancelSubscription(id);
  if (!canceled) {
    return NextResponse.json({ success: false, error: "No pudimos cancelar. Intenta de nuevo." }, { status: 500 });
  }
  console.log(`[subscriptions/self-cancel] cancelada por el cliente id=${id}`);
  if (optometryEnabled()) {
    try {
      await syncOptometrySubscription({ externalSubscriptionId: id, status: "canceled" });
    } catch (err) {
      console.error(
        `[subscriptions/self-cancel] sync optometria fallo id=${id}:`,
        (err as Error).message
      );
    }
  }
  return NextResponse.json({ success: true });
}
