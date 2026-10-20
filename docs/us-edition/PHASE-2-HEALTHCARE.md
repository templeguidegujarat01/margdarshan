# USA Master Plan — Phase 2: Healthcare & Human Services (batch 1)

2026-10-20. Hub: `us/clusters/healthcare-human-services/`. Data: `_data/us/careers/healthcare-human-services.yml`,
`_data/us/licenses.yml` (4 new licenses), `_data/us/clusters.yml` (placement), `_data/us/sources.yml` (+76 sources).
`docs/` is excluded from the build.

## 1. What was built in batch 1

| Kind | Pages |
|------|-------|
| New career pages (`us/careers/<slug>/`, `us-career-overview.html`) | home-health-aide, nursing-assistant, medical-assistant, social-worker, licensed-practical-nurse, mental-health-counselor, pharmacy-technician, social-human-service-assistant, nurse-practitioner, dental-assistant, clinical-lab-technologist, emt-paramedic (12) |
| Roadmaps (`us/roadmaps/<slug>.html`, `intl-roadmap.html` `career: true`) | the 12 above + registered-nurse, physician, pharmacist, physical-therapist (16) |
| Existing pathway pages reused (no duplicate page) | nursing → registered-nurse roadmap, medicine → physician, pharmacy → pharmacist, physical-therapy → physical-therapist. The v2 page now links its roadmap (hero text link + card in "The path") |
| New license pages (`us/professional-licenses/<id>/`, stub written by `build-us-clusters.mjs` from `page:`) | practical-nursing (LPN/LVN: TX, CA, NY, FL), social-work (TX, CA, NY, FL), counseling (TX, CA, NY, FL), emt (TX, NY, FL) |
| Hub | matrix + cards now 18 careers, ordered by BLS 2025 employment |

Batch rule: the 16 largest BLS occupations (2025 employment) that the Advance CTE crosswalk places in this cluster.
Routes asked for in the brief are built: CNA → LPN → RN → NP (RN roadmap "ladder" route, CNA roadmap route 2) and
pre-med → MCAT → M.D./D.O. → USMLE/COMLEX → residency → license (physician roadmap). Exam gates link to the exam
section of the license page (`#exams`) or `us/tests/#grad-tests` (MCAT); every license step links its license page.

## 2. Corrections and notes from the sources

- BLS OOH now shows **May 2025** pay, 2025 jobs and 2025–35 outlook (pages last modified 27 Aug 2026). The site
  vintage (`sources.yml bls_vintage`) already matched; all numbers were copied from each profile's Quick Facts.
- The OOH "Healthcare" group has 49 profiles and "Community and Social Service" 9 (58 total, not counting
  psychologists, who are in the life/physical/social science group and already have a pathway page).
- Not every OOH healthcare profile belongs to this cluster in the Advance CTE crosswalk: veterinarians → Agriculture;
  athletic trainers → Arts, Entertainment, & Design; occupational health and safety specialists → Advanced
  Manufacturing / Management & Entrepreneurship; probation officers → Public Service & Safety. Ties: veterinary
  technologists and veterinary assistants (Agriculture = HHS), school and career counselors (Education = HHS),
  community health workers (HHS = Public Service & Safety). Ties will be placed by field in their phase.
- PA and respiratory therapist (named in the brief) are #25 and #31 by employment, so they and their license pages
  are in batch 2, not batch 1.
- The BLS RN page says ADN/ASN degrees "also typically take 4 years to complete" — it reads like a BLS slip, so that
  sentence was not used; only the diploma length (2–3 years) and BSN (4 years) are shown.
- NREMT says its certification does not by itself give the right to practice; the state EMS office licenses. New
  York gives its own state written exam (PSI) instead of requiring NREMT; Texas and Florida use NREMT.
- Medical assistant, pharmacy technician, dental assistant and lab certifications (CMA (AAMA), PTCB CPhT, DANB NELDA/CDA,
  ASCP BOC) are shown as optional certifications, never as licenses.
- Not found on an official page, so left out: California EMT rules (EMSA pages would not load headless), New York
  LMHC exam name (accordion did not render), NLC status for LPNs (the compact page is RN-only on this site),
  the Counseling Compact and EMS (REPLICA) Compact.

## 3. Fetch tricks

- `www.bls.gov` returns 403 to curl; headless Edge (playwright-core, `channel: 'msedge'`) gets 200 and the saved HTML
  contains every tab (How to Become One, Pay, Job Outlook with the SOC table), so one fetch per profile is enough.
- Many board pages hide text in accordions/tabs: read the saved HTML (strip tags), not `innerText`.
- `emsa.ca.gov` pages fail headless (`document.body` null); `bon.texas.gov` uses `.asp.html` URLs.

## 4. Every BLS OOH profile for this cluster (58), by 2025 employment

Crosswalk = Advance CTE SOC crosswalk rows per cluster. Status: Batch 1 = built now; Queue = next batches; anything
else = placed in another cluster.

| # | BLS OOH profile | SOC | Jobs 2025 | Median pay May 2025 | Entry education | Outlook 2025–35 | Crosswalk rows | Status |
|---|-----------------|-----|-----------|---------------------|-----------------|-----------------|----------------|--------|
| 1 | [Home Health and Personal Care Aides](https://www.bls.gov/ooh/healthcare/home-health-aides-and-personal-care-aides.htm) | 31-1120 | 4,677,100 | $35,800 | High school diploma or equivalent | 18% (Much faster than average) | Healthcare & Human Services 1 | Batch 1 |
| 2 | [Registered Nurses](https://www.bls.gov/ooh/healthcare/registered-nurses.htm) | 29-1141 | 3,465,400 | $97,550 | Bachelor's degree | 6% (Faster than average) | Healthcare & Human Services 1 | Batch 1 |
| 3 | [Nursing Assistants and Orderlies](https://www.bls.gov/ooh/healthcare/nursing-assistants.htm) | 31-1131, 31-1132 | 1,558,700 | $41,870 | See How to Become One | 3% (As fast as average) | Healthcare & Human Services 2 | Batch 1 |
| 4 | [Physicians and Surgeons](https://www.bls.gov/ooh/healthcare/physicians-and-surgeons.htm) | 29-1210, 29-1211, 29-1212, 29-1213, 29-1214, 29-1215, 29-1216, 29-1217, 29-1218, 29-1221, 29-1222, 29-1223, 29-1224, 29-1229, 29-1240, 29-1241, 29-1242, 29-1243, 29-1249 | 862,800 | $275,930 | Doctoral or professional degree | 4% (As fast as average) | Healthcare & Human Services 17 | Batch 1 |
| 5 | [Medical Assistants](https://www.bls.gov/ooh/healthcare/medical-assistants.htm) | 31-9092 | 833,900 | $45,690 | Postsecondary nondegree award | 13% (Much faster than average) | Healthcare & Human Services 1 | Batch 1 |
| 6 | [Social Workers](https://www.bls.gov/ooh/community-and-social-service/social-workers.htm) | 21-1020, 21-1021, 21-1022, 21-1023, 21-1029 | 816,100 | $61,780 | See How to Become One | 6% (Faster than average) | Education 1, Healthcare & Human Services 4 | Batch 1 |
| 7 | [Licensed Practical and Licensed Vocational Nurses](https://www.bls.gov/ooh/healthcare/licensed-practical-and-licensed-vocational-nurses.htm) | 29-2061 | 666,900 | $64,400 | Postsecondary nondegree award | 3% (As fast as average) | Healthcare & Human Services 1 | Batch 1 |
| 8 | [Substance Abuse, Behavioral Disorder, and Mental Health Counselors](https://www.bls.gov/ooh/community-and-social-service/substance-abuse-behavioral-disorder-and-mental-health-counselors.htm) | 21-1018 | 533,400 | $59,350 | Master's degree | 18% (Much faster than average) | Healthcare & Human Services 1 | Batch 1 |
| 9 | [Pharmacy Technicians](https://www.bls.gov/ooh/healthcare/pharmacy-technicians.htm) | 29-2052 | 471,200 | $45,750 | High school diploma or equivalent | 6% (Faster than average) | Healthcare & Human Services 1 | Batch 1 |
| 10 | [Social and Human Service Assistants](https://www.bls.gov/ooh/community-and-social-service/social-and-human-service-assistants.htm) | 21-1093 | 463,400 | $45,930 | High school diploma or equivalent | 7% (Much faster than average) | Healthcare & Human Services 1 | Batch 1 |
| 11 | [Nurse Anesthetists, Nurse Midwives, and Nurse Practitioners](https://www.bls.gov/ooh/healthcare/nurse-anesthetists-nurse-midwives-and-nurse-practitioners.htm) | 29-1151, 29-1161, 29-1171 | 399,000 | $134,920 | Master's degree | 36% (Much faster than average) | Healthcare & Human Services 3 | Batch 1 |
| 12 | [School and Career Counselors and Advisors](https://www.bls.gov/ooh/community-and-social-service/school-and-career-counselors.htm) | 21-1012 | 389,500 | $64,330 | Master's degree | 3% (As fast as average) | Education 1, Healthcare & Human Services 1 | tie Education / HHS |
| 13 | [Dental Assistants](https://www.bls.gov/ooh/healthcare/dental-assistants.htm) | 31-9091 | 388,600 | $48,070 | Postsecondary nondegree award | 7% (Much faster than average) | Healthcare & Human Services 1 | Batch 1 |
| 14 | [Clinical Laboratory Technologists and Technicians](https://www.bls.gov/ooh/healthcare/clinical-laboratory-technologists-and-technicians.htm) | 29-2010 | 343,000 | $62,930 | Bachelor's degree | 3% (As fast as average) | Healthcare & Human Services 1 | Batch 1 |
| 15 | [Pharmacists](https://www.bls.gov/ooh/healthcare/pharmacists.htm) | 29-1051 | 325,200 | $140,910 | Doctoral or professional degree | 5% (Faster than average) | Healthcare & Human Services 1 | Batch 1 |
| 16 | [EMTs and Paramedics](https://www.bls.gov/ooh/healthcare/emts-and-paramedics.htm) | 29-2040, 29-2042, 29-2043 | 284,100 | $48,150 | Postsecondary nondegree award | 6% (Faster than average) | Healthcare & Human Services 2 | Batch 1 |
| 17 | [Physical Therapists](https://www.bls.gov/ooh/healthcare/physical-therapists.htm) | 29-1123 | 283,700 | $102,760 | Doctoral or professional degree | 12% (Much faster than average) | Healthcare & Human Services 1 | Batch 1 |
| 18 | [Radiologic and MRI Technologists](https://www.bls.gov/ooh/healthcare/radiologic-technologists.htm) | 29-2034, 29-2035 | 278,100 | $81,390 | Associate's degree | 5% (Faster than average) | Healthcare & Human Services 2 | Queue |
| 19 | [Dental Hygienists](https://www.bls.gov/ooh/healthcare/dental-hygienists.htm) | 29-1292 | 225,300 | $98,100 | Associate's degree | 8% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 20 | [Medical Records Specialists](https://www.bls.gov/ooh/healthcare/medical-records-and-health-information-technicians.htm) | 29-2072 | 200,700 | $51,140 | Postsecondary nondegree award | 8% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 21 | [Psychiatric Technicians and Aides](https://www.bls.gov/ooh/healthcare/psychiatric-technicians-and-aides.htm) | 29-2053, 31-1133 | 198,400 | $45,100 | See How to Become One | 18% (Much faster than average) | Healthcare & Human Services 2 | Queue |
| 22 | [Speech-Language Pathologists](https://www.bls.gov/ooh/healthcare/speech-language-pathologists.htm) | 29-1127 | 193,400 | $97,870 | Master's degree | 17% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 23 | [Occupational Health and Safety Specialists and Technicians](https://www.bls.gov/ooh/healthcare/occupational-health-and-safety-specialists-and-technicians.htm) | 19-5000, 19-5011, 19-5012 | 174,300 | $83,740 | See How to Become One | 19% (Much faster than average) | Advanced Manufacturing 2, Management & Entrepreneurship 2 | Advanced Manufacturing / Management & Entrepreneurship (2 rows each; not in HHS) |
| 24 | [Occupational Therapists](https://www.bls.gov/ooh/healthcare/occupational-therapists.htm) | 29-1122 | 169,600 | $100,330 | Master's degree | 15% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 25 | [Physician Assistants](https://www.bls.gov/ooh/healthcare/physician-assistants.htm) | 29-1071 | 168,900 | $135,880 | Master's degree | 21% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 26 | [Physical Therapist Assistants and Aides](https://www.bls.gov/ooh/healthcare/physical-therapist-assistants-and-aides.htm) | 31-2020, 31-2021, 31-2022 | 163,200 | $61,200 | See How to Become One | 17% (Much faster than average) | Healthcare & Human Services 2 | Queue |
| 27 | [Dentists](https://www.bls.gov/ooh/healthcare/dentists.htm) | 29-1020, 29-1021, 29-1022, 29-1023, 29-1024, 29-1029 | 161,400 | $176,110 | Doctoral or professional degree | 6% (Faster than average) | Healthcare & Human Services 5 | Queue |
| 28 | [Massage Therapists](https://www.bls.gov/ooh/healthcare/massage-therapists.htm) | 31-9011 | 155,400 | $58,450 | Postsecondary nondegree award | 15% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 29 | [Phlebotomists](https://www.bls.gov/ooh/healthcare/phlebotomists.htm) | 31-9097 | 143,900 | $45,230 | Postsecondary nondegree award | 7% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 30 | [Surgical Assistants and Technologists](https://www.bls.gov/ooh/healthcare/surgical-technologists.htm) | 29-9093, 29-2055 | 142,800 | $64,700 | Postsecondary nondegree award | 5% (Faster than average) | Healthcare & Human Services 2 | Queue |
| 31 | [Respiratory Therapists](https://www.bls.gov/ooh/healthcare/respiratory-therapists.htm) | 29-1126 | 142,000 | $82,280 | Associate's degree | 9% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 32 | [Veterinary Assistants and Laboratory Animal Caretakers](https://www.bls.gov/ooh/healthcare/veterinary-assistants-and-laboratory-animal-caretakers.htm) | 31-9096 | 132,100 | $38,150 | High school diploma or equivalent | 9% (Much faster than average) | Agriculture 1, Healthcare & Human Services 1 | tie Agriculture / HHS |
| 33 | [Veterinary Technologists and Technicians](https://www.bls.gov/ooh/healthcare/veterinary-technologists-and-technicians.htm) | 29-2056 | 131,400 | $47,380 | Associate's degree | 9% (Much faster than average) | Agriculture 1, Healthcare & Human Services 1 | tie Agriculture / HHS |
| 34 | [Rehabilitation Counselors](https://www.bls.gov/ooh/community-and-social-service/rehabilitation-counselors.htm) | 21-1015 | 96,900 | $46,850 | Master's degree | 2% (Slower than average) | Healthcare & Human Services 1 | Queue |
| 35 | [Probation Officers and Correctional Treatment Specialists](https://www.bls.gov/ooh/community-and-social-service/probation-officers-and-correctional-treatment-specialists.htm) | 21-1092 | 93,700 | $66,270 | Bachelor's degree | 3% (As fast as average) | Public Service & Safety 1 | Public Service & Safety |
| 36 | [Diagnostic Medical Sonographers](https://www.bls.gov/ooh/healthcare/diagnostic-medical-sonographers.htm) | 29-2032 | 92,200 | $96,590 | Associate's degree | 14% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 37 | [Veterinarians](https://www.bls.gov/ooh/healthcare/veterinarians.htm) | 29-1131 | 91,100 | $130,100 | Doctoral or professional degree | 9% (Much faster than average) | Agriculture 1 | Agriculture |
| 38 | [Dietitians and Nutritionists](https://www.bls.gov/ooh/healthcare/dietitians-and-nutritionists.htm) | 29-1031 | 86,300 | $76,400 | Bachelor's degree | 8% (Much faster than average) | Healthcare & Human Services 2 | Queue |
| 39 | [Marriage and Family Therapists](https://www.bls.gov/ooh/community-and-social-service/marriage-and-family-therapists.htm) | 21-1013 | 76,300 | $66,940 | Master's degree | 14% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 40 | [Opticians](https://www.bls.gov/ooh/healthcare/opticians-dispensing.htm) | 29-2081 | 74,300 | $47,260 | High school diploma or equivalent | 4% (As fast as average) | Healthcare & Human Services 1 | Queue |
| 41 | [Health Education Specialists](https://www.bls.gov/ooh/community-and-social-service/health-educators.htm) | 21-1091 | 70,400 | $64,070 | Bachelor's degree | 6% (Faster than average) | Healthcare & Human Services 1 | Queue |
| 42 | [Community Health Workers](https://www.bls.gov/ooh/community-and-social-service/community-health-workers.htm) | 21-1094 | 64,700 | $51,850 | High school diploma or equivalent | 13% (Much faster than average) | Healthcare & Human Services 1, Public Service & Safety 1 | Queue (tie with Public Service & Safety; placed here as a health job) |
| 43 | [Cardiovascular Technologists and Technicians](https://www.bls.gov/ooh/healthcare/cardiovascular-technologists-and-technicians.htm) | 29-2031 | 64,500 | $74,310 | Associate's degree | 4% (As fast as average) | Healthcare & Human Services 1 | Queue |
| 44 | [Chiropractors](https://www.bls.gov/ooh/healthcare/chiropractors.htm) | 29-1011 | 61,700 | $79,200 | Doctoral or professional degree | 9% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 45 | [Occupational Therapy Assistants and Aides](https://www.bls.gov/ooh/healthcare/occupational-therapy-assistants-and-aides.htm) | 31-2010, 31-2011, 31-2012 | 56,600 | $70,800 | See How to Become One | 20% (Much faster than average) | Healthcare & Human Services 2 | Queue |
| 46 | [Optometrists](https://www.bls.gov/ooh/healthcare/optometrists.htm) | 29-1041 | 45,100 | $136,570 | Doctoral or professional degree | 10% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 47 | [Health Information Technologists and Medical Registrars](https://www.bls.gov/ooh/healthcare/health-information-technologists-and-medical-registrars.htm) | 29-9021 | 42,000 | $68,020 | Associate's degree | 16% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 48 | [Medical Transcriptionists](https://www.bls.gov/ooh/healthcare/medical-transcriptionists.htm) | 31-9094 | 42,000 | $40,410 | Postsecondary nondegree award | -4% (Decline) | Healthcare & Human Services 1 | Queue |
| 49 | [Athletic Trainers](https://www.bls.gov/ooh/healthcare/athletic-trainers.htm) | 29-9091 | 35,200 | $62,520 | Master's degree | 13% (Much faster than average) | Arts, Entertainment, & Design 1 | Arts, Entertainment, & Design |
| 50 | [Exercise Physiologists](https://www.bls.gov/ooh/healthcare/exercise-physiologists.htm) | 29-1128 | 21,200 | $59,460 | Bachelor's degree | 13% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 51 | [Nuclear Medicine Technologists](https://www.bls.gov/ooh/healthcare/nuclear-medicine-technologists.htm) | 29-2033 | 17,400 | $101,370 | Associate's degree | 4% (As fast as average) | Healthcare & Human Services 1 | Queue |
| 52 | [Radiation Therapists](https://www.bls.gov/ooh/healthcare/radiation-therapists.htm) | 29-1124 | 17,400 | $105,310 | Associate's degree | 3% (As fast as average) | Healthcare & Human Services 1 | Queue |
| 53 | [Recreational Therapists](https://www.bls.gov/ooh/healthcare/recreational-therapists.htm) | 29-1125 | 15,600 | $61,960 | Bachelor's degree | 5% (Faster than average) | Healthcare & Human Services 1 | Queue |
| 54 | [Audiologists](https://www.bls.gov/ooh/healthcare/audiologists.htm) | 29-1181 | 14,200 | $95,780 | Doctoral or professional degree | 11% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 55 | [Podiatrists](https://www.bls.gov/ooh/healthcare/podiatrists.htm) | 29-1081 | 10,000 | $160,300 | Doctoral or professional degree | 2% (Slower than average) | Healthcare & Human Services 1 | Queue |
| 56 | [Orthotists and Prosthetists](https://www.bls.gov/ooh/healthcare/orthotists-and-prosthetists.htm) | 29-2091 | 9,500 | $81,110 | Master's degree | 13% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 57 | [Genetic Counselors](https://www.bls.gov/ooh/healthcare/genetic-counselors.htm) | 29-9092 | 4,200 | $100,040 | Master's degree | 10% (Much faster than average) | Healthcare & Human Services 1 | Queue |
| 58 | [Medical Dosimetrists](https://www.bls.gov/ooh/healthcare/medical-dosimetrists.htm) | 29-2036 | 3,500 | $147,470 | Bachelor's degree | 5% (Faster than average) | Healthcare & Human Services 1 | Queue |

Plus the existing pathway psychology (psychologists, SOC 19-303x, OOH life/physical/social science group).

## 5. Queue (next: "continue Phase 2")

Batch 2 (next 15 by employment): radiologic & MRI technologists, dental hygienists, medical records specialists,
psychiatric technicians & aides, speech-language pathologists, occupational therapists, **physician assistants**
(+ PA license page: NCCPA PANCE + 3–5 state boards), physical therapist assistants & aides, **dentist** (pathway
roadmap), massage therapists, phlebotomists, surgical assistants & technologists, **respiratory therapists**
(+ license page: NBRC + state boards), rehabilitation counselors, diagnostic medical sonographers.

Batch 3: dietitians & nutritionists, marriage & family therapists, opticians, health education specialists,
community health workers, cardiovascular technologists, chiropractors, occupational therapy assistants & aides,
optometrists, health information technologists, medical transcriptionists, exercise physiologists, nuclear medicine
technologists, radiation therapists, recreational therapists.

Batch 4: audiologists, podiatrists, orthotists & prosthetists, genetic counselors, medical dosimetrists, **psychology**
(pathway roadmap); then decide the ties (vet techs/assistants → Agriculture phase; school counselors → Education phase).

## 6. How to add the next batch

1. Fetch each profile with headless Edge; copy Quick Facts, the three summary lines and How to Become One facts.
2. Add `ooh_qf_<k>` / `ooh_<k>` sources, the career to `careers/healthcare-human-services.yml`, and
   `{ career: <slug>, sub: … }` to `clusters.yml` (the checker enforces the crosswalk sub-cluster, `also` and `tie`).
3. New license: add it to `licenses.yml` with `page:` and `boards:` (one source per board row).
4. `node scripts/build-us-clusters.mjs`, then `check-us-data`, `check-search` (add `_data/search.yml` entries +
   cases) and `verify-site --all`.
