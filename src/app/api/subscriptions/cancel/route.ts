import { NextResponse } from "next/server";
import crypto from "crypto";
import { hasDatabase } from "@/lib/db";
import { cancelSubscription } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cancelación de suscripción (detiene cobros futuros: status='canceled',
// next_charge_at=NULL). Protegida por CRON_SECRET (acción interna/admin).
// La cancelación self-service del cliente vive en /api/subscriptions/self-cancel.
function authorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET || "";
  if (expected.length < 16) return false;
  const auth = req.headers.get("authorization") || "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json({ error: "DATABASE_URL no configurado" }, { status: 503 });
  }

  let body: { id?: string };
  try {
    body = (await req.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const id = (body.id || "").toString().trim();
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const canceled = await cancelSubscription(id);
  if (!canceled) {
    return NextResponse.json(
      { success: false, error: "Suscripción no encontrada o ya cancelada" },
      { status: 404 }
    );
  }
  console.log(`[subscriptions/cancel] cancelada id=${id}`);
  return NextResponse.json({ success: true, id });
}
