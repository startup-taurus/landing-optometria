'use client';

import { motion } from "framer-motion";
import {
  Building2,
  ScanEye,
  FlaskConical,
  MessageSquareHeart,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ScrollHighlight from "@/components/ui/ScrollHighlight";
import { VIEWPORT_DEFAULT } from "@/lib/animations";

interface Item {
  icon: LucideIcon;
  title: string;
  teaser: string;
  description: string;
}

const satellites: Item[] = [
  {
    icon: ScanEye,
    title: "Historia clínica especializada",
    teaser: "Diseñada por y para optometría.",
    description:
      "Un flujo pensado para tu día a día clínico, no un formulario genérico adaptado a la fuerza.",
  },
  {
    icon: FlaskConical,
    title: "Pedidos a laboratorio integrados",
    teaser: "Órdenes con especificaciones ópticas y seguimiento.",
    description:
      "Genera pedidos, sigue sus estados y notifica al paciente sin salir del sistema.",
  },
  {
    icon: MessageSquareHeart,
    title: "WhatsApp integrado",
    teaser: "Recordatorios desde la ficha del paciente.",
    description:
      "Confirmaciones y recordatorios automáticos. Conectas tu cuenta en minutos.",
  },
];

export default function Differentiators() {
  return (
    <section id="por-que" className="relative overflow-hidden bg-surface-2 py-24 sm:py-28">
      <div aria-hidden className="rule-soft absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-6xl px-6 2xl:max-w-[1720px]">
        <div className="mb-12 max-w-3xl sm:mb-16">
          <Reveal variant="up">
            <span className="kicker">Por qué Dioptrika</span>
          </Reveal>
          <ScrollHighlight
            as="h2"
            className="mt-4 font-display font-bold"
            style={{ fontSize: "clamp(1.9rem, 3.8vw, 3rem)" }}
            segments={[
              { text: "No es un sistema genérico. " },
              { text: "Está hecho para ópticas.", accent: true },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Diferenciador principal — entra amplio desde la izquierda y queda
              fijo (sin deriva por scroll, coordinado con los satélites). */}
          <motion.div
            initial={{ opacity: 0, x: -56 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT_DEFAULT}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            className="h-full lg:col-span-3"
          >
            <div className="flex h-full flex-col justify-between rounded-card border border-line bg-surface p-8 shadow-soft sm:p-10">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/12 text-brand-ink">
                    <Building2 className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="kicker">Diferenciador principal</span>
                </div>
                <h3
                  className="mb-4 font-display font-bold leading-tight text-ink"
                  style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.25rem)" }}
                >
                  Multi-sucursal real
                </h3>
                <p className="measure text-[15px] leading-relaxed text-muted sm:text-base">
                  Cada sucursal opera con sus propios pacientes, inventario y agenda. El
                  administrador alterna entre locales según el rol y transfiere productos entre
                  sucursales sin duplicar registros ni perder trazabilidad.
                </p>
              </div>

              {/* Diagrama: dos sucursales + transferencia de stock */}
              <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                {[
                  { name: "Sucursal Centro", meta: "1.284 pacientes" },
                  { name: "Sucursal Norte", meta: "742 pacientes" },
                ].map((b, i) => (
                  <div
                    key={b.name}
                    className={`rounded-xl border border-line bg-surface-2 p-3.5 ${i === 1 ? "order-3" : ""}`}
                  >
                    <p className="text-[13px] font-semibold text-ink">{b.name}</p>
                    <p className="data mt-0.5 text-[11px] text-muted">{b.meta}</p>
                  </div>
                ))}
                <div className="order-2 flex flex-col items-center gap-1">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-brand/30 bg-brand/10 text-brand-ink">
                    <ArrowLeftRight className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="data text-[10px] text-muted">stock</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Satélites — entran desde la derecha en cascada y quedan fijos. */}
          <div className="flex h-full flex-col rounded-card border border-line bg-surface px-6 shadow-soft sm:px-7 lg:col-span-2">
            {satellites.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VIEWPORT_DEFAULT}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex flex-1 flex-col justify-center py-6 ${
                    i < satellites.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2.5">
                    <Icon className="h-[18px] w-[18px] shrink-0 text-brand-ink" strokeWidth={1.7} />
                    <h3 className="font-display text-base font-semibold leading-tight text-ink">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-muted">{s.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
