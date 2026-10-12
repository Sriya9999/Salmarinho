import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
// Page metadata (browser <title>/favicon + social og: tags) committed into the
// repo by the marketplace meta API and read at BUILD time — no runtime fetch.
// Editing it via the app settings UI rewrites this file and redeploys the app.
import appMetaJson from "../app-meta.json";
import { EmberCursor, PageVeil, SmoothScroll } from "../components/site/ambient";
import { SiteFooter } from "../components/site/footer";
import { SiteHeader } from "../components/site/header";
import { SoundScape } from "../components/v2/sound";
import { ReserveProvider } from "../components/site/reserve";
import { getSiteSettings } from "../lib/content/content.functions";
import { DEFAULT_SETTINGS } from "../lib/content/seed";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, THEME_COLOR } from "../lib/site";

declare const __HF_DESIGN_INSPECTOR__: boolean;

// Built-in defaults for any field that isn't set in app-meta.json.
const DEFAULT_TITLE = "Sal Marinho, Anjuna | South Indian and Goan breakfast, all day";
const DEFAULT_DESCRIPTION = SITE_DESCRIPTION;

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
  // Read by the Higgsfield platform (marketplace feed card), never by the
  // app itself — keep it in this file, don't render it.
  marketplace_cover_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

// Build the document head (title / description / og: / twitter: / favicon) from
// app-meta.json, falling back to the defaults above for any unset field.
// og_title/og_description double as the browser <title> and meta description;
// og_image_url (when set) also drives the twitter card + image. Built from
// inline tag literals (conditional spreads for the optional image/favicon) so
// it matches the head() shape TanStack expects.
// favicon/og images live in THIS app's own /assets, so the host is never
// inherent. app-meta.json may carry an absolute higgsfield-app URL with a STALE
// host — baked from the app this one was copied/remixed/renamed from — which would
// serve the wrong app's favicon/og. Strip any higgsfield-app host (prod
// higgsfield.app + dev higgsfield-dev.app) down to a root-relative path so it
// always resolves against whoever serves THIS page (preview / prod / custom
// domain). Genuinely external URLs (a CDN image the owner set) are left absolute.
const APP_HOST_ZONES = ["higgsfield.app", "higgsfield-dev.app"];

function toOwnAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value; // already root-relative
  try {
    const u = new URL(value);
    const isAppHost = APP_HOST_ZONES.some(
      (zone) => u.hostname === zone || u.hostname.endsWith(`.${zone}`),
    );
    if (isAppHost) return u.pathname + u.search;
    return value; // external host (CDN, etc.) — keep absolute
  } catch {
    return value; // not a parseable URL — leave as-is
  }
}

function absolute(url: string): string {
  return url.startsWith("/") ? `${SITE_URL}${url}` : url;
}

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = toOwnAssetUrl(meta.og_image_url);
  const favicon = toOwnAssetUrl(meta.favicon_url);
  const ogVideo = toOwnAssetUrl(meta.og_video_url);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: SITE_NAME },
      { name: "theme-color", content: THEME_COLOR },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_IN" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      ...(ogImage
        ? [
            { property: "og:image", content: absolute(ogImage) },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:image", content: absolute(ogImage) },
          ]
        : []),
      // Cover video (og:video) — the animated counterpart of og:image; the
      // Higgsfield feed cards also play it on hover.
      ...(ogVideo ? [{ property: "og:video", content: ogVideo }] : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preload", href: "/fonts/boska-300.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" as const },
      { rel: "preload", href: "/fonts/general-sans-400.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" as const },
      { rel: "icon", href: favicon ?? "/icons/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/icons/favicon-16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [
      {
        // Returning visitors skip the opening sequence without a flash.
        children:
          "try{if(sessionStorage.getItem('sm-seen')==='1')document.documentElement.dataset.smSeen='1'}catch(e){}",
      },
    ],
  };
}

function NotFoundComponent() {
  return (
    <main id="main" className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <img
        src="/assets/v2/growing/mangrove.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="relative max-w-md text-center">
        <p className="v-kicker justify-center">Lost at sea</p>
        <h1 className="v-title v-title--md mt-5">This page has drifted away.</h1>
        <p className="mt-4 text-sand">The tide took it. Breakfast is still on.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-8">
          <Link to="/" className="sm-text-arrow">
            Back to the shore
          </Link>
          <Link to="/menu" className="sm-text-arrow">
            What&rsquo;s cooking?
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-5">
      <div className="max-w-md text-center">
        <h1 className="v-title v-title--sm">The kitchen paused for a moment</h1>
        <p className="mt-4 text-sand">Something went wrong on our side. Try again, or head back to the shore.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="sm-text-arrow"
          >
            Try again
          </button>
          <a href="/" className="sm-text-arrow">
            Back to the shore
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Read the committed page metadata at build time (no runtime fetch).
  head: () => buildHead(appMeta),
  loader: async () => {
    try {
      return { settings: await getSiteSettings() };
    } catch {
      return { settings: DEFAULT_SETTINGS };
    }
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" data-theme="default-dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      {/* Marketplace apps are permanently dark: data-theme is pinned on <html>
          above. Do not add quanta's bootstrapScript/ThemeController, a theme
          toggle, or a light mode. */}
      <head>
        <HeadContent />
      </head>
      <body className="sm-grain bg-volcanic text-bone">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) {
      return;
    }

    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(
          error instanceof Error ? error : new Error("Failed to load design inspector"),
          {
            boundary: "higgsfield_design_inspector_import",
          },
        );
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteShell>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </SiteShell>
    </QueryClientProvider>
  );
}

/** Public pages get the restaurant chrome; the admin and template-only routes do not. */
function SiteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { settings } = Route.useLoaderData();
  const bare = pathname.startsWith("/admin") || pathname === "/app" || pathname.startsWith("/app/");
  if (bare) return <>{children}</>;
  return (
    <ReserveProvider hours={settings.hours}>
      <SmoothScroll />
      <SiteHeader />
      {children}
      <SiteFooter settings={settings} />
      <PageVeil />
      <EmberCursor />
      <SoundScape />
    </ReserveProvider>
  );
}
