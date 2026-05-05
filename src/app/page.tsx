'use client';

import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Differentiators from "@/components/sections/Differentiators";
import Comparison from "@/components/sections/Comparison";
import Features from "@/components/sections/Features";
import ModuleShowcase from "@/components/sections/ModuleShowcase";
import HowItWorks from "@/components/sections/HowItWorks";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

export default function Home() {
  useLenis();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Differentiators />
        <Comparison />
        <Features />
        <ModuleShowcase />
        <HowItWorks />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
