import { createFileRoute } from "@tanstack/react-router";

import { listDishes, listPosts } from "@/lib/content/db.server";

// Pages and the photos on them that are worth finding in Google Images. Static
// pages carry no lastmod: a date that changed every day would teach Google to
// ignore lastmod everywhere, including the journal's real publication dates.
const STATIC_PAGES: { path: string; images?: string[] }[] = [
  { path: "/", images: ["/assets/og/home.jpg"] },
  { path: "/breakfast", images: ["/assets/v2/og/breakfast.jpg"] },
  { path: "/menu", images: ["/assets/v2/og/menu.jpg"] },
  { path: "/events", images: ["/assets/v2/og/events.jpg"] },
  { path: "/visit", images: ["/assets/v2/og/visit.jpg"] },
  { path: "/our-story" },
  { path: "/the-coast", images: ["/assets/v2/og/crab.jpg"] },
  { path: "/journal", images: ["/assets/v2/og/journal.jpg"] },
  { path: "/reserve" },
];

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${origin}${path}`);
        const [posts, dishes] = await Promise.all([listPosts().catch(() => []), listDishes().catch(() => [])]);
        // Every dish photo belongs to the menu page.
        const dishImages = dishes.map((d) => d.image).filter((image): image is string => Boolean(image));
        const urls: { loc: string; lastmod?: string; images: string[] }[] = [
          ...STATIC_PAGES.map((p) => ({
            loc: abs(p.path),
            images: [...(p.images ?? []), ...(p.path === "/menu" ? dishImages : [])],
          })),
          ...posts.map((p) => ({ loc: abs(`/journal/${p.slug}`), lastmod: p.publishedAt, images: p.cover ? [p.cover] : [] })),
        ];
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
          ...urls.map((u) =>
            [
              `  <url><loc>${escape(u.loc)}</loc>`,
              u.lastmod ? `<lastmod>${escape(u.lastmod)}</lastmod>` : "",
              ...[...new Set(u.images)].map((image) => `<image:image><image:loc>${escape(abs(image))}</image:loc></image:image>`),
              "</url>",
            ].join(""),
          ),
          "</urlset>",
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
