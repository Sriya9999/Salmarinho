// Plans the static-file upload to Workers KV for scripts/deploy-cloudflare.sh.
// Compares dist/client with what KV already holds (by content hash), writes
// the changed files as `wrangler kv bulk put` batch files, and lists keys
// that no longer exist in the build.
//
// Usage: node scripts/kv-static-plan.mjs <existing-keys.json> <out-dir>
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const TYPES = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
};
const MAX_VALUE = 25 * 1024 * 1024; // KV's per-value limit
const MAX_BATCH = 30e6; // base64 characters per bulk request

const [existingPath, outDir] = process.argv.slice(2);
if (!existingPath || !outDir) {
  console.error("Usage: node scripts/kv-static-plan.mjs <existing-keys.json> <out-dir>");
  process.exit(1);
}

const root = "dist/client";
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const existing = new Map(JSON.parse(readFileSync(existingPath, "utf8")).map((k) => [k.name, k.metadata?.hash]));

const files = walk(root).map((path) => {
  const bytes = readFileSync(path);
  if (bytes.length > MAX_VALUE) throw new Error(`${path} is larger than KV's 25 MiB limit`);
  return {
    key: "/" + relative(root, path).split(sep).join("/"),
    bytes,
    hash: createHash("sha256").update(bytes).digest("hex").slice(0, 32),
    type: TYPES[extname(path).toLowerCase()] ?? "application/octet-stream",
  };
});

const changed = files.filter((f) => existing.get(f.key) !== f.hash);
mkdirSync(outDir, { recursive: true });

let batch = [];
let size = 0;
let batches = 0;
const flush = () => {
  if (!batch.length) return;
  writeFileSync(join(outDir, `batch-${String(++batches).padStart(2, "0")}.json`), JSON.stringify(batch));
  batch = [];
  size = 0;
};
for (const f of changed) {
  const value = f.bytes.toString("base64");
  if (size + value.length > MAX_BATCH) flush();
  batch.push({ key: f.key, value, base64: true, metadata: { type: f.type, hash: f.hash } });
  size += value.length;
}
flush();

const live = new Set(files.map((f) => f.key));
const stale = [...existing.keys()].filter((k) => !live.has(k));
writeFileSync(join(outDir, "stale.json"), JSON.stringify(stale));

console.log(`${files.length} files, ${changed.length} to upload in ${batches} batch(es), ${stale.length} no longer used`);
