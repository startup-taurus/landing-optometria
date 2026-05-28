import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dioptrika brand tokens (semantic names preserved to minimize churn)
        navy: {
          DEFAULT: "#123A43", // petroleum
          deep: "#071A1F",    // dark background
          light: "#1D4650",   // dark border
        },
        sky: {
          DEFAULT: "#14B875", // dioptrika green
          soft: "#5FD4A0",
          deep: "#01AF76",    // green master (logo sample)
        },
        teal: {
          DEFAULT: "#087A5A", // green deep
          soft: "#7AD9B5",
        },
        text: {
          DEFAULT: "#F8FBFA", // white optical
          muted: "#B7D1D2",   // muted dark
        },
        border: "#1D4650",
        bg: {
          DEFAULT: "#071A1F", // dark
          soft: "#0D252C",    // dark surface
          slate: "#0D252C",
          blue: "#123A43",    // petroleum accent
        },
        light: {
          bg: "#F8FBFA",
          surface: "#FFFFFF",
          text: "#1F2B36",
          muted: "#6B7280",
          border: "#DCEBE7",
        },
        dioptrika: {
          green: "#14B875",
          "green-master": "#01AF76",
          "green-deep": "#087A5A",
          "green-soft": "#5FD4A0",
          petroleum: "#123A43",
          dark: "#071A1F",
          "dark-surface": "#0D252C",
          "border-dark": "#1D4650",
          white: "#F8FBFA",
          graphite: "#1F2B36",
          "muted-dark": "#B7D1D2",
          "border-light": "#DCEBE7",
        },
      },
      fontFamily: {
        sora: ["Sora", "Manrope", "Inter", "sans-serif"],
        // backwards-compat alias so existing font-jakarta classes still resolve
        jakarta: ["Sora", "Manrope", "Inter", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        btn: "10px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.22)",
        "card-hover": "0 18px 48px rgba(0,0,0,0.35)",
        "glow-sky": "0 18px 60px -10px rgba(20,184,117,0.45)",
        "glow-teal": "0 18px 60px -10px rgba(8,122,90,0.45)",
        "glow-navy": "0 24px 80px -20px rgba(18,58,67,0.65)",
      },
      backgroundImage: {
        "gradient-aurora":
          "linear-gradient(120deg, #14B875 0%, #5FD4A0 35%, #087A5A 75%, #123A43 100%)",
        "gradient-mesh":
          "radial-gradient(at 20% 20%, rgba(20,184,117,0.16) 0%, transparent 50%), radial-gradient(at 80% 0%, rgba(8,122,90,0.14) 0%, transparent 50%), radial-gradient(at 50% 100%, rgba(1,175,118,0.10) 0%, transparent 55%)",
        "gradient-text-aurora":
          "linear-gradient(120deg, #14B875 0%, #5FD4A0 50%, #01AF76 100%)",
        "gradient-card-border":
          "linear-gradient(140deg, rgba(20,184,117,0.55), rgba(8,122,90,0.4) 50%, rgba(255,255,255,0))",
        noise:
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
      },
      keyframes: {
        "blob-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.06)" },
          "66%": { transform: "translate(-20px, 30px) scale(0.96)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "blob-drift": "blob-drift 18s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
      },
    },
  },
  plugins: [],
};
export default config;
