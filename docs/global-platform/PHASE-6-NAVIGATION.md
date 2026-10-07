# Phase 6 — Navigation + Region UX

Date: 2026-10-07 · Builds on Phase 5 (`assets/js/site.js`).

## Audit (what was checked)

| Area | Finding | Action |
|---|---|---|
| Region switcher (`<details>` dropdown) | Works without JS; `aria-current` + check mark; Escape / outside click; arrow keys; destination is a real same-field page or the edition home; URL beats `localStorage['md-region']`. Re-tested in Phase 5 (open, outside-close). | **Kept.** `md-region` unchanged; no migration needed. |
| Breadcrumb | `<nav aria-label="Breadcrumb">`, `aria-current="page"`, edition-aware home crumb. | Kept. |
| Breadcrumb-trail script | Fetched `assets/crumb-map.json` without the folder prefix, so on any nested page (`study-abroad/…`, `us/…`) it requested `/<folder>/assets/crumb-map.json` → 404. | **Fixed** (uses the `data-root` prefix). |
| Mobile drawer | Focus moved into the drawer and Escape returned it, but the page behind stayed focusable: Tab left the open drawer and screen readers could read the covered page. | **Fixed:** while the drawer is open on small screens, `.app-main`, the back-to-top button and the skip link are `inert`; removed on close (button, scrim, Escape) and when the window grows to desktop. On phones the drawer and scrim sit above the top bar, so the hamburger is never needed to close it. |
| Sitemap | Hand-maintained (228 URLs), missed all 122 roadmap pages, listed `/index.html` while the canonical is `/`. | **Replaced by a Jekyll-generated `sitemap.xml`.** |

## Generated sitemap

`sitemap.xml` is now a Liquid template (`layout: null`) that loops over `site.html_pages` and skips
redirect stubs (`redirect_to`), `sitemap: false`, `robots: noindex` pages (e.g. `/design-system/`), the 404 page
and the Search Console verification file. `<loc>` uses `page.url | absolute_url`, the same expression as
the canonical tag, so the two can never disagree.

Rendered like Jekyll (all front matter + `_config.yml` defaults): **228 → 350 URLs**. Removed exactly one
(`/index.html`), added `/` and the 122 `roadmaps/*` pages. No other URL changed. Future pages appear
automatically; pages that must stay out use `sitemap: false` or `robots: noindex`.

## Verification

- All HTML pages byte-identical to Phase 5 (only `site.js` and `sitemap.xml` changed).
- Drawer at 375 px: opening it makes the page behind inert and focuses the drawer; focusable elements
  outside the drawer while open: **0** (search overlay excluded); closing via Escape (focus back to the
  menu button), close button, and scrim all restore the page; opening it and then widening to 1440 px
  leaves nothing inert.
- Nested page `study-abroad/usa.html?from=science` now requests `/assets/crumb-map.json` (was
  `/study-abroad/assets/crumb-map.json`).
- `verify-site.mjs --all`: only the 4 known pre-existing warnings. No console errors.

## Not changed (needs Phase 3 approvals)

The sidebar structure and labels (USA home → router, licenses hub + 9 pages, career sub-nav) depend on the
Phase 3 URL decisions; the `md-subnav` component is ready for Phase 7.

## Quality gate

1. **Researched:** region switcher, breadcrumb, trail script, drawer focus behaviour, sitemap vs canonical.
2. **Discovered:** a latent 404 in the trail script on nested pages; no focus containment in the drawer;
   122 indexable pages missing from the sitemap.
3. **Changed:** `assets/js/site.js` (trail fetch prefix, drawer inert background), `sitemap.xml`
   (generated), this document.
4. **Why:** accessibility (WCAG 2.4.3 focus order, 2.1.2 no keyboard trap respected — Escape and the close
   button always work), crawl coverage, and no more manual sitemap drift.
5. **Files:** see 3. 6. **Could affect:** every page's drawer on phones and tablets; search-engine crawling.
7. **Tested:** see Verification; live sitemap checked after deploy.
8. **Unresolved:** Phase 3 nav restructuring awaits approval; lastmod dates are not emitted (no reliable
   per-page modification date on GitHub Pages without a plugin; Google ignores inaccurate lastmod).
9. **Better than planned:** the sitemap is generated with the canonical expression itself, so sitemap and
   canonical cannot drift apart.
10. **Next (Phase 7):** career page system v2 on 2 benchmark pathways (answer-first header, roadmap v2,
    source chips, `/salary/` depth page with OEWS data) — needs the Phase 3/4 approvals or a go-ahead to
    proceed with the recommended defaults.
