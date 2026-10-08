# Phase 15 — India rollout of proven shared components

Date: 2026-10-08. First phase that visibly changes India pages. Rule kept from Phases 1–3: India URLs
and content are protected, so **no India HTML file was edited**. The change is three shared files:
`assets/css/main.css`, `assets/js/site.js` and one line in `_layouts/default.html`.

## What changed

The Phase 3 "supporting tier" (§6) as one level of disclosure. On India pathway pages (122 pages whose
`<main>` has `#quick` and `#roadmap`) and govt exam pages (22 pages with `#pattern` and `#syllabus`), these
sections now show only their heading and a **Show details** button:

| Pages | Folded sections (when present) |
| --- | --- |
| Pathway | `#subjects`, `#higher`, `#proscons`, myths, comparison, and on the few pages that have them `#future`, `#difficulty`, `#skills`, tips |
| Govt exam | `#syllabus`, `#prep`, comparison |

Everything a student needs first stays open: at a glance, what, who, eligibility, roadmap, admission, fees,
salary, jobs, exam pattern, FAQ, related.

## How it works (and why it cannot hide content by mistake)

- **CSS** hides everything after `.section-head` in those sections, gated by `html.js.fold`, `:has()` and the
  page-type test, so it applies before first paint (no layout shift). Folded sections also get a slimmer band.
- **`html.fold`** is set by the inline head script in `default.html`, which ships in the same HTML as the new
  `site.js?v=<build>`. Old cached HTML (old JS) never has `fold`, so new CSS cannot hide anything there.
- **`site.js`** adds the button (reuses the India `.readmore-btn` look, `aria-expanded`, `aria-controls`,
  `aria-label` "Show: <heading>"). If a stale cached `main.css` does not hide the content, no button is added.
- **Links still land:** `revealTarget()` (used by in-page links, the "On this page" nav and `#hash` arrivals)
  now calls `window.mdFoldOpen()`, and a `hashchange` listener covers address-bar and back/forward changes.
- **No JS or no `:has()`** (older browsers): nothing is hidden; the page is exactly as before.
- **Print:** everything is shown, buttons hidden. Content stays in the HTML for search engines.

## Measured (390 × 844, `scripts/measure-pages.mjs`, all 480 pages before and after)

| Group | Median screens | Longest |
| --- | --- | --- |
| India pathway (122) | 14.3 → **12.0** | 23.4 → 17.0 (`cma.html`) |
| India govt exam (22) | 18.1 → **14.9** | 22.2 → 18.2 (`ssc-cgl.html`) |

No page got longer; no horizontal overflow. Rendered HTML of all 480 pages is identical to Phase 14 apart
from the one head line (and the build-time `?v=`).

**Short of the Phase 3 target** (pathway 8–9, exam ≤ 9). What remains is core content that §6 says must
stay visible: e.g. SSC CGL's `who` 2.6, `eligibility` 2.5, `pattern` 3.1 and `salary` 3.5 screens; CSE's
admission 1.3 and salary 1.2. Getting further needs the primary/secondary tiers below.

## Not done in this phase (need per-page HTML, i.e. an owner decision)

1. **Answer-first header with ₹ stat tiles** and **bento/compact salary tables** (primary and secondary
   tiers): the values live in hand-written HTML on each of the 122 pages, so this means editing protected
   page content (or first moving it to data).
2. **Per-paper disclosure** inside exam syllabus/pattern tables (Phase 3 asked for it per paper; this phase
   folds the whole syllabus section instead).
3. **Stream hub type badges and filter**, and the **R13 "what next" block** on every pathway page.

## Verification

- Browser (headless Edge/Chrome): CSE 390 px — 5 folded sections, button opens/closes (`aria-expanded`
  true/false); arriving at `cse.html#subjects` opens it; changing the hash to `#proscons` opens it; the
  "On this page" link to Higher studies opens it. SSC CGL dark: 3 folded sections, no overflow. Without
  JavaScript: nothing hidden. India home, a roadmap page (`roadmaps/ca.html`) and USA pages: no buttons.
- `check-us-data.mjs` 0 problems; `verify-site.mjs --all` only the 4 known warnings; rendered `site.js` passes
  `node --check`.

## Quality gate

1. **Researched:** Phase 3 §6 tiers, section ids across all India pages (619 target sections, all with
   `.container > .section-head` first), per-section heights on CSE, CMA and SSC CGL.
2. **Discovered:** `main.css` has no cache-busting version while `site.js` does — handled with the `fold` gate.
3. **Changed / 5. Files:** `assets/css/main.css`, `assets/js/site.js`, `_layouts/default.html`.
4. **Why:** shorter India pages with zero content removed and no India file edited.
6. **Could affect:** every India pathway and govt exam page (visible); every page gets one head line.
7. **Tested:** see Verification. 8. **Unresolved:** the three items above; target screens not reached.
9. **Better than the brief:** a stale-cache guard in both directions.
10. **Next (Phase 16):** performance and accessibility audit.
