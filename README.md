# LatamSoft Landing Page

Landing oficial de LatamSoft — software de gestión para clínicas de optometría y ópticas en Latinoamérica.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — design tokens + utilidades
- **Framer Motion** — reveals on-scroll, magnetic buttons, parallax, drawer mobile
- **GSAP + ScrollTrigger** — animaciones de paths SVG y badges con bounce
- **Lenis** — smooth scroll conectado al ticker de GSAP (respeta `prefers-reduced-motion`)
- **Lucide React** — iconografía

## Setup

```bash
npm install
cp .env.example .env.local   # ajusta NEXT_PUBLIC_SITE_URL
npm run dev
```

La app corre en http://localhost:3000

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio. Usada en `metadataBase`, `sitemap.xml`, `robots.txt` y JSON-LD. En desarrollo cae a `http://localhost:3000`. |

## Datos de contacto

Centralizados en [`src/lib/contact.ts`](src/lib/contact.ts):

- WhatsApp: `+593 99 592 3599`
- Email: `ridencedenods@gmail.com`

Editar ahí para actualizar todos los CTAs en una sola operación.

## Estructura

```
src/
  app/
    layout.tsx              ← Metadata + viewport + JSON-LD + Google Fonts
    page.tsx                ← Composición + Lenis hook + FloatingWhatsApp
    globals.css             ← Tailwind + utilidades custom (glass, text-aurora)
    sitemap.ts              ← Sitemap dinámico
    robots.ts               ← robots.txt dinámico
    manifest.ts             ← Web manifest
    icon.svg                ← Favicon
    opengraph-image.tsx     ← OG image generada con ImageResponse
    twitter-image.tsx       ← Re-export de la OG image
  components/
    ui/
      Button.tsx                       ← Variants: primary / outline / ghost / whatsapp
      Badge.tsx
      Card.tsx
      Reveal.tsx                       ← Wrapper de fade-in on-scroll
      MagneticButton.tsx               ← Cursor-follow magnetic effect
      AnimatedGradientBackground.tsx   ← Blobs animados (mesh gradient)
      TiltCard.tsx                     ← 3D tilt on hover
      FloatingWhatsApp.tsx             ← FAB mobile con pulso
    seo/
      StructuredData.tsx               ← JSON-LD Organization + SoftwareApplication
    layout/
      Navbar.tsx              ← Sticky con drawer mobile y CTA magnetic
      Footer.tsx              ← Footer con gradiente y CTAs
    sections/
      Hero.tsx                ← Mockup parallax + blobs animados
      Differentiators.tsx     ← 4 cards de "Por qué LatamSoft" (sin números falsos)
      Features.tsx            ← Grid 8 cards con TiltCard
      HowItWorks.tsx          ← Path SVG animado + steps
      Contact.tsx             ← Form que abre WhatsApp pre-llenado
  hooks/
    useLenis.ts               ← Lenis + GSAP ticker (respeta reduce-motion)
  lib/
    contact.ts                ← Constantes de WhatsApp / email
    seo.ts                    ← Metadata defaults centralizados
    animations.ts             ← Variantes Framer Motion + helper GSAP
    utils.ts                  ← cn()
```

## Personalización

- **Colores y gradientes**: `tailwind.config.ts` → `theme.extend.colors` / `backgroundImage`
- **Contenido**: editar directamente cada sección en `src/components/sections/`
- **SEO defaults**: `src/lib/seo.ts` (title, description, keywords)

## Próximos pasos sugeridos

- Conectar el form de contacto a un backend real (Resend, Formspree o API route)
- Reemplazar el browser-mockup ilustrado por screenshots del sistema real
- Generar `apple-icon.png` (180x180) cuando exista logo definitivo
- Configurar `NEXT_PUBLIC_SITE_URL` con el dominio definitivo
