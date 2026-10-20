# USA Master Plan — Phase 5: Public Service & Safety and Education (batch 1)

2026-10-20. Hubs: `us/clusters/public-service-safety/`, `us/clusters/education/` (now live). Data:
`_data/us/careers/public-service-safety.yml`, `_data/us/careers/education.yml` (new), `_data/us/clusters.yml`
(placement, Education `live: true`), `_data/us/licenses.yml` (new `teaching`), `_data/us/home.yml`
(`public_sector.service_routes`), `_data/us/sources.yml` (+53 sources). `docs/` is excluded from the build.

## 1. What was built

| Kind | Pages |
|------|-------|
| Public Service & Safety career pages + roadmaps (4) | police-officer, correctional-officer, paralegal, firefighter |
| Existing pathway reused | law → new roadmap `us/roadmaps/lawyer.html` (J.D. route + patent-bar route) |
| Education career pages + roadmaps (7) | elementary-school-teacher, postsecondary-teacher (professor, Ph.D. route), high-school-teacher, middle-school-teacher, special-education-teacher, school-counselor, librarian |
| License page | `us/professional-licenses/teaching/` with a 5-state certification matrix (TX TEA, CA CTC, NY NYSED, FL FLDOE, PA PDE); teacher roadmaps show it via `states_from: teaching` |
| Hubs | Education hub live (7 careers, nav child). PSS hub: 5 careers, police/firefighter rows in the civil-service table now link their pages, new section **Foreign Service and the military** (`#service-routes`): FSO selection (FSOT, Oral Assessment, clearances, final panel), enlisted rules + ASVAB/AFQT, enlisted age limits from each service's own site, officer routes (academies, ROTC, OCS/OTS, Marine officer, direct appointment). |
| Police / fire "no national rule" | Roadmap matrix renamed (`states_title`, `states_col`): "How three departments hire" — NYPD (DCAS notice of exam 7311–7322), LAPD, Chicago PD; fire: FDNY, LAFD, Houston Fire. Firefighter roadmap links the EMT career and EMT license pages. |
| Template / checks | Hourly pay optional (`pay_hour: null`, BLS gives teachers only an annual wage); `states_title`/`states_col`; hub `service_routes` section. `check-us-data.mjs`: pay_hour null rule, states_title needs rows, service_routes sources + careers.state.gov href, jobs href must exist. `check-search.mjs`: 6 cases; 26 search entries. |

Totals: 11 career pages, 12 roadmaps, 1 license page, 1 new hub. check-us-data, check-search,
build-us-clusters --check, build-nav-mega --check and verify-site --all (2,296 pages): 0 problems.
Screenshots desktop 1366 + phone 390, light + dark: no horizontal overflow, right rail + chip rail on every page.

## 2. Corrections and notes from the sources

- **Army enlisted age**: BLS's military profile still lists 35; goarmy.com says 17 to 42. The site uses each service's
  own page (Army 17–42, Navy 17–41, Air Force 17 to the 42nd birthday, Marines 17–28, Space Force 17–42).
- **Coast Guard age**: gocoastguard.com's eligibility page loads its enlisted tab only through script that would not
  render here; the row shows "BLS lists 41" with a confirm-with-a-recruiter note. Re-check later.
- **Navy**: navy.com blocks automated readers (Cloudflare); read from the Internet Archive copy of 10 Aug 2025.
- **NYPD**: the nyc.gov page (OLD-po-hiring) still says appointment at 21 and exam registration before 35. The current
  DCAS Notice of Examination (2026–27) says appointment at 20½ and under 43 on the filing date; the site uses the notice.
- **LAFD** now asks for the Biddle Physical Agility Test (BPAT), not the CPAT that many third-party pages still name.
- **California** (CL-561C, updated 1 Oct 2026): the leaflet lists no separate basic-skills exam or RICA; subject matter
  competence can be shown by exam, program, coursework or a liberal studies major. New: a Certificate of Clearance
  (or permit/credential) before program admission from 27 Sep 2026.
- **"Praxis or the state's own tests"**: true as a pattern. Pennsylvania uses ETS Praxis and Pearson tests; New York
  uses NYSTCE (EAS + CSTs); Florida has its own General Knowledge Test (a master's can replace it); Texas's Core
  Subjects EC–6 (391) ends 31 Aug 2027.
- **EMT link**: the crosswalk places EMTs (29-2040) only in Healthcare, so EMT stays on that hub; the firefighter
  page links it instead.
- **Correctional officers (federal)**: BOP's careers site confirms USAJOBS applications, citizenship and an age check;
  the exact maximum age is in each USAJOBS announcement and is not quoted.
- School counselor: Pennsylvania exempts LPC holders from the state tests (PDE certification testing page).
- No credentials are named for paralegals or advisors: BLS names none and points to CareerOneStop (403 from India).

## 3. BLS OOH profiles used (12), by 2025 employment

| Profile | SOC | Jobs 2025 | Median pay May 2025 | Outlook 2025–35 | Crosswalk | Hub |
|---|---|---|---|---|---|---|
| Kindergarten and Elementary School Teachers | 25-2012, 25-2021 | 1,530,500 | $63,820 | 0% | Edu 2 | Education |
| Postsecondary Teachers | 35 SOCs 25-1011…25-1193 | 1,378,200 | $85,330 | 7% | Edu 35 | Education |
| High School Teachers | 25-2031 | 1,087,500 | $72,040 | 0% | Edu 1 | Education |
| Lawyers | 23-1011 | 863,700 | $159,670 | 5% | PSS 1 | PSS (law pathway) |
| Police and Detectives | 33-3021/3031/3051/3052 | 824,200 | $77,310 | 3% | PSS 7, Energy 1 | PSS |
| Middle School Teachers | 25-2022 | 630,100 | $64,370 | 0% | Edu 1 | Education |
| Special Education Teachers | 25-2050 | 584,100 | $67,170 | 0% | Edu 10 | Education |
| Correctional Officers and Bailiffs | 33-3010 | 415,800 | $58,850 | -7% | PSS 2 | PSS |
| Paralegals and Legal Assistants | 23-2011 | 404,900 | $62,890 | 0% | PSS 1 | PSS |
| School and Career Counselors | 21-1012 | 389,500 | $64,330 | 3% | Edu 1, HHS 1 (tie) | Education |
| Firefighters | 33-2011 | 355,300 | $59,280 | 4% | PSS 1, Energy 1 (tie) | PSS |
| Librarians and Library Media Specialists | 25-4022 | 142,300 | $68,270 | 3% | Edu 1 | Education |

Military Careers (BLS) has no Quick Facts; it is used only for the hub's service-routes section.

## 4. Still open / queue (batch 2, "continue Phase 5")
- More careers: preschool teachers, teacher assistants, instructional coordinators, principals (Education
  Administration & Leadership), postsecondary education administrators; detectives' federal agencies; judges,
  security guards, emergency management directors, urban planners (Local, State & Federal Services); fish and game wardens.
- Coast Guard enlisted age from gocoastguard.com; more teacher states (IL ISBE pages read but too thin for a row).
- Exam pages (Praxis, LSAT, ASVAB, FSOT) belong to Phase 10; add `href`s then.

## 5. How to add the next batch
Same as Phase 4 §7: fetch BLS with headless Edge (`tools/fetch6.cjs`), parse (`parse2.cjs`, now tolerant of profiles
without Quick Facts), add sources, career entries, `clusters.yml` placement, run `node scripts/build-us-clusters.mjs`,
add search entries, then the checks (VERIFY_DEPS set in the same shell call).
