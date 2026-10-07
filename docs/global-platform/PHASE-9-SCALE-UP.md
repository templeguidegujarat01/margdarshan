# Phase 9 — USA Career Scale-up

Date: 2026-10-07. All 20 USA career pathways now use the v2 template. Done in four controlled groups,
each researched, implemented, verified and committed separately:

| Commit | Group | Pathways |
|---|---|---|
| `85b6397` | Technology | Software Engineering, AI & Machine Learning, Data Science, Cybersecurity |
| `ebe0552` | Engineering | Computer, Civil, Electrical, Aerospace Engineering |
| `0f276dc` | Health | Dentistry, Pharmacy, Nursing, Physical Therapy |
| (this commit) | Business & social | Finance, Business & Management, Psychology + checker rules + this report |

## Result

- **Career overviews (phone, 390×844):** 20 pages, 6.8–8.9 screens, median 7.4 (v1: about 13–14).
  data-science 6.8 · cybersecurity 6.9 · finance 6.9 · physical-therapy 7.0 · AI 7.1 · pharmacy 7.1 ·
  dentistry 7.2 · business 7.3 · computer-science 7.3 · software-engineering 7.3 · civil 7.4 · nursing 7.4 ·
  law 7.6 · psychology 7.6 · aerospace 7.7 · accounting 7.8 · electrical 7.8 · computer-engineering 7.9 ·
  mechanical 7.9 · medicine 8.9.
- **Salary depth pages:** 17 (all at most 4 screens). No page for Medicine and Dentistry (BLS publishes no
  state data for all physicians or all dentists). Software Engineering links to the Computer Science
  salary page (see below).
- **Licence roadmaps** (exam gates + licence step) for Medicine, Law, Dentistry, Pharmacy, Nursing and
  Physical Therapy. Step kinds checked for each: DAT/INBDE, NAPLEX/MPJE, NCLEX-RN and NPTE are gates;
  state licences are licence steps; specialty residency and advanced-practice study are optional.
- Render diff vs Phase 8: 413 pages identical, **0 non-USA pages changed**, 18 USA pages changed, 14 new.
  `verify-site.mjs --all`: only the 4 known warnings. No horizontal overflow on any page. No console errors.

## Decisions made while scaling (things the pilot did not show)

1. **No duplicate salary pages.** Software Engineering and Computer Science share the lead occupation
   (software developers, SOC 15-1252), so a second salary page would repeat the same explorer, heading and
   state table: near-duplicate content. Software Engineering uses `salary_from: computer-science`. Its
   sub-nav and salary links point to the CS salary page. `/us/careers/software-engineering/salary/`
   forwards there (`redirect_to`, not in the sitemap).
2. **Group occupations show only data that matches their label.** Where the lead occupation is a BLS group
   of several SOC codes, the salary page uses one published SOC and names it:
   Electrical → 17-2071 "Electrical engineers"; Finance → 13-2051 "Financial and investment analysts";
   Psychology → 19-3033 "Clinical and counseling psychologists" (`salary_soc` + `salary_title`). On the
   overview, the pay heading uses `occupation_details.pay_title` when the range belongs to one SOC. The
   25th–75th band appears only when the OEWS median equals the page's median (Electrical and Finance yes;
   Psychology no, because its range is the OOH all-psychologists figure).
3. **Short source labels.** Every entry in `sources.yml` now has a `short` label ("NCBE", "NCSBN", "U.S. Dept.
   of Education"), used on chips. This fixes the truncated publisher names seen in the pilot.

## Guard rails added to `scripts/check-us-data.mjs`

For every `template: v2` pathway: the page includes `us-career-v2.html`; the copy has an `answer`; `salary:
true` needs an OEWS summary with state data for the SOC used, plus the salary page file; `salary_soc` must be
one of the lead occupation's SOC codes and needs a `salary_title`; `salary_from` must point to a pathway with a
salary page and the same lead; `roadmap: license` needs licence steps. Every source needs a `short` label.
A negative test (a wrong `salary_soc`) produced both expected errors.

## Not removed

`_includes/us-career-page.html` (v1) is no longer included by any page. It is marked "NO LONGER USED" and
kept until the owner approves deleting it (project rule: no deletions without asking).

## Quality gate

1. **Researched:** each pathway's lead SOC coverage in OEWS (states, metros), group vs single SOCs, licence
   step wording, shared lead occupations.
2. **Discovered:** one duplicate-content trap (SE/CS) and three group-SOC label mismatches. All fixed by data
   rules rather than per-page exceptions.
3. **Changed:** 15 pathways moved to v2, 13 new salary pages, 1 forwarding stub, sources short labels, template
   support for `salary_from` / `salary_soc` / `pay_title`, checker rules.
4. **Why:** consistent, shorter, data-backed pages across the whole USA edition.
5. **Files:** `_data/us/{pathways,pathway_pages,sources}.yml`, `_data/search.yml`, `_includes/us-career-v2.html`,
   `_includes/us-career-salary.html`, `_includes/us-career-page.html` (comment), `us/careers/*/index.html`,
   `us/careers/*/salary/index.html`, `scripts/check-us-data.mjs`, this document.
6. **Could affect:** USA pages only. 7. **Tested:** render diff, verifier, data checker (plus a negative test),
   phone and desktop dark checks, and salary pickers for every group.
8. **Unresolved:** deleting the v1 template (owner); the length budget (7 target, up to 9 allowed) still
   awaits a yes.
9. **Better than planned:** the scale-up needed no template forks; everything is data rules.
10. **Next (Phase 10):** U.S. geographic data. The state/metro explorer exists; Phase 10 can add a
    metro-level "top-paying areas" view, a state comparison and a refresh routine for the yearly BLS release.
