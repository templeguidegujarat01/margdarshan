// USA Edition, Colleges & training (USA Master Plan Phase 13, 2026-10-21): writes the page stubs for
//   us/colleges/index.html                       the hub: school types, 51 states, program lists   (_includes/us-colleges-hub.html)
//   us/colleges/<state>/index.html               every operating school in the state              (_includes/us-colleges-state.html)
//   us/colleges/<state>/<city>/index.html        only cities with >= min_city (3) schools          (_includes/us-colleges-city.html)
//   us/colleges/fields/index.html                every career program list                        (_includes/us-colleges-fields.html)
//   us/colleges/fields/<career>/index.html       schools awarding the career's CIP programs        (_includes/us-colleges-field.html)
// and _data/us/college_search.json (search entries for all of them; assets/search.json concatenates it).
// Input: _data/us/college_index.json, college_fields.json and apprenticeships.json, written by
//   node scripts/build-ipeds.mjs --places …   (rerun this script after every data rebuild, then --check).
//   node scripts/build-us-colleges.mjs [--check]
// --check only reports missing / stale stubs and stub folders with no data behind them; it never deletes (a city
// that drops below 3 schools keeps its folder until the owner decides: make it a redirect_to stub).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const IX = JSON.parse(fs.readFileSync(path.join(root, '_data/us/college_index.json'), 'utf8'));
const FD = JSON.parse(fs.readFileSync(path.join(root, '_data/us/college_fields.json'), 'utf8'));
const AP = JSON.parse(fs.readFileSync(path.join(root, '_data/us/apprenticeships.json'), 'utf8'));
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const fmt = (n) => n.toLocaleString('en-US');
const plural = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;
const SUF = ' | Education Margdarshan USA';

let wrote = 0;
const stale = [];
const put = (rel, stub) => {
  const out = path.join(root, rel);
  const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').replace(/\r\n/g, '\n') : null;
  if (cur === stub) return;
  if (check) { stale.push(`${rel} ${cur === null ? 'missing' : 'out of date'}`); return; }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, stub);
  wrote++;
};
const stub = (fm, include) => `---\n${fm.trim()}\n---\n{% include ${include} %}\n`;
const search = [];
const N = IX.national;

put('us/colleges/index.html', stub(`
title: "U.S. Colleges by State and City: ${fmt(N.n)} Universities, Community Colleges and Trade Schools${SUF}"
description: "Every operating college in the 50 states and DC from the U.S. Department of Education: ${fmt(N.lv[1])} four-year, ${fmt(N.lv[2])} two-year and ${fmt(N.lv[3])} under-two-year schools, by state and city, with cost, net price and completion, plus program lists and apprenticeships for each career."
og_type: "website"
breadcrumb:
  current: "Colleges"
`, 'us-colleges-hub.html'));
search.push({ t: 'U.S. colleges by state and city', s: `${fmt(N.n)} universities, community colleges and trade schools, with cost and completion`, u: 'us/colleges/', c: 'usa', k: 'usa colleges universities community college trade school by state city list directory scorecard ipeds' });

const nFields = Object.keys(FD.fields).length;
put('us/colleges/fields/index.html', stub(`
title: "College Programs by Career: Where to Study for ${nFields} U.S. Careers${SUF}"
description: "For each career on Education Margdarshan USA, every school that awarded a matching program (certificate to doctorate) in ${FD.academic_year}, from NCES IPEDS and the CIP–SOC crosswalk, plus Registered Apprenticeship occupations."
og_type: "website"
breadcrumb:
  parent_href: "us/colleges/"
  parent_label: "Colleges"
  current: "Programs by career"
`, 'us-colleges-fields.html'));
search.push({ t: 'College programs by career (USA)', s: `Where to study for ${nFields} careers: certificate to doctorate`, u: 'us/colleges/fields/', c: 'usa', k: 'usa programs majors degree by career where to study cip' });

for (const [slug, S] of Object.entries(IX.states)) {
  const lead = `${plural(S.n, 'operating college', 'operating colleges')} in ${S.name}`;
  put(`us/colleges/${slug}/index.html`, stub(`
title: "Colleges in ${esc(S.name)}: ${fmt(S.n)} Universities, Community Colleges and Trade Schools${SUF}"
description: "${esc(lead)} (U.S. Dept. of Education): ${fmt(S.lv[1])} four-year, ${fmt(S.lv[2])} two-year and ${fmt(S.lv[3])} under-two-year schools, public and private, with cost, net price, completion and the fields each teaches${S.cities.length ? `; ${plural(S.cities.length, 'city list', 'city lists')}` : ''}."
og_type: "article"
state: ${slug}
breadcrumb:
  parent_href: "us/colleges/"
  parent_label: "Colleges"
  current: "${esc(S.name)}"
`, 'us-colleges-state.html'));
  search.push({ t: `Colleges in ${S.name}`, s: `${fmt(S.n)} schools: universities, community colleges, trade schools`, u: `us/colleges/${slug}/`, c: 'usa', k: `usa ${S.name.toLowerCase()} ${S.abbr.toLowerCase()} colleges universities community college trade school list` });
  for (const C of S.cities) {
    put(`us/colleges/${slug}/${C.s}/index.html`, stub(`
title: "Colleges in ${esc(C.n)}, ${esc(S.name)}: ${fmt(C.count)} Schools Compared${SUF}"
description: "All ${fmt(C.count)} operating colleges in ${esc(C.n)}, ${esc(S.abbr)} (U.S. Dept. of Education): type, public or private, cost, net price, completion rate and every field taught, with the highest award in each, doctorates included."
og_type: "article"
state: ${slug}
city: ${C.s}
breadcrumb:
  parent_href: "us/colleges/${slug}/"
  parent_label: "${esc(S.name)}"
  current: "${esc(C.n)}"
`, 'us-colleges-city.html'));
    search.push({ t: `Colleges in ${C.n}, ${S.abbr}`, s: `${fmt(C.count)} schools in ${C.n}, ${S.name}`, u: `us/colleges/${slug}/${C.s}/`, c: 'usa', k: `usa ${C.n.toLowerCase()} ${S.name.toLowerCase()} colleges city` });
  }
}

for (const [slug, F] of Object.entries(FD.fields)) {
  put(`us/colleges/fields/${slug}/index.html`, stub(`
title: "${esc(F.short)} Programs: ${fmt(F.institutions)} U.S. Colleges and Schools (IPEDS ${FD.academic_year})${SUF}"
description: "Every U.S. school that awarded a program linked to ${esc(F.short)} in ${FD.academic_year} (NCES IPEDS and the CIP–SOC crosswalk), certificate to doctorate: filter by state, award level and type of school${AP.careers[slug] ? ', plus Registered Apprenticeship occupations' : ''}."
og_type: "article"
field: ${slug}
breadcrumb:
  parent_href: "us/colleges/fields/"
  parent_label: "Programs by career"
  current: "${esc(F.short)}"
`, 'us-colleges-field.html'));
  search.push({ t: `Where to study: ${F.short}`, s: `${fmt(F.institutions)} U.S. colleges and schools award a matching program`, u: `us/colleges/fields/${slug}/`, c: 'usa', k: 'usa colleges schools programs training where to study' });
}

// Stub folders without data behind them (never deleted here).
const base = path.join(root, 'us/colleges');
if (fs.existsSync(base)) {
  for (const d of fs.readdirSync(base, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    if (d.name === 'fields') {
      for (const f of fs.readdirSync(path.join(base, d.name), { withFileTypes: true })) if (f.isDirectory() && !FD.fields[f.name]) stale.push(`us/colleges/fields/${f.name}/ has no program list in college_fields.json (make it a redirect_to stub)`);
      continue;
    }
    const S = IX.states[d.name];
    if (!S) { stale.push(`us/colleges/${d.name}/ is not a state in college_index.json`); continue; }
    for (const c of fs.readdirSync(path.join(base, d.name), { withFileTypes: true })) if (c.isDirectory() && !S.cities.some((x) => x.s === c.name)) stale.push(`us/colleges/${d.name}/${c.name}/ has fewer than ${IX.min_city} schools now (make it a redirect_to stub)`);
  }
}

const searchFile = '_data/us/college_search.json';
const searchJson = JSON.stringify(search, null, 1) + '\n';
const curSearch = fs.existsSync(path.join(root, searchFile)) ? fs.readFileSync(path.join(root, searchFile), 'utf8') : null;
if (curSearch !== searchJson) { if (check) stale.push(`${searchFile} out of date`); else { fs.writeFileSync(path.join(root, searchFile), searchJson); wrote++; } }

const cities = Object.values(IX.states).reduce((a, s) => a + s.cities.length, 0);
for (const s of stale) console.error('  ' + s);
console.log(check
  ? `checked colleges hub + ${Object.keys(IX.states).length} states + ${cities} cities + ${nFields} program lists: ${stale.length} problem(s)`
  : `wrote ${wrote} file(s): colleges hub, ${Object.keys(IX.states).length} states, ${cities} cities, ${nFields} program lists, ${search.length} search entries`);
if (stale.length) process.exit(1);
