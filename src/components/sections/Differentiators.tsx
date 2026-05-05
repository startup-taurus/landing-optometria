'use client';

import { motion } from "framer-motion";
import { Building2, ScanEye, FlaskConical, MessageSquareHeart, type LucideIcon } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { staggerCards, VIEWPORT_DEFAULT } from "@/lib/animations";

interface Differentiator {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  iconColor: string;
}

const differentiators: Differentiator[] = [
  {
    icon: Building2,
    title: "Multi-sucursal real",
    description:
      "Una cuenta para todas tus sucursales. Cada local opera con sus propios datos y puedes transferir stock entre ellos. El administrador alterna sucursales desde el header según los permisos de su rol.",
    accent: "from-sky/30 to-sky/5",
    iconColor: "text-sky",
  },
  {
    icon: ScanEye,
    title: "Historia clínica especializada",
    description:
      "Diseñada por y para optometría: refracción, queratometría, biomicroscopía y fondo de ojo en un flujo natural.",
    accent: "from-teal/30 to-teal/5",
    iconColor: "text-teal",
  },
  {
    icon: FlaskConical,
    title: "Pedidos a laboratorio integrados",
    description:
      "Genera órdenes con especificaciones ópticas, hace seguimiento de estados y notifica al paciente sin salir del sistema.",
    accent: "from-sky/30 to-teal/10",
    iconColor: "text-sky",
  },
  {
    icon: MessageSquareHeart,
    title: "WhatsApp Business nativo",
    description:
      "Recordatorios, confirmaciones y postventa directo desde la ficha del paciente. Sin integraciones de terceros frágiles.",
    accent: "from-teal/30 to-navy/10",
    iconColor: "text-teal",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Differentiators() {
  return (
    <section className="relative bg-bg-slate border-y border-border overflow-hidden py-20 sm:py-28">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-mesh opacity-50 pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal variant="up">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-sky mb-3">
              Por qué LatamSoft
            </span>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <h2
              className="font-jakarta font-bold text-navy"
              style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
            >
              No es un ERP genérico.{" "}
              <span className="text-aurora">Es para ópticas.</span>
            </h2>
          </Reveal>
        </div>

        <motion.div
          variants={staggerCards}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto"
        >
          {differentiators.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={d.title}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 22 } }}
                className="group relative rounded-card border border-border bg-white shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
              >
                <div
                  aria-hidden
                  className={`absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br ${d.accent} blur-2xl pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative p-6 sm:p-8 flex flex-col gap-5 h-full">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-sky/15 to-teal/10 flex items-center justify-center ring-1 ring-sky/15">
                      <Icon className={`w-6 h-6 ${d.iconColor}`} />
                    </div>
                    <p className="font-inter text-xs font-semibold uppercase tracking-widest text-text-muted">
                      Diferenciador {String(i + 1).padStart(2, "0")} / {String(differentiators.length).padStart(2, "0")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-jakarta font-bold text-navy text-xl sm:text-2xl mb-3 leading-tight">
                      {d.title}
                    </h3>
                    <p className="font-inter text-text-muted text-sm sm:text-base leading-relaxed">
                      {d.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
