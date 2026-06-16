'use client';

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Eye, FlaskConical, ChevronDown } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/ui/MagneticButton";
import { WHATSAPP_URL } from "@/lib/contact";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Revelado por máscara: cada línea del titular entra desde abajo dentro de un
// contenedor overflow-hidden (motivo "enfoque" — de difuso a nítido).
function Line({ children }: { children: React.ReactNode }) {
  return (
    <span className="block overflow-hidden pb-[0.12em]">
      <span className="hero-line block">{children}</span>
    </span>
  );
}

/* Retícula óptica fina (lente / mira) — reemplaza blobs y ruido. */
function LensReticle({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      stroke="currentColor"
    >
      <circle cx="200" cy="200" r="60" strokeWidth="1" />
      <circle cx="200" cy="200" r="120" strokeWidth="1" opacity="0.7" />
      <circle cx="200" cy="200" r="185" strokeWidth="1" opacity="0.45" />
      <path d="M200 8 V392 M8 200 H392" strokeWidth="1" opacity="0.5" />
      <path d="M200 120 v-14 M200 280 v14 M120 200 h-14 M280 200 h14" strokeWidth="1.5" />
    </svg>
  );
}

/* Consola clínica: la firma óptica del producto (refracción OD/OI en mono). */
function ClinicalConsole() {
  return (
    <div className="hero-visual relative w-full max-w-xl">
      <div className="relative overflow-hidden rounded-card border border-line bg-surface shadow-float">
        {/* barra superior del módulo */}
        <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand/12 text-brand-ink">
            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span className="data flex-1 truncate text-[12px] text-muted">app.dioptrika.com</span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-brand-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-brand motion-safe:animate-pulse" />
            En línea
          </span>
        </div>

        <div className="grid grid-cols-[44px_1fr]">
          {/* riel lateral */}
          <div className="flex flex-col items-center gap-3 border-r border-line bg-surface-2/60 py-4">
            <span className="h-7 w-7 rounded-lg bg-cta" />
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-6 w-6 rounded-lg ${i === 0 ? "bg-brand/20 ring-1 ring-brand/40" : "bg-line"}`}
              />
            ))}
          </div>

          {/* contenido */}
          <div className="p-4 sm:p-5">
            {/* cabecera paciente */}
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-ink">
                MP
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-ink">María Pérez</p>
                <p className="text-[12px] text-muted">Refracción · hoy 09:30</p>
              </div>
              <span className="rounded-pill border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand-ink">
                En curso
              </span>
            </div>

            {/* tabla de refracción — la firma óptica */}
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-line bg-surface-2 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
                <span>Refracción</span>
                <span className="w-14 text-right">OD</span>
                <span className="w-14 text-right">OI</span>
              </div>
              {[
                { k: "Esfera", od: "-1.25", oi: "-1.50" },
                { k: "Cilindro", od: "-0.75", oi: "-0.50" },
                { k: "Eje", od: "180°", oi: "175°" },
              ].map((r, i) => (
                <div
                  key={r.k}
                  className={`hero-rxrow grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2 ${
                    i < 2 ? "border-b border-line" : ""
                  }`}
                >
                  <span className="text-[13px] text-ink-2">{r.k}</span>
                  <span className="data w-14 text-right text-[13px] font-medium text-ink">{r.od}</span>
                  <span className="data w-14 text-right text-[13px] text-muted">{r.oi}</span>
                </div>
              ))}
            </div>

            {/* pedido a laboratorio */}
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-surface-2/50 px-3 py-2.5">
              <FlaskConical className="h-4 w-4 shrink-0 text-brand-ink" strokeWidth={1.8} />
              <span className="flex-1 text-[12px] text-ink-2">
                Pedido <span className="data text-ink">LB-1042</span> enviado a laboratorio
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            </div>
          </div>
        </div>
      </div>

      {/* anotación flotante: dato óptico, no métrica de vanidad */}
      <div className="hero-readout absolute -bottom-5 -left-4 hidden rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-float sm:block">
        <p className="text-[10px] uppercase tracking-wide text-muted">Agudeza visual</p>
        <p className="data mt-0.5 text-lg font-semibold text-ink">
          20<span className="text-muted">/</span>20
        </p>
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
      if (reduce) return;

      gsap.set(".hero-line", { yPercent: 118 });
      gsap.set([".hero-badge", ".hero-sub", ".hero-cta", ".hero-bullets", ".hero-foot"], {
        y: 22,
        opacity: 0,
      });
      gsap.set(".hero-visual", { opacity: 0, filter: "blur(12px)", scale: 0.97, y: 24 });
      gsap.set(".hero-readout", { opacity: 0, x: -18 });
      gsap.set(".hero-rxrow", { opacity: 0, x: 10 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(".hero-badge", { y: 0, opacity: 1, duration: 0.7 }, 0.1)
        .to(".hero-line", { yPercent: 0, duration: 1.0, stagger: 0.1 }, 0.16)
        .to(".hero-sub", { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
        .to(".hero-cta", { y: 0, opacity: 1, duration: 0.8 }, "-=0.64")
        .to(".hero-bullets", { y: 0, opacity: 1, duration: 0.75 }, "-=0.66")
        .to(
          ".hero-visual",
          { opacity: 1, filter: "blur(0px)", scale: 1, y: 0, duration: 1.1 },
          0.4
        )
        .to(".hero-rxrow", { opacity: 1, x: 0, duration: 0.5, stagger: 0.08 }, "-=0.7")
        .to(".hero-readout", { opacity: 1, x: 0, duration: 0.7 }, "-=0.5")
        .to(".hero-foot", { y: 0, opacity: 1, duration: 0.6 }, "-=0.4");

      // Parallax sutil al hacer scroll.
      const st = { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-visual", { yPercent: -14, ease: "none", scrollTrigger: st });
      gsap.to(".hero-reticle", { yPercent: 22, rotate: 18, ease: "none", scrollTrigger: st });
      gsap.to(".hero-copy", { yPercent: -6, opacity: 0.6, ease: "none", scrollTrigger: st });

      // Tilt 3D muy leve con el cursor.
      const visual = visualRef.current;
      if (visual && window.matchMedia("(pointer: fine)").matches) {
        const rotX = gsap.quickTo(visual, "rotationX", { duration: 0.6, ease: "power3.out" });
        const rotY = gsap.quickTo(visual, "rotationY", { duration: 0.6, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const r = visual.getBoundingClientRect();
          rotY((((e.clientX - r.left) / r.width) - 0.5) * 7);
          rotX(-(((e.clientY - r.top) / r.height) - 0.5) * 6);
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
      className="relative flex min-h-screen items-center overflow-hidden bg-canvas"
    >
      {/* cuadrícula óptica sutil arriba */}
      <div aria-hidden className="optical-grid pointer-events-none absolute inset-0 opacity-60" />
      {/* retícula de lente (motivo de marca) */}
      <LensReticle className="hero-reticle pointer-events-none absolute -right-40 top-24 hidden h-[560px] w-[560px] text-brand/15 lg:block" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-28">
        {/* ---------- Copy ---------- */}
        <div className="hero-copy flex flex-col gap-6">
          <div className="hero-badge">
            <Badge>Software clínico especializado para ópticas</Badge>
          </div>

          <h1
            className="font-display font-extrabold leading-[1.0] tracking-[-0.03em] text-ink"
            style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}
          >
            <Line>Precisión clínica</Line>
            <Line>para gestionar ópticas</Line>
            <Line>
              con <span className="text-brand-ink">claridad</span>.
            </Line>
          </h1>

          <p className="hero-sub measure text-[1.0625rem] leading-relaxed text-muted">
            Centraliza historias clínicas, órdenes de laboratorio, inventario y facturación en
            un sistema especializado para ópticas. Multi-sucursal y pensado para la realidad de
            Latinoamérica.
          </p>

          <div className="hero-cta flex flex-wrap items-center gap-3 pt-1">
            <MagneticButton href="#planes">
              <Button size="lg">
                Ver planes
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Button>
            </MagneticButton>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                Solicitar demo
              </Button>
            </a>
          </div>

          <div className="hero-bullets flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            {["Implementación guiada", "Soporte en español", "Sin contratos"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-ink-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Visual ---------- */}
        <div className="relative mx-auto w-full max-w-xl [perspective:1300px]">
          <div ref={visualRef} className="[transform-style:preserve-3d]">
            <ClinicalConsole />
          </div>
        </div>
      </div>

      {/* ---------- pie / cue de scroll ---------- */}
      <div className="hero-foot absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 px-6 text-center sm:flex">
        <p className="text-sm text-muted">Menos administración. Más tiempo para tus pacientes.</p>
        <ChevronDown className="h-5 w-5 text-brand-ink/70 motion-safe:animate-bounce" />
      </div>
    </section>
  );
}
