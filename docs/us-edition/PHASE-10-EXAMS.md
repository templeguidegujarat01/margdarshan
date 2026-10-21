# USA Master Plan — Phase 10: graduate, licensing and government exam pages

Batch 1 shipped 2026-10-21: the six graduate admission tests and the eleven health licensing exams. Phase 10 is too
big for one run (about 45 exam pages, each read on its owner's site), so the rest is queued below as batches 2–4.

New pages: `us/exams/<slug>/` for gre, gmat, lsat, mcat, dat, oat, usmle, comlex-usa, nclex-rn, nclex-pn,
naplex-mpje, inbde, npte, pance, nbcot, eppp, nce. Data: `_data/us/exams.yml` (+17 exams; the hub's Graduate and
Licensing stages now list them), `_data/us/sources.yml` (+78, `accessed` refreshed on 14 re-read sources),
`_data/search.yml` (+17). Stubs: `scripts/build-us-exams.mjs` (unchanged logic). Checks: `scripts/check-us-data.mjs`,
`scripts/check-search.mjs` (+12 queries).

## 1. What was built

| Stage (hub section) | Exam pages |
|---|---|
| Graduate and professional school (`#graduate`) | GRE, GMAT, LSAT, MCAT, DAT, OAT (PCAT stays as "retired") |
| Licensing exams (`#licensing`) | USMLE, COMLEX-USA, NCLEX-RN, NCLEX-PN, NAPLEX + MPJE/UMPJE (one page), INBDE, NPTE, PANCE, NBCOT (OTR and COTA), EPPP, NCE |

Same page format as Phase 9 (who, format, scoring, fees, dates, accepted, practice, used by, sources; 4+ `h2[id]` so the
right rail and phone chips build). Two schema additions in `exams.yml`:

- `license: <licenses.yml id>`: the page links that license page (hero text link + a "license at the end of this route"
  card) instead of repeating its state rules. Used on LSAT, MCAT, DAT and every licensing exam that has a license page.
- `used_by.need: [slugs]`: "Careers that need it". A career slug links its roadmap (`us/roadmaps/<slug>.html`); a
  pathway slug (dentistry, psychology) links `us/careers/<slug>/`. The checker requires each career's roadmap to have
  an exam step that names the exam or links its page.

Wiring: 27 roadmap exam steps now link the new pages (NCLEX-RN/PN, MCAT, USMLE, COMLEX, NAPLEX/MPJE, NPTE, NCE, GMAT or
GRE, LSAT, and the three USMLE steps of the Indian-MBBS cross-border track). The GATES list in `check-us-data.mjs` now
fails any roadmap step that names one of these exams without linking its page. License pages show an "Exam page"
link under each exam that has one (`licenses.yml` exams `page:`); `us/tests/` professional-school rows link the MCAT,
DAT and LSAT pages (`tests.yml` `page:`); the USA menu's Exams group has "GRE, GMAT, LSAT, MCAT" and "USMLE, NCLEX,
licensing"; the licenses index links the licensing stage.

## 2. Corrections and notes from the sources

- **GRE fee**: ETS's "What you need to know" PDF says China and India cost slightly more than $249, but the fee page
  (effective 1 Aug 2026) lists China at $237.86; the page uses the fee page. India points to ETS India, not quoted.
- **GMAT**: prices change with the country picked on the payment page; we selected United States ($275 center, $300
  online). GMAC lists no fee waiver. The earlier "10th Edition" scores (200–800) are not comparable point for point.
- **LSAT vs GRE for law**: LSAC says the LSAT is the only test accepted by every ABA-approved school; ETS says GRE is
  accepted by many law schools. Both statements are shown with their own source.
- **MCAT**: registration for every 2027 date opened 20–22 Oct 2026. AAMC's calendar has a typo ("June 110" for the
  July 10 30-day deadline); that column is not published.
- **USMLE**: Step 1 (from 14 May 2026) and Step 2 CK (from 7 May 2026) moved to 30-minute blocks of up to 20 questions.
- **COMLEX-USA**: NBOME's news post *targets* 320 items for Levels 1 and 2-CE from the spring 2026 cycles; the page
  says "targeted", not "changed". Level 3 becomes one day on 13 Jan 2027 (Level 3 page).
- **NCLEX**: $200 now, $350 from 1 Feb 2027 (fees page). The test plans' content table did not extract cleanly from
  the PDF, so only two category percentages per exam are quoted.
- **NAPLEX/MPJE**: the exam fees are only in NABP's Candidate Application Bulletin, which we did not open; the page
  says so and gives the fees that are on the web pages (score transfer $105, eligibility fee $85).
- **NBCOT and NCE**: neither handbook nor web page we opened prints the exam fee; the pages say so.
- **PANCE**: nccpa.net/become-certified/pance/ returned 403; every PANCE fact comes from /become-certified/. Scoring
  details are on a page we could not reach, so the scoring block only says what passing earns.
- **EPPP**: the handbook says rescheduling "less than 31 days" before costs $87.50; the fees page says "32 days".
  The page follows the handbook (the newer, September 2026 document).
- **NPTE**: FSBPT has not posted 2027 dates; the 2026 table prints deadlines without years, as FSBPT does.
- **DAT/OAT**: all 2026 partial fee waivers are used up (DAT reopens 1 Jan 2027).
- **Counting**: lists are never counted by us (e.g. the UMPJE states and NABP's 15 eligibility jurisdictions are
  listed, not totaled). "5 × 60" for PANCE is NCCPA's own wording.
- **No license page** exists on this site for physician assistants, occupational therapy or optometry, so PANCE,
  NBCOT and OAT show no license link (no empty buttons); they link the Healthcare hub instead.

## 3. Fetch tricks

- `www.mba.com` fees need the country drop-down: `pick.cjs <url> "United States"` (scratchpad 939bc129 tools/).
- AAMC moved most MCAT pages: start from `students-residents.aamc.org/` links; the exam overview is a chapter of
  "MCAT Essentials" (`/whats-mcat-exam/publication-chapters/whats-mcat-exam`).
- ADA (DAT, OAT, INBDE) facts are in the candidate guide PDFs: `dl.cjs` with the program page as warm-up, then
  `pdftotext -layout` (Git Bash has it).
- NBOME fees are only in the FAQ page HTML; NCLEX item counts only in the test plan PDFs.
- FSBPT: the `/Secondary-Pages/Exam-Candidates/National-Exam-NPTE/...` pages work; the old `.aspx` links redirect.
- `tools/body.sh` (5+ word lines, deduped) and `tools/rd.sh` (saved HTML between markers) keep page text short.

## 4. Queue (reply "continue Phase 10")

- **Batch 2, law and finance**: bar exam (legacy UBE and NextGen UBE, jurisdiction list from ncbex.org), MPRE, CPA
  Exam (Core + Discipline, aicpa-cima.com / nasba.org), FE and PE (ncees.org), ARE 5.0 (ncarb.org), FINRA SIE /
  Series 7 / 63 / 65 (plus 66 and 79 already named in roadmaps), CFA. Then relink the roadmap steps "FE exam",
  "PE exam", "Uniform CPA Exam", "MPRE", "Bar exam in your state", "SIE", "Series 7/6/65/66/79", "CFA Level I–III",
  "ARE 5.0" and extend GATES.
- **Batch 3, teaching and trades**: Praxis + three large states' teacher tests (California CBEST/CSET/RICA, Texas
  TExES, New York NYSTCE), NREMT, CDL knowledge and skills tests (FMCSA + one state manual), FAA knowledge tests (AMT
  and pilot), EPA 608/609, ASE. Relink "NREMT …", "CDL skills test", "ASE certification tests", "Three knowledge
  tests", teaching "General teaching test + subject test".
- **Batch 4, government**: FSOT (state.gov), ASTB, AFOQT, SIFT, federal hiring assessments (OPM / USAJOBS), and a
  police/fire "varies by city" page using the NYPD, Chicago PD, FDNY and Houston FD sources already in sources.yml.
- Later: Pre-MPJE details, NAPLEX/MPJE fees from the Bulletin, NPTE 2027 dates once posted, NCLEX full content tables.
