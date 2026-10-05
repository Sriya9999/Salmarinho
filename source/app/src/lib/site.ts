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

/** Opening hours: two sittings a day. Editable later in the admin panel. */
export const OPENING_HOURS = [
  { days: "Every day", open: "8:00 am", close: "1:30 pm" },
  { days: "Every day", open: "6:00 pm", close: "10:00 pm" },
];

/** Bookable times, every half hour, with the last booking half an hour before closing. */
function halfHours(from: number, to: number): string[] {
  const slots: string[] = [];
  for (let m = from * 60; m <= to * 60; m += 30) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 ? "30" : "00"}`);
  }
  return slots;
}
export const RESERVATION_SITTINGS = [
  { label: "Morning", times: halfHours(8, 13) },
  { label: "Evening", times: halfHours(18, 21.5) },
];
export const RESERVATION_TIMES = RESERVATION_SITTINGS.flatMap((s) => s.times);

/** "13:30" to "1:30 pm". */
export function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatPrice(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null;
  return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
}
