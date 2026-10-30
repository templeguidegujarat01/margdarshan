// learn-src/cricket — listings for the cricket "where to learn" finder (learn/cricket.html).
//   VERIFY_DEPS=<deps> node scripts/learn-src/cricket.mjs
//
// Writes assets/data/learn/cricket.json, never by hand, from:
//   - scripts/learn-src/cricket/data/assoc.json (district associations, clubs, association academies), written by
//     scripts/learn-src/cricket/assoc.mjs from the state associations' own websites (rerun it to refresh).
//   - the state associations whose lists were read, and the two national high-performance places the cricket
//     page already cites (BCCI Centre of Excellence, MRF Pace Foundation).
// Cricket is not a Khelo India Centre or SAI discipline (checked: List_of_KICs_08_2026.pdf has no cricket), so the
// official route is BCCI → state association → district association / league club, and that is what is listed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const A = JSON.parse(fs.readFileSync(path.join(root, 'scripts/learn-src/cricket/data/assoc.json'), 'utf8'));
const CHECKED = A.checked;

// State associations (BCCI full members) whose lists are read below: HQ city and address from their own sites.
const ASSOC = {
  BCA: { name: 'Bihar Cricket Association', state: 'bihar', city: 'Patna', url: 'https://biharcricketassociation.com/' },
  GCA: { name: 'Gujarat Cricket Association', state: 'gujarat', city: 'Ahmedabad', address: 'Narendra Modi Stadium, Stadium Road, Motera, Sabarmati, Ahmedabad 380005', url: 'https://gujaratcricketassociation.com/' },
  KCA: { name: 'Kerala Cricket Association', state: 'kerala', city: 'Thiruvananthapuram', url: 'https://www.keralacricketassociation.com/' },
  TNCA: { name: 'Tamil Nadu Cricket Association', state: 'tamil-nadu', city: 'Chennai', url: 'https://www.tnca.in/' },
  CAB: { name: 'Cricket Association of Bengal', state: 'west-bengal', city: 'Kolkata', address: 'Eden Gardens, Kolkata 700001', url: 'https://www.cricketassociationofbengal.com/' },
  MCA: { name: 'Mumbai Cricket Association', state: 'maharashtra', city: 'Mumbai', url: 'https://www.mumbaicricket.com/' },
  MPCA: { name: 'Madhya Pradesh Cricket Association', state: 'madhya-pradesh', city: 'Indore', address: 'Holkar Stadium, Race Course Road, Indore - 452003', url: 'https://www.mpcaonline.com/' },
  HCA: { name: 'Hyderabad Cricket Association', state: 'telangana', city: 'Hyderabad', url: 'https://www.hycricket.org/' },
  HPCA: { name: 'Himachal Pradesh Cricket Association', state: 'himachal-pradesh', city: 'Dharamshala', url: 'https://www.hpcricket.org/' },
  MahCA: { name: 'Maharashtra Cricket Association', state: 'maharashtra', city: 'Pune', address: 'MCA International Stadium, Gahunje, Maval, Pune - 412101', url: 'https://cricketmaharashtra.com/' },
};
const SRC = { BCA: 'BCA district list', GCA: 'GCA district pages', KCA: 'KCA district list', TNCA: 'TNCA district list', CAB: 'CAB affiliated list', MCA: 'MCA club list', MPCA: 'MPCA academy page', HCA: 'HCA press release', HPCA: 'HPCA website' };

const rows = [
  {
    name: 'BCCI Centre of Excellence', type: 'High-performance centre', ownership: 'BCCI', state: 'karnataka', city: 'Bengaluru',
    about: "The BCCI's high-performance campus (the old National Cricket Academy): coaching, sports science, sports medicine, strength and conditioning, screening and rehab of contracted, targeted and age-group players. No open admission: players reach it through BCCI and state teams.",
    url: 'https://www.bcci.tv/news/article/how-the-bcci-centre-of-excellence-is-shaping-indias-high-performance-system', url_label: 'BCCI article', source: 'bcci-coe', src_label: 'BCCI', checked: CHECKED,
  },
  {
    name: 'MRF Pace Foundation', type: 'High-performance centre', ownership: 'Private', state: 'tamil-nadu', city: 'Chennai',
    about: "Fast-bowling academy set up in 1987. Its 2024 'Ace of Pace' trials in Kolkata, Mumbai, Delhi and Chennai saw 1,000+ bowlers; 3 were picked to train free.",
    url: 'https://www.mrftyres.com/news/more-than-1000-aspiring-bowlers-showcase-their-skill-in-the-inaugural-ace-of-pace-fast-bowler-hunt-by-the-mrf-pace-foundation', url_label: 'MRF news release', source: 'mrf-pace', src_label: 'MRF Tyres', checked: CHECKED,
  },
];
for (const [id, a] of Object.entries(ASSOC)) {
  rows.push({
    name: a.name, type: 'State association', ownership: 'Cricket association', state: a.state, city: a.city,
    about: [a.address, 'BCCI member for the state: runs the state camps, age-group trials and teams from U-16 (Vijay Merchant Trophy) to the Ranji Trophy, and lists its district units and clubs.'].filter(Boolean).join('. '),
    url: a.url, url_label: `${id === 'MahCA' ? 'MCA' : id} website`, source: `assoc-${id.toLowerCase()}`, src_label: `${id === 'MahCA' ? 'MCA' : id} website`, checked: CHECKED,
  });
}
const ABOUT = {
  'District association': (r) => [r.address, `District unit of the ${ASSOC[r.assoc].name}: runs the district league, coaching camps and the trials for district age-group teams (U-14 to U-23) that feed state selection.${r.clubs ? ` ${r.clubs} affiliated clubs.` : ''}`].filter(Boolean).join('. '),
  'Cricket club': (r) => r.assoc === 'MCA'
    ? "Ordinary maidan club of the Mumbai Cricket Association: one of the clubs that vote in the MCA and play its club cricket. Ask the club about nets and junior teams."
    : "First-division club of the Cricket Association of Bengal: plays CAB's first-division league in and around Kolkata. Ask the club about nets and junior teams.",
};
for (const r of A.rows) {
  rows.push({
    name: r.name, type: r.type, ownership: 'Cricket association', state: r.state, city: r.city,
    about: r.about ? [r.address, r.about].filter(Boolean).join('. ') : ABOUT[r.type](r),
    url: r.url, url_label: r.type === 'Cricket club' || r.type === 'District association' ? `${r.assoc} list` : 'Official page',
    source: r.source, src_label: SRC[r.assoc], checked: CHECKED,
  });
}
for (const r of rows) if (r.ownership === 'Cricket association' && r.type === 'Cricket club') r.ownership = 'Club';
const bad = rows.filter((r) => !r.state || !r.city || !r.url);
if (bad.length) throw new Error('rows missing state/city/url: ' + bad.map((r) => r.name).join(', '));
const dup = rows.filter((r, i) => rows.findIndex((x) => x.name === r.name && x.city === r.city) !== i);
if (dup.length) throw new Error('duplicate rows: ' + dup.map((r) => r.name).join(', '));
fs.writeFileSync(path.join(root, 'assets/data/learn/cricket.json'), JSON.stringify(rows) + '\n');
const n = {}; for (const r of rows) n[r.type] = (n[r.type] || 0) + 1;
console.log(`cricket: ${rows.length} listings`, n);
