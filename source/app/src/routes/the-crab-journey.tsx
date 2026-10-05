import { createFileRoute } from "@tanstack/react-router";

import { CrabStatus, JourneyTimeline, RippleFilter, crabLines } from "@/components/v2/crab";
import { FoldTab, StoryCard } from "@/components/v2/home";
import { LoopFilm, Reveal } from "@/components/v2/kit";
import { getCrabJourney } from "@/lib/content/content.functions";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/the-crab-journey")({
  loader: () => getCrabJourney(),
  head: () =>
    pageHead({
      title: "The journey: something is growing",
      description:
        "Our crab cultivation project is underway beside the restaurant in Anjuna: cultivate, grow, fatten, harvest, fire, table. Coming soon to Sal Marinho.",
      path: "/the-crab-journey",
      image: "/assets/v2/og/crab.jpg",
    }),
  component: CrabJourney,
});

function CrabJourney() {
  const { settings, notes } = Route.useLoaderData();
  const [first, second] = crabLines(settings.crabStatus);
  return (
    <main id="main" className="v-crab" data-sound="crab">
      <RippleFilter />
      <header className="v-grow v-crab__hero">
        <LoopFilm
          className="v-grow__film"
          film={{ src: "/assets/v2/film/mangrove.mp4", mobileSrc: "/assets/v2/film/mangrove-m.mp4", poster: "/assets/v2/film/mangrove.webp" }}
        />
        <div className="v-grow__shade" aria-hidden="true" />
        <div className="v-wrap relative flex min-h-[100svh] flex-col justify-end pt-40 pb-[clamp(4rem,10vw,8rem)]">
          <CrabStatus status={settings.crabStatus} />
          <p className="v-kicker mt-8">The journey</p>
          <h1 className="v-accent-title mt-5 max-w-[11ch]">Something is growing.</h1>
          <p className="v-lede mt-6">{first}</p>
          <p className="v-lede mt-3">{second}</p>
          <a href="#journey" className="v-ripple-link mt-9 self-start">
            <span className="v-ripple-link__ring" aria-hidden="true" />
            Follow the six steps
          </a>
        </div>
      </header>

      <section id="journey" className="v-sec" aria-labelledby="journey-title">
        <div className="v-wrap">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <h2 id="journey-title" className="v-title md:col-span-7">
              From cultivation <em>to the table.</em>
            </h2>
            <ul className="v-crab__legend md:col-span-5" aria-label="Key">
              <li data-status="now">Happening now</li>
              <li data-status="soon">Coming soon</li>
            </ul>
          </div>
          <JourneyTimeline stages={settings.crabStages} />
        </div>
      </section>

      <section className="v-sec pt-0" aria-labelledby="beside-title">
        <div className="v-wrap">
          <p className="v-kicker">Beside the restaurant</p>
          <h2 id="beside-title" className="v-title v-title--md mt-5 max-w-3xl">
            A culinary experiment, <em>a few steps from the kitchen.</em>
          </h2>
          <div className="v-crab__doc mt-12">
            <Reveal src="/assets/v2/crab/boxes.webp" alt="Rows of blue crab boxes along a wall beside the restaurant" className="v-crab__doc-wide" sizes="(min-width: 900px) 50vw, 100vw" />
            <Reveal src="/assets/v2/crab/cultivation.webp" alt="A man tending rows of cultivation boxes, in black and white" sizes="(min-width: 900px) 25vw, 50vw" />
            <Reveal src="/assets/v2/crab/shell.webp" alt="A mud crab resting on patterned tiles, in black and white" sizes="(min-width: 900px) 25vw, 50vw" />
          </div>
        </div>
      </section>

      {notes.length ? (
        <section className="v-sec pt-0" aria-labelledby="notes-title">
          <div className="v-wrap">
            <p className="v-kicker">Field notes</p>
            <h2 id="notes-title" className="v-title v-title--md mt-5">
              From the <em>journal.</em>
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {notes.map((post) => (
                <StoryCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="v-closing" aria-label="Until then" data-sound="breakfast">
        <p className="v-title v-title--md">{settings.crabStatus === "now-serving" ? "The crab is on the table." : "Until then,"}</p>
        <p className="v-accent-title mt-4">{settings.crabStatus === "now-serving" ? "Come and choose yours." : "come for breakfast."}</p>
        <div className="mt-12 flex justify-center">
          <FoldTab to="/menu">What&rsquo;s cooking?</FoldTab>
        </div>
      </section>
    </main>
  );
}
