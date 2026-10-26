// Checks _data/in/journey_matrix.yml (the Student Journey Blueprint: journey-blueprint.html + journey-<id>.html) and the shared state
// layer _data/in/journey_states.yml.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/check-journey-matrix.mjs
// Fails (exit 1) on: YAML errors, duplicate ids, a `stages` entry that is not a class id, a `source:` id that is
// not in `sources`, a source listed but never cited, a money id a career names but `money` lacks, a board_notes
// key that is not a board, a `state:` that is not one of the 36 states / UTs, a local link to a page that does not
// exist, a money item without who/apply, a career missing one of its blocks, a `search` phrase list that is missing
// or not text, and a general_money id that `money` lacks.
// Three-layer careers (`v: 2`) are checked for: core (what, day, routes, challenges, not_for; pay and cost lines
// cited), a `journey` that covers every class from Class 8 to graduated, at least 15 doubts each with q / a / next,
// `state_uses` roles that exist.
// Every career needs its own page journey-<id>.html (scripts/build-journey-pages.mjs writes the stub).
// Lean data tier (2026-10-26): only the 28 careers built before the state picker was dropped may carry state-by-state
// rows (`state:` in state_rules) or `state_uses`; a newer career with either fails, so batches stay national-only.
// journey_states.yml: 36 entries (28 states + 8 UTs), unique ids, known roles, https links, every legacy board id
// a real board. journey_queue.yml (if present): ranks in order, titles exactly in assets/data/career-titles.json, no
// duplicates, status todo / done, done rows name a real career, and every career has a done row.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const errors = [];
const err = (m) => errors.push(m);
const load = (name) => {
  try { return yaml.load(fs.readFileSync(path.join(root, '_data', 'in', name), 'utf8')); }
  catch (e) { console.error(`${name}: YAML error: ` + e.message.split('\n')[0]); process.exit(1); }
};
const D = load('journey_matrix.yml');
const S = load('journey_states.yml');

const dupes = (list, what) => {
  const seen = new Set();
  for (const x of list || []) { if (seen.has(x.id)) err(`duplicate ${what} id "${x.id}"`); seen.add(x.id); }
  return seen;
};
const classes = dupes(D.classes, 'class');
const boards = dupes(D.boards, 'board');
const sources = dupes(D.sources, 'source');
const moneyIds = dupes(D.money, 'money');
dupes(D.careers, 'career');
const states = dupes(S.states, 'state');
const ROLES = new Set(['scholarship', 'psc', 'police', 'tech', 'med', 'tet', 'admin']);
const USES = new Set([...ROLES, 'board']);
const cited = new Set();
// Careers built while the blueprint still had a state picker (batches 1–5); only these keep state rows.
const STATE_ROWS_OK = new Set(['loco-pilot', 'lawyer', 'ca', 'financial-analyst', 'software-engineer', 'merchant-navy', 'commercial-pilot',
  'bank-po', 'civil-services', 'doctor', 'nurse', 'nda-officer', 'company-secretary', 'data-scientist', 'architect', 'clinical-psychologist',
  'hotel-manager', 'biotech-scientist', 'pharmacist', 'dentist', 'ayurveda-doctor', 'veterinarian', 'physiotherapist', 'school-teacher',
  'police', 'civil-engineer', 'fashion-designer', 'assistant-professor']);

// ---- journey_states.yml
if ((S.states || []).length !== 36) err(`journey_states.yml: ${(S.states || []).length} states / UTs, expected 36`);
const kinds = (S.states || []).reduce((a, s) => ((a[s.kind] = (a[s.kind] || 0) + 1), a), {});
if (kinds.state !== 28 || kinds.ut !== 8) err(`journey_states.yml: ${kinds.state} states and ${kinds.ut} UTs, expected 28 and 8`);
const types = new Set((S.types || []).map((t) => t.id));
for (const t of ['state', 'cbse', 'cisce', 'other']) if (!types.has(t)) err(`journey_states.yml: board type "${t}" missing`);
const https = (u, where) => { if (!/^https:\/\//.test(u || '')) err(`${where}: url must be https`); };
for (const s of S.states || []) {
  const at = `state ${s.id}`;
  if (!s.name) err(`${at}: no name`);
  if (!['state', 'ut'].includes(s.kind)) err(`${at}: kind must be state or ut`);
  if (s.board) { if (!s.board.name) err(`${at}: board needs a name`); (s.board.links || []).forEach((l, i) => https(l.url, `${at} board.links[${i}]`)); }
  (s.bodies || []).forEach((b, i) => {
    if (!ROLES.has(b.role)) err(`${at} bodies[${i}]: unknown role "${b.role}"`);
    if (!b.name) err(`${at} bodies[${i}]: no name`);
    https(b.url, `${at} bodies[${i}]`);
  });
  for (const [t, id] of Object.entries(s.legacy || {})) {
    if (!types.has(t)) err(`${at}: legacy key "${t}" is not a board type`);
    if (!boards.has(id)) err(`${at}: legacy board "${id}" is not a board`);
  }
  if (s.cockpit && !fs.existsSync(path.join(root, s.cockpit))) err(`${at}: cockpit page "${s.cockpit}" does not exist`);
}

// ---- journey_matrix.yml
const cite = (id, where) => {
  if (id == null) return;
  if (Array.isArray(id)) { if (!id.length) err(`${where}: empty source list`); return id.forEach((x) => cite(x, where)); }
  if (!sources.has(id)) err(`${where}: unknown source "${id}"`);
  cited.add(id);
};
const stagesOk = (st, where) => {
  if (!Array.isArray(st) || !st.length) return err(`${where}: stages must be a non-empty list`);
  for (const s of st) if (!classes.has(s)) err(`${where}: "${s}" is not a class id`);
};
const stateOk = (s, where) => { if (s && !states.has(s)) err(`${where}: "${s}" is not a state / UT id in journey_states.yml`); };
const pageOk = (href, where) => {
  if (!href || /^(https?:|mailto:|#)/.test(href)) return;
  if (!fs.existsSync(path.join(root, href.split(/[?#]/)[0]))) err(`${where}: page "${href}" does not exist`);
};
const textOk = (t, where) => { if (!t || !String(t).trim()) err(`${where}: empty text`); };
const points = (list, where) => (list || []).forEach((p, j) => { textOk(p.text, `${where}[${j}]`); cite(p.source, `${where}[${j}]`); });

for (const c of D.careers || []) {
  const at = `career ${c.id}`;
  const v2 = c.v === 2;
  for (const k of ['name', 'page', 'gate', v2 ? 'journey' : 'foundation', 'exam', 'multiverse', 'money']) if (!c[k]) err(`${at}: missing ${k}`);
  pageOk(`journey-${c.id}.html`, at + ' blueprint page (run node scripts/build-journey-pages.mjs)');
  if (!STATE_ROWS_OK.has(c.id)) {
    if ((c.state_rules || []).some((r) => r.state)) err(`${at}: state-by-state rows are not added for new careers (lean data tier) — keep state_rules all-India`);
    if (c.state_uses) err(`${at}: state_uses is not added for new careers (lean data tier)`);
  }
  pageOk(c.page, at); pageOk(c.roadmap, at + ' roadmap');
  cite(c.gate_source, at + ' gate'); cite(c.board_source, at + ' board_source');
  (c.foundation || []).forEach((f, i) => {
    stagesOk(f.stages, `${at} foundation[${i}]`); textOk(f.title, `${at} foundation[${i}]`);
    points(f.points, `${at} foundation[${i}].points`);
  });
  for (const [k, n] of Object.entries(c.board_notes || {})) {
    if (!boards.has(k)) err(`${at}: board_notes key "${k}" is not a board`);
    if (n && typeof n === 'object') { textOk(n.text, `${at} board_notes.${k}`); cite(n.source, `${at} board_notes.${k}`); }
  }
  if (v2) textOk(c.board_note, `${at} board_note`);
  else for (const b of boards) if (!(c.board_notes || {})[b]) err(`${at}: board_notes has no text for board "${b}"`);
  const e = c.exam || {};
  textOk(e.name, at + ' exam.name'); pageOk(e.href, at + ' exam.href');
  (e.facts || []).forEach((q, i) => { textOk(q.value, `${at} exam.facts[${i}]`); cite(q.source, `${at} exam.facts[${i}]`); });
  if (!e.stages || !e.stages.head || !e.stages.rows) err(`${at}: exam.stages needs head and rows`);
  else {
    cite(e.stages.source, at + ' exam.stages');
    e.stages.rows.forEach((r, i) => { if (r.length !== e.stages.head.length) err(`${at}: exam.stages row ${i} has ${r.length} cells, head has ${e.stages.head.length}`); });
  }
  points(e.notes, `${at} exam.notes`);
  (c.state_rules || []).forEach((r, i) => {
    textOk(r.text, `${at} state_rules[${i}]`); cite(r.source, `${at} state_rules[${i}]`); stateOk(r.state, `${at} state_rules[${i}]`);
    pageOk(r.href, `${at} state_rules[${i}]`);
  });
  (c.multiverse || []).forEach((m, i) => { textOk(m.title, `${at} multiverse[${i}]`); pageOk(m.href, `${at} multiverse[${i}]`); });
  for (const id of c.money || []) if (!moneyIds.has(id)) err(`${at}: money id "${id}" is not in money`);
  if (!Array.isArray(c.search) || !c.search.length) err(`${at}: search must be a non-empty list of phrases`);
  for (const s of [...(c.search || []), ...(c.search_not || [])]) if (typeof s !== 'string' || !s.replace(/^=/, '').trim()) err(`${at}: search phrase must be text`);

  if (!v2) continue;
  // ---- three-layer careers
  const k = c.core || {};
  if (!k.what || !k.what.text) err(`${at}: core.what needs text`); else cite(k.what.source, `${at} core.what`);
  for (const f of ['day', 'routes', 'challenges', 'not_for']) if (!Array.isArray(k[f]) || !k[f].length) err(`${at}: core.${f} must be a non-empty list`);
  (k.pay || []).forEach((p, i) => { textOk(p.level, `${at} core.pay[${i}]`); textOk(p.value, `${at} core.pay[${i}]`); if (!p.source) err(`${at} core.pay[${i}]: pay needs a source`); cite(p.source, `${at} core.pay[${i}]`); });
  if (!(k.pay || []).length) textOk(k.pay_note, `${at} core.pay_note (no pay line, so say why)`);
  (k.routes || []).forEach((r, i) => { textOk(r.title, `${at} core.routes[${i}]`); textOk(r.text, `${at} core.routes[${i}]`); cite(r.source, `${at} core.routes[${i}]`); });
  (k.cost_time || []).forEach((r, i) => { textOk(r.value, `${at} core.cost_time[${i}]`); if (!r.source) err(`${at} core.cost_time[${i}]: needs a source`); cite(r.source, `${at} core.cost_time[${i}]`); });
  points(k.challenges, `${at} core.challenges`);
  const covered = new Set();
  let doubts = 0;
  const qs = new Set();
  (c.journey || []).forEach((j, i) => {
    const w = `${at} journey[${i}]`;
    stagesOk(j.stages, w); textOk(j.title, w + ' title');
    (j.stages || []).forEach((s) => covered.add(s));
    points(j.do, `${w}.do`);
    (j.exams || []).forEach((x, n) => { textOk(x.name, `${w}.exams[${n}]`); textOk(x.when, `${w}.exams[${n}].when`); if (!x.source) err(`${w}.exams[${n}]: an exam window needs a source`); cite(x.source, `${w}.exams[${n}]`); pageOk(x.href, `${w}.exams[${n}]`); });
    for (const id of j.money || []) if (!moneyIds.has(id)) err(`${w}: money id "${id}" is not in money`);
    (j.doubts || []).forEach((d, n) => {
      const dw = `${w}.doubts[${n}]`;
      textOk(d.q, dw + '.q'); textOk(d.a, dw + '.a'); textOk(d.next, dw + '.next'); cite(d.source, dw);
      if (qs.has(d.q)) err(`${dw}: duplicate question`); qs.add(d.q);
      if (/<|>/.test(d.q || '')) err(`${dw}: question must be plain text (it goes into FAQPage JSON-LD)`);
      doubts++;
    });
  });
  for (const s of ['c8', 'c9', 'c10', 'c11', 'c12', 'ug', 'grad']) if (!covered.has(s)) err(`${at}: journey has no step for "${s}"`);
  if (doubts < 15) err(`${at}: ${doubts} doubts — at least 15 needed`);
  for (const u of c.state_uses || []) if (!USES.has(u)) err(`${at}: state_uses "${u}" is not a role`);
  if (c.doubts_page) pageOk(c.doubts_page, at + ' doubts_page');
}
if (!Array.isArray(D.general_money) || !D.general_money.length) err('general_money must be a non-empty list');
for (const id of D.general_money || []) if (!moneyIds.has(id)) err(`general_money id "${id}" is not in money`);

for (const m of D.money || []) {
  const at = `money ${m.id}`;
  for (const k of ['kind', 'name', 'by', 'who', 'apply']) textOk(m[k], `${at}.${k}`);
  if (!['scholarship', 'stipend', 'fee', 'state', 'training'].includes(m.kind)) err(`${at}: unknown kind "${m.kind}"`);
  stagesOk(m.stages, at); stateOk(m.state, at); cite(m.source, at);
}
for (const b of D.boards || []) stateOk(b.state, `board ${b.id}`);

// ---- journey_queue.yml (which careers are built next): exact titles from the 10,000-title list, real blueprint ids.
const qf = path.join(root, '_data', 'in', 'journey_queue.yml');
if (fs.existsSync(qf)) {
  const Q = load('journey_queue.yml');
  const titles = new Set(JSON.parse(fs.readFileSync(path.join(root, 'assets', 'data', 'career-titles.json'), 'utf8')).t.map((x) => x[0]));
  const careerIds = new Set((D.careers || []).map((c) => c.id));
  const seenT = new Set();
  (Q.careers || []).forEach((q, i) => {
    const at = `journey_queue.yml row ${i + 1}`;
    if (q.rank !== i + 1) err(`${at}: rank ${q.rank} is out of order`);
    if (!titles.has(q.title)) err(`${at}: "${q.title}" is not in career-titles.json`);
    if (seenT.has(q.title)) err(`${at}: duplicate title "${q.title}"`); seenT.add(q.title);
    if (q.status === 'done') { if (!careerIds.has(q.blueprint)) err(`${at}: blueprint "${q.blueprint}" is not a career`); }
    else if (q.status !== 'todo') err(`${at}: status must be todo or done`);
  });
  for (const c of D.careers || []) if (!(Q.careers || []).some((q) => q.blueprint === c.id)) err(`journey_queue.yml: career "${c.id}" has no done row`);
}

for (const s of D.sources || []) {
  if (!/^https:\/\//.test(s.url || '')) err(`source ${s.id}: url must be https`);
  if (!cited.has(s.id)) err(`source ${s.id} is listed but never cited`);
}

if (errors.length) {
  console.error(`journey: ${errors.length} problem(s)`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
const v2 = D.careers.filter((c) => c.v === 2);
const nd = v2.reduce((n, c) => n + c.journey.reduce((m, j) => m + (j.doubts || []).length, 0), 0);
console.log(`journey_matrix.yml OK: ${D.careers.length} careers (${v2.length} three-layer, ${nd} doubts), ${D.money.length} money items, ${D.sources.length} sources · journey_states.yml OK: ${S.states.length} states / UTs`);
