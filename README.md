# JD: Johan Derick's portfolio

React 19, TypeScript and Vite, with no UI or animation libraries. The concept is **"Free Period"**: the site is a school day.

- **Today's timetable.** The hero's signature moment is a timetable card that writes itself in row by row. It doubles as the table of contents and circles the period it is right now on the visitor's own clock. The bell times are FreeBoard's real default periods, including its 15-minute break, which this site uses for Recess. Once the card scrolls away, the timetable docks into the nav (a bottom strip on phones), and the current cell fills as you read.
- **Section bells.** Every section opens with its period cell stamping in, its time "ringing" and a rule running across, and the nav cell rings when the period changes.
- **Ink.** Blue-ballpoint notes (Kalam), arrows and circles that draw themselves when scrolled to, highlighter swipes, and pen-stroke underlines on link hover.
- **Case studies.** `/work/freeboard` covers the problem, decisions, an explorable schema, a step-through auth sequence diagram, a query demo, trade-offs, and real screenshots. `/work/risk-predictor` covers the data, the labels, the leakage, an explorable model comparison and confusion matrix, and what the model really learned.
- **Recess.** Browser ports of Hand Cricket, Tic Tac Toe (all three AI levels from the web version, plus 2-player), FLAMES and Rock Paper Scissors, each linking to its repo. All of them work by keyboard.
- **Two easter eggs.** Read every period down to the footer and a "full attendance" stamp draws itself in the margin. Type ↑↑↓↓←→←→BA to bunk class.
- **Polish.** Open Graph images per page, a favicon set, a 404 ("You've bunked into a page that doesn't exist"), and print styles that turn the site into a one-page résumé (Ctrl/⌘+P, or "Print" in the Ctrl/⌘+K palette).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, client build, server render, prerender into dist/
npm run lint
npm run preview    # rough preview; see the note below
```

`npm run build` prerenders every route (`/`, `/work/freeboard`, `/work/risk-predictor`, `404.html`) to static HTML (`scripts/prerender.mjs`). Each page is complete without JavaScript: the CSS is inlined, the app bundle loads after first paint, and below-the-fold sections hydrate one at a time (`src/deferred.ts`). Note that `vite preview` serves `index.html` for every path, so test the case-study pages and 404 behaviour on a real static host, or any server that maps `/dir` to `dir/index.html`.

## Where to edit things

| What | File |
|---|---|
| Name, intro, **LinkedIn / email / résumé links** | `src/config/site.ts` |
| Projects, status, links, case-study routes | `src/data/projects.ts` |
| FreeBoard case study (features, decisions, schema, auth steps, trade-offs, screenshot captions) | `src/data/freeboard.ts` |
| Risk Predictor numbers (from `reports/metrics.json`) | `src/data/risk.ts` |
| Bell times and what each period holds | `src/data/timetable.ts` |
| Skills, notes, journey, the "Now" card | `src/data/content.ts` |
| Colours, type scale, spacing, fallback-font metrics (light + dark) | `src/styles/tokens.css` |
| Ink, nav, hero, section heads, footer | `src/styles/notebook.css` |
| Home sections / games / case studies / print | `home.css`, `games.css`, `case.css`, `print.css` |
| Page titles, descriptions, OG images | `src/routes.ts` |

Rules the content follows. Keep them when you add things:

- Every project claim was checked against the repo's code or README in October 2026.
- `status` is one of `Live`, `Complete · runs locally`, `Command-line program` or `In browser`. Only use `Live` when a URL actually responds.
- Links set to `null` in `site.ts` are hidden, never replaced with a placeholder.
- Skills are `used` (with the project where they were used) or `learning`. There are no percentages.
- FreeBoard's Pings code isn't enabled (its router isn't mounted), so it isn't described anywhere.

## Screenshots

`public/work/freeboard/*.webp` are captures of the deployed frontend (freeboard-phi.vercel.app). The sign-in page is real. For the signed-in screens, the API calls were answered with sample data (Sample Student, Aarav K, Tony, Kabir R, Amir K, Rohan M), so no real student's name or timetable is published. The captions on the site say so.

## Fonts

Fraunces, IBM Plex Sans/Mono and Kalam are self-hosted and subset to the characters the site uses (`src/assets/fonts/`, about 160 kB in total). Metric-matched fallbacks (`tokens.css`) keep the layout still while they load. If you start using a new character (a new symbol, an accented letter), add it to `scripts/subset-fonts.py` and re-run it:

```bash
pip install fonttools brotli
python scripts/subset-fonts.py
```

## Contact form

The form has three modes, chosen automatically:

1. **Endpoint**: if `VITE_CONTACT_ENDPOINT` is set at build time, the form POSTs JSON to it.
2. **Mail app**: otherwise, if `links.email` is set in `site.ts`, submitting opens the visitor's mail app with the message pre-filled.
3. **Off**: otherwise, the form is shown as "not configured" and points to GitHub. It never pretends to send.

### Optional backend (`server/`)

A small FastAPI app that validates the message and emails it to you over SMTP. It stores nothing.

- Validation with length limits, single-line name and email (blocks header injection), and a body-size cap
- A honeypot field for simple bots
- Per-IP rate limiting (in-memory; use a shared store if you run more than one instance)
- CORS limited to `ALLOWED_ORIGINS`; docs/OpenAPI routes are disabled
- Secrets only from environment variables (`server/.env.example`)

```bash
cd server
python -m venv .venv && .venv\Scripts\activate      # Windows
pip install -r requirements-dev.txt
pytest -q                                            # 7 tests
copy .env.example .env                               # then fill it in
uvicorn main:app --reload --port 8000
```

Then build the site with `VITE_CONTACT_ENDPOINT=https://<your-server>/contact`.

## Deploy

The build output is static, so any static host works.

- **Vercel**: import the repo, framework "Vite", build `npm run build`, output `dist`. Vercel serves `dist/work/freeboard/index.html` at `/work/freeboard` and `404.html` for unknown paths automatically. OG image and canonical URLs become absolute from Vercel's production URL. Elsewhere, set `SITE_URL=https://your-domain` when building.
- **GitHub Pages**: works at a domain root. For a `/<repo>/` subpath, set `base` in `vite.config.ts` and the matching `base` in `scripts/prerender.mjs`.

## Accessibility & motion

- Semantic landmarks, a skip link, visible focus rings, labelled controls, and AA contrast (the confusion matrix puts values on paper labels because no ink colour clears 4.5:1 on every fill).
- Keyboard: `Ctrl/⌘ + K` opens quick navigation. Hand Cricket takes keys 1–6, Tic Tac Toe takes arrow keys and Enter, and Rock Paper Scissors takes r/p/s.
- The theme follows the OS until the visitor picks one; the choice is remembered in localStorage. Light and dark are designed separately.
- With `prefers-reduced-motion`, nothing animates and nothing is hidden: every ink stroke is shown fully drawn.
