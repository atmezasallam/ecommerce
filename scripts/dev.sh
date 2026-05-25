#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Killing any process on port 3000..."
if command -v fuser >/dev/null 2>&1; then
  fuser -k 3000/tcp 2>/dev/null || true
else
  npx kill-port 3000 2>/dev/null || true
fi

echo "Starting Next.js dev server on port 3000..."
exec npx next dev -p 3000