'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  variant?: "hero" | "soft" | "intense";
}

export default function AnimatedGradientBackground({
  className,
  variant = "hero",
}: AnimatedGradientBackgroundProps) {
  const blobs =
    variant === "intense"
      ? [
          { color: "#0EA5E9", size: 520, x: "10%", y: "20%", opacity: 0.45 },
          { color: "#0D9488", size: 440, x: "75%", y: "55%", opacity: 0.35 },
          { color: "#1E3A5F", size: 380, x: "40%", y: "85%", opacity: 0.3 },
          { color: "#7DD3FC", size: 300, x: "85%", y: "10%", opacity: 0.4 },
        ]
      : variant === "soft"
        ? [
            { color: "#0EA5E9", size: 420, x: "15%", y: "30%", opacity: 0.18 },
            { color: "#0D9488", size: 360, x: "80%", y: "70%", opacity: 0.16 },
          ]
        : [
            { color: "#0EA5E9", size: 460, x: "12%", y: "20%", opacity: 0.28 },
            { color: "#0D9488", size: 420, x: "78%", y: "60%", opacity: 0.22 },
            { color: "#7DD3FC", size: 340, x: "60%", y: "10%", opacity: 0.24 },
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
          className="absolute rounded-full will-change-transform"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            background: b.color,
            opacity: b.opacity,
            filter: "blur(90px)",
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.08, 0.94, 1],
          }}
          transition={{
            duration: 18 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
