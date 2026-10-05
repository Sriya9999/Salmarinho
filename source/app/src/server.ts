import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { serveStaticFromKv } from "./lib/kv-static.server";
import { applySecurityHeaders } from "./lib/security-headers.server";
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

// Pages retired with the move to South Indian and Goan breakfast. Old
// links land on the matching part of the new site instead of a 404.
const RETIRED: Record<string, string> = {
  "/who-we-are": "/our-story",
  "/our-craft": "/#fire",
  "/the-experience": "/#come-in",
  "/coastal-journey": "/the-coast",
  "/portuguese-connection": "/#a-little-portuguese",
  "/the-crab": "/the-crab-journey",
};

function retiredRedirect(url: URL): Response | null {
  const target = RETIRED[url.pathname] ?? (/^\/menu\/[^/.]+$/.test(url.pathname) ? "/menu" : null);
  if (!target) return null;
  return new Response(null, { status: 301, headers: { location: target } });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // One canonical URL per page: /menu/ permanently redirects to /menu.
    const url = new URL(request.url);
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
  },
};
