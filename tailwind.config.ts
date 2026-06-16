import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Tokens semánticos (cambian con [data-theme]) ──
        // Guardados como canales RGB → soportan modificadores de opacidad.
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          2: "rgb(var(--surface-2) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          2: "rgb(var(--ink-2) / <alpha-value>)",
        },
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          deep: "rgb(var(--brand-deep) / <alpha-value>)",
          ink: "rgb(var(--brand-ink) / <alpha-value>)",
        },
        cta: {
          DEFAULT: "rgb(var(--cta) / <alpha-value>)",
          on: "rgb(var(--on-cta) / <alpha-value>)",
        },
        focus: "rgb(var(--focus) / <alpha-value>)",

        // ── Brand raw (referencia / piezas con hex exacto, p.ej. Payphone) ──
        dioptrika: {
          green: "#14B875",
          "green-master": "#01AF76",
          "green-deep": "#087A5A",
          petroleum: "#123A43",
          dark: "#071A1F",
          "dark-surface": "#0D252C",
          white: "#F8FBFA",
          graphite: "#1F2B36",
        },
      },
      fontFamily: {
        // Sistema tipográfico: Schibsted Grotesk (display + body, una familia
        // con contraste de peso) + Geist Mono (datos ópticos / micro-labels).
        display: ["var(--font-display)", "Schibsted Grotesk", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Schibsted Grotesk", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        // Alias heredados (componentes aún usan font-sora / font-inter / font-jakarta)
        sora: ["var(--font-display)", "Schibsted Grotesk", "system-ui", "sans-serif"],
        jakarta: ["var(--font-display)", "Schibsted Grotesk", "system-ui", "sans-serif"],
        inter: ["var(--font-body)", "Schibsted Grotesk", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        btn: "10px",
        pill: "999px",
      },
      boxShadow: {
        float: "var(--shadow-float)",
        soft: "var(--shadow-sm)",
      },
      maxWidth: {
        measure: "68ch",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        focus: {
          "0%": { opacity: "0", filter: "blur(10px)", transform: "scale(0.985)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        focus: "focus 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
