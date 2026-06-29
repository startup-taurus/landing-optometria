import { NextResponse } from "next/server";
import { verifyClientTransactionId } from "@/lib/payphone";
import { getTransaction, saveTransaction } from "@/lib/transactions";
import { seal } from "@/lib/crypto-vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// Punto de retorno SERVER-SIDE de Payphone cuando la tokenización está activa.
// La doc indica que el cardToken llega como `ctoken` en la URL de respuesta.
// Para NO exponerlo en el navegador (historial/JS/referer), Payphone redirige
// AQUÍ (server): guardamos el ctoken cifrado en la transacción y reenviamos al
// navegador a una URL LIMPIA (/payphone/response sin token) que muestra el
// resultado y dispara el /confirm normal.
//
// VERIFY-1 (sandbox): confirmar el nombre exacto del parámetro (`ctoken`) y que
// la Cajita lo devuelva con nuestra configuración.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  const clientTransactionId =
    url.searchParams.get("clientTransactionId") ||
    url.searchParams.get("clientTxId") ||
    "";
  const ctoken =
    url.searchParams.get("ctoken") || url.searchParams.get("cardToken") || "";

  if (ctoken && verifyClientTransactionId(clientTransactionId)) {
    try {
      const stored = await getTransaction(clientTransactionId);
      if (stored) {
        await saveTransaction({ ...stored, cardTokenEnc: seal(ctoken) });
      }
    } catch (err) {
      console.error(
        "[payphone/response] no se pudo guardar el ctoken:",
        (err as Error).message
      );
    }
  }

  // Redirige a la página de resultado SIN el token en la URL. Reconstruye el
  // origen público desde los headers del proxy (nginx) para no caer en un host
  // interno (127.0.0.1) detrás del reverse proxy.
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  const base = `${proto}://${host}`;
  const clean = new URL("/payphone/response", base);
  if (id) clean.searchParams.set("id", id);
  if (clientTransactionId) clean.searchParams.set("clientTransactionId", clientTransactionId);
  return NextResponse.redirect(clean, 303);
}
