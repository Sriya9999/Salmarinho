import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageHero, Prose } from "@/components/page/page-kit";
import { StructuredData } from "@/components/StructuredData";
import { StoryCard } from "@/components/v2/home";
import { getJournalPost } from "@/lib/content/content.functions";
import { articleSchema, jsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params }) => {
    const data = await getJournalPost({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { post } = loaderData;
    return pageHead({ title: post.title, description: post.excerpt, path: `/journal/${post.slug}`, image: post.cover, type: "article" });
  },
  component: Article,
});

function Article() {
  const { post, more } = Route.useLoaderData();
  const date = new Date(`${post.publishedAt}T00:00:00`);
  const soon = post.category === "The crab";
  return (
    <main id="main" data-sound={soon ? "waves" : "quiet"}>
      <StructuredData json={jsonLd(articleSchema(post))} />
      <PageHero kicker={soon ? "Coming soon" : post.category} title={post.title} line={post.excerpt} image={post.cover} imageAlt={post.coverAlt} />
      <article className="v-wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
        <aside className="md:col-span-3">
          <p className="sm-label">{post.author}</p>
          <p className="mt-2 text-sm text-sand">
            <time dateTime={post.publishedAt}>
              {date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </time>
          </p>
        </aside>
        <div className="md:col-span-8 md:col-start-5">
          <Prose body={post.body} />
          {soon ? (
            <Link to="/the-crab-journey" className="v-ripple-link mt-10">
              <span className="v-ripple-link__ring" aria-hidden="true" />
              Follow the journey
            </Link>
          ) : null}
        </div>
      </article>
      {more.length ? (
        <section className="border-t border-hairline" aria-labelledby="more-stories">
          <div className="v-wrap py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 id="more-stories" className="v-title v-title--sm">
                More from the journal
              </h2>
              <Link to="/journal" className="v-contour-link">
                All stories
                <svg viewBox="0 0 260 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 4 C 30 0, 50 8, 80 4 S 130 0, 160 4 S 220 8, 260 3" />
                </svg>
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {more.map((p) => (
                <StoryCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
