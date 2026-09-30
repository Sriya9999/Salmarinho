import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import type Lenis from "lenis";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * Opening sequence: LIGHT THE FIRE, then THE TABLE IS SET, then the owner's
 * Balinese gate parts to reveal the page. Runs on pure CSS keyframes so it also
 * clears without JavaScript; JS only adds Skip and remembers the visit.
 * Returning visitors in the same session never see it (html[data-sm-seen]).
 */
export function Loader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const finish = () => {
      setDone(true);
      try {
        sessionStorage.setItem("sm-seen", "1");
      } catch {
        /* storage unavailable: the loader simply shows again next visit */
      }
    };
    if (document.documentElement.dataset.smSeen === "1" || prefersReducedMotion()) {
      finish();
      return;
    }
    const timer = window.setTimeout(finish, 2600);
    return () => window.clearTimeout(timer);
  }, []);

  if (done) return null;
  return (
    <div className="sm-loader" role="presentation">
      <div className="sm-loader__gate sm-loader__gate--left" aria-hidden="true">
        <img src="/assets/art/gate-left.webp" alt="" />
      </div>
      <div className="sm-loader__gate sm-loader__gate--right" aria-hidden="true">
        <img src="/assets/art/gate-right.webp" alt="" />
      </div>
      <div className="sm-loader__center">
        <span className="sm-loader__ember" aria-hidden="true" />
        <p className="sm-loader__line sm-loader__line--one">Light the fire</p>
        <p className="sm-loader__line sm-loader__line--two">The table is set.</p>
      </div>
      <button type="button" className="sm-loader__skip" onClick={() => setDone(true)}>
        Skip
      </button>
    </div>
  );
}

let lenisInstance: Lenis | null = null;

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

/**
 * Optional ambience (fire and distant waves). Muted by default; plays only
 * after the visitor asks for it, and remembers the choice for the session.
 */
export function SoundToggle() {
  const audio = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    el.volume = 0.35;
    if (on) void el.play().catch(() => setOn(false));
    else el.pause();
  }, [on]);
  return (
    <div className="sm-sound">
      <audio ref={audio} src="/assets/audio/ambience.mp3" loop preload="none" />
      <button type="button" onClick={() => setOn((v) => !v)} aria-pressed={on} className="sm-sound__button">
        <span className="sm-sound__bars" data-on={on} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className="sr-only">{on ? "Turn ambient sound off" : "Turn ambient sound on"}</span>
        <span aria-hidden="true" className="sm-sound__label">
          {on ? "Sound on" : "Sound off"}
        </span>
      </button>
    </div>
  );
}
