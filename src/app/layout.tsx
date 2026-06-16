import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Spline_Sans_Mono } from "next/font/google";
import StructuredData from "@/components/seo/StructuredData";

// Tipografía "instrumento óptico". next/font/google las descarga en BUILD y las
// sirve desde tu propio origen → CERO requests a Google en runtime.
//   display + body -> Schibsted Grotesk (una sola familia, contraste de peso:
//                     grotesca precisa, moderna, legible; poco usada por IA)
//   mono           -> Spline Sans Mono (SOLO datos ópticos / micro-labels:
//                     dioptrías, ejes, unidades — la marca ES medición)
// --font-body se mapea a --font-display en globals.css.
const display = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

// Evita el "flash" de tema: fija data-theme ANTES del paint. Prioridad:
// ?theme= (override explícito) > localStorage > CLARO por defecto.
// Permitido por la CSP ('unsafe-inline' en script-src).
const themeInitScript = `(function(){try{var d=document.documentElement;var p=new URLSearchParams(location.search).get('theme');var s=localStorage.getItem('theme');var t=(p==='dark'||p==='light')?p:((s==='dark'||s==='light')?s:'light');d.setAttribute('data-theme',t);d.classList.toggle('dark',t==='dark');d.style.colorScheme=t;}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_TITLE_TEMPLATE,
  SITE_URL,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE_DEFAULT,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "LatamSoft" }, { name: SITE_NAME }],
  creator: "LatamSoft",
  publisher: "LatamSoft",
  category: "technology",
  alternates: {
    canonical: "/",
    languages: {
      "es-LA": "/",
      "es-EC": "/",
      "es-MX": "/",
      "es-CO": "/",
      "es-PE": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — software clínico para ópticas`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/brand/isologo.png", type: "image/png" },
    ],
    apple: "/brand/isologo.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7FAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#071A1F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-theme="light"
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
