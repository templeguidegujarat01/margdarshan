// Build USA wage/employment JSON from the official BLS OEWS time-series file (one download per year).
//   node scripts/build-oews.mjs [--data <local oe.data.0.Current>] [--out <dir>] [--summary <file>] [--soc 15-1252,29-1141]
// Site build: --out assets/data/us/oews --summary _data/us/oews_summary.json
//
// Source: https://download.bls.gov/pub/time.series/oe/  (oe.data.0.Current ≈ 330 MB, oe.area, oe.release).
// download.bls.gov asks automated clients to identify themselves, so requests send a User-Agent with a
// contact address (set BLS_CONTACT=<email>). Without --data the data file is streamed, never stored.
//
// Output (default --out = a scratch folder; Phase 10 points it at assets/data/us/oews):
//   <out>/<soc>.json      national + every state + every metro/nonmetro area published for that SOC:
//                         emp (01), mean (04), p10/p25/median/p75/p90 annual (11–15)
//   --summary <file>      per SOC: national figures, top 5 states by jobs, top 5 states and metros by median
//                         (areas with >= RANK_MIN_EMP jobs), top 5 metros by jobs — for Liquid/HTML
//                         (default <out>/_summary.json; the site uses _data/us/oews_summary.json)
//   <out>/_meta.json      release name, area count, SOCs with no OEWS series (e.g. broad groups)
// Rules: values are copied, never computed or rounded. BLS footnote 5 (wage ≥ $239,200/yr, shown by
// BLS as a cap) is kept as { value, cap: true }; footnote 8 / "-" (not released) is omitted.
// SOC list default: every `soc:` code in _data/us/occupations.yml (top-level lists and sub_pay rows).
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const BASE = 'https://download.bls.gov/pub/time.series/oe/';
const UA = { 'User-Agent': `Margdarshan data refresh (${process.env.BLS_CONTACT || 'see emargdarshan.com/contact.html'})` };
const out = path.resolve(arg('--out') || 'oews-out');
const summaryFile = path.resolve(arg('--summary') || path.join(out, '_summary.json'));
const RANK_MIN_EMP = 500; // highest-pay rankings only include areas with at least this many jobs
const DT = { '01': 'emp', '04': 'mean', '11': 'p10', '12': 'p25', '13': 'median', '14': 'p75', '15': 'p90' };

let socs = arg('--soc')?.split(',');
if (!socs) {
  const y = fs.readFileSync(path.join(root, '_data/us/occupations.yml'), 'utf8');
  const found = [];
  for (const m of y.matchAll(/\bsoc:\s*(\[[^\]]*\]|"[^"]*")/g)) found.push(...m[1].match(/\d{2}-\d{4}/g));
  socs = [...new Set(found)];
}
const want = new Set(socs.map((s) => s.replace('-', '')));

const text = async (f) => { const r = await fetch(BASE + f, { headers: UA }); if (!r.ok) throw new Error(f + ' HTTP ' + r.status); return r.text(); };
const tsv = (t) => { const [h, ...rows] = t.trim().split(/\r?\n/); const k = h.split('\t').map((x) => x.trim()); return rows.map((r) => Object.fromEntries(r.split('\t').map((v, i) => [k[i], v.trim()]))); };
const release = tsv(await text('oe.release'))[0];
const areas = Object.fromEntries(tsv(await text('oe.area')).map((a) => [a.area_code, a]));

const input = arg('--data')
  ? fs.createReadStream(arg('--data'))
  : Readable.fromWeb((await fetch(BASE + 'oe.data.0.Current', { headers: UA })).body);
const rl = readline.createInterface({ input, crlfDelay: Infinity });

// series_id = OEU + areatype(1) + area(7) + industry(6) + occupation(6) + datatype(2)
const db = {}; let lines = 0, kept = 0;
for await (const line of rl) {
  if (++lines === 1) continue;
  const [sid, year, period, value, foot] = line.split('\t').map((x) => x.trim());
  if (period !== 'A01') continue;
  const occ = sid.slice(17, 23), dt = sid.slice(23, 25);
  if (!want.has(occ) || !DT[dt] || sid.slice(11, 17) !== '000000') continue;
  if (!value || value === '-' || /\b8\b/.test(foot || '')) continue;
  const at = sid[3], area = sid.slice(4, 11);
  const o = (db[occ] ||= { N: {}, S: {}, M: {} });
  const rec = (o[at][area] ||= {});
  rec[DT[dt]] = /\b5\b/.test(foot || '') ? { value: +value, cap: true } : +value;
  rec._year = year; kept++;
}

fs.mkdirSync(out, { recursive: true });
const num = (v) => (typeof v === 'object' ? v.value : v) || 0;
const summary = {}, missing = [];
for (const s of socs) {
  const o = db[s.replace('-', '')];
  if (!o || !o.N['0000000']) { missing.push(s); continue; }
  const clean = (r) => { const { _year, ...v } = r; return v; };
  const states = Object.fromEntries(Object.entries(o.S).map(([a, r]) => [areas[a]?.area_name || a, clean(r)]));
  const metros = Object.fromEntries(Object.entries(o.M).map(([a, r]) => [a, { name: areas[a]?.area_name || a, ...clean(r) }]));
  const file = { soc: s, period: release.description, source: 'BLS Occupational Employment and Wage Statistics', source_url: 'https://www.bls.gov/oes/', national: clean(o.N['0000000']), states, metros };
  fs.writeFileSync(path.join(out, s + '.json'), JSON.stringify(file));
  const top = Object.entries(states).sort((a, b) => num(b[1].emp) - num(a[1].emp)).slice(0, 5).map(([state, r]) => ({ state, ...r }));
  // Rankings (orderings of published values, nothing computed). Highest-pay lists only include areas with
  // at least RANK_MIN_EMP jobs and a published median, so a handful of jobs cannot top the list.
  const ranked = (list) => list.filter((x) => x.median && num(x.emp) >= RANK_MIN_EMP).sort((a, b) => num(b.median) - num(a.median)).slice(0, 5);
  const stateList = Object.entries(states).map(([name, r]) => ({ name, ...r }));
  const metroList = Object.values(metros);
  summary[s] = {
    national: file.national, top_states: top,
    top_pay_states: ranked(stateList).map(({ name, emp, median, mean }) => ({ name, emp, median, mean })),
    top_pay_metros: ranked(metroList).map(({ name, emp, median, mean }) => ({ name, emp, median, mean })),
    top_emp_metros: metroList.filter((x) => x.emp).sort((a, b) => num(b.emp) - num(a.emp)).slice(0, 5).map(({ name, emp, median, mean }) => ({ name, emp, median, mean })),
    states_reported: Object.keys(states).length, metros_reported: Object.keys(metros).length,
  };
}
fs.writeFileSync(summaryFile, JSON.stringify({ period: release.description, source: 'BLS Occupational Employment and Wage Statistics', rank_min_emp: RANK_MIN_EMP, socs: summary }, null, 1));
fs.writeFileSync(path.join(out, '_meta.json'), JSON.stringify({ release: release.description, release_code: release.release_date, built: new Date().toISOString().slice(0, 10), socs: socs.length, written: Object.keys(summary).length, missing, lines, kept }, null, 1));
console.log(`${release.description}: scanned ${lines} lines, kept ${kept} values, wrote ${Object.keys(summary).length} SOC files to ${out}`);
if (missing.length) console.log('no national OEWS series (broad group or not published):', missing.join(', '));
