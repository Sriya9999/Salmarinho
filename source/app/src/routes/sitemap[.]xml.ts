import { createFileRoute } from "@tanstack/react-router";

import { listPosts } from "@/lib/content/db.server";

const STATIC_PATHS: { path: string; priority: string; freq: string }[] = [
  { path: "/", priority: "1.0", freq: "weekly" },
  { path: "/breakfast", priority: "0.9", freq: "weekly" },
  { path: "/menu", priority: "0.9", freq: "weekly" },
  { path: "/events", priority: "0.8", freq: "monthly" },
  { path: "/journal", priority: "0.7", freq: "weekly" },
  { path: "/visit", priority: "0.8", freq: "monthly" },
  { path: "/our-story", priority: "0.7", freq: "monthly" },
  { path: "/the-coast", priority: "0.7", freq: "weekly" },
  { path: "/reserve", priority: "0.5", freq: "yearly" },
];

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const today = new Date().toISOString().split("T")[0];
        const posts = await listPosts().catch(() => []);
        const urls = [
          ...STATIC_PATHS.map((p) => ({ loc: `${origin}${p.path === "/" ? "/" : p.path}`, lastmod: today, freq: p.freq, priority: p.priority })),
          ...posts.map((p) => ({ loc: `${origin}/journal/${p.slug}`, lastmod: p.publishedAt, freq: "yearly", priority: "0.6" })),
        ];
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls.map(
            (u) =>
              `  <url><loc>${escape(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority></url>`,
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
