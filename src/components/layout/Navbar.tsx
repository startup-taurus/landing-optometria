'use client';

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/ui/MagneticButton";
import { WHATSAPP_URL } from "@/lib/contact";
import { useActiveSection } from "@/hooks/useActiveSection";

const NAV_LINKS = [
  { label: "Características", href: "#caracteristicas" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Planes", href: "#planes" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

const SCROLL_RANGE: [number, number] = [0, 80];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const activeSection = useActiveSection(SECTION_IDS);

  const navTop = useTransform(scrollY, SCROLL_RANGE, [0, 14]);
  const navMaxWidth = useTransform(scrollY, SCROLL_RANGE, ["100%", "960px"]);
  const navRadius = useTransform(scrollY, SCROLL_RANGE, [0, 9999]);
  const navBg = useTransform(scrollY, SCROLL_RANGE, [
    "rgba(7,26,31,0)",
    "rgba(13,37,44,0.78)",
  ]);
  const navBorder = useTransform(scrollY, SCROLL_RANGE, [
    "rgba(29,70,80,0)",
    "rgba(29,70,80,0.65)",
  ]);
  const navShadow = useTransform(scrollY, SCROLL_RANGE, [
    "0 0 0 rgba(0,0,0,0)",
    "0 12px 40px -10px rgba(0,0,0,0.55)",
  ]);
  const navBackdrop = useTransform(scrollY, SCROLL_RANGE, [
    "blur(0px) saturate(100%)",
    "blur(18px) saturate(160%)",
  ]);
  const navMarginX = useTransform(scrollY, SCROLL_RANGE, ["0px", "12px"]);

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
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <motion.nav
          style={{
            top: navTop,
            maxWidth: navMaxWidth,
            marginLeft: navMarginX,
            marginRight: navMarginX,
            borderRadius: navRadius,
            backgroundColor: navBg,
            borderColor: navBorder,
            boxShadow: navShadow,
            backdropFilter: navBackdrop,
            WebkitBackdropFilter: navBackdrop,
          }}
          className="pointer-events-auto relative mx-auto border border-transparent transition-[max-width,margin] duration-300 ease-out"
        >
          <div className="px-4 sm:px-5 h-16 flex items-center justify-between gap-4">
            <motion.a
              href="#"
              className="flex items-center gap-2.5 group shrink-0"
              whileHover={{ scale: 1.02 }}
              aria-label="Dioptrika — inicio"
            >
              <Image
                src="/brand/isologo.png"
                alt=""
                width={40}
                height={40}
                priority
                className="h-9 w-9 sm:h-10 sm:w-10 select-none object-contain"
                draggable={false}
              />
              <span className="font-sora font-bold text-white text-xl leading-none tracking-tight select-none">
                Dioptrika
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
                      isActive ? "text-[#14B875]" : "text-[#B7D1D2] hover:text-white"
                    }`}
                  >
                    {link.label}
                    <motion.span
                      aria-hidden
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#14B875] to-[#087A5A] origin-left rounded-full"
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
              className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.nav>
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
              className="md:hidden fixed inset-0 z-40 bg-[#071A1F]/70 backdrop-blur-sm"
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 30 }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-[82%] max-w-sm bg-[#0D252C] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] flex flex-col border-l border-[#1D4650]"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-[#1D4650]">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/brand/isologo.png"
                    alt=""
                    width={40}
                    height={40}
                    className="h-9 w-9 select-none object-contain"
                    draggable={false}
                  />
                  <span className="font-sora font-bold text-white text-xl leading-none tracking-tight select-none">
                    Dioptrika
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-white hover:bg-white/10"
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
                    className="px-4 py-3 rounded-btn font-sora font-semibold text-white text-lg hover:bg-white/5 hover:text-[#14B875] transition-colors"
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
