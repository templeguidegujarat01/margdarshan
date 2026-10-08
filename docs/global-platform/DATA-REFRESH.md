# Data refresh runbook (USA, UK, Global Mobility Matrix)

How to update the USA Edition's official numbers. Excluded from the build (`docs/`).
Rule: values are copied from official files, never typed in or estimated. Every step ends with a check.

## 1. BLS wages: OEWS (once a year, usually spring)

BLS publishes a new OEWS year in the spring. The May 2025 files on `download.bls.gov` are dated
15 May 2026, so May 2026 data should appear in spring 2027.

1. Check that the new release is out: `https://download.bls.gov/pub/time.series/oe/oe.release` shows the
   new period (for example `2026A01  May 2026`).
2. Rebuild everything in one run (about 5 seconds; the 330 MB file is streamed, not saved):
   ```
   BLS_CONTACT=<your email> node scripts/build-oews.mjs --out assets/data/us/oews --summary _data/us/oews_summary.json
   ```
   The script prints the release name and lists any SOC code without data. Both outputs carry the period.
3. Update `_data/us/sources.yml`:
   - `bls_vintage.wage_ref` and `wage_year` (for example "May 2026", 2026);
   - `list.bls_oews.accessed` (today's date).
4. Run the checker: `VERIFY_DEPS=<dir with js-yaml> node scripts/check-us-data.mjs`.
   It **fails** if the summary period, `_meta.json` and `bls_vintage` disagree, if a SOC lost its data, or if
   a salary page's SOC no longer has state data. Fix every error before publishing.
5. The OOH headline figures in `_data/us/occupations.yml` (median pay, outlook, openings) are separate:
   update them from each `ooh_url` page when the new OOH edition is published (step 2 below), and keep
   `occupation_details.yml` 10th/90th percentiles in step with them. The pay bar shows the 25th–75th band
   only when the OEWS median equals the page's median, so a half-updated year degrades safely (no band)
   instead of mixing two releases.

## 2. BLS projections / OOH (once a year, usually autumn)

Update `bls_vintage.projection_period` and `all_occupations_growth_pct`, then each occupation in
`occupations.yml` from its OOH page (`pay`, `jobs`, `outlook_pct`, `outlook_label`, `change`, `openings`,
`education`, `last_verified`). Run the checker.

## 3. O*NET (each database release)

Re-read the O*NET OnLine summary for each `occupation_details.<id>.onet.code` (tasks, work context, hot
technologies, education shares) and update `last_verified`. Keep the CC BY 4.0 attribution
(`/us/methodology/` and the O*NET source chips).

## 4. IPEDS colleges (once a year, when new HD/C files appear)

When NCES releases new `HD<year>` and `C<year>_A` files (check `https://nces.ed.gov/ipeds/datacenter/data/HD<year>.zip`):
   ```
   node scripts/build-ipeds.mjs --year <year> --from-pathways --out assets/data/us/colleges --summary _data/us/colleges_summary.json --cache <scratch dir>
   ```
   Then update `accessed` for `ipeds_completions` / `ipeds_hd` (and their names, which carry the year) in `sources.yml`
   and run the checker: it fails if a pathway's CIP code has no completions (codes change between CIP editions,
   e.g. osteopathic medicine is 51.1202 in CIP 2020, not the old 51.1901).

## 5. Volatile rules (every quarter)

Immigration (USCIS), exam formats (NCBE, NCEES, NCSBN, AICPA/NASBA), loan limits (ED): re-check each item
in `immigration.yml`, `licenses.yml` (`watch`) and `guides.yml`, then update the source's `accessed` date.

**Licensing compacts** (`compacts.yml`: NLC, IMLC, PT Compact, UBE). Each list has `checked` and
`review_by`; the checker fails once `review_by` has passed (first: 2027-01-05). Re-read each official list
(NLC map PDF, IMLC participating-states map, PT Compact states page, NCBE UBE list), copy it as published,
move states between groups, then set `checked` to today and `review_by` about three months later. The IMLC
map is drawn in the browser; read the state colours with headless Chrome and match them to the map legend.
PSYPACT blocks automated readers, so it stays a link only.

**Immigration** (`immigration.yml`, monthly while court cases are open). The file has `checked` and
`review_by` (first: 2026-11-07); the checker fails once `review_by` has passed. Re-check the USCIS OPT,
STEM OPT and H-1B pages, the USCIS $100,000-payment alert, Study in the States (CPT, cap-gap, the fixed
admission period rule) and new SEVP broadcast messages (ice.gov/sevis), plus the duration-of-status case
(D. Mass., appeal in the First Circuit). Add each development as a dated `changes` entry with its source,
then move `checked` and `review_by` forward.

## 6. Before pushing

```
VERIFY_DEPS=<dir> node scripts/check-us-data.mjs
VERIFY_DEPS=<dir> node scripts/verify-site.mjs --all
```
Then open one salary page and one career page in a browser and pick a state.

---

# UK Edition and Global Mobility Matrix

## 7. ONS ASHE pay (once a year, provisional tables come out in late October / November)
1. Download the two zips from ONS: table 14 (occupation, 4-digit SOC) and table 15 (work region by
   occupation). Links are in the header of `scripts/build-ashe.mjs`. Send a User-Agent with a contact address.
2. `node scripts/build-ashe.mjs --t14 <ashetable14YYYYprovisional.zip> --t15 <ashetable15YYYYprovisional.zip>`
   → rewrites `_data/uk/ashe.json` for every `soc:` in `_data/uk/careers/*.yml`. No Python or unzip needed.
3. In `_data/uk/sources.yml` set `ashe.year`, `ashe.label` (say "provisional" while it is) and the two
   `ons_ashe*` accessed dates. The checker fails if the year or label disagree with ashe.json.
4. Pages read pay straight from ashe.json: nothing to retype. Regions without an ONS CV are hidden;
   CV 10–20% shows "Rough estimate".

## 8. UK rules and pass rates (twice a year)
- SQE1 results (SRA news, about two months after each January / July sitting): update the two `badges`
  in `_data/uk/careers/law.yml` and the `sra_sqe1_*` sources.
- National Careers Service salary ranges (`ncs:`), ICAEW / ACCA / BSB / SRA rules: re-read the linked page,
  change the fact if needed, move `accessed` / `checked` forward.

## 9. Global Mobility Matrix (`_data/mobility.yml`, every 6 months)
`scripts/check-uk-data.mjs` fails after `review_by`. Re-read every source in the file (ICAEW ICAI route,
ACCA exemptions, NASBA MRA list, SRA qualified lawyers, BSB transfer rules, 22 NYCRR 520.6), fix any
changed point, then move `checked` and `review_by` forward. Add a route only with an official source;
a page shows no strip when it has no routes.

## 10. Before pushing (all editions)
```
VERIFY_DEPS=<dir> node scripts/check-in-data.mjs
VERIFY_DEPS=<dir> node scripts/check-us-data.mjs
VERIFY_DEPS=<dir> node scripts/check-uk-data.mjs
VERIFY_DEPS=<dir> node scripts/verify-site.mjs --all
```
