// Integrity + behaviour check for the site search (top-bar box, assets/js/site.js "Inline navbar search").
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/check-search.mjs [--verbose]
// 1. Index ↔ routes: every entry of assets/search.json's sources (_data/search.yml items + the generated
//    _data/seo_landings.yml search list) must point at a page that exists in the repo (file, or folder with
//    index.html), with no duplicate url and the required t / u / c fields; categories must be known.
//    Reports how many of the site's pages the index covers.
// 2. Engine: runs the real multi-attribute engine (the block between "@search-engine:start" and
//    "@search-engine:end" in site.js, which has no DOM and no Liquid) in Node over the same index, and checks a
//    set of compound queries ("Punjab class 10 government exam", "US medical licensing path", …) return the
//    pages a student would expect, and that every entry is reachable by its own title.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const verbose = process.argv.includes('--verbose');
const load = (f) => yaml.load(fs.readFileSync(path.join(root, f), 'utf8'));
const errors = [];
const err = (w, m) => errors.push(`${w}: ${m}`);

// ---- 1. index ↔ routes ----
const S = load('_data/search.yml');
const L = load('_data/seo_landings.yml');
const items = (S.items || []).concat(L.search || []);
const cats = new Set(S.categories.map((c) => c.id));
const seen = new Map();
const pageOf = (u) => {
  const p = u.split('#')[0].split('?')[0];
  if (!p) return null;
  const f = path.join(root, p.endsWith('/') ? p + 'index.html' : p);
  return fs.existsSync(f) ? f : null;
};
items.forEach((d, i) => {
  const w = `search[${i}] "${d.t}"`;
  for (const k of ['t', 'u', 'c']) if (!d[k]) err(w, `missing ${k}`);
  if (d.c && !cats.has(d.c)) err(w, `unknown category "${d.c}"`);
  if (!d.u) return;
  if (/^(https?:)?\/\//.test(d.u) || d.u.startsWith('/')) err(w, `url must be site-relative without a leading slash: ${d.u}`);
  else if (!pageOf(d.u)) err(w, `no page for ${d.u}`);
  // A filtered finder view (url with ?query) may carry a second, alias title ("Medical Colleges" = science stream).
  if (seen.has(d.u) && !d.u.includes('?')) err(w, `duplicate url ${d.u} (also "${seen.get(d.u)}")`);
  seen.set(d.u, d.t);
});
// Pages on the site (same rule as verify-site: every .html outside _* folders, redirects/, node_modules).
const pages = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name.startsWith('_') || ['node_modules', 'scripts', 'docs', 'redirects', 'assets'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) pages.push(path.relative(root, p).replace(/\\/g, '/'));
  }
};
walk(root);
const indexed = new Set([...seen.keys()].map((u) => { const f = pageOf(u); return f && path.relative(root, f).replace(/\\/g, '/'); }));
const covered = pages.filter((p) => indexed.has(p)).length;

// ---- 2. engine ----
const js = fs.readFileSync(path.join(root, 'assets/js/site.js'), 'utf8');
const m = js.match(/\/\* @search-engine:start[\s\S]*?\*\/([\s\S]*?)\/\* @search-engine:end \*\//);
let engineOk = false;
const results = [];
if (!m) err('site.js', 'no @search-engine:start / @search-engine:end block');
else if (/\{\{|\{%/.test(m[1])) err('site.js', 'the search engine block must not contain Liquid (it is run by this check in Node)');
else {
  const ctx = {};
  vm.runInNewContext(m[1] + '\nthis.MdSearch = MdSearch;', ctx);
  const E = ctx.MdSearch;
  const catLabels = {}; S.categories.forEach((c) => { catLabels[c.id] = c.label; });
  const index = E.build(items, catLabels);
  const run = (q, home) => {
    const P = E.parse(q, index);
    const out = E.search(index, P, 8, home || null);
    return { P, total: out.total, top: out.top.map((i) => items[i]) };
  };
  // [query, edition home (null = global), test(result) → error text or ''].
  const urls = (r) => r.top.map((d) => d.u);
  const has = (r, u, n = 8) => urls(r).slice(0, n).includes(u);
  const cases = [
    ['Punjab class 10 government exam', 'india', (r) => (r.top.length && r.top.every((d) => /punjab/.test(d.u)) && has(r, 'state/punjab/index.html', 3) && has(r, 'state/punjab/psssb.html', 4) ? '' : 'expected only Punjab pages, cockpit + PSSSB on top')],
    ['US medical licensing path', null, (r) => (r.top.length && r.top.every((d) => d.c === 'usa') && has(r, 'us/professional-licenses/medicine/', 3) && has(r, 'us/roadmaps/img-usmle.html', 3) ? '' : 'expected USA-only, physician license + IMG roadmap in top 3')],
    ['indian llb new york bar', null, (r) => (has(r, 'us/roadmaps/foreign-lawyer-us-bar.html', 1) ? '' : 'expected the NY/CA bar roadmap first')],
    ['uk solicitor', null, (r) => (r.top.length && r.top.every((d) => d.c === 'uk') && has(r, 'uk/careers/law/', 2) ? '' : 'expected UK law page')],
    ['gujarat police', 'india', (r) => (r.top.length && /gujarat/.test(r.top[0].u) ? '' : 'expected a Gujarat page first')],
    ['maharashtra colleges', 'india', (r) => (has(r, 'colleges/maharashtra/', 1) ? '' : 'expected colleges/maharashtra/ first')],
    ['neet', 'india', (r) => (r.top.length && /neet/i.test(r.top[0].t) ? '' : 'expected a NEET page first')],
    ['cpa exam india', null, (r) => (has(r, 'us/roadmaps/cpa-international.html', 3) ? '' : 'expected the CPA cross-border roadmap')],
    ['bcom', 'india', (r) => (r.total > 0 ? '' : 'plain word search broke')],
    ['usa', 'india', (r) => (r.top.length && r.top.every((d) => d.c === 'usa' || /\b(usa|u\.s\.)/i.test(d.t)) && r.top.some((d) => d.u === 'us/') ? '' : 'edition word should keep only USA pages (or India pages about the USA)')],
    ['usa high school gpa', null, (r) => (r.top.length && r.top.every((d) => d.c === 'usa') && (has(r, 'us/high-school/#plan', 3) || has(r, 'us/high-school/', 3)) ? '' : 'expected the USA high school plan in top 3')],
    ['us electrician trade', null, (r) => (has(r, 'us/cte/electrician.html', 3) && has(r, 'us/cte/roadmaps/electrician.html', 3) ? '' : 'expected the electrician career page + roadmap in top 3')],
    ['usa trades hub', null, (r) => (has(r, 'us/cte/', 2) ? '' : 'expected the Trades & CTE hub in top 2')],
    ['welder salary usa', null, (r) => (has(r, 'us/cte/welder.html', 2) ? '' : 'expected the welder career page in top 2')],
    ['usa trades roadmap', null, (r) => (['electrician', 'plumber', 'hvac-technician', 'welder', 'automotive-service-technician'].every((s) => has(r, `us/cte/roadmaps/${s}.html`)) ? '' : 'expected all 5 Trades & CTE roadmaps (Trades & CTE + Roadmap facets)')],
    ['hvac epa 608', null, (r) => (has(r, 'us/cte/roadmaps/hvac-technician.html', 1) ? '' : 'expected the HVAC roadmap first')],
    ['auto mechanic usa', null, (r) => (has(r, 'us/cte/roadmaps/automotive-service-technician.html', 2) ? '' : 'expected the automotive technician roadmap in top 2')],
    ['texas plumber license', null, (r) => (has(r, 'us/cte/roadmaps/plumber.html', 2) ? '' : 'expected the plumber roadmap in top 2')],
    ['us federal government jobs', null, (r) => (r.top.length && r.top.every((d) => d.c === 'usa') && has(r, 'us/clusters/public-service-safety/#public-sector', 2) ? '' : 'expected the USA civil service block (Public Service & Safety hub) in top 2')],
    ['usa career clusters', null, (r) => (has(r, 'us/clusters/', 2) ? '' : 'expected the 14 Career Clusters page in top 2')],
    ['healthcare careers usa', null, (r) => (r.top.length && r.top.every((d) => d.c === 'usa') && has(r, 'us/clusters/healthcare-human-services/', 3) ? '' : 'expected the Healthcare & Human Services hub in top 3')],
    ['usa construction cluster', null, (r) => (has(r, 'us/clusters/construction/', 2) ? '' : 'expected the Construction hub in top 2')],
    ['manufacturing careers usa', null, (r) => (has(r, 'us/clusters/advanced-manufacturing/', 3) ? '' : 'expected the Advanced Manufacturing hub in top 3')],
    ['cna to lpn to rn', null, (r) => (has(r, 'us/roadmaps/registered-nurse.html', 3) || has(r, 'us/roadmaps/nursing-assistant.html', 3) ? '' : 'expected the RN or CNA roadmap in top 3')],
    ['usa social worker license', null, (r) => (r.top.length && r.top.every((d) => d.c === 'usa') && has(r, 'us/professional-licenses/social-work/', 3) ? '' : 'expected the social work license page in top 3')],
    ['nremt paramedic', null, (r) => (has(r, 'us/professional-licenses/emt/', 3) || has(r, 'us/roadmaps/emt-paramedic.html', 3) ? '' : 'expected the EMT license page or roadmap in top 3')],
    ['nclex-pn lpn', null, (r) => (has(r, 'us/professional-licenses/practical-nursing/', 3) || has(r, 'us/careers/licensed-practical-nurse/', 3) ? '' : 'expected the LPN license or career page in top 3')],
    ['usa nurse practitioner', null, (r) => (has(r, 'us/careers/nurse-practitioner/', 3) ? '' : 'expected the APRN career page in top 3')],
    ['pre-med mcat residency usa', null, (r) => (has(r, 'us/roadmaps/physician.html', 3) ? '' : 'expected the physician roadmap in top 3')],
    ['actuary soa exams', null, (r) => (has(r, 'us/roadmaps/actuary.html', 3) || has(r, 'us/careers/actuary/', 3) ? '' : 'expected the actuary roadmap or career page in top 3')],
    ['cissp security+', null, (r) => (has(r, 'us/roadmaps/information-security-analyst.html', 3) ? '' : 'expected the information security analyst roadmap in top 3')],
    ['series 79 investment banking', null, (r) => (has(r, 'us/roadmaps/investment-banker.html', 3) ? '' : 'expected the investment banker roadmap in top 3')],
    ['series 65 financial advisor', null, (r) => (has(r, 'us/careers/personal-financial-advisor/', 3) || has(r, 'us/roadmaps/personal-financial-advisor.html', 3) ? '' : 'expected the financial advisor page or roadmap in top 3')],
    ['help desk it support usa', null, (r) => (r.top.length && r.top.every((d) => d.c === 'usa') && has(r, 'us/careers/computer-support-specialist/', 3) ? '' : 'expected the computer support specialist page in top 3')],
    ['cfa charter', null, (r) => (has(r, 'us/roadmaps/financial-analyst.html', 3) ? '' : 'expected the financial analyst roadmap in top 3')],
    ['insurance agent license usa', null, (r) => (has(r, 'us/careers/insurance-sales-agent/', 3) || has(r, 'us/roadmaps/insurance-sales-agent.html', 3) ? '' : 'expected the insurance agent page or roadmap in top 3')],
    ['usa nclex license', null,(r) => (has(r, 'us/professional-licenses/nursing/', 3) ? '' : 'expected the RN license page')],
    ['real estate license texas', null, (r) => (has(r, 'us/professional-licenses/real-estate/', 3) ? '' : 'expected the real estate license page in top 3')],
    ['mlo license nmls', null, (r) => (has(r, 'us/professional-licenses/mortgage-loan-originator/', 3) ? '' : 'expected the MLO license page in top 3')],
    ['mortgage loan officer usa', null, (r) => (has(r, 'us/careers/loan-officer/', 3) || has(r, 'us/roadmaps/loan-officer.html', 3) ? '' : 'expected the loan officer page or roadmap in top 3')],
    ['appraiser parea', null, (r) => (has(r, 'us/professional-licenses/real-estate-appraiser/', 3) || has(r, 'us/roadmaps/real-estate-appraiser.html', 3) ? '' : 'expected the appraiser license or roadmap in top 3')],
    ['bank teller usa', null, (r) => (has(r, 'us/careers/bank-teller/', 3) ? '' : 'expected the bank teller page in top 3')],
    ['bookkeeper usa', null, (r) => (has(r, 'us/careers/bookkeeping-clerk/', 3) ? '' : 'expected the bookkeeping clerk page in top 3')],
    ['claims adjuster license', null, (r) => (has(r, 'us/careers/claims-adjuster/', 3) || has(r, 'us/roadmaps/claims-adjuster.html', 3) ? '' : 'expected the claims adjuster page or roadmap in top 3')],
    ['insurance producer license', null, (r) => (has(r, 'us/professional-licenses/insurance-producer/', 3) ? '' : 'expected the insurance producer license page in top 3')],
    ['pmp certification', null, (r) => (has(r, 'us/roadmaps/project-management-specialist.html', 3) || has(r, 'us/careers/project-management-specialist/', 3) ? '' : 'expected the project manager roadmap or page in top 3')],
    ['shrm-cp phr', null, (r) => (has(r, 'us/roadmaps/human-resources-specialist.html', 3) || has(r, 'us/careers/human-resources-specialist/', 3) ? '' : 'expected the HR specialist roadmap or page in top 3')],
    ['start a small business usa', null, (r) => (has(r, 'us/clusters/management-entrepreneurship/#small-business', 3) ? '' : 'expected the SBA small-business block in top 3')],
    ['marketing careers usa', null, (r) => (r.top.length && r.top.every((d) => d.c === 'usa') && has(r, 'us/clusters/marketing-sales/', 3) ? '' : 'expected the Marketing & Sales hub in top 3')],
    ['mba gmat gre management consultant', null, (r) => (has(r, 'us/roadmaps/management-analyst.html', 3) ? '' : 'expected the management analyst roadmap in top 3')],
    ['logistician supply chain usa', null, (r) => (has(r, 'us/careers/logistician/', 3) || has(r, 'us/roadmaps/logistician.html', 3) ? '' : 'expected the logistician page or roadmap in top 3')],
    ['pharmaceutical sales rep', null, (r) => (has(r, 'us/careers/wholesale-sales-representative/', 3) || has(r, 'us/roadmaps/wholesale-sales-representative.html', 3) ? '' : 'expected the sales representative page or roadmap in top 3')],
    ['public relations specialist usa', null, (r) => (has(r, 'us/careers/public-relations-specialist/', 3) ? '' : 'expected the PR specialist page in top 3')],
    ['zzzz qqqq', null, (r) => (r.total === 0 ? '' : 'nonsense should return nothing')],
  ];
  for (const [q, home, t] of cases) {
    const r = run(q, home);
    const e = t(r);
    results.push({ q, total: r.total, top: urls(r).slice(0, 4), filters: E.describe(r.P) });
    if (e) err(`query "${q}"`, `${e}; got ${JSON.stringify(urls(r).slice(0, 5))}`);
  }
  // Every entry must be findable by its own title (top 8, global home).
  let lost = 0;
  items.forEach((d, i) => {
    const r = run(d.t, null);
    if (!urls(r).includes(d.u)) { lost++; if (lost <= 15) err(`title "${d.t}"`, `not in its own top 8 (${d.u})`); }
  });
  if (lost > 15) err('titles', `${lost - 15} more entries not found by their own title`);
  // Timing: the whole index, 200 compound queries.
  const t0 = process.hrtime.bigint();
  for (let k = 0; k < 200; k++) run(cases[k % cases.length][0], null);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 200;
  results.push({ q: '(timing)', total: `${ms.toFixed(2)} ms per query over ${items.length} entries` });
  engineOk = true;
}

console.log(`checked ${items.length} search entries → ${seen.size} urls; index covers ${covered} of ${pages.length} pages${engineOk ? `; engine ran ${results.length - 1} queries` : ''}`);
if (verbose || errors.length) for (const r of results) console.log(`  ${r.q}  →  ${r.total}${r.filters ? '  [' + r.filters + ']' : ''}${r.top ? '  ' + r.top.join(', ') : ''}`);
if (errors.length) { console.log(errors.join('\n')); console.log(`\n${errors.length} problem(s)`); process.exit(1); }
console.log('OK: 0 problems');
