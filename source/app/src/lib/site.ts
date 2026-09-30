// Site-wide constants shared by client and server. No secrets here.

export const SITE_NAME = "Sal Marinho";
export const SITE_LOCALITY = "Anjuna, Goa";
export const THEME_COLOR = "#141311";
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://salmarinho.higgsfield.app";
export const SITE_DESCRIPTION =
  "A coastal gastronomy restaurant in Anjuna, Goa. Fattened mud crab, live wood fire, claypot and cast iron, and a coastline shaped by Portuguese exchange.";

export type NavItem = { to: string; title: string; subtitle: string };

/** Primary navigation, in journey order (PRD section 2). */
export const NAV_ITEMS: NavItem[] = [
  { to: "/who-we-are", title: "Who we are", subtitle: "The story behind the spice" },
  { to: "/menu", title: "Menu", subtitle: "What's cooking?" },
  { to: "/our-craft", title: "Our craft", subtitle: "From coast to fire" },
  { to: "/the-crab", title: "The crab", subtitle: "The fattening ritual" },
  { to: "/journal", title: "Journal", subtitle: "From our kitchen journal" },
  { to: "/visit", title: "Visit", subtitle: "Find your way to the table" },
];

/** Secondary journeys, linked from the footer and inside pages. */
export const MORE_ITEMS: NavItem[] = [
  { to: "/coastal-journey", title: "The coast", subtitle: "A journey along India's shore" },
  { to: "/portuguese-connection", title: "The Portuguese connection", subtitle: "Same ocean, new flavours" },
  { to: "/the-experience", title: "The experience", subtitle: "Come for the crab, stay for the story" },
];

export const JOURNAL_CATEGORIES = [
  "The coast",
  "The fire",
  "The crab",
  "The people",
  "The ingredient",
  "The story",
] as const;
export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

export const MOODS = ["ocean", "forest", "charcoal", "clay", "ember", "volcanic"] as const;
export type Mood = (typeof MOODS)[number];

export const DIETARY = ["Vegetarian", "Vegan", "Gluten free", "Contains nuts", "Contains shellfish", "Dairy free"] as const;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatPrice(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null;
  return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
}
