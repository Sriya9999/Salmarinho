import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

import { prefersReducedMotion, watchScrollProgress } from "@/lib/motion";

type Tag = "div" | "section" | "figure" | "article" | "li" | "header";

/**
 * Transform-only scroll drift. Content is always visible (screenshot safe);
 * it simply settles from a small offset as it travels through the viewport.
 */
export function Drift({
  children,
  className,
  distance = 48,
  as: As = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  as?: Tag;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    return watchScrollProgress(el, (p) => {
      const offset = (0.5 - p) * distance;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
  }, [distance]);
  return (
    <As ref={ref as never} className={className} style={{ willChange: "transform", ...style }}>
      {children}
    </As>
  );
}

/**
 * An image in a crop frame whose picture slides inside the frame with scroll.
 * `wave` adds the slow sideways swell used on every coastal photograph.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  strength = 0.12,
  wave = false,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
  wave?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = frame.current;
    const pic = img.current;
    if (!el || !pic || prefersReducedMotion()) return;
    return watchScrollProgress(el, (p) => {
      const y = (p - 0.5) * strength * 100;
      pic.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0) scale(${1 + strength})`;
    });
  }, [strength]);
  return (
    <div ref={frame} className={`overflow-hidden ${className?.includes("absolute") ? "" : "relative"} ${className ?? ""}`}>
      <div className={wave ? "sm-wave-drift absolute inset-0" : "absolute inset-0"}>
        <img
          ref={img}
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={`h-full w-full object-cover ${imgClassName ?? ""}`}
          style={{ transform: `scale(${1 + strength})`, willChange: "transform" }}
        />
      </div>
    </div>
  );
}

/** Very subtle rising steam, for food photography. Pure CSS, off under reduced motion. */
export function Steam({ className, intensity }: { className?: string; intensity?: number }) {
  return (
    <div
      aria-hidden="true"
      className={`sm-steam pointer-events-none absolute inset-0 ${className ?? ""}`}
      style={intensity == null ? undefined : ({ "--steam": intensity } as CSSProperties)}
    >
      <span />
      <span />
      <span />
    </div>
  );
}

/**
 * Warm glow that follows the pointer across a surface (menu cards, dish rows).
 * Writes CSS variables only; the glow itself is styled in site.css.
 */
export function FireGlow({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
}) {
  const ref = useRef<HTMLElement | null>(null);
  return (
    <As
      ref={ref as never}
      className={`sm-fire-glow ${className ?? ""}`}
      onPointerMove={(event: ReactPointerEvent<HTMLElement>) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--gx", `${event.clientX - rect.left}px`);
        el.style.setProperty("--gy", `${event.clientY - rect.top}px`);
      }}
    >
      {children}
    </As>
  );
}

/** Magnetic pull toward the pointer, spring-damped (motion values, never React state). */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.2 });
  return (
    <motion.div
      className={className}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * strength);
        y.set((event.clientY - rect.top - rect.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline that builds letter by letter ON MOUNT (never viewport-gated).
 * Screen readers get the plain string; the animated letters are aria-hidden.
 */
export function LetterBuild({
  text,
  as: As = "h1",
  className,
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  let index = 0;
  return (
    <As className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} aria-hidden="true" className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch) => {
            const i = index++;
            return (
              <span
                key={i}
                className="sm-letter inline-block"
                style={{ animationDelay: `${delay + i * 32}ms` }}
              >
                {ch}
              </span>
            );
          })}
          {wi < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </As>
  );
}
