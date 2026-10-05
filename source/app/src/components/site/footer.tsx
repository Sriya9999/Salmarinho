import { Link } from "@tanstack/react-router";

import { BrandLockup } from "@/components/site/Brand";
import type { SiteSettings } from "@/lib/content/types";
import { MORE_ITEMS, NAV_ITEMS } from "@/lib/site";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const hasContact = Boolean(settings.address || settings.phone || settings.email || settings.whatsapp);
  const whatsapp = settings.whatsapp.replace(/[^\d]/g, "");
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-hairline bg-volcanic" data-sound="quiet">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-20 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <BrandLockup className="w-56" />
        </div>
        <div className="grid gap-12 sm:grid-cols-2 md:col-span-8 md:grid-cols-3">
          <div>
            <p className="sm-label">Explore</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/" className="sm-footer-link">
                  Home
                </Link>
              </li>
              {[...NAV_ITEMS, ...MORE_ITEMS].map((item) => (
                <li key={`${item.to}#${item.hash ?? ""}`}>
                  <Link to={item.to} hash={item.hash} className="sm-footer-link">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="sm-label">Hours</p>
            {settings.hours.length ? (
              <dl className="mt-5 space-y-2 text-sm text-sand">
                {settings.hours.map((h) => (
                  <div key={`${h.days}-${h.open}`} className="flex justify-between gap-6">
                    <dt>{h.days}</dt>
                    <dd className="text-bone">
                      {h.open} to {h.close}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-5 text-sm text-sand">South Indian and Goan breakfast, served all day.</p>
            )}
          </div>
          <div>
            <p className="sm-label">Find us</p>
            <address className="mt-5 space-y-2 text-sm not-italic text-sand">
              {settings.address ? <p className="whitespace-pre-line text-bone">{settings.address}</p> : null}
              <p>{settings.locality}</p>
              {settings.phone ? (
                <p>
                  <a className="sm-footer-link" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                    {settings.phone}
                  </a>
                </p>
              ) : null}
              {whatsapp ? (
                <p>
                  <a className="sm-footer-link" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </p>
              ) : null}
              {settings.email ? (
                <p>
                  <a className="sm-footer-link" href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                </p>
              ) : null}
              {settings.instagram ? (
                <p>
                  <a className="sm-footer-link" href={settings.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </p>
              ) : null}
              {!hasContact ? (
                <p>
                  <Link to="/visit" className="sm-footer-link">
                    Come to the table
                  </Link>
                </p>
              ) : null}
            </address>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-hairline px-5 py-6 text-xs text-sand/80 sm:flex-row sm:items-center sm:justify-between md:px-10">
        <p>
          &copy; {year} Sal Marinho, {settings.locality}
        </p>
        <p className="font-accent text-xl font-extralight text-ember">A little coastal magic, all day.</p>
      </div>
    </footer>
  );
}
