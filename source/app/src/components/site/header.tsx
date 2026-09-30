import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { BrandMark, BrandWordmark } from "@/components/site/Brand";
import { useReserve } from "@/components/site/reserve";
import { Magnetic } from "@/components/motion/primitives";
import { MORE_ITEMS, NAV_ITEMS } from "@/lib/site";

/** Persistent "Reserve your table" ember pill. The only pill on the site. */
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
        <span className="relative sm:hidden">Reserve</span>
        <span className="relative hidden sm:inline">Reserve your table</span>
      </button>
    </Magnetic>
  );
}

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
      <header className="sm-header" data-scrolled={scrolled || menuOpen}>
        <Link to="/" className="flex items-center gap-3" aria-label="Sal Marinho, home">
          <BrandMark decorative className="h-9 w-9 md:h-10 md:w-10" />
          <BrandWordmark decorative className="hidden h-7 w-auto sm:block md:h-8" />
        </Link>
        <div className="flex items-center gap-2 md:gap-6">
          <button
            ref={toggleRef}
            type="button"
            className="sm-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="sm-journey-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sm-menu-toggle__lines" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>{menuOpen ? "Close" : "Explore"}</span>
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
            <p className="sm-label">Further along the coast</p>
            <ul className="mt-5 space-y-3">
              {MORE_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="sm-journey-minor">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
