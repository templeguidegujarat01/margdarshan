import { P, C, src } from './_lib.mjs';

// Shared NEET steps used by MBBS / BDS / BAMS / BHMS.
const neetStep = (course, seatsNote) => P('NEET-UG exam and admission cycle', 'Class 12 year', `NEET-UG is the single national entrance for ${course}, held once a year by the NTA.`, [
  'Register on the official NEET-UG portal when applications open (usually in the first quarter of the year); fill in your Class 12 details, upload photo, signature and documents, and pay the fee.',
  'The exam is a single pen-and-paper test of 180 questions with 720 marks in Physics, Chemistry and Biology (Botany and Zoology); correct answers earn 4 marks and wrong answers lose 1 mark.',
  'The exam is held in May and results come out in June; the NTA publishes an All India Rank and a category rank.',
  'Qualifying percentile: 50th percentile for General, 40th for SC/ST/OBC and 45th for General-PwD candidates.',
  seatsNote],
  [['Exam', 'NEET-UG (NTA)'], ['Marks', '720 (180 questions)'], ['Marking', '+4 correct, −1 wrong'], ['Frequency', 'Once a year']],
  'Keep NCERT Class 11–12 Biology and Chemistry as your core; most questions come directly from them.');

export default [
C('mbbs', 'MBBS', 'MBBS — Bachelor of Medicine and Bachelor of Surgery',
  'From Class 11 PCB to a registered doctor: NEET-UG, counselling, the NMC curriculum, one-year compulsory internship and registration.',
  [['Total time', '5.5 years'], ['Entrance', 'NEET-UG'], ['Internship', '1 year (CRMI)'], ['Regulator', 'NMC']],
  [
    P('Class 11–12 subjects and eligibility', 'Class 11–12', 'Science with Physics, Chemistry, Biology and English is required.', [
      'You need Class 12 with Physics, Chemistry, Biology/Biotechnology and English from a recognised board.',
      'Minimum marks in PCB: 50% for General, 40% for SC/ST/OBC and 45% for General-PwD.',
      'The minimum age is 17 years on or before 31 December of the admission year.',
      'Choose PCB or PCMB in Class 11 so that Biology is available.'],
      [['Subjects', 'PCB + English'], ['Min. marks', '50% (General)'], ['Min. age', '17 years']]),
    neetStep('MBBS', 'Every year’s notification on the NTA site is the final authority on dates, syllabus and fees.'),
    P('Counselling and seat allotment', 'June–September', 'MCC runs counselling for 15% All India Quota and central institutes; states run counselling for their own seats.', [
      'Register on the MCC portal for 15% All India Quota seats, AIIMS-linked central universities, deemed universities and ESIC/AFMC seats, as applicable.',
      'Register separately on your state’s medical counselling portal for state quota, management and NRI seats.',
      'Counselling usually has Round 1, Round 2, Mop-up round and Stray vacancy round; choice filling and locking are done online.',
      'On allotment, report to the college with the original documents, pay the fee and complete admission before the deadline.'],
      [['AIQ', '15% seats via MCC'], ['State quota', 'State counselling'], ['Rounds', '1, 2, mop-up, stray']]),
    P('MBBS academic years (about 4.5 years)', 'Year 1–4.5', 'Three professional phases under the NMC competency-based curriculum.', [
      'Phase I (about 1 year): Foundation Course, Anatomy, Physiology and Biochemistry.',
      'Phase II (about 1.5 years): Pathology, Pharmacology, Microbiology, Forensic Medicine and Community Medicine, with early clinical exposure.',
      'Phase III Part I and Part II (about 2 years): Medicine, Surgery, Obstetrics and Gynaecology, Paediatrics, Orthopaedics, ENT, Ophthalmology, Psychiatry, Dermatology and more.',
      'University professional exams are held at the end of each phase, with theory, practical and viva components.'],
      [['Phases', 'I, II, III (Part 1 & 2)'], ['Curriculum', 'NMC CBME']]),
    P('Compulsory rotating internship and registration', 'Year 5–5.5', 'A 12-month paid internship (CRMI) in a teaching hospital, then state or NMC registration.', [
      'After passing the final MBBS exam you complete a 12-month Compulsory Rotating Medical Internship in medicine, surgery, obstetrics and gynaecology, paediatrics, community medicine and other postings.',
      'You receive a monthly stipend as per your institute and state norms.',
      'After internship you receive a provisional and then a permanent registration with the State Medical Council or the NMC.',
      'You are now a registered medical practitioner and can work as a doctor.'],
      [['Internship', '12 months, paid'], ['Registration', 'State Medical Council / NMC']]),
    P('After MBBS: PG, exams and careers', 'After internship', 'Specialise, practise or take government roles.', [
      'Postgraduate: NEET-PG for MD/MS and DNB seats; the proposed NExT (National Exit Test) may combine licensing and PG selection.',
      'Super-speciality: NEET-SS after PG.',
      'Government jobs: state medical services, ESIC, railways, armed forces and AIIMS positions.',
      'Other routes: public health, hospital administration, medical research or practice abroad through exams like USMLE or PLAB.'],
      [['PG entrance', 'NEET-PG'], ['Abroad', 'USMLE, PLAB']]),
  ], [src.neet, src.mcc, src.nmc]),

C('bds', 'BDS', 'BDS — Bachelor of Dental Surgery',
  'The dental route: NEET-UG, counselling, four years of study, one-year internship and registration with your State Dental Council.',
  [['Total time', '5 years'], ['Entrance', 'NEET-UG'], ['Internship', '1 year'], ['Regulator', 'DCI / NMC framework']],
  [
    P('Class 11–12 and eligibility', 'Class 11–12', 'PCB with English; minimum percentages match the medical courses.', [
      'You need Class 12 with Physics, Chemistry, Biology and English.',
      'Minimum PCB marks: 50% General, 40% SC/ST/OBC, 45% General-PwD.',
      'You must be 17 years old by 31 December of the admission year.',
      'BDS has a smaller number of seats than MBBS, so plan for NEET score strategy early.'],
      [['Subjects', 'PCB + English'], ['Min. age', '17 years']]),
    neetStep('BDS', 'BDS seats are allotted through the MCC for All India Quota and by state counselling for the rest.'),
    P('Counselling and college choice', 'June–September', 'Choose a government or private dental college through counselling.', [
      'Register on MCC and your state’s portal and lock your choices after comparing fees and hospital patient load.',
      'Check that the college is recognised by the Dental Council of India and the state dental body.',
      'Clinical patient volume matters, since you must treat patients during training.',
      'Report with originals and pay fees by the deadline.'],
      [['Counselling', 'MCC + state'], ['Check', 'DCI recognition']]),
    P('Four years of BDS', 'Year 1–4', 'Pre-clinical and clinical dentistry across four professional years.', [
      'Year 1: General Anatomy, Physiology, Biochemistry, Dental Anatomy, Histology and Dental Materials.',
      'Year 2: Pathology, Microbiology, Pharmacology, and General Medicine in a dental context.',
      'Year 3: Oral Pathology, Periodontology, Conservative Dentistry, Oral Medicine and Radiology.',
      'Year 4: Oral and Maxillofacial Surgery, Orthodontics, Prosthodontics, Paedodontics and Public Health Dentistry, with live clinical work.'],
      [['Professional years', '4'], ['Exams', 'University theory, practical, viva']]),
    P('Compulsory internship and registration', 'Year 5', 'One year of rotating clinical internship, then dental council registration.', [
      'The internship is a one-year compulsory rotating programme in dental departments and community outreach.',
      'You receive a stipend as set by the institution.',
      'After the internship you register with the State Dental Council to practise.',
      'You may start your own clinic or join a hospital.'],
      [['Internship', '12 months'], ['Registration', 'State Dental Council']]),
    P('After BDS', 'After internship', 'Specialise, practise or choose related careers.', [
      'MDS entrance: NEET-MDS for specialisation in orthodontics, oral surgery, endodontics, prosthodontics and more.',
      'Government dental surgeon jobs through state public service commissions and armed forces dental corps.',
      'Private practice, dental hospital chains and teaching are common.',
      'Other options: public health, dental research and dental materials industry.'],
      [['PG entrance', 'NEET-MDS']]),
  ], [src.neet, src.mcc, src.dci]),

C('bams', 'BAMS', 'BAMS — Bachelor of Ayurvedic Medicine and Surgery',
  'The Ayurveda doctor route: NEET-UG, AYUSH counselling, professional years, internship and registration.',
  [['Total time', '5.5 years'], ['Entrance', 'NEET-UG'], ['Internship', '1 year'], ['Regulator', 'NCISM']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'PCB with English; Sanskrit helps but is not mandatory.', [
      'Class 12 with Physics, Chemistry and Biology is required.',
      'Minimum marks are the same as other NEET courses (50% General, 40% reserved categories).',
      'Age requirement is 17 years by 31 December of the admission year.',
      'Some colleges offer an introductory Sanskrit bridge for students who never studied it.'],
      [['Subjects', 'PCB + English'], ['Sanskrit', 'Not mandatory']]),
    neetStep('BAMS', 'AYUSH seats are allotted through AACCC (for All India Quota and central institutions) and state AYUSH counselling.'),
    P('AYUSH counselling', 'July–October', 'AACCC conducts counselling for 15% AIQ seats; states conduct the rest.', [
      'Register on the AYUSH Admissions Central Counselling Committee portal for All India Quota and central university seats.',
      'Register on your state’s AYUSH counselling portal for state quota seats.',
      'Counselling has multiple rounds; choose and lock options carefully.',
      'Confirm admission at the college with original documents and fees.'],
      [['AIQ', '15% via AACCC'], ['State', 'State AYUSH counselling']]),
    P('Four and a half years of study', 'Year 1–4.5', 'Three professional years covering Ayurvedic principles and modern medical sciences.', [
      'First Professional: Sanskrit, Padartha Vigyan, Sharir Rachana (anatomy), Sharir Kriya (physiology) and Ayurveda Itihas.',
      'Second Professional: Dravyaguna, Rasashastra and Bhaishajya Kalpana, Roga Nidana and Agada Tantra.',
      'Third Professional: Kayachikitsa, Shalya Tantra, Shalakya Tantra, Prasuti and Stri Roga, Kaumarbhritya and Panchakarma.',
      'Modern subjects such as Pathology and Pharmacology are included at an introductory level.'],
      [['Professional years', '3'], ['Academic duration', '4.5 years']]),
    P('One-year internship and registration', 'Year 5.5', 'Rotating internship in hospitals, then registration with the state Ayurveda board.', [
      'You complete a one-year compulsory internship in Ayurveda hospitals and community health centres.',
      'After the internship, register with the State Board or Council of Ayurveda to practise.',
      'You can work in Ayurveda hospitals, government AYUSH centres or start a clinic.',
      'Practice rights follow NCISM rules and state laws, so check them in your state.'],
      [['Internship', '12 months'], ['Registration', 'State Ayurveda board']]),
    P('After BAMS', 'After internship', 'Postgraduate, government and wellness careers.', [
      'MD/MS (Ayurveda): AIAPGET is the national entrance for AYUSH postgraduate seats.',
      'Government jobs: Medical Officer (AYUSH) in state and central services.',
      'Private careers: Panchakarma clinics, wellness resorts, herbal pharma companies and research.',
      'Academic route: teaching in Ayurveda colleges after MD/MS.'],
      [['PG entrance', 'AIAPGET']]),
  ], [src.neet, src.ncism, ['AYUSH counselling (AACCC)', 'https://aaccc.gov.in/']]),

C('bhms', 'BHMS', 'BHMS — Bachelor of Homeopathic Medicine and Surgery',
  'NEET-UG to homeopathy doctor: AYUSH counselling, four and a half years of study, one-year internship and registration.',
  [['Total time', '5.5 years'], ['Entrance', 'NEET-UG'], ['Internship', '1 year'], ['Regulator', 'NCH']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'PCB with English; strong biology basics.', [
      'You need Class 12 with Physics, Chemistry, Biology and English.',
      'Minimum marks are 50% General and 40% reserved categories in PCB.',
      'Age of 17 years by 31 December of the admission year.',
      'Understand the principles of homeopathy before choosing the course.'],
      [['Subjects', 'PCB + English']]),
    neetStep('BHMS', 'AYUSH counselling decides seats at homeopathy colleges, so keep an eye on the AACCC and state schedules.'),
    P('AYUSH counselling', 'July–October', 'Central AACCC and state counselling allot BHMS seats.', [
      'Register on AACCC for All India Quota and central institutions.',
      'Register on your state portal for state quota seats.',
      'Shortlist colleges recognised by the National Commission for Homoeopathy.',
      'Complete admission with documents and fees by the deadline.'],
      [['Counselling', 'AACCC + state']]),
    P('Four and a half years of study', 'Year 1–4.5', 'Homeopathic principles, materia medica and modern medicine.', [
      'First year: Anatomy, Physiology, Organon of Medicine and Homoeopathic Pharmacy.',
      'Second year: Pathology, Microbiology, Forensic Medicine and Materia Medica.',
      'Third and fourth years: Practice of Medicine, Surgery, Obstetrics and Gynaecology, Repertory and Case Taking.',
      'You learn to take detailed case histories and choose remedies according to homeopathic principles.'],
      [['Professional years', '3–4'], ['Subjects', 'Organon, Materia Medica, Repertory']]),
    P('Internship and registration', 'Year 5.5', 'One year of clinical internship, then state registration.', [
      'A compulsory one-year internship in a homeopathic hospital and community postings.',
      'After the internship you register with the State Board of Homoeopathy or the Central Council.',
      'You may practise in clinics, government dispensaries or hospitals.',
      'Check state rules regarding practice rights.'],
      [['Internship', '12 months']]),
    P('After BHMS', 'After internship', 'Postgraduate and career paths.', [
      'MD (Homoeopathy): AIAPGET and state entrance exams for PG.',
      'Government Medical Officer posts in AYUSH departments.',
      'Private clinics, pharmaceutical roles and teaching.',
      'Research in homeopathy through universities and research councils.'],
      [['PG entrance', 'AIAPGET']]),
  ], [src.neet, src.nch, ['AYUSH counselling (AACCC)', 'https://aaccc.gov.in/']]),

C('bpharm', 'B.Pharm', 'B.Pharm — Bachelor of Pharmacy',
  'Class 12 to registered pharmacist: eligibility, entrance cycles, eight semesters, training and licensing.',
  [['Total time', '4 years'], ['Entrance', 'State CETs / CUET / merit'], ['Regulator', 'PCI'], ['Registration', 'State Pharmacy Council']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'Physics and Chemistry with Maths or Biology.', [
      'Take PCM or PCB in Class 11–12.',
      'PCI requires Class 12 pass with Physics, Chemistry and Maths/Biology (minimum marks as per the state).',
      'Maths is not compulsory in most states, so both PCB and PCM students can enter.',
      'Check your state’s rules for the best-fit subject combination.'],
      [['Subjects', 'PCM or PCB'], ['Regulator', 'Pharmacy Council of India']]),
    P('Entrance exams and admission', 'After Class 12', 'Admission through state CETs, CUET-UG or merit.', [
      'Take a state entrance such as MHT-CET, KCET, GUJCET, AP/TS EAPCET or relevant state tests.',
      'Some universities admit through CUET-UG or Class 12 merit.',
      'State counselling or university admission portals run the allotment rounds.',
      'Choose a college approved by PCI and AICTE.'],
      [['Exams', 'State CETs, CUET-UG']]),
    P('Eight semesters of pharmacy', 'Year 1–4', 'Pharmaceutics, pharmaceutical chemistry, pharmacology and pharmacognosy.', [
      'Year 1: Human Anatomy and Physiology, Pharmaceutical Analysis, Pharmaceutics and Organic Chemistry.',
      'Year 2: Biochemistry, Pathophysiology, Pharmacology, Pharmaceutical Microbiology.',
      'Year 3: Medicinal Chemistry, Industrial Pharmacy, Pharmacology II and Pharmacognosy.',
      'Year 4: Biopharmaceutics, Pharmacy Practice, Novel Drug Delivery, Regulatory Science, with electives and a project.'],
      [['Semesters', '8'], ['Practicals', 'Lab-based in every semester']]),
    P('Industrial training and practice', 'Year 3–4', 'Hospital, industry and community exposure.', [
      'Complete industrial or hospital training as required by the university.',
      'Learn GMP, quality control and regulatory basics in industry visits.',
      'Do a final-year project in formulation, analysis or practice.',
      'Participate in pharmacovigilance and clinical research workshops.'],
      [['Training', 'Industrial and hospital']]),
    P('Registration, M.Pharm and careers', 'After B.Pharm', 'Register as a pharmacist, study further or join industry.', [
      'Register with the State Pharmacy Council to practise as a pharmacist.',
      'M.Pharm entrance: GPAT conducted by the NTA, and for Pharm.D options.',
      'Jobs: pharma production, QA/QC, clinical research, regulatory affairs, hospital pharmacy and drug inspector roles.',
      'Government: drug inspector exams, hospital pharmacist posts and pharma PSUs.'],
      [['PG entrance', 'GPAT']]),
  ], [src.pci, src.nta]),

C('bpt', 'BPT', 'BPT — Bachelor of Physiotherapy',
  'The physiotherapy route: eligibility, admission, four years plus internship, and registration.',
  [['Total time', '4.5 years'], ['Entry', 'NEET-UG / CUET / merit (state-wise)'], ['Internship', '6 months'], ['Registration', 'State council / NCAHP']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'PCB with English is the standard requirement.', [
      'You need Class 12 with Physics, Chemistry, Biology and English in most states.',
      'Minimum marks are typically 50% (as notified).',
      'Choose PCB in Class 11.',
      'Develop good communication, patience and fitness awareness.'],
      [['Subjects', 'PCB + English']]),
    P('Admission process', 'After Class 12', 'Merit, NEET-UG or CUET-UG depending on your state or university.', [
      'Check whether your state uses NEET-UG scores, CUET-UG or Class 12 marks.',
      'Register on the state counselling or university portal.',
      'Choose colleges recognised by the state and national allied health authorities.',
      'Confirm admission by paying fees and submitting documents.'],
      [['Routes', 'NEET-UG, CUET-UG, merit']]),
    P('Four years of study', 'Year 1–4', 'Anatomy, physiology, biomechanics and clinical physiotherapy.', [
      'Year 1: Anatomy, Physiology, Biochemistry, Psychology and Sociology.',
      'Year 2: Pathology, Pharmacology, Exercise Therapy, Electrotherapy and Biomechanics.',
      'Year 3: Orthopaedics, Neurology, Cardiopulmonary and Sports physiotherapy.',
      'Year 4: Community physiotherapy, Rehabilitation, Research methods and supervised clinical practice.'],
      [['Years', '4'], ['Clinicals', 'Hospital postings']]),
    P('Internship', 'Year 4.5', 'Six months to one year of supervised clinical practice.', [
      'Complete a rotating internship in orthopaedics, neurology, paediatrics and cardiopulmonary units.',
      'Handle patients under supervision and maintain case logs.',
      'Prepare a case study report where required.',
      'Internship completion is required for your degree and registration.'],
      [['Internship', 'About 6 months']]),
    P('Registration and career', 'After internship', 'Register and choose a specialisation.', [
      'Register with the state physiotherapy council or the relevant national body to practise.',
      'Master’s in Physiotherapy (MPT) in orthopaedics, neurology, sports or cardiopulmonary.',
      'Jobs: hospitals, rehab centres, sports teams, wellness clinics and private practice.',
      'Teaching and research roles after MPT.'],
      [['Further study', 'MPT, PhD']]),
  ], [src.ncs, src.nta]),

C('nursing', 'Nursing', 'Nursing — BSc Nursing, GNM and ANM',
  'The nursing routes after Class 12: BSc Nursing, GNM and ANM, with registration and career steps.',
  [['BSc Nursing', '4 years'], ['GNM', '3.5 years'], ['ANM', '2 years'], ['Regulator', 'INC']],
  [
    P('Class 11–12 subjects', 'Class 11–12', 'PCB with English is required for BSc Nursing.', [
      'BSc Nursing requires Class 12 PCB and English with at least 45% marks (as notified).',
      'GNM requires Class 12 pass with English; Science is preferred by many institutes.',
      'ANM is open after Class 12 in most states.',
      'Choose PCB in Class 11 if you plan to enter BSc Nursing.'],
      [['BSc Nursing', 'PCB + English'], ['GNM / ANM', 'Class 12 pass']]),
    P('Entrance exams and admission', 'After Class 12', 'State CETs, NEET-UG or CUET-UG depending on state and institute.', [
      'Several states use their own nursing entrance or NEET-UG scores.',
      'Central institutions use CUET-UG or their own tests; AIIMS uses a national entrance.',
      'Apply through state counselling or institution portals.',
      'Check that the college is recognised by the Indian Nursing Council.'],
      [['Exams', 'State CET, NEET-UG, CUET-UG']]),
    P('Course structure', 'Year 1–4', 'Foundation, medical-surgical, community health and midwifery.', [
      'BSc Nursing (4 years): Anatomy, Physiology, Nutrition, Fundamentals of Nursing, Medical-Surgical Nursing, Child Health, Mental Health, Community Health and Midwifery.',
      'GNM (3.5 years): theory with clinical postings in medical, surgical, obstetric and community settings.',
      'ANM (2 years): community health, maternal and child health and primary care.',
      'Clinical placements are an essential part of every year.'],
      [['Clinical', 'Hospital postings each year']]),
    P('Internship and registration', 'Final year', 'Complete the internship and register with the State Nursing Council.', [
      'BSc Nursing includes a compulsory internship in the final year.',
      'GNM includes a six-month internship after the three-year course.',
      'Register with your State Nursing Council to work as a nurse.',
      'Registration is mandatory for government and private hospitals.'],
      [['Registration', 'State Nursing Council']]),
    P('Careers and higher study', 'After qualification', 'Hospital jobs, government exams and PG.', [
      'Jobs: staff nurse, ICU nurse, community health nurse and nursing officer.',
      'Government exams: AIIMS NORCET, ESIC and state recruitment exams.',
      'Study further: MSc Nursing, post-basic BSc or specialty diplomas.',
      'International routes: NCLEX (USA), IELTS-based routes for the UK and the Gulf.'],
      [['Exams', 'AIIMS NORCET, NCLEX']]),
  ], [src.inc, src.ncs]),

C('gnm-nursing', 'GNM', 'GNM — General Nursing and Midwifery',
  'GNM roadmap: eligibility, admission, three years of training, six-month internship and registration.',
  [['Total time', '3.5 years'], ['Entry', 'Class 12 pass'], ['Internship', '6 months'], ['Regulator', 'INC']],
  [
    P('Class 11–12 and eligibility', 'Class 11–12', 'Class 12 with English; Science is preferred.', [
      'Most states accept Class 12 pass students in any stream with English.',
      'Some states prefer Science students.',
      'Minimum marks are typically 40–50%.',
      'Check INC and state nursing council rules.'],
      [['Streams', 'Any (Science preferred)']]),
    P('Admission process', 'After Class 12', 'State-level entrance or merit-based admission.', [
      'Apply through state nursing or paramedical boards.',
      'Take the state entrance, if conducted.',
      'Select an INC-recognised school of nursing.',
      'Pay fees and complete verification.'],
      [['Route', 'State entrance or merit']]),
    P('Three years of training', 'Year 1–3', 'Theory and clinical nursing.', [
      'Year 1: Biological Sciences, Behavioural Sciences, Fundamentals of Nursing, Community Health.',
      'Year 2: Medical-Surgical Nursing, Mental Health and Child Health.',
      'Year 3: Midwifery and Gynaecological Nursing and Community Health Nursing.',
      'Clinical rotations in hospitals run in parallel.'],
      [['Years', '3'], ['Clinical', 'Hospital rotations']]),
    P('Internship', 'Year 3.5', 'Six months of supervised internship.', [
      'Complete the six-month internship in hospital wards, labour rooms and community health areas.',
      'Maintain logbooks and clinical competency records.',
      'Take the final examination under the State Nursing Council.',
      'Collect internship certificate.'],
      [['Internship', '6 months']]),
    P('Registration and career', 'After internship', 'Register and start working.', [
      'Register with the State Nursing Council.',
      'Jobs: staff nurse, midwife, community nurse.',
      'Further study: Post Basic BSc Nursing and specialty certificate courses.',
      'Government nursing recruitment exams are open to GNM holders.'],
      [['Further study', 'Post Basic BSc Nursing']]),
  ], [src.inc, src.ncs]),

C('optometry', 'Optometry', 'Optometry — B.Optom / BSc Optometry',
  'From Class 12 to a registered optometrist: admission, four years including internship, and career routes.',
  [['Total time', '4 years'], ['Entry', 'CUET / state entrance / merit'], ['Internship', '1 year'], ['Subjects', 'PCB or PCM']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'Science with Physics, Chemistry and Biology or Maths.', [
      'Most colleges require Class 12 Science (PCB or PCM) with English.',
      'Minimum marks of 50% are common.',
      'Optics in Class 12 Physics is useful preparation.',
      'Develop good communication and attention to detail.'],
      [['Subjects', 'PCB or PCM']]),
    P('Entrance and admission', 'After Class 12', 'CUET-UG, state entrance or merit.', [
      'Apply via university admission portals.',
      'Entrance exams vary by state and institution; some use CUET-UG.',
      'Attend counselling and choose a recognised college.',
      'Verify documents and pay fees.'],
      [['Routes', 'CUET-UG, state entrance, merit']]),
    P('Three years of academics', 'Year 1–3', 'Ocular anatomy, optics, clinical optometry and contact lenses.', [
      'Year 1: Anatomy, Physiology, Geometrical and Physical Optics, Biochemistry.',
      'Year 2: Visual Optics, Ocular Disease, Optometric Instruments and Clinical Optometry.',
      'Year 3: Contact Lenses, Low Vision, Binocular Vision, Paediatric Optometry and Community Optometry.',
      'Practical lab sessions and clinical exposure run through the course.'],
      [['Years', '3 + internship']]),
    P('One-year clinical internship', 'Year 4', 'Supervised patient care in eye hospitals.', [
      'Rotate through refraction, contact lens, low vision and ophthalmology clinics.',
      'See patients under supervision and maintain a case log.',
      'Complete the internship before your degree is awarded.',
      'Learn eyewear dispensing and counselling skills.'],
      [['Internship', '12 months']]),
    P('Registration and career', 'After internship', 'Practice or study further.', [
      'Register with the relevant state or national allied-health body where required.',
      'Jobs: optometrist, eye hospital clinician, optical retail manager and contact-lens specialist.',
      'Higher study: M.Optom, MBA in healthcare or Public health.',
      'Entrepreneurship: eye clinics and optical stores.'],
      [['Further study', 'M.Optom']]),
  ], [src.cuet, src.ncs]),

C('occupational-therapy', 'Occupational Therapy', 'Occupational Therapy — BOT',
  'The occupational therapy route: eligibility, admission, course structure, internship and registration.',
  [['Total time', '4.5 years'], ['Entry', 'NEET-UG / CUET / merit'], ['Internship', '6 months'], ['Focus', 'Rehabilitation']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'PCB with English is the usual requirement.', [
      'Choose PCB in Class 11–12.',
      'Minimum marks are typically 50%.',
      'Empathy, patience and communication skills matter.',
      'Learn about occupational therapy in paediatrics, mental health and orthopaedics.'],
      [['Subjects', 'PCB + English']]),
    P('Admission process', 'After Class 12', 'State counselling, NEET-UG, CUET-UG or merit.', [
      'Check your state’s route for allied health courses.',
      'Apply through the counselling portal or university.',
      'Choose a recognised college with a good clinical setup.',
      'Complete document verification and fee payment.'],
      [['Routes', 'NEET-UG, CUET-UG, merit']]),
    P('Four years of study', 'Year 1–4', 'Anatomy, kinesiology, therapeutic activities and clinical OT.', [
      'Year 1: Anatomy, Physiology, Psychology and Sociology.',
      'Year 2: Kinesiology, Therapeutic Activities, Pathology and Orthopaedics.',
      'Year 3: Neurology, Paediatrics, Mental health and Community OT.',
      'Year 4: Advanced clinical OT, Assistive technology, Research and supervised clinical postings.'],
      [['Years', '4']]),
    P('Clinical internship', 'Year 4.5', 'Six months supervised work in hospitals and rehab centres.', [
      'Rotate through paediatric, neurological, orthopaedic and psychiatric OT.',
      'Treat patients under supervision.',
      'Prepare case reports and a logbook.',
      'Complete the internship for degree award.'],
      [['Internship', '6 months']]),
    P('Registration and career', 'After internship', 'Practice or specialise.', [
      'Register with the state or national allied health body as required.',
      'Jobs: hospitals, rehab centres, special schools and mental health centres.',
      'Higher study: MOT in paediatrics, neurology, mental health or hand therapy.',
      'Private practice and community-based rehabilitation work are also options.'],
      [['Further study', 'MOT']]),
  ], [src.ncs, src.nta]),

C('audiology-speech-therapy', 'Audiology & Speech Therapy', 'BASLP — Audiology and Speech-Language Pathology',
  'The BASLP route: eligibility, entrance, four years, internship and RCI registration.',
  [['Total time', '4 years'], ['Entry', 'CUET-UG / institute entrance'], ['Internship', '1 year'], ['Regulator', 'RCI']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'Science with Physics, Chemistry and Biology or Maths.', [
      'Most programmes require Class 12 Science (PCB or PCM) with English.',
      'Minimum marks are usually 50%.',
      'Good communication and listening skills are essential.',
      'Look at institutes recognised by the Rehabilitation Council of India (RCI).'],
      [['Subjects', 'PCB or PCM']]),
    P('Entrance and admission', 'After Class 12', 'Institute entrances and CUET-UG.', [
      'Leading institutes like AIISH Mysuru and others conduct their own admission tests or use CUET-UG scores.',
      'Check each institute’s notification for eligibility and dates.',
      'Attend counselling and choose an RCI-recognised college.',
      'Verify documents and pay fees.'],
      [['Routes', 'CUET-UG, institute tests']]),
    P('Three years of academics', 'Year 1–3', 'Anatomy of speech and hearing, audiology and speech-language pathology.', [
      'Year 1: Anatomy and Physiology of speech and hearing, Acoustics, Linguistics.',
      'Year 2: Audiological Assessment, Speech and Language Disorders, Hearing Aids.',
      'Year 3: Voice and Fluency Disorders, Paediatric Audiology, Neurogenic Disorders and Cochlear Implants.',
      'Clinical practicum runs alongside theory.'],
      [['Years', '3 + internship']]),
    P('One-year clinical internship', 'Year 4', 'Supervised clinical work in hospitals and clinics.', [
      'Assess hearing, fit hearing aids and treat speech and language disorders under supervision.',
      'Maintain a clinical logbook.',
      'Rotate through audiology, speech therapy, paediatric and adult clinics.',
      'Finish the internship before degree award.'],
      [['Internship', '12 months']]),
    P('RCI registration and careers', 'After internship', 'Register with RCI to practise.', [
      'RCI registration (CRR number) is mandatory to practise in India.',
      'Jobs: audiologist, speech-language pathologist, special educator support and hearing-aid specialist.',
      'Higher study: MASLP, PhD.',
      'Work settings include hospitals, schools and private clinics.'],
      [['Registration', 'RCI (CRR)']]),
  ], [['Rehabilitation Council of India', 'https://rehabcouncil.nic.in/'], src.cuet]),

C('nutrition-dietetics', 'Nutrition & Dietetics', 'Nutrition and Dietetics',
  'The dietitian route: eligibility, course, clinical internship and registration.',
  [['Total time', '3–4 years + optional MSc'], ['Entry', 'CUET / merit'], ['Internship', 'Dietetic internship'], ['Registration', 'Via IDA']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'Science with Biology and Chemistry is preferred.', [
      'Most colleges require Class 12 Science (PCB).',
      'Some institutes accept other streams with biology or home science.',
      'Minimum marks are usually 50%.',
      'Basic cooking and health awareness is helpful.'],
      [['Subjects', 'PCB preferred']]),
    P('Admission process', 'After Class 12', 'CUET-UG or merit at universities and colleges.', [
      'Apply through the university or college portal.',
      'CUET-UG is used by some universities for BSc Nutrition.',
      'Check colleges with hospital tie-ups for dietetic internships.',
      'Complete admission formalities.'],
      [['Routes', 'CUET-UG or merit']]),
    P('Three to four years of study', 'Year 1–4', 'Biochemistry, human nutrition, clinical nutrition and food science.', [
      'Year 1: Human Physiology, Biochemistry, Food Science and Basic Nutrition.',
      'Year 2: Normal and Therapeutic Nutrition, Community Nutrition, Food Microbiology.',
      'Year 3: Clinical Dietetics, Nutrition in Disease, Food Service Management and Research Methods.',
      'Year 4 (where offered): Advanced dietetics, dissertation and extended internship.'],
      [['Years', '3–4']]),
    P('Dietetic internship', 'Final year', 'Hospital-based training for clinical dietetics.', [
      'Complete a supervised internship of about six months in a hospital dietetics department.',
      'Plan diets for inpatients, outpatients and special conditions.',
      'Practice counselling and case documentation.',
      'This is required to become a registered dietitian.'],
      [['Internship', 'About 6 months']]),
    P('Registration, MSc and careers', 'After graduation', 'Register as a dietitian and choose a specialisation.', [
      'Register with the Indian Dietetic Association (IDA) and take its registration exam where applicable.',
      'MSc Nutrition or Dietetics and sports nutrition courses.',
      'Jobs: hospital dietitian, community nutritionist, food industry and fitness industry.',
      'Private practice and online counselling are growing options.'],
      [['Registration', 'IDA']]),
  ], [['Indian Dietetic Association', 'https://www.idaindia.com/'], src.cuet]),

C('medical-laboratory-technology', 'Medical Laboratory Technology', 'Medical Laboratory Technology — BMLT / DMLT',
  'The MLT routes: DMLT (2 years) and BMLT (3 years plus internship), with registration and career steps.',
  [['BMLT', '3 years + internship'], ['DMLT', '2 years'], ['Entry', 'Class 12 Science'], ['Next', 'MSc MLT']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'PCB is preferred.', [
      'Take PCB in Class 11–12 for BMLT and most DMLT courses.',
      'Minimum marks usually 40–50%.',
      'Some DMLT courses accept Class 10 pass students.',
      'Basic lab awareness is helpful.'],
      [['Subjects', 'PCB']]),
    P('Admission process', 'After Class 12', 'Merit or entrance by state or university.', [
      'Apply through state paramedical councils or the university.',
      'CUET-UG is used by some central and private universities.',
      'Choose colleges with good laboratory facilities and hospital tie-ups.',
      'Verify documents and pay fees.'],
      [['Routes', 'Merit, CUET-UG']]),
    P('Course structure', 'Year 1–3', 'Pathology, microbiology and biochemistry practicals.', [
      'Year 1: Anatomy, Physiology, Biochemistry and Basic Lab Techniques.',
      'Year 2: Haematology, Microbiology, Clinical Pathology and Blood Banking.',
      'Year 3 (BMLT): Histopathology, Immunology, Molecular Diagnostics and Lab Management.',
      'DMLT covers these topics in a condensed two-year format.'],
      [['BMLT', '3 years'], ['DMLT', '2 years']]),
    P('Internship and lab training', 'Final year', 'Hands-on work in diagnostic labs and hospitals.', [
      'Complete the internship of 6 months in a hospital or diagnostic lab.',
      'Learn sample collection, testing, quality control and reporting.',
      'Maintain a logbook.',
      'Learn lab safety and biomedical waste handling.'],
      [['Internship', '6 months']]),
    P('Registration and careers', 'After the course', 'Register and start working.', [
      'Register with the state paramedical council where required.',
      'Jobs: lab technician, pathology lab assistant, blood bank technician and research assistant.',
      'Higher study: MSc MLT, MSc Microbiology or public health.',
      'Government lab technician posts through state recruitment.'],
      [['Further study', 'MSc MLT']]),
  ], [src.ncs, src.cuet]),

C('dmlt', 'DMLT', 'DMLT — Diploma in Medical Laboratory Technology',
  'The two-year DMLT roadmap: eligibility, admission, training, internship and next steps.',
  [['Total time', '2 years'], ['Entry', 'Class 12 Science'], ['Internship', 'Lab training'], ['Next', 'BMLT lateral entry']],
  [
    P('Class 10–12 eligibility', 'Class 10–12', 'Class 12 Science (PCB) is standard; some institutes accept Class 10.', [
      'Most DMLT programmes need Class 12 with Physics, Chemistry and Biology.',
      'Some state boards offer DMLT after Class 10 as well.',
      'Minimum marks are typically 40–50%.',
      'Choose a recognised institute.'],
      [['Subjects', 'PCB']]),
    P('Admission process', 'After Class 12', 'Merit-based admission through state councils.', [
      'Apply to the state paramedical board or institute.',
      'Submit marksheets and documents.',
      'Pay fees to confirm the seat.',
      'Check that the institute is state-recognised.'],
      [['Route', 'Merit-based']]),
    P('Two years of training', 'Year 1–2', 'Lab techniques, haematology, biochemistry and microbiology.', [
      'Year 1: Anatomy, Physiology, Basic Biochemistry and Lab Techniques.',
      'Year 2: Haematology, Clinical Pathology, Microbiology and Blood Banking.',
      'Practical sessions in the lab form a significant part of the course.',
      'Written and practical exams are held at the end of each year.'],
      [['Years', '2']]),
    P('Practical training', 'Final months', 'Work in hospital or diagnostic labs.', [
      'Complete an internship in a hospital lab.',
      'Learn sample handling, testing and reporting.',
      'Learn infection control and quality assurance.',
      'Obtain a training certificate.'],
      [['Training', 'Hospital lab']]),
    P('Jobs and further study', 'After DMLT', 'Work or upgrade to BMLT.', [
      'Jobs: lab technician, collection centre technician, assistant in hospitals and diagnostic chains.',
      'Lateral entry into BMLT is available in some universities.',
      'Government recruitment includes lab technician posts.',
      'Experience and certifications improve career growth.'],
      [['Upgrade', 'BMLT lateral entry']]),
  ], [src.ncs, src.skill]),

C('radiology-imaging-technology', 'Radiology & Imaging Technology', 'Radiology and Imaging Technology',
  'The radiology technologist route: eligibility, admission, BSc or diploma, clinical training and safety certification.',
  [['BSc', '3–4 years'], ['Diploma', '2 years'], ['Entry', 'Class 12 Science'], ['Safety', 'AERB rules']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'PCB or PCM is generally required.', [
      'Choose Science in Class 11–12.',
      'Minimum marks are usually 45–50%.',
      'Understand the basics of radiation and its safe use.',
      'Develop patient-care and technical skills.'],
      [['Subjects', 'PCB or PCM']]),
    P('Admission process', 'After Class 12', 'Merit, CUET-UG or state admission.', [
      'Apply through the university or college portal.',
      'Check recognised colleges with hospital tie-ups.',
      'Complete documentation.',
      'Pay fees to confirm admission.'],
      [['Routes', 'Merit or CUET-UG']]),
    P('Course structure', 'Year 1–3', 'Imaging physics, anatomy and modality-specific technology.', [
      'Year 1: Anatomy, Physiology, Radiation Physics and Patient Care.',
      'Year 2: X-ray technology, Radiographic Positioning, Ultrasound and CT basics.',
      'Year 3: MRI, Advanced CT, Mammography, Nuclear Medicine basics and Radiation Protection.',
      'Diploma programmes cover core X-ray technology in two years.'],
      [['Modalities', 'X-ray, CT, MRI, ultrasound']]),
    P('Clinical training', 'Final year', 'Hospital internship in imaging departments.', [
      'Rotate through X-ray, CT, MRI and ultrasound units.',
      'Learn patient positioning and protocol under supervision.',
      'Follow radiation safety rules and dosimetry practices.',
      'Maintain a clinical logbook.'],
      [['Internship', '6–12 months']]),
    P('Safety certification and careers', 'After the course', 'Work in diagnostic imaging.', [
      'Radiation safety officer roles require certification through the Atomic Energy Regulatory Board (AERB).',
      'Jobs: radiographer, CT/MRI technologist, ultrasound assistant and imaging centre technician.',
      'Higher study: MSc in medical imaging technology.',
      'Government jobs in hospitals and ESIC.'],
      [['Regulator', 'AERB']]),
  ], [['AERB', 'https://www.aerb.gov.in/'], src.ncs]),

C('diploma-pharmacy', 'D.Pharm', 'D.Pharm — Diploma in Pharmacy',
  'The two-year D.Pharm route: eligibility, admission, course, practical training and pharmacist registration.',
  [['Total time', '2 years + practical training'], ['Entry', 'Class 12 Science'], ['Regulator', 'PCI'], ['Registration', 'State Pharmacy Council']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'Physics and Chemistry with Biology or Maths.', [
      'Class 12 with Physics, Chemistry and Biology or Maths is required.',
      'Minimum marks are typically 50% (as per PCI).',
      'Choose PCB or PCM.',
      'Understand the basics of medicines and healthcare.'],
      [['Subjects', 'PCB or PCM']]),
    P('Admission process', 'After Class 12', 'State-level counselling or merit lists.', [
      'Apply via the state technical education or pharmacy board portal.',
      'Choose PCI-approved institutes.',
      'Merit lists use Class 12 marks.',
      'Complete verification and pay fees.'],
      [['Route', 'State merit/counselling']]),
    P('Two years of study', 'Year 1–2', 'Pharmaceutics, pharmacology and pharmacy practice.', [
      'Year 1: Pharmaceutics, Pharmaceutical Chemistry, Pharmacognosy, Biochemistry and Human Anatomy and Physiology.',
      'Year 2: Pharmacology, Community Pharmacy, Pharmacotherapeutics, Hospital Pharmacy and Jurisprudence.',
      'Practicals form a significant portion of the learning.',
      'University or board examinations are held each year.'],
      [['Years', '2']]),
    P('Practical training', 'After Year 2', 'About three months or 500 hours of hospital or community training.', [
      'Complete the mandatory practical training in a hospital or community pharmacy.',
      'Learn dispensing, counselling and inventory management.',
      'Maintain the training record.',
      'Complete the training before registration.'],
      [['Training', 'About 500 hours / 3 months']]),
    P('Registration and careers', 'After training', 'Register as a pharmacist.', [
      'Register with the State Pharmacy Council to practise as a pharmacist.',
      'Open a retail pharmacy, subject to licence rules.',
      'Jobs: hospital pharmacist, medical store, pharma production assistant.',
      'Upgrade through B.Pharm lateral entry.'],
      [['Upgrade', 'B.Pharm lateral entry']]),
  ], [src.pci, src.ncs]),

C('diploma-radiography', 'Diploma in Radiography', 'Diploma in Radiography (X-Ray Technology)',
  'The two-year diploma route: eligibility, admission, course, clinical training and certification.',
  [['Total time', '2 years'], ['Entry', 'Class 12 Science'], ['Training', 'Hospital internship'], ['Safety', 'AERB rules']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'PCB or PCM is generally required.', [
      'Class 12 Science with Physics is important.',
      'Minimum marks are usually 40–50%.',
      'Some institutes accept other streams, so check.',
      'Learn the basics of anatomy and radiation.'],
      [['Subjects', 'PCB or PCM']]),
    P('Admission process', 'After Class 12', 'Merit or state paramedical entrance.', [
      'Apply to the state paramedical board or institute.',
      'Check recognition of the institute.',
      'Submit documents.',
      'Pay fees and confirm.'],
      [['Route', 'Merit-based']]),
    P('Two years of training', 'Year 1–2', 'Radiographic anatomy, positioning and X-ray technology.', [
      'Year 1: Anatomy, Physiology, Radiation Physics, Patient Care.',
      'Year 2: Radiographic Techniques, Positioning, Darkroom/Digital imaging, Radiation Protection.',
      'Practical sessions form a significant portion.',
      'Final exams cover theory and practical skills.'],
      [['Years', '2']]),
    P('Clinical internship', 'Final months', 'Work in an X-ray department.', [
      'Position patients under supervision and produce diagnostic images.',
      'Follow radiation safety rules and dose protocols.',
      'Maintain a logbook.',
      'Obtain an internship certificate.'],
      [['Training', 'Hospital X-ray unit']]),
    P('Careers and upgrading', 'After the diploma', 'Work or upgrade your qualification.', [
      'Jobs: X-ray technician, radiographer at hospitals, diagnostic centres and clinics.',
      'Upgrade through BSc in Radiology and Imaging Technology.',
      'Government jobs through state and central recruitment.',
      'Safety certification follows AERB guidance.'],
      [['Upgrade', 'BSc Radiology']]),
  ], [['AERB', 'https://www.aerb.gov.in/'], src.ncs]),
];
