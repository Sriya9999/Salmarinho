import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { PageHero } from "@/components/page/page-kit";
import { useReserve } from "@/components/site/reserve";
import { StructuredData } from "@/components/StructuredData";
import { ContourLink } from "@/components/v2/home";
import { getVisitData } from "@/lib/content/content.functions";
import { jsonLd, pageHead, restaurantSchema } from "@/lib/seo";
import { formatHours } from "@/lib/site";

/** Photographs of the restaurant itself, from the team. */
const GARDEN = [
  { src: "/assets/v2/garden/statue-leaves.webp", alt: "A carved stone figure holding an offering among tall banana leaves in the restaurant garden" },
  { src: "/assets/v2/garden/statue-claypots.webp", alt: "A carved stone figure beside clay pots steaming on the grill" },
  { src: "/assets/v2/garden/statue-smile.webp", alt: "A smiling carved stone figure under banana leaves" },
  { src: "/assets/v2/garden/statue-shade.webp", alt: "A stone figure with a trickle of water in the shade of the garden" },
  { src: "/assets/v2/garden/oils.webp", alt: "Small glass bottles of oils on a wooden table against green leaves" },
];

export const Route = createFileRoute("/visit")({
  loader: () => getVisitData(),
  head: () =>
    pageHead({
      title: "Visit: come in, stay awhile",
      description:
        "Visit Sal Marinho, a restaurant in Anjuna, North Goa, serving South Indian and Goan breakfast all day. Opening hours, map, directions and reservations.",
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
  const mapQuery =
    settings.latitude && settings.longitude ? `${settings.latitude},${settings.longitude}` : `Sal Marinho, ${settings.address || settings.locality}`;
  const photos = [
    ...settings.gallery.map((src) => ({ src, alt: "Inside Sal Marinho, Anjuna" })),
    ...GARDEN,
  ].slice(0, 6);

  return (
    <main id="main" data-sound="restaurant">
      <StructuredData json={jsonLd(restaurantSchema(settings))} />
      <PageHero
        kicker="Visit"
        title={
          <>
            Come in. <em>Stay awhile.</em>
          </>
        }
        line="South Indian and Goan breakfast, all day, in a garden in Anjuna, North Goa."
        image="/assets/v2/table/garden-evening.webp"
        imageAlt="The garden in the evening: lanterns in the trees, candles on wooden tables and a carved stone figure softly lit"
      >
        <button type="button" className="sm-ember-pill" onClick={open}>
          <span className="sm-ember-pill__coal" aria-hidden="true" />
          <span className="relative">Reserve a table</span>
        </button>
      </PageHero>

      <section className="v-wrap pt-20 md:pt-28" aria-labelledby="garden-title">
        <div className="grid gap-8 md:grid-cols-12">
          <h2 id="garden-title" className="v-title v-title--md md:col-span-6">
            Banana leaves, <em>carved stone.</em>
          </h2>
          <p className="v-lede self-end md:col-span-5 md:col-start-8">
            The restaurant sits in a garden in Anjuna: tall trees, banana leaves, carved stone figures, tables in the shade and
            clay pots on the grill. These are photographs of the place itself.
          </p>
        </div>
        <ul className="v-visit-photos mt-12">
          {photos.map((p) => (
            <li key={p.src}>
              <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
      </section>

      <section className="v-wrap grid gap-14 py-20 md:grid-cols-3 md:py-28" aria-label="Visiting details">
        <div>
          <h2 className="sm-label">Where</h2>
          <address className="mt-4 text-lg not-italic text-bone">
            {settings.address ? (
              <span className="block whitespace-pre-line">{settings.address}</span>
            ) : (
              <span className="block text-sm text-sand/80">Street address to be added</span>
            )}
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
                  <dd className="text-bone">{formatHours(h)}</dd>
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
            {settings.facebook ? (
              <li>
                <a className="text-bone hover:text-sand" href={settings.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
            ) : null}
            {!settings.phone && !whatsapp && !settings.email ? <li className="text-sm text-sand/80">Phone and email to be added</li> : null}
            <li>
              <button type="button" className="text-bone underline decoration-ember/60 underline-offset-4 hover:decoration-ember" onClick={open}>
                Reserve online
              </button>
            </li>
          </ul>
        </div>
      </section>

      <section className="v-wrap grid gap-12 pb-20 md:grid-cols-12 md:pb-28" aria-labelledby="find-title">
        <div className="md:col-span-5">
          <h2 id="find-title" className="v-title v-title--sm">
            Finding us
          </h2>
          <p className="mt-6 text-sand">
            Sal Marinho is a restaurant in Anjuna village, North Goa, set in a garden. It is not on the beach.
          </p>
          <p className="mt-4 text-sand">
            The beaches, yachts, villas and pools you may see on our{" "}
            <Link to="/events" className="text-bone underline decoration-ember/60 underline-offset-4">
              Events
            </Link>{" "}
            page are places across Goa where our events team hosts private occasions, and the shoreline on{" "}
            <Link to="/the-coast" className="text-bone underline decoration-ember/60 underline-offset-4">
              The coast
            </Link>{" "}
            is part of our story.
          </p>
          <div className="mt-8">
            <ContourLink href={mapsHref}>Open in Google Maps</ContourLink>
          </div>
        </div>
        <div className="md:col-span-7">
          <MapEmbed query={mapQuery} />
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

/** The map loads only when asked for, so the page stays light and nothing from Google loads by default. */
function MapEmbed({ query }: { query: string }) {
  const [show, setShow] = useState(false);
  if (!show) {
    return (
      <button type="button" className="v-map-card" onClick={() => setShow(true)}>
        <span className="v-map-card__lines" aria-hidden="true" />
        <span className="v-map-card__pin" aria-hidden="true" />
        <span className="v-map-card__label">Show the map</span>
      </button>
    );
  }
  return (
    <iframe
      className="v-map-frame"
      title="Map showing Sal Marinho in Anjuna, Goa"
      src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
