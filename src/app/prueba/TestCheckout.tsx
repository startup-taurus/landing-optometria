'use client';

import { useCallback, useState, type FormEvent } from "react";
import { Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import PayphoneBox from "@/components/payphone/PayphoneBox";
import { PhoneCountryField } from "@/components/payphone/PhoneCountryField";
import { TOKENIZATION_ENABLED, RECURRING_CONSENT_TEXT } from "@/lib/consent";
import { DEFAULT_COUNTRY, countryByIso } from "@/lib/countries";

// Checkout autónomo del plan de PRUEBA ($1 + IVA = $1.15). Reutiliza el mismo flujo
// seguro de la landing (form → /init planId="test" → Cajita Payphone → response).
// NO está enlazado en el sitio: vive solo aquí para validar el cobro recurrente.

interface Form {
  name: string;
  email: string;
  phone: string;
  countryIso: string;
  documentId: string;
  consent: boolean;
}

const INITIAL: Form = {
  name: "",
  email: "",
  phone: "",
  countryIso: DEFAULT_COUNTRY.iso,
  documentId: "",
  consent: true, // pre-marcado: la renovación automática viene activada por defecto
};

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

type Stage = "form" | "loading" | "pay" | "error";

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function TestCheckout() {
  const [form, setForm] = useState<Form>(INITIAL);
  const [stage, setStage] = useState<Stage>("form");
  // Envío en curso → spinner en el botón (el formulario sigue visible).
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [initData, setInitData] = useState<InitResult | null>(null);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  const callInit = useCallback(async (payload: Form): Promise<InitResult> => {
    const dial = countryByIso(payload.countryIso)?.dial ?? DEFAULT_COUNTRY.dial;
    const res = await fetch("/api/payphone/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        countryCode: dial,
        documentId: payload.documentId,
        consent: payload.consent,
        planId: "test",
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
      throw new Error(data.error || "No pudimos iniciar el pago de prueba.");
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
    <main className="min-h-screen bg-canvas py-[clamp(2.5rem,8vw,6rem)]">
      <div className="mx-auto w-full max-w-lg px-5">
        <p className="mx-auto mb-6 max-w-prose text-center text-[13px] text-muted">
          Página interna de prueba del cobro recurrente ($1 + IVA = $1.15). No está enlazada en el sitio.
        </p>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-float">
          <div className="flex items-center justify-between gap-4 border-b border-line bg-surface-2/60 px-5 py-4 sm:px-7">
            <div className="font-display text-sm font-semibold text-ink">Checkout de prueba</div>
            <div className="data text-right">
              <span className="text-lg font-bold text-ink">$1.00</span>
              <span className="ml-1 text-[11px] text-muted">+ IVA</span>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {stage === "form" && (
              <form onSubmit={handleSubmit}>
                <h3 className="mb-1 font-display text-lg font-semibold text-ink">
                  Datos del titular (prueba)
                </h3>
                <p className="mb-6 text-sm text-muted">
                  Plan de prueba de $1 (+ IVA) para validar el cobro recurrente tokenizado.
                </p>
                <div className="space-y-4">
                  <Field label="Nombre completo" type="text" placeholder="Jordan Reyes" value={form.name} onChange={(v) => update("name", v)} required autoComplete="name" />
                  <Field label="Correo electrónico" type="email" placeholder="tucorreo@email.com" value={form.email} onChange={(v) => update("email", v)} required autoComplete="email" />
                  <PhoneCountryField
                    countryIso={form.countryIso}
                    onCountry={(v) => update("countryIso", v)}
                    value={form.phone}
                    onChange={(v) => update("phone", v)}
                  />
                  {TOKENIZATION_ENABLED && (
                    <>
                      <Field label="Cédula o RUC" type="text" placeholder="0102030405" value={form.documentId} onChange={(v) => update("documentId", v.replace(/\D/g, "").slice(0, 13))} required autoComplete="off" />
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3">
                        <input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} required className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--brand))]" />
                        <span className="text-[12px] leading-snug text-ink-2">{RECURRING_CONSENT_TEXT}</span>
                      </label>
                    </>
                  )}
                  <div className="pt-3">
                    <Button size="lg" loading={submitting} className="w-full justify-center">
                      <Lock className="h-4 w-4" strokeWidth={2.2} /> Continuar al pago de prueba
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {stage === "loading" && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-brand-ink" />
                <p className="text-muted">Preparando tu pago de prueba…</p>
              </div>
            )}

            {stage === "pay" && initData && (
              <div>
                <button type="button" onClick={reset} className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
                  <ArrowLeft className="h-3.5 w-3.5" /> Volver a editar mis datos
                </button>

                <div className="mb-4 rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-baseline justify-between py-1">
                    <span className="text-sm text-ink-2">Plan Prueba</span>
                    <span className="data text-sm font-semibold text-ink">{money(initData.amountWithTax)}</span>
                  </div>
                  <div className="flex items-baseline justify-between py-1">
                    <span className="text-sm text-ink-2">IVA (15%)</span>
                    <span className="data text-sm font-semibold text-ink">{money(initData.tax)}</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-line pt-2.5">
                    <span className="font-display text-base font-semibold text-ink">Total a pagar</span>
                    <div className="text-right">
                      <span className="data text-xl font-bold text-ink">{money(initData.amount)}</span>
                      <span className="ml-1 text-[11px] text-muted">USD</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <PayphoneBox
                    clientTransactionId={initData.clientTransactionId}
                    email={initData.email}
                    phone={initData.phone}
                    documentId={form.documentId || undefined}
                    amount={initData.amount}
                    amountWithTax={initData.amountWithTax}
                    amountWithoutTax={initData.amountWithoutTax}
                    tax={initData.tax}
                    reference={initData.reference}
                    onError={(msg) => {
                      setErrorMsg(msg);
                      setStage("error");
                    }}
                    onDuplicate={refreshInit}
                  />
                </div>
                <span className="data block text-right text-[10px] text-muted">
                  Ref: {initData.clientTransactionId.slice(4, 22)}
                </span>
              </div>
            )}

            {stage === "error" && (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-500/15 ring-1 ring-red-500/30">
                  <AlertCircle className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-ink">No pudimos continuar</h3>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted">{errorMsg}</p>
                <Button onClick={reset} variant="outline">Reintentar</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
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
        inputMode={type === "tel" ? "numeric" : undefined}
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
