# USA Edition — architecture and URL map

USA Master Plan, Phase 1 (2026-10-20). The full plan with one prompt per phase lives in the Claude Docs doc
"USA Edition Master Plan". This file is the technical map: every URL (live or planned), the template that
renders it, the data file behind it, the script that writes its stub and the check that guards it.
`docs/` is excluded from the Jekyll build.

## 1. The funnel

Same shape as the India edition: **Home → hub → career page → roadmap**, with support hubs reachable from
every career page.

```
us/  (USA Home, gateway)
 ├─ 14 Career Cluster hubs   us/clusters/<cluster>/          ← India's stream hubs (Science, Commerce, …)
 │    └─ career page         us/careers/<slug>/              ← existing pathway page, or the generic overview
 │         └─ roadmap        us/roadmaps/<slug>.html         ← routes as .cflow, exam gates, state license step
 │    (trades keep their own tier: us/cte/<slug>.html → us/cte/roadmaps/<slug>.html)
 └─ 6 support hubs: Exams · States · Licensing · Colleges & training · High school · Paying for college
```

Why clusters: the U.S. has no Science/Commerce/Arts streams. The National Career Clusters® Framework
(Advance CTE, modernized 2024: 14 clusters, 72 sub-clusters, 3 cross-cutting) is what most states use for
career and technical education, so it is the grouping students and counsellors recognise.

## 2. Phase 1 decisions (owner's open questions, Master Plan section 11)

The owner had not answered section 11 when Phase 1 was sent, so the plan's recommended defaults were used:

| # | Question | Used in Phase 1 |
|---|----------|-----------------|
| 1 | USA coaching directory | None. No official registry; free official prep links on exam pages later |
| 2 | Career page URL | Keep `us/careers/<slug>/` (21 pathway pages already there); hubs only list |
| 3 | Home route sections | Detail moved into hubs; home keeps one short card per route |
| 4 | First cluster | Healthcare & Human Services (Phase 2) |
| 5 | Way of working | One phase per run; big phases in batches, "continue Phase N" |

Hubs that already have career pages went live in Phase 1 (8 of 14), because their content (definition,
sub-clusters, existing career pages with verified BLS data) already existed. No new career content was written.

## 3. URL map

Status: **live** = exists after Phase 1 · **Pn** = planned, built in phase n · **redirect** = stub with `redirect_to`.

### 3.1 Home and cluster hubs

| URL | Status | Template | Data |
|-----|--------|----------|------|
| `us/` | live (rebuilt P1) | `us/index.html` (hand-written gateway) + `us-cluster-cards.html` | `clusters.yml`, `home.yml` (`support`, `vectors`) |
| `us/clusters/` | live | `us-clusters-index.html` | `clusters.yml` |
| `us/clusters/healthcare-human-services/` | live | `us-cluster-hub.html` | `clusters.yml` (careers grow in P2) |
| `us/clusters/digital-technology/` | live | 〃 | P3 |
| `us/clusters/financial-services/` | live | 〃 | P3 |
| `us/clusters/management-entrepreneurship/` | live | 〃 | P4 |
| `us/clusters/marketing-sales/` | P4 | 〃 | |
| `us/clusters/public-service-safety/` | live (+ civil service block) | 〃 | P5 |
| `us/clusters/education/` | P5 | 〃 | |
| `us/clusters/construction/` | live | 〃 | P6 |
| `us/clusters/advanced-manufacturing/` | live | 〃 | P6 |
| `us/clusters/supply-chain-transportation/` | live | 〃 | P7 |
| `us/clusters/energy-natural-resources/` | P7 | 〃 | |
| `us/clusters/agriculture/` | P7 | 〃 | |
| `us/clusters/arts-entertainment-design/` | P8 | 〃 | |
| `us/clusters/hospitality-events-tourism/` | P8 | 〃 | |

A hub goes live by setting `live: true` in `clusters.yml` (needs at least one career) and running
`scripts/build-us-clusters.mjs`; the checker then requires the stub and a `_data/nav_us.yml` menu entry.

### 3.2 Career pages and roadmaps (P2–P8)

| URL | Status | Template | Data |
|-----|--------|----------|------|
| `us/careers/<pathway>/` (21) | live | `us-career-v2.html` (+ `/colleges/`, `/salary/`) | `pathways.yml`, `pathway_pages.yml`, `occupations.yml` |
| `us/careers/<slug>/` (new careers) | P2–P8 (12 live after P2 batch 1) | `us-career-overview.html` | `_data/us/careers/<cluster>.yml` |
| `us/roadmaps/<slug>.html` (every career) | P2–P8 | `intl-roadmap.html` with `career: true` | `_data/us/careers/<cluster>.yml` (`routes`, `certs`, `states`) |
| `us/roadmaps/{img-usmle,cpa-international,foreign-lawyer-us-bar}.html` | live | `intl-roadmap.html` | `pathways.yml` `crossborder` |
| `us/cte/` | live (+ `#route` moved from home) | hand-written | `home.yml` trades, `cte_careers.yml` |
| `us/cte/<trade>.html` (5) | live; more trades P6–P7 | `us-cte-career.html` | `cte_careers.yml` |
| `us/cte/roadmaps/<trade>.html` (5) | live | `intl-roadmap.html` with `cte: true` | `cte_careers.yml` |
| `us/roadmaps/<trade>.html` (5) | redirect | | old trade roadmap URLs |

A pathway that already has its page appears in `careers/<cluster>.yml` as `pathway: <slug>` with only route
data: it gets a roadmap and keeps its v2 page. Roadmap slugs share the `us/roadmaps/` folder with the
cross-border tracks; the checker rejects duplicates.

Planned careers per cluster (examples from the Master Plan; the final list comes from BLS OOH in each phase,
~15 careers per run, biggest employment first):

| Phase | Cluster | Careers to add (existing pages reused, not duplicated) |
|-------|---------|--------------------------------------------------------|
| P2 | Healthcare & Human Services | physician, RN, pharmacist, dentist, PA, EMT/paramedic, respiratory therapist, social worker … (+ license pages) |
| P3 | Digital Technology; Financial Services | network admin, actuary (SOA/CAS), financial analyst, loan officer, insurance agent … |
| P4 | Management & Entrepreneurship; Marketing & Sales | HR, project management, operations, logistics mgmt, marketing, sales, PR, real estate agent/broker |
| P5 | Public Service & Safety; Education | paralegal, police, firefighter, correctional officer, federal careers, Foreign Service, military; K-12 teacher, counselor, librarian, professor |
| P6 | Construction; Advanced Manufacturing | carpenter, machinist, sheet metal, ironworker, laborer, heavy equipment, elevator installer, maintenance mechanic, CNC; architect, construction manager, industrial engineer |
| P7 | Supply Chain & Transportation; Energy & Natural Resources; Agriculture | truck driver (CDL), pilot, A&P mechanic, diesel tech, logistician; lineworker, solar/wind tech, environmental scientist, geologist; farmer, food scientist, veterinarian, vet tech, forester |
| P8 | Arts, Entertainment, & Design; Hospitality, Events, & Tourism | graphic/UX/interior designer, journalist, photographer, film editor, actor, musician; chef, food service manager, hotel manager, event planner, cosmetologist/barber |

### 3.3 Support hubs

| Hub | URL | Status | Notes |
|-----|-----|--------|-------|
| Exams | `us/exams/` + `us/exams/<exam>/` | **live (P9: hub + 18 exam pages)**; P10 adds graduate, licensing and government exams | `_includes/us-exams-hub.html`, `us-exam-page.html`; stubs by `scripts/build-us-exams.mjs [--check]`. Data: `_data/us/exams.yml` (extends `tests.yml`; `us/tests/` stays live as the testing-policy overview, not moved). Home card + sidebar link `us/exams/` |
| States | `us/states/` + `us/states/<state>/` (51) | P11 | `_data/us/states/<state>.yml`, one file per state; `us/new-york-city/` stays and is linked from New York |
| State licensing & jobs | `us/states/<state>/licenses.html` (+ civil service) | P12 | matrix rows only from the state's own board |
| Licensing | `us/professional-licenses/` + `<id>/` (13 live; the 4 added in P2 have `page:` + `boards:` in `licenses.yml` and generated stubs) | live; new licenses P2–P8, state matrices P12 | `licenses.yml`, `compacts.yml` |
| Colleges & training | `us/colleges/` + `<state>/` (51) + `<state>/<city>/` (493, ≥3 schools) + `fields/<career>/` (110) | **live (P13)** | College Scorecard + IPEDS + CIP–SOC crosswalk + DOL RAPIDS via `scripts/build-ipeds.mjs --places`; stubs `scripts/build-us-colleges.mjs [--check]`; report `PHASE-13-COLLEGES.md` |
| High school | `us/high-school/` | live | `#plan` holds the grade 9–12 route (home anchor `#k12` forwards there) |
| Paying for college | `us/college/` | live | `#degrees` holds the degree route (home anchor `#college` forwards there) |

### 3.4 Other live USA pages (unchanged in Phase 1)

`us/careers/` (pathway list), `us/compare/` + 4 pairs, `us/international-students/` (+ `work-authorization/`),
`us/new-york-city/`, `us/tests/`, `us/methodology/` (redirect), `us/careers/<slug>/colleges/` (20),
`us/careers/<slug>/salary/` (17).

### 3.5 Old home anchors

The five route sections left `us/index.html` on 2026-10-20. Their anchors keep working: an inline script on
the home forwards `us/#<id>` to the route card's link (`home.yml` `vectors[].moved_to`).

| Old URL | Now |
|---------|-----|
| `us/#k12` | `us/high-school/#plan` |
| `us/#college` | `us/college/#degrees` |
| `us/#cte` | `us/cte/#route` |
| `us/#licensure` | `us/professional-licenses/` |
| `us/#public-sector` | `us/clusters/public-service-safety/#public-sector` |

## 4. Templates (`_includes/`)

| Include | Renders | Notes |
|---------|---------|-------|
| `us-cluster-cards.html` | 14 cluster cards | link only when `live`; else "Next: Phase n" |
| `us-clusters-index.html` | `us/clusters/` | framework terms, cards, 72 sub-clusters, sources |
| `us-cluster-hub.html` | `us/clusters/<slug>/` | definition, career matrix + cards, "Also in this cluster", sub-clusters, optional `public_sector`, connected clusters |
| `us-cluster-career.html` | one career as matrix row / card / link | reads `pathway`, `trade` or `career` data; same license wording as the pathway page |
| `us-career-overview.html` | `us/careers/<slug>/` for new careers | what the job is (+ work environment), key numbers, outlook, how to become one, roadmap CTA; buttons only for pages that exist |
| `intl-roadmap.html` (`career: true`) | `us/roadmaps/<slug>.html` | routes as `.cflow`; step `href`/`link` for exam and license gates; license step labelled "License"; "Where to go next" → cluster hub |
| `us-career-page.html` | — | retired v1 pathway template, unused; kept until the owner OKs deletion. The new generic page is `us-career-overview.html` so the old file is not overwritten |

## 5. Data (`_data/us/`)

| File | Holds |
|------|-------|
| `clusters.yml` | framework facts, 14 clusters (slug, name, phase, live, summary, definition, connected, sub_clusters with example programs, careers placed in the cluster) |
| `careers/<cluster>.yml` | P2+: one file per cluster, `list:` of careers (schema in the comment of `us-career-overview.html`) |
| `home.yml` | `vectors` (5 routes + `moved_to`), `support` (6 hubs: `href` only when live, `planned`, `phase`), trades, public sector |
| `sources.yml` | `acte_framework`, `acte_crosswalk`, `acte_<cluster>` ×14 added in P1 |
| `scripts/data/acte-soc-crosswalk.json` | Advance CTE's official SOC → cluster / sub-cluster crosswalk (1,203 rows), regenerated with `--crosswalk` |

How a career is placed in a cluster: by its SOC code in Advance CTE's crosswalk. If the SOC is in several
clusters, the career is listed under the cluster with the most crosswalk rows (`tie: true` when equal, placed
by the field's main industry), and `also:` names the others; those hubs show it under "Also in this cluster".

## 6. Scripts and checks

| Command | Does |
|---------|------|
| `node scripts/build-us-clusters.mjs [--check]` | writes `us/clusters/index.html`, a hub per live cluster, and the overview + roadmap stubs of `careers/<cluster>.yml` |
| `node scripts/build-us-clusters.mjs --crosswalk <xlsx>` | rewrites `scripts/data/acte-soc-crosswalk.json` from the Advance CTE file |
| `node scripts/check-us-data.mjs` | + clusters: 14/72/3 counts, sources = the cluster's careertech.org page, summary = first sentence, live ↔ stub ↔ nav, every live pathway and trade placed once, placement/also/tie agree with the crosswalk, review_by; home vectors/support; generic careers (facts, sources, buttons only to existing pages, stubs, routes) |
| `node scripts/check-search.mjs` | + 4 cluster queries; old anchor entries retargeted |
| `node scripts/verify-site.mjs --all` | every internal link and #anchor resolves (so a button to a missing exam or license page fails the build check) |

All need `VERIFY_DEPS=<folder with node_modules/js-yaml (+ liquidjs for verify-site)>`.

## 7. Rules for every phase

Official sources only (BLS OOH, O*NET, ED/IPEDS/College Scorecard, the state board, the exam owner), copied, never
computed; a wrong fact in a prompt is corrected from the source and reported. No file deletion: old URLs become
`redirect_to` stubs. Pages are front matter + an include; content in YAML; stubs written by a script with
`--check`. No typed arrow inside `.btn-page-link`; `data-no-points` on tables, flowcharts and fact lists; 4+
`h2[id]` sections get the rail and phone chips. No Colleges / Coaching / License / Exam button without a real
target page. Search entries + check-search cases for every new page. One commit per phase, push, confirm the
GitHub Pages build.

## 8. Notes from the sources (2026-10-20)

- careertech.org's framework page says "five Cluster Groupings" but lists six names; groupings are not used here.
- The crosswalk lists no SOC code for the "Unmanned Vehicle Technology" sub-cluster (Digital Technology), and
  spells four sub-clusters differently from the cluster pages (`xw:` in `clusters.yml`); one row has the
  lowercase "water systems".
- Crosswalk placements that look surprising but are official: computer hardware engineers (computer
  engineering) → Digital Technology › IT Support & Services; welders → Advanced Manufacturing and Construction
  (tie); data scientists → Digital Technology, Financial Services and Marketing & Sales (tie).
- BLS broad SOC codes (29-1210 physicians, 29-1240 surgeons, 29-1020 dentists) are matched to the crosswalk's
  detailed codes (29-1211 …) by their first five digits.

## 9. Phase 2 (2026-10-20)

Healthcare & Human Services batch 1: 12 new career pages, 16 roadmaps (4 on existing pathways), 4 license pages
(LPN/LVN, social work, counseling, EMT) with state-board tables. Full BLS list, corrections, fetch tricks and the queue:
`docs/us-edition/PHASE-2-HEALTHCARE.md`.

## 10. Phase 9 (2026-10-21)

Exams hub `us/exams/` (9 stages, grade 3 to government) and 18 exam pages: NAEP, PSAT 8/9, PSAT 10, PSAT/NMSQT,
PreACT, SAT, ACT, CLT, AP (with all 42 subjects), IB, CLEP, GED, HiSET, TOEFL iBT, IELTS, Duolingo English Test, ASVAB
(+ CEP), ACT WorkKeys. Roadmap start steps that name a high school equivalent link the GED/HiSET section; the checker
makes every roadmap step that names a Phase 9 exam link its page. Report, corrections and queue:
`docs/us-edition/PHASE-9-EXAMS.md`.

## 11. Phase 13 (2026-10-21)

Colleges & training: hub, 51 state pages, 493 city pages (3+ schools), 110 program lists by career, Colleges and
Apprenticeships buttons on career, trade and pathway pages. Report, corrections and refresh steps:
`docs/us-edition/PHASE-13-COLLEGES.md`.
