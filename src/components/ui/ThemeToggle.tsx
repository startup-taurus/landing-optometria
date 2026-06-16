'use client';

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle, mounted } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors duration-300 hover:border-brand/55 hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/50",
        className
      )}
    >
      <Sun
        aria-hidden
        strokeWidth={1.8}
        className={cn(
          "absolute h-[18px] w-[18px] transition-all duration-300 ease-out-expo",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        )}
      />
      <Moon
        aria-hidden
        strokeWidth={1.8}
        className={cn(
          "absolute h-[18px] w-[18px] transition-all duration-300 ease-out-expo",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
      />
      <span className="sr-only">
        {mounted ? (isDark ? "Modo oscuro activo" : "Modo claro activo") : "Tema"}
      </span>
    </button>
  );
}
