# Session Notes — Recipe Book

## What This Project Does
A personal recipe book web app. Users paste a URL from any food blog; the app strips and stores only raw ingredients + instructions (no filler). Users can also create recipes manually. Inline unit conversion (US ↔ metric) via toggle. Single-user, no auth.

## Current Status
Planning phase — 5 UI mockups being built for style selection before any app code is written.

## Key Decisions
- Supabase for storage (new project, single user — no auth for now)
- Supabase edge function as proxy for URL fetch/parse (CORS workaround)
- schema.org/Recipe JSON-LD as primary parse strategy, HTML heuristic as fallback
- Unit conversion: toggle button per recipe (show both inline when toggled)
- Stack: React 18 + TypeScript + Vite + Tailwind + Supabase

## Todo
- [ ] Pick UI style from 5 mockups
- [ ] Scaffold React app
- [ ] Create Supabase project + migrations
- [ ] Build edge function: url-scraper (fetch + parse schema.org/Recipe)
- [ ] Build recipe CRUD (list, add by URL, add manual, view, delete)
- [ ] Unit conversion logic
- [ ] Connect to Supabase

## Session Log
### 2026-04-14
- Project initiated. Legal review: personal use scraping is low risk; ingredients not copyrightable; instructions are but fair use applies for private use.
- Confirmed: Supabase backend, no auth, unit toggle, 5 UI mockups before build.
- Created project folder + SESSION_NOTES.md.
- Building 5 HTML mockups for style review.
