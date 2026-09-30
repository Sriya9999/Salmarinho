import { createFileRoute } from "@tanstack/react-router";

import { ChapterPoster, ClosingLines, PageHero } from "@/components/page/page-kit";
import { ReserveBand } from "@/components/home/table-sections";
import { Icon } from "@/components/site/Icon";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/our-craft")({
  head: () =>
    pageHead({
      title: "Our craft",
      description:
        "From coast to fire: how Sal Marinho cooks, from the catch and the hand that prepares it to wood fire, hibachi-style heat, claypot and cast iron.",
      path: "/our-craft",
      image: "/assets/og/craft.jpg",
    }),
  component: OurCraft,
});

const fireChapter = [
  {
    ...scrollScrubScenes[2],
    id: "craft-fire",
    kicker: "Chapter 3",
    title: "The fire",
    body: "Wood fire, charcoal and hibachi-inspired heat. Flames for char, coals for patience, smoke for everything else.",
    tags: undefined,
    align: "left" as const,
    scroll: 1.4,
  },
];

function OurCraft() {
  return (
    <main id="main">
      <PageHero
        script="from coast to fire"
        title="Our craft"
        line="Four elements, one philosophy: respect the ingredient, then let the heat and the vessel do their work."
        image="/assets/photos/journal/fire.webp"
        imageAlt="Fish grilling on green sticks over an open wood fire at night"
      />
      <ChapterPoster
        index={1}
        title="The coast"
        lead="Where the ingredients begin."
        image="/assets/photos/owner/seafood-still-life.webp"
        imageAlt="Fresh fish, prawns, dried chillies, garlic and sea salt on dark cloth"
      >
        <p>Freshness comes first. What the sea and the market give us each day decides the plate, never the other way round.</p>
      </ChapterPoster>
      <ChapterPoster
        index={2}
        title="The hand"
        lead="Human preparation and craftsmanship."
        image="/assets/photos/ritual/preparation.webp"
        imageAlt="A cleaned crab on a banana leaf beside coconut, chillies and curry leaves"
        flip
        tone="charcoal"
      >
        <p>
          Cleaning, cutting, grinding masala, churning nine house butters. The slow, careful work that nobody sees and everybody tastes.
        </p>
        <p className="mt-8 flex gap-4 text-clay" aria-hidden="true">
          <Icon name="chilli" className="h-9 w-9" />
          <Icon name="coconut" className="h-9 w-9" />
          <Icon name="leaf" className="h-9 w-9" />
        </p>
      </ChapterPoster>
      <div data-cursor="ember">
        <ScrollScrub scenes={fireChapter} theme={scrollScrubTheme} className="scroll-scrub--band" />
      </div>
      <ChapterPoster
        index={4}
        title="The vessel"
        lead="Claypots and cast iron."
        image="/assets/photos/claypot/lid.webp"
        imageAlt="A hand lifting the lid off a blackened claypot as steam rises"
        tone="forest"
        steam
      >
        <p>
          Earthenware breathes and holds its heat; cast iron sears and keeps it. Each dish is finished in the vessel it is served in, so
          the heat, the aroma and the character arrive at your table intact.
        </p>
        <p className="mt-8 flex gap-4 text-clay" aria-hidden="true">
          <Icon name="claypot" className="h-9 w-9" />
          <Icon name="pan" className="h-9 w-9" />
        </p>
      </ChapterPoster>
      <ClosingLines script="the table" lines={["Where everything comes together."]} />
      <ReserveBand />
    </main>
  );
}
