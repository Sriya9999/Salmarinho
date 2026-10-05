import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * The sound of the place. On by default: browsers only allow audio after a
 * visitor's first tap, click or key press (the opening's Enter is one), so it
 * starts then. "Sound off" is remembered for the visit.
 *
 * Beds: waves, fire, a quiet room, mangrove water and a soft spice air. Each
 * section says what it sounds like with data-sound; whichever holds the middle
 * of the screen sets the mix, crossfaded over a few seconds. Smoke
 * ([data-smoke]) muffles everything briefly as it passes. The opening drives
 * its own cues with "sm:phase" events and asks for its crackle with "sm:crackle".
 */
type Bed = "waves" | "fire" | "room" | "water" | "air";
export type Mood = "waves" | "breakfast" | "spice" | "fire" | "crab" | "restaurant" | "quiet" | "opening-water" | "opening-fire";

const BEDS: Bed[] = ["waves", "fire", "room", "water", "air"];
const FILE: Record<Bed | "crackle", string> = {
  waves: "/assets/v2/audio/waves.mp3",
  fire: "/assets/v2/audio/fire.mp3",
  room: "/assets/v2/audio/room.mp3",
  water: "/assets/v2/audio/water.mp3",
  air: "/assets/v2/audio/air.mp3",
  crackle: "/assets/v2/audio/crackle.mp3",
};
const MIX: Record<Mood, Partial<Record<Bed, number>>> = {
  "opening-water": { waves: 0.55 },
  "opening-fire": { waves: 0.4, fire: 0.38 },
  waves: { waves: 0.6, room: 0.06 },
  breakfast: { waves: 0.26, room: 0.22 },
  spice: { air: 0.45, waves: 0.06 },
  fire: { fire: 0.6, waves: 0.05 },
  crab: { water: 0.6, waves: 0.18 },
  restaurant: { room: 0.45, waves: 0.1, fire: 0.06 },
  quiet: { waves: 0.12, room: 0.1 },
};
const STORAGE_KEY = "sm-sound";

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  tone: BiquadFilterNode;
  beds: Record<Bed, GainNode>;
  crackle: AudioBuffer | null;
};

function ramp(param: AudioParam, ctx: AudioContext, value: number, seconds: number) {
  const t = ctx.currentTime;
  param.cancelScheduledValues(t);
  param.setValueAtTime(param.value, t);
  param.linearRampToValueAtTime(value, t + seconds);
}

async function load(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  try {
    const res = await fetch(url);
    return await ctx.decodeAudioData(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function createEngine(): Engine | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 18000;
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(tone).connect(ctx.destination);
  const beds = {} as Record<Bed, GainNode>;
  for (const bed of BEDS) {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    beds[bed] = gain;
  }
  const engine: Engine = { ctx, master, tone, beds, crackle: null };
  // Waves first, so the opening is heard as soon as possible; the rest follow.
  for (const bed of BEDS) {
    void load(ctx, FILE[bed]).then((buffer) => {
      if (!buffer) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(beds[bed]);
      source.start();
    });
  }
  void load(ctx, FILE.crackle).then((buffer) => {
    engine.crackle = buffer;
  });
  return engine;
}

function moodAtCentre(): Mood {
  const middle = window.innerHeight / 2;
  let mood: Mood = "quiet";
  for (const el of document.querySelectorAll<HTMLElement>("[data-sound]")) {
    const rect = el.getBoundingClientRect();
    if (rect.top <= middle && rect.bottom >= middle) mood = (el.dataset.sound as Mood) ?? "quiet";
  }
  return mood;
}

function smokeAtCentre(): boolean {
  const middle = window.innerHeight / 2;
  for (const el of document.querySelectorAll<HTMLElement>("[data-smoke]")) {
    const rect = el.getBoundingClientRect();
    if (rect.top <= middle && rect.bottom >= middle) return true;
  }
  return false;
}

export function SoundScape() {
  const [on, setOn] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const engine = useRef<Engine | null>(null);
  const mood = useRef<Mood>("quiet");
  const forced = useRef<Mood | null>(null);
  const muffled = useRef(false);
  const onRef = useRef(true);
  const unlockedAt = useRef(0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const applyMix = (next: Mood, seconds = 2.5) => {
    mood.current = next;
    const e = engine.current;
    if (!e) return;
    const levels = MIX[next];
    for (const bed of BEDS) ramp(e.beds[bed].gain, e.ctx, levels[bed] ?? 0, seconds);
  };

  const setMasterOn = (value: boolean) => {
    const e = engine.current;
    if (!e) return;
    if (value) {
      void e.ctx.resume();
      ramp(e.master.gain, e.ctx, 1, 1.4);
    } else {
      ramp(e.master.gain, e.ctx, 0, 0.6);
    }
  };

  // Restore a "sound off" choice made earlier in this visit.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage unavailable: keep the default */
    }
    const initial = stored !== "off";
    onRef.current = initial;
    if (!initial) setOn(false);
    else setWaiting(true);
  }, []);

  // The first tap, click or key press anywhere unlocks audio.
  useEffect(() => {
    const unlock = () => {
      if (!engine.current) {
        engine.current = createEngine();
        if (!engine.current) return;
        applyMix(forced.current ?? moodAtCentre(), 1.5);
      }
      unlockedAt.current = performance.now();
      setWaiting(false);
      if (onRef.current) setMasterOn(true);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchend", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchend", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchend", unlock);
    };
  }, []);

  // Follow the page: mood by section, a brief muffle through smoke.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      if (!forced.current) {
        const next = moodAtCentre();
        if (next !== mood.current) applyMix(next);
      }
      const smoke = smokeAtCentre();
      if (smoke !== muffled.current && engine.current) {
        muffled.current = smoke;
        const e = engine.current;
        ramp(e.tone.frequency, e.ctx, smoke ? 650 : 18000, smoke ? 0.5 : 1.6);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = window.setTimeout(check, 400);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // Opening cues and the crackle.
  useEffect(() => {
    const onPhase = (event: Event) => {
      const phase = (event as CustomEvent<string>).detail;
      if (phase === "water") forced.current = "opening-water";
      else if (phase === "fire") forced.current = "opening-fire";
      else forced.current = null;
      applyMix(forced.current ?? moodAtCentre(), phase === "fire" ? 4 : 2.5);
    };
    const onCrackle = () => {
      const e = engine.current;
      if (!e?.crackle || !onRef.current) return;
      const source = e.ctx.createBufferSource();
      const gain = e.ctx.createGain();
      gain.gain.value = 0.55;
      source.buffer = e.crackle;
      source.connect(gain).connect(e.master);
      source.start();
    };
    const onChoice = (event: Event) => {
      const wanted = (event as CustomEvent<boolean>).detail;
      onRef.current = wanted;
      setOn(wanted);
      try {
        sessionStorage.setItem(STORAGE_KEY, wanted ? "on" : "off");
      } catch {
        /* not remembered; fine */
      }
      setMasterOn(wanted);
    };
    window.addEventListener("sm:phase", onPhase);
    window.addEventListener("sm:crackle", onCrackle);
    window.addEventListener("sm:sound", onChoice);
    return () => {
      window.removeEventListener("sm:phase", onPhase);
      window.removeEventListener("sm:crackle", onCrackle);
      window.removeEventListener("sm:sound", onChoice);
    };
  }, []);

  const toggle = () => {
    // A first tap on the button itself is the tap that starts the sound.
    if (performance.now() - unlockedAt.current < 700) return;
    window.dispatchEvent(new CustomEvent("sm:sound", { detail: !on }));
  };

  return (
    <div className="v-sound" data-waiting={on && waiting}>
      <button type="button" className="v-sound__btn" aria-pressed={on} onClick={toggle}>
        <svg className="v-sound__wave" viewBox="0 0 26 14" aria-hidden="true">
          <path d="M1 7 C 4 1, 7 1, 9.5 7 S 15 13, 17.5 7 S 22.5 1, 25 7" />
        </svg>
        <span className="sr-only">{on ? "Turn sound off" : "Turn sound on"}</span>
        <span className="v-sound__label" aria-hidden="true">
          {on ? "Sound on" : "Sound off"}
        </span>
      </button>
      {on && waiting ? (
        <span className="v-sound__hint" aria-hidden="true">
          Tap anywhere for sound
        </span>
      ) : null}
    </div>
  );
}
