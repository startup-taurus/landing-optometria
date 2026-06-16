'use client';

import { AnimatePresence, motion } from "framer-motion";
import { Plus, MessageCircle } from "lucide-react";
import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { WHATSAPP_URL } from "@/lib/contact";
import { FAQS as faqs } from "@/lib/faq";

function FAQItem({
  q,
  a,
  open,
  onClick,
}: {
  q: string;
  a: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`rounded-card border bg-surface transition-colors ${
        open ? "border-brand/40 shadow-soft" : "border-line"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-6"
      >
        <span className="font-display text-base font-semibold text-ink sm:text-[17px]">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          aria-hidden
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
            open
              ? "bg-cta text-cta-on"
              : "bg-surface-2 text-muted group-hover:bg-brand/12 group-hover:text-brand-ink"
          }`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.22, delay: 0.04 },
            }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-6 text-[14.5px] leading-relaxed text-muted sm:px-6">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden bg-surface-2 py-24 sm:py-28">
      <div aria-hidden className="rule-soft absolute inset-x-0 top-0" />
      <div className="relative mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center sm:mb-14">
          <Reveal variant="up">
            <h2
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)" }}
            >
              Lo que las ópticas <span className="text-brand-ink">nos preguntan</span>
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <p className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed text-muted">
              Si la tuya no está, escríbenos por WhatsApp y te respondemos directo.
            </p>
          </Reveal>
        </div>

        <Reveal variant="up" delay={0.08}>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FAQItem
                key={f.q}
                q={f.q}
                a={f.a}
                open={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              />
            ))}
          </div>
        </Reveal>

        <Reveal variant="up" delay={0.1}>
          <div className="mt-10 text-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-btn border border-line bg-surface px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-brand/45 hover:text-brand-ink"
            >
              <MessageCircle className="h-4 w-4 text-brand-ink" />
              ¿Tu pregunta no está? Escríbenos por WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
