import { createFileRoute } from "@tanstack/react-router";

import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";
import { SplitReserve, WaveArrowLink } from "@/components/cta/garments";
import { Atmosphere, ClaypotReveal, CoastPan, ExperienceStrip, FatteningRitual, Philosophy } from "@/components/home/story-sections";
import { JournalSpread, MenuSlices, PortugueseConnection, ReserveBand } from "@/components/home/table-sections";
import { StructuredData } from "@/components/StructuredData";
import { getHomeData } from "@/lib/content/content.functions";
import { jsonLd, pageHead, restaurantSchema } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () =>
    pageHead({
      title: "Sal Marinho | Crab, fire and claypot in Anjuna, Goa",
      description:
        "A coastal gastronomy restaurant in Anjuna, Goa, built around fattened mud crab, live wood fire and claypot cooking, with a coastline shaped by Portuguese exchange.",
      path: "/",
    }),
  component: Index,
});

// The film owns scroll-to-video time for the journey; everything after it is
// ordinary server-rendered sections. Scenes stay a module constant so the
// controller is built once.
const journeyScenes = scrollScrubScenes.map((scene, i) => {
  if (i === 0) return { ...scene, actions: <WaveArrowLink href="#the-crab">Enter the experience</WaveArrowLink> };
  if (i === scrollScrubScenes.length - 1) return { ...scene, actions: <SplitReserve /> };
  return scene;
});

// The fire leg doubles as the mid-page fire band.
const fireBand = [
  {
    ...scrollScrubScenes[2],
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
  const { categories, signature, posts, settings } = Route.useLoaderData();
  return (
    <main id="main">
      <StructuredData json={jsonLd(restaurantSchema(settings))} />
      <ScrollScrub scenes={journeyScenes} theme={scrollScrubTheme} />
      <Philosophy />
      <FatteningRitual />
      <CoastPan />
      <div data-cursor="ember">
        <ScrollScrub scenes={fireBand} theme={scrollScrubTheme} className="scroll-scrub--band" />
      </div>
      <MenuSlices categories={categories} dishes={signature} />
      <PortugueseConnection />
      <ClaypotReveal />
      <ExperienceStrip />
      <JournalSpread posts={posts} />
      <Atmosphere gallery={settings.gallery} />
      <ReserveBand />
    </main>
  );
}
