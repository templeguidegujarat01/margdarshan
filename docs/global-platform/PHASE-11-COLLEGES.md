# Phase 11 — University / College System (NCES IPEDS)

Date: 2026-10-07. Every USA career pathway now has a colleges page:
`/us/careers/<slug>/colleges/` (20 pages). The career hub sub-nav is now **Overview · Salary by state ·
Colleges** (a shared include; only existing pages are listed).

## Research and data decisions

- **Source:** NCES IPEDS complete data files `HD2024` (institutions) and `C2024_A` (degrees awarded
  July 2023 – June 2024). 2025 files are not released yet. Federal data, no API key, one download a year.
- **Which programs count for which career** is curated: 1–3 six-digit CIP 2020 codes per pathway, each
  checked against the NCES CIP 2020 ↔ SOC 2018 crosswalk (every code maps to the pathway's lead SOC) and
  against IPEDS completions. **Caught during research:** osteopathic medicine (D.O.) is CIP **51.1202** in
  CIP 2020, not the old 51.1901, which has zero 2023-24 completions. The checker now fails on any code with
  no completions, and a negative test with 51.1901 produced that error.
- **Counting:** first majors only (each graduate once), award levels 3/5/7/17/18/19 (associate to doctorate),
  aggregate codes skipped. Per school, awards are kept by level and by program (so M.D. and D.O. stay
  separate).
- **Not a ranking, not accreditation.** IPEDS shows which schools award a degree. The page says so; the
  "largest programs" table is ordered by graduates and says that size is not quality. Accreditation comes
  only from each accreditor's own directory (`_data/us/accreditors.yml`): ABET, LCME, COCA, CODA, ACPE, CAPTE,
  ABA, CCNE, ACEN, APA, AACSB, plus institutional accreditation via the Department of Education's DAPIP.
  All directory links were checked (200), except americanbar.org, which blocks automated readers; that one
  is marked for a manual re-check in `sources.yml`.
- **No per-state or per-school pages** (IA rule R8): one finder page per pathway instead of thousands of
  thin URLs.

## What each colleges page has

1. Answer-first header: number of colleges, states/territories, degrees awarded at the main level
   (bachelor's or professional doctorate), the largest program. IPEDS source chip with files, year and CIP codes.
2. **Find a college** (progressive): filters for state, degree level, type of school (public, private
   nonprofit, private for-profit), program (when a pathway has several, e.g. M.D. / D.O.) and name. Each result
   shows city, type, awards by level, and links to the school website and its official **College Navigator**
   profile (costs, admissions, graduation rates). 30 results per page on desktop, 10 on phones, "Show more".
3. **Largest programs by graduates** (HTML, works without JS): top 10 with College Navigator links; per-program
   totals for multi-program pathways (Medicine: M.D. 20,668 · D.O. 8,465).
4. **Check accreditation before you apply:** each relevant accreditor with a one-line description and a
   link to its directory, institutional accreditation (DAPIP), and the licensing route when the pathway has a
   license.

Coverage (2023-24): computer science 986 colleges · nursing 1,996 · business 2,290 · psychology 1,633 ·
accounting 1,298 · law 210 · medicine 182 · dentistry 65 · AI 66 · … (all 20 in `_data/us/colleges_summary.json`).

## Files

- Data: `_data/us/pathways.yml` (`colleges`, `cip` with labels, `accreditation` for all 20),
  `_data/us/accreditors.yml` (new), 16 new sources in `sources.yml`, generated
  `assets/data/us/colleges/<slug>.json` (20 files, 1.5 MB raw, the largest 64 KB gzipped, so one file per
  pathway is enough) and `_data/us/colleges_summary.json`.
- Templates: `_includes/us-career-colleges.html` (new), `_includes/us-career-subnav.html` (new, used by
  overview, salary and colleges pages), `_includes/us-career-v2.html` ("Colleges that offer this degree →"),
  `_includes/us-career-salary.html`. Stubs: `us/careers/*/colleges/index.html` (20). Search: 20 entries.
- Tooling: `scripts/build-ipeds.mjs` (`--from-pathways`, per-program counts, summary), `scripts/check-us-data.mjs`
  (CIP codes must have completions, accreditors resolve to sources, pages exist), `DATA-REFRESH.md` (IPEDS step).
- CSS: finder controls, result cards, chips, `.md-page [hidden]` fix.

## Verification

- Render diff vs Phase 10: 406 identical, 0 non-USA pages changed, 39 USA pages changed (sub-nav and links),
  20 new. `verify-site.mjs --all`: only the 4 known warnings. `check-us-data.mjs`: 0 problems (82 sources).
- Headless Chrome: Medicine finder loads 182 colleges; program "Osteopathic medicine (D.O.)" + Texas returns
  Sam Houston State University, University of North Texas Health Science Center and University of the
  Incarnate Word. Nursing at 390 px with filters: no overflow. Psychology colleges page: 7.0 phone screens.
  Without JS (Law): the largest-programs table and the accreditation list render. Software Engineering's sub-nav
  links to the CS salary page and its own colleges page.
- **Caught and fixed:** "Show more" stayed visible with 0 results (`.btn` display overrode `hidden`); a
  double parenthesis in the lede; the label "Psychology, general".

## Quality gate

1. **Researched:** IPEDS file availability and dictionary, CIP 2020 codes against the crosswalk, accreditor
   directories (checked links).
2. **Discovered:** the D.O. code change (51.1901 → 51.1202); IPEDS counts include non-ABA law schools, so IPEDS
   must never stand in for accreditation.
3. **Changed / 5. Files:** see above. 4. **Why:** answer "where can I study this?" with complete official data
   and honest limits.
6. **Could affect:** USA pages only. 7. **Tested:** see Verification.
8. **Unresolved:** cost, admission rate and graduation rate per school are not shown here (they are one click
   away in College Navigator). Adding them from IPEDS would add `ADM`/`GR`/`COST` files and a careful
   per-institution vs per-program explanation — a candidate for later.
9. **Better than the brief:** the brief suggested a large directory; per-career finders with one shared data
   pipeline give the same coverage with focused pages.
10. **Next (Phase 12):** licensing + exams components (state variation).
