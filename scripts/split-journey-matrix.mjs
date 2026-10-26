// One-time migration (2026-10-26): splits the single _data/in/journey_matrix.yml into
//   _data/in/journey_common.yml  — classes, boards, career order, general_money, money items / sources used by 2+ careers
//   _data/in/journey/<id>.yml    — one file per career, with the money items / sources only that career uses
// so a new batch adds small files instead of re-reading one 6,000-line file. Layout: scripts/lib/journey-data.mjs.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/split-journey-matrix.mjs [--force]
// The YAML text is cut, not re-dumped, so quoting, block text and comments inside each item stay as written. Section
// comments of the money / sources lists (batch notes) move to the end of journey_common.yml. The result is loaded back
// and compared with the old file field by field; nothing is written unless it matches. The old file is left in place
// (delete it yourself once the checks pass). --force overwrites an existing split.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { loadJourney, COMMON, DIR } from './lib/journey-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const SRC = path.join(root, '_data', 'in', 'journey_matrix.yml');
const die = (m) => { console.error('split-journey-matrix: ' + m); process.exit(1); };
if (!fs.existsSync(SRC)) die('_data/in/journey_matrix.yml not found — already split? (data is in journey_common.yml + journey/)');
if (fs.existsSync(path.join(root, DIR)) && !process.argv.includes('--force')) die(`${DIR} already exists — pass --force to overwrite`);

const text = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const lines = text.split('\n');
const D = yaml.load(text);

// ---- cut the text into sections and items
const top = (key) => { const i = lines.findIndex((l) => l.startsWith(key + ':')); if (i < 0) die(`no top-level "${key}:"`); return i; };
const at = { careers: top('careers'), general: top('general_money'), money: top('money'), sources: top('sources') };
const order = Object.entries(at).sort((a, b) => a[1] - b[1]).map(([k]) => k);
if (order.join() !== 'careers,general,money,sources') die('unexpected section order: ' + order.join());
// Items of a list section: an item starts at "  - " and takes every following line indented 4+ (or blank); trailing
// blank lines are dropped. Other lines (indent-2 / column-0 comments) are "loose".
const items = (from, to) => {
  const out = []; const loose = []; let cur = null;
  for (let i = from; i < to; i++) {
    const l = lines[i];
    if (l.startsWith('  - ')) { cur = [l]; out.push(cur); }
    else if (cur && (l.startsWith('    ') || !l.trim())) cur.push(l);
    else { cur = null; if (l.trim()) loose.push(l); }
  }
  for (const it of out) while (!it[it.length - 1].trim()) it.pop();
  return { out, loose };
};
const idOf = (it) => (it[0].match(/^ {2}- (?:\{ *)?id: *"?([^",}\s]+)/) || die('item without id: ' + it[0]))[1];
const careerItems = items(at.careers + 1, at.general).out;
// Column-0 comments right before general_money / sources belong to the next section (rewritten below), not to a list.
const moneyCut = items(at.money + 1, at.sources);
const sourceCut = items(at.sources + 1, lines.length);
const head = lines.slice(0, at.careers); // header comment, checked, classes, boards
const firstKey = head.findIndex((l) => /^[a-z_]+:/.test(l));

const byId = (list) => new Map(list.map((it) => [idOf(it), it]));
const careerText = byId(careerItems); const moneyText = byId(moneyCut.out); const sourceText = byId(sourceCut.out);
for (const [what, m, list] of [['career', careerText, D.careers], ['money', moneyText, D.money], ['source', sourceText, D.sources]]) {
  if (m.size !== list.length) die(`${what}: cut ${m.size} items from the text, YAML has ${list.length}`);
  for (const x of list) if (!m.has(x.id)) die(`${what} "${x.id}" not found in the text`);
}

// ---- who uses what: a money item / source used by exactly one career moves into that career's file
const walk = (o, f) => { if (Array.isArray(o)) o.forEach((x) => walk(x, f)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { f(k, v); walk(v, f); } };
const ids = (v) => (Array.isArray(v) ? v : [v]).filter((x) => typeof x === 'string');
const citesOf = (o) => { const s = new Set(); walk(o, (k, v) => { if (/(^|_)source$/.test(k)) ids(v).forEach((x) => s.add(x)); }); return s; };
const moneyOf = (c) => { const s = new Set(ids(c.money || [])); walk(c.journey || [], (k, v) => { if (k === 'money') ids(v).forEach((x) => s.add(x)); }); return s; };
const COMMON_OWNER = '';
const moneyOwner = new Map();
for (const m of D.money) {
  const users = D.careers.filter((c) => moneyOf(c).has(m.id)).map((c) => c.id);
  moneyOwner.set(m.id, users.length === 1 && !(D.general_money || []).includes(m.id) ? users[0] : COMMON_OWNER);
}
const srcUsers = new Map(D.sources.map((s) => [s.id, new Set()]));
const use = (set, who) => { for (const id of set) if (srcUsers.has(id)) srcUsers.get(id).add(who); };
for (const c of D.careers) use(citesOf(c), c.id);
for (const m of D.money) use(citesOf(m), moneyOwner.get(m.id));
use(citesOf(D.boards), COMMON_OWNER);
const sourceOwner = new Map([...srcUsers].map(([id, u]) => [id, u.size === 1 && !u.has(COMMON_OWNER) ? [...u][0] : COMMON_OWNER]));

// ---- write
const dedent = (it) => it.map((l, i) => (i === 0 ? l.replace(/^ {2}- /, '') : l.replace(/^ {1,4}/, '')));
const list = (key, chunks) => (chunks.length ? [``, `${key}:`, ...chunks.flat()] : []);
const outDir = path.join(root, DIR);
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (/\.ya?ml$/.test(f) && !careerText.has(f.replace(/\.ya?ml$/, ''))) die(`${DIR}/${f} is not a career in journey_matrix.yml — remove it first`);
const written = {};
for (const c of D.careers) {
  const own = (owner, m) => [...m].filter(([id]) => owner.get(id) === c.id).map(([, t]) => t);
  written[c.id] = [
    `# Journey Blueprint — ${c.name}. Printed on journey-${c.id}.html (_includes/journey-doubts.html).`,
    `# Rules, classes and the money items / sources several careers share: _data/in/journey_common.yml.`,
    `# \`money_defs\` / \`sources\` below are used only by this career. Check: node scripts/check-journey-matrix.mjs`,
    ...dedent(careerText.get(c.id)),
    ...list('money_defs', own(moneyOwner, moneyText)),
    ...list('sources', own(sourceOwner, sourceText)),
    '',
  ].join('\n');
}
const shared = (owner, m) => [...m].filter(([id]) => owner.get(id) === COMMON_OWNER).map(([, t]) => t);
const notes = [...moneyCut.loose, ...sourceCut.loose].filter((l) => /^ {2}#/.test(l)).map((l) => l.replace(/^ {2}/, ''));
const commonText = [
  `# journey_common.yml — shared data for the Student Journey Blueprint (journey-blueprint.html + journey-<id>.html).`,
  `# Split from the single journey_matrix.yml on 2026-10-26 (scripts/split-journey-matrix.mjs) so a batch only touches`,
  `# small files. Each career is its own file, _data/in/journey/<id>.yml; this file keeps what they all share:`,
  `#   classes, boards, \`careers\` (the order careers are listed in — add a new id here), general_money, and the`,
  `#   money items / sources used by more than one career. A money item or source only one career uses lives in that`,
  `#   career's file under \`money_defs\` / \`sources\`. Any career may cite any id from any file; every id is unique.`,
  `# The pages merge the files in _includes/journey-data.html; the scripts in scripts/lib/journey-data.mjs.`,
  `#`,
  `# Original header of journey_matrix.yml (the rules still apply to every career file):`,
  ...head.slice(0, firstKey).map((l) => l.replace(/^#?/, '#')).map((l) => l.replace(/Edit this file, not the pages\./, 'Edit the data files, not the pages.')),
  ...head.slice(firstKey),
  `# Career files in _data/in/journey/, in the order the hub lists them.`,
  `careers:`,
  ...D.careers.map((c) => `  - ${c.id}`),
  ``,
  `# --------------------------------------------------------------------- MONEY HELP (scholarships, stipends, fee cuts)`,
  `# kind: scholarship | stipend | fee | state | training. \`amount\` only when the official document prints it.`,
  `# Schemes open to a student on any path (not tied to one career). Every id must be a money item in some file.`,
  `general_money: ${JSON.stringify(D.general_money).replace(/"/g, '').replace(/,/g, ', ')}`,
  ...list('money', shared(moneyOwner, moneyText)),
  ``,
  `# --------------------------------------------------------------------- SOURCES used by more than one career`,
  ...list('sources', shared(sourceOwner, sourceText)).slice(1),
  ``,
  `# Batch notes that sat between the money / sources entries of journey_matrix.yml (kept for the record):`,
  ...notes.map((l) => '# ' + l.replace(/^# ?/, '')),
  '',
].join('\n');

// ---- verify before writing: load the new files the way the checker will and compare with the old file
{
  const mem = { [COMMON]: commonText };
  for (const [id, t] of Object.entries(written)) mem[path.join(DIR, `${id}.yml`)] = t;
  const enoent = (rel) => Object.assign(new Error(rel), { code: 'ENOENT' });
  const { D: N, problems } = loadJourney(root, yaml, { read: (rel) => { if (!(rel in mem)) throw enoent(rel); return mem[rel]; }, list: () => Object.keys(written).map((id) => id + '.yml') });
  if (problems.length) die('new files do not load:\n  ' + problems.join('\n  '));
  const keyed = (l) => Object.fromEntries(l.map((x) => [x.id, x]));
  const diffs = [];
  for (const k of new Set([...Object.keys(D), ...Object.keys(N)])) {
    if (k === 'money' || k === 'sources') { if (N[k].length !== D[k].length || !isDeepStrictEqual(keyed(N[k]), keyed(D[k]))) diffs.push(k); }
    else if (k === 'careers') D.careers.forEach((c, i) => { if (!isDeepStrictEqual(c, N.careers[i])) diffs.push('career ' + c.id); });
    else if (!isDeepStrictEqual(D[k], N[k])) diffs.push(k);
  }
  if (diffs.length) die('split does not match journey_matrix.yml: ' + diffs.join(', '));
}

fs.writeFileSync(path.join(root, COMMON), commonText);
for (const [id, t] of Object.entries(written)) fs.writeFileSync(path.join(outDir, `${id}.yml`), t);
const n = (m, o) => [...m.values()].filter((x) => x === o).length;
console.log(`split OK: ${D.careers.length} career files in ${DIR.replace(/\\/g, '/')}/, journey_common.yml keeps ${n(moneyOwner, COMMON_OWNER)} of ${D.money.length} money items and ${n(sourceOwner, COMMON_OWNER)} of ${D.sources.length} sources; loaded back = identical data. journey_matrix.yml left in place.`);
