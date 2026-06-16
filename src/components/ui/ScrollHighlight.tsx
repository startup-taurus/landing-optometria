'use client';

import { useRef } from "react";
import { gsap, useGSAP, DESKTOP_MOTION } from "@/lib/gsap";

interface ScrollHighlightProps {
  /** Texto plano; se divide en palabras y cada una se "ilumina" al scrollear. */
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "p" | "h2" | "h3";
  /** Opacidad de las palabras "apagadas" antes de iluminarse. */
  dim?: number;
}

// Efecto estilo Sira: al scrollear, el texto se ilumina palabra por palabra
// (de apagado a brillante), dando la sensación de que se va "subrayando".
// RENDIMIENTO: solo anima `opacity` (compositor/GPU), una sola tween con stagger
// atada al scroll (scrub). Se monta solo en desktop sin reduce-motion; en el
// resto el texto se ve nítido y estático (sin coste).
export default function ScrollHighlight({
  text,
  className,
  style,
  as = "p",
  dim = 0.16,
}: ScrollHighlightProps) {
  const ref = useRef<HTMLElement>(null);
  const tokens = text.split(/(\s+)/); // conserva los espacios

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const words = el.querySelectorAll<HTMLElement>(".sh-word");
        gsap.set(words, { opacity: dim });
        gsap.to(words, {
          opacity: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 30%",
            scrub: 0.4,
          },
        });
      });
    },
    { scope: ref }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = as as any;
  return (
    <Tag ref={ref} className={className} style={style}>
      {tokens.map((tk, i) =>
        /\s+/.test(tk) ? (
          " "
        ) : (
          <span key={i} className="sh-word" style={{ display: "inline-block" }}>
            {tk}
          </span>
        )
      )}
    </Tag>
  );
}
