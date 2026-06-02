/** @type {import('next').NextConfig} */

// ============================================================================
// Content Security Policy
// ----------------------------------------------------------------------------
// La Cajita de Payphone es un widget de terceros: carga un script desde su CDN,
// hace requests a su API y abre iframes (tarjeta / OTP / 3DS). El paso 3DS
// REDIRIGE al dominio del banco emisor (impredecible), por eso frame-src y
// form-action incluyen `https:`.
//
// DESPLIEGUE SEGURO: se arranca en modo REPORT-ONLY (solo reporta, no bloquea).
// Tras probar un pago COMPLETO en modo Prueba y confirmar 0 violaciones en la
// consola, cambiar CSP_REPORT_ONLY a `false` para hacerla efectiva (enforcing).
// ============================================================================
const CSP_REPORT_ONLY = false;

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval': Next.js (App Router) inyecta scripts inline +
  // framer-motion; cdn.payphonetodoesposible.com sirve la Cajita.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.payphonetodoesposible.com",
  // 'unsafe-inline': estilos inline de framer-motion y de la Cajita.
  "style-src 'self' 'unsafe-inline'",
  // Fuentes self-hosted (same-origin) + data: por si algún glyph embebido.
  "font-src 'self' data:",
  // data: para el SVG de ruido; blob: para texturas WebGL (R3F); logos de Payphone.
  "img-src 'self' data: blob: https://*.payphonetodoesposible.com",
  // Nuestra API + API de Payphone.
  "connect-src 'self' https://*.payphonetodoesposible.com",
  // Iframes de la Cajita + redirección 3DS al banco (https: a propósito).
  "frame-src 'self' https://*.payphonetodoesposible.com https:",
  // El 3DS hace POST al ACS del banco (https: a propósito).
  "form-action 'self' https://*.payphonetodoesposible.com https:",
  // Anti-clickjacking de NUESTRO sitio (la Cajita es hija, no ancestro).
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
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
  // HSTS: el sitio ya está en HTTPS (dioptrika.com). Añadir `; preload` solo si
  // se va a enviar el dominio a la lista de HSTS preload.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
