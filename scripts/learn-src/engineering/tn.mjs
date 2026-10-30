// Tamil Nadu: Anna University's district-wise list of affiliated colleges (annauniv.edu/cai, 5 region pages →
// district pages: examination code, TNEA counselling code, name). Kept: rows with a TNEA counselling code, i.e. the
// colleges that fill B.E./B.Tech seats through TNEA; architecture and management-only schools are dropped.
// TNEA's own site has no public college list (login only). node scripts/learn-src/engineering/tn.mjs
import { get, pool, text, tidy, city, save } from './_lib.mjs';

const BASE = 'https://www.annauniv.edu/cai/';
const regions = ['Head%20Quarters.php', 'Regioncoimbatore.php', 'Regiontrichy.php', 'Regionmadurai.php', 'Regiontirunelveli.php'];
const districts = new Set();
for (const r of regions) for (const m of (await get(BASE + r)).matchAll(/href="(District wise\/district\/[^"]+)"/gi)) districts.add(m[1]);
console.log('district pages:', districts.size);
// District page names → the town names the site uses.
const DIST = { 'The Nilgiris': 'Ooty', kallakurichi: 'Kallakurichi', Villlupuram: 'Villupuram', Thirunelveli: 'Tirunelveli', Thiruvannamalai: 'Tiruvannamalai', Tirupathur: 'Tirupattur', Nagappattinam: 'Nagapattinam' };
function dist(d) { return DIST[d] || d; }
const seen = new Map();
await pool([...districts], 4, async (d) => {
  const url = BASE + encodeURI(d);
  const h = await get(url);
  const dist = decodeURIComponent(d).replace(/^.*\//, '').replace(/\.php$/, '');
  for (const tr of h.matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
    const c = [...tr[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((x) => text(x[1]));
    if (c.length < 4 || !/^\d{4}$/.test(c[1]) || !/^\d{1,4}$/.test(c[2])) continue;
    const name = c[3];
    if (/architecture|planning|management studies|business school|stand alone|teachers training/i.test(name)) continue;
    if (!seen.has(c[2])) seen.set(c[2], { tnea: c[2], exam_code: c[1], name: tidy(name).replace(/\s*\(Autonomous\)/i, ''), autonomous: /autonomous/i.test(name), district: dist, url });
  }
});
const rows = [...seen.values()].map((r) => ({
  ...r, city: city(dist(r.district)),
  ...(/\b(government|govt|university college of engineering|university departments?|anna university|alagappa chettiar|madras institute of technology|college of engineering,? guindy)\b/i.test(r.name) ? { ownership: 'Government' } : {}),
}));
save('tn', { source: 'annauniv', as_of: 'TNEA participating', fetched: new Date().toISOString().slice(0, 10) }, rows);
