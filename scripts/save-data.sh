#!/usr/bin/env bash
# Export CMS content from local dev database to data/portfolio-content.json
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/api"
python -m app.cli export-content --out "$ROOT/data/portfolio-content.json"
cp "$ROOT/data/portfolio-content.json" "$ROOT/apps/api/seed/portfolio-content.json"
cp portfolio.db "$ROOT/data/backups/portfolio-$(date +%Y-%m-%d-%H%M).db"
echo "Saved content JSON + SQLite backup in data/"
