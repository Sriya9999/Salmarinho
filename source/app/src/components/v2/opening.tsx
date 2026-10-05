import { useEffect, useRef, useState } from "react";

import { BrandMark, BrandWordmark } from "@/components/site/Brand";
import { PHONE_QUERY } from "@/components/v2/kit";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The opening: darkness and a shimmer of water, a single crackle, a warm glow,
 * the fire, the room at first light, breakfast on the table. The film's last
 * frame is the hero photograph, so the hand-off is seamless.
 *
 * First visit per session only; skippable (button, scroll or a key). Without
 * JavaScript a CSS failsafe clears it; returning visitors and reduced motion
 * never see it (styles keyed on html[data-sm-seen] and the media query).
 */
const FILM = { src: "/assets/v2/film/opening.mp4", mobileSrc: "/assets/v2/film/opening-m.mp4" };
const RATE = 1.35;
const CRACKLE_AT = 2.6; // seconds of film: the fire catches
const TABLE_AT = 9.6; // the room gives way to the table

type Phase = "water" | "fire" | "table";

function markSeen() {
  try {
    sessionStorage.setItem("sm-seen", "1");
  } catch {
    /* storage unavailable: the opening simply plays again next visit */
  }
}

export function Opening() {
  const [state, setState] = useState<"running" | "done" | "gone">("running");
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("water");
  const [filmOn, setFilmOn] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const finish = () => {
      setState((s) => (s === "gone" ? s : "done"));
      markSeen();
    };
    // Returning visitors and reduced motion: CSS already hides the opening.
    if (document.documentElement.dataset.smSeen === "1" || prefersReducedMotion()) return;
    // Marks the overlay as running, which switches off the no-JavaScript failsafe.
    if (root.current) root.current.dataset.state = "playing";
    document.documentElement.classList.add("sm-locked");

    const v = video.current;
    let crackled = false;
    const onTime = () => {
      if (!v) return;
      if (!crackled && v.currentTime >= CRACKLE_AT) {
        crackled = true;
        setPhase("fire");
        window.dispatchEvent(new Event("sm:crackle"));
      }
      if (v.currentTime >= TABLE_AT) setPhase("table");
    };
    const onPlaying = () => setFilmOn(true);
    if (v) {
      v.src = window.matchMedia(PHONE_QUERY).matches ? FILM.mobileSrc : FILM.src;
      v.playbackRate = RATE;
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("playing", onPlaying);
      v.addEventListener("ended", finish);
      v.addEventListener("error", finish);
      void v.play().catch(finish);
    }
    // If the film never starts (slow network, autoplay refused), do not wait on it.
    const stall = window.setTimeout(() => {
      if (!v || v.currentTime < 0.2) finish();
    }, 3500);
    const failsafe = window.setTimeout(finish, 15000);

    const onIntent = (event: Event) => {
      if (event instanceof KeyboardEvent && (event.key === "Tab" || event.key === "Shift")) return;
      finish();
    };
    window.addEventListener("wheel", onIntent, { passive: true });
    window.addEventListener("touchmove", onIntent, { passive: true });
    window.addEventListener("keydown", onIntent);

    return () => {
      window.clearTimeout(stall);
      window.clearTimeout(failsafe);
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchmove", onIntent);
      window.removeEventListener("keydown", onIntent);
      if (v) {
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("playing", onPlaying);
        v.removeEventListener("ended", finish);
        v.removeEventListener("error", finish);
      }
    };
  }, []);

  useEffect(() => {
    if (state !== "done") return;
    document.documentElement.classList.remove("sm-locked");
    video.current?.pause();
    const timer = window.setTimeout(() => {
      // Keeps the opening hidden if the homepage mounts again during this visit.
      document.documentElement.dataset.smSeen = "1";
      setState("gone");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => () => document.documentElement.classList.remove("sm-locked"), []);

  if (state === "gone") return null;
  return (
    <div
      ref={root}
      className="v-opening"
      role="presentation"
      data-state={state === "done" ? "done" : undefined}
      data-phase={phase}
    >
      <div className="v-opening__shimmer" aria-hidden="true" />
      <video ref={video} className="v-opening__film" data-on={filmOn} muted playsInline preload="auto" aria-hidden="true" />
      <div className="v-opening__glow" aria-hidden="true" />
      <div className="v-opening__brand" aria-hidden="true">
        <BrandMark decorative className="h-14 w-14" />
        <BrandWordmark decorative className="h-9 w-auto" />
      </div>
      <button type="button" className="v-opening__skip" onClick={() => {
          setState("done");
          markSeen();
        }}>
        Skip
      </button>
    </div>
  );
}
