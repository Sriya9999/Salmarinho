import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Optional sound: a bed of distant waves, a fire bed and a single crackle.
 * Off by default and never needed to understand anything. Sections say what
 * they sound like with data-sound="waves" | "fire" | "quiet"; whichever one
 * holds the middle of the screen sets the mix, crossfaded over a few seconds.
 * The opening asks for its crackle with a "sm:crackle" window event.
 */
type Bed = "waves" | "fire";
type Mood = Bed | "quiet";

const FILES: Record<Bed | "crackle", string> = {
  waves: "/assets/v2/audio/waves.mp3",
  fire: "/assets/v2/audio/fire.mp3",
  crackle: "/assets/v2/audio/crackle.mp3",
};
const LEVEL: Record<Bed, number> = { waves: 0.5, fire: 0.42 };

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  beds: Record<Bed, GainNode>;
  crackle: AudioBuffer | null;
};

async function decode(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  try {
    const res = await fetch(url);
    return await ctx.decodeAudioData(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function startEngine(): Promise<Engine | null> {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const beds = {} as Record<Bed, GainNode>;
  const [waves, fire, crackle] = await Promise.all([decode(ctx, FILES.waves), decode(ctx, FILES.fire), decode(ctx, FILES.crackle)]);
  for (const [name, buffer] of [
    ["waves", waves],
    ["fire", fire],
  ] as const) {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    beds[name] = gain;
    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
    }
  }
  return { ctx, master, beds, crackle };
}

function currentMood(): Mood {
  const middle = window.innerHeight / 2;
  let mood: Mood = "quiet";
  for (const el of document.querySelectorAll<HTMLElement>("[data-sound]")) {
    const rect = el.getBoundingClientRect();
    if (rect.top <= middle && rect.bottom >= middle) mood = (el.dataset.sound as Mood) ?? "quiet";
  }
  return mood;
}

export function SoundScape() {
  const [on, setOn] = useState(false);
  const engine = useRef<Engine | null>(null);
  const starting = useRef<Promise<Engine | null> | null>(null);
  const mood = useRef<Mood>("quiet");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Fade the beds toward the current section's mood.
  const mix = (next: Mood, seconds = 2.5) => {
    mood.current = next;
    const e = engine.current;
    if (!e) return;
    const t = e.ctx.currentTime;
    for (const bed of ["waves", "fire"] as Bed[]) {
      const g = e.beds[bed].gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(next === bed ? LEVEL[bed] : 0, t + seconds);
    }
  };

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const next = currentMood();
      if (next !== mood.current) mix(next);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // New page: give it a moment to render, then pick up its mood.
    const timer = window.setTimeout(check, 400);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    const onCrackle = () => {
      const e = engine.current;
      if (!e?.crackle || e.ctx.state !== "running") return;
      const source = e.ctx.createBufferSource();
      const gain = e.ctx.createGain();
      gain.gain.value = 0.6;
      source.buffer = e.crackle;
      source.connect(gain).connect(e.master);
      source.start();
    };
    window.addEventListener("sm:crackle", onCrackle);
    return () => window.removeEventListener("sm:crackle", onCrackle);
  }, []);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    if (next) {
      starting.current ??= startEngine();
      const e = await starting.current;
      if (!e) {
        setOn(false);
        return;
      }
      engine.current = e;
      await e.ctx.resume();
      const t = e.ctx.currentTime;
      e.master.gain.cancelScheduledValues(t);
      e.master.gain.setValueAtTime(e.master.gain.value, t);
      e.master.gain.linearRampToValueAtTime(1, t + 1.2);
      mix(currentMood(), 1.5);
    } else {
      const e = engine.current;
      if (!e) return;
      const t = e.ctx.currentTime;
      e.master.gain.cancelScheduledValues(t);
      e.master.gain.setValueAtTime(e.master.gain.value, t);
      e.master.gain.linearRampToValueAtTime(0, t + 0.6);
      window.setTimeout(() => {
        if (engine.current === e && e.master.gain.value < 0.01) void e.ctx.suspend();
      }, 700);
    }
  };

  return (
    <div className="v-sound">
      <button type="button" className="v-sound__btn" aria-pressed={on} onClick={() => void toggle()}>
        <svg className="v-sound__wave" viewBox="0 0 26 14" aria-hidden="true">
          <path d="M1 7 C 4 1, 7 1, 9.5 7 S 15 13, 17.5 7 S 22.5 1, 25 7" />
        </svg>
        <span className="sr-only">{on ? "Turn sound off" : "Turn sound on"}</span>
        <span className="v-sound__label" aria-hidden="true">
          {on ? "Sound on" : "Sound off"}
        </span>
      </button>
    </div>
  );
}
