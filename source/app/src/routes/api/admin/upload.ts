import { createFileRoute } from "@tanstack/react-router";

import { AdminError, requireAdmin } from "@/lib/admin/auth.server";
import { getEnv } from "@/lib/content/db.server";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 8 * 1024 * 1024;

// Admin-only photo upload into R2. Multipart form with a single "file" field.
export const Route = createFileRoute("/api/admin/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireAdmin({ write: true });
        } catch (error) {
          const message = error instanceof AdminError ? error.message : "Please sign in again.";
          return Response.json({ ok: false, message }, { status: 401 });
        }
        const { STORAGE } = await getEnv();
        if (!STORAGE) return Response.json({ ok: false, message: "Photo storage is not available here." }, { status: 503 });

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) return Response.json({ ok: false, message: "Choose a photo to upload." }, { status: 400 });
        const ext = TYPES[file.type];
        if (!ext) return Response.json({ ok: false, message: "Use a JPG, PNG, WebP or AVIF photo." }, { status: 415 });
        if (file.size > MAX_BYTES) return Response.json({ ok: false, message: "Photos must be under 8 MB." }, { status: 413 });

        const now = new Date();
        const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;
        await STORAGE.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
        return Response.json({ ok: true, url: `/media/${key}` });
      },
    },
  },
});
