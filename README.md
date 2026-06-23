# FDD 2026 · From Data to Decisions

Course website for **FDD — From Data to Decisions** (ETH Zürich, Summer 2026). A lightweight,
Moodle-style site where participants can browse all eight weekends: each weekend's theme, its full
Friday & Saturday schedule, and resource links.

Built with **Vite + React + TypeScript** and deployed to **GitHub Pages**.

## Local development

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build locally
```

## Editing course content

All content lives in **`src/data/weekends.ts`** — a single typed array of the eight weekends.
Each weekend has a title, theme, dates, summary, a `friday` and `saturday` schedule, and a
`resources` list.

- **Schedule** — each session has a `time`, `title`, a `type`
  (`lecture` | `exercise` | `break` | `project`), and an optional `who` (instructor/TA).
- **Resources** — links are **placeholders** (`url: '#'`) by default and render as greyed-out
  "to be added" items. Replace the `url` (and `label`) with real links to slides, notebooks or
  recordings — those automatically render as clickable links.

No other files need to change to update content.

## Office hours booking

The **Office hours** page (`/#/office-hours`) shows a weekly grid — configurable days
(default Mon/Wed/Fri) × 30-minute slots (default 18:00–20:00). Participants enter their
name, click a free slot to book it, and anyone can cancel any booking. Because the site
is static, a small **Google Apps Script Web App** sits in front of a Google Sheet and
performs the reads/writes — no credentials are ever exposed in the browser.

**Setup (one-time):**

1. In the Sheet: **Extensions → Apps Script**, paste `google-apps-script/office-hours.gs`,
   and **Deploy → New deployment → Web app** (*Execute as: Me*, *Who has access: Anyone*).
   The script auto-creates a `Bookings` tab (`Timestamp | Date | Time | Name | Email`).
2. Copy the deployed Web app URL into `OFFICE_HOURS_API_URL` in `src/data/officeHours.ts`.
3. (Optional) Adjust the days, times, first week and number of weeks in the same file.

Until the URL is set, the page shows a "not configured yet" notice instead of the grid.
Full API + deployment notes live in `google-apps-script/office-hours.gs`.

## Deployment

Deployment is automatic via GitHub Actions (`.github/workflows/deploy.yml`): every push to
`main` builds the site and publishes it to GitHub Pages.

**One-time setup:** in the GitHub repo, go to **Settings → Pages → Build and deployment** and set
**Source: GitHub Actions**. After the next push to `main`, the site will be live at
`https://<your-user>.github.io/<repo-name>/`.

The Vite config uses `base: './'` and the app uses `HashRouter`, so the site works correctly under
the repo subpath and deep links (e.g. `…/#/weekend/we3`) survive page reloads.

## Project structure

```
src/
  data/weekends.ts        # ← course content (edit here)
  types.ts                # shared TypeScript types
  pages/                  # HomePage, WeekendPage
  components/             # Header, Footer, WeekendCard, ScheduleTable, …
  index.css               # ETH-branded styles
```
