# Phase 13 — International students rebuild (USCIS, dated)

Date: 2026-10-08 (research on 2026-10-07). As planned in Phase 3, the international-student hub moves to the
md design system, and work rules get their own page:

- `/us/international-students/` — hub (7.2 phone screens; budget ≤ 8): admission to arrival as a roadmap,
  English tests and credential evaluation, a short list of work options, "Rules changing now" (latest dated
  change per topic), Open Doors numbers, FAQ. Old anchors kept: `#steps`, `#credentials`, `#work`,
  `#h1b-changes`, `#numbers`, `#faq`.
- `/us/international-students/work-authorization/` — new (6.6 screens): on-campus jobs → CPT → OPT →
  STEM OPT → cap-gap → H-1B in order, each with its limits, deadlines and a source chip; "What changed in
  2026" with every dated change, newest first; 3 FAQ. Shared sub-nav: Admission to arrival · Work, OPT and H-1B.

## Research (re-checked 2026-10-07)

| Topic | Finding | Source |
| --- | --- | --- |
| OPT | Unchanged: up to 12 months per degree level; I-765 window 90 days before to 60 days after completion, within 30 days of the DSO recommendation. Page updated 25 Nov 2024. | USCIS |
| STEM OPT | Unchanged: 24 months; E-Verify employer; Form I-983. **Added:** unemployment limit 90 days, plus 60 with the extension (150). | USCIS (updated 30 Jan 2026) |
| CPT | **New item.** DSO authorizes; one full academic year first (graduate exception); 12+ months full-time CPT ends OPT eligibility. **New guidance:** SEVP BCM 2608-01 (12 Aug 2026): CPT only if the degree could not be completed without it and it is required of all students in that degree. A second message (2608-02, 24 Aug) added Q&A; not quoted here. | Study in the States (24 Aug 2026), ICE PDF |
| Cap-gap | **New item.** F-1 status and OPT extended typically to April 1 (moved from Oct. 1 from the FY 2026 cap). | Study in the States |
| Duration of status | **New item.** DHS final rule published 17 Jul 2026 (fixed admission ≤ 4 years + 30/30 days), effective 15 Sep 2026; **blocked nationwide on 14 Sep 2026** (D. Mass.); government appealed 30 Sep. Study in the States (updated 10 Sep) does not mention the court order, so the court dates come from NAFSA's case page, labelled "NAFSA (plaintiff)". | DHS, NAFSA |
| H-1B | Unchanged since Phase 1: $100,000 payment guidance vacated (8 Jun 2026), stay denied by the First Circuit (24 Jul 2026); weighted selection rule. USCIS H-1B page updated 21 Sep 2026. | USCIS, Federal Register |

Not added, on purpose: the I-765 fee (USCIS published a new fee schedule edition dated 1 Oct 2026 and the
amount could not be read reliably), travel restrictions by nationality (State Department pages block automated
readers), and the 9-11 biometric fee for employers (not student-facing).

## Files

- Data: `_data/us/immigration.yml` (`checked`, `review_by`, `stage`; new `on_campus`, `cpt`, `cap_gap`,
  `ds_rule`; STEM OPT unemployment fact), 5 new sources in `sources.yml`, 1 search entry, sidebar links.
- Templates: `us/international-students/index.html` (rewritten), `us/international-students/work-authorization/index.html`
  (new), includes `us-src-chip.html` (one source chip for any source id), `us-intl-subnav.html`,
  `us-intl-changes.html` (dated changes by topic, newest first).
- CSS: `.md-work*`, `.md-changes*`, `.md-src-pop p`.
- Checker: immigration `review_by` must not have passed; timeline items need a `stage`; the new page must exist;
  all eight items need a source and `as_of`. `DATA-REFRESH.md`: monthly immigration step.

## Verification

- `check-us-data.mjs`: 0 problems (92 sources). Negative test (review_by 2026-10-01 + a bad stage) → exactly
  those 2 problems; file restored byte-identical. `verify-site.mjs --all`: only the 4 known warnings. Render:
  481 pages, 0 errors, no Liquid left. Include parameters use plain variables only (`id=c.source`, `id=s`).
- Headless Chrome: work page lists the six options in order with anchors (`#stem-opt` lands below the header);
  changes newest first per topic; source popover fits at 390 px (12–378 px); no horizontal overflow (390 px,
  dark and light); sub-nav and sidebar mark the current page; all old hub anchors exist; the USA home's H-1B block
  still renders from the same data.

## Quality gate

1. **Researched:** USCIS (OPT, STEM OPT, H-1B, $100,000 alert), Study in the States (CPT, cap-gap, D/S quick
   facts and announcement), SEVP broadcast PDF, NAFSA case timeline, court coverage cross-checked.
2. **Discovered:** two 2026 developments the old page lacked — the D/S rule and its injunction, and the CPT
   guidance. DHS's own page lags the court order.
3. **Changed / 5. Files:** see above. 4. **Why:** separate the stable route (admission to arrival) from the
   volatile one (work), and date every change.
6. **Could affect:** USA pages only (`us/index.html` reads `immigration.h1b`, unchanged).
7. **Tested:** see Verification.
8. **Unresolved:** the D/S appeal and the CPT guidance (news reports of university legal action; not verified from a court source) can change within
   weeks; the checker forces a review by 2026-11-07. Open Doors 2026 is due in November.
9. **Better than the brief:** a review date on the whole immigration file, enforced by the checker.
10. **Next (Phase 14):** comparisons.
