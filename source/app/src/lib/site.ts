// Site-wide constants shared by client and server. No secrets here.

export const SITE_NAME = "Sal Marinho";
export const SITE_LOCALITY = "Anjuna, Goa";
export const THEME_COLOR = "#161513";
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://salmarinho.higgsfield.app";
export const SITE_DESCRIPTION =
  "A coastal restaurant in Anjuna, Goa, serving South Indian food and breakfast all day: benne dosa, clay pot tatte idli, Goan and Portuguese eggs, Buddha bowls, coffee and fresh juices.";

export type NavItem = { to: string; hash?: string; title: string; subtitle: string };

/** Primary navigation. */
export const NAV_ITEMS: NavItem[] = [
  { to: "/menu", title: "Menu", subtitle: "What's cooking?" },
  { to: "/journal", title: "Journal", subtitle: "From our kitchen journal" },
  { to: "/visit", title: "Visit", subtitle: "Come to the table" },
];

/** Secondary links, in the navigation aside and the footer. */
export const MORE_ITEMS: NavItem[] = [
  { to: "/", hash: "from-the-south", title: "From the South", subtitle: "Coconut, curry leaf, pepper, rice" },
  { to: "/", hash: "a-little-portuguese", title: "A little Portuguese", subtitle: "Poi, choris and the coast" },
  { to: "/the-crab-journey", title: "Something is growing", subtitle: "Coming soon" },
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
