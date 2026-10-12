import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import type Lenis from "lenis";

import { prefersReducedMotion } from "@/lib/motion";

let lenisInstance: Lenis | null = null;

/** Moves the page at once, keeping Lenis (desktop smooth scroll) in step. */
export function jumpScroll(top: number) {
  if (lenisInstance) lenisInstance.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "instant" });
}

/** Lenis smooth scrolling on desktop pointers; native scrolling on touch and under reduced motion. */
export function SmoothScroll() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    // Phones keep their native momentum scrolling; Lenis would fight it.
    if (prefersReducedMotion() || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    let cancelled = false;
    void import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      lenisInstance = new LenisCtor({ autoRaf: true, lerp: 0.11, anchors: true });
    });
    return () => {
      cancelled = true;
      lenisInstance?.destroy();
      lenisInstance = null;
    };
  }, []);

  useEffect(() => {
    const locked = () => document.documentElement.classList.contains("sm-locked");
    const observer = new MutationObserver(() => {
      if (!lenisInstance) return;
      if (locked()) lenisInstance.stop();
      else lenisInstance.start();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.location.hash) return;
    if (lenisInstance) lenisInstance.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/** A soft smoke veil that rises across the screen between pages. */
export function PageVeil() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [cycle, setCycle] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    setCycle((c) => c + 1);
  }, [pathname]);
  if (cycle === 0) return null;
  return <div key={cycle} className="sm-veil" aria-hidden="true" />;
}

/**
 * The ember cursor: inside sections marked data-cursor="ember" a small glowing
 * coal trails the pointer. Fine pointers only; never on touch or reduced motion.
 */
export function EmberCursor() {
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return;
    const el = dot.current;
    if (!el) return;
    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let raf = 0;
    let active = false;
    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      const target = event.target as Element | null;
      const inside = Boolean(target?.closest?.('[data-cursor="ember"]'));
      if (inside !== active) {
        active = inside;
        el.dataset.active = String(inside);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={dot} className="sm-ember-cursor" aria-hidden="true" data-active="false" />;
}
