import { useEffect, useRef, useState, type CSSProperties } from "react";

import { RitualBadge } from "@/components/first/garments";
import { Drift, ParallaxImage, Steam } from "@/components/motion/primitives";
import { prefersReducedMotion, watchScrollProgress } from "@/lib/motion";

/* ---------------------------------------------------------------- Philosophy */

export function Philosophy() {
  return (
    <section aria-labelledby="philosophy-title" data-sound="waves" className="relative overflow-hidden bg-volcanic py-28 md:py-40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-6 px-5 md:grid-cols-12 md:gap-10 md:px-10">
        <ParallaxImage
          src="/assets/photos/owner/fish-catch.webp"
          alt="The morning catch laid out on a wooden board"
          wave
          className="order-2 aspect-[3/4] md:order-1 md:col-span-3"
          sizes="(min-width: 768px) 25vw, 50vw"
        />
        <div className="order-1 col-span-2 py-6 text-center md:order-2 md:col-span-6">
          <h2 id="philosophy-title" className="sm-display text-4xl text-bone md:text-6xl">
            Not another seafood restaurant.
          </h2>
          <p className="mx-auto mt-8 max-w-md text-lg text-sand">
            The coast gives us the catch. Fire gives it character. Time gives it a story, and we serve the story.
          </p>
          <span className="mx-auto mt-10 block h-px w-24 bg-terracotta" aria-hidden="true" />
        </div>
        <ParallaxImage
          src="/assets/photos/owner/butters.webp"
          alt="Nine house butters in small white pots on black slate"
          strength={0.16}
          className="order-3 aspect-[3/4] md:col-span-3 md:mt-40"
          sizes="(min-width: 768px) 25vw, 50vw"
        />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- The fattening ritual */

const RITUAL = [
  { step: "Coast", line: "Mud crab from the mangroves and estuaries of the Arabian Sea.", image: "/assets/photos/ritual/coast.webp", alt: "Crab traps stacked on black laterite rocks by the sea at first light" },
  { step: "Selection", line: "Each crab is weighed and checked by hand. Only the strongest stay.", image: "/assets/photos/ritual/selection.webp", alt: "Weathered hands lifting a live mud crab from a woven basket" },
  { step: "Fattening", line: "Calm brackish water, good feed and time, until the shell is full.", image: "/assets/photos/ritual/fattening.webp", alt: "Mud crabs resting in a bamboo pen among mangrove roots" },
  { step: "Preparation", line: "Cleaned with care and paired with coastal spices from across the world.", image: "/assets/photos/ritual/preparation-2.webp", alt: "A cleaned crab on a banana leaf among small heaps of whole spices: peppercorns, dried chillies, cinnamon, star anise, cloves and saffron" },
  { step: "Fire", line: "Cooked over live wood fire, turned by hand, finished with smoke.", image: "/assets/photos/ritual/fire.webp", alt: "Masala-glazed crab halves grilling over a wood fire" },
  { step: "Clay", line: "Sealed in claypot or cast iron to keep the heat and the aroma.", image: "/assets/photos/ritual/clay.webp", alt: "A blackened claypot of crab curry resting on glowing coals" },
  { step: "Table", line: "Served the moment it is ready. Nothing waits.", image: "/assets/photos/ritual/table.webp", alt: "A crab dish in its claypot on a candlelit wooden table" },
];

export function FatteningRitual() {
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const row of rows.current) if (row) io.observe(row);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="ritual-title" data-sound="crab" className="relative bg-volcanic">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-12 md:px-10 md:py-32">
        <div className="md:col-span-5">
          <p className="sm-eyebrow">The crab</p>
          <h2 id="ritual-title" className="sm-display mt-5 text-4xl text-bone md:text-6xl">
            The fattening ritual
          </h2>
          <p className="mt-6 max-w-sm text-sand">
            A first-of-its-kind way to cook crab on this coast. From the sea to the fire, a journey of seven steps.
          </p>
          <ol className="relative mt-14 border-l border-hairline">
            {RITUAL.map((r, i) => (
              <li
                key={r.step}
                ref={(el) => {
                  rows.current[i] = el;
                }}
                data-index={i}
                className="relative min-h-[34vh] pb-10 pl-10 md:min-h-[42vh]"
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-1.5 -left-[5px] h-[9px] w-[9px] rounded-full border transition-colors duration-500 ${
                    active === i ? "border-terracotta bg-terracotta" : "border-sand bg-volcanic"
                  }`}
                />
                <p className="font-body text-xs tracking-[0.3em] text-clay">{String(i + 1).padStart(2, "0")}</p>
                <h3 className={`mt-2 text-3xl transition-colors duration-500 ${active === i ? "text-bone" : "text-sand/70"}`}>{r.step}</h3>
                <p className="mt-3 max-w-xs text-sand">{r.line}</p>
                <img src={r.image} alt={r.alt} loading="lazy" className="mt-6 aspect-[4/3] w-full object-cover md:hidden" />
              </li>
            ))}
          </ol>
        </div>
        <div className="relative hidden md:col-span-7 md:block">
          <div className="sticky top-24 h-[calc(100dvh-8rem)]">
            <div className="relative h-full">
              <div className="absolute top-0 right-0 bottom-10 left-16 overflow-hidden">
                {RITUAL.map((r, i) => (
                  <img
                    key={r.step}
                    src={r.image}
                    alt={i === active ? r.alt : ""}
                    aria-hidden={i !== active}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700"
                    style={{ opacity: i === active ? 1 : 0, transform: i === active ? "scale(1)" : "scale(1.06)" }}
                  />
                ))}
                <Steam intensity={active >= 4 ? 1.2 : 0.4} />
              </div>
              <div className="absolute bottom-0 left-0 w-44 border border-hairline bg-volcanic p-2">
                <img src={RITUAL[(active + 1) % RITUAL.length].image} alt="" aria-hidden="true" className="aspect-[4/5] w-full object-cover" />
                <p className="mt-2 font-body text-[0.65rem] tracking-[0.24em] text-sand uppercase">
                  Next: {RITUAL[(active + 1) % RITUAL.length].step}
                </p>
              </div>
              <div className="absolute top-6 -right-4 xl:-right-10">
                <RitualBadge />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center pb-20 md:hidden">
        <RitualBadge />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- The coast (horizontal pan) */

const REGIONS = [
  { name: "Konkan", note: "Cliffs and spice", image: "/assets/photos/coast/konkan.webp", alt: "Red laterite cliffs dropping into a rough sea at dusk" },
  { name: "Goa", note: "Beaches and boats", image: "/assets/photos/coast/goa.webp", alt: "Wooden outrigger boats pulled up on a Goan beach at dusk" },
  { name: "Malabar", note: "Backwaters and harvest", image: "/assets/photos/coast/malabar.webp", alt: "A canoe gliding through misty backwaters under coconut palms" },
  { name: "Coromandel", note: "Fishing villages and roots", image: "/assets/photos/coast/coromandel.webp", alt: "Fishermen hauling nets beside log boats at dawn" },
  { name: "Portuguese ports", note: "Forts and heritage", image: "/assets/photos/coast/portuguese.webp", alt: "An old laterite fort and lighthouse meeting the sea at sunset" },
];

export function CoastPan() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = section.current;
    const rail = track.current;
    if (!el || !rail) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    if (!desktop.matches || prefersReducedMotion()) return;
    el.dataset.pan = "true";
    return watchScrollProgress(el, () => {
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(travel, 1)));
      const distance = rail.scrollWidth - window.innerWidth;
      rail.style.transform = `translate3d(${(-p * distance).toFixed(1)}px, 0, 0)`;
    });
  }, []);

  return (
    <section
      ref={section}
      aria-labelledby="coast-title" data-sound="waves"
      className="sm-coast relative bg-forest"
    >
      <div className="sm-coast__stage">
        <div className="px-5 pt-24 md:px-10 lg:pt-28">
          <h2 id="coast-title" className="sm-display text-4xl text-bone md:text-6xl">
            The coast
          </h2>
          <p className="mt-4 max-w-xl text-sand">
            Five shores, one coastline. From rugged cliffs to quiet backwaters, the water shapes our food, our people and our table.
          </p>
        </div>
        <div ref={track} className="sm-coast__track" tabIndex={0} aria-label="Coastal regions, scroll sideways">
          {REGIONS.map((r, i) => (
            <figure key={r.name} className="sm-coast__card">
              <ParallaxImage src={r.image} alt={r.alt} wave strength={0.06} className="aspect-[3/4] w-full" sizes="(min-width: 1024px) 28vw, 78vw" />
              <figcaption className="mt-5 flex items-baseline justify-between gap-4 border-t border-hairline pt-4">
                <span className="sm-display text-2xl text-bone md:text-3xl">{r.name}</span>
                <span className="font-body text-[0.68rem] tracking-[0.24em] text-sand uppercase">{r.note}</span>
              </figcaption>
              <span className="sr-only">
                {i + 1} of {REGIONS.length}
              </span>
            </figure>
          ))}
          <div className="sm-coast__end">
            <p className="sm-script text-5xl text-clay md:text-6xl">every story begins at the water</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- The claypot */

export function ClaypotReveal() {
  const section = useRef<HTMLElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const steamHost = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = section.current;
    if (!el || prefersReducedMotion()) return;
    return watchScrollProgress(el, (p) => {
      if (front.current) front.current.style.transform = `translate3d(0, ${((0.5 - p) * 60).toFixed(1)}px, 0)`;
      if (back.current) back.current.style.transform = `translate3d(0, ${((p - 0.5) * 90).toFixed(1)}px, 0) rotate(${((p - 0.5) * -3).toFixed(2)}deg)`;
      steamHost.current?.style.setProperty("--steam", (0.3 + p * 1.2).toFixed(2));
    });
  }, []);
  return (
    <section ref={section} aria-labelledby="claypot-title" data-sound="fire" className="relative overflow-hidden bg-charcoal py-28 md:py-40">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:grid-cols-12 md:px-10">
        <div className="relative md:col-span-7">
          <div ref={back} className="absolute top-10 -left-4 w-2/5 md:-left-10">
            <img src="/assets/art/plate-clay.webp" alt="" aria-hidden="true" loading="lazy" className="aspect-[3/4] w-full object-cover" />
          </div>
          <div ref={front} className="relative ml-auto w-4/5 border border-hairline p-3">
            <div ref={steamHost} className="relative overflow-hidden" style={{ "--steam": 0.6 } as CSSProperties}>
              <img
                src="/assets/photos/claypot/lid.webp"
                alt="A hand lifting the lid off a blackened claypot as steam rises"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
              <Steam />
            </div>
          </div>
        </div>
        <div className="md:col-span-5">
          <h2 id="claypot-title" className="sm-display text-4xl text-bone md:text-6xl">
            Slow heat. Sealed aroma.
          </h2>
          <p className="mt-6 max-w-sm text-lg text-sand">
            Earthenware sealed at the fire and opened at your table. The lid lifts, the steam rises, and the dish tells you the rest.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- The experience filmstrip */

export const MOMENTS = [
  { title: "Arrive", line: "Under the palms, the day slows down.", image: "/assets/photos/experience/arrive.webp", alt: "A stone path between tropical leaves and lanterns at night" },
  { title: "Discover", line: "A menu that reads like a map of the coast.", image: "/assets/photos/experience/discover.webp", alt: "Hands holding a textured paper menu by candlelight" },
  { title: "Choose", line: "Your crab, brought to the table before it meets the fire.", image: "/assets/photos/experience/choose.webp", alt: "A live mud crab presented on ice and banana leaf" },
  { title: "Watch the fire", line: "Flames, coals and a cook who reads them.", image: "/assets/photos/owner/chef-fire.webp", alt: "A chef holding a flaming ladle above the grill" },
  { title: "Smell the smoke", line: "Coconut husk, spice and the sea.", image: "/assets/photos/experience/smoke.webp", alt: "Fragrant smoke rising from a grill in the dark" },
  { title: "Lift the claypot", line: "The steam is the first taste.", image: "/assets/photos/experience/claypot.webp", alt: "Hands lifting a claypot lid in a bloom of steam" },
  { title: "Taste", line: "Fresh meat. Ancient fire.", image: "/assets/photos/experience/taste.webp", alt: "Fingers breaking a crab claw over a rich sauce" },
  { title: "Stay a little longer", line: "The sea is still there. So are we.", image: "/assets/photos/experience/linger.webp", alt: "A candle burning low on a table by the dark sea" },
];

export function ExperienceStrip({ headingLevel = "h2" }: { headingLevel?: "h2" | "h1" }) {
  const Heading = headingLevel;
  return (
    <section aria-labelledby="experience-title" data-sound="restaurant" className="relative bg-volcanic py-24 md:py-32" data-cursor="ember">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Heading id="experience-title" className="sm-display max-w-3xl text-4xl text-bone md:text-6xl">
          Come for the crab. Stay for the story.
        </Heading>
      </div>
      <ol className="sm-filmstrip mt-14" aria-label="What happens when you visit">
        {MOMENTS.map((m, i) => (
          <li key={m.title} className="sm-filmstrip__frame">
            <div className="relative overflow-hidden">
              <img src={m.image} alt={m.alt} loading="lazy" className="aspect-[2/3] w-full object-cover" />
            </div>
            <p className="mt-4 font-body text-[0.65rem] tracking-[0.3em] text-clay">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 text-lg text-bone md:text-xl">{m.title}</h3>
            <p className="mt-1 text-sm text-sand">{m.line}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------------- Atmosphere */

export function Atmosphere({ gallery }: { gallery: string[] }) {
  const frames =
    gallery.length >= 3
      ? gallery.slice(0, 5).map((src) => ({ src, alt: "Inside Sal Marinho" }))
      : [
          { src: "/assets/photos/owner/garden-statue.webp", alt: "A carved Balinese stone figure among banana leaves in the garden" },
          { src: "/assets/photos/atmosphere/lantern.webp", alt: "Rattan lanterns glowing among banana leaves at night" },
          { src: "/assets/photos/atmosphere/candle.webp", alt: "A candle on a dark teak table beside curry leaves" },
        ];
  return (
    <section aria-labelledby="atmosphere-title" data-sound="restaurant" className="relative overflow-hidden bg-volcanic py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="sm-masonry">
          {frames.map((f, i) => (
            <Drift key={f.src} distance={i % 2 ? 70 : 30} className={`sm-masonry__cell sm-masonry__cell--${i}`}>
              <img src={f.src} alt={f.alt} loading="lazy" className="h-full w-full object-cover" />
            </Drift>
          ))}
        </div>
        <h2 id="atmosphere-title" className="sm-display relative z-10 mt-12 text-3xl text-bone [text-shadow:0_2px_24px_rgb(0_0_0/0.75)] md:mt-[-5rem] md:max-w-md md:text-5xl">
          Where the coast comes alive.
        </h2>
      </div>
    </section>
  );
}
