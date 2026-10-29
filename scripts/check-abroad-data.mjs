// Validates the Study Abroad engine data (_data/in/abroad_common.yml + _data/in/abroad/*.yml) and that the
// study-abroad/** stubs are current (runs build-abroad.mjs --check).
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/check-abroad-data.mjs
// Fails on: a missing pillar or an extra one, a part with an unknown kind, a `source` id that is not in the same
// file's sources, a source nobody cites, a money row without a number or with a currency that has no fx rate
// (RUB/UAH are allowed: the page then says "no official rate"), a `tests` exam that has no exam page, duplicate visa
// slugs and a doubt without a source. A sheet past its review_by date is only a WARNING (printed, exit code
// unchanged) so builds keep running; pass --strict (or ABROAD_STRICT=1) to make stale sheets fail again.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const read = (rel) => yaml.load(fs.readFileSync(path.join(root, rel), 'utf8'));
const AC = read('_data/in/abroad_common.yml');
const files = fs.readdirSync(path.join(root, '_data/in/abroad')).filter((f) => f.endsWith('.yml')).sort();
const errs = [];
const err = (where, msg) => errs.push(`${where}: ${msg}`);
const warns = [];
const STRICT = process.argv.includes('--strict') || process.env.ABROAD_STRICT === '1';
const stale = (where, d) => (STRICT ? err : (w, m) => warns.push(`${w}: ${m}`))(where, `review_by ${d} has passed — re-read the sources and move review_by forward`);
const today = new Date().toISOString().slice(0, 10);
const day = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d || ''));
const NO_RATE = new Set(['RUB', 'UAH']);
const KINDS = ['p', 'points', 'list', 'table', 'money', 'steps', 'awards', 'note', 'warn', 'links'];
const PILLARS = AC.pillars.map((p) => p.id);

// Collect every source id cited inside a value, checking part shapes on the way.
const cite = (used, where, v) => { if (v) used.push([where, v]); };
const walkParts = (used, where, parts) => {
  if (!Array.isArray(parts) || !parts.length) return err(where, 'no parts');
  parts.forEach((p, i) => {
    const w = `${where}[${i}]`;
    const kind = KINDS.filter((k) => p[k] !== undefined);
    if (kind.length !== 1) return err(w, `part needs exactly one of ${KINDS.join('/')} (has ${Object.keys(p).join(',')})`);
    cite(used, w, p.source);
    const k = kind[0];
    if (k === 'points') p.points.forEach((x, j) => { if (!x.t) err(`${w}.points[${j}]`, 'no text'); cite(used, `${w}.points[${j}]`, x.source); });
    if (k === 'steps') p.steps.forEach((x, j) => { if (!x.title || !x.text) err(`${w}.steps[${j}]`, 'needs title and text'); cite(used, `${w}.steps[${j}]`, x.source); });
    if (k === 'awards') p.awards.forEach((x, j) => { for (const f of ['name', 'by', 'who', 'gives']) if (!x[f]) err(`${w}.awards[${j}]`, `no ${f}`); cite(used, `${w}.awards[${j}]`, x.source); });
    if (k === 'money') p.money.forEach((x, j) => {
      const ww = `${w}.money[${j}]`;
      if (typeof x.amount !== 'number') err(ww, 'amount must be a number');
      if (!x.cur) err(ww, 'no currency');
      else if (!AC.fx.rates[x.cur] && !NO_RATE.has(x.cur)) err(ww, `no fx rate for ${x.cur}`);
      if (!x.source) err(ww, 'money row without a source');
      cite(used, ww, x.source);
    });
    if (k === 'table' && (!Array.isArray(p.table.head) || !Array.isArray(p.table.rows))) err(w, 'table needs head and rows');
    if (k === 'links') p.links.forEach((l, j) => { if (!l.label || !l.url) err(`${w}.links[${j}]`, 'needs label and url'); });
  });
};
const checkSources = (where, sources, used) => {
  if (!Array.isArray(sources) || !sources.length) return err(where, 'no sources');
  const ids = new Set();
  for (const s of sources) {
    if (!s.id || !s.name || !s.url) err(where, `source needs id, name, url: ${JSON.stringify(s).slice(0, 80)}`);
    if (ids.has(s.id)) err(where, `duplicate source id ${s.id}`);
    ids.add(s.id);
    if (!/^https:\/\//.test(s.url || '')) err(where, `source ${s.id} is not https`);
  }
  const hit = new Set();
  for (const [w, id] of used) { if (!ids.has(id)) err(w, `unknown source "${id}"`); hit.add(id); }
  for (const id of ids) if (!hit.has(id)) err(where, `source ${id} is never cited`);
};
const checkFacts = (used, where, facts) => {
  if (!Array.isArray(facts) || facts.length < 2) return err(where, 'needs at least 2 facts');
  facts.forEach((f, i) => { if (!f.label || !f.value) err(`${where}[${i}]`, 'needs label and value'); if (!f.source) err(`${where}[${i}]`, 'fact without a source'); cite(used, `${where}[${i}]`, f.source); });
};

// ---- common file
(AC.india_exams || []).forEach((x, i) => {
  if (!x.label || !x.page || !x.by || !x.note) err(`abroad_common.india_exams[${i}]`, 'needs label, page, by, note');
  else if (!fs.existsSync(path.join(root, x.page))) err(`abroad_common.india_exams[${i}]`, `page ${x.page} does not exist`);
});
if (!AC.review_by) err('abroad_common', 'no review_by date');
else if (day(AC.review_by) < today) stale('abroad_common', day(AC.review_by));
for (const [slug, e] of Object.entries(AC.exams)) {
  const used = [];
  const w = `abroad_common.exams.${slug}`;
  for (const f of ['short', 'name', 'by', 'seo_title', 'description', 'lede']) if (!e[f]) err(w, `no ${f}`);
  checkFacts(used, `${w}.facts`, e.facts);
  (e.sections || []).forEach((s, i) => { if (!s.id || !s.heading || !s.nav) err(`${w}.sections[${i}]`, 'needs id, nav, heading'); walkParts(used, `${w}.sections[${i}]`, s.parts); });
  checkSources(w, e.sources, used);
}
for (const [slug, g] of Object.entries(AC.guides)) {
  const used = [];
  const w = `abroad_common.guides.${slug}`;
  for (const f of ['short', 'title', 'seo_title', 'description', 'eyebrow', 'lede']) if (!g[f]) err(w, `no ${f}`);
  checkFacts(used, `${w}.facts`, g.facts);
  (g.sections || []).forEach((s, i) => { if (!s.id || !s.heading || !s.nav) err(`${w}.sections[${i}]`, 'needs id, nav, heading'); walkParts(used, `${w}.sections[${i}]`, s.parts); });
  checkSources(w, g.sources, used);
}

// ---- country sheets
const slugs = new Map();
for (const f of files) {
  const c = read(`_data/in/abroad/${f}`);
  const w = f;
  const used = [];
  if (c.id !== f.replace(/\.yml$/, '')) err(w, `id "${c.id}" does not match the file name`);
  for (const k of ['name', 'short', 'region', 'currency', 'status', 'eyebrow', 'title', 'seo_title', 'description', 'lede']) if (!c[k]) err(w, `no ${k}`);
  if (!['open', 'caution', 'avoid'].includes(c.status)) err(w, `status must be open, caution or avoid`);
  if (!c.review_by) err(w, 'no review_by date');
  else if (day(c.review_by) < today) stale(w, day(c.review_by));
  if (!c.checked) err(w, 'no checked date');
  if (c.alert) { if (!c.alert.text) err(`${w}.alert`, 'no text'); cite(used, `${w}.alert`, c.alert.source); }
  checkFacts(used, `${w}.facts`, c.facts);
  for (const k of ['line', 'psw', 'work', 'funds']) if (!c.card || !c.card[k]) err(`${w}.card`, `no ${k}`);
  (c.tests || []).forEach((t, i) => {
    if (t.exam && !AC.exams[t.exam]) err(`${w}.tests[${i}]`, `exam "${t.exam}" has no exam page in abroad_common.yml`);
    if (!t.exam && !t.label) err(`${w}.tests[${i}]`, 'needs exam or label');
    if (t.page && !(AC.india_exams || []).some((x) => x.page === t.page)) err(`${w}.tests[${i}]`, `page "${t.page}" is not listed in abroad_common.yml → india_exams`);
    if (!t.need) err(`${w}.tests[${i}]`, 'no need text');
    cite(used, `${w}.tests[${i}]`, t.source);
  });
  (c.find || []).forEach((x, i) => {
    for (const k of ['label', 'by', 'url', 'what']) if (!x[k]) err(`${w}.find[${i}]`, `no ${k}`);
    if (!/^https:\/\//.test(x.url || '')) err(`${w}.find[${i}]`, 'url must be https');
  });
  const P = c.pillars || {};
  for (const id of PILLARS) {
    if (!P[id]) { err(w, `missing pillar ${id}`); continue; }
    if (!P[id].heading) err(`${w}.${id}`, 'no heading');
    walkParts(used, `${w}.${id}`, P[id].parts);
  }
  for (const id of Object.keys(P)) if (!PILLARS.includes(id)) err(w, `unknown pillar ${id}`);
  const v = c.visa || {};
  for (const k of ['slug', 'name', 'short', 'seo_title', 'description', 'lede']) if (!v[k]) err(`${w}.visa`, `no ${k}`);
  if (slugs.has(v.slug)) err(`${w}.visa`, `slug ${v.slug} also used by ${slugs.get(v.slug)}`);
  slugs.set(v.slug, f);
  checkFacts(used, `${w}.visa.facts`, v.facts);
  if (!Array.isArray(v.official) || !v.official.length) err(`${w}.visa`, 'no official links');
  if (!Array.isArray(v.sections) || !v.sections.length) err(`${w}.visa`, 'no sections');
  (v.sections || []).forEach((s, i) => {
    if (!s.id || !s.heading || !s.nav || !s.eyebrow) err(`${w}.visa.sections[${i}]`, 'needs id, nav, eyebrow, heading');
    if (['after', 'tests', 'sources'].includes(s.id)) err(`${w}.visa.sections[${i}]`, `id "${s.id}" is reserved by the template`);
    walkParts(used, `${w}.visa.sections[${i}]`, s.parts);
  });
  (c.doubts || []).forEach((d, i) => { if (!d.q || !d.a) err(`${w}.doubts[${i}]`, 'needs q and a'); if (!d.source) err(`${w}.doubts[${i}]`, 'doubt without a source'); if (/&/.test(d.q + d.a)) err(`${w}.doubts[${i}]`, 'use "and", not "&" (FAQ JSON-LD must match the printed text)'); cite(used, `${w}.doubts[${i}]`, d.source); });
  checkSources(w, c.sources, used);
}

// ---- stubs
try {
  execFileSync(process.execPath, [path.join(root, 'scripts/build-abroad.mjs'), '--check'], { stdio: 'pipe', env: process.env });
} catch (e) {
  err('build-abroad --check', (e.stdout || '') + (e.stderr || ''));
}

for (const x of warns) console.warn('  WARNING (stale data) ' + x);
for (const e of errs) console.error('  ' + e);
console.log(`check-abroad-data: ${files.length} country sheet(s), ${Object.keys(AC.exams).length} exam(s), ${Object.keys(AC.guides).length} guide(s): ${errs.length} problem(s)${warns.length ? `, ${warns.length} stale-data warning(s)` : ''}`);
if (errs.length) process.exit(1);
