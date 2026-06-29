import { NextResponse } from "next/server";
import {
  generateClientTransactionId,
  normalizePhone,
  getPlanTotalCents,
  getPlanLabel,
  computeAmounts,
  TEST_ONLY_PLANS,
  type Billing,
  type LeadInput,
} from "@/lib/payphone";
import { saveTransaction } from "@/lib/transactions";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { RECURRING_CONSENT_TEXT } from "@/lib/consent";

// Cobro recurrente (tokenización). Cuando está activo, exigimos cédula/RUC y
// consentimiento explícito en el alta.
const TOKENIZATION_ENABLED = process.env.NEXT_PUBLIC_TOKENIZATION_ENABLED === "true";
const TEST_MODE = process.env.PAYPHONE_TEST_MODE === "true";

// Cédula (10 dígitos) o RUC (13 dígitos).
function isValidDocumentId(s: string): boolean {
  return /^\d{10}$/.test(s) || /^\d{13}$/.test(s);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  // Guard: permite apagar pagos sin tocar código. Si la variable no está, los
  // pagos siguen ACTIVOS (comportamiento histórico de dioptrika); solo se apagan
  // poniéndola explícitamente en "false".
  if (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "false") {
    return NextResponse.json({ error: "Pagos próximamente" }, { status: 503 });
  }

  const limit = rateLimit(`init:${clientIp(req)}`, { capacity: 5, refillPerSec: 0.2 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento e intenta de nuevo." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: Partial<LeadInput> & {
    planId?: string;
    billing?: string;
    documentId?: string;
    consent?: boolean;
    countryCode?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim().toLowerCase();
  const phoneRaw = (body.phone || "").toString().trim();
  // Código de país del selector (solo dígitos). Default Ecuador (593).
  const dialCode = (body.countryCode || "593").toString().replace(/\D/g, "") || "593";
  const phone = normalizePhone(phoneRaw, dialCode);
  // Plan por defecto: el único público de dioptrika ("unico"). La ruta /prueba
  // envía planId="test" explícitamente.
  const planId = (body.planId || "unico").toString().trim();
  const billing: Billing = body.billing === "annual" ? "annual" : "monthly";
  const documentId = (body.documentId || "").toString().replace(/\D/g, "");
  const consent = body.consent === true;

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }
  if (!isEmail(email) || email.length > 120) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Teléfono inválido. Revisa el número y el país seleccionado (en Ecuador: celular de 10 dígitos, ej. 0994312472)." },
      { status: 400 }
    );
  }

  // Los planes de prueba (ej. $1) solo se permiten en modo prueba.
  if (TEST_ONLY_PLANS.has(planId) && !TEST_MODE) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  // Con cobro recurrente activo: exigimos cédula/RUC y consentimiento explícito.
  if (TOKENIZATION_ENABLED) {
    if (!isValidDocumentId(documentId)) {
      return NextResponse.json(
        { error: "Cédula o RUC inválido (10 o 13 dígitos)." },
        { status: 400 }
      );
    }
    if (!consent) {
      return NextResponse.json(
        { error: "Debes autorizar la renovación automática para continuar." },
        { status: 400 }
      );
    }
  }

  // Monto del plan: la fuente de verdad vive en el servidor (no se confía en el cliente).
  const totalCents = getPlanTotalCents(planId, billing);
  if (totalCents === null || totalCents <= 0) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }
  const amounts = computeAmounts(totalCents);
  const planLabel = getPlanLabel(planId, billing);

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
      planId,
      billing,
      planLabel,
      amount: amounts.amount,
      // Tokenización: se persisten para usarlos al crear la suscripción en /confirm.
      ...(TOKENIZATION_ENABLED
        ? {
            documentId,
            consentAt: new Date().toISOString(),
            consentText: RECURRING_CONSENT_TEXT,
          }
        : {}),
    });
  } catch (err) {
    console.error("[payphone/init] error guardando lead:", (err as Error).message);
    // La fila `pending` es OBLIGATORIA: de ella sale el monto a validar en /confirm
    // y donde se guarda el token. Si no se pudo guardar, NO dejamos pagar: abortamos
    // para que la Cajita no se monte (evita "cobrado sin registro").
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Inténtalo de nuevo en unos segundos." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    clientTransactionId,
    phone,
    email,
    reference: planLabel,
    amount: amounts.amount,
    amountWithTax: amounts.amountWithTax,
    amountWithoutTax: amounts.amountWithoutTax,
    tax: amounts.tax,
  });
}
