import { createFileRoute } from "@tanstack/react-router";

import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { SplitReserve, WaveArrowLink } from "@/components/first/garments";
import { FilmAutoplay } from "@/components/first/autoplay";
import { DoorOpening } from "@/components/first/door";
import { firstScenes, firstTheme } from "@/components/first/scenes";
import { Atmosphere, ClaypotReveal, CoastPan, ExperienceStrip, FatteningRitual, Philosophy } from "@/components/first/story-sections";
import { JournalSpread, MenuSlices, PortugueseConnection, ReserveBand } from "@/components/first/table-sections";
import { EventsTeaser } from "@/components/v2/events";
import { StructuredData } from "@/components/StructuredData";
import { getLandingData } from "@/lib/content/content.functions";
import { jsonLd, pageHead, restaurantSchema, websiteSchema } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: () => getLandingData(),
  head: () =>
    pageHead({
      title: "Sal Marinho | Restaurant in Anjuna, Goa: all-day breakfast",
      description:
        "Sal Marinho is a restaurant in Anjuna, North Goa: South Indian and Goan breakfast all day, wood fire and claypot cooking, and a crab project underway.",
      path: "/",
      image: "/assets/og/home.jpg",
    }),
  component: Index,
});

// The original landing film owns scroll-to-video time for the journey;
// everything after it is ordinary server-rendered sections. Scenes stay a
// module constant so the controller is built once.
const journeyScenes = firstScenes.map((scene, i) => {
  if (i === 0) return { ...scene, actions: <WaveArrowLink href="#the-crab">Enter the experience</WaveArrowLink> };
  if (i === firstScenes.length - 1) return { ...scene, actions: <SplitReserve /> };
  return scene;
});

// The fire leg doubles as the mid-page fire band.
const fireBand = [
  {
    ...firstScenes[2],
    id: "cooked-the-old-way",
    label: "Fire",
    kicker: undefined,
    title: "Cooked the old way. Served a new way.",
    body: "Wood fire, charcoal and hibachi-style heat, read by hand and by eye.",
    tags: undefined,
    align: "right" as const,
    scroll: 1.3,
  },
];

function Index() {
  const { categories, dishes, posts, settings } = Route.useLoaderData();
  return (
    <main id="main" className="sm-first">
      <StructuredData json={jsonLd(websiteSchema())} />
      <StructuredData json={jsonLd(restaurantSchema(settings))} />
      <DoorOpening />
      <div data-sound="waves" data-film="journey">
        <ScrollScrub scenes={journeyScenes} theme={firstTheme} />
      </div>
      <FilmAutoplay film='[data-film="journey"] .scroll-scrub' />
      <Philosophy />
      <FatteningRitual />
      <CoastPan />
      <div data-cursor="ember" data-sound="fire">
        <ScrollScrub scenes={fireBand} theme={firstTheme} className="scroll-scrub--band" firstHeading="h2" />
      </div>
      <MenuSlices categories={categories} dishes={dishes} showPrices={settings.showPrices} />
      <PortugueseConnection />
      <ClaypotReveal />
      <ExperienceStrip />
      <JournalSpread posts={posts} />
      <Atmosphere gallery={settings.gallery} />
      <EventsTeaser />
      <ReserveBand />
    </main>
  );
}
