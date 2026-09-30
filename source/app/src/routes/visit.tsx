import { createFileRoute } from "@tanstack/react-router";

import { OrderChit, ViewfinderLink } from "@/components/cta/garments";
import { LetterBuild } from "@/components/motion/primitives";
import { Icon } from "@/components/site/Icon";
import { StructuredData } from "@/components/StructuredData";
import { getVisitData } from "@/lib/content/content.functions";
import { jsonLd, pageHead, restaurantSchema } from "@/lib/seo";

export const Route = createFileRoute("/visit")({
  loader: () => getVisitData(),
  head: () =>
    pageHead({
      title: "Visit",
      description: "Find your way to the table: Sal Marinho in Anjuna, North Goa. Opening hours, directions, parking and reservations.",
      path: "/visit",
      image: "/assets/og/visit.jpg",
    }),
  component: Visit,
});

function Visit() {
  const { settings, events } = Route.useLoaderData();
  const mapsHref =
    settings.mapsUrl ||
    (settings.latitude && settings.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Sal Marinho ${settings.locality}`)}`);

  return (
    <main id="main" className="bg-volcanic">
      <StructuredData json={jsonLd(restaurantSchema(settings))} />
      <header className="mx-auto max-w-7xl px-5 pt-40 pb-10 md:px-10 md:pt-48">
        <p className="sm-script text-4xl text-clay md:text-6xl">find your way to the table</p>
        <LetterBuild text="Visit" className="sm-display mt-2 text-6xl text-bone md:text-8xl" />
      </header>

      <section aria-label="Map" className="relative mx-auto max-w-7xl px-5 md:px-10">
        <div className="sm-coast-map relative overflow-hidden">
          <img src="/assets/art/goa-map.webp" alt="An engraved map of the North Goa coastline from Arambol to Aguada" className="w-full" />
          <svg viewBox="0 0 100 56" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path className="sm-coast-map__route" d="M4 6 C 12 8, 20 13, 27 17 S 33 22, 36 23.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="sm-coast-map__pin" style={{ left: "36%", top: "42%" }}>
            <span className="sm-coast-map__pulse" aria-hidden="true" />
            <span className="sm-coast-map__label">Sal Marinho, {settings.locality}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:grid-cols-3 md:px-10 md:py-28" aria-label="Visiting details">
        <div>
          <h2 className="sm-label flex items-center gap-3">
            <Icon name="pin" className="h-6 w-6 text-clay" />
            Where
          </h2>
          <address className="mt-4 text-lg not-italic text-bone">
            {settings.address ? <span className="block whitespace-pre-line">{settings.address}</span> : null}
            <span className="block text-sand">{settings.locality}</span>
          </address>
          <div className="mt-8">
            <ViewfinderLink href={mapsHref}>Get directions</ViewfinderLink>
          </div>
          {settings.parking ? (
            <>
              <h2 className="sm-label mt-12">Parking</h2>
              <p className="mt-4 text-sand">{settings.parking}</p>
            </>
          ) : null}
        </div>
        <div>
          <h2 className="sm-label flex items-center gap-3">
            <Icon name="clock" className="h-6 w-6 text-clay" />
            When
          </h2>
          {settings.hours.length ? (
            <dl className="mt-4 space-y-3">
              {settings.hours.map((h) => (
                <div key={`${h.days}-${h.open}`} className="flex justify-between gap-6 border-b border-hairline pb-3">
                  <dt className="text-sand">{h.days}</dt>
                  <dd className="text-bone">
                    {h.open} to {h.close}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-sand">Evenings by the sea. Reserve and we will confirm your time.</p>
          )}
        </div>
        <div>
          <h2 className="sm-label">Contact</h2>
          <ul className="mt-4 space-y-3 text-lg">
            {settings.phone ? (
              <li>
                <a className="text-bone hover:text-sand" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.whatsapp ? (
              <li>
                <a
                  className="text-bone hover:text-sand"
                  href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li>
                <a className="text-bone hover:text-sand" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              </li>
            ) : null}
          </ul>
          <div className="mt-10">
            <OrderChit note="See you soon" />
          </div>
        </div>
      </section>

      {events.length ? (
        <section className="border-t border-hairline" aria-labelledby="events-title">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-10">
            <h2 id="events-title" className="sm-display text-3xl text-bone md:text-4xl">
              Coming up at the table
            </h2>
            <ul className="mt-10 grid gap-8 md:grid-cols-3">
              {events.map((e) => (
                <li key={e.id} className="border-t border-hairline pt-6">
                  {e.image ? <img src={e.image} alt="" loading="lazy" className="mb-5 aspect-[4/3] w-full object-cover" /> : null}
                  <p className="font-body text-xs tracking-[0.24em] text-clay uppercase">
                    <time dateTime={e.date}>{new Date(`${e.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</time>
                    {e.time ? ` · ${e.time}` : ""}
                  </p>
                  <h3 className="mt-2 text-2xl text-bone">{e.title}</h3>
                  {e.description ? <p className="mt-2 text-sand">{e.description}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
