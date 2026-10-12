import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { StructuredData } from "@/components/StructuredData";
import { EnquiryForm, EventCategories, EventGallery, EventsHero, EVENTS_STATEMENT, SettingsJourney } from "@/components/v2/events";
import { getSiteSettings } from "@/lib/content/content.functions";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site";
import { jsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/events")({
  loader: () => getSiteSettings(),
  head: () =>
    pageHead({
      title: "Private events and celebrations across Goa",
      description:
        "Villa, yacht, beach and poolside events, birthdays, corporate gatherings and private celebrations across Goa, planned by the Sal Marinho team in Anjuna.",
      path: "/events",
      crumb: "Events",
      image: "/assets/v2/og/events.jpg",
    }),
  component: Events,
});

function Events() {
  const settings = Route.useLoaderData();
  const { events } = settings;
  const [eventType, setEventType] = useState("");
  const plan = (type: string) => {
    setEventType(type);
    document.getElementById("plan-your-event")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <main id="main">
      <StructuredData
        json={jsonLd({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Sal Marinho Events",
          serviceType: "Private event catering and curation",
          description: EVENTS_STATEMENT,
          areaServed: { "@type": "State", name: "Goa" },
          provider: { "@type": "Restaurant", "@id": `${SITE_URL}/#restaurant`, name: SITE_NAME },
          url: absoluteUrl("/events"),
        })}
      />
      <EventsHero events={events} />
      <SettingsJourney illustrative={events.illustrative} />
      <EventCategories categories={events.categories} illustrative={events.illustrative} onPlan={plan} />
      <EventGallery photos={events.gallery} />
      <EnquiryForm settings={settings} eventType={eventType} onEventType={setEventType} />
    </main>
  );
}
