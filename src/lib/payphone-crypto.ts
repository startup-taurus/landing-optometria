import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Cifrado del NOMBRE DEL TITULAR para la API de Tokenización de Payphone.
//
// La doc oficial (https://docs.payphone.app/tokenizacion) exige que el nombre del
// titular se envíe como `cardHolder` cifrado en "AES 256 CBC sin vector de
// inicialización", usando el "coding password" de Payphone Developer.
//
// ⚠️  VERIFY-3 (BLOQUEANTE antes de cobrar dinero real): el esquema exacto NO está
// documentado al 100%. Hay que confirmar EN SANDBOX contra un valor que Payphone
// acepte:
//   - "sin IV" → asumimos IV de 16 bytes en CERO (lo más común en estas integraciones).
//   - Derivación de la llave de 32 bytes a partir del coding password:
//       · si el password trae 64 hex chars  → Buffer.from(pw, "hex")  (32 bytes)
//       · si trae exactamente 32 chars       → Buffer.from(pw, "utf8") (32 bytes)
//     (otros largos → error explícito; ajustar cuando se conozca el formato real)
//   - Encoding de salida: base64 (a confirmar; podría ser hex).
//   - Padding: PKCS#7 (por defecto en Node createCipheriv).
//
// Esta función es PURA y testeable: antes de usarla en producción hay que fijarla
// contra un vector conocido aceptado por Payphone (ver plan §7 / VERIFY-3).
// ─────────────────────────────────────────────────────────────────────────────

const ZERO_IV = Buffer.alloc(16, 0);

function getKey(): Buffer {
  const pw = process.env.PAYPHONE_CODING_PASSWORD;
  if (!pw) throw new Error("PAYPHONE_CODING_PASSWORD no configurado");
  if (/^[0-9a-fA-F]{64}$/.test(pw)) {
    return Buffer.from(pw, "hex"); // 64 hex → 32 bytes
  }
  const utf8 = Buffer.from(pw, "utf8");
  if (utf8.length === 32) return utf8; // 32 chars ASCII → 32 bytes
  throw new Error(
    "PAYPHONE_CODING_PASSWORD con formato inesperado (se esperaban 32 bytes; revisar VERIFY-3)"
  );
}

/**
 * Devuelve el `cardHolder` cifrado (base64) para enviar a `/api/transaction/web`.
 * Ver VERIFY-3: el esquema debe confirmarse en sandbox antes de confiar en él.
 */
export function encryptCardHolder(name: string): string {
  const key = getKey();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, ZERO_IV);
  const enc = Buffer.concat([cipher.update(name, "utf8"), cipher.final()]);
  return enc.toString("base64");
}
