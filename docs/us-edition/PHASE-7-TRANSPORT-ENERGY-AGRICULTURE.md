# USA Master Plan — Phase 7: Supply Chain & Transportation, Energy & Natural Resources, Agriculture

2026-10-21. Hubs: `us/clusters/supply-chain-transportation/` (already live), `us/clusters/energy-natural-resources/` and
`us/clusters/agriculture/` (**new, now live**; both were "Next" shells before). Data: `_data/us/cte_careers.yml` (+7 trades),
`_data/us/home.yml` (trades matrix +7 rows), `_data/us/careers/supply-chain-transportation.yml` (+pilot),
`_data/us/careers/energy-natural-resources.yml` and `agriculture.yml` (new), `_data/us/licenses.yml` (new `veterinary`),
`_data/us/clusters.yml` (placement, two hubs live), `_data/nav_us.yml` (two menu children), `_data/us/sources.yml` (+76).

## 1. What was built

| Kind | Pages |
|------|-------|
| Trades (profile `us/cte/<slug>.html` + roadmap `us/cte/roadmaps/<slug>.html`) (7) | truck-driver, aircraft-mechanic, diesel-technician (Supply Chain & Transportation); lineworker, solar-installer, wind-turbine-technician, power-plant-operator (Energy) |
| Careers + roadmaps (9) | airline-pilot (SCT); environmental-scientist, geoscientist, petroleum-engineer, forester (Energy); farmer-rancher, agricultural-food-scientist, veterinarian, veterinary-technician (Agriculture) |
| License page | `us/professional-licenses/veterinary/`: NAVLE (ICVA), AVMA COE, Texas TBVME, California VMB, New York OP rows; the veterinarian roadmap shows them via `states_from: veterinary` |
| Hubs | Energy & Natural Resources and Agriculture go live (stubs by `build-us-clusters.mjs`, menu children, search entries) |
| Trades hub | `us/cte/` matrix 14 → 21 trades; title updated |

Federal rules were read from the regulation text on eCFR (versioner API, 2026-10-15 edition): FAA 14 CFR 61.103/.109/.123/
.129/.153/.159/.160 and 65.71; FMCSA 49 CFR 380.609, 383.25, 391.11; NRC 10 CFR 55.31. Apprenticeship terms come from the
DOL approved-occupations spreadsheet (time-based minimum hours, RAPIDS code).

| Page | Key facts (source) |
|---|---|
| Truck driver | CLP at 18, 10-year record check, DOT medical card; ELDT with a Training Provider Registry provider for first Class A/B (since 7 Feb 2022); CLP held 14 days; 3-part skills test; 21 for interstate; RAPIDS 0980, 2,000 h (FMCSA, eCFR, DOL) |
| Pilot | private 17 / 40 h; instrument 40 h + 50 h XC PIC; commercial 18 / 250 h; ATP 23 / 1,500 h; R-ATP 21: 750 h military, 1,000 h authorized bachelor's, 1,250 h associate (eCFR, BLS) |
| Aircraft mechanic | Part 147 school 18–24 months (HS diploma/GED), or 18 months (one rating) / 30 months (both) documented experience; 3 knowledge tests (General first) + oral + practical with a DME; age 18, all tests within 24 months; RAPIDS 0005, 5,000 h (FAA, eCFR, DOL) |
| Power plant operator | NRC licence: facility certifies training on Form 398, written exam + operating test + medical; ~3,600 licensed power reactor operators; not transferable between plants (NRC, eCFR, BLS) |
| Solar PV installer | NABCEP PVIP $125 application + $375 exam ($275 re-exam); PV Associate $25 + $125 (NABCEP fees page) |
| Geoscientist | 30 states + Puerto Rico license geologists; ASBOG FG and PG, 4 h each, twice a year (2027: 18–19 Mar, 30 Sep–1 Oct); Texas TBPG: FG needs a 4-year degree with 30 semester hours of geoscience, PG needs 5 years' experience (ASBOG, TBPG) |
| Veterinarian | NAVLE 360 questions, ~7.5 h, 12 blocks of 30 from Oct–Nov 2026, $825 (US/Canada) or $1,220; ECFVG/PAVE route; CA: NAVLE + CSBE + VLE (32 questions, open book, 40 days), $350 + $100 + $500; NY: 21+, $372, limited permit $105; TX: online SBE within 10 days (ICVA, VMB, NYSED, TBVME) |
| Vet tech | VTNE 170 questions (150 scored), 3 h, $375, PSI centre or remote; NY license (18-month program, VTNE, $177); CA RVT $225 + $225 (AAVSB, NYSED, VMB) |
| Farmer | USDA: under 10 years operating = beginning farmer; FSA down payment loan 5% down, FSA 45% up to $300,150; land-grant system = 1862, 1890 (+Tuskegee), 1994 institutions; RAPIDS 0177, 8,000 h (USDA, NIFA, DOL) |

Checks: check-us-data, check-search (837 entries, 76 queries), build-us-clusters --check, build-intl-roadmaps --check,
build-nav-mega --check, build-seo-landings --check, check-in-data and verify-site --all (2,359 pages): 0 problems.
Screenshots 1366 + 390, light + dark, of 12 pages: no horizontal overflow; right rail on desktop, chip rail on phone.

## 2. Corrections and notes from the sources

- **"Agricultural scientist" and "food scientist" as two careers**: BLS has one profile (Agricultural and Food
  Scientists, SOC 19-1010 with animal, food and soil/plant scientists inside). One page with two routes (agricultural
  science; food science) avoids two pages with the same numbers.
- **"Forester" under Agriculture**: the Advance CTE crosswalk puts conservation scientists and foresters mostly in
  Energy & Natural Resources (5 rows vs Agriculture 1), so the page sits on the Energy hub ("Also in" Agriculture).
- **"Solar/wind technician"**: BLS has two separate profiles, so two trade pages. DOL's spreadsheet has no solar PV
  installer apprenticeship code (wind turbine technician: RAPIDS 2000, 4,000 hours), so the solar roadmap's
  apprenticeship route is the BLS one (electrician/roofer apprentices adding PV modules).
- **"Truck driver: FMCSA CDL"**: FMCSA does not issue CDLs; states do. The CLP minimum age is 18; interstate driving needs 21.
- **"Airline pilot hours"**: 1,500 hours is the standard ATP rule, but restricted ATPs at 750/1,000/1,250 hours exist
  (military, authorized bachelor's, authorized associate) and are shown as routes.
- **Vet tech** ties Agriculture and Healthcare & Human Services in the crosswalk (1 row each): placed in Agriculture
  (Animal Systems), `tie: true`.
- **Environmental scientist** is in four clusters in the crosswalk; Energy has the most rows (2).
- License-page lede bug fixed in passing: the template adds a full stop after `education`, so the architecture and
  teaching strings no longer end in one (they showed "..").
- Not used because the page could not be read: ASE (ase.com returns 403 to our browser), FMCSA Training Provider
  Registry (403), California RVT application page (old URL 404), California geologist page (404). No ASE test
  details are quoted; diesel certification is described in BLS's words only.

## 3. BLS OOH profiles used (16), by 2025 employment

| Profile | SOC used | Jobs 2025 | Median pay May 2025 | Outlook 2025–35 | Page |
|---|---|---|---|---|---|
| Heavy and Tractor-trailer Truck Drivers | 53-3032 | 2,221,200 | $58,640 | 4% | trade |
| Farmers, Ranchers, and Other Agricultural Managers | 11-9013 | 788,700 | $89,900 | −3% | career |
| Diesel Service Technicians and Mechanics | 49-3031 | 316,000 | $61,770 | 4% | trade |
| Aircraft and Avionics Equipment Mechanics and Technicians | 49-3011 | 159,800 | $80,180 | 6% | trade |
| Airline and Commercial Pilots | 53-2010 | 154,900 | $210,020 (annual only) | 7% | career |
| Electrical Power-Line Installers and Repairers | 49-9051 | 131,900 | $95,320 | 10% | trade |
| Veterinary Technologists and Technicians | 29-2056 | 131,400 | $47,380 | 9% | career |
| Environmental Scientists and Specialists | 19-2041 | 93,400 | $82,220 | 6% | career |
| Veterinarians | 29-1131 | 91,100 | $130,100 | 9% | career |
| Power Plant Operators, Distributors, and Dispatchers | 51-8013 | 43,700 | $105,080 | −4% | trade |
| Conservation Scientists and Foresters | 19-1030 | 40,900 | $73,920 | 4% | career |
| Agricultural and Food Scientists | 19-1010 | 37,400 | $81,970 | 6% | career |
| Solar Photovoltaic Installers | 47-2231 | 31,100 | $53,140 | 37% | trade |
| Geoscientists | 19-2042 | 25,400 | $101,920 | 5% | career |
| Petroleum Engineers | 17-2171 | 18,500 | $144,910 | 2% | career |
| Wind Turbine Technicians | 49-9081 | 11,800 | $64,120 | 30% | trade |

## 4. Still open
- More careers in these clusters: rail (locomotive engineers, conductors), marine (captains, mates), air traffic
  controllers, flight attendants, automotive body repairers; water/wastewater operators, mining, hydrologists,
  environmental engineers; agricultural workers, agricultural engineers, food processing, fishing, zoologists.
- More state rows: CDL training extras by state, PV installer licences (state boards), forester registration states,
  geologist boards beyond Texas, vet tech credentials in more states (Texas LVT), stationary engineer licences.
- ASE certification facts once ase.com can be read; NAVLE / VTNE / ASBOG / FAA knowledge-test pages belong to Phase 10.

## 5. How to add the next batch
Same as Phase 6 §5. BLS: `fetch6.cjs` (note: its file names keep only the last 90 characters, so long BLS URLs lose the
`bls_gov_ooh` prefix that `parse2.cjs` filters on: rename them first), then `parse2.cjs` and `htb.cjs`. eCFR: use
`https://www.ecfr.gov/api/versioner/v1/full/<date>/title-<n>.xml?part=<p>&section=<s>` with `curl --compressed`
(the renderer API returns 404). NYSED accordions: read the saved HTML with `txt.cjs`.
