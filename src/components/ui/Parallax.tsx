'use client';

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, DESKTOP_MOTION } from "@/lib/gsap";

interface ParallaxProps {
  children: ReactNode;
  /** Desplazamiento en % de la altura del elemento a lo largo del scroll.
   *  Negativo = sube más rápido que el scroll; positivo = se queda atrás. */
  speed?: number;
  className?: string;
}

// Movimiento real atado al scroll (no solo fade). RENDIMIENTO: solo `transform`
// (yPercent, en GPU), scrub directo, y se monta SOLO en desktop sin reduce-motion.
// En móvil/low-end el contenido queda estático (cero ScrollTriggers).
export default function Parallax({ children, speed = -14, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        gsap.fromTo(
          el,
          { yPercent: -speed / 2 },
          {
            yPercent: speed / 2,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
