'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  variant?: "hero" | "soft";
}

export default function AnimatedGradientBackground({
  className,
  variant = "hero",
}: AnimatedGradientBackgroundProps) {
  const blobs =
    variant === "soft"
      ? [
          { color: "#14B875", size: 360, x: "82%", y: "65%", opacity: 0.10 },
        ]
      : [
          { color: "#14B875", size: 460, x: "80%", y: "20%", opacity: 0.18 },
          { color: "#087A5A", size: 380, x: "12%", y: "78%", opacity: 0.12 },
        ];

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            background: b.color,
            opacity: b.opacity,
            filter: "blur(90px)",
            transform: "translate3d(-50%, -50%, 0)",
            willChange: "transform",
          }}
          animate={{
            x: [0, 24, -16, 0],
            y: [0, -20, 16, 0],
          }}
          transition={{
            duration: 22 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
