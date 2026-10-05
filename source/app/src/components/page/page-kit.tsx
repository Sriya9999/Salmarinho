import type { ReactNode } from "react";

/** Inner-page opening: full-bleed photograph, kicker, title and one line of copy. */
export function PageHero({
  kicker,
  title,
  line,
  image,
  imageAlt,
  accent = false,
  children,
}: {
  kicker?: string;
  title: ReactNode;
  line?: string;
  image: string;
  imageAlt: string;
  /** Set the title in the expressive display face. */
  accent?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className="v-page-hero">
      <div className="v-page-hero__media">
        <img src={image} alt={imageAlt} fetchPriority="high" decoding="async" />
      </div>
      <div className="v-page-hero__shade" aria-hidden="true" />
      <div className="v-wrap v-page-hero__copy">
        {kicker ? <p className="v-kicker">{kicker}</p> : null}
        <h1 className={`${accent ? "v-accent-title" : "v-title"} mt-5 max-w-5xl`}>{title}</h1>
        {line ? <p className="v-lede mt-6">{line}</p> : null}
        {children ? <div className="mt-9">{children}</div> : null}
      </div>
    </header>
  );
}

/** Renders the journal body format: paragraphs, "## " headings and "> " quotes. Never raw HTML. */
export function Prose({ body }: { body: string }) {
  const blocks = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
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
