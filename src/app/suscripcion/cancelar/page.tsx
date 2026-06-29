'use client';

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { WHATSAPP_URL } from "@/lib/contact";

type State = "idle" | "loading" | "done" | "already" | "error";

function CancelInner() {
  const params = useSearchParams();
  const id = params.get("id") || "";
  const token = params.get("t") || "";
  const valid = !!id && !!token;

  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function doCancel() {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/subscriptions/self-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        alreadyCanceled?: boolean;
        error?: string;
      };
      if (res.ok && data.success) {
        setState(data.alreadyCanceled ? "already" : "done");
      } else {
        setState("error");
        setError(data.error || "No pudimos cancelar la suscripción.");
      }
    } catch {
      setState("error");
      setError("No pudimos contactar el servidor. Intenta de nuevo en unos segundos.");
    }
  }

  if (!valid) {
    return (
      <Card>
        <Icon kind="error" />
        <Title>Enlace incompleto</Title>
        <Text>
          Este enlace de cancelación no es válido. Usa el enlace que te mostramos al
          contratar, o escríbenos por WhatsApp y lo hacemos por ti.
        </Text>
        <Actions>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full justify-center">
              <ArrowLeft className="h-4 w-4" /> Inicio
            </Button>
          </Link>
          <Support />
        </Actions>
      </Card>
    );
  }

  if (state === "done" || state === "already") {
    return (
      <Card>
        <Icon kind="ok" />
        <Title>{state === "already" ? "Tu suscripción ya estaba cancelada" : "Suscripción cancelada"}</Title>
        <Text>
          No se realizarán más cobros. Si fue un error o quieres reactivarla, escríbenos
          por WhatsApp y te ayudamos.
        </Text>
        <Actions>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full justify-center">
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Button>
          </Link>
          <Support />
        </Actions>
      </Card>
    );
  }

  return (
    <Card>
      <Icon kind={state === "error" ? "error" : "shield"} />
      <Title>Cancelar renovación automática</Title>
      <Text>
        Al cancelar, no se volverá a cobrar tu plan. Podrás seguir usándolo hasta el
        final del periodo ya pagado. Esta acción se puede revertir escribiéndonos.
      </Text>
      {state === "error" && (
        <div className="mb-4 rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={doCancel}
          disabled={state === "loading"}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-btn border border-red-500/40 bg-red-500/10 px-5 py-3 font-semibold text-red-300 transition-[background-color,transform] duration-200 ease-out-expo hover:bg-red-500/15 active:scale-[0.98] disabled:opacity-60"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Cancelando…
            </>
          ) : (
            "Sí, cancelar mi suscripción"
          )}
        </button>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full justify-center">
            No, mantenerla
          </Button>
        </Link>
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

function Icon({ kind }: { kind: "ok" | "error" | "shield" }) {
  if (kind === "ok") {
    return (
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#14B875]/15">
        <CheckCircle2 className="h-10 w-10 text-[#14B875]" />
      </div>
    );
  }
  if (kind === "error") {
    return (
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
        <AlertCircle className="h-9 w-9 text-red-400" />
      </div>
    );
  }
  return (
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#14B875]/15">
      <ShieldCheck className="h-9 w-9 text-[#14B875]" />
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-2 text-center font-sora text-2xl font-bold text-white">{children}</h1>;
}

function Text({ children }: { children: React.ReactNode }) {
  return <p className="mb-6 text-center leading-relaxed text-[#B7D1D2]">{children}</p>;
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row">{children}</div>;
}

function Support() {
  return (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
      <Button variant="whatsapp" className="w-full justify-center">
        <MessageCircle className="h-4 w-4" /> Soporte
      </Button>
    </a>
  );
}

export default function CancelSubscriptionPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-16"
      style={{ background: "linear-gradient(180deg, #071A1F 0%, #0D252C 100%)" }}
    >
      <Suspense fallback={null}>
        <CancelInner />
      </Suspense>
    </main>
  );
}
