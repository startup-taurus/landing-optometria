// Rate limiter en memoria (token bucket por clave).
//
// Defensa en profundidad para los endpoints de pago. El gate real anti-abuso
// sigue siendo el HMAC del clientTransactionId (ver verifyClientTransactionId).
//
// LIMITACIÓN: el estado vive en el proceso. Funciona en el VPS único actual,
// pero se reinicia/duplica en despliegues multi-instancia o serverless. Para
// escalar, migrar a un store compartido (Redis / Upstash).

interface Bucket {
  tokens: number;
  updated: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000; // backstop anti-crecimiento ilimitado

export interface RateLimitOptions {
  /** Cantidad máxima de tokens (ráfaga permitida). */
  capacity: number;
  /** Tokens que se reponen por segundo. */
  refillPerSec: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Segundos sugeridos antes de reintentar (cuando ok === false). */
  retryAfter: number;
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();

  // Poda perezosa si el mapa crece demasiado (procesos de larga vida).
  if (buckets.size > MAX_BUCKETS) {
    buckets.forEach((b, k) => {
      if (now - b.updated > 60_000) buckets.delete(k);
    });
  }

  const b = buckets.get(key) ?? { tokens: opts.capacity, updated: now };
  const elapsedSec = (now - b.updated) / 1000;
  b.tokens = Math.min(opts.capacity, b.tokens + elapsedSec * opts.refillPerSec);
  b.updated = now;

  if (b.tokens < 1) {
    buckets.set(key, b);
    const retryAfter = Math.ceil((1 - b.tokens) / opts.refillPerSec);
    return { ok: false, retryAfter: Math.max(1, retryAfter) };
  }

  b.tokens -= 1;
  buckets.set(key, b);
  return { ok: true, retryAfter: 0 };
}

/**
 * Extrae la IP del cliente. El sitio está detrás de un proxy inverso (nginx),
 * así que se usa x-forwarded-for. NOTA: x-forwarded-for es falsificable salvo
 * que el proxy lo fije de forma confiable — verificar la config del proxy.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
