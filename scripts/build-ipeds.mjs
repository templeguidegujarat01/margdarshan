// Build per-pathway college lists from the official NCES IPEDS complete data files.
//   node scripts/build-ipeds.mjs --year 2024 --from-pathways [--out assets/data/us/colleges] [--summary _data/us/colleges_summary.json] [--cache <dir>]
//   node scripts/build-ipeds.mjs --year 2024 --group computer-science=11.0701,11.0101 [--group …]   (ad-hoc)
//
// Sources (NCES IPEDS Data Center, complete data files; downloaded once into --cache):
//   HD<year>.zip       institutional characteristics: name, city, state, sector, website
//   C<year>_A.zip      completions by institution × 6-digit CIP × award level for the academic year
//                      July 1 (<year>-1) – June 30 (<year>), first and second majors
// Award levels (AWLEVEL, from the C<year>_A dictionary): 3 associate, 5 bachelor's, 7 master's,
// 17 doctor's research/scholarship, 18 doctor's professional practice, 19 doctor's other.
// Aggregate codes (12, 13, 15) are skipped. Only first majors (MAJORNUM 1) are counted.
//
// --from-pathways reads every `slug:` with a `cip:` list in _data/us/pathways.yml (curated codes, checked
// against the NCES CIP 2020 ↔ SOC 2018 crosswalk). Output per pathway: <out>/<slug>.json, compact rows
//   [unitid, name, city, state, sector, website, {level: awards}, {cip: awards}]
// and one summary file for Liquid (counts, totals by level and program, the 10 largest programs).
// IPEDS shows which schools award a degree — not program accreditation, quality or admission odds.
// Values are copied; sums are only across a school's listed CIP codes / levels.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvFromZip } from './lib/unzip.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const year = val('--year') || '2024';
const out = path.resolve(val('--out') || 'ipeds-out');
const summaryFile = val('--summary') ? path.resolve(val('--summary')) : path.join(out, '_summary.json');
const cache = path.resolve(val('--cache') || out);
const LEVEL = { 3: 'associate', 5: 'bachelor', 7: 'master', 17: 'doctor_research', 18: 'doctor_professional', 19: 'doctor_other' };
const SECTOR = { 1: 'Public, 4-year or above', 2: 'Private nonprofit, 4-year or above', 3: 'Private for-profit, 4-year or above', 4: 'Public, 2-year', 5: 'Private nonprofit, 2-year', 6: 'Private for-profit, 2-year', 7: 'Public, less than 2-year', 8: 'Private nonprofit, less than 2-year', 9: 'Private for-profit, less than 2-year' };

const groups = {}; const labels = {};
if (args.includes('--from-pathways')) {
  const y = fs.readFileSync(path.join(root, '_data/us/pathways.yml'), 'utf8');
  for (const block of y.split(/\n  - slug: /).slice(1)) {
    const slug = block.split('\n')[0].trim();
    const cipBlock = block.match(/\n    cip:\n((?:      - .*\n)+)/);
    if (!cipBlock) continue;
    const items = [...cipBlock[1].matchAll(/code: "([\d.]+)", label: "([^"]+)"/g)];
    groups[slug] = new Set(items.map((m) => m[1]));
    labels[slug] = Object.fromEntries(items.map((m) => [m[1], m[2]]));
  }
}
for (const [i, a] of args.entries()) if (a === '--group') { const [k, v] = args[i + 1].split('='); groups[k] = new Set(v.split(',')); }
if (!Object.keys(groups).length) { console.error('usage: node scripts/build-ipeds.mjs --year 2024 --from-pathways | --group <name>=<cip,cip>'); process.exit(1); }

fs.mkdirSync(cache, { recursive: true });
async function get(name) {
  const f = path.join(cache, name);
  if (!fs.existsSync(f)) {
    const r = await fetch('https://nces.ed.gov/ipeds/datacenter/data/' + name, { headers: { 'User-Agent': 'Margdarshan data refresh' } });
    if (!r.ok) throw new Error(name + ' HTTP ' + r.status + ' (is this IPEDS year released yet?)');
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  return f;
}
const hd = Object.fromEntries(csvFromZip(await get(`HD${year}.zip`)).map((r) => [r.UNITID, r]));
const comp = csvFromZip(await get(`C${year}_A.zip`));
const academic_year = `${+year - 1}-${String(year).slice(2)}`;

fs.mkdirSync(out, { recursive: true });
const summary = {};
for (const [name, cips] of Object.entries(groups)) {
  const inst = {};
  for (const r of comp) {
    if (r.MAJORNUM !== '1' || !LEVEL[r.AWLEVEL] || !cips.has(r.CIPCODE)) continue;
    const n = +r.CTOTALT; if (!n) continue;
    const h = hd[r.UNITID]; if (!h) continue;
    const i = (inst[r.UNITID] ||= { id: +r.UNITID, name: h.INSTNM, city: h.CITY, state: h.STABBR, sector: +h.SECTOR, web: h.WEBADDR, awards: {}, cip: {} });
    i.awards[LEVEL[r.AWLEVEL]] = (i.awards[LEVEL[r.AWLEVEL]] || 0) + n;
    i.cip[r.CIPCODE] = (i.cip[r.CIPCODE] || 0) + n;
  }
  const list = Object.values(inst).sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
  const totals = {}, byCip = {}, byState = {};
  for (const i of list) {
    for (const [k, v] of Object.entries(i.awards)) totals[k] = (totals[k] || 0) + v;
    for (const [k, v] of Object.entries(i.cip)) byCip[k] = (byCip[k] || 0) + v;
    byState[i.state] = (byState[i.state] || 0) + 1;
  }
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  fs.writeFileSync(path.join(out, name + '.json'), JSON.stringify({
    pathway: name, cip: [...cips], labels: labels[name] || {}, source: 'NCES IPEDS', files: [`HD${year}`, `C${year}_A`], academic_year,
    sectors: SECTOR, institutions: list.length, totals,
    rows: list.map((i) => [i.id, i.name, i.city, i.state, i.sector, i.web, i.awards, i.cip]),
  }));
  summary[name] = {
    institutions: list.length, states: Object.keys(byState).length, totals, by_cip: byCip,
    largest: list.slice().sort((a, b) => sum(b.awards) - sum(a.awards)).slice(0, 10).map((i) => ({ id: i.id, name: i.name, city: i.city, state: i.state, sector: SECTOR[i.sector], total: sum(i.awards), awards: i.awards })),
  };
  console.log(`${name}: ${list.length} institutions in ${Object.keys(byState).length} states/territories, awards ${JSON.stringify(totals)}`);
}
fs.writeFileSync(summaryFile, JSON.stringify({ academic_year, files: [`HD${year}`, `C${year}_A`], source: 'NCES IPEDS', pathways: summary }, null, 1));
fs.writeFileSync(path.join(out, '_meta.json'), JSON.stringify({ academic_year, files: [`HD${year}`, `C${year}_A`], built: new Date().toISOString().slice(0, 10), pathways: Object.keys(summary).length }, null, 1));
