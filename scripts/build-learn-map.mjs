// build-learn-map — puts every India subject (career, blueprint, sport, art, exam) into one family
// and records which college / coaching finder keys it has today and how many verified listings
// those keys hold. Output: _data/in/learn_map.yml — the queue for the "where to learn" finders.
//
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-learn-map.mjs [--check]
//
// Reruns keep each subject's hand-set `finder` and `status` fields. --check exits 1 when the
// file is out of date (a subject added or removed, or listing counts changed).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const P = (...a) => path.join(root, ...a);
const L = f => yaml.load(fs.readFileSync(P(f), 'utf8'));
const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
const OUT = '_data/in/learn_map.yml';

// Families: one list for the whole India edition. `learn` says what kind of place teaches it.
const FAMILIES = [
  ['medical-health', 'Medical & Health', 'colleges + entrance coaching'],
  ['engineering', 'Engineering & Technology', 'colleges + entrance coaching'],
  ['computer-digital', 'Computer & Digital', 'colleges + training institutes'],
  ['science-research', 'Science & Research', 'colleges + institutes'],
  ['commerce-finance', 'Commerce & Finance', 'colleges + professional coaching'],
  ['business-management', 'Business & Management', 'colleges + entrance coaching'],
  ['law', 'Law', 'law schools + entrance coaching'],
  ['humanities', 'Humanities & Social Sciences', 'colleges'],
  ['media', 'Journalism & Media', 'colleges + institutes'],
  ['design-creative', 'Design, Architecture & Fine Arts', 'colleges + entrance coaching'],
  ['teaching', 'Education & Teaching', 'B.Ed / D.El.Ed colleges'],
  ['hospitality-travel', 'Hospitality & Travel', 'colleges + institutes'],
  ['aviation-maritime', 'Aviation, Maritime & Railways', 'DGCA / DG Shipping approved institutes'],
  ['agriculture', 'Agriculture & Allied', 'colleges'],
  ['defence-police', 'Defence & Police', 'coaching + academies'],
  ['govt-jobs', 'Government Jobs', 'exam coaching'],
  ['university-entrance', 'University Entrance', 'entrance coaching'],
  ['school-boards', 'School Boards', 'schools'],
  ['diploma-polytechnic', 'Diploma & Polytechnic', 'polytechnics'],
  ['iti-trades', 'ITI Trades', 'ITIs'],
  ['sports', 'Sports', 'academies, clubs + SAI centres'],
  ['performing-arts', 'Dance & Music', 'gurukuls, schools + universities'],
];
const FAM = new Set(FAMILIES.map(f => f[0]));

// Hub sub-group heading -> family. Hubs read in this order; a career's first hub wins.
const HUBS = ['iti', 'diploma', 'specialised-careers', 'science', 'commerce', 'arts'];
const HEADING = {
  'Engineering & Technology (PCM)': 'engineering', 'Computer & Digital Careers': 'computer-digital',
  'Medical & Healthcare (PCB)': 'medical-health', 'Emerging & Life Sciences': 'science-research',
  'Aviation, Maritime & Railways': 'aviation-maritime', 'Science-Based Government Services': 'govt-jobs',
  'Defence': 'defence-police', 'Finance & Accounting': 'commerce-finance', 'Business & Management': 'business-management',
  'Corporate Law & Governance': 'law', 'Banking & Financial Markets': 'commerce-finance',
  'Economics & Data Analytics': 'commerce-finance', 'Regulated Finance, Trade & Compliance': 'commerce-finance',
  'Humanities & Social Sciences': 'humanities', 'Psychology & Behavioural Sciences': 'humanities',
  'Law & Legal Careers': 'law', 'Education & Teaching': 'teaching', 'Journalism, Media & Mass Communication': 'media',
  'Languages, Literature & Translation': 'humanities', 'Government, Civil Services & Defence': 'govt-jobs',
  'Design & Creative Careers': 'design-creative', 'Fine & Performing Arts': 'design-creative',
  'Travel, Tourism & Hospitality': 'hospitality-travel', 'Social Work & Development Sector': 'humanities',
  'Library, Archives & Information Science': 'humanities',
  'Aviation, maritime & railways': 'aviation-maritime', 'Regulated finance, IP & compliance': 'commerce-finance',
  'Allied health & life sciences': 'medical-health', 'Forensics & security': 'science-research',
  'Licensed design & government science services': 'science-research',
};
// Careers whose hub sub-group is too broad for where they are taught.
const OVERRIDE = { 'agriculture-science': 'agriculture', veterinarian: 'agriculture', 'fisheries-scientist': 'agriculture', 'forest-officer': 'agriculture' };
const hubFamily = hub => hub === 'iti' ? 'iti-trades' : hub === 'diploma' ? 'diploma-polytechnic' : null;

const EXAM_STREAM = {
  engineering: 'engineering', medical: 'medical-health', govt: 'govt-jobs', law: 'law', university: 'university-entrance',
  architecture: 'design-creative', design: 'design-creative', polytechnic: 'diploma-polytechnic', science: 'science-research',
  nursing: 'medical-health', pharmacy: 'medical-health', management: 'business-management', hospitality: 'hospitality-travel',
};
const DEFENCE_GOVT = /afcat|agniveer|cds|nda|capf|police|ssc-gd|ssc-cpo/;
// Blueprint ids are job titles; first matching rule wins.
const BLUEPRINT = [
  [/veterinarian|agricultural-officer/, 'agriculture'],
  [/doctor|cardio|dentist|dermat|gynae|neuro|nurs|ophthal|optom|ortho|paediat|pharmac|physio|psychiat|occupational|speech|lab-tech|veterin|clinical-psych/, 'medical-health'],
  [/pilot-?|air-traffic|aircraft|marine|merchant|loco/, 'aviation-maritime'],
  [/iaf|navy|nda|coast-guard|police/, 'defence-police'],
  [/software|computer|data-|ethical|digital/, 'computer-digital'],
  [/engineer/, 'engineering'],
  [/ca$|company-sec|cost-acc|actuary|financial|stockbroker|insurance|insolvency|bank/, 'commerce-finance'],
  [/lawyer|patent/, 'law'],
  [/teacher|professor|librarian/, 'teaching'],
  [/civil-services|railway|statistical|agricultural-officer/, 'govt-jobs'],
  [/architect|fashion/, 'design-creative'],
  [/hotel|tour/, 'hospitality-travel'],
  [/biotech|geolog|archaeolog|economist/, 'science-research'],
  [/translator/, 'humanities'],
  [/yoga/, 'sports'],
];
const stateFamily = e => e.group === 'civil' ? (/police|tnusrb/.test(e.slug) ? 'defence-police' : 'govt-jobs')
  : /cbse|gseb|kseab|msbshse|upmsp|reet/.test(e.slug) ? 'school-boards'
  : /ppt|polycet|jexpo|jeecup|acpdc|diploma|sams|bceceb/.test(e.slug) ? 'diploma-polytechnic'
  : /mba|bba|pgcet/.test(e.slug) ? 'business-management'
  : /gcas|ipu/.test(e.slug) ? 'university-entrance' : 'engineering';

// Finder keys a page already links to, with how many verified listings each holds.
const col = L('_data/colleges.yml'), coach = L('_data/coaching.yml');
const colCount = {}, coachCount = {};
col.colleges.forEach(c => (c.courses || []).forEach(k => colCount[k] = (colCount[k] || 0) + 1));
coach.centres.forEach(c => (c.exams || []).forEach(k => coachCount[k] = (coachCount[k] || 0) + 1));
const colByPage = Object.fromEntries(Object.entries(col.courses).map(([k, v]) => [v.page, k]));
const coachByPage = Object.fromEntries(Object.entries(coach.exams).map(([k, v]) => [v.page, k]));
const keysIn = text => {
  const c = new Set(), k = new Set();
  for (const m of text.matchAll(/course=([a-z0-9_]+)/g)) if (col.courses[m[1]]) c.add(m[1]);
  for (const m of text.matchAll(/(colleges-[a-z0-9-]+)\.html/g)) if (colByPage[m[1]]) c.add(colByPage[m[1]]);
  for (const m of text.matchAll(/(coaching-[a-z0-9-]+)\.html/g)) if (coachByPage[m[1]]) k.add(coachByPage[m[1]]);
  return { colleges: [...c].sort(), coaching: [...k].sort() };
};

const subjects = [];
const add = s => {
  if (!FAM.has(s.family)) throw new Error(`${s.id}: unknown family ${s.family}`);
  const keys = keysIn(s.text || ''); delete s.text;
  const listings = keys.colleges.reduce((n, k) => n + (colCount[k] || 0), 0) + keys.coaching.reduce((n, k) => n + (coachCount[k] || 0), 0);
  subjects.push({ ...s, colleges_keys: keys.colleges, coaching_keys: keys.coaching, listings_now: listings });
};

// 1. Career guides, family from the hub sub-group they sit in.
const careerFamily = {};
for (const hub of HUBS) {
  const html = fs.readFileSync(P(hub + '.html'), 'utf8');
  for (const part of html.split('class="career-group-heading"').slice(1)) {
    const heading = strip(part.slice(part.indexOf('>') + 1, part.indexOf('<')));
    const fam = hubFamily(hub) || HEADING[heading];
    if (!fam) throw new Error(`${hub}.html: no family for heading "${heading}"`);
    const list = part.split('</ul>')[0];
    for (const m of list.matchAll(/class="career-item">\s*<a href="([a-z0-9-]+)\.html"/g)) careerFamily[m[1]] ??= fam;
  }
}
for (const f of fs.readdirSync(P('_data/in/careers')).sort()) {
  const id = f.replace(/\.yml$/, ''), raw = fs.readFileSync(P('_data/in/careers', f), 'utf8'), c = yaml.load(raw);
  if (!careerFamily[id]) throw new Error(`${id}: not listed in any hub`);
  add({ id, kind: 'career', name: strip(c.hero?.title || id), page: `${id}.html`, family: OVERRIDE[id] || careerFamily[id], text: raw });
}
// 2. Journey Blueprints.
for (const id of L('_data/in/journey_common.yml').careers) {
  const raw = fs.readFileSync(P('_data/in/journey', id + '.yml'), 'utf8'), j = yaml.load(raw);
  const fam = BLUEPRINT.find(([re]) => re.test(id))?.[1];
  if (!fam) throw new Error(`blueprint ${id}: no family rule`);
  add({ id: `journey-${id}`, kind: 'blueprint', name: strip(j.title || j.name || id), page: `journey-${id}.html`, family: fam, text: raw });
}
// 3. Sports and classical arts.
const SP = L('_data/in/sports.yml');
const domain = Object.fromEntries(SP.domains.map(d => [d.id, strip(d.label)]));
for (const s of SP.sports) add({ id: s.slug, kind: s.domain === 'arts' ? 'art' : 'sport', name: strip(s.short), page: `${s.slug}.html`,
  family: s.domain === 'arts' ? 'performing-arts' : 'sports', sub: domain[s.domain] });
// 4. National entrance exams, central govt exams, state exams.
const nat = fs.readFileSync(P('_data/in/national_exams.yml'), 'utf8');
for (const e of yaml.load(nat).exams) add({ id: e.slug, kind: 'exam', name: strip(e.short), page: `${e.slug}.html`, family: EXAM_STREAM[e.stream],
  text: fs.existsSync(P(e.slug + '.html')) ? fs.readFileSync(P(e.slug + '.html'), 'utf8') : '' });
const govt = fs.readFileSync(P('govt-exams.html'), 'utf8').split('stat-badges')[1];
for (const id of [...new Set([...govt.matchAll(/href="([a-z0-9-]+)\.html"/g)].map(m => m[1]))]) {
  const html = fs.readFileSync(P(id + '.html'), 'utf8');
  add({ id, kind: 'govt-exam', name: strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]) || strip((html.match(/^title: *"?([^"|\n]+)/m) || [])[1]) || id, page: `${id}.html`,
    family: DEFENCE_GOVT.test(id) ? 'defence-police' : 'govt-jobs', text: html });
}
for (const f of fs.readdirSync(P('_data/in/states')).sort()) {
  const S = L('_data/in/states/' + f);
  for (const e of S.exams) add({ id: `${S.state.id}/${e.slug}`, kind: 'state-exam', name: strip(e.short), page: `state/${S.state.id}/${e.slug}.html`,
    family: stateFamily(e), state: S.state.id });
}

// Keep hand-set fields from the last run.
const prev = fs.existsSync(P(OUT)) ? yaml.load(fs.readFileSync(P(OUT), 'utf8')) : null;
const kept = Object.fromEntries((prev?.subjects || []).map(s => [s.id, s]));
for (const s of subjects) { s.finder = kept[s.id]?.finder ?? null; s.status = kept[s.id]?.status ?? 'todo'; }

const famOut = FAMILIES.map(([id, label, learn]) => ({ id, label, learn, subjects: subjects.filter(s => s.family === id).length }));
const doc = { families: famOut, subjects };
const head = `# learn_map — every India subject in one family, with the finder keys it has today.
# Generated by scripts/build-learn-map.mjs — rerun after adding careers, sports, exams or listings.
# Hand-edit only \`finder\` (the finder page id this subject uses) and \`status\` (todo | building | live).
# ${subjects.length} subjects in ${famOut.length} families.
`;
const text = head + yaml.dump(doc, { lineWidth: 160, flowLevel: 3 });
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(P(OUT)) ? fs.readFileSync(P(OUT), 'utf8').replace(/\r\n/g, '\n') : '';
  if (cur !== text) { console.error(`${OUT} is out of date — rerun scripts/build-learn-map.mjs`); process.exit(1); }
  console.log(`${OUT} up to date (${subjects.length} subjects)`);
} else {
  fs.writeFileSync(P(OUT), text);
  console.log(`${OUT}: ${subjects.length} subjects`);
  for (const f of famOut) console.log(`  ${f.label.padEnd(34)} ${f.subjects}`);
  const none = subjects.filter(s => !s.listings_now).length;
  console.log(`  subjects with no finder listings yet: ${none}`);
}
