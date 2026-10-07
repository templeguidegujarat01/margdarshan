# Margdarshan Global Editions — Architecture & Phase Plan

Status: **All 8 phases complete.** Last updated: 2026-10-08.

## Final report (Phase 8)

**India functionality preserved: YES** · **USA region implemented: YES** · **Build/verification passed: YES** (Jekyll is not installed locally; every check renders the real templates with liquidjs and `_config.yml` defaults, as GitHub Pages' Jekyll would)

**Known issues:** (1) The 4 verifier warnings that existed before this project remain (two stub pages without #main, "coming soon" text on the coaching and colleges finders). (2) Sidebar label "Margdarshan USA" (India study-abroad guide) is unchanged until the owner decides on a rename. (3) Some official sites block automated readers (ed.gov, travel.state.gov, NABP, IB, an AAMC cost page); those facts are marked `note:` in `sources.yml` for a manual re-check. (4) Data is a snapshot (BLS May 2025 / 2025–35, checked 2026-10-07/08) — refresh yearly using `sources.yml → bls_vintage`, `scripts/fetch-oews.mjs` and `scripts/check-us-data.mjs`.

**Phase 8 work:** `404.html` now uses site-absolute links (GitHub Pages serves it at any missing URL, e.g. /us/careers/typo/, where relative links broke styling).

**QA matrix (headless Chrome over DevTools Protocol):** 10 pages (India: home, science hub, CSE career, JEE Main exam, colleges finder, About [neutral]; USA: home, high-school hub, nursing career, a missing URL inside /us/) × 9 widths (1920, 1440, 1280, 1024, 820, 768, 430, 390, 375) × light and dark = 180 loads: no horizontal overflow, stylesheet loaded on every page including the /us/ 404, no console errors other than the intended 404 status. Mobile drawer opens, scroll-locks and closes on Escape in both editions.

**India regression (vs. a render snapshot taken before Phase 1):** all 398 India pages still exist; the `<main>` content of 369 India pages is byte-identical (the 28 others are redirect/stub pages without <main>; 404.html changed only to absolute links). Shell differences are exactly: the `data-region` attribute, the region switcher, region JS, the search "USA Edition" filter and same-edition ranking, a JS comment, and (on 7 neutral pages) the hidden USA nav groups.

**Commits:** dcfa5a1 (P1) · 3d3d334 (P2) · 381f296 (P3) · 583d419 (P4) · d78f4cb (P5) · c223a0f + 56a9955 (P6) · 159e69e (P7) · Phase 8 commit.

## Phase 7 — search and SEO (as built)

- Site search: 27 USA pages added to `_data/search.yml` under a new category `usa` ("USA Edition"). On USA pages (`region_id == "us"`) `_includes/career-search.html` preselects that category (shown right after "All"), uses a USA placeholder, USA popular searches and USA starting links; India pages keep their own. `scripts.html` reads the preselected category from the DOM and adds +100 to results from the page's own edition, so India searches still rank India pages first and USA searches rank USA pages first (other edition's results still appear below).
- Structured data: Article (headline, description, inLanguage en-US, dateModified, publisher) on every career page; ItemList of live pathways on /us/careers/; WebPage on /us/. Existing BreadcrumbList and FAQPage kept. No hreflang: India and USA pages cover different systems, not translations of the same page.
- SEO audit (all 27 USA pages, rendered): one title and description each, all unique; canonical = og:url = absolute URL matching the sitemap; lang en-US / og:locale en_US; exactly one h1; valid JSON-LD; no noindex; sitemap lists exactly the 27 USA pages with no duplicates (228 URLs total). Two over-long title/description strings were shortened.

## Phase 6 — remaining 10 career pages (as built)

Medicine, Dentistry, Pharmacy, Nursing, Physical Therapy, Law, Accounting & CPA, Finance, Business & Management, Psychology — all `live: true`; the switcher now maps 19 India pages to their USA counterparts.

- Deep data for 10 more lead occupations in `occupation_details.yml` (BLS percentiles, industries or **specialty** pay tables via `breakdown_label`, work settings, hours, growth drivers; O*NET tasks, work context, technologies, education).
- Physicians and psychologists use an O*NET example specialty (`onet.example`: family medicine; clinical and counseling psychologists) and say so on the page.
- O*NET has no work-context survey yet for financial and investment analysts (13-2051.00); the page says so (`onet.context_note`) instead of showing numbers.
- New optional `key_numbers` in `pathway_pages.yml` — reality-check cards with sources: AAMC 2025 applicants (54,699) and enrolled (23,440), AAMC class-of-2026 cost of attendance, 2026 professional loan caps, NCBE 2025 first-time bar pass rate (76%), AICPA 2025 CPA section pass rates.
- Template changes: key-numbers block, specialty breakdown tables (no share column), work-settings line, "Where the jobs are" only when state data exists, work-context table optional.
- Fixed: technology chips were capped at 3 by the stream-card rule (`.stream-chips span:nth-child(n+4)`); career pages now use `.stream-chips.us-chips` and show all.

**State data (done):** BLS OEWS May 2025 top-5 states added for the 9 Phase 6 occupations that have state series (fetched with `scripts/fetch-oews.mjs` after the API quota reset). BLS has no all-physicians state series (only specialties), so Medicine shows a note instead.

## Phase 5 — career pages (as built)

- `_includes/us-career-page.html` — one template for every pathway page; a page is a 12-line stub (`us/careers/<slug>/index.html`, front matter `pathway: <slug>`). Sections: hero quick facts, career options table (all occupations), pay range (10th/median/90th percentile) + pay by industry, where the jobs are (top 5 states), real work life (O*NET tasks, worker-reported context, technologies, interests), 5-step route, high school prep, college (majors, study, degree route, ABET for engineering, O*NET education shares), license (when the pathway has one), outlook drivers, tips, FAQ, related pathways, per-page sources. BreadcrumbList + FAQPage JSON-LD from data.
- Data: `_data/us/occupation_details.yml` (deep data for the 9 lead occupations), `_data/us/pathway_pages.yml` (student-facing copy for 10 pathways). `pathways.yml` marks built pages `live: true`, which turns cards into links and activates the region switcher's same-field mapping (9 India pages now jump to their USA counterpart; computer engineering has no India match and falls back to the USA home).
- `_includes/us-pathway-cards.html` shared by the USA home and the new Careers hub (`us/careers/`).
- State data: BLS OEWS May 2025 via the BLS Public Data API v1 (series OEUS…; datatypes 01 employment, 13 median, 04 mean). 24 requests used on 2026-10-07; the free tier allows 25/day, so the remaining 10 pathways (Phase 6) need a new day's quota or a free registered key (500/day). Script: `scripts/fetch-oews.mjs` (emp / wage / report for a list of SOC codes).
- Real "day-to-day" data comes from O*NET work context (surveyed workers), e.g. 62% of information security analysts and 73% of aerospace engineers report working more than 40 hours a week.
- Checker additions: occupation_details (numbers, median between percentiles, pct ranges, dates), pathway_pages (5-step routes, FAQs, dates), live pathways have page + copy + lead details.

## Phase 4 — USA hubs (as built)

Pages (all data-driven, same components as India hubs: page-hero + quickfacts, quicknav, roadmap-flow/rflow, table-simple, chip-grid, faq, related-grid; BreadcrumbList + FAQPage JSON-LD):
`us/high-school/`, `us/tests/`, `us/college/`, `us/professional-licenses/`, `us/international-students/`. USA nav now has two groups (Plan Your Path / Careers & Beyond); the USA home links each section to its hub; sitemap lists all 6 USA URLs.

New data: `_data/us/guides.yml` (admissions factors, ED/EA/RD, GPA, UC example, dual enrollment, SAT/ACT formats, AP fees, real college testing policies, college prices, FAFSA, Pell, loans + 2026 grad-loan changes, transfer outcomes, student-experience surveys, international steps and numbers) with 27 more sources in `sources.yml`. `_includes/us-sources.html` renders a page's source list; `check-us-data.mjs` now also checks guides.yml source ids/dates and every page's `us-sources` ids.

"Real experience" layer: Reddit blocks Anthropic's crawler, so community posts could not be read. Instead the hubs use large surveys of real students and colleges: NACAC (what colleges weigh, Fall 2023), Lumina–Gallup (35% considered leaving; stress 54%, mental health 43%, cost 31%; AI use 57% weekly, 16% changed major because of AI), NSC Tracking Transfer (31.6% transfer, 48.7% of those finish), CCRC/IPEDS (3.1M dual enrollment), Open Doors 2025. Practical tips are labelled as Margdarshan's advice, not as source facts.

Not stated (could not verify): a $250 "visa integrity fee" for F-1 applicants and the current State Department visa fee (travel.state.gov blocks readers) — the page points readers to their embassy instead. ed.gov pages (FAFSA launch, 2026 loan caps) block readers; figures come from the Department's own releases as indexed by search and are marked in `sources.yml`.

## Phase 3 — how the region engine works (as built)

- `_layouts/default.html` resolves `region_id` (front matter → `_config.yml` default for `us/` → `regions.default`) and `R` (its settings) once; emits `<html lang data-region>` and `og:locale` from `R`. Includes read `region_id`, `R`, `region_neutral`.
- `_includes/sidebar.html` renders `site.data[R.nav].sidebar` (`nav.yml` for India, `nav_us.yml` for USA). India's National ↔ Global & State link shows on India pages only.
- `_includes/region-switcher.html` — plain links above the scrolling nav (also first in the mobile drawer; flags-only in the collapsed rail). Destination = same-field page only when a pathway is `live: true` with `in_page`, else the edition home. Current edition: `aria-current="true"` + fill + border + bold.
- Region-neutral pages (`regions.yml → neutral_pages`: About, Contact, legal, 404) render both editions' nav groups tagged `data-region-nav`; an inline `<head>` script applies the saved edition (`localStorage['md-region']`) before paint, CSS hides the other edition's groups, `scripts.html` fixes aria-current and the logo/breadcrumb home link.
- `scripts.html` stores the edition of every edition page visited and of every switcher click. URL always wins: a /us/ page is USA regardless of storage. Theme / sidebar keys untouched.
- Brand, breadcrumb root ("USA Home") and footer (`nav_us.yml → footer`) follow the edition; India output of all three is unchanged.
- `_includes/fmt-num.html` formats integers with thousands separators (Jekyll has no filter for it).
- `us/index.html` — USA home, fully data-driven from `_data/us/` (ladder, tests, 20 pathway cards with BLS pay/outlook, licensing table, changes to watch, international, FAQ, sources).
- Tooling: `scripts/verify-site.mjs` now applies `_config.yml` defaults and serves `folder/index.html` at `folder/`, like Jekyll.

Tested (headless Chrome via CDP): 1920/1440/1280/1024/820/768/430/390/375 px — no horizontal overflow; drawer open/close, Escape, scroll lock; rail mode; light/dark; URL-over-storage; neutral page follows saved edition; switcher click stores edition; no console errors. India HTML diff: only `data-region` attribute, the switcher block and the region JS.

Known gaps for later phases: header search indexes India pages only (Phase 7); `404.html` uses relative links, so a 404 inside `/us/` loses styles (pre-existing for any folder; fix in Phase 8); sidebar label "Margdarshan USA" (study-abroad guide) still awaits the owner's rename decision.
This folder is excluded from the Jekyll build (`exclude: docs` in `_config.yml`), so nothing here is published.

---

## 1. Repository audit (Phase 1 findings)

| Area | What exists today | Impact on USA edition |
|---|---|---|
| Build | GitHub Pages Jekyll, `jekyll-redirect-from` only. No local Ruby; offline QA via `scripts/verify-site.mjs` (liquidjs). | Stay on plain Jekyll + Liquid + vanilla JS. No new dependencies. |
| Layout | One layout, `_layouts/default.html`, owns `<head>`, canonical, OG, shell, scripts. | USA pages reuse it. Region-aware bits go into this one file. |
| URLs | Flat `*.html` files at the root; a few one-level folders (`study-abroad/`, `state-pathways/`, `niche-careers/`, `roadmaps/`). All links are **relative without a leading slash**. | USA uses `/us/...` folders. Shared shell links are prefixed with `root` (`../` per level). |
| Relative-link rewriting | Layout computes `root` and rewrites every `href="`/`src="` in the shell. **Supported only one folder deep** before Phase 1. | **Fixed in Phase 1**: depth now counts every level (`/us/careers/x/` → `../../../`). Verified byte-identical output for all 398 existing pages. |
| Sidebar | `_includes/sidebar.html`, data-driven from `_data/nav.yml` → `sidebar` (groups → items → children). Active state from `page.url`, breadcrumb parent, `header.active_stream`. | Add `sidebar_us` (or region-keyed nav) and pick by region; no duplicate sidebar HTML. |
| Existing "edition" switch | `nav.yml → editions` flips between "National India" and "Global & State" editions (a link at the end of the sidebar). | Must coexist with / fold into the new region switcher. Decision in Phase 3. |
| Name clash | Sidebar group "GLOBAL & REGIONAL" has **"Margdarshan USA" → `study-abroad/usa.html`** (study-in-USA guide for *Indian* students). | Rename that label to "Study in the USA" when the real USA Edition ships, or students will confuse the two. Proposed for Phase 3 (needs owner OK — it touches an India page label). |
| Header / brand / footer | `header.html`, `brand.html`, `footer.html`; footer text says "Made in India, for India" and links India streams. | Footer needs a region-aware variant (Phase 7); brand stays shared. |
| JS | One inline bundle `_includes/scripts.html`; localStorage keys `md-theme`, `md-sidebar`, `md-sb-closed`, `md-recent-search`. | New key **`md-region`** follows the same `md-` namespace. |
| Pre-paint script | Inline `<head>` script applies theme + sidebar state before paint. | Region class/attribute will be set from the URL server-side (no flash), not from JS. |
| Search | `_data/search.yml` → `assets/search.json`, category-based. | USA entries get a region field + categories (Phase 7). |
| Breadcrumb | `breadcrumb.html` always starts at `index.html` "Home"; JS trail rebuild fetches `assets/crumb-map.json` **without `MD_ROOT`** (only works on top-level pages — pre-existing limitation, harmless today). | USA breadcrumbs must start at the USA home. Region-aware root crumb in Phase 3. |
| SEO | Absolute canonical + `og:url` from `page.url | absolute_url`, `site.url = https://emargdarshan.com`. `og:locale` = `en_IN` site-wide, `<html lang="en">`. | USA pages need `en_US` locale; canonical mechanism already correct for any path. |
| Sitemap | **Hand-maintained** `sitemap.xml` (201 URLs, `.html` URLs). `robots.txt` allows all. | Add USA URLs by hand from the actually generated pages (Phase 7), never by guessing. |
| JSON-LD | Per-page blocks inside content (Article/FAQ/Breadcrumb on career pages). | USA template emits Article + BreadcrumbList; FAQPage only where real FAQs exist. |
| Existing US-related India pages | `cpa.html` (US CPA for Indian students), `study-abroad/usa.html`. | Possible switcher mappings later (e.g. `cpa.html` ↔ `us/careers/accounting/`), only if the content truly corresponds. |

Off-limits for automated edits (from earlier project decisions): `study-abroad/`, `state-pathways/`, `niche-careers/`, global pages, and generated `roadmaps/*` (edit sources in `scripts/roadmap-src/` instead).

---

## 2. Target architecture

**One design system, many country contexts.**

```
_data/regions.yml          ← region registry (Phase 1, done)
_data/nav.yml              ← India sidebar (unchanged) + USA sidebar block (Phase 3)
_data/us/                  ← USA research data (Phase 2)
    occupations.yml        BLS/O*NET occupation-level facts (pay, outlook, openings, SOC, O*NET codes)
    pathways.yml           student-facing pathways → list of occupation ids
    tests.yml              PSAT / SAT / ACT / AP facts
    degrees.yml            associate → doctorate / professional
    licenses.yml           licensing model (authority, exams, education, experience, jurisdiction note)
    sources.yml            every source URL with name + last_verified
_includes/region-switcher.html   (Phase 3)
_includes/us-career-page.html    shared USA career template (Phase 5)
us/index.html                    USA home  → /us/
us/<hub>/index.html              hubs      → /us/high-school/ …
us/careers/<slug>/index.html     pathways  → /us/careers/data-science/
```

### Region resolution (server-side first, so no flash)
1. Page front matter `region` — set automatically for everything under `us/` by `_config.yml` defaults (Phase 1, done).
2. No region → `site.data.regions.default` (`in`).
3. Layout will emit `data-region` on `<html>`, region `lang`/`og:locale`, and render the matching nav. URL context therefore always wins and needs no JS.
4. JS (Phase 3) only *stores* the choice in `localStorage['md-region']` and uses it for region-neutral pages (e.g. legal pages) and for the switcher destination. It never redirects a page the visitor explicitly opened.

### Pathway vs occupation
A **pathway** (e.g. Computer Science) is the student-facing route. It links to several **occupations** (BLS/O*NET units: Software Developers, Data Scientists, Information Security Analysts …). Pay/outlook are shown **per occupation**, never as one invented "Computer Science salary".

### Data rules
- Every figure stores `value`, `ref_year`/`period`, `source_id`, `last_verified`. No salary constants in templates.
- Use BLS wording: "Median annual wage/pay", "Job outlook (projected change)", "Annual openings".
- Licensing is **jurisdiction-specific**; store a national summary + "varies by state" note, never one state's rule as national.
- No false equivalents (NEET ≠ SAT, MBBS ≠ MD, LLB ≠ JD, CA ≠ CPA). Comparisons only with an explanation.

---

## 3. Verified fact ledger (official sources, checked 2026-10-07)

| Fact | Value | Source |
|---|---|---|
| BLS OOH current data vintage | Wages **May 2025**, projections **2025–35** | bls.gov/ooh |
| Software developers median pay | $135,980 (2025). The OOH group "Software Developers, QA Analysts & Testers" = $134,040; outlook **+10%** and ~106,100 openings/yr are for the **combined group** | bls.gov/ooh/computer-and-information-technology/software-developers.htm |
| Data scientists | $120,230; +35%; ~24,800 openings/yr; 275,600 jobs; bachelor's | bls.gov/ooh/math/data-scientists.htm |
| Physicians & surgeons | $275,930; +4%; ~22,100 openings/yr; 862,800 jobs; doctoral/professional | bls.gov/ooh/healthcare/physicians-and-surgeons.htm |
| Lawyers | $159,670; +5%; ~28,700 openings/yr; 863,700 jobs | bls.gov/ooh/legal/lawyers.htm |
| Registered nurses | $97,550; +6%; ~180,800 openings/yr; 3,465,400 jobs; BLS lists bachelor's as typical entry level | bls.gov/ooh/healthcare/registered-nurses.htm |
| SAT scale | Total 400–1600; two sections 200–800 (Reading & Writing, Math) | satsuite.collegeboard.org |
| ACT (enhanced) | Scale 1–36 unchanged; **Science now optional**; Composite = English + Math + Reading (national tests since Sept 2025; state/district from spring 2026) | act.org |
| Bar exam | **NextGen UBE debuted July 2026** in 10 jurisdictions; legacy UBE runs **through February 2028**; most large states (CA, TX, NY) switch July 2028; a few jurisdictions have not announced | ncbex.org/exams/nextgen |
| STEM OPT | 24-month extension of post-completion OPT; degree on DHS STEM list; E-Verify employer; page last reviewed 01/30/2026 | uscis.gov |

Corrections to the original brief: the brief lists UBE + NextGen as future/parallel — NextGen is **already live** (July 2026). ACT pages must not say Science counts toward the Composite. Software-developer outlook must be labelled as the combined BLS group.

### Phase 2 — research dataset (`_data/us/`)

| File | Contents |
|---|---|
| `sources.yml` | 35 official sources (BLS, O*NET, NCES, College Board, ACT, IB, AAMC, ADA, AACP, USMLE, NBOME, NCBE, NASBA/AICPA, NCEES, ABET, NCSBN, NABP, JCNDE, FSBPT, ASPPB, USCIS, Federal Register) + the BLS data vintage in one place |
| `occupations.yml` | 34 BLS OOH occupations: median pay, entry education, jobs, outlook %, change, openings, SOC + O*NET codes, group/sub-pay where BLS publishes a group |
| `pathways.yml` | The 20 student pathways → occupations, degree route, admission tests, license, honest BLS caveat, same-field India page for the switcher |
| `licenses.yml` | 9 licensing models (medicine, law, CPA, PE, nursing, pharmacy, dentistry, PT, psychology) with authority, exams, experience, steps, jurisdiction note, what does *not* need a license, time-sensitive "watch" items |
| `tests.yml` | PSAT 8/9, PSAT 10, PSAT/NMSQT, SAT, ACT, AP, IB; MCAT, DAT, LSAT/GRE, PCAT (retired) |
| `degrees.yml` | IPEDS degree definitions, high school (no national board exam; state credits 11–24), transfer |
| `immigration.yml` | F-1, OPT, STEM OPT, H-1B with dated change log |

Check with `VERIFY_DEPS=<dir with js-yaml> node scripts/check-us-data.mjs` (cross-references, types, sources, dates, India mapping files). `scripts/verify-site.mjs` now reads YAML inside `_data/` subfolders too.

**Research corrections to the original brief (all from primary sources):**
1. NextGen UBE is live since July 2026; legacy UBE ends Feb 2028 (NCBE).
2. ACT Composite = English + Math + Reading; Science optional (ACT).
3. D.O. students take **COMLEX-USA** (NBOME), not only USMLE.
4. **PCAT was retired in January 2024** — never list it for pharmacy (AACP).
5. CPA: BLS OOH still says "all states require 150 hours"; NASBA/AICPA UAA 9th ed. (2025) adds a **120-hour + 2 years experience** pathway, adopted state by state. Use NASBA, not the OOH line.
6. Software developers +10% and electrical engineers +8% are **BLS group** figures, not single-occupation figures.
7. BLS/O*NET have **no "AI engineer"** occupation — the AI pathway maps to research scientists, data scientists, software developers.
8. O*NET codes ≠ SOC codes in places (counselors: SOC 21-1018 → O*NET 21-1011.00 + 21-1014.00).
9. BLS says ADN/ASN programs "typically take 4 years" (verbatim, 2025–35 edition) — quote BLS, don't substitute the common "2 years".
10. Law school tests: ABA Standard 503 still requires a test, but 21 of 198 schools held variances (Aug 2026).
11. H-1B: $100,000 payment (Sept 2025) guidance vacated by a district court (June 2026), stay denied by the First Circuit (July 2026); weighted wage-based selection replaced the lottery (rule effective Feb 2026). Treat as volatile.

Sources that block automated readers (IB, NABP) are marked `note:` in `sources.yml` for a manual re-check.

---

## 4. Phase plan (one phase per run; owner says "GO" between phases)

| Phase | Scope | Visible change? |
|---|---|---|
| **1** ✅ | Audit, multi-level `root` fix, `_data/regions.yml`, `us/` region default, this doc | None (verified byte-identical) |
| **2** ✅ | Research dataset `_data/us/*.yml` from BLS, O*NET, College Board, ACT, NCES, USMLE, NCBE, NASBA, NCEES, USCIS, ADA/NABP/NCSBN/FSBPT — every value with source + date | None |
| **3** ✅ | Region engine: `data-region`, lang/locale, region nav (`sidebar_us`), **region switcher** in sidebar (keyboard/SR accessible, mobile drawer), `md-region` localStorage, USA home `/us/`, rename "Margdarshan USA" study-abroad label (with OK) | Yes — switcher + `/us/` |
| **4** ✅ | USA hubs: High School (grades 9–12, GPA, AP/IB/Honors/dual enrollment), Tests, College & Degrees, Professional Licenses, International Students | Yes |
| **5** ✅ | USA career template + first 10 pathways (tech + engineering) | Yes |
| **6** ✅ | Remaining 10 pathways (health, law, business, psychology) + licensing pathway blocks | Yes |
| **7** ✅ | SEO: region-aware breadcrumb root, footer, JSON-LD, search index entries, sitemap additions from real generated URLs | Yes |
| **8** ✅ | QA matrix (1920→375px, light/dark, drawer, switcher, localStorage vs URL), full India regression diff, final report | No |
