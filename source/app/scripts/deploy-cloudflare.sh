#!/usr/bin/env bash
# Deploy Sal Marinho to your own Cloudflare account (the free plan is enough).
#
# Needs these environment variables:
#   CLOUDFLARE_API_TOKEN   API token with edit rights for Workers Scripts,
#                          D1 and Workers R2 Storage
#   CLOUDFLARE_ACCOUNT_ID  your Cloudflare account ID
# Optional:
#   ADMIN_PASSWORD         sets (or replaces) the admin panel password
#   SITE_URL               public address, for example https://www.salmarinho.in
#                          (defaults to https://salmarinho.<your-subdomain>.workers.dev)
#
# Run from source/app:   bash scripts/deploy-cloudflare.sh
# Safe to re-run: existing database, storage and content are kept.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN first}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID first}"

CFG=wrangler.cloudflare.jsonc
DB=salmarinho-db
BUCKET=salmarinho-media
export CI=true # run wrangler without interactive prompts

wrangler() { npx --yes wrangler@4 "$@"; }
api() {
  curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID$1" "${@:2}"
}

echo "1/6 Database"
id=$(api "/d1/database?name=$DB" | jq -r --arg n "$DB" '.result[] | select(.name == $n) | .uuid' | head -n1)
if [ -z "$id" ]; then
  id=$(api /d1/database -X POST -d "{\"name\":\"$DB\"}" | jq -r '.result.uuid')
fi
sed -i.bak -E "s/\"database_id\": \"[^\"]*\"/\"database_id\": \"$id\"/" "$CFG" && rm -f "$CFG.bak"

echo "2/6 Photo storage"
if ! api /r2/buckets | jq -e --arg n "$BUCKET" '.result.buckets[] | select(.name == $n)' >/dev/null; then
  api /r2/buckets -X POST -d "{\"name\":\"$BUCKET\"}" >/dev/null
fi

echo "3/6 Tables and starter content"
wrangler d1 migrations apply "$DB" --remote -c "$CFG"

echo "4/6 Site address"
if [ -z "${SITE_URL:-}" ]; then
  sub=$(api /workers/subdomain | jq -r '.result.subdomain // empty')
  if [ -z "$sub" ]; then
    echo "No workers.dev subdomain yet. Open Workers & Pages in the Cloudflare dashboard once to pick one, then re-run." >&2
    exit 1
  fi
  SITE_URL="https://salmarinho.$sub.workers.dev"
fi

echo "5/6 Build"
bun install --frozen-lockfile
VITE_SITE_URL="$SITE_URL" bun run build

echo "6/6 Deploy"
wrangler deploy -c "$CFG"
if [ -n "${ADMIN_PASSWORD:-}" ]; then
  printf '%s' "$ADMIN_PASSWORD" | wrangler secret put ADMIN_PASSWORD -c "$CFG"
else
  echo "Reminder: set the admin password with: npx wrangler secret put ADMIN_PASSWORD -c $CFG"
fi

echo "Live at $SITE_URL"
