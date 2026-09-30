import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { LetterBuild } from "@/components/motion/primitives";
import { getJournal } from "@/lib/content/content.functions";
import { pageHead } from "@/lib/seo";
import { JOURNAL_CATEGORIES, type JournalCategory } from "@/lib/site";

export const Route = createFileRoute("/journal/")({
  loader: () => getJournal(),
  head: () =>
    pageHead({
      title: "From our kitchen journal",
      description:
        "Stories from the Sal Marinho kitchen: crab fattening, cooking with fire, claypots, coastal ingredients and the Portuguese thread in Goan food.",
      path: "/journal",
      image: "/assets/og/journal.jpg",
    }),
  component: Journal,
});

function Journal() {
  const posts = Route.useLoaderData();
  const [filter, setFilter] = useState<JournalCategory | "All">("All");
  const shown = filter === "All" ? posts : posts.filter((p) => p.category === filter);
  const [lead, ...rest] = shown;
  const usedCategories = JOURNAL_CATEGORIES.filter((c) => posts.some((p) => p.category === c));

  return (
    <main id="main" className="bg-volcanic">
      <header className="mx-auto max-w-7xl px-5 pt-40 pb-12 md:px-10 md:pt-48">
        <p className="sm-script text-4xl text-clay md:text-6xl">from our kitchen</p>
        <LetterBuild text="The journal" className="sm-display mt-2 text-5xl text-bone md:text-8xl" />
        <p className="mt-6 max-w-xl text-lg text-sand">Notes on the coast, the fire, the crab, the people and the ingredients that make this kitchen.</p>
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Filter stories">
          {(["All", ...usedCategories] as const).map((c) => (
            <li key={c}>
              <button type="button" aria-pressed={filter === c} onClick={() => setFilter(c)} className="sm-filter">
                {c}
              </button>
            </li>
          ))}
        </ul>
      </header>

      {lead ? (
        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-10" aria-label="Stories">
          <article className="group">
            <Link to="/journal/$slug" params={{ slug: lead.slug }} className="grid gap-8 md:grid-cols-12 md:items-end">
              <div className="overflow-hidden md:col-span-8">
                <img
                  src={lead.cover}
                  alt={lead.coverAlt}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.03]"
                />
              </div>
              <div className="md:col-span-4">
                <p className="font-body text-xs tracking-[0.26em] text-ember uppercase">{lead.category}</p>
                <h2 className="sm-display mt-3 text-3xl text-bone md:text-5xl">{lead.title}</h2>
                <p className="mt-4 text-sand">{lead.excerpt}</p>
              </div>
            </Link>
          </article>
          <ul className="mt-20 grid gap-x-10 gap-y-16 md:grid-cols-2">
            {rest.map((post, i) => (
              <li key={post.id} className={i % 2 ? "md:mt-24" : ""}>
                <article className="group">
                  <Link to="/journal/$slug" params={{ slug: post.slug }} className="block">
                    <div className="overflow-hidden">
                      <img
                        src={post.cover}
                        alt={post.coverAlt}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]"
                      />
                    </div>
                    <p className="mt-5 font-body text-xs tracking-[0.26em] text-ember uppercase">{post.category}</p>
                    <h2 className="mt-2 text-2xl text-bone md:text-3xl">{post.title}</h2>
                    <p className="mt-3 max-w-md text-sand">{post.excerpt}</p>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mx-auto max-w-7xl px-5 pb-32 text-sand md:px-10">No stories in this section yet. The next one is in the oven.</p>
      )}
    </main>
  );
}
