'use client';

import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, MessageCircle, Send, CheckCircle2, ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { fadeInLeft, fadeInRight, VIEWPORT_DEFAULT } from "@/lib/animations";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
  buildLeadMessage,
  whatsappUrl,
} from "@/lib/contact";

interface FormState {
  name: string;
  clinic: string;
  email: string;
  phone: string;
  message: string;
}

const INITIAL: FormState = { name: "", clinic: "", email: "", phone: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [sent, setSent] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const composed = buildLeadMessage({
      name: form.name,
      clinic: form.clinic || undefined,
      email: form.email,
      phone: form.phone || undefined,
      message: form.message || undefined,
    });
    if (typeof window !== "undefined") {
      window.open(whatsappUrl(composed), "_blank", "noopener");
    }
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm(INITIAL);
    }, 3500);
  }

  return (
    <section id="contacto" className="relative overflow-hidden bg-canvas py-24 sm:py-28">
      <div aria-hidden className="rule-soft absolute inset-x-0 top-0" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_DEFAULT}
          >
            <span className="kicker">Contacto</span>
            <h2
              className="mt-4 font-display font-bold text-ink"
              style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)" }}
            >
              ¿Listo para gestionar tu óptica con{" "}
              <span className="text-brand-ink">claridad</span>?
            </h2>
            <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-muted">
              Cuéntanos sobre tu óptica y te respondemos por WhatsApp con una propuesta a tu
              medida. Sin compromisos, sin permanencias.
            </p>

            <div className="mt-8">
              <ContactRow
                icon={MessageCircle}
                channel="WhatsApp"
                value={WHATSAPP_DISPLAY}
                supportText="Respuesta en menos de 24 horas"
                href={WHATSAPP_URL}
                external
              />
              <ContactRow
                icon={Mail}
                channel="Email"
                value={CONTACT_EMAIL}
                supportText="Te respondemos en 1 día hábil"
                href={CONTACT_EMAIL_HREF}
              />
              <ContactRow
                icon={MapPin}
                channel="Ubicación"
                value="Atendemos en toda Latinoamérica"
                supportText="Cobertura remota desde Ecuador"
              />
            </div>
          </motion.div>

          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_DEFAULT}
            transition={{ delay: 0.1 }}
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-card border border-line bg-surface p-7 shadow-float sm:p-8"
            >
              <h3 className="font-display text-xl font-semibold text-ink">Solicitar información</h3>
              <p className="mt-1 text-sm text-muted">
                Te respondemos por WhatsApp en menos de 24 h.
              </p>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={(v) => update("name", v)}
                    required
                  />
                  <Field
                    label="Óptica"
                    type="text"
                    placeholder="Nombre del negocio"
                    value={form.clinic}
                    onChange={(v) => update("clinic", v)}
                  />
                </div>
                <Field
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                  required
                />
                <Field
                  label="Teléfono"
                  type="tel"
                  placeholder="+593 99 000 0000"
                  value={form.phone}
                  onChange={(v) => update("phone", v)}
                />
                <FieldArea
                  label="Mensaje"
                  placeholder="Cuéntanos sobre tu óptica…"
                  value={form.message}
                  onChange={(v) => update("message", v)}
                />

                <Button size="lg" className="w-full justify-center" disabled={sent}>
                  {sent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Abriendo WhatsApp…
                    </>
                  ) : (
                    <>
                      Enviar por WhatsApp
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  channel,
  value,
  supportText,
  href,
  external,
}: {
  icon: typeof MessageCircle;
  channel: string;
  value: string;
  supportText: string;
  href?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <Icon
        className="h-4 w-4 shrink-0 text-muted transition-colors duration-300 group-hover:text-brand-ink"
        strokeWidth={1.6}
      />
      <div className="flex min-w-0 flex-1 items-baseline gap-3">
        <span className="data shrink-0 text-[11px] uppercase tracking-wide text-muted">
          {channel}
        </span>
        <span
          aria-hidden
          className="hidden h-px flex-1 self-center bg-line transition-colors duration-300 group-hover:bg-brand/50 sm:block"
        />
        <span className="truncate font-display text-[15px] font-semibold text-ink sm:text-base">
          {value}
        </span>
      </div>
      {href && (
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-ink"
          strokeWidth={1.6}
        />
      )}
    </>
  );

  const rowClasses =
    "group relative flex items-center gap-4 border-b border-line py-4 transition-colors last:border-b-0";

  const supportNode = <p className="ml-7 mt-1 text-xs text-muted">{supportText}</p>;

  if (href) {
    return (
      <div>
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={rowClasses}
        >
          {inner}
        </a>
        {supportNode}
      </div>
    );
  }
  return (
    <div>
      <div className={rowClasses}>{inner}</div>
      {supportNode}
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
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">
        {label}
        {required && <span className="text-brand-ink"> *</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-btn border border-line bg-surface-2/60 px-4 py-3 text-sm text-ink placeholder:text-muted/70 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-focus/35"
      />
    </label>
  );
}

function FieldArea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>
      <textarea
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-btn border border-line bg-surface-2/60 px-4 py-3 text-sm text-ink placeholder:text-muted/70 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-focus/35"
      />
    </label>
  );
}
