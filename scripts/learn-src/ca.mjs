// learn-src/ca — listings for the Chartered Accountancy "where to learn" finder (learn/ca.html).
//   VERIFY_DEPS=<deps> node scripts/learn-src/ca.mjs
//
// Writes assets/data/learn/ca.json, never by hand, from:
//   - every ICAI branch, read from the five regional councils' branch lists by scripts/learn-src/ca/icai.mjs into
//     ca/data/icai.json (rerun it to refresh), plus the five regional council offices themselves.
//   - every CA centre (`ca` exam) in _data/coaching.yml, each from its brand's official centre locator / branch page
//     (ICAI branches' own coaching-class pages are in there too, as brand `icai`).
// CA is taught by ICAI (Board of Studies material, ICITSS/AICITSS, articleship), not by colleges, so B.Com colleges
// are left to the B.Com finder.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const coaching = yaml.load(fs.readFileSync(path.join(root, '_data/coaching.yml'), 'utf8'));
const icai = JSON.parse(fs.readFileSync(path.join(root, 'scripts/learn-src/ca/data/icai.json'), 'utf8'));
const CHECKED = '2026-10-30';

const COUNCIL = {
  NIRC: { name: 'Northern India Regional Council', url: 'https://nirc.icai.org/', state: 'delhi', city: 'New Delhi' },
  WIRC: { name: 'Western India Regional Council', url: 'https://wirc-icai.org/', state: 'maharashtra', city: 'Mumbai' },
  SIRC: { name: 'Southern India Regional Council', url: 'https://sirc-icai.org/', state: 'tamil-nadu', city: 'Chennai', address: 'ICAI Bhawan, 122, Mahatma Gandhi Road, Nungambakkam, Chennai - 600034' },
  EIRC: { name: 'Eastern India Regional Council', url: 'https://www.eirc-icai.org/', state: 'west-bengal', city: 'Kolkata' },
  CIRC: { name: 'Central India Regional Council', url: 'https://circ.icai.org/', state: 'uttar-pradesh', city: 'Kanpur' },
};
const SRC = { NIRC: 'NIRC branch list', WIRC: 'WIRC branch list', SIRC: 'SIRC branch list', EIRC: 'EIRC branch list', CIRC: 'CIRC branch list (archived)' };

const rows = [];
for (const [id, c] of Object.entries(COUNCIL)) {
  rows.push({
    name: `ICAI ${c.name} (${id})`, type: 'ICAI office', ownership: 'Statutory body', state: c.state, city: c.city,
    about: [c.address, `Regional office of the Institute of Chartered Accountants of India, which runs the CA course; it oversees the ${id} branches.`].filter(Boolean).join('. '),
    url: c.url, url_label: `${id} website`, source: `icai-${id.toLowerCase()}`, src_label: `${id} website`, checked: CHECKED,
  });
}
for (const b of icai.rows) {
  rows.push({
    name: b.name, type: 'ICAI office', ownership: 'Statutory body', state: b.state, city: b.city,
    about: [b.address, `Local branch of ICAI's ${COUNCIL[b.council].name}: ask here about student registration, ICITSS/orientation batches, study circles and the classes the branch runs.`].filter(Boolean).join('. '),
    url: b.url, url_label: /\/(wirc-branches|branch-contact-details-2|branches-of-eirc|sirc-of-icai-in-)/.test(b.url) ? `${b.council} list of branches` : 'Branch website',
    source: `icai-${b.council.toLowerCase()}`, src_label: SRC[b.council], checked: CHECKED,
  });
}
for (const c of coaching.centres) {
  if (!(c.exams || []).includes('ca')) continue;
  const brand = coaching.brands[c.brand] || {};
  rows.push({
    name: c.name, type: 'CA coaching', ownership: c.brand === 'icai' ? 'Statutory body' : c.ownership || 'Private', state: c.state, city: c.city,
    about: c.area, url: c.url, url_label: c.url_label || 'Official website',
    source: `brand:${c.brand}`, checked: CHECKED,
    ...(brand.formats ? { mode: brand.formats } : {}),
    ...(brand.batches ? { batches: brand.batches } : {}),
    ...(c.region ? { region: c.region } : {}),
  });
}
const bad = rows.filter((r) => !r.state || !r.city || !r.url);
if (bad.length) throw new Error('rows missing state/city/url: ' + bad.map((r) => r.name).join(', '));
const out = path.join(root, 'assets/data/learn/ca.json');
fs.writeFileSync(out, JSON.stringify(rows) + '\n');
const n = (t) => rows.filter((r) => r.type === t).length;
console.log(`ca: ${rows.length} listings (${n('ICAI office')} ICAI offices, ${n('CA coaching')} CA coaching centres)`);
