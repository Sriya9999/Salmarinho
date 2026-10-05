import { createFileRoute } from "@tanstack/react-router";

import { PageHero } from "@/components/page/page-kit";
import { useReserve } from "@/components/site/reserve";
import { StructuredData } from "@/components/StructuredData";
import { ContourLink } from "@/components/v2/home";
import { getVisitData } from "@/lib/content/content.functions";
import { jsonLd, pageHead, restaurantSchema } from "@/lib/seo";

export const Route = createFileRoute("/visit")({
  loader: () => getVisitData(),
  head: () =>
    pageHead({
      title: "Visit",
      description: "Come to the table: Sal Marinho in Anjuna, North Goa. Opening hours, directions and reservations.",
      path: "/visit",
      image: "/assets/v2/og/visit.jpg",
    }),
  component: Visit,
});

function Visit() {
  const { settings, events } = Route.useLoaderData();
  const { open } = useReserve();
  const mapsHref =
    settings.mapsUrl ||
    (settings.latitude && settings.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Sal Marinho ${settings.locality}`)}`);
  const whatsapp = settings.whatsapp.replace(/[^\d]/g, "");

  return (
    <main id="main" data-sound="waves">
      <StructuredData json={jsonLd(restaurantSchema(settings))} />
      <PageHero
        kicker="Visit"
        title="Come to the table."
        accent
        line="Breakfast and South Indian food, all day, a short walk from the sea in Anjuna."
        image="/assets/v2/table/evening.webp"
        imageAlt="The terrace in the evening, tables lit by candles above the sea"
      >
        <button type="button" className="sm-ember-pill" onClick={open}>
          <span className="sm-ember-pill__coal" aria-hidden="true" />
          <span className="relative">Reserve a table</span>
        </button>
      </PageHero>

      <section className="v-wrap grid gap-14 py-20 md:grid-cols-3 md:py-28" aria-label="Visiting details">
        <div>
          <h2 className="sm-label">Where</h2>
          <address className="mt-4 text-lg not-italic text-bone">
            {settings.address ? <span className="block whitespace-pre-line">{settings.address}</span> : null}
            <span className="block text-sand">{settings.locality}</span>
          </address>
          <div className="mt-6">
            <ContourLink href={mapsHref}>Get directions</ContourLink>
          </div>
          {settings.parking ? (
            <>
              <h2 className="sm-label mt-12">Parking</h2>
              <p className="mt-4 text-sand">{settings.parking}</p>
            </>
          ) : null}
        </div>
        <div>
          <h2 className="sm-label">When</h2>
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
            <p className="mt-4 text-sand">Breakfast is served all day. Reserve and we will confirm your time.</p>
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
            {whatsapp ? (
              <li>
                <a className="text-bone hover:text-sand" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
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
            {settings.instagram ? (
              <li>
                <a className="text-bone hover:text-sand" href={settings.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            ) : null}
            <li>
              <button type="button" className="text-bone underline decoration-ember/60 underline-offset-4 hover:decoration-ember" onClick={open}>
                Reserve online
              </button>
            </li>
          </ul>
        </div>
      </section>

      {events.length ? (
        <section className="border-t border-hairline" aria-labelledby="events-title">
          <div className="v-wrap py-20">
            <h2 id="events-title" className="v-title v-title--sm">
              Coming up at the table
            </h2>
            <ul className="mt-10 grid gap-8 md:grid-cols-3">
              {events.map((e) => (
                <li key={e.id} className="border-t border-hairline pt-6">
                  {e.image ? <img src={e.image} alt="" loading="lazy" className="mb-5 aspect-[4/3] w-full object-cover" /> : null}
                  <p className="text-xs font-medium tracking-[0.24em] text-ember uppercase">
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
