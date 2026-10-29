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
import { spawnSync } from 'node:child_process';

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
  // quick take callout: quick_take <= 45 words, hidden_challenge one sentence, target_keywords_seo = 4 phrases (data only, never printed)
  const H0 = C.hero || {};
  if (H0.quick_take || H0.hidden_challenge || H0.target_keywords_seo) {
    if (!H0.quick_take || !H0.hidden_challenge) err('quick_take and hidden_challenge go together');
    if (H0.quick_take && H0.quick_take.trim().split(/\s+/).length > 45) err('quick_take is over 45 words');
    if (H0.hidden_challenge && (/[.!?]\s+[A-Z]/.test(H0.hidden_challenge) || !/[.!?]$/.test(H0.hidden_challenge))) err('hidden_challenge must be one sentence');
    const kw = H0.target_keywords_seo;
    if (!Array.isArray(kw) || kw.length !== 4 || kw.some((k) => typeof k !== 'string' || !k.trim())) err('target_keywords_seo needs 4 phrases');
  }

  // sources: unique ids, every cited id exists, every listed source is cited
  const ids = new Set();
  for (const s of C.sources || []) {
    if (!s.id || !s.name || !s.url || !s.covers) err(`source ${JSON.stringify(s.id)} needs id, name, url, covers`);
    if (ids.has(s.id)) err(`duplicate source id ${s.id}`);
    ids.add(s.id);
    if (!/^https:\/\//.test(s.url || '')) err(`source ${s.id}: url must start with https://`);
    // js-yaml 4 (and Jekyll) load `checked: 2026-10-23` as a Date, js-yaml 5 as a string: accept both shapes.
    if (s.checked && !(s.checked instanceof Date) && !/^d{4}-d{2}-d{2}$/.test(String(s.checked))) err(`source ${s.id}: checked must be a date (YYYY-MM-DD)`);
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
// unknown part kinds (these sheets also allow `formula`, see _includes/exam-formula-card.html), a fact
// part (p / list / table / formula) or hero fact without `source:`, a cited id that is
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
  // Optional engineering counselling block on the cockpit: body + seat rules + exactly 3 college anchors, all sourced.
  if (D.counselling) {
    const C = D.counselling, ce = (m) => err(`counselling: ${m}`);
    for (const k of ['eyebrow', 'heading', 'intro', 'anchors_caption', 'anchors_note']) if (!C[k]) ce(`${k} is required`);
    const cids = new Set(), used = new Set();
    for (const s of C.sources || []) {
      if (!s.id || !s.name || !/^https:\/\//.test(s.url || '') || !s.covers || !isDay(s.checked)) ce(`source ${JSON.stringify(s.id)} needs id, name, https url, covers, checked date`);
      if (cids.has(s.id)) ce(`duplicate source id ${s.id}`);
      cids.add(s.id);
    }
    const use = (where, src) => { if (!src) ce(`${where}: fact without source`); else if (!cids.has(src)) ce(`${where}: source "${src}" is not listed`); else used.add(src); };
    const B = C.body || {};
    if (!B.name || !B.portal || !B.merit || !/^https:\/\//.test(B.url || '')) ce('body needs name, portal, merit and an https url');
    use('body', B.source);
    if (!(C.seat_rule || []).length) ce('seat_rule needs at least one rule');
    for (const [i, r] of (C.seat_rule || []).entries()) { if (!r.text) ce(`seat_rule ${i + 1}: text is required`); use(`seat_rule ${i + 1}`, r.source); }
    if ((C.anchors || []).length !== 3) ce(`anchors must list exactly 3 institutes (found ${(C.anchors || []).length})`);
    for (const [i, a] of (C.anchors || []).entries()) { if (!a.institute || !a.seat || !a.closing) ce(`anchor ${i + 1}: institute, seat and closing are required`); use(`anchor ${i + 1}`, a.source); }
    for (const sid of cids) if (!used.has(sid)) ce(`source "${sid}" is listed but never cited`);
  }
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
        if (kinds.length !== 1 || ![...SC_KINDS, 'formula'].includes(kinds[0])) { ex(`${where}: unknown part ${JSON.stringify(kinds)}`); continue; }
        cite(where, p.source, FACT_KINDS.includes(kinds[0]) || kinds[0] === 'formula');
        if (p.table) {
          const w = (p.table.head || []).length;
          if (!w) ex(`${where}: table needs head`);
          for (const [r, row] of (p.table.rows || []).entries()) if (row.length !== w) ex(`${where}: table row ${r + 1} has ${row.length} cells, head has ${w}`);
        }
        if (p.formula) {
          const F = p.formula;
          if (!F.caption) ex(`${where}: formula needs caption`);
          if (!(F.terms || []).length || F.terms.some((t) => !t.name || t.value === undefined)) ex(`${where}: formula terms need name and value`);
          if (!F.total || !F.total.name || F.total.value === undefined) ex(`${where}: formula needs total {name, value}`);
          if (F.chain !== undefined && (!Array.isArray(F.chain) || F.chain.some((c) => typeof c !== 'string' || !c))) ex(`${where}: formula chain must be a list of text steps`);
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
// Optional "By age" ladder after the roadmap.
const AG_KEYS = ['nav', 'heading', 'lede', 'lede_source', 'bands', 'note', 'note_source'];
const AG_BAND_KEYS = ['from', 'to', 'label', 'name', 'kind', 'text', 'source'];
const AG_KINDS = ['kids', 'youth', 'junior', 'senior', 'masters', 'coach', 'job'];
// Optional "Zero to podium" flow at the top of the roadmap (chronicle_path: -> career-flow.html): exactly four stages
// (grassroots, state-to-national, national camp, international), each short and sourced; the shared chronicle.fuel
// line under it cites ids every such sport must list.
const CP_KEYS = ['title', 'age', 'text', 'source'];
const CP_MAX = 240; // characters of text without tags — the nodes must stay scannable
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
    // Standalone journey page (scripts/build-sport-roadmaps.mjs → roadmaps/<slug>.html via sport-roadmap.html)
    const rmPage = path.join(root, 'roadmaps', E.slug + '.html');
    if (!fs.existsSync(rmPage)) ex(`roadmaps/${E.slug}.html missing (run scripts/build-sport-roadmaps.mjs)`);
    else if (!fs.readFileSync(rmPage, 'utf8').includes(`{% include sport-roadmap.html sport="${E.slug}" %}`)) ex(`roadmaps/${E.slug}.html does not include sport-roadmap.html for this sport`);
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
    // Optional "By age" ladder (ages: -> _includes/sport-ages.html, after the roadmap): bands in order of `from`,
    // each with a known kind and a source; `to` left out = no upper age limit.
    if (E.ages) {
      const A = E.ages;
      for (const k of Object.keys(A)) if (!AG_KEYS.includes(k)) ex(`ages: unknown key "${k}"`);
      if (!A.heading) ex('ages.heading is required');
      if (A.lede) cite('ages lede', A.lede_source, true);
      if (A.note) cite('ages note', A.note_source, true);
      if ((A.bands || []).length < 3) ex('ages needs at least 3 bands');
      let prev = 0;
      for (const [i, b] of (A.bands || []).entries()) {
        const w = `ages band ${i + 1}`;
        for (const k of Object.keys(b)) if (!AG_BAND_KEYS.includes(k)) ex(`${w}: unknown key "${k}"`);
        for (const k of ['label', 'name', 'kind', 'text']) if (!b[k]) ex(`${w}: ${k} is required`);
        if (!AG_KINDS.includes(b.kind)) ex(`${w}: unknown kind "${b.kind}" (use ${AG_KINDS.join(', ')})`);
        if (!Number.isInteger(b.from) || b.from < 4 || b.from > 110) ex(`${w}: from must be a whole age from 4 to 110`);
        if (b.to !== undefined && (!Number.isInteger(b.to) || b.to < b.from || b.to > 110)) ex(`${w}: to must be a whole age, not below from`);
        if (b.from < prev) ex(`${w}: bands must be in order of from`);
        prev = b.from;
        cite(w, b.source, true);
      }
    }
    if (E.chronicle_path) {
      const C = Array.isArray(E.chronicle_path) ? E.chronicle_path : [];
      if (C.length !== 4) ex('chronicle_path needs exactly 4 stages');
      for (const [i, s] of C.entries()) {
        const w = `chronicle_path stage ${i + 1}`;
        for (const k of Object.keys(s)) if (!CP_KEYS.includes(k)) ex(`${w}: unknown key "${k}"`);
        for (const k of ['title', 'text']) if (!s[k]) ex(`${w}: ${k} is required`);
        const len = String(s.text || '').replace(/<[^>]+>/g, '').length;
        if (len > CP_MAX) ex(`${w}: text is ${len} characters, keep it under ${CP_MAX}`);
        cite(w, s.source, true);
      }
      const CH = D.chronicle || {};
      if (!CH.heading || !CH.fuel) err('chronicle.heading and chronicle.fuel are required when a sport has chronicle_path');
      cite('chronicle fuel line', CH.fuel_source, true);
    }
    for (const sid of sIds) if (!cited.has(sid)) ex(`source "${sid}" is listed but never cited`);
  }
}

// ---- Every-sport directory (_data/in/sports_atlas.yml -> all-sports.html) ----
// Each sport row names the events it is played at by game code; a code must exist in games[], every family and fact
// cites listed sources, and a slug (deep-page link) must be a sport in sports.yml with its page on disk.
const saFile = path.join(root, '_data', 'in', 'sports_atlas.yml');
let saSports = 0;
if (fs.existsSync(saFile)) {
  const err = (m) => errors.push(`sports_atlas.yml: ${m}`);
  let A;
  try { A = yaml.load(fs.readFileSync(saFile, 'utf8')); } catch (e) { err('YAML error: ' + e.message.split('\n')[0]); A = {}; }
  if (!isDay(A.checked)) err('checked must be a date (YYYY-MM-DD)');
  const page = path.join(root, 'all-sports.html');
  if (!fs.existsSync(page) || !fs.readFileSync(page, 'utf8').includes('{% include sports-atlas.html %}')) err('all-sports.html missing or does not include sports-atlas.html');
  const srcIds = new Set();
  for (const s of A.sources || []) {
    if (!s.id || !s.name || !/^https:\/\//.test(s.url || '') || !s.covers || !isDay(s.checked)) err(`source ${JSON.stringify(s.id)} needs id, name, https url, covers, checked date`);
    if (srcIds.has(s.id)) err(`duplicate source id ${s.id}`);
    srcIds.add(s.id);
  }
  const cited = new Set();
  const cite = (where, src) => { const list = String(src || '').split(',').map((x) => x.trim()).filter(Boolean); if (!list.length) err(`${where}: no source`); for (const i of list) { cited.add(i); if (!srcIds.has(i)) err(`${where}: unknown source '${i}'`); } };
  if ((A.facts || []).length !== 4) err('the hero console needs exactly 4 facts (2 x 2)');
  for (const q of A.facts || []) cite(`fact '${q.label}'`, q.source);
  if (A.ladder) { cite('ladder', A.ladder.source); const w = (A.ladder.head || []).length; for (const [r, row] of (A.ladder.rows || []).entries()) if (row.length !== w) err(`ladder row ${r + 1} has ${row.length} cells, head has ${w}`); }
  const codes = new Set();
  for (const g of A.games || []) { if (!g.code || !g.label || !g.name || !g.what) err(`game ${JSON.stringify(g.code)} needs code, label, name, what`); codes.add(g.code); cite(`game ${g.code}`, g.source); }
  let spSlugs = [];
  try { spSlugs = (yaml.load(fs.readFileSync(spFile, 'utf8')).sports || []).map((e) => e.slug); } catch (e) { /* reported above */ }
  const famIds = new Set(); const names = new Set();
  for (const f of A.families || []) {
    if (!f.id || !f.label || !f.intro) err(`family ${JSON.stringify(f.id)} needs id, label, intro`);
    if (famIds.has(f.id)) err(`duplicate family id ${f.id}`); famIds.add(f.id);
    cite(`family ${f.id}`, f.source);
    for (const s of f.sports || []) {
      saSports++;
      if (!s.name || !s.what || !(s.at || []).length) err(`${f.id}: sport ${JSON.stringify(s.name)} needs name, what and at[]`);
      if (names.has(s.name)) err(`duplicate sport name ${s.name}`); names.add(s.name);
      for (const c of s.at || []) if (!codes.has(c)) err(`${s.name}: unknown game code '${c}'`);
      if (s.slug && !spSlugs.includes(s.slug)) err(`${s.name}: slug '${s.slug}' is not a sport page in sports.yml`);
    }
  }
  for (const sl of spSlugs) {
    const arts = ['kathak', 'bharatanatyam', 'hindustani-music', 'carnatic-music'];
    if (arts.includes(sl)) continue;
    if (![...(A.families || [])].some((f) => (f.sports || []).some((s) => s.slug === sl))) err(`sport page '${sl}' has no row in the directory`);
  }
  for (const i of srcIds) if (!cited.has(i)) err(`source '${i}' is listed but never cited`);
}

// ---- Sports system guides (_data/in/sports_guides.yml -> <slug>.html via sports-guide.html) ----
// Free-form sections, but the sport pages' part rules: every p / list / table / qa and hero fact cites its guide's
// sources, links resolve, every listed source is cited, and the page file includes this guide.
const sgFile = path.join(root, '_data', 'in', 'sports_guides.yml');
let sgGuides = 0;
if (fs.existsSync(sgFile)) {
  const err = (m) => errors.push(`sports_guides.yml: ${m}`);
  let GS;
  try { GS = yaml.load(fs.readFileSync(sgFile, 'utf8')); } catch (e) { err('YAML error: ' + e.message.split('\n')[0]); GS = {}; }
  if (!isDay(GS.checked)) err('checked must be a date (YYYY-MM-DD)');
  const ids = (list) => (String(list || '')).split(',').map((x) => x.trim()).filter(Boolean);
  const slugs = new Set();
  for (const G of GS.guides || []) {
    sgGuides++;
    const ex = (m) => err(`${G.slug}: ${m}`);
    for (const k of ['slug', 'short', 'eyebrow', 'title', 'lede', 'meta']) if (!G[k]) ex(`${k} is required`);
    if (slugs.has(G.slug)) ex('duplicate slug'); slugs.add(G.slug);
    const page = path.join(root, G.slug + '.html');
    if (!fs.existsSync(page)) ex(`page ${G.slug}.html missing`);
    else if (!fs.readFileSync(page, 'utf8').includes(`{% include sports-guide.html guide="${G.slug}" %}`)) ex('page does not include sports-guide.html for this guide');
    const sIds = new Set();
    for (const s of G.sources || []) {
      if (!s.id || !s.name || !/^https:\/\//.test(s.url || '') || !s.covers || !isDay(s.checked)) ex(`source ${JSON.stringify(s.id)} needs id, name, https url, covers, checked date`);
      if (sIds.has(s.id)) ex(`duplicate source id ${s.id}`);
      sIds.add(s.id);
    }
    const cited = new Set();
    const cite = (where, src, required) => {
      if (src) for (const i of ids(src)) { cited.add(i); if (!sIds.has(i)) ex(`${where}: source "${i}" is not listed under sources`); }
      else if (required) ex(`${where}: fact without source`);
    };
    if ((G.facts || []).length !== 4) ex('the hero console needs exactly 4 facts (2 x 2)');
    for (const q of G.facts || []) { if (!q.label || !q.value) ex('every fact needs label and value'); cite(`fact "${q.label}"`, q.source, true); }
    for (const o of G.official || []) if (!/^https:\/\//.test(o.url || '')) ex(`official link ${o.label}: url must start with https://`);
    const secIds = new Set();
    for (const S of G.sections || []) {
      if (!S.id || secIds.has(S.id)) ex(`section id missing or duplicate: ${S.id}`); secIds.add(S.id);
      for (const k of ['nav', 'eyebrow', 'heading']) if (!S[k]) ex(`section ${S.id}: ${k} is required`);
      for (const [i, p] of (S.parts || []).entries()) {
        const kinds = Object.keys(p).filter((k) => k !== 'source');
        const where = `section ${S.id} part ${i + 1}`;
        if (kinds.length !== 1 || ![...SC_KINDS, 'qa'].includes(kinds[0])) { ex(`${where}: unknown part ${JSON.stringify(kinds)}`); continue; }
        cite(where, p.source, FACT_KINDS.includes(kinds[0]) || kinds[0] === 'qa');
        if (p.qa && (!p.qa.q || !p.qa.a)) ex(`${where}: qa needs q and a`);
        if (p.table) {
          const w = (p.table.head || []).length;
          if (!w) ex(`${where}: table needs head`);
          for (const [r, row] of (p.table.rows || []).entries()) if (row.length !== w) ex(`${where}: table row ${r + 1} has ${row.length} cells, head has ${w}`);
        }
        for (const l of p.links || []) if (!l.label || !l.url || !(l.url.startsWith('https://') || linkOk(l.url))) ex(`${where}: bad link ${JSON.stringify(l)}`);
      }
    }
    if (!secIds.size) ex('needs at least one section');
    for (const sid of sIds) if (!cited.has(sid)) ex(`source "${sid}" is listed but never cited`);
  }
}

// ---- Vocational highway (_data/in/pathways/vocational.yml -> diploma.html / iti.html via in-vocational-track.html) ----
// Fails on: a track without its page / include calls, fewer than 3 or more than 7 steps, an empty eligibility,
// exams or pay list, an item without label/text (pay: value) or without source, a cited id that is not listed
// or not tagged with that track, a source never cited, non-https or unchecked sources, and broken local links.
const vocFile = path.join(root, '_data', 'in', 'pathways', 'vocational.yml');
let vocTracks = 0;
if (fs.existsSync(vocFile)) {
  const err = (m) => errors.push(`pathways/vocational.yml: ${m}`);
  let V = {};
  try { V = yaml.load(fs.readFileSync(vocFile, 'utf8')) || {}; } catch (e) { err('YAML error: ' + e.message.split('\n')[0]); }
  const srcs = new Map(), used = new Set();
  for (const s of V.sources || []) {
    if (!s.id || !s.name || !/^https:\/\//.test(s.url || '') || !s.covers || !isDay(s.checked) || !(s.tracks || []).length) err(`source ${JSON.stringify(s.id)} needs id, name, https url, covers, checked date and tracks`);
    if (srcs.has(s.id)) err(`duplicate source id ${s.id}`);
    srcs.set(s.id, s);
  }
  for (const T of V.tracks || []) {
    vocTracks++;
    const te = (m) => err(`${T.id}: ${m}`);
    for (const k of ['id', 'page', 'eyebrow', 'heading', 'intro']) if (!T[k]) te(`${k} is required`);
    const pg = path.join(root, T.page || '');
    if (!T.page || !fs.existsSync(pg)) te(`page ${T.page} missing`);
    else for (const part of ['track', 'sources']) if (!fs.readFileSync(pg, 'utf8').includes(`{% include in-vocational-track.html track="${T.id}" part="${part}" %}`)) te(`${T.page} does not include part "${part}"`);
    const n = (T.steps || []).length;
    if (n < 3 || n > 7) te(`steps must be 3-7 (found ${n})`);
    for (const [i, s] of (T.steps || []).entries()) if (!s.title || !s.text) te(`step ${i + 1}: title and text are required`);
    for (const g of ['eligibility', 'exams', 'pay']) {
      if (!(T[g] || []).length) te(`${g} is empty`);
      for (const [i, it] of (T[g] || []).entries()) {
        const w = `${g} ${i + 1}`;
        if (!it.label || !it.text || (g === 'pay' && !it.value)) te(`${w}: label and text${g === 'pay' ? ' and value' : ''} are required`);
        if (it.href && !linkOk(it.href)) te(`${w}: missing page ${it.href}`);
        if (!it.source) { te(`${w}: fact without source`); continue; }
        for (const sid of String(it.source).split(',').map((x) => x.trim())) {
          const S = srcs.get(sid);
          if (!S) te(`${w}: source "${sid}" is not listed`);
          else if (!(S.tracks || []).includes(T.id)) te(`${w}: source "${sid}" is not tagged with track ${T.id}`);
          else used.add(sid + '@' + T.id);
        }
      }
    }
  }
  for (const [sid, S] of srcs) for (const tk of S.tracks || []) if (!used.has(sid + '@' + tk)) err(`source "${sid}" is tagged ${tk} but never cited there`);
}

// ---- India top menu (_data/nav.yml topnav): every menu link, node heading and flyout link must exist ----
const navFile = path.join(root, '_data', 'nav.yml');
let navLinks = 0;
if (fs.existsSync(navFile)) {
  const N = yaml.load(fs.readFileSync(navFile, 'utf8')) || {};
  const megaFile = path.join(root, '_data', 'nav_mega.yml');
  const mega = fs.existsSync(megaFile) ? (yaml.load(fs.readFileSync(megaFile, 'utf8')) || {}) : {};
  // The generated flyout lists must match the hub pages and data they are built from.
  const megaRun = spawnSync(process.execPath, [path.join(root, 'scripts', 'build-nav-mega.mjs'), '--check'], { encoding: 'utf8', env: process.env });
  if (megaRun.status !== 0) errors.push('nav_mega: ' + ((megaRun.stderr || megaRun.stdout || '').trim().split('\n').join(' / ') || 'build-nav-mega --check failed'));
  // Study abroad engine (_data/in/abroad*): sheets, sources, review_by and study-abroad/** stubs.
  const abroadRun = spawnSync(process.execPath, [path.join(root, 'scripts', 'check-abroad-data.mjs')], { encoding: 'utf8', env: process.env });
  // Stale review_by dates come back as warnings on stderr with exit 0: show them without failing the run.
  if (abroadRun.status === 0 && /WARNING/.test(abroadRun.stderr || '')) console.warn((abroadRun.stderr || '').trim());
  if (abroadRun.status !== 0) errors.push('abroad: ' + ((abroadRun.stderr || abroadRun.stdout || '').trim().split('\n').join(' / ') || 'check-abroad-data failed'));
  const chk = (where, h) => { navLinks++; if (!h || !linkOk(String(h).replace(/&amp;/g, '&'))) errors.push(`nav.yml topnav ${where}: missing page ${h}`); };
  for (const it of N.topnav || []) {
    if (it.href) chk(it.label, it.href);
    for (const c of it.children || []) chk(`${it.label} > ${c.label}`, c.href);
    for (const n of it.nodes || []) {
      chk(`${it.label} > ${n.label}`, n.href);
      // A node lists either its own cols or `mega: <key>` (generated columns in _data/nav_mega.yml), never both.
      if (n.mega && n.cols) errors.push(`nav.yml topnav ${it.label} > ${n.label}: use cols or mega, not both`);
      if (n.badge && !['stem', 'health', 'finance'].includes(n.badge)) errors.push(`nav.yml topnav ${it.label} > ${n.label}: badge must be stem, health or finance`);
      const M = n.mega ? (mega[n.mega] || {}) : null;
      if (n.mega && !M.cols) errors.push(`nav.yml topnav ${it.label} > ${n.label}: mega key '${n.mega}' is not in _data/nav_mega.yml`);
      if (M && M.head) chk(`${n.label} > flyout head`, M.head.href);
      const cols = M ? (M.cols || []) : (n.cols || []);
      if (!cols.length) errors.push(`nav.yml topnav ${it.label} > ${n.label}: node has no cols`);
      for (const col of cols) {
        if (!col.label || !(col.links || []).length) errors.push(`nav.yml topnav ${n.label}: every column needs a label and links`);
        for (const c of col.links || []) {
          chk(`${n.label} > ${col.label} > ${c.label}`, c.href);
          // An unquoted label with a comma splits a YAML flow mapping into stray keys — catch it.
          const extra = Object.keys(c).filter((k) => !["label", "href", "desc"].includes(k));
          if (extra.length || typeof c.label !== "string") errors.push(`nav.yml topnav ${n.label} > ${col.label}: bad link keys ${JSON.stringify(extra)} (quote labels that contain commas)`);
        }
      }
    }
  }
}

console.log(`checked ${sheets} India data sheets`);
console.log(`checked ${nxExams} national exam console(s), ${navLinks} top-menu link(s)`);
console.log(`checked ${stateSheets} state cockpit sheet(s), ${stateExams} exam page(s)`);
console.log(`checked ${spSports} sports cockpit page(s), ${saSports} directory row(s)`);
console.log(`checked ${sgGuides} sports system guide(s)`);
console.log(`checked ${vocTracks} vocational track(s)`);
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('OK');
