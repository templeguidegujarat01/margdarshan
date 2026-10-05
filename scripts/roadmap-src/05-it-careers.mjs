import { P, C, src } from './_lib.mjs';

// IT career roadmaps share the same three outer phases (school, degree route, job entry) and differ in
// the skill ladder and certifications in the middle.
const start = (role, extra) => P('Class 10–12: foundation subjects', 'Class 10–12', 'Build maths and logic habits; no single stream is mandatory.', [
  `${role} is open to students of any stream, but Maths and Computer Science/Informatics Practices in Class 11–12 give a faster start.`,
  'Learn basic programming (Python or C) and use free resources such as SWAYAM, NPTEL and official language documentation.',
  extra,
  'Practise typing, English reading and logical problem-solving; they matter in every technical interview.'],
  [['Streams', 'Any (PCM helps)'], ['Start with', 'Python or C, plus Excel']]);
const degree = (role) => P('Degree route and admission', 'After Class 12', 'Choose a degree that fits your budget and goals; skills matter as much as the degree.', [
  `Common routes into ${role}: B.Tech/B.E. (CSE, IT, ECE), BCA, BSc Computer Science/IT, and BSc in related subjects; JEE Main, state CETs and CUET-UG are the main admission exams.`,
  'Choose a college that offers labs, active coding clubs and a record of internships and campus placements.',
  'Non-degree path: self-learning plus certifications and a strong GitHub portfolio can open entry-level roles, though many employers still prefer a degree.',
  'Confirm AICTE and UGC approval of the college before paying fees.'],
  [['Degrees', 'B.Tech, BCA, BSc CS/IT'], ['Exams', 'JEE Main, CETs, CUET-UG']]);
const jobStep = (roles, growth) => P('Internship, portfolio and first job', 'Final year / after graduation', 'Turn skills into proof and apply through campuses and job portals.', [
  'Build 3–4 solid projects, host the code on GitHub and write short READMEs that explain the problem and your decisions.',
  'Apply for internships in your second and third year; start-ups and remote internships often take beginners.',
  `Typical first roles: ${roles}.`,
  growth,
  'Prepare for aptitude tests, technical interviews and HR rounds; practise mock interviews and communication.'],
  [['Entry roles', roles]]);

export default [
C('software-engineer', 'Software Engineer', 'Software Engineer',
  'From Class 12 to a working software engineer: degree, core computer science, projects, internships and growth.',
  [['Typical degree', 'B.Tech / BCA / BSc CS'], ['Time to first job', '3–4 years'], ['Core skills', 'DSA, DBMS, OS, a language'], ['Entry roles', 'SDE, trainee engineer']],
  [
    start('Software engineering', 'Try small projects such as a calculator, quiz app or personal website to learn how code becomes a product.'),
    degree('software engineering'),
    P('Core computer science', 'Year 1–3', 'Master the fundamentals every interview tests.', [
      'Learn one language deeply (Java, Python, C++ or JavaScript) and basic object-oriented design.',
      'Study Data Structures and Algorithms, Operating Systems, DBMS and SQL, and Computer Networks.',
      'Learn Git, Linux command line, testing and debugging.',
      'Solve problems regularly on LeetCode, GeeksforGeeks or Codeforces.'],
      [['Fundamentals', 'DSA, OS, DBMS, networks'], ['Habit', 'Daily problem-solving']]),
    P('Build real software', 'Year 2–4', 'Move from tutorials to projects, then to teamwork.', [
      'Build a full-stack project with a database and authentication, and deploy it online.',
      'Contribute to open source or join hackathons.',
      'Learn APIs, version control workflows, basic system design and cloud deployment.',
      'Collaborate on a team project to learn code reviews and agile practices.'],
      [['Tools', 'Git, REST APIs, cloud, CI/CD basics']]),
    jobStep('Software Development Engineer, associate software engineer, trainee engineer', 'After 2–4 years, you can grow into senior engineer, tech lead or move to specialised areas such as AI, cloud or security.'),
  ], [src.aicte, src.cuet, src.swayam]),

C('web-developer', 'Web Developer', 'Web Developer',
  'A practical roadmap from HTML to full-stack web development, with projects and first-job steps.',
  [['Typical degree', 'Any; BCA / B.Tech common'], ['Time to job-ready', '9–18 months of focused practice'], ['Core skills', 'HTML, CSS, JavaScript'], ['Entry roles', 'Front-end / full-stack developer']],
  [
    start('Web development', 'You can start today with a free browser and text editor: build a simple page about yourself using HTML and CSS.'),
    degree('web development'),
    P('Front-end fundamentals', 'Months 1–4', 'HTML, CSS and JavaScript are the foundation.', [
      'Learn semantic HTML, CSS layout (Flexbox and Grid) and responsive design.',
      'Learn JavaScript fundamentals, the DOM, async code and fetch APIs.',
      'Use browser developer tools, Git and GitHub.',
      'Clone real websites to practise layout and interaction.'],
      [['Stack', 'HTML, CSS, JavaScript']]),
    P('Frameworks and back-end', 'Months 4–9', 'Learn React and a server-side stack.', [
      'Learn a front-end framework such as React, with state management and routing.',
      'Learn a back-end such as Node.js with Express, or Python with Django/Flask.',
      'Work with databases (SQL and MongoDB), REST APIs and authentication.',
      'Deploy projects on platforms like Vercel, Netlify or a cloud VM.'],
      [['Stack', 'React, Node.js, SQL/NoSQL']]),
    P('Portfolio and quality', 'Months 9–12', 'Show professional-quality work.', [
      'Build three or four portfolio projects including one e-commerce or dashboard app.',
      'Learn accessibility, performance basics, security basics and testing.',
      'Write clean README files and keep commits tidy.',
      'Create a portfolio site with live links.'],
      [['Output', 'Portfolio with live projects']]),
    jobStep('front-end developer, full-stack developer, WordPress or web developer', 'Later you can specialise in front-end architecture, back-end systems or move to freelance and agency work.'),
  ], [src.swayam, ['MDN Web Docs', 'https://developer.mozilla.org/']]),

C('app-developer', 'App Developer', 'App Developer',
  'The roadmap to building Android and iOS apps: fundamentals, platform skills, publishing and jobs.',
  [['Typical degree', 'Any; BCA / B.Tech common'], ['Time to job-ready', '9–18 months'], ['Core skills', 'Kotlin / Swift / Flutter'], ['Entry roles', 'Android / Flutter developer']],
  [
    start('App development', 'If you have an Android phone, you can begin by exploring app basics with free tools such as Android Studio.'),
    degree('app development'),
    P('Programming and app basics', 'Months 1–4', 'Learn a language and core app concepts.', [
      'Learn Kotlin (Android), Swift (iOS), Dart/Flutter or React Native, depending on your goal.',
      'Understand UI layouts, navigation, state, lists and forms.',
      'Learn Git and basic data structures.',
      'Build small apps like a to-do list, a calculator and a weather app.'],
      [['Pick one', 'Kotlin, Swift, Flutter or React Native']]),
    P('APIs, storage and architecture', 'Months 4–9', 'Make apps that talk to servers and store data.', [
      'Learn REST APIs, JSON, local storage (Room/SQLite) and cloud databases like Firebase.',
      'Learn app architecture patterns such as MVVM.',
      'Add authentication, push notifications and maps to a project.',
      'Test your apps on real devices and with automated tests.'],
      [['Concepts', 'REST, local DB, MVVM, Firebase']]),
    P('Publish and polish', 'Months 9–12', 'Ship an app to the store.', [
      'Publish at least one app on the Google Play Store (developer fee applies) or the Apple App Store.',
      'Learn app store guidelines, privacy policies and release management.',
      'Add analytics and crash reporting.',
      'Collect user feedback and improve the app.'],
      [['Stores', 'Google Play, Apple App Store']]),
    jobStep('Android developer, Flutter developer, iOS developer', 'With experience you can become a senior mobile engineer, an architect or a product-focused developer.'),
  ], [['Android Developers', 'https://developer.android.com/'], src.swayam]),

C('ai-engineer', 'AI Engineer', 'AI Engineer',
  'The roadmap to AI engineering: maths and Python, machine learning, deep learning, applied AI projects and jobs.',
  [['Typical degree', 'B.Tech CSE/AI or BSc/BCA + skills'], ['Time to job-ready', '2–3 years of focused study'], ['Core skills', 'Python, ML, deep learning'], ['Entry roles', 'AI / ML engineer, data analyst']],
  [
    start('AI engineering', 'Maths matters here: keep Class 11–12 Maths (algebra, calculus, probability) strong.'),
    degree('AI engineering'),
    P('Maths and programming base', 'Year 1–2', 'Python plus the maths behind AI.', [
      'Learn Python, NumPy, Pandas and data visualisation.',
      'Study linear algebra, probability, statistics and basic calculus.',
      'Learn SQL and Git.',
      'Work with real datasets from Kaggle or government open-data portals.'],
      [['Skills', 'Python, statistics, linear algebra']]),
    P('Machine learning and deep learning', 'Year 2–3', 'Build and evaluate models.', [
      'Learn supervised and unsupervised learning, model evaluation and feature engineering with scikit-learn.',
      'Learn deep learning with PyTorch or TensorFlow: neural networks, CNNs, RNNs and transformers.',
      'Explore NLP and computer vision tasks.',
      'Write notebooks and clear reports about your experiments.'],
      [['Frameworks', 'scikit-learn, PyTorch, TensorFlow']]),
    P('Applied AI and deployment', 'Year 3–4', 'Turn models into products.', [
      'Learn to use large language models and AI APIs, and build applications such as chatbots and retrieval-based tools.',
      'Learn model serving, containers (Docker) and cloud basics.',
      'Understand responsible AI: bias, privacy and data protection.',
      'Build two or three end-to-end projects and publish them.'],
      [['Output', 'Deployed AI project']]),
    jobStep('AI/ML engineer, data analyst, junior machine learning engineer', 'Over time, specialise in areas like NLP, computer vision, MLOps or research, and consider an M.Tech or MS for research roles.'),
  ], [src.swayam, ['NPTEL', 'https://nptel.ac.in/']]),

C('ml', 'Machine Learning Engineer', 'Machine Learning Engineer',
  'The ML engineer roadmap: Python and maths, core ML, MLOps and production skills, with job steps.',
  [['Typical degree', 'B.Tech CSE/IT/ECE, or BSc + skills'], ['Time to job-ready', '2–3 years'], ['Core skills', 'Python, ML, MLOps'], ['Entry roles', 'ML engineer, data scientist (junior)']],
  [
    start('Machine learning', 'Keep Maths strong, particularly statistics and probability, because ML interviews test them.'),
    degree('machine learning'),
    P('Python, maths and data handling', 'Year 1–2', 'The base layer for all ML work.', [
      'Learn Python, Pandas, NumPy and SQL.',
      'Study probability, statistics, linear algebra and optimisation basics.',
      'Learn data cleaning, visualisation and exploratory analysis.',
      'Practise on Kaggle datasets.'],
      [['Skills', 'Python, SQL, statistics']]),
    P('Core machine learning', 'Year 2–3', 'Classical algorithms to deep learning.', [
      'Learn regression, classification, tree models, clustering and dimensionality reduction.',
      'Learn model validation, hyperparameter tuning and metrics.',
      'Move to deep learning with PyTorch or TensorFlow.',
      'Build projects on tabular data, text and images.'],
      [['Algorithms', 'Linear, tree-based, neural networks']]),
    P('MLOps and production', 'Year 3–4', 'Make models reliable in real systems.', [
      'Learn Docker, REST APIs for model serving, and cloud platforms (AWS, Azure or GCP).',
      'Learn experiment tracking, data versioning and pipelines.',
      'Understand monitoring, drift and retraining.',
      'Deploy a complete project with a simple front end.'],
      [['Tools', 'Docker, MLflow, cloud']]),
    jobStep('ML engineer, junior data scientist, applied scientist (with a master’s)', 'Growth paths include senior ML engineer, ML platform engineer, research scientist or AI product roles.'),
  ], [src.swayam, ['NPTEL', 'https://nptel.ac.in/']]),

C('datascience', 'Data Scientist', 'Data Scientist',
  'The data science roadmap: statistics and Python, analysis, machine learning, business projects and jobs.',
  [['Typical degree', 'B.Tech, BSc Stats/Maths, BCA, B.Com + skills'], ['Time to job-ready', '1.5–3 years'], ['Core skills', 'SQL, Python, statistics, ML'], ['Entry roles', 'Data analyst, junior data scientist']],
  [
    start('Data science', 'Statistics and Maths in Class 11–12 help, and Excel is a good first tool.'),
    degree('data science'),
    P('Data fundamentals', 'Year 1–2', 'Excel, SQL, statistics and visualisation.', [
      'Learn Excel, SQL queries and joins, and a BI tool such as Power BI or Tableau.',
      'Study descriptive and inferential statistics, probability and hypothesis testing.',
      'Learn Python with Pandas and Matplotlib.',
      'Complete small analyses on real datasets.'],
      [['Tools', 'Excel, SQL, Power BI, Python']]),
    P('Machine learning and experimentation', 'Year 2–3', 'Build predictive models and measure them.', [
      'Learn supervised and unsupervised ML, feature engineering and model evaluation.',
      'Learn A/B testing, forecasting and basic causal thinking.',
      'Learn big-data basics (Spark) and cloud data tools.',
      'Write clear reports with charts and recommendations.'],
      [['Methods', 'ML, forecasting, A/B testing']]),
    P('Projects and domain skill', 'Year 3–4', 'Solve business problems end to end.', [
      'Build projects in finance, e-commerce, health or sports analytics and present insights.',
      'Share notebooks and dashboards in a portfolio.',
      'Participate in Kaggle competitions.',
      'Practise telling a story with data to non-technical audiences.'],
      [['Output', 'Portfolio of analyses and dashboards']]),
    jobStep('data analyst, business analyst, junior data scientist', 'Over time you can become a senior data scientist, ML engineer, analytics manager or data product lead.'),
  ], [src.swayam, ['NPTEL', 'https://nptel.ac.in/']]),

C('cloud-engineer', 'Cloud Engineer', 'Cloud Engineer',
  'The cloud engineering roadmap: networking and Linux, a cloud platform, certifications, infrastructure as code and jobs.',
  [['Typical degree', 'B.Tech / BCA / BSc IT'], ['Time to job-ready', '1–2 years'], ['Core skills', 'Linux, networking, AWS/Azure/GCP'], ['Entry roles', 'Cloud support / associate engineer']],
  [
    start('Cloud engineering', 'Basic networking (IP addresses, DNS, HTTP) is worth learning early.'),
    degree('cloud engineering'),
    P('Systems and networking base', 'Year 1–2', 'Linux, networks and scripting.', [
      'Learn the Linux command line, file systems and permissions.',
      'Learn TCP/IP, DNS, HTTP, firewalls and basic security.',
      'Learn a scripting language such as Python or Bash.',
      'Understand virtualisation and how data centres work.'],
      [['Skills', 'Linux, networking, scripting']]),
    P('Choose a cloud platform', 'Year 2–3', 'Learn core services on AWS, Azure or Google Cloud.', [
      'Learn compute, storage, networking, databases and identity services of one provider.',
      'Use the free tier to deploy a web app and a database.',
      'Prepare for entry-level certifications such as AWS Cloud Practitioner/Solutions Architect Associate, Azure Fundamentals/AZ-104 or Google Associate Cloud Engineer.',
      'Learn cloud cost management and security basics.'],
      [['Certs', 'AWS SAA, Azure AZ-104, GCP ACE']]),
    P('Infrastructure as code and automation', 'Year 3–4', 'Automate infrastructure.', [
      'Learn Terraform or CloudFormation for infrastructure as code.',
      'Learn Docker and the basics of Kubernetes.',
      'Set up monitoring and logging.',
      'Build a project that deploys an application automatically.'],
      [['Tools', 'Terraform, Docker, Kubernetes']]),
    jobStep('cloud support engineer, cloud associate, junior cloud engineer', 'Growth paths include cloud architect, DevOps/SRE engineer and cloud security specialist.'),
  ], [['AWS Training', 'https://aws.amazon.com/training/'], ['Microsoft Learn', 'https://learn.microsoft.com/']]),

C('devops-engineer', 'DevOps Engineer', 'DevOps Engineer',
  'The DevOps roadmap: Linux and scripting, Git and CI/CD, containers, cloud and monitoring, with job steps.',
  [['Typical degree', 'B.Tech / BCA / BSc IT'], ['Time to job-ready', '1–2 years'], ['Core skills', 'Linux, Git, CI/CD, Docker'], ['Entry roles', 'Junior DevOps / build engineer']],
  [
    start('DevOps', 'Learn how websites are hosted and deployed to understand why DevOps exists.'),
    degree('DevOps'),
    P('Linux, scripting and version control', 'Year 1–2', 'The base layer.', [
      'Learn Linux administration, shell scripting and basic networking.',
      'Learn Git workflows and branching.',
      'Learn a programming language such as Python.',
      'Understand how applications are built, tested and released.'],
      [['Skills', 'Linux, Bash, Git, Python']]),
    P('CI/CD, containers and orchestration', 'Year 2–3', 'Automate delivery.', [
      'Learn CI/CD tools such as GitHub Actions, GitLab CI or Jenkins.',
      'Learn Docker and Kubernetes fundamentals.',
      'Learn configuration management (Ansible) and infrastructure as code (Terraform).',
      'Build a pipeline that tests and deploys a sample app.'],
      [['Tools', 'GitHub Actions, Docker, Kubernetes, Terraform']]),
    P('Cloud, monitoring and security', 'Year 3–4', 'Run systems reliably.', [
      'Learn one cloud platform and its core services.',
      'Learn monitoring and logging (Prometheus, Grafana, ELK).',
      'Learn secrets management and DevSecOps basics.',
      'Prepare for certifications such as AWS, Azure or Kubernetes (CKA).'],
      [['Certs', 'AWS/Azure, CKA']]),
    jobStep('junior DevOps engineer, build and release engineer, cloud operations engineer', 'Growth paths include senior DevOps, site reliability engineer and platform engineering.'),
  ], [['Kubernetes docs', 'https://kubernetes.io/docs/'], ['Microsoft Learn', 'https://learn.microsoft.com/']]),

C('blockchain-developer', 'Blockchain Developer', 'Blockchain Developer',
  'The blockchain developer roadmap: programming and cryptography, smart contracts, dApps, security and jobs.',
  [['Typical degree', 'B.Tech CSE / BCA / BSc CS'], ['Time to job-ready', '1–2 years'], ['Core skills', 'Solidity, cryptography, web3'], ['Entry roles', 'Smart contract / web3 developer']],
  [
    start('Blockchain development', 'Understand what blockchains do and why they exist before investing in tools; avoid trading hype.'),
    degree('blockchain development'),
    P('Programming and cryptography basics', 'Year 1–2', 'Strong software skills come first.', [
      'Learn JavaScript/TypeScript, Python and basic data structures.',
      'Learn hashing, public-key cryptography and digital signatures.',
      'Learn how distributed systems and consensus work.',
      'Understand how Bitcoin and Ethereum work at a conceptual level.'],
      [['Skills', 'JavaScript, cryptography, distributed systems']]),
    P('Smart contracts and dApps', 'Year 2–3', 'Write and deploy smart contracts.', [
      'Learn Solidity and tools such as Hardhat or Foundry.',
      'Deploy contracts to test networks.',
      'Build a decentralised application with a React front end and a wallet connection.',
      'Learn standards such as ERC-20 and ERC-721.'],
      [['Tools', 'Solidity, Hardhat/Foundry, web3 libraries']]),
    P('Security and testing', 'Year 3–4', 'Smart contract security is critical.', [
      'Learn common vulnerabilities (reentrancy, access control, overflow) and how to test for them.',
      'Write unit tests and use audit tools.',
      'Study real hacks and post-mortems.',
      'Follow Indian regulations and tax rules around digital assets and stay updated.'],
      [['Focus', 'Testing, auditing, security']]),
    jobStep('smart contract developer, web3 developer, blockchain engineer', 'Growth paths include protocol engineer, security auditor, or enterprise blockchain roles in finance and supply chain.'),
  ], [['Ethereum developer docs', 'https://ethereum.org/developers/'], src.swayam]),

C('ui-ux-designer', 'UI/UX Designer', 'UI/UX Designer',
  'The UI/UX design roadmap: design fundamentals, tools, research, portfolio and first job.',
  [['Typical degree', 'Any; B.Des / BFA / BCA common'], ['Time to job-ready', '9–18 months'], ['Core skills', 'Figma, research, interaction design'], ['Entry roles', 'Junior UI/UX designer']],
  [
    start('UI/UX design', 'Observe the apps you use daily and ask why some are easier to use than others; sketching helps too.'),
    P('Degree and admission options', 'After Class 12', 'Design degrees help but a strong portfolio matters most.', [
      'Degree options include B.Des (UCEED, NID DAT, other design entrance exams), BFA, BCA, B.Tech or any degree plus design courses.',
      'UCEED is the entrance for IIT design programmes and NID DAT is for NID; both test creativity and visual thinking.',
      'Short online courses and bootcamps can supplement a degree.',
      'Look at student portfolios of the college before you choose.'],
      [['Exams', 'UCEED, NID DAT'], ['Degrees', 'B.Des, BFA, BCA, any degree']]),
    P('Design fundamentals', 'Months 1–4', 'Visual design and usability principles.', [
      'Learn layout, typography, colour, hierarchy and consistency.',
      'Learn usability heuristics, accessibility and information architecture.',
      'Study design systems and patterns used in popular apps.',
      'Redesign small screens as practice.'],
      [['Topics', 'Typography, colour, usability, accessibility']]),
    P('Tools, research and prototyping', 'Months 4–9', 'Learn Figma and how to research users.', [
      'Learn Figma for wireframes, UI design and interactive prototypes.',
      'Learn user research: interviews, surveys, personas and journey maps.',
      'Run usability tests on your prototypes and iterate.',
      'Learn how to work with developers through design handoff.'],
      [['Tools', 'Figma, user research methods']]),
    P('Portfolio and first job', 'Months 9–18', 'Show your process, not only the final screens.', [
      'Create three or four case studies that show the problem, research, design decisions and outcomes.',
      'Publish a portfolio website or on platforms like Behance.',
      'Apply for internships and junior roles at product companies, agencies and start-ups.',
      'Practise portfolio presentations and design critiques.'],
      [['Entry roles', 'Junior UI/UX designer, product designer']]),
  ], [['NID admissions', 'https://admissions.nid.edu/'], ['UCEED', 'https://www.uceed.iitb.ac.in/']]),

C('it-consultant', 'IT Consultant', 'IT Consultant',
  'The IT consulting roadmap: technical base, business skills, certifications, client projects and growth.',
  [['Typical degree', 'B.Tech / BCA / BBA + MBA'], ['Time to first role', '3–5 years'], ['Core skills', 'Tech + communication + business'], ['Entry roles', 'Analyst, associate consultant']],
  [
    start('IT consulting', 'Reading and presentation skills matter as much as technical skills in consulting, so practise both.'),
    degree('IT consulting'),
    P('Technical and business foundation', 'Year 1–3', 'Learn how technology solves business problems.', [
      'Build skills in one area such as ERP (SAP/Oracle), cloud, data analytics, cyber security or software development.',
      'Learn databases, networking basics and system design at a conceptual level.',
      'Learn business basics: accounting, operations, project management.',
      'Practise Excel, PowerPoint and structured problem-solving.'],
      [['Skills', 'One technical area + business basics']]),
    P('Certifications and experience', 'Year 3–5', 'Build credibility.', [
      'Consider certifications such as AWS/Azure, SAP, ITIL, PMP/PRINCE2 or Scrum.',
      'Gain 2–3 years of hands-on project experience in IT services or product companies.',
      'Learn requirement gathering, documentation and stakeholder communication.',
      'An MBA can accelerate a move into consulting leadership.'],
      [['Certs', 'ITIL, PMP, cloud, SAP']]),
    jobStep('analyst, associate consultant, technology consultant', 'Growth path: consultant, senior consultant, manager, then principal or partner; many also move into CIO/CTO advisory roles.'),
  ], [src.aicte, ['PMI', 'https://www.pmi.org/']]),

C('bca', 'BCA', 'BCA — Bachelor of Computer Applications',
  'From Class 12 to BCA graduate: admission, six semesters, skill building, internships and next steps like MCA or jobs.',
  [['Duration', '3 years (6 semesters)'], ['Entry', 'CUET-UG / state CET / merit'], ['Subjects', 'Any stream; Maths preferred'], ['Next', 'MCA, jobs, certifications']],
  [
    P('Class 11–12 prerequisites', 'Class 11–12', 'Any stream is accepted by many universities; Maths helps.', [
      'Many universities ask for Class 12 pass with Maths or Computer Science; some accept any stream with minimum marks (often 45–50%).',
      'Choose Maths and Computer Science/IP in Class 11–12 for the smoothest start.',
      'Start learning programming basics and keyboard skills.',
      'Check eligibility of your target university early.'],
      [['Subjects', 'Maths / CS preferred'], ['Min. marks', 'Usually 45–50%']]),
    P('Admission process', 'After Class 12', 'CUET-UG, state CETs or merit.', [
      'Take CUET-UG for central and many state universities.',
      'State tests such as MAH-BCA/BBA CET exist for some states.',
      'Private universities may admit through their own tests or merit.',
      'Compare labs, faculty and placement history.'],
      [['Exams', 'CUET-UG, state CETs']]),
    P('Six semesters of study', 'Year 1–3', 'Programming, databases, web and software engineering.', [
      'Year 1: Programming in C, Computer Fundamentals, Maths, Digital Electronics and Communication skills.',
      'Year 2: Data Structures, OOP with Java/C++, DBMS, Operating Systems and Web Technologies.',
      'Year 3: Software Engineering, Networks, Python/Machine Learning or Mobile App electives and a final project.',
      'Labs and project work are central to the course.'],
      [['Semesters', '6'], ['Project', 'Final-year project']]),
    P('Skills, internships and certifications', 'Year 2–3', 'Build job-ready skills.', [
      'Practise DSA and build projects on GitHub.',
      'Add certifications in cloud, data analytics, Java/Python or web development.',
      'Complete internships in IT services, start-ups or software firms.',
      'Join coding clubs and hackathons.'],
      [['Add-ons', 'Cloud, data, web, Java/Python']]),
    P('After BCA', 'After graduation', 'Job or MCA.', [
      'Jobs: software developer, web developer, support engineer, tester, data analyst.',
      'Higher study: MCA via NIMCET, CUET-PG or state tests; MBA via CAT or other tests.',
      'Government jobs: banking, SSC and technical posts open to graduates.',
      'Keep upskilling in cloud, AI and security for stronger roles.'],
      [['MCA exams', 'NIMCET, CUET-PG, state CETs']]),
  ], [src.cuet, src.aicte, src.ugc]),
];
