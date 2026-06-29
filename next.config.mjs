/** @type {import('next').NextConfig} */

// ============================================================================
// Content Security Policy
// ----------------------------------------------------------------------------
// La Cajita de Payphone es un widget de terceros: carga un script + su CSS desde
// su CDN, hace requests a su API y abre iframes (tarjeta / OTP / 3DS). El paso 3DS
// usa CardinalCommerce "Songbird" (*.cardinalcommerce.com / *.ccdc02.com) y REDIRIGE
// al dominio del banco emisor (impredecible), por eso frame-src y form-action
// incluyen `https:`. Si NO se permiten los dominios de Cardinal, el script no carga
// y revienta con "ReferenceError: Cardinal is not defined" al tipear la tarjeta.
//
// DESPLIEGUE SEGURO: prueba un pago COMPLETO en modo Prueba y confirma 0 violaciones
// en la consola. Para depurar sin bloquear, pon CSP_REPORT_ONLY = true temporalmente.
// ============================================================================
const CSP_REPORT_ONLY = false;

// `upgrade-insecure-requests` fuerza https en TODAS las sub-requests. Útil en
// producción (detrás de nginx con HTTPS), pero ROMPE las pruebas locales por http
// (npm run dev / Docker en 127.0.0.1). Por eso es OPT-IN: en prod pon
// CSP_UPGRADE_INSECURE=true en el entorno; en local/sandbox déjalo sin definir.
const UPGRADE_INSECURE = process.env.CSP_UPGRADE_INSECURE === "true";

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval': Next.js (App Router) inyecta scripts inline +
  // framer-motion; *.payphonetodoesposible.com sirve la Cajita; Cardinal (Songbird)
  // corre el 3-D-Secure.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.payphonetodoesposible.com https://*.cardinalcommerce.com https://*.ccdc02.com",
  // 'unsafe-inline': estilos inline de framer-motion y de la Cajita. La Cajita v2.0
  // REQUIERE su hoja de estilos servida desde el CDN de Payphone.
  "style-src 'self' 'unsafe-inline' https://*.payphonetodoesposible.com https://*.cardinalcommerce.com",
  // Fuentes self-hosted (same-origin) + data: por si algún glyph embebido.
  "font-src 'self' data:",
  // data: para SVG/ruido inline; blob: para texturas WebGL (R3F); logos + 3DS.
  "img-src 'self' data: blob: https://*.payphonetodoesposible.com https://*.cardinalcommerce.com",
  // Nuestra API + API de Payphone + recolección de dispositivo de Cardinal (3DS).
  // ipinfo.io: la Cajita lo consulta para geolocalizar la IP y prerellenar el
  // código de país del teléfono. Sin permitirlo, la consola muestra una violación
  // de CSP ("Connecting to 'https://ipinfo.io/' violates… connect-src").
  "connect-src 'self' https://*.payphonetodoesposible.com https://*.cardinalcommerce.com https://*.ccdc02.com https://ipinfo.io",
  // Iframes de la Cajita + Cardinal + redirección 3DS al banco (https: a propósito).
  "frame-src 'self' https://*.payphonetodoesposible.com https://*.cardinalcommerce.com https:",
  // El 3DS hace POST al ACS del banco / Cardinal (https: a propósito).
  "form-action 'self' https://*.payphonetodoesposible.com https://*.cardinalcommerce.com https:",
  // Anti-clickjacking de NUESTRO sitio (la Cajita es hija, no ancestro).
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  ...(UPGRADE_INSECURE ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  {
    key: CSP_REPORT_ONLY
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // HSTS: solo aplica sobre HTTPS (los navegadores lo ignoran sobre http, así que
  // no estorba en las pruebas locales). Añade `; preload` solo si vas a enviar el
  // dominio a la lista de HSTS preload.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Salida "standalone": Next empaqueta un server.js + node_modules mínimos en
  // .next/standalone → imagen Docker pequeña y autónoma (no necesita el repo).
  output: "standalone",
  experimental: {
    // Reescribe los imports "barrel" a imports directos → el compilador (dev y
    // build) solo procesa los íconos/módulos REALMENTE usados en vez de todo el
    // paquete. Baja el costo de compilación en frío (lucide-react se importa en
    // ~24 archivos; framer-motion en ~19).
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
