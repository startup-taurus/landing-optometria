'use client';

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Boxes,
  Receipt,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import ScrollHighlight from "@/components/ui/ScrollHighlight";
import TiltCard from "@/components/ui/TiltCard";
import { VIEWPORT_DEFAULT } from "@/lib/animations";

interface ModuleData {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  preview: () => React.ReactNode;
}

const modules: ModuleData[] = [
  {
    icon: ClipboardList,
    tag: "Historia clínica",
    title: "Refracción y diagnóstico",
    description:
      "Agudeza visual, refracción, diagnóstico clínico y antecedentes del paciente en un único formulario digital pensado para optometría.",
    preview: () => <ClinicalPreview />,
  },
  {
    icon: CalendarDays,
    tag: "Agenda",
    title: "Agenda por sucursal",
    description:
      "Vista por día, semana o mes. Estados de cita y recordatorio automático al paciente un día antes.",
    preview: () => <AgendaPreview />,
  },
  {
    icon: FlaskConical,
    tag: "Laboratorio",
    title: "Pedidos con trazabilidad",
    description:
      "Especificaciones ópticas precisas, seguimiento de estados y notificación automática al paciente cuando su pedido está listo.",
    preview: () => <LabPreview />,
  },
  {
    icon: Boxes,
    tag: "Inventario",
    title: "Stock en tiempo real",
    description:
      "Monturas, lentes y accesorios con alertas automáticas, control de movimientos y stock independiente por sucursal.",
    preview: () => <InventoryPreview />,
  },
  {
    icon: Receipt,
    tag: "Facturación",
    title: "Facturación electrónica",
    description:
      "Cotizaciones, ventas, órdenes de compra y notas de crédito con facturación electrónica al SRI desde el mismo flujo.",
    preview: () => <BillingPreview />,
  },
  {
    icon: LineChart,
    tag: "Analytics",
    title: "Dashboard ejecutivo",
    description:
      "Métricas clave por sucursal: ventas, tendencias, top productos y diagnósticos frecuentes. Decisiones con números.",
    preview: () => <AnalyticsPreview />,
  },
];

const EXTRAS = [
  "Multi-sucursal con permisos por rol",
  "Notificaciones por WhatsApp",
  "Gestión de pacientes con foto",
  "Órdenes de compra a proveedores",
];

export default function ModuleShowcase() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = modules[active];

  return (
    <section id="producto" className="relative overflow-hidden bg-surface-2 py-24 sm:py-28">
      <div aria-hidden className="rule-soft absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl sm:mb-14">
          <Reveal variant="up">
            <span className="kicker">La plataforma</span>
          </Reveal>
          <ScrollHighlight
            as="h2"
            className="mt-4 font-display font-bold"
            style={{ fontSize: "clamp(1.9rem, 3.8vw, 3rem)" }}
            segments={[
              { text: "Seis módulos que " },
              { text: "conversan entre sí", accent: true },
            ]}
          />
          <Reveal variant="up" delay={0.1}>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
              Desde el primer paciente hasta el cierre de mes, cada módulo comparte los mismos
              datos. Selecciona uno para verlo.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
          {/* Selector */}
          <div className="flex flex-col gap-2" role="tablist" aria-label="Módulos">
            {modules.map((m, i) => {
              const Icon = m.icon;
              const isActive = active === i;
              return (
                <motion.button
                  key={m.tag}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VIEWPORT_DEFAULT}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className={`group relative flex items-center gap-4 rounded-card border px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow] duration-300 ease-out-expo ${
                    isActive
                      ? "border-brand/40 bg-surface shadow-soft"
                      : "border-line bg-surface/40 hover:border-line-strong hover:bg-surface"
                  }`}
                >
                  {/* Riel activo que se desliza entre módulos (layout animation):
                      el sistema "responde" físicamente a la selección. */}
                  {isActive && (
                    <motion.span
                      layoutId="module-rail"
                      aria-hidden
                      className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-brand"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                      isActive ? "bg-brand/14 text-brand-ink" : "bg-surface-2 text-muted group-hover:text-ink-2"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="data block text-[11px] uppercase tracking-wide text-muted">
                      {String(i + 1).padStart(2, "0")} · {m.tag}
                    </span>
                    <span
                      className={`block font-display text-[15px] font-semibold leading-tight ${
                        isActive ? "text-ink" : "text-ink-2"
                      }`}
                    >
                      {m.title}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Preview — vidrio 3D que se inclina al pasar el cursor (como el hero) */}
          <div className="lg:sticky lg:top-28">
            <TiltCard className="rounded-card">
            <div className="overflow-hidden rounded-card border border-line bg-surface shadow-float">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-5 py-3">
                <p className="font-display text-sm font-semibold text-ink">{current.title}</p>
                <span className="data text-[11px] text-muted">{current.tag}</span>
              </div>
              <div className="p-5">
                <p className="mb-4 text-[14px] leading-relaxed text-muted">{current.description}</p>
                <div className="h-[260px] overflow-hidden rounded-xl border border-line bg-surface-2/60 p-3.5">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active}
                      initial={reduce ? false : { opacity: 0, x: 22 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? undefined : { opacity: 0, x: -22 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full"
                    >
                      {current.preview()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
            </TiltCard>
          </div>
        </div>

        {/* Capacidades adicionales */}
        <div className="mt-10 flex flex-wrap items-center gap-2.5">
          <span className="data text-[11px] uppercase tracking-wide text-muted">y además</span>
          {EXTRAS.map((e) => (
            <span
              key={e}
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[13px] text-ink-2"
            >
              {e}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── Previews (tokenizadas) ───────────────── */

function ClinicalPreview() {
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/15 data text-[11px] font-semibold text-brand-ink">
          ER
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">Eliza Reyes</p>
          <p className="text-[11px] text-muted">34 años · miopía + astigmatismo</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {["OD esf -1.25", "OI esf -1.50", "OD cil -0.75", "OI cil -0.50"].map((t) => (
          <div
            key={t}
            className="data rounded-md border border-line bg-surface px-2 py-1.5 text-[11px] text-ink"
          >
            {t}
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-md border border-line bg-surface p-2.5">
        <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted">Diagnóstico</p>
        <div className="space-y-1.5">
          <div className="h-2 w-3/4 rounded-full bg-line-strong" />
          <div className="h-2 w-2/3 rounded-full bg-line" />
          <div className="h-2 w-1/2 rounded-full bg-line" />
        </div>
      </div>
    </div>
  );
}

function AgendaPreview() {
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00"];
  const events: Record<number, string> = {
    0: "F. Zambrano · Refracción",
    1: "E. Reyes · Control",
    3: "D. Reyes · Adaptación LC",
  };
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {hours.map((h, i) => (
        <div key={h} className="flex items-center gap-2.5">
          <span className="data w-11 text-[11px] text-muted">{h}</span>
          <div className="relative h-7 flex-1 overflow-hidden rounded-md border border-line bg-surface">
            {events[i] && (
              <div className="absolute inset-y-0 left-0 flex w-3/4 items-center rounded-md bg-brand/15 px-2 text-[11px] font-medium text-brand-ink">
                {events[i]}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LabPreview() {
  const orders = [
    { id: "LB-1042", state: "Enviado", pct: "75%", tone: "brand" },
    { id: "LB-1041", state: "En proceso", pct: "45%", tone: "warn" },
    { id: "LB-1040", state: "Listo", pct: "100%", tone: "brand" },
    { id: "LB-1039", state: "Entregado", pct: "100%", tone: "muted" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      {orders.map((o) => (
        <div
          key={o.id}
          className="flex items-center gap-2.5 rounded-md border border-line bg-surface px-2.5 py-2"
        >
          <span className="data text-[11px] text-muted">{o.id}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full ${o.tone === "warn" ? "bg-amber-500" : "bg-brand"}`}
              style={{ width: o.pct }}
            />
          </div>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
              o.tone === "warn"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-brand/15 text-brand-ink"
            }`}
          >
            {o.state}
          </span>
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
    { name: "Montura TR90 Vault", stock: 2, low: true },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {items.map((it) => (
        <div
          key={it.name}
          className="flex items-center gap-2.5 rounded-md border border-line bg-surface px-2.5 py-2"
        >
          <span className="flex-1 text-[12px] text-ink-2">{it.name}</span>
          <span
            className={`data rounded px-1.5 py-0.5 text-[11px] ${
              it.low
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-brand/15 text-brand-ink"
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
    <div className="flex h-full flex-col justify-center gap-2.5">
      <div className="rounded-md border border-line bg-surface p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="data text-[11px] text-muted">Factura 001-002-1284</span>
          <span className="text-[11px] font-semibold text-brand-ink">Autorizada</span>
        </div>
        <div className="h-2 w-1/2 rounded-full bg-line-strong" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Subtotal", v: "$210" },
          { l: "IVA 15%", v: "$31.50" },
          { l: "Total", v: "$241.50" },
        ].map((c) => (
          <div key={c.l} className="rounded-md border border-line bg-surface py-2">
            <div className="text-[10px] text-muted">{c.l}</div>
            <div className="data text-[12px] font-semibold text-ink">{c.v}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-brand/25 bg-brand/[0.06] p-2.5">
        <span className="text-[10px] text-muted">Pago:</span>
        {["Efectivo", "Tarjeta", "Transferencia"].map((p) => (
          <span
            key={p}
            className="rounded-pill border border-line bg-surface px-2 py-0.5 text-[10px] text-ink-2"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPreview() {
  const bars = [42, 65, 50, 78, 60, 90, 72, 85, 68, 92];
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "Ventas mes", v: "$28.4K" },
          { l: "Citas", v: "412" },
          { l: "Conversión", v: "62%" },
        ].map((m) => (
          <div key={m.l} className="rounded-md border border-line bg-surface px-2 py-1.5">
            <div className="text-[10px] text-muted">{m.l}</div>
            <div className="data text-sm font-bold text-ink">{m.v}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-1 items-end gap-1.5 rounded-md border border-line bg-surface p-2.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-brand"
            style={{ height: `${h}%`, opacity: 0.45 + i * 0.05 }}
          />
        ))}
      </div>
    </div>
  );
}
