# USA Master Plan — Phase 6: Construction and Advanced Manufacturing

2026-10-21. Hubs: `us/clusters/construction/`, `us/clusters/advanced-manufacturing/` (both were already live). Data:
`_data/us/cte_careers.yml` (+9 trades), `_data/us/home.yml` (trades matrix +8 rows, machinist row now linked),
`_data/us/careers/construction.yml` and `advanced-manufacturing.yml` (new), `_data/us/licenses.yml` (new
`architecture`), `_data/us/clusters.yml` (placement), `_data/us/sources.yml` (+54 sources). `docs/` is excluded from the build.

## 1. What was built

| Kind | Pages |
|------|-------|
| Trades (three-tier: profile `us/cte/<slug>.html` + roadmap `us/cte/roadmaps/<slug>.html`) (9) | carpenter, machinist, sheet-metal-worker, ironworker, construction-laborer, heavy-equipment-operator, elevator-installer, industrial-maintenance-mechanic, cnc-operator |
| Degree careers + roadmaps (3) | architect, construction-manager (Construction); industrial-engineer (Advanced Manufacturing) |
| Roadmaps for existing pathway pages (3) | civil-engineer → us/careers/civil-engineering/, mechanical-engineer → mechanical-engineering, electrical-engineer → electrical-engineering. Each has an FE → EIT → experience → PE route linking `us/professional-licenses/pe/` (and `#exams`). The v2 pathway pages link their roadmap automatically. |
| License page | `us/professional-licenses/architecture/`: NCARB/NAAB facts, ARE question types and fees, AXP hours, Texas (TBAE), California (CAB), New York (NYSED OP) rows; the architect roadmap shows them via `states_from: architecture` |
| Trades hub | `us/cte/` matrix now 14 trades, title/description updated |

Every trade roadmap has a **Registered Apprenticeship** route (RAPIDS code and minimum term from the U.S. DOL's
approved-occupations spreadsheet) and a **school / on-the-job** route. State matrices list only places whose own board
or statute was opened:

| Trade | State rows |
|---|---|
| Carpenter | California CSLB (C-5, C-6 contractor classes + journey-level FAQ), Washington L&I (contractor registration) |
| Sheet metal worker | Massachusetts Board of Examiners of Sheet Metal Workers (apprentice, J-1, J-2) |
| Construction laborer | New York City DOB (Site Safety Training card) |
| Heavy equipment operator | Massachusetts OPSI (hoisting engineer license); federal OSHA 29 CFR 1926.1427 shown as a certification |
| Elevator installer | California DIR (CCCM), Washington L&I (Category 01), Florida s. 399.01 (certificate of competency) |
| Machinist, CNC operator, ironworker, industrial machinery mechanic | none: BLS names no license; the page says so (`states_source`) |

Template / script changes: `us-cte-career.html` shows `pay_by` (BLS group name) and `numbers_extra` rows (CNC tool
operators' own pay and projection inside the metal and plastic machine workers profile; machinists alone).
`moved_from_roadmaps: true` marks the five trades whose roadmap used to live at `us/roadmaps/<slug>.html`; only those
keep redirect stubs, so the build no longer invents old URLs for new trades (`build-intl-roadmaps.mjs`,
`check-us-data.mjs`). `check-us-data` also checks `numbers_extra`. `check-search`: 5 new cases; 27 new search entries.

Checks: check-us-data, check-search (802 entries, 70 queries), build-us-clusters --check, build-intl-roadmaps --check,
build-nav-mega --check, build-seo-landings --check and verify-site --all (2,324 pages): 0 problems. Screenshots
1366 + 390, light + dark, of 11 pages: no horizontal overflow; right rail on desktop, chip rail on phone.

## 2. Corrections and notes from the sources

- **"Architect (NAAB degree …)"**: a NAAB degree is the usual route but not the only one. NCARB: 17 jurisdictions offer
  pathways for other (or no) degrees; NAAB: the degree is accepted by all 55 jurisdictions and required by 37; New York
  explicitly does not require it (12 units of education + experience). The roadmap has a third route for this.
- **ARE**: still ARE 5.0 with six divisions; NCARB updated 12 of 91 objectives on 27 April 2026 without changing the
  division structure. AXP: 3,740 hours in six areas; since November 2025 experience older than a year earns 75% credit
  (the old five-year rule is gone). Fees: $263 per division, NCARB Record $105 a year.
- **California** also needs the CSE and 8 years of combined education and experience (B&P Code s. 5552).
- **CNC operator**: BLS has no separate profile; CNC tool operators are counted in "Metal and Plastic Machine Workers".
  The page shows the group's Quick Facts (labelled) plus the CNC row from the same profile: $50,690, 170,000 jobs,
  −9% to 2035.
- **Machinist**: the existing home-matrix figures ($59,620, −1%) are for machinists AND tool and die makers; machinists
  alone earn $58,750 (shown as an extra row).
- **Industrial machinery mechanic**: crosswalk rows for the BLS group are Construction 2, AM 1, Energy 1, but the trade
  page uses the industrial machinery mechanics SOC 49-9041 (AM 1, Energy 1, tie), so it sits in Advanced Manufacturing.
- **Construction managers**: crosswalk ties Construction and Management & Entrepreneurship; placed in Construction.
- **"State license matrix for each trade"**: four of the nine trades have no license that BLS names; no rows were invented.
- Not used because the page could not be read: Nevada's OSHA-10 law (NRS 618.983, leg.state.nv.us 403 and Wayback 403),
  the California CCCM application PDF (text not extractable, so no experience years are quoted for California),
  the NYS Department of State (no elevator mechanic license found there).

## 3. BLS OOH profiles used (15), by 2025 employment

| Profile | SOC used | Jobs 2025 | Median pay May 2025 | Outlook 2025–35 | Page |
|---|---|---|---|---|---|
| Construction Laborers and Helpers | 47-2061 | 1,674,400 | $46,680 | 6% | trade |
| Metal and Plastic Machine Workers | 51-9161 | 963,000 | $47,700 | −7% | trade (CNC) |
| Carpenters | 47-2031 | 889,700 | $60,580 | 4% | trade |
| Construction Managers | 11-9021 | 609,100 | $114,990 | 9% | career |
| Industrial Machinery Mechanics… and Millwrights | 49-9041 | 547,300 | $64,100 | 14% | trade |
| Construction Equipment Operators | 47-2073 | 534,100 | $59,600 | 4% | trade |
| Civil Engineers | 17-2051 | 380,600 | $100,840 | 6% | roadmap |
| Industrial Engineers | 17-2112 | 365,100 | $102,440 | 12% | career |
| Machinists and Tool and Die Makers | 51-4041 | 344,900 | $59,620 | −1% | trade |
| Mechanical Engineers | 17-2141 | 298,500 | $104,110 | 11% | roadmap |
| Electrical and Electronics Engineers | 17-2070 | 297,900 | $125,040 | 8% | roadmap |
| Sheet Metal Workers | 47-2211 | 131,100 | $61,800 | 3% | trade |
| Architects | 17-1011 | 124,600 | $99,280 | 4% | career |
| Ironworkers | 47-2221 | 84,800 | $61,910 | 1% | trade |
| Elevator and Escalator Installers and Repairers | 47-4021 | 24,700 | $109,910 | 6% | trade |

## 4. Still open
- More state rows: sheet metal (other licensing states), heavy equipment (other hoisting/crane states), elevator
  (New York City DOB, Texas), carpenter contractor rules in more states; Nevada OSHA-10 once the statute site opens.
- More careers in these clusters: surveyors, drafters, civil/industrial engineering technicians, landscape architects,
  plumbers' and electricians' helpers, painters, roofers, masons; quality control inspectors, assemblers, robotics techs.
- ARE / FE / PE exam pages belong to Phase 10; add `exams:` hrefs then.

## 5. How to add the next batch
Same as Phase 4 §7. For a trade: fetch the BLS profile (`fetch6.cjs`, `parse2.cjs`, `htb.cjs`), read the RAPIDS row in
the DOL spreadsheet (`xlsx.cjs` on the unzipped approved-occupations.xlsx), add sources, the `cte_careers.yml` record, a
`home.yml` trades row with `roadmap:` and the `clusters.yml` placement (`trade:` + `soc:`), then run
`node scripts/build-intl-roadmaps.mjs`, search entries and the checks (VERIFY_DEPS set in the same shell call).
