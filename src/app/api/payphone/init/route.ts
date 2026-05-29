import { NextResponse } from "next/server";
import {
  generateClientTransactionId,
  normalizeEcuadorPhone,
  type LeadInput,
} from "@/lib/payphone";
import { saveTransaction } from "@/lib/transactions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  let body: Partial<LeadInput>;
  try {
    body = (await req.json()) as Partial<LeadInput>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim().toLowerCase();
  const phoneRaw = (body.phone || "").toString().trim();
  const phone = normalizeEcuadorPhone(phoneRaw);

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }
  if (!isEmail(email) || email.length > 120) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Teléfono inválido. Usa un celular ecuatoriano (ej. 0962766008)." },
      { status: 400 }
    );
  }

  let clientTransactionId: string;
  try {
    clientTransactionId = generateClientTransactionId();
  } catch (err) {
    console.error("[payphone/init]", (err as Error).message);
    return NextResponse.json({ error: "Configuración del servidor incompleta" }, { status: 500 });
  }

  try {
    await saveTransaction({
      clientTransactionId,
      status: "pending",
      createdAt: new Date().toISOString(),
      lead: { name, email, phone },
    });
  } catch (err) {
    console.error("[payphone/init] error guardando lead:", (err as Error).message);
  }

  return NextResponse.json({ clientTransactionId, phone, email });
}
