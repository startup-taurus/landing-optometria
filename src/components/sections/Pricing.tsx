'use client';

import { motion } from "framer-motion";
import { useCallback, useState, type FormEvent } from "react";
import {
  Check,
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import PayphoneBox from "@/components/payphone/PayphoneBox";
import { PhoneCountryField } from "@/components/payphone/PhoneCountryField";
import { fadeInUp, VIEWPORT_DEFAULT } from "@/lib/animations";
import { TOKENIZATION_ENABLED, RECURRING_CONSENT_TEXT } from "@/lib/consent";
import {
  DEFAULT_COUNTRY,
  countryByIso,
  isValidPhone,
  isValidDocumentId,
} from "@/lib/countries";
import {
  PLAN_BASE_CENTS,
  PLAN_TAX_CENTS,
  PLAN_TOTAL_CENTS,
  TAX_RATE_PCT,
} from "@/lib/payphone-constants";

interface LeadForm {
  name: string;
  opticaName: string;
  email: string;
  phone: string;
  countryIso: string;
  documentId: string;
  consent: boolean;
}

const INITIAL: LeadForm = {
  name: "",
  opticaName: "",
  email: "",
  phone: "",
  countryIso: DEFAULT_COUNTRY.iso,
  documentId: "",
  consent: true, // pre-marcado: la renovación automática viene activada por defecto
};

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
  reference?: string;
  amount: number;
  amountWithTax: number;
  amountWithoutTax: number;
  tax: number;
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Pricing() {
  const [form, setForm] = useState<LeadForm>(INITIAL);
  const [stage, setStage] = useState<Stage>("form");
  // Envío en curso: el botón muestra el spinner y el formulario sigue visible (no
  // saltamos a un stage aparte) para que el feedback ocurra SOBRE el botón.
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [initData, setInitData] = useState<InitResult | null>(null);

  function update<K extends keyof LeadForm>(key: K, value: LeadForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  // Validez del formulario para bloquear el botón: MISMAS reglas que valida el
  // servidor en /init (nombre, email, teléfono, cédula/RUC y consentimiento). Evita
  // llegar a la Cajita con datos que el pago rechazaría, y que un teléfono malo
  // quede guardado y luego reviente el cobro recurrente.
  const trimmedName = form.name.trim();
  const trimmedOptica = form.opticaName.trim();
  const formValid =
    trimmedName.length >= 2 &&
    trimmedName.length <= 80 &&
    (!trimmedOptica ||
      (trimmedOptica.length >= 3 && trimmedOptica.length <= 100)) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    isValidPhone(form.phone, form.countryIso) &&
    (!TOKENIZATION_ENABLED ||
      (isValidDocumentId(form.documentId) && form.consent));

  // Llama a /init y devuelve los datos del intento (o lanza con el mensaje de error).
  const callInit = useCallback(async (payload: LeadForm): Promise<InitResult> => {
    const dial = countryByIso(payload.countryIso)?.dial ?? DEFAULT_COUNTRY.dial;
    const res = await fetch("/api/payphone/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        opticaName: payload.opticaName,
        email: payload.email,
        phone: payload.phone,
        countryCode: dial,
        documentId: payload.documentId,
        consent: payload.consent,
        planId: "unico",
      }),
    });
    const data = (await res.json()) as Partial<InitResult> & { error?: string };
    if (
      !res.ok ||
      !data.clientTransactionId ||
      !data.phone ||
      !data.email ||
      typeof data.amount !== "number"
    ) {
      throw new Error(data.error || "No pudimos iniciar el pago.");
    }
    return data as InitResult;
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    if (TOKENIZATION_ENABLED && !form.consent) {
      setErrorMsg("Debes autorizar la renovación automática para continuar.");
      return;
    }
    setSubmitting(true);
    try {
      setInitData(await callInit(form));
      setStage("pay");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  // La Cajita avisó "id duplicado": pedimos un clientTransactionId NUEVO y
  // remontamos la Cajita con él (mismos datos del titular).
  const refreshInit = useCallback(async () => {
    try {
      setInitData(await callInit(form));
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStage("error");
    }
  }, [callInit, form]);

  function reset() {
    setStage("form");
    setErrorMsg("");
    setInitData(null);
  }

  return (
    <section id="planes" className="relative overflow-hidden bg-canvas py-20 sm:py-28">
      <div aria-hidden className="rule-soft absolute inset-x-0 top-0" />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-6 2xl:max-w-[1560px]">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-14"
        >
          <span className="kicker">Planes</span>
          <h2
            className="mt-4 text-balance font-display font-bold text-ink"
            style={{ fontSize: "clamp(1.75rem, 3.6vw, 2.75rem)" }}
          >
            Un solo plan. <span className="text-brand-ink">Todo incluido.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[1.0625rem] leading-relaxed text-muted">
            Sin permanencias, sin sorpresas. Activas tu óptica hoy y empiezas a operar con
            Dioptrika en menos de 24 horas.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-line bg-surface shadow-float 2xl:max-w-[1380px]"
        >
          <CheckoutHeader stage={stage} />

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_1.15fr]">
            <OrderSummary />

            <div className="border-t border-line bg-surface-2/40 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-9">
              {stage === "form" && (
                <FormStage
                  form={form}
                  update={update}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  valid={formValid}
                />
              )}

              {stage === "loading" && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="mb-4 h-10 w-10 animate-spin text-brand-ink" />
                  <p className="text-muted">Preparando tu pago seguro…</p>
                </div>
              )}

              {stage === "pay" && initData && (
                <PayStage
                  initData={initData}
                  documentId={form.documentId}
                  onError={(msg) => {
                    setErrorMsg(msg);
                    setStage("error");
                  }}
                  onDuplicate={refreshInit}
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
    <div className="flex items-center justify-between gap-4 border-b border-line bg-surface-2/60 px-5 py-4 sm:px-9 sm:py-5">
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
    <div className="p-5 sm:p-7 lg:p-9">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        Resumen de tu orden
      </div>

      <div className="border-b border-line pb-5">
        <div className="mb-0.5 font-display text-base font-semibold text-ink">
          Dioptrika — Plan Único
        </div>
        <div className="text-sm text-muted">Suscripción mensual · cancelas cuando quieras</div>
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

      <div className="mt-2 border-t border-line pt-5">
        <div className="flex items-baseline justify-between py-1">
          <span className="text-sm text-ink-2">Plan mensual</span>
          <span className="data text-sm font-semibold text-ink">{money(PLAN_BASE_CENTS)}</span>
        </div>
        <div className="flex items-baseline justify-between py-1">
          <span className="text-sm text-ink-2">IVA ({TAX_RATE_PCT}%)</span>
          <span className="data text-sm font-semibold text-ink">+ {money(PLAN_TAX_CENTS)}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-line pt-2.5">
          <span className="font-display text-base font-semibold text-ink">Total al mes</span>
          <div className="text-right">
            <span className="data text-2xl font-bold text-ink">{money(PLAN_TOTAL_CENTS)}</span>
            <span className="ml-1.5 text-[11px] text-muted">USD</span>
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

function CheckoutFooter() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-5 py-4 sm:px-9">
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <Lock className="h-3 w-3" strokeWidth={2} /> Pago procesado por{" "}
        <span className="font-semibold text-ink-2">Payphone Ecuador</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
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
  submitting,
  valid,
}: {
  form: LeadForm;
  update: <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  valid: boolean;
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
          label="Nombre de tu óptica"
          type="text"
          placeholder="Óptica Visión Clara"
          value={form.opticaName}
          onChange={(v) => update("opticaName", v)}
          required
          autoComplete="organization"
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
        <PhoneCountryField
          countryIso={form.countryIso}
          onCountry={(v) => update("countryIso", v)}
          value={form.phone}
          onChange={(v) => update("phone", v)}
        />

        {TOKENIZATION_ENABLED && (
          <>
            <DocumentIdField value={form.documentId} onChange={(v) => update("documentId", v)} />
            <ConsentCheckbox checked={form.consent} onChange={(v) => update("consent", v)} />
          </>
        )}

        <div className="pt-3">
          <Button
            size="lg"
            loading={submitting}
            disabled={!valid}
            className="w-full justify-center"
          >
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

function PriceBreakdown({ initData }: { initData: InitResult }) {
  return (
    <div className="mb-4 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between py-1">
        <span className="text-sm text-ink-2">Plan mensual</span>
        <span className="data text-sm font-semibold text-ink">{money(initData.amountWithTax)}</span>
      </div>
      <div className="flex items-baseline justify-between py-1">
        <span className="text-sm text-ink-2">IVA ({TAX_RATE_PCT}%)</span>
        <span className="data text-sm font-semibold text-ink">+ {money(initData.tax)}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-line pt-2.5">
        <span className="font-display text-base font-semibold text-ink">Total a pagar</span>
        <div className="text-right">
          <span className="data text-xl font-bold text-ink">{money(initData.amount)}</span>
          <span className="ml-1 text-[11px] text-muted">USD</span>
        </div>
      </div>
    </div>
  );
}

function PayStage({
  initData,
  documentId,
  onError,
  onDuplicate,
  onBack,
}: {
  initData: InitResult;
  documentId: string;
  onError: (m: string) => void;
  onDuplicate: () => void;
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

      {/* El IVA y el total se muestran AQUÍ, en el paso de pago. */}
      <PriceBreakdown initData={initData} />

      {TOKENIZATION_ENABLED && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand/25 bg-brand/[0.06] px-3 py-2.5">
          <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-ink" strokeWidth={2} />
          <span className="text-[12px] leading-snug text-ink-2">
            Tu plan se renovará automáticamente cada mes. Podrás cancelarlo cuando quieras
            desde el enlace que te enviaremos.
          </span>
        </div>
      )}

      <div className="mb-4">
        <PayphoneBox
          clientTransactionId={initData.clientTransactionId}
          email={initData.email}
          phone={initData.phone}
          documentId={documentId || undefined}
          amount={initData.amount}
          amountWithTax={initData.amountWithTax}
          amountWithoutTax={initData.amountWithoutTax}
          tax={initData.tax}
          reference={initData.reference}
          onError={onError}
          onDuplicate={onDuplicate}
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <Lock className="h-3 w-3" /> Conexión cifrada extremo a extremo
        </span>
        <span className="data text-[10px] text-muted">
          Ref: {initData.clientTransactionId.slice(4, 22)}
        </span>
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
        className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-[16px] text-ink placeholder:text-muted/60 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-focus/35 sm:text-[15px]"
      />
    </label>
  );
}

function DocumentIdField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.replace(/\D/g, "");
  const valid = /^\d{10}$/.test(digits) || /^\d{13}$/.test(digits);
  const hint = !value
    ? "Cédula (10 dígitos) o RUC (13 dígitos)"
    : valid
      ? "Documento válido"
      : "Debe tener 10 (cédula) o 13 (RUC) dígitos";
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-muted">
        Cédula o RUC <span className="text-brand-ink">*</span>
      </span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="0102030405"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 13))}
        required
        autoComplete="off"
        className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-[16px] text-ink placeholder:text-muted/60 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-focus/35 sm:text-[15px]"
      />
      <span className={`mt-1.5 block text-[11px] ${valid ? "text-brand-ink" : "text-muted"}`}>
        {hint}
      </span>
    </label>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--brand))]"
      />
      <span className="text-[12px] leading-snug text-ink-2">{RECURRING_CONSENT_TEXT}</span>
    </label>
  );
}

// Reserved for future trust badges
export type { LucideIcon };
