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
          { color: "#0EA5E9", size: 380, x: "18%", y: "30%", opacity: 0.18 },
          { color: "#0D9488", size: 340, x: "78%", y: "70%", opacity: 0.16 },
        ]
      : [
          { color: "#0EA5E9", size: 420, x: "15%", y: "25%", opacity: 0.26 },
          { color: "#0D9488", size: 380, x: "78%", y: "60%", opacity: 0.22 },
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
            filter: "blur(70px)",
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
