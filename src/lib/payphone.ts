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

// Reglas de Payphone (centavos USD):
//   amount = amountWithTax + amountWithoutTax + tax + service + tip
//   tax SOLO aplica sobre amountWithTax.
//   IVA Ecuador desde abril 2024 = 15%.
// Para Plan Único $30 (todo gravado con IVA 15%):
//   amountWithTax = 2609 (base imponible)
//   tax           =  391 (15% de 2609)
//   amountWithoutTax = 0
//   total         = 3000
export const PLAN_AMOUNT_TOTAL = 3000;
export const PLAN_AMOUNT_WITH_TAX = 2609;
export const PLAN_AMOUNT_WITHOUT_TAX = 0;
export const PLAN_TAX = 391;
export const PLAN_CURRENCY = "USD";
export const PLAN_LABEL = "Dioptrika — Plan Único mensual";

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
  payphoneTransactionId?: number;
  authorizationCode?: string;
  cardBrand?: string;
  lastDigits?: string;
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

  if ((status < 200 || status >= 300) && !parsed) {
    throw new Error(`Payphone respondió ${status}`);
  }

  return parsed ?? {};
}

export function isApproved(r: PayphoneConfirmResponse): boolean {
  return r.statusCode === 3 && r.transactionStatus === "Approved";
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
