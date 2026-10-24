// Checks _data/in/journey_matrix.yml (the Student Journey Blueprint, journey-blueprint.html).
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/check-journey-matrix.mjs
// Fails (exit 1) on: YAML errors, duplicate ids, a `stages` entry that is not a class id, a `source:` id that is
// not in `sources`, a source listed but never cited, a money id a career names but `money` lacks, a board_notes
// key that is not a board, a `state:` no board has, a local link to a page that does not exist, a money item
// without who/apply, and a career missing one of the five blocks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const file = path.join(root, '_data', 'in', 'journey_matrix.yml');
const errors = [];
const err = (m) => errors.push(m);

let D;
try { D = yaml.load(fs.readFileSync(file, 'utf8')); } catch (e) { console.error('journey_matrix.yml: YAML error: ' + e.message.split('\n')[0]); process.exit(1); }

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
const states = new Set((D.boards || []).map((b) => b.state).filter(Boolean));
const cited = new Set();

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
const stateOk = (s, where) => { if (s && !states.has(s)) err(`${where}: no board has state "${s}"`); };
const pageOk = (href, where) => {
  if (!href || /^(https?:|mailto:|#)/.test(href)) return;
  if (!fs.existsSync(path.join(root, href.split(/[?#]/)[0]))) err(`${where}: page "${href}" does not exist`);
};
const textOk = (t, where) => { if (!t || !String(t).trim()) err(`${where}: empty text`); };

for (const c of D.careers || []) {
  const at = `career ${c.id}`;
  for (const k of ['name', 'page', 'gate', 'foundation', 'exam', 'state_rules', 'multiverse', 'money']) if (!c[k]) err(`${at}: missing ${k}`);
  pageOk(c.page, at); pageOk(c.roadmap, at + ' roadmap');
  cite(c.gate_source, at + ' gate'); cite(c.board_source, at + ' board_source');
  (c.foundation || []).forEach((f, i) => {
    stagesOk(f.stages, `${at} foundation[${i}]`); textOk(f.title, `${at} foundation[${i}]`);
    (f.points || []).forEach((p, j) => { textOk(p.text, `${at} foundation[${i}].points[${j}]`); cite(p.source, `${at} foundation[${i}].points[${j}]`); });
  });
  for (const [k, n] of Object.entries(c.board_notes || {})) {
    if (!boards.has(k)) err(`${at}: board_notes key "${k}" is not a board`);
    if (n && typeof n === 'object') { textOk(n.text, `${at} board_notes.${k}`); cite(n.source, `${at} board_notes.${k}`); }
  }
  for (const b of boards) if (!(c.board_notes || {})[b]) err(`${at}: board_notes has no text for board "${b}"`);
  const e = c.exam || {};
  textOk(e.name, at + ' exam.name'); pageOk(e.href, at + ' exam.href');
  (e.facts || []).forEach((q, i) => { textOk(q.value, `${at} exam.facts[${i}]`); cite(q.source, `${at} exam.facts[${i}]`); });
  if (!e.stages || !e.stages.head || !e.stages.rows) err(`${at}: exam.stages needs head and rows`);
  else {
    cite(e.stages.source, at + ' exam.stages');
    e.stages.rows.forEach((r, i) => { if (r.length !== e.stages.head.length) err(`${at}: exam.stages row ${i} has ${r.length} cells, head has ${e.stages.head.length}`); });
  }
  (e.notes || []).forEach((n, i) => { textOk(n.text, `${at} exam.notes[${i}]`); cite(n.source, `${at} exam.notes[${i}]`); });
  (c.state_rules || []).forEach((r, i) => { textOk(r.text, `${at} state_rules[${i}]`); cite(r.source, `${at} state_rules[${i}]`); stateOk(r.state, `${at} state_rules[${i}]`); });
  (c.multiverse || []).forEach((m, i) => { textOk(m.title, `${at} multiverse[${i}]`); pageOk(m.href, `${at} multiverse[${i}]`); });
  for (const id of c.money || []) if (!moneyIds.has(id)) err(`${at}: money id "${id}" is not in money`);
}

for (const m of D.money || []) {
  const at = `money ${m.id}`;
  for (const k of ['kind', 'name', 'by', 'who', 'apply']) textOk(m[k], `${at}.${k}`);
  if (!['scholarship', 'stipend', 'fee', 'state', 'training'].includes(m.kind)) err(`${at}: unknown kind "${m.kind}"`);
  stagesOk(m.stages, at); stateOk(m.state, at); cite(m.source, at);
}

for (const s of D.sources || []) {
  if (!/^https:\/\//.test(s.url || '')) err(`source ${s.id}: url must be https`);
  if (!cited.has(s.id)) err(`source ${s.id} is listed but never cited`);
}

if (errors.length) {
  console.error(`journey_matrix.yml: ${errors.length} problem(s)`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`journey_matrix.yml OK: ${D.careers.length} careers, ${D.money.length} money items, ${D.sources.length} sources`);
