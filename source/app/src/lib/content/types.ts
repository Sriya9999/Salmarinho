import type { JournalCategory, Mood } from "@/lib/site";

export type IconName =
  | "crab"
  | "wave"
  | "flame"
  | "claypot"
  | "pan"
  | "coconut"
  | "chilli"
  | "leaf"
  | "fish"
  | "shell"
  | "clock"
  | "pin";

export interface MenuCategory {
  slug: string;
  title: string;
  subtitle: string;
  story: string;
  mood: Mood;
  image: string;
  imageAlt: string;
  icon: IconName;
  sort: number;
}

export interface Dish {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | null;
  category: string;
  origin: string;
  influence: string;
  ingredients: string[];
  technique: string;
  story: string;
  image: string;
  imageAlt: string;
  gallery: string[];
  dietary: string[];
  spiceLevel: number;
  /** Chef's special. */
  chefRecommendation: boolean;
  /** Recently added to the menu. */
  isNew: boolean;
  /** Not available today; stays listed, marked as sold out. */
  soldOut: boolean;
  pairing: string;
  featured: boolean;
  published: boolean;
  sort: number;
  updatedAt: string;
}

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  category: JournalCategory;
  excerpt: string;
  cover: string;
  coverAlt: string;
  body: string;
  author: string;
  publishedAt: string;
  published: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  image: string;
  published: boolean;
}

export interface OpeningHours {
  days: string;
  open: string;
  close: string;
}

/** One step of the crab journey, from cultivation to the table. */
export interface CrabStage {
  title: string;
  note: string;
  body: string;
  image: string;
  imageAlt: string;
  /** "now": happening now. "soon": part of the experience still to come. */
  status: "now" | "soon";
}

/** One kind of event Sal Marinho hosts across Goa. The team confirms what each includes. */
export interface EventCategory {
  slug: string;
  title: string;
  line: string;
  body: string;
  image: string;
  imageAlt: string;
}

/** A picture on the Events page. Illustrative pictures stay labelled until real event photographs replace them. */
export interface EventPhoto {
  src: string;
  alt: string;
  caption: string;
  illustrative: boolean;
}

export interface EventsSettings {
  categories: EventCategory[];
  gallery: EventPhoto[];
  /** True while category pictures are mood images rather than photographs of Sal Marinho events. */
  illustrative: boolean;
  /** Shown beside the enquiry form. Enquiries themselves arrive in the admin inbox. */
  enquiryEmail: string;
  enquiryWhatsapp: string;
}

export interface EventEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  location: string;
  guests: number;
  message: string;
  status: "new" | "replied" | "closed";
  createdAt: string;
}

export interface SiteSettings {
  address: string;
  locality: string;
  mapsUrl: string;
  latitude: string;
  longitude: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  hours: OpeningHours[];
  parking: string;
  reservationUrl: string;
  /** Show dish prices on the website (menu, breakfast page, home page). Off by default. */
  showPrices: boolean;
  /** Switch to "now-serving" when the crab experience launches. */
  crabStatus: "coming-soon" | "now-serving";
  crabStages: CrabStage[];
  /** Photographs of the restaurant itself (its garden, rooms and tables). */
  gallery: string[];
  events: EventsSettings;
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  request: string;
  status: "new" | "confirmed" | "declined";
  createdAt: string;
}
