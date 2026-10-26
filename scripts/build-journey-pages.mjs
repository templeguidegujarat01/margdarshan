// Gives every career in _data/in/journey_matrix.yml its own blueprint page, journey-<id>.html (2026-10-26).
// journey-blueprint.html only picks a career + class and redirects to journey-<id>.html?class=10; the page itself is
// _includes/journey-doubts.html rendered at build time, so it is plain HTML that works without JS and is indexable.
// A stub is written only when it is missing — hand-edited front matter (title, description, footer links) is kept.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-journey-pages.mjs [--check]
// --check writes nothing and exits 1 if a career has no page or a journey-*.html page names a career that is gone.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { fitTitle, fitDesc } from './lib/seo-fit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const check = process.argv.includes('--check');
const D = yaml.load(fs.readFileSync(path.join(root, '_data', 'in', 'journey_matrix.yml'), 'utf8'));

// "Loco Pilot (Indian Railways)" -> "Loco Pilot"; "Doctor / Physician (NEET-UG → MBBS)" -> "Doctor / Physician".
const short = (n) => n.replace(/\s*\(.*\)\s*$/, '').trim();
const an = (w) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const q = (s) => JSON.stringify(s);

const ids = new Set(D.careers.map((c) => c.id));
const problems = [];
let made = 0;
for (const c of D.careers) {
  const file = path.join(root, `journey-${c.id}.html`);
  if (fs.existsSync(file)) {
    if (!fs.readFileSync(file, 'utf8').includes(`{% include journey-doubts.html id="${c.id}" %}`)) problems.push(`journey-${c.id}.html does not include journey-doubts.html id="${c.id}"`);
    continue;
  }
  if (check) { problems.push(`journey-${c.id}.html missing — run node scripts/build-journey-pages.mjs`); continue; }
  const s = short(c.name);
  const title = fitTitle(`How to Become ${an(s)} ${s}: Class 8 to Career Road`, `How to Become ${an(s)} ${s}: Class by Class`, `${s}: Class 8 to Career Road`, `${s} Career Road`);
  const desc = fitDesc(`${s} road from Class 8: ${plain(c.gate)}`);
  const links = [
    { href: c.page, label: `Full ${s} guide` },
    c.roadmap && { href: c.roadmap, label: 'Step-by-step roadmap' },
    c.exam && c.exam.href && c.exam.href !== c.page && { href: c.exam.href, label: 'Exam guide' },
  ].filter(Boolean);
  const fm = [
    '---',
    `title: ${q(title)}`,
    `description: ${q(desc)}`,
    'og_type: "article"',
    `h1: ${q(`How to become ${an(s)} ${s} — your road, class by class`)}`,
    'breadcrumb:',
    '  parent_href: "journey-blueprint.html"',
    '  parent_label: "Journey Blueprint"',
    `  current: ${q(s)}`,
    'footer:',
    `  col3_heading: ${q(s)}`,
    '  col3_links:',
    ...links.map((l) => `    - { href: ${q(l.href)}, label: ${q(l.label)} }`),
    '---',
    `{% include journey-doubts.html id="${c.id}" %}`,
    '',
  ].join('\n');
  fs.writeFileSync(file, fm);
  made++;
}
for (const f of fs.readdirSync(root)) {
  const m = f.match(/^journey-(.+)\.html$/);
  if (m && m[1] !== 'blueprint' && !ids.has(m[1])) problems.push(`${f} has no career "${m[1]}" in journey_matrix.yml`);
}
if (problems.length) { console.error(`journey pages: ${problems.length} problem(s)`); for (const p of problems) console.error('  - ' + p); process.exit(1); }
console.log(check ? `journey pages OK: ${ids.size} careers, ${ids.size} pages` : `journey pages: ${made} written, ${ids.size - made} kept`);
