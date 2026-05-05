import { Eye, Mail, MessageCircle } from "lucide-react";
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
    <footer className="relative bg-gradient-to-br from-navy-deep via-navy to-[#0c1f3a] text-white pt-16 pb-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-sky/15 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-teal/15 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky to-teal flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" strokeWidth={2.4} />
              </div>
              <span className="font-jakarta font-extrabold text-lg">
                Latam<span className="text-sky">Soft</span>
              </span>
            </div>
            <p className="text-white/65 text-sm font-inter leading-relaxed max-w-sm mb-6">
              Software de gestión todo-en-uno para clínicas oftalmológicas y ópticas
              en Latinoamérica.
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-white/10 text-white text-sm font-medium transition-all hover:bg-white/20 hover:-translate-y-0.5"
              >
                <Mail className="w-4 h-4" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-8">
            <p className="font-jakarta font-semibold text-sm mb-4 text-white/85">
              Producto
            </p>
            <ul className="space-y-2.5 text-sm font-inter text-white/60">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-jakarta font-semibold text-sm mb-4 text-white/85">
              Legal
            </p>
            <ul className="space-y-2.5 text-sm font-inter text-white/60">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-inter text-white/45">
          <p>© {year} LatamSoft. Todos los derechos reservados.</p>
          <p>Hecho con ♥ en Latinoamérica</p>
        </div>
      </div>
    </footer>
  );
}
