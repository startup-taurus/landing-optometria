'use client';

import { Suspense, useEffect, useState } from "react";
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
}

type Status = "loading" | "approved" | "failed";

function PaymentResult() {
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [result, setResult] = useState<ConfirmResult | null>(null);

  useEffect(() => {
    const id = params.get("id");
    const clientTransactionId =
      params.get("clientTransactionId") || params.get("clientTxId");

    if (!id || !clientTransactionId) {
      setStatus("failed");
      setResult({ success: false, error: "Parámetros incompletos en la respuesta de Payphone." });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payphone/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(id), clientTransactionId }),
        });
        const data = (await res.json()) as ConfirmResult;
        if (cancelled) return;
        setResult(data);
        setStatus(data.success ? "approved" : "failed");
      } catch {
        if (cancelled) return;
        setStatus("failed");
        setResult({ success: false, error: "No pudimos contactar el servidor de verificación." });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (status === "loading") {
    return (
      <Card>
        <Loader2 className="w-12 h-12 text-[#14B875] animate-spin mx-auto mb-5" />
        <h1 className="font-sora text-2xl font-bold text-white text-center mb-2">
          Verificando tu pago…
        </h1>
        <p className="font-inter text-[#B7D1D2] text-sm text-center">
          Estamos validando la transacción con Payphone. No cierres esta ventana.
        </p>
      </Card>
    );
  }

  if (status === "approved") {
    const p = result?.payment;
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
          <Row label="Referencia" value={result?.reference || "—"} mono />
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
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="whatsapp" className="w-full justify-center">
              <MessageCircle className="w-4 h-4" /> Soporte
            </Button>
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-400" />
      </div>
      <h1 className="font-sora text-2xl font-bold text-white text-center mb-2">
        No pudimos confirmar el pago
      </h1>
      <p className="font-inter text-[#B7D1D2] text-center mb-6">
        {result?.error ||
          "La transacción no fue aprobada o expiró. Si crees que es un error, contáctanos por WhatsApp."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/#planes" className="flex-1">
          <Button className="w-full justify-center">Reintentar pago</Button>
        </Link>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
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

export default function PayphoneResponsePage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-5 py-16"
      style={{ background: "linear-gradient(180deg, #071A1F 0%, #0D252C 100%)" }}
    >
      <Suspense fallback={null}>
        <PaymentResult />
      </Suspense>
    </main>
  );
}
