// Integrity check for the USA Edition research data (_data/us/*.yml).
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/check-us-data.mjs
// Checks: every cross-reference resolves (pathway → occupation / license / test /
// degree, record → source id), numbers are numbers, required fields are present,
// every record carries a last_verified / as_of date, and in_page India mappings
// point at real files. Run it after any data refresh.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkCrossborder, checkOrphanRoadmaps } from './lib/crossborder.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const load = (f) => yaml.load(fs.readFileSync(path.join(root, '_data/us', f + '.yml'), 'utf8'));
const [sources, occ, lic, tests, degrees, imm, paths] = ['sources', 'occupations', 'licenses', 'tests', 'degrees', 'immigration', 'pathways'].map(load);

const errors = [];
const err = (where, m) => errors.push(`${where}: ${m}`);
const src = new Set(Object.keys(sources.list));
const isDate = (d) => d instanceof Date || /^\d{4}-\d{2}-\d{2}$/.test(String(d));
const needSrc = (where, id) => { if (!src.has(id)) err(where, `unknown source "${id}"`); };

for (const [id, s] of Object.entries(sources.list)) {
  if (!/^https:\/\//.test(s.url || '')) err(`sources.${id}`, 'url must be https');
  if (!isDate(s.accessed)) err(`sources.${id}`, 'missing accessed date');
}

for (const [id, o] of Object.entries(occ)) {
  const w = `occupations.${id}`;
  for (const k of ['title', 'ooh_url', 'education', 'outlook_label']) if (!o[k]) err(w, `missing ${k}`);
  for (const k of ['pay', 'jobs', 'outlook_pct', 'openings']) if (typeof o[k] !== 'number') err(w, `${k} must be a number`);
  if (o.change !== undefined && typeof o.change !== 'number') err(w, 'change must be a number');
  if (!Array.isArray(o.soc) || !o.soc.every((c) => /^\d{2}-\d{4}$/.test(c))) err(w, 'bad soc codes');
  if (!Array.isArray(o.onet) || !o.onet.every((c) => /^\d{2}-\d{4}\.\d{2}$/.test(c))) err(w, 'bad onet codes');
  if (o.group && typeof o.group_pay !== 'number') err(w, 'group without group_pay');
  if (o.license && !lic[o.license]) err(w, `unknown license "${o.license}"`);
  if (!/^https:\/\/www\.bls\.gov\/ooh\//.test(o.ooh_url || '')) err(w, 'ooh_url must be a BLS OOH page');
  needSrc(w, o.source);
  if (!isDate(o.last_verified)) err(w, 'missing last_verified');
}

for (const [id, l] of Object.entries(lic)) {
  const w = `licenses.${id}`;
  for (const k of ['name', 'authority', 'jurisdiction_note', 'steps']) if (!l[k]) err(w, `missing ${k}`);
  (l.exams || []).forEach((e, i) => needSrc(`${w}.exams[${i}]`, e.source));
  (l.sources || []).forEach((s) => needSrc(w, s));
  if (!isDate(l.last_verified)) err(w, 'missing last_verified');
  // Phase 2: state board rows (each copied from that board's page) and generated page stubs.
  (l.boards || []).forEach((b, i) => {
    if (!b.place || !b.body || !b.rule) err(`${w}.boards[${i}]`, 'needs place, body and rule');
    if (!(b.sources || []).length) err(`${w}.boards[${i}]`, 'needs sources (the board page it was copied from)');
    (b.sources || []).forEach((s) => needSrc(`${w}.boards[${i}]`, s));
  });
  if (l.page) {
    for (const k of ['title', 'description', 'current']) if (!l.page[k]) err(`${w}.page`, `missing ${k}`);
    const stub = path.join(root, 'us/professional-licenses', id, 'index.html');
    if (!fs.existsSync(stub) || !new RegExp(`^license:\\s*${id}\\s*$`, 'm').test(fs.readFileSync(stub, 'utf8'))) err(w, `us/professional-licenses/${id}/index.html must exist and say license: ${id} (run scripts/build-us-clusters.mjs)`);
  }
}

const testIds = new Set();
for (const grp of ['high_school', 'professional_admission']) {
  for (const [id, t] of Object.entries(tests[grp])) {
    testIds.add(id);
    needSrc(`tests.${id}`, t.source);
    if (!isDate(t.last_verified)) err(`tests.${id}`, 'missing last_verified');
  }
}

for (const [id, d] of Object.entries(degrees.levels)) needSrc(`degrees.${id}`, d.source);
(degrees.high_school.sources || []).forEach((s) => needSrc('degrees.high_school', s));

// Immigration (Phase 13): the whole file is re-checked by review_by (court cases and guidance move fast);
// items on the work-authorization timeline need a stage; the work-authorization page must exist.
const immToday = new Date().toISOString().slice(0, 10);
const immIso = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d));
if (!isDate(imm.checked) || !isDate(imm.review_by)) err('immigration', 'needs checked and review_by dates');
else if (immIso(imm.review_by) < immToday) err('immigration', `review_by ${immIso(imm.review_by)} has passed: re-check USCIS, SEVP and the court cases, then update`);
for (const k of ['on_campus', 'cpt', 'opt', 'stem_opt', 'cap_gap', 'h1b']) if (!imm[k] || !['during', 'after', 'longer'].includes(imm[k].stage)) err(`immigration.${k}`, 'missing or bad stage (during | after | longer)');
if (!fs.existsSync(path.join(root, 'us/international-students/work-authorization/index.html'))) err('immigration', 'us/international-students/work-authorization/index.html is missing');
for (const k of ['f1', 'on_campus', 'cpt', 'opt', 'stem_opt', 'cap_gap', 'h1b', 'ds_rule']) {
  if (!imm[k]) { err(`immigration.${k}`, 'missing'); continue; }
  needSrc(`immigration.${k}`, imm[k].source);
  if (!isDate(imm[k].as_of)) err(`immigration.${k}`, 'missing as_of');
  (imm[k].changes || []).forEach((c, i) => { needSrc(`immigration.${k}.changes[${i}]`, c.source); if (!isDate(c.date)) err(`immigration.${k}.changes[${i}]`, 'bad date'); });
}

const cats = new Set(paths.categories.map((c) => c.id));
const slugs = new Set(paths.list.map((p) => p.slug));
if (slugs.size !== paths.list.length) err('pathways', 'duplicate slug');
for (const p of paths.list) {
  const w = `pathways.${p.slug}`;
  if (!/^[a-z0-9-]+$/.test(p.slug)) err(w, 'bad slug');
  if (!cats.has(p.category)) err(w, `unknown category "${p.category}"`);
  if (!p.occupations.includes(p.lead)) err(w, 'lead must be one of occupations');
  p.occupations.forEach((o) => { if (!occ[o]) err(w, `unknown occupation "${o}"`); });
  p.route.forEach((r) => { if (!degrees.levels[r]) err(w, `unknown degree "${r}"`); });
  (p.admission || []).forEach((t) => { if (!testIds.has(t)) err(w, `unknown test "${t}"`); });
  if (p.license !== 'none' && !lic[p.license]) err(w, `unknown license "${p.license}"`);
  (p.related || []).forEach((r) => { if (!slugs.has(r)) err(w, `unknown related "${r}"`); });
  if (p.in_page && !fs.existsSync(path.join(root, p.in_page))) err(w, `in_page ${p.in_page} does not exist`);
  if (p.license_stat && (!p.license_stat.value || !p.license_stat.note)) err(w, 'license_stat needs value and note');
  if (p.license_stat && p.license && p.license !== 'none') err(w, 'license_stat is only for pathways with license: none (a state license already fills the License stat)');
}

// guides.yml: every `source`/`sources`/`*_source(s)` value anywhere must be a known source id.
const guides = load('guides');
const walkSrc = (node, where) => {
  if (Array.isArray(node)) return node.forEach((v, i) => walkSrc(v, `${where}[${i}]`));
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node)) {
    if (/(^|_)sources?$/.test(k)) [].concat(v).forEach((id) => needSrc(`${where}.${k}`, id));
    else walkSrc(v, `${where}.${k}`);
  }
};
walkSrc(guides, 'guides');
for (const k of Object.keys(guides)) if (guides[k] && typeof guides[k] === 'object' && !Array.isArray(guides[k]) && !isDate(guides[k].as_of)) err(`guides.${k}`, 'missing as_of');

// Pages: ids passed to {% include us-sources.html ids="…" %} must exist.
const pageFiles = [];
const walkPages = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walkPages(p); else if (e.name.endsWith('.html')) pageFiles.push(p); } };
walkPages(path.join(root, 'us'));
for (const p of pageFiles) {
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/us-sources\.html ids="([^"]*)"/g)) m[1].split(',').forEach((id) => needSrc(path.relative(root, p), id.trim()));
}

// Career pages: live pathways need a page file, copy (pathway_pages.yml) with a 5-step route,
// and deep data for the lead occupation (occupation_details.yml).
const pages = load('pathway_pages');
const details = load('occupation_details');
for (const [id, d] of Object.entries(details)) {
  const w = `occupation_details.${id}`;
  if (!occ[id]) err(w, 'unknown occupation');
  for (const k of ['pay_low10', 'pay_high10']) if (typeof d[k] !== 'number') err(w, `${k} must be a number`);
  const mid = d.pay_median ?? occ[id]?.pay;
  if (occ[id] && !(d.pay_low10 < mid && mid < d.pay_high10)) err(w, 'median not between 10th and 90th percentile');
  (d.states?.top || []).forEach((s, i) => { if (typeof s.jobs !== 'number' || typeof s.median !== 'number') err(`${w}.states[${i}]`, 'jobs/median must be numbers'); });
  (d.onet?.context || []).concat(d.onet?.education || []).forEach((c, i) => { if (!(c.pct >= 0 && c.pct <= 100)) err(`${w}.onet[${i}]`, 'pct out of range'); });
  if (!isDate(d.last_verified)) err(w, 'missing last_verified');
}
for (const [slug, pg] of Object.entries(pages)) {
  const w = `pathway_pages.${slug}`;
  if (!slugs.has(slug)) err(w, 'unknown pathway');
  if (!Array.isArray(pg.route) || pg.route.length !== 5 || !pg.route.every((r) => r.split('|').length === 3)) err(w, 'route must be 5 "Tag|Title|Text" steps');
  if (!pg.faqs?.length) err(w, 'needs faqs');
  if (!isDate(pg.last_reviewed)) err(w, 'missing last_reviewed');
}
for (const p of paths.list.filter((x) => x.live)) {
  const w = `pathways.${p.slug} (live)`;
  if (!fs.existsSync(path.join(root, 'us/careers', p.slug, 'index.html'))) err(w, 'page file missing');
  if (!pages[p.slug]) err(w, 'no pathway_pages entry');
  if (!details[p.lead]) err(w, `no occupation_details for lead ${p.lead}`);
}

// v2 career pages (global-platform Phase 7–9): answer-first copy, salary depth pages backed by
// generated OEWS data, licence roadmaps backed by licenses.yml, and source short labels for chips.
const oewsFile = path.join(root, '_data/us/oews_summary.json');
const oewsAll = fs.existsSync(oewsFile) ? JSON.parse(fs.readFileSync(oewsFile, 'utf8')) : { socs: {} };
const oews = oewsAll.socs;
// Freshness: the generated OEWS data and the vintage the pages print must be the same release
// (see docs/global-platform/DATA-REFRESH.md). A half-finished yearly refresh fails here.
if (oewsAll.period && oewsAll.period !== sources.bls_vintage?.wage_ref) err('oews_summary.json', `period "${oewsAll.period}" does not match sources.yml bls_vintage.wage_ref "${sources.bls_vintage?.wage_ref}"`);
const oewsMeta = path.join(root, 'assets/data/us/oews/_meta.json');
if (fs.existsSync(oewsMeta)) { const m = JSON.parse(fs.readFileSync(oewsMeta, 'utf8')); if (m.release !== oewsAll.period) err('assets/data/us/oews/_meta.json', `release "${m.release}" does not match oews_summary.json period "${oewsAll.period}" (rebuild both together)`); if (m.missing?.length) err('assets/data/us/oews/_meta.json', 'SOCs without OEWS data: ' + m.missing.join(', ')); }
for (const p of paths.list.filter((x) => x.template === 'v2')) {
  const w = `pathways.${p.slug} (v2)`;
  const page = fs.existsSync(path.join(root, 'us/careers', p.slug, 'index.html')) ? fs.readFileSync(path.join(root, 'us/careers', p.slug, 'index.html'), 'utf8') : '';
  if (!page.includes('us-career-v2.html')) err(w, 'page does not include us-career-v2.html');
  if (!pages[p.slug]?.answer) err(w, 'pathway_pages entry needs a one-sentence `answer`');
  if (p.salary) {
    const soc = p.salary_soc || occ[p.lead]?.soc?.[0];
    if (!oews[soc]) err(w, `salary: true but no OEWS summary for SOC ${soc} (run scripts/build-oews.mjs)`);
    else if (!oews[soc].states_reported) err(w, `salary: true but BLS publishes no state data for SOC ${soc}`);
    if (!fs.existsSync(path.join(root, 'us/careers', p.slug, 'salary/index.html'))) err(w, 'salary: true but salary/index.html is missing');
    if (p.salary_soc && !p.salary_title) err(w, 'salary_soc needs a salary_title (the name shown for that SOC)');
    if (p.salary_soc && !(occ[p.lead]?.soc || []).includes(p.salary_soc)) err(w, `salary_soc ${p.salary_soc} is not one of the lead occupation's SOC codes`);
  }
  if (p.salary_from) {
    const t = paths.list.find((x) => x.slug === p.salary_from);
    if (!t?.salary) err(w, `salary_from ${p.salary_from} has no salary page`);
    else if (t.lead !== p.lead) err(w, `salary_from ${p.salary_from} has a different lead occupation`);
  }
  if (p.roadmap === 'license' && !(lic[p.license]?.steps?.length)) err(w, 'roadmap: license needs licenses.yml steps');
}
for (const [id, s] of Object.entries(sources.list)) if (!s.short) err(`sources.${id}`, 'missing short label (used on source chips)');

// Licence pages and compacts (Phase 12): every licence has a page; compact lists are dated, reviewed in
// time, use canonical state names, point at real licences and sources.
const STATES = new Set('Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,District of Columbia,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming,American Samoa,Guam,Northern Mariana Islands,Puerto Rico,U.S. Virgin Islands'.split(','));
for (const id of Object.keys(lic)) if (!fs.existsSync(path.join(root, 'us/professional-licenses', id, 'index.html'))) err(`licenses.${id}`, 'licence page us/professional-licenses/<id>/index.html is missing');
const compacts = load('compacts');
const today = new Date().toISOString().slice(0, 10);
const iso = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d));
for (const [id, c] of Object.entries(compacts)) {
  if (id === 'links_only') { for (const [lid, l] of Object.entries(c)) { if (!lic[lid]) err(`compacts.links_only.${lid}`, 'unknown licence'); if (!sources.list[l.source]) err(`compacts.links_only.${lid}`, `unknown source ${l.source}`); } continue; }
  const w = `compacts.${id}`;
  if (!lic[c.license]) err(w, `unknown licence ${c.license}`);
  if (!sources.list[c.source]) err(w, `unknown source ${c.source}`);
  if (!isDate(c.checked) || !isDate(c.review_by)) err(w, 'needs checked and review_by dates');
  else if (iso(c.review_by) < today) err(w, `review_by ${iso(c.review_by)} has passed: re-check the published list and update it`);
  const seen = new Set();
  for (const g of c.groups || []) for (const s of g.states || []) {
    if (!STATES.has(s.name)) err(w, `"${s.name}" is not a canonical state/territory name`);
    if (seen.has(s.name)) err(w, `"${s.name}" appears in more than one group`);
    seen.add(s.name);
  }
}

// Colleges pages (Phase 11): curated CIP codes must have IPEDS data, accreditors must resolve to sources.
const accr = load('accreditors');
for (const [id, a] of Object.entries(accr)) { if (!sources.list[a.source]) err(`accreditors.${id}`, `unknown source ${a.source}`); if (!['institutional', 'program'].includes(a.scope)) err(`accreditors.${id}`, 'scope must be institutional or program'); }
const collFile = path.join(root, '_data/us/colleges_summary.json');
const coll = fs.existsSync(collFile) ? JSON.parse(fs.readFileSync(collFile, 'utf8')).pathways : {};
for (const p of paths.list.filter((x) => x.colleges)) {
  const w = `pathways.${p.slug} (colleges)`;
  if (!Array.isArray(p.cip) || !p.cip.length) { err(w, 'colleges: true needs a cip list'); continue; }
  for (const c of p.cip) if (!/^\d{2}\.\d{4}$/.test(c.code) || !c.label) err(w, `bad cip entry ${JSON.stringify(c)}`);
  const s = coll[p.slug];
  if (!s) err(w, 'no colleges_summary entry (run scripts/build-ipeds.mjs --from-pathways)');
  else for (const c of p.cip) if (!s.by_cip?.[c.code]) err(w, `CIP ${c.code} has no IPEDS completions — wrong or outdated code?`);
  for (const a of p.accreditation || []) if (!accr[a]) err(w, `unknown accreditor ${a}`);
  if (!fs.existsSync(path.join(root, 'us/careers', p.slug, 'colleges/index.html'))) err(w, 'colleges/index.html is missing');
}

// Comparisons (Phase 14, IA rule R9): both sides live v2 pathways with colleges data, a page stub, no
// separator characters in the copy the page splits on, and at least 5 of the 10 table rows that differ
// (the same rows us-compare-page.html builds).
const cmp = load('compare');
const seenPairs = new Set();
for (const [id, c] of Object.entries(cmp)) {
  const w = `compare.${id}`;
  const A = paths.list.find((x) => x.slug === c.a), B = paths.list.find((x) => x.slug === c.b);
  if (!A || !B) { err(w, `unknown pathway ${!A ? c.a : c.b}`); continue; }
  for (const P of [A, B]) if (!P.live || P.template !== 'v2' || !P.colleges) err(w, `${P.slug} must be a live v2 pathway with colleges data`);
  const key = [c.a, c.b].sort().join('|');
  if (seenPairs.has(key)) err(w, 'duplicate pair'); seenPairs.add(key);
  if (!c.question || !c.takeaway || !isDate(c.last_reviewed)) err(w, 'needs question, takeaway and last_reviewed');
  if (!fs.existsSync(path.join(root, 'us/compare', id, 'index.html'))) err(w, `us/compare/${id}/index.html is missing`);
  const cell = (P) => {
    const pp = pages[P.slug] || {}, o = occ[P.lead] || {}, s = coll[P.slug] || {};
    return [pp.answer, pp.study, P.cip.map((x) => x.code).join(','), `${s.institutions}/${s.totals?.bachelor || 0}`, o.title, o.pay,
      `${o.jobs}/${o.outlook_pct}`, (P.occupations || []).filter((x) => x !== P.lead).join(','), `${P.license}/${!!P.license_required}`, (P.accreditation || []).join(',')];
  };
  const ca = cell(A), cb = cell(B);
  for (const v of [...ca, ...cb]) if (/[|~]/.test(String(v ?? ''))) err(w, 'a compared value contains "|" or "~" (the page splits rows on these)');
  const diff = ca.filter((v, i) => String(v) !== String(cb[i])).length;
  if (diff < 5) err(w, `only ${diff} of 10 rows differ; R9 needs at least 5`);
}

// Local hubs (us-local-hub.html): every number copied from the generated BLS OEWS metro file and IPEDS
// colleges file must still match them, every source id must exist, and each track links a live pathway.
const hubs = load('local_hubs') || {};
for (const [id, h] of Object.entries(hubs)) {
  const w = `local_hubs.${id}`;
  for (const k of ['slug', 'name', 'title', 'lede', 'metro', 'metro_name']) if (!h[k]) err(w, `missing ${k}`);
  if (!isDate(h.checked)) err(w, 'missing checked date');
  if (!fs.existsSync(path.join(root, 'us', h.slug || '-', 'index.html'))) err(w, `us/${h.slug}/index.html is missing`);
  (h.tracks || []).forEach((t, i) => {
    const tw = `${w}.tracks[${i}]`;
    const P = paths.list.find((x) => x.slug === t.pathway);
    if (!P || !P.live) err(tw, `pathway "${t.pathway}" is not a live pathway`);
    const of = path.join(root, 'assets/data/us/oews', `${t.soc}.json`);
    const m = fs.existsSync(of) ? JSON.parse(fs.readFileSync(of, 'utf8')) : null;
    const mm = m && m.metros && m.metros[h.metro];
    if (!mm) err(tw, `no OEWS metro ${h.metro} for SOC ${t.soc}`);
    else for (const [k, v] of [['emp', mm.emp], ['median', mm.median], ['p90', mm.p90], ['national_median', m.national.median]])
      if (t.pay?.[k] !== v) err(tw, `pay.${k} ${t.pay?.[k]} != BLS file ${v}`);
    for (const s of t.steps || []) needSrc(tw, s.source);
    for (const b of t.badges || []) needSrc(tw, b.source);
    for (const e of t.employers || []) { needSrc(tw, e.source); if (e.source2) needSrc(tw, e.source2); }
    for (const s of t.schools_note_sources || []) needSrc(tw, s);
    needSrc(tw, t.schools_source);
    const cf = path.join(root, 'assets/data/us/colleges', `${t.colleges}.json`);
    const c = fs.existsSync(cf) ? JSON.parse(fs.readFileSync(cf, 'utf8')) : null;
    if (!c) { err(tw, `no colleges file ${t.colleges}.json`); return; }
    for (const s of t.schools || []) {
      const r = c.rows.find((x) => x[0] === s.unitid);
      const n = r && Object.values(r[7]).reduce((a, b) => a + b, 0);
      if (!r) err(tw, `unitid ${s.unitid} (${s.name}) not in ${t.colleges}.json`);
      else if (n !== s.count) err(tw, `${s.name}: count ${s.count} != IPEDS ${n}`);
    }
  });
}

// USA home (2026-10-20, Master Plan Phase 1 gateway): the five routes are short cards whose detail moved to a hub
// (`moved_to` must be a page that exists; verify-site checks the #anchor), and the home keeps a data-route card per
// old anchor so us/#<id> still forwards. Six support hub cards: `href` only to a page that exists, else a phase.
// home.yml facts need known sources and whole-number pay/outlook.
const home = load('home');
const homeHtml = fs.readFileSync(path.join(root, 'us/index.html'), 'utf8');
const pageExists = (u) => { const p = String(u).split('#')[0]; return fs.existsSync(path.join(root, p.endsWith('/') ? p + 'index.html' : p)); };
if ((home.vectors || []).length !== 5) err('home.vectors', 'expected exactly 5 routes');
for (const v of home.vectors || []) {
  if (!v.moved_to || !pageExists(v.moved_to)) err(`home.vectors.${v.id}`, `moved_to "${v.moved_to}" is not a page`);
  if (!homeHtml.includes('data-route="{{ v.id }}"')) err(`home.vectors.${v.id}`, 'us/index.html must render the route cards with data-route (old anchors forward through them)');
}
if ((home.support || []).length !== 6) err('home.support', 'expected the 6 support hubs');
for (const s of home.support || []) {
  const w = `home.support.${s.id}`;
  if (!s.title || !s.line || !s.planned) err(w, 'needs title, line, planned');
  if (!Number.isInteger(s.phase)) err(w, 'phase must be a Master Plan phase number');
  if (s.href && !pageExists(s.href)) err(w, `href "${s.href}" is not a page: drop href until the hub exists`);
  if (!s.href && pageExists(s.planned)) err(w, `${s.planned} exists now: give the card href`);
}
const homeRows = [...(home.trades || []).map((t, i) => [`home.trades[${i}]`, t]), ...((home.public_sector || {}).jobs || []).map((t, i) => [`home.public_sector.jobs[${i}]`, t])];
for (const [w, t] of homeRows) {
  needSrc(w, t.source);
  if (!Number.isInteger(t.pay) || t.pay < 10000) err(w, 'pay must be a whole annual dollar figure');
  if (!Number.isInteger(t.outlook)) err(w, 'outlook must be a whole percent');
}
const ps = home.public_sector || {};
needSrc('home.public_sector.federal', ps.federal?.source);
(ps.federal?.facts || []).forEach((f, i) => needSrc(`home.public_sector.federal.facts[${i}]`, f.source));
needSrc('home.public_sector.state_local', ps.state_local?.source);
// Phase 5: Foreign Service + military routes (hub #service-routes). Every row needs its own source; links must exist.
(ps.jobs || []).forEach((j, i) => { if (j.href && !fs.existsSync(path.join(root, j.href, 'index.html'))) err(`home.public_sector.jobs[${i}]`, `href "${j.href}" is not a page`); });
if (ps.service_routes) {
  const SR = ps.service_routes, sw = 'home.public_sector.service_routes';
  const FSO = SR.foreign_service || {};
  for (const k of ['name', 'by', 'summary', 'rules', 'tracks']) if (!FSO[k]) err(`${sw}.foreign_service`, `missing ${k}`);
  if (!(FSO.steps || []).length) err(`${sw}.foreign_service`, 'needs steps');
  if (!/^https:\/\/careers\.state\.gov\//.test(FSO.href || '')) err(`${sw}.foreign_service`, 'href must be a careers.state.gov page');
  needSrc(`${sw}.foreign_service`, FSO.source);
  const EN = SR.enlisted || {};
  needSrc(`${sw}.enlisted.common`, EN.common_source); needSrc(`${sw}.enlisted.training`, EN.training_source);
  (EN.asvab_sources || []).forEach((s) => needSrc(`${sw}.enlisted.asvab`, s));
  if (!(EN.ages || []).length) err(`${sw}.enlisted`, 'needs ages rows');
  (EN.ages || []).forEach((a, i) => { if (!a.service || !a.age) err(`${sw}.enlisted.ages[${i}]`, 'needs service and age'); needSrc(`${sw}.enlisted.ages[${i}]`, a.source); });
  const OF = SR.officer || {};
  needSrc(`${sw}.officer.common`, OF.common_source);
  (OF.routes || []).forEach((r, i) => { if (!r.name || !r.text) err(`${sw}.officer.routes[${i}]`, 'needs name and text'); needSrc(`${sw}.officer.routes[${i}]`, r.source); });
}
if (!isDate(home.last_verified)) err('home', 'missing last_verified date');

// Cross-border tracks (2026-10-19): roadmap stubs us/roadmaps/<slug>.html, kinds, sources, review_by; each
// track belongs to a live pathway (its page shows the link card).
const cbSeen = new Set();
checkCrossborder({ root, ed: 'us', tracks: paths.crossborder, where: 'pathways', hasSrc: (id) => src.has(id), err, seen: cbSeen });
for (const X of paths.crossborder || []) {
  const P = paths.list.find((x) => x.slug === X.pathway);
  if (!P || !P.live || P.template !== 'v2') err(`pathways.crossborder[${X.slug}]`, `pathway "${X.pathway}" is not a live v2 pathway`);
}
// Trades & CTE (2026-10-20, split into hub → profile → roadmap): cte_careers.yml tracks share the cross-border
// route/step/stub checks (stubs us/cte/roadmaps/<slug>.html also say `cte: true`); each trade needs its profile
// stub us/cte/<slug>.html (trade: <slug>), a BLS `does` line and a redirect stub at the old us/roadmaps/<slug>.html;
// BLS metrics must be whole numbers that match the home trades table (the hub's entry matrix); every state row,
// certification and tools line needs a known source.
const cte = load('cte_careers');
if (!isDate(cte.checked) || !isDate(cte.review_by)) err('cte_careers', 'missing checked / review_by date');
const cteSeen = new Set();
checkCrossborder({ root, ed: 'us', tracks: cte.list, where: 'cte_careers', hasSrc: (id) => src.has(id), err, seen: cteSeen, dir: 'us/cte/roadmaps' });
for (const s of cteSeen) { if (cbSeen.has(s)) err(`cte_careers[${s}]`, 'slug also used by a cross-border track'); }
if (!fs.existsSync(path.join(root, 'us/cte/index.html'))) err('us/cte/index.html', 'Trades & CTE hub page is missing');
for (const X of cte.list || []) {
  const w = `cte_careers[${X.slug}]`;
  const stub = path.join(root, 'us/cte/roadmaps', `${X.slug}.html`);
  if (fs.existsSync(stub) && !/^cte:\s*true\s*$/m.test(fs.readFileSync(stub, 'utf8'))) err(w, `us/cte/roadmaps/${X.slug}.html must say cte: true`);
  const prof = path.join(root, 'us/cte', `${X.slug}.html`);
  if (!fs.existsSync(prof)) err(w, `us/cte/${X.slug}.html is missing (run scripts/build-intl-roadmaps.mjs)`);
  else if (!new RegExp(`^trade:\\s*${X.slug}\\s*$`, 'm').test(fs.readFileSync(prof, 'utf8'))) err(w, `us/cte/${X.slug}.html must say trade: ${X.slug}`);
  const old = path.join(root, 'us/roadmaps', `${X.slug}.html`);
  if (X.moved_from_roadmaps && (!fs.existsSync(old) || !fs.readFileSync(old, 'utf8').includes(`redirect_to: "`) || !fs.readFileSync(old, 'utf8').includes(`/us/cte/roadmaps/${X.slug}.html"`))) err(w, `us/roadmaps/${X.slug}.html must redirect to us/cte/roadmaps/${X.slug}.html`);
  if (!X.short) err(w, 'missing short');
  if (!X.does || !X.does.text) err(w, 'missing does.text (BLS "What they do" sentence)');
  else needSrc(`${w}.does`, X.does.source);
  const M = X.metrics || {};
  for (const k of ['pay', 'jobs', 'outlook', 'change']) if (!Number.isInteger(M[k])) err(`${w}.metrics`, `${k} must be a whole number`);
  if (!/^\d+\.\d{2}$/.test(M.pay_hour || '')) err(`${w}.metrics`, 'pay_hour must look like "30.38"');
  for (const k of ['outlook_words', 'entry', 'training']) if (!M[k]) err(`${w}.metrics`, `missing ${k}`);
  needSrc(`${w}.metrics`, M.source);
  const H = (home.trades || []).find((t) => t.name === X.home_trade);
  if (!H) err(w, `home_trade "${X.home_trade}" is not a row of home.yml trades`);
  else {
    if (H.pay !== M.pay) err(w, `pay ${M.pay} != home.yml ${H.pay}`);
    if (H.outlook !== M.outlook) err(w, `outlook ${M.outlook} != home.yml ${H.outlook}`);
    if (H.roadmap !== X.slug) err(w, `home.yml trade "${H.name}" needs roadmap: ${X.slug}`);
  }
  if (!X.states_note) err(w, 'missing states_note');
  if (!(X.states || []).length && !X.states_source) err(w, 'no state rows: states_note needs a states_source');
  if (X.states_source) needSrc(`${w}.states_source`, X.states_source);
  (X.states || []).forEach((r, i) => {
    for (const k of ['place', 'body', 'rule']) if (!r[k]) err(`${w}.states[${i}]`, `missing ${k}`);
    if (!(r.sources || []).length) err(`${w}.states[${i}]`, 'needs sources: [ids]');
    (r.sources || []).forEach((s) => needSrc(`${w}.states[${i}]`, s));
  });
  (X.certs || []).forEach((c, i) => { for (const k of ['name', 'who', 'text']) if (!c[k]) err(`${w}.certs[${i}]`, `missing ${k}`); needSrc(`${w}.certs[${i}]`, c.source); });
  (X.tools || []).forEach((t, i) => { if (!t.text) err(`${w}.tools[${i}]`, 'missing text'); needSrc(`${w}.tools[${i}]`, t.source); });
  // Phase 6: extra Key-numbers rows (e.g. CNC tool operators inside a wider BLS group) and the group name.
  (X.numbers_extra || []).forEach((n, i) => { if (!n.k || !n.v) err(`${w}.numbers_extra[${i}]`, 'needs k and v'); needSrc(`${w}.numbers_extra[${i}]`, n.source); });
  if (M.pay_by !== undefined && typeof M.pay_by !== 'string') err(`${w}.metrics`, 'pay_by must be text');
}
// Career Clusters (2026-10-20, USA Master Plan Phase 1): _data/us/clusters.yml = the 14 Advance CTE clusters and
// 72 sub-clusters; a `live` cluster has its hub stub us/clusters/<slug>/index.html (scripts/build-us-clusters.mjs)
// and only live clusters may have one. Every live pathway and every trade sits in exactly one cluster, and that
// placement must agree with Advance CTE's SOC crosswalk (scripts/data/acte-soc-crosswalk.json): the SOC has a row
// for (cluster, sub), `also` lists exactly the crosswalk's other clusters for it, and the chosen cluster has the
// most rows (tie: true when another cluster has as many). Generic careers (_data/us/careers/<cluster>.yml, Phase 2
// onward) share the cross-border route checks; their roadmaps live in us/roadmaps/ next to the cross-border tracks.
const CL = load('clusters');
// Kinds of credential (Phase 3): what is the law, what comes with the job, what is optional. Pathway roadmap certs may use them too.
const CRED_KINDS = ['State license', 'Federal license', 'Registration through an employer', 'Exam for a state license', 'Exam (no firm needed)', 'Professional credential', 'Voluntary', 'Employer may require'];
const XWF = path.join(root, 'scripts/data/acte-soc-crosswalk.json');
const XWR = fs.existsSync(XWF) ? JSON.parse(fs.readFileSync(XWF, 'utf8')).rows : [];
if (!XWR.length) err('scripts/data/acte-soc-crosswalk.json', 'missing or empty (run scripts/build-us-clusters.mjs --crosswalk <xlsx>)');
const day = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d));
if (!isDate(CL.checked) || !isDate(CL.review_by)) err('clusters', 'missing checked / review_by date');
else if (today > day(CL.review_by)) err('clusters', `review_by ${day(CL.review_by)} has passed: re-read the careertech.org pages, then move checked and review_by forward`);
const F = CL.framework || {};
needSrc('clusters.framework', F.source);
needSrc('clusters.framework.used_by', F.used_by_source);
const clusters = CL.clusters || [];
if (clusters.length !== F.clusters || F.clusters !== 14) err('clusters', `expected the 14 clusters (framework.clusters = ${F.clusters}, list = ${clusters.length})`);
const subTotal = clusters.reduce((n, c) => n + (c.sub_clusters || []).length, 0);
if (subTotal !== F.sub_clusters) err('clusters', `sub-clusters add up to ${subTotal}, framework says ${F.sub_clusters}`);
if (clusters.filter((c) => c.cross_cutting).length !== F.cross_cutting) err('clusters', `cross_cutting count != framework.cross_cutting (${F.cross_cutting})`);
const cslugs = new Set(clusters.map((c) => c.slug));
if (cslugs.size !== clusters.length) err('clusters', 'duplicate cluster slug');
const lc = (s) => String(s).toLowerCase();
const placed = new Map();   // "pathway:<slug>" / "trade:<slug>" / "career:<slug>" → cluster slug
const careerData = {};      // cluster slug → _data/us/careers/<slug>.yml
const careersDir = path.join(root, '_data/us/careers');
if (fs.existsSync(careersDir)) for (const f of fs.readdirSync(careersDir).filter((x) => x.endsWith('.yml'))) careerData[f.replace(/\.yml$/, '')] = yaml.load(fs.readFileSync(path.join(careersDir, f), 'utf8'));
for (const C of clusters) {
  const w = `clusters.${C.slug}`;
  if (!/^[a-z0-9-]+$/.test(C.slug || '')) err(w, 'bad slug');
  for (const k of ['name', 'summary', 'definition']) if (!C[k]) err(w, `missing ${k}`);
  if (C.definition && C.summary && !C.definition.startsWith(C.summary)) err(w, 'summary must be the first sentence of definition, unchanged');
  if (C.source !== `acte_${C.slug.replace(/-/g, '_')}`) err(w, `source must be acte_${C.slug.replace(/-/g, '_')}`);
  needSrc(w, C.source);
  if (!SRC_URL_OK(C)) err(w, `source url must be https://careertech.org/career-clusters/${C.slug}/`);
  if (!Number.isInteger(C.phase) || C.phase < 2 || C.phase > 8) err(w, 'phase must be 2–8 (the Master Plan cluster phases)');
  for (const s of C.connected || []) if (!cslugs.has(s) || s === C.slug) err(w, `connected "${s}" is not another cluster`);
  if (!C.cross_cutting && !(C.connected || []).length) err(w, 'a non-cross-cutting cluster lists its closely connected clusters');
  const subNames = new Set();
  for (const S of C.sub_clusters || []) {
    if (!S.name || !S.line || !Array.isArray(S.programs) || !S.programs.length) err(`${w}.sub_clusters`, `"${S.name}" needs name, line and programs`);
    if (subNames.has(S.name)) err(`${w}.sub_clusters`, `duplicate "${S.name}"`);
    subNames.add(S.name);
  }
  const hub = path.join(root, 'us/clusters', C.slug, 'index.html');
  if (C.live) {
    if (!fs.existsSync(hub)) err(w, `live but us/clusters/${C.slug}/index.html is missing (run scripts/build-us-clusters.mjs)`);
    else if (!new RegExp(`^cluster:\\s*${C.slug}\\s*$`, 'm').test(fs.readFileSync(hub, 'utf8'))) err(w, `us/clusters/${C.slug}/index.html must say cluster: ${C.slug}`);
    if (!(C.careers || []).length) err(w, 'a live hub needs at least one career page');
  } else if (fs.existsSync(hub)) err(w, `us/clusters/${C.slug}/ exists but the cluster is not live`);
  if (C.public_sector && !(home.public_sector || {}).federal) err(w, 'public_sector: true needs home.yml public_sector');
  // Phase 3: the hub's "Certifications and licenses" table: each row says what kind of credential it is and links a page.
  (C.credentials || []).forEach((K, i) => {
    const kw = `${w}.credentials[${i}]`;
    for (const k of ['name', 'owner', 'kind', 'what', 'for', 'href']) if (!K[k]) err(kw, `missing ${k}`);
    if (K.kind && !CRED_KINDS.includes(K.kind)) err(kw, `kind must be one of: ${CRED_KINDS.join(' | ')}`);
    if (K.href && !pageExists(K.href)) err(kw, `href "${K.href}" is not a page`);
    needSrc(kw, K.source);
  });
  // Phase 4: the hub's "Start a small business" block: SBA's own guide (sba.gov links only), every step titled, each group sourced.
  if (C.small_business) {
    const SB = C.small_business, sw = `${w}.small_business`;
    if (!SB.intro) err(sw, 'missing intro');
    needSrc(sw, SB.source);
    if (!(SB.groups || []).length) err(sw, 'needs groups');
    (SB.groups || []).forEach((G, i) => {
      if (!G.name || !(G.steps || []).length) err(`${sw}.groups[${i}]`, 'needs name and steps');
      if (!/^https:\/\/www\.sba\.gov\//.test(G.href || '')) err(`${sw}.groups[${i}]`, 'href must be an https://www.sba.gov/ page');
      needSrc(`${sw}.groups[${i}]`, G.source);
      (G.steps || []).forEach((st, j) => { if (!st.title || typeof st.text !== 'string') err(`${sw}.groups[${i}].steps[${j}]`, 'needs title and text ("" for none)'); });
    });
    const H = SB.help || {};
    if (!H.text || !(H.partners || []).length) err(`${sw}.help`, 'needs text and partners');
    if (!/^https:\/\/www\.sba\.gov\//.test(H.href || '')) err(`${sw}.help`, 'href must be an https://www.sba.gov/ page');
    needSrc(`${sw}.help`, H.source);
  }
  for (const E of C.careers || []) {
    const kinds = ['pathway', 'trade', 'career'].filter((k) => E[k]);
    const ew = `${w}.careers[${E[kinds[0]] || '?'}]`;
    if (kinds.length !== 1) { err(ew, 'needs exactly one of pathway / trade / career'); continue; }
    const key = `${kinds[0]}:${E[kinds[0]]}`;
    if (placed.has(key)) err(ew, `${key} is already placed in ${placed.get(key)}`);
    placed.set(key, C.slug);
    const sub = (C.sub_clusters || []).find((s) => s.name === E.sub);
    if (!sub) { err(ew, `sub "${E.sub}" is not a sub-cluster of ${C.name}`); continue; }
    let socs = [];
    if (E.pathway) {
      const P = paths.list.find((p) => p.slug === E.pathway);
      if (!P || !P.live) { err(ew, `pathway "${E.pathway}" is not a live pathway`); continue; }
      socs = (occ[P.lead] || {}).soc || [];
    } else if (E.trade) {
      if (!(cte.list || []).some((t) => t.slug === E.trade)) err(ew, `trade "${E.trade}" is not in cte_careers.yml`);
      if (!(home.trades || []).some((t) => t.roadmap === E.trade)) err(ew, `trade "${E.trade}" has no home.yml trades row`);
      socs = [E.soc];
    } else {
      const X = (careerData[C.slug]?.list || []).find((x) => x.slug === E.career);
      if (!X) { err(ew, `career "${E.career}" is not in _data/us/careers/${C.slug}.yml`); continue; }
      socs = [].concat(X.soc || []);
    }
    if (!socs.length || !socs.every((s) => /^\d{2}-\d{4}$/.test(s))) { err(ew, 'needs SOC code(s) like "47-2111"'); continue; }
    // A BLS broad code ending in 0 (29-1210 Physicians) covers the crosswalk's detailed codes (29-1211 … 29-1219).
    const rows = XWR.filter((r) => socs.some((s) => r[0] === s || (s.endsWith('0') && r[0].startsWith(s.slice(0, 6)))));
    if (!rows.length) { err(ew, `SOC ${socs.join(', ')} is not in the Advance CTE crosswalk`); continue; }
    if (!rows.some((r) => r[2] === C.name && lc(r[3]) === lc(sub.xw || sub.name))) err(ew, `crosswalk has no row for ${socs.join(', ')} in ${C.name} > ${sub.xw || sub.name}`);
    const count = {};
    for (const r of rows) count[r[2]] = (count[r[2]] || 0) + 1;
    const nameToSlug = Object.fromEntries(clusters.map((c) => [c.name, c.slug]));
    const others = Object.keys(count).filter((n) => n !== C.name).map((n) => nameToSlug[n] || `?${n}`).sort();
    const also = [...(E.also || [])].sort();
    if (others.join() !== also.join()) err(ew, `also must be [${others.join(', ')}] (the crosswalk's other clusters), got [${also.join(', ')}]`);
    const best = Math.max(...Object.values(count));
    if ((count[C.name] || 0) < best) err(ew, `${C.name} has ${count[C.name] || 0} crosswalk rows but another cluster has ${best}: place it there`);
    const tied = Object.entries(count).filter(([n, k]) => k === best && n !== C.name).length > 0;
    if (tied !== !!E.tie) err(ew, tied ? 'tied with another cluster: add tie: true' : 'not a tie: remove tie: true');
  }
}
function SRC_URL_OK(C) { return (sources.list[C.source] || {}).url === `https://careertech.org/career-clusters/${C.slug}/`; }
for (const P of paths.list) if (P.live && !placed.has(`pathway:${P.slug}`)) err(`pathways.${P.slug}`, 'live pathway is not placed in any cluster (clusters.yml careers)');
for (const T of cte.list || []) if (!placed.has(`trade:${T.slug}`)) err(`cte_careers.${T.slug}`, 'trade is not placed in any cluster (clusters.yml careers)');
const hubDir = path.join(root, 'us/clusters');
if (!fs.existsSync(path.join(hubDir, 'index.html'))) err('us/clusters/index.html', 'clusters index page is missing');
if (fs.existsSync(hubDir)) for (const d of fs.readdirSync(hubDir, { withFileTypes: true }).filter((x) => x.isDirectory())) if (!cslugs.has(d.name)) err(`us/clusters/${d.name}/`, 'no cluster with this slug');
// USA sidebar (_data/nav_us.yml "Career Clusters"): one child per live hub, none for a cluster without a hub.
const navUs = fs.readFileSync(path.join(root, '_data/nav_us.yml'), 'utf8');
const navHubs = new Set([...navUs.matchAll(/href: "us\/clusters\/([a-z0-9-]+)\/"/g)].map((m) => m[1]));
for (const C of clusters) if (!!C.live !== navHubs.has(C.slug)) err('_data/nav_us.yml', `Career Clusters menu ${C.live ? 'is missing the live hub' : 'links the unbuilt hub'} us/clusters/${C.slug}/`);
// Generic careers: required facts, sources, stubs; routes share the cross-border checks (stubs in us/roadmaps/).
for (const [cslug, D] of Object.entries(careerData)) {
  const C = clusters.find((c) => c.slug === cslug);
  if (!C) { err(`_data/us/careers/${cslug}.yml`, 'file name must be a cluster slug'); continue; }
  if (!isDate(D.checked) || !isDate(D.review_by)) err(`careers.${cslug}`, 'missing checked / review_by date');
  const withRoutes = (D.list || []).filter((X) => (X.routes || []).length);
  for (const X of withRoutes) { X.checked = X.checked || D.checked; X.review_by = X.review_by || D.review_by; }
  checkCrossborder({ root, ed: 'us', tracks: withRoutes, where: `careers.${cslug}`, hasSrc: (id) => src.has(id), err, seen: cbSeen });
  for (const X of D.list || []) {
    const w = `careers.${cslug}[${X.slug}]`;
    if (!placed.has(`career:${X.slug}`) && !placed.has(`pathway:${X.pathway}`)) err(w, `not listed in clusters.yml ${cslug} careers`);
    // A route id becomes an element id on the roadmap: it must not repeat a section id of intl-roadmap.html.
    for (const R of X.routes || []) if (['main', 'numbers', 'tools', 'certs', 'states', 'watch', 'next', 'related'].includes(R.id)) err(`${w}.routes[${R.id}]`, 'route id is also a section id on the roadmap page: rename it');
    // certs (pathway roadmaps included): name, text, source and an allowed kind
    for (const c of X.certs || []) { if (!c.name || !c.text) err(`${w}.certs`, 'needs name and text'); needSrc(`${w}.certs`, c.source); if (c.kind && !CRED_KINDS.includes(c.kind)) err(`${w}.certs`, `"${c.name}": kind must be one of: ${CRED_KINDS.join(' | ')}`); }
    if (X.pathway) { if (!paths.list.some((p) => p.slug === X.pathway && p.live)) err(w, `pathway "${X.pathway}" is not live`); continue; }
    for (const k of ['short', 'eyebrow', 'lede', 'for']) if (!X[k]) err(w, `missing ${k}`);
    for (const k of ['does', 'become']) { if (!X[k]?.text) err(w, `missing ${k}.text (BLS OOH summary line)`); else needSrc(`${w}.${k}`, X[k].source); }
    if (X.work) needSrc(`${w}.work`, X.work.source);
    const M = X.metrics || {};
    for (const k of ['jobs', 'outlook', 'change']) if (!Number.isInteger(M[k])) err(`${w}.metrics`, `${k} must be a whole number`);
    // pay: null only where BLS publishes an hourly wage alone (actors, musicians, dancers); then pay_hour is required.
    if (M.pay === null ? !M.pay_hour : !Number.isInteger(M.pay)) err(`${w}.metrics`, 'pay must be a whole number (or null with pay_hour when BLS gives only an hourly wage)');
    // pay_hour: null only where BLS publishes an annual wage alone (teachers); the key must still be there.
    if (!('pay_hour' in M) || (M.pay_hour !== null && !/^\d+\.\d{2}$/.test(M.pay_hour))) err(`${w}.metrics`, 'pay_hour must look like "30.38" (or null when BLS gives no hourly wage)');
    for (const k of ['outlook_words', 'entry', 'training']) if (!M[k]) err(`${w}.metrics`, `missing ${k}`);
    needSrc(`${w}.metrics`, M.source);
    if ((X.states_title || X.states_col) && !(X.states || []).length) err(w, 'states_title / states_col need inline `states` rows');
    if (X.license && !lic[X.license]) err(w, `unknown license "${X.license}"`);
    if (X.license && !pageExists(`us/professional-licenses/${X.license}/`)) err(w, `no license page us/professional-licenses/${X.license}/`);
    for (const x of X.exams || []) if (!x.name || !x.href || !pageExists(x.href)) err(w, `exam button "${x.name}" needs an href to a page that exists`);
    if (X.colleges && !pageExists(X.colleges)) err(w, `colleges "${X.colleges}" is not a page`);
    if (X.states_from && !(lic[X.states_from]?.boards || []).length) err(w, `states_from "${X.states_from}" needs a license with boards`);
    if (X.states_source) needSrc(`${w}.states_source`, X.states_source);
    if (!X.license && !X.license_text) err(w, 'needs license (an id) or license_text');
    const ov = path.join(root, 'us/careers', X.slug, 'index.html');
    if (!fs.existsSync(ov) || !new RegExp(`^career:\\s*${X.slug}\\s*$`, 'm').test(fs.readFileSync(ov, 'utf8'))) err(w, `us/careers/${X.slug}/index.html must exist and say career: ${X.slug} (run scripts/build-us-clusters.mjs)`);
    if ((X.routes || []).length && !/^career:\s*true\s*$/m.test(fs.existsSync(path.join(root, 'us/roadmaps', `${X.slug}.html`)) ? fs.readFileSync(path.join(root, 'us/roadmaps', `${X.slug}.html`), 'utf8') : '')) err(w, `us/roadmaps/${X.slug}.html must say career: true`);
  }
}

checkOrphanRoadmaps({ root, ed: 'us', seen: cbSeen, err });
checkOrphanRoadmaps({ root, ed: 'us', seen: cteSeen, err, dir: 'us/cte/roadmaps' });
for (const f of fs.readdirSync(path.join(root, 'us/cte')).filter((x) => x.endsWith('.html') && x !== 'index.html')) {
  if (!cteSeen.has(f.replace(/\.html$/, ''))) err(`us/cte/${f}`, 'no cte_careers trade with this slug');
}

// Exams hub (Master Plan Phase 9, 2026-10-21): _data/us/exams.yml. Every exam sits in exactly one stage, has its stub
// (scripts/build-us-exams.mjs), cites known sources on every block, keeps table rows as wide as the header, agrees with
// its tests.yml record (every number in that record's score range appears on the exam page), and links only to pages
// that exist. The AP subject list keeps the count College Board states. Then every roadmap step (careers, trades,
// cross-border tracks) and service-academy route that names a Phase 9 exam must link that exam's page.
const exams = load('exams');
const EXS = exams.exams || {};
if (!isDate(exams.as_of) || !isDate(exams.review_by)) err('exams', 'missing as_of / review_by');
const stageOf = {};
for (const st of exams.stages || []) {
  const w = `exams.stages.${st.id}`;
  if (!st.id || !st.title || !st.line) err(w, 'needs id, title, line');
  if (st.source) needSrc(w, st.source);
  if (!(st.exams || []).length && !(st.elsewhere || []).length) err(w, 'a stage needs exam pages or `elsewhere` links');
  for (const s of st.exams || []) { if (!EXS[s]) err(w, `unknown exam "${s}"`); if (stageOf[s]) err(w, `exam "${s}" is in two stages`); stageOf[s] = st.id; }
  for (const l of st.elsewhere || []) if (!l.label || !l.text || !pageExists(l.href)) err(w, `elsewhere "${l.label}" needs label, text and an href to a page that exists`);
}
for (const [slug, E] of Object.entries(EXS)) {
  const w = `exams.${slug}`;
  for (const k of ['name', 'short', 'by', 'stage', 'grades', 'lede']) if (!E[k]) err(w, `missing ${k}`);
  if (!['current', 'retired'].includes(E.status)) err(w, 'status must be current or retired');
  if (stageOf[slug] !== E.stage) err(w, `stage "${E.stage}" must list this exam (stages[].exams)`);
  if ((E.facts || []).length !== 4 || E.facts.some((f) => !f.label || !f.value)) err(w, 'needs exactly 4 facts with label and value');
  if (!E.page?.title || !E.page?.description) err(w, 'needs page.title and page.description');
  if (!E.search?.s || !E.search?.k) err(w, 'needs search.s and search.k (_data/search.yml entry)');
  const S = E.sections || {};
  if (Object.keys(S).length < 3) err(w, 'needs at least 3 sections (with Used by + Sources the page gets 4+ h2 for the rail)');
  for (const k of Object.keys(S)) if (!['who', 'format', 'scoring', 'fees', 'dates', 'accepted', 'practice'].includes(k)) err(w, `unknown section "${k}"`);
  for (const [k, B] of Object.entries(S)) {
    const bw = `${w}.${k}`;
    if ((B.intro || B.table) && !B.source && !(B.table?.row_src)) err(bw, 'intro / table needs a source');
    if (B.source) needSrc(bw, B.source);
    if (B.table) {
      const n = (B.table.head || []).length;
      (B.table.rows || []).forEach((r, i) => { if (r.length !== n) err(bw, `table row ${i} has ${r.length} cells, header has ${n}`); });
      if (B.table.row_src) { if (B.table.row_src.length !== B.table.rows.length) err(bw, 'row_src needs one source per row'); B.table.row_src.forEach((id) => needSrc(bw, id)); }
    }
    (B.points || []).forEach((p, i) => { if (!p.t) err(bw, `point ${i} has no text`); needSrc(`${bw}.points[${i}]`, p.src); });
    if (!B.intro && !B.table && !(B.points || []).length) err(bw, 'empty section');
  }
  const U = E.used_by || {};
  if (U.careers && !['bachelor', 'hs'].includes(U.careers)) err(`${w}.used_by`, 'careers must be bachelor or hs');
  (U.colleges || []).forEach((c) => { if (!c.name || !c.text) err(`${w}.used_by`, 'college needs name and text'); needSrc(`${w}.used_by`, c.src); });
  (U.links || []).forEach((l) => { if (!l.label || !pageExists(l.href)) err(`${w}.used_by`, `link "${l.label}" must point to a page that exists`); });
  if (!U.careers && !(U.colleges || []).length && !(U.links || []).length && !(U.need || []).length) err(`${w}.used_by`, 'needs careers, need, colleges or links');
  // Phase 10: `license` links the license page (facts stay there); `need` = careers whose roadmap has this exam as a
  // step (the step names the exam or links its page) or pathway guides (us/careers/<slug>/).
  if (E.license && (!lic[E.license] || !pageExists(`us/professional-licenses/${E.license}/`))) err(w, `license "${E.license}" needs a licenses.yml entry and its us/professional-licenses/ page`);
  for (const n of U.need || []) {
    const X = Object.values(careerData).flatMap((D) => D.list || []).find((x) => x.slug === n);
    if (X) {
      const named = (X.routes || []).some((R) => (R.steps || []).some((st) => st.kind === 'exam' && ((st.href || '').startsWith(`us/exams/${slug}/`) || (st.title || '').includes(E.short))));
      if (!named) err(`${w}.used_by.need`, `career "${n}" has no roadmap step that names ${E.short} or links us/exams/${slug}/`);
      if (!pageExists(`us/roadmaps/${n}.html`)) err(`${w}.used_by.need`, `us/roadmaps/${n}.html does not exist`);
    } else if (!(paths.list || []).some((p) => p.slug === n) || !pageExists(`us/careers/${n}/`)) err(`${w}.used_by.need`, `"${n}" is neither a career with a roadmap nor a live pathway page`);
  }
  if (E.tests) {
    const [grp, id] = E.tests.split('.');
    const T = tests[grp]?.[id];
    if (!T) err(w, `tests "${E.tests}" is not a tests.yml record`);
    else { const blob = JSON.stringify(E); for (const num of String(T.total).match(/\d[\d,]*/g) || []) if (!blob.includes(num)) err(w, `tests.yml ${E.tests} total "${T.total}" (${num}) does not appear on the exam page: keep them in step`); }
  }
  const stub = path.join(root, 'us/exams', slug, 'index.html');
  if (!fs.existsSync(stub) || !new RegExp(`^exam:\\s*${slug}\\s*$`, 'm').test(fs.readFileSync(stub, 'utf8'))) err(w, `us/exams/${slug}/index.html must exist and say exam: ${slug} (run scripts/build-us-exams.mjs)`);
}
if (!fs.existsSync(path.join(root, 'us/exams/index.html'))) err('us/exams/index.html', 'exams hub is missing (run scripts/build-us-exams.mjs)');
for (const s of Object.keys(EXS)) if (!stageOf[s]) err(`exams.${s}`, 'not in any stage');
// Military Pathways (2026-10-23): exams.asvab.military. Every branch names its age source and rulebook, every AFQT
// row names a known branch, and sections.accepted.table (what the page shows) matches asvab_scores cell for cell
// (a null minimum must show as words, never a number).
const MIL = EXS.asvab?.military;
if (MIL) {
  const w = 'exams.asvab.military';
  if (!isDate(MIL.as_of)) err(w, 'missing as_of');
  const ids = new Set();
  for (const B of MIL.military_branches || []) {
    if (!B.id || !B.name || !B.age || !B.education || !B.components) err(`${w}.military_branches`, `branch "${B.id}" needs id, name, components, age and education`);
    needSrc(`${w}.military_branches.${B.id}`, B.age_src); needSrc(`${w}.military_branches.${B.id}`, B.rulebook); ids.add(B.id);
  }
  const rows = EXS.asvab.sections?.accepted?.table?.rows || [];
  const S = MIL.asvab_scores || [];
  if (S.length !== rows.length) err(`${w}.asvab_scores`, `${S.length} rows, but sections.accepted.table has ${rows.length}`);
  S.forEach((A, i) => {
    const aw = `${w}.asvab_scores.${A.branch}`;
    if (!ids.has(A.branch)) err(aw, 'branch is not in military_branches');
    needSrc(aw, A.src);
    if (EXS.asvab.sections.accepted.table.row_src?.[i] !== A.src) err(aw, 'accepted.table row_src must match src');
    ['tier1', 'tier2', 'tier3'].forEach((k, j) => {
      const cell = String(rows[i]?.[j + 1] ?? '');
      if (A[k] == null ? /^\d+$/.test(cell) : cell !== String(A[k])) err(aw, `${k} ${A[k]} but the page table shows "${cell}"`);
    });
  });
  const G = MIL.gi_bill_benefits || {};
  if (!G.name || !G.rates_period) err(`${w}.gi_bill_benefits`, 'needs name and rates_period');
  for (const k of ['entitlement', 'tuition', 'housing', 'books']) { if (!G[k]?.t) err(`${w}.gi_bill_benefits`, `missing ${k}`); else needSrc(`${w}.gi_bill_benefits.${k}`, G[k].src); }
  (G.eligibility || []).forEach((p, i) => needSrc(`${w}.gi_bill_benefits.eligibility[${i}]`, p.src));
  if (!(G.eligibility || []).length) err(`${w}.gi_bill_benefits`, 'needs eligibility points');
}
const apStated = (EXS.ap?.facts || []).find((f) => f.label === 'Subjects')?.value;
if (String((exams.ap_subjects || []).length) !== String(apStated)) err('exams.ap_subjects', `${(exams.ap_subjects || []).length} subjects, but the AP page states ${apStated}`);
for (const a of exams.ap_subjects || []) if (!a.name || !a.group || !a.exam || !/^https:\/\/apstudents\.collegeboard\.org\/courses\//.test(a.url || '')) err(`exams.ap_subjects[${a.name}]`, 'needs name, group, exam and its apstudents course url');
if (!pageExists('us/exams/') || home.support.find((s) => s.id === 'exams')?.href !== 'us/exams/') err('home.support.exams', 'the Exams card must link us/exams/');
if (!/href: us\/exams\/\n/.test(navUs.replace(/\r/g, ''))) err('_data/nav_us.yml', 'the USA menu needs the Exams hub (href: us/exams/)');
for (const [id, L] of Object.entries(lic)) for (const x of L.exams || []) if (x.page && !pageExists(x.page)) err(`licenses.${id}.exams`, `page ${x.page} does not exist`);
for (const [grp, G] of Object.entries(tests)) if (G && typeof G === 'object') for (const [id, T] of Object.entries(G)) if (T?.page && !pageExists(T.page)) err(`tests.${grp}.${id}`, `page ${T.page} does not exist`);
// Roadmap gates: a step that names an exam with its own page links that page (the equivalency gate: GED or HiSET).
// Phase 9 = school-stage exams; Phase 10 batch 1 = graduate admission and health licensing exams.
const GATES = [[/\bGED\b|diploma or equivalent/i, /^us\/exams\/(ged\/|hiset\/|#equivalency)/], [/\bSAT\b/, /^us\/exams\/sat\//], [/\bACT\b(?! WorkKeys)/, /^us\/exams\/act\//], [/\bCLT\b/, /^us\/exams\/clt\//], [/\bASVAB\b/, /^us\/exams\/asvab\//], [/\bTOEFL\b/, /^us\/exams\/toefl-ibt\//], [/\bIELTS\b/, /^us\/exams\/ielts\//], [/\bCLEP\b/, /^us\/exams\/clep\//], [/\bWorkKeys\b|\bNCRC\b/, /^us\/exams\/workkeys\//],
  [/\bGMAT\b|\bGRE\b/, /^us\/exams\/(gmat|gre)\//], [/\bLSAT\b/, /^us\/exams\/lsat\//], [/\bMCAT\b/, /^us\/exams\/mcat\//], [/\bDAT\b/, /^us\/exams\/dat\//], [/\bOAT\b/, /^us\/exams\/oat\//],
  [/\bUSMLE\b/, /^us\/exams\/usmle\//], [/^COMLEX/, /^us\/exams\/comlex-usa\//], [/\bNCLEX-RN\b/, /^us\/exams\/nclex-rn\//], [/\bNCLEX-PN\b/, /^us\/exams\/nclex-pn\//], [/\bNAPLEX\b|\bMPJE\b/, /^us\/exams\/naplex-mpje\//],
  [/\bINBDE\b/, /^us\/exams\/inbde\//], [/\bNPTE\b/, /^us\/exams\/npte\//], [/\bPANCE\b/, /^us\/exams\/pance\//], [/\bNBCOT\b/, /^us\/exams\/nbcot\//], [/\bEPPP\b/, /^us\/exams\/eppp\//], [/^NCE\b/, /^us\/exams\/nce\//]];
const gateTracks = [...Object.entries(careerData).flatMap(([c, D]) => (D.list || []).map((X) => [`careers.${c}[${X.slug}]`, X])), ...(cte.list || []).map((T) => [`cte_careers[${T.slug}]`, T]), ...(paths.crossborder || []).map((T) => [`pathways.crossborder[${T.slug}]`, T])];
let gatesLinked = 0;
for (const [w, X] of gateTracks) for (const R of X.routes || []) for (const s of R.steps || []) for (const [re, want] of GATES) {
  if (!re.test(s.title || '')) continue;
  if (!s.href || !want.test(s.href)) err(`${w}.routes[${R.id}]`, `step "${s.title}" names an exam with its own page: give it href ${want.source.replace(/\\/g, '').replace(/^\^/, '')}…`); else gatesLinked++;
}
for (const r of home.public_sector?.service_routes?.officer?.routes || []) {
  for (const [re, want] of GATES) if (re.test(r.text || '') && !(r.exams || []).some((x) => want.test(x.href))) err(`home.service_routes.officer[${r.name}]`, `names an exam with a page (${re.source}): add it to exams:`);
  for (const x of r.exams || []) if (!pageExists(x.href)) err(`home.service_routes.officer[${r.name}]`, `exam link ${x.href} is not a page`);
}

// States hub (USA Master Plan Phase 11 + 12, 2026-10-21): _data/us/state_index.yml (51 rows, Census figures) and one
// _data/us/states/<slug>.yml per built state. Every block cites a known source; license rows are keyed by a
// licenses.yml id or a cte_careers.yml trade slug and never repeat a place already in licenses.yml boards / cte states.
const SIX = load('state_index');
const stDir = path.join(root, '_data/us/states');
const stFiles = fs.existsSync(stDir) ? fs.readdirSync(stDir).filter((f) => f.endsWith('.yml')) : [];
if ((SIX.list || []).length !== 51) err('state_index', `expected 51 jurisdictions, got ${(SIX.list || []).length}`);
needSrc('state_index', SIX.source);
const ixSlugs = new Set();
for (const r of SIX.list || []) {
  if (ixSlugs.has(r.slug)) err('state_index', `duplicate slug ${r.slug}`);
  ixSlugs.add(r.slug);
  if (typeof r.pop !== 'number' || typeof r.rank !== 'number' || !/^[A-Z]{2}$/.test(r.abbr || '')) err(`state_index.${r.slug}`, 'needs numeric pop and rank and a 2-letter abbr');
}
const tradeSlugs = new Set((cte.list || []).map((t) => t.slug));
let stLicRows = 0;
for (const f of stFiles) {
  const slug = f.slice(0, -4);
  const w = `states.${slug}`;
  const S = yaml.load(fs.readFileSync(path.join(stDir, f), 'utf8'));
  const row = (SIX.list || []).find((r) => r.slug === slug);
  if (!row) { err(w, 'no row in state_index.yml'); continue; }
  if (S.name !== row.name || S.abbr !== row.abbr) err(w, `name/abbr must match state_index (${row.name}, ${row.abbr})`);
  if (!isDate(S.checked) || !isDate(S.review_by)) err(w, 'needs checked and review_by dates');
  else if (immIso(S.review_by) < immToday) err(w, `review_by ${immIso(S.review_by)} has passed: re-check the state's pages`);
  // 50-state portal (2026-10-22): every file has `boards` (bar, medical, accountancy, nursing boards, each from a
  // national directory source). A boards-tier file (no diploma block yet) needs only lede + boards; once a file has a
  // diploma block, every Phase 11 block is required.
  if (!S.lede) err(w, 'missing lede');
  const BD = S.boards || {};
  if (!S.boards) err(w, 'missing boards (bar admission, medical, accountancy and nursing boards)');
  else {
    const L = BD.law || {};
    if (!L.body || !/^https?:\/\//.test(L.url || '') || !L.stat || !L.exam) err(`${w}.boards.law`, 'needs body, url, stat and exam');
    needSrc(`${w}.boards.law`, L.src);
    for (const k of ['medicine', 'cpa', 'nursing']) {
      const G = BD[k] || {};
      needSrc(`${w}.boards.${k}`, G.src);
      if (!(G.boards || []).length) err(`${w}.boards.${k}`, 'needs at least one board');
      (G.boards || []).forEach((b, i) => { if (!b.body || !/^https?:\/\//.test(b.url || '')) err(`${w}.boards.${k}[${i}]`, 'needs body and url'); });
    }
  }
  if (!S.diploma) {
    for (const k of ['k12_test', 'colleges', 'residency', 'aid', 'jobs', 'apprenticeship', 'licenses']) if (S[k]) err(w, `boards-tier file has ${k} but no diploma block: add the full Phase 11 set`);
    if (!fs.existsSync(path.join(root, 'us/states', slug, 'index.html'))) err(w, `us/states/${slug}/index.html missing (run scripts/build-us-states.mjs)`);
    continue;
  }
  for (const k of ['diploma', 'k12_test', 'colleges', 'residency', 'aid', 'jobs', 'apprenticeship']) if (!S[k]) err(w, `missing ${k}`);
  const D = S.diploma || {};
  if (!D.intro || !D.tests) err(`${w}.diploma`, 'needs intro and tests');
  needSrc(`${w}.diploma`, D.src);
  (D.points || []).forEach((p) => needSrc(`${w}.diploma.points`, p.src));
  const K = S.k12_test || {};
  if (!K.name || !K.full || !(K.rows || []).length || !(K.use || []).length) err(`${w}.k12_test`, 'needs name, full, rows and use');
  needSrc(`${w}.k12_test`, K.src); needSrc(`${w}.k12_test.rows_src`, K.rows_src);
  (K.use || []).forEach((u) => needSrc(`${w}.k12_test.use`, u.src));
  const kinds = new Set();
  for (const c of S.colleges?.systems || []) {
    kinds.add(c.kind);
    if (!['university', 'community'].includes(c.kind) || !/^https:\/\//.test(c.url || '') || !c.line) err(`${w}.colleges[${c.name}]`, 'needs kind (university | community), https url and line');
    needSrc(`${w}.colleges[${c.name}]`, c.src); if (c.src2) needSrc(`${w}.colleges[${c.name}]`, c.src2);
  }
  if (!kinds.has('university') || !kinds.has('community')) err(`${w}.colleges`, 'needs a university system and a community college entry');
  if (!(S.residency?.points || []).length) err(`${w}.residency`, 'needs points');
  (S.residency?.points || []).forEach((p) => needSrc(`${w}.residency`, p.src));
  needSrc(`${w}.aid.agency`, S.aid?.agency?.src);
  if (!(S.aid?.programs || []).length) err(`${w}.aid`, 'needs at least one program');
  (S.aid?.programs || []).forEach((p) => needSrc(`${w}.aid[${p.name}]`, p.src));
  const J = S.jobs?.state || {};
  if (!J.portal || !/^https:\/\//.test(J.url || '') || !(J.steps || []).length) err(`${w}.jobs.state`, 'needs portal, https url and steps');
  needSrc(`${w}.jobs.state`, J.src);
  (S.jobs?.cities || []).forEach((c) => needSrc(`${w}.jobs.cities[${c.name}]`, c.src));
  const A = S.apprenticeship || {};
  if (!['SAA', 'OA', 'both'].includes(A.kind)) err(`${w}.apprenticeship`, 'kind must be SAA, OA or both');
  needSrc(`${w}.apprenticeship`, A.src); needSrc(`${w}.apprenticeship`, A.oa_src);
  for (const l of S.links || []) if (!pageExists(l.href)) err(`${w}.links`, `${l.href} is not a page`);
  for (const [k, R] of Object.entries(S.licenses || {})) {
    const lw = `${w}.licenses.${k}`;
    stLicRows++;
    if (!lic[k] && !tradeSlugs.has(k)) err(lw, 'key must be a licenses.yml id or a cte_careers.yml trade slug');
    if (!R.body || !R.req) err(lw, 'needs body and req');
    if (!(R.sources || []).length) err(lw, 'needs sources (the board page it was copied from)');
    (R.sources || []).forEach((s) => needSrc(lw, s));
    if ((lic[k]?.boards || []).some((b) => b.place === S.name)) err(lw, `licenses.yml ${k}.boards already has a ${S.name} row`);
    if (((cte.list || []).find((t) => t.slug === k)?.states || []).some((b) => b.place === S.name)) err(lw, `cte_careers ${k}.states already has a ${S.name} row`);
  }
  if (!fs.existsSync(path.join(root, 'us/states', slug, 'index.html'))) err(w, `us/states/${slug}/index.html missing (run scripts/build-us-states.mjs)`);
  if (S.licenses && !fs.existsSync(path.join(root, 'us/states', slug, 'licenses.html'))) err(w, `us/states/${slug}/licenses.html missing (run scripts/build-us-states.mjs)`);
}
for (const r of SIX.list || []) if (!stFiles.includes(r.slug + '.yml')) err(`states.${r.slug}`, 'no _data/us/states file: every jurisdiction needs at least a boards-tier page');
if (!pageExists('us/states/') || home.support.find((s) => s.id === 'states')?.href !== 'us/states/') err('home.support.states', 'the States card must link us/states/');
if (!/href: us\/states\/\n/.test(navUs.replace(/\r/g, ''))) err('_data/nav_us.yml', 'the USA menu needs the States hub (href: us/states/)');
console.log(`checked ${stFiles.length} state pages (${stLicRows} state license rows) against ${(SIX.list || []).length} jurisdictions`);

// ---- USA Master Plan Phase 13: colleges by state and city, program lists per career, apprenticeships ----
// Data from scripts/build-ipeds.mjs --places; pages from scripts/build-us-colleges.mjs (which has its own --check).
const readJ = (rel) => { try { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); } catch (e) { err(rel, 'missing or not JSON (run scripts/build-ipeds.mjs --places)'); return null; } };
const CIX = readJ('_data/us/college_index.json'), CFD = readJ('_data/us/college_fields.json'), CAP = readJ('_data/us/apprenticeships.json');
let clCities = 0, clSchools = 0;
if (CIX && CFD && CAP) {
  const MIN = CIX.min_city;
  if (MIN !== 3) err('college_index.min_city', 'city pages need at least 3 schools (same rule as the India landing pages)');
  for (const k of ['scorecard_data', 'scorecard_dictionary', 'ipeds_completions', 'cip_soc_crosswalk', 'cip_2020', 'dol_occupations', 'dol_rap', 'dol_job_finder']) if (!sources.list[k]) err('sources', `Phase 13 source ${k} missing`);
  const rel = new Date(CIX.scorecard_release + 'T00:00:00Z');
  const relWords = `${rel.getUTCDate()} ${rel.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })} ${rel.getUTCFullYear()}`;
  if (!String(sources.list.scorecard_data?.name || '').includes(relWords)) err('sources.scorecard_data', `name must name the release used (${relWords})`);
  for (const S of SIX.list || []) {
    const w = `college_index.states[${S.slug}]`;
    const I = CIX.states[S.slug];
    if (!I) { err(w, 'missing (every state in state_index.yml gets a colleges page)'); continue; }
    const D = readJ(`_data/us/college_states/${S.slug}.json`); if (!D) continue;
    if (I.abbr !== S.abbr || D.inst.length !== I.n) err(w, `abbr/count mismatch with college_states/${S.slug}.json`);
    const byCity = {}; for (const i of D.inst) { byCity[i.cs] = (byCity[i.cs] || 0) + 1; if (![1, 2, 3].includes(i.lv) || ![1, 2, 3].includes(i.ct)) err(w, `${i.n}: level/control code out of range`); if (i.gr != null && (i.gr < 0 || i.gr > 1)) err(w, `${i.n}: completion rate ${i.gr} is not a 0–1 share`); }
    const want = Object.entries(byCity).filter(([, n]) => n >= MIN).map(([c]) => c).sort();
    const have = I.cities.map((c) => c.s).sort();
    if (want.join() !== have.join()) err(w, 'city pages must be exactly the cities with ' + MIN + '+ schools');
    for (const c of I.cities) { if (byCity[c.s] !== c.count) err(`${w}.cities[${c.s}]`, 'count mismatch'); if (!pageExists(`us/colleges/${S.slug}/${c.s}/`)) err(`${w}.cities[${c.s}]`, 'stub missing (run scripts/build-us-colleges.mjs)'); }
    if (!pageExists(`us/colleges/${S.slug}/`)) err(w, 'stub missing (run scripts/build-us-colleges.mjs)');
    clCities += I.cities.length; clSchools += I.n;
  }
  if (clSchools !== CIX.national.n) err('college_index.national', 'n is not the sum of the states');
  const careerSlugs = new Set([...Object.values(careerData).flatMap((D) => (D.list || []).map((X) => X.slug)), ...(cte.list || []).map((T) => T.slug), ...paths.list.map((p) => p.slug)]);
  for (const [k, F] of Object.entries(CFD.fields)) {
    const w = `college_fields[${k}]`;
    if (!careerSlugs.has(k)) err(w, 'not a career, trade or pathway slug');
    if (!pageExists(F.href)) err(w, `career page ${F.href} missing`);
    if (!pageExists(`us/colleges/fields/${k}/`)) err(w, 'stub missing (run scripts/build-us-colleges.mjs)');
    const R = readJ(`assets/data/us/colleges/fields/${k}.json`);
    if (R && (R.rows.length !== F.institutions || R.institutions !== F.institutions)) err(w, 'institution count differs from the finder file');
    if (!(F.cip || []).length) err(w, 'needs at least one CIP program');
  }
  for (const k of Object.keys(CFD.skipped || {})) if (CFD.fields[k]) err(`college_fields.skipped[${k}]`, 'also has a list');
  for (const [k, A] of Object.entries(CAP.careers)) {
    if (!careerSlugs.has(k)) err(`apprenticeships[${k}]`, 'not a career, trade or pathway slug');
    for (const o of A.list) if (!o.code || !o.title || !Object.keys(o.terms || {}).length) err(`apprenticeships[${k}]`, `${o.title || '?'}: needs RAPIDS code, title and terms`);
  }
  if (home.support.find((s) => s.id === 'colleges')?.href !== 'us/colleges/') err('home.support.colleges', 'the Colleges & training card must link us/colleges/');
  if (!navUs.includes('href: "us/colleges/"')) err('_data/nav_us.yml', 'the USA menu needs us/colleges/');
}
// Coaching (Master Plan section 11): no private centres; every exam page shows the owner's own free practice instead.
for (const [k, E] of Object.entries(EXS)) {
  const P = E.sections?.practice;
  if (!P || !(P.points || []).length) err(`exams[${k}]`, "needs a practice section (the exam owner's own practice)");
  else for (const p of P.points) if (!p.src || !sources.list[p.src]) err(`exams[${k}].practice`, `point needs a known source id (${p.src})`);
}
// Phase 14 navigation: the USA sidebar has a top-level item for each of the six support hubs (home.yml `support`)
// and the Career Clusters item lists all 14 clusters (above: one child per live hub; every hub is live since Phase 8).
{
  const nav = yaml.load(navUs);
  const top = new Set(nav.sidebar.flatMap((g) => g.items.map((i) => i.href)));
  for (const S of home.support) if (!top.has(S.href)) err('_data/nav_us.yml', `support hub "${S.title}" (${S.href}) needs its own sidebar item`);
  if (navHubs.size !== clusters.length) err('_data/nav_us.yml', `Career Clusters menu lists ${navHubs.size} of ${clusters.length} clusters`);
  if (!top.has('us/cte/') && !nav.sidebar.some((g) => g.items.some((i) => (i.children || []).some((c) => c.href === 'us/cte/')))) err('_data/nav_us.yml', 'the Trades & CTE hub (us/cte/) needs a menu link');
  // Top menu (2026-10-23, every us/** page; the sidebar above only shows on region-neutral pages): every support hub
  // and Trades & CTE is a rail node, one menu draws the live clusters, every `mega` key exists, every href is a page,
  // and _data/us/nav_mega.yml matches the data (scripts/build-us-nav-mega.mjs --check).
  const tn = nav.topnav || [];
  const nodes = tn.flatMap((i) => i.nodes || []);
  const nodeHrefs = new Set(nodes.map((n) => n.href));
  for (const S of home.support) if (!nodeHrefs.has(S.href)) err('_data/nav_us.yml topnav', `support hub "${S.title}" (${S.href}) needs its own menu node`);
  if (!nodeHrefs.has('us/cte/')) err('_data/nav_us.yml topnav', 'the Trades & CTE hub (us/cte/) needs a menu node');
  if (!tn.some((i) => i.clusters)) err('_data/nav_us.yml topnav', 'one menu needs clusters: true (the Career Clusters menu)');
  const megaPath = path.join(root, '_data/us/nav_mega.yml');
  const MG = fs.existsSync(megaPath) ? yaml.load(fs.readFileSync(megaPath, 'utf8')) : {};
  for (const n of nodes) if (n.mega && !MG[n.mega]) err('_data/nav_us.yml topnav', `node "${n.label}" names unknown mega key ${n.mega}`);
  for (const C of clusters) if (C.live && !MG[`cluster-${C.slug}`]) err('_data/us/nav_mega.yml', `no cluster-${C.slug} panel`);
  const tnLinks = tn.flatMap((i) => [i, ...(i.children || []), ...(i.nodes || []), ...(i.nodes || []).flatMap((n) => (n.cols || []).flatMap((c) => c.links))]);
  for (const l of tnLinks) if (l.href && !pageExists(l.href.split('#')[0])) err('_data/nav_us.yml topnav', `${l.label}: page ${l.href} does not exist`);
  const mc = spawnSync(process.execPath, [path.join(root, 'scripts/build-us-nav-mega.mjs'), '--check'], { encoding: 'utf8', env: process.env });
  if (mc.status !== 0) err('_data/us/nav_mega.yml', (mc.stderr || mc.stdout).trim());
}
if (CIX) console.log(`checked colleges: ${clSchools} schools in ${Object.keys(CIX.states).length} states, ${clCities} city pages, ${Object.keys(CFD?.fields || {}).length} program lists, ${Object.keys(CAP?.careers || {}).length} apprenticeship matches`);

console.log(`checked ${Object.keys(EXS).length} exam pages in ${(exams.stages || []).length} stages, ${(exams.ap_subjects || []).length} AP subjects, ${gatesLinked} roadmap exam gates linked`);
console.log(`checked ${Object.keys(sources.list).length} sources, ${Object.keys(occ).length} occupations, ${Object.keys(lic).length} licenses, ${testIds.size} tests, ${paths.list.length} pathways, ${(paths.crossborder || []).length} cross-border tracks, ${(cte.list || []).length} trades roadmaps, ${clusters.length} clusters (${subTotal} sub-clusters, ${placed.size} careers placed, ${clusters.filter((c) => c.live).length} hubs live)`);
if (errors.length) { console.log(errors.join('\n')); console.log(`\n${errors.length} problem(s)`); process.exit(1); }
console.log('OK: 0 problems');
