import { createFileRoute } from "@tanstack/react-router";

import { StoryCard } from "@/components/v2/home";
import { Contours } from "@/components/v2/kit";
import { getJournal } from "@/lib/content/content.functions";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/journal/")({
  loader: () => getJournal(),
  head: () =>
    pageHead({
      title: "From our kitchen journal",
      description:
        "Stories from the Sal Marinho kitchen: the art of the dosa, breakfast without a clock, the spice behind South Indian food, and the Portuguese thread in Goan breakfast.",
      path: "/journal",
      image: "/assets/v2/og/journal.jpg",
    }),
  component: Journal,
});

function Journal() {
  const posts = Route.useLoaderData();
  return (
    <main id="main" data-sound="quiet">
      <header className="relative overflow-hidden">
        <Contours style={{ opacity: 0.1 }} />
        <div className="v-wrap relative pt-40 pb-14 md:pt-48">
          <p className="v-kicker">Stories</p>
          <h1 className="v-title mt-5">
            From our kitchen <em>journal.</em>
          </h1>
          <p className="v-lede mt-6">Notes on batter and tawa, spice and coast, and the breakfast table that keeps no clock.</p>
        </div>
      </header>
      <section className="v-wrap pb-28" aria-label="Stories">
        {posts.length ? (
          <div className="v-journal">
            {posts.map((post) => (
              <StoryCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-sand">No stories yet. The first one is on its way.</p>
        )}
      </section>
    </main>
  );
}
