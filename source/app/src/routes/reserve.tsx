import { createFileRoute } from "@tanstack/react-router";

import { ReserveForm } from "@/components/site/reserve";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/reserve")({
  head: () =>
    pageHead({
      title: "Reserve a table in Anjuna, Goa",
      description: "Book a table at Sal Marinho in Anjuna, Goa. Choose a date, time and number of guests, and we will keep a table for you.",
      path: "/reserve",
      crumb: "Reserve",
      image: "/assets/v2/og/visit.jpg",
    }),
  component: Reserve,
});

function Reserve() {
  return (
    <main id="main" className="relative min-h-dvh overflow-hidden bg-volcanic">
      <div className="sm-reserve-overlay__ember" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 pt-32 pb-24">
        <ReserveForm as="h1" />
      </div>
    </main>
  );
}
