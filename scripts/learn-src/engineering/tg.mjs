// Telangana: TGEAPCET (DTE Hyderabad) "Institute-wise courses offered" — code, institute, place, district, type.
// The page needs the session cookie from default.aspx plus that Referer. node scripts/learn-src/engineering/tg.mjs
import { UA, text, tidy, city, save } from './_lib.mjs';

const BASE = 'https://tgeapcet.nic.in/';
const r0 = await fetch(BASE + 'default.aspx', { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(60000) });
const cookie = (r0.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
const h = await (await fetch(BASE + 'institute_profile.aspx', { headers: { 'user-agent': UA, cookie, referer: BASE + 'default.aspx' }, signal: AbortSignal.timeout(60000) })).text();
// Hyderabad, Medchal-Malkajgiri and Ranga Reddy colleges sit in Hyderabad's suburbs: one city, the suburb kept as the area.
const METRO = new Set(['HYD', 'MDL', 'RR', 'MED', 'SRD']);
const DIST = { HYD: 'Hyderabad', MDL: 'Medchal-Malkajgiri', RR: 'Ranga Reddy', MED: 'Medak', SRD: 'Sangareddy' };
const OWN = { PVT: 'Private', GOV: 'Government', UNIV: 'Government', SF: 'Private', PU: 'Private' };
const rows = [];
for (const tr of h.matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
  const c = [...tr[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((x) => text(x[1]));
  if (c.length < 9 || !/^\d+$/.test(c[0]) || !/^[A-Z0-9]{3,5}$/.test(c[1])) continue;
  const [, code, inst, place, dist, univ, type, minority] = c;
  const metro = METRO.has(dist) && dist !== 'MED' && dist !== 'SRD';
  rows.push({
    code, name: tidy(inst).replace(/\s*\(Autonomous\)/i, ''), autonomous: /AUTONOMOUS/.test(inst), type_code: type, univ,
    ownership: OWN[type] || (/^GOV|UNIV/.test(type) ? 'Government' : 'Private'),
    city: metro ? 'Hyderabad' : city(place), area: tidy(place), district: DIST[dist] || dist, minority: minority !== 'NA' ? minority : undefined,
    url: BASE + 'default.aspx',
  });
}
console.log('types:', [...new Set(rows.map((r) => r.type_code))].join(','));
save('tg', { source: 'tgeapcet', as_of: '2026-27', fetched: new Date().toISOString().slice(0, 10) }, rows);
