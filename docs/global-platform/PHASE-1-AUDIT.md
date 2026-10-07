# Margdarshan Global Platform — Phase 1: Repository + Product Audit

Date: 2026-10-07 · Baseline commit: `8608f97` · Scope: audit only, no production code changed.
This folder is excluded from the Jekyll build (`exclude: docs`), so nothing here is published.

Earlier work this builds on: `docs/global-editions/ARCHITECTURE.md` (the 9-phase USA Edition project:
region engine, `_data/us/`, 27 USA pages). This audit re-examines the whole site against the new
"global career platform" brief.

## How this audit was done

- Rendered all 429 pages through the real layout with liquidjs + `_config.yml` defaults (GitHub Pages
  Jekyll is not installed locally) and measured every page: HTML size, words in `<main>`, sections,
  tables, FAQs, headings, inline styles, JSON-LD.
- Served the render locally and drove headless Chrome (CDP) at 1440 and 390 px, light and dark.
- Checked the live site (`emargdarshan.com`) for canonical and cache headers.
- Read the layout, every include's usage, `main.css` (2,011 lines) and `scripts.html` (1,100+ lines).

---

## Headline findings (the 8 that matter most)

| # | Finding | Evidence | Severity |
|---|---|---|---|
| 1 | **~59 KB of inline JavaScript is repeated in every page** (≈60% of a light page's HTML). It can never be cached between pages. | Rendered `tables/*` page: 96 KB total, 59 KB inline `<script>`, 6 KB `<main>`. Only 4 Liquid values are used inside the script. | High (perf) |
| 2 | **Pages are too long on phones.** USA Computer Science = 14.7 phone screens, India CSE = 17.0, USA home = 29.2. The USA career template has 14 sections of equal visual weight. | CDP at 390×844: scrollHeight 12,417 / 14,323 / 24,679 px. | High (UX) |
| 3 | **Content is invisible without JavaScript.** `.reveal{opacity:0}` is unconditional; only JS adds `.is-visible`. If the script fails, sections stay blank. It also delays paint of below-the-fold content. | `main.css:625`, `scripts.html` reveal block. | High (a11y/resilience) |
| 4 | **122 roadmap pages are indexable but not in the sitemap**, and the sitemap lists `/index.html` while the live canonical is `/`. | 351 indexable pages vs 228 sitemap URLs; live `<link rel=canonical href="https://emargdarshan.com/">`. | High (SEO) |
| 5 | **Source presentation is a large section** ("Where these facts come from") at the bottom of every USA page, plus several `Source: …` lines per section. Exactly the clutter the brief wants removed. | `us-career-page.html` lines 370–391, 125, 166, 188, 226. | Medium (UX) |
| 6 | **Typography has no scale:** 56 distinct `font-size` values, 20 distinct `border-radius` values, 30 `!important`. Tokens exist for colour/radius/shadow but not for type or spacing. | grep over `main.css`. | Medium (design debt) |
| 7 | **On mobile the key numbers sit below the fold.** Hero = eyebrow + h1 + meta row + 6-line intro + two stacked full-width buttons, then the quick-fact cards. | Screenshot `us-cs-390-top`. | Medium (UX) |
| 8 | **Three web-font families load render-blocking** (Fraunces, Hind, JetBrains Mono) from Google Fonts with `display=swap` and no metric-matched fallbacks → font-swap layout shift. Mono is used mainly for eyebrows and numbers. | `default.html:83–85`. | Medium (CLS/LCP) |

---

## A. Architecture map

```
GitHub Pages (Jekyll, plugin: jekyll-redirect-from)  — no local Ruby; QA via liquidjs scripts
│
├─ _config.yml          url, defaults: layout=default; path "us" → region: us
├─ _layouts/default.html   THE only layout: head/SEO, pre-paint script, shell capture,
│                          relative-link rewriting by folder depth (root = "../" × depth)
├─ _includes/  (25)     shell: sidebar, header, brand, breadcrumb, footer, career-search, scripts,
│                       region-switcher, analytics, favicon
│                       India page systems: hub-ctas (148 pages), roadmap-page (122), state-page (8),
│                       country-page (7), niche-page (4), explorer (2), hub-filter (3), hub-switch (1)
│                       USA: us-career-page (20), us-pathway-cards (2), us-sources (6), fmt-num
│                       shared: roadmap-flow (India 5 + USA 3)
├─ _data/               India: nav, careers.json, colleges, coaching, search, explorer, state/country/niche JSON,
│                       roadmaps/*.json · USA: nav_us + us/ (10 YAML files) · regions.yml
├─ assets/css/main.css  ONE stylesheet, 154 KB, all pages
├─ assets/*.json        search index, crumb map, explorer data (fetched at runtime)
├─ scripts/             build-roadmaps, fetch-oews (BLS API), check-us-data, verify-site (not built)
└─ pages                426 HTML: ~200 root India pages, roadmaps/ 122, us/ 27, study-abroad 7,
                        state-pathways 8, niche-careers 4, tables 8, redirects 27 (+ ~48 root redirect stubs)
```

Region engine (works well, keep): region from front matter/defaults → `R` settings → `data-region`,
`lang`, `og:locale`, nav file, crumb root, footer. URL beats `localStorage['md-region']`. Neutral pages
apply the stored edition before paint. **No change recommended.**

## B. UI component map

| Component | Where defined | Used by | Notes |
|---|---|---|---|
| App shell (topbar, sidebar rail/drawer, crumb bar) | `sidebar.html`, `header.html`, CSS §App shell | all | Solid; drawer scroll-lock + Escape verified earlier. |
| Region switcher (`<details>` dropdown) | `region-switcher.html` | all | Works without JS. Keep. |
| `.page-hero` + `.quickfacts`/`.qf-card` | CSS §Page hero | India careers, USA | Quick facts use mono font; long labels wrap to 3 lines on phones. |
| `.quicknav` (sticky chip bar + scroll-spy) | CSS §Quick nav, scripts | most content pages | 11 chips on USA career pages — it is a table of contents, not a sub-nav. |
| `.block` / `.block-alt` + `.section-head` | CSS §Generic sections | every content page | Every section has eyebrow + h2 + paragraph → equal weight, no hierarchy. |
| `.table-simple` + `.table-wrap` | CSS §Tables | everywhere | Good responsive base. |
| `.salary-cards`, `.chip-grid .item`, `.info-card`, `.trend-card`, `.related-card`, `.stream-card` | various CSS sections | mixed | **5+ overlapping card types**; the "shared surface card" (line 1392) exists but older cards don't use it. |
| `roadmap-flow.html` (`.rflow`, 5 fixed steps s1–s5) | include | 8 pages | Fixed to exactly 5 steps; cannot express branching (MD vs DO, exam → residency → license). |
| `roadmap-page.html` (deep roadmaps) | include | 122 pages | Generated from `scripts/roadmap-src`. |
| FAQ accordion (`.faq-item` + button + max-height) | CSS + JS | most pages | Works; `<details>` would remove JS. |
| `.us-bar` CSS percentage bars | CSS end | USA | Good lightweight chart pattern — reuse for the design system. |
| Search overlay | `career-search.html` + JS | all | Fetches `assets/search.json` on open. Good. |
| Source links (`.source-link`, `.us-sources`, `table-note`) | CSS | USA, some India | No compact source component yet. |

Dead code (not deleted — listed for the owner): `_includes/finder.html` and `_includes/discovery-search.html`
are included by no page; `.test-dashboard-ready` in `main.css` is marked "safe to remove".

## C. Data architecture map

| Layer | Files | Shape | Assessment |
|---|---|---|---|
| USA facts | `_data/us/occupations.yml` (34 BLS occupations), `occupation_details.yml` (20 lead occupations: percentiles, industries, top-5 states, O*NET), `pathways.yml` (20 pathways → occupations, route, license, related, India mapping), `pathway_pages.yml` (copy), `licenses.yml` (9), `tests.yml`, `degrees.yml`, `immigration.yml`, `guides.yml`, `sources.yml` (source registry + `bls_vintage`) | YAML, every value with `source` id + `last_verified`; checked by `scripts/check-us-data.mjs` | **Strong foundation.** Pathway ≠ occupation separation is correct. Missing: 25th/75th percentiles, metro data, IPEDS, per-state licensing variation. |
| India facts | `careers.json`, `colleges.yml` (133 KB), `coaching.yml`, `state_exams.json`, `roadmaps/*.json`, country/niche/state JSON | Mixed JSON/YAML, mostly page-specific copy | Most India career content is hand-written HTML in each page, not data. Fine — protected. |
| Runtime JSON | `assets/search.json`, `crumb-map.json`, `explorer-*.json` | fetched on demand | **This is the right pattern for large datasets** (see H3). |

Scaling risk: putting state × metro × occupation data (thousands of rows) or IPEDS (~6,000 institutions)
into `_data/*.yml` would make every Liquid render slower and tempt template loops that bloat HTML.

## D. SEO map

| Item | Status |
|---|---|
| Title / description / canonical / og:url | Present on every page from layout; canonical = absolute URL. USA titles/descriptions unique (Phase 7 audit). |
| `lang` / `og:locale` | Per edition (`en`/`en_IN`, `en-US`/`en_US`). |
| JSON-LD | BreadcrumbList, Article, FAQPage, ItemList, WebPage — all parse. |
| H1 | Exactly one on every real page (0 only on redirect stubs, expected). |
| Sitemap | **Hand-maintained, 228 URLs. Missing all 122 `roadmaps/*` pages** (indexable, linked from career pages). Lists `/index.html`; canonical is `/`. No `lastmod`. |
| robots.txt | Allow all + sitemap. Fine. |
| Redirects | 27 in `redirects/` + ~48 root stubs via `redirect_to` (`sitemap: false`). Fine. |
| Internal links | Verified by `verify-site.mjs --all`. |
| hreflang | Correctly absent (India/USA pages are different content, not translations). |
| Caching | GitHub Pages `Cache-Control: max-age=600`; CSS 152 KB uncompressed (gzip on the wire). |

## E. India dependency map (what a shared change can break)

Every India page depends on: `default.html`, `sidebar.html` + `nav.yml`, `header.html`, `breadcrumb.html`,
`footer.html`, `career-search.html`, `scripts.html`, `main.css`.
High-fan-out India includes: `hub-ctas.html` (148 pages), `roadmap-page.html` (122).
India page classes most used: `.block`, `.section-head`, `.eyebrow`, `.container`, `.item`, `.btn`,
`.journey-*`, `.faq-*`, `.related-card`, `.table-simple`.

**Rule for later phases:** any change to those classes, the layout or `scripts.html` needs the full India
render diff (all ~398 pages, `<main>` byte comparison) plus screenshots of representative pages
(home, a stream hub, a career page, an exam page, a college finder, a roadmap, a study-abroad page).
Off-limits for automated content edits (earlier owner decisions): `study-abroad/`, `state-pathways/`,
`niche-careers/`, global pages, generated `roadmaps/*`.

## F. USA dependency map

`us/**` → layout (region `us`) → `nav_us.yml`, `us-career-page.html` / hub pages → `_data/us/*` →
`sources.yml`. USA uses India's components (`page-hero`, `quickfacts`, `block`, `table-simple`,
`chip-grid`, `salary-cards`, `faq`, `related-grid`, `roadmap-flow`) plus `.us-*` additions (bars, chips,
sources). So **USA redesign work is mostly shared-component work** → India impact must be checked every time.

## G. Technical debt list (prioritised)

1. Inline 59 KB script on every page (finding 1).
2. `.reveal` hides content until JS runs (finding 3).
3. Sitemap: 122 missing roadmap URLs, `/index.html` vs `/` (finding 4).
4. No type/spacing scale; 56 font sizes, 20 radii, 30 `!important` (finding 6).
5. 5+ overlapping card classes; one "shared surface card" exists but is not the base for the others.
6. `roadmap-flow.html` hard-coded to 5 steps (`s1`–`s5` params) — cannot model licensing branches.
7. Fonts: 3 families, render-blocking, no fallback metric overrides (finding 8).
8. Breadcrumb trail script fetches `assets/crumb-map.json` without `MD_ROOT` → wrong URL on nested pages
   (only when a trail parameter is present; harmless today, will break when India pages nest).
9. 315 inline `style=""` attributes in `<main>` across 152 pages (mostly India).
10. CSS is appended chronologically ("NEW GROUP HEADING", later overrides) — 91 media queries with
    ~25 different breakpoints (480, 560, 600, 640, 700, 720, 768, 800, 900, 1000, 1024, 1100 …).
11. Dead includes + one dead CSS rule (section B).
12. Sitemap is hand-maintained — will drift as pages grow.

## H. Recommended architecture

### H1. Career page model — "Overview + depth pages, only where the data earns it"

Current USA career page = one 14-section page (~1,250 words, 14.7 phone screens). The brief's 5-page
split per career would be too much: most pathways do not have enough *distinct* content for
"Careers" and "Pathway" pages of their own, and 20 × 5 near-empty pages is thin content.

**Proposed rule (to be finalised in Phase 3):** a section becomes its own URL only when all three hold:
1. it answers a separate search intent ("software developer salary by state", "best colleges for nursing");
2. it is driven by a filterable dataset, not prose;
3. on its own it would take more than ~2 phone screens.

Applied to USA careers:

| URL | Content | Why |
|---|---|---|
| `/us/careers/<slug>/` (Overview) | Answer-first hero (what it is · typical degree · top roles · median pay · outlook · license yes/no), visual roadmap, top occupations (3 shown, rest expandable), licensing summary, international-student note, FAQ, next steps. **Target ≤ 6 phone screens.** | Most users decide here. |
| `/us/careers/<slug>/salary/` | Pay distribution (10/25/50/75/90), National → State → Metro selector, industries, all occupations. | Separate intent + dataset. Created only for pathways with geographic data. |
| `/us/careers/<slug>/colleges/` | IPEDS-filtered programs (Phase 11). | Separate intent + dataset. Later. |
| Comparisons | Site-level `/us/compare/<a>-vs-<b>/`, curated pairs only. | Not per career. |

"Pathway", "Careers" and "Exams/Licensing" stay *on* the overview (compact); licensing detail already
has a home at `/us/professional-licenses/#<id>`. Local sub-nav (Overview | Salary | Colleges) appears
only on pathways that actually have those pages.

### H2. Compact source mechanism

Replace the bottom "Where these facts come from" section and the repeated `Source:` sentences with one
component:

```html
<details class="src">
  <summary>BLS · May 2025</summary>
  <div class="src-pop">Occupational Employment and Wage Statistics · U.S. Bureau of Labor Statistics
    · data period May 2025 · checked 2026-10-07 · <a href="…">View official data</a></div>
</details>
```

Why `<details>` over a JS popover/modal: works with no JS, keyboard + screen-reader accessible by
default, the official link stays in the HTML for crawlers, zero layout shift (pop-over is absolutely
positioned), and it is the same pattern as the region switcher (one shared closing script).
Plus one short line at the page end ("Data: BLS OEWS May 2025, projections 2025–35, O*NET 30.x ·
How we source data →") linking to a single `/us/methodology/` page that holds the full bibliography.

### H3. Geographic + university data as a static data API (key proposal)

CURRENT: data goes into `_data/*.yml` and is printed into HTML by Liquid.
PROBLEM: state × metro × occupation (BLS OEWS ≈ 50 states + ~390 metro areas per occupation) and IPEDS
(~6,000 institutions) would either bloat every page or require thousands of thin URLs (the
programmatic-SEO trap the brief warns about).
PROPOSAL: a Node script (like `fetch-oews.mjs`) converts official flat files into small JSON files —
`assets/data/us/oews/<soc>.json`, `assets/data/us/ipeds/<state>.json` — committed to the repo. The
salary/colleges pages render the national figures and top states in HTML (crawlable, works without JS)
and load the full JSON only when the user opens the State/Metro selector.
WHY BETTER: one indexable page per intent instead of thousands; HTML stays light; data refresh = rerun
script; same pattern already used by `search.json` and `explorer-*.json`.
EFFECT ON INDIA: none (new files only). The same pattern can later serve Indian college data.
**Needs owner approval in Phase 4** (it is a material architecture choice).

### H4. Performance architecture

- Move `scripts.html` to `assets/js/site.js` loaded with `defer`; keep only the pre-paint theme/region
  snippets inline and pass the 4 Liquid values via a tiny inline `window.MD = {...}` object.
  Saves ~55 KB per page view after the first. India impact: every page; verify with full diff + browser QA.
- Make `.reveal` progressive: hide only under `html.js` (set by the pre-paint script) and never for
  hero/above-the-fold content — or drop the effect for content blocks.
- Fonts: replace JetBrains Mono for numbers with Hind + `font-variant-numeric: tabular-nums` (keep mono
  only if the owner wants it as brand), add metric-matched fallback `@font-face` (`size-adjust`) to cut
  swap shift.
- Generate `sitemap.xml` with a script from rendered pages (roadmaps included, `/` not `/index.html`).

## I. Recommended global design system (direction; detailed in Phase 2)

Keep the brand (ink #0F2A3D, gold accent, Fraunces display, Hind body, calm green-grey paper).
Add what is missing, as tokens in `main.css :root`, mapped onto existing classes (no mass renaming):

- **Type scale (7 steps):** display, h2, h3, body, small, label, stat — replacing 56 sizes.
- **Spacing scale:** 4-based (`--sp-1 … --sp-8`); section padding tiers: primary / secondary / compact.
- **Breakpoints:** 4 only — 640, 768 (tablet), 1024 (desktop shell), 1440.
- **One card base** (`.card` = the existing "shared surface card") with modifiers: `stat`, `info`,
  `link`, `compare`; old classes keep working by sharing the base.
- **Hierarchy tiers per page:** Primary (answer-first hero + stat row), Secondary (roadmap, top roles),
  Supporting (tables, FAQ, details collapsed). Not every section gets eyebrow + h2 + paragraph.
- **Roadmap component v2:** data-driven list of N steps with optional branch/gate nodes (exam, license,
  residency); `<ol>` semantics, vertical on mobile, horizontal on desktop; replaces fixed 5-step `rflow`.
- **Source chip** (H2), **CSS bar/range chart** (extend `.us-bar` into a percentile range bar for
  10/25/50/75/90 — no chart library).
- **Dark mode:** already token-based (64 dark rules); audit surfaces/borders for elevation steps rather
  than one flat navy.

## J. Proposed phase roadmap (adjusted to what already exists)

The brief's 18 phases assume a fresh start; the region engine, USA data layer and 27 USA pages already
exist. Adjusted plan, one phase per run, commit + push, then wait for **GO**:

| Phase | Scope | Production change? |
|---|---|---|
| **1** ✅ | This audit | No |
| 2 | Design-system proposal: type/spacing/card/breakpoint tokens, source chip, roadmap v2, range bar, hero layout — with an HTML preview page excluded from the sitemap | Preview page only |
| 3 | Information architecture: final one-page vs hub rules, URL map for India/USA/future country | Doc |
| 4 | Data architecture: schema additions (percentiles 25/75, metro, licensing per state, IPEDS), static data API decision (H3) | Doc + schema |
| 5 | Global UI foundation: tokens, card base, source chip, `.reveal` fix, external JS, font fallbacks — full India diff + screenshots | Yes (shared) |
| 6 | Navigation + region UX polish, breadcrumb `MD_ROOT` fix, generated sitemap | Yes |
| 7 | Career page system v2 (overview + optional salary subpage) on 2 benchmark pathways | Yes (USA) |
| 8 | Pilot: CS, Medicine, Law, Mechanical Eng., Accounting | Yes (USA) |
| 9 | Remaining USA pathways in groups | Yes |
| 10 | Geographic salary explorer (OEWS JSON) | Yes |
| 11 | Colleges (IPEDS JSON) | Yes |
| 12 | Licensing + exams components (state variation) | Yes |
| 13 | International students rebuild (USCIS, dated) | Yes |
| 14 | Comparisons | Yes |
| 15 | India rollout of proven shared components | Yes (India) |
| 16–18 | Performance/a11y audit, SEO/indexation audit, final global QA | Fixes |

---

## Quality gate (Phase 1)

1. **Researched:** whole repo, rendered output of 429 pages, live headers/canonical, screenshots
   (USA CS 1440/390, India CSE 1440, USA Medicine dark).
2. **Discovered:** the 8 headline findings above; the strongest are the repeated inline JS, page length
   on phones, JS-dependent visibility, and the sitemap gap.
3. **Changed:** nothing in production. Added this document only.
4. **Why:** Phase 1 is an audit; changes start in Phase 5 after the design and IA are agreed.
5. **Files:** `docs/global-platform/PHASE-1-AUDIT.md` (new, not published).
6. **Could affect:** nothing (excluded from build).
7. **Tested:** n/a for code; measurements reproducible with the render + CDP scripts described above.
8. **Unresolved / owner decisions:**
   - Approve the career model in H1 (overview + optional salary/colleges subpages, not 5 pages)?
   - Approve the static data API (H3) for state/metro/IPEDS data?
   - Keep JetBrains Mono, or move numbers to Hind tabular figures?
   - May the dead includes (`finder.html`, `discovery-search.html`) be deleted later?
   - Quick wins (sitemap fix, `.reveal` fix) — do them now as a hotfix, or wait for Phases 5–6?
9. **Better approach than the brief:** yes — (a) not splitting every career into 5 pages (H1);
   (b) static JSON data API instead of geographic page generation (H3); (c) `<details>` source chips
   plus one methodology page instead of per-page bibliographies (H2).
10. **Before Phase 2:** decide the questions in 8; Phase 2 will produce a visual preview so decisions are
    made on real rendered components, not descriptions.
