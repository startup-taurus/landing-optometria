'use client';

import { useEffect } from "react";

export function useLenis() {
  useEffect(() => {
    let lenis: any;
    let rafTicker: ((time: number) => void) | null = null;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    async function init() {
      const Lenis = (await import("lenis")).default;
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });

      rafTicker = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(rafTicker);
      gsap.ticker.lagSmoothing(0);

      lenis.on("scroll", ScrollTrigger.update);
    }

    init();

    return () => {
      if (lenis) lenis.destroy();
      if (rafTicker) {
        import("gsap").then(({ gsap }) => {
          if (rafTicker) gsap.ticker.remove(rafTicker);
        });
      }
    };
  }, []);
}
