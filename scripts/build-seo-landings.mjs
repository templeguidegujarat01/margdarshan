// Builds the static "verified list" landing pages under colleges/ and coaching/ from the finder data.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-seo-landings.mjs [--check] [--prune]
//
// Reads _data/colleges.yml and _data/coaching.yml (the same data as the finders) and writes:
//   colleges/index.html                         directory: every state with a verified list
//   colleges/<state>/index.html                 state hub: courses and cities in that state
//   colleges/<state>/<course>.html              every college for one course in one state
//   colleges/<state>/<city-slug>/<course>.html  the same for one city
//   (coaching/ mirrors this with exam keys)
//   _data/seo_landings.yml                      index of the pages above: labels, counts, links
// Each page is front matter only plus one include (_includes/seo-listing-renderer.html), which pulls
// the matching cards out of _data at build time — no listing is copied into the pages.
//
// Quality rules (Google treats near-empty, mass-made pages as doorway pages, so these keep every
// page a real list):
//   - a state or city page exists only with at least MIN verified listings for that course / exam
//   - a city page is skipped when that city already holds every listing in the state for that
//     course (it would repeat the state page word for word)
// Titles and descriptions carry live counts, so rerun this after every data change; --check exits 1
// (and writes nothing) when the files on disk are out of date. Pages that no longer qualify are only
// reported; --prune deletes them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { fitTitle, fitDesc } from './lib/seo-fit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const CHECK = process.argv.includes('--check');
const PRUNE = process.argv.includes('--prune');
const MIN = 3;
const BRAND = 'Education Margdarshan';
const SHORT = 'Margdarshan'; // brand in <title>, which keeps to 60 characters (scripts/lib/seo-fit.mjs)

const load = (f) => yaml.load(fs.readFileSync(path.join(root, '_data', f), 'utf8'));
const colleges = load('colleges.yml');
const coaching = load('coaching.yml');
const states = load('finder_states.yml');
const explorer = load('explorer.yml');
const stateById = Object.fromEntries(states.map((s) => [s.id, s]));
// Same as Jekyll's default slugify (used by the finder for ?city=).
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// What a list is called in titles and headings ("B.Com Colleges & Universities in Pune, Maharashtra").
// Keys not listed here use "<course label> Colleges & Universities".
const COLLEGE_PHRASE = {
  economics: 'Economics & Data Analytics Colleges', actuarial: 'Actuarial Science Colleges',
  ba: 'BA (Humanities & Social Sciences) Colleges', bjmc: 'Journalism & Mass Communication (BJMC) Colleges',
  law: 'Integrated Law (BA LLB) Colleges', bfa: 'Fine Arts (BFA) Colleges', performing: 'Performing Arts Colleges',
  animation: 'Animation & VFX Colleges', photography: 'Photography & Film Colleges',
  hotel: 'Hotel Management (BHM) Colleges', tourism: 'Travel & Tourism Colleges', bsw: 'Social Work (BSW) Colleges',
  libsci: 'Library Science (B.Lib.I.Sc) Colleges', bed: 'B.Ed Colleges', bba: 'BBA / BMS Colleges',
  agri: 'Agriculture (B.Sc Hons) Colleges', envsci: 'Environmental Science Colleges', radiology: 'Radiology & Imaging Colleges',
  nutrition: 'Nutrition & Dietetics Colleges', vet: 'Veterinary Science (B.V.Sc) Colleges', fisheries: 'Fisheries Science (B.F.Sc) Colleges',
  forestry: 'Forestry Colleges', geology: 'Geology Colleges', statistics: 'Statistics Colleges', foodtech: 'Food Technology Colleges',
  marine: 'Marine Engineering & Nautical Science Colleges', pilot: 'Commercial Pilot Training Schools',
  ame: 'Aircraft Maintenance Engineering (AME) Institutes', perfusion: 'Perfusion Technology Colleges',
  bpo: 'Prosthetics & Orthotics (BPO) Colleges', nmt: 'Nuclear Medicine Technology Colleges',
  diploma: 'Polytechnic Colleges (Engineering Diploma)', diploma_mech: 'Mechanical Engineering Diploma Polytechnics',
  diploma_civil: 'Civil Engineering Diploma Polytechnics', diploma_cse: 'Computer Engineering / IT Diploma Polytechnics',
  diploma_ee: 'Electrical & Electronics Diploma Polytechnics', dpharm: 'D.Pharm (Diploma in Pharmacy) Colleges',
  gnm: 'GNM Nursing Schools', dmlt: 'DMLT (Lab Technology Diploma) Institutes', dradio: 'Radiography Diploma Institutes',
  dhotel: 'Hotel Management Diploma Institutes', dagri: 'Agriculture Diploma Institutes', dfashion: 'Fashion Design Diploma Institutes',
  dinterior: 'Interior Design Diploma Institutes', danimation: 'Animation & Multimedia Diploma Institutes',
  dbm: 'Business Management Diploma Institutes', dfood: 'Food Technology Diploma Institutes',
  iti: 'ITIs (Industrial Training Institutes)', iti_electrician: 'ITI Electrician Trade Institutes', iti_fitter: 'ITI Fitter Trade Institutes',
};
// Short name in link lists ("B.Com", "Polytechnic Diploma").
const COLLEGE_SHORT = {
  economics: 'Economics & Data Analytics', actuarial: 'Actuarial Science', ba: 'BA (Humanities)', law: 'BA LLB (Integrated Law)',
  bfa: 'BFA / Visual Arts', performing: 'Performing Arts', animation: 'Animation & VFX', photography: 'Photography & Film',
  hotel: 'Hotel Management (BHM)', tourism: 'Travel & Tourism', bsw: 'BSW', libsci: 'Library Science', bed: 'B.Ed',
  diploma: 'Polytechnic Diploma', dpharm: 'D.Pharm', gnm: 'GNM Nursing', dmlt: 'DMLT', iti: 'ITI (all trades)',
  iti_electrician: 'ITI Electrician', iti_fitter: 'ITI Fitter', vet: 'Veterinary (B.V.Sc)', fisheries: 'Fisheries (B.F.Sc)',
  pilot: 'Commercial Pilot Training', ame: 'Aircraft Maintenance (AME)', perfusion: 'Perfusion Technology', bpo: 'Prosthetics & Orthotics',
  agri: 'B.Sc Agriculture', marine: 'Marine & Nautical Science', foodtech: 'Food Technology', statistics: 'Statistics', geology: 'Geology',
  forestry: 'Forestry', diploma_mech: 'Mechanical Diploma', diploma_civil: 'Civil Diploma', diploma_cse: 'Computer / IT Diploma',
  diploma_ee: 'Electrical / Electronics Diploma', dradio: 'Radiography Diploma', dhotel: 'Hotel Management Diploma',
  dagri: 'Agriculture Diploma', dfashion: 'Fashion Design Diploma', dinterior: 'Interior Design Diploma',
  danimation: 'Animation Diploma', dbm: 'Business Management Diploma', dfood: 'Food Technology Diploma',
};
const COACHING_SHORT = {
  neet: 'NEET-UG', jee: 'JEE Main & Advanced', cuet: 'CUET-UG', ca: 'CA', cs: 'CS', cma: 'CMA', ipmat: 'IPMAT & JIPMAT', clat: 'CLAT & AILET',
  design: 'NIFT / NID Design Entrance', nata: 'NATA (B.Arch)', ssc: 'SSC', banking: 'Bank Exam', upsc: 'UPSC Civil Services',
  acca: 'ACCA', cfa: 'CFA', frm: 'FRM', cpa: 'US CPA', actuarial: 'Actuarial Science (ACET)', judiciary: 'Judiciary Exam',
  defence: 'Defence Exam (NDA / CDS / AFCAT)', hotel: 'Hotel Management (NCHM JEE)',
};
// body data-stream palette (_layouts/default.html) from the stream a key sits under on the hubs.
const PALETTE = { science: 'science', commerce: 'commerce', arts: 'arts', 'diploma-iti': 'diploma', govt: 'govt-exams' };
const streamOf = (hub, key) => {
  const s = explorer.streams.find((x) => (x[hub] || []).includes(key));
  if (!s) return null;
  return key.startsWith('iti') ? 'iti' : PALETTE[s.id];
};

const KINDS = [
  {
    type: 'colleges', items: colleges.colleges, keysOf: (c) => c.courses || [], meta: colleges.courses,
    finder: (k) => `colleges.html?course=${k}`, hub: 'colleges',
    short: (k) => COLLEGE_SHORT[k] || colleges.courses[k].label,
    phrase: (k) => COLLEGE_PHRASE[k] || `${colleges.courses[k].label} Colleges & Universities`,
    noun: 'Colleges',
  },
  {
    type: 'coaching', items: coaching.centres, keysOf: (c) => c.exams || [], meta: coaching.exams,
    finder: (k) => `coaching.html?exam=${k}`, hub: 'coaching',
    short: (k) => COACHING_SHORT[k] || coaching.exams[k].label,
    phrase: (k) => `${COACHING_SHORT[k] || coaching.exams[k].label} Coaching Centres`,
    noun: 'Coaching Centres',
  },
];

const q = (s) => JSON.stringify(String(s)); // YAML-safe double-quoted scalar
const OWN_ORDER = ['Government', 'Grant-in-Aid', 'Deemed', 'Private'];
const ownSummary = (list) => {
  const n = {};
  for (const c of list) if (c.ownership) n[c.ownership] = (n[c.ownership] || 0) + 1;
  return OWN_ORDER.filter((o) => n[o]).map((o) => `${n[o]} ${o}`).join(', ');
};
const listOf = (arr) => (arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);

const files = new Map(); // repo-relative path -> content
const index = {};
const search = [];

for (const K of KINDS) {
  // state -> key -> items, and state -> city -> key -> items
  const byState = {};
  for (const c of K.items) {
    if (!stateById[c.state] || !c.city) continue;
    for (const k of K.keysOf(c)) {
      if (!K.meta[k]) continue;
      const st = (byState[c.state] ||= { keys: {}, cities: {} });
      (st.keys[k] ||= []).push(c);
      const ct = (st.cities[c.city] ||= {});
      (ct[k] ||= []).push(c);
    }
  }
  const idx = (index[K.type] = { labels: {}, states: {} });
  const usedKeys = new Set();

  for (const s of states) {
    const st = byState[s.id];
    if (!st) continue;
    const sEntry = { name: s.name, lists: {}, cities: {} };
    for (const [k, list] of Object.entries(st.keys)) {
      if (list.length < MIN) continue;
      sEntry.lists[k] = list.length;
      usedKeys.add(k);
      files.set(`${K.type}/${s.id}/${k}.html`, landing(K, s, null, k, list));
    }
    for (const [city, keys] of Object.entries(st.cities)) {
      const cslug = slugify(city);
      const cEntry = { name: city, lists: {} };
      for (const [k, list] of Object.entries(keys)) {
        if (list.length < MIN || list.length === st.keys[k].length) continue;
        cEntry.lists[k] = list.length;
        usedKeys.add(k);
        files.set(`${K.type}/${s.id}/${cslug}/${k}.html`, landing(K, s, city, k, list));
      }
      if (Object.keys(cEntry.lists).length) sEntry.cities[cslug] = cEntry;
    }
    if (!Object.keys(sEntry.lists).length) continue;
    const total = new Set(Object.values(st.keys).flat()).size;
    // Counts stored as numbers: Liquid's `size` on a hash differs between Jekyll and liquidjs.
    idx.states[s.id] = {
      name: sEntry.name, listings: total,
      cities_n: new Set(Object.values(st.keys).flat().map((c) => c.city)).size,
      lists_n: Object.keys(sEntry.lists).length,
      city_lists_n: Object.values(sEntry.cities).reduce((a, c) => a + Object.keys(c.lists).length, 0),
      lists: sEntry.lists, cities: sEntry.cities,
    };
    files.set(`${K.type}/${s.id}/index.html`, stateHub(K, s, total));
    search.push({
      t: `${K.type === 'colleges' ? 'Colleges' : 'Coaching centres'} in ${s.name}`,
      s: `Verified ${K.type === 'colleges' ? 'college' : 'coaching'} lists by ${K.type === 'colleges' ? 'course' : 'exam'} and city`,
      u: `${K.type}/${s.id}/`, c: K.type,
      k: `${s.name.toLowerCase()} ${K.type} ${K.type === 'colleges' ? 'college university' : 'coaching institute classes'} list`,
    });
  }
  // Labels only for keys that have pages, in the hub's stream order.
  const order = explorer.streams.flatMap((x) => x[K.hub] || []);
  for (const k of [...usedKeys].sort((a, b) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999))) {
    idx.labels[k] = { short: K.short(k), phrase: K.phrase(k), finder: K.finder(k) };
  }
  files.set(`${K.type}/index.html`, directory(K));
  search.push({
    t: K.type === 'colleges' ? 'Verified college lists by state' : 'Verified coaching lists by state',
    s: K.type === 'colleges' ? 'Every state, course and city with a verified college list' : 'Every state, exam and city with verified coaching centres',
    u: `${K.type}/`, c: K.type, k: `${K.type} state city list directory`,
  });
}

function landing(K, s, city, k, list) {
  const place = city ? `${city}, ${s.name}` : s.name;
  const phrase = K.phrase(k);
  const isCollege = K.type === 'colleges';
  // Long course names fall back to the short label, then the brand goes, then (city pages) the state.
  const noun = `${K.short(k)} ${isCollege ? 'Colleges' : 'Coaching'}`;
  const bases = [`Verified ${phrase} in ${place}`, `${phrase} in ${place}`, `${noun} in ${place}`];
  const title = fitTitle(...bases.map((b) => `${b} | ${SHORT}`), ...bases, ...(city ? [`${noun} in ${city}`] : []));
  let description;
  if (isCollege) {
    const own = ownSummary(list);
    description = `Explore ${list.length} verified ${K.short(k)} institutions in ${place}${own ? ` (${own})` : ''} with official website and counselling links. Fees and cutoffs come from the official authority.`;
  } else {
    const brands = [...new Set(list.map((c) => c.name.split(/ — | - /)[0].trim()))];
    description = `Explore ${list.length} verified ${K.short(k)} coaching centres in ${place}, including ${listOf(brands.slice(0, 3))}${brands.length > 3 ? ' and more' : ''}, each linked to its official branch page.`;
  }
  const stream = streamOf(K.hub, k);
  const lines = [
    '---',
    '# Generated by scripts/build-seo-landings.mjs from the finder data. Do not edit: change the data and rerun it.',
    `title: ${q(title)}`,
    `description: ${q(fitDesc(description))}`,
    `og_title: ${q(fitTitle(...bases, ...(city ? [`${noun} in ${city}`] : [])))}`,
    'og_type: "website"',
    ...(stream ? [`stream: ${stream}`] : []),
    `seo_type: ${K.type}`,
    'seo_kind: list',
    `state: ${s.id}`,
    ...(city ? [`city: ${q(city)}`] : []),
    `${isCollege ? 'course' : 'exam'}: ${k}`,
    'breadcrumb:',
    `  parent_href: ${q(city ? `${K.type}/${s.id}/${k}.html` : `${K.type}/${s.id}/`)}`,
    `  parent_label: ${q(city ? `${K.short(k)} in ${s.name}` : `${isCollege ? 'Colleges' : 'Coaching'} in ${s.name}`)}`,
    `  current: ${q(city ? city : K.short(k))}`,
    '---',
    '{% include seo-listing-renderer.html %}',
    '',
  ];
  return lines.join('\n');
}

function stateHub(K, s, total) {
  const isCollege = K.type === 'colleges';
  const what = isCollege ? 'Colleges & Universities' : 'Coaching Centres';
  return [
    '---',
    '# Generated by scripts/build-seo-landings.mjs from the finder data. Do not edit: change the data and rerun it.',
    `title: ${q(fitTitle(`Verified ${what} in ${s.name} | ${SHORT}`, `${what} in ${s.name} | ${SHORT}`, `${isCollege ? 'Colleges' : 'Coaching'} in ${s.name} | ${SHORT}`))}`,
    `description: ${q(fitDesc(`${total} verified ${isCollege ? 'colleges, universities, polytechnics and ITIs' : 'coaching centres'} in ${s.name}, grouped by ${isCollege ? 'course' : 'exam'} and city, each linked to its official website.`))}`,
    `og_title: ${q(fitTitle(`Verified ${what} in ${s.name}`, `${what} in ${s.name}`, `${isCollege ? 'Colleges' : 'Coaching'} in ${s.name}`))}`,
    'og_type: "website"',
    `seo_type: ${K.type}`,
    'seo_kind: state',
    `state: ${s.id}`,
    'breadcrumb:',
    `  parent_href: ${q(`${K.type}/`)}`,
    `  parent_label: ${q(isCollege ? 'Colleges by state' : 'Coaching by state')}`,
    `  current: ${q(s.name)}`,
    '---',
    '{% include seo-listing-renderer.html %}',
    '',
  ].join('\n');
}

function directory(K) {
  const isCollege = K.type === 'colleges';
  return [
    '---',
    '# Generated by scripts/build-seo-landings.mjs from the finder data. Do not edit: change the data and rerun it.',
    `title: ${q(isCollege ? `Verified College Lists by State & City | ${SHORT}` : `Verified Coaching Lists by State & City | ${SHORT}`)}`,
    `description: ${q(isCollege ? 'Browse verified Indian colleges, universities, polytechnics and ITIs by state, course and city, each linked to its official website and counselling authority.' :'Browse verified coaching centres for NEET, JEE, CA, CLAT, UPSC and more by state, exam and city. Every centre links to its official branch page.')}`,
    'og_type: "website"',
    `seo_type: ${K.type}`,
    'seo_kind: directory',
    'breadcrumb:',
    `  parent_href: ${q(isCollege ? 'colleges.html' : 'coaching.html')}`,
    `  parent_label: ${q(isCollege ? 'Colleges' : 'Coaching')}`,
    `  current: ${q('Browse by state')}`,
    '---',
    '{% include seo-listing-renderer.html %}',
    '',
  ].join('\n');
}

const dataFile = [
  '# Generated by scripts/build-seo-landings.mjs — index of the verified-list pages under colleges/ and coaching/.',
  '# Read by _includes/seo-listing-renderer.html (related links), seo-browse-states.html and assets/search.json.',
  '# Do not edit by hand: change _data/colleges.yml / coaching.yml and rerun the script.',
  yaml.dump({ min_listings: MIN, ...index, search }, { lineWidth: -1, noRefs: true, quotingType: '"' }),
].join('\n');
files.set('_data/seo_landings.yml', dataFile);

// ---- write / check ----
const existing = [];
const walk = (d) => {
  if (!fs.existsSync(path.join(root, d))) return;
  for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
    const r = d + '/' + e.name;
    if (e.isDirectory()) walk(r); else if (r.endsWith('.html')) existing.push(r);
  }
};
walk('colleges'); walk('coaching');
const stale = existing.filter((f) => !files.has(f));
const changed = [...files].filter(([f, c]) => {
  const p = path.join(root, f);
  // Compare without \r: git on Windows may check these files out with CRLF line endings.
  return !fs.existsSync(p) || fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') !== c;
}).map(([f]) => f);

const pages = [...files.keys()].filter((f) => f.endsWith('.html'));
for (const t of ['colleges', 'coaching']) {
  const depth = (n) => pages.filter((f) => f.startsWith(t + '/') && f.split('/').length === n);
  const hubs = depth(3).filter((f) => f.endsWith('/index.html')).length;
  console.log(`${t}: ${depth(3).length - hubs} state lists, ${depth(4).length} city lists, ${hubs} state hubs`);
}
console.log(`${pages.length} pages in total`);

if (CHECK) {
  if (changed.length || stale.length) {
    console.log(`OUT OF DATE: ${changed.length} file(s) to write, ${stale.length} stale page(s). Rerun without --check.`);
    for (const f of [...changed, ...stale].slice(0, 20)) console.log('  ' + f);
    process.exit(1);
  }
  console.log('OK: landing pages match the data');
  process.exit(0);
}
for (const f of changed) {
  fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
  fs.writeFileSync(path.join(root, f), files.get(f));
}
console.log(`wrote ${changed.length} file(s)`);
if (stale.length) {
  if (PRUNE) { for (const f of stale) fs.unlinkSync(path.join(root, f)); console.log(`deleted ${stale.length} stale page(s)`); }
  else { console.log(`${stale.length} page(s) no longer qualify (rerun with --prune to delete them):`); for (const f of stale) console.log('  ' + f); }
}
