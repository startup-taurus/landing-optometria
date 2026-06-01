'use client';

import { motion } from "framer-motion";
import {
  Users, FileText, TestTube, Package,
  ShoppingCart, Calendar, MessageCircle, BarChart3,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import MiniBarChart from "@/components/ui/MiniBarChart";
import MockClinicalForm from "@/components/ui/MockClinicalForm";
import { VIEWPORT_DEFAULT } from "@/lib/animations";

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const heroFeature: FeatureItem = {
  icon: FileText,
  title: "Historia clínica digital",
  description:
    "Diagnóstico oftalmológico en un solo formulario digital, diseñado para optometría real.",
};

const topRight: FeatureItem[] = [
  {
    icon: Users,
    title: "Gestión de pacientes",
    description: "Registro centralizado con foto, datos de contacto e historial médico.",
  },
  {
    icon: TestTube,
    title: "Pedidos de laboratorio",
    description: "Crea, envía y rastrea órdenes de lentes con especificaciones precisas.",
  },
];

const wideFeature: FeatureItem = {
  icon: BarChart3,
  title: "Dashboard analytics",
  description: "Métricas en tiempo real: ventas, diagnósticos frecuentes y top productos.",
};

const bottomRow: FeatureItem[] = [
  {
    icon: Package,
    title: "Inventario inteligente",
    description: "Control de stock con alertas automáticas de bajo inventario.",
  },
  {
    icon: ShoppingCart,
    title: "Órdenes de compra",
    description: "Proveedores, cotizaciones y facturación electrónica al SRI.",
  },
  {
    icon: Calendar,
    title: "Agenda por sucursal",
    description: "Calendario por sucursal con vista por día, semana o mes.",
  },
  {
    icon: MessageCircle,
    title: "Notificaciones WhatsApp",
    description: "Recordatorios automáticos a pacientes con reglas y horarios silenciosos.",
  },
];

const cardEnter = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: custom * 0.06, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const heroEnter = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Features() {
  return (
    <section id="caracteristicas" className="relative py-24 sm:py-28 bg-[#071A1F] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14B875]/40 to-transparent"
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14 sm:mb-20 max-w-2xl mx-auto">
          <Reveal variant="up">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-[#14B875] mb-4">
              Plataforma todo-en-uno
            </span>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <h2
              className="font-sora font-bold text-white mb-5"
              style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
            >
              Todo lo que tu óptica necesita,{" "}
              <span className="text-aurora">en un solo lugar</span>
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.1}>
            <p className="font-inter text-[#B7D1D2] text-lg leading-relaxed">
              Desde el primer paciente hasta el análisis del negocio, la plataforma
              cubre cada aspecto operativo de tu óptica.
            </p>
          </Reveal>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_DEFAULT}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 lg:auto-rows-[180px]"
        >
          <HeroBento item={heroFeature} />

          {topRight.map((f, i) => (
            <StandardBento key={f.title} item={f} index={i + 2} order={i + 1} />
          ))}

          <WideBento item={wideFeature} />

          {bottomRow.map((f, i) => (
            <StandardBento key={f.title} item={f} index={i + 5} order={i + 4} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative rounded-card border border-[#1D4650] bg-[#123A43] shadow-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#14B875]/45 hover:shadow-card-hover overflow-hidden before:absolute before:top-0 before:left-0 before:h-px before:w-0 before:bg-gradient-to-r before:from-transparent before:via-[#14B875] before:to-transparent before:transition-[width] before:duration-700 hover:before:w-full ${className || ""}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] -translate-x-full rounded-[inherit] bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.10)_48%,transparent_66%)] transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      {children}
    </div>
  );
}

function HeroBento({ item }: { item: FeatureItem }) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={heroEnter}
      className="lg:col-span-2 lg:row-span-2"
    >
      <CardShell className="h-full min-h-[380px] lg:min-h-0">
        <div className="relative h-full p-7 sm:p-8 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Icon className="w-5 h-5 text-[#14B875]" strokeWidth={1.5} />
                <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-[#B7D1D2]/70">
                  Núcleo clínico · 01
                </span>
              </div>
              <h3
                className="font-sora font-bold text-white leading-tight mb-3"
                style={{ fontSize: "clamp(22px, 2.2vw, 30px)" }}
              >
                {item.title}
              </h3>
              <p className="font-inter text-[#B7D1D2] text-base leading-relaxed max-w-md">
                {item.description}
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-end pt-4">
            <MockClinicalForm className="w-full max-w-sm mx-auto sm:mx-0" />
          </div>
        </div>
      </CardShell>
    </motion.div>
  );
}

function WideBento({ item }: { item: FeatureItem }) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={cardEnter}
      custom={3}
      className="lg:col-span-2"
    >
      <CardShell className="h-full">
        <div className="relative h-full p-6 sm:p-7 flex flex-col sm:flex-row items-stretch gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <Icon className="w-5 h-5 text-[#5FD4A0]" strokeWidth={1.5} />
              <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-[#B7D1D2]/70">
                Analítica · 04
              </span>
            </div>
            <h3 className="font-sora font-semibold text-white text-lg sm:text-xl leading-tight mb-1.5">
              {item.title}
            </h3>
            <p className="font-inter text-[#B7D1D2] text-sm leading-relaxed max-w-xs">
              {item.description}
            </p>
          </div>
          <div className="shrink-0 w-full sm:w-44 h-28 sm:h-auto flex items-end">
            <MiniBarChart className="w-full h-full" />
          </div>
        </div>
      </CardShell>
    </motion.div>
  );
}

function StandardBento({
  item,
  index,
  order,
}: {
  item: FeatureItem;
  index: number;
  order: number;
}) {
  const Icon = item.icon;
  return (
    <motion.div variants={cardEnter} custom={index}>
      <CardShell className="h-full">
        <div className="relative h-full p-5 sm:p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Icon className="w-4 h-4 text-[#14B875]" strokeWidth={1.5} />
            <span className="font-inter text-[11px] uppercase tracking-[0.18em] text-[#B7D1D2]/70">
              {String(order).padStart(2, "0")}
            </span>
          </div>
          <h3 className="font-sora font-semibold text-white text-[15px] sm:text-base leading-tight mb-2">
            {item.title}
          </h3>
          <p className="font-inter text-[#B7D1D2] text-[13px] leading-relaxed">
            {item.description}
          </p>
        </div>
      </CardShell>
    </motion.div>
  );
}
