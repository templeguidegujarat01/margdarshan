// Build per-pathway college lists from the official NCES IPEDS complete data files.
//   node scripts/build-ipeds.mjs --year 2024 --group computer-science=11.0701,11.0101 [--group …] [--out dir] [--cache dir]
//
// Sources (NCES IPEDS Data Center, complete data files):
//   HD<year>.zip       institutional characteristics: name, city, state, sector, level, website
//   C<year>_A.zip      completions by institution × 6-digit CIP × award level (July 1 – June 30 of
//                      the academic year ending in <year>), first and second majors
// Award levels (AWLEVEL, from the C<year>_A dictionary): 3 associate, 5 bachelor's, 7 master's,
// 17 doctor's research/scholarship, 18 doctor's professional practice, 19 doctor's other.
// Aggregate codes (12 degrees total, 15 degrees/certificates total, 13 certificates total) are skipped.
// Counts first majors only (MAJORNUM 1), so a graduate is counted once.
//
// Output: <out>/<group>.json — institutions that awarded at least one degree in the group's CIP codes,
// with their award counts per level. Values are copied from IPEDS, never estimated.
// Which CIP codes belong to a pathway is a curated decision stored in _data/us/pathways.yml (`cip:`),
// checked against the NCES CIP 2020 ↔ SOC 2018 crosswalk; this script only applies it.
import fs from 'node:fs';
import path from 'node:path';
import { csvFromZip } from './lib/unzip.mjs';

const args = process.argv.slice(2);
const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const year = val('--year') || '2024';
const out = path.resolve(val('--out') || 'ipeds-out');
const cache = path.resolve(val('--cache') || out);
const groups = Object.fromEntries(args.flatMap((a, i) => (a === '--group' ? [args[i + 1].split('=')] : [])).map(([k, v]) => [k, new Set(v.split(','))]));
if (!Object.keys(groups).length) { console.error('usage: node scripts/build-ipeds.mjs --year 2024 --group <name>=<cip,cip> [...]'); process.exit(1); }
const LEVEL = { 3: 'associate', 5: 'bachelor', 7: 'master', 17: 'doctor_research', 18: 'doctor_professional', 19: 'doctor_other' };
const SECTOR = { 1: 'Public, 4-year+', 2: 'Private nonprofit, 4-year+', 3: 'Private for-profit, 4-year+', 4: 'Public, 2-year', 5: 'Private nonprofit, 2-year', 6: 'Private for-profit, 2-year', 7: 'Public, less than 2-year', 8: 'Private nonprofit, less than 2-year', 9: 'Private for-profit, less than 2-year' };

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

fs.mkdirSync(out, { recursive: true });
for (const [name, cips] of Object.entries(groups)) {
  const inst = {};
  for (const r of comp) {
    if (r.MAJORNUM !== '1' || !LEVEL[r.AWLEVEL] || !cips.has(r.CIPCODE)) continue;
    const n = +r.CTOTALT; if (!n) continue;
    const h = hd[r.UNITID]; if (!h) continue;
    const i = (inst[r.UNITID] ||= { id: +r.UNITID, name: h.INSTNM, city: h.CITY, state: h.STABBR, sector: SECTOR[h.SECTOR] || h.SECTOR, web: h.WEBADDR, awards: {} });
    i.awards[LEVEL[r.AWLEVEL]] = (i.awards[LEVEL[r.AWLEVEL]] || 0) + n;
  }
  const list = Object.values(inst).sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
  const totals = {}; for (const i of list) for (const [k, v] of Object.entries(i.awards)) totals[k] = (totals[k] || 0) + v;
  fs.writeFileSync(path.join(out, name + '.json'), JSON.stringify({ group: name, cip: [...cips], source: 'NCES IPEDS', files: [`HD${year}`, `C${year}_A`], academic_year: `${+year - 1}-${String(year).slice(2)}`, institutions: list.length, totals, list }));
  console.log(`${name}: ${list.length} institutions, awards ${JSON.stringify(totals)}`);
}
