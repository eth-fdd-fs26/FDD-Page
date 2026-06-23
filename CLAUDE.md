# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Note: a parent-directory `CLAUDE.md` (`/Users/adrianvalica/Documents/CLAUDE.md`) describes an unrelated Java/Gradle project. It does **not** apply here — this repo is a Vite + React + TypeScript site.

## What this is

Course website for **FDD 2026 — From Data to Decisions** (ETH Zürich, Summer 2026). A static, Moodle-style site listing eight course weekends, each with its Friday/Saturday schedule, a theme, and resource links, plus a calendar view with `.ics` / Google Calendar export. Deployed to GitHub Pages.

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:5173
npm run build    # tsc -b (type-check) + vite build into dist/
npm run preview  # serve the production build locally
```

There is no test suite, linter, or formatter configured. `npm run build` is the only correctness gate — it type-checks via `tsc -b` before bundling, so run it to verify changes.

## Architecture

- **Content is data, not markup.** All course content lives in `src/data/weekends.ts` — a single typed `Weekend[]` array (see `src/types.ts` for the shape). Pages and components render from this array; updating content normally means editing only this file. Resource links default to `url: '#'` placeholders that render greyed-out as "to be added"; replacing the `url` makes them render as real clickable links.
- **Calendar is derived.** `src/data/calendar.ts` builds `CourseEvent`s from `weekends.ts` (weekend events from `startISO`, plus deadlines). `src/lib/ics.ts` turns those into an RFC 5545 `.ics` download and Google Calendar template URLs. Don't hand-maintain calendar events — they flow from the weekend data.
- **Routing:** `HashRouter` (in `src/main.tsx`), routes defined in `src/App.tsx` (`/`, `/weekend/:id`, `/calendar`, catch-all → `/`). Hash routing + `base: './'` in `vite.config.ts` are deliberate so deep links and assets work under the GitHub Pages repo subpath. Keep both if touching routing/build config.
- **Dates:** use the helpers in `src/lib/date.ts`, which operate on ISO `YYYY-MM-DD` strings (UTC-safe). Avoid introducing `Date`-parsing logic elsewhere.
- **Styling:** plain CSS in `src/index.css` (no CSS framework). Design follows a flat ETH/Swiss aesthetic — avoid gradients, drop shadows, and emoji (see the design-style memory).

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages. Commit/push only when asked.

## Notes

- The `.venv/` (Python + openpyxl) and `FDD 2026 master spreadsheet.xlsx` are the source the weekend data was extracted from by hand — not part of the build or runtime.