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

// ---- State Exam & Career Cockpit sheets (_data/in/states/<state>.yml -> state/<state>/*.html) ----
// Fails on: page missing or not including its template, a section list that is not the 8 fixed blocks,
// unknown part kinds, a fact part (p / list / table) or hero fact without `source:`, a cited id that is
// not in that exam's sources, a source never cited, non-https or unchecked sources, broken local links,
// and cockpit groups that miss an exam or name one that does not exist.
const stateDir = path.join(root, '_data', 'in', 'states');
const BLOCKS = ['overview', 'eligibility', 'scheme', 'fees', 'reservation', 'documents', 'pay', 'posting'];
const SC_KINDS = ['p', 'list', 'table', 'note', 'warn', 'links'];
const FACT_KINDS = ['p', 'list', 'table'];
let stateSheets = 0, stateExams = 0;
// A YAML date: js-yaml 4 (and Jekyll) give a Date, js-yaml 5 keeps the YYYY-MM-DD string.
const isDay = (v) => v instanceof Date || /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
const linkOk = (h) => {
  if (/^(https?:|mailto:|tel:|#)/.test(h)) return true;
  const file = h.split(/[?#]/)[0];
  return !file || fs.existsSync(path.join(root, file.endsWith('/') ? file + 'index.html' : file));
};
if (fs.existsSync(stateDir)) for (const f of fs.readdirSync(stateDir).filter((x) => x.endsWith('.yml'))) {
  stateSheets++;
  const id = f.slice(0, -4);
  const err = (m) => errors.push(`states/${f}: ${m}`);
  let D;
  try { D = yaml.load(fs.readFileSync(path.join(stateDir, f), 'utf8')); } catch (e) { err('YAML error: ' + e.message.split('\n')[0]); continue; }
  if (!D.state || D.state.id !== id) err(`state.id must be "${id}"`);
  if (!(D.state && isDay(D.state.checked))) err('state.checked must be a date (YYYY-MM-DD)');
  const hub = path.join(root, 'state', id, 'index.html');
  if (!fs.existsSync(hub)) err(`page state/${id}/index.html missing`);
  else if (!fs.readFileSync(hub, 'utf8').includes(`{% include state-cockpit.html state="${id}" %}`)) err(`state/${id}/index.html does not include state-cockpit.html for "${id}"`);
  const slugs = (D.exams || []).map((e) => e.slug);
  if (new Set(slugs).size !== slugs.length) err('duplicate exam slugs');
  const grouped = new Map();
  for (const g of (D.cockpit && D.cockpit.groups) || []) {
    if (!g.id || !g.heading) err('every cockpit group needs id and heading');
    for (const s of g.exams || []) { if (!slugs.includes(s)) err(`group ${g.id}: unknown exam "${s}"`); grouped.set(s, g.id); }
  }
  if (!(D.cockpit && D.cockpit.portals_note)) err('cockpit.portals_note is required');
  for (const o of (D.cockpit && D.cockpit.portals) || []) if (!/^https:\/\//.test(o.url || '')) err(`portal ${o.label}: url must start with https://`);
  for (const E of D.exams || []) {
    stateExams++;
    const ex = (m) => err(`${E.slug}: ${m}`);
    for (const k of ['slug', 'group', 'short', 'body', 'card', 'eyebrow', 'title', 'lede']) if (!E[k]) ex(`${k} is required`);
    if (grouped.get(E.slug) !== E.group) ex(`listed in cockpit group "${grouped.get(E.slug)}" but group is "${E.group}"`);
    const page = path.join(root, 'state', id, E.slug + '.html');
    if (!fs.existsSync(page)) ex(`page state/${id}/${E.slug}.html missing`);
    else if (!fs.readFileSync(page, 'utf8').includes(`{% include state-exam.html state="${id}" exam="${E.slug}" %}`)) ex('page does not include state-exam.html for this exam');
    const ids = new Set();
    for (const s of E.sources || []) {
      if (!s.id || !s.name || !s.url || !s.covers) ex(`source ${JSON.stringify(s.id)} needs id, name, url, covers`);
      if (ids.has(s.id)) ex(`duplicate source id ${s.id}`);
      ids.add(s.id);
      if (!/^https:\/\//.test(s.url || '')) ex(`source ${s.id}: url must start with https://`);
      if (!isDay(s.checked)) ex(`source ${s.id}: checked must be a date (YYYY-MM-DD)`);
    }
    if (!ids.size) ex('no sources');
    const cited = new Set();
    const cite = (where, src, required) => {
      if (src) { cited.add(src); if (!ids.has(src)) ex(`${where}: source "${src}" is not listed under sources`); }
      else if (required) ex(`${where}: fact without source`);
    };
    for (const q of E.facts || []) { if (!q.label || !q.value) ex('every fact needs label and value'); cite(`fact "${q.label}"`, q.source, true); }
    for (const o of E.official || []) if (!/^https:\/\//.test(o.url || '')) ex(`official link ${o.label}: url must start with https://`);
    const secIds = (E.sections || []).map((s) => s.id);
    if (secIds.join() !== BLOCKS.join()) ex(`sections must be ${BLOCKS.join(', ')} in that order (found ${secIds.join(', ')})`);
    for (const S of E.sections || []) {
      for (const k of ['nav', 'eyebrow', 'heading']) if (!S[k]) ex(`section ${S.id}: ${k} is required`);
      for (const [i, p] of (S.parts || []).entries()) {
        const kinds = Object.keys(p).filter((k) => k !== 'source');
        const where = `section ${S.id} part ${i + 1}`;
        if (kinds.length !== 1 || !SC_KINDS.includes(kinds[0])) { ex(`${where}: unknown part ${JSON.stringify(kinds)}`); continue; }
        cite(where, p.source, FACT_KINDS.includes(kinds[0]));
        if (p.table) {
          const w = (p.table.head || []).length;
          if (!w) ex(`${where}: table needs head`);
          for (const [r, row] of (p.table.rows || []).entries()) if (row.length !== w) ex(`${where}: table row ${r + 1} has ${row.length} cells, head has ${w}`);
        }
        for (const l of p.links || []) if (!l.label || !l.url || !linkOk(l.url)) ex(`${where}: bad link ${JSON.stringify(l)}`);
      }
    }
    for (const sid of ids) if (!cited.has(sid)) ex(`source "${sid}" is listed but never cited`);
  }
}

// ---- National entrance exam consoles (_data/in/national_exams.yml -> <slug>.html) ----
// Same part rules as the state sheets; the six fixed blocks are NX_BLOCKS, and each page must include
// national-exam.html for its slug. coaching_href / colleges_href must point at pages that exist.
const nxFile = path.join(root, '_data', 'in', 'national_exams.yml');
const NX_BLOCKS = ['overview', 'eligibility', 'scheme', 'reservation', 'fees', 'horizons'];
let nxExams = 0;
if (fs.existsSync(nxFile)) {
  const err = (m) => errors.push(`national_exams.yml: ${m}`);
  let D;
  try { D = yaml.load(fs.readFileSync(nxFile, 'utf8')); } catch (e) { err('YAML error: ' + e.message.split('\n')[0]); D = {}; }
  if (!isDay(D.checked)) err('checked must be a date (YYYY-MM-DD)');
  const slugs = (D.exams || []).map((e) => e.slug);
  if (new Set(slugs).size !== slugs.length) err('duplicate exam slugs');
  for (const E of D.exams || []) {
    nxExams++;
    const ex = (m) => err(`${E.slug}: ${m}`);
    for (const k of ['slug', 'short', 'stream', 'body', 'eyebrow', 'title', 'lede']) if (!E[k]) ex(`${k} is required`);
    if (E.checked !== undefined && !isDay(E.checked)) ex('checked must be a date (YYYY-MM-DD)');
    for (const k of ['coaching_href', 'colleges_href']) if (E[k] && !linkOk(E[k])) ex(`${k} points at a missing page: ${E[k]}`);
    const page = path.join(root, E.slug + '.html');
    if (!fs.existsSync(page)) ex(`page ${E.slug}.html missing`);
    else if (!fs.readFileSync(page, 'utf8').includes(`{% include national-exam.html exam="${E.slug}" %}`)) ex('page does not include national-exam.html for this exam');
    const ids = new Set();
    for (const s of E.sources || []) {
      if (!s.id || !s.name || !s.url || !s.covers) ex(`source ${JSON.stringify(s.id)} needs id, name, url, covers`);
      if (ids.has(s.id)) ex(`duplicate source id ${s.id}`);
      ids.add(s.id);
      if (!/^https:\/\//.test(s.url || '')) ex(`source ${s.id}: url must start with https://`);
      if (!isDay(s.checked)) ex(`source ${s.id}: checked must be a date (YYYY-MM-DD)`);
    }
    if (!ids.size) ex('no sources');
    const cited = new Set();
    const cite = (where, src, required) => {
      if (src) { cited.add(src); if (!ids.has(src)) ex(`${where}: source "${src}" is not listed under sources`); }
      else if (required) ex(`${where}: fact without source`);
    };
    for (const q of E.facts || []) { if (!q.label || !q.value) ex('every fact needs label and value'); cite(`fact "${q.label}"`, q.source, true); }
    if ((E.facts || []).length !== 4) ex('the hero console needs exactly 4 facts (2 x 2)');
    for (const o of E.official || []) if (!/^https:\/\//.test(o.url || '')) ex(`official link ${o.label}: url must start with https://`);
    const secIds = (E.sections || []).map((s) => s.id);
    if (secIds.join() !== NX_BLOCKS.join()) ex(`sections must be ${NX_BLOCKS.join(', ')} in that order (found ${secIds.join(', ')})`);
    for (const S of E.sections || []) {
      for (const k of ['nav', 'eyebrow', 'heading']) if (!S[k]) ex(`section ${S.id}: ${k} is required`);
      for (const [i, p] of (S.parts || []).entries()) {
        const kinds = Object.keys(p).filter((k) => k !== 'source');
        const where = `section ${S.id} part ${i + 1}`;
        if (kinds.length !== 1 || !SC_KINDS.includes(kinds[0])) { ex(`${where}: unknown part ${JSON.stringify(kinds)}`); continue; }
        cite(where, p.source, FACT_KINDS.includes(kinds[0]));
        if (p.table) {
          const w = (p.table.head || []).length;
          if (!w) ex(`${where}: table needs head`);
          for (const [r, row] of (p.table.rows || []).entries()) if (row.length !== w) ex(`${where}: table row ${r + 1} has ${row.length} cells, head has ${w}`);
        }
        for (const l of p.links || []) if (!l.label || !l.url || !linkOk(l.url)) ex(`${where}: bad link ${JSON.stringify(l)}`);
      }
    }
    for (const sid of ids) if (!cited.has(sid)) ex(`source "${sid}" is listed but never cited`);
  }
}

// ---- Sports & Performing Arts Cockpit (_data/in/sports.yml -> sports-hub.html + <slug>.html) ----
// Same part rules as the exam consoles; the eight fixed blocks are SP_BLOCKS. A `source:` may name several ids
// joined by commas. The hub's facts, ladder and quota rules cite hub.sources; each domain must name existing
// sports slugs, and each sport must sit in a known domain and be listed by it.
const spFile = path.join(root, '_data', 'in', 'sports.yml');
const SP_BLOCKS = ['rules', 'recognition', 'eligibility', 'roadmap', 'academies', 'costs', 'earnings', 'traps'];
// Optional last block: player doubts. Besides the usual parts it takes `qa: { q, a }` (question + answer, also
// emitted as FAQPage JSON-LD); a qa needs a source like any fact.
const SP_DOUBTS = 'doubts';
let spSports = 0;
if (fs.existsSync(spFile)) {
  const err = (m) => errors.push(`sports.yml: ${m}`);
  let D;
  try { D = yaml.load(fs.readFileSync(spFile, 'utf8')); } catch (e) { err('YAML error: ' + e.message.split('\n')[0]); D = {}; }
  if (!isDay(D.checked)) err('checked must be a date (YYYY-MM-DD)');
  const ids = (list) => (String(list || '')).split(',').map((x) => x.trim()).filter(Boolean);
  const checkSources = (where, list) => {
    const set = new Set();
    for (const s of list || []) {
      if (!s.id || !s.name || !s.url || !s.covers) err(`${where}: source ${JSON.stringify(s.id)} needs id, name, url, covers`);
      if (set.has(s.id)) err(`${where}: duplicate source id ${s.id}`);
      set.add(s.id);
      if (!/^https:\/\//.test(s.url || '')) err(`${where}: source ${s.id}: url must start with https://`);
      if (!isDay(s.checked)) err(`${where}: source ${s.id}: checked must be a date (YYYY-MM-DD)`);
    }
    if (!set.size) err(`${where}: no sources`);
    return set;
  };
  const slugs = (D.sports || []).map((e) => e.slug);
  if (new Set(slugs).size !== slugs.length) err('duplicate sport slugs');
  // hub page + hub data
  const hubPage = path.join(root, 'sports-hub.html');
  if (!fs.existsSync(hubPage)) err('page sports-hub.html missing');
  else if (!fs.readFileSync(hubPage, 'utf8').includes('{% include sports-cockpit.html %}')) err('sports-hub.html does not include sports-cockpit.html');
  const H = D.hub || {};
  for (const k of ['eyebrow', 'title', 'lede']) if (!H[k]) err(`hub.${k} is required`);
  const hubIds = checkSources('hub', H.sources);
  const hubCited = new Set(['myas-cash', 'dopt-2022', 'dopt-2024']); // cited by the hub template itself
  const hubCite = (where, src) => { if (!src) { err(`hub ${where}: fact without source`); return; } for (const i of ids(src)) { hubCited.add(i); if (!hubIds.has(i)) err(`hub ${where}: source "${i}" is not listed under hub.sources`); } };
  for (const q of H.facts || []) { if (!q.label || !q.value) err('every hub fact needs label and value'); hubCite(`fact "${q.label}"`, q.source); }
  if ((H.facts || []).length !== 4) err('the hub console needs exactly 4 facts (2 x 2)');
  if (H.ladder) {
    hubCite('ladder', H.ladder.source);
    const w = (H.ladder.head || []).length;
    for (const [r, row] of (H.ladder.rows || []).entries()) if (row.length !== w) err(`hub ladder row ${r + 1} has ${row.length} cells, head has ${w}`);
  }
  if (!(H.quota || []).length) err('hub.quota rules are required');
  hubCite('quota', H.quota_source);
  for (const s of hubIds) if (!hubCited.has(s)) err(`hub source "${s}" is listed but never cited`);
  // domains
  const listed = new Map();
  const domIds = new Set();
  for (const d of D.domains || []) {
    if (!d.id || !d.label || !d.intro || !d.icon) err(`domain ${JSON.stringify(d.id)} needs id, label, intro, icon`);
    domIds.add(d.id);
    for (const s of d.sports || []) { if (!slugs.includes(s)) err(`domain ${d.id}: unknown sport "${s}"`); listed.set(s, d.id); }
    for (const g of d.guides || []) if (!g.label || !g.href || !linkOk(g.href)) err(`domain ${d.id}: bad guide link ${JSON.stringify(g)}`);
    if (!(d.sports || []).length && !(d.guides || []).length) err(`domain ${d.id}: needs at least one sport page or guide link`);
  }
  if ((D.domains || []).length !== 5) err('the hub needs exactly 5 domains');
  // sports
  for (const E of D.sports || []) {
    spSports++;
    const ex = (m) => err(`${E.slug}: ${m}`);
    for (const k of ['slug', 'short', 'domain', 'body', 'card', 'eyebrow', 'title', 'lede']) if (!E[k]) ex(`${k} is required`);
    if (!domIds.has(E.domain)) ex(`unknown domain "${E.domain}"`);
    if (listed.get(E.slug) !== E.domain) ex(`not listed under its domain "${E.domain}" in domains[]`);
    const page = path.join(root, E.slug + '.html');
    if (!fs.existsSync(page)) ex(`page ${E.slug}.html missing`);
    else if (!fs.readFileSync(page, 'utf8').includes(`{% include sport-page.html sport="${E.slug}" %}`)) ex('page does not include sport-page.html for this sport');
    const sIds = checkSources(E.slug, E.sources);
    const cited = new Set();
    const cite = (where, src, required) => {
      if (src) for (const i of ids(src)) { cited.add(i); if (!sIds.has(i)) ex(`${where}: source "${i}" is not listed under sources`); }
      else if (required) ex(`${where}: fact without source`);
    };
    for (const q of E.facts || []) { if (!q.label || !q.value) ex('every fact needs label and value'); cite(`fact "${q.label}"`, q.source, true); }
    if ((E.facts || []).length !== 4) ex('the hero console needs exactly 4 facts (2 x 2)');
    for (const o of E.official || []) if (!/^https:\/\//.test(o.url || '')) ex(`official link ${o.label}: url must start with https://`);
    const secIds = (E.sections || []).map((s) => s.id);
    const coreIds = secIds[secIds.length - 1] === SP_DOUBTS ? secIds.slice(0, -1) : secIds;
    if (coreIds.join() !== SP_BLOCKS.join()) ex(`sections must be ${SP_BLOCKS.join(', ')} in that order, optionally followed by ${SP_DOUBTS} (found ${secIds.join(', ')})`);
    for (const S of E.sections || []) {
      for (const k of ['nav', 'eyebrow', 'heading']) if (!S[k]) ex(`section ${S.id}: ${k} is required`);
      const okKinds = S.id === SP_DOUBTS ? [...SC_KINDS, 'qa'] : SC_KINDS;
      for (const [i, p] of (S.parts || []).entries()) {
        const kinds = Object.keys(p).filter((k) => k !== 'source');
        const where = `section ${S.id} part ${i + 1}`;
        if (kinds.length !== 1 || !okKinds.includes(kinds[0])) { ex(`${where}: unknown part ${JSON.stringify(kinds)}`); continue; }
        cite(where, p.source, FACT_KINDS.includes(kinds[0]) || kinds[0] === 'qa');
        if (p.qa && (!p.qa.q || !p.qa.a)) ex(`${where}: qa needs q and a`);
        if (p.table) {
          const w = (p.table.head || []).length;
          if (!w) ex(`${where}: table needs head`);
          for (const [r, row] of (p.table.rows || []).entries()) if (row.length !== w) ex(`${where}: table row ${r + 1} has ${row.length} cells, head has ${w}`);
        }
        for (const l of p.links || []) if (!l.label || !l.url || !linkOk(l.url)) ex(`${where}: bad link ${JSON.stringify(l)}`);
      }
    }
    for (const sid of sIds) if (!cited.has(sid)) ex(`source "${sid}" is listed but never cited`);
  }
}

// ---- India top menu (_data/nav.yml topnav): every menu link, node heading and flyout link must exist ----
const navFile = path.join(root, '_data', 'nav.yml');
let navLinks = 0;
if (fs.existsSync(navFile)) {
  const N = yaml.load(fs.readFileSync(navFile, 'utf8')) || {};
  const chk = (where, h) => { navLinks++; if (!h || !linkOk(String(h).replace(/&amp;/g, '&'))) errors.push(`nav.yml topnav ${where}: missing page ${h}`); };
  for (const it of N.topnav || []) {
    if (it.href) chk(it.label, it.href);
    for (const c of it.children || []) chk(`${it.label} > ${c.label}`, c.href);
    for (const n of it.nodes || []) {
      chk(`${it.label} > ${n.label}`, n.href);
      if (!(n.cols || []).length) errors.push(`nav.yml topnav ${it.label} > ${n.label}: node has no cols`);
      for (const col of n.cols || []) {
        if (!col.label || !(col.links || []).length) errors.push(`nav.yml topnav ${n.label}: every column needs a label and links`);
        for (const c of col.links || []) chk(`${n.label} > ${col.label} > ${c.label}`, c.href);
      }
    }
  }
}

console.log(`checked ${sheets} India data sheets`);
console.log(`checked ${nxExams} national exam console(s), ${navLinks} top-menu link(s)`);
console.log(`checked ${stateSheets} state cockpit sheet(s), ${stateExams} exam page(s)`);
console.log(`checked ${spSports} sports cockpit page(s)`);
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('OK');
