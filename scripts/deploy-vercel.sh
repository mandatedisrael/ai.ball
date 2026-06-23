#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PROJECT_NAME="matchanalyst"
ENV_FILE="${ENV_FILE:-.env.local}"

if ! vercel whoami >/dev/null 2>&1; then
  echo "Not logged in to Vercel. Run: vercel login"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — create it from .env.example"
  exit 1
fi

echo "Linking Vercel project: $PROJECT_NAME"
vercel link --yes --project "$PROJECT_NAME" 2>/dev/null || vercel link --yes

sync_env() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed 's/^"//;s/"$//')"
  if [[ -z "$value" ]]; then
    echo "Skipping empty env: $key"
    return
  fi
  printf '%s' "$value" | vercel env add "$key" production --force >/dev/null
  printf '%s' "$value" | vercel env add "$key" preview --force >/dev/null
  echo "Synced $key"
}

while IFS= read -r key; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  sync_env "$key"
done < <(grep -E '^[A-Z_]+=' "$ENV_FILE" | cut -d= -f1)

printf '%s' "https://${PROJECT_NAME}.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production --force >/dev/null
printf '%s' "https://${PROJECT_NAME}.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL preview --force >/dev/null
echo "Synced NEXT_PUBLIC_APP_URL"

echo "Deploying to production…"
vercel deploy --prod --yes

echo "Live at: https://${PROJECT_NAME}.vercel.app"