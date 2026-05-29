'use client';

import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import {
  Check,
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import PayphoneBox from "@/components/payphone/PayphoneBox";
import { fadeInUp, VIEWPORT_DEFAULT } from "@/lib/animations";

interface LeadForm {
  name: string;
  email: string;
  phone: string;
}

const INITIAL: LeadForm = { name: "", email: "", phone: "" };

const PLAN_FEATURES = [
  "Historia clínica oftalmológica ilimitada",
  "Agenda, recordatorios y pacientes",
  "Refracciones, pedidos a laboratorio e inventario",
  "Facturación electrónica lista para Ecuador",
  "Multisucursal y multiusuario con permisos",
  "Soporte por WhatsApp en menos de 24 h",
];

type Stage = "form" | "loading" | "pay" | "error";

interface InitResult {
  clientTransactionId: string;
  phone: string;
  email: string;
}

export default function Pricing() {
  const [form, setForm] = useState<LeadForm>(INITIAL);
  const [stage, setStage] = useState<Stage>("form");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [initData, setInitData] = useState<InitResult | null>(null);

  function update<K extends keyof LeadForm>(key: K, value: LeadForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setStage("loading");
    try {
      const res = await fetch("/api/payphone/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as Partial<InitResult> & { error?: string };
      if (!res.ok || !data.clientTransactionId || !data.phone || !data.email) {
        throw new Error(data.error || "No pudimos iniciar el pago.");
      }
      setInitData({
        clientTransactionId: data.clientTransactionId,
        phone: data.phone,
        email: data.email,
      });
      setStage("pay");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStage("error");
    }
  }

  function reset() {
    setStage("form");
    setErrorMsg("");
    setInitData(null);
  }

  return (
    <section
      id="planes"
      className="relative py-24 sm:py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #071A1F 0%, #0B1F25 100%)" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14B875]/35 to-transparent"
      />
      <div
        aria-hidden
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full bg-[#14B875]/6 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block text-sm font-semibold tracking-widest uppercase text-[#14B875] mb-4">
            Planes
          </span>
          <h2
            className="font-sora font-bold text-white mb-4"
            style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
          >
            Un solo plan. <span className="text-aurora">Todo incluido.</span>
          </h2>
          <p className="font-inter text-[#B7D1D2] text-lg leading-relaxed">
            Sin permanencias, sin sorpresas. Activas tu óptica hoy y empiezas a operar
            con Dioptrika en menos de 24 horas.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="relative mx-auto max-w-5xl rounded-[24px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(13,37,44,0.95) 0%, rgba(11,29,34,0.95) 100%)",
            border: "1px solid #1D4650",
            boxShadow:
              "0 40px 100px -24px rgba(0,0,0,0.65), 0 0 0 1px rgba(20,184,117,0.08) inset",
          }}
        >
          <CheckoutHeader stage={stage} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-0">
            <OrderSummary />

            <div className="p-7 sm:p-9 bg-[#071A1F]/40 border-t lg:border-t-0 lg:border-l border-[#1D4650]">
              {stage === "form" && (
                <FormStage form={form} update={update} onSubmit={handleSubmit} />
              )}

              {stage === "loading" && (
                <div className="flex flex-col items-center justify-center text-center py-20">
                  <Loader2 className="w-10 h-10 text-[#14B875] animate-spin mb-4" />
                  <p className="font-inter text-[#B7D1D2]">Preparando tu pago seguro…</p>
                </div>
              )}

              {stage === "pay" && initData && (
                <PayStage
                  clientTransactionId={initData.clientTransactionId}
                  email={initData.email}
                  phone={initData.phone}
                  onError={(msg) => {
                    setErrorMsg(msg);
                    setStage("error");
                  }}
                  onBack={reset}
                />
              )}

              {stage === "error" && <ErrorStage message={errorMsg} onRetry={reset} />}
            </div>
          </div>

          <CheckoutFooter />
        </motion.div>
      </div>
    </section>
  );
}

function CheckoutHeader({ stage }: { stage: Stage }) {
  const steps = [
    { id: "form", label: "Tus datos" },
    { id: "pay", label: "Pago" },
    { id: "done", label: "Confirmación" },
  ];
  const activeIndex =
    stage === "form" ? 0 : stage === "loading" || stage === "pay" ? 1 : stage === "error" ? 1 : 2;

  return (
    <div className="px-7 sm:px-9 py-5 border-b border-[#1D4650] flex items-center justify-between gap-4 bg-[#0B1D22]/60">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14B875] to-[#087A5A] flex items-center justify-center shadow-[0_4px_16px_rgba(20,184,117,0.4)]">
          <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="font-sora font-semibold text-white text-sm">Checkout seguro</div>
          <div className="font-inter text-[11px] text-[#B7D1D2]/55">Cifrado SSL · Payphone EC</div>
        </div>
      </div>

      <ol className="hidden sm:flex items-center gap-2 text-xs">
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-mono text-[10px] font-bold transition-colors ${
                  done
                    ? "bg-[#14B875] text-[#071A1F]"
                    : current
                      ? "bg-[#14B875]/15 text-[#14B875] ring-1 ring-[#14B875]/50"
                      : "bg-[#1D4650]/50 text-[#B7D1D2]/50"
                }`}
              >
                {done ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`font-inter font-medium ${
                  current ? "text-white" : done ? "text-[#B7D1D2]" : "text-[#B7D1D2]/45"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <span className="w-6 h-px bg-[#1D4650]" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function OrderSummary() {
  return (
    <div className="p-7 sm:p-9">
      <div className="text-[11px] font-inter font-semibold uppercase tracking-[0.18em] text-[#B7D1D2]/55 mb-4">
        Resumen de tu orden
      </div>

      <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#1D4650]">
        <div className="flex-1 min-w-0">
          <div className="font-sora font-semibold text-white text-base mb-0.5">
            Dioptrika — Plan Único
          </div>
          <div className="font-inter text-sm text-[#B7D1D2]/70">
            Suscripción mensual · cancelas cuando quieras
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-sora font-bold text-white text-lg">$30.00</div>
          <div className="font-inter text-[11px] text-[#B7D1D2]/55">/ mes</div>
        </div>
      </div>

      <ul className="space-y-2.5 py-5">
        {PLAN_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span className="mt-1 w-4 h-4 shrink-0 rounded-full bg-[#14B875]/15 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-[#14B875]" strokeWidth={3.5} />
            </span>
            <span className="font-inter text-[13px] text-[#DCEBE7] leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-2 pt-5 border-t border-[#1D4650] space-y-2">
        <LineItem label="Subtotal" value="$26.09" muted />
        <LineItem label="IVA (15%)" value="$3.91" muted />
        <div className="pt-3 mt-1 border-t border-dashed border-[#1D4650]">
          <div className="flex items-baseline justify-between">
            <span className="font-sora font-semibold text-white text-base">Total a pagar</span>
            <div className="text-right">
              <span className="font-sora font-bold text-white text-2xl">$30.00</span>
              <span className="font-inter text-[11px] text-[#B7D1D2]/55 ml-1.5">USD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#14B875]/8 border border-[#14B875]/20">
        <Lock className="w-3.5 h-3.5 text-[#14B875] shrink-0" strokeWidth={2} />
        <span className="font-inter text-[12px] text-[#DCEBE7] leading-tight">
          Tus datos de tarjeta nunca pasan por nuestros servidores.
        </span>
      </div>
    </div>
  );
}

function LineItem({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={`font-inter text-sm ${muted ? "text-[#B7D1D2]/60" : "text-[#DCEBE7]"}`}
      >
        {label}
      </span>
      <span
        className={`font-inter text-sm font-mono ${
          muted ? "text-[#B7D1D2]/70" : "text-white font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function CheckoutFooter() {
  return (
    <div className="px-7 sm:px-9 py-4 border-t border-[#1D4650] bg-[#0B1D22]/40 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 font-inter text-[11px] text-[#B7D1D2]/55">
        <Lock className="w-3 h-3" strokeWidth={2} /> Pago procesado por{" "}
        <span className="font-semibold text-[#B7D1D2]/80">Payphone Ecuador</span>
      </div>
      <div className="flex items-center gap-3 opacity-80">
        <CardBadge label="VISA" />
        <CardBadge label="Mastercard" />
        <CardBadge label="Diners" />
        <CardBadge label="Discover" />
      </div>
    </div>
  );
}

function CardBadge({ label }: { label: string }) {
  return (
    <span className="font-sora text-[10px] font-bold uppercase tracking-wider text-[#B7D1D2]/70 px-2 py-1 rounded border border-[#1D4650] bg-[#0B1D22]/80">
      {label}
    </span>
  );
}

function FormStage({
  form,
  update,
  onSubmit,
}: {
  form: LeadForm;
  update: <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <h3 className="font-sora font-semibold text-white text-lg mb-1">
        Información del titular
      </h3>
      <p className="font-inter text-[#B7D1D2]/65 text-sm mb-6">
        Usaremos estos datos para enviarte el comprobante y tus credenciales.
      </p>

      <div className="space-y-4">
        <Field
          label="Nombre completo"
          type="text"
          placeholder="Juan Pérez"
          value={form.name}
          onChange={(v) => update("name", v)}
          required
          autoComplete="name"
        />
        <Field
          label="Correo electrónico"
          type="email"
          placeholder="tucorreo@email.com"
          value={form.email}
          onChange={(v) => update("email", v)}
          required
          autoComplete="email"
        />
        <PhoneField
          value={form.phone}
          onChange={(v) => update("phone", v)}
        />

        <div className="pt-3">
          <Button size="lg" className="w-full justify-center">
            <Lock className="w-4 h-4" strokeWidth={2.2} />
            Continuar al pago seguro
          </Button>
          <p className="font-inter text-[11px] text-[#B7D1D2]/50 text-center mt-3 leading-relaxed">
            Al continuar aceptas que Payphone procese tu pago de forma segura.
            <br />
            No guardamos información de tu tarjeta.
          </p>
        </div>
      </div>
    </form>
  );
}

function PayStage({
  clientTransactionId,
  email,
  phone,
  onError,
  onBack,
}: {
  clientTransactionId: string;
  email: string;
  phone: string;
  onError: (m: string) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 font-inter text-sm text-[#B7D1D2]/70 hover:text-white transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver a editar mis datos
      </button>

      <h3 className="font-sora font-semibold text-white text-lg mb-1">
        Método de pago
      </h3>
      <p className="font-inter text-[#B7D1D2]/65 text-sm mb-5">
        Completa los datos de tu tarjeta en la pasarela cifrada de Payphone.
      </p>

      <div className="rounded-xl border border-[#1D4650] bg-[#0B1D22]/60 p-4 sm:p-5 mb-4">
        <PayphoneBox
          clientTransactionId={clientTransactionId}
          email={email}
          phone={phone}
          onError={onError}
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-1">
        <span className="inline-flex items-center gap-1.5 font-inter text-[11px] text-[#B7D1D2]/55">
          <Lock className="w-3 h-3" /> Conexión cifrada extremo a extremo
        </span>
        <span className="font-mono text-[10px] text-[#B7D1D2]/45">
          Ref: {clientTransactionId.slice(4, 22)}
        </span>
      </div>
    </div>
  );
}

function ErrorStage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mb-4 ring-1 ring-red-500/30">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="font-sora font-semibold text-white text-lg mb-2">
        No pudimos continuar
      </h3>
      <p className="font-inter text-sm text-[#B7D1D2] mb-6 max-w-sm leading-relaxed">
        {message ||
          "Hubo un problema procesando tu solicitud. Inténtalo de nuevo en unos segundos."}
      </p>
      <Button onClick={onRetry} variant="outline">
        Reintentar
      </Button>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block font-inter text-[12px] font-semibold uppercase tracking-wider text-[#B7D1D2]/75 mb-2">
        {label}
        {required && <span className="text-[#14B875]"> *</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 rounded-lg border border-[#1D4650] bg-[#071A1F]/80 font-inter text-[15px] text-[#F8FBFA] placeholder:text-[#B7D1D2]/30 focus:outline-none focus:ring-2 focus:ring-[#14B875]/40 focus:border-[#14B875] transition-all"
      />
    </label>
  );
}

function PhoneField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  function handleChange(raw: string) {
    const cleaned = raw.replace(/[^\d]/g, "").slice(0, 10);
    onChange(cleaned);
  }

  const hint = (() => {
    if (!value) return "Ingresa tu celular (10 dígitos, ej. 0962766008)";
    const digits = value.replace(/\D/g, "");
    let local = digits;
    if (local.startsWith("593")) local = local.slice(3);
    if (local.startsWith("0")) local = local.slice(1);
    if (/^9\d{8}$/.test(local)) return `Se enviará como +593${local}`;
    return "Debe ser un celular ecuatoriano válido (empieza con 09)";
  })();

  const digits = value.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("593")) local = local.slice(3);
  if (local.startsWith("0")) local = local.slice(1);
  const valid = /^9\d{8}$/.test(local);

  return (
    <label className="block">
      <span className="block font-inter text-[12px] font-semibold uppercase tracking-wider text-[#B7D1D2]/75 mb-2">
        Celular <span className="text-[#14B875]">*</span>
      </span>
      <div className="relative flex items-stretch rounded-lg border border-[#1D4650] bg-[#071A1F]/80 focus-within:ring-2 focus-within:ring-[#14B875]/40 focus-within:border-[#14B875] transition-all overflow-hidden">
        <span className="inline-flex items-center px-3 bg-[#0D252C] border-r border-[#1D4650] font-mono text-sm text-[#B7D1D2] select-none">
          🇪🇨 +593
        </span>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="962766008"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          required
          autoComplete="tel-national"
          className="flex-1 px-4 py-3 bg-transparent font-inter text-[15px] text-[#F8FBFA] placeholder:text-[#B7D1D2]/30 focus:outline-none"
        />
      </div>
      <span
        className={`block font-inter text-[11px] mt-1.5 ${
          valid ? "text-[#14B875]" : "text-[#B7D1D2]/55"
        }`}
      >
        {hint}
      </span>
    </label>
  );
}

// Reserved for future trust badges
export type { LucideIcon };
