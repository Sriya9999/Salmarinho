// Client-side motion helpers. Everything here is SSR-safe: browser globals are
// touched only inside effects or functions called from effects/handlers.
import { useEffect, useState } from "react";
import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return fine;
}

type GsapBundle = { gsap: typeof GsapType; ScrollTrigger: typeof ScrollTriggerType };
let gsapPromise: Promise<GsapBundle> | null = null;

/** Lazily loads GSAP + ScrollTrigger once, so pages without scroll motion never pay for it. */
export function loadGsap(): Promise<GsapBundle> {
  if (!gsapPromise) {
    gsapPromise = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
      const gsap = g.gsap ?? g.default;
      const ScrollTrigger = st.ScrollTrigger ?? st.default;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }
  return gsapPromise;
}

/** Progress (0..1) of an element travelling through the viewport, for cheap rAF-driven effects. */
export function viewportProgress(el: Element): number {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const total = rect.height + vh;
  return Math.min(1, Math.max(0, (vh - rect.top) / total));
}

/**
 * Runs `onFrame(progress)` on animation frames while `el` is on screen.
 * Returns a cleanup function. Never used for opacity-to-zero reveals.
 */
export function watchScrollProgress(el: Element, onFrame: (progress: number) => void): () => void {
  let raf = 0;
  let visible = false;
  const tick = () => {
    onFrame(viewportProgress(el));
    if (visible) raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    },
    { rootMargin: "20% 0px 20% 0px" },
  );
  io.observe(el);
  onFrame(viewportProgress(el));
  return () => {
    visible = false;
    cancelAnimationFrame(raf);
    io.disconnect();
  };
}
