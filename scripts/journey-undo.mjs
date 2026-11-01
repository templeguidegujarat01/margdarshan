// journey-undo — take one Journey Blueprint upload back off the site: the owner's undo button.
//   VERIFY_DEPS=<deps> node scripts/journey-undo.mjs <career id, or the upload's name>
//     e.g.  agricultural-drone-pilot      journey--agricultural-drone-pilot      journey-alias--railway-ntpc
//
// Run by the "Journey undo" GitHub Action (.github/workflows/journey-undo.yml). Only what scripts/journey-ingest.mjs
// published can be undone (careers whose file carries `inbox:`; the 77 built by hand are never touched):
//   career  deletes _data/in/journey/<id>.yml and journey-<id>.html, takes the id out of journey_common.yml `careers`,
//           puts its queue row back to todo (or removes the row ingest added), and drops links to the page from other
//           careers' multiverse cards.
//   alias   takes the upload's "=title" phrases back out of the career's search list.
// The upload moves from inbox/done/journey/ to inbox/undone/; one line goes to docs/free-claude/JOURNEY-LOG.md.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { unzip } from './lib/unzip.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const today = new Date().toISOString().slice(0, 10);
const JDIR = path.join(root, '_data/in/journey');
const COMMON = path.join(root, '_data/in/journey_common.yml');
const QUEUE = path.join(root, '_data/in/journey_queue.yml');
const DONE = path.join(root, 'inbox/done/journey');
// a one-line search list written the way the hand-built files write it: ["a", "b"]
const flow = (list) => '[' + list.map((x) => JSON.stringify(x)).join(', ') + ']';
const fail = (m) => { console.error('journey-undo: ' + m); process.exit(1); };
const want = String(process.argv[2] || '').trim().toLowerCase().replace(/^\d{4}-\d{2}-\d{2}--/, '').replace(/\.(ya?ml|txt|zip)$/i, '');
if (want.length < 3) fail('give the career id or the upload name, e.g. agricultural-drone-pilot');

const doneFiles = fs.existsSync(DONE) ? fs.readdirSync(DONE) : [];
const moveDone = (match) => {
  for (const f of doneFiles.filter(match)) {
    fs.mkdirSync(path.join(root, 'inbox/undone'), { recursive: true });
    fs.renameSync(path.join(DONE, f), path.join(root, 'inbox/undone', f));
  }
};
const LOG = path.join(root, 'docs/free-claude/JOURNEY-LOG.md');
const log = (line) => fs.appendFileSync(LOG, `- ${today} · UNDO · ${line}\n`);

if (want.startsWith('journey-alias--')) {
  // ---- alias: read the upload back to know which titles it added
  const up = doneFiles.filter((f) => f.replace(/^\d{4}-\d{2}-\d{2}--/, '').replace(/\.(ya?ml|txt|zip)$/i, '').toLowerCase() === want);
  if (!up.length) fail(`no upload named ${want} in inbox/done/journey/`);
  let removed = 0, id = '';
  for (const f of up) {
    const text = /\.zip$/i.test(f)
      ? (Object.entries(unzip(path.join(DONE, f))).find(([n, b]) => b && /\.(ya?ml|txt)$/i.test(n)) || [, Buffer.from('')])[1].toString('utf8')
      : fs.readFileSync(path.join(DONE, f), 'utf8');
    const fence = text.match(/```(?:ya?ml)?\s*\n([\s\S]*?)\n```/);
    const d = yaml.load(fence ? fence[1] : text) || {};
    id = String(d.alias_of || '');
    const file = path.join(JDIR, `${id}.yml`);
    if (!fs.existsSync(file)) continue;
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const drop = new Set((d.titles || []).map(norm));
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const i = lines.findIndex((l) => /^search:\s*\[.*\]\s*$/.test(l));
    if (i < 0) continue;
    const list = yaml.load(lines[i].replace(/^search:\s*/, ''));
    const keep = list.filter((s) => !(String(s).startsWith('=') && drop.has(norm(s.slice(1)))));
    removed += list.length - keep.length;
    lines[i] = 'search: ' + flow(keep);
    fs.writeFileSync(file, lines.join('\n'));
  }
  moveDone((f) => up.includes(f));
  log(`${want} · −${removed} titles from ${id}`);
  console.log(`journey-undo: removed ${removed} title(s) from ${id}`);
  process.exit(0);
}

// ---- career
const id = want.replace(/^journey--/, '').replace(/--.*$/, '');
const file = path.join(JDIR, `${id}.yml`);
if (!fs.existsSync(file)) fail(`no career "${id}" in _data/in/journey/`);
const c = yaml.load(fs.readFileSync(file, 'utf8'));
if (!c.inbox) fail(`"${id}" was not published from the inbox — it is one of the hand-built blueprints; edit it with Claude Code instead`);
fs.unlinkSync(file);
if (fs.existsSync(path.join(root, `journey-${id}.html`))) fs.unlinkSync(path.join(root, `journey-${id}.html`));
fs.writeFileSync(COMMON, fs.readFileSync(COMMON, 'utf8').split('\n').filter((l) => l !== `  - ${id}` && l !== `  - ${id}\r`).join('\n'));
const q = fs.readFileSync(QUEUE, 'utf8').split('\n')
  .filter((l) => !(l.includes(`blueprint: ${id},`) && l.includes('added: inbox')))
  .map((l) => (l.includes(`blueprint: ${id}, batch: inbox`) ? l.replace(/status: done, blueprint: [a-z0-9-]+, batch: inbox\s*\}/, 'status: todo }') : l));
fs.writeFileSync(QUEUE, q.join('\n'));
// other careers' multiverse cards that link to the page keep their text, lose the link
const href = new RegExp(`(,\\s*)?href:\\s*"?journey-${id}\\.html"?`, 'g');
for (const f of fs.readdirSync(JDIR).filter((x) => x.endsWith('.yml'))) {
  const p = path.join(JDIR, f);
  const t = fs.readFileSync(p, 'utf8');
  const lines = t.split('\n').filter((l) => !new RegExp(`^\\s+href:\\s*"?journey-${id}\\.html"?\\s*$`).test(l)).join('\n').replace(href, '');
  if (lines !== t) fs.writeFileSync(p, lines);
}
moveDone((f) => f.replace(/^\d{4}-\d{2}-\d{2}--/, '').toLowerCase().startsWith(`journey--${id}`));
const r = spawnSync(process.execPath, [path.join(root, 'scripts/build-journey-pages.mjs')], { cwd: root, env: process.env, stdio: 'inherit' });
if (r.status !== 0) fail('build-journey-pages failed');
log(`${id} · career removed`);
console.log(`journey-undo: removed the blueprint "${id}"`);
