import { useEffect, useRef, useState } from "react";

import { BrandMark, BrandWordmark } from "@/components/site/Brand";
import { PHONE_QUERY } from "@/components/v2/kit";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The opening. Darkness and a shimmer of water, then Enter: browsers only play
 * sound after a tap, so entering is that tap and the waves begin. The fire
 * catches with a single crackle, Sal Marinho appears in its glow, the room
 * emerges at first light, and breakfast is on the table. The film's last frame
 * is the hero photograph, so the hand-off is seamless.
 *
 * First visit per session only; skippable. Without JavaScript a CSS failsafe
 * clears it; returning visitors and reduced motion never see it (styles keyed
 * on html[data-sm-seen] and the media query).
 */
const FILM = { src: "/assets/v2/film/opening.mp4", mobileSrc: "/assets/v2/film/opening-m.mp4" };
const RATE = 1.3;
const CRACKLE_AT = 2.6; // seconds of film: the fire catches
const TABLE_AT = 9.6; // the room gives way to the table

type Phase = "gate" | "water" | "fire" | "table";

function markSeen() {
  try {
    sessionStorage.setItem("sm-seen", "1");
  } catch {
    /* storage unavailable: the opening simply plays again next visit */
  }
}

const cue = (phase: string) => window.dispatchEvent(new CustomEvent("sm:phase", { detail: phase }));

export function Opening() {
  const [state, setState] = useState<"gate" | "running" | "done" | "gone">("gate");
  const [phase, setPhase] = useState<Phase>("gate");
  const [filmOn, setFilmOn] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const started = useRef(false);

  const finish = () => {
    setState((s) => (s === "gone" ? s : "done"));
    markSeen();
  };

  const start = (withSound: boolean | null) => {
    if (started.current) return;
    started.current = true;
    if (withSound !== null) window.dispatchEvent(new CustomEvent("sm:sound", { detail: withSound }));
    setState("running");
    setPhase("water");
    const v = video.current;
    if (!v) return finish();
    v.playbackRate = RATE;
    void v.play().catch(finish);
  };

  useEffect(() => {
    // Returning visitors and reduced motion: CSS already hides the opening.
    if (document.documentElement.dataset.smSeen === "1" || prefersReducedMotion()) return;
    // Marks the overlay as live, which switches off the no-JavaScript failsafe.
    if (root.current) root.current.dataset.live = "true";
    document.documentElement.classList.add("sm-locked");
    cue("water");

    const v = video.current;
    let crackled = false;
    const onTime = () => {
      if (!v) return;
      if (!crackled && v.currentTime >= CRACKLE_AT) {
        crackled = true;
        setPhase("fire");
        cue("fire");
        window.dispatchEvent(new Event("sm:crackle"));
      }
      if (v.currentTime >= TABLE_AT) setPhase("table");
    };
    const onPlaying = () => setFilmOn(true);
    const onEnd = () => {
      setState((s) => (s === "gone" ? s : "done"));
      markSeen();
    };
    if (v) {
      v.src = window.matchMedia(PHONE_QUERY).matches ? FILM.mobileSrc : FILM.src;
      v.load();
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("playing", onPlaying);
      v.addEventListener("ended", onEnd);
      v.addEventListener("error", onEnd);
    }
    // Scrolling or a key also enters; Enter and Space count as the tap for sound.
    const onIntent = (event: Event) => {
      if (event instanceof KeyboardEvent && (event.key === "Tab" || event.key === "Shift")) return;
      if (!started.current) {
        started.current = true;
        setState("running");
        setPhase("water");
        if (v) {
          v.playbackRate = RATE;
          void v.play().catch(onEnd);
        }
        return;
      }
      onEnd();
    };
    window.addEventListener("wheel", onIntent, { passive: true });
    window.addEventListener("touchmove", onIntent, { passive: true });
    window.addEventListener("keydown", onIntent);

    return () => {
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchmove", onIntent);
      window.removeEventListener("keydown", onIntent);
      if (v) {
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("playing", onPlaying);
        v.removeEventListener("ended", onEnd);
        v.removeEventListener("error", onEnd);
      }
    };
  }, []);

  // Once playing: never wait on a film that will not start, nor past the end.
  useEffect(() => {
    if (state !== "running") return;
    const stall = window.setTimeout(() => {
      if ((video.current?.currentTime ?? 0) < 0.2) finish();
    }, 4000);
    const failsafe = window.setTimeout(finish, 16000);
    return () => {
      window.clearTimeout(stall);
      window.clearTimeout(failsafe);
    };
  }, [state]);

  useEffect(() => {
    if (state !== "done") return;
    document.documentElement.classList.remove("sm-locked");
    video.current?.pause();
    cue("done");
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
    <div ref={root} className="v-opening" data-state={state} data-phase={phase} role="dialog" aria-label="Welcome to Sal Marinho">
      <div className="v-opening__shimmer" aria-hidden="true" />
      <video ref={video} className="v-opening__film" data-on={filmOn} muted playsInline preload="auto" aria-hidden="true" />
      <div className="v-opening__glow" aria-hidden="true" />
      <div className="v-opening__brand" aria-hidden="true">
        <BrandMark decorative className="h-14 w-14" />
        <BrandWordmark decorative className="h-9 w-auto" />
        <span className="v-opening__place">Anjuna</span>
      </div>
      <div className="v-opening__gate">
        <p className="v-opening__hint">Sal Marinho &middot; Anjuna</p>
        <button type="button" className="v-opening__enter" onClick={() => start(true)}>
          <svg viewBox="0 0 26 14" aria-hidden="true">
            <path d="M1 7 C 4 1, 7 1, 9.5 7 S 15 13, 17.5 7 S 22.5 1, 25 7" />
          </svg>
          Enter
        </button>
        <p className="v-opening__note">Best with sound, turned low.</p>
        <button type="button" className="v-opening__quiet" onClick={() => start(false)}>
          Enter without sound
        </button>
      </div>
      {state === "running" ? (
        <button type="button" className="v-opening__skip" onClick={finish}>
          Skip
        </button>
      ) : null}
    </div>
  );
}
