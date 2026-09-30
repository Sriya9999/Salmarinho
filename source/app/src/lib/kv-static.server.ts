// Serves the site's static files (built JS and CSS, images, film, fonts) from a
// Workers KV namespace bound as STATIC. Used only when the Worker is deployed
// without a static-assets binding (wrangler.cloudflare.jsonc, uploaded by
// scripts/deploy-cloudflare.sh). With an ASSETS binding, Cloudflare serves
// these files before the Worker runs and this code never sees them.
import type { KVNamespace } from "@cloudflare/workers-types";

type StaticMeta = { type: string; hash: string };

// Vite's content-hashed bundles never change under the same name.
const HASHED_BUNDLE = /^\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.(js|css)$/;

export async function serveStaticFromKv(request: Request, kv: KVNamespace): Promise<Response | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  let path: string;
  try {
    path = decodeURIComponent(new URL(request.url).pathname);
  } catch {
    return null;
  }
  // Pages have no file extension; only files are looked up.
  if (!/\.[a-z0-9]+$/i.test(path)) return null;

  const { value, metadata } = await kv.getWithMetadata<StaticMeta>(path, { type: "arrayBuffer", cacheTtl: 3600 });
  if (!value || !metadata) return null;

  const etag = `"${metadata.hash}"`;
  const headers = new Headers({
    "content-type": metadata.type,
    etag,
    "accept-ranges": "bytes",
    "cache-control": HASHED_BUNDLE.test(path) ? "public, max-age=31536000, immutable" : "public, max-age=86400",
    "x-content-type-options": "nosniff",
  });
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });

  const size = value.byteLength;
  const body = (bytes: ArrayBuffer) => (request.method === "HEAD" ? null : bytes);

  // Byte ranges: Safari only plays <video> when the server honours them.
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range")?.trim() ?? "");
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      headers.set("content-range", `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set("content-range", `bytes ${start}-${end}/${size}`);
    headers.set("content-length", String(end - start + 1));
    return new Response(body(value.slice(start, end + 1)), { status: 206, headers });
  }

  headers.set("content-length", String(size));
  return new Response(body(value), { status: 200, headers });
}
