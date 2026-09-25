"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

type ScrollRequest = CustomEvent<{ target: string }>;

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Lenis owns the animation frame so scrolling remains consistent across wheel and touch input.
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.1,
      easing: (time) => Math.min(1, 1.001 - 2 ** (-10 * time)),
    });

    let animationFrame = 0;
    const render = (time: number) => {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(render);
    };

    const scrollToSection = (event: Event) => {
      const { target } = (event as ScrollRequest).detail;
      lenis.scrollTo(target, { offset: 0 });
    };

    animationFrame = requestAnimationFrame(render);
    window.addEventListener("dcsg3:scroll-to", scrollToSection);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("dcsg3:scroll-to", scrollToSection);
      lenis.destroy();
    };
  }, []);

  return children;
}
