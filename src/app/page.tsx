'use client';

import { useEffect } from "react";
import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Differentiators from "@/components/sections/Differentiators";
import Comparison from "@/components/sections/Comparison";
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
    <>
      <Navbar />
      <main>
        <Hero />
        <Differentiators />
        <Comparison />
        <ModuleShowcase />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
