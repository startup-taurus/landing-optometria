'use client';

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { WHATSAPP_URL } from "@/lib/contact";

interface ConfirmResult {
  success: boolean;
  reference?: string;
  payment?: {
    transactionId?: number;
    authorizationCode?: string;
    cardBrand?: string;
    lastDigits?: string;
    amount?: number;
  };
  error?: string;
  alreadyConfirmed?: boolean;
  subscriptionId?: string;
  cancelToken?: string;
}

type Status = "loading" | "approved" | "failed";

function PaymentResult() {
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [result, setResult] = useState<ConfirmResult | null>(null);
  // Guard: confirma UNA sola vez por montaje. Sin esto, React StrictMode (dev) y la
  // identidad cambiante de `params` re-disparan el fetch → re-render que remonta el
  // árbol del resultado y "se traga" el primer clic de "Volver al inicio". También
  // evita la doble llamada a /confirm.
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    const id = params.get("id");
    const clientTransactionId =
      params.get("clientTransactionId") || params.get("clientTxId");
    // FALLBACK de tokenización: lo normal es que el `ctoken` (cardToken) lo capture
    // la ruta server /api/payphone/response y NO llegue aquí. Pero si Payphone
    // redirige directo a esta página con el token en la URL, lo recogemos para
    // reenviarlo a /confirm (así SÍ se crea la suscripción) y lo borramos de la
    // URL al instante (que no quede en historial/referer).
    const ctoken = params.get("ctoken") || params.get("cardToken") || undefined;
    if (ctoken && typeof window !== "undefined") {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("ctoken");
      cleanUrl.searchParams.delete("cardToken");
      window.history.replaceState({}, "", cleanUrl.toString());
    }

    if (!id || !clientTransactionId) {
      setStatus("failed");
      setResult({ success: false, error: "Parámetros incompletos en la respuesta de Payphone." });
      return;
    }

    // Timeout duro: si en 30s no hay respuesta, NO dejamos el spinner infinito.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    (async () => {
      try {
        const res = await fetch("/api/payphone/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(id), clientTransactionId, ctoken }),
          signal: controller.signal,
        });
        let data: ConfirmResult;
        try {
          data = (await res.json()) as ConfirmResult;
        } catch {
          data = { success: false, error: "Respuesta inválida del servidor." };
        }
        setResult(data);
        setStatus(data.success ? "approved" : "failed");
      } catch {
        setStatus("failed");
        setResult({
          success: false,
          error:
            "No pudimos confirmar el pago en este momento. Si el cargo se realizó, recibirás la confirmación; escríbenos por WhatsApp si tienes dudas.",
        });
      } finally {
        clearTimeout(timer);
      }
    })();
    // SIN bandera `cancelled` ni cleanup que aborte: el guard `didRun` ya garantiza
    // una sola ejecución, y abortar en el cleanup de StrictMode cancelaría el fetch
    // bueno (esa era la causa del "Verificando tu pago…" infinito).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <Card>
        <Loader2 className="mx-auto mb-5 h-12 w-12 animate-spin text-[#14B875]" />
        <h1 className="mb-2 text-center font-sora text-2xl font-bold text-white">
          Verificando tu pago…
        </h1>
        <p className="text-center text-sm text-[#B7D1D2]">
          Estamos validando la transacción con Payphone. No cierres esta ventana.
        </p>
      </Card>
    );
  }

  if (status === "approved") {
    const p = result?.payment;
    return (
      <Card>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#14B875]/15">
          <CheckCircle2 className="h-10 w-10 text-[#14B875]" />
        </div>
        <h1 className="mb-2 text-center font-sora text-2xl font-bold text-white">
          ¡Pago recibido!
        </h1>
        <p className="mb-6 text-center text-[#B7D1D2]">
          Gracias por confiar en Dioptrika. En las próximas 24 horas hábiles te enviaremos
          tus credenciales y los pasos de acceso al correo registrado.
        </p>

        <div className="mb-6 space-y-2 rounded-card border border-[#1D4650] bg-[#0B1D22]/70 p-5">
          <Row label="Referencia" value={result?.reference || "—"} mono />
          {p?.authorizationCode && <Row label="Autorización" value={p.authorizationCode} mono />}
          {p?.cardBrand && p?.lastDigits && (
            <Row label="Tarjeta" value={`${p.cardBrand} ···· ${p.lastDigits}`} />
          )}
          {typeof p?.amount === "number" && (
            <Row label="Monto" value={`$${(p.amount / 100).toFixed(2)} USD`} />
          )}
        </div>

        {result?.subscriptionId && result?.cancelToken && (
          <div className="mb-6 rounded-card border border-[#14B875]/25 bg-[#14B875]/[0.08] px-4 py-3">
            <p className="text-[12px] leading-snug text-[#B7D1D2]">
              Tu plan se renueva automáticamente.{" "}
              <a
                href={`/suscripcion/cancelar?id=${encodeURIComponent(result.subscriptionId)}&t=${encodeURIComponent(result.cancelToken)}`}
                className="font-semibold text-[#14B875] hover:underline"
              >
                Gestiona o cancela tu suscripción aquí
              </a>{" "}
              cuando quieras. Te recomendamos guardar este enlace.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full justify-center">
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Button>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="whatsapp" className="w-full justify-center">
              <MessageCircle className="h-4 w-4" /> Soporte
            </Button>
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
        <XCircle className="h-10 w-10 text-red-400" />
      </div>
      <h1 className="mb-2 text-center font-sora text-2xl font-bold text-white">
        No pudimos confirmar el pago
      </h1>
      <p className="mb-6 text-center text-[#B7D1D2]">
        {result?.error ||
          "La transacción no fue aprobada o expiró. Si crees que es un error, contáctanos por WhatsApp."}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/#planes" className="flex-1">
          <Button className="w-full justify-center">Reintentar pago</Button>
        </Link>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full justify-center">
            <MessageCircle className="h-4 w-4" /> Contactar soporte
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

export default function PayphoneResponsePage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-16"
      style={{ background: "linear-gradient(180deg, #071A1F 0%, #0D252C 100%)" }}
    >
      <Suspense fallback={null}>
        <PaymentResult />
      </Suspense>
    </main>
  );
}
