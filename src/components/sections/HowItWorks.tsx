'use client';

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  Building2,
  Stethoscope,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";
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
    title: "Configura tu clínica",
    description:
      "Alta en minutos. Configuras sucursales, doctores, roles y permisos granulares desde un panel guiado. Importamos tu inventario y base de pacientes desde Excel si los tienes.",
    scene: () => <SetupScene />,
  },
  {
    icon: Stethoscope,
    kicker: "Día a día",
    title: "Gestiona tu operación",
    description:
      "Pacientes, agenda, refracciones, pedidos a laboratorio e inventario en un flujo unificado. Tu equipo trabaja sobre la misma fuente de verdad sin saltar entre herramientas.",
    scene: () => <OperateScene />,
  },
  {
    icon: TrendingUp,
    kicker: "Cada mes",
    title: "Crece con datos",
    description:
      "Métricas en tiempo real: ventas por sucursal, productos top, diagnósticos frecuentes y conversión por canal. Decisiones con números, no con corazonadas.",
    scene: () => <GrowScene />,
  },
];

function StepIndicator({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;

  const isActive = useTransform(progress, (v) => v >= start - 0.02 && v < end + 0.02);
  const fill = useTransform(progress, [start, end], [0, 1], { clamp: true });
  const fillPercent = useTransform(fill, (v) => `${v * 100}%`);

  const scale = useTransform(isActive, (v) => (v ? 1 : 0.94));
  const opacity = useTransform(progress, (v) => {
    if (v < start - 0.05) return 0.4;
    if (v > end + 0.05) return 0.6;
    return 1;
  });

  const Icon = steps[index].icon;

  return (
    <motion.div
      style={{ scale, opacity }}
      className="relative flex gap-4 items-start"
    >
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-2 border-sky/20 bg-white flex items-center justify-center relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-sky to-teal"
            style={{ height: fillPercent, top: "auto", bottom: 0 }}
          />
          <motion.div className="relative z-10">
            <Icon className="w-5 h-5 text-navy mix-blend-difference" />
          </motion.div>
        </div>
        {index < total - 1 && (
          <div className="w-0.5 flex-1 bg-border mt-2 min-h-[60px] relative">
            <motion.div
              className="absolute inset-x-0 top-0 bg-gradient-to-b from-sky to-teal"
              style={{ height: fillPercent }}
            />
          </div>
        )}
      </div>
      <div className="pt-1.5 pb-10">
        <p className="font-inter text-xs font-semibold uppercase tracking-widest text-sky">
          {steps[index].kicker}
        </p>
        <h3 className="font-jakarta font-bold text-navy text-lg sm:text-xl mt-1">
          {steps[index].title}
        </h3>
        <p className="font-inter text-text-muted text-sm leading-relaxed mt-2 max-w-md">
          {steps[index].description}
        </p>
      </div>
    </motion.div>
  );
}

function SceneSwitcher({ progress }: { progress: MotionValue<number> }) {
  const total = steps.length;
  return (
    <div className="relative w-full h-full">
      {steps.map((step, i) => {
        const start = i / total;
        const end = (i + 1) / total;
        return (
          <SceneCell
            key={i}
            progress={progress}
            start={start}
            end={end}
            index={i}
            total={total}
            scene={step.scene}
          />
        );
      })}
    </div>
  );
}

function SceneCell({
  progress,
  start,
  end,
  index,
  total,
  scene,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  index: number;
  total: number;
  scene: () => React.ReactNode;
}) {
  const opacity = useTransform(progress, (v) => {
    if (index === 0 && v < start) return 1;
    if (index === total - 1 && v > end) return 1;
    if (v >= start - 0.04 && v <= end + 0.04) return 1;
    return 0;
  });
  const y = useTransform(progress, [start - 0.1, start, end, end + 0.1], [40, 0, 0, -40]);
  const scaleVal = useTransform(progress, [start - 0.1, start, end, end + 0.1], [0.96, 1, 1, 0.96]);

  return (
    <motion.div
      style={{ opacity, y, scale: scaleVal }}
      className="absolute inset-0"
    >
      {scene()}
    </motion.div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="relative bg-bg-soft overflow-hidden"
      style={{ minHeight: `${100 + steps.length * 65}vh` }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-mesh opacity-50 pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 sm:pt-28 pb-12 text-center">
        <Reveal variant="up">
          <span className="inline-block text-sm font-semibold tracking-widest uppercase text-teal mb-4">
            Cómo funciona
          </span>
        </Reveal>
        <Reveal variant="up" delay={0.05}>
          <h2
            className="font-jakarta font-bold text-navy mx-auto max-w-3xl"
            style={{ fontSize: "clamp(30px, 4vw, 48px)" }}
          >
            Tres etapas,{" "}
            <span className="text-aurora">una sola plataforma</span>
          </h2>
        </Reveal>
      </div>

      <div className="relative h-[80vh] sm:h-screen">
        <div className="sticky top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="order-2 md:order-1">
                {steps.map((_, i) => (
                  <StepIndicator
                    key={i}
                    index={i}
                    total={steps.length}
                    progress={scrollYProgress}
                  />
                ))}
              </div>

              <div className="order-1 md:order-2 relative h-[260px] sm:h-[360px] md:h-[420px] rounded-card border border-border bg-white shadow-card-hover overflow-hidden">
                <div
                  aria-hidden
                  className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-sky/15 blur-3xl pointer-events-none"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-teal/15 blur-3xl pointer-events-none"
                />
                <div className="relative w-full h-full p-5 sm:p-7">
                  <SceneSwitcher progress={scrollYProgress} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SetupScene() {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky to-teal" />
        <div className="flex-1">
          <div className="h-2.5 w-32 bg-navy/80 rounded-full mb-1" />
          <div className="h-2 w-20 bg-text-muted/40 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {["Sucursal centro", "Sucursal norte", "Doctores", "Roles"].map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="rounded-lg bg-white border border-border p-2.5 flex flex-col justify-between"
          >
            <div className="h-2 w-3/4 bg-navy/60 rounded-full" />
            <div className="h-1.5 w-1/2 bg-text-muted/30 rounded-full mt-2" />
            <div className="h-5 w-12 bg-gradient-to-r from-sky to-teal rounded mt-2" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OperateScene() {
  return (
    <div className="h-full flex flex-col gap-2.5">
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "Pacientes", v: "1,284", c: "text-sky" },
          { l: "Citas hoy", v: "38", c: "text-teal" },
          { l: "Pedidos", v: "12", c: "text-navy" },
        ].map((m) => (
          <div key={m.l} className="rounded-lg bg-white border border-border p-2.5">
            <div className="text-[10px] text-text-muted">{m.l}</div>
            <div className={`text-base font-jakarta font-bold ${m.c}`}>{m.v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-white border border-border p-2.5 flex-1 flex flex-col gap-1.5">
        {["08:00 — M. Pérez · Refracción", "09:30 — L. Vega · Adaptación LC", "11:00 — J. Ríos · Control"].map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
            className="flex items-center gap-2 text-[11px]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky" />
            <span className="font-mono text-text">{t}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GrowScene() {
  const bars = [40, 55, 48, 70, 60, 82, 72, 90, 78, 95];
  return (
    <div className="h-full flex flex-col gap-2.5">
      <div className="rounded-lg bg-white border border-border p-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-text-muted">Ventas mes</div>
          <div className="text-lg font-jakarta font-bold text-navy">$28.4K</div>
        </div>
        <div className="text-xs font-semibold text-teal bg-teal/10 px-2 py-1 rounded">
          +18% MoM
        </div>
      </div>
      <div className="rounded-lg bg-white border border-border p-3 flex-1 flex items-end gap-1">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: "easeOut" }}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-sky to-teal"
            style={{ opacity: 0.45 + i * 0.055 }}
          />
        ))}
      </div>
    </div>
  );
}
