// Writes the standalone "See The Journey" roadmap page of every sport / art form in _data/in/sports.yml.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-sport-roadmaps.mjs [--check]
// Each roadmaps/<slug>.html is a front-matter stub around {% include sport-roadmap.html sport="<slug>" %};
// the content comes from the sport's chronicle_path, roadmap section and ages in the data sheet. The footer
// column is copied from the sport page so both pages share it. Rerun after adding a sport or changing its
// short name / chronicle stages; --check only reports stubs that are missing or out of date.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const check = process.argv.includes('--check');
const D = yaml.load(fs.readFileSync(path.join(root, '_data', 'in', 'sports.yml'), 'utf8'));

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

fs.mkdirSync(path.join(root, 'roadmaps'), { recursive: true });
let wrote = 0;
const stale = [];
for (const E of D.sports || []) {
  const pagePath = path.join(root, E.slug + '.html');
  if (!fs.existsSync(pagePath)) { stale.push(`${E.slug}: sport page missing`); continue; }
  const fm = (fs.readFileSync(pagePath, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
  const footer = (fm.match(/^footer:\r?\n(?:[ ]+.*\r?\n?)+/m) || [''])[0].replace(/\r/g, '').trimEnd();
  const name = plain(E.short);
  const stages = (E.chronicle_path || []).map((c) => plain(c.title));
  const what = [
    stages.length ? `the four stages (${stages.join(', ')})` : '',
    'who can start, the detailed route' + (E.domain === 'arts' ? '' : ' with trials and selection rules'),
    (E.ages ? 'what is open at every age, ' : '') + 'where to train, who pays and the jobs after',
  ].filter(Boolean).join(', ');
  const desc = `Education Margdarshan's full ${name} roadmap for India: ${what}.`;
  const stub = `---
title: "${esc(name)} Roadmap — Step-by-Step Journey ${E.domain === 'arts' ? 'from First Lesson to the Stage' : 'from First Club to the Top'} | Education Margdarshan"
description: "${esc(desc)}"
og_type: "article"
twitter_title: "${esc(name)} — Step-by-Step Roadmap"
header:
  careers_href: "${E.slug}.html"
  careers_label: "${esc(name)} guide"
  faq_href: "#sources"
  faq_label: "Sources"
breadcrumb:
  parent_href: "${E.slug}.html"
  parent_label: "${esc(name)}"
  current: "Full roadmap"
${footer ? footer + '\n' : ''}---
{% include sport-roadmap.html sport="${E.slug}" %}
`;
  const out = path.join(root, 'roadmaps', E.slug + '.html');
  const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
  if (cur === stub) continue;
  if (check) { stale.push(`roadmaps/${E.slug}.html ${cur === null ? 'missing' : 'out of date'}`); continue; }
  fs.writeFileSync(out, stub);
  wrote++;
}
for (const s of stale) console.error('  ' + s);
console.log(check ? `checked ${(D.sports || []).length} sport roadmap page(s), ${stale.length} problem(s)` : `wrote ${wrote} sport roadmap page(s)`);
if (stale.length) process.exit(1);
