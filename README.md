# Portfolio (React + FastAPI)

Interactive portfolio with **Framer Motion**, custom cursor, and floating imagery. All content is managed in the **Admin CMS**.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind, Framer Motion |
| Backend | FastAPI, SQLModel, SQLite |

## Your content backup

All CMS data is saved in:

| File | Purpose |
|------|---------|
| `data/portfolio-content.json` | Portable export (profile, experience, skills, projects, etc.) — safe to commit |
| `data/backups/*.db` | Full SQLite snapshots (gitignored) |

Re-export after editing in admin:

```bash
./scripts/save-data.sh
```

## Local development

```bash
# API
cd apps/api
python -m venv ../../.venv && source ../../.venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Web
cd apps/web
npm install
cp .env.example .env
npm run dev
```

- Portfolio: http://localhost:5173  
- Admin: http://localhost:5173/admin  
- API docs: http://localhost:8000/docs (when `DEBUG=true`)

**Dev admin:** set `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` in `apps/api/.env` (see `.env.example`).

## Production (Render + GitHub Pages)

Split deployment: **API on Render**, **static site on GitHub Pages**.

**If the site does not work:** see **[docs/GITHUB-PAGES.md](docs/GITHUB-PAGES.md)** (Pages must use **`gh-pages`** branch, **root** folder).

Quick summary:

1. Deploy API with Render Blueprint (`render.yaml`) → set `APP_ORIGINS` to your Pages URL.
2. Set GitHub variable `VITE_API_URL` to your Render URL (e.g. `https://portfolio-api-2xt8.onrender.com`).
3. **Settings → Pages** → branch **`gh-pages`**, folder **`/` (root)**.
4. Push to `main` — workflow updates `gh-pages`.

## Production (Docker, optional)

One command deploys the built frontend + API. Nginx serves the site and proxies API routes on the same origin.

### 1. Configure environment

```bash
cp .env.production.example .env

# Generate a secret and paste into .env
cd apps/api && python -m app.cli gen-secret
```

Edit `.env`:

```env
DEBUG=false
JWT_SECRET=<paste generated secret>
APP_ORIGINS=https://yourdomain.com
PUBLIC_BASE_URL=https://yourdomain.com
WEB_PORT=8080
```

### 2. Start

```bash
./scripts/prod-up.sh
```

Or manually:

```bash
docker compose up -d --build
docker compose exec api python -m app.cli import-content /app/seed/portfolio-content.json --replace
```

### 3. Create your admin account

```bash
docker compose exec api python -m app.cli create-admin --email you@example.com
```

You'll be prompted for a password (min 10 characters). This is **your** account — not a shared default.

To reset the password later, run the same command again with that email.

### 4. Open the site

- Site: http://localhost:8080 (or your domain)
- Admin: http://localhost:8080/admin

## CLI reference

Run from `apps/api` (or via `docker compose exec api`):

| Command | Description |
|---------|-------------|
| `python -m app.cli create-admin --email you@example.com` | Create or reset admin password |
| `python -m app.cli export-content --out ../../data/portfolio-content.json` | Export CMS content |
| `python -m app.cli import-content ../../data/portfolio-content.json` | Import CMS content (replaces existing) |
| `python -m app.cli gen-secret` | Generate `JWT_SECRET` |

## CMS sections

Profile, Experience, Education, Certifications, Projects, Blog, Volunteer, Skills, Languages, Honors, Publications, Courses, Recommendations, Contact messages.

Blog posts only appear on the site when **Published** is checked.

## Production checklist

- [ ] `DEBUG=false` in `.env`
- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] `APP_ORIGINS` set to your real domain(s)
- [ ] Admin created via `create-admin` CLI
- [ ] Content imported from `data/portfolio-content.json`
- [ ] HTTPS terminated at your reverse proxy (Caddy, nginx, Cloudflare, etc.)
# portfolio
