'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const BARS = [38, 56, 44, 72, 60, 88, 96];

export default function MiniBarChart({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: false, margin: "-15%" });
  const max = 100;
  const barWidth = 16;
  const gap = 10;
  const totalWidth = BARS.length * barWidth + (BARS.length - 1) * gap;
  const height = 110;

  return (
    <svg
      ref={ref}
      className={className}
      viewBox={`0 0 ${totalWidth} ${height}`}
      preserveAspectRatio="xMidYEnd meet"
      role="img"
      aria-label="Tendencia de ventas semanal"
    >
      <line
        x1={0}
        y1={height - 0.5}
        x2={totalWidth}
        y2={height - 0.5}
        stroke="rgba(183,209,210,0.18)"
        strokeWidth={1}
      />
      {BARS.map((v, i) => {
        const h = (v / max) * (height - 8);
        const x = i * (barWidth + gap);
        const isLast = i === BARS.length - 1;
        return (
          <motion.rect
            key={i}
            x={x}
            y={height - h}
            width={barWidth}
            height={h}
            rx={3}
            fill={isLast ? "url(#bar-grad-active)" : "url(#bar-grad-base)"}
            initial={{ scaleY: 0, transformOrigin: "bottom" }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
            style={{ transformOrigin: `${x + barWidth / 2}px ${height}px` }}
            transition={{
              duration: 0.7,
              delay: 0.06 * i,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        );
      })}
      <defs>
        <linearGradient id="bar-grad-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7AD9B5" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#14B875" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="bar-grad-active" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14B875" />
          <stop offset="100%" stopColor="#087A5A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
