#!/usr/bin/env bash
# Deploy Sal Marinho to your own Cloudflare account (the free plan is enough).
#
# Access to your account, either:
#   - an API credential for api.cloudflare.com on the Claude Code cloud
#     environment (the agent proxy attaches it; nothing else to set), or
#   - CLOUDFLARE_API_TOKEN: API token with edit rights for Workers Scripts,
#     Workers KV Storage, D1 and Workers R2 Storage
# Plus:
#   CLOUDFLARE_ACCOUNT_ID  your 32-character Cloudflare account ID
# Optional:
#   ADMIN_PASSWORD         admin panel password; if unset on the first deploy,
#                          a strong one is generated and printed once
#   SITE_URL               public address, for example https://www.salmarinho.in
#                          (defaults to https://salmarinho.<your-subdomain>.workers.dev)
#
# Static files go to Workers KV rather than Workers static assets: the assets
# upload uses a one-time pass that a proxy-attached credential would replace.
# Only files that changed since the last deploy are sent.
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
export CI=true # run wrangler without interactive prompts

CFG=wrangler.cloudflare.jsonc
DEPLOY_CFG=wrangler.deploy.jsonc # generated per run, never committed
DB=salmarinho-db
BUCKET=salmarinho-media
KV_TITLE=salmarinho-static
WORK=$(mktemp -d)
trap 'rm -rf "$WORK" "$DEPLOY_CFG"' EXIT

wrangler() { bunx wrangler@4 "$@"; }
api() {
  curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID$1" "${@:2}"
}
# Like api, but returns Cloudflare's error body instead of failing.
api_try() {
  curl -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID$1"
}
set_id() { sed -i.bak -E "s/(\"$1\": )\"[^\"]*\"/\1\"$2\"/" "$CFG" && rm -f "$CFG.bak"; }

echo "== Checking access"
if ! curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/user/tokens/verify | jq -e '.success' >/dev/null; then
  echo "Cloudflare did not accept the credentials. Check the token and its permissions." >&2
  exit 1
fi

echo "== Database"
id=$(api "/d1/database?name=$DB" | jq -r --arg n "$DB" '.result[] | select(.name == $n) | .uuid' | head -n1)
[ -n "$id" ] || id=$(api /d1/database -X POST -d "{\"name\":\"$DB\"}" | jq -r '.result.uuid')
set_id database_id "$id"
wrangler d1 migrations apply "$DB" --remote -c "$CFG"

echo "== Static file storage"
ns=$(api "/storage/kv/namespaces?per_page=100" | jq -r --arg t "$KV_TITLE" '.result[] | select(.title == $t) | .id' | head -n1)
[ -n "$ns" ] || ns=$(api /storage/kv/namespaces -X POST -d "{\"title\":\"$KV_TITLE\"}" | jq -r '.result.id')
set_id id "$ns"

echo "== Photo storage"
r2=$(api_try /r2/buckets)
if jq -e '.success' <<<"$r2" >/dev/null; then
  if ! jq -e --arg n "$BUCKET" '.result.buckets[] | select(.name == $n)' <<<"$r2" >/dev/null; then
    api /r2/buckets -X POST -d "{\"name\":\"$BUCKET\"}" >/dev/null
  fi
  cp "$CFG" "$DEPLOY_CFG"
else
  echo "R2 is not turned on, so admin photo uploads stay off for now. Turn on R2 Object Storage in the dashboard and re-run to enable them."
  # Same config without the photo-storage block (its comment and r2_buckets).
  awk '/Photos uploaded from the admin panel/ {skip=1} skip && /"r2_buckets"/ {skip=0; next} !skip' "$CFG" |
    perl -0pe 's/,(\s*)\}\s*$/$1}\n/' > "$DEPLOY_CFG"
fi

echo "== Site address"
if [ -z "${SITE_URL:-}" ]; then
  sub=$(api_try /workers/subdomain | jq -r '.result.subdomain // empty')
  if [ -z "$sub" ]; then
    echo "No workers.dev subdomain yet. Open Workers & Pages in the Cloudflare dashboard once to pick one, then re-run." >&2
    exit 1
  fi
  SITE_URL="https://salmarinho.$sub.workers.dev"
fi
echo "$SITE_URL"

echo "== Build"
bun install --frozen-lockfile
VITE_SITE_URL="$SITE_URL" bun run build

echo "== Upload static files"
wrangler kv key list --namespace-id "$ns" --remote > "$WORK/existing.json"
node scripts/kv-static-plan.mjs "$WORK/existing.json" "$WORK/upload"
for f in "$WORK"/upload/batch-*.json; do
  [ -e "$f" ] || continue
  wrangler kv bulk put "$f" --namespace-id "$ns" --remote
done

echo "== Deploy"
wrangler deploy -c "$DEPLOY_CFG"

if [ "$(jq length "$WORK/upload/stale.json")" -gt 0 ]; then
  echo "== Remove files no longer used"
  wrangler kv bulk delete "$WORK/upload/stale.json" --namespace-id "$ns" --remote --force
fi

if [ -n "${ADMIN_PASSWORD:-}" ]; then
  printf '%s' "$ADMIN_PASSWORD" | wrangler secret put ADMIN_PASSWORD -c "$DEPLOY_CFG"
else
  secrets=$(wrangler secret list -c "$DEPLOY_CFG")
  if ! grep -q '"ADMIN_PASSWORD"' <<<"$secrets"; then
    pw=$(node -e 'const c="abcdefghjkmnpqrstuvwxyz23456789",{randomInt}=require("crypto");let s="";for(let i=0;i<20;i++)s+=c[randomInt(c.length)];console.log(s.match(/.{5}/g).join("-"))')
    printf '%s' "$pw" | wrangler secret put ADMIN_PASSWORD -c "$DEPLOY_CFG"
    echo "Admin password (shown once, change it in the admin panel): $pw"
  fi
fi

echo "Live at $SITE_URL"
