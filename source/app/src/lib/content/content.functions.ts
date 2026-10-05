// Public read-only server functions used by route loaders.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getDishBySlug,
  getPostBySlug,
  getSettings,
  listCategories,
  listDishes,
  listEvents,
  listPosts,
} from "./db.server";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => getSettings());

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const [categories, dishes, posts, settings] = await Promise.all([
    listCategories(),
    listDishes(),
    listPosts(),
    getSettings(),
  ]);
  // What's cooking? shows dishes that have a photograph; featured ones lead.
  const pictured = dishes.filter((d) => d.image);
  return { categories, dishes: pictured, posts: posts.slice(0, 7), settings };
});

export const getMenuData = createServerFn({ method: "GET" }).handler(async () => {
  const [categories, dishes] = await Promise.all([listCategories(), listDishes()]);
  return { categories, dishes };
});

export const getDish = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(160) }))
  .handler(async ({ data }) => {
    const [dish, categories] = await Promise.all([getDishBySlug(data.slug), listCategories()]);
    if (!dish) return null;
    const related = (await listDishes()).filter((d) => d.category === dish.category && d.id !== dish.id).slice(0, 3);
    return { dish, category: categories.find((c) => c.slug === dish.category) ?? null, related };
  });

export const getJournal = createServerFn({ method: "GET" }).handler(async () => listPosts());

export const getJournalPost = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const post = await getPostBySlug(data.slug);
    if (!post) return null;
    const more = (await listPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);
    return { post, more };
  });

export const getVisitData = createServerFn({ method: "GET" }).handler(async () => {
  const [settings, events] = await Promise.all([getSettings(), listEvents({ upcomingOnly: true })]);
  return { settings, events };
});
