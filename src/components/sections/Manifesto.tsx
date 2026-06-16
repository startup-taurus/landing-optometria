'use client';

import Parallax from "@/components/ui/Parallax";
import ScrollHighlight from "@/components/ui/ScrollHighlight";

function ReticleSVG({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 400 400" className={className} fill="none" stroke="currentColor">
      <circle cx="200" cy="200" r="70" strokeWidth="1" />
      <circle cx="200" cy="200" r="135" strokeWidth="1" opacity="0.7" />
      <circle cx="200" cy="200" r="195" strokeWidth="1" opacity="0.45" />
      <path d="M200 4 V396 M4 200 H396" strokeWidth="1" opacity="0.5" />
      <path d="M200 130 v-16 M200 270 v16 M130 200 h-16 M270 200 h16" strokeWidth="1.5" />
    </svg>
  );
}

export default function Manifesto() {
  return (
    <section className="relative overflow-hidden bg-canvas py-32 sm:py-44">
      <div aria-hidden className="optical-grid pointer-events-none absolute inset-0 opacity-50" />

      {/* Retícula que deriva con el scroll (parallax) y gira lento (motivo óptico). */}
      <Parallax
        speed={-30}
        className="pointer-events-none absolute -right-28 top-1/2 hidden -translate-y-1/2 lg:block"
      >
        <ReticleSVG className="reticle-spin h-[520px] w-[520px] text-brand/[0.12]" />
      </Parallax>

      <div className="relative mx-auto max-w-4xl px-6">
        <ScrollHighlight
          as="p"
          className="font-display font-semibold leading-[1.24] tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.55rem, 3.4vw, 2.7rem)" }}
          text="Deja atrás las libretas, el Excel y los WhatsApp sueltos. Dioptrika reúne historia clínica, refracciones, pedidos a laboratorio, inventario y facturación en un solo lugar, hecho para la realidad de las ópticas en Latinoamérica."
        />
      </div>
    </section>
  );
}
