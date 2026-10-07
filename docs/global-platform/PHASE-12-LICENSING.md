# Phase 12 — Licensing + Exams (state variation)

Date: 2026-10-07. The 23.5-screen `/us/professional-licenses/` page is split as approved in Phase 3:
a short **hub** (compare table, changes to watch, FAQ) plus **9 license pages** at
`/us/professional-licenses/<id>/` (medicine, law, cpa, pe, nursing, pharmacy, dentistry, physical-therapy,
psychology). Each license page holds the state variation for that license.

## Research and data decisions

- **State variation = published compact / transferable-exam lists only.** Licensing rules differ by state
  board in many small ways; copying 50 boards × 9 licenses would be unverifiable. What the owners of the
  rules publish as one list is the interstate status, so that is what the pages show, state by state:
  - **NLC** (nursing): 40 implemented with dates + 3 enacted, not yet fully implemented (Guam, Massachusetts,
    U.S. Virgin Islands) — from the NLC map PDF (43 jurisdictions, matches the NLC home page).
  - **IMLC** (medicine): 40 member states that can be State of Principal License, 2 members that cannot
    (Hawaii, Vermont), 4 passed but not yet issuing, 1 with legislation introduced (New York) — read from the
    colours of the IMLC participating-states map in headless Chrome and matched to its legend.
  - **PT Compact** (physical therapy): 38 issuing and accepting + 3 enacted, not yet active.
  - **UBE** (law): 42 jurisdictions with first UBE administration, from NCBE's list.
  - **Links only:** PSYPACT (psypact.gov blocks automated readers, so its list is not copied), CPA (NASBA),
    PE (NCEES). These show a short description and the official link, no state list.
- Every list has `checked` and `review_by` (2027-01-05). The checker fails after `review_by`, so a stale
  membership list cannot stay live silently. Group labels and meanings are the source's own wording.
- A state not on a list is shown as "not on the … list we checked", never as "not allowed".

## What each license page has

1. Answer-first header: who grants it, number of national exams, experience, "other states" (compact name and
   count, or "Apply state by state").
2. **How to get licensed:** the same roadmap the career pages use (shared include), plus routes to qualify
   (e.g. CPA's three education/experience routes).
3. **The exams** with source chips (shared include).
4. **State rules and other states:** the board-level note, then the compact component: what it does, a
   **Check a state** picker (all 50 states, DC and 5 territories), the status groups as HTML (works without
   JS; groups of 8+ states start closed), and a source chip with checked / next-review dates.
5. **Good to know:** not always required, changes to watch.
6. Careers that use the license (with BLS median pay), sources, methodology link.

The hub keeps its old `#medicine`-style anchors on the table rows, so old links still land on the right row.
Career pages, colleges pages and the sidebar now link to `/us/professional-licenses/<id>/`.

## Files

- Data: `_data/us/compacts.yml` (new), 5 new sources in `sources.yml`, 9 search entries in `search.yml`,
  sidebar links in `nav_us.yml`.
- Templates: `_includes/us-license-page.html`, `us-compact.html`, `us-license-steps.html`, `us-exam-list.html`
  (new). The roadmap and exam list moved out of `us-career-v2.html` into the shared includes (rendered output of
  career pages unchanged apart from whitespace and the new link targets). Stubs:
  `us/professional-licenses/<id>/index.html` (9). Hub rewritten: `us/professional-licenses/index.html`.
- CSS: `.md-compact*`, `.md-state-list`, `.md-stat-long` appended to `main.css`.
- Tooling: `check-us-data.mjs` (every license has a page; compact lists have dates, `review_by` not passed,
  canonical state names, no state in two groups, known licenses and sources). `DATA-REFRESH.md`: compact step.

## Verification

- `check-us-data.mjs`: 0 problems (87 sources, 9 licenses). Negative test: `review_by` set to 2026-01-01 →
  1 problem. `verify-site.mjs --all`: only the 4 known warnings (448 pages). Render: 480 pages, 0 errors, no
  Liquid left in the new pages. Include parameters use plain variables only (`page.license`, `P.license`).
- Headless Chrome: Nursing picker — Texas "Implemented (since Jan. 19, 2018)", California "not on the NLC list",
  Guam "Enacted, not yet fully implemented" with its note. Medicine at 390 px dark: New York "legislation
  introduced", Vermont "member, not SPL", no horizontal overflow; source popover fits (12–378 px of 390).
  Law: Wisconsin "since July 2026". Physical therapy without JS: 41 states listed in HTML. Psychology: link
  only, no picker. Hub: 9 rows, `#cpa` anchor works, 4.8 phone screens. Sidebar highlights the current license.
- Phone length (main): CPA 4.4, Medicine 5.6, hub 4.8. Phase 3 hoped for 2–3 screens per license page; the
  roadmap + exams + state section need more, but every section is a real question.
- **Caught and fixed while resuming after the interruption:** the compact component had no CSS (cramped,
  one-column 40-state list); the 42-state UBE list was open by default (Law grew to 7.6 screens); sidebar
  children still pointed at hub anchors; the PSYPACT note mentioned bots to readers.

## Quality gate

1. **Researched:** NLC, IMLC, PT Compact, NCBE UBE, PSYPACT, NASBA, NCEES official pages (dated 2026-10-07).
2. **Discovered:** IMLC and PSYPACT do not publish plain-text lists (map / bot wall); NCBE's old UBE URL is 404.
3. **Changed / 5. Files:** see above. 4. **Why:** one page per license search intent, with state variation
   from lists that can be re-checked.
6. **Could affect:** USA pages only (career pages via the shared includes). 7. **Tested:** see Verification.
8. **Unresolved:** per-state board rules beyond compacts (CPA 150-hour vs new 120-hour routes by state, PE
   experience rules) are links, not data; the local render does not build `sitemap.xml`, so the 9 new URLs
   are confirmed in the live sitemap after deploy.
9. **Better than the brief:** compact lists carry a review date that the checker enforces.
10. **Next (Phase 13):** international students rebuild (USCIS, dated).
