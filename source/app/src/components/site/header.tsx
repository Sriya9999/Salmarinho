import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { BrandMark, BrandWordmark } from "@/components/site/Brand";
import { useReserve } from "@/components/site/reserve";
import { Magnetic } from "@/components/motion/primitives";
import { NAV_ITEMS } from "@/lib/site";

/** Persistent "Reserve your table" ember pill. */
export function ReservePill() {
  const { open } = useReserve();
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <Magnetic strength={0.22}>
      <button
        ref={ref}
        type="button"
        onClick={open}
        className="sm-ember-pill"
        aria-label="Reserve your table"
        onPointerMove={(event) => {
          const el = ref.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--ex", `${((event.clientX - rect.left) / rect.width) * 100}%`);
        }}
      >
        <span className="sm-ember-pill__coal" aria-hidden="true" />
        <span className="relative">Reserve</span>
      </button>
    </Magnetic>
  );
}

/**
 * A floating bar: the mark on the left, the six places in the middle (each with
 * its line of character on hover), Reserve on the right. Below wide screens the
 * places move into a full-screen menu.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("sm-locked", menuOpen);
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <a href="#main" className="sm-skip-link">
        Skip to content
      </a>
      <header className="v-nav" data-scrolled={scrolled || menuOpen}>
        <Link to="/" className="v-nav__brand" aria-label="Sal Marinho, home">
          <BrandMark decorative className="h-9 w-9" />
          <BrandWordmark decorative className="hidden h-6 w-auto sm:block" />
        </Link>
        <nav aria-label="Main" className="v-nav__places">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="v-nav__link" activeProps={{ "aria-current": "page" }}>
                  <span className="v-nav__title">{item.title}</span>
                  <span className="v-nav__sub" aria-hidden="true">
                    {item.subtitle}
                  </span>
                  <svg className="v-nav__wave" viewBox="0 0 60 6" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 3 C 7 0, 13 6, 20 3 S 33 0, 40 3 S 53 6, 60 3" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="v-nav__actions">
          <button
            ref={toggleRef}
            type="button"
            className="sm-menu-toggle v-nav__toggle"
            aria-expanded={menuOpen}
            aria-controls="sm-journey-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sm-menu-toggle__lines" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>{menuOpen ? "Close" : "Menu"}</span>
          </button>
          <ReservePill />
        </div>
      </header>
      <nav id="sm-journey-nav" aria-label="Journey" className="sm-journey-nav" data-open={menuOpen} inert={!menuOpen}>
        <div className="sm-journey-nav__inner">
          <ol className="sm-journey-nav__list">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.to} style={{ transitionDelay: menuOpen ? `${120 + i * 55}ms` : "0ms" }}>
                <Link to={item.to} className="sm-journey-link" activeProps={{ "aria-current": "page" }}>
                  <span className="sm-journey-link__title">{item.title}</span>
                  <span className="sm-journey-link__sub">{item.subtitle}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="sm-journey-nav__aside">
            <p className="sm-label">Sal Marinho, Anjuna</p>
            <p className="mt-4 text-sand">South Indian flavours, all-day breakfast and a table inspired by the coast.</p>
            <Link to="/" className="sm-journey-minor mt-6 inline-block">
              Home
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
