'use client';

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import {
  blurIn,
  fadeInLeft,
  fadeInRight,
  fadeInUp,
  irisIn,
  scaleIn,
  VIEWPORT_DEFAULT,
} from "@/lib/animations";

type RevealVariant = "up" | "left" | "right" | "scale" | "blur" | "iris";

const variantMap: Record<RevealVariant, Variants> = {
  up: fadeInUp,
  left: fadeInLeft,
  right: fadeInRight,
  scale: scaleIn,
  blur: blurIn,
  iris: irisIn,
};

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "li" | "span";
}

export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as] as typeof motion.div;
  const baseVariants = variantMap[variant];

  return (
    <MotionTag
      className={className}
      variants={baseVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_DEFAULT}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
