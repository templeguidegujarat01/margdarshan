// inbox-undo — take one inbox upload back off the site: the owner's undo button.
//   VERIFY_DEPS=<deps> node scripts/inbox-undo.mjs <file name or part of it>     e.g.  ca-coaching--kerala
//
// Run by the "Inbox undo" GitHub Action (.github/workflows/inbox-undo.yml, Actions tab → Run workflow → type the
// name from inbox/done/ or inbox/REPORT.md). inbox-ingest.mjs starts every upload's rows in
// scripts/learn-src/local/<finder>/<state>.yml with a marker line
//   # ── free-Claude inbox <date> (<file>)
// so this removes each marked block whose file name contains the text, up to the next marker, moves the upload
// from inbox/done/ to inbox/undone/, and writes inbox/REPORT.md. The Action then runs rebuild-learn.mjs.
// Rows a Claude Code session added by hand (no marker) are never touched.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const want = String(process.argv[2] || '').trim().replace(/^\d{4}-\d{2}-\d{2}--/, '').replace(/\.(ya?ml|txt|zip)$/i, '').toLowerCase();
if (want.length < 5) { console.error('inbox-undo: give the upload name, e.g. ca-coaching--kerala'); process.exit(1); }
const today = new Date().toISOString().slice(0, 10);
const MARK = /^ {2}# ── free-Claude inbox (\d{4}-\d{2}-\d{2}) \(([^)]+)\)\s*$/;

const localRoot = path.join(root, 'scripts/learn-src/local');
const removed = [];
for (const fid of fs.existsSync(localRoot) ? fs.readdirSync(localRoot) : []) {
  const dir = path.join(localRoot, fid);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.yml'))) {
    const file = path.join(dir, f);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const keep = [];
    let skipping = false, n = 0;
    for (const l of lines) {
      const m = l.match(MARK);
      if (m) skipping = m[2].toLowerCase().includes(want);
      else if (/^ {2}# ── /.test(l)) skipping = false;
      if (skipping) { if (/^ {2}- name:/.test(l)) n++; continue; }
      keep.push(l);
    }
    if (n) { fs.writeFileSync(file, keep.join('\n')); removed.push(`${fid}/${f.replace(/\.yml$/, '')}: ${n} rows`); }
  }
}
const done = path.join(root, 'inbox/done');
const moved = [];
for (const f of fs.existsSync(done) ? fs.readdirSync(done) : []) {
  if (!f.toLowerCase().includes(want)) continue;
  fs.mkdirSync(path.join(root, 'inbox/undone'), { recursive: true });
  fs.renameSync(path.join(done, f), path.join(root, 'inbox/undone', f));
  moved.push(f);
}
if (!removed.length) {
  console.error(`inbox-undo: no upload named like "${want}" found (look in inbox/done/ for the exact name)`);
  process.exit(1);
}
fs.writeFileSync(path.join(root, 'inbox/REPORT.md'), [`# Inbox report — ${today}`, '', `**Undo of "${want}"**: these rows were taken off the site.`, '',
  ...removed.map((x) => `- ${x}`), '', `Upload file(s) moved to inbox/undone/: ${moved.join(', ') || '(none found in inbox/done)'}`, ''].join('\n'));
fs.appendFileSync(path.join(root, 'docs/learn-finder/LOG.md'), `- ${today} · undo ${want} · ${removed.join('; ')}\n`);
console.log(`inbox-undo: removed ${removed.join('; ')}`);
