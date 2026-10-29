// Study Abroad engine (India edition, 2026-10-29): writes the page stubs for study-abroad/** from
//   _data/in/abroad_common.yml   hub text, exams, India-side guides, fx table
//   _data/in/abroad/<id>.yml     one sheet per country (7 pillars + visa + doubts + sources)
// Pages (every body is a Liquid include that reads the same data at build time):
//   study-abroad/index.html               master portal            (_includes/abroad-hub.html)
//   study-abroad/<id>.html                country guide            (_includes/abroad-country.html)
//   study-abroad/visas/<visa.slug>.html   visa deep dive           (_includes/abroad-visa.html)
//   study-abroad/exams/<slug>.html        exam deep dive           (_includes/abroad-exam.html)
//   study-abroad/<guide>.html             India-side guide         (_includes/abroad-guide.html)
//   study-abroad.html                     redirect to study-abroad/ (the old hub URL keeps working)
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-abroad.mjs [--check]
// --check only reports missing / stale stubs. Titles and descriptions go through scripts/lib/seo-fit.mjs (60 / 160).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { fitTitle, fitDesc } from './lib/seo-fit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const check = process.argv.includes('--check');
const read = (rel) => yaml.load(fs.readFileSync(path.join(root, rel), 'utf8'));
const AC = read('_data/in/abroad_common.yml');
const dir = path.join(root, '_data/in/abroad');
const C = fs.readdirSync(dir).filter((f) => f.endsWith('.yml')).sort().map((f) => read(`_data/in/abroad/${f}`));
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

let wrote = 0;
const stale = [];
const put = (rel, stub) => {
  const out = path.join(root, rel);
  const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').replace(/\r\n/g, '\n') : null;
  if (cur === stub) return;
  if (check) { stale.push(`${rel} ${cur === null ? 'missing' : 'out of date'}`); return; }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, stub);
  wrote++;
};
const front = ({ title, description, og = 'article', crumb, parent }) => `---
title: "${esc(fitTitle(title))}"
description: "${esc(fitDesc(description))}"
og_type: "${og}"
breadcrumb:
${parent ? `  parent_href: "${parent[0]}"\n  parent_label: "${esc(parent[1])}"\n` : ''}  current: "${esc(crumb)}"
---
`;
const HUB = ['study-abroad/', 'Study Abroad'];

put('study-abroad/index.html', front({ title: AC.hub.seo_title, description: AC.hub.description, og: 'website', crumb: 'Study Abroad' }) +
  '{% include abroad-hub.html %}\n');

// The old hub address: same redirect_to shape as the other stubs in redirects/ (jekyll-redirect-from).
put('study-abroad.html', `---
permalink: /study-abroad.html
redirect_to: "https://emargdarshan.com/study-abroad/"
sitemap: false
---
`);

for (const c of C) {
  put(`study-abroad/${c.id}.html`, front({ title: c.seo_title, description: c.description, crumb: c.short, parent: HUB }) +
    `{% include abroad-country.html id="${c.id}" %}\n`);
  const v = c.visa;
  put(`study-abroad/visas/${v.slug}.html`, front({ title: v.seo_title, description: v.description, crumb: v.short, parent: [`study-abroad/${c.id}.html`, c.short] }) +
    `{% include abroad-visa.html id="${c.id}" %}\n`);
}
for (const [slug, e] of Object.entries(AC.exams)) {
  put(`study-abroad/exams/${slug}.html`, front({ title: e.seo_title, description: e.description, crumb: e.short, parent: HUB }) +
    `{% include abroad-exam.html exam="${slug}" %}\n`);
}
for (const [slug, g] of Object.entries(AC.guides)) {
  put(`study-abroad/${slug}.html`, front({ title: g.seo_title, description: g.description, crumb: g.short, parent: HUB }) +
    `{% include abroad-guide.html guide="${slug}" %}\n`);
}

// A stub whose data left the sheets would keep serving an empty page: report it (never delete it here).
const known = new Set(['index.html', ...C.map((c) => `${c.id}.html`), ...Object.keys(AC.guides).map((g) => `${g}.html`)]);
for (const f of fs.readdirSync(path.join(root, 'study-abroad'))) {
  if (f.endsWith('.html') && !known.has(f)) stale.push(`study-abroad/${f} has no data sheet (make it a redirect_to stub)`);
}
for (const [sub, keys] of [['visas', C.map((c) => c.visa.slug)], ['exams', Object.keys(AC.exams)]]) {
  const d = path.join(root, 'study-abroad', sub);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (f.endsWith('.html') && !keys.includes(f.slice(0, -5))) stale.push(`study-abroad/${sub}/${f} has no data entry`);
}

for (const s of stale) console.error('  ' + s);
const n = 2 + C.length * 2 + Object.keys(AC.exams).length + Object.keys(AC.guides).length;
console.log(check ? `checked ${n} study-abroad stub(s): ${stale.length} problem(s)` : `wrote ${wrote} of ${n} study-abroad stub(s)`);
if (stale.length) process.exit(1);
