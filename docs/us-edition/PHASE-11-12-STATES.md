# USA Master Plan — Phases 11 and 12: state pages, state licensing and public jobs

Batch 1 shipped 2026-10-21, run together: the States hub, the 10 most populous states (Phase 11) and, for the same 10
states, a licensing page built from each state's own boards plus state and city civil service (Phase 12). Both phases
are too big for one run (51 jurisdictions, each read on its own sites), so the rest is queued in section 5.

## 1. What was built

| Page | What it shows |
|---|---|
| `us/states/` | All 51 jurisdictions A to Z with Census Vintage 2025 population and rank (copied from the CSV, never computed); state pages listed largest first; a compare table (state test, diploma unit, state grant, SAA vs DOL office). Unbuilt states have no link. |
| `us/states/<slug>/` (10) | California, Texas, Florida, New York, Pennsylvania, Illinois, Ohio, Georgia, North Carolina, Michigan. Sections: diploma (credits table + state tests), state test (name, tests, grades, what scores are used for), public university and community college systems, in-state tuition rule, state aid, licensing boards, state and city jobs, registered apprenticeship, sources. 9 `h2[id]` sections → right rail + phone chips. |
| `us/states/<slug>/licenses.html` (10) | Every license row for that state: Phase 12 rows from the state file (body, requirement, exam, fee, renewal, source chips) plus the older `licenses.yml boards` and `cte_careers.yml states` rows for the same place. Also state and city civil service. |
| License pages `us/professional-licenses/<id>/` | The state table is now the full matrix: State · What the board asks for · Exam · Fee · Renewal; older rows span the four cells. State names link the state licenses page. |
| Trade roadmaps `us/cte/roadmaps/<slug>.html` | The state matrix also lists Phase 12 rows keyed by the trade (Ohio electrician/plumber/HVAC, Illinois plumber, Michigan electrician). |

Data: `_data/us/state_index.yml` (51 rows + the state file schema), `_data/us/states/<slug>.yml` (one per state, each with
`checked` and `review_by: 2027-04-21`), `_data/us/sources.yml` (+133 sources). Stubs: `scripts/build-us-states.mjs [--check]`.
Checks: `scripts/check-us-data.mjs` validates every state file (sources, required blocks, a university and a community
college entry, license keys must be a licenses.yml id or trade slug, no duplicate place with older rows, stubs exist,
`review_by` not passed, Home card and menu link). `scripts/check-search.mjs` +7 queries; `_data/search.yml` +21 entries.
Wiring: USA Home "States" card now links; USA menu has States (5 largest + all); footer link; Exams hub grades 3–8
stage links the state pages; New York links the New York City hub (kept as is).

Phase 12 rows in this batch (33): nursing 7 (CA, TX, FL, NY, PA, IL, GA), CPA 5 (CA, TX, NY, PA, NC), law 8 (CA, TX, FL,
NY, PA, IL, GA, NC), PE 5 (CA, TX, FL, PA, OH), cosmetology 1 (PA), real estate 2 (PA, NC), electrician 2 (OH, MI),
plumber 2 (IL, OH), HVAC 1 (OH). TX, CA, NY and FL already had teaching, cosmetology, real estate, EMT and trade rows
from Phases 2–8; those were not repeated.

## 2. Corrections and notes from the sources

- **Not every state has "credits"**: Pennsylvania sets no statewide course-credit list (local requirements plus five
  Pathways to Graduation); California sets courses of one year each, not credits; Michigan counts proficiency-based credit.
- **Not every state has one system**: Texas has no single community college system (50 districts, Comptroller page);
  Illinois public universities are coordinated by IBHE, not one system; New York's community colleges sit inside SUNY and
  CUNY; Michigan universities set their own residency rules (U-M has constitutional authority to do so).
- **California is listed under both** the DOL Office of Apprenticeship and the State Apprenticeship Agencies on
  apprenticeship.gov; the page says so. TX, IL, GA, MI = DOL office; FL, NY, PA, OH, NC = state agency.
- **Illinois uses the ACT** (ACT + Science + Writing) in grade 11 since 2024-25, not the SAT.
- **Texas in-state tuition**: Education Code 54.052 is quoted, together with the 4 June 2025 federal consent judgment that
  bars applying 54.052(a) to people not lawfully present (Texas OAG PDF).
- **New York NY HELPS**: the Civil Service page says exams were waived for most open-competitive jobs from May 2024 to
  June 2026; the page states that period as written (it has ended).
- **Ohio**: education.ohio.gov rejects every request from India and its archive copies are the same rejection page, so
  the diploma and test rules come from the Ohio Revised Code (3313.603, 3313.618, 3301.0710) instead.
- **California CPA**: new rules under AB 1175 start 1 Jan 2027; the current route stays valid to 31 Dec 2028.
  **Texas CPA**: Pathway B (120 hours + 2 years) from 1 Aug 2026. **NC CPA**: three pathways from 1 Jan 2026.
- **Bar exams**: Texas gives its first NextGen UBE in July 2028 (accepts NextGen transfer scores of 620+ now); Florida
  gives the NextGen Bar Exam with a Florida component from July 2028; New York switches from the UBE in July 2028.
- Counting rule kept: lists are not totalled by us (Florida's State University System is listed by name).

## 3. Fetch tricks

- Many state sites block or time out from India (cde.ca.gov WAF, csac.ca.gov 403, fldoe.org Akamai, hesc.ny.gov 403,
  tsbpa.texas.gov 403, gadoe.org timeout, michigan.gov media 403). `tools/wbc.sh` (scratchpad a7daa37b) looks up the latest
  status-200 Internet Archive capture through the CDX API and fetches it with `id_`; every such source carries a note
  with the capture date.
- Texas statutes: statutes.capitol.texas.gov is a JS app; the raw text is at `tcss.legis.texas.gov/resources/ED/htm/ED.54.htm`.
- Pennsylvania DOS has one "Licensure Requirements Snapshot" page per license (index:
  `/agencies/dos/resources/professional-licensing-resources/_occupational-licensure-requirements-snapshots`) with
  requirement, exam, fee and renewal on one page — the model for every PA row.
- PDFs via `pdftotext -layout`; GA SBOE rules and the MI assessment guide only through archive captures.

## 4. Gaps (boards or pages we could not open; no row was filled from a third-party site)

| State | Not done in batch 1 | Why |
|---|---|---|
| California | EMT; bar exam fee | emsa.ca.gov fails headless; State Bar fee PDF not readable |
| Florida | CPA; RN fee | myfloridalicense.com 403, no archive copy; fees load in a script tab |
| New York | PE | NYSED OP engineering pages 404 / timeout |
| Pennsylvania | EMT, trades | No statewide electrician / plumber / HVAC board on the DOS snapshot list (licensing is local, e.g. Philadelphia L&I) — not stated by an official page we opened, so no row |
| Illinois | CPA, PE, real estate, cosmetology; Chicago jobs | IDFPR profession pages moved (404); chicago.gov page 404 |
| Ohio | RN, CPA detail, bar, cosmetology, real estate, EMT | Board home pages give no requirements; supremecourt.ohio.gov timeout |
| Georgia | Electrical, plumbing, HVAC, CPA, PE, cosmetology, real estate | sos.ga.gov form PDFs 403 |
| North Carolina | RN, PE, electrical, plumbing | ncbon.com 403; board home pages give no requirements |
| Michigan | Bar, RN, CPA, PE, plumber, HVAC | courts.michigan.gov 403; LARA profession pages 404 |
| All 6 new states | Teaching, EMT for most | Not reached in this batch |
| Cities | Houston, Chicago, others | Only LA, NYC and Philadelphia pages gave hiring details |

## 5. Queue (reply "continue Phase 11" / "continue Phase 12")

- **Phase 11 batch 2** (next 10 by Census rank): New Jersey, Virginia, Washington, Arizona, Tennessee, Massachusetts,
  Indiana, Missouri, Maryland, Colorado. Then Wisconsin … Wyoming (batches 3–5). Add each state to the menu only if it is
  among the largest shown.
- **Phase 12 batch 2**: close the gaps above for batch-1 states (start with teaching and EMT for PA, IL, OH, GA, NC, MI;
  then CPA/PE where the board page opens), then rows for batch-2 states as they are built.
- Re-check every state file by its `review_by` date (2027-04-21); the checker fails once it passes.
