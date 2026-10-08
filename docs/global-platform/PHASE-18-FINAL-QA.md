# Phase 18 — Final global QA and handover

Date: 2026-10-08. Last phase of the 18-phase global-platform plan (`PHASE-1-AUDIT.md`, section J).
This report is the handover: what was checked, what was fixed, the state of the platform, and every open
decision in one place.

## 1. What was checked in this phase

| Check | Scope | Result |
| --- | --- | --- |
| Every page opened in headless Chrome: JS exceptions, console errors, 4xx/5xx and failed requests | 453 rendered pages × 2 (390 px light, 1440 px dark). The crawler was first proved on a page with a deliberate exception, console error and missing image (it reported all 4) | **0 problems** in both passes |
| Interactive smoke tests | theme toggle, mobile drawer (open + Escape), site search ("nursing" → 6 results), edition switcher, FAQ accordion, Phase 15 fold, source chip pop-over at 390 px, salary state picker (Texas → median $132,150 with percentiles), colleges finder (Medicine, Texas → 15 colleges), licence state picker (Ohio), deep link `#cap-gap`, compare table | **All pass** |
| Accessibility (axe-core 4.11, WCAG 2.0/2.1/2.2 A + AA) | 41 pages covering every India and USA page type, light and dark (82 runs) | 6 contrast issues found → fixed → **0 violations** |
| Data checks | `check-us-data.mjs`, `verify-site.mjs --all` | 0 problems; the 4 long-known warnings only |
| Phone length (390 × 844) | all pages | no horizontal overflow anywhere; budgets below |

### Fixed in this phase

- **Regression from Phase 16:** in dark mode the Career Fit submit button showed white text on bright gold
  (1.8:1). Phase 16's search for `--gold-strong` used as a background matched only single-line CSS rules and missed
  this multi-line one; a full parse now confirms exactly 4 such rules, all covered.
- Myth badge (light 4.2:1 → 5.5:1), and in dark mode the myth badge, pros/cons card headings and the roadmap
  "goal" tag (4.1–4.4:1 → 5.4–6.1:1).

## 2. Page length against the Phase 3 budgets (phone screens, 390 × 844)

| Page type | Pages | Median | Max | Budget |
| --- | --- | --- | --- | --- |
| USA career overview | 20 | 7.4 | 9.0 | ≤ 7 (≤ 9 allowed) |
| USA salary by state | 17 | 6.0 | 6.3 | — |
| USA colleges | 20 | 6.3 | 7.0 | — |
| USA license | 9 | 3.8 | 5.4 | 2–3 hoped |
| USA compare | 4 | 4.1 | 4.1 | ≤ 4 |
| USA hubs (high school, tests, college, careers, licenses, international) | 6 | 11.4 | 13.0 | ≤ 8 |
| **USA edition home** | 1 | **29.9** | — | **≤ 5** |
| India pathway pages | 122 | 12.0 | 17.0 | ≤ 9 |
| India roadmap pages | 122 | 3.2 | 4.3 | — |
| India home | 1 | 9.6 | — | ≤ 5 |

**Biggest remaining gap:** the USA home was approved in Phase 3 to become a router page (≤ 5 screens: answer-first
intro, entry doors, compact pathway grid), but no phase in the plan's table was assigned to it, so it was never
rebuilt. The USA hubs are also over budget. Recommended as the first follow-up job.

## 3. What the 18 phases delivered

| Phase | Commit(s) | Delivered |
| --- | --- | --- |
| 1 Audit | 2754e83 | Repository, product and page-length audit; phase plan |
| 2 Design system | 2e42c6d | Tokens, md-* components, `/design-system/` preview |
| 3 Information architecture | 34bc205 | IA rules R1–R14, page budgets, USA URL map, `measure-pages.mjs` |
| 4 Data architecture | a074625 | BLS OEWS and NCES IPEDS pipelines |
| 5 UI foundation | 5151527 | Site JS as one cached file, `.reveal` fix, tokens in production |
| 6 Navigation | 3c214f8 | Drawer accessibility, generated sitemap |
| 7–9 Career pages | c6f5f9e, ce0e1c1, 85b6397…1b2d882 | v2 career template on all 20 USA pathways, 17 salary pages, methodology |
| 10 Geographic data | def396c | State and metro salary views, refresh safety |
| 11 Colleges | c8438d0, 727774c | 20 colleges finders from IPEDS; include-syntax lint after a Pages build failure |
| 12 Licensing | ffe38bb | 9 license pages, state-by-state compact status with review dates |
| 13 International students | 7504977 | Hub rebuild, work-authorization page, dated 2026 changes |
| 14 Comparisons | 2ed4d7f | 4 curated comparison pages with the R9 rule in the checker |
| 15 India rollout | 5abf5f2 | Supporting sections folded on 144 India pages, no India HTML edited |
| 16 Performance and accessibility | f5eab4b, fcc3542 | Non-blocking fonts, CSS versioning, dark-mode contrast, keyboard tables, label-in-name |
| 17 SEO and indexation | b797a3e | Indexation verified clean; per-edition social preview images |
| 18 Final QA | this commit | Full crawl, smoke tests, axe sweep, contrast fixes, this handover |

## 4. Open decisions for the owner (all phases, one list)

1. **USA home → router page** (≤ 5 screens) and trimming the 6 USA hubs to ≤ 8 (Phase 3 approval, never scheduled).
2. **India pathway pages to the 8–9 screen target:** answer-first header with ₹ stat tiles and compact salary/fees,
   per-paper syllabus disclosure on exam pages, stream-hub type badges and filters, R13 "what next" block. All need
   per-page HTML changes (India content is protected) — Phase 15.
3. **Long titles and descriptions** (titles > 70 characters on ~350 pages) — Phase 17.
4. **576 "View guide" link names**: fixed at runtime by `site.js`; a source fix means editing 145 India pages — Phase 16.
5. **niche-careers** pages link to 5 redirect stubs (folder off-limits) — Phase 17.
6. **Delete the unused v1 USA career template** `_includes/us-career-page.html` (kept until approved) — Phase 9.
7. **Fonts:** keep or drop JetBrains Mono; h3 typeface — Phase 2/5.
8. **`/design-system/`** preview: keep as a living style guide (noindex today) or remove — Phase 2.
9. **Dead includes** `_includes/finder.html`, `_includes/discovery-search.html` (listed in Phase 1, not deleted).
10. **Later data additions:** per-school cost, admission and graduation rates (IPEDS ADM/GR/COST); per-state
    licensing rules beyond compacts; a cost-of-living view (needs an official source such as BEA RPP).

## 5. Maintenance calendar (the checker enforces the first two)

| When | What | Where |
| --- | --- | --- |
| **by 2026-11-07**, then monthly while the cases are open | Re-check immigration: USCIS OPT/STEM OPT/H-1B pages, the $100,000-payment litigation, the duration-of-status appeal (First Circuit), new SEVP broadcast messages on CPT | `_data/us/immigration.yml` (`checked`, `review_by`) |
| **by 2027-01-05**, then quarterly | Re-check NLC, IMLC, PT Compact and UBE member lists | `_data/us/compacts.yml` |
| November 2026 | Open Doors 2026 international-student numbers | `_data/us/guides.yml` → `international.numbers` |
| Spring each year | BLS OEWS wages (May reference) | `scripts/build-oews.mjs`, DATA-REFRESH §1 |
| Autumn each year | BLS projections / OOH | DATA-REFRESH §2 |
| When released | O*NET database; IPEDS HD/C files (2025 not yet released) | DATA-REFRESH §3–4 |
| Every quarter | Volatile licensing/exam rules (`licenses.yml` → `watch`) | DATA-REFRESH §5 |
| After every push | Confirm the GitHub Pages run succeeded (public API, conclusion `success`) before calling a change live | Phase 11 lesson |

## 6. How to check the site after any change

```
VERIFY_DEPS=<dir with liquidjs + js-yaml> node scripts/check-us-data.mjs
VERIFY_DEPS=<dir with liquidjs + js-yaml> node scripts/verify-site.mjs --all
node scripts/measure-pages.mjs <rendered site dir>      # phone length of every page
```

## Quality gate

1. **Researched:** every rendered page in a real browser (two passes), 82 axe runs, 11 interactive flows.
2. **Discovered:** a dark-mode regression from Phase 16 (fixed) and an unscheduled Phase 3 item (USA home).
3. **Changed / 5. Files:** `assets/css/main.css` (contrast fixes) and this report.
6. **Could affect:** colours of the myth badge, pros/cons headings, goal tag and the Career Fit button.
7. **Tested:** axe 0 violations after the fix; both crawls 0 problems.
8. **Unresolved:** section 4. 10. **Next:** the owner's choice from section 4; the first suggestion is item 1.
