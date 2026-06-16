'use client';

import ScrollHighlight from "@/components/ui/ScrollHighlight";
import Parallax from "@/components/ui/Parallax";

// Banda "manifiesto": al scrollear, la frase se ilumina palabra por palabra
// (efecto estilo Sira) mientras una palabra gigante de fondo hace parallax.
export default function ScrollStatement() {
  return (
    <section className="relative bg-[#071A1F] overflow-hidden py-28 sm:py-40 border-y border-[#1D4650]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14B875]/25 to-transparent"
      />

      {/* Palabra de fondo con parallax (movimiento marcado al scrollear) */}
      <Parallax
        speed={-40}
        className="pointer-events-none absolute -right-6 sm:-right-10 top-6 select-none hidden md:block"
      >
        <span
          className="font-sora font-black leading-none text-[#14B875]/[0.05]"
          style={{ fontSize: "clamp(150px, 22vw, 340px)", letterSpacing: "-0.04em" }}
        >
          óptica
        </span>
      </Parallax>

      <div className="relative max-w-5xl mx-auto px-6">
        <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-[#14B875] mb-7">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#14B875]" />
          Una sola plataforma
        </span>

        <ScrollHighlight
          as="p"
          className="font-sora font-semibold text-white tracking-tight leading-[1.18]"
          style={{ fontSize: "clamp(26px, 3.4vw, 46px)" }}
          text="Deja atrás las libretas, el Excel y los WhatsApp sueltos. Dioptrika reúne historia clínica, refracciones, pedidos a laboratorio, inventario y facturación en un solo lugar, hecho para la realidad de las ópticas en Latinoamérica."
        />
      </div>
    </section>
  );
}
