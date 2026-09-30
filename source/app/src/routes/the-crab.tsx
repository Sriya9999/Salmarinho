import { createFileRoute, Link } from "@tanstack/react-router";

import { ReserveBand } from "@/components/home/table-sections";
import { Drift, Steam } from "@/components/motion/primitives";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { ShorelineLink } from "@/components/cta/garments";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/the-crab")({
  head: () =>
    pageHead({
      title: "The fattening ritual",
      description:
        "Sal Marinho's signature: mud crab from the mangroves, selected by hand, fattened in brackish water and cooked over wood fire in claypot or cast iron.",
      path: "/the-crab",
      image: "/assets/og/crab.jpg",
    }),
  component: TheCrab,
});

const opening = [
  {
    ...scrollScrubScenes[1],
    id: "ritual-opening",
    kicker: "The crab",
    title: "The fattening ritual",
    body: "A first-of-its-kind crab gastronomy. Not simply caught. Fattened, curated, prepared, and brought to the fire when it's ready.",
    tags: undefined,
    align: "left" as const,
    scroll: 1.5,
  },
];

const STEPS = [
  {
    title: "Coast",
    note: "Mangroves and estuaries",
    body: "Mud crab lives where rivers meet the Arabian Sea. The journey starts there, with a healthy crab that has recently shed its shell and still has room to grow.",
    image: "/assets/photos/ritual/coast.webp",
    alt: "Crab traps stacked on black laterite rocks by the sea at first light",
  },
  {
    title: "Selection",
    note: "By hand, one at a time",
    body: "Each crab is weighed in the hand and checked for a firm shell and a lively temperament. Only crabs with the right potential go forward.",
    image: "/assets/photos/ritual/selection.webp",
    alt: "Weathered hands lifting a live mud crab from a woven basket",
  },
  {
    title: "Fattening",
    note: "Brackish water and time",
    body: "Kept apart in calm brackish water and fed well, the crab fills its new shell. The meat grows dense and sweet; the body grows heavy.",
    image: "/assets/photos/ritual/fattening.webp",
    alt: "Mud crabs resting in a bamboo pen among mangrove roots",
  },
  {
    title: "Preparation",
    note: "Coconut, kokum, spice",
    body: "Cleaned with care and paired with coastal ingredients chosen for that crab and that dish, never to hide it.",
    image: "/assets/photos/ritual/preparation.webp",
    alt: "A cleaned crab on a banana leaf beside coconut, chillies and curry leaves",
  },
  {
    title: "Fire",
    note: "Wood fire and hibachi-style heat",
    body: "Over live coals, turned by hand. The shell chars, the juices run, the smoke finishes what the marinade started.",
    image: "/assets/photos/ritual/fire.webp",
    alt: "Masala-glazed crab halves grilling over a wood fire",
  },
  {
    title: "Clay",
    note: "Claypot or cast iron",
    body: "Sealed in earthenware or seared in cast iron, so the heat and the aroma travel to the table with it.",
    image: "/assets/photos/ritual/clay.webp",
    alt: "A blackened claypot of crab curry resting on glowing coals",
  },
  {
    title: "Table",
    note: "Served immediately",
    body: "Nothing waits under a lamp. The crab goes from the fire to you, and the lid comes off in front of you.",
    image: "/assets/photos/ritual/table.webp",
    alt: "A crab dish in its claypot on a candlelit wooden table",
  },
];

function TheCrab() {
  return (
    <main id="main" className="bg-volcanic">
      <ScrollScrub scenes={opening} theme={scrollScrubTheme} className="scroll-scrub--band" />
      <section aria-labelledby="ritual-steps" className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <h2 id="ritual-steps" className="sr-only">
          The seven steps
        </h2>
        <ol className="relative">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative grid gap-8 border-t border-hairline py-14 md:grid-cols-12 md:py-20">
              <div className="md:col-span-4">
                <p className="font-body text-xs tracking-[0.3em] text-clay">
                  Step {i + 1} of {STEPS.length}
                </p>
                <h3 className="sm-display mt-3 text-4xl text-bone md:text-5xl">{s.title}</h3>
                <p className="sm-script mt-3 text-3xl text-clay">{s.note}</p>
              </div>
              <p className="text-lg text-sand md:col-span-3 md:pt-10">{s.body}</p>
              <Drift distance={i % 2 ? 50 : 24} className="relative overflow-hidden md:col-span-5">
                <img src={s.image} alt={s.alt} loading={i === 0 ? "eager" : "lazy"} className="aspect-[4/5] w-full object-cover" />
                {s.title === "Clay" || s.title === "Table" ? <Steam intensity={1} /> : null}
                <span className="pointer-events-none absolute inset-3 border border-bone/15" aria-hidden="true" />
              </Drift>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap items-center gap-10 border-t border-hairline pt-12">
          <p className="max-w-md text-sand">
            Curious how it works in the mangroves?{" "}
            <Link to="/journal/$slug" params={{ slug: "inside-the-crab-fattening-process" }} className="text-bone underline decoration-terracotta underline-offset-4">
              Inside the crab fattening process
            </Link>
          </p>
          <ShorelineLink to="/menu">See the crab table</ShorelineLink>
        </div>
      </section>
      <ReserveBand />
    </main>
  );
}
