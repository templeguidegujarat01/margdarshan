import { P, C, src } from './_lib.mjs';

// Engineering roadmaps share the admission spine (JEE / state CET / counselling) and differ in
// what is studied, which tools and certifications matter, GATE paper and typical employers.
const admission = (branch) => [
  P('Class 11–12: subjects and eligibility', 'Class 11–12', 'Take Physics, Chemistry and Maths (PCM); strong Maths decides most of your options.', [
    `${branch} needs Class 12 with Physics, Chemistry and Maths, plus English in most boards.`,
    'For JEE Main and NITs/IIITs/GFTIs, Class 12 normally needs 75% (65% for SC/ST) or a place within the board’s top 20 percentile; IITs ask for the same through JEE Advanced eligibility.',
    'Choose PCM in Class 11 and add Computer Science or Informatics Practices if your school offers it, since coding helps in every branch.',
    'Start NCERT-based preparation in Class 11 and add problem-solving practice from Class 12.'],
    [['Subjects', 'PCM (+ English)'], ['Class 12 marks', '75% for NIT/IIT route (65% SC/ST)'], ['Also helps', 'Computer Science / IP']]),
  P('Entrance exams and counselling', 'Class 12 year', 'JEE Main, JEE Advanced and state CETs lead to counselling-based seat allotment.', [
    'JEE Main is held by the NTA in two sessions (January and April); your best score counts, and the paper tests Physics, Chemistry and Maths.',
    'The top-ranked JEE Main candidates can appear for JEE Advanced for IIT admission (held in May–June, with a limit of two attempts in consecutive years).',
    'JoSAA runs the joint counselling for IITs, NITs, IIITs and GFTIs in several rounds with choice filling and seat acceptance.',
    'State CETs (such as MHT-CET, KCET, WBJEE, EAPCET, KEAM and GUJCET with state counselling) and private exams like BITSAT and VITEEE give other routes.',
    'Apply to several routes and rank colleges by branch quality, placements and faculty, not only by brand name.'],
    [['Exams', 'JEE Main, JEE Advanced, state CETs'], ['Counselling', 'JoSAA and state counselling'], ['Calendar', 'Jan–Apr exams, Jun–Aug counselling']],
  'Keep a college-and-branch shortlist ready before JoSAA choice filling opens.'),
];

export default [
C('cse', 'CSE', 'Computer Science Engineering (B.Tech / B.E.)',
  'From Class 11 PCM to a software engineer: JEE/CET admission, eight semesters, internships, coding practice and campus placement.',
  [['Duration', '4 years (8 semesters)'], ['Entrance', 'JEE Main / state CETs'], ['Internship', 'Summers of Year 2–3'], ['GATE', 'CS & IT paper']],
  [
    ...admission('Computer Science Engineering'),
    P('Eight semesters of study', 'Year 1–4', 'Programming and maths first, then core CS and electives.', [
      'Year 1: Programming in C/Python, Engineering Maths, Physics, Digital Logic and Communication skills.',
      'Year 2: Data Structures and Algorithms, Object-Oriented Programming, Discrete Maths, Computer Organisation, Operating Systems and DBMS.',
      'Year 3: Computer Networks, Software Engineering, Theory of Computation, Compiler Design, Web and Machine Learning electives.',
      'Year 4: Specialised electives (AI/ML, Cyber Security, Cloud, Data Science) and a final-year project.'],
      [['Semesters', '8'], ['Core', 'DSA, OS, DBMS, Networks']]),
    P('Internships, projects and coding profile', 'Year 2–4', 'Build proof of skill beyond marks.', [
      'Solve DSA problems regularly on platforms such as LeetCode or Codeforces; most campus tests ask for them.',
      'Build two or three real projects (web app, mobile app or ML model) and put them on GitHub.',
      'Do summer internships after Year 2 and Year 3, or remote internships with start-ups.',
      'Learn Git, SQL, one cloud platform and basics of system design.'],
      [['Common tools', 'Git, SQL, cloud, Linux']]),
    P('Placements, GATE or higher study', 'Year 4', 'Choose between campus jobs, GATE and M.Tech, or a master’s abroad.', [
      'Campus placements usually run in the 7th semester with an online test, technical interviews and HR rounds.',
      'GATE (Computer Science and Information Technology) leads to M.Tech at IITs/NITs and to PSU recruitment.',
      'Study abroad through GRE-based MS admissions.',
      'You can also join start-ups, product companies, IT services or prepare for government technical jobs.'],
      [['GATE paper', 'CS & IT'], ['Typical roles', 'Software engineer, SDE, data engineer']]),
  ], [src.jee, src.jossa, src.aicte, ['GATE', 'https://gate.iitk.ac.in/']]),

C('mechanical', 'Mechanical Engineering', 'Mechanical Engineering (B.Tech / B.E.)',
  'From PCM to a mechanical engineer: admission, eight semesters, workshop and industrial training, GATE and core-sector jobs.',
  [['Duration', '4 years (8 semesters)'], ['Entrance', 'JEE Main / state CETs'], ['Training', 'Workshop + industrial'], ['GATE', 'ME paper']],
  [
    ...admission('Mechanical Engineering'),
    P('Eight semesters of study', 'Year 1–4', 'Mechanics, thermodynamics, design and manufacturing.', [
      'Year 1: Engineering Mechanics, Engineering Graphics, Maths, Physics and Workshop Practice.',
      'Year 2: Thermodynamics, Fluid Mechanics, Strength of Materials, Materials Science and Manufacturing Processes.',
      'Year 3: Heat Transfer, Machine Design, Theory of Machines, IC Engines and Metrology.',
      'Year 4: Electives such as Automobile, Robotics, CAD/CAM, Industrial Engineering or Renewable Energy, plus a project.'],
      [['Semesters', '8'], ['Core', 'Thermo, Fluids, Design, Manufacturing']]),
    P('Workshops, software and industrial training', 'Year 2–4', 'Learn tools and practical manufacturing.', [
      'Complete workshop practice in fitting, welding, machining and foundry in Year 1–2.',
      'Learn CAD and simulation software such as AutoCAD, SolidWorks, CATIA, ANSYS and MATLAB.',
      'Undertake 4–8 weeks of industrial training in factories, power plants or automobile companies.',
      'Join design teams such as Baja SAE, Formula Student or Robotics clubs for hands-on projects.'],
      [['Tools', 'SolidWorks, CATIA, ANSYS, MATLAB']]),
    P('Placement, GATE and PSU jobs', 'Year 4', 'Choose the core industry, PSUs, higher study or a software route.', [
      'Core companies hire for design, production, maintenance and quality roles through campus placements.',
      'GATE (Mechanical Engineering) is used for M.Tech and for PSU recruitment such as IOCL, ONGC, BHEL and NTPC.',
      'Government technical jobs: SSC JE, State PSCs, railways (RRB JE/ALP), UPSC ESE.',
      'Alternative paths: MBA, supply chain or a switch to data and analytics.'],
      [['GATE paper', 'ME'], ['Govt options', 'PSUs, ESE, RRB, SSC JE']]),
  ], [src.jee, src.jossa, src.aicte, ['GATE', 'https://gate.iitk.ac.in/']]),

C('civil', 'Civil Engineering', 'Civil Engineering (B.Tech / B.E.)',
  'From PCM to a civil engineer: admission, eight semesters, site training, GATE and government and private construction careers.',
  [['Duration', '4 years (8 semesters)'], ['Entrance', 'JEE Main / state CETs'], ['Training', 'Site internships'], ['GATE', 'CE paper']],
  [
    ...admission('Civil Engineering'),
    P('Eight semesters of study', 'Year 1–4', 'Structures, geotechnics, water and transport.', [
      'Year 1: Engineering Mechanics, Graphics, Maths, Physics, and Surveying basics.',
      'Year 2: Strength of Materials, Fluid Mechanics, Building Materials and Construction, Surveying and Structural Analysis.',
      'Year 3: Design of RCC and Steel Structures, Geotechnical Engineering, Transportation Engineering and Environmental Engineering.',
      'Year 4: Water Resources, Estimating and Costing, Construction Management, electives and a project.'],
      [['Semesters', '8'], ['Core', 'Structures, Geotech, Transport, Water']]),
    P('Site training and software', 'Year 2–4', 'Learn what happens on a real project.', [
      'Do summer internships on construction sites, highway projects, bridges or with consultancies.',
      'Learn AutoCAD, STAAD.Pro, ETABS, Revit and Primavera or MS Project for scheduling.',
      'Take a survey camp and learn total station and GPS use.',
      'Join institution clubs and competitions in structure design.'],
      [['Tools', 'AutoCAD, STAAD, ETABS, Revit']]),
    P('Jobs, GATE and licensing', 'Year 4', 'Government, private construction or higher study.', [
      'Government: PWD, state irrigation and water departments, CPWD, railways, NHAI through SSC JE, State PSCs, RRB JE and UPSC ESE.',
      'Private: contractors, real estate developers, structural design consultancies and infrastructure firms.',
      'GATE (Civil Engineering) opens M.Tech and PSU recruitment.',
      'To work independently, you may register with state or local bodies as a licensed engineer/contractor, as per local rules.'],
      [['GATE paper', 'CE'], ['Govt options', 'PWD, CPWD, SSC JE, ESE']]),
  ], [src.jee, src.jossa, src.aicte, ['GATE', 'https://gate.iitk.ac.in/']]),

C('electrical', 'Electrical Engineering', 'Electrical Engineering (B.Tech / B.E.)',
  'From PCM to an electrical engineer: admission, eight semesters, power-system and control training, GATE and PSU jobs.',
  [['Duration', '4 years (8 semesters)'], ['Entrance', 'JEE Main / state CETs'], ['Training', 'Substation / plant'], ['GATE', 'EE paper']],
  [
    ...admission('Electrical Engineering'),
    P('Eight semesters of study', 'Year 1–4', 'Circuits, machines, power systems and control.', [
      'Year 1: Basic Electrical Engineering, Maths, Physics, Programming and Graphics.',
      'Year 2: Circuit Theory, Electrical Machines, Analog and Digital Electronics, Signals and Systems.',
      'Year 3: Power Systems, Control Systems, Power Electronics, Microcontrollers and Measurement.',
      'Year 4: Electives such as Renewable Energy, Electric Vehicles, Smart Grids, High-voltage Engineering, plus a project.'],
      [['Semesters', '8'], ['Core', 'Machines, Power Systems, Control']]),
    P('Training, labs and software', 'Year 2–4', 'Practical exposure to power and automation.', [
      'Complete internships at power plants, substations, manufacturing units or EV/renewable companies.',
      'Learn MATLAB/Simulink, PSCAD, AutoCAD Electrical and PLC programming.',
      'Do practical labs on motors, transformers and protection.',
      'Take part in solar, EV or embedded systems projects.'],
      [['Tools', 'MATLAB/Simulink, PLC, PSCAD']]),
    P('Jobs, GATE and licensing', 'Year 4', 'Utilities, PSUs, manufacturing and EV sector.', [
      'GATE (Electrical Engineering) is accepted by PSUs like Power Grid, NTPC, BHEL and NHPC and for M.Tech.',
      'Government: state electricity boards, SSC JE, RRB JE and UPSC ESE.',
      'Private: power equipment makers, EV firms, renewable developers and automation companies.',
      'An electrical contractor or supervisor licence is issued by the state licensing board for independent work.'],
      [['GATE paper', 'EE'], ['Govt options', 'PSUs, SEBs, ESE']]),
  ], [src.jee, src.jossa, src.aicte, ['GATE', 'https://gate.iitk.ac.in/']]),

C('electronics', 'Electronics Engineering', 'Electronics and Communication Engineering (B.Tech / B.E.)',
  'From PCM to an electronics engineer: admission, eight semesters, VLSI/embedded training, GATE and jobs.',
  [['Duration', '4 years (8 semesters)'], ['Entrance', 'JEE Main / state CETs'], ['Training', 'Embedded / VLSI'], ['GATE', 'EC paper']],
  [
    ...admission('Electronics and Communication Engineering'),
    P('Eight semesters of study', 'Year 1–4', 'Analog and digital electronics, communication and VLSI.', [
      'Year 1: Basic Electronics, Programming, Maths, Physics and Graphics.',
      'Year 2: Network Theory, Analog and Digital Circuits, Signals and Systems, Electromagnetic Theory.',
      'Year 3: Analog and Digital Communication, Microprocessors and Microcontrollers, Control Systems, VLSI Design.',
      'Year 4: Electives such as Embedded Systems, IoT, Wireless and 5G, Signal and Image Processing, plus a project.'],
      [['Semesters', '8'], ['Core', 'Circuits, Communication, VLSI']]),
    P('Labs, projects and tools', 'Year 2–4', 'Hands-on electronics and programming.', [
      'Build circuits and microcontroller projects with Arduino, ESP32 and Raspberry Pi.',
      'Learn embedded C, Verilog/VHDL, MATLAB and PCB design tools.',
      'Intern with electronics, telecom or semiconductor companies.',
      'Participate in IoT and robotics competitions.'],
      [['Tools', 'Embedded C, Verilog, MATLAB, PCB design']]),
    P('Jobs, GATE and further study', 'Year 4', 'Semiconductor, telecom, embedded and software roles.', [
      'GATE (Electronics and Communication Engineering) is used for M.Tech and PSU jobs such as BEL, ISRO, DRDO and BSNL.',
      'Private: semiconductor companies, telecom, consumer electronics, embedded and automotive electronics.',
      'Software roles are open to ECE graduates through campus placement.',
      'Government: SSC JE, RRB JE and defence research labs.'],
      [['GATE paper', 'EC'], ['Employers', 'BEL, ISRO, DRDO, telecom, semiconductor']]),
  ], [src.jee, src.jossa, src.aicte, ['GATE', 'https://gate.iitk.ac.in/']]),

C('aerospace', 'Aerospace Engineering', 'Aerospace Engineering (B.Tech / B.E.)',
  'From PCM to an aerospace engineer: admission, eight semesters, aircraft and propulsion training, GATE and ISRO/DRDO routes.',
  [['Duration', '4 years (8 semesters)'], ['Entrance', 'JEE Main / JEE Advanced / IIST'], ['Training', 'Aerospace industry'], ['GATE', 'AE paper']],
  [
    ...admission('Aerospace Engineering'),
    P('Specialist entrance routes', 'Class 12 year', 'IITs, IIST and a few universities offer aerospace degrees.', [
      'Most aerospace seats come through JEE Advanced (IITs) and JEE Main (NITs and others).',
      'IIST Thiruvananthapuram admits through JEE Advanced and offers a pathway to ISRO.',
      'Private universities may use their own entrance tests.',
      'Check the AICTE and institute recognition for each college.'],
      [['Routes', 'JEE Advanced, JEE Main, IIST']]),
    P('Eight semesters of study', 'Year 1–4', 'Aerodynamics, propulsion, structures and flight mechanics.', [
      'Year 1: Maths, Physics, Programming, Basic Mechanics and Graphics.',
      'Year 2: Thermodynamics, Fluid Mechanics, Aircraft Structures and Aerodynamics.',
      'Year 3: Propulsion, Flight Dynamics, Control Systems and Aircraft Materials.',
      'Year 4: Spacecraft Systems, Avionics, CFD, Finite Element Analysis, electives and a design project.'],
      [['Semesters', '8'], ['Core', 'Aerodynamics, Propulsion, Structures']]),
    P('Labs, training and projects', 'Year 2–4', 'Wind tunnels, CAD and simulation.', [
      'Learn CATIA, ANSYS, MATLAB and CFD tools.',
      'Take internships at aviation companies, HAL, ISRO centres, DRDO labs or aerospace start-ups.',
      'Build model aircraft, rockets or drones in student teams.',
      'Attend workshops on UAV design and space systems.'],
      [['Tools', 'CATIA, ANSYS, CFD']]),
    P('Jobs, GATE and agencies', 'Year 4', 'ISRO, DRDO, HAL, private aerospace and higher study.', [
      'ISRO recruits scientists and engineers through its own centralised recruitment process (ICRB), and DRDO through CEPTAM and GATE-based routes.',
      'GATE (Aerospace Engineering) supports M.Tech and PSU recruitment.',
      'Private: aircraft MRO, airlines, drone makers and space start-ups.',
      'Masters and PhD abroad are common for research careers.'],
      [['GATE paper', 'AE'], ['Employers', 'ISRO, DRDO, HAL, private']]),
  ], [src.jee, src.jossa, ['ISRO careers', 'https://www.isro.gov.in/'], ['GATE', 'https://gate.iitk.ac.in/']]),

C('robotics', 'Robotics Engineering', 'Robotics and Automation Engineering (B.Tech / B.E.)',
  'From PCM to a robotics engineer: admission, eight semesters, embedded and control projects, certifications and jobs.',
  [['Duration', '4 years (8 semesters)'], ['Entrance', 'JEE Main / state CETs'], ['Training', 'Robotics projects'], ['GATE', 'EE / ME / CS']],
  [
    ...admission('Robotics and Automation Engineering'),
    P('Eight semesters of study', 'Year 1–4', 'Mechanics, electronics, control and AI.', [
      'Year 1: Maths, Physics, Programming and Engineering Basics.',
      'Year 2: Mechanics, Electronics, Sensors and Actuators, Data Structures and Signals.',
      'Year 3: Control Systems, Microcontrollers, Robot Kinematics, Computer Vision and Machine Learning.',
      'Year 4: Industrial Automation, Mobile Robotics, ROS, Embedded Linux, electives and a project.'],
      [['Semesters', '8'], ['Core', 'Controls, Embedded, Kinematics, Vision']]),
    P('Labs, competitions and tools', 'Year 2–4', 'Build robots and learn the tools.', [
      'Learn Python, C/C++, ROS, MATLAB and CAD.',
      'Build line followers, robotic arms and autonomous vehicles in lab or club projects.',
      'Compete in events like Robocon and national robotics competitions.',
      'Intern with manufacturing, automation, drone or AI companies.'],
      [['Tools', 'Python, C++, ROS, MATLAB']]),
    P('Jobs and higher study', 'Year 4', 'Automation, robotics R&D, and M.Tech or MS.', [
      'Jobs: robotics engineer, automation engineer, PLC/SCADA engineer, embedded engineer and AI/vision engineer.',
      'Employers: manufacturing, automobile, logistics, defence and robotics start-ups.',
      'Higher study: M.Tech Robotics, MS abroad or PhD for research.',
      'GATE in EE, ME or CS supports M.Tech and PSU roles.'],
      [['Roles', 'Robotics, automation, embedded']]),
  ], [src.jee, src.jossa, src.aicte]),

C('cybersecurity', 'Cyber Security', 'Cyber Security (B.Tech or Certification Route)',
  'The cyber security roadmap: degree route, certifications, hands-on labs and career steps.',
  [['Duration', '4 years (B.Tech) or faster via certifications'], ['Entrance', 'JEE Main / state CETs / merit'], ['Certs', 'CEH, Security+, CISSP'], ['Practice', 'CTFs, labs']],
  [
    P('Class 11–12 and eligibility', 'Class 11–12', 'PCM or any stream for certification routes; PCM for B.Tech.', [
      'For B.Tech Cyber Security or CSE with specialisation, take PCM in Class 11–12.',
      'Certification and diploma routes are open to students from other streams, but programming comfort is essential.',
      'Start learning Python and basic networking early.',
      'Build interest by exploring beginner platforms like TryHackMe.'],
      [['B.Tech', 'PCM'], ['Alternate', 'BCA / BSc / certifications']]),
    P('Admission: degree options', 'After Class 12', 'B.Tech in CSE (Cyber Security), BCA, BSc or direct diploma.', [
      'Admission to B.Tech through JEE Main or state CETs and university tests.',
      'BCA and BSc Cyber Security are available through CUET-UG and merit.',
      'Check labs and industry tie-ups before choosing a college.',
      'Ensure the programme covers networking, cryptography and ethical hacking.'],
      [['Routes', 'JEE Main, CET, CUET-UG']]),
    P('Core learning path', 'Year 1–4', 'Networking, operating systems, programming and security fundamentals.', [
      'Learn computer networks, Linux, Windows internals and scripting in Python and Bash.',
      'Study cryptography, web security (OWASP Top 10), network security and digital forensics.',
      'Practise on labs and Capture-the-Flag (CTF) events.',
      'Understand incident response, SOC operations and risk management.'],
      [['Skills', 'Networking, Linux, Python, web security']]),
    P('Certifications and internships', 'Year 2–4', 'Prove skills with recognised certificates.', [
      'Entry-level certificates: CompTIA Security+, CEH, and vendor-specific cloud security certificates.',
      'Later: CISSP, OSCP and cloud security certifications.',
      'Intern with SOC teams, security consultancies or start-ups.',
      'Bug-bounty programmes build experience and reputation (within legal rules).'],
      [['Certs', 'Security+, CEH, OSCP, CISSP']]),
    P('Jobs and growth', 'After graduation', 'SOC, pentesting, GRC and security engineering.', [
      'Roles: SOC analyst, penetration tester, security engineer, GRC analyst and digital forensics analyst.',
      'Employers: IT services, banks, consulting firms, cloud providers and government cyber agencies.',
      'Follow Indian laws such as the IT Act and the DPDP Act, and professional ethics.',
      'Higher study: M.Tech Cyber Security or MS abroad.'],
      [['Roles', 'SOC, pentester, security engineer']]),
  ], [['CERT-In', 'https://www.cert-in.org.in/'], src.jee, src.cuet]),

C('biotechnology', 'Biotechnology', 'Biotechnology (BSc / B.Tech)',
  'The biotech route: BSc or B.Tech admission, lab-based study, projects, higher study and career options.',
  [['BSc', '3 years'], ['B.Tech', '4 years'], ['Entrance', 'CUET-UG / JEE Main / state CETs'], ['Next', 'MSc / M.Tech / PhD']],
  [
    P('Class 11–12 subjects', 'Class 11–12', 'PCB for BSc; PCM or PCB for B.Tech Biotechnology.', [
      'BSc Biotechnology needs Class 12 Science with Biology and Chemistry.',
      'B.Tech Biotechnology normally accepts PCM or PCB with Maths.',
      'Choose subjects that match the entrance exam you plan to take.',
      'Build lab skills and interest in genetics and microbiology.'],
      [['Subjects', 'PCB or PCM']]),
    P('Entrance exams', 'After Class 12', 'CUET-UG for BSc and JEE Main/state CETs for B.Tech.', [
      'Take CUET-UG for central university BSc seats.',
      'Take JEE Main or a state CET for B.Tech Biotechnology at NITs and engineering colleges.',
      'Private universities may hold their own tests.',
      'Compare labs and research output before choosing.'],
      [['Exams', 'CUET-UG, JEE Main, CETs']]),
    P('Course structure', 'Year 1–4', 'Biochemistry, genetics, molecular biology and bioprocess.', [
      'Year 1: Cell Biology, Biochemistry, Chemistry, Maths and Biostatistics.',
      'Year 2: Genetics, Microbiology, Molecular Biology and Immunology.',
      'Year 3: Genetic Engineering, Bioinformatics, Bioprocess Engineering and Plant/Animal Biotechnology.',
      'Year 4 (B.Tech): Industrial Biotechnology, Downstream Processing, electives and a project.'],
      [['Core', 'Genetics, Molecular Biology, Bioprocess']]),
    P('Projects, internships and tools', 'Year 2–4', 'Lab and bioinformatics skills.', [
      'Do summer research internships at institutes such as IISER, NCBS, CSIR labs, and universities.',
      'Learn PCR, gel electrophoresis, cell culture and bioinformatics tools.',
      'Learn Python or R for biological data.',
      'Publish or present a small project.'],
      [['Tools', 'PCR, cell culture, bioinformatics']]),
    P('After biotechnology', 'After graduation', 'MSc, M.Tech, PhD or industry.', [
      'Higher study: MSc/M.Tech Biotechnology through exams such as CUET-PG, GAT-B/BET and GATE (BT).',
      'Research careers: CSIR NET, DBT JRF and PhD routes.',
      'Industry: pharma, biopharma, food and agri-biotech companies, quality and regulatory roles.',
      'Government labs and institutions hire through their own exams.'],
      [['Exams', 'GAT-B, GATE BT, CSIR NET']]),
  ], [src.cuet, src.jee, ['DBT India', 'https://dbtindia.gov.in/']]),
];
