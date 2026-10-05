// Homepage sections for "an imagined coast", in page order.
import { Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

import { ScrollScrub, type ScrollScrubScene } from "@/components/scroll-scrub/scroll-scrub";
import { useReserve } from "@/components/site/reserve";
import { Contours, LoopFilm, Reveal, ScrollFilm, useInView } from "@/components/v2/kit";
import type { Dish, JournalPost, MenuCategory, SiteSettings } from "@/lib/content/types";
import { prefersReducedMotion, watchScrollProgress } from "@/lib/motion";
import { scrollScrubTheme } from "@/scroll-scrub-scenes";
import { formatPrice } from "@/lib/site";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ------------------------------------------------------------------ CTAs */

/** What's cooking? A clay pill with a line of steam that rises on hover. */
export function SteamCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="v-steam-cta">
      <span>{children}</span>
      <svg className="v-steam-cta__steam" viewBox="0 0 14 18" aria-hidden="true">
        <path d="M4 17 C 1 13, 7 10, 4 6 S 6 2, 5 1" />
        <path d="M10 17 C 7 13, 13 10, 10 6 S 12 2, 11 1" />
      </svg>
    </a>
  );
}

/** Discover Sal Marinho: an underline that traces itself like a contour line. */
export function ContourLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="v-contour-link">
      {children}
      <svg viewBox="0 0 260 8" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 4 C 30 0, 50 8, 80 4 S 130 0, 160 4 S 220 8, 260 3" />
      </svg>
    </a>
  );
}

/** View full menu: a tab with a folded corner that lifts. */
export function FoldTab({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="v-fold-tab">
      {children}
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ hero */

export function Hero() {
  return (
    <section className="v-hero" data-sound="waves" aria-labelledby="hero-title">
      <div className="v-hero__media">
        <picture>
          <source media="(max-width: 767px)" srcSet="/assets/v2/hero/table-m.webp" />
          <img
            src="/assets/v2/hero/table.webp"
            alt="Breakfast on a terrace table above the sea: a golden dosa on a banana leaf, coconut chutney, sambhar and coffee"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="v-hero__light" aria-hidden="true" />
      <div className="v-hero__shade" aria-hidden="true" />
      <Contours style={{ opacity: 0.1 }} />
      <div className="v-wrap v-hero__copy">
        <p className="v-kicker">Sal Marinho, Anjuna</p>
        <h1 id="hero-title" className="v-hero__title mt-6">
          A little coastal magic, <em>all day.</em>
        </h1>
        <p className="v-lede mt-6">
          South Indian and Goan breakfast that keeps no clock. Dosa from the tawa, idli from the clay pot, a Ross
          omelette with poi, and coffee whenever you would like another.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <SteamCta href="#whats-cooking">What&rsquo;s cooking?</SteamCta>
          <ContourLink href="#breakfast-has-no-clock">Discover Sal Marinho</ContourLink>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 01 what's cooking */

const SHORT_LABEL: Record<string, string> = {
  "south-indian-breakfast": "South Indian",
  "goan-breakfast": "Goan",
  "morning-classics": "Morning classics",
  "eggs-and-omelettes": "Eggs",
  "buddha-bowls": "Bowls",
  "french-toast": "French toast",
  "coffee-and-tea": "Coffee & tea",
  "fresh-juices-and-shakes": "Juices & shakes",
  "signature-smoothies": "Smoothies",
};

export function WhatsCooking({ categories, dishes }: { categories: MenuCategory[]; dishes: Dish[] }) {
  const pictured = dishes.filter((d) => d.image);
  const tabs = [
    { slug: "all", label: "All" },
    ...categories
      .filter((c) => pictured.some((d) => d.category === c.slug))
      .map((c) => ({ slug: c.slug, label: SHORT_LABEL[c.slug] ?? c.title })),
  ];
  const [active, setActive] = useState("all");
  // Menu order, with the chef's pick leading the grid in the large first tile.
  const order = (d: Dish) => categories.findIndex((c) => c.slug === d.category);
  const featured = pictured
    .filter((d) => d.featured)
    .sort((a, b) => Number(b.chefRecommendation) - Number(a.chefRecommendation) || order(a) - order(b) || a.sort - b.sort);
  const shown = (active === "all" ? (featured.length ? featured : pictured) : pictured.filter((d) => d.category === active)).slice(0, 13);

  const list = useRef<HTMLDivElement>(null);
  const [dotX, setDotX] = useState<number | null>(null);
  useIsoLayoutEffect(() => {
    const place = () => {
      const tab = list.current?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (tab) setDotX(tab.offsetLeft + tab.offsetWidth / 2 - 3.5);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const i = tabs.findIndex((t) => t.slug === active);
    const next = tabs[(i + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    setActive(next.slug);
    list.current?.querySelector<HTMLElement>(`[data-slug="${next.slug}"]`)?.focus();
  };

  return (
    <section id="whats-cooking" className="v-sec relative" data-sound="quiet" aria-labelledby="cooking-title">
      <div className="v-wrap">
        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="v-kicker">01 &middot; On the table today</p>
            <h2 id="cooking-title" className="v-accent-title mt-5">
              What&rsquo;s cooking?
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="v-lede">
              South Indian and Goan breakfast, served all day. A few favourites from the kitchen; the full menu, with
              every price, is one click away.
            </p>
          </div>
        </div>

        <div ref={list} role="tablist" aria-label="Menu sections" className="v-tabs mt-12" onKeyDown={onKey}>
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              role="tab"
              data-slug={tab.slug}
              id={`cook-tab-${tab.slug}`}
              aria-selected={active === tab.slug}
              aria-controls="cook-panel"
              tabIndex={active === tab.slug ? 0 : -1}
              className="v-tab"
              onClick={() => setActive(tab.slug)}
            >
              {tab.label}
            </button>
          ))}
          {dotX == null ? null : <span className="v-tabs__dot" aria-hidden="true" style={{ "--dot-x": `${dotX}px` } as CSSProperties} />}
        </div>

        <div id="cook-panel" role="tabpanel" aria-labelledby={`cook-tab-${active}`} className="v-cook-grid mt-10">
          {shown.map((dish) => (
            <article key={`${active}-${dish.id}`} className="v-dish">
              <Reveal
                className="v-dish__media"
                src={dish.image}
                alt={dish.imageAlt || dish.name}
                sizes="(min-width: 900px) 25vw, 50vw"
              />
              <div className="v-dish__row">
                <h3 className="v-dish__name">{dish.name}</h3>
                {dish.price != null ? <span className="v-dish__price">{formatPrice(dish.price)}</span> : null}
              </div>
              {dish.description ? <p className="v-dish__desc">{dish.description}</p> : null}
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4">
          <FoldTab to="/menu">View full menu</FoldTab>
          <p className="text-sm text-sand">Taxes extra. A 10% service charge applies.</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 02 and 05: scroll films */

function ClockRuler() {
  return (
    <div className="v-ruler" aria-hidden="true">
      <span className="v-ruler__mark" style={{ left: "0%" }}>
        Morning
      </span>
      <span className="v-ruler__mark" style={{ left: "50%" }}>
        Noon
      </span>
      <span className="v-ruler__mark" style={{ left: "100%" }}>
        Evening
      </span>
      <span className="v-ruler__dot" />
    </div>
  );
}

const film = (name: string) => ({
  clip: `/assets/v2/film/${name}.mp4`,
  mobileClip: `/assets/v2/film/${name}-m.mp4`,
  poster: `/assets/v2/film/${name}.webp`,
  mobilePoster: `/assets/v2/film/${name}-m.webp`,
});

const clockScenes: ScrollScrubScene[] = [
  {
    ...film("clock"),
    id: "breakfast-has-no-clock",
    label: "No clock",
    kicker: "02 · All day",
    title: "Breakfast doesn't have a clock.",
    body: "Dosa at noon. Eggs at nine at night. Coffee whenever you like. From the first cup of the morning to the last table of the evening, breakfast stays on.",
    actions: <ClockRuler />,
    scroll: 2.2,
    linger: 0.15,
  },
];

const coastScenes: ScrollScrubScene[] = [
  {
    ...film("coast"),
    id: "the-coast-is-in-everything",
    label: "Coast",
    kicker: "05 · Land, water, food",
    title: "The coast is in everything.",
    body: "Salt on the wind, coconut in the chutney, the sea at the end of the path. Not seafood: a feeling that finds its way onto every plate.",
    align: "right",
    scroll: 2.2,
    linger: 0.15,
  },
];

export function ClockFilm() {
  return (
    <div data-sound="waves">
      <ScrollScrub scenes={clockScenes} theme={scrollScrubTheme} className="scroll-scrub--band v-film" firstHeading="h2" />
    </div>
  );
}

const COAST_STILLS = [
  { src: "/assets/v2/coast/grass.webp", alt: "Wild grass on a cliff above the sea in low sun", caption: "Land" },
  { src: "/assets/v2/coast/basket-shore.webp", alt: "A woman carrying a basket on her head along the shore at sunset", caption: "Shore" },
  { src: "/assets/v2/coast/salt.webp", alt: "Coarse sea salt crystals on dark rock", caption: "Salt" },
  { src: "/assets/v2/coast/vessels.webp", alt: "Fishing boats and stacked vessels in a harbour", caption: "Harbour" },
  { src: "/assets/v2/coast/basket-street.webp", alt: "A woman with a basket on her head walking down an old street", caption: "Street" },
  { src: "/assets/v2/coast/garlic-strings.webp", alt: "Strings of garlic hanging against a blue wall", caption: "Market" },
];

export function CoastFilm() {
  return (
    <div data-sound="waves">
      <ScrollScrub scenes={coastScenes} theme={scrollScrubTheme} className="scroll-scrub--band v-film" firstHeading="h2" />
      <div className="v-wrap pb-[clamp(1rem,3vw,2rem)]">
        <ul className="v-strip">
          {COAST_STILLS.map((still) => (
            <li key={still.src}>
              <Reveal src={still.src} alt={still.alt} className="v-strip__media" sizes="(min-width: 900px) 16vw, 33vw" />
              <p className="v-strip__cap">{still.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 03 from the south */

const SOUTH = [
  { src: "/assets/v2/south/batter.webp", alt: "Dosa batter poured from a ladle", caption: "Batter", c: 4, r: 3, speed: 10 },
  { src: "/assets/v2/south/banana-leaf.webp", alt: "A banana leaf in low light", caption: "Banana leaf", c: 3, r: 2, speed: -6, shape: "48% 48% 4px 4px" },
  { src: "/assets/v2/south/coconut.webp", alt: "A split coconut with white flesh", caption: "Coconut", c: 3, r: 2, speed: 12 },
  { src: "/assets/v2/south/tempering.webp", alt: "Shallots, chillies and spices tempering in hot oil", caption: "Tempering", c: 5, r: 3, speed: -8 },
  { src: "/assets/v2/south/curry-leaves.webp", alt: "Curry leaves with a drop of water", caption: "Curry leaf", c: 3, r: 2, speed: 8, shape: "999px" },
  { src: "/assets/v2/south/chilli-hands.webp", alt: "Hands holding a steel bowl of dried red chillies", caption: "Chilli", c: 4, r: 3, speed: -10 },
  { src: "/assets/v2/south/rice.webp", alt: "Rice spilling from a woven basket", caption: "Rice", c: 3, r: 2, speed: 6 },
  { src: "/assets/v2/south/dal.webp", alt: "A bowl of split yellow lentils", caption: "Dal", c: 3, r: 2, speed: -6 },
  { src: "/assets/v2/south/garlic-tawa.webp", alt: "Garlic cloves roasting on a black tawa", caption: "Garlic", c: 4, r: 2, speed: 9 },
  { src: "/assets/v2/south/jackfruit.webp", alt: "Jackfruit growing on a tree trunk", caption: "Jackfruit", c: 3, r: 3, speed: -9, shape: "42% 58% 46% 54% / 50% 44% 56% 50%" },
  { src: "/assets/v2/south/coconut-fire.webp", alt: "Coconut, chilli and onion roasting over an open flame", caption: "Over the flame", c: 4, r: 2, speed: 7 },
  { src: "/assets/v2/south/red-chilli.webp", alt: "Long dried red chillies with lentils and leaves", caption: "Red chilli", c: 3, r: 2, speed: -7 },
  { src: "/assets/v2/south/tamarind-pods.webp", alt: "Tamarind pods and seeds on a dark board", caption: "Tamarind", c: 3, r: 2, speed: 10 },
];

const MOTES = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53 + 11) % 100}%`,
  size: 2 + ((i * 7) % 4),
  dur: 14 + ((i * 5) % 12),
  delay: -((i * 3) % 14),
}));

function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-speed]"));
    return watchScrollProgress(el, (p) => {
      for (const item of items) {
        const speed = Number(item.dataset.speed);
        item.style.transform = `translate3d(0, ${((p - 0.5) * speed).toFixed(2)}%, 0)`;
      }
    });
  }, []);
  return ref;
}

export function FromTheSouth() {
  const ref = useParallax<HTMLElement>();
  return (
    <section ref={ref} id="from-the-south" className="v-sec relative overflow-hidden bg-smoked/40" data-sound="quiet" aria-labelledby="south-title">
      <div className="v-particles" aria-hidden="true">
        {MOTES.map((m, i) => (
          <span
            key={i}
            style={{ left: m.left, top: m.top, width: m.size, height: m.size, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` }}
          />
        ))}
      </div>
      <div className="v-wrap">
        <div className="v-collage">
          <div className="v-collage__copy" style={{ "--c": 5, "--r": 3 } as CSSProperties}>
            <p className="v-kicker">03 &middot; Roots</p>
            <h2 id="south-title" className="v-title mt-5">
              From the <em>South.</em>
            </h2>
            <p className="v-lede mt-6">
              Coconut, curry leaf, pepper, mustard seed, tamarind and rice. Batter left overnight, a banana leaf for a
              plate. Mangalore, Udupi, Bangalore and Chettinad, cooked by the sea in Goa.
            </p>
          </div>
          {SOUTH.map((item) => (
            <figure
              key={item.src}
              style={{ "--c": item.c, "--r": item.r, "--shape": item.shape } as CSSProperties}
            >
              <img src={item.src} alt={item.alt} loading="lazy" decoding="async" data-speed={item.speed} />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 04 follow the spice */

const SPICES = [
  { id: "pepper", name: "Black pepper", text: "From the hills behind the coast. Heat that arrives slowly and stays.", cut: "pepper", macro: "/assets/v2/south/pepper.webp", x: "18%", y: "30%", w: "8.5rem", blur: "1.6px", dur: "15s" },
  { id: "curry-leaf", name: "Curry leaf", text: "Dropped into hot oil until it crackles. The smell of a South Indian kitchen.", cut: "curry-leaf", macro: "/assets/v2/south/curry-leaves.webp", x: "40%", y: "18%", w: "10rem", blur: "0.8px", dur: "17s" },
  { id: "mustard", name: "Mustard seed", text: "Tiny, dark and loud in the pan: the first sound of a tempering.", cut: "mustard", macro: "/assets/v2/south/mustard.webp", x: "66%", y: "26%", w: "8rem", blur: "2.2px", dur: "13s" },
  { id: "chilli", name: "Dried red chilli", text: "Darkened in ghee for colour and a gentle, smoky heat. The heart of a ghee roast.", cut: "chilli", macro: "/assets/v2/south/chilli.webp", x: "84%", y: "40%", w: "11rem", blur: "1px", dur: "16s" },
  { id: "tamarind", name: "Tamarind", text: "Sour and fruity, the quiet backbone of a good sambhar.", cut: "tamarind", macro: "/assets/v2/south/tamarind.webp", x: "30%", y: "62%", w: "10rem", blur: "1.4px", dur: "18s" },
  { id: "coffee", name: "Coffee", text: "Roasted dark, brewed strong and poured with milk, morning and evening.", cut: "coffee", macro: "/assets/v2/south/coffee.webp", x: "54%", y: "52%", w: "8rem", blur: "2.6px", dur: "14s" },
  { id: "cardamom", name: "Cardamom", text: "Green, floral and bright. A pod or two lifts a glass of masala chai.", cut: "cardamom", macro: "", x: "12%", y: "74%", w: "7.5rem", blur: "2px", dur: "12s" },
  { id: "cinnamon", name: "Cinnamon", text: "Warm, sweet bark, used gently in masalas and in chai.", cut: "cinnamon", macro: "", x: "72%", y: "72%", w: "10.5rem", blur: "1.2px", dur: "19s" },
];

function SpiceRow({ spice }: { spice: (typeof SPICES)[number] }) {
  const ref = useRef<HTMLLIElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Active while the row crosses the middle band of the screen.
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "-42% 0px -42% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <li ref={ref} className="v-spice__row" data-active={active}>
      <img src={`/assets/v2/spice/${spice.cut}.webp`} alt="" loading="lazy" decoding="async" />
      <div>
        <h3 className="v-spice__name">{spice.name}</h3>
        <p className="v-spice__text">{spice.text}</p>
      </div>
    </li>
  );
}

export function FollowTheSpice() {
  const [active, setActive] = useState<string | null>(null);
  const current = SPICES.find((s) => s.id === active) ?? null;
  return (
    <section id="follow-the-spice" className="v-spice" data-sound="quiet" data-cursor="ember" aria-labelledby="spice-title">
      <div className="v-wrap pt-[clamp(5rem,10vw,9rem)]">
        <p className="v-kicker">04 &middot; Ingredients</p>
        <h2 id="spice-title" className="v-title mt-5 max-w-3xl">
          Follow the <em>spice.</em>
        </h2>
        <p className="v-lede mt-6 v-spice__hint">Move across the dark and bring an ingredient closer.</p>
      </div>

      <div className="v-spice__field" onMouseLeave={() => setActive(null)}>
        {SPICES.map((spice) => (
          <button
            key={spice.id}
            type="button"
            className="v-spice__item"
            data-active={active === spice.id}
            aria-pressed={active === spice.id}
            aria-label={spice.name}
            style={{ "--x": spice.x, "--y": spice.y, "--w": spice.w, "--blur": spice.blur, "--dur": spice.dur } as CSSProperties}
            onMouseEnter={() => setActive(spice.id)}
            onFocus={() => setActive(spice.id)}
            onClick={() => setActive(spice.id)}
          >
            <img src={`/assets/v2/spice/${spice.cut}.webp`} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
        <div className="v-spice__panel" aria-live="polite">
          {current ? (
            <>
              <div className="v-spice__macro" key={current.id}>
                <img src={current.macro || `/assets/v2/spice/${current.cut}.webp`} alt="" />
              </div>
              <div>
                <p className="v-spice__name">{current.name}</p>
                <p className="v-spice__text">{current.text}</p>
              </div>
            </>
          ) : (
            <p className="v-spice__text col-span-2">Eight small things that make South Indian food taste like itself.</p>
          )}
        </div>
      </div>

      <ul className="v-spice__stack v-wrap">
        {SPICES.map((spice) => (
          <SpiceRow key={spice.id} spice={spice} />
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ 06 a little portuguese */

const ROUTE =
  "M150 96 C 110 190, 150 300, 250 372 C 350 444, 470 492, 572 430 C 660 376, 700 300, 752 236 C 790 280, 806 340, 812 408 C 818 452, 790 470, 768 452 C 744 430, 720 380, 720 330";
type Stop = { at: number; x: number; y: number; label: string; lx: number; ly: number; anchor: "start" | "middle" | "end"; sea?: boolean; img: string; alt: string; cap: string };
const STOPS: Stop[] = [
  { at: 0, x: 150, y: 96, label: "Portugal", lx: 170, ly: 92, anchor: "start", img: "/assets/v2/portugal/facade.webp", alt: "A lime-washed church facade with a bell tower", cap: "Facades" },
  { at: 0.36, x: 572, y: 430, label: "Indian Ocean", sea: true, lx: 500, ly: 528, anchor: "middle", img: "/assets/v2/portugal/ceramic.webp", alt: "A blue and white ceramic tile fragment", cap: "Ceramics" },
  { at: 0.6, x: 752, y: 236, label: "Goa", lx: 736, ly: 226, anchor: "end", img: "/assets/v2/portugal/choris.webp", alt: "Strings of Goan choris sausage", cap: "Choris" },
  { at: 0.8, x: 812, y: 408, label: "Coastal India", lx: 830, ly: 412, anchor: "start", img: "/assets/v2/portugal/poee.webp", alt: "A stack of soft Goan poi bread", cap: "Poi" },
  { at: 1, x: 720, y: 330, label: "Sal Marinho", lx: 704, ly: 335, anchor: "end", img: "/assets/v2/portugal/poee-hands.webp", alt: "Hands lifting a fresh poi from a tray", cap: "Breakfast on poi" },
];

export function PortugueseMap() {
  const wrap = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const [reached, setReached] = useState(1);
  useEffect(() => {
    const el = wrap.current;
    const path = route.current;
    if (!el || !path) return;
    if (prefersReducedMotion()) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    let last = -1;
    return watchScrollProgress(el, (p) => {
      const t = Math.min(1, Math.max(0, (p - 0.18) / 0.5));
      path.style.strokeDashoffset = `${(length * (1 - t)).toFixed(1)}`;
      const rounded = Math.round(t * 50) / 50;
      if (rounded !== last) {
        last = rounded;
        setReached(rounded);
      }
    });
  }, []);
  return (
    <section id="a-little-portuguese" className="v-sec relative overflow-hidden" data-sound="waves" aria-labelledby="portuguese-title">
      <Contours style={{ opacity: 0.08 }} />
      <div className="v-wrap">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="v-kicker">06 &middot; Same ocean</p>
            <h2 id="portuguese-title" className="v-title mt-5">
              A little Portuguese <em>in the coast.</em>
            </h2>
          </div>
          <p className="v-lede self-end md:col-span-5 md:col-start-8">
            Poi from the bakers who followed the ships. Choris with its vinegar and smoke. Facades washed in lime,
            doorways framed in blue. You will find it on the breakfast table, under almost every egg.
          </p>
          <div className="md:col-span-5 md:col-start-8">
            <Link to="/menu" hash="goan-breakfast" className="v-contour-link">
              The Goan breakfast
              <svg viewBox="0 0 260 8" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 4 C 30 0, 50 8, 80 4 S 130 0, 160 4 S 220 8, 260 3" />
              </svg>
            </Link>
          </div>
        </div>

        <div ref={wrap} className="v-map mt-12">
          <svg viewBox="0 0 1000 560" role="img" aria-label="An abstract line travelling from Portugal across the Indian Ocean to Goa, down the Indian coast and back to Sal Marinho">
            {Array.from({ length: 6 }, (_, i) => (
              <path
                key={`a${i}`}
                className="v-map__contour"
                d={`M${60 - i * 8} ${40 + i * 6} C ${200 + i * 10} ${10 - i * 4}, ${260 - i * 6} ${200 + i * 14}, ${140 + i * 4} ${260 + i * 22} S ${40 - i * 6} ${200 + i * 16}, ${60 - i * 8} ${40 + i * 6}`}
              />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <path
                key={`b${i}`}
                className="v-map__contour"
                d={`M${700 - i * 6} ${120 - i * 12} C ${900 + i * 8} ${100 - i * 10}, ${980 + i * 4} ${300 + i * 6}, ${860 + i * 6} ${520 + i * 10} C ${820 + i * 4} ${440 + i * 6}, ${760 - i * 8} ${380 + i * 4}, ${700 - i * 6} ${120 - i * 12}Z`}
              />
            ))}
            <path ref={route} className="v-map__route" d={ROUTE} />
            {STOPS.map((stop) => (
              <g key={stop.label} className="v-map__point" data-reached={reached >= stop.at}>
                <circle cx={stop.x} cy={stop.y} r="6" />
                <text x={stop.lx} y={stop.ly} textAnchor={stop.anchor} className={`v-map__label${stop.sea ? " v-map__label--sea" : ""}`}>
                  {stop.label}
                </text>
              </g>
            ))}
          </svg>
          <ul className="v-map__vignettes">
            {STOPS.map((stop) => (
              <li key={stop.img} className="v-vignette" data-reached={reached >= stop.at}>
                <img src={stop.img} alt={stop.alt} loading="lazy" decoding="async" />
                <span className="v-vignette__place">{stop.label}</span>
                <span className="v-vignette__cap">{stop.cap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 07 fire */

const FIRE_DETAILS = [
  { src: "/assets/v2/fire/chef.webp", alt: "A cook in the dark holding a ladle of flame" },
  { src: "/assets/v2/fire/dosa-flame.webp", alt: "Dosa batter setting on a pan over a flame" },
  { src: "/assets/v2/fire/cast-iron.webp", alt: "Peppers and greens charring in cast iron over coals" },
  { src: "/assets/v2/fire/clay-pots.webp", alt: "Steam rising from small clay pots" },
  { src: "/assets/v2/fire/appe-pan.webp", alt: "Appe browning in a cast iron appe pan" },
  { src: "/assets/v2/fire/embers.webp", alt: "Charcoal glowing red at the edges" },
];

export function Fire() {
  return (
    <section id="fire" className="relative bg-[#070605]" data-sound="fire" data-cursor="ember" aria-labelledby="fire-title">
      <div className="v-fire">
        <LoopFilm
          className="v-fire__film"
          film={{ src: "/assets/v2/film/fire.mp4", mobileSrc: "/assets/v2/film/fire-m.mp4", poster: "/assets/v2/film/fire.webp" }}
        />
        <div className="v-fire__shade" aria-hidden="true" />
        <div className="v-smoke v-smoke--in" aria-hidden="true" />
        <div className="v-wrap relative z-[3] flex min-h-[112svh] flex-col justify-center py-24">
          <p className="v-kicker">07 &middot; Fire</p>
          <h2 id="fire-title" className="v-title mt-5 max-w-[12ch]">
            Some things taste better <em>with fire.</em>
          </h2>
          <p className="v-lede mt-6">
            Cast iron, clay and flame. A dosa on a hot tawa, poi charred on the grill, tatte idli steaming in its clay
            pot.
          </p>
        </div>
        <div className="v-smoke v-smoke--out" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="v-wrap relative z-[3] -mt-24 pb-[clamp(5rem,10vw,9rem)]">
        <ul className="v-strip v-strip--fire">
          {FIRE_DETAILS.map((d) => (
            <li key={d.src}>
              <Reveal src={d.src} alt={d.alt} className="v-strip__media" sizes="(min-width: 900px) 16vw, 33vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 08 come in */

const ROOM_DETAILS = [
  { src: "/assets/v2/room/arch.webp", alt: "An open arch looking out to the sea", cap: "The arch" },
  { src: "/assets/v2/room/cup.webp", alt: "A cup of coffee on a stone ledge in dappled light", cap: "Coffee" },
  { src: "/assets/v2/room/hands.webp", alt: "Hands folding a dosa on a hot tawa", cap: "The tawa" },
  { src: "/assets/v2/room/idli-grill.webp", alt: "A clay pot of tatte idli on a grill", cap: "Clay pot" },
  { src: "/assets/v2/room/table.webp", alt: "A wooden table with eggs on poi, coffee and small bowls", cap: "The table" },
  { src: "/assets/v2/room/oils.webp", alt: "Small glass bottles of oils in a row against green leaves", cap: "Oils" },
];

export function ComeIn() {
  return (
    <section id="come-in" className="relative" data-sound="quiet" aria-labelledby="room-title">
      <div className="v-room">
        <ScrollFilm
          className="v-room__film"
          label="A slow walk through the restaurant: stone walls, wooden tables, an arch open to the sea"
          film={{ src: "/assets/v2/film/room.mp4", mobileSrc: "/assets/v2/film/room-m.mp4", poster: "/assets/v2/film/room.webp" }}
        />
        <div className="v-room__shade" aria-hidden="true" />
        <div className="v-wrap relative flex min-h-[92svh] flex-col justify-end pb-[clamp(3rem,8vw,6rem)]">
          <p className="v-kicker">08 &middot; The room</p>
          <h2 id="room-title" className="v-title mt-5">
            Come in. <em>Stay awhile.</em>
          </h2>
          <p className="v-lede mt-6">
            Stone, timber and a little shade. A table by the arch, light moving slowly across it, and a coffee that
            turns into a second one.
          </p>
        </div>
      </div>
      <div className="v-wrap pt-[clamp(4rem,9vw,8rem)]">
        <ul className="v-details">
          {ROOM_DETAILS.map((d) => (
            <li key={d.src}>
              <Reveal src={d.src} alt={d.alt} className="v-details__media" sizes="(min-width: 900px) 30vw, 50vw" />
              <p className="v-strip__cap">{d.cap}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 09 journal */

export function JournalSpread({ posts }: { posts: JournalPost[] }) {
  return (
    <section id="journal" className="v-sec" data-sound="quiet" aria-labelledby="journal-title">
      <div className="v-wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="v-kicker">09 &middot; Stories</p>
            <h2 id="journal-title" className="v-title mt-5">
              From our kitchen <em>journal.</em>
            </h2>
          </div>
          <Link to="/journal" className="v-contour-link">
            All stories
            <svg viewBox="0 0 260 8" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 4 C 30 0, 50 8, 80 4 S 130 0, 160 4 S 220 8, 260 3" />
            </svg>
          </Link>
        </div>
        <div className="v-journal mt-12">
          {posts.map((post) => (
            <StoryCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function StoryCard({ post }: { post: JournalPost }) {
  const soon = post.category === "The crab";
  return (
    <Link to="/journal/$slug" params={{ slug: post.slug }} className={`v-story${soon ? " v-story--soon" : ""}`}>
      <div className="v-story__media">
        <img src={post.cover} alt={post.coverAlt} loading="lazy" decoding="async" />
      </div>
      <div className="grid gap-3">
        <p className="sm-label">{soon ? "Coming soon" : post.category}</p>
        <h3 className="v-story__title">{post.title}</h3>
        <p className="text-sm leading-relaxed text-sand">{post.excerpt}</p>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-bone">
          Read the story <span className="v-story__arrow" aria-hidden="true">&rarr;</span>
        </p>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ 10 something is growing */

export function SomethingIsGrowing() {
  return (
    <section id="something-is-growing" className="v-growing" data-sound="waves" aria-labelledby="growing-title">
      <LoopFilm
        className="v-growing__film"
        film={{ src: "/assets/v2/film/mangrove.mp4", mobileSrc: "/assets/v2/film/mangrove-m.mp4", poster: "/assets/v2/film/mangrove.webp" }}
      />
      <div className="v-growing__shade" aria-hidden="true" />
      <div className="v-wrap relative flex min-h-[clamp(26rem,70svh,40rem)] flex-col justify-center py-20">
        <p className="v-soon">10 &middot; Coming soon</p>
        <h2 id="growing-title" className="v-accent-title mt-5 max-w-[12ch]">
          Something is growing.
        </h2>
        <p className="v-lede mt-6">
          A slow project is underway in calm water. It is not on the menu yet, and we will not rush it to the table.
        </p>
        <Link to="/the-crab-journey" className="v-ripple-link mt-8 self-start">
          <span className="v-ripple-link__ring" aria-hidden="true" />
          Follow the journey
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ come to the table */

export function ComeToTheTable({ settings }: { settings: SiteSettings }) {
  const { open } = useReserve();
  const [ref, seen] = useInView<HTMLDivElement>();
  const whatsapp = settings.whatsapp.replace(/[^\d]/g, "");
  return (
    <section id="come-to-the-table" className="v-table" data-sound="waves" aria-labelledby="table-title">
      <div className="v-table__media">
        <img src="/assets/v2/table/evening.webp" alt="The terrace in the evening, tables lit by candles above the sea" loading="lazy" decoding="async" />
      </div>
      <div className="v-table__shade" aria-hidden="true" />
      <div ref={ref} className="v-wrap relative grid min-h-[100svh] items-end gap-12 py-24 md:grid-cols-12 md:items-center" data-in={seen}>
        <div className="md:col-span-6 md:col-start-7">
          <p className="v-kicker">Anjuna, Goa</p>
          <h2 id="table-title" className="v-accent-title mt-5">
            Come to the table.
          </h2>
          <dl className="v-detail-list mt-10">
            {settings.address ? (
              <div>
                <dt>Find us</dt>
                <dd className="whitespace-pre-line">{settings.address}</dd>
              </div>
            ) : (
              <div>
                <dt>Find us</dt>
                <dd>{settings.locality}</dd>
              </div>
            )}
            {settings.hours.length ? (
              <div>
                <dt>Hours</dt>
                <dd>
                  {settings.hours.map((h) => (
                    <span key={`${h.days}-${h.open}`} className="block">
                      {h.days}: {h.open} to {h.close}
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
            {settings.phone ? (
              <div>
                <dt>Call</dt>
                <dd>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
                </dd>
              </div>
            ) : null}
            {whatsapp || settings.instagram || settings.mapsUrl ? (
              <div>
                <dt>Elsewhere</dt>
                <dd className="flex flex-wrap gap-x-6 gap-y-2">
                  {settings.mapsUrl ? (
                    <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">
                      Map
                    </a>
                  ) : null}
                  {whatsapp ? (
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  ) : null}
                  {settings.instagram ? (
                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  ) : null}
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <button type="button" className="sm-ember-pill" onClick={open}>
              <span className="sm-ember-pill__coal" aria-hidden="true" />
              <span className="relative">Reserve a table</span>
            </button>
            <Link to="/visit" className="v-contour-link">
              Visit us
              <svg viewBox="0 0 260 8" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 4 C 30 0, 50 8, 80 4 S 130 0, 160 4 S 220 8, 260 3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
