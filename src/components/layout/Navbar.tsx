'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { WHATSAPP_URL } from "@/lib/contact";
import { useActiveSection } from "@/hooks/useActiveSection";

const NAV_LINKS = [
  { label: "Producto", href: "#producto" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Planes", href: "#planes" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const activeSection = useActiveSection(SECTION_IDS);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
        <div
          className={`pointer-events-auto mx-auto transition-[max-width,margin,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out-expo border ${
            scrolled
              ? "mt-3 mx-3 sm:mx-auto max-w-[980px] rounded-pill border-line bg-surface/80 shadow-soft backdrop-blur-xl supports-[backdrop-filter]:bg-surface/70"
              : "mt-0 max-w-7xl rounded-none border-transparent bg-transparent"
          }`}
        >
          <div className="px-4 sm:px-5 h-16 flex items-center justify-between gap-4">
            <a
              href="#"
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="Dioptrika — inicio"
            >
              <Image
                src="/brand/isologo.png"
                alt=""
                width={40}
                height={40}
                priority
                className="h-8 w-8 sm:h-9 sm:w-9 select-none object-contain transition-transform duration-300 group-hover:scale-105"
                draggable={false}
              />
              <span className="font-display font-bold text-ink text-xl leading-none tracking-tight select-none">
                Dioptrika
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`group relative font-body text-sm font-medium transition-colors duration-200 ${
                      isActive ? "text-brand-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {link.label}
                    {/* Subrayado con scaleX (GPU): crece desde la izquierda al
                        pasar el cursor; queda completo en la sección activa. */}
                    <span
                      aria-hidden
                      className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-brand transition-transform duration-300 ease-out-expo ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden md:block">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="sm">Solicitar demo</Button>
                </a>
              </div>
              <button
                onClick={() => setOpen((v) => !v)}
                className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand/55"
                aria-label={open ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={open}
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-[84%] max-w-sm bg-surface flex flex-col border-l border-line shadow-float"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-line">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/brand/isologo.png"
                    alt=""
                    width={36}
                    height={36}
                    className="h-8 w-8 select-none object-contain"
                    draggable={false}
                  />
                  <span className="font-display font-bold text-ink text-lg tracking-tight">
                    Dioptrika
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-line text-ink"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-5 py-6 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.06 }}
                    className="px-4 py-3 rounded-btn font-display font-semibold text-ink text-lg hover:bg-brand/[0.07] hover:text-brand-ink transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
              <div className="px-5 pb-7">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block"
                >
                  <Button size="lg" className="w-full justify-center">
                    Solicitar demo
                  </Button>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
