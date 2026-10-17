import type { Dish, EventItem, JournalPost, MenuCategory, SiteSettings } from "@/lib/content/types";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl, expandDays, isClosedHours } from "@/lib/site";

type Crumb = { name: string; path: string };
type HeadInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  /** This page's name in Google's breadcrumb trail; every page but home has one. */
  crumb?: string;
  /** Pages between home and this one, for example the journal above a story. */
  parents?: Crumb[];
};

/** Per-route head: title, description, canonical, social tags and breadcrumbs. */
export function pageHead({
  title,
  description,
  path,
  image = "/assets/v2/og/breakfast.jpg",
  type = "website",
  crumb,
  parents = [],
}: HeadInput) {
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const img = absoluteUrl(image);
  const trail = crumb ? [{ name: "Home", path: "/" }, ...parents, { name: crumb, path }] : null;
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
    scripts: trail ? [{ type: "application/ld+json", children: jsonLd(breadcrumbSchema(trail)) }] : [],
  };
}

/** JSON for <script type="application/ld+json">, with "<" escaped so it can never close the tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const to24h = (t: string) => {
  // "8:00 am", "7.30 pm" or "19:30".
  const m = t.trim().toLowerCase().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (!m) return t;
  let h = Number(m[1]);
  if (m[3] === "pm" && h < 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
};

/** The site itself, so Google shows "Sal Marinho" as the site name in results. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: ["Sal Marinho Anjuna", "Sal Marinho Goa"],
    url: `${SITE_URL}/`,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#restaurant` },
  };
}

// Village, region and country are certain; the street address comes from the
// admin settings, where it is written out in full ("…, Anjuna, Goa 403509"),
// so the village and PIN code are split off into their own fields.
export const postalAddress = (settings?: Pick<SiteSettings, "address">) => {
  const full = settings?.address.replace(/\s*\n\s*/g, ", ").trim() ?? "";
  const street = full.replace(/,?\s*\b(Anjuna|Bardez|North Goa|Goa|India|\d{6})\b.*$/i, "").trim();
  const postalCode = full.match(/\b\d{6}\b/)?.[0];
  return {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    addressLocality: "Anjuna",
    addressRegion: "Goa",
    ...(postalCode ? { postalCode } : {}),
    addressCountry: "IN",
  };
};

/** Restaurant structured data. Only fields the owner has actually filled are emitted. */
export function restaurantSchema(settings: SiteSettings) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    logo: absoluteUrl("/icons/icon-512.png"),
    image: ["/assets/og/home.jpg", "/assets/v2/og/breakfast.jpg", "/assets/v2/og/visit.jpg", "/assets/v2/og/menu.jpg"].map(absoluteUrl),
    servesCuisine: ["South Indian", "Goan", "Breakfast", "Cafe"],
    acceptsReservations: true,
    menu: absoluteUrl("/menu"),
    hasMenu: absoluteUrl("/menu"),
    currenciesAccepted: "INR",
    areaServed: settings.locality,
    address: postalAddress(settings),
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/reserve"),
        actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
      },
      result: { "@type": "FoodEstablishmentReservation", name: `A table at ${SITE_NAME}` },
    },
  };
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
    "@id": `${SITE_URL}/menu#menu`,
    name: `${SITE_NAME} menu`,
    url: absoluteUrl("/menu"),
    inLanguage: "en-IN",
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

const publisher = {
  "@type": "Organization",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: absoluteUrl("/icons/icon-512.png") },
};

const postingSchema = (post: JournalPost) => ({
  "@type": "BlogPosting",
  headline: post.title,
  description: post.excerpt,
  image: [absoluteUrl(post.cover)],
  datePublished: post.publishedAt,
  dateModified: post.publishedAt,
  inLanguage: "en-IN",
  articleSection: post.category,
  author: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` },
  publisher,
  url: absoluteUrl(`/journal/${post.slug}`),
  mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
});

export function articleSchema(post: JournalPost) {
  return { "@context": "https://schema.org", ...postingSchema(post) };
}

/** The journal as a blog, listing its stories. */
export function blogSchema(posts: JournalPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/journal#blog`,
    name: `${SITE_NAME} kitchen journal`,
    url: absoluteUrl("/journal"),
    inLanguage: "en-IN",
    publisher,
    blogPost: posts.map(postingSchema),
  };
}

/** A dated event at the restaurant, as listed on the Visit page. */
export function eventSchema(event: EventItem) {
  const time = event.time ? to24h(event.time) : "";
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    // India Standard Time; a date alone when no time has been set.
    startDate: /^\d{2}:\d{2}$/.test(time) ? `${event.date}T${time}:00+05:30` : event.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: SITE_NAME, address: postalAddress() },
    ...(event.image ? { image: [absoluteUrl(event.image)] } : {}),
    organizer: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` },
    url: absoluteUrl("/visit"),
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
