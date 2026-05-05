'use client';

import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { fadeInLeft, fadeInRight, VIEWPORT_DEFAULT } from "@/lib/animations";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
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
    const composed = [
      `Hola, soy ${form.name || "—"} de ${form.clinic || "una clínica/óptica"}.`,
      form.email && `Email: ${form.email}`,
      form.phone && `Teléfono: ${form.phone}`,
      form.message && `\n${form.message}`,
    ]
      .filter(Boolean)
      .join("\n");
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
      className="relative py-24 sm:py-28 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 60%, #ECFEFF 100%)" }}
    >
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-sky/15 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-teal/15 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_DEFAULT}
          >
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-sky mb-4">
              Contacto
            </span>
            <h2
              className="font-jakarta font-bold text-navy mb-5"
              style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
            >
              ¿Listo para transformar tu clínica?
            </h2>
            <p className="font-inter text-text-muted text-lg leading-relaxed mb-8">
              Cuéntanos sobre tu clínica u óptica y te respondemos por WhatsApp con
              una propuesta a tu medida. Sin compromisos, sin permanencias.
            </p>

            <div className="space-y-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-card border border-border bg-white/70 backdrop-blur p-4 transition-all hover:border-[#25D366]/50 hover:shadow-[0_18px_40px_-10px_rgba(37,211,102,0.35)] hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}>
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-inter text-xs uppercase tracking-wider text-text-muted">WhatsApp</p>
                  <p className="font-jakarta font-semibold text-navy text-base truncate">
                    {WHATSAPP_DISPLAY}
                  </p>
                </div>
              </a>

              <a
                href={CONTACT_EMAIL_HREF}
                className="group flex items-center gap-4 rounded-card border border-border bg-white/70 backdrop-blur p-4 transition-all hover:border-sky/50 hover:shadow-glow-sky/40 hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky to-sky-deep flex items-center justify-center text-white shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-inter text-xs uppercase tracking-wider text-text-muted">Email</p>
                  <p className="font-jakarta font-semibold text-navy text-base truncate">
                    {CONTACT_EMAIL}
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4 rounded-card border border-border bg-white/70 backdrop-blur p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-navy flex items-center justify-center text-white shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-inter text-xs uppercase tracking-wider text-text-muted">Ubicación</p>
                  <p className="font-jakarta font-semibold text-navy text-base">
                    Atendemos en toda Latinoamérica
                  </p>
                </div>
              </div>
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
              className="relative rounded-card border border-border bg-white shadow-card p-7 sm:p-8 border-aurora"
            >
              <h3 className="font-jakarta font-semibold text-navy text-xl mb-1">
                Solicitar información
              </h3>
              <p className="font-inter text-text-muted text-sm mb-6">
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
                    label="Clínica u óptica"
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
                  placeholder="Cuéntanos sobre tu clínica..."
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
      <span className="block font-inter text-sm font-medium text-text mb-1.5">
        {label}{required && <span className="text-sky"> *</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 rounded-btn border border-border bg-white font-inter text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-sky/30 focus:border-sky transition-all"
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
      <span className="block font-inter text-sm font-medium text-text mb-1.5">
        {label}
      </span>
      <textarea
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-btn border border-border bg-white font-inter text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-sky/30 focus:border-sky transition-all resize-none"
      />
    </label>
  );
}
