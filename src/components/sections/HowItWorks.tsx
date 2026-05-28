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

interface Step {
  icon: LucideIcon;
  title: string;
  kicker: string;
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

function StepButton({
  step,
  index,
  total,
  isActive,
  onClick,
}: {
  step: Step;
  index: number;
  total: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = step.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`group relative flex w-full gap-4 items-start rounded-2xl border text-left transition-all duration-300 px-4 sm:px-5 py-4 sm:py-5 ${
        isActive
          ? "bg-[#123A43] border-[#14B875]/45 shadow-[0_0_40px_-15px_rgba(20,184,117,0.45)]"
          : "bg-white/3 border-[#1D4650] hover:bg-white/6 hover:border-[#14B875]/25"
      }`}
    >
      <div className="relative shrink-0 flex flex-col items-center">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
            isActive
              ? "bg-gradient-to-br from-[#14B875] to-[#087A5A] ring-2 ring-[#14B875]/35"
              : "bg-[#0D252C] border-2 border-[#1D4650]"
          }`}
        >
          <Icon
            className={`w-5 h-5 transition-colors duration-300 ${
              isActive ? "text-white" : "text-[#B7D1D2]/70"
            }`}
          />
        </div>
        {index < total - 1 && (
          <div className="w-0.5 h-6 bg-[#1D4650] mt-2" />
        )}
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <p
          className={`font-inter text-xs font-semibold uppercase tracking-widest transition-colors duration-300 ${
            isActive ? "text-[#14B875]" : "text-[#B7D1D2]/70"
          }`}
        >
          {step.kicker}
        </p>
        <h3
          className={`font-sora font-bold mt-1 leading-tight transition-colors duration-300 ${
            isActive ? "text-white text-lg sm:text-xl" : "text-white/85 text-base sm:text-lg"
          }`}
        >
          {step.title}
        </h3>
        <p
          className={`font-inter text-sm leading-relaxed transition-all duration-300 ${
            isActive
              ? "text-[#B7D1D2] max-h-40 opacity-100 mt-2"
              : "text-[#B7D1D2]/0 max-h-0 opacity-0 overflow-hidden mt-0"
          }`}
        >
          {step.description}
        </p>
      </div>
    </button>
  );
}

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const ActiveScene = steps[active].scene;

  return (
    <section
      id="como-funciona"
      className="relative bg-[#071A1F] overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14B875]/30 to-transparent"
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 sm:pt-28 pb-10 sm:pb-14 text-center">
        <Reveal variant="up">
          <span className="inline-block text-sm font-semibold tracking-widest uppercase text-[#14B875] mb-4">
            Cómo funciona
          </span>
        </Reveal>
        <Reveal variant="up" delay={0.05}>
          <h2
            className="font-sora font-bold text-white mx-auto max-w-3xl"
            style={{ fontSize: "clamp(30px, 4vw, 48px)" }}
          >
            Tres etapas,{" "}
            <span className="text-aurora">una sola plataforma</span>
          </h2>
        </Reveal>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
          <div
            className="order-2 md:order-1 flex flex-col gap-3"
            role="tablist"
            aria-label="Etapas"
          >
            {steps.map((step, i) => (
              <StepButton
                key={i}
                step={step}
                index={i}
                total={steps.length}
                isActive={active === i}
                onClick={() => setActive(i)}
              />
            ))}
          </div>

          <div className="order-1 md:order-2 md:sticky md:top-28">
            <div className="relative h-[340px] sm:h-[420px] md:h-[480px] rounded-card border border-[#1D4650] bg-[#0D252C] shadow-card-hover overflow-hidden">
              <div
                aria-hidden
                className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-[#14B875]/10 blur-3xl pointer-events-none"
              />
              <div
                aria-hidden
                className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-[#087A5A]/10 blur-3xl pointer-events-none"
              />
              <div className="relative w-full h-full p-5 sm:p-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute inset-5 sm:inset-6"
                  >
                    <ActiveScene />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    active === i
                      ? "w-8 bg-gradient-to-r from-[#14B875] to-[#087A5A]"
                      : "w-2 bg-[#1D4650] hover:bg-[#B7D1D2]/40"
                  }`}
                  aria-label={`Ir al paso ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Scene 1 — Setup ─────────────────────────── */

function SetupScene() {
  const checklist = [
    { icon: Building2, label: "Sucursales y horarios", value: "2 sucursales" },
    { icon: Users, label: "Equipo y roles", value: "8 usuarios" },
    { icon: Eye, label: "Catálogo óptico inicial", value: "1.240 ítems" },
    { icon: Check, label: "Paciente de prueba", value: "Listo" },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2.5 pb-2 border-b border-[#1D4650]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#14B875] to-[#087A5A] flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#B7D1D2]/70">Configuración guiada</p>
          <p className="font-sora font-bold text-white text-sm">Óptica Vista Clara</p>
        </div>
        <div className="text-[10px] font-semibold text-[#14B875] bg-[#14B875]/12 px-2 py-1 rounded-full">
          4 / 4
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {checklist.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.12, duration: 0.35 }}
              className="flex items-center gap-3 rounded-lg bg-[#123A43] border border-[#1D4650] px-3 py-2.5"
            >
              <div className="shrink-0 w-7 h-7 rounded-md bg-[#0D252C] border border-[#1D4650] flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-[#14B875]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white leading-tight">{item.label}</p>
                <p className="text-[10px] text-[#B7D1D2]/70 leading-tight">{item.value}</p>
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className="shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#14B875] to-[#087A5A] flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="rounded-lg bg-gradient-to-br from-[#14B875]/12 to-[#087A5A]/6 border border-[#14B875]/30 px-3 py-2 flex items-center gap-2"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#14B875] animate-pulse" />
        <p className="text-[11px] text-white font-medium">Sistema listo para operar</p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── Scene 2 — Operate ─────────────────────────── */

function OperateScene() {
  const stats = [
    { l: "Pacientes", v: "1.284", c: "from-[#14B875] to-[#5FD4A0]" },
    { l: "Citas hoy", v: "38", c: "from-[#087A5A] to-[#14B875]" },
    { l: "Pedidos", v: "12", c: "from-[#123A43] to-[#087A5A]" },
  ];

  const agenda = [
    { time: "08:00", name: "M. Pérez", task: "Refracción", color: "bg-[#14B875]" },
    { time: "09:30", name: "L. Vega", task: "Adaptación LC", color: "bg-[#087A5A]" },
    { time: "11:00", name: "J. Ríos", task: "Control anual", color: "bg-[#5FD4A0]" },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {stats.map((m, i) => (
          <motion.div
            key={m.l}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.07, duration: 0.35 }}
            className="rounded-lg bg-[#123A43] border border-[#1D4650] p-2.5 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${m.c}`} />
            <div className="text-[10px] text-[#B7D1D2]/70">{m.l}</div>
            <div className="text-base font-sora font-bold text-white mt-0.5">{m.v}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="rounded-lg bg-[#123A43] border border-[#1D4650] p-2.5"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-[#14B875]" />
            <span className="text-[11px] font-semibold text-white">M. Pérez · Refracción</span>
          </div>
          <span className="text-[9px] text-[#B7D1D2]/70">OD / OI</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Esfera", od: "-1.25", oi: "-1.50" },
            { label: "Cilindro", od: "-0.75", oi: "-0.50" },
            { label: "Eje", od: "180°", oi: "175°" },
          ].map((rx, i) => (
            <motion.div
              key={rx.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.06, duration: 0.3 }}
              className="rounded bg-[#0D252C] border border-[#1D4650] px-1.5 py-1"
            >
              <div className="text-[8px] uppercase tracking-wider text-[#B7D1D2]/70">{rx.label}</div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono text-[10px] text-white font-semibold">{rx.od}</span>
                <span className="font-mono text-[10px] text-[#B7D1D2]/80">{rx.oi}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="rounded-lg bg-[#123A43] border border-[#1D4650] p-2.5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar className="w-3 h-3 text-[#5FD4A0]" />
          <span className="text-[11px] font-semibold text-white">Agenda · Hoy</span>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 justify-around">
          {agenda.map((a, i) => (
            <motion.div
              key={a.time}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
              className="flex items-center gap-2 text-[11px]"
            >
              <span className="font-mono text-[#B7D1D2]/70 w-9">{a.time}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${a.color} shrink-0`} />
              <span className="font-medium text-white">{a.name}</span>
              <span className="text-[#B7D1D2]/60">·</span>
              <span className="text-[#B7D1D2]/80 truncate">{a.task}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Scene 3 — Grow ─────────────────────────── */

function GrowScene() {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const sales = [42, 48, 56, 63, 71, 84]; // K
  const max = Math.max(...sales);

  const branches = [
    { name: "Centro", value: 62, pct: "62%" },
    { name: "Norte", value: 38, pct: "38%" },
  ];

  const top = [
    { name: "Lentes progresivos premium", units: 142 },
    { name: "Monturas titanio TR90", units: 98 },
    { name: "Lentes contacto mensuales", units: 76 },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-lg bg-gradient-to-br from-[#087A5A] to-[#123A43] p-3 text-white relative overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#14B875]/40 blur-2xl" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-wider text-white/65">Ventas mes</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-sora font-bold">$84K</span>
              <span className="text-[10px] font-semibold text-[#5FD4A0] flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                18%
              </span>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07, duration: 0.35 }}
          className="rounded-lg bg-[#123A43] border border-[#1D4650] p-3"
        >
          <div className="text-[10px] uppercase tracking-wider text-[#B7D1D2]/70">Citas atendidas</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-sora font-bold text-white">412</span>
            <span className="text-[10px] font-semibold text-[#14B875] flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              9%
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="rounded-lg bg-[#123A43] border border-[#1D4650] p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-white">Tendencia · 6 meses</span>
          <span className="text-[10px] text-[#B7D1D2]/70">en miles</span>
        </div>
        <div className="flex items-end gap-1.5 h-14">
          {sales.map((v, i) => {
            const isLast = i === sales.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / max) * 100}%` }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                  className={`w-full rounded-t ${
                    isLast
                      ? "bg-gradient-to-t from-[#087A5A] to-[#14B875]"
                      : "bg-gradient-to-t from-[#087A5A]/40 to-[#14B875]/30"
                  }`}
                />
                <span className={`text-[9px] ${isLast ? "text-white font-semibold" : "text-[#B7D1D2]/70"}`}>
                  {months[i]}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="rounded-lg bg-[#123A43] border border-[#1D4650] p-2.5"
        >
          <div className="text-[10px] uppercase tracking-wider text-[#B7D1D2]/70 mb-1.5">Por sucursal</div>
          <div className="flex flex-col gap-1.5">
            {branches.map((b, i) => (
              <div key={b.name}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-white font-medium">{b.name}</span>
                  <span className="text-[#B7D1D2]/80">{b.pct}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#0D252C] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.value}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#14B875] to-[#087A5A]"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
          className="rounded-lg bg-[#123A43] border border-[#1D4650] p-2.5"
        >
          <div className="text-[10px] uppercase tracking-wider text-[#B7D1D2]/70 mb-1.5">Top productos</div>
          <div className="flex flex-col gap-1">
            {top.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.07, duration: 0.3 }}
                className="flex items-center justify-between text-[10px]"
              >
                <span className="text-white truncate flex-1 mr-1.5">{p.name}</span>
                <span className="font-mono text-[#B7D1D2]/80 shrink-0">{p.units}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
