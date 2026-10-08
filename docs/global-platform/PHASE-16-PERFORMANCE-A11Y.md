# Phase 16 — Performance and accessibility audit

Date: 2026-10-08. Tools: Lighthouse 13.5 (mobile, simulated throttling) on 12 live pages; axe-core 4.11
(WCAG 2.0/2.1/2.2 A + AA) on 14 rendered pages in light and dark mode (28 runs); a WCAG contrast
calculation over every text/background token pair. Fixes are in shared files only (no page content).

## Pages audited

India home, CSE, SSC CGL, CA roadmap, Study in the USA, Science hub, USA home, USA Computer Science,
CS salary, Medicine colleges, Nursing license, F-1 work authorization, Accounting vs Finance
(+ `colleges-btech.html` for axe).

## Findings and fixes

| # | Finding | Fix | Commit |
| --- | --- | --- | --- |
| 1 | Google Fonts CSS blocked first paint (~0.9 s on a phone); LCP element is the hero `h1` | Fonts stylesheet loaded with `preload` + `onload` (noscript fallback). `display=swap` was already set, so text behaviour is unchanged | f5eab4b |
| 2 | `main.css` had no cache-busting version (site.js did) | `main.css?v=<build time>` | f5eab4b |
| 3 | Dark mode never defined `--gold-strong`: ~29 India text uses (tags, numbers, card links) showed #96590A on navy, 2.4–3.2:1 | Dark `--gold-strong:#F0B65A` (7.4:1+); the 3 background uses under white text keep #96590A (5.6:1) | f5eab4b |
| 4 | Dark stream badges: white on #3FA78D, 2.9:1 | Badges keep their deep light-mode colours in dark (6.0–7.1:1) | f5eab4b |
| 5 | Light `.stat-badge.is-tag`: 4.35:1 | Link colour #8A5208 (4.94:1) | f5eab4b |
| 6 | Sideways-scrolling tables not reachable by keyboard (axe `scrollable-region-focusable`, WCAG 2.1.1) | site.js gives scrolling `.table-wrap` `tabindex="0"`, `role="region"` and a name (caption or nearest heading); re-checked on resize and when a folded section opens; visible focus ring | f5eab4b |
| 7 | Accessible name did not contain the visible label (WCAG 2.5.3): Phase 15 fold buttons, and ~576 "View guide" links in 145 India pages named "Read the CA guide" | Fold buttons: "Show details: <heading>". Links: site.js renames "Read the X guide" to "View guide: X" at runtime (India HTML protected) | f5eab4b |
| 8 | Footer column headings were `h4` after page `h2`s (heading order) | `h2` with the same footer style | f5eab4b |
| 9 | Tried: loading gtag.js after `load` when idle | **Reverted.** Local A/B (3 runs × 3 pages): the original `async` tag scored better (CSE 91–92 vs 79–84; LCP 2.4–2.7 s vs 2.7–3.9 s) because the deferred script's long tasks landed later and grew | this commit |

`colleges-btech.html` "missing title" is a local-render artefact: it is a `redirect_from` stub and the live
page has `<title>Redirecting…</title>`.

## Results

axe-core after the fixes: **0 violations on all 28 page/mode runs** (before: 4 rule types —
label-in-name, scrollable region, colour contrast, plus the redirect-stub title).

Lighthouse accessibility on the 12 live pages: 94–100 → **100 on all 12**. Best practices and SEO: 100.

Performance — **the reliable evidence is the local A/B** (same machine, same throttling, 2–3 runs each):
before → after the fonts change, LCP ~6.5 s → 2.4–3.6 s and score 65–68 → 81–96 (India home, USA home,
CSE, CA roadmap, USA CS). Live single runs are too noisy to compare page by page: after the final deploy
(fcc3542), two runs per page gave e.g. CSE 52/68, USA home 96/57, Nursing 87/72, with LCP 1.2–5.9 s on the
same page, because Google Fonts and network timing vary per run. For reference, the first live pass (before any fix, one run each):
India home 77, CSE 51, SSC CGL 57, CA roadmap 99, Study in the USA 74, USA home 77, USA CS 91, CS salary 57,
Medicine colleges 87, Compare 84, F-1 work 85, Nursing license 65 (accessibility 94–100).

CLS stays "good" everywhere (≤ 0.04; India home 0.026 → 0.038 as fonts now swap after first paint).

## Not changed (and why)

- **Cache lifetime 10 min** (Lighthouse "efficient cache"): fixed by GitHub Pages; versioned URLs make it safe.
- **Unused JavaScript ~68 KB**: Google Analytics' own library.
- **main.css render-blocking / unused CSS** (179 KB raw, 38 KB gzipped, one file for all pages): splitting
  critical CSS needs a build step GitHub Pages does not run. Candidate for later.
- **Minify CSS/JS** (~6 KB each): no build step; small gain.
- **Font metric fallbacks** (planned in Phase 1): CLS is already ≤ 0.04, so not worth per-OS `size-adjust`
  tuning now.
- **Source fix for the 576 link names**: the runtime fix works for assistive tech; editing the 145 India pages
  is the owner's call.

## Quality gate

1. **Researched:** Lighthouse + axe on representative India and USA pages, both themes; token contrast maths.
2. **Discovered:** dark mode missing `--gold-strong`; deferring analytics made things worse (measured, reverted).
3. **Changed / 5. Files:** `_layouts/default.html`, `_includes/footer.html`, `assets/css/main.css`,
   `assets/js/site.js` (`_includes/analytics.html` restored to its Phase 15 state).
6. **Could affect:** every page (head, footer tag, colours in dark mode). Rendered `<main>` and footer content of
   all 480 pages unchanged. 7. **Tested:** see Results.
8. **Unresolved:** items under "Not changed". 9. **Better than the brief:** measured A/B before keeping a change.
10. **Next (Phase 17):** SEO and indexation audit.
