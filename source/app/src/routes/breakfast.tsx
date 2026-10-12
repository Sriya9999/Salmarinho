import { createFileRoute } from "@tanstack/react-router";

import { StructuredData } from "@/components/StructuredData";
import {
  ClockSection,
  CoastFilm,
  ComeIn,
  ComeToTheTable,
  Fire,
  FollowTheSpice,
  FromTheSouth,
  Hero,
  JournalSpread,
  PortugueseMap,
  WhatsCooking,
} from "@/components/v2/home";
import { GrowingSection } from "@/components/v2/crab";
import { EventsTeaser } from "@/components/v2/events";
import { getHomeData } from "@/lib/content/content.functions";
import { jsonLd, pageHead, restaurantSchema } from "@/lib/seo";

/** The all-day breakfast: what Sal Marinho serves today, from South Indian to Goan. */
export const Route = createFileRoute("/breakfast")({
  loader: () => getHomeData(),
  head: () =>
    pageHead({
      title: "South Indian and Goan breakfast in Anjuna",
      description:
        "All-day breakfast in Anjuna, Goa: benne dosa, clay pot tatte idli, Ross omelette with poi, choris on toast, Buddha bowls, French toast and fresh coffee.",
      path: "/breakfast",
      crumb: "Breakfast",
      image: "/assets/v2/og/breakfast.jpg",
    }),
  component: Breakfast,
});

function Breakfast() {
  const { categories, dishes, posts, settings } = Route.useLoaderData();
  return (
    <main id="main">
      <StructuredData json={jsonLd(restaurantSchema(settings))} />
      <Hero />
      <WhatsCooking categories={categories} dishes={dishes} showPrices={settings.showPrices} />
      <ClockSection />
      <FromTheSouth />
      <FollowTheSpice />
      <CoastFilm />
      <PortugueseMap />
      <Fire />
      <GrowingSection settings={settings} />
      <EventsTeaser />
      <ComeIn />
      <JournalSpread posts={posts} />
      <ComeToTheTable settings={settings} />
    </main>
  );
}
