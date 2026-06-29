import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/contact";

const productLinks = [
  { label: "Producto", href: "#producto" },
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
    <footer className="relative border-t border-line bg-surface-2 pb-10 pt-16">
      <div className="mx-auto max-w-6xl px-6 2xl:max-w-[1720px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="mb-4 flex items-center gap-2.5">
              <Image
                src="/brand/isologo.png"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 select-none object-contain"
                draggable={false}
              />
              <span className="font-display text-xl font-bold tracking-tight text-ink">
                Dioptrika
              </span>
            </div>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted">
              Software clínico especializado para ópticas. Centraliza historias clínicas,
              órdenes de laboratorio, inventario y facturación.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-btn px-4 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
              >
                <MessageCircle className="h-4 w-4" />
                {WHATSAPP_DISPLAY}
              </a>
              <a
                href={CONTACT_EMAIL_HREF}
                className="inline-flex items-center gap-2 rounded-btn border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand/45 hover:text-brand-ink"
              >
                <Mail className="h-4 w-4" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-8">
            <p className="mb-4 font-display text-sm font-semibold text-ink">Producto</p>
            <ul className="space-y-2.5 text-sm text-muted">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-brand-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="mb-4 font-display text-sm font-semibold text-ink">Legal</p>
            <ul className="space-y-2.5 text-sm text-muted">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="transition-colors hover:text-brand-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row">
          <p>© {year} Dioptrika. Todos los derechos reservados.</p>
          <p className="flex items-center gap-2">
            <span>Producto de</span>
            <span className="font-medium text-ink-2">LatamSoft</span>
            <span className="text-line-strong">·</span>
            <span>Hecho en Latinoamérica</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
