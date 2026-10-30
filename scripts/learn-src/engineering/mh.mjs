// Maharashtra: State CET Cell FE (B.E./B.Tech) CAP 2026 institute list + each institute's summary page
// (address, district, status, branches). node scripts/learn-src/engineering/mh.mjs
import { get, pool, text, tidy, branches, save } from './_lib.mjs';

const BASE = 'https://fe2026.mahacet.org/StaticPages/';
const lists = ['frmInstituteList.aspx?did=1884', 'frmInstituteList_BATU.aspx?did=62354'];
const codes = new Map();
for (const l of lists) {
  const h = await get(BASE + l);
  for (const m of h.matchAll(/InstituteCode=(\d+)">\d+<\/a><\/td><td[^>]*>([^<]*)<\/td><td[^>]*>([^<]*)<\/td><td[^>]*>(\d*)</g)) {
    if (!codes.has(m[1])) codes.set(m[1], { code: m[1], name: m[2], status: m[3], intake: +m[4] || 0 });
  }
}
console.log('institutes in CAP list:', codes.size);
// CAP status → site ownership: Government-Aided = Grant-in-Aid; university departments / university-managed
// institutes are state-university run = Government; Un-Aided = Private.
const own = (s) => /government-aided/i.test(s) ? 'Grant-in-Aid' : /^(government|university)/i.test(s) ? 'Government'
  : /deemed/i.test(s) ? 'Deemed' : 'Private';
const rows = (await pool([...codes.values()], 6, async (c) => {
  const url = `${BASE}frmInstituteSummary.aspx?InstituteCode=${c.code}`;
  const h = await get(url);
  const f = (id) => text((h.match(new RegExp(`_lbl${id}"[^>]*>([^<]*)<`)) || [])[1] || '');
  const courses = [...h.matchAll(/<td[^>]*>\d{9,10}T?<\/td><td[^>]*>([^<]+)<\/td><td[^>]*>([^<]*)</g)];
  const names = [...new Set(courses.map((m) => text(m[1])))];
  return {
    code: c.code, name: tidy(c.name).replace(/\s*,\s*$/, ''), status: c.status, ownership: own(c.status),
    address: f('InstituteAddress').replace(/\s*,\s*/g, ', '), district: tidy(f('District')), region: f('Region'),
    university: text((courses[0] || [])[2] || ''), courses: names, branches: branches(names), seats: c.intake, url,
  };
})).filter((r) => r.courses.length);
save('mh', { source: 'mhcet', as_of: '2026-27', fetched: new Date().toISOString().slice(0, 10) }, rows);
