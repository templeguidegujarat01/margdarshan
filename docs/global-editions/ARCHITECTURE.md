# Margdarshan Global Editions — Architecture & Phase Plan

Status: **Phase 1 complete** (foundation, no visible change). Last updated: 2026-10-07.
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

Still to verify in Phase 2: the other 15+ occupations, O*NET codes, AP/PSAT details, USMLE step structure, CPA (NASBA / 2024+ "150-hour" alternative pathways by state), FE/PE (NCEES), dental (INBDE) and pharmacy (NAPLEX) licensing, NCLEX, DPT/NPTE, H-1B current rules (USCIS — fee/selection changes in 2025–26 must be checked, not assumed).

---

## 4. Phase plan (one phase per run; owner says "GO" between phases)

| Phase | Scope | Visible change? |
|---|---|---|
| **1** ✅ | Audit, multi-level `root` fix, `_data/regions.yml`, `us/` region default, this doc | None (verified byte-identical) |
| 2 | Research dataset `_data/us/*.yml` from BLS, O*NET, College Board, ACT, NCES, USMLE, NCBE, NASBA, NCEES, USCIS, ADA/NABP/NCSBN/FSBPT — every value with source + date | None |
| 3 | Region engine: `data-region`, lang/locale, region nav (`sidebar_us`), **region switcher** in sidebar (keyboard/SR accessible, mobile drawer), `md-region` localStorage, USA home `/us/`, rename "Margdarshan USA" study-abroad label (with OK) | Yes — switcher + `/us/` |
| 4 | USA hubs: High School (grades 9–12, GPA, AP/IB/Honors/dual enrollment), Tests, College & Degrees, Professional Licenses, International Students | Yes |
| 5 | USA career template + first 10 pathways (tech + engineering) | Yes |
| 6 | Remaining 10 pathways (health, law, business, psychology) + licensing pathway blocks | Yes |
| 7 | SEO: region-aware breadcrumb root, footer, JSON-LD, search index entries, sitemap additions from real generated URLs | Yes |
| 8 | QA matrix (1920→375px, light/dark, drawer, switcher, localStorage vs URL), full India regression diff, final report | No |
