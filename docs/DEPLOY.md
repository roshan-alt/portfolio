# Deploy: Render (API) + GitHub Pages (frontend)

## Overview

| Part | Host | URL example |
|------|------|-------------|
| Frontend | GitHub Pages | `https://<user>.github.io/<repo>/` |
| API + CMS | Render | `https://portfolio-api.onrender.com` |
| Database | Render Postgres | (managed, linked in `render.yaml`) |

---

## 1. Backend on Render

### Option A — Blueprint (recommended)

1. Push this repo to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Connect the repo — Render reads `render.yaml` and creates the API + Postgres.
4. After the first deploy, open the **portfolio-api** service → **Environment** and set:

   | Variable | Example |
   |----------|---------|
   | `APP_ORIGINS` | `https://roshan-alt.github.io` (no trailing slash) |
   | `PUBLIC_BASE_URL` | `https://portfolio-api-xxxx.onrender.com` |

   If your Pages URL includes the repo name, add both:

   ```
   https://roshan-alt.github.io,https://roshan-alt.github.io/portfolio
   ```

5. **Redeploy** the API after changing `APP_ORIGINS`.

### Option B — Manual Web Service

- **Root directory:** `apps/api`
- **Build:** `pip install -r requirements.txt`
- **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Attach a **PostgreSQL** database and set `DATABASE_URL`.
- Set `DEBUG=false`, `JWT_SECRET` (32+ chars), `IMPORT_SEED_ON_STARTUP=true` for first deploy.

### Create admin (no Shell required)

Pick **one** of these:

#### A — Environment variables (easiest)

In **portfolio-api** → **Environment**, add:

| Variable | Value |
|----------|--------|
| `ADMIN_BOOTSTRAP_EMAIL` | your email |
| `ADMIN_BOOTSTRAP_PASSWORD` | strong password (10+ chars) |

**Redeploy.** On startup, the API creates this admin if none exists.

Then **remove** `ADMIN_BOOTSTRAP_PASSWORD` from env and redeploy again (keeps email, password stays in DB).

#### B — One-time setup URL (curl)

1. Generate a secret: `cd apps/api && python -m app.cli gen-secret`
2. On Render, set `SETUP_TOKEN` to that value → **Redeploy**
3. Run once (replace URL, email, token):

```bash
curl -X POST "https://portfolio-api-xxxx.onrender.com/auth/setup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "YourStrongPassword123",
    "setup_token": "PASTE_SETUP_TOKEN"
  }'
```

4. Remove `SETUP_TOKEN` from Render → **Redeploy**
5. Log in at `https://<user>.github.io/<repo>/admin`

#### C — From your laptop (uses Render Postgres URL)

1. Render → **portfolio-db** → **Connections** → copy **External Database URL**
2. Locally:

```bash
cd apps/api
source ../../.venv/bin/activate   # if you use a venv
pip install -r requirements.txt
export DATABASE_URL="postgresql://..."   # paste URL (Render may show postgres:// — that works)
python -m app.cli create-admin --email you@example.com --password "YourStrongPassword123"
```

### Create admin (Render Shell)

Only if your plan includes Shell — **Shell** tab on the API service:

```bash
python -m app.cli create-admin --email you@example.com
```

### Re-import content later

```bash
python -m app.cli import-content seed/portfolio-content.json --replace
```

### Notes

- Free Render services **spin down** after inactivity (~50s cold start).
- `IMPORT_SEED_ON_STARTUP=true` only loads seed when the profile table is empty.
- Update `apps/api/seed/portfolio-content.json` locally (`./scripts/save-data.sh`) and redeploy to refresh content.

---

## 2. Frontend on GitHub Pages

### Fix: site shows README instead of the portfolio

GitHub is serving the **`main`** branch. Jekyll turns `README.md` into the homepage.

**Fix (2 minutes):**

1. [Settings → Pages](https://github.com/roshan-alt/portfolio/settings/pages)
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` · **Folder:** `/ (root)`
4. Save, wait 1–2 minutes, open https://roshan-alt.github.io/portfolio/

The `gh-pages` branch is updated automatically by the deploy workflow (built React app).

### One-time GitHub setup (required)

1. Repo → **Settings** → **Pages**
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**
3. **Branch:** `gh-pages` · **Folder:** `/ (root)` → **Save**
4. Wait 1–2 minutes, then open your site URL (shown on the Pages settings page)

> If you previously chose **GitHub Actions** as the source and still see “Site not found”, switch to **Deploy from a branch** → `gh-pages` as above.

### Repository variables

Repo → **Settings** → **Secrets and variables** → **Actions** → **Variables**:

| Name | Value |
|------|--------|
| `VITE_API_URL` | Your Render API URL, e.g. `https://portfolio-api.onrender.com` |
| `VITE_BASE_PATH` | *(optional)* `/` for user site `username.github.io`, or leave unset for `/repo-name/` |

Push to `main` — workflow `.github/workflows/deploy-pages.yml` builds and pushes to the `gh-pages` branch.

### URLs

- **Project site** (repo `portfolio`): `https://roshan-alt.github.io/portfolio/`
- **User site** (repo `roshan-alt.github.io`): set `VITE_BASE_PATH=/`

### Admin CMS

`https://roshan-alt.github.io/portfolio/admin` — login talks to Render API (CORS must include your Pages origin).

### Still 404?

1. Confirm **Settings → Pages** shows branch **`gh-pages`** (not `main`)
2. **Actions** → latest **Deploy GitHub Pages** run is green
3. Open the exact URL from the green box on the Pages settings page
4. Hard-refresh or try incognito (CDN cache)

### Site shows README?

See [Fix: site shows README](#fix-site-shows-readme-instead-of-the-portfolio) above — switch Pages from `main` to `gh-pages`.

---

## 3. Checklist

- [ ] Render API `/health` returns `{"ok":true}`
- [ ] `APP_ORIGINS` matches your exact GitHub Pages URL(s)
- [ ] `VITE_API_URL` set in GitHub repo variables
- [ ] Admin created (bootstrap env, `/auth/setup`, or local CLI — see below)
- [ ] Site loads content; contact form works
- [ ] After local CMS edits: `./scripts/save-data.sh`, commit `data/portfolio-content.json` + `apps/api/seed/portfolio-content.json`, redeploy API

---

## 4. Local preview (production-like)

```bash
cd apps/web
VITE_API_URL=https://your-api.onrender.com VITE_BASE_PATH=/portfolio/ npm run build
npm run preview
```
