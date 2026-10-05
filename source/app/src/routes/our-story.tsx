import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero, StoryChapter } from "@/components/page/page-kit";
import { FoldTab } from "@/components/v2/home";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/our-story")({
  head: () =>
    pageHead({
      title: "Our story: the story behind the spice",
      description:
        "How the coast, South Indian food, a little Portugal and fire came together at Sal Marinho in Anjuna, and what is quietly growing beside the restaurant.",
      path: "/our-story",
      image: "/assets/v2/og/home.jpg",
    }),
  component: OurStory,
});

function OurStory() {
  return (
    <main id="main" data-sound="breakfast">
      <PageHero
        kicker="Our story"
        title={
          <>
            The story behind <em>the spice.</em>
          </>
        }
        line="A kitchen in Anjuna where South Indian food, the coast and a little Portugal share one table, with fire underneath and something growing beside it."
        image="/assets/v2/journal/south-to-coast.webp"
        imageAlt="A dosa and chutney on a rock by the sea in morning light"
      />
      <div data-sound="waves">
        <StoryChapter
          index={1}
          title="Sal marinho means sea salt."
          image="/assets/v2/coast/basket-shore.webp"
          imageAlt="A woman carrying a basket on her head along the shore at sunset"
        >
          <p>
            It is where every meal here starts: the sea at the end of the path, salt on the wind, and a coastline that has
            been cooking for a very long time.
          </p>
        </StoryChapter>
      </div>
      <StoryChapter
        index={2}
        title="From the South."
        image="/assets/v2/south/tempering.webp"
        imageAlt="Shallots, chillies and spices tempering in hot oil"
        flip
      >
        <p>
          Benne dosa and clay pot tatte idli, appe, bonda and a pot of sambar. Recipes from Mangalore, Udupi, Bangalore and
          Chettinad, cooked by the sea in Goa.
        </p>
        <p>
          Then the small things that make them taste like themselves: mustard seed crackling in hot oil, curry leaf, dried
          chilli, a spoon of podi.
        </p>
      </StoryChapter>
      <StoryChapter
        index={3}
        title="A little Portuguese."
        image="/assets/v2/portugal/poee-hands.webp"
        imageAlt="Hands lifting a fresh poi from a tray"
      >
        <p>
          Poi from the bakers who followed the ships, smoked choris, a Ross omelette in xacuti. The Goan side of the morning
          sits right beside the South Indian one.
        </p>
      </StoryChapter>
      <div data-sound="fire">
        <StoryChapter
          index={4}
          title="The fire."
          image="/assets/v2/fire/chef.webp"
          imageAlt="A cook in the dark holding a ladle of flame"
          flip
        >
          <p>
            Before refrigeration and before machinery, there was fire. Cast iron, clay and flame still do things no stove can:
            the edge on a dosa, the char on a poi, the softness of an idli in its clay pot.
          </p>
        </StoryChapter>
      </div>
      <StoryChapter index={5} title="Breakfast, whenever." image="/assets/v2/room/cup.webp" imageAlt="A cup of coffee on a stone ledge in dappled light">
        <p>
          Whenever we are open, breakfast is on the menu. Dosa at noon, eggs for dinner, and coffee whenever you would like
          another.
        </p>
        <p>
          <Link to="/menu" className="text-bone underline decoration-ember/60 underline-offset-4 hover:decoration-ember">
            See what&rsquo;s cooking today
          </Link>
        </p>
      </StoryChapter>
      <div data-sound="crab">
        <StoryChapter
          index={6}
          title="Something is growing."
          image="/assets/v2/crab/boxes.webp"
          imageAlt="Rows of blue crab boxes along a wall beside the restaurant"
          flip
        >
          <p>
            Beside the restaurant, our crab cultivation project is underway, one crab to a box. It is not on the menu yet, and
            we will not rush it to the table.
          </p>
          <p>
            <Link to="/the-crab-journey" className="text-bone underline decoration-ember/60 underline-offset-4 hover:decoration-ember">
              Follow the crab journey
            </Link>
          </p>
        </StoryChapter>
      </div>
      <section className="v-closing" aria-label="Closing">
        <p className="v-title v-title--md">This isn&rsquo;t just where we cook.</p>
        <p className="v-accent-title mt-4">It&rsquo;s where the coast comes alive.</p>
        <div className="mt-12 flex justify-center">
          <FoldTab to="/menu">What&rsquo;s cooking?</FoldTab>
        </div>
      </section>
    </main>
  );
}
