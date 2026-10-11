// Admin server functions. Every handler checks the session first.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  deleteRow,
  getDb,
  getSettings,
  listCategories,
  listDishes,
  listEnquiries,
  listEvents,
  listPosts,
  listReservations,
  saveSettings,
  setEnquiryStatus,
  setReservationStatus,
  upsertCategory,
  upsertDish,
  upsertEvent,
  upsertPost,
} from "@/lib/content/db.server";
import type { Dish, JournalPost } from "@/lib/content/types";
import { DIETARY, JOURNAL_CATEGORIES, MOODS } from "@/lib/site";
import { AdminError, changePassword, isAdmin, login, logout, passwordConfigured, requireAdmin } from "./auth.server";

type Result<T = null> = { ok: true; data: T } | { ok: false; message: string };

async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof AdminError) return { ok: false, message: error.message };
    console.error(error);
    return { ok: false, message: "Something went wrong while saving. Please try again." };
  }
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";

async function uniqueSlug(table: "dishes" | "journal_posts", base: string, id: string): Promise<string> {
  const db = await getDb();
  if (!db) return base;
  let slug = base;
  for (let n = 2; n < 50; n++) {
    const row = await db.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`).bind(slug, id).first<{ id: string }>();
    if (!row) return slug;
    slug = `${base}-${n}`;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

const mediaPath = z
  .string()
  .max(400)
  .refine((v) => v === "" || v.startsWith("/assets/") || v.startsWith("/media/"), "Images must be uploaded here or come from the site.");

// ---------------------------------------------------------------- session

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => ({
  signedIn: await isAdmin(),
  configured: await passwordConfigured(),
  storage: Boolean(await getDb()),
}));

export const adminLogin = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1).max(200) }))
  .handler(({ data }) => run(() => login(data.password)));

export const adminLogout = createServerFn({ method: "POST" }).handler(() => run(() => logout()));

export const adminChangePassword = createServerFn({ method: "POST" })
  .validator(z.object({ current: z.string().min(1).max(200), next: z.string().min(1).max(200) }))
  .handler(({ data }) => run(() => changePassword(data.current, data.next)));

// ---------------------------------------------------------------- read

export const adminData = createServerFn({ method: "GET" }).handler(() =>
  run(async () => {
    await requireAdmin();
    const [dishes, categories, posts, events, settings, reservations, enquiries] = await Promise.all([
      listDishes({ includeDrafts: true }),
      listCategories(),
      listPosts({ includeDrafts: true }),
      listEvents({ includeDrafts: true }),
      getSettings(),
      listReservations(),
      listEnquiries(),
    ]);
    return { dishes, categories, posts, events, settings, reservations, enquiries };
  }),
);

// ---------------------------------------------------------------- dishes

const dishInput = z.object({
  id: z.string().max(64).optional(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600).default(""),
  price: z.number().int().min(0).max(1_000_000).nullable(),
  category: z.string().min(1).max(80),
  origin: z.string().trim().max(120).default(""),
  influence: z.string().trim().max(120).default(""),
  ingredients: z.array(z.string().trim().min(1).max(60)).max(24),
  technique: z.string().trim().max(160).default(""),
  story: z.string().trim().max(4000).default(""),
  image: mediaPath,
  imageAlt: z.string().trim().max(200).default(""),
  gallery: z.array(mediaPath).max(12),
  dietary: z.array(z.enum(DIETARY)).max(DIETARY.length),
  spiceLevel: z.number().int().min(0).max(3),
  chefRecommendation: z.boolean(),
  isNew: z.boolean(),
  soldOut: z.boolean(),
  pairing: z.string().trim().max(200).default(""),
  featured: z.boolean(),
  published: z.boolean(),
  sort: z.number().int().min(0).max(9999),
});

export const adminSaveDish = createServerFn({ method: "POST" })
  .validator(dishInput)
  .handler(({ data }) =>
    run(async () => {
      await requireAdmin({ write: true });
      const id = data.id || crypto.randomUUID();
      const slug = await uniqueSlug("dishes", slugify(data.name), id);
      const dish: Dish = { ...data, id, slug, updatedAt: "" };
      await upsertDish(dish);
      return { id, slug };
    }),
  );

export const adminDelete = createServerFn({ method: "POST" })
  .validator(z.object({ table: z.enum(["dishes", "journal_posts", "events"]), id: z.string().min(1).max(64) }))
  .handler(({ data }) =>
    run(async () => {
      await requireAdmin({ write: true });
      await deleteRow(data.table, data.id);
      return null;
    }),
  );

// ---------------------------------------------------------------- categories

export const adminSaveCategory = createServerFn({ method: "POST" })
  .validator(
    z.object({
      slug: z.string().min(1).max(80),
      title: z.string().trim().min(1).max(80),
      subtitle: z.string().trim().max(160),
      story: z.string().trim().max(600),
      mood: z.enum(MOODS),
      image: mediaPath,
      imageAlt: z.string().trim().max(200),
      icon: z.enum(["crab", "wave", "flame", "claypot", "pan", "coconut", "chilli", "leaf", "fish", "shell", "clock", "pin"]),
      sort: z.number().int().min(0).max(999),
    }),
  )
  .handler(({ data }) =>
    run(async () => {
      await requireAdmin({ write: true });
      await upsertCategory(data);
      return null;
    }),
  );

// ---------------------------------------------------------------- journal

export const adminSavePost = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().max(64).optional(),
      title: z.string().trim().min(1).max(160),
      category: z.enum(JOURNAL_CATEGORIES),
      excerpt: z.string().trim().max(300),
      cover: mediaPath,
      coverAlt: z.string().trim().max(200),
      body: z.string().trim().max(30_000),
      author: z.string().trim().max(80),
      publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      published: z.boolean(),
    }),
  )
  .handler(({ data }) =>
    run(async () => {
      await requireAdmin({ write: true });
      const id = data.id || `post-${crypto.randomUUID()}`;
      const slug = await uniqueSlug("journal_posts", slugify(data.title), id);
      const post: JournalPost = { ...data, id, slug };
      await upsertPost(post);
      return { id, slug };
    }),
  );

// ---------------------------------------------------------------- events

export const adminSaveEvent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().max(64).optional(),
      title: z.string().trim().min(1).max(140),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().trim().max(40),
      description: z.string().trim().max(800),
      image: mediaPath,
      published: z.boolean(),
    }),
  )
  .handler(({ data }) =>
    run(async () => {
      await requireAdmin({ write: true });
      const id = data.id || crypto.randomUUID();
      await upsertEvent({ ...data, id });
      return { id };
    }),
  );

// ---------------------------------------------------------------- settings

const url = z.string().trim().max(400).refine((v) => v === "" || /^https:\/\//.test(v), "Links must start with https://");

export const adminSaveSettings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      address: z.string().trim().max(300),
      locality: z.string().trim().min(1).max(80),
      mapsUrl: url,
      latitude: z.string().trim().max(20).regex(/^$|^-?\d{1,2}(\.\d+)?$/),
      longitude: z.string().trim().max(20).regex(/^$|^-?\d{1,3}(\.\d+)?$/),
      phone: z.string().trim().max(30),
      whatsapp: z.string().trim().max(30),
      email: z.string().trim().max(120).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Check the email address."),
      instagram: url,
      facebook: url,
      hours: z.array(z.object({ days: z.string().trim().min(1).max(40), open: z.string().trim().min(1).max(12), close: z.string().trim().min(1).max(12) })).max(10),
      parking: z.string().trim().max(400),
      reservationUrl: url,
      showPrices: z.boolean(),
      gallery: z.array(mediaPath).max(10),
      crabStatus: z.enum(["coming-soon", "now-serving"]),
      crabStages: z
        .array(
          z.object({
            title: z.string().trim().min(1).max(40),
            note: z.string().trim().max(80),
            body: z.string().trim().max(600),
            image: mediaPath,
            imageAlt: z.string().trim().max(200),
            status: z.enum(["now", "soon"]),
          }),
        )
        .min(1)
        .max(10),
      events: z.object({
        illustrative: z.boolean(),
        enquiryEmail: z.string().trim().max(120).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Check the events email address."),
        enquiryWhatsapp: z.string().trim().max(30),
        categories: z
          .array(
            z.object({
              slug: z.string().trim().min(1).max(60),
              title: z.string().trim().min(1).max(60),
              line: z.string().trim().max(80),
              body: z.string().trim().max(600),
              image: mediaPath,
              imageAlt: z.string().trim().max(200),
            }),
          )
          .max(12),
        gallery: z
          .array(
            z.object({
              src: mediaPath.refine((v) => v !== "", "Every gallery picture needs a photo."),
              alt: z.string().trim().max(200),
              caption: z.string().trim().max(120),
              illustrative: z.boolean(),
            }),
          )
          .max(24),
      }),
    }),
  )
  .handler(({ data }) =>
    run(async () => {
      await requireAdmin({ write: true });
      await saveSettings(data);
      return null;
    }),
  );

// ---------------------------------------------------------------- event enquiries

export const adminSetEnquiry = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(64), status: z.enum(["new", "replied", "closed"]) }))
  .handler(({ data }) =>
    run(async () => {
      await requireAdmin({ write: true });
      await setEnquiryStatus(data.id, data.status);
      return null;
    }),
  );

// ---------------------------------------------------------------- reservations

export const adminSetReservation = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(64), status: z.enum(["new", "confirmed", "declined"]) }))
  .handler(({ data }) =>
    run(async () => {
      await requireAdmin({ write: true });
      await setReservationStatus(data.id, data.status);
      return null;
    }),
  );
