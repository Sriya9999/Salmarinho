#!/usr/bin/env bash
# Deploy Sal Marinho to your own Cloudflare account (the free plan is enough).
#
# Access to your account, either:
#   - an API credential for api.cloudflare.com on the Claude Code cloud
#     environment (the agent proxy attaches it; nothing else to set), or
#   - CLOUDFLARE_API_TOKEN: API token with edit rights for Workers Scripts,
#     D1 and Workers R2 Storage
# Plus:
#   CLOUDFLARE_ACCOUNT_ID  your Cloudflare account ID
# Optional:
#   ADMIN_PASSWORD         admin panel password; if unset on the first deploy,
#                          a strong one is generated and printed once
#   SITE_URL               public address, for example https://www.salmarinho.in
#                          (defaults to https://salmarinho.<your-subdomain>.workers.dev)
#
# Run from source/app:   bash scripts/deploy-cloudflare.sh
# Safe to re-run: existing database, storage and content are kept.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID first}"
if ! [[ "$CLOUDFLARE_ACCOUNT_ID" =~ ^[0-9a-f]{32}$ ]]; then
  echo "CLOUDFLARE_ACCOUNT_ID should be the 32-character account ID (Workers & Pages overview, right side), not an email or name." >&2
  exit 1
fi
# With a proxy-attached API credential the real token never reaches this
# shell; wrangler still wants the variable set, and the proxy supplies the key.
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-attached-by-proxy}"

CFG=wrangler.cloudflare.jsonc
DB=salmarinho-db
BUCKET=salmarinho-media
export CI=true # run wrangler without interactive prompts

wrangler() { npx --yes wrangler@4 "$@"; }
api() {
  curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID$1" "${@:2}"
}

echo "0/6 Checking access"
if ! curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/user/tokens/verify | jq -e '.success' >/dev/null; then
  echo "Cloudflare did not accept the credentials. Check the token's permissions and CLOUDFLARE_ACCOUNT_ID." >&2
  exit 1
fi

echo "1/6 Database"
id=$(api "/d1/database?name=$DB" | jq -r --arg n "$DB" '.result[] | select(.name == $n) | .uuid' | head -n1)
if [ -z "$id" ]; then
  id=$(api /d1/database -X POST -d "{\"name\":\"$DB\"}" | jq -r '.result.uuid')
fi
sed -i.bak -E "s/\"database_id\": \"[^\"]*\"/\"database_id\": \"$id\"/" "$CFG" && rm -f "$CFG.bak"

echo "2/6 Photo storage"
r2=$(curl -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/r2/buckets")
if ! jq -e '.success' <<<"$r2" >/dev/null; then
  echo "Photo storage (R2) is not turned on: in the Cloudflare dashboard open R2 Object Storage and enable it, then re-run." >&2
  exit 1
fi
if ! jq -e --arg n "$BUCKET" '.result.buckets[] | select(.name == $n)' <<<"$r2" >/dev/null; then
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
elif ! wrangler secret list -c "$CFG" | grep -q '"ADMIN_PASSWORD"'; then
  pw=$(LC_ALL=C tr -dc 'abcdefghjkmnpqrstuvwxyz23456789' </dev/urandom | head -c 20 | sed -E 's/(.{5})/\1-/g; s/-$//')
  printf '%s' "$pw" | wrangler secret put ADMIN_PASSWORD -c "$CFG"
  echo "Admin password (shown once, change it in the admin panel): $pw"
fi

echo "Live at $SITE_URL"
