'use client';

import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Eye, TrendingUp, Glasses, ArrowRight, ChevronDown } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/ui/MagneticButton";
import AnimatedGradientBackground from "@/components/ui/AnimatedGradientBackground";
import Reticle from "@/components/ui/Reticle";
import { WHATSAPP_URL } from "@/lib/contact";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Revelado por máscara estilo Sira: cada "línea" del titular vive dentro de un
// contenedor con overflow-hidden y entra deslizándose desde abajo (yPercent).
function Line({ children }: { children: React.ReactNode }) {
  return (
    <span className="block overflow-hidden pb-[0.16em]">
      <span className="hero-line block">{children}</span>
    </span>
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
                  transition={{ delay: 1.1 + i * 0.1, duration: 0.5 }}
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
                  transition={{ delay: 1.4 + i * 0.04, duration: 0.6, ease: "easeOut" }}
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

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return; // estado natural, sin animación

      // --- Estados iniciales (se fijan antes del paint → sin parpadeo) ---
      gsap.set(".hero-line", { yPercent: 118, opacity: 0 });
      gsap.set(
        [".hero-badge", ".hero-sub", ".hero-cta", ".hero-bullets", ".hero-tagline"],
        { y: 26, opacity: 0 }
      );
      gsap.set(".hero-visual", { y: 48, opacity: 0, scale: 0.96 });
      gsap.set(".hero-infocard", { x: 44, y: -8, opacity: 0 });
      gsap.set(".hero-floatstat", { x: -32, opacity: 0 });

      // --- Timeline de entrada (estilo Sira: revelado suave y escalonado) ---
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(".hero-badge", { y: 0, opacity: 1, duration: 0.7 }, 0.1)
        .to(".hero-line", { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.12 }, 0.18)
        .to(".hero-sub", { y: 0, opacity: 1, duration: 0.85 }, "-=0.6")
        .to(".hero-cta", { y: 0, opacity: 1, duration: 0.85 }, "-=0.65")
        .to(".hero-bullets", { y: 0, opacity: 1, duration: 0.8 }, "-=0.7")
        .to(".hero-visual", { y: 0, opacity: 1, scale: 1, duration: 1.15 }, 0.42)
        .to(".hero-infocard", { x: 0, y: 0, opacity: 1, duration: 0.95 }, "-=0.75")
        .to(".hero-floatstat", { x: 0, opacity: 1, duration: 0.85 }, "-=0.75")
        .to(".hero-tagline", { y: 0, opacity: 1, duration: 0.7 }, "-=0.45");

      // --- Parallax al hacer scroll (Lenis ya alimenta a ScrollTrigger) ---
      const st = { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-visual", { yPercent: -26, ease: "none", scrollTrigger: st });
      gsap.to(".hero-infocard", { yPercent: -48, ease: "none", scrollTrigger: st });
      gsap.to(".hero-floatstat", { yPercent: 36, ease: "none", scrollTrigger: st });
      gsap.to(".hero-reticle", { yPercent: 34, ease: "none", scrollTrigger: st });
      gsap.to(".hero-copy", { yPercent: -12, opacity: 0.5, ease: "none", scrollTrigger: st });

      // --- Parallax sutil con el cursor sobre el visual (tilt 3D) ---
      const visual = visualRef.current;
      if (visual && window.matchMedia("(pointer: fine)").matches) {
        const rotX = gsap.quickTo(visual, "rotationX", { duration: 0.6, ease: "power3.out" });
        const rotY = gsap.quickTo(visual, "rotationY", { duration: 0.6, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const r = visual.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          rotY(px * 12);
          rotX(-py * 10);
        };
        const onLeave = () => {
          rotX(0);
          rotY(0);
        };
        visual.addEventListener("pointermove", onMove);
        visual.addEventListener("pointerleave", onLeave);
        return () => {
          visual.removeEventListener("pointermove", onMove);
          visual.removeEventListener("pointerleave", onLeave);
        };
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#071A1F] noise-overlay"
    >
      <AnimatedGradientBackground variant="hero" />
      <Reticle className="hero-reticle pointer-events-none absolute -left-52 top-1/2 -translate-y-1/2 hidden lg:block h-[640px] w-[640px] text-[#14B875]/[0.06]" />
      {/* Halo radial cinematográfico (mantiene la paleta teal) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 620px at 78% 18%, rgba(20,184,117,0.10), transparent 60%), radial-gradient(900px 600px at 0% 100%, rgba(8,122,90,0.10), transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-20 lg:pt-28 lg:pb-24 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
        {/* ---------- Copy (izquierda) ---------- */}
        <div className="hero-copy flex flex-col gap-6 will-change-transform">
          <div className="hero-badge">
            <Badge>Software clínico especializado para ópticas</Badge>
          </div>

          <h1
            className="font-sora font-extrabold text-white leading-[0.98] tracking-tight"
            style={{ fontSize: "clamp(40px, 6vw, 82px)" }}
          >
            <Line>
              <span className="text-aurora text-chromatic">Precisión clínica</span>
            </Line>
            <Line>para gestionar ópticas</Line>
            <Line>
              con <span className="text-aurora">claridad</span>.
            </Line>
          </h1>

          <p className="hero-sub font-inter text-[#B7D1D2] text-lg leading-relaxed max-w-xl">
            Centraliza historias clínicas, órdenes de laboratorio, inventario y
            facturación en un sistema especializado para ópticas. Multi-sucursal y
            pensado para la realidad de Latinoamérica.
          </p>

          <div className="hero-cta flex flex-wrap items-center gap-3 pt-1">
            <MagneticButton href="#planes">
              <Button size="lg">
                Ver planes
                <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </MagneticButton>
            <MagneticButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                Solicitar demo
              </Button>
            </MagneticButton>
          </div>

          <div className="hero-bullets flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
            {["Implementación guiada", "Soporte en español", "Sin contratos"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-inter text-[#B7D1D2]/80">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#14B875] shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Visual (derecha) ---------- */}
        <div className="relative mx-auto w-full max-w-xl [perspective:1200px]">
          <div
            ref={visualRef}
            className="hero-visual relative will-change-transform [transform-style:preserve-3d]"
          >
            <BrowserMockup />

            {/* Tarjeta de cristal flotante (posición estilo Sira: arriba-derecha) */}
            <div className="hero-infocard absolute -right-5 -top-7 z-20 hidden sm:block w-[224px]">
              <div className="glass-liquid card-sheen rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#14B875] shrink-0" />
                  <span className="text-[11px] font-inter uppercase tracking-widest text-[#B7D1D2]/70">
                    Hecho para ópticas
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#14B875] to-[#087A5A] flex items-center justify-center shadow-[0_6px_18px_rgba(20,184,117,0.45)]">
                    <Glasses className="w-[18px] h-[18px] text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-sora font-semibold text-white text-sm leading-tight">
                      Historia clínica + laboratorio
                    </p>
                    <p className="mt-1 text-[11px] font-inter text-[#B7D1D2]/65 leading-snug">
                      Refracción, pedidos y facturación EC en un solo lugar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta de estadística flotante (abajo-izquierda) */}
            <div className="hero-floatstat absolute -left-6 bottom-10 z-20 hidden lg:block">
              <div className="glass-liquid card-sheen rounded-2xl px-4 py-3">
                <p className="text-[10px] font-inter text-[#B7D1D2]/65 uppercase tracking-widest mb-1.5">
                  Pacientes activos
                </p>
                <p className="text-2xl font-sora font-bold text-[#14B875]">1,284</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <TrendingUp className="w-3 h-3 text-[#14B875] shrink-0" />
                  <span className="text-xs font-inter text-[#14B875]">+12% este mes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Tagline + cue de scroll (abajo, centrado) ---------- */}
      <div className="hero-tagline absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-center px-6">
        <p className="font-inter text-sm text-[#B7D1D2]/70">
          Menos administración. Más tiempo para tus pacientes.
        </p>
        <ChevronDown className="w-5 h-5 text-[#14B875]/70 animate-bounce" />
      </div>
    </section>
  );
}
