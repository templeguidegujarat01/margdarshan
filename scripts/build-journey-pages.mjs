// Gives every career in _data/in/journey/<id>.yml (order: journey_common.yml `careers`) its own blueprint page, journey-<id>.html (2026-10-26).
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
import { loadJourney } from './lib/journey-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const check = process.argv.includes('--check');
const { D, problems: loadProblems } = loadJourney(root, yaml);
if (loadProblems.length) { console.error('journey data: ' + loadProblems.join('\n  ')); process.exit(1); }

// "Loco Pilot (Indian Railways)" -> "Loco Pilot"; "Doctor / Physician (NEET-UG → MBBS)" -> "Doctor / Physician".
const short = (n) => n.replace(/\s*\(.*\)\s*$/, '').trim();
const an = (w) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const q = (s) => JSON.stringify(s);

const ids = new Set(D.careers.map((c) => c.id));
const problems = [];
let made = 0;
// <title>s already used by blueprint pages: a new page whose short name repeats one (two careers named "Tour Guide")
// is titled from its 10,000-list title instead, so every page keeps a unique <title>.
const usedTitles = new Set(fs.readdirSync(root).filter((f) => /^journey-.+\.html$/.test(f))
  .map((f) => (fs.readFileSync(path.join(root, f), 'utf8').match(/^title: (".*")\r?$/m) || [])[1]).filter(Boolean).map((t) => JSON.parse(t)));
for (const c of D.careers) {
  const file = path.join(root, `journey-${c.id}.html`);
  if (fs.existsSync(file)) {
    if (!fs.readFileSync(file, 'utf8').includes(`{% include journey-doubts.html id="${c.id}" %}`)) problems.push(`journey-${c.id}.html does not include journey-doubts.html id="${c.id}"`);
    continue;
  }
  if (check) { problems.push(`journey-${c.id}.html missing — run node scripts/build-journey-pages.mjs`); continue; }
  const fit = (s) => fitTitle(`How to Become ${an(s)} ${s}: Class 8 to Career Road`, `How to Become ${an(s)} ${s}: Class by Class`, `${s}: Class 8 to Career Road`, `${s} Career Road`);
  let s = short(c.name);
  let title = fit(s);
  if (usedTitles.has(title) && c.title) { s = short(c.title); title = fit(s); }
  usedTitles.add(title);
  const desc = fitDesc(`${s} road from Class 8: ${plain(c.gate)}`);
  const links = [
    c.page !== `journey-${c.id}.html` && { href: c.page, label: `Full ${s} guide` },
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
  if (m && !['blueprint', 'next'].includes(m[1]) && !ids.has(m[1])) problems.push(`${f} has no career "${m[1]}" in _data/in/journey/`);
}

// Site search entries (2026-11-02): one per blueprint page that _data/search.yml does not list by hand, so a career
// published by the free-Claude inbox (scripts/journey-ingest.mjs) is searchable at once. assets/search.json merges
// _data/in/journey_search.yml. k = the career's search phrases + keywords + "how to become …".
const listed = new Set([...fs.readFileSync(path.join(root, '_data', 'search.yml'), 'utf8').matchAll(/u: "(journey-[a-z0-9-]+\.html)"/g)].map((m) => m[1]));
const CATS = new Set(['engineering-science', 'medical', 'technology', 'commerce', 'arts', 'govt', 'diploma', 'iti', 'guides']);
const items = D.careers.filter((c) => !listed.has(`journey-${c.id}.html`)).map((c) => {
  const s = short(c.name);
  const words = [...(c.search || []).map((x) => String(x).replace(/^=/, '')), ...(c.keywords || []), `how to become ${an(s)} ${s}`, 'career road class 8 to job'];
  const sub = plain(c.gate);
  return {
    t: `${s} — road from Class 8`,
    s: sub.length > 110 ? sub.slice(0, 107).replace(/\s+\S*$/, '') + '…' : sub,
    u: `journey-${c.id}.html`,
    c: CATS.has(c.category) ? c.category : 'guides',
    k: [...new Set(words.map((w) => plain(w).toLowerCase()))].join(' '),
  };
});
const searchFile = path.join(root, '_data', 'in', 'journey_search.yml');
const searchText = '# Generated by scripts/build-journey-pages.mjs — do not edit. Site search entries for blueprint pages that\n'
  + '# _data/search.yml does not list by hand (assets/search.json merges this list).\n'
  + yaml.dump({ items }, { lineWidth: -1, quotingType: '"', forceQuotes: true });
if (!fs.existsSync(searchFile) || fs.readFileSync(searchFile, 'utf8') !== searchText) {
  if (check) problems.push('_data/in/journey_search.yml is out of date — run node scripts/build-journey-pages.mjs');
  else fs.writeFileSync(searchFile, searchText);
}
if (problems.length) { console.error(`journey pages: ${problems.length} problem(s)`); for (const p of problems) console.error('  - ' + p); process.exit(1); }
console.log(check ? `journey pages OK: ${ids.size} careers, ${ids.size} pages` : `journey pages: ${made} written, ${ids.size - made} kept`);
