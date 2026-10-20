# USA Master Plan — Phase 8: Arts, Entertainment, & Design and Hospitality, Events, & Tourism

2026-10-21. Hubs: `us/clusters/arts-entertainment-design/` and `us/clusters/hospitality-events-tourism/` (**new, now
live**; both were "Next" shells). With these two, all 14 Career Cluster hubs are live. Data:
`_data/us/careers/arts-entertainment-design.yml` and `hospitality-events-tourism.yml` (new),
`_data/us/careers/healthcare-human-services.yml` (+cosmetologist-barber), `_data/us/careers/digital-technology.yml`
(web-developer: + digital/UX designer route), `_data/us/licenses.yml` (new `interior-design`, `cosmetology`),
`_data/us/clusters.yml` (placement, credentials, both hubs live), `_data/nav_us.yml` (two menu children),
`_data/us/sources.yml` (+52), `_data/search.yml` (+38), `scripts/check-search.mjs` (+6 cases).

## 1. What was built

| Kind | Pages |
|------|-------|
| Arts careers + roadmaps (10) | graphic-designer, musician-singer, photographer, writer-author, interior-designer, film-video-editor, actor, animator, journalist, dancer-choreographer |
| Hospitality careers + roadmaps (5) | food-service-manager, chef-head-cook, event-planner, travel-agent, lodging-manager |
| Healthcare & Human Services (1) | cosmetologist-barber (see §2: the crosswalk places it there) |
| License pages (2) | `us/professional-licenses/interior-design/` (NCIDQ; Texas, Florida, Nevada, Louisiana) and `us/professional-licenses/cosmetology/` (Texas, California, New York, Florida hour rules) |
| Existing page extended | web-developer roadmap: new "Digital (UX/UI) designer" route |
| Hubs | Arts, Entertainment, & Design and Hospitality, Events, & Tourism go live with credentials tables; the Arts table links the architect career (Construction) |

Template change: BLS publishes **only an hourly median** for actors ($29.05), musicians and singers ($47.80) and dancers
and choreographers ($25.40). `metrics.pay` may now be `null` when `pay_hour` is set; the career page, roadmap and hub
matrix show "$X an hour" (`_includes/us-career-overview.html`, `intl-roadmap.html`, `us-cluster-career.html`;
`scripts/check-us-data.mjs` checks it).

Portfolio and audition admission: no general rule is stated. Pages show what one school publishes, as a labelled
example ("What an art school publishes" / "What a drama school publishes"): RISD first-year portfolio (12 to 20 recent
works on SlideRoom, $60 + $10, observational drawing recommended, AI use must be described) and Juilliard's Actor
Training Program (four memorized two-minute monologues, two heightened text incl. Shakespeare and verse, two
contemporary; at most four application attempts). Musicians: BLS's own line (recordings and/or a live audition).

| Page | Key facts (source) |
|---|---|
| Interior design license | NCIDQ: IDFX 115 q / 3 h, IDIX (formerly PRAC) 130 q / 4 h, IDPX 115 q / 3 h; April and October; Route 1 $235 + $305/$470/$365; Route 2 $100 + $150; 60 semester ID credit hours; 3,520 work hours after a CIDA degree up to 7,040 after an associate's/certificate; Route 1 must pass within 10 administrations (CIDQ handbook, apply, eligibility). All regulated jurisdictions require NCIDQ except California (CIDQ jurisdictions, Aug 2025). TX TBAE $100 + $200, 12 CE h/yr; FL s. 481.209 certificate of registration (since 1 July 2020 rule); NV CIDA + 2 years + $100 supplemental exam; LA 6 years education + experience |
| Cosmetology license | TX TDLR: 1,000 h cosmetology operator or Class A barber, written exam after 900 h, practical, age 17, $50; CA BBC: age 17, 10th grade, 1,000 h (B&P 7362.5), written exam only (100 / 85 questions, 120 min), barber apprenticeship accepted; NY DOS: age 17, 1,000 h, health certificate, written (2 h 30) + practical, $40 + $15 per exam; FL: cosmetologist 1,200 h (exam after 1,000), barber 900 h (exam after 600), age 16 |
| Apprenticeship (DOL RAPIDS, time-based minimum) | Graphic Designer 0010 3,000 h; Photographer, Still 0403 6,000 h; Interior Designer 0265 4,000 h; Camera Operator 0955 6,000 h; Cook (Hotel & Restaurant) 0663 4,000 h; Cook, Chief 1053 2,000 h; Manager, Food Service 0593 6,000 h; Barber 0030 and Cosmetologist 0096 2,000 h each |
| Photographer | FAA remote pilot certificate for commercial drone work: age 16, English, aeronautical knowledge test (14 CFR 107.61, eCFR) |
| Chef | ACF Certified Culinarian: diploma + 2 years, or associate's in culinary arts, or ACFEF apprenticeship; three 30-hour courses; written + practical exams; 5-year renewal (ACF) |
| Travel agent | California: register with the AG Seller of Travel Program 10 days before doing business, $100 per location a year, TCRF; Florida FDACS: annual registration, bond up to $25,000 ($50,000 for vacation certificates) |

Checks: check-us-data (650 sources, 22 licenses, 136 careers placed, 14 hubs live), check-search (873 entries, 82
queries), build-us-clusters --check, build-intl-roadmaps --check, build-nav-mega --check, build-seo-landings --check,
check-in-data, check-uk-data and verify-site --all (2,395 pages): 0 problems. Screenshots 1366 + 390, light + dark, of
12 pages: no horizontal overflow.

## 2. Corrections and notes from the sources

- **Cosmetologist/barber under Hospitality**: Advance CTE's crosswalk puts barbers (39-5011) and hairdressers,
  hairstylists and cosmetologists (39-5012) only in Healthcare & Human Services (Personal Care Services, whose example
  programs are Barbering and Cosmetology). The page sits on the HHS hub; the Hospitality hub does not list it.
- **"UX designer"**: BLS has no UX profile. Web and digital interface designers (15-1255) share the "Web Developers and
  Digital Designers" profile with web developers, which already has a page; a second page would repeat the same
  numbers. The web-developer roadmap gets a digital (UX/UI) designer route, and the Arts hub already lists that page
  under "Also in this cluster".
- **"Architect link"**: the crosswalk places architects only in Construction, so the architect page is not placed on
  the Arts hub; the hub's credentials table links it instead.
- **"Chef/cook"**: chefs and head cooks (220,300 jobs) and cooks (2.7 million) are two BLS profiles. One chef page,
  with the cook rungs (kitchen helper, line cook, the cook apprenticeship) as routes; a separate cooks page is in §4.
- **"Interior designer: only states that regulate it"**: done; note that Florida now issues a *certificate of
  registration* (s. 481.209, 2020 change), and BLS describes three kinds of state law (practice, title, none).
- **"Cosmetologist: 3–5 states' hour rules"**: four states (TX, CA, NY, FL) from the boards and statutes. California's
  minimum is now 1,000 hours (B&P 7362.5) and it gives a written exam only.
- **Dancers' entry education**: BLS gives "See How to Become One" (it varies); the matrix says "Varies (see the routes)".
- Read through the Internet Archive because the live site returns 403 to our browser: NY DOS (12 July 2026 copy) and
  Juilliard (6 October 2026 copy). Not used: Events Industry Council CMP eligibility (the page shown has no rules; no
  CMP figures are quoted), CalArts portfolio page (redirected to a general page), NY DOS barber page (403 + Wayback
  challenge), TBAE interior design page (404; Texas row comes from CIDQ's jurisdiction guide).

## 3. BLS OOH profiles used (17 + web developers), by 2025 employment

| Profile | SOC used | Jobs 2025 | Median pay May 2025 | Outlook 2025–35 | Page |
|---|---|---|---|---|---|
| Barbers, Hairstylists, and Cosmetologists | 39-5011, 39-5012 | 670,800 | $35,880 | 7% | cosmetologist-barber (HHS) |
| Food Service Managers | 11-9051 | 344,300 | $69,390 | 6% | food-service-manager |
| Graphic Designers | 27-1024 | 253,100 | $62,960 | −2% | graphic-designer |
| Chefs and Head Cooks | 35-1011 | 220,300 | $62,470 | 7% | chef-head-cook |
| Meeting, Convention, and Event Planners | 13-1121 | 172,100 | $61,160 | 6% | event-planner |
| Musicians and Singers | 27-2042 | 170,400 | $47.80 an hour only | 0% | musician-singer |
| Photographers | 27-4021 | 145,000 | $44,660 | −1% | photographer |
| Writers and Authors | 27-3043 | 140,300 | $76,910 | 0% | writer-author |
| Interior Designers | 27-1025 | 97,100 | $67,190 | 3% | interior-designer |
| Film and Video Editors and Camera Operators | 27-4031, 27-4032 | 72,000 | $75,100 | 3% | film-video-editor |
| Actors | 27-2011 | 67,500 | $29.05 an hour only | 0% | actor |
| Travel Agents | 41-3041 | 61,500 | $50,160 | 0% | travel-agent |
| Lodging Managers | 11-9081 | 54,800 | $69,250 | 4% | lodging-manager |
| Special Effects Artists and Animators | 27-1014 | 51,900 | $102,030 | 0% | animator |
| News Analysts, Reporters, and Journalists | 27-3023 | 47,100 | $62,200 | −6% | journalist |
| Dancers and Choreographers | 27-2031, 27-2032 | 18,600 | $25.40 an hour only | 2% | dancer-choreographer |
| Cooks (How to Become only) | 35-2010 | 2,705,800 | — | — | chef routes |

## 4. Still open
- More careers: cooks (own page), fashion designers, fine artists, producers and directors, editors, music directors
  and composers, art directors, public relations (exists in Management), set and exhibit designers, broadcast and
  sound technicians; hotel desk clerks, recreation workers, tour guides, flight attendants (Transport), bakers.
- More state rows: cosmetology/barber for Illinois, Pennsylvania, Georgia; NY barber (apprenticeship-based) once
  dos.ny.gov can be read; more interior design states (Alabama, Illinois, Virginia …) from the boards themselves.
- CMP (Events Industry Council) eligibility once the rules page can be read; AHLEI hotel certifications; ACPHA.
- School-published portfolio and audition rules for more schools (music conservatories, dance BFA programs).

## 5. How to add the next batch
Same as Phase 7 §5. BLS: `fetch6.cjs` (now keeps 160 characters of the file name, so long BLS URLs stay intact), then
`parse2.cjs` and `htb.cjs`. DOL spreadsheet: unzip with PowerShell `Expand-Archive` (Git Bash `tar` can not read it),
then `xlsx.cjs`. Hourly-only BLS occupations: `pay: null` + `pay_hour`.
