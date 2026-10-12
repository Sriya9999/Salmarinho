// Site-wide constants shared by client and server. No secrets here.

export const SITE_NAME = "Sal Marinho";
export const SITE_LOCALITY = "Anjuna, Goa";
export const THEME_COLOR = "#161513";
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://salmarinho.in";
export const SITE_DESCRIPTION =
  "A restaurant in Anjuna, Goa, serving South Indian and Goan breakfast all day, with a crab cultivation project underway and private events across Goa.";

export type NavItem = { to: string; hash?: string; title: string; subtitle: string };

/** Primary navigation: plain names, with a line of character beneath each. */
export const NAV_ITEMS: NavItem[] = [
  { to: "/breakfast", title: "Breakfast", subtitle: "All day, no clock" },
  { to: "/menu", title: "What's cooking?", subtitle: "Today's table" },
  { to: "/our-story", title: "Our story", subtitle: "The story behind the spice" },
  { to: "/the-coast", title: "The coast", subtitle: "Where it all begins" },
  { to: "/events", title: "Events", subtitle: "Moments worth gathering for" },
  { to: "/journal", title: "Journal", subtitle: "From our kitchen journal" },
  { to: "/visit", title: "Visit", subtitle: "Come in. Stay awhile." },
];

/** Secondary links, in the footer. */
export const MORE_ITEMS: NavItem[] = [{ to: "/reserve", title: "Reserve a table", subtitle: "We will keep a table for you" }];

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

/** What guests can choose on the event enquiry form. */
export const EVENT_TYPES = ["Villa", "Yacht", "Beach or poolside", "Birthday", "Corporate", "Private celebration", "Something else"] as const;

export const DIETARY = ["Vegetarian", "Vegan", "Gluten free", "Contains nuts", "Contains shellfish", "Dairy free"] as const;

/** Opening hours: 8 am to 8 pm, closed on Wednesdays. Editable in the admin panel. */
export const OPENING_HOURS = [
  { days: "Thursday to Tuesday", open: "8:00 am", close: "8:00 pm" },
  { days: "Wednesday", open: "Closed", close: "" },
];

type Hours = { days: string; open: string; close: string };

/** A day the restaurant does not open: "Closed" in the opening time, or no closing time. */
export const isClosedHours = (h: Hours) => !h.close.trim() || /closed/i.test(h.open);

/** "8:00 am to 8:00 pm", or "Closed". */
export const formatHours = (h: Hours) => (isClosedHours(h) ? "Closed" : `${h.open} to ${h.close}`);

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** "Thursday to Tuesday", "Mon-Fri", "Every day" or "Wednesday" as a list of day names. */
export function expandDays(label: string): string[] {
  const s = label.toLowerCase().replace(/\s+/g, "");
  if (s === "everyday" || s === "daily") return WEEK;
  const range = s.match(/^([a-z]{3})[a-z]*(?:-|to)([a-z]{3})[a-z]*$/);
  if (range) {
    const a = WEEK.findIndex((d) => d.toLowerCase().startsWith(range[1]));
    const b = WEEK.findIndex((d) => d.toLowerCase().startsWith(range[2]));
    if (a >= 0 && b >= 0) return a <= b ? WEEK.slice(a, b + 1) : [...WEEK.slice(a), ...WEEK.slice(0, b + 1)];
  }
  return WEEK.filter((d) => s.startsWith(d.slice(0, 3).toLowerCase()));
}

/** Names of the days marked closed in the opening hours, for example ["Wednesday"]. */
export const closedDays = (hours: Hours[]) => hours.filter(isClosedHours).flatMap((h) => expandDays(h.days));

/** The weekday of a yyyy-mm-dd date, for example "Wednesday". */
export const weekdayOf = (isoDate: string) => WEEK[(new Date(`${isoDate}T12:00:00Z`).getUTCDay() + 6) % 7];

/** Bookable times, every half hour, with the last booking half an hour before closing. */
function halfHours(from: number, to: number): string[] {
  const slots: string[] = [];
  for (let m = from * 60; m <= to * 60; m += 30) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 ? "30" : "00"}`);
  }
  return slots;
}
export const RESERVATION_SITTINGS = [
  { label: "Morning", times: halfHours(8, 11.5) },
  { label: "Afternoon", times: halfHours(12, 15.5) },
  { label: "Evening", times: halfHours(16, 19.5) },
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
