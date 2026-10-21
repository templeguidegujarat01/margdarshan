# USA Master Plan — Phase 9: Exams hub and school-stage exam pages

2026-10-21. New: `us/exams/` (hub) and `us/exams/<slug>/` (18 pages). Data: `_data/us/exams.yml` (new; extends
`tests.yml`), `_data/us/sources.yml` (+85, and `accessed` refreshed on 8 re-read sources), `_data/search.yml` (+19).
Templates: `_includes/us-exams-hub.html`, `_includes/us-exam-page.html`. Stubs: `scripts/build-us-exams.mjs [--check]`.
Checks: `scripts/check-us-data.mjs` (Exams block), `scripts/check-search.mjs` (+8 queries).

## 1. What was built

| Stage (hub section) | Exam pages |
|---|---|
| Grades 3–8 (`#grades-3-8`) | NAEP (state tests: statute line here, one page per state in Phase 11) |
| Grades 8–11 (`#grades-8-11`) | PSAT 8/9, PSAT 10, PSAT/NMSQT, PreACT (+ PreACT 8/9) |
| College admission and credit (`#admission`) | SAT, ACT, CLT, AP Exams (all 42 subjects with 2027 day, session, length, portfolio deadline), IB Diploma, CLEP |
| High school equivalency (`#equivalency`) | GED (5 state price/age examples), HiSET |
| English proficiency (`#english`) | TOEFL iBT, IELTS Academic, Duolingo English Test |
| Military and career (`#military-career`) | ASVAB with the Career Exploration Program on the same page, ACT WorkKeys / NCRC |
| Graduate, licensing, government | Links to the live pages that cover them now (`us/tests/#grad-tests`, `us/professional-licenses/`, Public Service hub `#public-sector`); dedicated pages are Phase 10. PCAT shown as retired |

Every exam page has: who takes it (grade/age), format and sections, scoring, fees and fee waivers (or what the owner says
instead), dates for the current cycle (or "no national dates" where the owner says you book yourself), where it is
accepted, free official practice, and "Used by these careers and colleges": colleges from `guides.yml` testing policies
plus West Point / service academies, and careers on this site whose BLS typical entry is a bachelor's or higher (SAT, ACT,
CLT, AP, IB, CLEP) or a high school diploma or equivalent (GED, HiSET, WorkKeys). Each block carries its source chip;
4+ `h2[id]` per page so the right rail and phone chips build.

Wiring: USA home Exams card and sidebar now link `us/exams/` (sidebar children = the stage sections); `us/tests/` keeps
its URL and content (no redirect needed) and links the hub; the Public Service hub's ASVAB line links the ASVAB page and
the West Point row links SAT, ACT and CLT; the International Students page links the three English tests.

Roadmap exam gates: 36 start steps "High school diploma or equivalent" + 2 "… or GED" now link the GED/HiSET section
(`us/exams/#equivalency`, `us/exams/ged/`). Every other `kind: exam` gate in the roadmaps is a licensing or graduate exam
(NCLEX, MCAT, FE/PE, CPA, Series 7 …) whose page is Phase 10; the MCAT gate still links `us/tests/#grad-tests`.
`check-us-data.mjs` now fails if any roadmap step names SAT, ACT, CLT, GED/equivalent, ASVAB, TOEFL, IELTS, CLEP or
WorkKeys without linking that exam's page.

## 2. Corrections and notes from the sources

- **"Fees with fee waivers" for PSAT 8/9, PSAT 10, PSAT/NMSQT**: students do not pay College Board; schools, districts
  or states pay ($14 PSAT 8/9, $18 PSAT/NMSQT and PSAT 10 list price, 2026-27). There is no student fee waiver: low-income
  schools get an automatic discount up to 45% (lowest price $4). Pages say exactly that.
- **"Grade 3–8 state tests"** are each state's own test. Federal law (20 U.S.C. § 6311(b)(2)(B)(v)) requires reading or
  language arts and math in each of grades 3–8 and once in 9–12, science once in 3–5, 6–9 and 10–12. NAEP is the only
  national one and gives no individual scores. State test pages belong to Phase 11.
- **ASVAB "+ CEP"**: the CEP is the same ASVAB given at school (Assembling Objects is not given there; students get
  three career composites instead of the AFQT). One page covers both, as the official FAQ describes them.
- **Retired tests**: none of the 18 is retired. Changes shown instead: TOEFL moved to a 1–6 scale on 21 Jan 2026 (0–120
  estimate for two years); ACT science is optional and out of the Composite since Sept 2025; PreACT gets a new
  2 h 40 min blueprint in fall 2026; SAT Essay only where a state requires it for SAT School Day. PCAT (retired Jan 2024)
  is labelled on the hub.
- **"Test dates for the current cycle"**: NAEP, GED, HiSET, CLEP, ASVAB, WorkKeys, TOEFL, IELTS and Duolingo have no
  national calendar; the pages say how you book instead of inventing dates. IB: sessions in May and November; the
  schedule PDFs returned 403 to our browser, so no exam days are quoted.
- **HiSET** is now run by PSI Services (hiset.org footer), not ETS.
- **CLT score range**: the FAQ gives sections 1–40 and a total "1–120"; the CLT-vs-SAT page prints "0–120". The page
  uses the FAQ and mentions the other.
- **TOEFL extra score report**: the fee page says US$29, the scores page US$25; the page uses the fee page ($29).
- **AP fee table** names "DoWEA schools" (College Board's current wording), not DoDEA.
- **Counts are not computed**: CLEP and HiSET pages list every exam / jurisdiction without a total, because the owners
  do not state one; AP's "42 subjects" is College Board's own number and the checker keeps the subject list at 42.

## 3. Not published (and why)

- Duolingo English Test price: not printed on its public pages; the help center timed out from India. Only third-party
  sites give a figure, so the page says the price is shown at checkout.
- IB per-student fees: none on the IB pages read.
- WorkKeys and PreACT prices: ACT quotes them to schools and employers; no individual fee published.
- ASVAB: no applicant fee is listed; the CEP is free to participating schools.

## 4. Fetch tricks

- `satsuite.collegeboard.org` / `apstudents.collegeboard.org` / `clep.collegeboard.org`: fine in headless Edge; many old
  URLs 404 (fees now under `/sat/registration/fees-refunds/test-fees`; PSAT pricing under `/k12-educators/district-school-pricing`).
- ACT pages hide FAQ answers in collapsed HTML: read the saved `.html` (txt.cjs), not innerText.
- GED prices are per state at `www.ged.com/policies/<state>.html` (the price dropdown page is script-only).
- TOEFL fee needs the country dropdown: `pick.cjs` (select "United States", then read the page).
- ibo.org PDFs and ed.gov PDFs: Cloudflare 403 even through the browser. uscode.house.gov did not render: statute read
  on Cornell LII.
- AP subjects: each course's `/assessment` page has duration, day and session; `ap-parse.cjs` + `ap-group.cjs`
  (session scratchpad 47af8ab4) turn them into `ap_subjects`.

## 5. Queue (Phase 10 and later)

- Phase 10: GRE, GMAT, LSAT, MCAT, DAT, OAT, PCAT (retired), NCLEX, USMLE, COMLEX, CPA, FE/PE, bar/MPRE, NAPLEX, Praxis,
  FINRA, USAJOBS assessments, police/fire exams; then link every remaining `kind: exam` roadmap gate to its page and
  extend the checker's GATES list.
- PSAT/NMSQT: National Merit selection index and dates (nationalmerit.org redirected to a login page today).
- CLT10, CLT3-8, SAT School Day, TOEFL Essentials, IELTS General Training, PTE Academic if wanted.
- GED and HiSET: one row per state (Phase 11 state pages) with price, age and the test the state offers.
- IB exam days once the schedule PDFs can be read.
