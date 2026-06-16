import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import StructuredData from "@/components/seo/StructuredData";

// Tipografía de marca. next/font/google las descarga en BUILD y las sirve desde
// tu propio origen → CERO requests a Google en runtime (privacidad + velocidad,
// igual que antes). Elegidas por su carácter y por ser poco frecuentes en sitios
// generados por IA:
//   display (titulares) -> Bricolage Grotesque (grotesca contemporánea con personalidad)
//   body (cuerpo/UI)    -> Hanken Grotesk (limpia, legible, cálida)
// Mapeadas a las MISMAS CSS vars que ya consume Tailwind (font-sora/font-inter).
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Clash Display", "Sora", "system-ui", "sans-serif"],
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  fallback: ["Satoshi", "Inter", "system-ui", "sans-serif"],
});
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
  themeColor: "#071A1F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`dark ${display.variable} ${body.variable}`}
      data-theme="dark"
    >
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
