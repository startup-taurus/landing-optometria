import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1E3A5F",
          deep: "#152A47",
          light: "#34557E",
        },
        sky: {
          DEFAULT: "#0EA5E9",
          soft: "#7DD3FC",
          deep: "#0284C7",
        },
        teal: {
          DEFAULT: "#0D9488",
          soft: "#5EEAD4",
        },
        text: {
          DEFAULT: "#0F172A",
          muted: "#64748B",
        },
        border: "#E2E8F0",
        bg: {
          DEFAULT: "#FFFFFF",
          soft: "#F8FAFC",
          slate: "#F1F5F9",
          blue: "#EFF6FF",
        },
      },
      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        btn: "10px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(15,23,42,0.06)",
        "card-hover": "0 18px 48px rgba(15,23,42,0.14)",
        "glow-sky": "0 18px 60px -10px rgba(14,165,233,0.45)",
        "glow-teal": "0 18px 60px -10px rgba(13,148,136,0.4)",
        "glow-navy": "0 24px 80px -20px rgba(30,58,95,0.55)",
      },
      backgroundImage: {
        "gradient-aurora":
          "linear-gradient(120deg, #0EA5E9 0%, #38BDF8 35%, #0D9488 75%, #1E3A5F 100%)",
        "gradient-mesh":
          "radial-gradient(at 20% 20%, rgba(14,165,233,0.18) 0%, transparent 50%), radial-gradient(at 80% 0%, rgba(13,148,136,0.16) 0%, transparent 50%), radial-gradient(at 50% 100%, rgba(125,211,252,0.18) 0%, transparent 55%)",
        "gradient-text-aurora":
          "linear-gradient(120deg, #0EA5E9 0%, #0D9488 60%, #1E3A5F 100%)",
        "gradient-card-border":
          "linear-gradient(140deg, rgba(14,165,233,0.5), rgba(13,148,136,0.4) 50%, rgba(255,255,255,0))",
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
