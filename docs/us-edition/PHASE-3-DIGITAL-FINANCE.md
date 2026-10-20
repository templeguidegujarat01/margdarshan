# USA Master Plan — Phase 3: Digital Technology & Financial Services (batches 1–2)

2026-10-20. Hubs: `us/clusters/digital-technology/`, `us/clusters/financial-services/`. Data:
`_data/us/careers/digital-technology.yml`, `_data/us/careers/financial-services.yml`, `_data/us/clusters.yml`
(placement + new `credentials:` tables), `_data/us/sources.yml` (+45 sources). `docs/` is excluded from the build.

## 1. What was built in batch 1

| Kind | Pages |
|------|-------|
| New career pages (`us/careers/<slug>/`) | computer-support-specialist, computer-systems-analyst, network-administrator, web-developer, insurance-sales-agent, personal-financial-advisor, actuary (7) |
| Roadmaps (`us/roadmaps/<slug>.html`) | the 7 above + 9 on existing pathway pages (16) |
| Existing pathway pages reused (no duplicate page; the v2 page now links its roadmap) | computer-science → computer-science, software-engineering → software-developer, artificial-intelligence → computer-research-scientist, data-science → data-scientist, cybersecurity → information-security-analyst, computer-engineering → computer-hardware-engineer, accounting → accountant, finance → financial-analyst, investment-banking → investment-banker |
| Hubs | matrix + cards ordered by BLS 2025 employment; new section "Certifications and licenses" (`credentials:` in clusters.yml, one card per credential with its kind and source) |
| Templates | `us-cluster-hub.html` (credentials cards), `intl-roadmap.html` (cert `kind` shown; heading "Licenses, registrations and certifications" when kinds are set), `main.css` (link style in cards) |
| Checks | `check-us-data.mjs`: credential rows (fields, allowed kind, href is a page, source), cert kinds, route ids may not reuse a roadmap section id (`certs` clashed, caught by verify-site). `check-search.mjs`: 7 new cases. 24 search entries. |

Batch rule: every pathway named in the brief gets its roadmap, plus the largest BLS occupations the crosswalk places
in these clusters that had no page (computer support, systems analysts, network administrators, web developers,
insurance agents, personal financial advisors) and the actuary, which the brief named.

### Licenses vs voluntary (what each page marks)

| Credential | Owner | Kind |
|---|---|---|
| CPA | State boards of accountancy (AICPA exam) | State license — required only to file reports with the SEC (BLS) |
| Insurance license | State licensing authorities | State license — required; life/health and P&C separate |
| SIE | FINRA | Exam, no firm needed (18+, valid 4 years); does not register you alone |
| Series 7, Series 79 | FINRA | Registration through a sponsoring member firm |
| Series 63, 65, 66 | NASAA (given by FINRA) | Exam for a state license ("normally a prerequisite") |
| CFA charter | CFA Institute | Voluntary |
| CFP | CFP Board | Voluntary |
| ASA/FSA, ACAS/FCAS | SOA, CAS | Professional credential |
| Enrolled actuary | Joint Board for the Enrollment of Actuaries | Federal license (pension actuaries) |
| CompTIA A+, Network+, Security+ | CompTIA | Voluntary |
| ISC2 CC, CISSP | ISC2 | Voluntary |
| Product certifications | Vendors | Employer may require |
| PE | State boards (NCEES exams) | State license — rarely required for hardware |

## 2. Corrections and notes from the sources

- BLS (accountants) says all states require 150 semester hours for the CPA. NASBA's 2025 page shows the
  120-hour + 2-years route where a state's law adopts it; the roadmap uses NASBA for credit hours and shows both routes.
- BLS (actuaries) still describes five fellowship tracks. The SOA replaced the tracks with a flexible course pathway in
  fall 2025 (four technical courses incl. a 101–201 sequence, DMAC, FAC); the site uses the SOA page.
- BLS (web developers) mentions Flash as a publishing tool; that line was not used.
- BLS calls FINRA the "licensing organization"; FINRA itself calls these registrations that need a sponsoring firm, so
  the site says "registration through an employer". Series 63/65/66 are NASAA exams that FINRA administers.
- Financial managers (11-3031) sit in Management & Entrepreneurship in the crosswalk, not Financial Services, so they
  are left for Phase 4. Compliance officers, budget analysts and tax examiners are also placed elsewhere.
- Web developers tie Arts, Entertainment, & Design (2 rows each): placed in Digital Technology with `tie: true`.
  Computer support specialists also appear on the Healthcare hub ("Also in this cluster", via 15-1232).
- Fetch: finra.org answers headless and headed browsers with a Cloudflare check, and nasaa.org blocks India (Sucuri
  GEO02). Both were read from Internet Archive captures (dates in each source's `note`); the source url stays the
  owner's page. CAS credential page is an interactive tool: requirements were read from its HTML list.

## 3. Every BLS OOH profile looked at (37), by 2025 employment

| # | BLS OOH profile | SOC | Jobs 2025 | Median pay May 2025 | Entry education | Outlook 2025–35 | Crosswalk rows | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | [Software Developers, Quality Assurance Analysts, and Testers](https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm) | 15-1252, 15-1253 | 1,905,400 | $134,040 | Bachelor's degree | 10% (Much faster than average) | Arts, Entertainment, & Design 1, Digital Technology 4 | Batch 1 (roadmaps software-developer + computer-science) |
| 2 | [Accountants and Auditors](https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm) | 13-2011 | 1,595,200 | $83,680 | Bachelor's degree | 5% (Faster than average) | Financial Services 1 | Batch 1 (roadmap accountant) |
| 3 | [Bookkeeping, Accounting, and Auditing Clerks](https://www.bls.gov/ooh/office-and-administrative-support/bookkeeping-accounting-and-auditing-clerks.htm) | 43-3031 | 1,532,400 | $50,670 | Some college, no degree | -6% (Decline) | Financial Services 1 | Batch 2 (bookkeeping-clerk) |
| 4 | [Financial Clerks](https://www.bls.gov/ooh/office-and-administrative-support/financial-clerks.htm) | 43-3021, 43-3041, 43-3051, 43-3061, 43-4011, 43-4041, 43-4131, 43-4141, 43-9041 | 1,144,900 | $49,990 | High school diploma or equivalent | -4% (Decline) | Financial Services 6, Hospitality, Events, & Tourism 1, Management & Entrepreneurship 2, Supply Chain & Transportation 1 | Queue |
| 5 | [Computer Support Specialists](https://www.bls.gov/ooh/computer-and-information-technology/computer-support-specialists.htm) | 15-1230, 15-1231, 15-1232 | 903,100 | $62,890 | See How to Become One | -3% (Decline) | Digital Technology 3, Healthcare & Human Services 1 | Batch 1 |
| 6 | [Financial Managers](https://www.bls.gov/ooh/management/financial-managers.htm) | 11-3031 | 879,700 | $166,570 | Bachelor's degree | 10% (Much faster than average) | Management & Entrepreneurship 2 | Management & Entrepreneurship (not in FS) |
| 7 | [Computer and Information Systems Managers](https://www.bls.gov/ooh/management/computer-and-information-systems-managers.htm) | 11-3021 | 685,800 | $175,140 | Bachelor's degree | 16% (Much faster than average) | Digital Technology 4 | Queue |
| 8 | [Insurance Sales Agents](https://www.bls.gov/ooh/sales/insurance-sales-agents.htm) | 41-3021 | 572,600 | $62,280 | High school diploma or equivalent | 3% (As fast as average) | Financial Services 1 | Batch 1 |
| 9 | [Computer Systems Analysts](https://www.bls.gov/ooh/computer-and-information-technology/computer-systems-analysts.htm) | 15-1211 | 544,400 | $105,850 | Bachelor's degree | 8% (Much faster than average) | Digital Technology 2 | Batch 1 |
| 10 | [Securities, Commodities, and Financial Services Sales Agents](https://www.bls.gov/ooh/sales/securities-commodities-and-financial-services-sales-agents.htm) | 41-3031 | 531,000 | $78,660 | Bachelor's degree | 1% (Slower than average) | Financial Services 1 | Batch 1 (roadmap investment-banker) |
| 11 | [Real Estate Brokers and Sales Agents](https://www.bls.gov/ooh/sales/real-estate-brokers-and-sales-agents.htm) | 41-9020, 41-9021, 41-9022 | 530,600 | $57,400 | High school diploma or equivalent | 2% (Slower than average) | Financial Services 2 | Batch 2 (real-estate-agent + real-estate license) |
| 12 | [Property, Real Estate, and Community Association Managers](https://www.bls.gov/ooh/management/property-real-estate-and-community-association-managers.htm) | 11-9141 | 460,400 | $69,990 | High school diploma or equivalent | 4% (As fast as average) | Financial Services 1 | Batch 2 (property-manager) |
| 13 | [Financial Analysts](https://www.bls.gov/ooh/business-and-financial/financial-analysts.htm) | 13-2051, 13-2054 | 443,100 | $103,570 | Bachelor's degree | 7% (Much faster than average) | Financial Services 3 | Batch 1 (roadmap financial-analyst) |
| 14 | [Compliance Officers](https://www.bls.gov/ooh/business-and-financial/compliance-officers.htm) | 13-1041 | 436,400 | $80,730 | Bachelor's degree | 4% (As fast as average) | Energy & Natural Resources 2, Financial Services 1, Management & Entrepreneurship 1, Public Service & Safety 2 | Energy / Public Service (2 rows each; not FS) |
| 15 | [Claims Adjusters, Appraisers, Examiners, and Investigators](https://www.bls.gov/ooh/business-and-financial/claims-adjusters-appraisers-examiners-and-investigators.htm) | 13-1030, 13-1031, 13-1032 | 389,700 | $78,020 | See How to Become One | -6% (Decline) | Financial Services 2 | Batch 2 (claims-adjuster) |
| 16 | [Tellers](https://www.bls.gov/ooh/office-and-administrative-support/tellers.htm) | 43-3071 | 339,200 | $43,030 | High school diploma or equivalent | -13% (Decline) | Financial Services 1 | Batch 2 (bank-teller) |
| 17 | [Network and Computer Systems Administrators](https://www.bls.gov/ooh/computer-and-information-technology/network-and-computer-systems-administrators.htm) | 15-1244 | 323,600 | $99,130 | Bachelor's degree | -4% (Decline) | Digital Technology 1 | Batch 1 |
| 18 | [Personal Financial Advisors](https://www.bls.gov/ooh/business-and-financial/personal-financial-advisors.htm) | 13-2052 | 299,400 | $105,070 | Bachelor's degree | 1% (Slower than average) | Financial Services 2 | Batch 1 |
| 19 | [Loan Officers](https://www.bls.gov/ooh/business-and-financial/loan-officers.htm) | 13-2072 | 283,000 | $76,690 | Bachelor's degree | 1% (Slower than average) | Financial Services 1 | Batch 2 (loan-officer + MLO license) |
| 20 | [Data Scientists](https://www.bls.gov/ooh/math/data-scientists.htm) | 15-2051 | 275,600 | $120,230 | Bachelor's degree | 35% (Much faster than average) | Digital Technology 1, Financial Services 1, Marketing & Sales 1 | Batch 1 (roadmap data-scientist) |
| 21 | [Web Developers and Digital Designers](https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm) | 15-1254, 15-1255 | 220,100 | $99,520 | Bachelor's degree | 5% (Faster than average) | Arts, Entertainment, & Design 2, Digital Technology 2 | Batch 1 (tie with Arts, Entertainment, & Design) |
| 22 | [Information Security Analysts](https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm) | 15-1212 | 192,900 | $129,180 | Bachelor's degree | 21% (Much faster than average) | Digital Technology 1 | Batch 1 (roadmap information-security-analyst) |
| 23 | [Computer Network Architects](https://www.bls.gov/ooh/computer-and-information-technology/computer-network-architects.htm) | 15-1241 | 181,800 | $134,050 | Bachelor's degree | 8% (Much faster than average) | Digital Technology 2 | Queue |
| 24 | [Bill and Account Collectors](https://www.bls.gov/ooh/office-and-administrative-support/bill-and-account-collectors.htm) | 43-3011 | 160,200 | $47,030 | High school diploma or equivalent | -10% (Decline) | Financial Services 1 | Batch 2 (bill-collector) |
| 25 | [Database Administrators and Architects](https://www.bls.gov/ooh/computer-and-information-technology/database-administrators.htm) | 15-1242, 15-1243 | 144,500 | $126,760 | Bachelor's degree | 4% (As fast as average) | Digital Technology 3 | Queue |
| 26 | [Insurance Underwriters](https://www.bls.gov/ooh/business-and-financial/insurance-underwriters.htm) | 13-2053 | 125,600 | $81,370 | Bachelor's degree | -4% (Decline) | Financial Services 1 | Batch 2 (insurance-underwriter) |
| 27 | [Compensation, Benefits, and Job Analysis Specialists](https://www.bls.gov/ooh/business-and-financial/compensation-benefits-and-job-analysis-specialists.htm) | 13-1141 | 118,100 | $78,210 | Bachelor's degree | 6% (Faster than average) | Financial Services 1 | Batch 2 (compensation-benefits-specialist) |
| 28 | [Computer Programmers](https://www.bls.gov/ooh/computer-and-information-technology/computer-programmers.htm) | 15-1251 | 110,800 | $100,390 | Bachelor's degree | -7% (Decline) | Digital Technology 3 | Queue |
| 29 | [Computer Hardware Engineers](https://www.bls.gov/ooh/architecture-and-engineering/computer-hardware-engineers.htm) | 17-2061 | 76,100 | $161,740 | Bachelor's degree | 9% (Much faster than average) | Digital Technology 1 | Batch 1 (roadmap computer-hardware-engineer) |
| 30 | [Financial Examiners](https://www.bls.gov/ooh/business-and-financial/financial-examiners.htm) | 13-2061 | 70,000 | $94,160 | Bachelor's degree | 9% (Much faster than average) | Financial Services 1 | Batch 2 (financial-examiner) |
| 31 | [Property Appraisers and Assessors](https://www.bls.gov/ooh/business-and-financial/appraisers-and-assessors-of-real-estate.htm) | 13-2020 | 68,400 | $67,960 | Bachelor's degree | 3% (As fast as average) | Financial Services 1 | Batch 2 (real-estate-appraiser + appraiser license) |
| 32 | [Tax Examiners and Collectors, and Revenue Agents](https://www.bls.gov/ooh/business-and-financial/tax-examiners-and-collectors-and-revenue-agents.htm) | 13-2081 | 60,100 | $62,370 | Bachelor's degree | -1% (Decline) | Public Service & Safety 1 | Public Service & Safety |
| 33 | [Budget Analysts](https://www.bls.gov/ooh/business-and-financial/budget-analysts.htm) | 13-2031 | 50,400 | $91,640 | Bachelor's degree | 2% (Slower than average) | Public Service & Safety 1 | Public Service & Safety |
| 34 | [Computer and Information Research Scientists](https://www.bls.gov/ooh/computer-and-information-technology/computer-and-information-research-scientists.htm) | 15-1221 | 38,600 | $140,300 | Master's degree | 22% (Much faster than average) | Digital Technology 2 | Batch 1 (roadmap computer-research-scientist) |
| 35 | [Mathematicians and Statisticians](https://www.bls.gov/ooh/math/mathematicians-and-statisticians.htm) | 15-2021, 15-2041 | 33,500 | $105,720 | Master's degree | 10% (Much faster than average) | Advanced Manufacturing 2, Digital Technology 3, Energy & Natural Resources 1, Financial Services 3, Healthcare & Human Services 3, Management & Entrepreneurship 2, Marketing & Sales 2, Public Service & Safety 2, Education 1 | Spread over 10 clusters; DT/FS/HHS 3 each (decide in Phase 14) |
| 36 | [Credit Counselors](https://www.bls.gov/ooh/business-and-financial/credit-counselors.htm) | 13-2071 | 31,200 | $52,230 | Bachelor's degree | 3% (As fast as average) | Financial Services 1 | Batch 2 (credit-counselor) |
| 37 | [Actuaries](https://www.bls.gov/ooh/math/actuaries.htm) | 15-2011 | 31,200 | $130,000 | Bachelor's degree | 9% (Much faster than average) | Financial Services 1 | Batch 1 |

## 1b. Batch 2 (2026-10-20): Financial Services

| Kind | Pages |
|------|-------|
| New career pages + roadmaps (12) | bookkeeping-clerk, real-estate-agent, property-manager, claims-adjuster, bank-teller, loan-officer, bill-collector, insurance-underwriter, compensation-benefits-specialist, financial-examiner, real-estate-appraiser, credit-counselor |
| New license pages (4, `page:` blocks in licenses.yml) | real-estate (TX, CA, NY, FL), insurance-producer (TX, CA, NY), mortgage-loan-originator (TX, CA, NY, FL via NMLS state pages), real-estate-appraiser (TX TALCB, CA BREA) |
| Changed | insurance-sales-agent now links the insurance-producer license (button + state matrix); FS hub lists 18 careers by employment; hub cards for the 4 licenses (old "Insurance license" card replaced) |
| Template | us-license-page.html: "Careers that use this license" shows a career's `license_text` when set (loan officer: "Mortgage loan officers") instead of "License required" |
| Checks | +28 search entries, +8 check-search cases; check-us-data, check-search, verify-site --all: 0 problems |

### Batch 2 corrections and notes from the sources

- BLS (loan officers): "Mortgage loan officers must have an MLO license." NMLS: originators at insured depositories (OCC, FDIC, FRB, NCUA, Farm Credit) are federal registrants and do not take the National Test. The MLO page says so under "Not always required".
- BLS (insurance agents): "in most states" courses are required. Texas TDI has no prelicensing course (exam first), and California repealed its 20-hour prelicensing course from 1 Jan 2026 (AB 943); the 12-hour ethics course remains. New York still requires 20–90 hours.
- Search snippets claimed PAREA cannot cover certified general experience; The Appraisal Foundation's page says PAREA may cover 50% of it. TALCB lists 158 hours for licensed residential, BREA 150 (plus 1-hour cultural competency and 4-hour California law): both shown as each state publishes them. The AQB Criteria hour table itself sits in a ShareFile document that could not be opened, so national hour minimums are not stated on the site.
- Bill collectors: the BLS profile has no license section; the hub says "None listed by BLS" (no claim either way).
- Teller and compensation/benefits specialist sit in the crosswalk's Accounting and Insurance sub-clusters respectively; the hub follows the crosswalk.
- Financial Clerks (9 SOCs over 4 clusters) left out: a mixed group, better split into separate pages later.
- Fetch: TREC, TALCB (connection timed out from India), dos.ny.gov, dfs.ny.gov and myfloridalicense.com (403) were read from Internet Archive captures; capture dates are in each source's `note`. NY and FL MLO rows name the agency only as listed on NMLS's state page.

## 4. Queue (next: "continue Phase 3")

Batch 3 (Digital Technology): computer and information systems managers, computer network architects, database
administrators and architects, computer programmers; unmanned vehicle technology (no crosswalk SOC: decide from FAA
Part 107 pages); FINRA Series 6 page source (only BLS used so far).

Later / optional for Financial Services: financial clerks (split by SOC), more state rows for the insurance-producer
(Florida) and appraiser (New York, Florida) pages, and a FINRA/NASAA securities registration page.

## 5. How to add the next batch

1. Fetch each BLS profile with headless Edge (scratchpad `tools/fetch3.cjs`), parse quick facts + How to Become
   (`tools/parse2.cjs`, `tools/htb.cjs`). finra.org / nasaa.org: use `web.archive.org/web/2026id_/<url>` with
   `curl --compressed`.
2. Add `ooh_qf_<k>` / `ooh_<k>` sources, the career to `careers/<cluster>.yml`, and `{ career: <slug>, sub: … }` to
   `clusters.yml`; new license-type credentials also get a `credentials:` card.
3. `node scripts/build-us-clusters.mjs`, then `check-us-data`, `check-search` and `verify-site --all`.
