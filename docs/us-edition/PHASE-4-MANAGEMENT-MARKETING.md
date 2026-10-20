# USA Master Plan — Phase 4: Management & Entrepreneurship, Marketing & Sales (batch 1)

2026-10-20. Hubs: `us/clusters/management-entrepreneurship/`, `us/clusters/marketing-sales/` (now live). Data:
`_data/us/careers/management-entrepreneurship.yml`, `marketing-sales.yml`, `supply-chain-transportation.yml` (new),
`_data/us/clusters.yml` (placement, credentials, `small_business`), `_data/us/sources.yml` (+45 sources).
`docs/` is excluded from the build.

## 1. What was built in batch 1

| Kind | Pages |
|------|-------|
| New career pages + roadmaps, Management & Entrepreneurship (7) | top-executive, project-management-specialist, human-resources-specialist, financial-manager, public-relations-specialist, human-resources-manager, public-relations-manager |
| New career pages + roadmaps, Marketing & Sales (6) | retail-sales-worker, wholesale-sales-representative, market-research-analyst, sales-manager, marketing-manager, advertising-sales-agent |
| New career pages + roadmaps, Supply Chain & Transportation (2, logistics management) | logistician, logistics-manager (transportation, storage and distribution managers) |
| Existing pathway reused | business → roadmap `us/roadmaps/management-analyst.html` (bachelor's route + MBA route) |
| Hubs | M&E: 8 careers by BLS employment, credentials cards (CAPM, PMP, aPHR/PHR, SHRM-CP, CPA, CGFM), new section "Start a small business" (#small-business). Marketing & Sales: hub live, 6 careers; data-science shows under "Also in this cluster". SCT: 2 careers added after the automotive trade. |
| Template / CSS | `us-cluster-hub.html` optional `small_business` block (SBA steps numbered 1–14 across Plan / Launch cards, resource partners, sba.gov buttons); `.usc-steps` in main.css |
| Checks | `check-us-data.mjs`: small_business block (intro, sources, sba.gov hrefs, step titles). `check-search.mjs`: 8 new cases. 33 search entries. nav_us.yml: Marketing & Sales child. |

Totals: 15 career pages, 16 roadmaps, 1 new hub. check-us-data, check-search, build-us-clusters --check,
build-nav-mega --check and verify-site --all (2,253 pages): 0 problems.

### MBA route (GMAT / GRE gate)
Shown only where BLS names an MBA or a master's for the career: top executive, management analyst, HR manager,
market research analyst, marketing manager ("if the program asks for one"). The gate cites GMAC's exam structure
(Quantitative Reasoning, Verbal Reasoning, Data Insights; 2 h 15 min) and an ETS fact row for the GRE. No exam
button: the USA edition has no GMAT/GRE page yet (Phase 10). When those pages exist, add `href` to the gate steps.

### Small business route
SBA's business guide only (sba.gov), no paid courses: Plan (market research, business plan, startup costs, business
credit, funding, or buy a business/franchise) and Launch (location, structure, name, register, EIN + state tax IDs,
licenses and permits, bank account, insurance), plus SBDC, SCORE, Women's Business Centers, VBOCs. The top-executive
roadmap has a short "own business" route linking to the hub section.

### Real estate agent/broker
Already built in Phase 3 batch 2 (Financial Services, where the crosswalk places 41-9020): `us/careers/real-estate-agent/`
and the license page `us/professional-licenses/real-estate/` with four state commissions (TX TREC, CA DRE, NY DOS, FL
FREC). Not duplicated.

## 2. Corrections and notes from the sources

- The brief's "SBA steps for starting a business": SBA's old "10 steps to start your business" page now redirects to
  the redesigned business guide (sba.gov/counseling/#business-guide), which lists 6 Plan + 8 Launch steps. The site
  uses the current guide (note on source `sba_plan`).
- Logistics management is not in Management & Entrepreneurship: the crosswalk places logisticians (13-1081) and
  transportation, storage and distribution managers (11-3071) only in Supply Chain & Transportation, so they sit on
  that hub.
- Public relations specialists (27-3031) are placed by the crosswalk in Management & Entrepreneurship, not Marketing
  & Sales; PR and fundraising managers (11-2030) also land in M&E (2 rows vs 1 in three other clusters).
- Financial managers (left over from Phase 3) are now in M&E (Business Information Management).
- BLS points to CareerOneStop for named certifications in most of these profiles; CareerOneStop answers 403 from
  India. Credentials are named only where the owner's page was opened (PMI, HRCI, SHRM, ASCM, AGA); otherwise the page
  says "Professional associations · Voluntary" with the BLS sentence.
- PRSA's APR page could not be read (praccreditation.org: expired TLS certificate; prsa.org accreditation URL: 404), so
  no PR credential is named.
- BLS (logisticians) names the Defense Department acquisition university as "Warfighting Acquisition University (DAU)";
  that line was left out until it can be checked on dau.edu.
- HRCI's old PHR URL (/certifications/phr) is 404; the current one is /certifications/individual-certifications/phr.

## 3. BLS OOH profiles looked at (25), by 2025 employment

| BLS profile | SOC | Jobs 2025 | Median pay May 2025 | Outlook 2025–35 | Crosswalk | Status |
|---|---|---|---|---|---|---|
| Retail Sales Workers | 41-2022, 41-2031 | 4,271,400 | $35,560 | 0% | M&S 2 | Batch 1 |
| Top Executives | 11-1011, 11-1021 | 3,890,600 | $108,780 | 5% | M&E 4, Energy 1 | Batch 1 |
| Customer Service Representatives | 43-4051 | 2,666,000 | $44,770 | -5% | M&S 1 | Queue |
| Wholesale and Manufacturing Sales Reps | 41-4011, 41-4012 | 1,571,400 | $76,460 | 0% | M&S 2 | Batch 1 |
| Project Management Specialists | 13-1082 | 1,094,300 | $102,320 | 7% | M&E 2 | Batch 1 |
| Management Analysts | 13-1111 | 1,077,100 | $101,860 | 10% | M&E 2, Edu 1, PSS 1 | Batch 1 (pathway roadmap) |
| Market Research Analysts | 13-1161 | 952,700 | $78,760 | 7% | M&S 1 | Batch 1 |
| Human Resources Specialists | 13-1071 | 939,700 | $75,940 | 6% | M&E 2 | Batch 1 |
| Financial Managers | 11-3031 | 879,700 | $166,570 | 10% | M&E 2 | Batch 1 |
| Sales Managers | 11-2022 | 650,100 | $148,270 | 4% | M&S 1 | Batch 1 |
| Training and Development Specialists | 13-1151 | 472,500 | $69,280 | 11% | M&E 1 | Queue |
| Advertising, Promotions, and Marketing Managers | 11-2011, 11-2021 | 454,800 | $165,780 | 6% | M&S 2 | Batch 1 |
| Administrative Services and Facilities Managers | 11-3012, 11-3013 | 444,800 | $110,500 | 5% | M&E 4, Energy 1, PSS 1 | Queue |
| Public Relations Specialists | 27-3031 | 314,500 | $74,750 | 2% | M&E 2 | Batch 1 |
| Logisticians | 13-1081 | 255,100 | $82,320 | 18% | SCT 1 | Batch 1 (SCT hub) |
| Transportation, Storage, and Distribution Managers | 11-3071 | 228,100 | $107,230 | 6% | SCT 2 | Batch 1 (SCT hub) |
| Human Resources Managers | 11-3121 | 224,900 | $149,280 | 6% | M&E 2, PSS 1 | Batch 1 |
| Fundraisers | 13-1131 | 140,900 | $72,550 | 6% | Hospitality 1 | Phase 8 (Hospitality) |
| Public Relations and Fundraising Managers | 11-2030 | 129,600 | $136,470 | 6% | M&E 2 + 3 others | Batch 1 |
| Advertising Sales Agents | 41-3011 | 99,300 | $64,820 | -7% | M&S 1 | Batch 1 |
| Labor Relations Specialists | 13-1075 | 66,300 | $95,420 | 2% | M&E 1 | Queue |
| Sales Engineers | 41-9031 | 51,600 | $124,900 | 3% | M&S 1 | Queue |
| Training and Development Managers | 11-3131 | 50,200 | $133,000 | 6% | M&E 2, PSS 1 | Queue |
| Compensation and Benefits Managers | 11-3111 | 23,700 | $149,230 | 1% | M&E 2 | Queue |
| Secretaries and Administrative Assistants; Purchasing Managers, Buyers and Purchasing Agents | 43-6010; 13-1020 | — | — | — | M&E; M&S/SCT | Fetched but not parsed: queue |

## 4. Queue (next: "continue Phase 4")

Batch 2: customer service representatives (M&S), training and development specialists and managers, administrative
services and facilities managers, labor relations specialists, compensation and benefits managers (M&E), sales
engineers (M&S), secretaries and administrative assistants (M&E), purchasing managers/buyers (M&S vs SCT: check the
crosswalk count). Also: PRSA APR source when the site is readable; DAU line for logisticians; GMAT/GRE `href` on the
gate steps once Phase 10 builds those exam pages.

## 5. How to add the next batch

1. Fetch BLS profiles with headless Edge (scratchpad `tools/fetch6.cjs`), parse with `tools/parse2.cjs`, read How to
   Become with `tools/htb.cjs` (file keys use underscores).
2. Add `ooh_qf_<k>` / `ooh_<k>` sources, the career to `careers/<cluster>.yml`, `{ career: <slug>, sub: … }` to
   `clusters.yml` (the checker enforces sub, `also` and `tie` from the crosswalk).
3. `node scripts/build-us-clusters.mjs`, search entries, then `check-us-data`, `check-search`, `verify-site --all`
   (VERIFY_DEPS set in the same shell call).
