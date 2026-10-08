import { P, C, src } from './_lib.mjs';
const BCI = ['Bar Council of India', 'https://www.barcouncilofindia.org/'];
const CLAT = ['CLAT (Consortium of NLUs)', 'https://consortiumofnlus.ac.in/'];

export default [
C('llb', 'LLB', 'LLB — Becoming a Lawyer in India',
  'From Class 12 to a practising advocate: CLAT and other law entrances, 5-year integrated or 3-year LLB, internships, AIBE and enrolment with a State Bar Council.',
  [['Duration', '5 years (integrated) or 3 years (after graduation)'], ['Entrance', 'CLAT, AILET, CUET, state CETs'], ['Licence', 'AIBE after enrolment'], ['Regulator', 'Bar Council of India']],
  [
    P('Class 11–12: stream and eligibility', 'Class 11–12', 'Any stream can study law; Arts and Commerce students find the subjects familiar.', [
      'Integrated 5-year law (BA LLB, BBA LLB, B.Com LLB, BSc LLB) is open after Class 12 in any stream.',
      'Most NLUs ask for Class 12 pass with at least 45% (40% for SC/ST) as per CLAT rules; check each year’s notification.',
      'The 3-year LLB is open after a bachelor’s degree in any discipline, with minimum marks as set by the university and the BCI.',
      'Build reading speed, English and awareness of current affairs and legal news in Class 11–12.'],
      [['5-year LLB', 'After Class 12, any stream'], ['3-year LLB', 'After any graduation'], ['Min. marks', 'About 45% (40% SC/ST)']]),
    P('Entrance exams and admission', 'Class 12 year', 'CLAT leads to 24 NLUs; AILET, SLAT, CUET and state tests open other colleges.', [
      'CLAT UG is held once a year (usually in December): 120 multiple-choice questions in 2 hours on English Language, Current Affairs and General Knowledge, Legal Reasoning, Logical Reasoning and Quantitative Techniques, with negative marking of 0.25.',
      'AILET is the separate entrance for NLU Delhi; SLAT for Symbiosis; university tests for others (LSAT—India was discontinued by LSAC from 2025); many central universities use CUET-UG.',
      'Counselling is rank-based, with choice of NLUs and seat acceptance across several rounds.',
      'For the 3-year LLB, entrance routes include CLAT-PG-linked tests, DU LLB entrance and state tests such as MH CET Law.'],
      [['CLAT', '120 Qs, 2 hours, −0.25'], ['Held', 'Usually December'], ['Other exams', 'AILET, SLAT, CUET']],
      'Practise daily newspaper editorials; CLAT passage-based questions reward reading speed and comprehension.'),
    P('Law school years', 'Year 1–5', 'Core legal subjects, specialisations and moot courts.', [
      'Year 1–2: Constitutional Law, Contracts, Torts, Criminal Law (IPC/BNS), Legal Methods and Jurisprudence plus social-science subjects.',
      'Year 3–4: Property Law, Family Law, Company Law, Evidence, Civil Procedure, Criminal Procedure, Administrative Law and Public International Law.',
      'Year 5: Professional ethics, clinical courses (drafting, pleading, moot court) and electives such as IPR, Taxation, Arbitration or Cyber Law.',
      'The BCI requires moot courts, client counselling, internships and a dissertation as part of the degree.'],
      [['Clinical courses', 'Moot court, drafting, pleading'], ['Electives', 'IPR, Tax, Arbitration, Cyber Law']]),
    P('Mandatory internships', 'Throughout the course', 'Internships under advocates, courts, NGOs and companies are a degree requirement.', [
      'BCI rules require students to complete a set number of weeks of internship during the programme; universities usually specify them as summer placements.',
      'Intern with trial and high court advocates, law firms, corporate legal teams, legal aid cells and NGOs.',
      'Keep certificates and a log; the university collects them for assessment.',
      'Try different fields (litigation, corporate, policy) to find your direction.'],
      [['Typical placements', 'Courts, firms, corporates, NGOs']]),
    P('Enrolment, AIBE and licence to practise', 'After the degree', 'Enrol with a State Bar Council and pass the All India Bar Examination to get a Certificate of Practice.', [
      'After the LLB degree, enrol as an advocate with a State Bar Council (apply with degree, ID and fees).',
      'Appear for the All India Bar Examination (AIBE) conducted by the Bar Council of India; passing it gives the Certificate of Practice.',
      'AIBE is an open-book style objective test on the main law subjects; check the current format and passing marks on the BCI website.',
      'You can then appear in courts and practise as an advocate across India.'],
      [['Enrolment', 'State Bar Council'], ['Licence', 'AIBE → Certificate of Practice']]),
    P('Careers after LLB', 'After enrolment', 'Litigation, corporate law, judiciary, government legal jobs and higher study.', [
      'Litigation: junior advocate under a senior in district courts, high courts or the Supreme Court.',
      'Corporate: law firms and in-house legal teams in compliance, contracts and M&A.',
      'Judiciary: state judicial services exams after LLB (see the Judicial Services roadmap).',
      'Higher study: LLM through CLAT-PG, then teaching with UGC NET; also UPSC, PSU legal posts and legal-tech roles.'],
      [['PG exam', 'CLAT-PG'], ['Teaching', 'UGC NET (Law)']]),
  ], [CLAT, BCI, src.cuet]),

C('judicial-services', 'Judicial Services', 'Judicial Services — Becoming a Judge in India',
  'The route from law degree to Civil Judge: eligibility, state judicial exams, interview, training and promotions.',
  [['Entry level', 'Civil Judge (Junior Division)'], ['Degree', 'LLB (3 or 5 years)'], ['Exam', 'State PSC / High Court exam'], ['Stages', 'Prelims, Mains, Interview']],
  [
    P('Class 12 to law degree', 'Class 11–12 and graduation', 'Get an LLB from a BCI-recognised law school.', [
      'Choose a 5-year integrated LLB after Class 12 (CLAT, AILET, CUET and others) or a 3-year LLB after graduation.',
      'Pick a BCI-recognised institution because judicial exams require a valid law degree.',
      'Focus on Constitutional Law, CPC, CrPC, Evidence Act, IPC and Contract Law, since these dominate the syllabus.',
      'Take moot courts and internships in trial courts to learn procedure.'],
      [['Degree', 'LLB from BCI-recognised college']]),
    P('Eligibility and bar enrolment', 'After LLB', 'Check each state’s rules on age, enrolment and years of practice.', [
      'Basic eligibility is an LLB degree and enrolment as an advocate or being eligible for enrolment, depending on the state.',
      'Age limits and attempts vary by state; many states fix roughly 21–35 years with relaxation for reserved categories.',
      'A recent Supreme Court direction on minimum years of practice for entry-level judge posts has affected many states, so check your state’s latest notification.',
      'Also check domicile rules and local language requirements, since several states test a local language.'],
      [['Age', 'Varies by state'], ['Practice rule', 'Check state notification']]),
    P('Preliminary exam', 'Exam cycle varies by state', 'An objective screening test of legal knowledge and general awareness.', [
      'The State Public Service Commission or High Court notifies the exam, and each state runs it on its own schedule.',
      'Prelims is an objective paper on law subjects, general knowledge, current affairs and sometimes language skills, often with negative marking.',
      'Cut-offs depend on category and number of vacancies.',
      'Keep notes on bare acts and key case laws for revision.'],
      [['Format', 'Objective (MCQ)'], ['Conducted by', 'State PSC / High Court']]),
    P('Mains and interview', 'After Prelims', 'Descriptive law papers, then a personality test or viva.', [
      'Mains includes papers on civil law, criminal law, evidence, procedure, constitutional law, judgment writing, translation and essays.',
      'Answer writing practice is critical: structure, case laws and statutory sections.',
      'Interview or viva voce assesses legal knowledge, judicial temperament, communication and awareness.',
      'Final merit combines Mains and interview marks.'],
      [['Mains', 'Descriptive law papers + judgment writing'], ['Final', 'Mains + interview']]),
    P('Appointment, training and promotion', 'After selection', 'Training at a judicial academy, then posting as Civil Judge.', [
      'Selected candidates are appointed as Civil Judge (Junior Division) / Judicial Magistrate and attend training at the State Judicial Academy.',
      'Promotion follows seniority and merit to Civil Judge (Senior Division), then Additional District Judge and District Judge.',
      'Advocates with at least seven years’ practice can enter the Higher Judicial Services directly through a separate exam.',
      'Judges of the High Courts and Supreme Court are appointed from the bar and the judiciary through the collegium system.'],
      [['Entry post', 'Civil Judge (Junior Division)'], ['Senior path', 'District Judge → High Court']]),
  ], [['eCourts India', 'https://ecourts.gov.in/'], BCI]),

C('upsc-civil-services', 'UPSC Civil Services', 'UPSC Civil Services — IAS, IPS and IFS',
  'The full UPSC CSE journey: eligibility, Prelims, Mains, Interview, training at LBSNAA/academies and service allocation.',
  [['Entry', 'Any graduate'], ['Age', '21–32 (General), relaxations apply'], ['Stages', 'Prelims, Mains, Interview'], ['Conducted by', 'UPSC (once a year)']],
  [
    P('School and graduation: build the base', 'Class 10 – graduation', 'Choose any degree, and read NCERTs and the news from early on.', [
      'There is no stream restriction; any recognised bachelor’s degree (final-year students may also apply) qualifies.',
      'Read NCERT books of History, Geography, Polity, Economy and Science from Class 6 to 12 for the foundation.',
      'Start newspaper reading and note-making in your degree years.',
      'Choose a degree you can score well in; a strong academic record gives you a safety net.'],
      [['Degree', 'Any graduate'], ['Reading', 'NCERT + newspaper']]),
    P('Eligibility, age and attempts', 'At application', 'Citizenship, graduation, age limits and attempt limits are fixed by UPSC.', [
      'Age: 21 to 32 years for General; relaxation up to 35 for OBC and 37 for SC/ST (and further for some categories), with different attempt limits: 6 for General, 9 for OBC and no limit for SC/ST within the age limit.',
      'Nationality: Indian citizen for IAS, IPS and IFS; some services accept other categories.',
      'Physical standards apply for IPS and certain services.',
      'Check the latest UPSC notification each year for any change in age or attempt rules.'],
      [['Age (Gen)', '21–32'], ['Attempts (Gen)', '6'], ['Apply', 'Online at the UPSC portal']]),
    P('Stage 1: Preliminary exam', 'Prelims (usually May–June)', 'Two objective papers; only General Studies counts for the cut-off.', [
      'Notification comes out around February; Prelims is held in late May or June.',
      'Paper I: General Studies (100 questions, 200 marks, negative marking of one-third per wrong answer).',
      'Paper II: CSAT (80 questions, 200 marks) is qualifying with 33% required.',
      'Prelims marks do not count in the final rank; they only decide who gets to appear for Mains.'],
      [['Paper I', '100 Qs, 200 marks'], ['Paper II', 'CSAT, qualifying 33%'], ['Negative marking', '1/3 per wrong answer']]),
    P('Stage 2: Mains exam', 'Mains (usually September)', 'Nine descriptive papers, of which seven count for merit.', [
      'Qualifying papers: Paper A (Indian language) and Paper B (English), 300 marks each, only qualifying.',
      'Merit papers: Essay, General Studies I, II, III and IV, and two Optional Subject papers, totalling 1750 marks.',
      'Choose an optional subject by interest and syllabus overlap, not by trend.',
      'Practise answer writing weekly; time management inside the 3-hour paper decides marks.'],
      [['Merit papers', '7 (Essay, GS I–IV, 2 Optional)'], ['Total', '1750 marks'], ['Duration', '3 hours per paper']]),
    P('Stage 3: Personality Test (Interview)', 'Interview (Jan–Apr)', 'A 275-mark interview by a UPSC board.', [
      'Candidates who clear Mains fill in the Detailed Application Form (DAF) with their background and hobbies.',
      'The interview tests awareness, clarity, balance and integrity, not just facts.',
      'Final rank combines Mains (1750) and Interview (275) marks, total 2025.',
      'Mock interviews help you with confidence and structured answers.'],
      [['Interview', '275 marks'], ['Final total', '2025 marks']]),
    P('Service allocation and training', 'After final result', 'Rank and preference decide your service; training follows.', [
      'You fill service and cadre preferences; allocation follows rank, preference and vacancies.',
      'IAS officers train at LBSNAA, Mussoorie, starting with the Foundation Course; IPS at the Sardar Vallabhbhai Patel National Police Academy, Hyderabad; IFS at the Sushma Swaraj Institute of Foreign Service, New Delhi.',
      'Probation includes academy training, district training and practical attachments.',
      'Typical first postings: Assistant Collector/SDM (IAS), ASP (IPS), Attaché or Third Secretary (IFS).'],
      [['Services', 'IAS, IPS, IFS and other Group A/B'], ['Training', 'LBSNAA, SVPNPA, SSIFS']]),
  ], [src.upsc, ['UPSC online application', 'https://upsconline.nic.in/']]),

C('nda', 'NDA', 'NDA — National Defence Academy',
  'The NDA path after Class 12: UPSC exam, SSB interview, medical, three years of training and commission as an officer.',
  [['Entry', 'After Class 12'], ['Exam', 'UPSC NDA & NA (twice a year)'], ['Selection', 'Written + SSB + medical'], ['Age', '16.5–19.5 years']],
  [
    P('Class 11–12 subject choice', 'Class 11–12', 'Choose PCM for Air Force and Navy wings; any stream for the Army wing.', [
      'Army wing: Class 12 pass in any stream.',
      'Air Force and Naval wings (and 10+2 Cadet Entry): Class 12 with Physics and Mathematics.',
      'Unmarried men and women can apply for NDA (women are admitted since the recent reforms).',
      'Age: candidates should be between about 16.5 and 19.5 years at the time of the course.'],
      [['Army', 'Any stream'], ['Air Force / Navy', 'PCM (Phy + Maths)']]),
    P('Written exam', 'Two exams a year (about April and September)', 'UPSC NDA & NA examination: Mathematics and General Ability Test.', [
      'Apply online on the UPSC site when the notification is released.',
      'Mathematics paper: 300 marks, 120 questions in 2.5 hours.',
      'General Ability Test: 600 marks (English 200 and General Knowledge 400), 150 questions in 2.5 hours.',
      'There is negative marking for wrong answers, and candidates need to clear sectional and aggregate cut-offs.'],
      [['Maths', '300 marks'], ['GAT', '600 marks'], ['Negative marking', 'Yes']]),
    P('SSB interview', 'After written result', 'A five-day Services Selection Board assessment.', [
      'Stage 1 (screening): Officer Intelligence Rating test and Picture Perception and Description test.',
      'Stage 2: psychological tests, Group Testing Officer tasks, personal interview and conference.',
      'The SSB carries 900 marks; it tests officer-like qualities such as leadership, courage and teamwork.',
      'Fitness, communication and honest self-awareness matter as much as knowledge.'],
      [['SSB', '5 days, 900 marks']]),
    P('Medical examination and merit list', 'After SSB', 'Recommended candidates undergo a medical test before the final merit list.', [
      'Medical standards apply to eyesight, height, weight and general health.',
      'Final merit list is formed from written exam and SSB marks.',
      'Candidates join the academy based on merit and vacancies in Army, Navy and Air Force.',
      'Keep your fitness and eyesight in check from Class 11.'],
      [['Final merit', 'Written + SSB + medical']]),
    P('Training at NDA and service academies', 'After joining', 'Three years at NDA Khadakwasla, then one year at a service academy.', [
      'Cadets study for a degree (BSc, BA or B.Tech) under JNU while receiving military and physical training.',
      'After three years at NDA, Army cadets go to the Indian Military Academy, Dehradun; Navy cadets to the Indian Naval Academy, Ezhimala; Air Force cadets to the Air Force Academy, Hyderabad.',
      'Training includes drill, field exercises, leadership and service-specific skills.',
      'Cadets are paid a stipend during training.'],
      [['NDA', '3 years'], ['Service academy', '~1 year']]),
    P('Commission as an officer', 'After training', 'Passing out and commission as Lieutenant, Sub-Lieutenant or Flying Officer.', [
      'After the passing-out parade you are commissioned as an officer in the Army, Navy or Air Force.',
      'You serve in operational, technical or administrative branches depending on your service.',
      'Promotion follows rank, performance and exams.',
      'The career also offers opportunities for higher courses and specialisations.'],
      [['Commission', 'Lieutenant / Sub-Lt / Flying Officer']]),
  ], [src.upsc, ['Join Indian Army', 'https://joinindianarmy.nic.in/']]),

C('cds', 'CDS', 'CDS — Combined Defence Services',
  'The CDS path after graduation: UPSC exam, SSB interview, medical, academy training and commission.',
  [['Entry', 'After graduation'], ['Exam', 'UPSC CDS (twice a year)'], ['Selection', 'Written + SSB + medical'], ['Academies', 'IMA, INA, AFA, OTA']],
  [
    P('Graduation and eligibility', 'During degree', 'A bachelor’s degree (or final year) is the minimum; some academies need specific subjects.', [
      'IMA and OTA: any bachelor’s degree.',
      'Indian Naval Academy: BE/B.Tech degree.',
      'Air Force Academy: bachelor’s degree with Physics and Maths in Class 12, or BE/B.Tech.',
      'Age limits differ by academy (around 19–25 years); check the notification for current limits and marital status rules.'],
      [['IMA / OTA', 'Any degree'], ['INA', 'BE/B.Tech'], ['AFA', 'Degree + Class 12 Phy & Maths']]),
    P('Written exam', 'Two exams a year (about February and September)', 'UPSC CDS written exam with English, General Knowledge and Elementary Mathematics.', [
      'Apply online when the UPSC notification is released.',
      'For IMA, INA and AFA the papers cover English, General Knowledge and Elementary Mathematics; the OTA exam has a different pattern, so read the notification.',
      'Each paper is objective with negative marking.',
      'You must clear the written cut-off to be called for the SSB.'],
      [['Subjects', 'English, GK, Elementary Maths'], ['Negative marking', 'Yes']]),
    P('SSB interview', 'After written result', 'A five-day Services Selection Board test.', [
      'Stage 1 screening: intelligence and picture perception tests.',
      'Stage 2: psychological tests, group tasks, interview and conference.',
      'It assesses leadership, communication, confidence and teamwork.',
      'Prepare through disciplined routines, group practice and feedback.'],
      [['SSB', '5 days']]),
    P('Medical and merit list', 'After SSB', 'Medical tests and a final merit list.', [
      'Medical standards are strict; address issues (eyesight, dental) beforehand.',
      'The final merit combines written marks and SSB marks.',
      'Allotment to IMA, INA, AFA or OTA follows rank, preference and vacancies.',
      'Joining letters are issued for the next course.'],
      [['Final merit', 'Written + SSB']]),
    P('Academy training and commission', 'After joining', 'Pre-commission training, then commission as an officer.', [
      'IMA Dehradun trains Army cadets for about 18 months; INA Ezhimala trains Navy cadets; Air Force Academy, Hyderabad trains Air Force cadets; OTA Chennai trains short-service commission officers for about 49 weeks.',
      'Training includes drill, weapons, field skills, leadership and academics.',
      'Cadets are paid a stipend during training.',
      'After passing out you are commissioned as Lieutenant, Sub-Lieutenant or Flying Officer.'],
      [['IMA', '~18 months'], ['OTA', '~49 weeks'], ['Commission', 'Permanent or short service']]),
  ], [src.upsc, ['Join Indian Army', 'https://joinindianarmy.nic.in/']]),
];
