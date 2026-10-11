import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import {
  adminChangePassword,
  adminData,
  adminDelete,
  adminLogin,
  adminLogout,
  adminSaveCategory,
  adminSaveDish,
  adminSaveEvent,
  adminSavePost,
  adminSaveSettings,
  adminSetEnquiry,
  adminSetReservation,
  adminStatus,
} from "@/lib/admin/admin.functions";
import type { CrabStage, Dish, EventCategory, EventEnquiry, EventItem, EventPhoto, EventsSettings, JournalPost, MenuCategory, Reservation, SiteSettings } from "@/lib/content/types";
import { DIETARY, JOURNAL_CATEGORIES, MOODS, formatPrice } from "@/lib/site";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | Sal Marinho" }, { name: "robots", content: "noindex, nofollow" }] }),
  loader: () => adminStatus(),
  component: AdminPage,
});

type Data = {
  dishes: Dish[];
  categories: MenuCategory[];
  posts: JournalPost[];
  events: EventItem[];
  settings: SiteSettings;
  reservations: Reservation[];
  enquiries: EventEnquiry[];
};
type Tab = "reservations" | "enquiries" | "dishes" | "courses" | "journal" | "crab" | "eventspage" | "events" | "settings" | "password";
const TABS: { id: Tab; label: string }[] = [
  { id: "reservations", label: "Reservations" },
  { id: "enquiries", label: "Event enquiries" },
  { id: "dishes", label: "Dishes" },
  { id: "courses", label: "Courses" },
  { id: "journal", label: "Journal" },
  { id: "crab", label: "Crab journey" },
  { id: "eventspage", label: "Events page" },
  { id: "events", label: "Dated events" },
  { id: "settings", label: "Restaurant details" },
  { id: "password", label: "Password" },
];

function AdminPage() {
  const status = Route.useLoaderData();
  const [signedIn, setSignedIn] = useState(status.signedIn);
  return (
    <main className="min-h-dvh bg-volcanic font-body text-bone">
      <header className="flex items-center justify-between border-b border-hairline px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src="/assets/brand/mark.svg" alt="" className="h-8 w-8" />
          <span className="font-display tracking-[0.12em]">Sal Marinho admin</span>
        </Link>
        {signedIn ? (
          <button
            type="button"
            className="text-sm text-sand underline-offset-4 hover:underline"
            onClick={async () => {
              await adminLogout();
              setSignedIn(false);
            }}
          >
            Sign out
          </button>
        ) : null}
      </header>
      {!status.storage ? (
        <p className="mx-auto max-w-lg px-5 py-24 text-center text-sand">
          The content database is only available on the live site. Open this page on the published address to sign in.
        </p>
      ) : !status.configured ? (
        <p className="mx-auto max-w-lg px-5 py-24 text-center text-sand">The admin password has not been set up yet.</p>
      ) : signedIn ? (
        <Dashboard onSignedOut={() => setSignedIn(false)} />
      ) : (
        <Login onDone={() => setSignedIn(true)} />
      )}
    </main>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setBusy(true);
    setError(null);
    const res = await adminLogin({ data: { password } });
    setBusy(false);
    if (res.ok) onDone();
    else setError(res.message);
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-24 max-w-sm px-5">
      <h1 className="font-display text-3xl">Sign in</h1>
      <label htmlFor="admin-password" className="sm-label mt-8 block">
        Password
      </label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required className="sm-input mt-2" />
      {error ? (
        <p role="alert" className="mt-4 text-sm text-clay">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className="adm-btn mt-8 w-full">
        {busy ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}

function Dashboard({ onSignedOut }: { onSignedOut: () => void }) {
  const [tab, setTab] = useState<Tab>("reservations");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    const res = await adminData();
    if (res.ok) {
      setData(res.data);
      setError(null);
    } else {
      setError(res.message);
      if (res.message.includes("sign in")) onSignedOut();
    }
  }, [onSignedOut]);
  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-[14rem_1fr] md:px-8">
      <nav aria-label="Admin sections">
        <ul className="flex gap-2 overflow-x-auto md:flex-col">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                aria-current={tab === t.id ? "page" : undefined}
                onClick={() => setTab(t.id)}
                className="adm-tab"
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <section aria-live="polite">
        {error ? <p className="text-clay">{error}</p> : null}
        {!data ? (
          <p className="text-sand">Loading</p>
        ) : tab === "reservations" ? (
          <Reservations items={data.reservations} reload={reload} />
        ) : tab === "enquiries" ? (
          <Enquiries items={data.enquiries} reload={reload} />
        ) : tab === "eventspage" ? (
          <EventsPage settings={data.settings} reload={reload} />
        ) : tab === "dishes" ? (
          <Dishes dishes={data.dishes} categories={data.categories} reload={reload} />
        ) : tab === "courses" ? (
          <Courses categories={data.categories} reload={reload} />
        ) : tab === "journal" ? (
          <Journal posts={data.posts} reload={reload} />
        ) : tab === "crab" ? (
          <CrabJourney settings={data.settings} reload={reload} />
        ) : tab === "events" ? (
          <Events events={data.events} reload={reload} />
        ) : tab === "settings" ? (
          <Settings settings={data.settings} reload={reload} />
        ) : (
          <Password />
        )}
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- shared form bits */

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="sm-label block">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint ? <span className="mt-1 block text-xs text-sand/80">{hint}</span> : null}
    </label>
  );
}

function Notice({ message }: { message: { kind: "ok" | "error"; text: string } | null }) {
  if (!message) return null;
  return (
    <p role={message.kind === "error" ? "alert" : "status"} className={message.kind === "error" ? "text-clay" : "text-sand"}>
      {message.text}
    </p>
  );
}

function PhotoField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function upload(file: File) {
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = (await res.json()) as { ok: boolean; url?: string; message?: string };
      if (json.ok && json.url) onChange(json.url);
      else setError(json.message ?? "Upload failed.");
    } catch {
      setError("Upload failed. Check your connection and try again.");
    }
    setBusy(false);
  }
  return (
    <div>
      <span className="sm-label block">{label}</span>
      <div className="mt-2 flex items-center gap-4">
        {value ? <img src={value} alt="" className="h-20 w-20 object-cover" /> : <span className="grid h-20 w-20 place-items-center border border-hairline text-xs text-sand">No photo</span>}
        <div className="space-y-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            aria-label={`Upload ${label.toLowerCase()}`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
            className="block text-sm text-sand file:mr-3 file:border file:border-hairline file:bg-charcoal file:px-3 file:py-2 file:text-bone"
          />
          {value ? (
            <button type="button" className="text-xs text-sand underline" onClick={() => onChange("")}>
              Remove photo
            </button>
          ) : null}
          {busy ? <p className="text-xs text-sand">Uploading</p> : null}
          {error ? <p className="text-xs text-clay">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

const listToText = (v: string[]) => v.join(", ");
const textToList = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/* ---------------------------------------------------------------- reservations */

function Reservations({ items, reload }: { items: Reservation[]; reload: () => Promise<void> }) {
  if (!items.length) return <p className="text-sand">No reservation requests yet. They will appear here as guests book.</p>;
  return (
    <div>
      <h1 className="font-display text-2xl">Reservation requests</h1>
      <p className="mt-2 text-sm text-sand">Call or message each guest to confirm, then mark the request.</p>
      <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
        {items.map((r) => (
          <li key={r.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-lg">
                {r.name} · {r.guests} {r.guests === 1 ? "guest" : "guests"}
              </p>
              <p className="text-sm text-sand">
                {r.date} at {r.time} ·{" "}
                <a className="underline" href={`tel:${r.phone.replace(/\s/g, "")}`}>
                  {r.phone}
                </a>
              </p>
              {r.request ? <p className="mt-1 text-sm text-sand">"{r.request}"</p> : null}
            </div>
            <div className="flex gap-2">
              {(["new", "confirmed", "declined"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={r.status === s}
                  className="adm-chip"
                  onClick={async () => {
                    await adminSetReservation({ data: { id: r.id, status: s } });
                    await reload();
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- dishes */

const emptyDish = (category: string): Dish => ({
  id: "",
  slug: "",
  name: "",
  description: "",
  price: null,
  category,
  origin: "",
  influence: "",
  ingredients: [],
  technique: "",
  story: "",
  image: "",
  imageAlt: "",
  gallery: [],
  dietary: [],
  spiceLevel: 0,
  chefRecommendation: false,
  isNew: false,
  soldOut: false,
  pairing: "",
  featured: false,
  published: true,
  sort: 0,
  updatedAt: "",
});

function Dishes({ dishes, categories, reload }: { dishes: Dish[]; categories: MenuCategory[]; reload: () => Promise<void> }) {
  const [editing, setEditing] = useState<Dish | null>(null);
  if (editing) return <DishForm initial={editing} categories={categories} onClose={() => setEditing(null)} reload={reload} />;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl">Dishes</h1>
        <button type="button" className="adm-btn" onClick={() => setEditing(emptyDish(categories[0]?.slug ?? ""))}>
          Add a dish
        </button>
      </div>
      {categories.map((c) => {
        const list = dishes.filter((d) => d.category === c.slug);
        return (
          <div key={c.slug} className="mt-8">
            <h2 className="sm-label">{c.title}</h2>
            {list.length ? (
              <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
                {list.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                    <span>
                      {d.name}
                      {!d.published ? <span className="ml-2 text-xs text-clay">Hidden</span> : null}
                      {d.featured ? <span className="ml-2 text-xs text-sand">On home page</span> : null}
                    </span>
                    <span className="flex items-center gap-4 text-sm">
                      <span className="text-sand">{formatPrice(d.price) ?? ""}</span>
                      <button type="button" className="underline" onClick={() => setEditing(d)}>
                        Edit
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-sand">No dishes yet.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DishForm({ initial, categories, onClose, reload }: { initial: Dish; categories: MenuCategory[]; onClose: () => void; reload: () => Promise<void> }) {
  const [d, setD] = useState<Dish>(initial);
  const [ingredients, setIngredients] = useState(listToText(initial.ingredients));
  const [price, setPrice] = useState(initial.price == null ? "" : String(initial.price));
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const set = <K extends keyof Dish>(key: K, value: Dish[K]) => setD((prev) => ({ ...prev, [key]: value }));

  async function save(event: FormEvent) {
    event.preventDefault();
    const res = await adminSaveDish({
      data: {
        id: d.id || undefined,
        name: d.name,
        description: d.description,
        price: price.trim() === "" ? null : Math.round(Number(price)),
        category: d.category,
        origin: d.origin,
        influence: d.influence,
        ingredients: textToList(ingredients),
        technique: d.technique,
        story: d.story,
        image: d.image,
        imageAlt: d.imageAlt,
        gallery: d.gallery,
        dietary: d.dietary as (typeof DIETARY)[number][],
        spiceLevel: d.spiceLevel,
        chefRecommendation: d.chefRecommendation,
        isNew: d.isNew,
        soldOut: d.soldOut,
        pairing: d.pairing,
        featured: d.featured,
        published: d.published,
        sort: d.sort,
      },
    });
    if (res.ok) {
      setD((prev) => ({ ...prev, id: res.data.id, slug: res.data.slug }));
      setMsg({ kind: "ok", text: "Saved. The menu is updated." });
      await reload();
    } else setMsg({ kind: "error", text: res.message });
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">{initial.id ? `Edit ${initial.name}` : "Add a dish"}</h1>
        <button type="button" onClick={onClose} className="text-sm underline">
          Back to dishes
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Dish name">
          <input className="sm-input" required value={d.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Course">
          <select className="sm-input" value={d.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price (₹)" hint="Leave empty to hide the price.">
          <input className="sm-input" inputMode="numeric" pattern="\d*" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Order in course" hint="Lower numbers show first.">
          <input className="sm-input" type="number" min={0} value={d.sort} onChange={(e) => set("sort", Number(e.target.value))} />
        </Field>
        <Field label="Origin" hint="For example: Coastal India">
          <input className="sm-input" value={d.origin} onChange={(e) => set("origin", e.target.value)} />
        </Field>
        <Field label="Influence" hint="For example: Portuguese and coastal">
          <input className="sm-input" value={d.influence} onChange={(e) => set("influence", e.target.value)} />
        </Field>
        <Field label="Cooking technique" hint="For example: Wood fire and claypot">
          <input className="sm-input" value={d.technique} onChange={(e) => set("technique", e.target.value)} />
        </Field>
        <Field label="Recommended pairing">
          <input className="sm-input" value={d.pairing} onChange={(e) => set("pairing", e.target.value)} />
        </Field>
      </div>
      <Field label="Short description">
        <textarea className="sm-input" rows={2} value={d.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <Field label="Ingredients" hint="Separate with commas: crab, coconut, kokum, curry leaves">
        <input className="sm-input" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
      </Field>
      <Field label="The story" hint="A few sentences about where the dish comes from. Leave a blank line between paragraphs.">
        <textarea className="sm-input" rows={5} value={d.story} onChange={(e) => set("story", e.target.value)} />
      </Field>
      <div className="grid gap-6 md:grid-cols-2">
        <PhotoField label="Main photo" value={d.image} onChange={(v) => set("image", v)} />
        <Field label="Photo description" hint="Describe the photo for people who can't see it.">
          <input className="sm-input" value={d.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} />
        </Field>
      </div>
      <div>
        <span className="sm-label block">Gallery</span>
        <div className="mt-3 flex flex-wrap gap-4">
          {d.gallery.map((src) => (
            <button key={src} type="button" onClick={() => set("gallery", d.gallery.filter((g) => g !== src))} title="Remove from gallery">
              <img src={src} alt="Gallery photo, select to remove" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
        <div className="mt-3">
          <PhotoField label="Add to gallery" value="" onChange={(v) => v && set("gallery", [...d.gallery, v])} />
        </div>
      </div>
      <fieldset>
        <legend className="sm-label">Dietary</legend>
        <div className="mt-3 flex flex-wrap gap-4">
          {DIETARY.map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={d.dietary.includes(tag)}
                onChange={(e) => set("dietary", e.target.checked ? [...d.dietary, tag] : d.dietary.filter((t) => t !== tag))}
              />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-6 md:grid-cols-4">
        <Field label="Spice level">
          <select className="sm-input" value={d.spiceLevel} onChange={(e) => set("spiceLevel", Number(e.target.value))}>
            <option value={0}>Not shown</option>
            <option value={1}>Warm</option>
            <option value={2}>Spiced</option>
            <option value={3}>Fiery</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm md:pt-7">
          <input type="checkbox" checked={d.chefRecommendation} onChange={(e) => set("chefRecommendation", e.target.checked)} />
          Chef&rsquo;s special
        </label>
        <label className="flex items-center gap-2 text-sm md:pt-7">
          <input type="checkbox" checked={d.isNew} onChange={(e) => set("isNew", e.target.checked)} />
          New on the menu
        </label>
        <label className="flex items-center gap-2 text-sm md:pt-7">
          <input type="checkbox" checked={d.soldOut} onChange={(e) => set("soldOut", e.target.checked)} />
          Sold out today
        </label>
        <label className="flex items-center gap-2 text-sm md:pt-7">
          <input type="checkbox" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} />
          Show on home page
        </label>
        <label className="flex items-center gap-2 text-sm md:pt-7">
          <input type="checkbox" checked={d.published} onChange={(e) => set("published", e.target.checked)} />
          Visible on the menu
        </label>
      </div>
      <Notice message={msg} />
      <div className="flex flex-wrap gap-4">
        <button type="submit" className="adm-btn">
          Save dish
        </button>
        {d.id ? (
          <button
            type="button"
            className="adm-btn adm-btn--quiet"
            onClick={async () => {
              if (!window.confirm(`Delete ${d.name}? This cannot be undone.`)) return;
              const res = await adminDelete({ data: { table: "dishes", id: d.id } });
              if (res.ok) {
                await reload();
                onClose();
              } else setMsg({ kind: "error", text: res.message });
            }}
          >
            Delete dish
          </button>
        ) : null}
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- courses (categories) */

function Courses({ categories, reload }: { categories: MenuCategory[]; reload: () => Promise<void> }) {
  const [editing, setEditing] = useState<MenuCategory | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  if (editing) {
    const c = editing;
    const set = <K extends keyof MenuCategory>(key: K, value: MenuCategory[K]) => setEditing({ ...c, [key]: value });
    return (
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const res = await adminSaveCategory({ data: c });
          if (res.ok) {
            setMsg({ kind: "ok", text: "Saved." });
            await reload();
          } else setMsg({ kind: "error", text: res.message });
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">Edit course</h1>
          <button type="button" onClick={() => setEditing(null)} className="text-sm underline">
            Back to courses
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Title">
            <input className="sm-input" required value={c.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <input className="sm-input" value={c.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </Field>
          <Field label="Mood colour">
            <select className="sm-input" value={c.mood} onChange={(e) => set("mood", e.target.value as MenuCategory["mood"])}>
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Order">
            <input className="sm-input" type="number" min={0} value={c.sort} onChange={(e) => set("sort", Number(e.target.value))} />
          </Field>
        </div>
        <Field label="Story">
          <textarea className="sm-input" rows={3} value={c.story} onChange={(e) => set("story", e.target.value)} />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <PhotoField label="Photo" value={c.image} onChange={(v) => set("image", v)} />
          <Field label="Photo description">
            <input className="sm-input" value={c.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} />
          </Field>
        </div>
        <Notice message={msg} />
        <button type="submit" className="adm-btn">
          Save course
        </button>
      </form>
    );
  }
  return (
    <div>
      <h1 className="font-display text-2xl">Menu courses</h1>
      <p className="mt-2 text-sm text-sand">The eight chapters of the menu. Edit their words, colours and photos.</p>
      <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
        {categories.map((c) => (
          <li key={c.slug} className="flex items-center justify-between gap-4 py-3">
            <span className="flex items-center gap-3">
              <img src={c.image} alt="" className="h-10 w-10 object-cover" />
              {c.title}
            </span>
            <button type="button" className="text-sm underline" onClick={() => setEditing(c)}>
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- journal */

const today = () => new Date().toISOString().slice(0, 10);

function Journal({ posts, reload }: { posts: JournalPost[]; reload: () => Promise<void> }) {
  const [editing, setEditing] = useState<JournalPost | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  if (editing) {
    const p = editing;
    const set = <K extends keyof JournalPost>(key: K, value: JournalPost[K]) => setEditing({ ...p, [key]: value });
    return (
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const res = await adminSavePost({
            data: {
              id: p.id || undefined,
              title: p.title,
              category: p.category,
              excerpt: p.excerpt,
              cover: p.cover,
              coverAlt: p.coverAlt,
              body: p.body,
              author: p.author,
              publishedAt: p.publishedAt,
              published: p.published,
            },
          });
          if (res.ok) {
            setEditing({ ...p, id: res.data.id, slug: res.data.slug });
            setMsg({ kind: "ok", text: "Saved." });
            await reload();
          } else setMsg({ kind: "error", text: res.message });
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">{p.id ? "Edit story" : "New story"}</h1>
          <button type="button" onClick={() => setEditing(null)} className="text-sm underline">
            Back to journal
          </button>
        </div>
        <Field label="Title">
          <input className="sm-input" required value={p.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <div className="grid gap-6 md:grid-cols-3">
          <Field label="Section">
            <select className="sm-input" value={p.category} onChange={(e) => set("category", e.target.value as JournalPost["category"])}>
              {JOURNAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input className="sm-input" type="date" value={p.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
          </Field>
          <Field label="Author">
            <input className="sm-input" value={p.author} onChange={(e) => set("author", e.target.value)} />
          </Field>
        </div>
        <Field label="Short summary">
          <textarea className="sm-input" rows={2} value={p.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <PhotoField label="Cover photo" value={p.cover} onChange={(v) => set("cover", v)} />
          <Field label="Photo description">
            <input className="sm-input" value={p.coverAlt} onChange={(e) => set("coverAlt", e.target.value)} />
          </Field>
        </div>
        <Field label="Story" hint='Blank line between paragraphs. Start a line with "## " for a heading or "> " for a quote.'>
          <textarea className="sm-input font-body" rows={16} value={p.body} onChange={(e) => set("body", e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p.published} onChange={(e) => set("published", e.target.checked)} />
          Published
        </label>
        <Notice message={msg} />
        <div className="flex flex-wrap gap-4">
          <button type="submit" className="adm-btn">
            Save story
          </button>
          {p.id ? (
            <button
              type="button"
              className="adm-btn adm-btn--quiet"
              onClick={async () => {
                if (!window.confirm("Delete this story? This cannot be undone.")) return;
                const res = await adminDelete({ data: { table: "journal_posts", id: p.id } });
                if (res.ok) {
                  await reload();
                  setEditing(null);
                } else setMsg({ kind: "error", text: res.message });
              }}
            >
              Delete story
            </button>
          ) : null}
        </div>
      </form>
    );
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl">Kitchen journal</h1>
        <button
          type="button"
          className="adm-btn"
          onClick={() =>
            setEditing({
              id: "",
              slug: "",
              title: "",
              category: "The story",
              excerpt: "",
              cover: "",
              coverAlt: "",
              body: "",
              author: "The Sal Marinho kitchen",
              publishedAt: today(),
              published: true,
            })
          }
        >
          New story
        </button>
      </div>
      <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 py-3">
            <span>
              {p.title}
              {!p.published ? <span className="ml-2 text-xs text-clay">Draft</span> : null}
            </span>
            <button type="button" className="text-sm underline" onClick={() => setEditing(p)}>
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- events */

function Events({ events, reload }: { events: EventItem[]; reload: () => Promise<void> }) {
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  if (editing) {
    const e = editing;
    const set = <K extends keyof EventItem>(key: K, value: EventItem[K]) => setEditing({ ...e, [key]: value });
    return (
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const res = await adminSaveEvent({ data: { ...e, id: e.id || undefined } });
          if (res.ok) {
            setEditing({ ...e, id: res.data.id });
            setMsg({ kind: "ok", text: "Saved." });
            await reload();
          } else setMsg({ kind: "error", text: res.message });
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">{e.id ? "Edit event" : "New event"}</h1>
          <button type="button" onClick={() => setEditing(null)} className="text-sm underline">
            Back to events
          </button>
        </div>
        <Field label="Title">
          <input className="sm-input" required value={e.title} onChange={(ev) => set("title", ev.target.value)} />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Date">
            <input className="sm-input" type="date" required value={e.date} onChange={(ev) => set("date", ev.target.value)} />
          </Field>
          <Field label="Time" hint="For example: 7.30 pm">
            <input className="sm-input" value={e.time} onChange={(ev) => set("time", ev.target.value)} />
          </Field>
        </div>
        <Field label="Description">
          <textarea className="sm-input" rows={3} value={e.description} onChange={(ev) => set("description", ev.target.value)} />
        </Field>
        <PhotoField label="Photo" value={e.image} onChange={(v) => set("image", v)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={e.published} onChange={(ev) => set("published", ev.target.checked)} />
          Show on the Visit page
        </label>
        <Notice message={msg} />
        <div className="flex flex-wrap gap-4">
          <button type="submit" className="adm-btn">
            Save event
          </button>
          {e.id ? (
            <button
              type="button"
              className="adm-btn adm-btn--quiet"
              onClick={async () => {
                if (!window.confirm("Delete this event?")) return;
                const res = await adminDelete({ data: { table: "events", id: e.id } });
                if (res.ok) {
                  await reload();
                  setEditing(null);
                } else setMsg({ kind: "error", text: res.message });
              }}
            >
              Delete event
            </button>
          ) : null}
        </div>
      </form>
    );
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl">Events</h1>
        <button
          type="button"
          className="adm-btn"
          onClick={() => setEditing({ id: "", title: "", date: today(), time: "", description: "", image: "", published: true })}
        >
          New event
        </button>
      </div>
      {events.length ? (
        <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-4 py-3">
              <span>
                {e.date} · {e.title}
              </span>
              <button type="button" className="text-sm underline" onClick={() => setEditing(e)}>
                Edit
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-sand">No events yet. Upcoming events appear on the Visit page.</p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- settings */

/* ---------------------------------------------------------------- event enquiries */

function Enquiries({ items, reload }: { items: EventEnquiry[]; reload: () => Promise<void> }) {
  if (!items.length) return <p className="text-sand">No event enquiries yet. They arrive here from the Events page.</p>;
  return (
    <div>
      <h1 className="font-display text-2xl">Event enquiries</h1>
      <p className="mt-2 text-sm text-sand">Reply by email or phone, then mark each enquiry.</p>
      <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
        {items.map((q) => (
          <li key={q.id} className="grid gap-3 py-5 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-lg">
                {q.name} · {q.eventType} · {q.guests} {q.guests === 1 ? "guest" : "guests"}
              </p>
              <p className="text-sm text-sand">
                {q.eventDate} · {q.location}
              </p>
              <p className="text-sm text-sand">
                <a className="underline" href={`mailto:${q.email}`}>
                  {q.email}
                </a>{" "}
                ·{" "}
                <a className="underline" href={`tel:${q.phone.replace(/\s/g, "")}`}>
                  {q.phone}
                </a>
              </p>
              <p className="mt-2 max-w-2xl whitespace-pre-line text-sm text-bone/90">{q.message}</p>
              <p className="mt-1 text-xs text-sand/70">Received {q.createdAt}</p>
            </div>
            <div className="flex gap-2">
              {(["new", "replied", "closed"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  aria-pressed={q.status === st}
                  className="adm-chip"
                  onClick={async () => {
                    await adminSetEnquiry({ data: { id: q.id, status: st } });
                    await reload();
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- events page */

function EventsPage({ settings, reload }: { settings: SiteSettings; reload: () => Promise<void> }) {
  const [ev, setEv] = useState<EventsSettings>(settings.events);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const setCat = <K extends keyof EventCategory>(i: number, key: K, value: EventCategory[K]) =>
    setEv((prev) => ({ ...prev, categories: prev.categories.map((c, j) => (j === i ? { ...c, [key]: value } : c)) }));
  const setPhoto = <K extends keyof EventPhoto>(i: number, key: K, value: EventPhoto[K]) =>
    setEv((prev) => ({ ...prev, gallery: prev.gallery.map((p, j) => (j === i ? { ...p, [key]: value } : p)) }));
  return (
    <form
      className="space-y-8"
      onSubmit={async (event) => {
        event.preventDefault();
        const res = await adminSaveSettings({ data: { ...settings, events: ev } });
        if (res.ok) {
          setMsg({ kind: "ok", text: "Saved. The Events page is updated." });
          await reload();
        } else setMsg({ kind: "error", text: res.message });
      }}
    >
      <div>
        <h1 className="font-display text-2xl">Events page</h1>
        <p className="mt-2 text-sm text-sand">
          The kinds of event, the gallery and where enquiries can also reach you. Enquiries from the form arrive under Event
          enquiries. Describe only what the team offers; the starting text is a suggestion to confirm.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Events email" hint="Shown beside the form. Leave empty to use the restaurant email.">
          <input className="sm-input" type="email" value={ev.enquiryEmail} onChange={(e) => setEv({ ...ev, enquiryEmail: e.target.value })} />
        </Field>
        <Field label="Events WhatsApp" hint="With country code. Leave empty to use the restaurant number.">
          <input className="sm-input" type="tel" value={ev.enquiryWhatsapp} onChange={(e) => setEv({ ...ev, enquiryWhatsapp: e.target.value })} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={ev.illustrative} onChange={(e) => setEv({ ...ev, illustrative: e.target.checked })} />
        Label the event pictures as illustrative (untick once they are photographs of real Sal Marinho events)
      </label>
      <fieldset className="space-y-6">
        <legend className="sm-label">Kinds of event</legend>
        {ev.categories.map((c, i) => (
          <div key={i} className="space-y-4 border border-hairline p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <input className="sm-input" required value={c.title} onChange={(e) => setCat(i, "title", e.target.value)} />
              </Field>
              <Field label="Short line">
                <input className="sm-input" value={c.line} onChange={(e) => setCat(i, "line", e.target.value)} />
              </Field>
            </div>
            <Field label="Description">
              <textarea className="sm-input" rows={2} value={c.body} onChange={(e) => setCat(i, "body", e.target.value)} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <PhotoField label="Photo" value={c.image} onChange={(v) => setCat(i, "image", v)} />
              <Field label="Photo description" hint="Read aloud by screen readers.">
                <input className="sm-input" value={c.imageAlt} onChange={(e) => setCat(i, "imageAlt", e.target.value)} />
              </Field>
            </div>
          </div>
        ))}
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="sm-label">Gallery</legend>
        {ev.gallery.map((p, i) => (
          <div key={i} className="grid items-end gap-4 border border-hairline p-4 md:grid-cols-[auto_1fr_1fr_auto]">
            <img src={p.src} alt="" className="h-16 w-24 object-cover" />
            <Field label="Caption">
              <input className="sm-input" value={p.caption} onChange={(e) => setPhoto(i, "caption", e.target.value)} />
            </Field>
            <Field label="Photo description">
              <input className="sm-input" value={p.alt} onChange={(e) => setPhoto(i, "alt", e.target.value)} />
            </Field>
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.illustrative} onChange={(e) => setPhoto(i, "illustrative", e.target.checked)} />
                Illustrative
              </label>
              <button type="button" className="text-left underline" onClick={() => setEv({ ...ev, gallery: ev.gallery.filter((_, j) => j !== i) })}>
                Remove
              </button>
            </div>
          </div>
        ))}
        <PhotoField
          label="Add a gallery photo"
          value=""
          onChange={(v) => v && setEv({ ...ev, gallery: [...ev.gallery, { src: v, alt: "", caption: "", illustrative: false }] })}
        />
      </fieldset>
      <Notice message={msg} />
      <button type="submit" className="adm-btn">
        Save the Events page
      </button>
    </form>
  );
}

/* ---------------------------------------------------------------- crab journey */

function CrabJourney({ settings, reload }: { settings: SiteSettings; reload: () => Promise<void> }) {
  const [status, setStatus] = useState(settings.crabStatus);
  const [stages, setStages] = useState<CrabStage[]>(settings.crabStages);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const setStage = <K extends keyof CrabStage>(i: number, key: K, value: CrabStage[K]) =>
    setStages((prev) => prev.map((s, j) => (j === i ? { ...s, [key]: value } : s)));
  return (
    <form
      className="space-y-8"
      onSubmit={async (event) => {
        event.preventDefault();
        const res = await adminSaveSettings({ data: { ...settings, crabStatus: status, crabStages: stages } });
        if (res.ok) {
          setMsg({ kind: "ok", text: "Saved. The crab journey is updated." });
          await reload();
        } else setMsg({ kind: "error", text: res.message });
      }}
    >
      <div>
        <h1 className="font-display text-2xl">Crab journey</h1>
        <p className="mt-2 text-sm text-sand">
          The story on the crab journey page and the Something is growing section of the home page. Post progress updates in the
          Journal under &ldquo;The crab&rdquo;; they appear on the crab journey page as field notes.
        </p>
      </div>
      <fieldset className="space-y-3 border border-hairline p-4">
        <legend className="sm-label px-2">Status</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="crab-status" checked={status === "coming-soon"} onChange={() => setStatus("coming-soon")} />
          Coming soon: the crab is not on the menu yet
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="crab-status" checked={status === "now-serving"} onChange={() => setStatus("now-serving")} />
          Now serving: the crab experience has launched
        </label>
      </fieldset>
      <ol className="space-y-6">
        {stages.map((s, i) => (
          <li key={i} className="space-y-4 border border-hairline p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="sm-label">Step {String(i + 1).padStart(2, "0")}</p>
              <label className="flex items-center gap-2 text-sm">
                Shown as
                <select className="sm-input w-auto" value={s.status} onChange={(e) => setStage(i, "status", e.target.value as CrabStage["status"])}>
                  <option value="now">Happening now</option>
                  <option value="soon">Coming soon</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <input className="sm-input" required value={s.title} onChange={(e) => setStage(i, "title", e.target.value)} />
              </Field>
              <Field label="Short line">
                <input className="sm-input" value={s.note} onChange={(e) => setStage(i, "note", e.target.value)} />
              </Field>
            </div>
            <Field label="Text">
              <textarea className="sm-input" rows={3} value={s.body} onChange={(e) => setStage(i, "body", e.target.value)} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <PhotoField label="Photo" value={s.image} onChange={(v) => setStage(i, "image", v)} />
              <Field label="Photo description" hint="Read aloud by screen readers.">
                <input className="sm-input" value={s.imageAlt} onChange={(e) => setStage(i, "imageAlt", e.target.value)} />
              </Field>
            </div>
          </li>
        ))}
      </ol>
      <Notice message={msg} />
      <button type="submit" className="adm-btn">
        Save the crab journey
      </button>
    </form>
  );
}

function Settings({ settings, reload }: { settings: SiteSettings; reload: () => Promise<void> }) {
  const [s, setS] = useState<SiteSettings>(settings);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => setS((prev) => ({ ...prev, [key]: value }));
  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const res = await adminSaveSettings({ data: s });
        if (res.ok) {
          setMsg({ kind: "ok", text: "Saved. The site now shows these details." });
          await reload();
        } else setMsg({ kind: "error", text: res.message });
      }}
    >
      <h1 className="font-display text-2xl">Restaurant details</h1>
      <p className="text-sm text-sand">Anything left empty stays hidden on the site.</p>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Street address">
          <textarea className="sm-input" rows={2} value={s.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="Area">
          <input className="sm-input" required value={s.locality} onChange={(e) => set("locality", e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className="sm-input" type="tel" value={s.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="WhatsApp number" hint="With country code, for example +91 98765 43210. Used to confirm reservations.">
          <input className="sm-input" type="tel" value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label="Email">
          <input className="sm-input" type="email" value={s.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Google Maps link">
          <input className="sm-input" type="url" value={s.mapsUrl} onChange={(e) => set("mapsUrl", e.target.value)} />
        </Field>
        <Field label="Latitude" hint="Optional, for search engines. For example 15.5889">
          <input className="sm-input" value={s.latitude} onChange={(e) => set("latitude", e.target.value)} />
        </Field>
        <Field label="Longitude" hint="For example 73.7414">
          <input className="sm-input" value={s.longitude} onChange={(e) => set("longitude", e.target.value)} />
        </Field>
        <Field label="Instagram link">
          <input className="sm-input" type="url" value={s.instagram} onChange={(e) => set("instagram", e.target.value)} />
        </Field>
        <Field label="Facebook link">
          <input className="sm-input" type="url" value={s.facebook} onChange={(e) => set("facebook", e.target.value)} />
        </Field>
        <Field label="Booking page link" hint="Optional. If set, guests finish their booking there.">
          <input className="sm-input" type="url" value={s.reservationUrl} onChange={(e) => set("reservationUrl", e.target.value)} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={s.showPrices} onChange={(e) => set("showPrices", e.target.checked)} />
        Show prices on the website (menu, breakfast page and home page). Prices stay saved here either way.
      </label>
      <Field label="Parking">
        <textarea className="sm-input" rows={2} value={s.parking} onChange={(e) => set("parking", e.target.value)} />
      </Field>
      <fieldset>
        <legend className="sm-label">Opening hours</legend>
        <div className="mt-3 space-y-3">
          {s.hours.map((h, i) => (
            <div key={i} className="grid grid-cols-[1fr_6rem_6rem_auto] items-end gap-3">
              <input
                className="sm-input"
                aria-label="Days"
                placeholder="Mon to Sun"
                value={h.days}
                onChange={(e) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, days: e.target.value } : x)))}
              />
              <input
                className="sm-input"
                aria-label="Opens"
                placeholder="12:00"
                value={h.open}
                onChange={(e) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)))}
              />
              <input
                className="sm-input"
                aria-label="Closes"
                placeholder="23:00"
                value={h.close}
                onChange={(e) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)))}
              />
              <button type="button" className="text-sm underline" onClick={() => set("hours", s.hours.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="text-sm underline" onClick={() => set("hours", [...s.hours, { days: "", open: "", close: "" }])}>
            Add opening hours
          </button>
        </div>
      </fieldset>
      <div>
        <span className="sm-label block">Restaurant photos (home page gallery, 3 to 5 photos)</span>
        <div className="mt-3 flex flex-wrap gap-4">
          {s.gallery.map((src) => (
            <button key={src} type="button" onClick={() => set("gallery", s.gallery.filter((g) => g !== src))} title="Remove photo">
              <img src={src} alt="Restaurant photo, select to remove" className="h-20 w-20 object-cover" />
            </button>
          ))}
        </div>
        <div className="mt-3">
          <PhotoField label="Add a restaurant photo" value="" onChange={(v) => v && set("gallery", [...s.gallery, v])} />
        </div>
      </div>
      <Notice message={msg} />
      <button type="submit" className="adm-btn">
        Save details
      </button>
    </form>
  );
}

/* ---------------------------------------------------------------- password */

function Password() {
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  return (
    <form
      className="max-w-sm space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const formEl = event.currentTarget;
        const form = new FormData(formEl);
        const res = await adminChangePassword({
          data: { current: String(form.get("current") ?? ""), next: String(form.get("next") ?? "") },
        });
        if (res.ok) {
          setMsg({ kind: "ok", text: "Password changed. Other devices have been signed out." });
          formEl.reset();
        } else setMsg({ kind: "error", text: res.message });
      }}
    >
      <h1 className="font-display text-2xl">Change password</h1>
      <Field label="Current password">
        <input className="sm-input" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="New password" hint="At least 10 characters.">
        <input className="sm-input" name="next" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <Notice message={msg} />
      <button type="submit" className="adm-btn">
        Change password
      </button>
    </form>
  );
}
