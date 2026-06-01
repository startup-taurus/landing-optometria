'use client';

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Eye, TrendingUp } from "lucide-react";
import { useRef, type ReactNode, type MouseEvent } from "react";
import Badge from "@/components/ui/Badge";
import AnimatedGradientBackground from "@/components/ui/AnimatedGradientBackground";
import Reticle from "@/components/ui/Reticle";
import { fadeInUp, staggerHero, fadeInMockup } from "@/lib/animations";

function FloatingCard({
  children,
  className,
  delay,
  from,
  depth = 0,
}: {
  children: ReactNode;
  className: string;
  delay: number;
  from: { x?: number; y?: number };
  depth?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from.x ?? 0, y: from.y ?? 12, z: depth }}
      animate={{ opacity: 1, x: 0, y: 0, z: depth }}
      whileHover={{
        z: depth + 40,
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      transition={{ delay, duration: 0.75, type: "spring", stiffness: 90, damping: 18 }}
      style={{ transformStyle: "preserve-3d" }}
      className={`absolute z-20 hidden xl:block ${className}`}
    >
      <div className="glass-liquid card-sheen rounded-2xl px-4 py-3">
        {children}
      </div>
    </motion.div>
  );
}

function FloatingStats() {
  return (
    <>
      <FloatingCard className="-left-6 top-8" delay={0.5} from={{ x: -28 }} depth={55}>
        <p className="text-[10px] font-inter text-[#B7D1D2]/65 uppercase tracking-widest mb-1.5">
          Pacientes activos
        </p>
        <p className="text-2xl font-sora font-bold text-[#14B875]">1,284</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <TrendingUp className="w-3 h-3 text-[#14B875] shrink-0" />
          <span className="text-xs font-inter text-[#14B875]">+12% este mes</span>
        </div>
      </FloatingCard>

      <FloatingCard className="-right-6 bottom-14" delay={0.7} from={{ x: 28 }} depth={80}>
        <p className="text-[10px] font-inter text-[#B7D1D2]/65 uppercase tracking-widest mb-1.5">
          Citas confirmadas
        </p>
        <p className="text-2xl font-sora font-bold text-white">38</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#14B875] animate-pulse shrink-0" />
          <span className="text-xs font-inter text-[#B7D1D2]/80">hoy en agenda</span>
        </div>
      </FloatingCard>
    </>
  );
}

function BrowserMockup() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative rounded-2xl border border-[#1D4650]/80 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(20,184,117,0.06)] overflow-hidden bg-[#071A1F]">
        <div className="bg-[#0D252C] border-b border-[#1D4650] px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex-1 bg-[#071A1F] rounded-md px-3 py-1 text-xs text-[#B7D1D2]/45 font-inter border border-[#1D4650] truncate">
            app.dioptrika.com
          </div>
        </div>

        <div className="flex h-[268px]">
          <div className="w-12 bg-[#071A1F] flex flex-col items-center py-4 gap-3 border-r border-[#1D4650]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#14B875] to-[#087A5A] flex items-center justify-center shadow-[0_4px_12px_rgba(20,184,117,0.5)]">
              <Eye className="w-3.5 h-3.5 text-white" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-lg ${
                  i === 0
                    ? "bg-[#14B875]/20 border border-[#14B875]/35"
                    : "bg-[#1D4650]/50"
                }`}
              />
            ))}
          </div>

          <div className="flex-1 bg-[#0D252C] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="h-2.5 w-20 bg-[#F8FBFA]/65 rounded-full mb-1.5" />
                <div className="h-2 w-14 bg-[#B7D1D2]/22 rounded-full" />
              </div>
              <div className="h-6 w-16 bg-gradient-to-br from-[#14B875] to-[#087A5A] rounded-lg shadow-[0_4px_12px_rgba(20,184,117,0.45)]" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Pacientes", value: "1,284", color: "text-[#14B875]" },
                { label: "Citas hoy", value: "38", color: "text-[#5FD4A0]" },
                { label: "Pedidos", value: "12", color: "text-[#7AD9B5]" },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                  className="bg-[#123A43] rounded-xl p-2.5 border border-[#1D4650]"
                >
                  <p className={`text-sm font-sora font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-[#B7D1D2]/55 font-inter">{m.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-[#123A43] rounded-xl border border-[#1D4650] p-3 h-[88px] flex items-end gap-[3px]">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 68].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 1.1 + i * 0.04, duration: 0.6, ease: "easeOut" }}
                  className="flex-1 rounded-t-sm"
                  style={{
                    background:
                      i === 10
                        ? "linear-gradient(180deg, #14B875 0%, #087A5A 100%)"
                        : i % 2 === 0
                        ? `rgba(20,184,117,${0.16 + i * 0.024})`
                        : `rgba(8,122,90,${0.14 + i * 0.024})`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Escenario 3D del hero: el mockup y las tarjetas siguen al cursor (tilt + parallax).
// Desactiva el efecto si el usuario prefiere menos movimiento.
function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 140, damping: 18, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 140, damping: 18, mass: 0.5 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-14, 14]);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  if (reduce) {
    return (
      <div className="relative mx-auto w-full max-w-xl">
        <BrowserMockup />
        <FloatingStats />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="mx-auto w-full max-w-xl [perspective:1100px]"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative will-change-transform"
      >
        <BrowserMockup />
        <FloatingStats />
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-20 lg:pt-16 overflow-hidden bg-[#071A1F]"
    >
      <AnimatedGradientBackground variant="hero" />

      <Reticle className="pointer-events-none absolute -left-44 top-1/2 -translate-y-1/2 hidden lg:block h-[560px] w-[560px] text-[#14B875]/[0.06]" />

      <motion.div
        style={{ opacity: heroFade }}
        className="relative max-w-7xl mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full"
      >
        <motion.div
          variants={staggerHero}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          <motion.div variants={fadeInUp}>
            <Badge>Software clínico especializado para ópticas</Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-sora font-extrabold text-white leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(38px, 5.6vw, 68px)" }}
          >
            <span className="text-aurora text-chromatic">Precisión clínica</span> para
            gestionar ópticas con claridad.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="font-inter text-[#B7D1D2] text-lg leading-relaxed max-w-xl"
          >
            Centraliza historias clínicas, órdenes de laboratorio, inventario y
            facturación en un sistema especializado para ópticas. Multi-sucursal y
            pensado para la realidad de Latinoamérica.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4">
            {["Implementación guiada", "Soporte en español", "Sin contratos"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-inter text-[#B7D1D2]/80">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#14B875] shrink-0" />
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeInMockup}
          initial="hidden"
          animate="visible"
          style={{ y: mockupY }}
          className="will-change-transform"
        >
          <HeroVisual />
        </motion.div>
      </motion.div>
    </section>
  );
}
