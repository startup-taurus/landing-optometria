'use client';

import { useRef } from "react";
import { gsap, useGSAP, DESKTOP_MOTION } from "@/lib/gsap";

export interface HighlightSegment {
  text: string;
  /** La palabra se ilumina hacia el verde de marca en lugar de la tinta. */
  accent?: boolean;
}

interface ScrollHighlightProps {
  /** Texto plano (todas las palabras se iluminan a tinta). */
  text?: string;
  /** Alternativa rica: segmentos con énfasis (p. ej. titulares a dos colores). */
  segments?: HighlightSegment[];
  className?: string;
  style?: React.CSSProperties;
  as?: "p" | "h2" | "h3";
}

// Scroll-driven text reveal (estilo Sira): al bajar, cada palabra pasa de
// `--muted` a `--ink` (o a `--brand-ink` si es acento), palabra por palabra. Al
// subir, el efecto se revierte fluidamente porque va atado al scroll (scrub).
//
// RENDIMIENTO: una sola tween con stagger sobre la custom-property `--lit` de
// cada palabra (sin layout, recalc acotado a cada <span> hoja). Se monta SOLO en
// desktop sin reduce-motion; en el resto el texto se ve a tinta/acento y estático.
export default function ScrollHighlight({
  text,
  segments,
  className,
  style,
  as = "p",
}: ScrollHighlightProps) {
  const ref = useRef<HTMLElement>(null);

  const resolved: HighlightSegment[] = segments ?? [{ text: text ?? "" }];

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const words = el.querySelectorAll<HTMLElement>(".sh-word");
        gsap.set(words, { "--lit": 0 });
        gsap.to(words, {
          "--lit": 1,
          ease: "none",
          stagger: 0.4,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            end: "top 30%",
            scrub: 0.5,
          },
        });
      });
    },
    { scope: ref }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = as as any;
  let key = 0;
  return (
    <Tag ref={ref} className={className} style={style}>
      {resolved.map((seg) =>
        seg.text.split(/(\s+)/).map((tk) =>
          /\s+/.test(tk) || tk === "" ? (
            tk
          ) : (
            <span
              key={key++}
              className={`sh-word${seg.accent ? " sh-word--accent" : ""}`}
              style={{ display: "inline-block" }}
            >
              {tk}
            </span>
          )
        )
      )}
    </Tag>
  );
}
