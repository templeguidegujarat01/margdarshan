# Phase 14 — Comparisons

Date: 2026-10-08. The four pairs approved in Phase 3 (§5, rule R9) are live at `/us/compare/<id>/`, with a
small index at `/us/compare/`:

| Page | Rows that differ (of 10) | Phone screens |
| --- | --- | --- |
| `computer-science-vs-software-engineering` | 5 | ~4 |
| `mechanical-vs-electrical-engineering` | 8 | 4.1 |
| `accounting-vs-finance` | 9 | 4.0 |
| `data-science-vs-computer-science` | 9 | 4.1 |
| `/us/compare/` (index) | — | 1.5 |

M.D. vs D.O. stays inside Medicine (Phase 7) and SAT vs ACT inside Tests; the index links to both.

## How it works

- `_data/us/compare.yml` holds only the pair, the question (H1) and a takeaway that restates the table in words
  (no new facts or numbers; "four-year" was removed from ME vs EE because the data says "bachelor's").
- `_includes/us-compare-page.html` builds all 10 rows from existing data: one-line answer and study
  (`pathway_pages.yml`), college program and CIP code (`pathways.yml`), colleges and bachelor's degrees awarded
  (`colleges_summary.json`, IPEDS 2023-24), main BLS job, median pay, jobs and growth (`occupations.yml`), other
  jobs, license (`licenses.yml`, required vs some roles) and program accreditor (`accreditors.yml`).
  Identical cells merge into one "Both: …" cell; when both sides have the same BLS job (CS vs SE), the header
  shows one shared pay/jobs stat instead of the same number twice. The existing `.md-cmp` table is reused
  (on phones each row becomes two labelled cells).
- Links: "Explore each one" (overview, salary by state, colleges, license route); career overview pages get a
  "Compare:" line in Related pathways (only pathways that are in a pair); sidebar "Compare careers"; 5 search
  entries.

## Checks

`check-us-data.mjs` (R9): both sides must be live v2 pathways with colleges data, no duplicate pairs, question,
takeaway and `last_reviewed`, a page stub, no `|` or `~` in compared copy (the template splits rows on them),
and at least 5 of the 10 rows must differ — computed from the same fields the page uses. The rendered page
writes its own count (`data-diff-rows`), and it matched the checker for all four pairs.

## Verification

- Checker 0 problems; negative test (CS vs CS) → "only 0 of 10 rows differ"; file restored byte-identical.
- `verify-site.mjs --all`: only the 4 known warnings. Render: 486 pages, 0 errors, no Liquid left.
- All 20 career overview pages are identical to the Phase 13 render apart from the new Compare line.
- Headless Chrome: rows and merged cells as expected; no horizontal overflow at 390 px (light and dark);
  every internal link on the compare pages resolves to a rendered page.

## Quality gate

1. **Researched:** no new research; every value comes from data already sourced and dated in earlier phases.
2. **Discovered:** CS vs SE has exactly 5 differing rows (same BLS job) — at the R9 minimum; the page says
   plainly that pay and jobs are the same.
3. **Changed / 5. Files:** `_data/us/compare.yml`, `_includes/us-compare-page.html`, `us/compare/` (index + 4),
   `_includes/us-career-v2.html` (Compare line), `_data/nav_us.yml`, `_data/search.yml`, `check-us-data.mjs`.
4. **Why:** students decide between neighbouring fields; one honest table answers it faster than two pages.
6. **Could affect:** USA career overviews (one added line). 7. **Tested:** see Verification.
8. **Unresolved:** pages are ~4 phone screens (budget ≤ 4); the sidebar does not highlight "Compare careers"
   on the individual pair pages (it matches exact URLs only, as elsewhere).
9. **Better than the brief:** R9 is enforced by the checker, not just written down.
10. **Next (Phase 15):** India rollout of proven shared components.
