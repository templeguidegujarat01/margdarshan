// Writes the standalone cross-border roadmap page of every `crossborder` track in the USA and UK editions.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-intl-roadmaps.mjs [--check]
// Sources: _data/us/pathways.yml crossborder[]   → us/roadmaps/<slug>.html (track: <slug>)
//          _data/us/cte_careers.yml list[]       → us/roadmaps/<slug>.html (track: <slug>, cte: true)
//          _data/uk/careers/<sheet>.yml crossborder[] → uk/roadmaps/<slug>.html (track: <slug>, sheet: <sheet>)
// Each stub is front matter around {% include intl-roadmap.html %}; the page content comes from the data.
// Rerun after adding a track or changing its title / lede; --check only reports stubs that are missing or
// out of date (check-us-data.mjs and check-uk-data.mjs also fail on a missing stub).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const check = process.argv.includes('--check');
const load = (f) => yaml.load(fs.readFileSync(path.join(root, f), 'utf8'));

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:]$/, '') + '…');

const jobs = [];
const US = load('_data/us/pathways.yml');
for (const X of US.crossborder || []) {
  const P = US.list.find((p) => p.slug === X.pathway) || { title: X.pathway };
  jobs.push({ ed: 'us', X, brand: 'Education Margdarshan USA', parent_href: `us/careers/${X.pathway}/`, parent_label: P.title, extra: '' });
}
// Trades & CTE (2026-10-20): same page engine, data from _data/us/cte_careers.yml; `cte: true` picks it.
for (const X of load('_data/us/cte_careers.yml').list || []) {
  jobs.push({ ed: 'us', X, brand: 'Education Margdarshan USA', parent_href: 'us/#cte', parent_label: 'Trades & CTE', extra: 'cte: true\n', current: 'Roadmap' });
}
const ukDir = path.join(root, '_data/uk/careers');
for (const f of fs.readdirSync(ukDir).filter((x) => x.endsWith('.yml')).sort()) {
  const C = load(`_data/uk/careers/${f}`);
  for (const X of C.crossborder || []) {
    jobs.push({ ed: 'uk', X, brand: 'Education Margdarshan UK', parent_href: `uk/careers/${C.slug}/`, parent_label: plain(C.title), extra: `sheet: ${C.slug}\n` });
  }
}

let wrote = 0;
const stale = [];
for (const J of jobs) {
  const { X } = J;
  const stub = `---
title: "${esc(plain(X.title))} — Step-by-Step Roadmap | ${J.brand}"
description: "${esc(clip(plain(X.lede), 300))}"
og_type: "article"
track: ${X.slug}
${J.extra}breadcrumb:
  parent_href: "${J.parent_href}"
  parent_label: "${esc(J.parent_label)}"
  current: "${J.current || 'Trained abroad: roadmap'}"
---
{% include intl-roadmap.html %}
`;
  const rel = `${J.ed}/roadmaps/${X.slug}.html`;
  const out = path.join(root, rel);
  const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').replace(/\r\n/g, '\n') : null;
  if (cur === stub) continue;
  if (check) { stale.push(`${rel} ${cur === null ? 'missing' : 'out of date'}`); continue; }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, stub);
  wrote++;
}
for (const s of stale) console.error('  ' + s);
console.log(check ? `checked ${jobs.length} cross-border + trades roadmap page(s), ${stale.length} problem(s)` : `wrote ${wrote} cross-border + trades roadmap page(s)`);
if (stale.length) process.exit(1);
