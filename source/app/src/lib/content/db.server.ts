// Server-only data access. The D1 binding exists only on the deployed Worker
// (or `wrangler dev`); under plain `vite dev` it is absent, so reads fall back
// to the seed content and writes report that storage is unavailable.
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

import { DEFAULT_SETTINGS, SEED_CATEGORIES, SEED_DISHES, SEED_POSTS } from "./seed";
import type {
  Dish,
  EventItem,
  JournalPost,
  MenuCategory,
  Reservation,
  SiteSettings,
} from "./types";
import type { JournalCategory, Mood } from "@/lib/site";

type Env = { DB?: D1Database; STORAGE?: R2Bucket; ADMIN_PASSWORD?: string };

export async function getEnv(): Promise<Env> {
  try {
    const mod = (await import("cloudflare:workers")) as { env: Env };
    return mod.env ?? {};
  } catch {
    return {};
  }
}

export async function getDb(): Promise<D1Database | undefined> {
  return (await getEnv()).DB;
}

export async function requireDb(): Promise<D1Database> {
  const db = await getDb();
  if (!db) throw new Error("Storage is not available in this environment.");
  return db;
}

const parseList = (value: unknown): string[] => {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
};

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));

function toCategory(r: Row): MenuCategory {
  return {
    slug: str(r.slug),
    title: str(r.title),
    subtitle: str(r.subtitle),
    story: str(r.story),
    mood: str(r.mood) as Mood,
    image: str(r.image),
    imageAlt: str(r.image_alt),
    icon: str(r.icon) as MenuCategory["icon"],
    sort: num(r.sort),
  };
}

function toDish(r: Row): Dish {
  return {
    id: str(r.id),
    slug: str(r.slug),
    name: str(r.name),
    description: str(r.description),
    price: r.price == null ? null : num(r.price),
    category: str(r.category),
    origin: str(r.origin),
    influence: str(r.influence),
    ingredients: parseList(r.ingredients),
    technique: str(r.technique),
    story: str(r.story),
    image: str(r.image),
    imageAlt: str(r.image_alt),
    gallery: parseList(r.gallery),
    dietary: parseList(r.dietary),
    spiceLevel: num(r.spice_level),
    chefRecommendation: num(r.chef_recommendation) === 1,
    pairing: str(r.pairing),
    featured: num(r.featured) === 1,
    published: num(r.published) === 1,
    sort: num(r.sort),
    updatedAt: str(r.updated_at),
  };
}

function toPost(r: Row): JournalPost {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: str(r.title),
    category: str(r.category) as JournalCategory,
    excerpt: str(r.excerpt),
    cover: str(r.cover),
    coverAlt: str(r.cover_alt),
    body: str(r.body),
    author: str(r.author),
    publishedAt: str(r.published_at),
    published: num(r.published) === 1,
  };
}

function toEvent(r: Row): EventItem {
  return {
    id: str(r.id),
    title: str(r.title),
    date: str(r.date),
    time: str(r.time),
    description: str(r.description),
    image: str(r.image),
    published: num(r.published) === 1,
  };
}

function toReservation(r: Row): Reservation {
  return {
    id: str(r.id),
    date: str(r.date),
    time: str(r.time),
    guests: num(r.guests),
    name: str(r.name),
    phone: str(r.phone),
    request: str(r.request),
    status: str(r.status) as Reservation["status"],
    createdAt: str(r.created_at),
  };
}

// ---------- public reads ----------

export async function listCategories(): Promise<MenuCategory[]> {
  const db = await getDb();
  if (!db) return SEED_CATEGORIES;
  const { results } = await db.prepare("SELECT * FROM menu_categories ORDER BY sort, title").all<Row>();
  return results.length ? results.map(toCategory) : SEED_CATEGORIES;
}

export async function listDishes(opts: { includeDrafts?: boolean } = {}): Promise<Dish[]> {
  const db = await getDb();
  if (!db) return SEED_DISHES.filter((d) => opts.includeDrafts || d.published);
  const sql = opts.includeDrafts
    ? "SELECT * FROM dishes ORDER BY category, sort, name"
    : "SELECT * FROM dishes WHERE published = 1 ORDER BY category, sort, name";
  const { results } = await db.prepare(sql).all<Row>();
  return results.map(toDish);
}

export async function getDishBySlug(slug: string): Promise<Dish | null> {
  const db = await getDb();
  if (!db) return SEED_DISHES.find((d) => d.slug === slug && d.published) ?? null;
  const row = await db.prepare("SELECT * FROM dishes WHERE slug = ? AND published = 1").bind(slug).first<Row>();
  return row ? toDish(row) : null;
}

export async function listPosts(opts: { includeDrafts?: boolean } = {}): Promise<JournalPost[]> {
  const db = await getDb();
  if (!db) return SEED_POSTS.filter((p) => opts.includeDrafts || p.published).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const sql = opts.includeDrafts
    ? "SELECT * FROM journal_posts ORDER BY published_at DESC"
    : "SELECT * FROM journal_posts WHERE published = 1 ORDER BY published_at DESC";
  const { results } = await db.prepare(sql).all<Row>();
  return results.map(toPost);
}

export async function getPostBySlug(slug: string): Promise<JournalPost | null> {
  const db = await getDb();
  if (!db) return SEED_POSTS.find((p) => p.slug === slug && p.published) ?? null;
  const row = await db
    .prepare("SELECT * FROM journal_posts WHERE slug = ? AND published = 1")
    .bind(slug)
    .first<Row>();
  return row ? toPost(row) : null;
}

export async function listEvents(opts: { includeDrafts?: boolean; upcomingOnly?: boolean } = {}): Promise<EventItem[]> {
  const db = await getDb();
  if (!db) return [];
  const where: string[] = [];
  if (!opts.includeDrafts) where.push("published = 1");
  if (opts.upcomingOnly) where.push("date >= date('now')");
  const sql = `SELECT * FROM events ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY date`;
  const { results } = await db.prepare(sql).all<Row>();
  return results.map(toEvent);
}

export async function getSettings(): Promise<SiteSettings> {
  const db = await getDb();
  if (!db) return DEFAULT_SETTINGS;
  const row = await db.prepare("SELECT value FROM settings WHERE key = 'site'").first<{ value: string }>();
  if (!row) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(row.value) as Partial<SiteSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ---------- admin writes ----------

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const db = await requireDb();
  await db
    .prepare("INSERT INTO settings (key, value) VALUES ('site', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .bind(JSON.stringify(settings))
    .run();
}

export async function upsertDish(dish: Dish): Promise<void> {
  const db = await requireDb();
  await db
    .prepare(
      `INSERT INTO dishes (id, slug, name, description, price, category, origin, influence, ingredients, technique, story, image, image_alt, gallery, dietary, spice_level, chef_recommendation, pairing, featured, published, sort, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET slug = excluded.slug, name = excluded.name, description = excluded.description, price = excluded.price,
         category = excluded.category, origin = excluded.origin, influence = excluded.influence, ingredients = excluded.ingredients,
         technique = excluded.technique, story = excluded.story, image = excluded.image, image_alt = excluded.image_alt, gallery = excluded.gallery,
         dietary = excluded.dietary, spice_level = excluded.spice_level, chef_recommendation = excluded.chef_recommendation, pairing = excluded.pairing,
         featured = excluded.featured, published = excluded.published, sort = excluded.sort, updated_at = datetime('now')`,
    )
    .bind(
      dish.id,
      dish.slug,
      dish.name,
      dish.description,
      dish.price,
      dish.category,
      dish.origin,
      dish.influence,
      JSON.stringify(dish.ingredients),
      dish.technique,
      dish.story,
      dish.image,
      dish.imageAlt,
      JSON.stringify(dish.gallery),
      JSON.stringify(dish.dietary),
      dish.spiceLevel,
      dish.chefRecommendation ? 1 : 0,
      dish.pairing,
      dish.featured ? 1 : 0,
      dish.published ? 1 : 0,
      dish.sort,
    )
    .run();
}

export async function deleteRow(table: "dishes" | "journal_posts" | "events", id: string): Promise<void> {
  const db = await requireDb();
  await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
}

export async function upsertCategory(c: MenuCategory): Promise<void> {
  const db = await requireDb();
  await db
    .prepare(
      `INSERT INTO menu_categories (slug, title, subtitle, story, mood, image, image_alt, icon, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET title = excluded.title, subtitle = excluded.subtitle, story = excluded.story, mood = excluded.mood,
         image = excluded.image, image_alt = excluded.image_alt, icon = excluded.icon, sort = excluded.sort`,
    )
    .bind(c.slug, c.title, c.subtitle, c.story, c.mood, c.image, c.imageAlt, c.icon, c.sort)
    .run();
}

export async function upsertPost(p: JournalPost): Promise<void> {
  const db = await requireDb();
  await db
    .prepare(
      `INSERT INTO journal_posts (id, slug, title, category, excerpt, cover, cover_alt, body, author, published_at, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET slug = excluded.slug, title = excluded.title, category = excluded.category, excerpt = excluded.excerpt,
         cover = excluded.cover, cover_alt = excluded.cover_alt, body = excluded.body, author = excluded.author,
         published_at = excluded.published_at, published = excluded.published`,
    )
    .bind(p.id, p.slug, p.title, p.category, p.excerpt, p.cover, p.coverAlt, p.body, p.author, p.publishedAt, p.published ? 1 : 0)
    .run();
}

export async function upsertEvent(e: EventItem): Promise<void> {
  const db = await requireDb();
  await db
    .prepare(
      `INSERT INTO events (id, title, date, time, description, image, published) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, date = excluded.date, time = excluded.time,
         description = excluded.description, image = excluded.image, published = excluded.published`,
    )
    .bind(e.id, e.title, e.date, e.time, e.description, e.image, e.published ? 1 : 0)
    .run();
}

export async function listReservations(limit = 200): Promise<Reservation[]> {
  const db = await requireDb();
  const { results } = await db
    .prepare("SELECT * FROM reservations ORDER BY created_at DESC LIMIT ?")
    .bind(limit)
    .all<Row>();
  return results.map(toReservation);
}

export async function setReservationStatus(id: string, status: Reservation["status"]): Promise<void> {
  const db = await requireDb();
  await db.prepare("UPDATE reservations SET status = ? WHERE id = ?").bind(status, id).run();
}
