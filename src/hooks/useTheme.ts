'use client';

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

/**
 * Tema claro/oscuro con persistencia en localStorage. El DOM (`data-theme`) es la
 * fuente de verdad — lo fija el script inline de layout.tsx antes del paint, así
 * que aquí solo sincronizamos el estado de React y exponemos `toggle`.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  const apply = useCallback((next: Theme) => {
    const el = document.documentElement;
    el.setAttribute("data-theme", next);
    el.classList.toggle("dark", next === "dark");
    el.style.colorScheme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* almacenamiento no disponible — el tema vive solo en esta sesión */
    }
    setTheme(next);
  }, []);

  const toggle = useCallback(() => {
    apply(readTheme() === "dark" ? "light" : "dark");
  }, [apply]);

  return { theme, setTheme: apply, toggle, mounted };
}
