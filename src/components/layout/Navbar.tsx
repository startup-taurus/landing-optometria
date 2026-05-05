'use client';

import { AnimatePresence, motion, useScroll } from "framer-motion";
import { Eye, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/ui/MagneticButton";
import { WHATSAPP_URL } from "@/lib/contact";
import { useActiveSection } from "@/hooks/useActiveSection";

const NAV_LINKS = [
  { label: "Características", href: "#caracteristicas" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

// Stable reference so the hook's effect only runs once
const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const activeSection = useActiveSection(SECTION_IDS);

  useEffect(() => {
    return scrollY.on("change", (y) => setScrolled(y > 50));
  }, [scrollY]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
        animate={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
          boxShadow: scrolled
            ? "0 1px 24px rgba(15,23,42,0.08)"
            : "0 0px 0px rgba(0,0,0,0)",
          borderBottom: scrolled ? "1px solid #E2E8F0" : "1px solid transparent",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <motion.a
            href="#"
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              whileHover={{ rotate: -8 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky to-teal flex items-center justify-center shadow-glow-sky/40"
            >
              <Eye className="w-4.5 h-4.5 text-white" strokeWidth={2.4} />
            </motion.div>
            <span className="font-jakarta font-extrabold text-navy text-lg tracking-tight">
              Latam<span className="text-sky">Soft</span>
            </span>
          </motion.a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial="idle"
                  animate={isActive ? "active" : "idle"}
                  whileHover="hovered"
                  className={`relative font-inter text-sm font-medium transition-colors ${
                    isActive ? "text-navy" : "text-text-muted hover:text-navy"
                  }`}
                >
                  {link.label}
                  <motion.span
                    aria-hidden
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-sky to-teal origin-left"
                    variants={{
                      idle: { scaleX: 0 },
                      active: { scaleX: 1 },
                      hovered: { scaleX: 1 },
                    }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                </motion.a>
              );
            })}
          </nav>

          <div className="hidden md:block">
            <MagneticButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm">Solicitar demo</Button>
            </MagneticButton>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-lg text-navy hover:bg-bg-soft transition-colors"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-[82%] max-w-sm bg-white shadow-2xl flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                <span className="font-jakarta font-extrabold text-navy text-lg">
                  Latam<span className="text-sky">Soft</span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-navy hover:bg-bg-soft"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-6 py-8 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.07 }}
                    className="px-4 py-3 rounded-btn font-jakarta font-semibold text-navy text-lg hover:bg-bg-soft transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
              <div className="px-6 pb-8">
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
