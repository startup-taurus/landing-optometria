import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Token de cancelación self-service (sin login, pero SEGURO).
//
// Es un HMAC-SHA256 del id de la suscripción con el secreto del servidor
// (PAYPHONE_HMAC_SECRET). Solo el servidor puede generarlo; el cliente lo recibe
// en su enlace de "gestionar suscripción". Con el token correcto para SU id puede
// cancelar SU suscripción — pero NO puede adivinar ni forjar el de otra persona
// (no conoce el secreto). No caduca: cancelar es una acción benigna del titular.
// ─────────────────────────────────────────────────────────────────────────────
function getSecret(): string {
  const secret = process.env.PAYPHONE_HMAC_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("PAYPHONE_HMAC_SECRET no configurado");
  }
  return secret;
}

export function signCancelToken(subscriptionId: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`cancel:${subscriptionId}`)
    .digest("hex");
}

export function verifyCancelToken(subscriptionId: string, token: string): boolean {
  if (typeof subscriptionId !== "string" || typeof token !== "string") return false;
  if (!subscriptionId || !/^[0-9a-f]{64}$/i.test(token)) return false;
  let expected: string;
  try {
    expected = signCancelToken(subscriptionId);
  } catch {
    return false;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
