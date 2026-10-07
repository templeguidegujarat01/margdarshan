# Phase 10 — U.S. Geographic Data

Date: 2026-10-07. The National → State → Metro explorer from Phase 7 is now on all 17 salary pages. This
phase adds the views that answer "where" questions, and makes the yearly data refresh safe.

## Research → design decisions

- **Ranked lists instead of a map.** A choropleth map of 50 states needs a large SVG and colour-only
  encoding, and it hides small states. Ranked lists answer the actual questions ("where are the jobs?",
  "where does it pay most?") in text, work without JavaScript, are crawlable and are accessible.
  Decision: no map. A sortable all-states table covers browsing.
- **Rankings are orderings, not calculations.** Highest-pay lists include only places with at least
  **500 jobs** (`rank_min_emp` in the generated summary, printed on the page), so a handful of jobs in a
  small area cannot top the list. The page also says that BLS wages are not adjusted for living costs.
- **No per-state or per-metro URLs** (Phase 3 rule R8): the place changes only the numbers, so a filter and
  a comparison serve users without hundreds of thin pages.

## What shipped (all 17 salary pages)

1. **"Where the jobs are, and where pay is highest"** — four ranked lists in HTML: states with the most jobs,
   highest-paying states, metro areas with the most jobs, highest-paying metro areas (top 5 each, median pay
   and jobs). Example, software developers: San Jose-Sunnyvale-Santa Clara $213,110 · San Francisco-Oakland-
   Fremont $186,640 · Seattle-Tacoma-Bellevue $167,280; most jobs: New York-Newark-Jersey City (121,000).
2. **Compare two places** — a "Compare with" picker (United States or any state) shows the current place and
   the chosen one side by side: 10th, 25th, median, 75th, 90th percentile, mean and jobs. It follows the state
   or metro currently selected. Example: California vs Texas median $174,410 vs $132,150.
3. **All state-level areas, sortable** — inside one disclosure: every state, DC and territory BLS publishes,
   sortable by name, jobs, median, mean or top 10% (header buttons with `aria-sort`). Values BLS does not
   publish (for example Alaska's median for software developers) show as "Not published" and sort last.

Data: `scripts/build-oews.mjs` now writes `top_pay_states`, `top_pay_metros`, `top_emp_metros` and
`rank_min_emp` into `_data/us/oews_summary.json` (the per-SOC JSON files are unchanged).

## Refresh safety

- New checker rules in `scripts/check-us-data.mjs`: the summary period, `assets/data/us/oews/_meta.json`
  and `sources.yml → bls_vintage.wage_ref` must name the same release; SOCs without OEWS data fail.
  Tested: changing `wage_ref` to "May 2026" produced the expected error; restoring it passed.
- Runbook: `docs/global-platform/DATA-REFRESH.md` (OEWS yearly in spring, OOH/projections, O*NET, IPEDS,
  quarterly volatile rules, pre-push checks).

## Verification

- Render: no unresolved Liquid; `verify-site.mjs --all`: only the 4 known warnings; checker: 0 problems.
- Headless Chrome: rankings render without JS (4 lists, 20 items) and the compare picker stays disabled with
  a note; with JS, CA vs TX comparison values match the data file; sorting by median puts California,
  Washington and New York first, and toggling puts Puerto Rico first; AI (smallest dataset: 37 state-level
  areas, 76 metros) still gets 5 highest-paying metros above the 500-job threshold. No page overflow at
  390 px (wide tables scroll inside their frame, the site's standard table pattern). No console errors.

## Quality gate

1. **Researched:** map vs ranked lists for this data; ranking fairness for small areas; refresh failure modes.
2. **Discovered:** a half-finished yearly refresh could mix releases. Now a checker error.
3. **Changed:** `scripts/build-oews.mjs`, `_data/us/oews_summary.json`, `_includes/us-career-salary.html`,
   `assets/css/main.css`, `scripts/check-us-data.mjs`, `docs/global-platform/DATA-REFRESH.md`, this document.
4. **Why:** answer "where" questions without thin geographic pages; keep the data trustworthy over years.
6. **Could affect:** the 17 salary pages only. 7. **Tested:** see Verification.
8. **Unresolved:** a cost-of-living view would need a separate official source (e.g. BEA regional price
   parities). Not added; proposal for later.
9. **Better than the brief:** the brief suggested a map; ranked lists + comparison + sortable table do the job
   with no extra weight and full accessibility.
10. **Next (Phase 11):** university/college system from IPEDS (`scripts/build-ipeds.mjs` is ready).
