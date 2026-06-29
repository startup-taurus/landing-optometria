import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Cifrado EN REPOSO de datos sensibles (cardToken, nombre del titular) antes de
// guardarlos en la base. Capa de defensa ADICIONAL sobre los permisos de la BD:
// si alguien lee la tabla, ve ciphertext, no tokens.
//
// AES-256-GCM con IV aleatorio de 12 bytes. Formato del blob:
//     v1:<base64(iv)>:<base64(tag)>:<base64(ciphertext)>
// El prefijo de versión deja la PUERTA ABIERTA a rotar la llave en el futuro,
// pero hoy NO hay rotación implementada: se usa una sola llave activa
// (TOKEN_ENC_KEY). Cambiarla deja ilegibles los blobs `v1` existentes. Para
// rotar de verdad habría que aceptar una lista de llaves por versión.
//
// Llave: TOKEN_ENC_KEY = 32 bytes en base64 (genera con:
//     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
//
// ADVERTENCIA: perder TOKEN_ENC_KEY = perder TODOS los tokens guardados (los
// clientes tendrían que volver a registrar su tarjeta). Respáldala como secreto.
// ─────────────────────────────────────────────────────────────────────────────

const VERSION = "v1";

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENC_KEY;
  if (!raw) throw new Error("TOKEN_ENC_KEY no configurado");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("TOKEN_ENC_KEY debe ser 32 bytes en base64 (AES-256)");
  }
  return key;
}

/** Cifra un texto plano y devuelve el blob `v1:iv:tag:ct`. */
export function seal(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    ct.toString("base64"),
  ].join(":");
}

/** Descifra un blob producido por `seal`. Lanza si el formato/versión no calza. */
export function open(blob: string): string {
  const parts = blob.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Blob cifrado inválido o versión desconocida");
  }
  const [, ivB64, tagB64, ctB64] = parts;
  const key = getKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const pt = Buffer.concat([
    decipher.update(Buffer.from(ctB64, "base64")),
    decipher.final(),
  ]);
  return pt.toString("utf8");
}
