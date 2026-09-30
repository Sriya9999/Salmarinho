import { createFileRoute } from "@tanstack/react-router";

import { getEnv } from "@/lib/content/db.server";

// Serves photos uploaded through /admin from R2. Keys are random UUIDs, so
// responses are cached as immutable.
export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const key = params._splat ?? "";
        if (!/^uploads\/\d{4}\/\d{2}\/[a-f0-9-]{36}\.(jpg|png|webp|avif)$/.test(key)) {
          return new Response("Not found", { status: 404 });
        }
        const { STORAGE } = await getEnv();
        if (!STORAGE) return new Response("Not found", { status: 404 });
        const object = await STORAGE.get(key);
        if (!object) return new Response("Not found", { status: 404 });
        const etag = object.httpEtag;
        if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304 });
        return new Response(object.body as unknown as ReadableStream, {
          headers: {
            "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
            ETag: etag,
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
