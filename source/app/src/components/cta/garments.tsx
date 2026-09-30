// Bespoke CTAs. Each has its own interaction identity (design brief CTA inventory).
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { useReserve } from "@/components/site/reserve";
import { Icon } from "@/components/site/Icon";

/** "Enter the experience": the arrow rides a drawn wave line. */
export function WaveArrowLink({ href, children, onClick }: { href: string; children: ReactNode; onClick?: () => void }) {
  return (
    <a href={href} onClick={onClick} className="sm-wave-link group">
      <span>{children}</span>
      <svg viewBox="0 0 120 20" aria-hidden="true" className="sm-wave-link__path">
        <path d="M1 12 C 15 2, 25 2, 40 11 S 65 20, 80 10 S 105 3, 112 10" />
        <path d="M104 5 L113 10 L104 15" className="sm-wave-link__head" />
      </svg>
    </a>
  );
}

/** "Follow the ritual": circular badge, words on a path around a crab glyph; unrolls on hover. */
export function RitualBadge({ to = "/the-crab", label = "Follow the ritual" }: { to?: string; label?: string }) {
  return (
    <Link to={to} className="sm-badge" aria-label={label}>
      <svg viewBox="0 0 120 120" aria-hidden="true" className="sm-badge__ring">
        <defs>
          <path id="sm-badge-circle" d="M60 60 m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0" />
        </defs>
        <text>
          <textPath href="#sm-badge-circle" startOffset="0">
            {`${label} · ${label} ·`}
          </textPath>
        </text>
      </svg>
      <Icon name="crab" className="sm-badge__glyph" />
    </Link>
  );
}

/** "Trace the route": the arrow travels along a dotted sea route. */
export function RouteLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="sm-route-link">
      <span className="sm-script text-3xl">{children}</span>
      <span className="sm-route-link__track" aria-hidden="true">
        <svg viewBox="0 0 140 26" width="140" height="26" className="sm-route-link__svg">
          <path className="sm-route-link__dots" d="M2 20 C 30 4, 60 26, 90 12 S 128 6, 136 10" />
        </svg>
        <span className="sm-route-link__ship" />
      </span>
    </Link>
  );
}

/** "Read the journal": the underline is a shoreline that ripples on hover. */
export function ShorelineLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="sm-shore-link">
      <span>{children}</span>
      <svg viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true" className="sm-shore-link__line">
        <path d="M0 5 Q 12.5 0 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5" />
      </svg>
    </Link>
  );
}

/** "Get directions": corner brackets close around the label like a viewfinder. */
export function ViewfinderLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="sm-viewfinder">
      <span className="sm-viewfinder__corners" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="relative">{children}</span>
    </a>
  );
}

/** Closing CTA: a kitchen order chit whose perforated stub tears on hover. */
export function OrderChit({ label = "Reserve your table", note = "Table for tonight?" }: { label?: string; note?: string }) {
  const { open } = useReserve();
  return (
    <button type="button" onClick={open} className="sm-chit">
      <span className="sm-chit__body">
        <span className="sm-chit__note">{note}</span>
        <span className="sm-chit__label">{label}</span>
      </span>
      <span className="sm-chit__stub" aria-hidden="true">
        <span className="sm-chit__arrow">&rarr;</span>
      </span>
    </button>
  );
}

/** Inline reserve trigger for chapter copy: the label splits to reveal an ember underneath. */
export function SplitReserve({ label = "Reserve your table" }: { label?: string }) {
  const { open } = useReserve();
  return (
    <button type="button" onClick={open} className="sm-split" data-label={label}>
      <span className="sm-split__ember" aria-hidden="true" />
      <span className="sm-split__top" aria-hidden="true">
        {label}
      </span>
      <span className="sm-split__bottom">{label}</span>
    </button>
  );
}
