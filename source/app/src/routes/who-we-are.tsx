import { createFileRoute } from "@tanstack/react-router";

import { ChapterPoster, ClosingLines, PageHero } from "@/components/page/page-kit";
import { ReserveBand } from "@/components/home/table-sections";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/who-we-are")({
  head: () =>
    pageHead({
      title: "Who we are",
      description:
        "The story behind the spice: how the coast, the crab and the fire became Sal Marinho, a coastal gastronomy restaurant in Anjuna, Goa.",
      path: "/who-we-are",
      image: "/assets/og/story.jpg",
    }),
  component: WhoWeAre,
});

function WhoWeAre() {
  return (
    <main id="main">
      <PageHero
        script="the story behind the spice"
        title="Who we are"
        line="A kitchen by the Arabian Sea, built around one obsession and one old way of cooking."
        image="/assets/photos/coast/goa.webp"
        imageAlt="Wooden outrigger boats pulled up on a Goan beach at dusk"
        wave
      />
      <ChapterPoster
        index={1}
        title="The coast"
        lead="Where the inspiration began."
        image="/assets/photos/ritual/coast.webp"
        imageAlt="Crab traps stacked on black rocks by the sea at first light"
        wave
      >
        <p>
          Sal Marinho means sea salt. It is where every meal here starts: the tide, the morning boats, the mangroves where the crab
          lives and the villages that have cooked this coastline for centuries.
        </p>
      </ChapterPoster>
      <ChapterPoster
        index={2}
        title="The crab"
        lead="The obsession that became the signature."
        image="/assets/photos/owner/crab-salt.webp"
        imageAlt="A cooked mud crab on black slate dusted with salt"
        flip
        tone="charcoal"
      >
        <p>
          We don't simply catch our crab. We fatten it, nurture it, and bring it to the fire when it's ready. It is slower, and it is the
          reason the meat is sweet, dense and full to the shell.
        </p>
      </ChapterPoster>
      <ChapterPoster
        index={3}
        title="The fire"
        lead="Why ancient cooking techniques matter."
        image="/assets/photos/owner/chef-fire.webp"
        imageAlt="A chef holding a flaming ladle above the grill"
      >
        <p>
          Before refrigeration and before machinery, there was fire. Wood, coal and smoke still do things no stove can, and a cook who
          reads the flame by eye is still the best tool in the kitchen.
        </p>
      </ChapterPoster>
      <ChapterPoster
        index={4}
        title="The table"
        lead="Why food should be experienced, not simply consumed."
        image="/assets/photos/ritual/table.webp"
        imageAlt="A crab dish in its claypot on a candlelit table"
        flip
        tone="forest"
        steam
      >
        <p>
          The dish arrives in the vessel it was cooked in. The lid comes off in front of you. The meal is not just served here. It
          unfolds.
        </p>
      </ChapterPoster>
      <ClosingLines lines={["This isn't just where we cook.", "It's where the coast comes alive."]} />
      <ReserveBand />
    </main>
  );
}
