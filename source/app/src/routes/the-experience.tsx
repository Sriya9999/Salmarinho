import { createFileRoute } from "@tanstack/react-router";

import { MOMENTS } from "@/components/home/story-sections";
import { ReserveBand } from "@/components/home/table-sections";
import { Drift, LetterBuild, Steam } from "@/components/motion/primitives";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/the-experience")({
  head: () =>
    pageHead({
      title: "The experience",
      description:
        "What happens when you visit Sal Marinho in Anjuna: arrive, discover, choose your crab, watch the fire, lift the claypot, taste, and stay a little longer.",
      path: "/the-experience",
      image: "/assets/og/experience.jpg",
    }),
  component: Experience,
});

function Experience() {
  return (
    <main id="main" className="bg-volcanic">
      <header className="mx-auto max-w-7xl px-5 pt-40 pb-16 md:px-10 md:pt-48">
        <p className="sm-script text-4xl text-clay md:text-6xl">the meal unfolds</p>
        <LetterBuild text="The experience" className="sm-display mt-2 text-5xl text-bone md:text-7xl" />
        <p className="mt-6 max-w-xl text-lg text-sand">Come for the crab. Stay for the story. This is how an evening at Sal Marinho goes.</p>
      </header>
      <ol className="mx-auto max-w-7xl px-5 pb-24 md:px-10" data-cursor="ember">
        {MOMENTS.map((m, i) => (
          <li key={m.title} className={`grid items-center gap-8 py-12 md:grid-cols-12 md:py-20 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <Drift distance={i % 2 ? 60 : 30} className="relative overflow-hidden md:col-span-7">
              <img src={m.image} alt={m.alt} loading={i < 2 ? "eager" : "lazy"} className="aspect-[4/5] w-full object-cover md:aspect-[5/4]" />
              {m.title === "Lift the claypot" || m.title === "Smell the smoke" ? <Steam intensity={1.1} /> : null}
            </Drift>
            <div className="md:col-span-5">
              <p className="font-body text-xs tracking-[0.3em] text-clay">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="sm-display mt-2 text-4xl text-bone md:text-6xl">{m.title}</h2>
              <p className="mt-5 max-w-sm text-lg text-sand">{m.line}</p>
            </div>
          </li>
        ))}
      </ol>
      <ReserveBand />
    </main>
  );
}
