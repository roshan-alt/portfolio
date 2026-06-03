# GitHub Pages — fix “not working”

## Correct settings (required)

1. Open **Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages`
4. **Folder:** `/ (root)` — not `main`, not `/docs`
5. Save and wait 2 minutes

**Your site:** https://roshan-alt.github.io/portfolio/

If you see the **README** instead of the app, Pages is pointed at `main` — switch to `gh-pages` as above.

---

## Required GitHub variable

**Settings → Secrets and variables → Actions → Variables**

| Name | Value |
|------|--------|
| `VITE_API_URL` | Your Render URL, e.g. `https://portfolio-api-2xt8.onrender.com` |

Push to `main` or re-run **Deploy GitHub Pages** after setting this.

---

## Render CORS

On Render → **portfolio-api** → **Environment**:

```text
APP_ORIGINS=https://roshan-alt.github.io,https://roshan-alt.github.io/portfolio
```

Redeploy API after saving. First request after idle can take ~30s (cold start).

---

## Push latest code

From your machine:

```bash
cd /path/to/portfolio
git push origin main
```

Wait for the **Deploy GitHub Pages** workflow to finish (Actions tab).

---

## Local dev

```bash
# Terminal 1 — API
cd apps/api && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Web
cd apps/web && npm run dev
```

Open http://localhost:5173 (not the GitHub URL).

---

## Wrong vs right

| Symptom | Cause | Fix |
|---------|--------|-----|
| README on screen | Pages uses `main` | Use **gh-pages** / root |
| Black screen + API hint | API down or CORS | Render + `VITE_API_URL` |
| “Something went wrong” | React crash (often 3D) | Pull latest `main`, redeploy |
| 404 on `/portfolio/` | Wrong URL | Repo `portfolio` → use `/portfolio/` trailing slash |
