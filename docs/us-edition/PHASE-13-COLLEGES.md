# USA Master Plan Phase 13: colleges, training and city pages (2026-10-21)

## 1. What shipped

| URL | Count | Template | Data |
|---|---|---|---|
| `us/colleges/` | 1 | `us-colleges-hub.html` | `_data/us/college_index.json`, `college_fields.json`, `apprenticeships.json` |
| `us/colleges/<state>/` | 51 (50 states + DC) | `us-colleges-state.html` | `_data/us/college_states/<state>.json` |
| `us/colleges/<state>/<city>/` | 493 (cities with 3+ schools) | `us-colleges-city.html` | same state file, rows with `cs` = city |
| `us/colleges/fields/` | 1 | `us-colleges-fields.html` | `college_fields.json` |
| `us/colleges/fields/<career>/` | 110 | `us-colleges-field.html` | `college_fields.json` + `assets/data/us/colleges/fields/<career>.json` (finder) |

656 pages, 656 search entries (`_data/us/college_search.json`, concatenated by `assets/search.json`).

Buttons: every generic career page (`us-career-overview.html`) and trade page (`us-cte-career.html`) gets **Colleges**
when `college_fields.json` has it, and **Apprenticeships** (Apprenticeship.gov job finder) when `apprenticeships.json`
has it. Pathway pages (`us-career-v2.html`) get Colleges (their existing `/colleges/` page) and Apprenticeships text
links. State pages link `us/colleges/<state>/`. Home "Colleges & training" card is live; USA menu has two new children.

## 2. Data pipeline

```
VERIFY_DEPS=<js-yaml dir> node scripts/build-ipeds.mjs --year 2024 --places --cache <dir> \
  --scorecard <Most-Recent-Cohorts-Institution_MMDDYYYY.zip> [--crosswalk …] [--cipcodes …] [--rapids …]
node scripts/build-us-colleges.mjs          # stubs + search entries
node scripts/build-us-colleges.mjs --check  # 0 problems = stubs match data (never deletes)
```

Code: `scripts/lib/college-places.mjs`. Sources (all opened 2026-10-21):

- College Scorecard, Most-Recent-Cohorts-Institution, release 15 Oct 2026 (collegescorecard.ed.gov/data): directory
  (CURROPER = 1, i.e. operating Title IV schools), ICLEVEL, CONTROL, COSTT4_A / COSTT4_P, NPT4_PUB / NPT4_PRIV
  (2024-25), C150_4 (fall 2019 cohort) / C150_L4 (fall 2022 cohort), UGDS. Field years from the dictionary's cohort map.
- NCES IPEDS C2024_A (2023-24 completions, first majors; all award levels incl. certificates 20/21/2/4 and doctorates
  17/18/19). IPEDS 2025 files (HD2025, C2025_A) still return 404.
- NCES CIPCode2020.csv (family and program titles), CIP2020_SOC2018_Crosswalk.xlsx (SOC-CIP sheet).
- DOL approved-occupations.xlsx (RAPIDS code, O*NET-SOC, type, minimum/maximum term hours).

Rules: city = Scorecard CITY, grouped when spellings differ only by case or "St."/"Saint" (display = the mixed-case
spelling); level = ICLEVEL ("trade schools" = less-than-2-year); field = 2-digit CIP family with the highest award
that year; completion shown as a whole percent; formatted strings (`fc`, `fn`, `fu`, `fg`) are precomputed so the
pages do not call the number-format include ~40,000 times (GitHub Pages build time).

## 3. Corrections and decisions (prompt vs. sources)

- The prompt asked for IPEDS + Scorecard: the directory, cost and completion come from the Scorecard file (it carries
  the newest IPEDS directory, 2025-26, and FSA's "currently operating" flag); fields come from IPEDS 2023-24.
  A school that opened after 2023-24 shows "No awards reported".
- Program lists are per career, built only from the NCES crosswalk (no hand picking). Not built: postsecondary
  teacher (1,233 programs) and high school teacher (92) — the crosswalk links them to nearly every subject; sales
  engineer and construction laborer (crosswalk: NO MATCH); ironworker (its one program had no awards). The page
  `us/colleges/fields/` lists them with the reason. Management careers map to Business Administration, so their
  lists hold ~2,500 schools — that is the official crosswalk.
- SOC 21-1018 (mental health counselors) is not in the crosswalk; it carries O*NET 21-1011 + 21-1014 (already
  recorded in occupations.yml), used as an alias.
- Apprenticeship.gov has no verified per-occupation deep link (the occupation search is a script app), so the button
  opens the official Apprenticeship Job Finder; the DOL titles, RAPIDS codes and term hours are on each program list.
  Matches are DOL's own O*NET codes (e.g. police officer includes cyber analyst titles filed under 33-3021).
- Item 4 (coaching): already met — all 35 exam pages have an official free-practice section. No private centres are
  listed; the hub explains why. `check-us-data` now fails if an exam page loses its practice section or its source.
- 148 schools in U.S. territories are in the program lists but have no state page (state_index has 51 rows).

## 4. Checks

`check-us-data` (new block: counts, city rule = exactly the 3+ cities, stubs, finder files, sources incl. release
date in the Scorecard source name, apprenticeship rows, home/nav links, exam practice), `check-search` (5 new
queries), `verify-site --all`, `build-us-colleges --check`.

## 5. Queue / follow-ups

- Territory pages (Puerto Rico 137 schools) if the owner wants them.
- Yearly refresh: new Scorecard release (October) and IPEDS C2025_A when NCES posts it; rerun both scripts, then the
  checks. A city that falls below 3 schools is reported by `--check`; turn its folder into a redirect_to stub.
- Phase 14 (links/search/QA) can add city links on the state pages of `us/states/` and program lists on cluster hubs.
