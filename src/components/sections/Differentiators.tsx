'use client';

import { motion } from "framer-motion";
import { Building2, ScanEye, FlaskConical, MessageSquareHeart, type LucideIcon } from "lucide-react";
import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import CursorSpotlight from "@/components/ui/CursorSpotlight";
import { staggerCards, VIEWPORT_DEFAULT } from "@/lib/animations";

interface Differentiator {
  icon: LucideIcon;
  title: string;
  teaser: string;
  description: string;
}

const heroItem: Differentiator = {
  icon: Building2,
  title: "Multi-sucursal real",
  teaser: "Una cuenta para todas tus ópticas, con datos independientes y stock transferible.",
  description:
    "Cada sucursal opera con sus propios pacientes, inventario y agenda. El administrador alterna entre locales según los permisos del rol y puede transferir productos entre sucursales sin duplicar registros ni perder trazabilidad.",
};

const satellites: Differentiator[] = [
  {
    icon: ScanEye,
    title: "Historia clínica especializada",
    teaser: "Diseñada por y para optometría.",
    description:
      "Diagnóstico en un flujo pensado para tu día a día, no un formulario genérico adaptado a la fuerza.",
  },
  {
    icon: FlaskConical,
    title: "Pedidos a laboratorio integrados",
    teaser: "Órdenes con especificaciones ópticas y seguimiento.",
    description:
      "Genera pedidos, hace seguimiento de estados y notifica al paciente sin salir del sistema.",
  },
  {
    icon: MessageSquareHeart,
    title: "WhatsApp integrado",
    teaser: "Recordatorios y mensajes desde la ficha del paciente.",
    description:
      "Confirmaciones y recordatorios automáticos desde el sistema. Conectas tu cuenta en minutos.",
  },
];

const heroVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Differentiators() {
  return (
    <section className="relative bg-[#0D252C] border-y border-[#1D4650] overflow-hidden py-20 sm:py-28">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal variant="up">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-[#14B875] mb-3">
              Por qué Dioptrika
            </span>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <h2
              className="font-sora font-bold text-white"
              style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
            >
              No es un sistema genérico.{" "}
              <span className="text-aurora">Está hecho para ópticas.</span>
            </h2>
          </Reveal>
        </div>

        <motion.div
          variants={staggerCards}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6 max-w-6xl mx-auto"
        >
          <HeroCard item={heroItem} />

          <div className="lg:col-span-2 flex flex-col">
            {satellites.map((d, i) => (
              <SatelliteRow
                key={d.title}
                item={d}
                index={i + 2}
                isLast={i === satellites.length - 1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroCard({ item }: { item: Differentiator }) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={heroVariants}
      className="lg:col-span-3 group relative rounded-card border border-[#1D4650] bg-[#123A43] shadow-card overflow-hidden"
    >
      <CursorSpotlight className="rounded-card" size={500} color="rgba(20,184,117,0.14)">
        <div className="relative p-8 sm:p-10 lg:p-12 min-h-[420px] flex flex-col justify-between">
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -top-2 -left-3 sm:-left-2 font-sora font-black leading-none"
            style={{
              fontSize: "clamp(120px, 18vw, 220px)",
              color: "rgba(20,184,117,0.10)",
              letterSpacing: "-0.04em",
            }}
          >
            <CountUp to={1} pad={2} duration={1.4} />
          </span>

          <svg
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 w-2/3 h-full opacity-70"
            viewBox="0 0 400 500"
            preserveAspectRatio="none"
            fill="none"
          >
            <motion.path
              d="M 400 0 L 60 500"
              stroke="url(#hero-line-grad)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, margin: "-20%" }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="hero-line-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#14B875" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#087A5A" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-[#14B875] animate-ping opacity-60" />
                <span className="relative rounded-full w-2 h-2 bg-[#14B875]" />
              </span>
              <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-[#B7D1D2]/70">
                Diferenciador principal
              </span>
            </div>

            <Icon className="w-5 h-5 text-[#14B875] mb-5" strokeWidth={1.5} />
          </div>

          <div className="relative">
            <h3
              className="font-sora font-bold text-white leading-tight mb-5"
              style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
            >
              {item.title}
            </h3>
            <p className="font-inter text-[#B7D1D2] text-base sm:text-lg leading-relaxed max-w-xl">
              {item.description}
            </p>
          </div>
        </div>
      </CursorSpotlight>
    </motion.div>
  );
}

function SatelliteRow({
  item,
  index,
  isLast,
}: {
  item: Differentiator;
  index: number;
  isLast: boolean;
}) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={rowVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      className={`group relative flex gap-5 sm:gap-6 py-6 sm:py-7 cursor-default outline-none focus-visible:ring-2 focus-visible:ring-[#14B875]/40 rounded-md ${
        !isLast ? "border-b border-[#1D4650]" : ""
      } ${isLast ? "flex-1" : ""}`}
    >
      <span
        aria-hidden
        className="font-sora font-bold leading-none shrink-0 select-none transition-colors duration-300"
        style={{
          fontSize: "clamp(36px, 4vw, 52px)",
          color: hovered ? "#14B875" : "rgba(183,209,210,0.22)",
          letterSpacing: "-0.04em",
        }}
      >
        {String(index).padStart(2, "0")}
      </span>

      <motion.span
        aria-hidden
        animate={{ width: hovered ? 4 : 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className="self-stretch bg-gradient-to-b from-[#14B875] to-[#087A5A] rounded-full"
      />

      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-sora font-semibold text-white text-lg sm:text-xl leading-tight">
            {item.title}
          </h3>
          <Icon className="w-4 h-4 text-[#14B875] shrink-0" strokeWidth={1.5} />
        </div>

        <p className="font-inter text-[#B7D1D2] text-sm leading-relaxed">
          {item.teaser}
        </p>

        <motion.div
          initial={false}
          animate={{
            height: hovered ? "auto" : 0,
            opacity: hovered ? 1 : 0,
            marginTop: hovered ? 10 : 0,
          }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <p className="font-inter text-[#B7D1D2]/85 text-sm leading-relaxed">
            {item.description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
