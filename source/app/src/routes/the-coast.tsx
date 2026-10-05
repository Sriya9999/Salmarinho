import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero } from "@/components/page/page-kit";
import { FoldTab } from "@/components/v2/home";
import { Reveal, ScrollFilm } from "@/components/v2/kit";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/the-coast")({
  head: () =>
    pageHead({
      title: "The coast: where it all begins",
      description:
        "Water, salt, wind and stone: the coast is the feeling under every plate at Sal Marinho in Anjuna, from the Konkan cliffs to the old Portuguese ports.",
      path: "/the-coast",
      image: "/assets/v2/og/home.jpg",
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
  return (
    <main id="main" data-sound="waves">
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
            <FoldTab to="/menu">What&rsquo;s cooking?</FoldTab>
            <Link to="/" hash="a-little-portuguese" className="text-bone underline decoration-ember/60 underline-offset-4 hover:decoration-ember">
              A little Portuguese in the coast
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
