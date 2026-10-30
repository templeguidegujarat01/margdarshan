// learn-src/mbbs — listings for the MBBS + NEET-UG "where to learn" finder (learn/mbbs.html).
//   VERIFY_DEPS=<deps> node scripts/learn-src/mbbs.mjs
//
// Writes assets/data/learn/mbbs.json from the site's own verified registers, never by hand:
//   - every college with the `mbbs` course in _data/colleges.yml. 834 of them are the National Medical
//     Commission MBBS list (nmc.org.in/college-courses/list, read 2026-10-30, 2026-27 seats); the rest are
//     AIIMS, JIPMER and other Institutes of National Importance, which the NMC list leaves out and which
//     were checked on their own websites.
//   - every NEET-UG centre (`neet` exam) in _data/coaching.yml, each from its brand's official centre
//     locator / branch page (coaching overhaul, audited 2026-10-30).
// To refresh the NMC part, re-read the NMC list into colleges.yml first (fetch notes: docs/learn-finder/LOG.md).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const load = (f) => yaml.load(fs.readFileSync(path.join(root, '_data', f), 'utf8'));
const colleges = load('colleges.yml');
const coaching = load('coaching.yml');
const counselling = load('counselling.yml');
const CHECKED = '2026-10-30';

const rows = [];
for (const c of colleges.colleges) {
  if (!(c.courses || []).includes('mbbs')) continue;
  const nmc = !!c.seats; // NMC-listed colleges carry the NMC 2026-27 intake; INIs do not
  rows.push({
    name: c.name, type: 'Medical college', ownership: c.ownership, state: c.state, city: c.city,
    about: c.desc, url: c.url, url_label: c.url_label || 'Official website',
    source: nmc ? 'nmc' : 'official', checked: CHECKED,
    ...(c.seats ? { seats: c.seats, as_of: c.as_of } : {}),
    admission: c.counselling,
    ...(counselling[c.body] && counselling[c.body].url !== c.url ? { body: counselling[c.body].name, body_url: counselling[c.body].url } : {}),
  });
}
for (const c of coaching.centres) {
  if (!(c.exams || []).includes('neet')) continue;
  const brand = coaching.brands[c.brand] || {};
  rows.push({
    name: c.name, type: 'NEET coaching', ownership: c.ownership || 'Private', state: c.state, city: c.city,
    about: c.area, url: c.url, url_label: c.url_label || 'Official website',
    source: `brand:${c.brand}`, checked: CHECKED,
    ...(brand.formats ? { mode: brand.formats } : {}),
    ...(brand.batches ? { batches: brand.batches } : {}),
    ...(c.region ? { region: c.region } : {}),
  });
}
const out = path.join(root, 'assets/data/learn/mbbs.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(rows) + '\n');
const n = (t) => rows.filter((r) => r.type === t).length;
console.log(`mbbs: ${rows.length} listings (${n('Medical college')} medical colleges, ${n('NEET coaching')} NEET coaching centres)`);
