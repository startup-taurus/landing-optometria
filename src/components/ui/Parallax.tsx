'use client';

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, DESKTOP_MOTION } from "@/lib/gsap";

interface ParallaxProps {
  children: ReactNode;
  /** Recorrido vertical en % de la altura (legacy). Negativo = sube más rápido
   *  que el scroll; positivo = se queda atrás. Es el atajo para `y`. */
  speed?: number;
  /** Recorrido total en cada eje (se reparte ±mitad alrededor del centro). */
  y?: number;
  x?: number;
  /** Giro total en grados a lo largo del recorrido. */
  rotate?: number;
  className?: string;
}

// Movimiento real atado al scroll (no solo fade). RENDIMIENTO: SOLO `transform`
// (xPercent/yPercent/rotate, en GPU), una única tween/ScrollTrigger con scrub, y
// se monta SOLO en desktop sin reduce-motion. En móvil/low-end el contenido
// queda estático (cero ScrollTriggers). Varias capas con distintos signos crean
// el movimiento coordinado "de un lado a otro".
export default function Parallax({
  children,
  speed = -14,
  y,
  x = 0,
  rotate = 0,
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const yTravel = y ?? -speed; // `speed` mantiene el signo histórico

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        // will-change SOLO mientras el efecto está montado (desktop). En móvil
        // no se promueve la capa → menos memoria en equipos de pocos recursos.
        gsap.set(el, { willChange: "transform" });
        gsap.fromTo(
          el,
          { yPercent: yTravel / 2, xPercent: x / 2, rotate: rotate / 2 },
          {
            yPercent: -yTravel / 2,
            xPercent: -x / 2,
            rotate: -rotate / 2,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
        return () => gsap.set(el, { willChange: "auto" });
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
