'use client';

import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Boxes,
  Receipt,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";

interface ModuleData {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  preview: () => React.ReactNode;
  accent: string;
}

const modules: ModuleData[] = [
  {
    icon: CalendarDays,
    tag: "Agenda",
    title: "Agenda por sucursal",
    description:
      "Vista por día, semana o mes. Estados de cita y recordatorio automático al paciente un día antes.",
    accent: "from-[#14B875]/35 to-[#14B875]/5",
    preview: () => <AgendaPreview />,
  },
  {
    icon: ClipboardList,
    tag: "Historia clínica",
    title: "Refracción y diagnóstico",
    description:
      "Agudeza visual, refracción, diagnóstico clínico y mucho más en un único formulario digital.",
    accent: "from-[#087A5A]/40 to-[#087A5A]/5",
    preview: () => <ClinicalPreview />,
  },
  {
    icon: FlaskConical,
    tag: "Laboratorio",
    title: "Pedidos con trazabilidad",
    description:
      "Especificaciones ópticas precisas, seguimiento de estados y notificación automática al paciente.",
    accent: "from-[#14B875]/35 to-[#087A5A]/10",
    preview: () => <LabPreview />,
  },
  {
    icon: Boxes,
    tag: "Inventario",
    title: "Stock en tiempo real",
    description:
      "Monturas, lentes y accesorios con alertas automáticas, control de movimientos y stock por sucursal.",
    accent: "from-[#123A43]/40 to-[#14B875]/10",
    preview: () => <InventoryPreview />,
  },
  {
    icon: Receipt,
    tag: "Facturación",
    title: "Facturación electrónica",
    description:
      "Cotizaciones, ventas y notas de crédito con facturación electrónica al SRI desde el mismo flujo.",
    accent: "from-[#087A5A]/35 to-[#123A43]/10",
    preview: () => <BillingPreview />,
  },
  {
    icon: LineChart,
    tag: "Analytics",
    title: "Dashboard ejecutivo",
    description:
      "Métricas clave de tu óptica: ventas, tendencias, top productos y diagnósticos frecuentes.",
    accent: "from-[#14B875]/30 to-[#123A43]/10",
    preview: () => <AnalyticsPreview />,
  },
];

export default function ModuleShowcase() {
  const [active, setActive] = useState(0);
  const [xBase, setXBase] = useState(310);
  const total = modules.length;

  useEffect(() => {
    const update = () => {
      const cardW = Math.min(460, window.innerWidth * 0.82);
      setXBase(Math.round(cardW * 0.68));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const go = (i: number) => setActive(Math.max(0, Math.min(total - 1, i)));

  return (
    <section className="relative bg-[#0D252C] py-24 sm:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 sm:mb-14">
        <div className="max-w-2xl">
          <Reveal variant="up">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-[#14B875] mb-3">
              Recorre los módulos
            </span>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <h2
              className="font-sora font-bold text-white"
              style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
            >
              Una plataforma,{" "}
              <span className="text-aurora">seis ejes operativos</span>
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.1}>
            <p className="font-inter text-[#B7D1D2] text-lg mt-3">
              Explora cómo cada módulo se conecta con el siguiente.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Coverflow carousel */}
      <div className="relative h-[560px] sm:h-[600px] lg:h-[620px] flex items-center">
        {/* Left button */}
        <button
          type="button"
          onClick={() => go(active - 1)}
          disabled={active === 0}
          aria-label="Módulo anterior"
          className="absolute left-2 sm:left-6 lg:left-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#123A43]/90 backdrop-blur-sm border border-[#1D4650] shadow-lg flex items-center justify-center text-white transition-all hover:border-[#14B875]/60 hover:text-[#14B875] hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Cards with perspective */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: "1400px" }}
        >
          {modules.map((m, i) => {
            const offset = i - active;
            const absOffset = Math.abs(offset);
            if (absOffset > 2) return null;

            const Icon = m.icon;
            const isCenter = offset === 0;
            const scale = 1 - absOffset * 0.13;
            const opacity = 1 - absOffset * 0.22;
            const brightness = isCenter ? 1 : 1 - absOffset * 0.18;

            return (
              <motion.article
                key={m.title}
                data-card
                animate={{
                  x: offset * xBase,
                  scale,
                  opacity,
                  zIndex: 10 - absOffset * 3,
                  rotateY: offset * 10,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={isCenter ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.08}
                onDragEnd={(_, { offset: drag, velocity }) => {
                  if (drag.x < -60 || velocity.x < -400) go(active + 1);
                  else if (drag.x > 60 || velocity.x > 400) go(active - 1);
                }}
                onClick={() => !isCenter && go(i)}
                className="absolute w-[82vw] sm:w-[400px] lg:w-[460px] rounded-card border border-[#1D4650] bg-[#123A43] overflow-hidden select-none"
                style={{
                  transformStyle: "preserve-3d",
                  cursor: isCenter ? "grab" : "pointer",
                  boxShadow: isCenter
                    ? "0 28px 70px rgba(0,0,0,0.45), 0 10px 28px rgba(0,0,0,0.3)"
                    : "0 10px 28px rgba(0,0,0,0.25)",
                  filter: `brightness(${brightness})`,
                }}
              >
                <div
                  aria-hidden
                  className={`absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br ${m.accent} blur-2xl pointer-events-none`}
                />
                <div className="relative p-7 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#14B875]/20 to-[#087A5A]/10 flex items-center justify-center ring-1 ring-[#14B875]/25">
                      <Icon className="w-5 h-5 text-[#14B875]" />
                    </div>
                    <div>
                      <p className="font-inter text-xs font-semibold uppercase tracking-widest text-[#B7D1D2]/70">
                        Módulo {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="font-sora font-semibold text-white">{m.tag}</p>
                    </div>
                  </div>
                  <h3 className="font-sora font-bold text-white text-2xl leading-tight">
                    {m.title}
                  </h3>
                  <p className="font-inter text-[#B7D1D2] text-sm leading-relaxed">
                    {m.description}
                  </p>
                  <div className="rounded-xl border border-[#1D4650] bg-[#071A1F]/70 p-4 h-52 sm:h-60 overflow-hidden">
                    {m.preview()}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Right button */}
        <button
          type="button"
          onClick={() => go(active + 1)}
          disabled={active === total - 1}
          aria-label="Siguiente módulo"
          className="absolute right-2 sm:right-6 lg:right-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#123A43]/90 backdrop-blur-sm border border-[#1D4650] shadow-lg flex items-center justify-center text-white transition-all hover:border-[#14B875]/60 hover:text-[#14B875] hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {modules.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Ir al módulo ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-[#14B875]" : "w-2 bg-white/15 hover:bg-white/25"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function AgendaPreview() {
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00"];
  const events = [
    { row: 0, color: "bg-[#14B875]", label: "M. Pérez · Refracción" },
    { row: 1, color: "bg-[#087A5A]", label: "L. Vega · Control" },
    { row: 3, color: "bg-[#5FD4A0]", label: "J. Ríos · Adaptación LC" },
  ];
  return (
    <div className="h-full flex flex-col gap-1.5">
      {hours.map((h, i) => {
        const ev = events.find((e) => e.row === i);
        return (
          <div key={h} className="flex items-center gap-2">
            <span className="w-10 text-[10px] font-mono text-[#B7D1D2]/70">{h}</span>
            <div className="flex-1 h-7 rounded-md bg-[#123A43] border border-[#1D4650] relative overflow-hidden">
              {ev && (
                <div
                  className={`absolute inset-y-0 left-0 w-3/4 ${ev.color} text-white text-[10px] flex items-center px-2 rounded-md`}
                >
                  {ev.label}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClinicalPreview() {
  return (
    <div className="h-full flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#14B875] to-[#087A5A]" />
        <div className="flex-1">
          <div className="h-2.5 w-28 bg-white/80 rounded-full mb-1" />
          <div className="h-2 w-20 bg-[#B7D1D2]/40 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {["OD esf -1.25", "OI esf -1.50", "OD cil -0.50", "OI cil -0.75"].map((t) => (
          <div
            key={t}
            className="rounded-md bg-[#123A43] border border-[#1D4650] px-2 py-1.5 text-[10px] font-mono text-white"
          >
            {t}
          </div>
        ))}
      </div>
      <div className="rounded-md border border-[#1D4650] bg-[#123A43] p-2 flex-1">
        <div className="h-2 w-3/4 bg-white/30 rounded-full mb-1.5" />
        <div className="h-2 w-2/3 bg-white/20 rounded-full mb-1.5" />
        <div className="h-2 w-1/2 bg-white/15 rounded-full" />
      </div>
    </div>
  );
}

function LabPreview() {
  const orders = [
    { id: "LB-1042", state: "Enviado", color: "bg-[#14B875] text-white" },
    { id: "LB-1041", state: "En proceso", color: "bg-amber-400/90 text-amber-950" },
    { id: "LB-1040", state: "Listo", color: "bg-[#087A5A] text-white" },
    { id: "LB-1039", state: "Entregado", color: "bg-[#5FD4A0] text-[#0D252C]" },
  ];
  return (
    <div className="h-full flex flex-col gap-2">
      {orders.map((o) => (
        <div
          key={o.id}
          className="flex items-center gap-2 rounded-md bg-[#123A43] border border-[#1D4650] px-2.5 py-2"
        >
          <span className="font-mono text-[10px] text-[#B7D1D2]/70">{o.id}</span>
          <div className="flex-1 h-1.5 bg-[#0D252C] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#14B875] to-[#087A5A] w-3/4" />
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${o.color}`}>{o.state}</span>
        </div>
      ))}
    </div>
  );
}

function InventoryPreview() {
  const items = [
    { name: "Ray-Ban RX5279", stock: 12, low: false },
    { name: "Oakley OO9013", stock: 4, low: true },
    { name: "Lente CR-39 1.56", stock: 28, low: false },
    { name: "Vault VLT-220", stock: 2, low: true },
  ];
  return (
    <div className="h-full flex flex-col gap-1.5">
      {items.map((it) => (
        <div
          key={it.name}
          className="flex items-center gap-2 rounded-md bg-[#123A43] border border-[#1D4650] px-2.5 py-1.5"
        >
          <div className="flex-1">
            <div className="h-2 w-3/4 bg-white/70 rounded-full mb-1" />
            <div className="h-1.5 w-1/2 bg-[#B7D1D2]/30 rounded-full" />
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              it.low ? "bg-rose-500/20 text-rose-300" : "bg-[#14B875]/20 text-[#14B875]"
            }`}
          >
            {it.stock} u
          </span>
        </div>
      ))}
    </div>
  );
}

function BillingPreview() {
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="rounded-md bg-[#123A43] border border-[#1D4650] p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-[#B7D1D2]/70">Factura 001-002-1284</span>
          <span className="text-[10px] font-semibold text-[#14B875]">Pagada</span>
        </div>
        <div className="h-2 w-1/2 bg-white/40 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {[
          { l: "Subtotal", v: "$210" },
          { l: "IVA 12%", v: "$25.20" },
          { l: "Total", v: "$235.20" },
        ].map((c) => (
          <div key={c.l} className="rounded-md bg-[#123A43] border border-[#1D4650] py-1.5">
            <div className="text-[9px] text-[#B7D1D2]/70">{c.l}</div>
            <div className="text-[11px] font-mono font-semibold text-white">{c.v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md bg-gradient-to-br from-[#14B875]/15 to-[#087A5A]/10 border border-[#14B875]/30 p-2.5 flex-1">
        <div className="text-[10px] text-[#B7D1D2]/80 mb-1">Forma de pago</div>
        <div className="flex gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#123A43] border border-[#1D4650] text-white">
            Efectivo
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#123A43] border border-[#1D4650] text-white">
            Tarjeta
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#123A43] border border-[#1D4650] text-white">
            Transferencia
          </span>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPreview() {
  const bars = [42, 65, 50, 78, 60, 90, 72, 85, 68, 92];
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { l: "Ventas mes", v: "$28.4K", c: "text-[#14B875]" },
          { l: "Citas", v: "412", c: "text-[#5FD4A0]" },
          { l: "Conversión", v: "62%", c: "text-white" },
        ].map((m) => (
          <div key={m.l} className="rounded-md bg-[#123A43] border border-[#1D4650] px-2 py-1.5">
            <div className="text-[9px] text-[#B7D1D2]/70">{m.l}</div>
            <div className={`text-sm font-sora font-bold ${m.c}`}>{m.v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md bg-[#123A43] border border-[#1D4650] p-2.5 flex items-end gap-1 flex-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-[#087A5A] to-[#14B875]"
            style={{ height: `${h}%`, opacity: 0.55 + i * 0.045 }}
          />
        ))}
      </div>
    </div>
  );
}
