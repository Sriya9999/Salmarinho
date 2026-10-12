import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { serveStaticFromKv } from "./lib/kv-static.server";
import { applySecurityHeaders } from "./lib/security-headers.server";
import { SITE_URL } from "./lib/site";
import type { KVNamespace } from "@cloudflare/workers-types";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Retired pages. Old links land on the matching part of the site instead of a 404.
const RETIRED: Record<string, string> = {
  "/who-we-are": "/our-story",
  "/our-craft": "/breakfast#fire",
  "/the-experience": "/breakfast#come-in",
  "/coastal-journey": "/the-coast",
  "/portuguese-connection": "/breakfast#a-little-portuguese",
  "/the-crab": "/the-coast#something-is-growing",
  "/the-crab-journey": "/the-coast#something-is-growing",
};

// Search engines must not index preview copies of the site.
function noindex(response: Response): Response {
  const copy = new Response(response.body, response);
  copy.headers.set("x-robots-tag", "noindex, nofollow");
  return copy;
}

function retiredRedirect(url: URL): Response | null {
  const target = RETIRED[url.pathname] ?? (/^\/menu\/[^/.]+$/.test(url.pathname) ? "/menu" : null);
  if (!target) return null;
  return new Response(null, { status: 301, headers: { location: target } });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    const canonical = new URL(SITE_URL);
    // One address for the site: www.salmarinho.in and the live worker's own
    // workers.dev address permanently redirect to salmarinho.in. A preview
    // worker, whose site address is its workers.dev one, stays out of search.
    const onWorkersDev = url.hostname.endsWith(".workers.dev");
    if (url.hostname === `www.${canonical.hostname}` || (onWorkersDev && url.hostname !== canonical.hostname)) {
      return applySecurityHeaders(Response.redirect(new URL(url.pathname + url.search, SITE_URL).toString(), 301));
    }
    const response = await respond(request, url, env, ctx);
    return onWorkersDev ? noindex(response) : response;
  },
};

async function respond(request: Request, url: URL, env: unknown, ctx: unknown): Promise<Response> {
  // One canonical URL per page: /menu/ permanently redirects to /menu.
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
    return applySecurityHeaders(Response.redirect(url.toString(), 301));
  }
  const retired = retiredRedirect(url);
  if (retired) return applySecurityHeaders(retired);
  // Self-hosted Cloudflare deploys keep static files in KV (see wrangler.cloudflare.jsonc).
  const kv = (env as { STATIC?: KVNamespace } | undefined)?.STATIC;
  if (kv) {
    const file = await serveStaticFromKv(request, kv);
    if (file) return file;
  }
  try {
    const handler = await getServerEntry();
    const response = await handler.fetch(request, env, ctx);
    return applySecurityHeaders(await normalizeCatastrophicSsrResponse(response));
  } catch (error) {
    console.error(error);
    return applySecurityHeaders(
      new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    );
  }
}
