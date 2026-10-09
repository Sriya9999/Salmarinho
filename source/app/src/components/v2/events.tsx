// Sal Marinho Events: premium experiences across Goa. The home-page teaser and
// the pieces of /events, in page order.
import { Link } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";

import { Reveal } from "@/components/v2/kit";
import type { EventCategory, EventPhoto, EventsSettings, SiteSettings } from "@/lib/content/types";
import { enquirySchema, type EnquiryInput } from "@/lib/enquiry-schema";
import { submitEnquiry } from "@/lib/enquiry.functions";
import { prefersReducedMotion, watchScrollProgress } from "@/lib/motion";
import { EVENT_TYPES } from "@/lib/site";

/** The brand statement, word for word. */
export const EVENTS_STATEMENT =
  "We create premium experiences across Goa for Villas, Yachts, Beach & Poolside Events, Birthdays, Corporate Events & Private Celebrations";

const ev = (name: string) => `/assets/v2/events/${name}.webp`;

function IllustrativeTag() {
  return <span className="v-ev-tag">Illustrative image</span>;
}

/* ------------------------------------------------------------------ home: made for moments */

const TEASER = [
  { src: ev("villa"), alt: "A villa dinner table at dusk" },
  { src: ev("yacht"), alt: "A table on a yacht deck at golden hour" },
  { src: ev("beach"), alt: "Lanterns on a beach table at sunset" },
  { src: ev("private"), alt: "A candlelit garden dinner" },
];

export function EventsTeaser() {
  return (
    <section id="events" className="v-ev-teaser" data-sound="events" aria-labelledby="events-teaser-title">
      <div className="v-ev-teaser__frames" aria-hidden="true">
        {TEASER.map((t, i) => (
          <img key={t.src} src={t.src} alt="" loading="lazy" decoding="async" style={{ "--i": i } as CSSProperties} />
        ))}
      </div>
      <div className="v-ev-teaser__shade" aria-hidden="true" />
      <div className="v-wrap relative grid min-h-[92svh] content-end gap-8 pb-[clamp(3rem,8vw,6rem)] pt-32 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="v-kicker">Sal Marinho Events</p>
          <h2 id="events-teaser-title" className="v-title mt-5">
            Made for moments <em>worth gathering for.</em>
          </h2>
          <p className="v-lede mt-6 max-w-xl">{EVENTS_STATEMENT}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link to="/events" className="sm-ember-pill">
              <span className="sm-ember-pill__coal" aria-hidden="true" />
              <span className="relative">Discover Sal Marinho Events</span>
            </Link>
          </div>
          <p className="v-ev-teaser__note mt-6">Illustrative images</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ events: opening */

export function EventsHero({ events }: { events: EventsSettings }) {
  const frames = events.gallery.length ? events.gallery.slice(0, 5) : [];
  return (
    <section className="v-ev-hero" data-sound="events" aria-labelledby="events-title">
      <div className="v-ev-hero__frames" aria-hidden="true">
        {frames.map((f, i) => (
          <img key={f.src} src={f.src} alt="" decoding="async" fetchPriority={i === 0 ? "high" : undefined} style={{ "--i": i } as CSSProperties} />
        ))}
      </div>
      <div className="v-ev-hero__light" aria-hidden="true" />
      <div className="v-ev-hero__shade" aria-hidden="true" />
      <div className="v-wrap v-ev-hero__copy">
        <p className="v-kicker">Sal Marinho Events &middot; Across Goa</p>
        <h1 id="events-title" className="v-ev-hero__title mt-6">
          Extraordinary moments, <em>the Sal Marinho way.</em>
        </h1>
        <p className="v-lede mt-7 max-w-2xl">{EVENTS_STATEMENT}</p>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a href="#plan-your-event" className="sm-ember-pill">
            <span className="sm-ember-pill__coal" aria-hidden="true" />
            <span className="relative">Plan your event</span>
          </a>
          <a href="#settings" className="v-contour-link">
            See the settings
            <svg viewBox="0 0 260 8" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 4 C 30 0, 50 8, 80 4 S 130 0, 160 4 S 220 8, 260 3" />
            </svg>
          </a>
        </div>
        {events.illustrative ? <p className="v-ev-hero__note mt-8">Images are illustrative of the settings we work in.</p> : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ events: the settings, by scroll */

const SETTINGS_JOURNEY = [
  { src: ev("villa"), alt: "A villa's warm interior with a long table set for dinner", kicker: "Inside", line: "A villa's warm interior, the table set and the candles lit." },
  { src: ev("terrace"), alt: "An open terrace under lanterns at blue hour", kicker: "Open air", line: "The doors open onto a terrace, and the evening comes in." },
  { src: ev("yacht"), alt: "A table on a yacht deck at golden hour", kicker: "On the water", line: "The terrace gives way to the water: a deck, a horizon, a slow sunset." },
  { src: ev("poolside"), alt: "A pool glowing at dusk with floating candles", kicker: "Water and light", line: "Water and light become a beach, or a pool lit from below." },
  { src: ev("private"), alt: "A candlelit table in a tropical garden at night", kicker: "Candlelight", line: "And the evening settles into a candlelit celebration." },
];

export function SettingsJourney({ illustrative }: { illustrative: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    return watchScrollProgress(el, () => {
      const rect = el.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / range));
      el.style.setProperty("--p", p.toFixed(4));
      setActive(Math.min(SETTINGS_JOURNEY.length - 1, Math.round(p * (SETTINGS_JOURNEY.length - 1))));
    });
  }, []);
  return (
    <section
      ref={ref}
      id="settings"
      className="v-ev-journey"
      data-sound="events"
      aria-labelledby="settings-title"
      style={{ "--n": SETTINGS_JOURNEY.length } as CSSProperties}
    >
      <div className="v-ev-journey__stage">
        {SETTINGS_JOURNEY.map((s, i) => (
          <div key={s.src} className="v-ev-journey__layer" style={{ "--i": i } as CSSProperties} data-active={active === i}>
            <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
          </div>
        ))}
        <div className="v-ev-journey__shade" aria-hidden="true" />
        <div className="v-ev-journey__ripple" aria-hidden="true" />
        <div className="v-wrap v-ev-journey__copy">
          <h2 id="settings-title" className="v-title v-title--md max-w-[14ch]">
            One way of hosting, <em>many settings.</em>
          </h2>
          <ol className="v-ev-journey__lines">
            {SETTINGS_JOURNEY.map((s, i) => (
              <li key={s.kicker} data-active={active === i}>
                <span className="v-ev-journey__kicker">{s.kicker}</span>
                <span className="v-ev-journey__line">{s.line}</span>
              </li>
            ))}
          </ol>
          {illustrative ? <IllustrativeTag /> : null}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ events: the six kinds of event */

export function EventCategories({ categories, illustrative, onPlan }: { categories: EventCategory[]; illustrative: boolean; onPlan: (type: string) => void }) {
  return (
    <section className="v-sec" data-sound="events" aria-labelledby="categories-title">
      <div className="v-wrap">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="v-kicker">What we host</p>
            <h2 id="categories-title" className="v-title mt-5">
              Wherever the <em>occasion is.</em>
            </h2>
          </div>
          <p className="v-lede self-end md:col-span-5">
            Six kinds of gathering, each shaped around the place, the guests and the feeling you want. Tell us what you have in
            mind and we will shape the details with you.
          </p>
        </div>
        <ul className="v-ev-cards mt-14">
          {categories.map((c, i) => (
            <li key={c.slug} className="v-ev-card" style={{ "--d": `${(i % 3) * 90}ms` } as CSSProperties}>
              <div className="v-ev-card__media">
                {c.image ? <Reveal src={c.image} alt={c.imageAlt} className="v-ev-card__img" sizes="(min-width: 900px) 33vw, 92vw" /> : <div className="v-ev-card__img v-ev-card__img--empty" />}
                {illustrative && c.image ? <IllustrativeTag /> : null}
              </div>
              <p className="v-ev-card__num">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="v-ev-card__title">{c.title}</h3>
              {c.line ? <p className="v-ev-card__line">{c.line}</p> : null}
              <p className="v-ev-card__body">{c.body}</p>
              <button type="button" className="v-ev-card__plan" onClick={() => onPlan(typeFor(c.slug))}>
                Plan {articleFor(c.title)} <span aria-hidden="true">&rarr;</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Card to enquiry-form event type.
const TYPE_BY_SLUG: Record<string, (typeof EVENT_TYPES)[number]> = {
  villas: "Villa",
  yachts: "Yacht",
  "beach-and-poolside": "Beach or poolside",
  birthdays: "Birthday",
  corporate: "Corporate",
  "private-celebrations": "Private celebration",
};
const typeFor = (slug: string) => TYPE_BY_SLUG[slug] ?? "Something else";
const articleFor = (title: string) => {
  const t = title.toLowerCase().replace(/ events$/, " event").replace(/s$/, "");
  return /^[aeiou]/.test(t) ? `an ${t}` : `a ${t}`;
};

/* ------------------------------------------------------------------ events: gallery */

export function EventGallery({ photos }: { photos: EventPhoto[] }) {
  const list = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const titleId = useId();

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setIndex(items.indexOf(entry.target as HTMLElement));
      },
      { root: el, threshold: 0.6 },
    );
    for (const item of items) io.observe(item);
    return () => io.disconnect();
  }, [photos.length]);

  const go = (to: number) => {
    const el = list.current;
    const next = Math.max(0, Math.min(photos.length - 1, to));
    const item = el?.children[next] as HTMLElement | undefined;
    if (!el || !item) return;
    el.scrollTo({ left: item.offsetLeft - el.offsetLeft, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  const onKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    }
  };

  if (!photos.length) return null;
  return (
    <section className="v-sec pt-0" data-sound="events" aria-labelledby={titleId}>
      <div className="v-wrap flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="v-kicker">Gallery</p>
          <h2 id={titleId} className="v-title v-title--md mt-5">
            The feeling <em>we design for.</em>
          </h2>
        </div>
        <div className="v-ev-gallery__controls">
          <span className="v-ev-gallery__count" aria-live="polite">
            {index + 1} / {photos.length}
          </span>
          <button type="button" className="v-ev-gallery__btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous picture">
            <span aria-hidden="true">&larr;</span>
          </button>
          <button type="button" className="v-ev-gallery__btn" onClick={() => go(index + 1)} disabled={index === photos.length - 1} aria-label="Next picture">
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
      <ul
        ref={list}
        className="v-ev-gallery mt-10"
        tabIndex={0}
        aria-label="Event pictures. Use the left and right arrow keys to move."
        onKeyDown={onKey}
      >
        {photos.map((p) => (
          <li key={p.src} className="v-ev-gallery__item">
            <figure>
              <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
              <figcaption>
                {p.caption}
                {p.illustrative ? <span className="v-ev-gallery__ill">Illustrative</span> : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ events: enquiry */

type Errors = Partial<Record<keyof EnquiryInput, string>>;
const FIELD_ORDER: (keyof EnquiryInput)[] = ["name", "email", "phone", "eventType", "eventDate", "location", "guests", "message"];

export function EnquiryForm({ settings, eventType, onEventType }: { settings: SiteSettings; eventType: string; onEventType: (v: string) => void }) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState<{ name: string; whatsapp: string | null } | null>(null);
  const email = settings.events.enquiryEmail || settings.email;
  const whatsapp = (settings.events.enquiryWhatsapp || settings.whatsapp).replace(/[^\d]/g, "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const guestsRaw = String(fd.get("guests") ?? "").trim();
    const input: EnquiryInput = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      eventType: String(fd.get("eventType") ?? "") as EnquiryInput["eventType"],
      eventDate: String(fd.get("eventDate") ?? ""),
      location: String(fd.get("location") ?? ""),
      guests: guestsRaw === "" ? Number.NaN : Number(guestsRaw),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    const parsed = enquirySchema.safeParse(input);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof EnquiryInput;
        if (!next[key]) next[key] = key === "guests" && Number.isNaN(input.guests) ? "Please add a rough guest count." : issue.message;
      }
      setErrors(next);
      const first = FIELD_ORDER.find((k) => next[k]);
      if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setFailure(null);
    setBusy(true);
    try {
      const res = await submitEnquiry({ data: parsed.data });
      if (res.ok) setSent({ name: parsed.data.name, whatsapp: res.whatsapp });
      else setFailure(res.message);
    } catch {
      setFailure("Your enquiry could not be sent. Please check your connection and try again.");
    }
    setBusy(false);
  }

  const err = (key: keyof EnquiryInput) =>
    errors[key] ? (
      <span id={`${id}-${key}-error`} className="v-ev-form__error">
        {errors[key]}
      </span>
    ) : null;
  const a11y = (key: keyof EnquiryInput) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
  });

  return (
    <section id="plan-your-event" className="v-ev-enquire" data-sound="events" aria-labelledby={`${id}-title`}>
      <div className="v-wrap grid gap-12 py-[clamp(5rem,10vw,9rem)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="v-kicker">Plan your event</p>
          <h2 id={`${id}-title`} className="v-title v-title--md mt-5">
            Let&rsquo;s create something <em>memorable.</em>
          </h2>
          <p className="v-lede mt-6">
            Tell us what you&rsquo;re celebrating, where it&rsquo;s happening and the kind of experience you have in mind.
          </p>
          {email || whatsapp ? (
            <dl className="v-detail-list mt-10">
              {email ? (
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${email}`}>{email}</a>
                  </dd>
                </div>
              ) : null}
              {whatsapp ? (
                <div>
                  <dt>WhatsApp</dt>
                  <dd>
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                      Message the events team
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>

        <div className="lg:col-span-7">
          {sent ? (
            <div className="v-ev-form__done" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
              <p className="v-kicker">Enquiry received</p>
              <p className="v-title v-title--sm mt-5">Thank you, {sent.name.split(" ")[0]}.</p>
              <p className="v-lede mt-5">
                Your enquiry is with the Sal Marinho events team. We will reply by email or phone to talk through the details.
              </p>
              {sent.whatsapp ? (
                <a href={sent.whatsapp} target="_blank" rel="noopener noreferrer" className="v-contour-link mt-8">
                  Continue on WhatsApp
                  <svg viewBox="0 0 260 8" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 4 C 30 0, 50 8, 80 4 S 130 0, 160 4 S 220 8, 260 3" />
                  </svg>
                </a>
              ) : null}
            </div>
          ) : (
            <form ref={form} className="v-ev-form" onSubmit={submit} noValidate>
              <div className="v-ev-form__grid">
                <label className="v-ev-form__field">
                  <span className="sm-label">Name</span>
                  <input name="name" type="text" autoComplete="name" maxLength={80} className="sm-input" {...a11y("name")} />
                  {err("name")}
                </label>
                <label className="v-ev-form__field">
                  <span className="sm-label">Email</span>
                  <input name="email" type="email" autoComplete="email" maxLength={120} className="sm-input" {...a11y("email")} />
                  {err("email")}
                </label>
                <label className="v-ev-form__field">
                  <span className="sm-label">Phone or WhatsApp</span>
                  <input name="phone" type="tel" autoComplete="tel" maxLength={24} className="sm-input" {...a11y("phone")} />
                  {err("phone")}
                </label>
                <label className="v-ev-form__field">
                  <span className="sm-label">Event type</span>
                  <select name="eventType" className="sm-input" value={eventType} onChange={(e) => onEventType(e.target.value)} {...a11y("eventType")}>
                    <option value="">Choose one</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {err("eventType")}
                </label>
                <label className="v-ev-form__field">
                  <span className="sm-label">Date or timeframe</span>
                  <input name="eventDate" type="text" maxLength={60} placeholder="14 December, or early January" className="sm-input" {...a11y("eventDate")} />
                  {err("eventDate")}
                </label>
                <label className="v-ev-form__field">
                  <span className="sm-label">Location</span>
                  <input name="location" type="text" maxLength={120} placeholder="A villa in Assagao, a yacht from Panjim" className="sm-input" {...a11y("location")} />
                  {err("location")}
                </label>
                <label className="v-ev-form__field">
                  <span className="sm-label">Approximate guests</span>
                  <input name="guests" type="number" inputMode="numeric" min={1} max={2000} className="sm-input" {...a11y("guests")} />
                  {err("guests")}
                </label>
              </div>
              <label className="v-ev-form__field mt-8 block">
                <span className="sm-label">About the event</span>
                <textarea name="message" rows={4} maxLength={1500} className="sm-input resize-y" {...a11y("message")} />
                {err("message")}
              </label>
              <div className="sr-only" aria-hidden="true">
                <label htmlFor={`${id}-website`}>Leave this field empty</label>
                <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              {failure ? (
                <p role="alert" className="mt-6 text-sm text-clay">
                  {failure}
                </p>
              ) : null}
              <button type="submit" className="sm-ember-pill mt-10" disabled={busy}>
                <span className="sm-ember-pill__coal" aria-hidden="true" />
                <span className="relative">{busy ? "Sending" : "Submit enquiry"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
