// Uttar Pradesh: UPTAC 2026 (AKTU counselling, uptac.samarth.edu.in). The institute search returns at most 30
// names per query, so every two-letter query is swept to collect the full list; each institute is then kept only
// if its cut-off matrix has B.Tech (parent programme 5) rows, whose branch names give the branches.
// node scripts/learn-src/engineering/up.mjs
import fs from 'node:fs';
import path from 'node:path';
import { here, get, pool, sleep, text, tidy, city, branches, save } from './_lib.mjs';

const BASE = 'https://uptac.samarth.edu.in/index.php/cut-off-matrix/';
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const qs = [...A].flatMap((a) => [...A].map((b) => a + b));
// The sweep is cached in data/up-ids.json (UPTAC answers 202 + empty body when asked too fast).
const IDS = path.join(here, 'data', 'up-ids.json');
const inst = new Map(fs.existsSync(IDS) ? JSON.parse(fs.readFileSync(IDS, 'utf8')) : []);
const slow = async (url) => {
  for (let i = 0; ; i++) {
    const t = await get(url).catch(() => '');
    if (t) return t;
    if (i > 6) throw new Error('UPTAC keeps answering empty: ' + url);
    await sleep(15000 * (i + 1));
  }
};
if (!inst.size) {
  await pool(qs, 2, async (q) => {
    for (const r of JSON.parse(await slow(`${BASE}institute-list?q=${q}`)).results) inst.set(r.id, r.text);
    await sleep(300);
  });
  fs.writeFileSync(IDS, JSON.stringify([...inst]) + '\n');
}
console.log('institutes in UPTAC search:', inst.size);
// District names in the register → the city people search for.
const UPCITY = { 'Gautam Buddh Nagar': 'Greater Noida', 'Gautam Buddha Nagar': 'Greater Noida', Bijnaur: 'Bijnor', 'J.P.Nagar': 'Amroha', Bulandshahar: 'Bulandshahr', Raibareilly: 'Raebareli', 'Etawah (CSAUAT)': 'Etawah' };
// Names that print no town: the town of the university's own campus.
const TOWN = { 2000025: 'Azamgarh', 2000127: 'Greater Noida' }; // Maharaja Suhel Dev State University; Lloyd IET (Knowledge Park II)
// B.Tech branches per institute, cached in data/up-branches.json (delete it to re-read the matrices).
const BRF = path.join(here, 'data', 'up-branches.json');
const brCache = fs.existsSync(BRF) ? JSON.parse(fs.readFileSync(BRF, 'utf8')) : {};
const rows = (await pool([...inst], 2, async ([id, label]) => {
  if (!brCache[id]) {
    const url = `${BASE}index?PrgAdmissionCutOffSeatsSearch%5Bou_id%5D=${id}&PrgAdmissionCutOffSeatsSearch%5Bparent_programme_id%5D=5&PrgAdmissionCutOffSeatsSearch%5Bcategory_id%5D=OPNO&per-page=500`;
    const h = await slow(url);
    await sleep(300);
    const br = new Set();
    for (const tr of h.matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
      const c = [...tr[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((x) => text(x[1]));
      if (c.length > 5 && /B\.Tech/i.test(c[3])) br.add(c[4].replace(/\s*\((Shift [IV]+|Hindi Medium|SF|Self Finance)\)/gi, ''));
    }
    brCache[id] = [...br];
  }
  const br = brCache[id];
  if (!br.length) return null;
  const parts = text(label).split(/\s*,\s*/);
  const place = parts.length > 1 ? parts.pop() : '';
  // Keep the register's full label as the name ("Rajkiya Engineering College, Azamgarh": nine RECs share one name).
  const name = tidy(text(label)).replace(/\bEngg\.?(?=[\s,]|$)/g, 'Engineering');
  const town = place || (label.match(/\b(Meerut|Greater Noida|Noida|Lucknow|Kanpur|Agra|Ghaziabad)\b/i) || [])[1] || TOWN[id] || '';
  return {
    id, name, city: city(UPCITY[place] || UPCITY[town] || town), courses: [...br], branches: branches([...br]), url: 'https://uptac.samarth.edu.in/',
    ...(/\b(govt|government|rajkiya|kamla nehru institute|bundelkhand institute|institute of engineering (&|and) technology, lucknow|university institute|harcourt butler|madan mohan malaviya|uptu|aktu|centre for advanced studies)\b/i.test(label) ? { ownership: 'Government' } : {}),
  };
})).filter(Boolean);
fs.writeFileSync(BRF, JSON.stringify(brCache) + '\n');
save('up', { source: 'uptac', as_of: '2026-27', fetched: new Date().toISOString().slice(0, 10) }, rows);
