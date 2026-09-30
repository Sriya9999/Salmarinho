import { createFileRoute } from "@tanstack/react-router";

import { CoastPan } from "@/components/home/story-sections";
import { ReserveBand } from "@/components/home/table-sections";
import { PageHero } from "@/components/page/page-kit";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/coastal-journey")({
  head: () =>
    pageHead({
      title: "The coastal journey",
      description:
        "India's coastline on a plate: Konkan, Goa, Malabar, Coromandel and the old Portuguese ports, and the coconut, kokum and spice that tie them together.",
      path: "/coastal-journey",
      image: "/assets/og/coast.jpg",
    }),
  component: CoastalJourney,
});

const PANTRY = [
  { name: "Coconut", note: "The coast's cream, oil and body.", src: "/assets/art/ingredients/coconut.png" },
  { name: "Kokum", note: "A sour purple fruit that cools and sharpens.", src: "/assets/art/ingredients/kokum.png" },
  { name: "Dried red chilli", note: "Heat and colour, by way of Portuguese trade.", src: "/assets/art/ingredients/chilli.png" },
  { name: "Curry leaves", note: "Tempered in hot oil, the scent of every coastal kitchen.", src: "/assets/art/ingredients/curry-leaf.png" },
  { name: "Toddy vinegar", note: "Palm sap turned sharp, the backbone of Goan sauces.", src: "/assets/art/ingredients/vinegar.png" },
  { name: "Cashew", note: "Planted along the shore centuries ago, now its own.", src: "/assets/art/ingredients/cashew.png" },
];

function CoastalJourney() {
  return (
    <main id="main">
      <PageHero
        script="every story begins at the water"
        title="The coastal journey"
        line="Food inspired by India's diverse coastline, one shore at a time."
        image="/assets/photos/coast/konkan.webp"
        imageAlt="Red laterite cliffs dropping into a rough sea at dusk"
        wave
      />
      <CoastPan />
      <section aria-labelledby="pantry-title" className="bg-volcanic py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 id="pantry-title" className="sm-display text-4xl text-bone md:text-5xl">
            The coastal pantry
          </h2>
          <p className="mt-5 max-w-xl text-sand">Six ingredients that travel the whole shoreline and turn up on almost every page of our menu.</p>
          <ul className="sm-pantry mt-14">
            {PANTRY.map((p) => (
              <li key={p.name} className="sm-pantry__item">
                <img src={p.src} alt={`${p.name}, engraved illustration`} loading="lazy" className="mx-auto aspect-square w-28 object-contain" />
                <h3 className="mt-5 text-xl text-bone">{p.name}</h3>
                <p className="mt-2 text-sm text-sand">{p.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ReserveBand />
    </main>
  );
}
