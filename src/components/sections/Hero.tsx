'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { Eye, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useRef } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AnimatedGradientBackground from "@/components/ui/AnimatedGradientBackground";
import MagneticButton from "@/components/ui/MagneticButton";
import { fadeInUp, staggerHero, fadeInMockup } from "@/lib/animations";
import { WHATSAPP_URL } from "@/lib/contact";

function BrowserMockup() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative rounded-2xl border border-white/60 shadow-[0_30px_80px_rgba(15,23,42,0.18)] overflow-hidden glass">
        <div className="bg-[#F1F5F9]/80 border-b border-border px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex-1 bg-white/90 rounded-md px-3 py-1 text-xs text-text-muted font-inter border border-border truncate">
            app.latamsoft.com
          </div>
        </div>

        <div className="flex h-72">
          <div className="w-14 bg-navy-deep flex flex-col items-center py-4 gap-4">
            <Eye className="w-5 h-5 text-sky" />
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-lg ${i === 0 ? "bg-sky/30" : "bg-white/10"}`}
              />
            ))}
          </div>

          <div className="flex-1 bg-[#F8FAFC] p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-3 w-24 bg-navy/80 rounded-full mb-1" />
                <div className="h-2 w-16 bg-text-muted/40 rounded-full" />
              </div>
              <div className="h-7 w-20 bg-gradient-to-br from-sky to-sky-deep rounded-btn shadow-glow-sky" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Pacientes", value: "1,284", color: "text-sky" },
                { label: "Citas hoy", value: "38", color: "text-teal" },
                { label: "Pedidos", value: "12", color: "text-navy" },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                  className="bg-white rounded-xl p-3 border border-border shadow-sm"
                >
                  <p className={`text-lg font-jakarta font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-text-muted font-inter">{m.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-border p-3 h-20 flex items-end gap-1.5">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 68].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 1.1 + i * 0.04, duration: 0.6, ease: "easeOut" }}
                  className="flex-1 rounded-t-sm"
                  style={{
                    background: i === 10 ? "#0EA5E9" : i % 3 === 0 ? "#0D9488" : "#1E3A5F",
                    opacity: i === 10 ? 1 : 0.3 + i * 0.04,
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

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const mockupRotate = useTransform(scrollYProgress, [0, 1], [0, -3]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-20 lg:pt-16 overflow-hidden bg-gradient-mesh"
    >
      <AnimatedGradientBackground variant="hero" />

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
            <Badge>
              <Sparkles className="w-3.5 h-3.5" />
              Hecho para clínicas y ópticas en Latinoamérica
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-jakarta font-extrabold text-navy leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(38px, 5.6vw, 68px)" }}
          >
            Gestiona tu clínica de optometría con{" "}
            <span className="text-aurora">precisión profesional</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="font-inter text-text-muted text-lg leading-relaxed max-w-xl"
          >
            Pacientes, historia clínica, refracción, pedidos a laboratorio, inventario
            y agenda en una sola plataforma. Multi-sucursal, fácil de usar y pensada
            para la realidad de las ópticas latinoamericanas.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 pt-2">
            <MagneticButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg">
                Solicitar demo <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </MagneticButton>
            <a href="#caracteristicas">
              <Button variant="outline" size="lg">
                Ver características <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </Button>
            </a>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center gap-3 pt-4 text-sm font-inter text-text-muted">
            <span className="inline-flex h-2 w-2 rounded-full bg-teal animate-pulse" />
            Implementación guiada · soporte en español · sin permanencia
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeInMockup}
          initial="hidden"
          animate="visible"
          style={{ y: mockupY, rotate: mockupRotate }}
          className="will-change-transform"
        >
          <BrowserMockup />
        </motion.div>
      </motion.div>
    </section>
  );
}
