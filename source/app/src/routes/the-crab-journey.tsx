import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/page/page-kit";
import { LoopFilm, Reveal } from "@/components/v2/kit";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/the-crab-journey")({
  head: () =>
    pageHead({
      title: "Something is growing: the crab journey",
      description:
        "Our crab cultivation project is underway in calm water. It is not on the menu yet. Coming soon to Sal Marinho, Anjuna.",
      path: "/the-crab-journey",
      image: "/assets/v2/og/crab.jpg",
    }),
  component: CrabJourney,
});

function CrabJourney() {
  return (
    <main id="main" data-sound="waves">
      <PageHero
        kicker="Coming soon"
        title="Something is growing."
        accent
        line="Our crab cultivation project is underway. It is not on the menu yet."
        image="/assets/v2/growing/mangrove.webp"
        imageAlt="Mangrove roots and still water at first light"
      />

      <section className="v-wrap grid gap-14 py-20 md:grid-cols-12 md:py-28" aria-labelledby="journey-title">
        <div className="md:col-span-5">
          <p className="v-soon">Not yet on the menu</p>
          <h2 id="journey-title" className="v-title v-title--md mt-5">
            The crab <em>journey.</em>
          </h2>
          <div className="sm-prose mt-8">
            <p>It is a slow undertaking, with calm water, patience and close attention, and it is not something we will rush to the table.</p>
            <p>
              Soon, the journey from cultivation to kitchen will become part of the Sal Marinho experience. Until then, it stays in the
              water, and the kitchen stays busy with dosa, idli, eggs and coffee.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <Link to="/menu" className="v-fold-tab">
              See what&rsquo;s cooking now <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-6 md:col-start-7">
          <Reveal
            src="/assets/v2/crab/cultivation.webp"
            alt="A man tending rows of cultivation boxes beside the water, in black and white"
            className="aspect-[4/5]"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
          <Reveal
            src="/assets/v2/crab/shell.webp"
            alt="A mud crab resting on patterned tiles, in black and white"
            className="mt-12 aspect-[4/5]"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        </div>
      </section>

      <section className="v-growing" aria-label="Still water">
        <LoopFilm
          className="v-growing__film"
          film={{ src: "/assets/v2/film/mangrove.mp4", mobileSrc: "/assets/v2/film/mangrove-m.mp4", poster: "/assets/v2/film/mangrove.webp" }}
        />
        <div className="v-growing__shade" aria-hidden="true" />
        <div className="v-wrap relative flex min-h-[clamp(22rem,60svh,34rem)] flex-col justify-center py-16">
          <p className="v-accent-title max-w-[14ch]">Coming soon.</p>
        </div>
      </section>
    </main>
  );
}
