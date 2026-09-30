import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { FireGlow, LetterBuild, Steam } from "@/components/motion/primitives";
import { SplitReserve } from "@/components/cta/garments";
import { StructuredData } from "@/components/StructuredData";
import { getDish } from "@/lib/content/content.functions";
import { breadcrumbSchema, jsonLd, pageHead } from "@/lib/seo";
import { absoluteUrl, formatPrice } from "@/lib/site";

export const Route = createFileRoute("/menu/$slug")({
  loader: async ({ params }) => {
    const data = await getDish({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { dish } = loaderData;
    return pageHead({
      title: dish.name,
      description: dish.description || `${dish.name} at Sal Marinho, Anjuna.`,
      path: `/menu/${dish.slug}`,
      image: dish.image || "/assets/og/menu.jpg",
    });
  },
  component: DishPage,
});

const SPICE = ["Mild", "Warm", "Spiced", "Fiery"];

function DishPage() {
  const { dish, category, related } = Route.useLoaderData();
  const price = formatPrice(dish.price);
  const itemSchema = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    url: absoluteUrl(`/menu/${dish.slug}`),
    ...(dish.image ? { image: absoluteUrl(dish.image) } : {}),
    ...(dish.price != null ? { offers: { "@type": "Offer", price: dish.price, priceCurrency: "INR" } } : {}),
  };
  return (
    <main id="main" className={`sm-menu-page sm-mood-${category?.mood ?? "volcanic"}`}>
      <StructuredData json={jsonLd(itemSchema)} />
      <StructuredData
        json={jsonLd(
          breadcrumbSchema([
            { name: "Menu", path: "/menu" },
            { name: dish.name, path: `/menu/${dish.slug}` },
          ]),
        )}
      />
      <article className="mx-auto max-w-7xl px-5 pt-36 pb-24 md:px-10 md:pt-44">
        <nav aria-label="Breadcrumb" className="font-body text-xs tracking-[0.24em] text-sand uppercase">
          <Link to="/menu" hash={category?.slug} className="hover:text-bone">
            Menu
          </Link>
          {category ? <span aria-hidden="true"> / </span> : null}
          {category ? <span>{category.title}</span> : null}
        </nav>
        <div className="mt-8 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <LetterBuild text={dish.name} className="sm-display text-5xl text-bone md:text-7xl" />
            {dish.description ? <p className="mt-6 max-w-lg text-lg text-sand">{dish.description}</p> : null}
            <dl className="sm-dish-facts sm-dish-facts--large mt-10">
              {dish.origin ? (
                <div>
                  <dt>Origin</dt>
                  <dd>{dish.origin}</dd>
                </div>
              ) : null}
              {dish.influence ? (
                <div>
                  <dt>Influence</dt>
                  <dd>{dish.influence}</dd>
                </div>
              ) : null}
              {dish.technique ? (
                <div>
                  <dt>Technique</dt>
                  <dd>{dish.technique}</dd>
                </div>
              ) : null}
              {dish.pairing ? (
                <div>
                  <dt>Pairing</dt>
                  <dd>{dish.pairing}</dd>
                </div>
              ) : null}
              {dish.spiceLevel > 0 ? (
                <div>
                  <dt>Spice</dt>
                  <dd>{SPICE[Math.min(3, dish.spiceLevel)]}</dd>
                </div>
              ) : null}
              {dish.dietary.length ? (
                <div>
                  <dt>Dietary</dt>
                  <dd>{dish.dietary.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
            {dish.ingredients.length ? (
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3" aria-label="Ingredients">
                {dish.ingredients.map((ing, i) => (
                  <li key={ing} className="sm-ingredient" style={{ animationDelay: `${300 + i * 90}ms` }}>
                    {ing}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-12 flex flex-wrap items-center gap-10">
              {price ? <p className="sm-display text-3xl text-bone">{price}</p> : null}
              <SplitReserve />
            </div>
          </div>
          <div className="md:col-span-6">
            {dish.image ? (
              <FireGlow className="relative overflow-hidden">
                <img src={dish.image} alt={dish.imageAlt || dish.name} className="aspect-[4/5] w-full object-cover" />
                <Steam intensity={1} />
              </FireGlow>
            ) : null}
            {dish.gallery.length ? (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {dish.gallery.slice(0, 6).map((src) => (
                  <img key={src} src={src} alt={`${dish.name}, detail`} loading="lazy" className="aspect-square w-full object-cover" />
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {dish.story ? (
          <section className="mt-20 grid gap-8 border-t border-hairline pt-12 md:grid-cols-12" aria-labelledby="dish-story">
            <h2 id="dish-story" className="sm-display text-3xl text-bone md:col-span-4">
              The story
            </h2>
            <div className="sm-prose md:col-span-8">
              {dish.story.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ) : null}
        {related.length ? (
          <section className="mt-20 border-t border-hairline pt-12" aria-labelledby="dish-related">
            <h2 id="dish-related" className="sm-display text-2xl text-bone">
              Also from {category?.title.toLowerCase() ?? "this course"}
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((d) => (
                <li key={d.id}>
                  <Link to="/menu/$slug" params={{ slug: d.slug }} className="group block">
                    {d.image ? (
                      <div className="overflow-hidden">
                        <img src={d.image} alt={d.imageAlt || d.name} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    ) : null}
                    <p className="mt-3 font-display text-xl text-bone">{d.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  );
}
