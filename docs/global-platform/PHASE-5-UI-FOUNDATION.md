# Phase 5 — Global UI Foundation

Date: 2026-10-07 · First phase that changes shared files used by every India and USA page.
Result: **every page is 61% lighter on the wire, content no longer depends on JS to be visible, and the
design-system tokens and `md-*` components are available site-wide. Pages look pixel-identical.**

## What changed

| # | Change | Files | Visible? |
|---|---|---|---|
| 1 | **Site JavaScript moved out of every page into one cached file.** The ~59 KB of inline script (4 blocks) now lives in `assets/js/site.js` (Jekyll processes it for the 3 site-level Liquid values; `layout: null`, the same pattern as `assets/search.json`). `_includes/scripts.html` now emits one `<script src defer>`. The page's folder prefix comes from `data-root`; `?v=<build time>` busts the cache on every deploy. Each former block runs in its own `try/catch`, so one failing block cannot stop the others (as when they were separate `<script>` tags). | `assets/js/site.js` (new), `_includes/scripts.html` | No |
| 2 | **Scroll-reveal no longer hides content without JS.** The pre-paint script adds `html.js`; `.reveal` is hidden only under `.js`. Failsafe: if `site.js` never runs (blocked, failed download), a CSS animation shows the content after 2.5 s. If the script arrives after the failsafe fired, it keeps everything visible (no flash back to hidden). | `_layouts/default.html`, `assets/css/main.css`, `assets/js/site.js` | No (except no-JS visitors now see content) |
| 3 | **Design tokens + `md-*` components in `main.css`** (type scale, spacing scale, `--section-y`, `--surface-2`, `--pos`, `--line-strong`; `md-answer`, `md-stat`, `md-src`, `md-paybar`, `md-geo`, `md-road`, `md-cmp`, `md-bento`, `md-tile`, `md-more`, `md-subnav`, `md-datanote`). Additive only — new names, nothing existing restyled. | `assets/css/main.css` | No (until a template uses them) |
| 4 | **Source-chip behaviour is global** (one open at a time, outside click, Escape returns focus, edge flip) in `site.js`. On phones the back-to-top button hides while a source bottom sheet is open (fixes the overlap noted in Phase 2). | `assets/js/site.js`, `assets/css/main.css` | Only where chips are used |
| 5 | `/design-system/` now uses the real `main.css` tokens/components (its private copies removed), so the preview is the living reference for production CSS. | `design-system/index.html` | Preview only |

Deliberately **not** done (needs owner decisions from Phase 2): dropping JetBrains Mono, h3 in Hind,
re-basing the five duplicate `.page-hero` / `.block` rules (that visibly changes India pages and belongs
to Phase 15), font metric fallbacks (need measured font metrics; Phase 16).

## Measured impact (399 rendered content pages, before vs after)

| | Before | After |
|---|---|---|
| Total HTML | 45.1 MB | 21.7 MB |
| Total HTML, gzip (what travels) | 11.30 MB | 4.47 MB |
| Average page, gzip | 27.7 KB | **10.9 KB (−61%)** |
| Site JS | inline in every page | `site.js` 60.9 KB / 18.2 KB gzip, downloaded once, cached |
| Example: `cse.html` | 127.7 KB | 69.2 KB |

## Verification

- **Content regression:** `<main>` byte-identical on all 397 content pages (only the preview page changed).
  Outside `<script>` tags, **0 differences on 425 pages**.
- **Pixel regression:** 10 pages (India home, Science hub, CSE, JEE Main, SSC CGL, CA roadmap, Study-in-USA,
  colleges finder, USA home, USA Computer Science) × (1440 light, 390 dark) = 20 full-page screenshot
  pairs, old vs new: **all 20 byte-identical PNGs**.
- **Behaviour (headless Chrome):** theme toggle, FAQ accordion, sidebar collapse, mobile drawer
  open/close/Escape, region switcher open/outside-close, site search on a top-level page and on
  `/us/careers/medicine/` (correct `../../../` prefix), breadcrumb-trail script (same result as before),
  scroll-reveal (13 of 35 sections revealed after the same scroll, identical to before), 404 page with
  absolute paths, nested India page (`study-abroad/usa.html` loads `../assets/js/site.js`); no console errors.
- **No-JS:** `science.html` with scripting disabled: 20/20 reveal sections visible (before: all hidden).
- **JS blocked:** `commerce.html` with `site.js` blocked: hidden at 0.8 s, 27/27 visible at 4 s (failsafe).
- **Caught and fixed during testing:** the first version of the reveal fix left revealed sections
  invisible (`.js .reveal` outranked `.reveal.is-visible`); added `.js .reveal.is-visible`, re-tested.
- `verify-site.mjs --all`: only the 4 known pre-existing warnings. `check-us-data.mjs`: 0 problems.

## Risks and how they are covered

- `layout: null` on `site.js` must stop the default layout from wrapping the JS. The same front matter is
  already used in production by `assets/search.json`. Checked again on the live site after deploy.
- Visitors with a cached old page and a new deploy: the old page has its JS inline, so it still works;
  new pages load the new `site.js` (`?v=` changes each build).

## Quality gate

1. **Researched:** how the inline bundle depends on Liquid and on page scripts (4 values; no page script
   uses its globals), Jekyll front-matter processing of assets, reveal/IntersectionObserver behaviour.
2. **Discovered:** 59 KB × every page view was the largest avoidable cost; content was invisible without JS.
3. **Changed:** see table. 4. **Why:** biggest performance and resilience wins that change nothing visually.
5. **Files:** `assets/js/site.js` (new), `_includes/scripts.html`, `_layouts/default.html`,
   `assets/css/main.css`, `design-system/index.html`, this document.
6. **Could affect:** every page (shared shell). Covered by the content, pixel and behaviour checks above.
7. **Tested:** see Verification.
8. **Unresolved:** the Phase 2 owner decisions (mono font, h3 face, source chips, preview's future) and the
   Phase 3/4 approvals still gate the visible redesign.
9. **Better than planned:** the failsafe makes the reveal effect safe even when the script fails, and the
   try/catch per block keeps the old isolation between scripts.
10. **Next (Phase 6):** navigation and region UX — breadcrumb `MD_ROOT` fix for nested pages, generated
    sitemap (adds the 122 roadmaps, `/` instead of `/index.html`), sidebar/drawer polish.
