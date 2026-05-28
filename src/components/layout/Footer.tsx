import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/contact";

const productLinks = [
  { label: "Características", href: "#caracteristicas" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Preguntas frecuentes", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

const legalLinks = [
  { label: "Privacidad", href: "#" },
  { label: "Términos", href: "#" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-gradient-to-br from-[#071A1F] via-[#0D252C] to-[#123A43] text-white pt-16 pb-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[#14B875]/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#087A5A]/12 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/brand/isologo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 select-none object-contain"
                draggable={false}
              />
              <span className="font-sora font-bold text-white text-xl leading-none tracking-tight select-none">
                Dioptrika
              </span>
            </div>
            <p className="text-white/65 text-sm font-inter leading-relaxed max-w-sm mb-6">
              Software clínico especializado para ópticas. Centraliza historias
              clínicas, órdenes de laboratorio, inventario y facturación.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-btn text-white text-sm font-medium transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
              >
                <MessageCircle className="w-4 h-4" />
                {WHATSAPP_DISPLAY}
              </a>
              <a
                href={CONTACT_EMAIL_HREF}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-white/8 border border-[#1D4650] text-white text-sm font-medium transition-all hover:bg-white/12 hover:border-[#14B875]/50 hover:-translate-y-0.5"
              >
                <Mail className="w-4 h-4" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-8">
            <p className="font-sora font-semibold text-sm mb-4 text-white/85">
              Producto
            </p>
            <ul className="space-y-2.5 text-sm font-inter text-white/60">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-[#14B875] transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-sora font-semibold text-sm mb-4 text-white/85">
              Legal
            </p>
            <ul className="space-y-2.5 text-sm font-inter text-white/60">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-[#14B875] transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-inter text-white/45">
          <p>© {year} Dioptrika. Todos los derechos reservados.</p>
          <p className="flex items-center gap-2">
            <span className="text-white/55">Producto de</span>
            <span className="text-white/70 font-medium tracking-wide">LatamSoft</span>
            <span className="text-white/20">·</span>
            <span>Hecho en Latinoamérica</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
