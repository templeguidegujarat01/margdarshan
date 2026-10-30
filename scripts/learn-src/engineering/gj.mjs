// Gujarat: ACPC "Provisional GUJCET (Home State) Seat Matrix for Bachelor of Engineering 2026-27" (21.06.2026).
// Each institute block prints name, address, contact, website and its courses + intake, under the
// "Government and Grant in Aid" or "Self Financed" heading. Needs pdftotext. node scripts/learn-src/engineering/gj.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { UA, tidy, city, branches, findPlace, save } from './_lib.mjs';

const SRC = 'https://acpc.gujarat.gov.in/assets/uploads/media-uploader/21062026-provisional-gujcet-home-state-seat-matrix-2026-27-nba-update1782210477.pdf';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'acpc-'));
const pdf = path.join(tmp, 'sm.pdf');
const r = await fetch(SRC, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(120000) });
if (!r.ok) throw new Error(r.status);
fs.writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
execFileSync('pdftotext', ['-layout', pdf, pdf + '.txt']);
const lines = fs.readFileSync(pdf + '.txt', 'utf8').split(/\r?\n/);

const PLACES = ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Baroda', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Vallabh Vidyanagar', 'Mehsana', 'Mahesana',
  'Patan', 'Palanpur', 'Bharuch', 'Ankleshwar', 'Navsari', 'Valsad', 'Vapi', 'Bhuj', 'Dahod', 'Godhra', 'Himmatnagar', 'Modasa', 'Morbi', 'Porbandar', 'Amreli', 'Surendranagar',
  'Nadiad', 'Kalol', 'Botad', 'Veraval', 'Rajpipla', 'Bardoli', 'Vyara', 'Visnagar', 'Kheda', 'Petlad', 'Halol', 'Waghodia', 'Gondal', 'Upleta', 'Dhoraji', 'Keshod', 'Deesa',
  'Unjha', 'Kadi', 'Changa', 'Jetpur', 'Savarkundla', 'Wadhwan', 'Limbdi', 'Dharmaj', 'Khambhat', 'Vasad', 'Mandvi', 'Anjar', 'Gandhidham', 'Himatnagar', 'Bodeli', 'Chhota Udepur',
  'Lunawada', 'Bayad', 'Idar', 'Vijapur', 'Becharaji', 'Kosamba', 'Kim', 'Olpad', 'Bilimora', 'Chikhli', 'Dhandhuka', 'Bavla', 'Sanand', 'Mehmedabad', 'Kapadvanj', 'Thasra', 'Dholka', 'Sidhpur', 'Radhanpur', 'Karamsad', 'Shahera', 'Mahuva', 'Chandkheda', 'Vidyanagar', 'Nadiad', 'Vasna', 'Bakrol', 'Ognaj', 'Gota', 'Dhanera', 'Vaghodia', 'Sankarda', 'Por', 'Varnama', 'Limda', 'Piparia'];
const ALIAS = { Baroda: 'Vadodara', Mahesana: 'Mehsana', Himatnagar: 'Himmatnagar', 'Vallabh Vidyanagar': 'Anand', Karamsad: 'Anand', Vidyanagar: 'Anand', Bakrol: 'Anand', Chandkheda: 'Ahmedabad', Vasna: 'Ahmedabad', Ognaj: 'Ahmedabad', Gota: 'Ahmedabad', Vaghodia: 'Vadodara', Waghodia: 'Vadodara', Sankarda: 'Vadodara', Por: 'Vadodara', Varnama: 'Vadodara', Limda: 'Vadodara', Piparia: 'Vadodara' };

const blocks = [];
let section = 'gov', cur = null;
for (const l of lines) {
  if (/^\s*Government and Grant in Aid Institutes/i.test(l)) section = 'gov';
  else if (/^\s*Government Autonom/i.test(l)) section = 'auto';
  else if (/^\s*Other Institutes/i.test(l)) section = 'sfi'; // self-financed colleges and private universities
  const m = l.slice(0, 61).trimEnd().match(/^\s{0,4}(\d{1,3}) (\S.{3,})$/);
  if (m && !/^\s*\d+\s+\d/.test(l)) { cur = { sr: +m[1], name: m[2].trim(), section, left: [], courses: [] }; blocks.push(cur); continue; }
  if (!cur) continue;
  // Left column = name / address (to col 61); the AICTE "Yes/No" flag and course name follow.
  cur.left.push(l.slice(0, 61).replace(/\s+(Yes|Ye|Y|No|N)$/, '').trim());
  const c = l.slice(61, 100).replace(/^\s*(Yes|No)?\s+/, '').replace(/\s{2,}.*$/, '').trim();
  if (c && !/^Total$/.test(c)) cur.courses.push(c);
}
const rows = blocks.map((b) => {
  const left = b.left.filter(Boolean);
  let name = b.name.replace(/\s+(Yes|Ye|Y|No|N)(\s+[A-Z]+)?$/, '');
  // A long name wraps onto the first address line ("Vishwakarma Government Engineering College, / Chandkheda").
  if (/[,&(]$|\b(of|and|for)$/i.test(name) && left[0] && !/^(Contact|Email|Website)/i.test(left[0])) name = (name + ' ' + left.shift()).replace(/\s+(Yes|Ye|Y|No|N)(\s+[A-Z]+)?$/, '');
  const wi = left.findIndex((x) => /^Website:/i.test(x));
  let web = wi < 0 ? '' : left[wi].replace(/^Website:\s*/i, '').trim().split(/\s+/)[0];
  // A long URL wraps: "…/centres/cipet-" + "ahmedabad/introduction.php" on the next line.
  if (web && /[-/]$/.test(web) && /^\S+$/.test(left[wi + 1] || '')) web += left.splice(wi + 1, 1)[0];
  const addr = left.filter((x) => !/^(Contact|Email|Website|Ph|Phone)/i.test(x)).join(' ').replace(/\s+/g, ' ').trim();
  const gov = /government|govt|central institute of petrochemicals/i.test(name); // CIPET: Government of India
  return {
    sr: b.sr, name: tidy(name).replace(/[,\s]+$/, ''), address: tidy(addr), city: city(findPlace(PLACES, ALIAS, name, addr)),
    ownership: gov || b.section === 'auto' ? 'Government' : b.section === 'sfi' || /\(sfi\)/i.test(name) ? 'Private' : 'Grant-in-Aid',
    branches: branches([b.courses.join(' ')]),
    url: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(web) ? (/^https?:/.test(web) ? web : 'https://' + web) : SRC,
    has_site: !!web,
  };
});
save('gj', { source: 'acpc', as_of: '2026-27', fetched: new Date().toISOString().slice(0, 10) }, rows);
