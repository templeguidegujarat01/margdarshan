// Tiny helpers for writing roadmap sources compactly.
export const P = (title, when, summary, points, facts, tip) => ({ title, when, summary, points, facts, tip });
export const C = (slug, name, title, intro, glance, phases, sources) => ({ slug, name, title, intro, glance, phases, sources });
export const src = {
  nta: ['NTA (exam agency)', 'https://nta.ac.in/'],
  cuet: ['CUET-UG (NTA)', 'https://cuet.nta.nic.in/'],
  ugc: ['UGC', 'https://www.ugc.gov.in/'],
  aicte: ['AICTE', 'https://www.aicte-india.org/'],
  nmc: ['National Medical Commission', 'https://www.nmc.org.in/'],
  mcc: ['MCC counselling', 'https://mcc.nic.in/'],
  inc: ['Indian Nursing Council', 'https://indiannursingcouncil.org/'],
  pci: ['Pharmacy Council of India', 'https://www.pci.nic.in/'],
  dci: ['Dental Council of India', 'https://dciindia.gov.in/'],
  ncism: ['NCISM (Ayurveda)', 'https://ncismindia.org/'],
  nch: ['NCH (Homeopathy)', 'https://www.nch.org.in/'],
  upsc: ['UPSC', 'https://upsc.gov.in/'],
  ncs: ['National Career Service', 'https://www.ncs.gov.in/'],
  dgt: ['DGT / NCVT (ITI)', 'https://dgt.gov.in/'],
  skill: ['Skill India', 'https://www.skillindiadigital.gov.in/'],
  naps: ['Apprenticeship India', 'https://www.apprenticeshipindia.gov.in/'],
  swayam: ['SWAYAM free courses', 'https://swayam.gov.in/'],
  ncert: ['NCERT', 'https://ncert.nic.in/'],
  jee: ['JEE Main (NTA)', 'https://jeemain.nta.nic.in/'],
  jossa: ['JoSAA counselling', 'https://josaa.nic.in/'],
  neet: ['NEET-UG (NTA)', 'https://neet.nta.nic.in/'],
};
