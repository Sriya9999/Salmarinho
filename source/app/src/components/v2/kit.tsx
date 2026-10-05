// Shared pieces for the "imagined coast" pages: reveals, contour lines and films.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { prefersReducedMotion, watchScrollProgress } from "@/lib/motion";

/** Phones and small screens get the lighter film encodes. */
export const PHONE_QUERY = "(hover: none) and (pointer: coarse), (max-width: 860px)";

/** True once the element has come within `margin` of the viewport. */
export function useInView<T extends Element>(margin = "0px 0px -12% 0px") {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, seen]);
  return [ref, seen] as const;
}

/**
 * A photograph that unmasks as it arrives. It starts partly visible (never
 * hidden), so screenshots and slow devices always show the picture.
 */
export function Reveal({
  src,
  alt,
  className,
  style,
  sizes,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  children?: ReactNode;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`v-reveal ${className ?? ""}`} data-in={seen} style={style}>
      <img src={src} alt={alt} sizes={sizes} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      {children}
    </div>
  );
}

// Topographic lines around two shorelines, drawn once at module load.
function ring(cx: number, cy: number, r: number, seed: number, squash: number): string {
  const steps = 64;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const k = 1 + 0.13 * Math.sin(3 * a + seed) + 0.07 * Math.sin(5 * a + seed * 1.7) + 0.04 * Math.sin(9 * a + seed * 0.4);
    const x = cx + Math.cos(a) * r * k;
    const y = cy + Math.sin(a) * r * k * squash;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
}
const CONTOUR_PATHS = [
  ...Array.from({ length: 11 }, (_, i) => ring(760, 420, 46 + i * 34, 0.6 + i * 0.32, 0.62)),
  ...Array.from({ length: 7 }, (_, i) => ring(120, 90, 30 + i * 30, 2.1 + i * 0.41, 0.7)),
];

/** Slowly drifting coastal contour lines, as a background layer. */
export function Contours({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`v-contours ${className ?? ""}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        {CONTOUR_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    </div>
  );
}

type Film = { src: string; mobileSrc: string; poster: string };

/**
 * A looping film that loads when it nears the screen and pauses when it
 * leaves. Under reduced motion the poster stays as a still.
 */
export function LoopFilm({ film, className, label, speed }: { film: Film; className?: string; label?: string; speed?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || prefersReducedMotion()) return;
    let loaded = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!loaded) {
            video.src = window.matchMedia(PHONE_QUERY).matches ? film.mobileSrc : film.src;
            loaded = true;
          }
          void video.play().catch(() => {
            /* autoplay refused (low power mode): the poster stays */
          });
        } else if (loaded) {
          video.pause();
        }
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [film]);
  return (
    <video
      ref={ref}
      className={className}
      poster={film.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      data-speed={speed}
    />
  );
}

/**
 * A film whose time follows the page: as the band crosses the screen the
 * camera moves through the room. Not pinned, so the page never stops moving.
 */
export function ScrollFilm({ film, className, label }: { film: Film; className?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || prefersReducedMotion()) return;
    let ready = false;
    let target = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || video.src) return;
        video.src = window.matchMedia(PHONE_QUERY).matches ? film.mobileSrc : film.src;
        video.load();
        io.disconnect();
      },
      { rootMargin: "60% 0px" },
    );
    io.observe(video);
    const onReady = () => {
      ready = true;
    };
    video.addEventListener("loadeddata", onReady);
    const stop = watchScrollProgress(video, (p) => {
      if (!ready || !video.duration) return;
      target = p * (video.duration - 0.05);
      if (!video.seeking && Math.abs(video.currentTime - target) > 1 / 30) video.currentTime = target;
    });
    return () => {
      io.disconnect();
      stop();
      video.removeEventListener("loadeddata", onReady);
    };
  }, [film]);
  return <video ref={ref} className={className} poster={film.poster} muted playsInline preload="none" aria-label={label} />;
}
