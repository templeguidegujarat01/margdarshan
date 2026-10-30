// Kerala: KEAM 2026 prospectus (CEE Kerala), Annexure II (1)(a) "Colleges under Engineering / Architecture courses":
// code, college, university, courses + seats, grouped by management (Government, Aided, university colleges,
// Government cost-sharing colleges under IHRD / LBS / CAPE / KSRTC…, private self-financing). Read with
// `pdftotext -raw` (the layout mode interleaves the columns). node scripts/learn-src/engineering/kl.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { UA, tidy, city, save } from './_lib.mjs';

const SRC = 'https://cee.kerala.gov.in/keam2026/pdf/Prospectus.pdf';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'keam-'));
const pdf = path.join(tmp, 'p.pdf');
const r = await fetch(SRC, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(180000) });
if (!r.ok) throw new Error(r.status);
fs.writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
execFileSync('pdftotext', ['-raw', pdf, pdf + '.txt']);
const all = fs.readFileSync(pdf + '.txt', 'utf8').split(/\r?\n/);
const start = all.findIndex((l) => /ANNEXURE - II \(1\) \(a\)/.test(l));
const end = all.findIndex((l, i) => i > start && /ANNEXURE - II \(1\) \(b\)/.test(l));
const lines = all.slice(start, end);

// Management heading → site ownership. University colleges and the "Government cost-sharing" colleges run by
// state agencies (IHRD, LBS, CAPE, KSRTC, CCEK …) are state-run: Government. Only section XIII is private.
const own = (h) => /PRIVATE SELF FINANCING/i.test(h) ? 'Private' : /^Aided/i.test(h) ? 'Grant-in-Aid' : 'Government';
// A university column cell on its own line ("KTU"); district names like "Kannur" are part of the college name.
const UNI = /^(KTU|KAU|KVASU|KUFOS|CUSAT|KU|CU|MGU|APJAKTU)$|^\S*\s*University( of \w+)?$/;
const DIST = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod', 'Kasargod', 'Kasargode', 'Trivandrum', 'Quilon', 'Alleppey', 'Cochin', 'Kochi', 'Trichur', 'Calicut', 'Palghat', 'Tvpm', 'Kozhikkode'];
const DALIAS = { Trivandrum: 'Thiruvananthapuram', Quilon: 'Kollam', Alleppey: 'Alappuzha', Cochin: 'Kochi', Trichur: 'Thrissur', Calicut: 'Kozhikode', Palghat: 'Palakkad', Kasargod: 'Kasaragod', Kasargode: 'Kasaragod', Tvpm: 'Thiruvananthapuram', Kozhikkode: 'Kozhikode' };

let head = 'Government', cur = null;
const out = [];
for (const raw of lines) {
  const l = raw.trim();
  if (/^(Government|Aided|Aided Autonomous)$/.test(l) || /^[IVX]+\.\s/.test(l)) { head = l; cur = null; continue; }
  const m = l.match(/^(\d+)\.? ([A-Z]{3})(?: (.+))?$/);
  if (m) { cur = { code: m[2], name: [], own: own(head), section: head, done: false, courses: '' }; out.push(cur); if (m[3]) feed(m[3]); continue; }
  if (cur) feed(l);
}
function feed(l) {
  if (!cur.done) {
    if (UNI.test(l)) { cur.done = true; cur.univ = l; return; }
    // Some rows print name, university, courses and phone on one line: "College of Engineering, Poonjar, Kottayam KTU CS- 90, EC-30 120 04822".
    const inline = l.match(/^(.*?)\s?\b(KTU|KAU|KVASU|KUFOS|CUSAT) ([A-Z]{2} ?-.*)$/);
    if (inline) { if (inline[1]) cur.name.push(inline[1]); cur.done = true; cur.univ = inline[2]; cur.courses += inline[3]; return; }
    if (/^[A-Z]{2} ?-/.test(l)) { cur.done = true; cur.courses += l; return; }
    cur.name.push(l);
  } else if (/^[A-Z]{2} ?- ?\d/.test(l) || /^(\d+, )?[A-Z]{2} ?-/.test(l)) cur.courses += ' ' + l;
}
// KEAM course codes (Annexure II (1)(b)) → finder branches; any other code counts as "Other branches".
const CODE = { CS: 'Computer Science', IT: 'Computer Science', AD: 'Computer Science', AI: 'Computer Science', AM: 'Computer Science', CY: 'Computer Science', CD: 'Computer Science', CB: 'Computer Science', CC: 'Computer Science', CM: 'Computer Science', CN: 'Computer Science',
  EC: 'Electronics', AE: 'Electronics', EI: 'Electronics', IC: 'Electronics', EL: 'Electronics', EE: 'Electrical', ME: 'Mechanical', AU: 'Mechanical', MR: 'Mechanical', PE: 'Mechanical', MP: 'Mechanical', IE: 'Mechanical',
  CE: 'Civil', CV: 'Civil', RA: 'Robotics & Automation', AO: 'Aerospace', AN: 'Aerospace', CH: 'Chemical', PO: 'Chemical', FT: 'Chemical', BT: 'Biotech', BM: 'Biotech' };
const brOf = (s) => [...new Set((s.match(/\b[A-Z]{2}(?= ?-)/g) || []).map((k) => CODE[k] || 'Other branches'))];
const rows = out.filter((c) => c.name.length && !/archite|planning|institute of design|environmental design/i.test(c.name.join(' '))).map((c) => {
  const name = tidy(c.name.join(' ').replace(/\s*-\s*\d{3}\s?\d{3}\s*$/, '').replace(/\s+/g, ' '));
  const parts = name.split(/\s*,\s*/);
  let dist = '';
  for (const p of [...parts].reverse()) { const d = DIST.find((x) => new RegExp('\\b' + x + '\\b', 'i').test(p)); if (d) { dist = DALIAS[d] || d; break; } }
  return {
    code: c.code, name, city: city(dist || parts[parts.length - 1]), ownership: c.own, section: c.section.replace(/\s+/g, ' '),
    university: c.univ, branches: brOf(c.courses), url: 'https://cee.kerala.gov.in/keam2026',
  };
});
save('kl', { source: 'keam', as_of: '2026-27', fetched: new Date().toISOString().slice(0, 10) }, rows);
