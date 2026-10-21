// `node scripts/build-ipeds.mjs --places …` (USA Master Plan Phase 13): every operating college, community college and
// trade school in the 50 states and DC, by state and city, plus one program list per career (by CIP code).
//
// Sources (all official; files are copied, nothing is estimated):
//   College Scorecard "Most-Recent-Cohorts-Institution_<MMDDYYYY>.zip" (U.S. Dept. of Education): the directory of
//     Title IV schools — name, city, state, level (ICLEVEL), control (CONTROL), currently operating (CURROPER),
//     website, average annual cost (COSTT4_A academic-year / COSTT4_P program-year schools), average net price
//     (NPT4_PUB / NPT4_PRIV), completion within 150% of normal time (C150_4 / C150_L4), undergraduates (UGDS).
//   IPEDS C<year>_A (NCES): awards by school × 6-digit CIP × award level (first majors) → the fields each school
//     teaches and the highest award in each field, doctorates included.
//   CIPCode2020.csv (NCES): titles of the CIP families (2-digit) and programs (6-digit).
//   CIP2020_SOC2018_Crosswalk.xlsx (NCES), sheet SOC-CIP: career SOC code → the programs that prepare for it.
//   approved-occupations.xlsx (U.S. DOL, apprenticeship.gov): Registered Apprenticeship occupations by O*NET-SOC code.
// Outputs (repo-relative):
//   _data/us/college_index.json              national + per-state counts, cities with >= MIN_CITY schools, CIP families
//   _data/us/college_states/<state>.json     every school in the state (compact objects, read by the state/city pages)
//   _data/us/college_fields.json             per career: CIP codes, counts, largest programs
//   assets/data/us/colleges/fields/<career>.json   every school awarding those programs (finder rows)
//   _data/us/apprenticeships.json            per career: DOL Registered Apprenticeship occupations that match its SOC
// Pages are written from these files by scripts/build-us-colleges.mjs [--check].
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { unzip, parseCsv, csvFromZip, xlsxRows } from './unzip.mjs';

export const MIN_CITY = 3; // same rule as the India verified-list landing pages: a city page needs 3 schools
// Careers left without a program list: the crosswalk links them to (nearly) every subject, so a list would only
// repeat the state pages. Shown with the reason on us/colleges/fields/ and in the Phase 13 report.
const FIELD_SKIP = { 'postsecondary-teacher': ['college teachers', 'every subject taught in college'], 'high-school-teacher': ['high school teachers', 'every school subject'] };
// IPEDS AWLEVEL codes (C2024_A dictionary) → keys used in the program lists, and the "highest award" scale per field.
export const AWARD = { 20: 'cert_short', 21: 'cert_lt1', 2: 'cert_1to2', 4: 'cert_2to4', 3: 'associate', 5: 'bachelor', 6: 'postbacc', 7: 'master', 8: 'postmaster', 17: 'doctor_research', 18: 'doctor_professional', 19: 'doctor_other' };
const TIER = { 20: 'c', 21: 'c', 2: 'c', 4: 'c', 3: 'a', 5: 'b', 6: 'g', 8: 'g', 7: 'm', 17: 'd', 18: 'd', 19: 'd' };
// SOC 2018 codes that the NCES crosswalk and the DOL list carry under their O*NET codes instead (occupations.yml `onet`,
// checked on onetonline.org): 21-1018 = 21-1011 substance abuse + 21-1014 mental health counselors.
const SOC_ALIAS = { '21-1018': ['21-1011', '21-1014'] };
// Highest award per field, stored as 1–6: certificate, associate, bachelor's, graduate certificate, master's, doctorate.
const RANK = { c: 1, a: 2, b: 3, g: 4, m: 5, d: 6 };
const URLS = {
  crosswalk: 'https://nces.ed.gov/ipeds/cipcode/Files/CIP2020_SOC2018_Crosswalk.xlsx',
  cipcodes: 'https://nces.ed.gov/ipeds/cipcode/Files/CIPCode2020.csv',
  rapids: 'https://www.apprenticeship.gov/sites/default/files/wps/approved-occupations.xlsx',
};

const slugify = (s) => s.toLowerCase().replace(/^st\.?\s+/, 'saint ').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cityKey = (s) => slugify(s.trim());
const mixed = (s) => s !== s.toUpperCase() && s !== s.toLowerCase();
const titleCase = (s) => s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
const FAM_SMALL = new Set(['and', 'or', 'of', 'the', 'in', 'for', 'to']);
const famTitle = (s) => s.replace(/\.$/, '').toLowerCase().split(/(\s+|\/|-)/).map((w, i) => (i && FAM_SMALL.has(w) ? w : w.replace(/^[a-z]/, (c) => c.toUpperCase()))).join('');
const num = (v) => (v === undefined || v === '' || v === 'NA' || v === 'PrivacySuppressed' ? null : +v);

/** Rows of a big CSV as arrays, keeping only the named columns (the Scorecard file has 3,000+ columns). */
function pickCsv(text, cols) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const out = []; let row = [], cell = '', q = false, head = null, idx = null;
  const flush = () => {
    row.push(cell); cell = '';
    if (!head) { head = row.map((h) => h.trim()); idx = cols.map((c) => { const i = head.indexOf(c); if (i < 0) throw new Error('Scorecard file has no column ' + c); return i; }); }
    else if (row.length > 1) out.push(Object.fromEntries(cols.map((c, j) => [c, (row[idx[j]] ?? '').trim()])));
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; flush(); }
    else cell += c;
  }
  if (cell || row.length) flush();
  return out;
}

export async function buildPlaces({ root, args, val, year, get }) {
  const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
  const loadY = (f) => yaml.load(fs.readFileSync(path.join(root, f), 'utf8'));
  const fetchTo = async (key) => {
    if (val('--' + key)) return path.resolve(val('--' + key));
    const f = path.join(path.resolve(val('--cache') || 'ipeds-out'), path.basename(URLS[key]));
    if (!fs.existsSync(f)) {
      const r = await fetch(URLS[key], { headers: { 'User-Agent': 'Mozilla/5.0 (Margdarshan data refresh)' } });
      if (!r.ok) throw new Error(URLS[key] + ' HTTP ' + r.status);
      fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    }
    return f;
  };
  const scFile = val('--scorecard');
  if (!scFile) throw new Error('--places needs --scorecard <Most-Recent-Cohorts-Institution_MMDDYYYY.zip> from collegescorecard.ed.gov/data/');
  const rel = scFile.match(/_(\d{2})(\d{2})(\d{4})\.zip$/);
  const scorecard_release = rel ? `${rel[3]}-${rel[1]}-${rel[2]}` : null;

  // ---- directory: College Scorecard, currently operating Title IV schools ----
  const z = unzip(path.resolve(scFile));
  const scName = Object.keys(z).find((n) => /\.csv$/i.test(n) && !n.includes('__MACOSX'));
  const SC = pickCsv(z[scName].toString('utf8'), ['UNITID', 'INSTNM', 'CITY', 'STABBR', 'INSTURL', 'ICLEVEL', 'CONTROL', 'CURROPER', 'HIGHDEG', 'DISTANCEONLY', 'UGDS', 'COSTT4_A', 'COSTT4_P', 'NPT4_PUB', 'NPT4_PRIV', 'C150_4', 'C150_L4']);
  const op = SC.filter((r) => r.CURROPER === '1');
  console.log(`Scorecard ${scName} (${scorecard_release}): ${SC.length} schools, ${op.length} currently operating`);

  // ---- programs: IPEDS completions, first majors ----
  const comp = csvFromZip(await get(`C${year}_A.zip`));
  const progs = {}; // unitid → { cip6: { awlevel: n } }
  for (const r of comp) {
    if (r.MAJORNUM !== '1' || !AWARD[r.AWLEVEL] || r.CIPCODE === '99') continue;
    const n = +r.CTOTALT; if (!n) continue;
    ((progs[r.UNITID] ||= {})[r.CIPCODE] ||= {})[r.AWLEVEL] = n;
  }
  const academic_year = `${+year - 1}-${String(year).slice(2)}`;

  // ---- CIP titles ----
  const cipCsv = parseCsv(fs.readFileSync(await fetchTo('cipcodes'), 'utf8'));
  const unq = (s) => s.replace(/^="?|"$/g, '');
  const families = {}, cipTitle = {};
  for (const r of cipCsv) {
    const code = unq(r.CIPCode);
    if (code.length === 2) families[code] = famTitle(r.CIPTitle);
    if (code.length === 7) cipTitle[code] = r.CIPTitle.replace(/\.$/, '');
  }

  // ---- schools by state ----
  const IDX = loadY('_data/us/state_index.yml');
  const byAbbr = Object.fromEntries(IDX.list.map((s) => [s.abbr, s]));
  const inst = {}; // unitid → compact record
  for (const r of op) {
    const P = progs[r.UNITID] || {};
    const fam = {}; const doc = new Set(); let np = 0;
    for (const [cip, lv] of Object.entries(P)) {
      np++;
      const f = cip.slice(0, 2);
      for (const a of Object.keys(lv)) { const t = TIER[a]; if (!fam[f] || RANK[t] > RANK[fam[f]]) fam[f] = t; if (t === 'd') doc.add(f); }
    }
    const lvl = +r.ICLEVEL;
    const ca = num(r.COSTT4_A), cp = num(r.COSTT4_P);
    const g4 = num(r.C150_4), gl = num(r.C150_L4);
    inst[r.UNITID] = {
      id: +r.UNITID, n: r.INSTNM, c: r.CITY.trim(), st: r.STABBR, lv: lvl, ct: +r.CONTROL, web: r.INSTURL || null,
      cost: ca ?? cp, ck: ca != null ? 'A' : cp != null ? 'P' : null,
      net: num(r.CONTROL === '1' ? r.NPT4_PUB : r.NPT4_PRIV),
      gr: g4 ?? gl, gk: g4 != null ? '4' : gl != null ? 'L4' : null,
      ug: num(r.UGDS), dist: r.DISTANCEONLY === '1' ? 1 : 0, hd: num(r.HIGHDEG),
      np, f: Object.keys(fam).sort().map((k) => [k, RANK[fam[k]]]), doc: [...doc].sort(),
    };
    // Display strings, so the 500+ pages do not run a number formatter per cell (Jekyll build time).
    const I = inst[r.UNITID], usd = (v) => (v == null ? null : '$' + v.toLocaleString('en-US'));
    Object.assign(I, { fc: usd(I.cost), fn: usd(I.net), fu: I.ug == null ? null : I.ug.toLocaleString('en-US'), fg: I.gr == null ? null : Math.round(I.gr * 100) + '%' });
  }

  const stateOut = path.join(root, '_data/us/college_states');
  fs.mkdirSync(stateOut, { recursive: true });
  const grid = () => ({ 1: { 1: 0, 2: 0, 3: 0 }, 2: { 1: 0, 2: 0, 3: 0 }, 3: { 1: 0, 2: 0, 3: 0 } }); // level × control
  const states = {}; const nat = { n: 0, lv: { 1: 0, 2: 0, 3: 0 }, ct: { 1: 0, 2: 0, 3: 0 }, x: grid(), doc: 0, cities: 0 };
  for (const S of IDX.list) {
    const list = Object.values(inst).filter((i) => i.st === S.abbr);
    // City names as IPEDS reports them; spellings that differ only in case or "St."/"Saint" share one page.
    const groups = {};
    for (const i of list) (groups[cityKey(i.c)] ||= []).push(i);
    const cities = [];
    for (const [k, g] of Object.entries(groups)) {
      const counts = {}; for (const i of g) counts[i.c] = (counts[i.c] || 0) + 1;
      const names = Object.keys(counts).sort((a, b) => (mixed(b) - mixed(a)) || counts[b] - counts[a] || a.localeCompare(b));
      const name = mixed(names[0]) ? names[0] : titleCase(names[0]);
      for (const i of g) { i.cs = k; i.cn = name; }
      cities.push({ s: k, n: name, count: g.length, lv: { 1: g.filter((i) => i.lv === 1).length, 2: g.filter((i) => i.lv === 2).length, 3: g.filter((i) => i.lv === 3).length } });
    }
    cities.sort((a, b) => b.count - a.count || a.n.localeCompare(b.n));
    const pages = cities.filter((c) => c.count >= MIN_CITY);
    list.sort((a, b) => a.cn.localeCompare(b.cn) || a.n.localeCompare(b.n));
    const lv = { 1: 0, 2: 0, 3: 0 }, ct = { 1: 0, 2: 0, 3: 0 }, x = grid(); let docN = 0;
    for (const i of list) { lv[i.lv]++; ct[i.ct]++; x[i.lv][i.ct]++; nat.x[i.lv][i.ct]++; if (i.doc.length) docN++; }
    states[S.slug] = { abbr: S.abbr, name: S.name, n: list.length, lv, ct, x, doc: docN, towns: cities.length, cities: pages, small: cities.length - pages.length };
    nat.n += list.length; for (const k of [1, 2, 3]) { nat.lv[k] += lv[k]; nat.ct[k] += ct[k]; } nat.doc += docN; nat.cities += pages.length;
    fs.writeFileSync(path.join(stateOut, S.slug + '.json'), JSON.stringify({ abbr: S.abbr, name: S.name, inst: list.map(({ st, ...i }) => i) }));
  }
  const outside = op.filter((r) => !byAbbr[r.STABBR]).length;

  // ---- careers → programs (CIP–SOC crosswalk) and Registered Apprenticeship occupations ----
  const xw = xlsxRows(await fetchTo('crosswalk'), 3).slice(1); // SOC-CIP sheet: SOC2018Code, SOC2018Title, CIP2020Code, CIP2020Title
  const socHit = (code, target) => (SOC_ALIAS[target] ? SOC_ALIAS[target].includes(code) : target.endsWith('0') ? code.slice(0, 6) === target.slice(0, 6) : code === target);
  const careers = [];
  for (const f of fs.readdirSync(path.join(root, '_data/us/careers')).filter((x) => x.endsWith('.yml')).sort()) {
    for (const c of loadY('_data/us/careers/' + f).list || []) if (!c.pathway) careers.push({ slug: c.slug, short: c.short, kind: 'career', cluster: f.slice(0, -4), soc: c.soc, href: `us/careers/${c.slug}/` });
  }
  const clusterYml = fs.readFileSync(path.join(root, '_data/us/clusters.yml'), 'utf8');
  const tradeSoc = Object.fromEntries([...clusterYml.matchAll(/trade: ([a-z-]+), soc: "([\d-]+)"/g)].map((m) => [m[1], m[2]]));
  for (const t of loadY('_data/us/cte_careers.yml').list) careers.push({ slug: t.slug, short: t.short, kind: 'trade', soc: [tradeSoc[t.slug]], href: `us/cte/${t.slug}.html` });
  const OCC = loadY('_data/us/occupations.yml');
  for (const p of loadY('_data/us/pathways.yml').list) if (p.live !== false && OCC[p.lead]) careers.push({ slug: p.slug, short: p.title.split(' (')[0], kind: 'pathway', soc: OCC[p.lead].soc, href: `us/careers/${p.slug}/` });

  const fieldsDir = path.join(root, 'assets/data/us/colleges/fields');
  fs.mkdirSync(fieldsDir, { recursive: true });
  const fields = {}, skipped = {};
  for (const C of careers) {
    if (C.kind === 'pathway') continue; // pathways keep their curated us/careers/<slug>/colleges/ lists
    if (!C.soc || !C.soc[0]) { skipped[C.slug] = 'No SOC code'; continue; }
    const cips = [...new Set(xw.filter((r) => C.soc.some((s) => socHit(r[0], s)) && !r[2].startsWith('99.')).map((r) => r[2]))].sort();
    if (FIELD_SKIP[C.slug]) { skipped[C.slug] = `The NCES crosswalk links ${FIELD_SKIP[C.slug][0]} to ${cips.length.toLocaleString('en-US')} programs (${FIELD_SKIP[C.slug][1]})`; continue; }
    const rows = [], totals = {}, byCip = {}, byState = {};
    for (const i of Object.values(inst)) {
      const P = progs[i.id]; if (!P) continue;
      const aw = {}, pc = {};
      for (const cip of cips) for (const [a, n] of Object.entries(P[cip] || {})) { aw[AWARD[a]] = (aw[AWARD[a]] || 0) + n; pc[cip] = (pc[cip] || 0) + n; }
      if (!Object.keys(pc).length) continue;
      rows.push([i.id, i.n, i.cn || i.c, i.st, i.lv, i.ct, i.web, aw, pc]);
    }
    if (!rows.length) { skipped[C.slug] = cips.length ? `No operating school reported awards in its ${cips.length} crosswalk program(s) in ${academic_year}` : 'The NCES crosswalk links no program to its SOC code'; continue; }
    rows.sort((a, b) => a[3].localeCompare(b[3]) || a[1].localeCompare(b[1]));
    for (const r of rows) {
      for (const [k, v] of Object.entries(r[7])) totals[k] = (totals[k] || 0) + v;
      for (const [k, v] of Object.entries(r[8])) byCip[k] = (byCip[k] || 0) + v;
      byState[r[3]] = (byState[r[3]] || 0) + 1;
    }
    const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    const cipList = cips.filter((c) => byCip[c]).map((c) => ({ code: c, label: cipTitle[c] || c, n: byCip[c] }));
    fs.writeFileSync(path.join(fieldsDir, C.slug + '.json'), JSON.stringify({ career: C.slug, cip: cipList.map((c) => c.code), labels: Object.fromEntries(cipList.map((c) => [c.code, c.label])), academic_year, institutions: rows.length, rows }));
    fields[C.slug] = {
      short: C.short, kind: C.kind, cluster: C.cluster || null, href: C.href, soc: C.soc, institutions: rows.length, states: Object.keys(byState).length,
      by_state: byState, totals, cip: cipList, cip_unawarded: cips.length - cipList.length,
      largest: rows.slice().sort((a, b) => sum(b[8]) - sum(a[8]) || a[1].localeCompare(b[1])).slice(0, 10).map((r) => ({ id: r[0], name: r[1], city: r[2], state: r[3], lv: r[4], ct: r[5], total: sum(r[8]) })),
    };
  }

  const rap = xlsxRows(await fetchTo('rapids'), 1);
  const rh = rap[0].map((h) => h.trim());
  const col = (n) => { const i = rh.indexOf(n); if (i < 0) throw new Error('approved-occupations.xlsx has no column ' + n); return i; };
  const [rC, rO, rT, rOT, rTy, rMin, rMax] = ['RAPIDS CODE', 'ONET SOC CODE', 'RAPIDS TITLE', 'ONET SOC TITLE', 'OCCUPATION TYPE', 'MINIMUM TERM-LENGTH', 'MAXIMUM TERM-LENGTH'].map(col);
  const appr = {};
  for (const C of careers) {
    if (!C.soc || !C.soc[0]) continue;
    const hit = rap.slice(1).filter((r) => C.soc.some((s) => socHit(String(r[rO]).slice(0, 7), s)));
    if (!hit.length) continue;
    const occ = {};
    for (const r of hit) {
      const k = r[rC] + '|' + r[rT];
      const o = (occ[k] ||= { code: r[rC], title: r[rT].trim(), onet: r[rO], onet_title: r[rOT], terms: {} });
      o.terms[r[rTy]] = r[rMax] && r[rMax] !== 'N/A' && r[rMax] !== r[rMin] ? `${r[rMin]}–${r[rMax]}` : r[rMin]; // hours, as DOL lists them
    }
    appr[C.slug] = { short: C.short, kind: C.kind, href: C.href, soc: C.soc, list: Object.values(occ).sort((a, b) => a.title.localeCompare(b.title)) };
  }

  const meta = { academic_year, ipeds: [`C${year}_A`], scorecard_file: path.basename(scFile), scorecard_release, min_city: MIN_CITY, built: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(path.join(root, '_data/us/college_index.json'), JSON.stringify({ ...meta, families, family_list: Object.keys(families).sort().map((k) => [k, families[k]]), national: nat, outside_states: outside, states }, null, 1));
  fs.writeFileSync(path.join(root, '_data/us/college_fields.json'), JSON.stringify({ ...meta, award: AWARD, skipped, fields }, null, 1));
  fs.writeFileSync(path.join(root, '_data/us/apprenticeships.json'), JSON.stringify({ source: 'dol_occupations', file: path.basename(URLS.rapids), built: meta.built, rapids_codes: new Set(rap.slice(1).map((r) => r[rC])).size, careers: appr }, null, 1));
  console.log(`50 states + DC: ${nat.n} schools (${nat.lv[1]} 4-year, ${nat.lv[2]} 2-year, ${nat.lv[3]} under 2-year), ${nat.cities} city pages; ${outside} schools in territories not paged`);
  console.log(`program lists: ${Object.keys(fields).length} careers; skipped ${Object.keys(skipped).length}: ${Object.keys(skipped).join(', ')}`);
  console.log(`apprenticeships: ${Object.keys(appr).length} careers match DOL Registered Apprenticeship occupations`);
}
