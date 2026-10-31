// learn-state — what a finder already has in ONE state, so a state-fill run never reads the big JSON/YAML files.
//   node scripts/learn-state.mjs ca gujarat
// Prints: finder types, rows per city and type, every existing name (to skip duplicates), and the local file count.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [finder, state] = process.argv.slice(2);
if (!finder || !state) { console.log('usage: node scripts/learn-state.mjs <finder> <state-slug>'); process.exit(1); }
const json = path.join(root, `assets/data/learn/${finder}.json`);
if (!fs.existsSync(json)) {
  const live = fs.readdirSync(path.join(root, 'assets/data/learn')).map((f) => f.replace('.json', ''));
  console.log(`NO FINDER "${finder}" yet. Live finders: ${live.join(', ')}. See STATE-FILL.md step 0 (new finder).`);
  process.exit(0);
}
const meta = fs.readFileSync(path.join(root, `_data/in/learn/${finder}.yml`), 'utf8');
const types = (meta.match(/^types:\s*(.*)$/m) || [])[1];
const rows = JSON.parse(fs.readFileSync(json, 'utf8')).filter((r) => r.state === state);
const local = path.join(root, 'scripts/learn-src/local', finder, `${state}.yml`);
const nLocal = fs.existsSync(local) ? (fs.readFileSync(local, 'utf8').match(/^\s*- name:/gm) || []).length : 0;
console.log(`${finder} · ${state}: ${rows.length} live rows (local file: ${nLocal ? nLocal + ' rows' : 'none'})`);
console.log(`types allowed: ${types}`);
const byCity = {};
for (const r of rows) (byCity[r.city] ||= []).push(r);
for (const [city, list] of Object.entries(byCity).sort((a, b) => b[1].length - a[1].length)) {
  const t = {}; for (const r of list) t[r.type] = (t[r.type] || 0) + 1;
  console.log(`\n${city} (${list.length}) ${JSON.stringify(t)}`);
  console.log('  ' + list.map((r) => r.name).join(' · '));
}
const all = JSON.parse(fs.readFileSync(json, 'utf8'));
const st = {}; for (const r of all) st[r.state] = (st[r.state] || 0) + 1;
console.log(`\nall states: ${Object.entries(st).sort((a, b) => a[1] - b[1]).map(([s, n]) => `${s} ${n}`).join(', ')}`);
