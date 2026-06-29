'use client';

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, DESKTOP_MOTION } from "@/lib/gsap";
import { ArrowRight, Eye, FlaskConical, ChevronDown } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/ui/MagneticButton";
import { WHATSAPP_URL } from "@/lib/contact";

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
        {/* línea de escaneo que barre la consola al ensamblarse */}
        <span aria-hidden className="hero-scan pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-brand/25 to-transparent opacity-0" />

        {/* barra superior del módulo */}
        <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand/12 text-brand-ink">
            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span className="data flex-1 truncate text-[12px] text-muted">dioptrika.com</span>
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
                FZ
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-ink">Fabricio Zavala</p>
                <p className="text-[12px] text-muted">Refracción · hoy 09:30</p>
              </div>
              <span className="rounded-pill border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand-ink">
                En curso
              </span>
            </div>

            {/* tabla de refracción — la firma óptica */}
            <div className="hero-cap-rx relative overflow-hidden rounded-xl border border-line">
              <span aria-hidden className="hero-ring pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0 ring-2 ring-inset ring-brand/70" />
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
            <div className="hero-cap-lab relative mt-3 flex items-center gap-3 rounded-xl border border-line bg-surface-2/50 px-3 py-2.5">
              <span aria-hidden className="hero-ring pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-2 ring-inset ring-brand/70" />
              <FlaskConical className="h-4 w-4 shrink-0 text-brand-ink" strokeWidth={1.8} />
              <span className="flex-1 text-[12px] text-ink-2">
                Pedido <span className="data text-ink">LB-1042</span> enviado a laboratorio
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            </div>
          </div>
        </div>

        {/* Vidrio "liquid": brillo especular que sigue el cursor + filo superior. */}
        <span aria-hidden className="hero-spec pointer-events-none absolute inset-0 z-30 rounded-card opacity-70 transition-opacity duration-300" />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
      </div>

      {/* anotación flotante: dato óptico, no métrica de vanidad */}
      <div className="hero-readout absolute -bottom-5 -left-4 hidden sm:block">
        <div className="rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-float motion-safe:animate-float-soft">
          <p className="text-[10px] uppercase tracking-wide text-muted">Agudeza visual</p>
          <p className="data mt-0.5 text-lg font-semibold text-ink">
            20<span className="text-muted">/</span>20
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ── Entrada cinematográfica (una sola vez, barata → en todos lados) ──
      // La consola se "ensambla": el panel enfoca de difuso a nítido, una línea
      // de escaneo lo barre y las filas/anotaciones entran en cascada.
      if (!reduce) {
        gsap.set(".hero-line", { yPercent: 118 });
        gsap.set([".hero-badge", ".hero-sub", ".hero-cta", ".hero-bullets", ".hero-foot"], {
          y: 22,
          opacity: 0,
        });
        gsap.set(".hero-visual", { opacity: 0, filter: "blur(14px)", scale: 0.92, y: 30 });
        gsap.set(".hero-readout", { opacity: 0, x: -18, scale: 0.9 });
        gsap.set(".hero-rxrow", { opacity: 0, x: 12 });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(".hero-badge", { y: 0, opacity: 1, duration: 0.7 }, 0.1)
          .to(".hero-line", { yPercent: 0, duration: 1.05, stagger: 0.1 }, 0.16)
          .to(".hero-sub", { y: 0, opacity: 1, duration: 0.8 }, "-=0.62")
          .to(".hero-cta", { y: 0, opacity: 1, duration: 0.8 }, "-=0.66")
          .to(".hero-bullets", { y: 0, opacity: 1, duration: 0.75 }, "-=0.68")
          .to(
            ".hero-visual",
            { opacity: 1, filter: "blur(0px)", scale: 1, y: 0, duration: 1.15 },
            0.35
          )
          .fromTo(
            ".hero-scan",
            { opacity: 0, yPercent: 0 },
            { opacity: 1, yPercent: 540, duration: 1.0, ease: "power2.inOut" },
            0.55
          )
          .to(".hero-scan", { opacity: 0, duration: 0.3 }, "-=0.25")
          .to(".hero-rxrow", { opacity: 1, x: 0, duration: 0.5, stagger: 0.08 }, "-=0.95")
          .to(".hero-readout", { opacity: 1, x: 0, scale: 1, duration: 0.7 }, "-=0.6")
          .to(".hero-foot", { y: 0, opacity: 1, duration: 0.6 }, "-=0.35");

        // Flotación 3D ambiental: la consola "flota" suave en el espacio (bob +
        // balanceo 3D) con ciclos de distinta duración → se siente orgánico, no
        // robótico. Vive en su propia capa (.hero-float) para no chocar con el
        // tilt del cursor (.hero-console) ni la entrada (.hero-visual).
        gsap.to(".hero-float", { y: -13, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.3 });
        gsap.to(".hero-float", { rotationX: 2.6, duration: 4.3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.3 });
        gsap.to(".hero-float", { rotationY: -3.2, duration: 5.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.3 });
      }

      // ── Presentación por scroll: hero FIJADO mientras se compone (estilo Sira) ──
      // Al bajar: la copy se retira, la consola crece y se centra (el producto
      // toma protagonismo), la retícula se expande, la cuadrícula se intensifica
      // y entra una frase de cierre. Todo atado a scrub → reversible. Solo
      // transform/opacity. SOLO desktop sin reduce-motion (pin pesado).
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const layered = [".hero-copy", ".hero-stage", ".hero-reticle", ".hero-grid", ".hero-scene2"];
        gsap.set(layered, { willChange: "transform" });

        // Desplazamiento en px para CENTRAR la consola horizontalmente en el
        // viewport (vive en la columna derecha). Se mide sin transformar (el
        // timeline aún no renderiza), así el centro queda exacto al crecer.
        const stageEl = stageRef.current;
        let centerDx = 0;
        if (stageEl) {
          const r = stageEl.getBoundingClientRect();
          centerDx = window.innerWidth / 2 - (r.left + r.width / 2);
        }

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=110%",
            // scrub bajo (0.4) → reacciona pronto: menos scroll para que se note.
            scrub: 0.4,
            pin: pinRef.current,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });

        tl
          // la copy se retira hacia la izquierda y se desvanece (arranca rápido)
          .to(".hero-copy", { xPercent: -12, autoAlpha: 0, ease: "power2.out", duration: 0.34 }, 0)
          .to(".hero-foot", { autoAlpha: 0, duration: 0.15 }, 0)
          // la consola crece y se CENTRA (arranca rápido: power2.out → reacciona ya)
          .fromTo(
            ".hero-stage",
            { scale: 1, x: 0, yPercent: 0 },
            { scale: 1.28, x: centerDx, yPercent: 3, ease: "power2.out", duration: 1, immediateRender: false },
            0
          )
          // retícula se expande y gira; cuadrícula se intensifica
          .to(".hero-reticle", { scale: 1.65, rotate: 64, xPercent: -18, ease: "power1.out", duration: 1 }, 0)
          .fromTo(".hero-grid", { opacity: 0.6 }, { opacity: 1, ease: "none", duration: 0.55, immediateRender: false }, 0)
          // las anotaciones del producto se resaltan en secuencia (solo opacidad)
          .fromTo(".hero-ring", { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.16, duration: 0.2, immediateRender: false }, 0.3)
          // frase de cierre que aparece sobre la escena
          .fromTo(
            ".hero-scene2",
            { autoAlpha: 0, yPercent: 40 },
            { autoAlpha: 1, yPercent: 0, ease: "power2.out", duration: 0.4, immediateRender: false },
            0.42
          );

        // Tilt 3D "liquid glass" con resorte (decorativo) — la consola se inclina
        // siguiendo el cursor con inercia y un brillo especular la recorre.
        const visual = consoleRef.current;
        const spec = visual?.querySelector<HTMLElement>(".hero-spec") ?? null;
        let cleanupTilt: (() => void) | undefined;
        if (visual && window.matchMedia("(pointer: fine)").matches) {
          const rotX = gsap.quickTo(visual, "rotationX", { duration: 0.6, ease: "power3.out" });
          const rotY = gsap.quickTo(visual, "rotationY", { duration: 0.6, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            const r = visual.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            rotY((px - 0.5) * 13);
            rotX(-(py - 0.5) * 11);
            if (spec) {
              spec.style.setProperty("--mx", `${px * 100}%`);
              spec.style.setProperty("--my", `${py * 100}%`);
              spec.style.opacity = "1";
            }
          };
          const onLeave = () => {
            rotX(0);
            rotY(0);
            if (spec) {
              spec.style.setProperty("--mx", "32%");
              spec.style.setProperty("--my", "12%");
              spec.style.opacity = "";
            }
          };
          visual.addEventListener("pointermove", onMove);
          visual.addEventListener("pointerleave", onLeave);
          cleanupTilt = () => {
            visual.removeEventListener("pointermove", onMove);
            visual.removeEventListener("pointerleave", onLeave);
          };
        }

        return () => {
          cleanupTilt?.();
          gsap.set(layered, { willChange: "auto" });
        };
      });

      return () => {
        mm.revert();
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === sectionRef.current) t.kill();
        });
      };
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-canvas">
      <div
        ref={pinRef}
        className="hero-pin relative flex min-h-screen items-center overflow-hidden bg-canvas"
      >
        {/* cuadrícula óptica sutil */}
        <div aria-hidden className="hero-grid optical-grid pointer-events-none absolute inset-0 opacity-60" />
        {/* retícula de lente (motivo de marca) */}
        <LensReticle className="hero-reticle pointer-events-none absolute -right-40 top-24 hidden h-[560px] w-[560px] text-brand/15 lg:block" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-28 2xl:max-w-[1720px] 2xl:gap-20">
          {/* ---------- Copy ---------- */}
          <div className="hero-copy flex flex-col gap-6">
            <div className="hero-badge">
              <Badge>Software clínico especializado para ópticas</Badge>
            </div>

            <h1
              className="font-display font-extrabold leading-[1.0] tracking-[-0.03em] text-ink"
              style={{ fontSize: "clamp(2.6rem, 5.6vw, 5.75rem)" }}
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
          <div className="relative mx-auto w-full max-w-xl [perspective:1300px] 2xl:max-w-2xl">
            {/* hero-stage: lo que crece/centra el scroll */}
            <div ref={stageRef} className="hero-stage [transform-style:preserve-3d]">
              {/* hero-console: el tilt 3D del cursor */}
              <div ref={consoleRef} className="hero-console [transform-style:preserve-3d]">
                {/* hero-float: flotación 3D ambiental (independiente del tilt) */}
                <div className="hero-float [transform-style:preserve-3d]">
                  <ClinicalConsole />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Frase de cierre (aparece al scrollear) ---------- */}
        <div
          aria-hidden
          className="hero-scene2 pointer-events-none absolute inset-x-0 top-[14%] z-20 px-6 text-center opacity-0"
        >
          <p
            className="mx-auto max-w-3xl font-display font-bold leading-[1.05] tracking-[-0.02em] text-ink"
            style={{ fontSize: "clamp(1.8rem, 4.4vw, 3.4rem)" }}
          >
            Toda tu óptica, <span className="text-brand-ink">en una sola pantalla</span>.
          </p>
        </div>

        {/* ---------- pie / cue de scroll ---------- */}
        <div className="hero-foot absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 px-6 text-center sm:flex">
          <p className="text-sm text-muted">Menos administración. Más tiempo para tus pacientes.</p>
          <ChevronDown className="h-5 w-5 text-brand-ink/70 motion-safe:animate-bounce" />
        </div>
      </div>
    </section>
  );
}
