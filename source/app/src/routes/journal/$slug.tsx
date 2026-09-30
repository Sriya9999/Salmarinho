import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageHero, Prose } from "@/components/page/page-kit";
import { ShorelineLink } from "@/components/cta/garments";
import { StructuredData } from "@/components/StructuredData";
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
  return (
    <main id="main" className="bg-volcanic">
      <StructuredData json={jsonLd(articleSchema(post))} />
      <PageHero title={post.title} script={post.category.toLowerCase()} line={post.excerpt} image={post.cover} imageAlt={post.coverAlt} />
      <article className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
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
        </div>
      </article>
      {more.length ? (
        <section className="border-t border-hairline" aria-labelledby="more-stories">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 id="more-stories" className="sm-display text-3xl text-bone">
                More from the journal
              </h2>
              <ShorelineLink to="/journal">Read the journal</ShorelineLink>
            </div>
            <ul className="mt-10 grid gap-10 md:grid-cols-2">
              {more.map((p) => (
                <li key={p.id}>
                  <Link to="/journal/$slug" params={{ slug: p.slug }} className="group grid grid-cols-5 items-end gap-5">
                    <div className="col-span-2 overflow-hidden">
                      <img src={p.cover} alt={p.coverAlt} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="col-span-3">
                      <p className="font-body text-xs tracking-[0.26em] text-ember uppercase">{p.category}</p>
                      <h3 className="mt-2 text-2xl text-bone">{p.title}</h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
