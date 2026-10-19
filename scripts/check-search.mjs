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
