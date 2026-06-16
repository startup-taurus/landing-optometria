'use client';

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  Eye,
  Stethoscope,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import { VIEWPORT_DEFAULT } from "@/lib/animations";

interface Step {
  icon: LucideIcon;
  kicker: string;
  title: string;
  description: string;
  scene: () => React.ReactNode;
}

const steps: Step[] = [
  {
    icon: Building2,
    kicker: "Día 1",
    title: "Configura tu óptica",
    description:
      "Sesión de configuración guiada con nuestro equipo. Creamos juntos tus sucursales, usuarios y roles con permisos a medida — desde quién factura hasta quién accede a la historia clínica.",
    scene: () => <SetupScene />,
  },
  {
    icon: Stethoscope,
    kicker: "Día a día",
    title: "Gestiona tu operación",
    description:
      "Pacientes, agenda, refracciones, pedidos a laboratorio e inventario en un solo lugar. Tu equipo trabaja en un único sistema, sin saltar entre Excel, libretas y WhatsApp suelto.",
    scene: () => <OperateScene />,
  },
  {
    icon: TrendingUp,
    kicker: "Cada mes",
    title: "Crece con datos",
    description:
      "Métricas por sucursal: ventas, productos top, diagnósticos frecuentes y tendencia de citas. Decisiones con números, no con corazonadas.",
    scene: () => <GrowScene />,
  },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const ActiveScene = steps[active].scene;

  return (
    <section id="como-funciona" className="relative overflow-hidden bg-canvas py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl sm:mb-14">
          <Reveal variant="up">
            <h2
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(1.9rem, 3.8vw, 3rem)" }}
            >
              De la puesta en marcha al crecimiento
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
              Tres etapas, una sola plataforma. Selecciona una para ver qué ocurre en cada
              momento de tu óptica.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:gap-14">
          <div className="order-2 flex flex-col gap-3 md:order-1" role="tablist" aria-label="Etapas">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = active === i;
              return (
                <motion.button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VIEWPORT_DEFAULT}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`group relative flex w-full items-start gap-4 rounded-card border px-4 py-4 text-left transition-[border-color,background-color,box-shadow] duration-300 ease-out-expo sm:px-5 ${
                    isActive
                      ? "border-brand/40 bg-surface shadow-soft"
                      : "border-line bg-surface/40 hover:border-line-strong hover:bg-surface"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="hiw-rail"
                      aria-hidden
                      className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-brand"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
                      isActive ? "bg-cta text-cta-on" : "border border-line bg-surface-2 text-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="flex-1 pt-0.5">
                    <span className="data block text-[11px] uppercase tracking-wide text-brand-ink">
                      {step.kicker}
                    </span>
                    <span className="mt-0.5 block font-display text-lg font-bold leading-tight text-ink">
                      {step.title}
                    </span>
                    <span
                      className={`block overflow-hidden text-[14px] leading-relaxed text-muted transition-all duration-300 ${
                        isActive ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {step.description}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="order-1 md:order-2 md:sticky md:top-28">
            <TiltCard className="rounded-card">
            <div className="relative h-[360px] overflow-hidden rounded-card border border-line bg-surface shadow-float sm:h-[440px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0 p-5 sm:p-6"
                >
                  <ActiveScene />
                </motion.div>
              </AnimatePresence>
            </div>
            </TiltCard>
            <div className="mt-4 flex items-center justify-center gap-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ir al paso ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    active === i ? "w-8 bg-brand" : "w-2 bg-line-strong hover:bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Scene 1 — Setup ─────────────── */
function SetupScene() {
  const checklist = [
    { icon: Building2, label: "Sucursales y horarios", value: "2 sucursales" },
    { icon: Users, label: "Equipo y roles", value: "8 usuarios" },
    { icon: Eye, label: "Catálogo óptico inicial", value: "1.240 ítems" },
    { icon: Check, label: "Paciente de prueba", value: "Listo" },
  ];
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2.5 border-b border-line pb-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-cta text-cta-on">
          <Building2 className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wide text-muted">Configuración guiada</p>
          <p className="font-display text-sm font-bold text-ink">Óptica Vista Clara</p>
        </div>
        <span className="data rounded-pill bg-brand/12 px-2 py-1 text-[10px] font-semibold text-brand-ink">
          4 / 4
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {checklist.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.32 }}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface-2/60 px-3 py-2.5"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-surface text-brand-ink">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1">
                <p className="text-[12px] font-semibold leading-tight text-ink">{item.label}</p>
                <p className="text-[11px] leading-tight text-muted">{item.value}</p>
              </div>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-cta text-cta-on">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/[0.06] px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-brand motion-safe:animate-pulse" />
        <p className="text-[12px] font-medium text-ink">Sistema listo para operar</p>
      </div>
    </div>
  );
}

/* ─────────────── Scene 2 — Operate ─────────────── */
function OperateScene() {
  const stats = [
    { l: "Pacientes", v: "1.284" },
    { l: "Citas hoy", v: "38" },
    { l: "Pedidos", v: "12" },
  ];
  const agenda = [
    { time: "08:00", name: "F. Zambrano", task: "Refracción" },
    { time: "09:30", name: "E. Reyes", task: "Adaptación LC" },
    { time: "11:00", name: "D. Reyes", task: "Control anual" },
  ];
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {stats.map((m) => (
          <div key={m.l} className="rounded-lg border border-line bg-surface-2/60 p-2.5">
            <div className="text-[10px] text-muted">{m.l}</div>
            <div className="data mt-0.5 text-base font-bold text-ink">{m.v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-line bg-surface-2/60 p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3 w-3 text-brand-ink" />
            <span className="text-[12px] font-semibold text-ink">F. Zambrano · Refracción</span>
          </div>
          <span className="text-[10px] text-muted">OD / OI</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Esfera", od: "-1.25", oi: "-1.50" },
            { label: "Cilindro", od: "-0.75", oi: "-0.50" },
            { label: "Eje", od: "180°", oi: "175°" },
          ].map((rx) => (
            <div key={rx.label} className="rounded border border-line bg-surface px-1.5 py-1">
              <div className="text-[8px] uppercase tracking-wide text-muted">{rx.label}</div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="data text-[11px] font-semibold text-ink">{rx.od}</span>
                <span className="data text-[11px] text-muted">{rx.oi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col rounded-lg border border-line bg-surface-2/60 p-2.5">
        <div className="mb-2 flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-brand-ink" />
          <span className="text-[12px] font-semibold text-ink">Agenda · Hoy</span>
        </div>
        <div className="flex flex-1 flex-col justify-around gap-1.5">
          {agenda.map((a) => (
            <div key={a.time} className="flex items-center gap-2 text-[12px]">
              <span className="data w-10 text-muted">{a.time}</span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span className="font-medium text-ink">{a.name}</span>
              <span className="text-muted">·</span>
              <span className="truncate text-muted">{a.task}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Scene 3 — Grow ─────────────── */
function GrowScene() {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const sales = [42, 48, 56, 63, 71, 84];
  const max = Math.max(...sales);
  const branches = [
    { name: "Centro", value: 62 },
    { name: "Norte", value: 38 },
  ];
  const top = [
    { name: "Lentes progresivos premium", units: 142 },
    { name: "Monturas titanio TR90", units: 98 },
    { name: "Lentes de contacto mensuales", units: 76 },
  ];
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-brand/25 bg-brand/[0.06] p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted">Ventas mes</div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="data text-xl font-bold text-ink">$84K</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-brand-ink">
              <ArrowUpRight className="h-3 w-3" />
              18%
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface-2/60 p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted">Citas atendidas</div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="data text-xl font-bold text-ink">412</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-brand-ink">
              <ArrowUpRight className="h-3 w-3" />
              9%
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-line bg-surface-2/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-ink">Tendencia · 6 meses</span>
          <span className="text-[10px] text-muted">en miles</span>
        </div>
        <div className="flex h-14 items-end gap-1.5">
          {sales.map((v, i) => {
            const isLast = i === sales.length - 1;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / max) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                  className={`w-full rounded-t ${isLast ? "bg-brand" : "bg-brand/35"}`}
                />
                <span className={`text-[9px] ${isLast ? "font-semibold text-ink" : "text-muted"}`}>
                  {months[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2">
        <div className="rounded-lg border border-line bg-surface-2/60 p-2.5">
          <div className="mb-1.5 text-[10px] uppercase tracking-wide text-muted">Por sucursal</div>
          <div className="flex flex-col gap-1.5">
            {branches.map((b, i) => (
              <div key={b.name}>
                <div className="mb-0.5 flex items-center justify-between text-[10px]">
                  <span className="font-medium text-ink">{b.name}</span>
                  <span className="data text-muted">{b.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.value}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-brand"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface-2/60 p-2.5">
          <div className="mb-1.5 text-[10px] uppercase tracking-wide text-muted">Top productos</div>
          <div className="flex flex-col gap-1">
            {top.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-[10px]">
                <span className="mr-1.5 flex-1 truncate text-ink-2">{p.name}</span>
                <span className="data shrink-0 text-muted">{p.units}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
