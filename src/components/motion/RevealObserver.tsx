"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for the storefront. Only toggles opacity/transform —
 * no scroll listeners, no layout animation, disconnects after each reveal.
 * Above-the-fold nodes skip the hide step so there’s no flash.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-vb-reveal]")
    );

    if (reduced) {
      root.classList.remove("vb-motion");
      nodes.forEach((el) => el.classList.add("is-in"));
      return;
    }

    // Arm motion styles, then immediately unlock anything already in view
    root.classList.add("vb-motion");

    const fold = window.innerHeight * 0.92;
    const toObserve: HTMLElement[] = [];

    nodes.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top < fold) {
        el.classList.add("is-in");
      } else {
        el.classList.remove("is-in");
        toObserve.push(el);
      }
    });

    if (!toObserve.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.vbRevealDelay || 0);
          if (delay > 0) el.style.transitionDelay = `${delay}ms`;
          requestAnimationFrame(() => {
            el.classList.add("is-in");
          });
          io.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    toObserve.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
