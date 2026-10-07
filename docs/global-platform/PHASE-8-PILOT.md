# Phase 8 — First USA Career Pilot

Date: 2026-10-07. Goal: prove the v2 career template on different pathway shapes before scaling to the
other 15 pathways.

## Pilot set (5 pathways on v2 now)

| Pathway | Shape it tests | Overview, phone screens (v1 → v2) | Salary page |
|---|---|---|---|
| Computer Science (Phase 7) | degree pathway, 5 occupations, no license | 13.3 → 7.3 | yes |
| Medicine (Phase 7) | licensed, graduate, no state OEWS data, specialty pay, M.D./D.O. branch | 13.7 → 8.9 | no (BLS has no state series) |
| **Law** | professional degree + licence route (LSAT → J.D. → MPRE → bar → character & fitness → admission) | ~13.7 → **7.6** | **yes** |
| **Mechanical Engineering** | degree pathway, optional license (FE → PE), ABET, 2 occupations | 13.8 → **7.9** | **yes** |
| **Accounting & CPA** | degree pathway, license for some roles (CPA Exam + state board), 2 occupations | 13.6 → **7.8** | **yes** |

v1 lengths are from the Phase 3 measurements. Salary pages: 3.5–3.7 phone screens.

## What the pilot exposed, and the fixes (architecture fixed before scaling)

1. **Roadmap step kinds were Medicine-specific.** Gates were found only by "MCAT/USMLE/exam", so Law's
   MPRE and the CPA "Exam" step would have looked like ordinary steps, and "Admission to the bar" was not
   recognised as the licence. **Fix:** a keyword list (exam, Exam, MCAT, LSAT, USMLE, COMLEX, MPRE, NCLEX,
   DAT) marks gates. The step that grants the right to practise is the licence: a "license" step, or the
   last step when it is not optional. In short routes a step tagged "Exam" is a gate. Medicine's output is
   byte-identical after the change. Law now renders gate, gate, gate, license in the right places.
2. **Salary page heading read badly for long pathway names** ("Law (Pre-Law to J.D. and the Bar) salary by
   state and city"). **Fix:** the heading uses the occupation: "Lawyers: pay by state and city".
3. **Source chips truncate long publisher names** ("National Conference of Ba…"). The truncation is harmless
   (full name in the pop-over), but a `short` label per source in `sources.yml` would read better.
   → Phase 9 task, together with the scale-up.
4. **Budget:** overviews land at 7.3–7.9 screens; licensed pathways with reality-check numbers and
   comparisons run longer (Medicine 8.9). Proposal: keep 7 as the target and accept up to 9 when the extra
   sections pass the IA rules (R1–R3 are not met for splitting them out).

## Template coverage confirmed

| Requirement from the brief | Where it is handled |
|---|---|
| Normal degree pathway | CS, Mechanical, Accounting (short horizontal roadmap) |
| Professional pathway | Medicine, Law (licence roadmap with exam gates) |
| Licensing pathway | required (Medicine, Law) vs "for some roles" (CPA, PE), each with its own license block |
| Multiple occupations | top 3 + "show more" on the overview; every occupation with OEWS percentiles on the salary page |
| Geographic salary data | salary pages: 53–55 state-level areas, 472–528 metro/nonmetro areas, from one JSON per SOC |
| International student information | one pointer per page to the international guide (education and immigration kept separate); full rebuild is Phase 13 |

## Verification

- Render: 424 pages identical to Phase 7; changed = the 3 pilot overviews + the CS salary heading; new = 3
  salary pages. `verify-site.mjs --all`: only the 4 known warnings. `check-us-data.mjs`: 0 problems.
- Headless Chrome, all 3 pilots: no horizontal overflow at 390 (light) and 1440 (dark). Each salary page
  loads its JSON; picking New York shows Lawyers $207,860 / 91,870 jobs, Mechanical engineers $102,440 /
  8,590, Accountants and auditors $102,640 / 109,830. These equal the values in the generated
  `assets/data/us/oews/<soc>.json`. No console errors.

## Files

`_includes/us-career-v2.html` (step-kind logic), `_includes/us-career-salary.html` (heading),
`_data/us/pathways.yml` (law, mechanical-engineering, accounting: `template: v2`, `salary: true`; law also
`roadmap: license`, `license_required: true`), `_data/us/pathway_pages.yml` (`answer` × 3),
`us/careers/{law,mechanical-engineering,accounting}/index.html` (v2 include),
`us/careers/{law,mechanical-engineering,accounting}/salary/index.html` (new), `_data/search.yml` (3 entries).

## Quality gate

1. **Researched:** how each pathway's licence data and routes are worded; OEWS coverage for the three lead SOCs.
2. **Discovered:** the template's licence logic depended on Medicine's wording (now general); long names
   need short source labels.
3. **Changed / 5. Files:** see above. 4. **Why:** fix the architecture on a small, varied set before Phase 9.
6. **Could affect:** USA pages only. 7. **Tested:** see Verification.
8. **Unresolved:** source short labels (Phase 9); the budget decision in point 4.
9. **Better approach found:** deriving step kinds from the data generally (no per-pathway flags), so 100+
   pathways need no template work.
10. **Next (Phase 9):** move the remaining 15 pathways to v2 in groups (technology, engineering, health,
    business/social), add salary pages where OEWS has state data, add source short labels, retire v1.
