'use client';

import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";
import { Building2, ScanEye, FlaskConical, MessageSquareHeart } from "lucide-react";
import { useRef } from "react";
import Reveal from "@/components/ui/Reveal";

const differentiators = [
  {
    icon: Building2,
    title: "Multi-sucursal real",
    description:
      "Una sola cuenta para todas tus tiendas o consultorios. Stock, agenda e historiales sincronizados sin duplicar trabajo.",
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

function StackCard({
  index,
  total,
  progress,
  data,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  data: (typeof differentiators)[number];
}) {
  const start = index / total;
  const end = (index + 1) / total;

  const scale = useTransform(progress, [start, end], [1, 0.92 - index * 0.015]);
  const y = useTransform(progress, [start, end], [0, -30]);
  const opacity = useTransform(progress, [start, end - 0.05], [1, index === total - 1 ? 1 : 0.4]);

  const Icon = data.icon;

  return (
    <motion.div
      style={{
        scale,
        y,
        opacity,
        top: `calc(${10 + index * 1.5}vh + ${index * 24}px)`,
      }}
      className="sticky"
    >
      <div className="relative mx-auto max-w-3xl rounded-card border border-border bg-white shadow-card-hover overflow-hidden">
        <div
          aria-hidden
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br ${data.accent} blur-3xl pointer-events-none`}
        />
        <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-sky/15 to-teal/10 flex items-center justify-center ring-1 ring-sky/15">
            <Icon className={`w-7 h-7 ${data.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-inter text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
              Diferenciador {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
            <h3 className="font-jakarta font-bold text-navy text-2xl sm:text-3xl mb-3 leading-tight">
              {data.title}
            </h3>
            <p className="font-inter text-text-muted text-base sm:text-lg leading-relaxed">
              {data.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Differentiators() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg-slate border-y border-border overflow-hidden"
      style={{ minHeight: `${100 + differentiators.length * 60}vh` }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-mesh opacity-50 pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="pt-20 sm:pt-28 pb-10 text-center max-w-2xl mx-auto">
          <Reveal variant="up">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-sky mb-4">
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
          <Reveal variant="up" delay={0.1}>
            <p className="font-inter text-text-muted text-base sm:text-lg mt-4">
              Cuatro cosas que hacemos distinto. Desplázate para verlas.
            </p>
          </Reveal>
        </div>

        <div className="relative">
          {differentiators.map((d, i) => (
            <div key={d.title} className="mb-6">
              <StackCard
                index={i}
                total={differentiators.length}
                progress={scrollYProgress}
                data={d}
              />
            </div>
          ))}
        </div>

        <div className="h-[40vh]" />
      </div>
    </section>
  );
}
