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
  chefRecommendation: boolean;
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
  gallery: string[];
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
