'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CursorSpotlightProps {
  children: ReactNode;
  className?: string;
  size?: number;
  color?: string;
}

export default function CursorSpotlight({
  children,
  className,
  size = 420,
  color = "rgba(20,184,117,0.14)",
}: CursorSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(mq.matches && !reduce);
    const onChange = () => setEnabled(mq.matches && !reduce);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    function onMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    }
    function onLeave() {
      el.style.setProperty("--mx", `-9999px`);
      el.style.setProperty("--my", `-9999px`);
    }
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  const style = {
    "--spot-size": `${size}px`,
    "--spot-color": color,
    "--mx": "-9999px",
    "--my": "-9999px",
  } as CSSProperties;

  return (
    <div ref={ref} className={cn("relative", className)} style={style}>
      {children}
      {enabled && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(var(--spot-size) circle at var(--mx) var(--my), var(--spot-color), transparent 60%)",
          }}
        />
      )}
    </div>
  );
}
