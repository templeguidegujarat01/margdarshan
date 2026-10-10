# Architecture Phase A + B — India career pages from data

Date: 2026-10-08. Status: LLB, CA and CSE migrated; tool proven on all 121 India pathway pages.

## What changed

| Before | After |
|---|---|
| Each India career page was ~430 lines of hand-written HTML | The page keeps only its SEO front matter + `{% include in-career.html career=page.career %}` |
| Content lived inside HTML tags | Content lives in `_data/in/careers/<slug>.yml` |
| Sources: one link at the bottom, if any | `sources:` list → numbered [n] markers on facts + citation block with a Markdown copy |
| No journey overview | `journey:` → "Journey at a glance" table under the hero (cards on phones) |

Files:

- `_includes/in-career.html` — the one template. Every component ("part") renders with the same markup as the old pages.
- `_includes/in-src-ref.html` — the [n] source marker.
- `_data/in/careers/*.yml` — one data sheet per page.
- `scripts/in-extract.mjs` (+ `scripts/lib/html-tree.mjs`) — converts an old page into a data sheet.
- `scripts/check-in-data.mjs` — validates every data sheet (run after any edit).

## Proof that nothing is lost

The extractor stops with an error on any component it does not recognise. On 2026-10-08 all 121 India
pathway pages were converted in a sandbox copy, rendered, and compared with the hand-written versions:

- `<main>` HTML (whitespace-normalised): **identical on 121 of 121 pages**.
- JSON-LD: same, except (a) the FAQ schema is now built from the visible FAQ text (Google requires the
  two to match; a few old pages had slightly different wording in the schema), and (b) the Home
  breadcrumb is `https://emargdarshan.com/` instead of `/index.html` (the canonical home URL).

## How to migrate the next page (Phase B batches)

1. `node scripts/in-extract.mjs <slug>` → writes `_data/in/careers/<slug>.yml` (page untouched).
   Add `--write-page` to also shrink `<slug>.html`. It refuses to overwrite an existing sheet
   unless `--force` (which would lose hand-added journey/sources).
2. Add the editorial blocks by hand: `journey_heading`, `journey:` rows, `sources:` and
   `source: <id>` on the facts they support. Only facts read on the official website; sources get
   `added:` now and `checked: YYYY-MM-DD` once confirmed on the site.
3. Run the checks (need liquidjs + js-yaml in `VERIFY_DEPS`):
   - `node scripts/check-in-data.mjs`
   - `node scripts/verify-site.mjs --all` (now loads nested `_data` folders like Jekyll)
4. Render before/after and compare `<main>` (see "Proof" above) when migrating in bulk.

`scripts/build-roadmaps.mjs` keeps working: migrated pages mention `btn-journey` and `rm-link-card` in
their comment, so the roadmap injector leaves them alone, and the template draws both from `roadmap:`.

## Also in this run

- Brand: `site.title` = eMargdarshan; 409 front-matter titles (title / og_title / twitter_title), 158
  JSON-LD `"name"` values and the roadmap page generator now say eMargdarshan. Body text that says
  "Margdarshan" (for example "Margdarshan USA" in study-abroad portals and US data notes) was not changed.
- LSAT—India removed from the LLB roadmap source as a current exam (LSAC discontinued it from 2025);
  the roadmap was regenerated (`node scripts/build-roadmaps.mjs`, 122 roadmaps).
- Shell polish: footer open-data band aligned to the container, room under the footer and beside its
  last line for the floating buttons, the "On this page" panel stops above them, numbered citation list.

## Open items

- 2026-10-08: the other 119 pathway pages were converted in one run (`--write-page`). Rendered `<main>` and `<head>` identical on 119/119; JSON-LD differs only as described above (FAQ schema from visible text on 50 pages, Home crumb on cpa and cs). They have no `journey:` or `sources:` yet: add them page by page (step 2), from official websites only. `coaching.html` and `colleges.html` are hubs and stay hand-written.
- Journey rows and sources for CA/CSE/LLB were written from official-body knowledge and press reports
  (NIRF 2025 top-5 lists, LSAT—India). None has a `checked:` date yet: confirm each on the official
  website and add the date.
- Government-exam pages (`#pattern` + `#syllabus`) use a different layout and are not covered by the
  extractor yet.

## Brand: Education Margdarshan (2026-10-10)

The official name is **Education Margdarshan** (the "e" in emargdarshan.com stands for Education). Commit
468ec1d changed `site.title`, front-matter titles, JSON-LD names, the footer and the roadmap generator, and
replaced the orange "A" badge with `_includes/logo-mark.html` (one-colour inline SVG: an E whose arms run
into a D bowl, in a fine square frame). The follow-up commit moved the About, Contact and 404 pages,
the study-abroad portal brands ("Education Margdarshan USA" …), the edition og:image alt text and the
"Education Margdarshan's advice" labels on US/UK pages to the full name. The longer page titles are accepted.

Still "Margdarshan" on purpose: the 404 line that explains the word itself ("Margdarshan" means
"path-showing"), code comments, and the data-refresh User-Agent strings. Legal pages (privacy, terms,
cookie policy, disclaimer), hub pages and finder notes also still say "Margdarshan" and are not yet
reviewed.

<!-- TASK (next design iteration): redraw raster brand assets with the E+D mark
     Owner: design. Source of truth: _includes/logo-mark.html and assets/img/favicon.svg.
     - assets/img/favicon-48.png, favicon-192.png, favicon-512.png  (navy #0F2A3D square, light mark)
     - assets/img/apple-touch-icon.png (180x180, no transparency, iOS rounds the corners)
     - favicon.ico (16/32/48)
     - assets/img/og-in.png, og-us.png (1200x630 social cards; still show the old orange "A" badge and the
       name "Margdarshan"); og-uk.png does not exist yet
     Done when: no file under assets/img or the root shows the "A" badge, and the og cards say
     "Education Margdarshan". -->
- [x] Redraw raster brand assets (favicon PNGs, apple-touch-icon, favicon.ico, og-in/og-us cards) with the
  E+D mark. Done 2026-10-10 with the cyan-to-emerald gradient tile; regenerate with scripts/build-brand-assets.mjs.
