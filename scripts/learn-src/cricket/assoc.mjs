// Cricket finder: the official cricket pathway places, read from the state associations' own websites into
// scripts/learn-src/cricket/data/assoc.json.   node --use-system-ca scripts/learn-src/cricket/assoc.mjs
// Pages are cached in cricket/data/raw/ (delete a file there to refetch it).
//   Bihar CA     biharcricketassociation.com/districts — 38 district associations with address
//   Gujarat CA   gujaratcricketassociation.com/about-gca/associated-districts/<d>/ — location + address
//   Kerala CA    keralacricketassociation.com/district-associations — the 14 district associations
//   TNCA         tnca.in reads ./assets/js/district-associate.json — 37 district associations (no address)
//   CAB          cricketassociationofbengal.com/affiliated_clubs.php (first-division clubs) + Districts.php
//   Mumbai CA    mumbaicricket.com is an Angular app; the "Ordinary Maidan" club list ships inside its lazy chunk
//                (runtime.*.js maps chunk 529 → 529.<hash>.js, array of 211 names before app-ordinary-maidan)
//   MPCA         mpcaonline.com/page/mpca-academy (Sanjay Jagdale Cricket Academy, Holkar Stadium)
//   HCA          hycricket.org press release 10-10-2026: regional coaching camps at Karimnagar and Mahabubnagar
//   HPCA         hpcricket.org home: academy + sub-centres named in its own gallery posts
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(here, 'data', 'raw');
fs.mkdirSync(RAW, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, file) {
  const f = path.join(RAW, file);
  if (fs.existsSync(f)) return fs.readFileSync(f, file.endsWith('.pdf') ? null : 'utf8');
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  const b = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(f, b);
  await sleep(400);
  return file.endsWith('.pdf') ? b : b.toString('utf8');
}
const lines = (h) => String(h).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '')
  .replace(/<(br|\/p|\/tr|\/li|\/h\d|\/div|\/td|\/th)[^>]*>/gi, '\n').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#039;|&#39;|&rsquo;|&lsquo;/g, "'").replace(/&ndash;|&#8211;/g, '-')
  .split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
const SMALL = new Set(['of', 'and', 'for', 'in', 'the', 'at', 'on', '&']);
const title = (s) => (s !== s.toUpperCase() ? s : s.toLowerCase().split(' ')
  .map((w, i) => (i && SMALL.has(w) ? w : w.replace(/(^|[-(./])([a-z])/g, (m, a, b) => a + b.toUpperCase()))).join(' '))
  .replace(/\b(Cc|Sc|Ac|Bnr|Cab|Rc|Mcc|Ymca|Bsf|Crpf|Eb|Ner|Ser)\b/g, (w) => w.toUpperCase());

const rows = [];
const add = (r) => rows.push(r);

// ---- Bihar: one block per district: "<District>" "<Name> District Cricket Association" … ": <address>"
{
  const url = 'https://biharcricketassociation.com/districts';
  const L = lines(await get(url, 'bihar-districts.html'));
  for (let i = 0; i < L.length; i++) {
    const m = L[i].match(/^(.+?) District Cricket Association$/);
    if (!m || L[i - 1] !== m[1]) continue;
    let address = '';
    for (let j = i + 1; j < Math.min(i + 20, L.length); j++) {
      if (/District Cricket Association$/.test(L[j])) break;
      if (/^: /.test(L[j]) && !/@/.test(L[j])) { address = L[j].slice(2).trim(); break; }
    }
    const clubs = (L[i + 2] || '').match(/^\d+$/) ? +L[i + 2] : null;
    add({ assoc: 'BCA', type: 'District association', name: L[i], state: 'bihar', city: m[1], address, clubs, url, source: 'bca' });
  }
}

// ---- Gujarat: district pages linked from any district page
{
  const base = 'https://gujaratcricketassociation.com/about-gca/associated-districts/';
  const first = await get(base + 'anand/', 'gca-anand.html');
  const slugs = [...new Set([...first.matchAll(/associated-districts\/([a-z-]+)\//g)].map((m) => m[1]))];
  for (const s of slugs) {
    const url = `${base}${s}/`;
    const L = lines(await get(url, `gca-${s}.html`));
    const n = L.findIndex((l) => /^Year of Inception/.test(l));
    if (n < 1) continue;
    const name = L[n - 1];
    const loc = (L.find((l) => /^Location /.test(l)) || '').replace(/^Location /, '');
    const address = (L.find((l) => /^Address /.test(l)) || '').replace(/^Address /, '');
    const about = L.slice(n).find((l) => /coaching|camp/i.test(l) && l.length > 60) || '';
    add({ assoc: 'GCA', type: 'District association', name, state: /daman|dadra/i.test(s) ? 'dnh-dd' : 'gujarat', city: loc || name.replace(/ District.*$/, ''), address, about, url, source: 'gca' });
  }
}

// ---- Kerala: the page lists each district's secretary/members as "<Name>" "Secretary" "<District>"
{
  const url = 'https://www.keralacricketassociation.com/district-associations';
  const L = lines(await get(url, 'kca-districts.html'));
  const seen = new Set();
  for (let i = 1; i < L.length - 1; i++) {
    if (L[i] !== 'Secretary') continue;
    const d = L[i + 1];
    if (!/^[A-Z][a-z]+$/.test(d) || seen.has(d)) continue;
    seen.add(d);
    add({ assoc: 'KCA', type: 'District association', name: `${d} District Cricket Association`, state: 'kerala', city: d, address: '', url, source: 'kca' });
  }
}

// ---- Tamil Nadu: TNCA's own district list (JSON the site loads)
{
  const url = 'https://www.tnca.in/assets/js/district-associate.json';
  const d = JSON.parse(await get(url, 'tnca-districts.json'));
  for (const a of d.AssociationList) {
    const name = a.AssociationName.trim();
    const city = name.replace(/^(The )?District Cricket Association,? (of )?/i, '').replace(/ District Cricket (and Sports )?Association.*$/i, '')
      .replace(/ Cricket Association.*$/i, '').replace(/^[–-]\s*|^The /, '').replace(/^Tiruchirapalli$/, 'Tiruchirappalli').trim();
    add({ assoc: 'TNCA', type: 'District association', name, state: 'tamil-nadu', city, address: '', url: 'https://www.tnca.in/district-associations', source: 'tnca' });
  }
}

// ---- Bengal: first-division clubs + district units
{
  const club = 'https://www.cricketassociationofbengal.com/affiliated_clubs.php';
  const dist = 'https://www.cricketassociationofbengal.com/Districts.php';
  const pick = (L) => { const out = []; const s = L.findIndex((l) => l === 'Name of the Team'); for (let i = s + 1; i < L.length - 1; i++) if (/^\d+$/.test(L[i]) && +L[i] === out.length + 1) out.push(L[i + 1]); return out; };
  for (const n of pick(lines(await get(club, 'cab-clubs.html')))) add({ assoc: 'CAB', type: 'Cricket club', name: title(n), state: 'west-bengal', city: 'Kolkata', address: '', url: club, source: 'cab' });
  for (const n of pick(lines(await get(dist, 'cab-districts.html')))) {
    const nm = title(n).replace(/Dis Trict/, 'District').replace(/Asson$/, 'Association').replace(/Jaipaiguri/, 'Jalpaiguri');
    const city = nm.replace(/^24 Pgs\., District Sports Association \(South\)$/, 'South 24 Parganas').replace(/^North 24 Pgs\..*/, 'North 24 Parganas')
      .replace(/ (District|Dist\.|Mahakuma|Sporting|Sports).*$/, '').replace(/^Manbhum$/, 'Purulia').replace(/^Midnapore$/, 'Medinipur').replace(/^Burdwan$/, 'Bardhaman').replace(/^Chandernagore$/, 'Chandannagar');
    add({ assoc: 'CAB', type: 'District association', name: nm, state: 'west-bengal', city, address: '', url: dist, source: 'cab' });
  }
}

// ---- Mumbai: ordinary maidan clubs from the site's own bundle
{
  const site = 'https://www.mumbaicricket.com/';
  const home = await get(site, 'mca-home.html');
  const rt = home.match(/runtime\.[a-f0-9]+\.js/)[0];
  const hash = (await get(site + rt, 'mca-runtime.js')).match(/529:"([a-f0-9]+)"/)[1];
  const chunk = await get(`${site}529.${hash}.js`, 'mca-529.js');
  const arrays = [...chunk.matchAll(/this\.club=(\[[^\]]*\])/g)].map((m) => JSON.parse(m[1]));
  const maidan = arrays.find((a) => a.length > 150 && a.length < 300);
  for (const n of maidan) add({ assoc: 'MCA', type: 'Cricket club', name: n.trim(), state: 'maharashtra', city: 'Mumbai', address: '', url: `${site}ordinary-maidan`, source: 'mca' });
}

// ---- Association academies and camps named on their own pages
{
  const mp = 'https://www.mpcaonline.com/page/mpca-academy';
  const L = lines(await get(mp, 'mpca-academy.html'));
  if (L.some((l) => /Sanjay Jagdale Cricket Academy/.test(l))) add({ assoc: 'MPCA', type: 'Association academy', name: 'Sanjay Jagdale Cricket Academy (MPCA)', state: 'madhya-pradesh', city: 'Indore', address: 'Holkar Stadium, Race Course Road, Indore - 452003', about: "MPCA's academy at Holkar Stadium since 2008: indoor unit with three synthetic pitches, gym, video analysis and a hostel for players in the continuous training scheme. It trains the players picked for MP's probables pools.", url: mp, source: 'mpca' });
  const reg = 'https://www.mpcaonline.com/page/regional-academy';
  if (lines(await get(reg, 'mpca-regional.html')).some((l) => /concept of the Regional Academy/.test(l))) add({ assoc: 'MPCA', type: 'Association academy', name: 'MPCA Regional Academy camps', state: 'madhya-pradesh', city: 'Indore', address: '', about: 'MPCA holds Regional Academy camps at convenient places for players coming up from the districts; MPCA pays for coaches, stay, food and travel of the trainees.', url: reg, source: 'mpca' });

  const hca = 'https://www.hycricket.org/data-2026-27/press-2026-27/27-press-district-coaching_camps-10-10-2026.pdf';
  const pdf = path.join(RAW, 'hca-camps.pdf');
  await get(hca, 'hca-camps.pdf');
  const t = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' });
  for (const [city, hub, partner] of [['Karimnagar', 'North Telangana Hub', 'Karimnagar District Cricket Association'], ['Mahabubnagar', 'South Telangana Hub', 'Mahabubnagar District Cricket Association']]) {
    if (!t.includes(hub)) continue;
    add({ assoc: 'HCA', type: 'Association academy', name: `HCA Regional Cricket Coaching Camp, ${city}`, state: 'telangana', city, address: '', about: `Year-round HCA camp with the ${partner} (${hub}), announced 10 October 2026: men's and women's cricket, all age groups, with fitness, physio and video analysis.`, url: hca, source: 'hca' });
  }

  const hp = 'https://www.hpcricket.org/';
  const H = await get(hp, 'hpca-home.html');
  for (const [re, name, city] of [[/Jogindernagar Sub-Centre, Mandi/, 'HPCA Sub-Centre, Jogindernagar', 'Mandi'], [/New Sub Centre Tissa/, 'HPCA Sub-Centre, Tissa', 'Chamba'], [/Sub Centre Sarash/, 'HPCA Sub-Centre, Sarash (Lahaul & Spiti)', 'Kullu']]) {
    if (re.test(H)) add({ assoc: 'HPCA', type: 'Association academy', name, state: 'himachal-pradesh', city, address: '', about: 'Training sub-centre of the Himachal Pradesh Cricket Association, named in HPCA\'s own photo posts.', url: hp, source: 'hpca' });
  }
}

const out = path.join(here, 'data', 'assoc.json');
fs.writeFileSync(out, JSON.stringify({ checked: '2026-10-30', n: rows.length, rows }) + '\n');
const by = {}; for (const r of rows) by[`${r.assoc} ${r.type}`] = (by[`${r.assoc} ${r.type}`] || 0) + 1;
console.log(`cricket assoc: ${rows.length} rows`, by);
