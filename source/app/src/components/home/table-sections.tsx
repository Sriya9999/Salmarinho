import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { OrderChit, RouteLink, ShorelineLink } from "@/components/cta/garments";
import { Icon } from "@/components/site/Icon";
import { Steam } from "@/components/motion/primitives";
import type { Dish, JournalPost, MenuCategory } from "@/lib/content/types";
import { prefersReducedMotion, watchScrollProgress } from "@/lib/motion";
import { formatPrice } from "@/lib/site";

/* ---------------------------------------------------------------- What's cooking? (menu slices) */

export function MenuSlices({ categories, dishes }: { categories: MenuCategory[]; dishes: Dish[] }) {
  const [open, setOpen] = useState(0);
  const current = categories[open];
  return (
    <section
      aria-labelledby="menu-title"
      className={`sm-menu-slices sm-mood-${current?.mood ?? "volcanic"} relative overflow-hidden py-24 md:py-32`}
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="sm-eyebrow text-sand">Menu</p>
          <h2 id="menu-title" className="sm-display mt-5 text-5xl text-bone md:text-7xl">
            What's cooking?
          </h2>
          <p className="mt-6 max-w-sm text-sand">
            Not a list of dishes, a journey in eight courses: from the sea, through the fire, into the claypot and on to something sweet.
          </p>
          <div className="mt-10">
            <ShorelineLink to="/menu">See the whole menu</ShorelineLink>
          </div>
        </div>
        <div className="sm-slices lg:col-span-8" role="list">
          {categories.map((c, i) => {
            const isOpen = i === open;
            const inCategory = dishes.filter((d) => d.category === c.slug).slice(0, 3);
            return (
              <div
                key={c.slug}
                role="listitem"
                className={`sm-slice sm-mood-${c.mood}`}
                data-open={isOpen}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setOpen(i);
                }}
              >
                <button
                  type="button"
                  className="sm-slice__tab"
                  aria-expanded={isOpen}
                  aria-controls={`slice-${c.slug}`}
                  onClick={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                >
                  <span className="sm-slice__title">{c.title}</span>
                  <Icon name={c.icon} className="sm-slice__icon" />
                </button>
                <div id={`slice-${c.slug}`} className="sm-slice__panel" hidden={!isOpen}>
                  <div className="relative overflow-hidden">
                    <img src={c.image} alt={c.imageAlt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    {c.mood === "clay" || c.mood === "ember" ? <Steam intensity={0.8} /> : null}
                  </div>
                  <p className="mt-5 font-body text-[0.7rem] tracking-[0.24em] text-sand uppercase">{c.subtitle}</p>
                  <p className="mt-3 text-sand">{c.story}</p>
                  {inCategory.length ? (
                    <ul className="mt-5 divide-y divide-hairline border-y border-hairline">
                      {inCategory.map((d) => (
                        <li key={d.id}>
                          <Link to="/menu/$slug" params={{ slug: d.slug }} className="flex items-baseline justify-between gap-4 py-3 text-bone">
                            <span className="font-display text-lg">{d.name}</span>
                            {formatPrice(d.price) ? <span className="text-sm text-sand">{formatPrice(d.price)}</span> : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link to="/menu" hash={c.slug} className="sm-slice__cta mt-6">
                    Discover the dish
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- The Portuguese connection */

// Positions are percentages of the engraved chart (Lisbon, the West African
// coast, round the Cape, up to Goa, then two waypoints on the Indian coast).
const ROUTE_POINTS = [
  { label: "Portugal", x: 27, y: 10, side: "right" },
  { label: "Coastal trade", x: 22, y: 55, side: "right" },
  { label: "India", x: 86, y: 41, side: "left" },
  { label: "Local ingredients", x: 88, y: 54, side: "left" },
  { label: "Modern interpretation", x: 90, y: 66, side: "left" },
] as const;

const INGREDIENTS = [
  { name: "Chilli", src: "/assets/art/ingredients/chilli.png" },
  { name: "Cashew", src: "/assets/art/ingredients/cashew.png" },
  { name: "Toddy vinegar", src: "/assets/art/ingredients/vinegar.png" },
  { name: "Coconut", src: "/assets/art/ingredients/coconut.png" },
];

export function PortugueseConnection() {
  const svg = useRef<SVGPathElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const path = svg.current;
    const el = wrap.current;
    if (!path || !el || prefersReducedMotion()) return;
    return watchScrollProgress(el, (p) => {
      const t = Math.min(1, Math.max(0.12, (p - 0.1) / 0.5));
      path.style.clipPath = `inset(0 ${(100 - t * 100).toFixed(1)}% 0 0)`;
    });
  }, []);

  return (
    <section aria-labelledby="portuguese-title" className="sm-azulejo-frame relative bg-charcoal">
      <div className="relative mx-auto grid max-w-7xl gap-12 bg-charcoal px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="portuguese-title" className="sm-display text-4xl text-bone md:text-5xl">
            The Portuguese connection
          </h2>
          <p className="mt-6 max-w-sm text-sand">
            Five centuries ago, ships from Lisbon rounded Africa and reached this coast. They came for pepper. They left chillies,
            cashew, vinegar and bread ovens, and Goa turned them into something of its own.
          </p>
          <p className="sm-label mt-8">Same ocean. New flavours.</p>
          <div className="mt-10">
            <RouteLink to="/portuguese-connection">Trace the route</RouteLink>
          </div>
        </div>
        <div ref={wrap} className="relative lg:col-span-5">
          <img src="/assets/art/route-map.webp" alt="An engraved sea chart of Portugal, Africa and India's west coast" loading="lazy" className="w-full" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path
              ref={svg}
              d="M27 10 C 16 24, 13 42, 22 55 C 29 70, 37 88, 45 93 C 56 97, 60 70, 66 56 C 72 45, 79 41, 86 41 C 88 46, 88 50, 88 54 C 89 58, 90 62, 90 66"
              fill="none"
              stroke="currentColor"
              className="text-terracotta"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="2 7"
            />
          </svg>
          <ol className="absolute inset-0" aria-label="The route">
            {ROUTE_POINTS.map((pt, i) => (
              <li key={pt.label} className="absolute" style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
                <span className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full border border-terracotta bg-charcoal" aria-hidden="true" />
                <span
                  className={`absolute -top-2 whitespace-nowrap bg-charcoal/70 px-1 font-display text-[0.7rem] tracking-[0.12em] text-bone md:text-xs ${
                    pt.side === "left" ? "right-3" : "left-3"
                  }`}
                >
                  {i + 1}. {pt.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:col-span-3 lg:border-l lg:border-hairline lg:pl-8">
          {INGREDIENTS.map((ing) => (
            <figure key={ing.name} className="text-center">
              <img src={ing.src} alt={`${ing.name}, engraved illustration`} loading="lazy" className="mx-auto aspect-square w-24 object-contain" />
              <figcaption className="mt-2 font-body text-[0.65rem] tracking-[0.24em] text-sand uppercase">{ing.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Journal spread */

export function JournalSpread({ posts }: { posts: JournalPost[] }) {
  if (!posts.length) return null;
  const [lead, ...rest] = posts;
  return (
    <section aria-labelledby="journal-title" className="relative bg-volcanic py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <p className="sm-eyebrow">Kitchen journal</p>
          <h2 id="journal-title" className="sm-display mt-5 text-4xl text-bone md:text-5xl">
            From our kitchen journal
          </h2>
          <p className="mt-6 text-sand">Notes, stories and the occasional obsession, from the sea to the fire.</p>
          <div className="mt-10">
            <ShorelineLink to="/journal">Read the journal</ShorelineLink>
          </div>
        </div>
        <article className="group relative lg:col-span-5">
          <Link to="/journal/$slug" params={{ slug: lead.slug }} className="block">
            <div className="overflow-hidden">
              <img
                src={lead.cover}
                alt={lead.coverAlt}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]"
              />
            </div>
            <p className="mt-5 font-body text-[0.68rem] tracking-[0.26em] text-ember uppercase">{lead.category}</p>
            <h3 className="mt-2 text-3xl text-bone md:text-4xl">{lead.title}</h3>
            <p className="mt-3 max-w-md text-sand">{lead.excerpt}</p>
          </Link>
        </article>
        <div className="flex flex-col gap-12 lg:col-span-4 lg:pt-24">
          {rest.map((post, i) => (
            <article key={post.id} className={`group ${i === 1 ? "lg:ml-12" : ""}`}>
              <Link to="/journal/$slug" params={{ slug: post.slug }} className="grid grid-cols-5 items-end gap-5">
                <div className="col-span-2 overflow-hidden">
                  <img
                    src={post.cover}
                    alt={post.coverAlt}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.05]"
                  />
                </div>
                <div className="col-span-3">
                  <p className="font-body text-[0.65rem] tracking-[0.26em] text-ember uppercase">{post.category}</p>
                  <h3 className="mt-2 text-xl text-bone md:text-2xl">{post.title}</h3>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- The fire is lit (closing) */

/**
 * Giant display type with the fire film playing inside the letterforms
 * (canvas knockout). Static fire still under reduced motion.
 */
function FireLetters({ text }: { text: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const cv = canvas.current;
    const vid = video.current;
    if (!cv || !vid) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const poster = new Image();
    poster.src = "/assets/world/leg-4-mobile-poster.jpg"; // flames around the claypot
    let raf = 0;
    let running = false;
    const reduced = prefersReducedMotion();

    // Offscreen layer: the video clipped to the letters.
    const layer = document.createElement("canvas");
    const lctx = layer.getContext("2d");

    const draw = () => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (cv.width !== pw || cv.height !== ph) {
        cv.width = layer.width = pw;
        cv.height = layer.height = ph;
      }
      let size = h * 0.86;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `400 ${size}px Cinzel, serif`;
      const measured = ctx.measureText(text).width;
      if (measured > w * 0.96) size *= (w * 0.96) / measured;
      const font = `400 ${size}px Cinzel, serif`;
      const writeText = (c: CanvasRenderingContext2D) => {
        c.font = font;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(text, w / 2, h / 2 + size * 0.04);
      };

      // Ember letters, so the words read even on a dark frame.
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      const ember = ctx.createLinearGradient(0, h * 0.15, 0, h * 0.85);
      ember.addColorStop(0, "#d98a5f");
      ember.addColorStop(0.55, "#a8502f");
      ember.addColorStop(1, "#6e2f19");
      ctx.fillStyle = ember;
      writeText(ctx);

      // Flames on top, screened in so they brighten the letters.
      const source: CanvasImageSource | null = !reduced && vid.readyState >= 2 ? vid : poster.complete && poster.naturalWidth > 0 ? poster : null;
      if (source && lctx) {
        const sw = source instanceof HTMLVideoElement ? source.videoWidth : poster.naturalWidth;
        const sh = source instanceof HTMLVideoElement ? source.videoHeight : poster.naturalHeight;
        lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lctx.globalCompositeOperation = "source-over";
        lctx.clearRect(0, 0, w, h);
        lctx.fillStyle = "#000";
        writeText(lctx);
        lctx.globalCompositeOperation = "source-in";
        const scale = Math.max(w / sw, h / sh);
        lctx.drawImage(source, (w - sw * scale) / 2, (h - sh * scale) / 2, sw * scale, sh * scale);
        ctx.globalCompositeOperation = "screen";
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(layer, 0, 0);
        ctx.globalCompositeOperation = "source-over";
      }
    };
    // Loop only the stretch of the fire clip where flames fill the frame.
    const LOOP_START = 3.6;
    const LOOP_END = 5.9;
    const loop = () => {
      if (vid.readyState >= 1 && !vid.seeking && (vid.currentTime < LOOP_START || vid.currentTime > LOOP_END)) vid.currentTime = LOOP_START;
      draw();
      if (running) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !reduced;
      cancelAnimationFrame(raf);
      if (running) {
        vid.play().catch(() => undefined);
        raf = requestAnimationFrame(loop);
      } else {
        vid.pause();
        draw();
      }
    });
    io.observe(cv);
    poster.onload = draw;
    void document.fonts?.ready.then(draw);
    window.addEventListener("resize", draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", draw);
      vid.pause();
    };
  }, [text]);

  return (
    <div className="relative">
      <h2 className="sr-only">{text}</h2>
      <canvas ref={canvas} aria-hidden="true" className="block h-[26vw] max-h-72 min-h-24 w-full" />
      <video
        ref={video}
        src="/assets/world/leg-3-mobile.mp4"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        className="sm-source-video"
      />
    </div>
  );
}

export function ReserveBand() {
  return (
    <section aria-label="Reserve your table" className="relative overflow-hidden bg-volcanic pt-24 md:pt-32" data-cursor="ember">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <FireLetters text="The fire is lit." />
        <div className="relative z-10 mt-10 flex justify-center pb-40 md:pb-48">
          <OrderChit />
        </div>
      </div>
      <img src="/assets/art/plate-charred.webp" alt="" aria-hidden="true" loading="lazy" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 w-full object-cover opacity-70 md:h-40" />
    </section>
  );
}
