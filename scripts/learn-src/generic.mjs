// learn-src/generic — listings for any "where to learn" finder that has no hand-written learn-src/<id>.mjs
// (the finders the inbox pipeline creates from docs/free-claude/topics.yml: cs-coaching, bcom-colleges, football …).
//   VERIFY_DEPS=<deps> node scripts/learn-src/generic.mjs <finder-id>
//
// Writes assets/data/learn/<id>.json, never by hand, from:
//   - every centre in _data/coaching.yml with an exam in the finder's keys.coaching (official branch pages), and
//   - every college in _data/colleges.yml with a course in keys.colleges (official websites),
//     so the finder holds everything the old coaching/<state>/<key>.html and colleges/<state>/<key>.html pages
//     held, and those pages can redirect here (build-seo-landings.mjs);
//   - then the hand-researched local rows in scripts/learn-src/local/<id>/<state>.yml (state fills).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { localRows } from './local.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const id = process.argv[2];
if (!id) { console.log('usage: node scripts/learn-src/generic.mjs <finder-id>'); process.exit(1); }
const load = (f) => yaml.load(fs.readFileSync(path.join(root, f), 'utf8'));
const F = load(`_data/in/learn/${id}.yml`);
const keys = F.keys || {};
const typeFor = (kind, k) => (F.key_types && F.key_types[kind] && F.key_types[kind][k]) || F.types[0];
const UNI = /universit|vidyapee?th|vishwavidyalaya|deemed/i;

const rows = [];
const seen = new Set();
const key = (r) => `${r.name}|${r.city}`.toLowerCase().replace(/[^a-z0-9|]+/g, '');
const push = (r) => { if (seen.has(key(r))) return; seen.add(key(r)); rows.push(r); };

if ((keys.coaching || []).length) {
  const coaching = load('_data/coaching.yml');
  for (const c of coaching.centres) {
    const k = (c.exams || []).find((x) => keys.coaching.includes(x));
    if (!k) continue;
    const brand = coaching.brands[c.brand] || {};
    push({
      name: c.name, type: typeFor('coaching', k), ownership: c.ownership || 'Private', state: c.state, city: c.city,
      about: c.area, url: c.url, url_label: c.url_label || 'Official website',
      source: `brand:${c.brand}`, src_label: 'official centre page', checked: F.checked,
      ...(brand.formats ? { mode: brand.formats } : {}),
      ...(brand.batches ? { batches: brand.batches } : {}),
      ...(c.region ? { region: c.region } : {}),
    });
  }
}
if ((keys.colleges || []).length) {
  const colleges = load('_data/colleges.yml');
  for (const c of colleges.colleges) {
    const k = (c.courses || []).find((x) => keys.colleges.includes(x));
    if (!k) continue;
    push({
      name: c.name, type: F.types.includes('University') && UNI.test(c.name) ? 'University' : typeFor('colleges', k),
      ownership: c.ownership || 'Private', state: c.state, city: c.city,
      about: [c.prog && c.prog[k], c.desc].filter(Boolean).join(' — '), url: c.url, url_label: c.url_label || 'Official website',
      source: 'official', src_label: 'official website', checked: F.checked,
      ...(c.seats ? { seats: c.seats, as_of: c.as_of } : {}),
      ...(c.counselling ? { admission: c.counselling } : {}),
    });
  }
}
rows.push(...localRows(id, rows));
const bad = rows.filter((r) => !r.state || !r.city || !r.url);
if (bad.length) throw new Error('rows missing state/city/url: ' + bad.map((r) => r.name).join(', '));
fs.mkdirSync(path.join(root, 'assets/data/learn'), { recursive: true });
fs.writeFileSync(path.join(root, `assets/data/learn/${id}.json`), JSON.stringify(rows) + '\n');
const n = {}; for (const r of rows) n[r.type] = (n[r.type] || 0) + 1;
console.log(`${id}: ${rows.length} listings`, JSON.stringify(n));
