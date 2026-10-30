// learn-src/engineering — listings for the B.E./B.Tech + JEE "where to learn" finder (learn/engineering.html).
//   VERIFY_DEPS=<deps> node scripts/learn-src/engineering.mjs
//
// Writes assets/data/learn/engineering.json, never by hand, from:
//   - state counselling registers, each read by its own fetcher in scripts/learn-src/engineering/<src>.mjs into
//     engineering/data/<src>.json (rerun a fetcher to refresh it): Maharashtra CET Cell, KEA (Karnataka),
//     Anna University (Tamil Nadu / TNEA), TGEAPCET (Telangana), UPTAC (Uttar Pradesh), ACPC (Gujarat), KEAM (Kerala).
//   - every college with the `btech` course in _data/colleges.yml (IITs, NITs, IIITs and other institutes checked on
//     their own sites). A register row with the same name in the same state takes that college's official website.
//   - every JEE centre (`jee` exam) in _data/coaching.yml, each from its brand's official centre locator / branch page.
// AICTE's approved-institutes dashboard (facilities.aicte-india.org) refused every connection on 2026-10-30, so the
// states without a readable register (AP, WB, MP, Rajasthan, …) only have the colleges.yml institutes for now.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { city as cityName } from './engineering/_lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const load = (f) => yaml.load(fs.readFileSync(path.join(root, '_data', f), 'utf8'));
const src = (f) => JSON.parse(fs.readFileSync(path.join(root, 'scripts/learn-src/engineering/data', f + '.json'), 'utf8'));
const colleges = load('colleges.yml');
const coaching = load('coaching.yml');
const CHECKED = '2026-10-30';

// One entry per register: state, how seats are filled, the counselling body, and the label for its page link.
const REG = {
  mh: { state: 'maharashtra', label: 'CET Cell institute page', src: 'State CET Cell list', admission: 'MHT CET or JEE Main merit, through the State CET Cell CAP rounds.', body: 'State CET Cell, Maharashtra (FE admissions)', body_url: 'https://fe2026.mahacet.org/' },
  ka: { state: 'karnataka', label: 'KEA UGCET 2026', src: 'KEA UGCET list', admission: 'KCET rank, through KEA counselling.', body: 'Karnataka Examinations Authority', body_url: 'https://cetonline.karnataka.gov.in/kea/' },
  tn: { state: 'tamil-nadu', label: 'Anna University list', src: 'Anna University list', admission: 'TNEA counselling on Class 12 marks (no entrance test).', body: 'TNEA (DOTE Tamil Nadu)', body_url: 'https://www.tneaonline.org/' },
  tg: { state: 'telangana', label: 'TGEAPCET counselling', src: 'TGEAPCET list', admission: 'TG EAPCET rank, through TGEAPCET counselling.', body: 'TGEAPCET counselling (DTE Telangana)', body_url: 'https://tgeapcet.nic.in/' },
  up: { state: 'uttar-pradesh', label: 'UPTAC counselling', src: 'UPTAC list', admission: 'JEE Main rank, through UPTAC counselling (AKTU).', body: 'UPTAC (AKTU)', body_url: 'https://uptac.samarth.edu.in/' },
  gj: { state: 'gujarat', label: 'ACPC seat matrix', src: 'ACPC seat matrix', admission: 'GUJCET or JEE Main merit, through ACPC counselling.', body: 'ACPC Gujarat (BE/B.Tech)', body_url: 'https://acpc.gujarat.gov.in/be-b-tech' },
  kl: { state: 'kerala', label: 'KEAM 2026', src: 'KEAM prospectus', admission: 'KEAM rank, through CEE Kerala allotment.', body: 'CEE Kerala (KEAM)', body_url: 'https://cee.kerala.gov.in/keam2026' },
};
const about = {
  mh: (r) => [r.address, r.university && `Affiliated to ${r.university}`].filter(Boolean).join('. '),
  ka: (r) => r.address,
  tn: (r) => `${r.district} district. TNEA code ${r.tnea}, Anna University exam code ${r.exam_code}${r.autonomous ? ', autonomous' : ''}.`,
  tg: (r) => `${r.area}, ${r.district} district. TGEAPCET code ${r.code}${r.autonomous ? ', autonomous' : ''}.`,
  up: () => '',
  gj: (r) => r.address,
  kl: (r) => `KEAM code ${r.code}${r.university ? `, ${r.university}` : ''}.`,
};
const key = (s) => String(s).toLowerCase().replace(/\(.*?\)/g, ' ').replace(/\b(the|of|and|&|college|institute|engineering|technology|engg|tech|govt|government)\b/g, ' ').replace(/[^a-z0-9]+/g, '');

// Same college under two spellings? Letters only, old city names unified; one name must start with the other
// ("PSG College of Technology" / "P.S.G. College of Technology"), or both share a distinctive 18-letter start.
const letters = (s) => String(s).toLowerCase().replace(/\(.*?\)/g, '').replace(/&/g, 'and').replace(/trivandrum/g, 'thiruvananthapuram').replace(/baroda/g, 'vadodara').replace(/[^a-z]/g, '');
const GENERIC = /^(college|government|govt|institute|university|school|department|sri|shri|shree|indian)/;
function same(a, b) {
  const x = letters(a), y = letters(b);
  if (x.length < 10 || y.length < 10) return false;
  if (x.startsWith(y) || y.startsWith(x)) return true;
  return !GENERIC.test(x) && x.slice(0, 18) === y.slice(0, 18);
}
const rows = [];
const seen = new Map(); // state|name key → row
for (const [id, R] of Object.entries(REG)) {
  for (const r of src(id).rows) {
    if (!r.city && r.district) r.city = cityName(r.district); // Maharashtra lists the district
    if (!r.city) continue;
    const k = `${R.state}|${key(r.name)}|${r.city}`;
    const prev = seen.get(k);
    if (prev) { prev.branches = [...new Set([...(prev.branches || []), ...(r.branches || [])])]; continue; }
    const official = r.url && !/mahacet|karnataka\.gov|annauniv|tgeapcet|samarth|acpc\.gujarat|cee\.kerala/.test(r.url);
    const row = {
      name: r.name, type: 'Engineering college', ...(r.ownership ? { ownership: r.ownership } : {}), state: R.state, city: r.city,
      about: about[id](r) || undefined, url: r.url, url_label: official ? 'Official website' : R.label,
      source: id, src_label: R.src, checked: CHECKED,
      ...(r.branches && r.branches.length ? { branches: r.branches } : {}),
      ...(r.seats ? { seats: r.seats, as_of: '2026-27' } : {}),
      admission: R.admission, body: R.body, body_url: R.body_url,
    };
    seen.set(k, row);
    rows.push(row);
  }
}
// colleges.yml B.Tech institutes: enrich a matching register row, otherwise list it on its own.
let enriched = 0, own = 0;
for (const c of colleges.colleges) {
  if (!(c.courses || []).includes('btech')) continue;
  // Same state and city too: "JNTUH University College of Engineering" (Hyderabad) is a prefix of the Jagitial campus.
  const hit = rows.find((r) => r.state === c.state && r.city === c.city && r.type === 'Engineering college' && same(c.name, r.name));
  if (hit) {
    Object.assign(hit, { url: c.url, url_label: c.url_label || 'Official website' });
    if (!hit.ownership && c.ownership) hit.ownership = c.ownership;
    enriched++;
    continue;
  }
  rows.push({
    name: c.name, type: 'Engineering college', ownership: c.ownership, state: c.state, city: c.city,
    about: c.desc, url: c.url, url_label: c.url_label || 'Official website', source: 'official', src_label: 'official site', checked: CHECKED,
    ...(c.counselling ? { admission: c.counselling } : {}),
  });
  own++;
}
for (const c of coaching.centres) {
  if (!(c.exams || []).includes('jee')) continue;
  const brand = coaching.brands[c.brand] || {};
  rows.push({
    name: c.name, type: 'JEE coaching', ownership: c.ownership || 'Private', state: c.state, city: c.city,
    about: c.area, url: c.url, url_label: c.url_label || 'Official website',
    source: `brand:${c.brand}`, src_label: 'brand locator', checked: CHECKED,
    ...(brand.formats ? { mode: brand.formats } : {}),
    ...(brand.batches ? { batches: brand.batches } : {}),
    ...(c.region ? { region: c.region } : {}),
  });
}
const out = path.join(root, 'assets/data/learn/engineering.json');
fs.writeFileSync(out, JSON.stringify(rows) + '\n');
const n = (t) => rows.filter((r) => r.type === t).length;
const by = {}; for (const r of rows) if (r.type === 'Engineering college') by[r.source] = (by[r.source] || 0) + 1;
console.log(`engineering: ${rows.length} listings (${n('Engineering college')} engineering colleges, ${n('JEE coaching')} JEE coaching centres)`);
console.log('  colleges by source:', JSON.stringify(by), `| colleges.yml: ${enriched} matched a register row, ${own} listed on their own`);
