'use client';

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  duration?: number;
  pad?: number;
  className?: string;
}

export default function CountUp({ to, duration = 1.2, pad = 2, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (typeof window !== "undefined") {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setValue(to);
        return;
      }
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {String(value).padStart(pad, "0")}
    </span>
  );
}
