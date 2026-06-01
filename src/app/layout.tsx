import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import StructuredData from "@/components/seo/StructuredData";

// Tipografía de marca, self-hosted (Fontshare). Sin requests a Google Fonts.
// Clash Display = titulares/display; Satoshi = cuerpo/interfaz.
// Se exponen como CSS vars y Tailwind las mapea (ver tailwind.config.ts).
const clashDisplay = localFont({
  src: [
    { path: "./fonts/ClashDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  preload: true,
  fallback: ["Sora", "system-ui", "sans-serif"],
});

const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  preload: true,
  fallback: ["Inter", "system-ui", "sans-serif"],
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
      className={`dark ${clashDisplay.variable} ${satoshi.variable}`}
      data-theme="dark"
    >
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
