import type { Dish, JournalPost, MenuCategory, SiteSettings } from "@/lib/content/types";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl, expandDays, isClosedHours } from "@/lib/site";

type HeadInput = { title: string; description: string; path: string; image?: string; type?: "website" | "article" };

/** Per-route head: title, description, canonical and social tags. */
export function pageHead({ title, description, path, image = "/assets/v2/og/breakfast.jpg", type = "website" }: HeadInput) {
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const img = absoluteUrl(image);
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:image", content: img },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: img },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** JSON for <script type="application/ld+json">, with "<" escaped so it can never close the tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const to24h = (t: string) => {
  const m = t.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return t;
  let h = Number(m[1]);
  if (m[3] === "pm" && h < 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
};

/** Restaurant structured data. Only fields the owner has actually filled are emitted. */
export function restaurantSchema(settings: SiteSettings) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: absoluteUrl("/icons/icon-512.png"),
    image: [absoluteUrl("/assets/v2/og/breakfast.jpg")],
    servesCuisine: ["South Indian", "Breakfast", "Goan", "Cafe"],
    acceptsReservations: true,
    menu: absoluteUrl("/menu"),
    areaServed: settings.locality,
  };
  if (settings.address) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: settings.address.replace(/\n/g, ", "),
      addressLocality: "Anjuna",
      addressRegion: "Goa",
      addressCountry: "IN",
    };
  }
  if (settings.latitude && settings.longitude) {
    data.geo = { "@type": "GeoCoordinates", latitude: Number(settings.latitude), longitude: Number(settings.longitude) };
  }
  if (settings.phone) data.telephone = settings.phone;
  if (settings.email) data.email = settings.email;
  if (settings.mapsUrl) data.hasMap = settings.mapsUrl;
  const sameAs = [settings.instagram, settings.facebook].filter(Boolean);
  if (sameAs.length) data.sameAs = sameAs;
  const hours = settings.hours
    .filter((h) => !isClosedHours(h))
    .map((h) => ({ days: expandDays(h.days), opens: to24h(h.open), closes: to24h(h.close) }))
    .filter((h) => h.days.length);
  if (hours.length) {
    data.openingHoursSpecification = hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    }));
  }
  return data;
}

export function menuSchema(categories: MenuCategory[], dishes: Dish[], showPrices: boolean) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${SITE_NAME} menu`,
    url: absoluteUrl("/menu"),
    hasMenuSection: categories
      .map((c) => ({
        "@type": "MenuSection",
        name: c.title,
        description: c.subtitle,
        hasMenuItem: dishes
          .filter((d) => d.category === c.slug)
          .map((d) => ({
            "@type": "MenuItem",
            name: d.name,
            description: d.description,
            ...(d.image ? { image: absoluteUrl(d.image) } : {}),
            ...(showPrices && d.price != null ? { offers: { "@type": "Offer", price: d.price, priceCurrency: "INR" } } : {}),
            ...(d.dietary.includes("Vegetarian") ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
          })),
      }))
      .filter((s) => s.hasMenuItem.length),
  };
}

export function articleSchema(post: JournalPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [absoluteUrl(post.cover)],
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl("/icons/icon-512.png") } },
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
