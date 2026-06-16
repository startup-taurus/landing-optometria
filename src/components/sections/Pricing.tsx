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
    <section id="planes" className="relative overflow-hidden bg-canvas py-24 sm:py-28">
      <div aria-hidden className="rule-soft absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="kicker">Planes</span>
          <h2
            className="mt-4 font-display font-bold text-ink"
            style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)" }}
          >
            Un solo plan. <span className="text-brand-ink">Todo incluido.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
            Sin permanencias, sin sorpresas. Activas tu óptica hoy y empiezas a operar con
            Dioptrika en menos de 24 horas.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[20px] border border-line bg-surface shadow-float"
        >
          <CheckoutHeader stage={stage} />

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_1.15fr]">
            <OrderSummary />

            <div className="border-t border-line bg-surface-2/40 p-7 sm:p-9 lg:border-l lg:border-t-0">
              {stage === "form" && (
                <FormStage form={form} update={update} onSubmit={handleSubmit} />
              )}

              {stage === "loading" && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="mb-4 h-10 w-10 animate-spin text-brand-ink" />
                  <p className="text-muted">Preparando tu pago seguro…</p>
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
    <div className="flex items-center justify-between gap-4 border-b border-line bg-surface-2/60 px-7 py-5 sm:px-9">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-cta text-cta-on">
          <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-semibold text-ink">Checkout seguro</div>
          <div className="text-[11px] text-muted">Cifrado SSL · Payphone EC</div>
        </div>
      </div>

      <ol className="hidden items-center gap-2 text-xs sm:flex">
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={`data inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                  done
                    ? "bg-cta text-cta-on"
                    : current
                      ? "bg-brand/15 text-brand-ink ring-1 ring-brand/50"
                      : "bg-surface-2 text-muted"
                }`}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`font-medium ${
                  current ? "text-ink" : done ? "text-ink-2" : "text-muted"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && <span className="h-px w-6 bg-line" aria-hidden />}
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
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        Resumen de tu orden
      </div>

      <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 font-display text-base font-semibold text-ink">
            Dioptrika — Plan Único
          </div>
          <div className="text-sm text-muted">Suscripción mensual · cancelas cuando quieras</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="data text-lg font-bold text-ink">$30.00</div>
          <div className="text-[11px] text-muted">/ mes</div>
        </div>
      </div>

      {/* Stagger SOLO de la lista (columna izquierda, transform/opacity, sin
          reflow). No toca el iframe de pago de la columna derecha. */}
      <ul className="space-y-2.5 py-5">
        {PLAN_FEATURES.map((f, i) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT_DEFAULT}
            transition={{ duration: 0.45, delay: 0.06 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-2.5"
          >
            <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand/15">
              <Check className="h-2.5 w-2.5 text-brand-ink" strokeWidth={3.5} />
            </span>
            <span className="text-[13px] leading-snug text-ink-2">{f}</span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-2 space-y-2 border-t border-line pt-5">
        <LineItem label="Subtotal" value="$26.09" muted />
        <LineItem label="IVA (15%)" value="$3.91" muted />
        <div className="mt-1 border-t border-dashed border-line pt-3">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-base font-semibold text-ink">Total a pagar</span>
            <div className="text-right">
              <span className="data text-2xl font-bold text-ink">$30.00</span>
              <span className="ml-1.5 text-[11px] text-muted">USD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-brand/25 bg-brand/[0.06] px-3 py-2.5">
        <Lock className="h-3.5 w-3.5 shrink-0 text-brand-ink" strokeWidth={2} />
        <span className="text-[12px] leading-tight text-ink-2">
          Tus datos de tarjeta nunca pasan por nuestros servidores.
        </span>
      </div>
    </div>
  );
}

function LineItem({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={`text-sm ${muted ? "text-muted" : "text-ink-2"}`}>{label}</span>
      <span className={`data text-sm ${muted ? "text-ink-2" : "font-semibold text-ink"}`}>
        {value}
      </span>
    </div>
  );
}

function CheckoutFooter() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-7 py-4 sm:px-9">
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <Lock className="h-3 w-3" strokeWidth={2} /> Pago procesado por{" "}
        <span className="font-semibold text-ink-2">Payphone Ecuador</span>
      </div>
      <div className="flex items-center gap-3">
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
    <span className="rounded border border-line bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
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
      <h3 className="mb-1 font-display text-lg font-semibold text-ink">Información del titular</h3>
      <p className="mb-6 text-sm text-muted">
        Usaremos estos datos para enviarte el comprobante y tus credenciales.
      </p>

      <div className="space-y-4">
        <Field
          label="Nombre completo"
          type="text"
          placeholder="Jordan Reyes"
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
        <PhoneField value={form.phone} onChange={(v) => update("phone", v)} />

        <div className="pt-3">
          <Button size="lg" className="w-full justify-center">
            <Lock className="h-4 w-4" strokeWidth={2.2} />
            Continuar al pago seguro
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
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
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a editar mis datos
      </button>

      <h3 className="mb-1 font-display text-lg font-semibold text-ink">Método de pago</h3>
      <p className="mb-5 text-sm text-muted">
        Completa los datos de tu tarjeta en la pasarela cifrada de Payphone.
      </p>

      <div className="mb-4 rounded-xl border border-line bg-surface-2/50 p-4 sm:p-5">
        <PayphoneBox
          clientTransactionId={clientTransactionId}
          email={email}
          phone={phone}
          onError={onError}
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <Lock className="h-3 w-3" /> Conexión cifrada extremo a extremo
        </span>
        <span className="data text-[10px] text-muted">Ref: {clientTransactionId.slice(4, 22)}</span>
      </div>
    </div>
  );
}

function ErrorStage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-500/15 ring-1 ring-red-500/30">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="mb-2 font-display text-lg font-semibold text-ink">No pudimos continuar</h3>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted">
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
      <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-muted">
        {label}
        {required && <span className="text-brand-ink"> *</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-focus/35"
      />
    </label>
  );
}

function PhoneField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  function handleChange(raw: string) {
    const cleaned = raw.replace(/[^\d]/g, "").slice(0, 10);
    onChange(cleaned);
  }

  const hint = (() => {
    if (!value) return "Ingresa tu celular (10 dígitos, ej. 0994312472)";
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
      <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-muted">
        Celular <span className="text-brand-ink">*</span>
      </span>
      <div className="relative flex items-stretch overflow-hidden rounded-lg border border-line bg-surface transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-focus/35">
        <span className="data inline-flex select-none items-center border-r border-line bg-surface-2 px-3 text-sm text-muted">
          🇪🇨 +593
        </span>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="0994312472"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          required
          autoComplete="tel-national"
          className="flex-1 bg-transparent px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:outline-none"
        />
      </div>
      <span className={`mt-1.5 block text-[11px] ${valid ? "text-brand-ink" : "text-muted"}`}>
        {hint}
      </span>
    </label>
  );
}

// Reserved for future trust badges
export type { LucideIcon };
