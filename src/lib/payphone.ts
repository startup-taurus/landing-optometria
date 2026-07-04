import crypto from "crypto";
import https from "https";

// IMPORTANTE: la API de la Cajita (incluida la Confirmación server-to-server)
// vive en el host `pay.`, NO en `api.`. El host `api.payphonetodoesposible.com`
// está detrás de un Azure Application Gateway que responde 403 (cuerpo vacío) a
// TODO request (verificado empíricamente: raíz, cualquier path, con/sin token).
// Usar `pay.` (mismo host del script de la Cajita) → devuelve 200 con el JSON real.
// Si vuelve a fallar con 502/403, verificar que este host siga siendo el correcto.
export const PAYPHONE_API_BASE = "https://pay.payphonetodoesposible.com";
export const PAYPHONE_CONFIRM_URL = `${PAYPHONE_API_BASE}/api/button/V2/Confirm`;
// Cobro de una tarjeta YA tokenizada (cobro recurrente). Mismo host `pay.` que el
// Confirm (probado), por eso reusamos el módulo `https` nativo.
// Doc: https://docs.payphone.app/tokenizacion
export const PAYPHONE_TOKEN_CHARGE_URL = `${PAYPHONE_API_BASE}/api/transaction/web`;

// ─────────────────────────────────────────────────────────────────────────────
// MONTOS POR PLAN  ·  centavos USD
// -----------------------------------------------------------------------------
// Reglas de Payphone (centavos USD):
//   amount = amountWithTax + amountWithoutTax + tax + service + tip
//   El IVA (tax) aplica sobre amountWithTax. IVA Ecuador (2024+) = 15%.
//
// Cada plan se cobra según el periodo elegido (mensual). Los montos son lo que
// PAGA el cliente, en centavos.
// ─────────────────────────────────────────────────────────────────────────────
// Constantes puras viven en payphone-constants.ts (sin imports de Node) para que
// los componentes cliente puedan importarlas sin arrastrar crypto/https. Aquí se
// re-exportan para el código de servidor que ya las usa desde "@/lib/payphone".
import {
  PLAN_CURRENCY,
  PLAN_LABEL,
  PLAN_REFERENCE,
  TAX_RATE,
  PLAN_TOTAL_CENTS,
} from "./payphone-constants";
export { PLAN_CURRENCY, PLAN_LABEL, PLAN_REFERENCE, TAX_RATE };

// IVA Ecuador 15% (TAX_RATE vive en payphone-constants.ts junto con el precio base;
// aquí solo se consume). Los montos del catálogo son el TOTAL que paga el cliente (IVA
// INCLUIDO). computeAmounts() lo desglosa con PRICES_INCLUDE_TAX=true en lo que pide
// Payphone: amount = amountWithTax(base) + tax. Mantener `true` deja el cálculo
// IDEMPOTENTE (la suscripción guarda el total y el cron lo re-desglosa igual, sin
// re-sumar IVA). El precio del plan ($30) es la BASE; el IVA ($4.50) se suma → $34.50.
export const PRICES_INCLUDE_TAX = true;

export type Billing = "monthly" | "annual";

// Catálogo de planes cobrables — TOTAL en CENTAVOS USD (base + IVA 15%).
//   Plan Único: PLAN_TOTAL_CENTS = base $30.00 + IVA 15% ($4.50) = $34.50 (3450).
// (Dioptrika solo vende el plan mensual; no hay opción anual → `annual` ausente.)
export const PLAN_CATALOG: Record<
  string,
  { label: string; monthly: number; annual?: number }
> = {
  unico: { label: "Plan Único", monthly: PLAN_TOTAL_CENTS },
  // Plan de prueba ($1 + IVA = $1.15). NO es un tier público (vive solo en /prueba).
  // Solo cobrable cuando PAYPHONE_TEST_MODE === "true" (lo valida /api/payphone/init),
  // para validar el cobro recurrente tokenizado en sandbox.
  test: { label: "Plan Prueba", monthly: 115 },
};

/** Planes que solo existen en modo prueba (no se pueden cobrar en producción). */
export const TEST_ONLY_PLANS = new Set(["test"]);

export interface AmountBreakdown {
  amount: number;
  amountWithTax: number;
  amountWithoutTax: number;
  tax: number;
}

export function getPlanTotalCents(planId: string, billing: Billing): number | null {
  const p = PLAN_CATALOG[planId];
  if (!p) return null;
  if (billing === "annual") return p.annual ?? null; // null → ese plan no tiene anual
  return p.monthly;
}

export function getPlanLabel(planId: string, billing: Billing): string {
  const p = PLAN_CATALOG[planId];
  if (!p) return PLAN_LABEL;
  return `Dioptrika — ${p.label} · ${billing === "annual" ? "anual" : "mensual"}`;
}

// Desglosa el total (centavos) en los campos que pide Payphone:
//   amount = amountWithTax + amountWithoutTax + tax
export function computeAmounts(totalCents: number): AmountBreakdown {
  if (TAX_RATE <= 0) {
    return { amount: totalCents, amountWithTax: 0, amountWithoutTax: totalCents, tax: 0 };
  }
  if (PRICES_INCLUDE_TAX) {
    const base = Math.round(totalCents / (1 + TAX_RATE));
    const tax = totalCents - base;
    return { amount: totalCents, amountWithTax: base, amountWithoutTax: 0, tax };
  }
  const tax = Math.round(totalCents * TAX_RATE);
  return { amount: totalCents + tax, amountWithTax: totalCents, amountWithoutTax: 0, tax };
}

export interface LeadInput {
  name: string;
  email: string;
  phone: string;
}

export interface StoredTransaction {
  clientTransactionId: string;
  status: "pending" | "approved" | "failed";
  createdAt: string;
  confirmedAt?: string;
  lead: LeadInput;
  opticaName?: string;
  // Plan/monto esperado (para validar el cobro en la confirmación).
  planId?: string;
  billing?: Billing;
  planLabel?: string;
  amount?: number; // total esperado en centavos
  payphoneTransactionId?: number;
  authorizationCode?: string;
  cardBrand?: string;
  lastDigits?: string;
  // Sello de cuándo se enviaron los correos (evita reenvíos duplicados).
  emailedAt?: string;
  // Tokenización (capturados en /init, usados al crear la suscripción).
  documentId?: string; // cédula/RUC del titular
  consentAt?: string; // ISO; cuándo aceptó el cobro recurrente
  consentText?: string; // texto exacto que aceptó
  consentHash?: string; // sha256 del texto canónico (prueba versionada)
  // cardToken capturado SERVER-SIDE del redirect (ctoken), cifrado en reposo.
  // Lo guarda GET /api/payphone/response y lo consume /confirm al crear la suscripción.
  cardTokenEnc?: string;
}

function getSecret(): string {
  const secret = process.env.PAYPHONE_HMAC_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("PAYPHONE_HMAC_SECRET no configurado");
  }
  return secret;
}

function base36Random(length: number): string {
  const buf = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += (buf[i] % 36).toString(36);
  }
  return out.toUpperCase();
}

export function generateClientTransactionId(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const datePart = `${yyyy}${mm}${dd}`;
  const rand = base36Random(8);
  const base = `DPK-${datePart}-${rand}`;
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(base)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();
  return `${base}-${sig}`;
}

export function verifyClientTransactionId(id: string): boolean {
  if (typeof id !== "string") return false;
  const parts = id.split("-");
  if (parts.length !== 4) return false;
  const [prefix, date, rand, sig] = parts;
  if (prefix !== "DPK") return false;
  if (!/^\d{8}$/.test(date)) return false;
  if (!/^[A-Z0-9]{8}$/.test(rand)) return false;
  if (!/^[A-F0-9]{10}$/.test(sig)) return false;
  const base = `${prefix}-${date}-${rand}`;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(base)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export interface PayphoneConfirmResponse {
  transactionId?: number;
  clientTransactionId?: string;
  statusCode?: number;
  transactionStatus?: string;
  authorizationCode?: string;
  cardBrand?: string;
  lastDigits?: string;
  amount?: number;
  message?: string;
  // Campos relevantes para tokenización (capturados server-side en /confirm).
  // VERIFY-1: confirmar en sandbox si `cardToken` llega aquí o por el redirect.
  cardToken?: string;
  document?: string; // cédula/RUC del titular (lo que ingresó en la Cajita)
  phoneNumber?: string;
  optionalParameter4?: string; // nombre del titular (en pagos con tarjeta)
  bin?: string; // primeros 6 dígitos
  cardType?: string; // "Credit" | "Debit"
  [key: string]: unknown;
}

export async function confirmTransactionWithPayphone(input: {
  id: number;
  clientTransactionId: string;
}): Promise<PayphoneConfirmResponse> {
  const token = process.env.PAYPHONE_TOKEN;
  if (!token) throw new Error("PAYPHONE_TOKEN no configurado en el servidor");

  const payload = JSON.stringify({
    id: input.id,
    clientTxId: input.clientTransactionId,
  });
  const url = new URL(PAYPHONE_CONFIRM_URL);

  // IMPORTANTE: usamos el módulo `https` nativo, NO `fetch`. El servidor de
  // Payphone (ASP.NET/IIS legacy) responde 500 ("Runtime Error") ante los
  // requests del cliente `fetch` de Node (undici), pero acepta sin problema los
  // del módulo `https` (igual que .NET/PowerShell). Verificado empíricamente:
  // mismo host/headers/body → fetch=500, https=200. No cambiar a fetch.
  const { status, body } = await new Promise<{ status: number; body: string }>(
    (resolve, reject) => {
      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname,
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
            Accept: "application/json",
            "User-Agent": "Dioptrika/1.0",
          },
          timeout: 20000,
        },
        (res) => {
          let data = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
        }
      );
      req.on("error", reject);
      req.on("timeout", () => req.destroy(new Error("Timeout confirmando con Payphone")));
      req.write(payload);
      req.end();
    }
  );

  let parsed: PayphoneConfirmResponse | null = null;
  try {
    parsed = JSON.parse(body) as PayphoneConfirmResponse;
  } catch {
    parsed = null;
  }

  // Cualquier estado no-2xx (401/403/429/5xx, o un error con cuerpo JSON como el
  // Error 23) es un fallo de transporte/servidor: lanzamos para que el llamador NO
  // lo marque como `failed` definitivo y la transacción quede elegible para reintento
  // dentro de la ventana de 5 min de Payphone.
  if (status < 200 || status >= 300) {
    const detail = parsed?.message
      ? `: ${parsed.message}`
      : body
        ? `: ${body.slice(0, 200)}`
        : "";
    throw new Error(`Payphone respondió ${status}${detail}`);
  }
  // 2xx pero cuerpo no interpretable: tampoco podemos decidir el resultado → reintentable.
  if (!parsed) {
    throw new Error(`Payphone respondió ${status} con cuerpo no interpretable`);
  }

  return parsed;
}

export function isApproved(r: PayphoneConfirmResponse): boolean {
  return r.statusCode === 3 && r.transactionStatus === "Approved";
}

// ─────────────────────────────────────────────────────────────────────────────
// COBRO RECURRENTE (tarjeta tokenizada)  ·  POST /api/transaction/web
// ─────────────────────────────────────────────────────────────────────────────

export interface PayphoneOrderBillTo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  country?: string; // ISO 3166-1 alpha-2 (ej. "EC")
  [key: string]: unknown;
}

export interface PayphoneOrderLineItem {
  productName: string;
  unitPrice: number; // VERIFY-2: confirmar si es centavos o dólares
  quantity: number;
  totalAmount: number;
  taxAmount?: number;
  productDescription?: string;
}

export interface PayphoneOrder {
  billTo: PayphoneOrderBillTo;
  lineItems: PayphoneOrderLineItem[];
}

export interface TokenChargeInput {
  cardToken: string;
  cardHolder: string; // nombre cifrado AES-256-CBC (ver payphone-crypto.ts)
  documentId: string;
  phoneNumber: string;
  email: string;
  amount: number;
  amountWithTax: number;
  amountWithoutTax: number;
  tax: number;
  clientTransactionId: string;
  reference: string;
  order: PayphoneOrder;
}

export interface PayphoneTokenChargeResponse {
  cardToken?: string; // Payphone puede rotar el token; persistir el nuevo si llega
  authorizationCode?: string;
  messageCode?: number;
  status?: string; // "Approved" | "Canceled"
  statusCode?: number; // 3 = Approved, 2 = Canceled
  transactionId?: number;
  clientTransactionId?: string;
  currencyCode?: string;
  transactionStatus?: string; // por si la respuesta usa este campo (ver VERIFY-4)
  message?: string;
  [key: string]: unknown;
}

function getStoreId(): string {
  const storeId =
    process.env.PAYPHONE_STORE_ID || process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID;
  if (!storeId) throw new Error("STORE_ID no configurado en el servidor");
  return storeId;
}

/**
 * Cobra una tarjeta previamente tokenizada. Espeja `confirmTransactionWithPayphone`:
 * usa el módulo `https` NATIVO (no fetch) contra el host `pay.` probado.
 *
 * VERIFY-2 (bloqueante antes de dinero real): nombres exactos del body, forma del
 * `order` y unidades de `lineItems.unitPrice` deben confirmarse en sandbox.
 */
export async function chargeTokenizedTransaction(
  input: TokenChargeInput
): Promise<PayphoneTokenChargeResponse> {
  const token = process.env.PAYPHONE_TOKEN;
  if (!token) throw new Error("PAYPHONE_TOKEN no configurado en el servidor");
  const storeId = getStoreId();

  const payload = JSON.stringify({
    cardToken: input.cardToken,
    cardHolder: input.cardHolder,
    documentId: input.documentId,
    // Doc oficial: el phoneNumber de NIVEL SUPERIOR va "Código País + número" SIN el
    // símbolo `+` (ej. 593994312472). El `+` solo va en order.billTo.phoneNumber.
    phoneNumber: input.phoneNumber.replace(/^\+/, ""),
    email: input.email,
    amount: input.amount,
    amountWithTax: input.amountWithTax,
    amountWithoutTax: input.amountWithoutTax,
    tax: input.tax,
    service: 0,
    tip: 0,
    currency: PLAN_CURRENCY,
    clientTransactionId: input.clientTransactionId,
    storeId,
    optionalParameter: input.reference,
    order: input.order, // OBLIGATORIO en solicitudes de tokenización
  });
  const url = new URL(PAYPHONE_TOKEN_CHARGE_URL);

  const { status, body } = await new Promise<{ status: number; body: string }>(
    (resolve, reject) => {
      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname,
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
            Accept: "application/json",
            "User-Agent": "Dioptrika/1.0",
          },
          timeout: 30000,
        },
        (res) => {
          let data = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
        }
      );
      req.on("error", reject);
      req.on("timeout", () =>
        req.destroy(new Error("Timeout cobrando con Payphone"))
      );
      req.write(payload);
      req.end();
    }
  );

  let parsed: PayphoneTokenChargeResponse | null = null;
  try {
    parsed = JSON.parse(body) as PayphoneTokenChargeResponse;
  } catch {
    parsed = null;
  }

  // Diagnóstico de fallos (no spamea en éxito): si Payphone rechaza, logueamos el
  // cuerpo crudo, que incluye el array `errors` con el campo exacto que falló.
  if (status < 200 || status >= 300) {
    console.error(`[payphone/charge] Payphone ${status}: ${body.slice(0, 600)}`);
  }

  // Sin JSON parseable y status no-2xx → error TRANSITORIO (el caller NO debe
  // marcar rechazado ni reintentar a ciegas; debe reconciliar — ver VERIFY-7).
  if ((status < 200 || status >= 300) && !parsed) {
    throw new Error(`Payphone respondió ${status}`);
  }

  return parsed ?? {};
}

/**
 * Aprobación del cobro tokenizado. DEFENSIVO: acepta `status` o `transactionStatus`
 * (VERIFY-4: el nombre del campo en /api/transaction/web debe confirmarse en sandbox).
 */
export function isTokenChargeApproved(r: PayphoneTokenChargeResponse): boolean {
  return (
    r.statusCode === 3 &&
    (r.status === "Approved" || r.transactionStatus === "Approved")
  );
}

/** Rechazo CLARO (no transitorio): Payphone respondió Canceled / statusCode 2. */
export function isTokenChargeDeclined(r: PayphoneTokenChargeResponse): boolean {
  return (
    r.statusCode === 2 ||
    r.status === "Canceled" ||
    r.transactionStatus === "Canceled"
  );
}

/**
 * Rechazo por VALIDACIÓN de la solicitud (HTTP 4xx): Payphone devuelve un array
 * `errors` y/o un `errorCode` != 0, SIN resultado de transacción (sin statusCode 2/3).
 * Esto ocurre ANTES de tocar la tarjeta → NO hubo cobro → NO es ambiguo (a diferencia
 * de un timeout de red): es SEGURO reintentar en el siguiente ciclo, sin pausar ni
 * conciliar. En el sandbox de Payphone este rechazo es INTERMITENTE (el MISMO teléfono
 * +593… se aprueba en un cobro y se rechaza con "Número de teléfono inválido" 2 min
 * después — comprobado: una suscripción encadenó 5 cobros OK con el mismo formato),
 * por eso lo tratamos como transitorio-reintentable, no como un fallo de datos.
 */
export function isTokenChargeValidationError(r: PayphoneTokenChargeResponse): boolean {
  const errs = (r as { errors?: unknown }).errors;
  const hasErrors = Array.isArray(errs) && errs.length > 0;
  const code = (r as { errorCode?: unknown }).errorCode;
  const hasErrCode = typeof code === "number" && code !== 0;
  const noTxResult =
    r.statusCode !== 2 &&
    r.statusCode !== 3 &&
    r.status !== "Approved" &&
    r.status !== "Canceled" &&
    r.transactionStatus !== "Approved" &&
    r.transactionStatus !== "Canceled";
  return (hasErrors || hasErrCode) && noTxResult;
}

// Arma un mensaje LEGIBLE a partir de la respuesta de error de Payphone, incluyendo
// el array `errors[].errorDescriptions` (donde viene el detalle real, p.ej.
// "Impossible to decode the data" cuando el `cardHolder` no se puede descifrar con
// la contraseña de codificación). Así el last_error guardado es accionable.
export function describeTokenChargeError(r: PayphoneTokenChargeResponse): string {
  const parts: string[] = [];
  if (r.message) parts.push(String(r.message));
  const errs = Array.isArray((r as { errors?: unknown }).errors)
    ? ((r as { errors: unknown[] }).errors as Array<Record<string, unknown>>)
    : [];
  for (const e of errs) {
    const descs = Array.isArray(e?.errorDescriptions) ? (e.errorDescriptions as unknown[]) : [];
    if (descs.length) parts.push(descs.map(String).join("; "));
    else if (e?.message) parts.push(String(e.message));
  }
  if (typeof r.statusCode === "number") parts.push(`statusCode=${r.statusCode}`);
  return parts.filter(Boolean).join(" — ") || "respuesta desconocida de Payphone";
}

export function normalizeEcuadorPhone(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "");
  if (!digits) return null;
  let local = digits;
  if (local.startsWith("593")) local = local.slice(3);
  if (local.startsWith("0")) local = local.slice(1);
  if (!/^9\d{8}$/.test(local)) return null;
  return `+593${local}`;
}

/**
 * Normaliza un teléfono a E.164 (+<código><número>) según el país elegido.
 * Ecuador (593) mantiene la validación estricta de celular (9XXXXXXXX). Para otros
 * países hace una validación genérica (6–14 dígitos tras quitar ceros iniciales) —
 * suficiente para el dato de contacto del titular (Payphone opera en Ecuador, pero
 * la tarjeta puede ser internacional). Devuelve null si no es válido.
 */
export function normalizePhone(input: string, dialCode: string): string | null {
  const dc = (dialCode || "").replace(/\D/g, "");
  if (!dc) return null;
  if (dc === "593") return normalizeEcuadorPhone(input);
  const digits = (input || "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length < 6 || digits.length > 14) return null;
  return `+${dc}${digits}`;
}

export function sanitizeForClient(r: PayphoneConfirmResponse) {
  return {
    transactionId: r.transactionId,
    clientTransactionId: r.clientTransactionId,
    statusCode: r.statusCode,
    transactionStatus: r.transactionStatus,
    authorizationCode: r.authorizationCode,
    cardBrand: r.cardBrand,
    lastDigits: r.lastDigits,
    amount: r.amount,
    message: r.message,
  };
}
