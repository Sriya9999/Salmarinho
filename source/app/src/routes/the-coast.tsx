import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/page/page-kit";
import { CrabStatus, JourneyTimeline, RippleFilter, crabLines } from "@/components/v2/crab";
import { FoldTab, StoryCard } from "@/components/v2/home";
import { LoopFilm, Reveal, ScrollFilm } from "@/components/v2/kit";
import { getCrabJourney } from "@/lib/content/content.functions";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/the-coast")({
  loader: () => getCrabJourney(),
  head: () =>
    pageHead({
      title: "The coast and the crab journey",
      description:
        "Water, salt, wind and stone: the coast behind Sal Marinho in Anjuna, and our crab cultivation project: cultivate, grow, fatten, harvest, fire, table. Coming soon.",
      path: "/the-coast",
      image: "/assets/v2/og/crab.jpg",
    }),
  component: TheCoast,
});

const SHORES = [
  {
    name: "Konkan",
    note: "Cliffs and spice",
    body: "Red laterite cliffs, kokum and coconut, and a sea that is never quite still.",
    image: "/assets/v2/shores/konkan.webp",
    alt: "Red laterite cliffs dropping into a rough sea at dusk",
  },
  {
    name: "Goa",
    note: "Beaches and boats",
    body: "Boats pulled up on the sand at dusk, poi from the bakery, choris and vinegar.",
    image: "/assets/v2/shores/goa.webp",
    alt: "Wooden outrigger boats pulled up on a beach at dusk",
  },
  {
    name: "Malabar",
    note: "Backwaters and harvest",
    body: "Backwaters, pepper vines and coconut groves along the old spice coast.",
    image: "/assets/v2/shores/malabar.webp",
    alt: "A canoe gliding through misty backwaters under coconut palms",
  },
  {
    name: "Coromandel",
    note: "Fishing villages and roots",
    body: "Fishing villages, nets hauled at first light and long, flat shores facing the sunrise.",
    image: "/assets/v2/shores/coromandel.webp",
    alt: "Fishermen hauling nets beside log boats at dawn",
  },
  {
    name: "Portuguese ports",
    note: "Forts and heritage",
    body: "Forts and lighthouses, lime-washed walls and the traces of an old ocean route.",
    image: "/assets/v2/shores/portuguese.webp",
    alt: "An old laterite fort and lighthouse meeting the sea at sunset",
  },
];

const ELEMENTS = [
  { src: "/assets/v2/coast/grass.webp", alt: "Wild grass on a cliff above the sea in low sun", caption: "Wind" },
  { src: "/assets/v2/coast/salt.webp", alt: "Coarse sea salt crystals on dark rock", caption: "Salt" },
  { src: "/assets/v2/coast/basket-shore.webp", alt: "A woman carrying a basket on her head along the shore at sunset", caption: "Water" },
  { src: "/assets/v2/coast/vessels.webp", alt: "Fishing boats and stacked vessels in a harbour", caption: "Harbour" },
  { src: "/assets/v2/coast/basket-street.webp", alt: "A woman with a basket on her head walking down an old street", caption: "Stone" },
  { src: "/assets/v2/coast/garlic-strings.webp", alt: "Strings of garlic hanging against a blue wall", caption: "Market" },
];

function TheCoast() {
  const { settings, notes } = Route.useLoaderData();
  const [first, second] = crabLines(settings.crabStatus);
  return (
    <main id="main" data-sound="waves">
      <RippleFilter />
      <PageHero
        kicker="The coast"
        title={
          <>
            Where it all <em>begins.</em>
          </>
        }
        line="Water, salt, wind and stone. The coast is the feeling under every plate at Sal Marinho, and the reason the kitchen is here."
        image="/assets/v2/film/coast.webp"
        imageAlt="A stone path through wild grass leading down to the sea"
      />

      <section className="v-room" aria-labelledby="coast-film-title">
        <ScrollFilm
          className="v-room__film"
          label="A path through the grass to the shore, where a dosa waits on a rock by the water"
          film={{ src: "/assets/v2/film/coast.mp4", mobileSrc: "/assets/v2/film/coast-m.mp4", poster: "/assets/v2/film/coast.webp" }}
        />
        <div className="v-room__shade" aria-hidden="true" />
        <div className="v-wrap relative flex min-h-[92svh] flex-col justify-end pb-[clamp(3rem,8vw,6rem)]">
          <p className="v-kicker">Land, water, food</p>
          <h2 id="coast-film-title" className="v-title mt-5">
            The coast is in <em>everything.</em>
          </h2>
          <p className="v-lede mt-6">
            Salt on the wind, coconut in the chutney, the sea at the end of the path. Not seafood: a feeling that finds its way
            onto every plate.
          </p>
        </div>
      </section>

      <section className="v-sec" aria-labelledby="shores-title">
        <div className="v-wrap">
          <p className="v-kicker">Along the shore</p>
          <h2 id="shores-title" className="v-title mt-5 max-w-3xl">
            Five coasts, <em>one table.</em>
          </h2>
          <ol className="v-shores mt-14">
            {SHORES.map((shore, i) => (
              <li key={shore.name} className="v-shore">
                <Reveal src={shore.image} alt={shore.alt} className="v-shore__media" sizes="(min-width: 900px) 30vw, 90vw" />
                <div>
                  <p className="v-kicker">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="v-title v-title--sm mt-3">{shore.name}</h3>
                  <p className="mt-2 font-accent text-xl font-extralight text-ember">{shore.note}</p>
                  <p className="mt-4 max-w-sm text-sand">{shore.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="v-sec pt-0" aria-labelledby="elements-title">
        <div className="v-wrap">
          <h2 id="elements-title" className="v-title v-title--md">
            Water, salt, wind, <em>stone.</em>
          </h2>
          <ul className="v-strip">
            {ELEMENTS.map((e) => (
              <li key={e.src}>
                <Reveal src={e.src} alt={e.alt} className="v-strip__media" sizes="(min-width: 900px) 16vw, 33vw" />
                <p className="v-strip__cap">{e.caption}</p>
              </li>
            ))}
          </ul>
          <div className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#something-is-growing" className="v-ripple-link">
              <span className="v-ripple-link__ring" aria-hidden="true" />
              Something is growing
            </a>
            <Link to="/breakfast" hash="a-little-portuguese" className="text-bone underline decoration-ember/60 underline-offset-4 hover:decoration-ember">
              A little Portuguese in the coast
            </Link>
          </div>
        </div>
      </section>

      <div className="v-crab" data-sound="crab">
        <section id="something-is-growing" className="v-grow v-crab__hero" aria-labelledby="growing-title">
          <LoopFilm
            className="v-grow__film"
            film={{ src: "/assets/v2/film/mangrove.mp4", mobileSrc: "/assets/v2/film/mangrove-m.mp4", poster: "/assets/v2/film/mangrove.webp" }}
          />
          <div className="v-grow__shade" aria-hidden="true" />
          <div className="v-wrap relative flex min-h-[100svh] flex-col justify-end pt-40 pb-[clamp(4rem,10vw,8rem)]">
            <CrabStatus status={settings.crabStatus} />
            <p className="v-kicker mt-8">The crab journey</p>
            <h2 id="growing-title" className="v-accent-title mt-5 max-w-[11ch]">
              Something is growing.
            </h2>
            <p className="v-lede mt-6">{first}</p>
            <p className="v-lede mt-3">{second}</p>
            <a href="#journey" className="v-ripple-link mt-9 self-start">
              <span className="v-ripple-link__ring" aria-hidden="true" />
              Follow the six steps
            </a>
          </div>
        </section>

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
              <Reveal src="/assets/v2/crab/boxes-2.webp" alt="In black and white: a man lifting a mud crab from one of the numbered crab boxes stacked along a wall beside the restaurant" className="v-crab__doc-wide" sizes="(min-width: 900px) 50vw, 100vw" />
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
      </div>
    </main>
  );
}
