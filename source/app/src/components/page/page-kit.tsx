import type { ReactNode } from "react";

import { LetterBuild, ParallaxImage, Steam } from "@/components/motion/primitives";

/** Inner-page opening: full-bleed image, a title that builds on mount, one line of copy. */
export function PageHero({
  title,
  script,
  line,
  image,
  imageAlt,
  wave = false,
  steam = false,
  children,
}: {
  title: string;
  script?: string;
  line?: string;
  image: string;
  imageAlt: string;
  wave?: boolean;
  steam?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className="relative flex min-h-[88dvh] items-end overflow-hidden bg-volcanic">
      <ParallaxImage src={image} alt={imageAlt} wave={wave} priority strength={0.1} className="absolute inset-0" sizes="100vw" />
      {steam ? <Steam intensity={1} /> : null}
      <div className="absolute inset-0 bg-gradient-to-t from-volcanic via-volcanic/55 to-volcanic/10" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pt-40 pb-16 md:px-10 md:pb-24">
        {script ? <p className="sm-script text-4xl text-clay md:text-6xl">{script}</p> : null}
        <LetterBuild text={title} className="sm-display mt-2 max-w-4xl text-5xl text-bone md:text-7xl" />
        {line ? <p className="mt-6 max-w-xl text-lg text-sand">{line}</p> : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </header>
  );
}

/** A story chapter: poster image and copy, alternating sides. */
export function ChapterPoster({
  index,
  title,
  lead,
  children,
  image,
  imageAlt,
  flip = false,
  tone = "volcanic",
  wave = false,
  steam = false,
}: {
  index: number;
  title: string;
  lead: string;
  children?: ReactNode;
  image: string;
  imageAlt: string;
  flip?: boolean;
  tone?: "volcanic" | "charcoal" | "forest";
  wave?: boolean;
  steam?: boolean;
}) {
  const bg = tone === "forest" ? "bg-forest" : tone === "charcoal" ? "bg-charcoal" : "bg-volcanic";
  return (
    <section className={`relative overflow-hidden ${bg} py-24 md:py-36`} aria-labelledby={`chapter-${index}`}>
      <div className={`mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-12 md:px-10 ${flip ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div className="relative md:col-span-7">
          <ParallaxImage src={image} alt={imageAlt} wave={wave} className="aspect-[4/5] md:aspect-[5/4]" sizes="(min-width: 768px) 58vw, 100vw" />
          {steam ? <Steam intensity={0.9} /> : null}
        </div>
        <div className="md:col-span-5">
          <p className={`font-body text-xs tracking-[0.3em] ${tone === "forest" ? "text-sand" : "text-clay"}`}>Chapter {index}</p>
          <h2 id={`chapter-${index}`} className="sm-display mt-3 text-4xl text-bone md:text-5xl">
            {title}
          </h2>
          <p className="mt-6 text-lg text-bone/90">{lead}</p>
          {children ? <div className="sm-prose mt-5">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

/** A closing statement set large, as a visual element. */
export function ClosingLines({ lines, script }: { lines: string[]; script?: string }) {
  return (
    <section className="relative bg-volcanic px-5 py-28 text-center md:py-40">
      {script ? <p className="sm-script text-4xl text-clay md:text-5xl">{script}</p> : null}
      <div className="mx-auto mt-4 max-w-5xl">
        {lines.map((line) => (
          <p key={line} className="sm-display text-3xl text-bone md:text-6xl">
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}

/** Renders the journal body format: paragraphs, "## " headings and "> " quotes. Never raw HTML. */
export function Prose({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="sm-prose">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
        if (block.startsWith("> ")) return <blockquote key={i}>{block.replace(/^>\s?/gm, "")}</blockquote>;
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}
