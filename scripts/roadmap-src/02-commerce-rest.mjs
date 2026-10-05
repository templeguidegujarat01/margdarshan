import { P, C, src } from './_lib.mjs';
const ICSI = ['ICSI official website', 'https://www.icsi.edu/'];
const ICMAI = ['ICMAI official website', 'https://icmai.in/'];

export default [
C('cs', 'CS', 'Company Secretary (CS)',
  'The ICSI route from Class 12 to Associate Company Secretary: CSEET entrance, Executive and Professional programmes, mandatory training and membership.',
  [['Total time', '~3–4 years'], ['Regulator', 'ICSI'], ['Entrance', 'CSEET (after Class 12)'], ['Exam sessions', 'June & December']],
  [
    P('Class 10–12: stream and early registration', 'Class 10–12', 'Any stream is eligible; Commerce with Accountancy and Business Studies helps.', [
      'CS is open to students of every stream. Commerce students find company law and accounting familiar from Class 11.',
      'You can enrol with ICSI while in Class 12 and take the entrance test in the same year.',
      'Build reading habits now: CS is theory-heavy (company law, securities law, drafting) and rewards clear writing.',
      'Create your ICSI student profile on the official portal early so you are not rushed at the CSEET registration window.'],
      [['Streams', 'Any'], ['Marks needed', 'No fixed Class 12 minimum for entry; CSEET has its own qualifying score']]),
    P('CSEET: the CS Executive Entrance Test', 'Class 12 / after Class 12', 'A short computer-based entrance test that opens the Executive Programme.', [
      'CSEET replaced the old Foundation Programme. It tests Business Communication, Legal Aptitude and Logical Reasoning, Economic and Business Environment, and Current Affairs.',
      'The test is held several times a year (ICSI schedules multiple windows); you can register once you are in or past Class 12.',
      'A qualifying score (50% overall) is required to move to the Executive Programme.',
      'Graduates in any discipline can skip CSEET and register directly for the Executive Programme.'],
      [['Mode', 'Online, computer-based'], ['Qualifying score', '50% overall'], ['Skip route', 'Graduates register directly for Executive']]),
    P('Executive Programme', 'Year 1–2', 'Seven papers in two modules covering company law, tax, securities law and accounting.', [
      'Module 1 includes Jurisprudence, Interpretation and General Laws, Company Law, Setting up of Business Entities and Closure, and Tax Laws.',
      'Module 2 includes Corporate and Management Accounting, Securities Laws and Capital Markets, and Economic, Business and Commercial Laws.',
      'Exams are held twice a year, in June and December; you can attempt one or both modules.',
      'Pass rule: 40% in each paper and 50% aggregate in the module.'],
      [['Papers', '7 in 2 modules'], ['Sessions', 'June & December'], ['Pass rule', '40% paper, 50% aggregate']],
      'Start your Executive Development Programme (a short compulsory orientation) as soon as you are eligible.'),
    P('Professional Programme', 'Year 2–3', 'Advanced governance, compliance, drafting and electives across three modules.', [
      'Modules cover Governance, Risk Management, Compliance and Ethics, Advanced Tax Laws, Drafting, Pleadings and Appearances, Secretarial Audit and Due Diligence, Corporate Restructuring and Insolvency, and Resolution of Corporate Disputes.',
      'You also choose electives such as banking law, insurance law, intellectual property rights or forensic audit.',
      'A multidisciplinary case-study paper tests how you combine knowledge in practical situations.',
      'Same 40% / 50% passing rule applies; sessions are June and December.'],
      [['Modules', '3'], ['Electives', 'Choose from the ICSI list'], ['Pass rule', '40% paper, 50% aggregate']]),
    P('Mandatory training and orientation', 'During programmes', 'Executive Development, Professional Development and about 15 months of practical training.', [
      'Executive Development Programme (EDP) is completed after the Executive stage; Professional Development Programme (PDP) is completed alongside the Professional stage.',
      'Practical training of about 15 months is done in a company, a practising Company Secretary firm or another approved organisation.',
      'You learn board and general meeting procedure, ROC filings, SEBI and stock-exchange compliance and secretarial records.',
      'Keep your training log and certificates; ICSI verifies them before membership.'],
      [['Practical training', '~15 months'], ['Where', 'Company or practising CS firm']]),
    P('Membership: ACS, then FCS', 'After training', 'Apply to ICSI to become an Associate Company Secretary.', [
      'After clearing all papers and completing training, apply for membership of ICSI and become an Associate Company Secretary (ACS).',
      'To work as a practising Company Secretary you obtain a Certificate of Practice.',
      'After a further period of membership you can become a Fellow Company Secretary (FCS).',
      'Typical first roles: company secretary or compliance officer in listed companies, and associate in a practising CS firm.'],
      [['Designation', 'ACS, later FCS'], ['Practice', 'Certificate of Practice']]),
  ], [ICSI, src.cuet]),

C('cma', 'CMA', 'Cost & Management Accountant (CMA India)',
  'The ICMAI route: Foundation, Intermediate, Final, practical training and membership as a Cost and Management Accountant.',
  [['Total time', '~3–4 years'], ['Regulator', 'ICMAI'], ['Levels', 'Foundation, Inter, Final'], ['Pass rule', '40% paper, 50% aggregate']],
  [
    P('Class 10–12: choose and register', 'Class 10–12', 'Any stream can join; registration for Foundation opens after Class 10 or in Class 12.', [
      'CMA suits students interested in costing, pricing, budgeting and business decision-making.',
      'Commerce with Accountancy and Maths is comfortable, but Science and Arts students are eligible too.',
      'Register for the Foundation course on the ICMAI student portal with your Class 10 or 12 documents.',
      'Class 12 students can register while appearing for boards and take Foundation after passing Class 12.'],
      [['Streams', 'Any'], ['Fee', 'Low compared with other professional courses']]),
    P('Foundation level', 'After Class 12', 'Four papers covering law, accounting, maths-stats and economics-management.', [
      'Papers include Fundamentals of Business Laws and Business Communication, Fundamentals of Financial and Cost Accounting, Fundamentals of Business Mathematics and Statistics, and Fundamentals of Business Economics and Management.',
      'The exam is held in the ICMAI sessions each year; ICMAI has been adding more attempts, so check the current schedule.',
      'Pass rule: 40% in each paper and 50% aggregate.',
      'Graduates and those who have cleared higher levels of other courses can enter Intermediate directly and skip Foundation.'],
      [['Papers', '4'], ['Pass rule', '40% paper, 50% aggregate'], ['Skip route', 'Graduates may enter at Intermediate']]),
    P('Intermediate level', 'Year 2', 'Eight papers in two groups: costing, tax, audit, financial management and more.', [
      'Group I covers Business Laws and Ethics, Financial Accounting, Direct and Indirect Taxation, and Cost Accounting.',
      'Group II covers Operations Management and Strategic Management, Corporate Accounting and Auditing, Financial Management and Business Data Analytics, and Management Accounting.',
      'You may attempt one or both groups; the same 40% / 50% passing rule applies.',
      'Complete the Orientation Course and other compulsory courses scheduled by ICMAI around this stage.'],
      [['Papers', '8 in 2 groups'], ['Pass rule', '40% paper, 50% group']]),
    P('Practical training', 'After Intermediate', 'About 15 months of training, plus industrial exposure through the Orientation Course and approved placements.', [
      'Practical training is done with a practising Cost Accountant, a company with a cost or finance department, or another approved organisation.',
      'You work on costing, budgeting, internal audit, pricing and MIS reporting.',
      'Training is registered through the ICMAI portal and monitored with a training diary.',
      'It can run alongside your Final preparation, and ICMAI sets the time window.'],
      [['Training', '~15 months'], ['Where', 'Cost accountant firm or company']]),
    P('Final level', 'Year 3–4', 'Eight advanced papers in two groups, including strategic cost management and an elective.', [
      'Group III includes Corporate Laws and Compliance, Strategic Financial Management, Strategic Cost Management and Decision Making, and Direct Tax Laws and International Taxation.',
      'Group IV includes Cost and Management Audit, Corporate Financial Reporting, Indirect Tax Laws and Practice, and an elective paper.',
      'Pass rule is again 40% per paper and 50% in each group.',
      'Final is held in the ICMAI exam sessions; plan your attempts around the training schedule.'],
      [['Papers', '8 in 2 groups'], ['Pass rule', '40% paper, 50% group']]),
    P('Membership: ACMA and FCMA', 'After Final', 'Become an Associate Cost and Management Accountant.', [
      'After clearing Final and completing training, apply for associate membership and use the ACMA designation.',
      'After a period of membership you can become a Fellow (FCMA).',
      'Cost accountants audit cost records under the Companies Act and work in manufacturing, public sector, banking and consulting.',
      'Many CMAs apply to PSUs and move into finance leadership roles.'],
      [['Designation', 'ACMA, later FCMA']]),
  ], [ICMAI, src.ncs]),

C('cfa', 'CFA', 'Chartered Financial Analyst (CFA)',
  'The CFA Institute route: Level I, II and III exams, 4,000 hours of relevant work experience and the CFA charter.',
  [['Total time', '~2.5–4 years'], ['Body', 'CFA Institute (USA)'], ['Levels', 'I, II, III'], ['Work experience', '4,000 hours']],
  [
    P('Class 12 and graduation: build the base', 'Class 12 – graduation', 'Choose a degree that supports finance, and start early financial reading.', [
      'You cannot enrol until you are in the final year of a bachelor’s degree or hold one, so the first step is a degree: B.Com, BBA, Economics, Engineering or any other stream.',
      'Maths, statistics, economics and accounting build the base for the curriculum.',
      'Read business news, learn Excel, and understand basic accounting statements.',
      'Many students prepare for CFA alongside their final degree year or while working.'],
      [['Earliest entry', 'Final year of a bachelor’s degree'], ['Alternative', '4,000 hours of work experience']]),
    P('Enrol and register for Level I', 'Final year or after degree', 'Create a CFA Institute account, enrol in the programme and register for the exam window.', [
      'Eligibility: a bachelor’s degree or final-year student, or enough professional work experience (4,000 hours), plus a valid passport.',
      'You pay a one-time enrolment fee and an exam registration fee for each exam you take.',
      'Level I is offered in multiple windows each year; pick one and book your slot at a Pearson VUE centre in India.',
      'Level I has 180 multiple-choice questions on ethics, quantitative methods, economics, financial statement analysis, corporate issuers, equity, fixed income, derivatives, alternatives and portfolio management.'],
      [['Format', 'Computer-based MCQ'], ['Level I', '180 questions']]),
    P('Levels II and III', 'Next 1–2 years', 'Deeper valuation and portfolio management, then constructed-response exams.', [
      'Level II focuses on valuation with item-set questions based on case vignettes.',
      'Level III focuses on portfolio management and wealth planning, with constructed-response and item-set questions.',
      'The CFA Institute reviews the exam format and timing; check the current schedule for each level.',
      'Plan roughly 300 hours of study per level and consistent mock-exam practice.'],
      [['Level II', 'Item sets (vignettes)'], ['Level III', 'Constructed-response + item sets'], ['Study', '~300 hours per level']]),
    P('Work experience and ethics', 'During and after exams', 'Collect 4,000 hours of relevant work experience over at least 36 months.', [
      'Your work should involve investment decision-making or work that supports it; the CFA Institute reviews your experience.',
      'You submit professional references and sign the code of ethics.',
      'You also join a local member society, such as the CFA Society India.',
      'Complete this stage while working in research, banking, asset management or a similar role.'],
      [['Experience', '4,000 hours, 36 months minimum'], ['References', '2 professional references']]),
    P('Earn the CFA charter', 'After all requirements', 'Apply for the charter and use the CFA designation.', [
      'Once you pass Level III and meet the work and references requirement, you apply for the CFA charter.',
      'You pay annual membership dues and follow continuing professional ethics rules.',
      'Typical roles are equity research analyst, portfolio manager, risk analyst and investment banker.',
      'Pairing CFA with a degree or an MBA widens your options.'],
      [['Designation', 'CFA charterholder']]),
  ], [['CFA Institute', 'https://www.cfainstitute.org/'], src.ncs]),

C('frm', 'FRM', 'Financial Risk Manager (FRM)',
  'GARP’s two-part certification path with two years of risk work experience.',
  [['Total time', '~1–2 years'], ['Body', 'GARP'], ['Parts', 'Part I and Part II'], ['Experience', '2 years in risk']],
  [
    P('Education base', 'Graduation', 'There is no fixed degree requirement, but finance, maths and economics help.', [
      'GARP does not require a specific degree to sit the exam, so students from commerce, engineering, economics and statistics backgrounds all attempt FRM.',
      'Strengthen statistics, probability, basic accounting and Excel before enrolling.',
      'Final-year students or working professionals are the most common candidates.',
      'Read about banking, markets and risk to understand what you will be tested on.'],
      [['Degree', 'No fixed requirement'], ['Useful skills', 'Statistics, Excel, finance']]),
    P('Enrol and register for Part I', 'When ready', 'Register on the GARP website and choose an exam window.', [
      'Create a GARP account, pay the enrolment and exam fee, and choose your Part I exam date.',
      'Part I tests Foundations of Risk Management, Quantitative Analysis, Financial Markets and Products, and Valuation and Risk Models.',
      'Part I has 100 multiple-choice questions in a computer-based exam.',
      'GARP schedules multiple windows each year; check the current dates.'],
      [['Part I', '100 MCQs'], ['Mode', 'Computer-based']]),
    P('Part II', 'Within a few attempts', 'Advanced risk topics: market, credit, operational and liquidity risk, plus current issues.', [
      'Part II has 80 multiple-choice questions on market risk, credit risk, operational risk and resiliency, liquidity and treasury risk, and risk management and investment management.',
      'You can attempt Part II after Part I, or in some cases in adjacent windows; check GARP’s rules.',
      'Plan study blocks around the curriculum of each exam year, and use GARP practice questions.',
      'Passing both parts is required before you can apply for certification.'],
      [['Part II', '80 MCQs'], ['Topics', 'Market, credit, operational, liquidity risk']]),
    P('Two years of risk experience', 'After passing', 'Submit proof of 2 years of relevant work experience.', [
      'You need two years of full-time work in financial risk management, or a related field such as portfolio management, audit or quantitative analysis.',
      'The experience can be completed before or after passing the exams, within the time limit that GARP sets.',
      'Submit the experience form with employer details for verification.',
      'Banks, NBFCs, rating agencies, insurers and consulting firms are the common employers.'],
      [['Experience', '2 years']]),
    P('FRM certification', 'After requirements', 'Receive the FRM designation and join GARP’s community.', [
      'After GARP approves your experience, you can use the FRM certification.',
      'Pay annual membership dues and complete continuing professional development.',
      'Typical roles include risk analyst, credit risk manager, market risk analyst and regulatory reporting specialist.',
      'Many professionals combine FRM with CFA, a master’s in finance or an MBA.'],
      [['Designation', 'FRM']]),
  ], [['GARP', 'https://www.garp.org/'], src.ncs]),

C('acca', 'ACCA', 'ACCA — Association of Chartered Certified Accountants',
  'Global accountancy route: Applied Knowledge, Applied Skills, Strategic Professional, ethics module and 36 months of practical experience.',
  [['Total time', '~2.5–4 years'], ['Body', 'ACCA (UK)'], ['Sessions', 'Mar, Jun, Sep, Dec'], ['Experience', '36 months']],
  [
    P('Entry and registration', 'After Class 12', 'Register with ACCA after Class 12 and check which exemptions you qualify for.', [
      'ACCA accepts Class 12 pass students with the entry marks set by the ACCA; check the current requirement on their site.',
      'You may also enter after a relevant degree, such as B.Com or BBA, and claim exemptions from some Applied Knowledge or Skills papers.',
      'Register with ACCA, then pay the annual registration and exam fees.',
      'Choose an approved learning partner or self-study with official materials.'],
      [['Entry', 'Class 12 or a relevant degree'], ['Exemptions', 'Available for qualified degree holders']]),
    P('Applied Knowledge', 'Year 1', 'Three foundational papers in business, management accounting and financial accounting.', [
      'Papers: Business and Technology (BT), Management Accounting (MA) and Financial Accounting (FA).',
      'Exams are computer-based and can be booked at multiple sessions during the year.',
      'Pass mark for each paper is 50%.',
      'These cover the building blocks for the later levels.'],
      [['Papers', 'BT, MA, FA'], ['Pass mark', '50%']]),
    P('Applied Skills', 'Year 1–2', 'Six papers in law, performance management, tax, reporting, audit and financial management.', [
      'Papers: Corporate and Business Law (LW), Performance Management (PM), Taxation (TX), Financial Reporting (FR), Audit and Assurance (AA) and Financial Management (FM).',
      'Exams are computer-based and are offered at multiple sessions during the year.',
      'You can take papers in the order you prefer, but many students follow a suggested path.',
      'Each paper is passed with 50%.'],
      [['Papers', 'LW, PM, TX, FR, AA, FM'], ['Pass mark', '50%']]),
    P('Strategic Professional and Ethics module', 'Year 2–3', 'Two essentials, plus two options, and the professional ethics module.', [
      'Essentials: Strategic Business Leader (SBL) and Strategic Business Reporting (SBR).',
      'Options: choose two from Advanced Financial Management, Advanced Performance Management, Advanced Taxation and Advanced Audit and Assurance.',
      'Complete the Ethics and Professional Skills module, an online module required for membership.',
      'Exams are held in March, June, September and December.'],
      [['Essentials', 'SBL and SBR'], ['Options', '2 from 4'], ['Sessions', 'Mar, Jun, Sep, Dec']]),
    P('Practical experience requirement', 'In parallel', '36 months of relevant work in finance or accounting under an approved supervisor.', [
      'Record your experience in the ACCA’s PER (Practical Experience Requirement) tool with an approved practical-experience supervisor.',
      'You must achieve all the performance objectives, and your supervisor signs them off.',
      'Experience may be gained before, during or after the exams.',
      'Internships and articleship may count when supervised appropriately.'],
      [['PER', '36 months of experience']]),
    P('ACCA membership', 'After all requirements', 'Become an ACCA member, and later a Fellow.', [
      'After passing all exams, the ethics module and your experience, apply to become an ACCA member and use the letters ACCA after your name.',
      'After five years you may be eligible for FCCA, the fellow designation.',
      'ACCA is recognised in many countries, so you can work in the UK, the Gulf, Singapore and Australia, as well as India.',
      'Many students combine ACCA with an MBA or a CA qualification.'],
      [['Designation', 'ACCA member, later FCCA']]),
  ], [['ACCA Global', 'https://www.accaglobal.com/'], src.ncs]),

C('cpa', 'US CPA', 'US CPA — Certified Public Accountant',
  'The AICPA/NASBA route for Indian candidates: education check, state selection, exam sections and licensure.',
  [['Total time', '~1–2 years'], ['Exam', 'AUD, FAR, REG + 1 discipline'], ['Passing score', '75 per section'], ['Exam window', '18 months']],
  [
    P('Degree and credit eligibility', 'After graduation', 'Most states ask for a bachelor’s degree and 150 semester credit hours.', [
      'Indian graduates (B.Com, BBA, BBM or similar) are generally evaluated by an approved credential evaluation service such as NASBA’s.',
      'Your degree plus a master’s degree or a bridging programme often completes the 150-hour requirement.',
      'You need enough accounting and business credits, which differ by state.',
      'Start with a transcript evaluation early so you know your gaps.'],
      [['Credits', '150 semester hours (most states)'], ['Evaluation', 'Credential evaluation service']]),
    P('Choose a state board and apply', 'Before the exam', 'Pick a state that accepts international candidates and meets your eligibility.', [
      'Each state board sets its own education and experience rules; some states are friendlier to foreign candidates.',
      'Apply to the board and pay the application fee for the exam section approvals.',
      'Receive a Notice to Schedule (NTS) when approved.',
      'Keep in mind that licensure rules and exam eligibility are separate in some states.'],
      [['Application', 'State board of accountancy'], ['Document', 'Notice to Schedule']]),
    P('Take the four exam sections', 'Within 18 months', 'Three core sections and one discipline section, computer-based.', [
      'Core sections: Auditing and Attestation (AUD), Financial Accounting and Reporting (FAR) and Regulation (REG).',
      'Discipline sections (choose one): Business Analysis and Reporting (BAR), Information Systems and Controls (ISC) or Tax Compliance and Planning (TCP).',
      'Each section is scored out of 99, and 75 is the passing score.',
      'You must pass all four within a rolling 30-month window or as the state rules require; check your board’s current time limit.'],
      [['Sections', '3 core + 1 discipline'], ['Pass score', '75'], ['Centres', 'Prometric centres in India']]),
    P('Ethics exam and experience', 'After the exam', 'Pass the ethics exam and complete the supervised work experience.', [
      'Many states require an ethics exam, such as the AICPA Professional Ethics exam.',
      'You need accounting experience, typically one to two years, verified by a licensed CPA.',
      'Work experience in India under a CPA or CA can be accepted in some states with verification.',
      'Collect your verification forms early.'],
      [['Experience', '1–2 years verified']]),
    P('Licensure and career', 'After requirements', 'Apply for your licence and use the CPA designation.', [
      'Apply to the state board for the licence after passing and meeting experience.',
      'You pay the annual dues and complete continuing professional education.',
      'Roles: audit associate in Big 4 US practice, US taxation and accounting services in India, finance analyst.',
      'Many Indian candidates work with US clients from India through global capability centres.'],
      [['Designation', 'CPA']]),
  ], [['AICPA & CIMA', 'https://www.aicpa-cima.com/'], ['NASBA', 'https://nasba.org/']]),

C('bcom', 'B.Com', 'B.Com — Bachelor of Commerce',
  'From Class 12 Commerce to B.Com graduate: admission, six semesters, internships, and what to do after the degree.',
  [['Duration', '3 years (6 semesters)'], ['Entry', 'CUET-UG or merit'], ['Next steps', 'CA / CS / CMA, MBA, M.Com'], ['Internship', 'Summer and final-year']],
  [
    P('Class 11–12 subjects', 'Class 11–12', 'Choose Commerce with Accountancy; Maths is useful for finance and analytics.', [
      'B.Com is open to students from Commerce most commonly, and many universities accept other streams with a minimum percentage.',
      'Accountancy, Business Studies, Economics and Maths in Class 11–12 prepare you for first-year papers.',
      'Aim for strong Class 12 marks, since some colleges still admit by merit lists.',
      'Learn basic Excel and typing skills before college starts.'],
      [['Subjects', 'Accountancy, Business Studies, Economics'], ['Maths', 'Optional but helpful']]),
    P('Admission: CUET-UG and college cycles', 'Class 12 results', 'Central and many state universities admit through CUET-UG, others through merit lists.', [
      'Register for CUET-UG in the NTA window, choose Accountancy, Business Studies, Economics or Maths as domain subjects, and the General Test where required.',
      'CUET-UG results lead to counselling, such as university-specific counselling like DU CSAS.',
      'Private universities and state colleges publish merit lists or run their own entrance tests.',
      'Apply to several colleges, because cut-offs change every year.'],
      [['Exam', 'CUET-UG (NTA)'], ['Cycle', 'Applications typically Feb–Apr, results mid-year']]),
    P('Six semesters of study', 'Year 1–3', 'Core commerce subjects, electives and skill courses.', [
      'Year 1 covers Financial Accounting, Business Organisation, Business Law, Economics and Communication.',
      'Year 2 covers Corporate Accounting, Income Tax, Cost Accounting, Marketing and Banking.',
      'Year 3 covers Auditing, GST, Financial Management and electives such as Finance, Marketing or HR.',
      'Under NEP, you also take skill and ability-enhancement courses, with options to exit with a certificate or diploma at set points.'],
      [['Semesters', '6'], ['Structure', 'Core + electives + skill courses']]),
    P('Internships and add-on certifications', 'Year 2–3', 'Build practical skills alongside the degree.', [
      'Take summer internships in accounting firms, banks, startups or finance teams.',
      'Add certifications in Tally, GST, Excel, financial modelling, or SAP basics.',
      'Start professional courses such as CA Foundation, CS or CMA in parallel if you want a professional qualification.',
      'Participate in college commerce societies and case competitions.'],
      [['Common add-ons', 'Tally, GST, Excel, financial modelling']]),
    P('After B.Com: choose your path', 'After graduation', 'Work, study further or add a professional qualification.', [
      'Jobs: accountant, tax assistant, audit trainee, banking associate, finance executive.',
      'Higher study: M.Com, MBA (via CAT or other management entrance tests), MA Economics or an MSc in finance.',
      'Professional courses: CA, CS, CMA, CFA or ACCA.',
      'Government: bank, SSC, insurance and RBI exams are open to graduates.'],
      [['Study options', 'M.Com, MBA, CA, CS, CMA']]),
  ], [src.cuet, src.ugc]),

C('bcom-hons', 'B.Com (Hons)', 'B.Com Honours',
  'The deeper commerce route: admission, honours coursework and options for research and professional courses.',
  [['Duration', '3 years (4 optional)'], ['Entry', 'CUET-UG or merit'], ['Focus', 'Deeper accounting and finance'], ['Extras', 'Dissertation / research option']],
  [
    P('Class 12 prerequisites', 'Class 11–12', 'Commerce with Maths is preferred by several top colleges.', [
      'Honours courses often prefer Commerce with Accountancy and Maths in Class 12.',
      'Some colleges accept students from other streams with an additional subject requirement.',
      'Check the college’s subject-combination rules in its admission bulletin.',
      'Build your Class 12 marks, because honours seats at top colleges close at high cut-offs.'],
      [['Preferred', 'Commerce with Maths'], ['Check', 'College’s subject rules']]),
    P('Admission cycle', 'After Class 12', 'CUET-UG is the main route for central universities; private colleges set their own rules.', [
      'Register for CUET-UG and pick the right domain subjects for B.Com (Hons).',
      'Fill in the university’s counselling form and rank your preferred colleges.',
      'Take part in seat allocation rounds and accept a seat on time.',
      'Keep backups, such as B.Com programme seats, in case you miss your honours cut-off.'],
      [['Exam', 'CUET-UG'], ['Process', 'Counselling and seat allocation']]),
    P('Honours coursework', 'Year 1–3', 'Deeper papers in accounting, finance, taxation and business analytics.', [
      'You study core honours papers such as Financial Accounting, Corporate Accounting, Cost and Management Accounting, Income Tax and Auditing.',
      'You also study statistics, economics, business law and financial management in more depth than the programme degree.',
      'Electives allow specialisation in areas such as banking, taxation, or analytics.',
      'In the optional fourth year you can complete a research project or dissertation.'],
      [['Papers', 'Honours-level core and electives'], ['Year 4', 'Optional research']]),
    P('Internships and professional courses', 'Year 2–3', 'Combine honours with a professional qualification or a skill certification.', [
      'Honours students often prepare for CA Foundation, CS or CMA while studying.',
      'Complete at least one internship in accounting, audit or finance.',
      'Learn Excel, Tally and data tools such as Power BI.',
      'Join finance and commerce societies of your college.'],
      [['Common pairings', 'CA, CS, CMA, CFA']]),
    P('After B.Com Honours', 'After graduation', 'Careers and further study.', [
      'Careers in accounting, auditing, banking, tax and finance.',
      'Higher study: MBA, M.Com, MA Economics and finance master’s degrees.',
      'Many students apply to government and bank exams.',
      'Research routes: M.Com, then UGC NET for teaching and research.'],
      [['Further study', 'MBA, M.Com, MA Economics']]),
  ], [src.cuet, src.ugc]),

C('bba', 'BBA', 'BBA — Bachelor of Business Administration',
  'The management degree path: Class 12 prerequisites, entrance exams, three or four years of study, internships and MBA or job routes.',
  [['Duration', '3 years (4 optional)'], ['Entrance', 'CUET-UG, IPMAT, NPAT, SET'], ['Internships', 'Mandatory in most colleges'], ['Next', 'MBA or jobs']],
  [
    P('Class 11–12: any stream', 'Class 11–12', 'BBA accepts every stream; Maths helps for finance and analytics electives.', [
      'Choose any stream in Class 11–12; Commerce students find the subjects familiar, but Science and Arts students are equally eligible.',
      'Many colleges require 50% in Class 12.',
      'Build communication and basic maths skills.',
      'Start following business news and case studies.'],
      [['Streams', 'Any'], ['Marks', 'Usually 50% minimum']]),
    P('Entrance exams and application cycle', 'After Class 12', 'CUET-UG for central universities, plus institute-level tests.', [
      'Common exams: CUET-UG, IPMAT (for integrated courses), NPAT (NMIMS), SET (Symbiosis), AIMA UGAT, and state tests like MAH-BBA CET.',
      'Applications usually open from January to May; tests are held between February and June.',
      'After the test, colleges conduct interviews, group discussions and personal interviews.',
      'Apply to a mix of top-choice and safe colleges.'],
      [['Exams', 'CUET-UG, NPAT, SET, IPMAT, MAH-BBA CET'], ['Selection', 'Test + GD/PI + merit']]),
    P('Six semesters of core and electives', 'Year 1–3', 'Management, marketing, finance, HR and operations.', [
      'Year 1 builds fundamentals: Principles of Management, Business Economics, Accounting, Business Communication and Statistics.',
      'Year 2 covers Marketing, Finance, HR, Operations and Business Law.',
      'Year 3 covers electives, strategy and a project; under NEP some colleges offer a fourth honours year.',
      'Case study discussions, presentations and group projects are core to teaching.'],
      [['Semesters', '6 (8 with honours)'], ['Specialisation', 'Marketing, Finance, HR, Analytics']]),
    P('Internships and live projects', 'Year 2–3', 'Summer internships build your CV and often lead to job offers.', [
      'Most BBA programmes require a summer internship after Year 1 or 2.',
      'Look for roles in marketing, sales, HR, finance and operations teams.',
      'Join clubs, enter case competitions and undertake a final-year project.',
      'Add skills such as Excel, Power BI, digital marketing or SQL.'],
      [['Internship', 'Typically 4–8 weeks per summer']]),
    P('After BBA: jobs or MBA', 'After graduation', 'Enter the job market or prepare for a management master’s.', [
      'Jobs: management trainee, sales or marketing executive, HR associate, business analyst.',
      'MBA entrance: CAT, XAT, CMAT, MAT, GMAT and SNAP.',
      'Alternatives: CFA, CA, CS, or a master’s in management or analytics.',
      'Government jobs and banking exams are also open to graduates.'],
      [['MBA exams', 'CAT, XAT, CMAT, MAT, SNAP']]),
  ], [src.cuet, ['AICTE', 'https://www.aicte-india.org/']]),

C('bbm', 'BBM', 'BBM — Bachelor of Business Management',
  'Admission, six-semester curriculum, internships and next steps for BBM.',
  [['Duration', '3 years (6 semesters)'], ['Entry', 'Merit or entrance'], ['Internship', 'Summer'], ['Next', 'MBA or jobs']],
  [
    P('Class 12 eligibility', 'Class 11–12', 'Any stream, with a minimum percentage set by the university.', [
      'BBM is open to Class 12 pass students from any stream.',
      'Commerce and Maths are helpful but not required.',
      'Check the university’s minimum marks (usually 45–50%).',
      'Prepare for entrance tests, if the university runs one.'],
      [['Streams', 'Any'], ['Marks', 'Usually 45–50%']]),
    P('Admission process', 'After Class 12', 'Merit-based or entrance-based admission through the university or CUET-UG.', [
      'Check whether your target university uses CUET-UG, its own entrance or board-marks merit.',
      'Fill in the form, upload documents and pay the fee.',
      'Attend the interview or group discussion if called.',
      'Confirm your seat before the deadline.'],
      [['Routes', 'CUET-UG, merit or entrance']]),
    P('Six semesters of core subjects', 'Year 1–3', 'Management fundamentals, accounting, marketing, HR and operations.', [
      'Year 1: Principles of Management, Business Economics, Financial Accounting, Business Communication, Statistics.',
      'Year 2: Marketing Management, Financial Management, HR, Operations, Business Law and Research Methods.',
      'Year 3: Entrepreneurship, Strategy, electives and a project report.',
      'Teaching mixes lectures, case studies, seminars and group work.'],
      [['Semesters', '6'], ['Project', 'Final-year report']]),
    P('Internships and skills', 'Year 2–3', 'Practical exposure to business functions.', [
      'Undertake a summer internship in a company or start-up.',
      'Build skills in Excel, presentation, communication and digital tools.',
      'Participate in college business fests and workshops.',
      'Maintain an internship report; many universities award credits for it.'],
      [['Internship', 'Summer, report required']]),
    P('After BBM', 'After graduation', 'Work or pursue an MBA.', [
      'Entry roles: management trainee, sales executive, HR assistant, operations coordinator.',
      'MBA: prepare for CAT, XAT, CMAT or MAT.',
      'Professional options: CFA, CS, CMA or digital-marketing certificates.',
      'Entrepreneurship is common among BBM graduates with business ideas.'],
      [['MBA exams', 'CAT, XAT, CMAT, MAT']]),
  ], [src.ugc, src.cuet]),

C('bms', 'BMS', 'BMS — Bachelor of Management Studies',
  'Admission through Maharashtra CET or CUET, six semesters of management study, internships and MBA preparation.',
  [['Duration', '3 years (6 semesters)'], ['Entry', 'MAH-BBA/BMS CET, CUET-UG or merit'], ['Internship', 'Summer'], ['Next', 'MBA or jobs']],
  [
    P('Class 12 eligibility', 'Class 11–12', 'Any stream, with minimum marks; Maths and Commerce help.', [
      'BMS is open to students from any stream who pass Class 12.',
      'Aim for solid marks in English and Maths if you plan to attempt entrance exams.',
      'Check each university’s minimum marks; Mumbai University programmes commonly use the state CET and merit.',
      'Prepare a backup option, such as BBA or B.Com.'],
      [['Streams', 'Any']]),
    P('Entrance and admission cycle', 'After Class 12', 'State CET for Mumbai University colleges, CUET-UG for central universities.', [
      'For Maharashtra colleges, take the MAH-BBA/BMS CET and join the CAP (Centralised Admission Process).',
      'For central and many other universities, take CUET-UG.',
      'Rank your preferred colleges during counselling rounds.',
      'Finalise admission and pay fees by the deadlines.'],
      [['Exams', 'MAH-BBA/BMS CET, CUET-UG'], ['Process', 'Counselling rounds']]),
    P('Six semesters of study', 'Year 1–3', 'Foundation papers first, then specialisations.', [
      'Year 1: Foundation of Human Skills, Business Economics, Accounting, Business Communication and Mathematics.',
      'Year 2: Marketing, Finance, HR, Operations and Business Law.',
      'Year 3: Strategic management, entrepreneurship, electives and a project.',
      'Universities regularly update syllabi, so check the current one.'],
      [['Semesters', '6'], ['Project', 'Final-year project']]),
    P('Internships and live projects', 'Year 2–3', 'Hands-on training in a business setting.', [
      'Complete the summer internship, and write a report.',
      'Do live projects in marketing, finance or HR.',
      'Join the student committee, enter case competitions and attend industry talks.',
      'Add certifications, such as digital marketing, Excel or data analytics.'],
      [['Internship', 'Summer']]),
    P('After BMS', 'After graduation', 'Jobs or MBA.', [
      'Jobs: management trainee, marketing executive, HR associate, business analyst.',
      'MBA entrance: CAT, XAT, CMAT, MAH-MBA CET, SNAP.',
      'Professional courses: CFA, CS, CMA.',
      'Entrepreneurship paths are common.'],
      [['MBA exams', 'CAT, XAT, CMAT, MAH-MBA CET']]),
  ], [src.cuet, src.ugc]),

C('bachelor-of-accounting', 'Bachelor of Accounting', 'Bachelor of Accounting and Finance (BAF)',
  'Admission, six semesters, internships and the CA, CMA or MBA routes after BAF.',
  [['Duration', '3 years (6 semesters)'], ['Entry', 'Merit or CUET-UG'], ['Focus', 'Accounting, tax, audit'], ['Pairs with', 'CA, CMA, CS']],
  [
    P('Class 12 prerequisites', 'Class 11–12', 'Commerce with Accountancy is the usual route; Maths is preferred.', [
      'BAF usually admits Commerce students, though some colleges accept other streams.',
      'Class 12 Accountancy, Business Studies, Economics and Maths are the preparation subjects.',
      'Mumbai University and several others fill seats on Class 12 merit.',
      'Strengthen basic maths and accounting concepts.'],
      [['Preferred stream', 'Commerce'], ['Admission', 'Mostly merit-based']]),
    P('Admission process', 'After Class 12', 'Merit list admission or CUET-UG depending on the university.', [
      'Register on the university or college portal during the admission window.',
      'Fill in your preferences and upload marksheets.',
      'Check merit lists, pay fees and confirm admission.',
      'Note that some autonomous colleges conduct their own interviews.'],
      [['Process', 'Merit list, fee payment, confirmation']]),
    P('Six semesters of study', 'Year 1–3', 'Accounting, taxation, auditing, finance and law.', [
      'Year 1: Financial Accounting, Business Law, Economics, Business Communication and Mathematics.',
      'Year 2: Advanced Accounting, Cost Accounting, Taxation (Direct and GST), Auditing and Financial Management.',
      'Year 3: Corporate Accounting, Financial Services, Management Accounting and electives.',
      'The course is aligned with the skills needed for CA, CMA and CS exams.'],
      [['Semesters', '6'], ['Aligned with', 'CA, CMA, CS syllabi']]),
    P('Internships and certifications', 'Year 2–3', 'Work in accounting firms and learn software.', [
      'Do a summer internship in an audit or tax firm.',
      'Learn Tally, Excel, SAP basics and GST filing practice.',
      'Join CA Foundation or CS coaching alongside the degree.',
      'Build a short portfolio of practical accounting work.'],
      [['Tools', 'Tally, Excel, GST portals']]),
    P('After BAF', 'After graduation', 'Jobs or higher study.', [
      'Jobs: accountant, audit associate, tax executive, financial analyst.',
      'Higher study: M.Com, MBA Finance, CA Intermediate by direct entry (as a graduate).',
      'Professional courses: CFA, ACCA and CMA.',
      'Government: bank and SSC exams.'],
      [['Direct entry', 'Graduates can enter CA Intermediate directly']]),
  ], [src.ugc, ['ICAI', 'https://www.icai.org/']]),

C('bachelor-of-finance', 'Bachelor of Finance', 'Bachelor of Finance (BFM — Financial Markets)',
  'Admission, six semesters of finance study, internships and the MBA, CFA or jobs path.',
  [['Duration', '3 years (6 semesters)'], ['Entry', 'Merit or CUET-UG'], ['Focus', 'Markets, investments'], ['Pairs with', 'CFA, MBA']],
  [
    P('Class 12 prerequisites', 'Class 11–12', 'Commerce with Maths is ideal; other streams are accepted.', [
      'BFM admits students from Commerce and, depending on the college, other streams.',
      'Maths, Economics and Accountancy in Class 12 help.',
      'Check the minimum marks for the college you want.',
      'Follow market news to build interest.'],
      [['Preferred', 'Commerce with Maths']]),
    P('Admission process', 'After Class 12', 'Merit list or entrance depending on the university.', [
      'Apply through the college or university admissions portal.',
      'Select your college preferences and upload documents.',
      'Follow merit lists and fee deadlines.',
      'CUET-UG is used by some universities.'],
      [['Route', 'Merit list or CUET-UG']]),
    P('Six semesters of finance study', 'Year 1–3', 'Financial accounting, markets, investment and risk.', [
      'Year 1: Financial Accounting, Business Economics, Statistics and Business Communication.',
      'Year 2: Corporate Finance, Financial Markets, Banking, Taxation and Cost Accounting.',
      'Year 3: Security Analysis, Portfolio Management, Derivatives, Risk Management and electives.',
      'Some programmes include a research project.'],
      [['Semesters', '6']]),
    P('Internships and certifications', 'Year 2–3', 'Gain markets exposure with practical programmes.', [
      'Take internships in brokerages, banks, asset managers or fintech companies.',
      'Complete NISM certifications and learn Excel and financial modelling.',
      'Consider CFA Level I while in the final year.',
      'Participate in stock market competitions.'],
      [['Useful certificates', 'NISM series, Excel modelling']]),
    P('After BFM', 'After graduation', 'Jobs or specialised study.', [
      'Jobs: equity research associate, relationship manager, investment analyst, banking associate.',
      'Higher study: MBA Finance, MFM, M.Com or financial engineering master’s degrees.',
      'Professional: CFA, FRM, CA or CMA.',
      'Government jobs: banking and insurance exams.'],
      [['Further study', 'MBA Finance, MFM, CFA']]),
  ], [src.ugc, ['NISM', 'https://www.nism.ac.in/']]),

C('integrated-mba', 'Integrated MBA', 'Integrated MBA (5-Year IPM)',
  'From Class 12 to a five-year integrated management programme: IPMAT/JIPMAT/NPAT, three-year UG and two-year MBA phases and placements.',
  [['Duration', '5 years'], ['Entrance', 'IPMAT, JIPMAT, NPAT, SET'], ['Phases', '3-year UG + 2-year MBA'], ['Selection', 'Test + interview']],
  [
    P('Class 12 eligibility', 'Class 11–12', 'Any stream, with minimum marks (usually 60%) in Class 12.', [
      'Integrated programmes admit students after Class 12 from any stream.',
      'Top institutes like IIM Indore and IIM Rohtak require good Class 10 and 12 marks.',
      'Maths, verbal ability and logical reasoning matter a lot for the entrance.',
      'Start preparing in Class 11 if you aim for the top institutes.'],
      [['Streams', 'Any'], ['Marks', 'Usually 60% or as institute specifies']]),
    P('Entrance exams and calendar', 'After Class 12', 'IPMAT, JIPMAT, NPAT, SET and others.', [
      'IPMAT Indore and IPMAT Rohtak are separate exams conducted by the respective IIMs.',
      'JIPMAT is held by NTA for IIM Bodh Gaya and IIM Jammu.',
      'NMIMS NPAT, Symbiosis SET and other institutes run their own tests.',
      'Applications generally open in the first half of the year; tests are held from April to June.'],
      [['Exams', 'IPMAT, JIPMAT, NPAT, SET'], ['Sections', 'Quant, Verbal, Reasoning']]),
    P('Selection: interview and counselling', 'After results', 'Shortlisting is followed by personal interviews.', [
      'Institutes shortlist students on the basis of the test score and academics.',
      'Interviews test communication, awareness and clarity about the programme.',
      'Final merit combines test score, interview and Class 10 and 12 marks.',
      'Accept your offer and pay the deposit by the deadline.'],
      [['Selection', 'Test + interview + academics']]),
    P('Phase 1: three-year foundation', 'Year 1–3', 'A bachelor’s-level programme in management.', [
      'Years 1–3 cover quantitative methods, economics, accounting, marketing, communication and humanities.',
      'You complete group projects, case discussions and summer internships.',
      'Many institutes allow an exit with a BBA or similar degree after three years.',
      'Maintain grades, since progress to the MBA phase depends on performance.'],
      [['Exit option', 'Bachelor’s degree after Year 3']]),
    P('Phase 2: MBA and placements', 'Year 4–5', 'Advanced management coursework, electives and placements.', [
      'Years 4–5 resemble a conventional MBA: specialisation electives, internships and strategic courses.',
      'Summer internships lead to pre-placement offers.',
      'You graduate with an MBA or equivalent, subject to the institute’s rules.',
      'Placements are run through the institute’s placement cell.'],
      [['Degree', 'Integrated MBA / MBA']]),
  ], [['NTA — JIPMAT', 'https://nta.ac.in/'], ['IIM Indore (IPMAT)', 'https://www.iimidr.ac.in/']]),

C('actuarial-science', 'Actuarial Science', 'Actuarial Science',
  'The Institute and Faculty of Actuaries of India (IAI) route: ACET entrance, core principles, applications and specialist papers.',
  [['Total time', '~5–8 years'], ['Body', 'IAI'], ['Entrance', 'ACET'], ['Exam sessions', 'April & September']],
  [
    P('Class 12 subjects and preparation', 'Class 11–12', 'Maths and Statistics matter most.', [
      'Actuarial science is for students who enjoy probability, statistics and logical thinking.',
      'Maths in Class 12 helps; commerce students with Maths are also common.',
      'Learn Excel basics and programming exposure such as R or Python.',
      'Read about insurance and pensions to understand where actuaries work.'],
      [['Subjects', 'Maths, Statistics']]),
    P('Entry via ACET', 'After Class 12', 'The Actuarial Common Entrance Test opens the IAI path.', [
      'ACET tests Mathematics, Statistics, Logical reasoning and basic English.',
      'The test is held multiple times a year; check the IAI calendar.',
      'Students with strong marks in Maths and Statistics may claim exemptions.',
      'Register with IAI as a student after the test.'],
      [['Exam', 'ACET (IAI)'], ['Subjects', 'Maths, Stats, Reasoning']]),
    P('Core Principles', 'Year 1–3', 'Foundation papers in actuarial maths, statistics, finance and economics.', [
      'Core Principles include Actuarial Statistics, Statistical Modelling, Financial Mathematics, Models and Business Economics.',
      'Exams are held in April and September.',
      'You can attempt multiple papers per session, depending on the rules.',
      'Pass marks are decided by the IAI, so check the current rules.'],
      [['Sessions', 'April & September'], ['Exams', 'Several papers']]),
    P('Core Applications and Specialist papers', 'Year 3–6', 'Apply actuarial skills to life, general insurance and pensions.', [
      'Core Applications and Specialist Principles cover Life, Health, General Insurance, Pensions and Investment.',
      'Specialist Advanced papers cover advanced practice in your chosen field.',
      'Projects and communication components are included.',
      'Many students work part-time in insurance companies while studying.'],
      [['Areas', 'Life, Health, General, Pensions']]),
    P('Associateship, fellowship and work experience', 'After exams', 'Become an Associate then a Fellow of the IAI.', [
      'After completing the required papers and the professionalism course, you become an Associate (AIAI).',
      'Further papers and experience lead to Fellowship (FIAI).',
      'Actuaries work in life insurance, general insurance, consulting and risk management.',
      'Pay annual membership fees and follow professional standards.'],
      [['Designation', 'AIAI, then FIAI']]),
  ], [['Institute of Actuaries of India', 'https://www.actuariesindia.org/'], src.ncs]),

C('ba-economics', 'BA Economics', 'B.A. Economics',
  'From Class 12 to BA Economics: CUET-UG admission, three-year honours, research options and routes to MA, RBI, civil services and analytics.',
  [['Duration', '3 years (4 optional)'], ['Entry', 'CUET-UG or merit'], ['Maths', 'Class 12 Maths preferred'], ['Next', 'MA Economics, jobs']],
  [
    P('Class 11–12 subject choices', 'Class 11–12', 'Maths and Economics in Class 12 give the strongest start.', [
      'Take Economics and, if possible, Maths in Class 11–12; many top colleges ask for Maths.',
      'Students from any stream can apply if the university accepts it.',
      'Build statistics and data interpretation basics.',
      'Read newspapers such as the Economic Times or follow Budget coverage.'],
      [['Preferred subjects', 'Economics, Maths']]),
    P('Admission: CUET-UG and merit', 'After Class 12', 'Central universities use CUET-UG; others use merit.', [
      'Register for CUET-UG with Economics and Maths or General Test as required.',
      'Apply through university counselling portals.',
      'Rank your preferred colleges and course combinations.',
      'Check cut-offs from previous years.'],
      [['Exam', 'CUET-UG']]),
    P('Three years of coursework', 'Year 1–3', 'Micro, macro, statistics, econometrics and Indian economy.', [
      'Year 1: Introductory Microeconomics and Macroeconomics, Mathematical Methods and Statistics.',
      'Year 2: Intermediate Micro and Macro, Indian Economy, Econometrics.',
      'Year 3: Development Economics, International Economics, Public Economics and electives.',
      'In the optional fourth year you can write a research dissertation.'],
      [['Core', 'Micro, Macro, Statistics, Econometrics'], ['Year 4', 'Research option']]),
    P('Skills, internships and research', 'Year 2–3', 'Learn tools and gain experience.', [
      'Learn Excel, Stata, R or Python, and basic data visualisation.',
      'Take internships in think tanks, banks, consulting or research firms.',
      'Write research papers and attend seminars.',
      'Prepare for entrance exams for master’s programmes.'],
      [['Tools', 'Excel, Stata, R, Python']]),
    P('After BA Economics', 'After graduation', 'Master’s, government exams or jobs.', [
      'Master’s: MA Economics (Delhi School of Economics, JNU, ISI Delhi, IGIDR and others), MBA or analytics degrees.',
      'Government: UPSC Civil Services, RBI Grade B, Indian Economic Service and banking exams.',
      'Jobs: analyst roles in banks, consulting, policy research and data teams.',
      'Teaching and research: M.A., UGC NET and PhD.'],
      [['Exams', 'UPSC, RBI Grade B, UGC NET']]),
  ], [src.cuet, src.upsc]),
];
