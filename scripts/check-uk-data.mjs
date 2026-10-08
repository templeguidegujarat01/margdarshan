// Integrity check for the UK Edition data (_data/uk/) and the cross-edition Global Mobility Matrix (_data/mobility.yml).
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/check-uk-data.mjs
// Checks: every `source:` id resolves; sources have an https url and an accessed date; every pay SOC exists in
// _data/uk/ashe.json (built by scripts/build-ashe.mjs) with a median, and its year matches sources.yml; each
// career sheet has its page stub and real India / USA counterpart pages; mobility routes name real editions,
// real sources and real pages, and the matrix has not passed its review_by date; nav_uk links exist.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const readYaml = (f) => yaml.load(fs.readFileSync(path.join(root, f), 'utf8'));
const exists = (f) => fs.existsSync(path.join(root, f));

const errors = [];
const err = (where, m) => errors.push(`${where}: ${m}`);
const isDate = (d) => d instanceof Date || /^\d{4}-\d{2}-\d{2}$/.test(String(d));
const day = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d));
const today = new Date().toISOString().slice(0, 10);

// ---- sources ----
const sources = readYaml('_data/uk/sources.yml');
const src = new Set(Object.keys(sources.list));
for (const [id, s] of Object.entries(sources.list)) {
  for (const k of ['name', 'publisher', 'short']) if (!s[k]) err(`sources.${id}`, `missing ${k}`);
  if (!/^https:\/\//.test(s.url || '')) err(`sources.${id}`, 'url must be https');
  if (!isDate(s.accessed)) err(`sources.${id}`, 'missing accessed date');
}
// Walk any object and check every `source` value.
const used = new Set();
const walkSources = (where, v) => {
  if (Array.isArray(v)) v.forEach((x, i) => walkSources(`${where}[${i}]`, x));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) {
    if (k === 'source') { used.add(x); if (!src.has(x)) err(where, `unknown source "${x}"`); }
    else walkSources(`${where}.${k}`, x);
  }
};

// ---- ONS ASHE pay file ----
const ashe = JSON.parse(fs.readFileSync(path.join(root, '_data/uk/ashe.json'), 'utf8'));
if (ashe.year !== sources.ashe.year) err('ashe.json', `year ${ashe.year} != sources.yml ashe.year ${sources.ashe.year}`);
if (!sources.ashe.label || !sources.ashe.label.includes(String(ashe.year))) err('sources.ashe', 'label must name the ASHE year');
if (ashe.provisional && !/provisional/i.test(sources.ashe.label || '')) err('sources.ashe', 'ashe.json is provisional; say so in the label');

// ---- career sheets ----
const usPaths = readYaml('_data/us/pathways.yml').list;
const dir = path.join(root, '_data/uk/careers');
const careers = {};
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.yml'))) {
  const slug = f.replace(/\.yml$/, '');
  const C = (careers[slug] = readYaml(`_data/uk/careers/${f}`));
  const w = `careers.${slug}`;
  if (C.slug !== slug) err(w, `slug "${C.slug}" must match the file name`);
  for (const k of ['title', 'eyebrow', 'lede']) if (!C[k]) err(w, `missing ${k}`);
  if (!isDate(C.checked)) err(w, 'missing checked date');
  const stub = `uk/careers/${slug}/index.html`;
  if (!exists(stub)) err(w, `${stub} is missing`);
  else if (!new RegExp(`^career:\\s*${slug}\\s*$`, 'm').test(fs.readFileSync(path.join(root, stub), 'utf8'))) err(w, `${stub} must say career: ${slug}`);
  if (!Array.isArray(C.pay) || !C.pay.length) err(w, 'needs at least one pay: entry');
  for (const p of C.pay || []) {
    const o = ashe.occupations[p.soc];
    if (!/^\d{4}$/.test(p.soc)) err(w, `bad SOC "${p.soc}"`);
    else if (!o || typeof o.uk?.median !== 'number') err(w, `SOC ${p.soc} has no median in ashe.json (re-run scripts/build-ashe.mjs)`);
    if (!p.label) err(w, `pay ${p.soc}: missing label`);
  }
  for (const n of C.ncs || []) for (const k of ['starter', 'experienced']) if (!Number.isInteger(n[k])) err(w, `ncs ${n.label}: ${k} must be a whole number`);
  if (!Array.isArray(C.tracks) || !C.tracks.length) err(w, 'needs at least one track');
  for (const T of C.tracks || []) {
    if (!T.id || !T.title) err(w, 'track without id/title');
    if (!(T.steps || []).length) err(w, `track ${T.id}: no steps`);
    for (const s of T.steps || []) {
      if (!['stage', 'gate', 'license'].includes(s.kind)) err(w, `track ${T.id}: step "${s.title}" kind must be stage|gate|license`);
      if (!s.source) err(w, `track ${T.id}: step "${s.title}" has no source`);
    }
    for (const f2 of T.facts || []) if (!f2.source) err(w, `track ${T.id}: fact "${f2.k}" has no source`);
  }
  for (const f2 of C.school || []) if (!f2.source) err(w, `school "${f2.k}" has no source`);
  for (const b of C.badges || []) if (!b.source) err(w, `badge "${b.label}" has no source`);
  walkSources(w, C);
  if (C.in_page && !exists(C.in_page)) err(w, `in_page ${C.in_page} does not exist`);
  if (C.us_pathway) { const P = usPaths.find((x) => x.slug === C.us_pathway); if (!P || !P.live) err(w, `us_pathway "${C.us_pathway}" is not a live USA pathway`); }
}
for (const id of src) if (!used.has(id) && !['ons_ashe', 'ons_ashe_region'].includes(id)) {
  // uk/index.html also cites sources directly; count those as used.
  if (!fs.readFileSync(path.join(root, 'uk/index.html'), 'utf8').includes(`id="${id}"`)) err(`sources.${id}`, 'not used by any page');
}

// ---- Global Mobility Matrix ----
const M = readYaml('_data/mobility.yml');
const regions = readYaml('_data/regions.yml');
if (!isDate(M.checked)) err('mobility', 'missing checked date');
if (!isDate(M.review_by)) err('mobility', 'missing review_by date');
else if (today > day(M.review_by)) err('mobility', `review_by ${day(M.review_by)} has passed: re-read every source, then move checked and review_by forward`);
for (const [id, s] of Object.entries(M.sources || {})) {
  for (const k of ['name', 'publisher', 'short']) if (!s[k]) err(`mobility.sources.${id}`, `missing ${k}`);
  if (!/^https:\/\//.test(s.url || '')) err(`mobility.sources.${id}`, 'url must be https');
}
const usedRoutes = new Set();
for (const [id, r] of Object.entries(M.routes || {})) {
  const w = `mobility.routes.${id}`;
  for (const e of [].concat(r.from || [], r.to || [])) if (!regions.list.includes(e)) err(w, `unknown edition "${e}"`);
  if (!r.from || !r.to) err(w, 'needs from and to');
  for (const k of ['from_label', 'to_label', 'badge']) if (!r[k]) err(w, `missing ${k}`);
  if (!(r.points || []).length) err(w, 'no points');
  if (!(r.sources || []).length) err(w, 'no sources');
  for (const s of r.sources || []) if (!M.sources[s]) err(w, `unknown source "${s}"`);
}
const pageExists = { in: (k) => exists(`_data/in/careers/${k}.yml`), us: (k) => !!usPaths.find((x) => x.slug === k && x.live), uk: (k) => !!careers[k] };
for (const [ed, map] of Object.entries(M.pages || {})) {
  if (!pageExists[ed]) { err('mobility.pages', `unknown edition "${ed}"`); continue; }
  for (const [k, ids] of Object.entries(map)) {
    if (!pageExists[ed](k)) err(`mobility.pages.${ed}.${k}`, 'no such career page');
    for (const id of ids) { usedRoutes.add(id); if (!M.routes[id]) err(`mobility.pages.${ed}.${k}`, `unknown route "${id}"`); }
  }
}
for (const id of Object.keys(M.routes || {})) if (!usedRoutes.has(id)) err(`mobility.routes.${id}`, 'not shown on any page');

// ---- UK nav ----
const nav = readYaml('_data/nav_uk.yml');
for (const g of nav.sidebar) for (const it of g.items) for (const h of [it.href, ...(it.children || []).map((c) => c.href)]) {
  const f = h.split('#')[0];
  if (f && !exists(f.endsWith('/') ? f + 'index.html' : f)) err('nav_uk', `link ${h} has no page`);
}
if (!regions.list.includes('uk') || !regions.uk) err('regions.yml', 'uk edition missing');

console.log(`checked ${src.size} UK sources, ${Object.keys(careers).length} UK careers, ${Object.keys(ashe.occupations).length} ASHE occupations, ${Object.keys(M.routes || {}).length} mobility routes`);
if (errors.length) { console.log(errors.join('\n')); console.log(`\n${errors.length} problem(s)`); process.exit(1); }
console.log('OK: 0 problems');
