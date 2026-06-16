'use client';

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Differentiators from "@/components/sections/Differentiators";
import Comparison from "@/components/sections/Comparison";
import Manifesto from "@/components/sections/Manifesto";
import ModuleShowcase from "@/components/sections/ModuleShowcase";
import HowItWorks from "@/components/sections/HowItWorks";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

export default function Home() {
  useLenis();

  useEffect(() => {
    if (typeof history !== "undefined") history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    // reducedMotion="user" → framer-motion respeta prefers-reduced-motion en
    // toda la página: desactiva animaciones de transform/layout (deslizamientos,
    // escalas, springs) y conserva solo fundidos suaves. El CSS y el gate
    // DESKTOP_MOTION ya cubren GSAP; esto cubre framer de una sola vez.
    <MotionConfig reducedMotion="user">
      <Navbar />
      <main>
        <Hero />
        <Differentiators />
        <Comparison />
        <Manifesto />
        <ModuleShowcase />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </MotionConfig>
  );
}
