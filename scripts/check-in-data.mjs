// Checks every India career data sheet (_data/in/careers/<slug>.yml) against its page and the template.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/check-in-data.mjs
// Fails (exit 1) on: page missing or not pointing at the sheet, unknown part kinds, a `source:` id that is
// not in `sources`, a source listed but never cited, duplicate source ids, links to pages that do not
// exist, "On this page" links to sections that do not exist, journey rows without step/value, path rows
// without a step or longer than one glance (step 24 / sub 48 characters, max 7 steps),
// a roadmap link without its page, and empty required text.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const dir = path.join(root, '_data', 'in', 'careers');
const KINDS = ['subhead', 'note', 'streams', 'overview', 'fit', 'elig_list', 'elig_cards', 'prose', 'table', 'steps', 'roadmap_card',
  'chips', 'salary', 'proscons', 'myths', 'myth_items', 'compare', 'related', 'faq', 'exam_cards', 'note_box', 'warn_box',
  'source_link', 'cx_link', 'spec'];
const errors = [];
let sheets = 0;

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.yml'))) {
  sheets++;
  const slug = f.slice(0, -4);
  const err = (m) => errors.push(`${f}: ${m}`);
  let C;
  try { C = yaml.load(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { err('YAML error: ' + e.message.split('\n')[0]); continue; }

  // the page must exist and include the template for this sheet
  const page = path.join(root, slug + '.html');
  if (!fs.existsSync(page)) err(`page ${slug}.html missing`);
  else {
    const src = fs.readFileSync(page, 'utf8');
    if (!/\{% include in-career\.html career=page\.career %\}/.test(src)) err(`${slug}.html does not include in-career.html`);
    if (!new RegExp(`^career:\\s*"?${slug}"?\\s*(#.*)?$`, 'm').test(src)) err(`${slug}.html front matter lacks career: "${slug}"`);
  }
  if (C.slug !== slug) err(`slug "${C.slug}" does not match the file name`);
  if (!C.hero || !C.hero.title || !C.hero.eyebrow) err('hero.title and hero.eyebrow are required');

  // sources: unique ids, every cited id exists, every listed source is cited
  const ids = new Set();
  for (const s of C.sources || []) {
    if (!s.id || !s.name || !s.url || !s.covers) err(`source ${JSON.stringify(s.id)} needs id, name, url, covers`);
    if (ids.has(s.id)) err(`duplicate source id ${s.id}`);
    ids.add(s.id);
    if (!/^https:\/\//.test(s.url || '')) err(`source ${s.id}: url must start with https://`);
    if (s.checked && !(s.checked instanceof Date)) err(`source ${s.id}: checked must be a date (YYYY-MM-DD)`);
  }
  const cited = new Set();
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (k === 'source' && typeof x === 'string') cited.add(x); else walk(x); }
  };
  walk({ hero: C.hero, path: C.path, journey: C.journey, sections: C.sections });
  for (const id of cited) if (!ids.has(id)) err(`source: "${id}" is cited but not listed under sources`);
  for (const id of ids) if (!cited.has(id)) err(`source "${id}" is listed but never cited (add source: ${id} to a fact)`);

  // journey rows
  for (const [i, r] of (C.journey || []).entries()) if (!r.step || !r.value) err(`journey row ${i + 1} needs step and value`);

  // path strip (hero): short steps, so it stays one glance on a phone
  for (const [i, r] of (C.path || []).entries()) {
    if (!r.step) err(`path row ${i + 1} needs step`);
    else if (r.step.length > 24) err(`path row ${i + 1}: step "${r.step}" is longer than 24 characters`);
    if (r.sub && r.sub.length > 48) err(`path row ${i + 1}: sub is longer than 48 characters`);
  }
  if (C.path && C.path.length > 7) err(`path has ${C.path.length} steps (max 7)`);

  // sections and parts
  const anchors = new Set(['main', 'journey', 'sources']);
  for (const [i, S] of (C.sections || []).entries()) {
    if (!S.hid || !S.heading) err(`section ${i + 1} needs hid and heading`);
    if (S.id) anchors.add(S.id);
    if (S.hid) anchors.add(S.hid);
    for (const p of S.parts || []) {
      const kinds = Object.keys(p).filter((k) => k !== 'class');
      if (kinds.length !== 1 || !KINDS.includes(kinds[0])) err(`section "${S.id || S.hid}": unknown part ${JSON.stringify(kinds)}`);
      if (p.spec) for (const sp of p.spec) anchors.add(sp.id);
      if (p.roadmap_card && !C.roadmap) err('roadmap_card needs a roadmap: link');
    }
  }
  for (const n of C.nav || []) if (n.href.startsWith('#') && !anchors.has(n.href.slice(1))) err(`nav link ${n.href} has no matching section`);

  // every local link points at a real file
  const hrefs = [];
  const collect = (v) => {
    if (Array.isArray(v)) v.forEach(collect);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if ((k === 'href' || k.endsWith('_href')) && typeof x === 'string') hrefs.push(x); else collect(x); }
    else if (typeof v === 'string') for (const m of v.matchAll(/href="([^"]+)"/g)) hrefs.push(m[1]);
  };
  collect(C);
  if (C.roadmap) hrefs.push(C.roadmap);
  for (const h of hrefs) {
    if (/^(https?:|mailto:|tel:|#)/.test(h)) continue;
    const file = h.split(/[?#]/)[0].replace(/&amp;/g, '&');
    if (!file) continue;
    const target = path.join(root, file.endsWith('/') ? file + 'index.html' : file);
    if (!fs.existsSync(target)) err(`link to missing page: ${h}`);
  }
}

console.log(`checked ${sheets} India data sheets`);
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('OK');
