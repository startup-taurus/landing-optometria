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
    accent: "from-sky/30 to-sky/5",
    preview: () => <AgendaPreview />,
  },
  {
    icon: ClipboardList,
    tag: "Historia clínica",
    title: "Refracción y diagnóstico",
    description:
      "Agudeza visual, refracción, diagnóstico clínico y mucho mas en un único formulario digital.",
    accent: "from-teal/30 to-teal/5",
    preview: () => <ClinicalPreview />,
  },
  {
    icon: FlaskConical,
    tag: "Laboratorio",
    title: "Pedidos con trazabilidad",
    description:
      "Especificaciones ópticas precisas, seguimiento de estados y notificación automática al paciente.",
    accent: "from-sky/30 to-teal/10",
    preview: () => <LabPreview />,
  },
  {
    icon: Boxes,
    tag: "Inventario",
    title: "Stock en tiempo real",
    description:
      "Monturas, lentes y accesorios con alertas automáticas, control de movimientos y stock por sucursal.",
    accent: "from-navy/20 to-sky/10",
    preview: () => <InventoryPreview />,
  },
  {
    icon: Receipt,
    tag: "Facturación",
    title: "Facturación electrónica",
    description:
      "Cotizaciones, ventas y notas de crédito con facturación electrónica al SRI desde el mismo flujo.",
    accent: "from-teal/30 to-navy/10",
    preview: () => <BillingPreview />,
  },
  {
    icon: LineChart,
    tag: "Analytics",
    title: "Dashboard ejecutivo",
    description:
      "Métricas clave de tu clínica: ventas, tendencias, top productos y diagnósticos frecuentes.",
    accent: "from-sky/30 to-navy/10",
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
    <section className="relative bg-gradient-to-b from-white via-bg-soft to-white py-24 sm:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 sm:mb-14">
        <div className="max-w-2xl">
          <Reveal variant="up">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-sky mb-3">
              Recorre los módulos
            </span>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <h2
              className="font-jakarta font-bold text-navy"
              style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
            >
              Una plataforma,{" "}
              <span className="text-aurora">seis ejes operativos</span>
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.1}>
            <p className="font-inter text-text-muted text-lg mt-3">
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
          className="absolute left-2 sm:left-6 lg:left-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center text-navy transition-all hover:border-sky/60 hover:text-sky hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
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
            const brightness = isCenter ? 1 : 1 - absOffset * 0.13;

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
                className="absolute w-[82vw] sm:w-[400px] lg:w-[460px] rounded-card border border-border bg-white overflow-hidden select-none"
                style={{
                  transformStyle: "preserve-3d",
                  cursor: isCenter ? "grab" : "pointer",
                  boxShadow: isCenter
                    ? "0 24px 64px rgba(0,0,0,0.13), 0 8px 24px rgba(0,0,0,0.08)"
                    : "0 8px 24px rgba(0,0,0,0.06)",
                  filter: `brightness(${brightness})`,
                }}
              >
                <div
                  aria-hidden
                  className={`absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br ${m.accent} blur-2xl pointer-events-none`}
                />
                <div className="relative p-7 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky/15 to-teal/10 flex items-center justify-center ring-1 ring-sky/15">
                      <Icon className="w-5 h-5 text-sky" />
                    </div>
                    <div>
                      <p className="font-inter text-xs font-semibold uppercase tracking-widest text-text-muted">
                        Módulo {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="font-jakarta font-semibold text-navy">{m.tag}</p>
                    </div>
                  </div>
                  <h3 className="font-jakarta font-bold text-navy text-2xl leading-tight">
                    {m.title}
                  </h3>
                  <p className="font-inter text-text-muted text-sm leading-relaxed">
                    {m.description}
                  </p>
                  <div className="rounded-xl border border-border bg-bg-soft/80 p-4 h-52 sm:h-60 overflow-hidden">
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
          className="absolute right-2 sm:right-6 lg:right-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center text-navy transition-all hover:border-sky/60 hover:text-sky hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
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
              i === active ? "w-6 bg-sky" : "w-2 bg-black/15"
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
    { row: 0, color: "bg-sky", label: "M. Pérez · Refracción" },
    { row: 1, color: "bg-teal", label: "L. Vega · Control" },
    { row: 3, color: "bg-navy", label: "J. Ríos · Adaptación LC" },
  ];
  return (
    <div className="h-full flex flex-col gap-1.5">
      {hours.map((h, i) => {
        const ev = events.find((e) => e.row === i);
        return (
          <div key={h} className="flex items-center gap-2">
            <span className="w-10 text-[10px] font-mono text-text-muted">{h}</span>
            <div className="flex-1 h-7 rounded-md bg-white border border-border relative overflow-hidden">
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
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky to-teal" />
        <div className="flex-1">
          <div className="h-2.5 w-28 bg-navy/80 rounded-full mb-1" />
          <div className="h-2 w-20 bg-text-muted/40 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {["OD esf -1.25", "OI esf -1.50", "OD cil -0.50", "OI cil -0.75"].map((t) => (
          <div
            key={t}
            className="rounded-md bg-white border border-border px-2 py-1.5 text-[10px] font-mono text-navy"
          >
            {t}
          </div>
        ))}
      </div>
      <div className="rounded-md border border-border bg-white p-2 flex-1">
        <div className="h-2 w-3/4 bg-navy/30 rounded-full mb-1.5" />
        <div className="h-2 w-2/3 bg-navy/20 rounded-full mb-1.5" />
        <div className="h-2 w-1/2 bg-navy/15 rounded-full" />
      </div>
    </div>
  );
}

function LabPreview() {
  const orders = [
    { id: "LB-1042", state: "Enviado", color: "bg-sky text-white" },
    { id: "LB-1041", state: "En proceso", color: "bg-yellow-400/90 text-yellow-900" },
    { id: "LB-1040", state: "Listo", color: "bg-teal text-white" },
    { id: "LB-1039", state: "Entregado", color: "bg-navy text-white" },
  ];
  return (
    <div className="h-full flex flex-col gap-2">
      {orders.map((o) => (
        <div
          key={o.id}
          className="flex items-center gap-2 rounded-md bg-white border border-border px-2.5 py-2"
        >
          <span className="font-mono text-[10px] text-text-muted">{o.id}</span>
          <div className="flex-1 h-1.5 bg-bg-slate rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky to-teal w-3/4" />
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
          className="flex items-center gap-2 rounded-md bg-white border border-border px-2.5 py-1.5"
        >
          <div className="flex-1">
            <div className="h-2 w-3/4 bg-navy/70 rounded-full mb-1" />
            <div className="h-1.5 w-1/2 bg-text-muted/30 rounded-full" />
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              it.low ? "bg-red-500/15 text-red-600" : "bg-teal/15 text-teal"
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
      <div className="rounded-md bg-white border border-border p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-text-muted">Factura 001-002-1284</span>
          <span className="text-[10px] font-semibold text-teal">Pagada</span>
        </div>
        <div className="h-2 w-1/2 bg-navy/40 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {[
          { l: "Subtotal", v: "$210" },
          { l: "IVA 12%", v: "$25.20" },
          { l: "Total", v: "$235.20" },
        ].map((c) => (
          <div key={c.l} className="rounded-md bg-white border border-border py-1.5">
            <div className="text-[9px] text-text-muted">{c.l}</div>
            <div className="text-[11px] font-mono font-semibold text-navy">{c.v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md bg-gradient-to-br from-sky/10 to-teal/10 border border-sky/20 p-2.5 flex-1">
        <div className="text-[10px] text-text-muted mb-1">Forma de pago</div>
        <div className="flex gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-border">
            Efectivo
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-border">
            Tarjeta
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-border">
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
          { l: "Ventas mes", v: "$28.4K", c: "text-sky" },
          { l: "Citas", v: "412", c: "text-teal" },
          { l: "Conversión", v: "62%", c: "text-navy" },
        ].map((m) => (
          <div key={m.l} className="rounded-md bg-white border border-border px-2 py-1.5">
            <div className="text-[9px] text-text-muted">{m.l}</div>
            <div className={`text-sm font-jakarta font-bold ${m.c}`}>{m.v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md bg-white border border-border p-2.5 flex items-end gap-1 flex-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-sky to-teal"
            style={{ height: `${h}%`, opacity: 0.5 + i * 0.05 }}
          />
        ))}
      </div>
    </div>
  );
}
