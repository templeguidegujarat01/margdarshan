// Deep roadmap sources: the specialised careers (aviation, maritime, law & finance licences, govt science services,
// allied health). Schema is documented in _includes/roadmap-page.html. Every phase restates facts already on the
// career's own data sheet (_data/in/careers/<slug>.yml) and its sources — no new numbers.
const DGCA = ['DGCA', 'https://www.dgca.gov.in/'];
const EGCA = ['eGCA portal', 'https://egca.gov.in/'];
const UPSC = ['UPSC', 'https://upsc.gov.in/'];
const IBBI = ['IBBI', 'https://ibbi.gov.in/'];
const SEBI = ['SEBI', 'https://www.sebi.gov.in/'];
const NISM = ['NISM', 'https://www.nism.ac.in/'];
const IPINDIA = ['IP India (CGPDTM)', 'https://ipindia.gov.in/'];
const INDIACODE = ['India Code (Acts & Rules)', 'https://www.indiacode.nic.in/'];
const IMU = ['Indian Maritime University', 'https://www.imu.edu.in/'];
const DGS = ['DG Shipping', 'https://www.dgshipping.gov.in/'];
const JEE = ['JEE Main (NTA)', 'https://jeemain.nta.nic.in/'];
const PAY_L10 = 'Group A central services start at Level 10 of the 7th CPC pay matrix (₹56,100 entry basic), plus DA, HRA and other allowances.';

export default [
{
  slug: 'air-hostess', name: 'Cabin Crew', title: 'Air Hostess & Cabin Crew',
  intro: 'From Class 12 to flying as cabin crew: there is no national exam — each airline selects you, then trains you to DGCA safety requirements before line flying.',
  glance: [['Minimum education', 'Class 12, any stream (most airlines)'], ['Who selects you', 'Each airline'], ['Training', 'Airline, to DGCA rules'], ['Licence', 'None — airline approval']],
  phases: [
    { title: 'Finish Class 12 and build the basics', when: 'School years', summary: 'Any stream works; spoken English and customer-service skills matter more than subjects.',
      points: [
        'Most airlines ask for a Class 12 pass from any stream; some prefer a degree or a hospitality diploma.',
        'Fluent spoken English matters most; Hindi, a regional or a foreign language is an advantage, especially for international airlines.',
        'Customer-service experience helps you in interviews.'],
      facts: [['Stream', 'Any'], ['Language', 'Fluent spoken English']] },
    { title: 'Check the airline rules and apply directly', when: 'After Class 12', summary: 'Each airline publishes its own age, height, BMI and vision rules — read the notice before you apply.',
      points: [
        'Watch official airline career pages; each airline runs its own recruitment rounds.',
        'Age, height, BMI and vision limits are set by each airline in its recruitment notice.',
        'Private academies are optional: useful for grooming, English and interview practice, but their certificate is not a DGCA licence.'],
      tip: 'Genuine airlines never ask for money to give you a job. Apply only through the airline\'s official careers page and avoid agents who charge for "placement".' },
    { title: 'Clear airline selection', when: 'Recruitment round', summary: 'Group discussion, interview, grooming check and medical.',
      points: [
        'Selection rounds usually include a group discussion, a personal interview and a grooming check.',
        'Medical fitness is checked as DGCA requires for cabin crew, before training starts.',
        'Men and women are both recruited — flight stewards and air hostesses do the same job.'] },
    { title: 'Initial cabin crew training', when: 'After selection', summary: 'The airline trains you in safety, emergency, first-aid and service, to DGCA requirements.',
      points: [
        'Airlines train cabin crew to the safety training requirements set by DGCA before you fly on the line.',
        'Training covers safety and emergency drills, first aid and in-flight service.',
        'Type-specific training prepares you for the aircraft your airline flies.'] },
    { title: 'Line flying and growth', when: 'First years onward', summary: 'Supervised flights first, then full crew duties; recurrent checks keep you approved.',
      points: [
        'You start with supervised flights, then take on full crew duties.',
        'Yearly safety refreshers and type-specific training keep you approved to fly; medical fitness is renewed through the career.',
        'Growth path: cabin crew → senior crew → purser / cabin manager → trainer or in-flight service manager; after flying, airport services, airline training and hospitality roles.'],
      facts: [['Pay', 'Fixed pay + flying allowance (varies by airline)'], ['Recurrent', 'Yearly safety refreshers']] },
  ],
  sources: [DGCA],
},
{
  slug: 'air-traffic-controller', name: 'Air Traffic Controller', title: 'Air Traffic Controller (AAI JE-ATC)',
  intro: 'From Class 12 PCM to an AAI air traffic controller: a degree with Physics and Maths, the AAI Junior Executive (ATC) online exam, a voice test, medical and background checks, then training and an ATC licence.',
  glance: [['Entry post', 'Junior Executive (ATC), AAI'], ['Degree', 'B.Sc (Physics & Maths) or B.E./B.Tech'], ['Selection', 'Online exam → voice test → checks'], ['Pay scale', '₹40,000–1,40,000 (E-1)']],
  phases: [
    { title: 'Class 12 with Physics and Maths', when: 'School years', summary: 'PCM keeps both eligible degree routes open.',
      points: [
        'The degree AAI asks for must include Physics and Mathematics, so Class 12 Science (PCM) is the natural route.',
        'Commerce and Arts students are not eligible, because the degree needs both subjects.',
        'Start working on clear spoken and written English — AAI tests it later.'] },
    { title: 'Earn an eligible degree', when: 'Undergraduate', summary: 'A full-time B.Sc with Physics and Maths, or a full-time B.E./B.Tech in any discipline.',
      points: [
        'Option 1: a full-time 3-year B.Sc with Physics and Mathematics.',
        'Option 2: a full-time B.E./B.Tech in any discipline, with Physics and Mathematics in any semester.',
        'A B.Sc Chemistry counts only if Physics and Mathematics are also subjects in it.'],
      facts: [['Mode', 'Full-time, regular'], ['English', 'At least 10+2 level']] },
    { title: 'AAI JE (ATC) online exam', when: 'When AAI notifies', summary: 'A computer-based test with general aptitude, English and technical (Physics & Maths) parts.',
      points: [
        'AAI recruits through its own online exam — GATE is not needed.',
        'The test has general aptitude, English and technical (Physics & Maths) sections; the notification states which part decides merit.',
        'Age limits and relaxations are set in the current AAI recruitment notice.'] },
    { title: 'Voice test, medical and checks', when: 'After the exam', summary: 'Clear speech for radio work, then medical, psychoactive substance test, psychological assessment and background check.',
      points: [
        'The voice test checks clear, confident speech and English — essential for radio communication.',
        'Documents are verified after the voice test.',
        'Medical fitness, a psychoactive substance test, a psychological assessment and a background check follow, to AAI standards.'] },
    { title: 'Training, licence and career', when: 'After appointment', summary: 'AAI training, an ATC licence and ratings for each control unit, then posting.',
      points: [
        'After AAI training, controllers are licensed and rated for each control unit they work.',
        'Pay: the E-1 scale of ₹40,000–1,40,000 stated in AAI notices, plus DA, HRA/perks and allowances, with PSU medical, leave and retirement benefits.',
        'Growth path: Junior Executive → Manager → Senior Manager → AGM → DGM → GM (ATM).'],
      facts: [['Employer', 'Airports Authority of India'], ['Pay scale', '₹40,000–1,40,000 (E-1)']] },
  ],
  sources: [['Airports Authority of India — Careers', 'https://www.aai.aero/']],
},
{
  slug: 'aircraft-maintenance-engineer', name: 'Aircraft Maintenance Engineer', title: 'Aircraft Maintenance Engineer (AME)',
  intro: 'From Class 12 PCM to a DGCA AME licence: CAR-147 basic training, CAR-66 module exams, practical experience, the licence at 18+, then type ratings.',
  glance: [['Licence', 'AME licence (CAR-66)'], ['Categories', 'B1 mechanical · B2 avionics'], ['Minimum age', '18 for the licence'], ['Regulator', 'DGCA']],
  phases: [
    { title: 'Class 12 PCM', when: 'School years', summary: 'Physics, Chemistry and Mathematics are the standard entry requirement.',
      points: [
        'CAR-147 basic training courses ask for Class 12 with Physics, Chemistry and Mathematics (or a relevant engineering diploma/degree).',
        'Commerce alone is not enough — training organisations and airlines ask for PCM.',
        'AME is a licence, not a degree; some institutes pair training with a degree, but the licence comes from DGCA exams and experience.'] },
    { title: 'DGCA-approved CAR-147 training', when: 'After Class 12', summary: 'Join only an organisation on DGCA\'s approved CAR-147 list.',
      points: [
        'Many institutes advertise "AME courses" — only DGCA-approved CAR-147 organisations count.',
        'Check the approval on dgca.gov.in before paying any fee.',
        'Choose your category early: B1 covers mechanical systems, structures and engines; B2 covers avionics and electrical systems.'],
      tip: 'Look up the institute on DGCA\'s list of approved CAR-147 training organisations before you pay.' },
    { title: 'CAR-66 module exams', when: 'During and after training', summary: 'DGCA subject modules for your category, booked on eGCA.',
      points: [
        'Modules cover maths, physics, electrical, aerodynamics, systems, regulations and more, as set by DGCA.',
        'Exams are applied for and results tracked on the eGCA / Pariksha portals.',
        'The modules you take depend on whether you go for B1 or B2.'] },
    { title: 'Practical experience', when: 'Before the licence', summary: 'Hands-on maintenance at an airline or approved maintenance organisation (MRO).',
      points: [
        'DGCA requires practical maintenance experience for your category before you apply for the licence.',
        'Experience is gained at an airline or an approved MRO.',
        'Pay before the licence is modest — the licence is the big step.'] },
    { title: 'AME licence, type ratings and growth', when: '18+ onward', summary: 'Apply to DGCA once modules and experience are complete; then add aircraft types.',
      points: [
        'You must be at least 18 to be issued an AME licence.',
        'A type rating (training on a specific aircraft) lets you certify that type; experience on wide-body or popular types is valued in India and abroad.',
        'Growth path: trainee → licensed AME → certifying engineer → shift/quality manager; work abroad may need licence conversion.'],
      facts: [['Employers', 'Airlines, MROs, helicopter & charter operators'], ['Licence age', '18+']] },
  ],
  sources: [DGCA, EGCA],
},
{
  slug: 'architect', name: 'Architect', title: 'Architect (B.Arch)',
  intro: 'From Class 12 with Physics and Maths to a registered architect: NATA or JEE Main Paper 2, a 5-year B.Arch with built-in practical training, then Council of Architecture registration.',
  glance: [['Degree', 'B.Arch (5 years)'], ['Entrance', 'NATA or JEE Main Paper 2'], ['Licence', 'CoA registration'], ['Law', 'Architects Act, 1972']],
  phases: [
    { title: 'Class 12 with Physics and Maths', when: 'School years', summary: 'Physics and Mathematics are compulsory for B.Arch; practise drawing early.',
      points: [
        'Class 12 with Physics and Mathematics as compulsory subjects, with the aggregate marks CoA sets in its admission rules.',
        'A 10+3 diploma with Mathematics is a separate eligible route.',
        'Check the current CoA admission rules for the third subject and marks; start sketching and drawing practice early.'] },
    { title: 'NATA or JEE Main Paper 2', when: 'Class 12 year', summary: 'Aptitude, drawing and maths — many students take both.',
      points: [
        'NATA is conducted by the Council of Architecture and used by many colleges.',
        'JEE Main Paper 2 (B.Arch) is used for NITs and some centrally funded institutes.',
        'Both are accepted for B.Arch, so many students take both.'] },
    { title: 'Counselling and admission', when: 'After results', summary: 'State, JoSAA or institute counselling that accepts your score.',
      points: [
        'Admission is through the state, JoSAA or institute counselling that accepts your NATA or JEE Paper 2 score.',
        'Confirm each college\'s accepted score before choosing.',
        'Keep your Class 12 marks proof ready — CoA sets the aggregate.'] },
    { title: 'B.Arch (5 years) with practical training', when: '5 years', summary: 'Design studios, construction, history and services, with practical training built in.',
      points: [
        'The 5-year B.Arch covers design studios, construction, history of architecture and building services.',
        'Practical training is built into the B.Arch programme.',
        'Build a portfolio of studio work through the course.'] },
    { title: 'Register with CoA and practise', when: 'After B.Arch', summary: 'Registration is required to use the title "architect".',
      points: [
        'Under the Architects Act, 1972 only people registered with the Council of Architecture may use the title "architect".',
        'Work in design firms, with developers, CPWD/PWD and urban bodies, or start your own studio; government architect posts come through UPSC/state PSC recruitment.',
        'Growth path: junior → project architect → associate → principal / own practice; or specialise with M.Arch/M.Plan.'],
      facts: [['Registration', 'Council of Architecture'], ['Higher study', 'M.Arch / M.Plan']] },
  ],
  sources: [['Council of Architecture', 'https://www.coa.gov.in/'], ['NATA', 'https://www.nata.in/'], JEE],
},
{
  slug: 'biomedical-engineer', name: 'Biomedical Engineer', title: 'Biomedical Engineer',
  intro: 'From Class 12 PCM to a biomedical engineer: JEE Main or a state CET, a 4-year B.Tech in Biomedical Engineering, an internship in a hospital or device company, then clinical, service, R&D or regulatory work.',
  glance: [['Degree', 'B.Tech / B.E. Biomedical (4 yrs)'], ['Entrance', 'JEE Main / state CETs'], ['Device regulator', 'CDSCO'], ['Work in', 'Hospitals & device companies']],
  phases: [
    { title: 'Class 12 PCM', when: 'School years', summary: 'Strong Physics and Maths matter; a few colleges accept PCB with Maths.',
      points: [
        'Class 12 with Physics, Chemistry and Mathematics is the standard requirement.',
        'Some colleges accept PCB with Maths — check each college\'s rules.',
        'Minimum Class 12 marks are set by each counselling authority.'] },
    { title: 'JEE Main or state CET', when: 'Class 12 year', summary: 'Your rank decides the college.',
      points: [
        'JEE Main is the national engineering entrance for NITs and many other colleges, with JoSAA/CSAB counselling.',
        'Most state engineering colleges admit through their own CET.',
        'Apply to both where you can; the rank decides the college.'] },
    { title: 'B.Tech Biomedical Engineering', when: '4 years', summary: 'Electronics, physiology, imaging and biomaterials.',
      points: [
        'The course mixes electronics, human physiology, medical imaging and biomaterials.',
        'Biomedical engineering is about medical devices and equipment — not the same as biotechnology.',
        'Learn the basics of medical-device regulation: CDSCO licenses manufacture and import under the Medical Devices Rules, 2017.'] },
    { title: 'Internship', when: 'During the degree', summary: 'Hospital clinical engineering or a device company.',
      points: [
        'An internship in a hospital\'s clinical engineering department or a device company is the usual bridge to a job.',
        'Service and clinical engineering roles are common first jobs.',
        'Regulatory roles need knowledge of CDSCO rules.'] },
    { title: 'First job and growth', when: 'After graduation', summary: 'Clinical engineer, service engineer, R&D or regulatory associate; M.Tech/MS for R&D.',
      points: [
        'Employers: hospitals, medical-device makers, imaging companies, diagnostics firms and regulatory consultancies.',
        'Growth path: clinical / service engineer → specialist → manager (biomedical department, product, regulatory).',
        'Biomedical Engineering is a GATE paper used for M.Tech admission; IITs, IISc and medical-technology incubators run research.'],
      facts: [['Higher study', 'GATE → M.Tech/MS'], ['Regulator to know', 'CDSCO']] },
  ],
  sources: [JEE, ['CDSCO', 'https://cdsco.gov.in/']],
},
{
  slug: 'commercial-pilot', name: 'Commercial Pilot', title: 'Commercial Pilot (CPL)',
  intro: 'From Class 12 with Physics and Maths to an airline cockpit: DGCA medicals, a DGCA-approved flying school, theory exams and 200 flying hours, the CPL and RTR licence, then a type rating and airline entry.',
  glance: [['Licence', 'Commercial Pilot Licence (CPL)'], ['Minimum flying', '200 hours for the CPL'], ['Training time', '~18 months–2 yrs (school-dependent)'], ['Regulator', 'DGCA']],
  phases: [
    { title: 'Class 12 with Physics and Maths', when: 'School years', summary: 'DGCA asks for the two subjects, not the Science stream — add them through NIOS if needed.',
      points: [
        'Class 12 (10+2) pass with Physics and Mathematics is required.',
        'Commerce or Arts students can clear Physics and Maths at Class 12 level through NIOS before applying.',
        'No degree is needed for DGCA licences; some students do one alongside as a back-up.'] },
    { title: 'DGCA medicals first', when: 'Before paying a school', summary: 'Class 2 medical first, then the Class 1 medical with a DGCA-empanelled examiner.',
      points: [
        'A DGCA Class 2 medical is needed before solo flying.',
        'A Class 1 medical from a DGCA-empanelled examiner is needed for the CPL.',
        'Eyesight, hearing and other conditions can make you unfit — and flying-school fees are rarely refunded.'],
      tip: 'Do the DGCA Class 1 medical before you pay any flying school.' },
    { title: 'Join a DGCA-approved flying school', when: '~18 months–2 years', summary: 'In India or abroad; foreign licences must be converted under DGCA rules.',
      points: [
        'Training time is about 18 months to 2 years, depending on the school.',
        'Minimum age is 17 for a Student Pilot Licence.',
        'Schools quote very different totals (tens of lakhs) and a type rating is usually extra — get the full written fee schedule.'] },
    { title: 'Theory exams and 200 flying hours', when: 'During training', summary: 'DGCA papers on eGCA, the RTR(A) radio licence and the required flight time.',
      points: [
        'Theory papers: Air Regulations, Air Navigation, Aviation Meteorology, Technical General and Technical Specific, booked and tracked on eGCA.',
        'Log at least 200 hours of flight time; the solo, cross-country, instrument and night minimums are in the current DGCA CAR.',
        'The radio telephony RTR(A) licence is a separate exam every CPL holder needs to talk to air traffic control.'] },
    { title: 'CPL, type rating and airline career', when: '18+ onward', summary: 'Skill test → CPL → type rating → First Officer → Captain after the ATPL.',
      points: [
        'DGCA issues the CPL (minimum age 18) after a skill test with a DGCA examiner and document checks.',
        'A type rating trains you on one airliner type (for example A320 or B737); airlines run their own written tests, simulator checks and interviews, and some run cadet programmes from zero.',
        'Growth path: First Officer → Senior First Officer → Captain → Training Captain / Examiner; many new CPL holders instruct while waiting for airline hiring.'],
      facts: [['CPL age', '18+'], ['Captain', 'After the ATPL']] },
  ],
  sources: [DGCA, EGCA],
},
{
  slug: 'customs-broker', name: 'Customs Broker', title: 'Licensed Customs Broker',
  intro: 'From graduation to a customs broker licence under CBLR 2018: learn clearance on the job, apply when NACIN invites, pass the written and oral exams, then get the licence and practise.',
  glance: [['Licence', 'Customs Broker (CBLR 2018)'], ['Exam', 'Written + oral'], ['Conducted by', 'NACIN for CBIC'], ['Attempts', 'Limited (per CBLR)']],
  phases: [
    { title: 'Graduate', when: 'After Class 12', summary: 'Any stream; commerce, law or logistics helps.',
      points: [
        'You need a graduate degree, or a professional qualification or customs-clearance diploma that the Regulations accept.',
        'Commerce helps with duties, invoices and accounts.',
        'Law and logistics backgrounds also fit the work.'] },
    { title: 'Work in customs clearance', when: 'While you prepare', summary: 'Many first work for a broker and learn on the job.',
      points: [
        'Clearance staff learn the work under a licensed broker.',
        'Practical clearance experience makes passing the exam much easier.',
        'Freight forwarders, shipping lines and import-export firms also hire clearance staff.'] },
    { title: 'Apply when NACIN invites', when: 'Yearly notice', summary: 'Through the Customs Commissionerate with jurisdiction.',
      points: [
        'NACIN invites applications every year.',
        'Apply through your jurisdictional Customs Commissionerate.',
        'Attempts are limited under the Regulations — prepare before you use one.'] },
    { title: 'Written and oral exams', when: 'Exam cycle', summary: 'An objective written exam on customs law and procedure, then an oral exam.',
      points: [
        'The written exam is objective, on customs law, tariff, procedures and allied laws; marks and pass rules are in the yearly notice.',
        'Candidates who pass the written exam take an oral exam on practical clearance knowledge.',
        'NACIN conducts the exam for CBIC under the Customs Brokers Licensing Regulations, 2018.'] },
    { title: 'Licence and practice', when: 'After passing', summary: 'Meet the financial and fit-and-proper conditions, then run a brokerage or join a logistics firm.',
      points: [
        'The licence needs the financial and fit-and-proper conditions in the Regulations.',
        'Licensed brokers earn fees per shipment; income grows with clients.',
        'Growth path: clearance executive → licensed broker → own brokerage / logistics business; trade-compliance roles are related.'] },
  ],
  sources: [['CBIC', 'https://www.cbic.gov.in/'], ['NACIN', 'https://www.nacin.gov.in/'], INDIACODE],
},
{
  slug: 'cyber-forensic-investigator', name: 'Cyber Forensic Investigator', title: 'Cyber Forensic Investigator',
  intro: 'From Class 12 Science to a digital-evidence expert: a forensic-science or computer degree, a digital-forensics specialisation, a first analyst role, then senior examiner or incident-response lead.',
  glance: [['Courses', 'M.Sc Digital Forensics, B.Tech CSE'], ['Coordination', 'I4C (Ministry of Home Affairs)'], ['Govt labs', 'CFSL / state FSLs'], ['Key law', 'IT Act, 2000']],
  phases: [
    { title: 'Class 12 Science', when: 'School years', summary: 'PCM keeps both the forensics and computer routes open.',
      points: [
        'PCM leads to B.Tech CSE; PCM or PCB leads to B.Sc Forensic Science.',
        'Some BCA programmes accept Commerce with Maths.',
        'Science is the usual route for this career.'] },
    { title: 'Degree', when: 'Undergraduate', summary: 'B.Sc Forensic Science, B.Tech CSE or BCA.',
      points: [
        'Pick B.Sc Forensic Science (PCM/PCB), B.Tech CSE (PCM) or BCA.',
        'NFSU is the central university specialising in forensic sciences, including digital forensics.',
        'Learn the IT Act, 2000 — it defines cyber offences and the powers to investigate them.'] },
    { title: 'Specialise', when: 'After the degree', summary: 'An M.Sc in Digital/Cyber Forensics or hands-on training.',
      points: [
        'A specialised M.Sc in Digital/Cyber Forensics or equivalent training strengthens your profile.',
        'Forensics investigates after an incident; ethical hacking tests systems before attackers do — choose your focus.',
        'Certified, experienced examiners earn more.'] },
    { title: 'First role', when: 'Entry level', summary: 'Forensic analyst in a lab, police cyber cell, consulting firm or bank.',
      points: [
        'Labs, police cyber cells, Big 4 forensic teams, banks and cybersecurity firms hire trained graduates.',
        'Government lab posts (scientific officer / assistant in CFSL and state FSLs) come through UPSC and state PSCs; qualifications are in each notice.',
        'I4C, the Indian Cyber Crime Coordination Centre under MHA, coordinates the national response.'] },
    { title: 'Grow', when: 'Experienced', summary: 'Senior examiner, incident-response lead, expert witness.',
      points: [
        'Growth path: analyst → examiner / consultant → incident-response or forensic lead.',
        'Related fields: incident response, fraud investigation and e-discovery.',
        'Senior examiners may give evidence as expert witnesses.'] },
  ],
  sources: [['NFSU', 'https://www.nfsu.ac.in/'], ['I4C, Ministry of Home Affairs', 'https://i4c.mha.gov.in/'], INDIACODE],
},
{
  slug: 'data-protection-officer', name: 'Data Protection Officer', title: 'Data Protection Officer (DPDP Act)',
  intro: 'From any stream to a Data Protection Officer: a law, tech or commerce degree, deep knowledge of the DPDP Act and Rules, an entry compliance role, privacy manager, then DPO reporting to the board.',
  glance: [['Law', 'DPDP Act, 2023 + DPDP Rules'], ['Must appoint', 'Significant Data Fiduciaries'], ['Regulator', 'Data Protection Board of India'], ['Fixed degree', 'None prescribed']],
  phases: [
    { title: 'Class 12, any stream', when: 'School years', summary: 'The role mixes law, technology and governance, so every stream can lead here.',
      points: [
        'Science, Commerce and Arts students can all reach this role.',
        'Pick a degree that suits you — the law prescribes none.',
        'Reading, writing and an interest in technology help.'] },
    { title: 'Degree', when: 'Undergraduate', summary: 'LLB, B.Tech/BCA with security, or commerce plus CS.',
      points: [
        'The DPDP Act sets no fixed degree for DPOs.',
        'Employers usually look for law, IT/cybersecurity or compliance backgrounds.',
        'Common routes: LLB, B.Tech/BCA (security), or commerce plus Company Secretary.'] },
    { title: 'Learn the DPDP framework', when: 'Alongside study', summary: 'The Act, the Rules, consent, breach reporting and the rights of data principals.',
      points: [
        'The DPDP Act, 2023 defines data fiduciaries, Significant Data Fiduciaries and the DPO requirement.',
        'The DPDP Rules, notified by MeitY, set procedures for notices, consent, breaches and SDF duties.',
        'The Data Protection Board of India adjudicates breaches and can impose penalties.'],
      tip: 'No Government body issues a "DPO licence". Private privacy certifications are optional — be careful with courses that claim to make you a certified DPO under Indian law.' },
    { title: 'Entry compliance role, then privacy manager', when: 'First jobs', summary: 'Privacy analyst, GRC associate or legal associate; then run assessments, audits and vendor reviews.',
      points: [
        'Junior roles sit in compliance, legal or security teams.',
        'Privacy managers run assessments, audits and vendor reviews; demand is rising as the DPDP Rules come into force.',
        'Employers: banks, fintechs, e-commerce, health-tech, telecom, consulting and law firms.'] },
    { title: 'DPO', when: 'Senior role', summary: 'A board-level role in large organisations.',
      points: [
        'For Significant Data Fiduciaries the DPO must be based in India and responsible to the board of directors.',
        'Other organisations must still name a contact person for data-privacy questions.',
        'Growth path: analyst → privacy manager → DPO / Chief Privacy Officer; related roles are GRC, cybersecurity and tech law.'] },
  ],
  sources: [INDIACODE, ['MeitY', 'https://www.meity.gov.in/']],
},
{
  slug: 'economist', name: 'Economist', title: 'Economist (Indian Economic Service)',
  intro: 'From Class 12 to the Indian Economic Service or a policy career: BA/B.Sc Economics, MA Economics, the UPSC IES/ISS exam, then ministries, RBI, research institutes or private firms.',
  glance: [['Govt service', 'Indian Economic Service'], ['Exam', 'UPSC IES/ISS'], ['Eligibility', 'PG in Economics'], ['Pay at entry', 'Level 10, 7th CPC']],
  phases: [
    { title: 'Class 12 (Maths helps)', when: 'School years', summary: 'Any stream; Maths keeps top economics programmes open.',
      points: [
        'Science, Commerce and Arts students are all eligible.',
        'Maths at Class 12 helps a lot for economics degrees at top colleges.',
        'Most strong programmes and IES papers use maths and statistics.'] },
    { title: 'BA / B.Sc Economics', when: 'Undergraduate', summary: 'Build micro, macro and statistics basics.',
      points: [
        'Build microeconomics, macroeconomics and statistics foundations.',
        'You cannot sit IES with only a bachelor\'s degree.',
        'Keep maths and statistics strong for the postgraduate stage.'] },
    { title: 'MA Economics', when: 'Postgraduate', summary: 'Needed for IES and most economist roles.',
      points: [
        'IES needs a postgraduate degree in Economics, Applied Economics, Business Economics or Econometrics.',
        'Banks, consultancies and rating agencies hire economists with a master\'s.',
        'Other routes: RBI Grade B (DEPR), and UGC-NET for research and teaching.'] },
    { title: 'UPSC IES/ISS exam', when: 'Yearly UPSC cycle', summary: 'General English, General Studies and economics papers, then an interview.',
      points: [
        'UPSC runs one examination for the Indian Economic Service and the Indian Statistical Service.',
        'IES papers: General English, General Studies and economics papers, followed by an interview.',
        'Age limits and relaxations are in the current UPSC notice; IES is separate from the Civil Services (IAS) exam.'] },
    { title: 'IES or other routes', when: 'After selection', summary: 'Union ministries, NITI Aayog, RBI, research institutes, banks and consultancies.',
      points: [
        `IES entry: ${PAY_L10}`,
        'Government: Union ministries (finance, commerce and others), NITI Aayog, statistical and planning bodies; senior IES officers reach adviser-level posts.',
        'Private and research: banks, rating agencies, consultancies, think tanks and universities.'],
      facts: [['Entry pay', 'Level 10 (₹56,100 basic)'], ['Central bank', 'RBI research departments']] },
  ],
  sources: [UPSC],
},
{
  slug: 'engineering-services', name: 'Engineering Services Officer', title: 'Indian Engineering Services (UPSC ESE)',
  intro: 'From Class 12 PCM to a Group A engineering officer: a B.E./B.Tech in Civil, Mechanical, Electrical or E&T, the three-stage UPSC ESE (prelims, mains, personality test), then department training and posting.',
  glance: [['Recruiter', 'UPSC'], ['Stages', 'Prelims → Mains → Personality test'], ['Streams', 'Civil, Mech, Electrical, E&T'], ['Pay at entry', 'Level 10, 7th CPC']],
  phases: [
    { title: 'Class 12 PCM and engineering entrance', when: 'School years', summary: 'PCM leads to the B.E./B.Tech that ESE requires.',
      points: [
        'Class 12 PCM is the route to engineering entrance exams.',
        'Commerce and Arts are not eligible routes.',
        'Pick a branch that ESE covers: Civil, Mechanical, Electrical, or Electronics & Telecommunication.'] },
    { title: 'B.E. / B.Tech', when: 'Undergraduate', summary: 'A degree in engineering from a recognised university.',
      points: [
        'You need a degree in engineering, or an equivalent the notice accepts (some posts accept specific M.Sc degrees).',
        'Final-year students can usually apply if they produce the degree by the date in the notice.',
        'Age limits and relaxations are in the current UPSC notice.'] },
    { title: 'ESE Prelims', when: 'Stage I', summary: 'Objective papers: general studies & engineering aptitude, plus your discipline.',
      points: [
        'Paper on general studies and engineering aptitude.',
        'Paper on your engineering discipline.',
        'ESE is not GATE — GATE is for postgraduate admission and some PSU hiring.'] },
    { title: 'ESE Mains and personality test', when: 'Stages II–III', summary: 'Two conventional discipline papers, then the UPSC interview.',
      points: [
        'Mains: conventional (descriptive) papers in your discipline.',
        'Those who qualify in the Mains face a personality test by UPSC.',
        'Medical and physical standards apply for the services you choose.'] },
    { title: 'Training, posting and growth', when: 'After selection', summary: 'Department training, then field posting as a Group A officer.',
      points: [
        `Entry: ${PAY_L10}`,
        'Growth path: Assistant Executive Engineer → Executive Engineer → Superintending → Chief Engineer.',
        'Related routes: GATE-based PSU recruitment and state engineering services.'],
      facts: [['Entry pay', 'Level 10 (₹56,100 basic)'], ['Employers', 'Central engineering departments']] },
  ],
  sources: [UPSC],
},
{
  slug: 'ethical-hacker', name: 'Ethical Hacker', title: 'Ethical Hacker / Penetration Tester',
  intro: 'From Class 12 to a penetration tester: a computer degree, hands-on skills in legal labs and CTFs, reputable certifications, a first SOC or VAPT role, then red-team and security-architect work — always with written authorisation.',
  glance: [['Licence', 'None — skill & certification based'], ['Audit empanelment', 'CERT-In'], ['Key law', 'IT Act, 2000'], ['Typical degree', 'B.Tech CSE / BCA / B.Sc IT']],
  phases: [
    { title: 'Class 12', when: 'School years', summary: 'PCM keeps B.Tech open; BCA and B.Sc IT often accept any stream with Maths.',
      points: [
        'PCM opens B.Tech CSE.',
        'BCA and B.Sc IT often accept Commerce or Arts students with Maths.',
        'Self-taught skills count heavily in this field.'] },
    { title: 'Computer degree', when: 'Undergraduate', summary: 'B.Tech CSE, BCA or B.Sc IT.',
      points: [
        'A degree in computer science, IT or BCA is the usual base.',
        'Strong self-learners from other backgrounds also break in.',
        'Use the degree years to learn networking and programming deeply.'] },
    { title: 'Build legal, hands-on skills', when: 'Alongside the degree', summary: 'Networks, Linux, web security and scripting, practised in legal labs and CTFs.',
      points: [
        'Hands-on skill in networking, Linux, web technologies and scripting is what employers test.',
        'Practise only in legal labs, CTFs and company bug-bounty programmes that legally reward reported vulnerabilities.',
        'Always work under a written authorisation from the system owner.'],
      tip: 'Testing a website or network without written permission is an offence under the IT Act, 2000 — even if you mean well.' },
    { title: 'Certifications and first job', when: 'Entry level', summary: 'Reputable hands-on certifications help; SOC analyst or junior VAPT tester is the common start.',
      points: [
        'Private certifications from international bodies are valued but optional; none is a Government licence — check how hands-on they are before paying.',
        'Common first roles: SOC analyst or junior VAPT tester.',
        'Employers: CERT-In empanelled audit firms, IT services, banks, fintechs, product companies and consultancies.'] },
    { title: 'Grow', when: 'Experienced', summary: 'Penetration tester, red-team lead, security consultant.',
      points: [
        'Growth path: SOC analyst → pentester → senior / red team → security architect / CISO.',
        'Experienced testers are in short supply; skill and reputation drive pay.',
        'CERT-In, the national agency for cyber-security incidents, empanels security-audit organisations; bug-bounty research can run alongside a job.'] },
  ],
  sources: [['CERT-In', 'https://www.cert-in.org.in/'], INDIACODE],
},
{
  slug: 'fisheries-scientist', name: 'Fisheries Scientist', title: 'Fisheries Scientist (B.F.Sc)',
  intro: 'From Class 12 PCB to a fisheries career: CUET-UG for ICAR\'s national quota or your state\'s admission, the 4-year B.F.Sc, an optional M.F.Sc, then state departments, industry, banks or ICAR research via ASRB.',
  glance: [['Degree', 'B.F.Sc (4 years)'], ['National seats', 'ICAR quota via CUET-UG'], ['Scientist recruitment', 'ASRB'], ['Work in', 'Aquaculture, research, state depts']],
  phases: [
    { title: 'Class 12 PCB', when: 'School years', summary: 'Biology is key; some colleges also accept PCM or PCMB.',
      points: [
        'Class 12 with Physics, Chemistry and Biology is the standard requirement.',
        'Some colleges accept PCM or PCMB.',
        'Minimum marks are set by each university.'] },
    { title: 'CUET-UG or state admission', when: 'Class 12 year', summary: 'ICAR national-quota seats through CUET-UG, or your state agricultural university\'s seats.',
      points: [
        'ICAR uses CUET-UG for its undergraduate national quota, followed by ICAR counselling.',
        'State-quota seats follow the state agricultural/fisheries university\'s admission rules.',
        'Apply through both routes where you can.'] },
    { title: 'B.F.Sc (4 years)', when: '4 years', summary: 'Aquaculture, fish biology, processing and economics.',
      points: [
        'B.F.Sc is a 4-year professional degree in agriculture and allied sciences.',
        'Subjects cover aquaculture, fish biology, fish processing and fisheries economics.',
        'Hatcheries, feed companies and processing plants hire freshers.'] },
    { title: 'M.F.Sc (optional)', when: 'Postgraduate', summary: 'Through ICAR\'s postgraduate entrance.',
      points: [
        'An M.F.Sc is reached through ICAR\'s postgraduate entrance.',
        'It is the usual step towards research and scientist posts.',
        'ICAR scientists are recruited by the Agricultural Scientists Recruitment Board (ASRB).'] },
    { title: 'Career', when: 'After the degree', summary: 'State fisheries departments, industry, banks, or research via ASRB.',
      points: [
        'Government: state fisheries departments (fisheries officer posts through state PSCs), ICAR fisheries institutes and export inspection bodies.',
        'Private: aquaculture farms, hatcheries, feed and seafood processing companies, export houses; banks hire agricultural field officers.',
        'Running your own aquaculture farm can be profitable but carries risk.'] },
  ],
  sources: [['ICAR', 'https://icar.org.in/'], ['CUET-UG (NTA)', 'https://cuet.nta.nic.in/'], ['ASRB', 'https://www.asrb.org.in/']],
},
{
  slug: 'food-safety-officer', name: 'Food Safety Officer', title: 'Food Safety Officer (FSS Act)',
  intro: 'From Class 12 Science to a Food Safety Officer: a degree listed in the FSS Rules, 2011, your state\'s FSO recruitment, appointment and training by the Commissioner of Food Safety, then Designated Officer.',
  glance: [['Law', 'FSS Act, 2006'], ['Regulator', 'FSSAI'], ['Appointed by', 'State Commissioner of Food Safety'], ['Recruitment', 'State PSC / state exams']],
  phases: [
    { title: 'Class 12 Science', when: 'School years', summary: 'PCB or PCM leads to the eligible degrees.',
      points: [
        'Class 12 Science (PCB or PCM) leads to food technology, microbiology, biotechnology, agriculture and similar degrees.',
        'Commerce and Arts do not lead to the listed degrees.',
        'Choose the degree with the FSS Rules list in mind.'] },
    { title: 'An eligible degree', when: 'Undergraduate', summary: 'A degree listed in the Food Safety and Standards Rules, 2011.',
      points: [
        'Listed degrees include food technology, dairy technology, biotechnology, oil technology, agricultural science, veterinary science, biochemistry, microbiology, a master\'s in chemistry, or medicine.',
        'A B.Sc Chemistry alone may not be enough — the Rules mention a master\'s in chemistry; check your state notice.',
        'Private food companies hire quality and regulatory staff with the same degrees.'] },
    { title: 'State FSO recruitment', when: 'When your state notifies', summary: 'A written exam, and an interview where applicable.',
      points: [
        'States recruit FSOs through their PSCs or recruitment boards; read each notice.',
        'Age, domicile and other conditions are set in each state\'s notice.',
        'FSSAI recruits its own technical and central posts separately.'] },
    { title: 'Appointment and training', when: 'After selection', summary: 'Appointed by the state Commissioner of Food Safety; trained as the Food Authority specifies.',
      points: [
        'The FSS Act, 2006 creates FSSAI and the food safety officer system in every state.',
        'Training after appointment is specified by the Food Authority.',
        'FSO pay follows each state\'s pay rules; FSSAI posts follow the central pay matrix.'] },
    { title: 'Grow', when: 'Experienced', summary: 'Designated Officer and senior food safety roles.',
      points: [
        'Growth path: FSO → Designated Officer → senior food safety administration.',
        'Employers beyond government: food manufacturers, QA labs, regulatory consultancies, hotels and restaurant chains.',
        'FSSAI sets the food standards you enforce — keep up with its updates.'] },
  ],
  sources: [['FSSAI', 'https://fssai.gov.in/'], INDIACODE],
},
{
  slug: 'forest-officer', name: 'Indian Forest Service Officer', title: 'Indian Forest Service (IFoS)',
  intro: 'From Class 12 Science to an IFoS officer: an eligible science, agriculture, forestry or engineering degree, the Civil Services Prelims as the screening test, the IFoS Mains and interview, then training and state cadre postings.',
  glance: [['Recruiter', 'UPSC'], ['Screening', 'Civil Services Prelims'], ['Final stages', 'IFoS Mains + interview'], ['Pay at entry', 'Level 10, 7th CPC']],
  phases: [
    { title: 'Class 12 Science', when: 'School years', summary: 'PCM or PCB leads to the eligible degrees.',
      points: [
        'Science at Class 12 leads to the eligible degrees (science subjects, agriculture, forestry, veterinary or engineering).',
        'Commerce and Arts do not lead to the listed degrees.',
        'Physical fitness matters later — there is a walking test.'] },
    { title: 'An eligible bachelor\'s degree', when: 'Undergraduate', summary: 'A listed science subject, or agriculture, forestry or engineering.',
      points: [
        'A bachelor\'s with at least one of Animal Husbandry & Veterinary Science, Botany, Chemistry, Geology, Mathematics, Physics, Statistics or Zoology.',
        'Or a bachelor\'s in Agriculture, Forestry or Engineering.',
        'Age limits, attempts and relaxations are in the UPSC notice.'] },
    { title: 'Civil Services Prelims (screening)', when: 'UPSC cycle', summary: 'Apply for IFoS in the same application; prelims screens candidates.',
      points: [
        'IFoS uses the Civil Services Preliminary Examination as its screening test.',
        'You apply for IFoS in the same application as the Civil Services exam.',
        'The Mains and interview for IFoS are separate from the CSE ones.'] },
    { title: 'IFoS Mains and interview', when: 'After prelims', summary: 'General English, General Knowledge and two optional subjects, then a personality test.',
      points: [
        'IFoS Mains: written papers including General English, General Knowledge and two optional subjects.',
        'Those who qualify face a personality test by UPSC.',
        'Medical and physical standards apply, including the walking test UPSC specifies.'] },
    { title: 'Training, posting and growth', when: 'After selection', summary: 'Training, then state cadre postings in the forest department.',
      points: [
        `Entry: ${PAY_L10}`,
        'Growth path: Assistant Conservator (training) → DCF → Conservator → CCF → PCCF, who heads a state forest department.',
        'State forest services (ACF, Range Forest Officer) are recruited separately by state PSCs.'],
      facts: [['Service', 'All India Service'], ['Top post', 'PCCF']] },
  ],
  sources: [UPSC],
},
{
  slug: 'geologist', name: 'Geologist', title: 'Geologist & Geoscientist',
  intro: 'From Class 12 Science to a geoscientist: B.Sc Geology, M.Sc Geology or Applied Geology, the UPSC Combined Geo-Scientist Examination, then GSI, CGWB, mining, petroleum, consulting or research.',
  glance: [['Govt exam', 'UPSC Combined Geo-Scientist'], ['Key degree', 'M.Sc Geology'], ['Employers', 'GSI, CGWB'], ['Pay at entry', 'Level 10, 7th CPC']],
  phases: [
    { title: 'Class 12 Science', when: 'School years', summary: 'PCM or PCB; PCM is the most common background.',
      points: [
        'Class 12 Science leads to B.Sc Geology.',
        'PCM is the most common background.',
        'Geology suits students who like the outdoors, maps and natural science — field trips are long.'] },
    { title: 'B.Sc Geology', when: 'Undergraduate', summary: 'Or a science degree with geology.',
      points: [
        'Study B.Sc Geology, or a science degree with geology as a subject.',
        'A B.Sc alone is not enough for UPSC geologist posts.',
        'Field work, lab analysis and GIS/remote sensing are all part of the job — start early.'] },
    { title: 'M.Sc Geology / Applied Geology', when: 'Postgraduate', summary: 'Needed for most professional roles.',
      points: [
        'UPSC geologist posts need a master\'s in Geology, Applied Geology or another earth-science subject listed in the notice.',
        'Private-sector roles usually ask for an M.Sc or M.Tech in geology or applied geology.',
        'Research routes in universities, IITs and national institutes often go via NET/PhD.'] },
    { title: 'UPSC Combined Geo-Scientist Examination', when: 'UPSC cycle', summary: 'Prelims (objective), mains (descriptive) and personality test.',
      points: [
        'Stage I: preliminary examination (objective).',
        'Stage II: main examination (descriptive).',
        'Stage III: personality test. The exam fills Geologist, Geophysicist, Chemist and Hydrogeologist posts; age limits are in the current notice.'] },
    { title: 'Join GSI / CGWB or industry', when: 'After selection', summary: 'Government geoscience bodies, or mining, petroleum, consulting and research.',
      points: [
        `Government entry: ${PAY_L10}`,
        'Government employers: Geological Survey of India, Central Ground Water Board, state mining and groundwater departments; senior officers reach director-level posts.',
        'Private: mining companies, oil & gas, geotechnical consultancies and environmental firms, where field allowances add up.'] },
  ],
  sources: [UPSC, ['Geological Survey of India', 'https://www.gsi.gov.in/']],
},
{
  slug: 'insolvency-professional', name: 'Insolvency Professional', title: 'Insolvency Professional (IBBI)',
  intro: 'From a graduate or professional qualification to an IBBI-registered insolvency professional: the experience route or the Graduate Insolvency Programme, the Limited Insolvency Examination, IPA enrolment, the pre-registration course, then registration and an Authorisation for Assignment.',
  glance: [['Regulator', 'IBBI'], ['Exam', 'Limited Insolvency Examination'], ['Young route', 'Graduate Insolvency Programme'], ['Enrol with', 'Insolvency Professional Agency']],
  phases: [
    { title: 'Graduate or professional qualification', when: 'After Class 12', summary: 'Law, CA, CS, CMA or management.',
      points: [
        'Any Class 12 stream works; you qualify later through a professional qualification plus experience, or the GIP.',
        'Common bases: advocate, CA, CS, CMA or a management degree.',
        'Non-residents cannot practise as IPs.'] },
    { title: 'Experience route or GIP', when: 'Years of work, or 2 years', summary: 'Build the years the IP Regulations list, or join IBBI\'s Graduate Insolvency Programme.',
      points: [
        'Experience route: a professional membership or degree plus the years of professional/managerial experience the IP Regulations list (for example 10 years for professionals).',
        'Graduate route: IBBI\'s two-year Graduate Insolvency Programme for young graduates and professionals with less than 10 years\' experience.',
        'A fresh graduate cannot enter directly through the experience route.'] },
    { title: 'Limited Insolvency Examination', when: 'Qualifying exam', summary: 'Insolvency law, corporate law, finance and valuation basics.',
      points: [
        'The Limited Insolvency Examination is the qualifying exam for IPs; its syllabus and format are published for IBBI.',
        'It covers insolvency law, corporate law, finance and valuation basics.',
        'You must enrol with an IPA within 12 months of passing.'] },
    { title: 'Enrol with an IPA and take its course', when: 'Within 12 months', summary: 'Insolvency Professional Agencies enrol and supervise IPs.',
      points: [
        'IPAs are front-line regulators that enrol and supervise IPs; IBBI lists them.',
        'Complete the IPA\'s pre-registration educational course.',
        'Then apply to IBBI for registration.'] },
    { title: 'IBBI registration and practice', when: 'After registration', summary: 'An Authorisation for Assignment lets you take cases.',
      points: [
        'After IBBI registration you need an Authorisation for Assignment to take cases.',
        'Work comes from creditors, NCLT appointments and banks; fees for each assignment are approved by creditors under IBBI rules.',
        'Growth path: associate → IP → partner in an insolvency professional entity.'] },
  ],
  sources: [IBBI],
},
{
  slug: 'investment-adviser', name: 'Investment Adviser', title: 'SEBI Registered Investment Adviser (RIA)',
  intro: 'From graduation to a SEBI Registered Investment Adviser: NISM Series X-A and X-B, SEBI registration under the Investment Advisers Regulations, then a fee-only advisory practice.',
  glance: [['Regulator', 'SEBI'], ['Certifications', 'NISM Series X-A and X-B'], ['Education', 'Graduate degree'], ['Role', 'Fee-only investment advice']],
  phases: [
    { title: 'Graduate', when: 'After Class 12', summary: 'Any discipline; finance, commerce or economics helps.',
      points: [
        'A graduate degree in any discipline is enough — SEBI relaxed the earlier postgraduate requirement in its December 2024 amendments.',
        'Commerce, finance or economics helps with the content.',
        'Any Class 12 stream can lead here.'] },
    { title: 'NISM Series X-A (Level 1)', when: 'After or during graduation', summary: 'Basics of personal finance and regulation.',
      points: [
        'NISM Series X-A is the Investment Adviser (Level 1) certification.',
        'It covers the basics of personal finance and regulation.',
        'It is a required step before X-B.'] },
    { title: 'NISM Series X-B (Level 2)', when: 'Next', summary: 'Advanced planning and advisory.',
      points: [
        'NISM Series X-B is the Investment Adviser (Level 2) certification.',
        'It covers advanced financial planning and advisory.',
        'Keep both certifications valid as SEBI requires.'] },
    { title: 'Apply to SEBI', when: 'When certified', summary: 'Registration as an individual Investment Adviser.',
      points: [
        'Apply under the SEBI (Investment Advisers) Regulations, 2013 as amended.',
        'Meet SEBI\'s fit-and-proper criteria and the deposit and other registration conditions.',
        'CFA and financial-planning credentials add depth but are not SEBI registration.'] },
    { title: 'Build a fee-only practice', when: 'After registration', summary: 'Fee-only clients, compliance and record-keeping.',
      points: [
        'RIAs charge clients a fee for advice; mutual-fund distributors earn commissions — SEBI keeps the two separate.',
        'Independent RIAs build income slowly as the client base grows; advisory firms also hire certified staff.',
        'Growth path: associate → RIA → principal of an advisory firm.'] },
  ],
  sources: [SEBI, NISM],
},
{
  slug: 'loco-pilot', name: 'Loco Pilot', title: 'Railway Loco Pilot (RRB ALP)',
  intro: 'From Class 10 to driving Mail/Express trains: an ITI trade or engineering diploma from the RRB list, the RRB ALP CBT-1, CBT-2 and CBAT, the A-1 medical, then training as Assistant Loco Pilot and promotion through goods and passenger trains.',
  glance: [['Entry post', 'Assistant Loco Pilot (ALP)'], ['Pay at entry', 'Level 2, 7th CPC'], ['Exam stages', 'CBT-1 → CBT-2 → CBAT'], ['Medical', 'Standard A-1']],
  phases: [
    { title: 'Class 10 and the medical check', when: 'School years', summary: 'Any board; check the A-1 medical standard before you prepare.',
      points: [
        'Class 10 pass from any board is the base; Maths and Science basics help in the exam.',
        'The A-1 medical standard includes vision standards without glasses that rule out many candidates.',
        'Get tested early — candidates who fail A-1 cannot be appointed even after clearing every exam.'],
      tip: 'Read the medical section of the current RRB ALP notification and get your eyes tested before you start preparing.' },
    { title: 'ITI or engineering diploma', when: 'After Class 10', summary: 'A trade or branch named in the RRB ALP notification.',
      points: [
        'An ITI from NCVT/SCVT in a listed trade (for example Electrician, Fitter, Mechanic Diesel), or a Course Completed Act Apprenticeship in those trades.',
        'Or a diploma/degree in Mechanical, Electrical, Electronics or Automobile Engineering, or another branch the notification lists.',
        'Age limits and category relaxations are fixed in each RRB ALP notification.'] },
    { title: 'RRB ALP CBT-1 and CBT-2', when: 'When RRB notifies', summary: 'A qualifying screening test, then Part A for merit and a qualifying trade Part B.',
      points: [
        'CBT-1: maths, reasoning, general science and general awareness — qualifying only, marks do not count in final merit.',
        'CBT-2 Part A (maths, reasoning, science, awareness) counts for merit.',
        'CBT-2 Part B is a qualifying trade test for your ITI/diploma field.'] },
    { title: 'CBAT, documents and medical', when: 'After CBT-2', summary: 'Psychometric aptitude tests, document verification and the A-1 medical.',
      points: [
        'The Computer Based Aptitude Test checks memory, concentration, perception and reaction for train driving.',
        'You must clear the minimum score in each test battery.',
        'Document verification and the A-1 medical follow.'] },
    { title: 'Training and promotions', when: 'After appointment', summary: 'Initial training, then ALP; promotion to goods, passenger and Mail/Express.',
      points: [
        'Assistant Loco Pilot pay: Level 2 of the 7th CPC matrix (₹19,900 entry basic), plus DA, HRA and running allowance.',
        'Growth path: ALP → Sr ALP → Loco Pilot (Shunter/Goods) → Passenger → Mail/Express → Loco Inspector; promotion is seniority-based and takes many years.',
        'Metro rail corporations hire train operators separately.'],
      facts: [['Entry pay', 'Level 2 (₹19,900 basic)'], ['Employer', 'Indian Railways zonal railways']] },
  ],
  sources: [['Indian Railways — RRBs', 'https://indianrailways.gov.in/']],
},
{
  slug: 'marine-engineer', name: 'Marine Engineer', title: 'Marine Engineer',
  intro: 'From Class 12 PCM to Chief Engineer: IMU CET, a 4-year B.Tech in Marine Engineering, engine-cadet sea time, then DG Shipping MEO Class IV, III, II and I certificates.',
  glance: [['Entrance', 'IMU CET'], ['Degree', 'B.Tech Marine Engineering (4 yrs)'], ['Licences', 'MEO Class IV → Class I'], ['Top rank', 'Chief Engineer']],
  phases: [
    { title: 'Class 12 PCM', when: 'School years', summary: 'Keep PCM and English marks above the IMU minimums.',
      points: [
        'IMU programmes need Class 12 Physics, Chemistry and Mathematics with a 60% average.',
        'At least 50% in English in Class 10 or 12.',
        'Age limits, medical fitness and eyesight standards follow the IMU notice and DG Shipping rules.'] },
    { title: 'IMU CET', when: 'Class 12 year', summary: 'Your rank decides your institute.',
      points: [
        'IMU CET is the entrance for IMU and DG Shipping-approved marine engineering programmes.',
        'It is the main admission route — check each institute\'s notice.',
        'Train only at institutes listed as approved on the DG Shipping website.'] },
    { title: 'B.Tech Marine Engineering', when: '4 years', summary: 'Workshop and ship-in-campus training.',
      points: [
        'The 4-year B.Tech includes workshop and ship-in-campus training.',
        'Mechanical/electrical graduates can instead enter through DG Shipping-approved graduate marine engineering (GME) courses.',
        'DG Shipping publishes the list of approved maritime training institutes.'] },
    { title: 'Engine Cadet and MEO Class IV', when: 'First sea time', summary: 'Onboard training, then the first Certificate of Competency.',
      points: [
        'Engine cadets complete the sea time for the first certificate and are paid a training stipend.',
        'MEO Class IV is the first Certificate of Competency for engine officers, issued by DG Shipping after sea time and written/oral exams.',
        'With Class IV you sail as Fourth Engineer.'] },
    { title: 'MEO Class III, II and I', when: 'Years at sea', summary: 'More sea time and exams lead to Second and Chief Engineer.',
      points: [
        'Each higher MEO certificate needs more sea time and DG Shipping exams.',
        'Growth path: Engine Cadet → 4th → 3rd → 2nd → Chief Engineer → Technical Superintendent; Chief Engineers are among the highest-paid seafarers on foreign-going ships.',
        'Ashore: marine surveyor, classification society, ship repair or maritime training.'] },
  ],
  sources: [IMU, DGS],
},
{
  slug: 'merchant-navy-officer', name: 'Merchant Navy Deck Officer', title: 'Merchant Navy Deck Officer',
  intro: 'From Class 12 PCM to ship\'s Master: IMU CET, pre-sea training (B.Sc Nautical Science or DNS), deck-cadet sea time, then DG Shipping Second Mate, Chief Mate and Master certificates.',
  glance: [['Entrance', 'IMU CET'], ['Pre-sea course', 'B.Sc Nautical Science (3 yrs) or DNS (1 yr)'], ['Licences', 'DG Shipping Certificates of Competency'], ['Top rank', 'Master (Captain)']],
  phases: [
    { title: 'Class 12 PCM', when: 'School years', summary: 'PCM average above 60% and English above 50%.',
      points: [
        'IMU asks for Class 12 Physics, Chemistry and Mathematics with a 60% PCM average for B.Sc Nautical Science.',
        'At least 50% in English in Class 10 or 12.',
        'Age limit, unmarried status, passport and DG Shipping medical/eyesight standards apply — check the current IMU notice.'] },
    { title: 'IMU CET', when: 'Class 12 year', summary: 'An online entrance; your rank decides institute and course.',
      points: [
        'IMU CET is the common entrance for nautical and marine engineering programmes at IMU and most DG Shipping-approved institutes.',
        'DNS route: Class 12 PCM (60%), or a B.Sc in a listed science subject, or a B.E./B.Tech, as the IMU notification lists.',
        'Many cadets join through a shipping-company sponsorship, which helps secure the onboard cadet berth.'] },
    { title: 'Pre-sea training', when: 'DNS 1 yr · B.Sc 3 yrs', summary: 'B.Sc Nautical Science (3 years) or DNS (1 year) at a DG Shipping-approved institute.',
      points: [
        'B.Sc Nautical Science is a 3-year degree; DNS is a 1-year diploma — both are deck-officer routes.',
        'Only train at institutes listed as approved on the DG Shipping website; unapproved courses do not count.',
        'Register for an INDoS number and get a Continuous Discharge Certificate (CDC) to sail.'] },
    { title: 'Deck Cadet and Second Mate', when: 'First sea time', summary: 'Onboard training with a record book, then the Second Mate Certificate of Competency.',
      points: [
        'Deck cadets train onboard with a training record book; the required sea time is set by DG Shipping and a stipend is paid.',
        'Post-sea courses and DG Shipping written and oral exams lead to the Second Mate CoC.',
        'Then you sail as Third/Second Officer; pay rises sharply once you hold a CoC.'] },
    { title: 'Chief Mate and Master', when: 'Years at sea', summary: 'More sea time and exams lead to Chief Officer and Master.',
      points: [
        'Chief Mate and Master certificates each need their own sea time, post-sea courses and DG Shipping exams.',
        'Growth path: Deck Cadet → 3rd Officer → 2nd Officer → Chief Officer → Master — it takes many years.',
        'Ashore later: port operations, marine surveying, ship management, maritime training and DG Shipping roles.'] },
  ],
  sources: [IMU, DGS],
},
{
  slug: 'nuclear-medicine-technologist', name: 'Nuclear Medicine Technologist', title: 'Nuclear Medicine Technologist',
  intro: 'From Class 12 PCB to a nuclear medicine technologist: a B.Sc in Nuclear Medicine Technology (or a B.Sc plus PG diploma), a hospital internship, then PET-CT and nuclear medicine work under AERB rules.',
  glance: [['Degree', 'B.Sc Nuclear Medicine Technology'], ['Radiation regulator', 'AERB'], ['Profession law', 'NCAHP Act, 2021'], ['Work in', 'PET-CT & nuclear medicine units']],
  phases: [
    { title: 'Class 12 PCB', when: 'School years', summary: 'Physics is as important as Biology here.',
      points: [
        'Class 12 with Physics, Chemistry and Biology is the standard requirement.',
        'Most universities ask for Biology — PCM students should check each university\'s rules.',
        'Minimum marks and age are set by each university.'] },
    { title: 'Admission', when: 'After Class 12', summary: 'Merit or the university\'s own entrance; no single national exam.',
      points: [
        'Admission is by merit or the university\'s own entrance test.',
        'Choose a programme attached to an AERB-licensed facility, so your clinical training counts.',
        'Course length and internship differ by university.'] },
    { title: 'B.Sc NMT, or B.Sc + PG diploma', when: 'Undergraduate', summary: 'Two routes into the profession.',
      points: [
        'Route 1: B.Sc Nuclear Medicine Technology.',
        'Route 2: a science graduate takes a postgraduate NMT diploma.',
        'Nuclear medicine gives a small radioactive tracer and images how organs work; radiology uses external X-rays, CT and MRI.'] },
    { title: 'Internship', when: 'End of the course', summary: 'In a hospital nuclear medicine department.',
      points: [
        'The internship is done in a hospital nuclear medicine department.',
        'Exposure is controlled by AERB rules, monitoring badges and safety procedures — following them strictly is part of the job.',
        'AERB licenses nuclear medicine facilities and enforces radiation-safety rules, including qualified staff.'] },
    { title: 'Technologist job and growth', when: 'After the course', summary: 'PET-CT centres, cancer hospitals and research institutes.',
      points: [
        'Employers: cancer hospitals, multi-speciality hospitals, PET-CT diagnostic centres and research institutes; PET-CT experience is valued.',
        'Growth path: technologist → senior technologist → chief technologist / radiation-safety roles.',
        'The NCAHP Act, 2021 regulates allied and healthcare professions; further study: M.Sc in nuclear medicine technology or medical physics.'] },
  ],
  sources: [['AERB', 'https://www.aerb.gov.in/'], INDIACODE],
},
{
  slug: 'patent-agent', name: 'Patent Agent', title: 'Patent Agent & Patent Attorney',
  intro: 'From Class 12 Science to a registered patent agent: a science, engineering or technology degree, patent-law preparation, the Patent Agent Examination (Paper I and II), registration at 21+, and optionally an LLB to become a patent attorney.',
  glance: [['Qualifying exam', 'Patent Agent Examination'], ['Eligibility', 'Science / engineering / tech degree'], ['Minimum age', '21 years'], ['Regulator', 'CGPDTM (IP India)']],
  phases: [
    { title: 'Class 12 Science', when: 'School years', summary: 'PCM or PCB — the degree must be in science, engineering or technology.',
      points: [
        'The degree must be in science, engineering or technology, so Class 12 Science is the practical route.',
        'B.Com or BA graduates cannot become patent agents.',
        'You must be an Indian citizen.'] },
    { title: 'Science / engineering / tech degree', when: 'Undergraduate', summary: 'Pharma, biotech, electronics and computer science are in high demand.',
      points: [
        'A degree in science, engineering or technology from a recognised university, or an equivalent the Government specifies.',
        'Pharma, biotech, electronics and computer-science backgrounds are in high demand.',
        'Patent search and analytics roles are a common first job.'] },
    { title: 'Prepare patent law', when: 'Before the exam', summary: 'The Patents Act, 1970 and Patents Rules — drafting practice matters most.',
      points: [
        'Study the Patents Act, 1970 and the Patents Rules.',
        'Practise drafting specifications and claims, and interpreting patent documents.',
        'Section 126 of the Patents Act sets out who may register.'] },
    { title: 'Patent Agent Examination', when: 'As IP India announces', summary: 'Paper I (objective) and Paper II (descriptive), per the current notice.',
      points: [
        'Paper I: objective, multiple-choice questions on the Patents Act and Rules.',
        'Paper II: descriptive — drafting specifications and claims, and interpreting patent documents.',
        'Minimum marks per paper and any viva are fixed in each year\'s notice from the CGPDTM (IP India).'] },
    { title: 'Register and practise', when: 'Age 21+', summary: 'Register, then join an IP firm, a company IP cell or start your own practice.',
      points: [
        'You must be at least 21; apply for registration with the required documents (including your degree) within the time the result notice allows.',
        'Employers: IP law firms, pharma and tech companies\' IP cells, patent analytics firms, university tech-transfer offices; growth: analyst → agent → senior associate → partner / head of IP.',
        'Optional: an LLB makes you a patent attorney who can also argue cases in court; the Patent Office recruits Examiners through its own exam.'] },
  ],
  sources: [IPINDIA, INDIACODE],
},
{
  slug: 'perfusionist', name: 'Perfusionist', title: 'Perfusionist',
  intro: 'From Class 12 PCB to running the heart-lung machine: a B.Sc in Perfusion Technology, a clinical internship in cardiac theatres, a perfusionist post in a cardiac surgery team, then ECMO or paediatric specialisation.',
  glance: [['Degree', 'B.Sc Perfusion Technology'], ['Duration', '3–4 yrs incl. internship (varies)'], ['Profession law', 'NCAHP Act, 2021'], ['Work in', 'Cardiac surgery & ICU']],
  phases: [
    { title: 'Class 12 PCB with English', when: 'School years', summary: 'Physics, Chemistry and Biology; English is often compulsory.',
      points: [
        'Class 12 with Physics, Chemistry and Biology.',
        'English is often compulsory.',
        'Minimum marks are set by each university.'] },
    { title: 'Admission', when: 'After Class 12', summary: 'University merit lists or allied-health entrance tests.',
      points: [
        'Admission is by merit or the university/state allied-health entrance.',
        'There is no single national exam.',
        'Pick a course attached to a hospital with an active cardiac surgery programme.'] },
    { title: 'B.Sc Perfusion Technology', when: '3–4 years incl. internship', summary: 'Physiology, pharmacology and perfusion equipment.',
      points: [
        'Usually three years plus an internship; some universities run 3.5–4-year programmes.',
        'Subjects cover physiology, pharmacology and perfusion equipment.',
        'Perfusion is one of the allied health professions covered by the NCAHP Act, 2021, with national and state councils for registration.'] },
    { title: 'Clinical internship', when: 'End of the course', summary: 'Hands-on in cardiac theatres.',
      points: [
        'The internship is hands-on in cardiac surgery theatres.',
        'You learn to run the heart-lung machine during open-heart surgery.',
        'Corporate and teaching hospitals hire after the internship.'] },
    { title: 'Perfusionist and specialisation', when: 'After the course', summary: 'Join a cardiac surgery team; specialise in ECMO, paediatric perfusion or an M.Sc.',
      points: [
        'Employers: cardiac surgery hospitals, medical colleges, ECMO programmes and device companies (clinical specialists).',
        'Growth path: perfusionist → senior → chief perfusionist leading a cardiac centre\'s team; few are trained, so experience is valued.',
        'Specialise in ECMO life support or paediatric perfusion, or take an M.Sc; some countries need extra certification to practise.'] },
  ],
  sources: [INDIACODE],
},
{
  slug: 'prosthetist-orthotist', name: 'Prosthetist & Orthotist', title: 'Prosthetist & Orthotist (BPO)',
  intro: 'From Class 12 Science to an RCI-registered prosthetist and orthotist: an RCI-recognised Bachelor in Prosthetics & Orthotics (4 years + 6-month internship), RCI registration, then hospital, rehab, industry or a master\'s.',
  glance: [['Degree', 'Bachelor in Prosthetics & Orthotics'], ['Duration', '4 yrs + 6-month internship'], ['Registration', 'RCI'], ['Entry', 'Class 12 Science + English']],
  phases: [
    { title: 'Class 12 Science with English', when: 'School years', summary: 'Physics and Chemistry with Biology or Mathematics, plus English.',
      points: [
        'Class 12 Science with Physics, Chemistry and Biology or Mathematics.',
        'English is required; minimum aggregate is set by the institute.',
        'PCM students are eligible as well as PCB.'] },
    { title: 'Apply to RCI-recognised institutes', when: 'After Class 12', summary: 'National institutes and universities; some run entrance tests.',
      points: [
        'Only courses recognised by RCI lead to registration — check RCI\'s list.',
        'National institutes under the Department of Empowerment of Persons with Disabilities and some universities run entrance tests.',
        'Some institutes let diploma holders from RCI-approved programmes join the BPO in a later year.'] },
    { title: 'BPO course', when: '4 years', summary: 'Anatomy, biomechanics, materials and clinical P&O.',
      points: [
        'Four academic years under the RCI framework.',
        'Subjects cover anatomy, biomechanics, materials and clinical prosthetics & orthotics.',
        'Hospitals, NGOs and limb-fitting centres hire freshers.'] },
    { title: 'Six-month internship', when: 'After the course', summary: 'Supervised clinical work.',
      points: [
        'A six-month supervised clinical internship follows the four years.',
        'You fit artificial limbs and braces under supervision.',
        'Complete it before applying for RCI registration.'] },
    { title: 'RCI registration and practice', when: 'After the internship', summary: 'Registration is needed to practise legally.',
      points: [
        'Rehabilitation professionals must be on RCI\'s Central Rehabilitation Register to practise.',
        'Employers: government and private hospitals, national institutes, rehabilitation centres, NGOs and P&O companies; growth: P&O → senior clinician → head of department / own clinic.',
        'An MPO (Master in Prosthetics and Orthotics) opens teaching and research.'] },
  ],
  sources: [['Rehabilitation Council of India', 'https://rehabcouncil.nic.in/']],
},
{
  slug: 'registered-valuer', name: 'Registered Valuer', title: 'Registered Valuer (IBBI)',
  intro: 'From the right degree to an IBBI Registered Valuer: experience as the Rules require, RVO membership and its 50-hour course, the IBBI valuation exam for your asset class, then registration and yearly continuing education.',
  glance: [['Regulator', 'IBBI'], ['Asset classes', 'Land & building · Plant & machinery · Securities'], ['Training', '50-hour RVO course'], ['Exam', 'IBBI valuation exam']],
  phases: [
    { title: 'Get the right degree', when: 'After Class 12', summary: 'Matched to the asset class you want.',
      points: [
        'Engineering for plant & machinery.',
        'CA/CS/CMA/MBA-finance for securities or financial assets.',
        'Civil engineering or architecture for land & building.'] },
    { title: 'Build experience', when: 'Years of work', summary: 'In valuation, audit, engineering or finance, as the Rules require.',
      points: [
        'The Companies (Registered Valuers and Valuation) Rules, 2017 set the minimum years of experience for each qualification.',
        'Experience can come from valuation, audit, engineering or finance work.',
        'Valuation advisory teams in consulting firms offer salaried roles.'] },
    { title: 'Join an RVO and take its course', when: 'Before the exam', summary: 'IBBI publishes the list of recognised Registered Valuers Organisations.',
      points: [
        'Enrol with an IBBI-recognised RVO.',
        'Complete its 50-hour educational course.',
        'The course certificate is uploaded when you enrol for the exam.'] },
    { title: 'IBBI valuation exam', when: 'Per asset class', summary: 'Separate exams for each asset class.',
      points: [
        'Separate exams for land & building, plant & machinery, and securities or financial assets.',
        'IBBI publishes and regularly reviews the curriculum for each asset class.',
        'You can register in more than one class if you meet the eligibility and pass each exam.'] },
    { title: 'Register and practise', when: 'After passing', summary: 'Register with IBBI, then practise with continuing education every year.',
      points: [
        'Apply to IBBI for registration, then complete continuing education every year.',
        'Work comes from insolvency professionals, companies, banks, courts and tribunals; most valuers earn per valuation report.',
        'Often combined with CA/CMA practice, engineering consultancy or real-estate advisory; complex insolvency and M&A valuations pay well.'] },
  ],
  sources: [IBBI, ['Ministry of Corporate Affairs', 'https://www.mca.gov.in/']],
},
{
  slug: 'research-analyst', name: 'Research Analyst', title: 'SEBI Registered Research Analyst',
  intro: 'From graduation to equity research: NISM Series XV, modelling and valuation skills, an associate role in a research team, then senior analyst, head of research or your own SEBI registration.',
  glance: [['Regulator', 'SEBI'], ['Certification', 'NISM Series XV'], ['Education', 'Graduate degree'], ['Typical employers', 'Brokerages, fund houses']],
  phases: [
    { title: 'Graduate', when: 'After Class 12', summary: 'Commerce, economics, engineering or finance.',
      points: [
        'A graduate degree in any discipline — SEBI\'s December 2024 amendments relaxed the earlier requirements.',
        'Strong accounting, maths and writing skills matter most.',
        'Engineers often cover tech and industrial sectors.'] },
    { title: 'NISM Series XV', when: 'After or during graduation', summary: 'The Research Analyst certification SEBI requires.',
      points: [
        'NISM Series XV: Research Analyst certification is required by SEBI.',
        'Employees publishing research must also hold it.',
        'CFA, FRM or an MBA in finance help in hiring but do not replace the NISM/SEBI requirements.'] },
    { title: 'Learn modelling and valuation', when: 'Alongside', summary: 'Accounting, financial modelling and sector knowledge.',
      points: [
        'Build accounting and financial-modelling skills.',
        'Learn valuation methods.',
        'Pick a sector and follow it closely.'] },
    { title: 'Join a research team', when: 'Entry level', summary: 'Associate analyst at a brokerage, fund or research firm.',
      points: [
        'Brokerages and research firms hire graduates and MBAs as associate analysts.',
        'Employers: stock brokers, mutual funds, insurers, PMS and AIFs, independent research houses, credit-rating agencies.',
        'As an employee, the firm holds the SEBI registration and you follow its policies.'] },
    { title: 'Grow or go independent', when: 'Experienced', summary: 'Senior analyst, sector head, or your own SEBI registration.',
      points: [
        'Growth path: associate → analyst → senior analyst → head of research / fund manager; owning a sector raises pay.',
        'Independent practice needs SEBI registration under the Research Analysts Regulations, 2014 as amended, with deposit and compliance conditions.',
        'Investment Advisers give personal advice under a different SEBI registration.'] },
  ],
  sources: [SEBI, NISM],
},
{
  slug: 'statistician', name: 'Statistician', title: 'Statistician (Indian Statistical Service)',
  intro: 'From Class 12 with Maths to the Indian Statistical Service or a data career: B.Sc Statistics, an optional M.Sc, the UPSC IES/ISS exam, then ISS officer or industry analytics.',
  glance: [['Govt service', 'Indian Statistical Service'], ['Exam', 'UPSC IES/ISS'], ['Ministry', 'MoSPI'], ['Pay at entry', 'Level 10, 7th CPC']],
  phases: [
    { title: 'Class 12 with Maths', when: 'School years', summary: 'Maths is what matters; Commerce and Arts students with Maths can join too.',
      points: [
        'Build a strong maths foundation in Class 11–12.',
        'Many universities admit Commerce and Arts students with Maths to B.Sc/BA Statistics.',
        'Science students are eligible by default.'] },
    { title: 'B.Sc Statistics', when: 'Undergraduate', summary: 'Or Maths with Statistics.',
      points: [
        'For ISS, Statistics, Mathematical Statistics or Applied Statistics must be one of the subjects in your bachelor\'s.',
        'A BA Economics counts only if Statistics was one of the subjects.',
        'Learn R, Python or SQL — private roles ask for them.'] },
    { title: 'M.Sc Statistics (optional)', when: 'Postgraduate', summary: 'Helps for UPSC and research.',
      points: [
        'A master\'s in Statistics, Mathematical Statistics or Applied Statistics also makes you eligible for ISS.',
        'It helps for UPSC preparation and research.',
        'The Indian Statistical Institute and universities run statistics research.'] },
    { title: 'UPSC IES/ISS exam', when: 'Yearly UPSC cycle', summary: 'General English, General Studies and statistics papers, then an interview.',
      points: [
        'UPSC conducts one combined examination for the Indian Economic Service and Indian Statistical Service, with different papers for each.',
        'ISS papers: General English, General Studies and statistics papers, followed by an interview.',
        'Age limits and relaxations are in the current UPSC notice; other routes are SSC CGL statistical posts and state statistical services.'] },
    { title: 'ISS officer or analyst', when: 'After selection', summary: 'Government service or industry analytics.',
      points: [
        `ISS entry: ${PAY_L10}`,
        'Government: MoSPI, NSO, ministries, RBI and statistical bodies; senior ISS officers serve across MoSPI and ministries.',
        'Private: analytics firms, pharma (clinical trials), insurance, banks and market research.'] },
  ],
  sources: [UPSC, ['MoSPI', 'https://www.mospi.gov.in/']],
},
{
  slug: 'trademark-agent', name: 'Trademark Agent', title: 'Trademark Agent',
  intro: 'From any stream to a registered trademark agent: graduate, study the Trade Marks Act and Rules, pass the Trade Marks Agent Examination (advocates and ICSI members are exempt), then register and practise at 21+.',
  glance: [['Qualifying exam', 'Trade Marks Agent Examination'], ['Eligibility', 'Graduate, any discipline'], ['Minimum age', '21 years'], ['Exempt', 'Advocates, ICSI members']],
  phases: [
    { title: 'Class 12, any stream', when: 'School years', summary: 'No subject requirement.',
      points: [
        'Any stream works — there is no subject requirement.',
        'You must be an Indian citizen.',
        'Law, commerce and management degrees help later.'] },
    { title: 'Graduate in any discipline', when: 'Undergraduate', summary: 'A graduate of a recognised Indian university, or an equivalent qualification.',
      points: [
        'B.Com and BA graduates are eligible.',
        'Advocates and ICSI members can register without the exam.',
        'Junior roles in IP firms or brand teams are a common start.'] },
    { title: 'Study trademark law', when: 'Before the exam', summary: 'The Trade Marks Act, 1999 and the Trade Marks Rules, 2017.',
      points: [
        'Study the Trade Marks Act, 1999.',
        'Study the Trade Marks Rules, 2017.',
        'Note the disqualifications in the Rules (for example, an undischarged insolvent).'] },
    { title: 'Trade Marks Agent Examination', when: 'As IP India announces', summary: 'Conducted by the CGPDTM alongside the Patent Agent Examination.',
      points: [
        'The Office of the CGPDTM (IP India) conducts it.',
        'Pattern and pass marks are set in each year\'s official notice — read it before preparing.',
        'It is a separate exam and register from the patent agent one.'] },
    { title: 'Register and practise', when: 'Age 21+', summary: 'Firm, in-house brand team or own practice.',
      points: [
        'You must be at least 21 to register.',
        'Employers: IP and corporate law firms, consumer brands, media and FMCG companies, start-up advisory firms; independent agents earn per filing and per matter.',
        'Growth path: associate → registered agent → senior associate → partner / own practice; combine with company-secretarial, copyright and design work.'] },
  ],
  sources: [IPINDIA, INDIACODE],
},
{
  slug: 'veterinarian', name: 'Veterinarian', title: 'Veterinarian (BVSc & AH)',
  intro: 'From Class 12 PCB to a registered veterinarian: NEET-UG, VCI counselling for the 15% All India Quota or your state\'s 85%, the BVSc & AH degree with a compulsory internship, then registration and practice.',
  glance: [['Degree', 'BVSc & AH'], ['Entrance', 'NEET-UG (15% VCI quota)'], ['State seats', '85% via state process'], ['Regulator', 'Veterinary Council of India']],
  phases: [
    { title: 'Class 12 PCB with English', when: 'School years', summary: 'Physics, Chemistry, Biology and English.',
      points: [
        'Class 12 with Physics, Chemistry, Biology and English.',
        'Minimum marks and age are set by VCI and the state.',
        'Commerce and Arts are not eligible.'] },
    { title: 'NEET-UG', when: 'Class 12 year', summary: 'The national entrance conducted by NTA.',
      points: [
        'NEET-UG is conducted by the National Testing Agency.',
        'VCI uses the NEET-UG merit list for the 15% All India Quota.',
        'Many states also use NEET for their seats — check your state\'s rules.'] },
    { title: 'Counselling', when: 'After results', summary: 'VCI for the 15% All India Quota, the state authority for the rest.',
      points: [
        'VCI counselling fills 15% All India Quota seats in recognised colleges.',
        'State authorities fill the other 85% under their own rules.',
        'Join both counselling processes if you are eligible.'] },
    { title: 'BVSc & AH and internship', when: 'Multi-year degree', summary: 'Animal anatomy, medicine, surgery and livestock production, then a compulsory clinical internship.',
      points: [
        'The degree covers animal anatomy, medicine, surgery and livestock production.',
        'A compulsory clinical internship is part of VCI\'s minimum standards.',
        'Check the current VCI regulations for the exact duration.'] },
    { title: 'Register and work', when: 'After the internship', summary: 'Practice, government service, industry or MVSc.',
      points: [
        'Registration under the Indian Veterinary Council Act, 1984 is needed to practise.',
        'State PSCs recruit Veterinary Officers / Veterinary Assistant Surgeons; pay follows each state\'s rules.',
        'Other employers: pet clinics, dairy and poultry firms, pharma, zoos and research institutes; MVSc and PhD for specialisation and teaching.'] },
  ],
  sources: [['Veterinary Council of India', 'https://vci.dahd.gov.in/'], ['NEET-UG (NTA)', 'https://neet.nta.nic.in/']],
},
];
