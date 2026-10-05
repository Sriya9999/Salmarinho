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
import { Opening } from "@/components/v2/opening";
import { getHomeData } from "@/lib/content/content.functions";
import { jsonLd, pageHead, restaurantSchema } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () =>
    pageHead({
      title: "Sal Marinho, Anjuna | South Indian and Goan breakfast, all day",
      description:
        "A coastal restaurant in Anjuna, Goa: benne dosa, clay pot tatte idli, Ross omelette with poi, choris on toast, Buddha bowls, French toast, coffee and fresh juices, served all day.",
      path: "/",
      image: "/assets/v2/og/home.jpg",
    }),
  component: Index,
});

function Index() {
  const { categories, dishes, posts, settings } = Route.useLoaderData();
  return (
    <main id="main">
      <StructuredData json={jsonLd(restaurantSchema(settings))} />
      <Opening />
      <Hero />
      <WhatsCooking categories={categories} dishes={dishes} />
      <ClockSection />
      <FromTheSouth />
      <FollowTheSpice />
      <CoastFilm />
      <PortugueseMap />
      <Fire />
      <GrowingSection settings={settings} />
      <ComeIn />
      <JournalSpread posts={posts} />
      <ComeToTheTable settings={settings} />
    </main>
  );
}
