'use client';

// Punto único de registro de GSAP para el cliente. Importar desde aquí evita
// registrar el plugin en cada componente y mantiene una sola fuente de verdad.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Media query que habilita las animaciones "pesadas" SOLO donde conviene:
// pantallas ≥768px y sin preferencia de movimiento reducido. En móvil / low-end /
// usuarios con reduce-motion, los efectos por scroll no se montan (rinde mejor).
export const DESKTOP_MOTION = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
