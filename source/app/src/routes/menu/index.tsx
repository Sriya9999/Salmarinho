import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { FireGlow, LetterBuild, Steam } from "@/components/motion/primitives";
import { Icon } from "@/components/site/Icon";
import { useReserve } from "@/components/site/reserve";
import { StructuredData } from "@/components/StructuredData";
import { getMenuData } from "@/lib/content/content.functions";
import type { Dish, MenuCategory } from "@/lib/content/types";
import { jsonLd, menuSchema, pageHead } from "@/lib/seo";
import { formatPrice } from "@/lib/site";

export const Route = createFileRoute("/menu/")({
  loader: () => getMenuData(),
  head: () =>
    pageHead({
      title: "Menu: What's cooking?",
      description:
        "The Sal Marinho menu, organised as a journey: from the sea, the crab table, from the fire, the claypot, coastal classics, the Portuguese coast, from the land and something sweet.",
      path: "/menu",
      image: "/assets/og/menu.jpg",
    }),
  component: MenuPage,
});

function MenuPage() {
  const { categories, dishes } = Route.useLoaderData();
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "");
    if (fromHash && categories.some((c) => c.slug === fromHash)) setActive(fromHash);
  }, [categories]);

  const select = (slug: string) => {
    if (slug === active) return;
    setActive(slug);
    setTurn((t) => t + 1);
    history.replaceState(null, "", `#${slug}`);
  };

  const category = categories.find((c) => c.slug === active) ?? categories[0];
  const inCategory = dishes.filter((d) => d.category === category?.slug);

  return (
    <main id="main" className={`sm-menu-page sm-mood-${category?.mood ?? "volcanic"}`}>
      <StructuredData json={jsonLd(menuSchema(categories, dishes))} />
      <header className="mx-auto max-w-7xl px-5 pt-40 pb-10 md:px-10 md:pt-48">
        <p className="sm-script text-4xl text-clay md:text-6xl">menu</p>
        <LetterBuild text="What's cooking?" className="sm-display mt-2 text-5xl text-bone md:text-8xl" />
        <p className="mt-6 max-w-xl text-lg text-sand">
          Each dish is a story: where it comes from, what shaped it and how the fire treats it. Organised as a journey, not a list.
        </p>
      </header>

      <nav aria-label="Menu courses" className="sticky top-[76px] z-20 border-y border-hairline bg-volcanic/85 backdrop-blur-md">
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 md:px-8" role="tablist">
          {categories.map((c) => (
            <li key={c.slug} role="presentation">
              <button
                type="button"
                role="tab"
                id={`tab-${c.slug}`}
                aria-selected={c.slug === active}
                aria-controls="menu-course"
                onClick={() => select(c.slug)}
                className="sm-course-tab"
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {category ? (
        <section
          id="menu-course"
          role="tabpanel"
          aria-labelledby={`tab-${category.slug}`}
          key={turn}
          className="sm-page-turn mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24"
        >
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <Icon name={category.icon} className="h-10 w-10 text-clay" />
              <h2 className="sm-display mt-4 text-4xl text-bone md:text-6xl">{category.title}</h2>
              <p className="mt-3 font-body text-xs tracking-[0.26em] text-clay uppercase">{category.subtitle}</p>
              <p className="mt-6 max-w-md text-lg text-sand">{category.story}</p>
            </div>
            <div className="relative overflow-hidden md:col-span-7">
              <img src={category.image} alt={category.imageAlt} className="aspect-[16/10] w-full object-cover" />
              <Steam intensity={category.mood === "clay" || category.mood === "ember" ? 1 : 0.4} />
            </div>
          </div>

          {inCategory.length ? (
            <ul className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {inCategory.map((dish) => (
                <DishCard key={dish.id} dish={dish} category={category} />
              ))}
            </ul>
          ) : (
            <EmptyCourse category={category} />
          )}
        </section>
      ) : null}
    </main>
  );
}

function DishCard({ dish, category }: { dish: Dish; category: MenuCategory }) {
  const price = formatPrice(dish.price);
  return (
    <li>
      <FireGlow as="article" className="sm-dish-card group h-full">
        <Link to="/menu/$slug" params={{ slug: dish.slug }} className="flex h-full flex-col">
          <div className="relative overflow-hidden">
            {dish.image ? (
              <img
                src={dish.image}
                alt={dish.imageAlt || dish.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.05]"
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-charcoal">
                <Icon name={category.icon} className="h-12 w-12 text-clay" />
              </div>
            )}
            {dish.chefRecommendation ? (
              <span className="absolute top-3 left-3 sm-chip-note">
                Chef recommends
              </span>
            ) : null}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-2xl text-bone">{dish.name}</h3>
              {price ? <span className="shrink-0 text-sand">{price}</span> : null}
            </div>
            <dl className="sm-dish-facts mt-4">
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
            </dl>
            {dish.ingredients.length ? (
              <p className="sm-dish-ingredients mt-4 text-sm text-sand">{dish.ingredients.join(" · ")}</p>
            ) : null}
          </div>
        </Link>
      </FireGlow>
    </li>
  );
}

function EmptyCourse({ category }: { category: MenuCategory }) {
  const { open } = useReserve();
  return (
    <div className="mt-16 grid gap-6 border-t border-hairline pt-10 md:grid-cols-12">
      <p className="sm-display text-2xl text-bone md:col-span-7 md:text-3xl">
        {category.title} changes with the tide. Ask us what is cooking tonight.
      </p>
      <div className="md:col-span-5 md:text-right">
        <button type="button" onClick={open} className="sm-text-arrow">
          Reserve your table
        </button>
      </div>
    </div>
  );
}
