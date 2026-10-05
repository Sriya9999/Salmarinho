// The crab journey: cultivation to the table. What is happening now is told
// apart from what is still to come; when the experience launches, staff switch
// the status in /admin and "Coming soon" becomes "Now serving".
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { LoopFilm, Reveal } from "@/components/v2/kit";
import type { CrabStage, SiteSettings } from "@/lib/content/types";
import { prefersReducedMotion, watchScrollProgress } from "@/lib/motion";

const MANGROVE = { src: "/assets/v2/film/mangrove.mp4", mobileSrc: "/assets/v2/film/mangrove-m.mp4", poster: "/assets/v2/film/mangrove.webp" };

export function CrabStatus({ status }: { status: SiteSettings["crabStatus"] }) {
  return <p className="v-soon">{status === "now-serving" ? "Now serving" : "Coming soon"}</p>;
}

export const crabLines = (status: SiteSettings["crabStatus"]) =>
  status === "now-serving"
    ? ["Our crab cultivation project has come to the table.", "The journey from cultivation to kitchen is now part of the Sal Marinho experience."]
    : ["Our crab cultivation project is underway.", "Soon, the journey from cultivation to kitchen will become part of the Sal Marinho experience."];

/** A fine water ripple that runs across a photograph on hover (SVG filter). */
export function RippleFilter() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <filter id="v-ripple" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="4" result="noise">
          <animate attributeName="baseFrequency" dur="9s" values="0.012 0.03;0.016 0.04;0.012 0.03" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" />
      </filter>
    </svg>
  );
}

/* ------------------------------------------------------------------ home: Something is growing */

export function GrowingSection({ settings }: { settings: SiteSettings }) {
  const stages = settings.crabStages;
  const [first, second] = crabLines(settings.crabStatus);
  return (
    <section id="something-is-growing" className="v-grow" data-sound="crab" aria-labelledby="growing-title">
      <LoopFilm className="v-grow__film" film={MANGROVE} />
      <div className="v-grow__shade" aria-hidden="true" />
      <div className="v-wrap relative grid min-h-[100svh] content-center gap-14 py-24 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <CrabStatus status={settings.crabStatus} />
          <p className="v-kicker mt-8">The journey</p>
          <h2 id="growing-title" className="v-accent-title mt-5 max-w-[11ch]">
            Something is growing.
          </h2>
          <p className="v-lede mt-6">{first}</p>
          <p className="v-lede mt-3">{second}</p>
          <Link to="/the-crab-journey" className="v-ripple-link mt-9">
            <span className="v-ripple-link__ring" aria-hidden="true" />
            Follow the crab journey
          </Link>
        </div>
        <ol className="v-steps lg:col-span-7" aria-label="The crab journey">
          {stages.map((stage, i) => (
            <li key={`${stage.title}-${i}`} className="v-steps__item" data-status={stage.status}>
              <span className="v-steps__dot" aria-hidden="true" />
              <span className="v-steps__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="v-steps__title">{stage.title}</span>
              <span className="v-steps__state">{stage.status === "now" ? "Happening now" : "Coming soon"}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page: the timeline */

function Step({ stage, index }: { stage: CrabStage; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "-40% 0px -40% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <li ref={ref} className="v-journey__step" data-status={stage.status} data-active={active}>
      <div className="v-journey__marker" aria-hidden="true">
        <span />
      </div>
      <div className="v-journey__head">
        <p className="v-journey__num">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="v-journey__title">{stage.title}</h3>
        {stage.note ? <p className="v-journey__note">{stage.note}</p> : null}
        <p className="v-journey__state">{stage.status === "now" ? "Happening now" : "Coming soon"}</p>
      </div>
      {stage.image ? (
        <Reveal src={stage.image} alt={stage.imageAlt} className="v-journey__media" sizes="(min-width: 900px) 34vw, 90vw" />
      ) : (
        <div className="v-journey__media v-journey__media--empty" aria-hidden="true" />
      )}
      <p className="v-journey__body">{stage.body}</p>
    </li>
  );
}

export function JourneyTimeline({ stages }: { stages: CrabStage[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    return watchScrollProgress(el, () => {
      const rect = el.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - rect.top) / rect.height));
      el.style.setProperty("--journey", t.toFixed(4));
    });
  }, []);
  // Where "happening now" ends and "coming soon" begins.
  const boundary = stages.findIndex((s) => s.status === "soon");
  return (
    <ol ref={ref} className="v-journey" style={{ "--steps": stages.length } as CSSProperties}>
      {stages.map((stage, i) => (
        <FragmentWithMarker key={`${stage.title}-${i}`} showMarker={i === boundary && boundary > 0}>
          <Step stage={stage} index={i} />
        </FragmentWithMarker>
      ))}
    </ol>
  );
}

function FragmentWithMarker({ showMarker, children }: { showMarker: boolean; children: ReactNode }) {
  return (
    <>
      {showMarker ? (
        <li className="v-journey__here">
          <span>We are here</span>
          <span className="sr-only">: the steps below are still to come.</span>
        </li>
      ) : null}
      {children}
    </>
  );
}
