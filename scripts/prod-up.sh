#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Copy .env.production.example to .env and set JWT_SECRET first."
  exit 1
fi

docker compose up -d --build

echo ""
echo "Waiting for API..."
sleep 3

echo "Importing saved content (if seed file exists)..."
docker compose exec -T api python -m app.cli import-content /app/seed/portfolio-content.json --replace || true

echo ""
echo "Site:  http://localhost:${WEB_PORT:-8080}"
echo "Admin: http://localhost:${WEB_PORT:-8080}/admin"
echo ""
echo "Create your admin account:"
echo "  docker compose exec api python -m app.cli create-admin --email you@example.com"
