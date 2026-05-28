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

const INITIAL: FormState = {
  name: "",
  clinic: "",
  email: "",
  phone: "",
  message: "",
};

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
    <section
      id="contacto"
      className="relative py-24 sm:py-28 overflow-hidden bg-[#0D252C]"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14B875]/35 to-transparent"
      />
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-[#14B875]/8 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-[#087A5A]/8 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_DEFAULT}
          >
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-[#14B875] mb-4">
              Contacto
            </span>
            <h2
              className="font-sora font-bold text-white mb-5"
              style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
            >
              ¿Listo para gestionar tu óptica con{" "}
              <span className="text-aurora">claridad</span>?
            </h2>
            <p className="font-inter text-[#B7D1D2] text-lg leading-relaxed mb-8">
              Cuéntanos sobre tu óptica y te respondemos por WhatsApp con una
              propuesta a tu medida. Sin compromisos, sin permanencias.
            </p>

            <div className="relative">
              <ContactRow
                icon={MessageCircle}
                channel="WhatsApp"
                value={WHATSAPP_DISPLAY}
                supportText="Respuesta en menos de 24 horas"
                href={WHATSAPP_URL}
                accent="#25D366"
                external
              />
              <ContactRow
                icon={Mail}
                channel="Email"
                value={CONTACT_EMAIL}
                supportText="Te respondemos en 1 día hábil"
                href={CONTACT_EMAIL_HREF}
                accent="#14B875"
              />
              <ContactRow
                icon={MapPin}
                channel="Ubicación"
                value="Atendemos en toda Latinoamérica"
                supportText="Cobertura remota desde Ecuador"
                accent="#5FD4A0"
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
              className="relative rounded-card p-7 sm:p-8 border-aurora"
              style={{
                background: "rgba(7, 26, 31, 0.7)",
                backdropFilter: "blur(24px) saturate(160%)",
                WebkitBackdropFilter: "blur(24px) saturate(160%)",
                boxShadow: "0 24px 80px -16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <h3 className="font-sora font-semibold text-white text-xl mb-1">
                Solicitar información
              </h3>
              <p className="font-inter text-[#B7D1D2]/70 text-sm mb-6">
                Te respondemos por WhatsApp en menos de 24h
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Cuéntanos sobre tu óptica..."
                  value={form.message}
                  onChange={(v) => update("message", v)}
                />

                <Button size="lg" className="w-full justify-center" disabled={sent}>
                  {sent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Abriendo WhatsApp...
                    </>
                  ) : (
                    <>
                      Enviar por WhatsApp
                      <Send className="w-4 h-4" />
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
      <span className="block font-inter text-sm font-medium text-[#B7D1D2] mb-1.5">
        {label}{required && <span className="text-[#14B875]"> *</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 rounded-btn border border-[#1D4650] bg-[#0D252C]/80 font-inter text-sm text-[#F8FBFA] placeholder:text-[#B7D1D2]/35 focus:outline-none focus:ring-2 focus:ring-[#14B875]/35 focus:border-[#14B875] transition-all"
      />
    </label>
  );
}

function ContactRow({
  icon: Icon,
  channel,
  value,
  supportText,
  href,
  accent,
  external,
}: {
  icon: typeof MessageCircle;
  channel: string;
  value: string;
  supportText: string;
  href?: string;
  accent: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <Icon
        className="w-4 h-4 shrink-0 text-[#B7D1D2]/55 transition-colors duration-300 group-hover:[color:var(--accent)]"
        strokeWidth={1.5}
      />
      <div className="flex-1 min-w-0 flex items-baseline gap-3">
        <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-[#B7D1D2]/50 shrink-0">
          {channel}
        </span>
        <span
          aria-hidden
          className="hidden sm:block flex-1 h-px self-center bg-[length:6px_1px] bg-repeat-x bg-[linear-gradient(to_right,#1D4650_50%,transparent_50%)] transition-all duration-300 group-hover:bg-[linear-gradient(to_right,var(--accent),var(--accent))]"
        />
        <span className="font-sora font-semibold text-white text-[15px] sm:text-base truncate">
          {value}
        </span>
      </div>
      {href && (
        <ArrowUpRight
          className="w-4 h-4 shrink-0 text-[#B7D1D2]/40 transition-all duration-300 group-hover:[color:var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.5}
        />
      )}
    </>
  );

  const rowClasses =
    "group relative flex items-center gap-4 py-4 border-b border-[#1D4650] last:border-b-0 transition-colors";
  const styleVar = { ["--accent" as string]: accent } as React.CSSProperties;

  const supportNode = (
    <p className="font-inter text-xs text-[#B7D1D2]/45 mt-1 ml-7">
      {supportText}
    </p>
  );

  if (href) {
    return (
      <div style={styleVar}>
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
    <div style={styleVar}>
      <div className={rowClasses}>{inner}</div>
      {supportNode}
    </div>
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
      <span className="block font-inter text-sm font-medium text-[#B7D1D2] mb-1.5">
        {label}
      </span>
      <textarea
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-btn border border-[#1D4650] bg-[#0D252C]/80 font-inter text-sm text-[#F8FBFA] placeholder:text-[#B7D1D2]/35 focus:outline-none focus:ring-2 focus:ring-[#14B875]/35 focus:border-[#14B875] transition-all resize-none"
      />
    </label>
  );
}
