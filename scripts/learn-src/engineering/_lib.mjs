// Shared helpers for the engineering finder's register fetchers (scripts/learn-src/engineering/<src>.mjs).
// Each fetcher reads one official register and writes scripts/learn-src/engineering/data/<src>.json
// (normalised rows); scripts/learn-src/engineering.mjs merges them into assets/data/learn/engineering.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const here = path.dirname(fileURLToPath(import.meta.url));
export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function get(url, opts = {}, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { ...opts, headers: { 'user-agent': UA, ...(opts.headers || {}) }, signal: AbortSignal.timeout(60000) });
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return await r.text();
    } catch (e) {
      if (i >= tries) throw e;
      await sleep(1500 * i);
    }
  }
}
// Run fn over items with a small worker pool (registers are government servers: be gentle).
export async function pool(items, n, fn) {
  const out = new Array(items.length); let k = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (k < items.length) { const i = k++; out[i] = await fn(items[i], i); } }));
  return out;
}
export const text = (h) => String(h).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&ndash;|&mdash;/g, '-')
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
// Title Case for names the registers print in CAPITALS (keeps short words and acronyms sensible).
const SMALL = new Set(['of', 'and', 'for', 'in', 'the', 'at', 'on', '&']);
export function tidy(s) {
  s = text(s).replace(/\s*,\s*/g, ', ').replace(/\s+\./g, '.');
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().split(' ').map((w, i) => (i && SMALL.has(w) ? w : w.replace(/(^|[-(./])([a-z])/g, (m, a, b) => a + b.toUpperCase())))
    .join(' ').replace(/\b(Iit|Nit|Iiit|Rv|Bms|Pes|Sri|Svs|Mvj|Jss|Kle|Sjb|Bnm|Rns|Ksit|Dsce|Cmr|Bgs|Sdm|Vtu|Jntu|Jntuh|Jntuk|Jntua|Aicte|Mgm|Ssn|Psg|Sns|Kpr|Kcg)\b/g, (w) => w.toUpperCase());
}
// Branch names → the finder's branch labels (the subjects this finder serves, then the rest).
const BR = [
  ['Computer Science', /computer|information tech|\bit\b|data sci|artificial|\bai\b|machine learn|cyber|software|cloud|internet of things|\biot\b|block ?chain|computing/i],
  ['Electronics', /electronic|telecom|communication|vlsi|instrumentation/i],
  ['Electrical', /electrical/i],
  ['Mechanical', /mechanical|production|manufactur|industrial|automobile|mechatronic/i],
  ['Civil', /civil|construction|structural|environmental eng/i],
  ['Aerospace', /aero|aeronaut|aerospace|avionic/i],
  ['Robotics & Automation', /robot|automation/i],
  ['Chemical', /chemical|petro|polymer|plastic|textile chem|oil|paint|food tech|biochem/i],
  ['Biotech', /bio ?tech|biomedical|bio-medical|genetic|bioinformatic/i],
];
export function branches(names) {
  const s = new Set();
  for (const n of names) { let hit = false; for (const [k, re] of BR) if (re.test(n)) { s.add(k); hit = true; } if (!hit && n) s.add('Other branches'); }
  return [...s];
}
export function save(src, meta, rows) {
  const f = path.join(here, 'data', `${src}.json`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify({ ...meta, n: rows.length, rows }, null, 0) + '\n');
  console.log(`${src}: ${rows.length} rows -> ${path.relative(process.cwd(), f)}`);
}
// Old / register spellings → the city names the site already uses.
export const CITY = {
  Bangalore: 'Bengaluru', 'Bangalore Urban': 'Bengaluru', 'Bangalore Rural': 'Bengaluru Rural', 'Bengaluru Urban': 'Bengaluru', Belgaum: 'Belagavi', Mysore: 'Mysuru', Shimoga: 'Shivamogga',
  Bijapur: 'Vijayapura', Gulbarga: 'Kalaburagi', Chickamagalur: 'Chikkamagaluru', Chikmagalur: 'Chikkamagaluru', Chikkamagalur: 'Chikkamagaluru',
  Tumkur: 'Tumakuru', Hubli: 'Hubballi', Mangalore: 'Mangaluru', Davangere: 'Davanagere', Bellary: 'Ballari', Hospet: 'Hosapete',
  Chickballapur: 'Chikkaballapur', Chikkaballapura: 'Chikkaballapur', Mandya: 'Mandya', Gadag: 'Gadag', Kgf: 'Kolar Gold Fields', Ramanagara: 'Ramanagara', Ramanagar: 'Ramanagara',
  'Mumbai City': 'Mumbai', 'Mumbai Suburban': 'Mumbai', Ahmednagar: 'Ahilyanagar', Aurangabad: 'Chhatrapati Sambhajinagar', Osmanabad: 'Dharashiv',
  Madras: 'Chennai', Trichy: 'Tiruchirappalli', Tiruchirapalli: 'Tiruchirappalli', Tuticorin: 'Thoothukudi', Kanyakumari: 'Kanniyakumari', Calcutta: 'Kolkata',
  Trivandrum: 'Thiruvananthapuram', Cochin: 'Kochi', Calicut: 'Kozhikode', Trichur: 'Thrissur', Vizag: 'Visakhapatnam', Gurgaon: 'Gurugram', Allahabad: 'Prayagraj', Baroda: 'Vadodara',
};
export const city = (s) => { s = tidy(String(s || '').replace(/\s*-?\s*\d{3}\s?\d{3}\.?$/, '').replace(/\bdist(rict)?\.?$/i, '').trim()); return CITY[s] || s; };
Object.assign(CITY, { Bangaluru: 'Bengaluru', Bagalkote: 'Bagalkot', Kalburgi: 'Kalaburagi', Chikballapur: 'Chikkaballapur', Ramanagaram: 'Ramanagara', Yadigir: 'Yadgir', Doddaballapur: 'Doddaballapura', Nanjangud: 'Nanjanagudu', Moodabidre: 'Moodbidri' });
// Find the town in free register text: of the known places, the one that ends last in the first text that names any.
const rx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function findPlace(places, alias, ...texts) {
  for (const t of texts) {
    let best = null, at = -1;
    for (const p of places) for (const m of String(t || '').matchAll(new RegExp('\\b' + rx(p) + '\\b', 'gi'))) if (m.index + p.length > at) { at = m.index + p.length; best = p; }
    if (best) return alias[best] || best;
  }
  return '';
}
