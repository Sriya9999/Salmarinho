import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { StructuredData } from "@/components/StructuredData";
import { useReserve } from "@/components/site/reserve";
import { DishMarks } from "@/components/v2/home";
import { Contours, Reveal } from "@/components/v2/kit";
import { getMenuData } from "@/lib/content/content.functions";
import type { Dish, MenuCategory } from "@/lib/content/types";
import { jsonLd, menuSchema, pageHead } from "@/lib/seo";
import { formatPrice } from "@/lib/site";

export const Route = createFileRoute("/menu/")({
  loader: () => getMenuData(),
  head: () =>
    pageHead({
      title: "Menu: dosa, idli, eggs and coffee in Anjuna",
      description:
        "The Sal Marinho menu in Anjuna, Goa: South Indian and Goan breakfast, eggs and omelettes, Buddha bowls, French toast, coffee, juices and smoothies.",
      path: "/menu",
      crumb: "Menu",
      image: "/assets/v2/og/menu.jpg",
    }),
  component: MenuPage,
});

const PROTEIN = "add-your-protein";

function MenuPage() {
  const { categories, dishes, showPrices } = Route.useLoaderData();
  const { open } = useReserve();
  const sections = categories.filter(
    (c) => c.slug !== PROTEIN && dishes.some((d) => d.category === c.slug),
  );
  const proteins = dishes.filter((d) => d.category === PROTEIN);
  const [active, setActive] = useState(sections[0]?.slug ?? "");
  const slugs = sections.map((c) => c.slug).join(" ");

  useEffect(() => {
    const nodes = slugs
      .split(" ")
      .map((slug) => document.getElementById(slug))
      .filter((n): n is HTMLElement => Boolean(n));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    for (const n of nodes) io.observe(n);
    return () => io.disconnect();
  }, [slugs]);

  return (
    <main id="main" data-sound="quiet">
      <StructuredData json={jsonLd(menuSchema(categories, dishes, showPrices))} />
      <header className="relative overflow-hidden">
        <Contours style={{ opacity: 0.1 }} />
        <div className="v-wrap relative pt-40 pb-14 md:pt-48 md:pb-20">
          <p className="v-kicker">The menu &middot; Served all day</p>
          <h1 className="v-accent-title mt-5">What&rsquo;s cooking?</h1>
          <div className="mt-8 grid gap-10 md:grid-cols-12">
            <p className="v-lede md:col-span-6">
              South Indian breakfast, Goan breakfast, morning classics, eggs on char-grilled poi,
              bowls, French toast, and coffee, juices and smoothies. Everything is on from the
              moment we open to the moment we close.
            </p>
            <ul className="v-menu-key md:col-span-5 md:col-start-8" aria-label="Key">
              <li>
                <span className="v-mark v-mark--veg">
                  <span className="v-mark__veg" aria-hidden="true" />
                  Vegetarian
                </span>
              </li>
              <li>
                <span className="v-mark v-mark--chef">Chef&rsquo;s special</span>
              </li>
              <li>
                <span className="v-mark v-mark--new">New</span>
              </li>
              <li>
                <span className="v-mark v-mark--out">Sold out today</span>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <nav aria-label="Menu sections" className="v-menu-nav">
        <ul className="v-wrap">
          {sections.map((c) => (
            <li key={c.slug}>
              <a
                href={`#${c.slug}`}
                data-active={active === c.slug}
                aria-current={active === c.slug ? "true" : undefined}
              >
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="v-wrap pb-24">
        {sections.map((c) => (
          <MenuSection
            key={c.slug}
            category={c}
            dishes={dishes.filter((d) => d.category === c.slug)}
            proteins={c.slug === "buddha-bowls" ? proteins : []}
            showPrices={showPrices}
          />
        ))}

        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-hairline pt-10">
          {showPrices ? (
            <div>
              <p className="text-sand">Taxes extra. We levy a 10% service charge.</p>
              <p className="mt-2 text-sm text-sand">
                The printed menus:{" "}
                <a
                  className="text-bone underline decoration-ember/50 underline-offset-4"
                  href="/menu/sal-marinho-food-menu.pdf"
                  target="_blank"
                  rel="noopener"
                >
                  food
                </a>{" "}
                and{" "}
                <a
                  className="text-bone underline decoration-ember/50 underline-offset-4"
                  href="/menu/sal-marinho-beverage-menu.pdf"
                  target="_blank"
                  rel="noopener"
                >
                  breakfast and beverages
                </a>{" "}
                (PDF).
              </p>
            </div>
          ) : (
            <p className="text-sand">Ask us about today&rsquo;s specials when you visit.</p>
          )}
          <button type="button" className="sm-ember-pill" onClick={open}>
            <span className="sm-ember-pill__coal" aria-hidden="true" />
            <span className="relative">Reserve a table</span>
          </button>
        </div>
      </div>
    </main>
  );
}

function MenuSection({
  category,
  dishes,
  proteins,
  showPrices,
}: {
  category: MenuCategory;
  dishes: Dish[];
  proteins: Dish[];
  showPrices: boolean;
}) {
  return (
    <section
      id={category.slug}
      className="v-menu-cat grid gap-10 pt-20 md:grid-cols-12 md:pt-28"
      aria-labelledby={`${category.slug}-title`}
    >
      <div className="md:col-span-4">
        <div className="md:sticky md:top-44">
          <h2 id={`${category.slug}-title`} className="v-title v-title--md">
            {category.title}
          </h2>
          {category.subtitle ? <p className="mt-3 text-sand">{category.subtitle}</p> : null}
          {category.image ? (
            <Reveal
              src={category.image}
              alt={category.imageAlt}
              className="mt-8 aspect-[3/2] w-full"
              sizes="(min-width: 768px) 30vw, 100vw"
            />
          ) : null}
        </div>
      </div>
      <div className="md:col-span-7 md:col-start-6">
        <ul>
          {dishes.map((d) => (
            <li
              key={d.id}
              className={`v-menu-item${d.image ? " v-menu-item--photo" : ""}${d.soldOut ? " v-menu-item--out" : ""}`}
            >
              {d.image ? (
                <img
                  className="v-menu-item__photo"
                  src={d.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <h3 className="v-menu-item__name">{d.name}</h3>
              {showPrices && d.price != null ? (
                <span className="v-menu-item__price">{formatPrice(d.price)}</span>
              ) : null}
              <DishMarks dish={d} />
              {d.description ? <p className="v-menu-item__desc">{d.description}</p> : null}
            </li>
          ))}
        </ul>
        {proteins.length ? (
          <div className="mt-10">
            <h3 className="sm-label">Add your protein</h3>
            <ul className="v-addons mt-4">
              {proteins.map((p) => (
                <li key={p.id}>
                  {p.dietary.includes("Vegetarian") || p.dietary.includes("Vegan") ? (
                    <span
                      className="v-mark__veg mr-2 inline-block align-[-1px]"
                      role="img"
                      aria-label="Vegetarian"
                    />
                  ) : null}
                  {p.name}
                  {showPrices && p.price != null ? <b>{formatPrice(p.price)}</b> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
