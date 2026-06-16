'use client';

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

// Tarjeta "liquid glass" en 3D: se inclina siguiendo el cursor con física de
// resorte (inercia real) y un brillo especular la recorre. Solo transform +
// opacidad. Se desactiva en táctil / <1024px / prefers-reduced-motion. Replica
// la sensación interactiva del hero en los mockups de producto.
export default function TiltCard({
  children,
  className,
  intensity = 8,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(mq.matches && !reduce);
    const onChange = () => setEnabled(mq.matches && !reduce);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 17, mass: 0.4 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-intensity, intensity]);

  // Posición del especular (0..100%) a partir del cursor amortiguado.
  const glossX = useTransform(springX, (v) => `${(v + 0.5) * 100}%`);
  const glossY = useTransform(springY, (v) => `${(v + 0.5) * 100}%`);
  const gloss = useMotionTemplate`radial-gradient(circle 200px at ${glossX} ${glossY}, rgba(255,255,255,0.16), transparent 56%)`;

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  }

  function handleLeave() {
    if (!enabled) return;
    x.set(0);
    y.set(0);
  }

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }}
      className={cn("group/tilt relative will-change-transform", className)}
    >
      {children}
      {/* filo de vidrio superior + especular que sigue el cursor */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px rounded-t-[inherit] bg-gradient-to-r from-transparent via-white/45 to-transparent"
      />
      <motion.span
        aria-hidden
        style={{ background: gloss }}
        className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
      />
    </motion.div>
  );
}
