import { createFileRoute } from "@tanstack/react-router";

import { ReserveBand } from "@/components/home/table-sections";
import { PortugueseConnection } from "@/components/home/table-sections";
import { ChapterPoster, PageHero } from "@/components/page/page-kit";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/portuguese-connection")({
  head: () =>
    pageHead({
      title: "The Portuguese connection",
      description:
        "How five centuries of coastal exchange shaped Goan food: chillies, cashew, vinegar and bread, and how Sal Marinho carries that story to the table.",
      path: "/portuguese-connection",
      image: "/assets/og/portuguese.jpg",
    }),
  component: Portuguese,
});

function Portuguese() {
  return (
    <main id="main">
      <PageHero
        script="same ocean, new flavours"
        title="The Portuguese connection"
        line="A sea route, five centuries and a handful of ingredients that changed this coast's cooking for good."
        image="/assets/photos/journal/portugal.webp"
        imageAlt="A whitewashed Portuguese-era church beside laterite houses in Old Goa"
      />
      <PortugueseConnection />
      <ChapterPoster
        index={1}
        title="Portugal"
        lead="Ships from Lisbon, looking for pepper."
        image="/assets/art/route-map.webp"
        imageAlt="An engraved sea chart of Portugal, Africa and India's west coast"
      >
        <p>
          In the late fifteenth century Portuguese navigators rounded Africa and reached India's west coast. In 1510 they took Goa, and
          stayed for more than four hundred years.
        </p>
      </ChapterPoster>
      <ChapterPoster
        index={2}
        title="Coastal trade"
        lead="What crossed the ocean."
        image="/assets/photos/coast/portuguese.webp"
        imageAlt="An old laterite fort and lighthouse meeting the sea at sunset"
        flip
        tone="charcoal"
        wave
      >
        <p>
          Chillies from the Americas, cashew, potatoes and pineapple travelled the same sea lanes as the spice, and settled into Indian
          soil and Indian kitchens.
        </p>
      </ChapterPoster>
      <ChapterPoster
        index={3}
        title="Local ingredients"
        lead="Goa made it its own."
        image="/assets/photos/owner/poee.webp"
        imageAlt="A stack of freshly baked Goan poee bread"
      >
        <p>
          Wine and garlic marinades met toddy vinegar and local chilli. Portuguese baking became Goa's pao and poee. Coconut and kokum
          bent every borrowed idea toward the coast's own taste.
        </p>
      </ChapterPoster>
      <ChapterPoster
        index={4}
        title="Modern interpretation"
        lead="The story, served differently."
        image="/assets/photos/menu/claypot-curry.webp"
        imageAlt="Crab curry steaming in a blackened claypot on dark wood"
        flip
        tone="forest"
        steam
      >
        <p>
          Our Portuguese coast dishes follow that thread: a sharp vinegar note, a crusty bread for the sauce, the warmth of chilli carried by
          coconut, finished over our fire.
        </p>
      </ChapterPoster>
      <ReserveBand />
    </main>
  );
}
