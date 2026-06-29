'use client';

import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Boxes,
  Receipt,
  LineChart,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import ScrollHighlight from "@/components/ui/ScrollHighlight";

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
  const reduce = useReducedMotion();
  const n = modules.length;
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const go = (dir: number) => setActive((a) => (a + dir + n) % n);

  // Posición relativa con wrap (camino más corto) → coverflow "infinito".
  const relOf = (i: number) => {
    let r = i - active;
    if (r > n / 2) r -= n;
    if (r < -n / 2) r += n;
    return r;
  };

  const spring = reduce
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 240, damping: 28, mass: 0.9 } as const);

  const maxVisible = compact ? 1 : 2;
  const xUnit = compact ? 64 : 50; // % del ancho de la tarjeta por paso
  const rotY = compact ? 14 : 27; // grados por paso

  return (
    <section id="producto" className="relative overflow-hidden bg-surface-2 py-24 sm:py-28">
      <div aria-hidden className="rule-soft absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-6xl px-6 2xl:max-w-[1720px]">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
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
            <p className="mx-auto mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
              Desde el primer paciente hasta el cierre de mes, cada módulo comparte los mismos
              datos. Recórrelos con las flechas, los puntos o tocando una tarjeta.
            </p>
          </Reveal>
        </div>

        {/* ── Carrusel coverflow 3D ── */}
        <Reveal variant="up" delay={0.05}>
          <div
            className="relative mx-auto h-[520px] select-none"
            style={{ perspective: 1500 }}
            role="group"
            aria-roledescription="carrusel"
            aria-label="Módulos de Dioptrika"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                go(-1);
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                go(1);
              }
            }}
          >
            {modules.map((m, i) => {
              const rel = relOf(i);
              const abs = Math.abs(rel);
              const visible = abs <= maxVisible;
              const isActive = rel === 0;
              const scale = abs === 0 ? 1 : abs === 1 ? 0.86 : 0.74;
              return (
                <motion.div
                  key={m.tag}
                  className="absolute inset-x-0 top-1/2 mx-auto w-[86vw] max-w-md"
                  style={{
                    zIndex: 30 - abs * 5,
                    transformStyle: "preserve-3d",
                    pointerEvents: visible ? "auto" : "none",
                  }}
                  initial={false}
                  animate={{
                    x: `${rel * xUnit}%`,
                    y: "-50%",
                    z: -abs * (compact ? 90 : 160),
                    rotateY: rel * -rotY,
                    scale,
                    opacity: !visible ? 0 : abs === 0 ? 1 : abs === 1 ? 0.58 : 0.26,
                  }}
                  transition={spring}
                >
                  <ModuleCard
                    module={m}
                    index={i}
                    active={isActive}
                    onSelect={isActive ? undefined : () => setActive(i)}
                  />
                </motion.div>
              );
            })}

            {/* Flechas */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Módulo anterior"
              className="absolute left-0 top-1/2 z-40 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-ink shadow-soft backdrop-blur transition-[transform,border-color,color] duration-200 hover:border-brand/50 hover:text-brand-ink active:scale-95 sm:left-2"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Módulo siguiente"
              className="absolute right-0 top-1/2 z-40 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-ink shadow-soft backdrop-blur transition-[transform,border-color,color] duration-200 hover:border-brand/50 hover:text-brand-ink active:scale-95 sm:right-2"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </Reveal>

        {/* Puntos de navegación */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {modules.map((m, i) => (
            <button
              key={m.tag}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ir a ${m.tag}`}
              aria-current={active === i}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === i ? "w-7 bg-brand" : "w-2 bg-line-strong hover:bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Capacidades adicionales */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
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

/* ───────────────── Tarjeta de módulo ───────────────── */

function ModuleCard({
  module,
  index,
  active,
  onSelect,
}: {
  module: ModuleData;
  index: number;
  active: boolean;
  onSelect?: () => void;
}) {
  const Icon = module.icon;
  return (
    <div
      className={`group relative w-full overflow-hidden rounded-[22px] border bg-surface shadow-float transition-colors duration-300 ${
        active ? "border-brand/35" : "border-line"
      }`}
    >
      {/* sheen de marca (esquina) + filo de vidrio superior */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand/10 blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
      />

      <div className="relative p-6 sm:p-7">
        <div className="mb-5 flex items-center gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/12 text-brand-ink ring-1 ring-brand/15">
            <Icon className="h-6 w-6" strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <span className="data block text-[11px] uppercase tracking-[0.16em] text-muted">
              Módulo {String(index + 1).padStart(2, "0")}
            </span>
            <span className="block font-display text-sm font-semibold text-brand-ink">
              {module.tag}
            </span>
          </div>
        </div>

        <h3 className="font-display text-[1.6rem] font-bold leading-tight text-ink">
          {module.title}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-[14.5px] leading-relaxed text-muted">
          {module.description}
        </p>

        <div
          aria-hidden
          className="mt-5 h-[224px] overflow-hidden rounded-2xl border border-line bg-surface-2/60 p-3.5"
        >
          {module.preview()}
        </div>
      </div>

      {/* Tarjetas laterales: overlay clicable para traerlas al frente */}
      {onSelect && (
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Ver módulo ${module.tag}`}
          className="absolute inset-0 z-20 cursor-pointer rounded-[22px]"
        />
      )}
    </div>
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
