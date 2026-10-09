import { useEffect, useRef, useState } from "react";

import { BrandMark, BrandWordmark } from "@/components/site/Brand";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The opening: the restaurant's Balinese door, closed, with the Sal Marinho
 * mark in the doorway. Browsers only play sound after a tap, so Enter is that
 * tap: the waves begin, an ember kindles ("Light the fire") and catches with a
 * crackle ("The table is set."), then the two halves of the door part onto the
 * coast film.
 *
 * First visit per session only; skippable. Without JavaScript a CSS failsafe
 * clears it; returning visitors and reduced motion never see it (styles keyed
 * on html[data-sm-seen] and the media query).
 */
type State = "gate" | "running" | "done" | "gone";
type Beat = "closed" | "kindle" | "fire" | "open";

const FIRE_AT = 1300; // ms after Enter: the fire catches
const OPEN_AT = 2500; // the door parts
const DONE_AT = 3900; // the page is yours

function markSeen() {
  try {
    sessionStorage.setItem("sm-seen", "1");
  } catch {
    /* storage unavailable: the opening simply plays again next visit */
  }
}

const cue = (phase: string) => window.dispatchEvent(new CustomEvent("sm:phase", { detail: phase }));

export function DoorOpening() {
  const [state, setState] = useState<State>("gate");
  const [beat, setBeat] = useState<Beat>("closed");
  const root = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const timers = useRef<number[]>([]);

  const finish = () => {
    for (const t of timers.current) window.clearTimeout(t);
    setBeat("open");
    setState((s) => (s === "gone" ? s : "done"));
    markSeen();
  };

  const start = (withSound: boolean | null) => {
    if (started.current) return;
    started.current = true;
    if (withSound !== null) window.dispatchEvent(new CustomEvent("sm:sound", { detail: withSound }));
    setState("running");
    setBeat("kindle");
    cue("water");
    timers.current.push(
      window.setTimeout(() => {
        setBeat("fire");
        cue("fire");
        window.dispatchEvent(new Event("sm:crackle"));
      }, FIRE_AT),
      window.setTimeout(() => setBeat("open"), OPEN_AT),
      window.setTimeout(finish, DONE_AT),
    );
  };

  useEffect(() => {
    // Returning visitors and reduced motion: CSS already hides the door.
    if (document.documentElement.dataset.smSeen === "1" || prefersReducedMotion()) return;
    // Marks the overlay as live, which switches off the no-JavaScript failsafe.
    if (root.current) root.current.dataset.live = "true";
    document.documentElement.classList.add("sm-locked");
    cue("water");

    // Scrolling or a key also enters; Enter and Space count as the tap for sound.
    const onIntent = (event: Event) => {
      if (event instanceof KeyboardEvent && (event.key === "Tab" || event.key === "Shift")) return;
      if (!started.current) start(null);
      else finish();
    };
    window.addEventListener("wheel", onIntent, { passive: true });
    window.addEventListener("touchmove", onIntent, { passive: true });
    window.addEventListener("keydown", onIntent);
    const pending = timers.current;
    return () => {
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchmove", onIntent);
      window.removeEventListener("keydown", onIntent);
      for (const t of pending) window.clearTimeout(t);
    };
    // start/finish only touch refs and state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state !== "done") return;
    document.documentElement.classList.remove("sm-locked");
    cue("done");
    const timer = window.setTimeout(() => {
      // Keeps the door open if the landing page mounts again during this visit.
      document.documentElement.dataset.smSeen = "1";
      setState("gone");
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => () => document.documentElement.classList.remove("sm-locked"), []);

  if (state === "gone") return null;
  return (
    <div ref={root} className="sm-door" data-state={state} data-beat={beat} role="dialog" aria-label="Welcome to Sal Marinho">
      <div className="sm-door__half sm-door__half--left" aria-hidden="true">
        <img src="/assets/art/gate-left.webp" alt="" />
      </div>
      <div className="sm-door__half sm-door__half--right" aria-hidden="true">
        <img src="/assets/art/gate-right.webp" alt="" />
      </div>
      <div className="sm-door__glow" aria-hidden="true" />
      <div className="sm-door__doorway">
        <div className="sm-door__logo">
          <BrandMark decorative className="h-16 w-16 md:h-20 md:w-20" />
          <BrandWordmark decorative className="h-8 w-auto md:h-10" />
          <span className="sm-door__place">Anjuna</span>
          <span className="sr-only">Sal Marinho, Anjuna</span>
        </div>
        <div className="sm-door__gate">
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
        <div className="sm-door__lines" aria-hidden="true">
          <span className="sm-door__ember" />
          <p className="sm-door__line sm-door__line--one">Light the fire</p>
          <p className="sm-door__line sm-door__line--two">The table is set.</p>
        </div>
      </div>
      {state === "running" ? (
        <button type="button" className="v-opening__skip" onClick={finish}>
          Skip
        </button>
      ) : null}
    </div>
  );
}
