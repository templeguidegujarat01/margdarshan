// Integrity check for the USA Edition research data (_data/us/*.yml).
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/check-us-data.mjs
// Checks: every cross-reference resolves (pathway → occupation / license / test /
// degree, record → source id), numbers are numbers, required fields are present,
// every record carries a last_verified / as_of date, and in_page India mappings
// point at real files. Run it after any data refresh.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

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

console.log(`checked ${Object.keys(sources.list).length} sources, ${Object.keys(occ).length} occupations, ${Object.keys(lic).length} licenses, ${testIds.size} tests, ${paths.list.length} pathways`);
if (errors.length) { console.log(errors.join('\n')); console.log(`\n${errors.length} problem(s)`); process.exit(1); }
console.log('OK: 0 problems');
