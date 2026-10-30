// Karnataka: KEA UGCET 2026 engineering cut-off PDFs (round 2: rest of Karnataka, Hyderabad-Karnataka, special).
// Together they print every college KEA allotted engineering seats in, with code, name, address and branches.
// The seat-matrix and fee-breakup PDFs are scans (no text), so they are not used. Needs pdftotext (poppler).
// node scripts/learn-src/engineering/ka.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { UA, tidy, city, branches, save } from './_lib.mjs';

const BASE = 'https://cetonline.karnataka.gov.in/keawebentry456/ugcet2026/';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kea-'));
const cols = new Map();
for (const f of ['R_E', 'H_E', 'SPL_E']) {
  const r = await fetch(BASE + f + '.pdf', { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(120000) });
  if (!r.ok) throw new Error(`${r.status} ${f}`);
  const pdf = path.join(tmp, f + '.pdf');
  fs.writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
  execFileSync('pdftotext', ['-layout', pdf, pdf + '.txt']);
  let cur = null;
  for (const line of fs.readFileSync(pdf + '.txt', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^College: (E\d{3}) (.+)$/);
    if (m) {
      const raw = m[2].replace(/\s{3,}\S*\s*$/, '').trim();
      cur = cols.get(m[1]) || { code: m[1], raw, course: '' };
      cols.set(m[1], cur);
      continue;
    }
    if (cur && /^[A-Z&(]/.test(line) && !/^(Course Name|Seat Type|College:)/.test(line)) cur.course += ' ' + line.slice(0, 16).trim();
  }
}

// "B M S College of Engineering, Basavanagudi, Bangalore (AUTONOMOUS) POST BOX NO 1908, BULL TEMPLE ROAD,BANGALORE":
// older rows end the name at the last mixed-case word (the address is in capitals). Newer rows print the address
// in mixed case too, so the name then stops at the institution word ("… University", "… Institute of Technology").
const AUTO = /^\(?(AUTONOMOUS|DEEMED[^)]*)\)?$/i;
const END = /^(.*?\b(?:University|College of Engineering(?: (?:&|and) (?:Technology|Management))?|Institute of Technology(?: (?:&|and) (?:Management|Research))?|Institute of Engineering(?: (?:&|and) Technology)?|Intitute of Engineering and Technology|Engineering Colleges?|School of Engineering|School of Technology|College of Engineering and Technology)\b(?:\s*\([^)]*\))?)/i;
function split(raw) {
  const w = raw.split(' ');
  let last = -1;
  w.forEach((x, i) => { if (/[a-z]/.test(x)) last = i; });
  let n = last + 1;
  while (w[n] && AUTO.test(w[n])) n++;
  let name = w.slice(0, n).join(' ');
  const m = raw.match(END);
  if (m && (!name || /\d|#|Hobli|Village|Road|Post|Taluk|Campus|Street|Karnataka/i.test(name.slice(m[1].length)))) name = m[1];
  if (!name) name = raw.split(',')[0];
  return name.trim();
}
// District headquarters and engineering towns, so the city is read from the register text, never guessed.
const PLACES = ['Bengaluru Rural', 'Bengaluru', 'Bangalore', 'Bangaluru', 'Kolar Gold Fields', 'KGF', 'Mysuru', 'Mysore', 'Mangaluru', 'Mangalore',
  'Moodabidre', 'Moodbidri', 'Mukka', 'Puttur', 'Sullia', 'Bantwal', 'Udupi', 'Manipal', 'Karkala', 'Kundapura', 'Belagavi', 'Belgaum', 'Nidasoshi',
  'Gokak', 'Chikodi', 'Hubballi', 'Hubli', 'Dharwad', 'Kalaburagi', 'Gulbarga', 'Kalburgi', 'Vijayapura', 'Bijapur', 'Bagalkote', 'Bagalkot', 'Bidar',
  'Bhalki', 'Basavakalyan', 'Raichur', 'Koppal', 'Gangavathi', 'Ballari', 'Bellary', 'Hosapete', 'Hospet', 'Hoovina Hadagali', 'Siruguppa', 'Davanagere',
  'Davangere', 'Harihar', 'Chitradurga', 'Shivamogga', 'Shimoga', 'Bhadravathi', 'Chikkamagaluru', 'Chickamagalur', 'Chikmagalur', 'Hassan', 'Mandya',
  'Krishnarajpet', 'K R Pet', 'Maddur', 'Chamarajanagara', 'Kollegal', 'Tumakuru', 'Tumkur', 'Tiptur', 'Kunigal', 'Gubbi', 'Kolar', 'Chikkaballapur',
  'Chikballapur', 'Chintamani', 'Ramanagara', 'Ramanagar', 'Ramanagaram', 'Kanakapura', 'Haveri', 'Ranebennur', 'Gadag', 'Hulkoti', 'Karwar', 'Haliyal',
  'Bhatkal', 'Sirsi', 'Kushalanagar', 'Ponnampet', 'Madikeri', 'Yadgir', 'Yadigir', 'Doddaballapur', 'Doddaballapura', 'Devanahalli', 'Nelamangala',
  'Hoskote', 'Anekal', 'Chickkaballapur', 'Ujire', 'Begur', 'Nanjanagudu', 'Nanjangud', 'Yelahanka', 'Hesaraghatta', 'Electronic City', 'Sarjapur', 'Varthur', 'Hennur'];
const ALIAS = { Yelahanka: 'Bengaluru', Anekal: 'Bengaluru', Hesaraghatta: 'Bengaluru', 'Electronic City': 'Bengaluru', Sarjapur: 'Bengaluru', Varthur: 'Bengaluru', Hennur: 'Bengaluru', Begur: 'Bengaluru', Chickkaballapur: 'Chikkaballapur',
  KGF: 'Kolar Gold Fields', Mukka: 'Mangaluru', 'K R Pet': 'Krishnarajpet' };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function place(...texts) {
  for (const t of texts) {
    let best = null, at = -1;
    for (const p of PLACES) {
      const re = new RegExp('\\b' + esc(p) + '\\b', 'gi');
      for (const m of t.matchAll(re)) if (m.index + p.length > at) { at = m.index + p.length; best = p; }
    }
    if (best) return ALIAS[best] || best;
  }
  return '';
}
// Rows whose register text names no town at all: the town printed on the institute's own website.
const TOWN = { E063: 'Chitradurga', E300: 'Devanahalli' };
const rows = [...cols.values()].filter((c) => !/School of (Planning|Ac?hitecture)|College of Architecture/i.test(c.raw)).map((c) => {
  const name = split(c.raw);
  const clean = name.replace(/\s*\((AUTONOMOUS|A State Autonomous[^)]*)\)\s*/gi, ' ').replace(/\s+,/g, ',').replace(/[,\s]+$/, '').trim();
  return {
    code: c.code, name: tidy(clean), autonomous: /AUTONOMOUS/i.test(name), address: tidy(c.raw.slice(c.raw.indexOf(name) + name.length).replace(/^[,\s]+/, '')),
    city: city(TOWN[c.code] || place(clean, c.raw)),
    ...(/\b(govt|government|univ?e?r?sity of visvesvaraya|vtu constituent|constituent college of vtu|visvesvaraya technological university)\b/i.test(clean) ? { ownership: 'Government' } : {}),
    branches: branches([c.course]),
    url: 'https://cetonline.karnataka.gov.in/kea/ugcet2026',
  };
});
save('ka', { source: 'kea', as_of: '2026-27', fetched: new Date().toISOString().slice(0, 10) }, rows);
