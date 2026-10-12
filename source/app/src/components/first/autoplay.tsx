import { useEffect, useRef, useState } from "react";

import { jumpScroll } from "@/components/site/ambient";
import { prefersReducedMotion } from "@/lib/motion";

const SCENE_SECONDS = 6.5; // each clip runs about six seconds
const TAIL_SECONDS = 2.4; // the film settling into the page
const START_DELAY = 1200; // returning visitors, who skip the door

type Mode = "idle" | "playing" | "paused";
type Leg = { from: number; to: number; seconds: number };

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

/**
 * Plays the landing film by itself: once the door opens, the page glides
 * through the scenes at about the clips' own pace and settles on the next
 * section. Touching, scrolling, clicking or a key hands control straight back
 * and pauses it; the button plays it again from wherever the visitor is.
 * Reduced motion never moves the page.
 */
export function FilmAutoplay({ film }: { film: string }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [inFilm, setInFilm] = useState(false);
  const controls = useRef<{ play: () => void; pause: () => void } | null>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(film);
    if (!root || prefersReducedMotion()) return;

    let legs: Leg[] = [];
    let end = 0;
    let frame = 0;
    let timer = 0;
    let pos = 0;
    let last = 0;
    let since = 0;
    let playing = false;
    let started = false;

    // One leg per scene, sized so each clip runs at about its own speed.
    const plan = () => {
      const top = root.getBoundingClientRect().top + window.scrollY;
      legs = [...root.querySelectorAll<HTMLElement>("[data-scroll-scrub-band]")].map((band) => {
        const from = band.getBoundingClientRect().top + window.scrollY;
        return { from, to: from + band.offsetHeight, seconds: SCENE_SECONDS };
      });
      const filmEnd = legs.at(-1)?.to ?? top;
      end = top + root.offsetHeight;
      if (end > filmEnd) legs.push({ from: filmEnd, to: end, seconds: TAIL_SECONDS });
    };

    const pause = () => {
      started = true;
      window.clearTimeout(timer);
      playing = false;
      window.cancelAnimationFrame(frame);
      setMode("paused");
    };

    const step = (now: number) => {
      if (!playing) return;
      // Scrolled some other way (a scrollbar, a link): the page is theirs now.
      if (Math.abs(window.scrollY - pos) > 40) return pause();
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      const leg = legs.find((l) => pos < l.to) ?? legs.at(-1);
      const speed = leg ? (leg.to - leg.from) / leg.seconds : 0;
      // Eases in when it starts and settles as it reaches the next section.
      const ease = smoothstep((now - since) / 900) * clamp((end - pos) / (0.35 * window.innerHeight), 0.12, 1);
      pos = Math.min(pos + speed * ease * dt, end);
      jumpScroll(pos);
      if (pos >= end - 0.5) {
        playing = false;
        setMode("paused");
        return;
      }
      frame = window.requestAnimationFrame(step);
    };

    const play = () => {
      plan();
      if (window.scrollY >= end - 2) return;
      started = true;
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      pos = window.scrollY;
      last = since = performance.now();
      playing = true;
      setMode("playing");
      frame = window.requestAnimationFrame(step);
    };
    controls.current = { play, pause };

    // Any touch, wheel, click or key outside the door and these buttons.
    const onTouch = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".sm-door, .sm-autoplay, .v-sound")) return;
      if (event instanceof KeyboardEvent && (event.key === "Tab" || event.key === "Shift")) return;
      if (playing || !started) pause();
    };
    const kinds = ["touchstart", "pointerdown", "wheel", "keydown"] as const;
    for (const kind of kinds) window.addEventListener(kind, onTouch, { passive: true });

    // The door's last beat starts the film; returning visitors skip the door.
    const onPhase = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "done" && !started) play();
    };
    window.addEventListener("sm:phase", onPhase);
    if (document.documentElement.dataset.smSeen === "1") {
      timer = window.setTimeout(() => {
        if (!started) play();
      }, START_DELAY);
    }

    const onScroll = () => {
      const rect = root.getBoundingClientRect();
      setInFilm(rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.6);
    };
    const onResize = () => {
      if (playing) plan();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      playing = false;
      controls.current = null;
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      for (const kind of kinds) window.removeEventListener(kind, onTouch);
      window.removeEventListener("sm:phase", onPhase);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [film]);

  if (mode === "idle" || !inFilm) return null;
  const playing = mode === "playing";
  return (
    <div className="sm-autoplay">
      <button
        type="button"
        className="v-sound__btn"
        aria-label={playing ? "Pause the film" : "Play the film"}
        onClick={() => (playing ? controls.current?.pause() : controls.current?.play())}
      >
        <svg className="sm-autoplay__icon" viewBox="0 0 12 12" aria-hidden="true">
          {playing ? <path d="M2.5 1.5h2.2v9H2.5zM7.3 1.5h2.2v9H7.3z" /> : <path d="M3 1.2 10.4 6 3 10.8z" />}
        </svg>
        <span aria-hidden="true">{playing ? "Pause" : "Play"}</span>
      </button>
    </div>
  );
}
