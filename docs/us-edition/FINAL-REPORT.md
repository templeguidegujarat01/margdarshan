# USA Edition — final report (USA Master Plan Phase 14, 2026-10-21)

Phase 14 is the closing pass of the USA Master Plan: cross-links, search, navigation, final QA and this report.
The plan itself (14 phases, one prompt each) is the Claude Docs doc "USA Edition Master Plan"; the URL map and the
templates are in `ARCHITECTURE.md`; each phase has its own report in this folder.

## 1. Pages per phase

Counted from each phase commit (`git show --name-status`: new `.html` files outside `_*` folders). Every page is a
stub (front matter + one include); the content lives in `_data/us/`.

| Phase | Commit | New pages | What |
|---|---|---:|---|
| 1 | 7b8e3bc | 9 | Clusters index, 8 live cluster hubs, gateway home rebuilt; old home anchors forwarded |
| 2 (batch 1) | 76ef2ff | 32 | Healthcare & Human Services: 12 careers, 16 roadmaps, 4 license pages |
| 3 (batch 1) | 9c604ea | 23 | Digital Technology + Financial Services, batch 1 |
| 3 (batch 2) | 04ec216 | 28 | 12 Financial Services careers, 4 license pages |
| 4 (batch 1) | 800d896 | 32 | Management & Entrepreneurship, Marketing & Sales (hub live) |
| 4 (batch 2) | 412c920 | 18 | Admin, HR, training, sales engineering, purchasing |
| 5 (batch 1) | 049307b | 25 | Public Service & Safety, Education (teaching license) |
| 6 | 0769f36 | 28 | Construction + Advanced Manufacturing trades and careers, architecture license |
| 7 | afdfb68 | 35 | Supply Chain & Transportation, Energy, Agriculture (veterinary license) |
| 8 | df20c2c | 36 | Arts, Entertainment, & Design; Hospitality, Events, & Tourism (all 14 hubs live) |
| 9 | dd3f40b | 19 | `us/exams/` hub + 18 school-stage exam pages |
| 10 (batch 1) | 3b8e606 | 17 | Graduate admission and health licensing exam pages |
| 11 + 12 (batch 1) | 5924c53 | 21 | States hub, 10 state pages, 10 state licensing pages |
| 13 | 93ac240 | 656 | Colleges hub, 51 states, 493 cities (3+ schools), programs index + 110 program lists |
| 14 | this commit | 1 | No new pages (only `docs/`, which Jekyll does not build); cross-links, search, menu, checks |
| | **Total** | **979** | Master Plan pages, plus ~96 USA pages from before the plan |

The `us/` folder now holds 1,082 `.html` files: 1,075 pages and 7 `redirect_to` stubs (old trade roadmap URLs and
`us/methodology/`). By section: careers 155 (94 generic career pages, 21 pathway pages with their colleges and
salary pages), roadmaps 120 + trade roadmaps 21, trades 21, cluster hubs 14 + index, license pages 22 + index,
exams 35 + hub, states 10 + 10 licensing pages + hub, colleges 656, compare 5, other hubs 8.

The plan estimated ~1,130 pages; 979 shipped because several phases ran only batch 1 (queues in section 4).

## 2. What Phase 14 changed

### 2.1 Cross-links (career → hub, exams, license, state matrix, colleges)

| Page type | Added |
|---|---|
| Generic career page (`us-career-overview.html`, 94) | An exam button for every exam page whose `used_by.need` names the career (its roadmap has the exam as a step), on top of the career's own `exams:` list, never twice. A **By state** row: the license page's state matrix (`#states`) or, without a license, the roadmap's state rules; then every state licensing page that has a card for that license (`_includes/us-state-lic-links.html`). The cluster hub link was already there. |
| Pathway page (`us-career-v2.html`, 21) | The cluster hub link (the hub that lists the pathway in `clusters.yml`) and the same need-based exam links (pathway slug or its roadmap slug) in the hero; state licensing page links under the license block. Before Phase 14 these 21 pages had no link up to a cluster hub. |
| Trade page (`us-cte-career.html`, 21) | A **Career cluster** row (before: only "All trades") and a **By state** row: the roadmap's licensing matrix plus the state licensing pages that cover the trade. |
| USA Home | BreadcrumbList inside its WebPage JSON-LD (it was the only USA page without one). |

Exam buttons gained: physician (MCAT, USMLE, COMLEX-USA), registered nurse and nurse practitioner (NCLEX-RN),
LPN (NCLEX-RN, the next step on its ladder; its NCLEX-PN button now opens the exam page instead of the license
page's exam section), nursing assistant (NCLEX-PN), pharmacist (NAPLEX/MPJE), physical therapist (NPTE), lawyer (LSAT),
management and marketing careers with an MBA gate (GRE, GMAT). The counselor page keeps its "NCE and NCMHCE" button
(license page), so no second NCE button is added: a button is skipped when the career already has that page or name.

Hubs: every career, pathway and trade in `_data/us/careers/*.yml` and `cte_careers.yml` is placed in a cluster
(`check-us-data` already enforced this), and each hub lists all of its careers in its one table (the one-list rule).

### 2.2 Search

- `_data/search.yml`: every USA page is in the index (0 of 1,075 missing; 324 USA entries now carry `g`).
- New search facets in the MdSearch engine (`assets/js/site.js`, between `@search-engine:start/end`):
  - **USA states**: URLs `us/states/<s>/` and `us/colleges/<s>/` (not `fields/`) give the entry a state. A state name
    alone is a hard filter ("texas" → Texas pages only); with other words it ranks that state's pages up (+60) so
    national pages that answer the question still show ("texas plumber license" → plumber roadmap + Texas boards).
    A USA state in the query also makes the search USA-only, like the word "usa". India states are unchanged (hard).
  - **Career Clusters**: `g: <cluster>` on the hub, career, roadmap and program-list entries
    (`scripts/lib/us-cluster-map.mjs`, used by `build-us-colleges.mjs` and `check-search.mjs`). Phrases such as
    "healthcare", "construction", "supply chain" set the cluster; on USA searches its pages rank up (+30) and the
    filter line shows it ("USA · Healthcare"). The words still count as text, so no result is lost.
- `scripts/check-search.mjs`: 26 new USA queries (140 in all), plus two integrity checks: the engine's 14 cluster
  slugs equal `clusters.yml`, and every USA entry for a mapped page carries the right `g`.

### 2.3 Navigation

The USA sidebar (`_data/nav_us.yml`) now has a top-level item for each of the six support hubs: Exams, States,
Licensed Professions, **Colleges & Training** (new item: by state and city, programs by career, apprenticeships,
Trades & CTE), High School and **Paying for College** (renamed from "College & Money"; same page). Career Clusters
lists all 14 hubs. The Trades & CTE hub had no menu link before; it is now under Colleges & Training and in the
footer, which also gained Exams and Colleges & Training. `check-us-data` fails if a support hub, a cluster or
`us/cte/` drops out of the menu.

Correction to the prompt: there is no USA nav script. `scripts/build-nav-mega.mjs` generates only the India top menu
(`_data/nav_mega.yml`; `--check`: up to date). The USA menu is hand-written YAML, validated by `check-us-data`.

### 2.4 Sitemap, canonical, breadcrumbs, JSON-LD

Already automatic: `sitemap.xml` lists every page except redirects / `sitemap: false` / noindex, and the canonical
tag uses the same expression. Crawl result (section 3): all 1,075 USA pages have a canonical URL, are sitemap
eligible, have a visible breadcrumb (except the USA Home) and a BreadcrumbList.

## 3. QA results

- Crawl of the rendered site (3,108 pages): 0 broken internal links, 0 orphan USA pages, every USA page has a
  canonical URL and is sitemap-eligible; BreadcrumbList on all of them after the USA Home fix.
- `check-us-data`, `check-search` (140 queries), every `build-* --check`: 0 problems. `verify-site --all` with the new
  orphan check was still running when this commit was made (not confirmed in this run).
- axe-core (WCAG 2.0/2.1/2.2 A + AA) on 20 sample pages × (1366 light, 390 dark) = 40 runs: 0 violations.
- Phone length (390×844). New phone fold (`data-pfold`, `_includes/phone-fold.html`): below 900px long secondary
  sections show heading + "Show all"; nothing removed; footer lists in two columns. Before → after (screens):
  cluster hubs 7.3–14.9 → 5.2–7.8; USA Home 10 → 7.2; Exams 10.8 → 6.6; States 10.5 → 7.8; Colleges 13.5 → 7.0;
  Programs by career 17 → 6.9; High school 12.9 → 8.0; Trades & CTE 7.5 → 7.0. **Still over 8:** Licensing hub 8.3 and
  Paying for college 8.1 (next fix: fold the licensing overview list and the degrees section).
- Lighthouse: not run in this pass (queued: live spot checks after deploy).

## 4. Open gaps (from the phase reports)

| Area | Open | Where |
|---|---|---|
| Healthcare | Batches 2–4: radiologic techs, dental hygienists, PA (+ license page), OT, SLP, dentist and psychology roadmaps, respiratory therapists (+ license), … | `PHASE-2-HEALTHCARE.md` §5 |
| Digital Technology | Batch 3: IS managers, network architects, DBAs, programmers; unmanned vehicle technology (no crosswalk SOC) | `PHASE-3-DIGITAL-FINANCE.md` §4 |
| Financial Services | FINRA/NASAA securities registration page; more insurance-producer and appraiser state rows | same |
| Public Service, Education | Batch 2: preschool teachers, principals, judges, urban planners, wardens; Coast Guard enlisted age | `PHASE-5-…md` §4 |
| Construction, Manufacturing, Transport, Energy, Agriculture, Arts, Hospitality | More careers per cluster and more state rows (lists in each report §4) | Phases 6–8 reports |
| Exams | Batches 2–4: bar/MPRE, CPA Exam, FE/PE, ARE, FINRA, CFA; Praxis and state teacher tests, NREMT, CDL, FAA, EPA 608, ASE; FSOT, ASTB, AFOQT, SIFT, federal assessments; then link the remaining roadmap exam gates | `PHASE-10-EXAMS.md` §4 |
| States | 41 state pages (batch 2: NJ, VA, WA, AZ, TN, MA, IN, MO, MD, CO, then the rest); board gaps for the 10 built states (IDFPR, LARA, sos.ga.gov, ncbon and others blocked or 404) | `PHASE-11-12-STATES.md` §4–5 |
| Colleges | Territory pages (Puerto Rico 137 schools); yearly Scorecard / IPEDS refresh | `PHASE-13-COLLEGES.md` §5 |
| Coaching | None by design (owner decision 1: no private centres; every exam page has the owner's own free practice) | Master Plan §11 |
| Retired template | `_includes/us-career-page.html` (v1 pathway page) is unused; kept until the owner OKs deletion | `ARCHITECTURE.md` §4 |

## 5. review_by calendar

`check-us-data` fails once a `review_by` date has passed, so these are hard deadlines for a re-check.

| Date | File | What to re-check |
|---|---|---|
| **2026-11-07** | `_data/us/immigration.yml` | OPT, H-1B and SEVP rules and the court cases (they move fast) — 17 days after this report |
| 2027-01-05 | `_data/us/compacts.yml` (4 lists) | Member lists of the Nurse Licensure Compact, Interstate Medical Licensure Compact, PT Compact and the UBE jurisdictions |
| 2027-01-31 | `_data/us/pathways.yml` (`img-usmle` track) | The 2027 Match season rules for IMGs |
| 2027-04-19 | `_data/us/pathways.yml` (CPA, foreign lawyer tracks) | NASBA/IQEX and NY/CA bar rules |
| 2027-04-20 | `clusters.yml`; `careers/` for HHS, DT, FS, M&E, M&S, PSS, Education, SCT; `cte_careers.yml` (6 trades) | BLS OOH pages (new wage year in spring 2027), Advance CTE framework |
| 2027-04-21 | `careers/` for the other 6 clusters and HHS batch rows; `cte_careers.yml` (16 trades); `exams.yml`; the 10 state files | BLS, exam owners (dates and fees for the 2027–28 cycle), state boards |
| Each October | `college_index.json`, `college_fields.json` (no `review_by`; refresh rule) | New College Scorecard release; IPEDS C2025_A when NCES posts it |

## 6. How to re-run everything

```
VERIFY_DEPS=<dir with node_modules/js-yaml + liquidjs> node scripts/check-us-data.mjs
VERIFY_DEPS=… node scripts/check-search.mjs
VERIFY_DEPS=… node scripts/build-us-colleges.mjs --check     # also build-us-clusters / -exams / -states --check
VERIFY_DEPS=… node scripts/build-nav-mega.mjs --check         # India menu only
VERIFY_DEPS=… node scripts/verify-site.mjs --all              # ~10 min; now also fails on an orphan USA page
```
