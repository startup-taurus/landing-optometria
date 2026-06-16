import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle2, XCircle, ArrowLeft, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { WHATSAPP_URL } from "@/lib/contact";
import { confirmPayment, type ConfirmOutcome } from "@/lib/confirm-payment";
import { rateLimit } from "@/lib/rate-limit";

// Confirmamos del lado servidor (usa el módulo `https` y el almacén en disco) y la
// página depende de los query params del redirect → debe ser dinámica y en Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function ipFromHeaders(): string {
  const h = headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim() || "unknown";
  return h.get("x-real-ip")?.trim() || "unknown";
}

// ---------------------------------------------------------------------------
// IMPORTANTE: la confirmación ocurre AQUÍ, durante el render del lado servidor que
// dispara el redirect de Payphone. A diferencia del flujo anterior (un fetch desde
// el navegador en un useEffect), una vez que el request llega al servidor, Node
// ejecuta confirmPayment hasta el final aunque el usuario cierre la pestaña. Eso
// elimina la dependencia de que el navegador siga abierto y cierra la ventana de
// reversión automática a los 5 min de Payphone.
// ---------------------------------------------------------------------------
export default async function PayphoneResponsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const id = first(searchParams.id);
  const clientTransactionId =
    first(searchParams.clientTransactionId) || first(searchParams.clientTxId);

  let outcome: ConfirmOutcome;

  if (!id || !clientTransactionId) {
    outcome = {
      success: false,
      error: "Parámetros incompletos en la respuesta de Payphone.",
      httpStatus: 400,
    };
  } else {
    // Defensa en profundidad: límite generoso por IP (no afecta a un usuario real;
    // el verdadero gate es el HMAC del clientTransactionId + la idempotencia).
    const limit = rateLimit(`response:${ipFromHeaders()}`, {
      capacity: 20,
      refillPerSec: 1,
    });
    if (!limit.ok) {
      outcome = {
        success: false,
        error: "Demasiados intentos. Espera un momento e intenta de nuevo.",
        httpStatus: 429,
      };
    } else {
      try {
        outcome = await confirmPayment({ id, clientTransactionId });
      } catch (err) {
        console.error("[payphone/response] error confirmando:", (err as Error).message);
        outcome = {
          success: false,
          error: "No pudimos verificar el pago. Si el cargo aparece, contáctanos.",
          httpStatus: 500,
        };
      }
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5 py-16"
      style={{ background: "linear-gradient(180deg, #071A1F 0%, #0D252C 100%)" }}
    >
      {outcome.success ? (
        <ApprovedCard outcome={outcome} />
      ) : (
        <FailedCard message={outcome.error} />
      )}
    </main>
  );
}

function ApprovedCard({ outcome }: { outcome: ConfirmOutcome }) {
  const p = outcome.payment;
  return (
    <Card>
      <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-[#14B875]/15 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-[#14B875]" />
      </div>
      <h1 className="font-sora text-2xl font-bold text-white text-center mb-2">
        ¡Pago recibido!
      </h1>
      <p className="font-inter text-[#B7D1D2] text-center mb-6">
        Gracias por confiar en Dioptrika. En las próximas 24 horas hábiles te
        enviaremos tus credenciales y los pasos de acceso al correo registrado.
      </p>

      <div className="rounded-card border border-[#1D4650] bg-[#0B1D22]/70 p-5 mb-6 space-y-2">
        <Row label="Referencia" value={outcome.reference || "—"} mono />
        {p?.authorizationCode && <Row label="Autorización" value={p.authorizationCode} mono />}
        {p?.cardBrand && p?.lastDigits && (
          <Row label="Tarjeta" value={`${p.cardBrand} ···· ${p.lastDigits}`} />
        )}
        {typeof p?.amount === "number" && (
          <Row label="Monto" value={`$${(p.amount / 100).toFixed(2)} USD`} />
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full justify-center">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Button>
        </Link>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="whatsapp" className="w-full justify-center">
            <MessageCircle className="w-4 h-4" /> Soporte
          </Button>
        </a>
      </div>
    </Card>
  );
}

function FailedCard({ message }: { message?: string }) {
  return (
    <Card>
      <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-400" />
      </div>
      <h1 className="font-sora text-2xl font-bold text-white text-center mb-2">
        No pudimos confirmar el pago
      </h1>
      <p className="font-inter text-[#B7D1D2] text-center mb-6">
        {message ||
          "La transacción no fue aprobada o expiró. Si crees que es un error, contáctanos por WhatsApp."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/#planes" className="flex-1">
          <Button className="w-full justify-center">Reintentar pago</Button>
        </Link>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full justify-center">
            <MessageCircle className="w-4 h-4" /> Contactar soporte
          </Button>
        </a>
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full max-w-lg rounded-card border border-[#1D4650] p-7 sm:p-9"
      style={{
        background: "rgba(13, 37, 44, 0.85)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        boxShadow: "0 24px 80px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-inter text-xs uppercase tracking-[0.18em] text-[#B7D1D2]/55">
        {label}
      </span>
      <span
        className={`text-white text-sm font-semibold ${mono ? "font-mono" : "font-inter"} text-right break-all`}
      >
        {value}
      </span>
    </div>
  );
}
