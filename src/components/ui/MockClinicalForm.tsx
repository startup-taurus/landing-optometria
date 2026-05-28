'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const TYPED_VALUES = ["−2.50", "−1.75 x 90°", "Miopía leve"];

export default function MockClinicalForm({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 3), 3200);
    return () => clearInterval(id);
  }, [reduce]);

  const fields = [
    { label: "AGUDEZA VISUAL OD", filled: step >= 0 },
    { label: "REFRACCIÓN OD", filled: step >= 1 },
    { label: "DIAGNÓSTICO", filled: step >= 2 },
  ];

  const cursorPositions = [
    { top: "33%", left: "70%" },
    { top: "55%", left: "70%" },
    { top: "78%", left: "70%" },
  ];

  return (
    <div className={`relative rounded-xl border border-[#1D4650] bg-[#0D252C]/85 backdrop-blur-sm overflow-hidden ${className || ""}`}>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1D4650] bg-[#071A1F]/60">
        <span className="w-2 h-2 rounded-full bg-rose-400/70" />
        <span className="w-2 h-2 rounded-full bg-amber-300/70" />
        <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
        <span className="ml-2 font-inter text-[10px] uppercase tracking-[0.18em] text-[#B7D1D2]/70">
          Historia clínica · #2841
        </span>
      </div>

      <div className="relative p-4 space-y-3">
        {fields.map((f, i) => (
          <div key={f.label}>
            <p className="font-inter text-[9px] uppercase tracking-[0.18em] text-[#B7D1D2]/60 mb-1">
              {f.label}
            </p>
            <div className="relative h-7 rounded-md border border-[#1D4650] bg-[#123A43] overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: f.filled ? "85%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#14B875]/20 to-[#087A5A]/12"
              />
              <div className="relative h-full px-2.5 flex items-center">
                <motion.span
                  initial={false}
                  animate={{ opacity: f.filled ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: f.filled ? 0.25 : 0 }}
                  className="font-sora font-semibold text-white text-xs"
                >
                  {TYPED_VALUES[i]}
                </motion.span>
              </div>
            </div>
          </div>
        ))}

        {!reduce && (
          <motion.div
            aria-hidden
            animate={{
              top: cursorPositions[step].top,
              left: cursorPositions[step].left,
            }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            className="absolute w-4 h-4 pointer-events-none"
            style={{ filter: "drop-shadow(0 2px 4px rgba(20,184,117,0.5))" }}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 3 L19 12 L12 13 L9 20 Z"
                fill="#F8FBFA"
                stroke="#14B875"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </div>
  );
}
