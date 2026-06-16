# Design

Visual system for the Dioptrika landing. Concept: **optical instrument** — a precise,
clinical, bright tool for measuring and managing vision. Light by default, dark on toggle
(persisted, no-flash). The brand green is the accent across both worlds; it never becomes
wallpaper.

## Color

Semantic tokens flip on `html[data-theme]`. Components consume tokens, never raw hex.
Brand palette is preserved (same identity green); only *which color dominates* changes.

### Light (default — "sala de examen")
| Token | Value | Use |
|---|---|---|
| `--canvas` | `#F7FAF9` | page background (optical white) |
| `--surface` | `#FFFFFF` | raised panels, cards |
| `--surface-2` | `#EDF3F0` | sunken / subtle fills, inputs |
| `--ink` | `#0E2024` | headings, strong text (~14:1) |
| `--ink-2` | `#2B3E43` | secondary text |
| `--muted` | `#4C5F64` | body-muted (≥4.5:1, verify) |
| `--line` | `#DEE9E4` | hairline borders |
| `--line-strong` | `#C7D8D1` | emphasis borders / ticks |
| `--brand` | `#14B875` | dots, icon fills, accents |
| `--brand-deep` | `#087A5A` | deeper accent / hover |
| `--brand-ink` | `#0A6F4F` | green **as text** on light (≥4.5:1) |
| `--cta` | `#0B7B57` | primary button bg (white text passes AA) |
| `--on-cta` | `#FFFFFF` | text on primary button |
| `--focus` | `#14B875` | focus ring |

### Dark ("cuarto oscuro / foróptero")
| Token | Value | Use |
|---|---|---|
| `--canvas` | `#071A1F` | page background |
| `--surface` | `#0D252C` | cards |
| `--surface-2` | `#102E35` | raised within dark |
| `--ink` | `#F4FAF8` | headings |
| `--ink-2` | `#D6E6E4` | secondary |
| `--muted` | `#A9C7C8` | body-muted (≥4.5:1) |
| `--line` | `#1D4650` | hairlines |
| `--line-strong` | `#2A5A66` | emphasis |
| `--brand` | `#18C47E` | accents |
| `--brand-deep` | `#0FA068` | deeper |
| `--brand-ink` | `#34D699` | green as text on dark |
| `--cta` | `#14B875` | primary button bg |
| `--on-cta` | `#04231A` | dark text on bright green button |
| `--focus` | `#2BD08C` | focus ring |

The **Payphone checkout panel stays dark in both themes** (a dark instrument panel inside the
page), so the working `#pp-button` integration is untouched.

## Typography

- **Schibsted Grotesk** — display + body, single family with weight contrast (precise,
  modern, slightly warm grotesque; not a reflex-reject). 400/500/600/700/800.
- **Geist Mono** — surgical accent ONLY for optical data + micro-labels (diopters `-1.25`,
  axis `180°`, units, section kickers). Justified because the product *is* measurement; never
  body or headings.
- Self-hosted via `next/font/google` (built at compile, zero runtime requests).

Scale (fluid, ≥1.25 ratio):
- display/h1: `clamp(2.6rem, 6vw, 5.25rem)`, w800, ls `-0.03em`, lh 1.0, `text-wrap: balance`
- h2: `clamp(2rem, 4vw, 3.25rem)`, w700, ls `-0.02em`
- h3: `clamp(1.2rem, 2vw, 1.6rem)`, w600
- body: `1.0625rem`, lh 1.6, max measure 68ch, `text-wrap: pretty`
- kicker (mono): `0.75rem`, ls `0.12em`, uppercase — used with intent, NOT on every section

Headings are solid `--ink`; emphasis via a single word in `--brand-ink` or weight — **no
gradient text**.

## Radii & Elevation

- card 14px · button 10px · input 10px · pill 999px (tags only). No 20px+ on cards.
- Define cards by **hairline border** first; shadow only on genuinely floating elements.
  Never pair a 1px border with a ≥16px-blur shadow on the same element (ghost-card ban).
- `--shadow-float` (light): `0 24px 60px -28px rgba(14,32,36,0.22)`
- `--shadow-float` (dark): `0 30px 70px -30px rgba(0,0,0,0.6)`

## Motion

- Hero: masked line-reveal (overflow-hidden + yPercent), staggered, `expo.out`. One
  orchestrated load, not fade-on-scroll-everything.
- Optical motif = the only decorative effect: **focus** (blur→sharp / `irisIn`) on the product
  visual, and thin **reticle / lens hairlines** as texture (replacing blobs + noise).
- Section reveals: gentle, varied per section (not one uniform entrance). `framer-motion`
  in-view.
- `prefers-reduced-motion`: crossfade/instant; reveals enhance already-visible content.
- Keep Lenis smooth scroll. Magnetic effect reserved for the primary hero/nav CTA only.

## Removed (were AI tells in the prior build)

Gradient text (`.text-aurora`) · `feTurbulence` noise · decorative glass (`glass-liquid`) ·
aurora blob drift · chromatic-aberration text · uppercase tracked eyebrow + `01/02/03`
markers on every section · side-stripe gradient bars · gradient borders · ghost-card
(border+big-shadow) · 20px+ card radii.

## Structure (consolidated ~7 sections)

Hero → Why-specialized (was Differentiators) → Before→After (Comparison) → Product/Modules
(Features + ModuleShowcase merged) → How it works → Pricing (Payphone) → FAQ → Contact →
Footer. The "óptica" manifesto (ScrollStatement) folds in as a transition beat. All original
information is preserved.
