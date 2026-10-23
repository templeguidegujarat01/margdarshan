// Search Console re-validation helper (2026-10-23). Google retired the sitemap "ping" endpoint in 2023 and its
// Indexing API only accepts JobPosting / BroadcastEvent pages, so no script can push a re-crawl: this one lists
// the URLs and proves production already serves the fixed pages before you press "Validate fix" in Search Console.
//   VERIFY_DEPS=<dir containing node_modules with liquidjs + js-yaml> node scripts/gsc-revalidate.mjs [options]
//   (no options)       render sitemap.xml from the real template (as verify-site.mjs --all does) and print its URLs
//   --out <file>       also write that list to <file>, one URL per line
//   --live             fetch the deployed <url>/sitemap.xml and list URLs that differ from the local render
//   --check <file>     fetch every URL found in <file> (Search Console "Export" CSV or plain text) from production and
//                      check: HTTP 200, <title> <= 60, meta description 1-160, canonical = the URL itself, no noindex.
//                      Exits 1 if any URL fails; the passing ones are the batch to inspect / validate.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { TITLE_MAX, DESC_MAX } from './lib/seo-fit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'));
const { Liquid } = req('liquidjs');
const yaml = req('js-yaml');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };

// ---- render sitemap.xml exactly like verify-site.mjs --all ----
const config = yaml.load(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
const base = (config.url || '') + (config.baseurl || '');
const engine = new Liquid({ strictVariables: false });
engine.registerFilter('absolute_url', (v) => base + (String(v).startsWith('/') ? v : '/' + v));
const fmRe = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const excluded = (config.exclude || []).map((x) => x.replace(/\/$/, ''));
const files = [];
const walk = (d, rel = '') => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['.git', 'node_modules', '_site'].includes(e.name)) continue;
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) walk(path.join(d, e.name), r); else if (r.endsWith('.html')) files.push(r);
  }
};
walk(root);
function pageOf(f, fm) {
  const defaults = {};
  for (const d of config.defaults || []) {
    const p = (d.scope && d.scope.path) || '';
    if (p === '' || f === p || f.startsWith(p.replace(/\/$/, '') + '/')) Object.assign(defaults, d.values);
  }
  const url = f === 'index.html' || f.endsWith('/index.html') ? '/' + f.slice(0, -'index.html'.length) : '/' + f;
  return { ...defaults, ...fm, url };
}
const htmlPages = [];
for (const f of files) {
  if (/(^|\/)[_.]/.test(f) || excluded.some((x) => f === x || f.startsWith(x + '/'))) continue;
  const fm = fs.readFileSync(path.join(root, f), 'utf8').match(fmRe);
  if (fm) htmlPages.push(pageOf(f, yaml.load(fm[1]) || {}));
}
const smSrc = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sm = await engine.parseAndRender(smSrc.slice(smSrc.match(fmRe)[0].length), { site: { ...config, html_pages: htmlPages }, page: {} });
const locsOf = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((x) => x[1].replace(/&amp;/g, '&'));
const locs = locsOf(sm);

const out = arg('--out');
if (out) fs.writeFileSync(out, locs.join('\n') + '\n');
const checkFile = arg('--check');
const live = process.argv.includes('--live');
if (!checkFile && !live) console.log(locs.join('\n'));
console.error(`sitemap.xml (local render): ${locs.length} URLs${out ? ' -> ' + out : ''}`);

// ---- --live: deployed sitemap vs local render (shows whether the last push has finished deploying) ----
if (live) {
  const res = await fetch(base + '/sitemap.xml');
  if (!res.ok) { console.error(`${base}/sitemap.xml: HTTP ${res.status}`); process.exit(1); }
  const liveLocs = new Set(locsOf(await res.text()));
  const localSet = new Set(locs);
  const onlyLocal = locs.filter((u) => !liveLocs.has(u));
  const onlyLive = [...liveLocs].filter((u) => !localSet.has(u));
  console.log(`live sitemap: ${liveLocs.size} URLs; ${onlyLocal.length} not deployed yet, ${onlyLive.length} live but no longer local`);
  for (const u of onlyLocal) console.log('  + ' + u);
  for (const u of onlyLive) console.log('  - ' + u);
}

// ---- --check: fetch the Search Console URLs from production and check what Google will see ----
if (checkFile) {
  const ENT = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', middot: '·' };
  const text = (x) => String(x)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, e) => ENT[e.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ').trim();
  const urls = [...new Set([...fs.readFileSync(checkFile, 'utf8').matchAll(/https?:\/\/[^\s",<>]+/g)].map((m) => m[0]))];
  const inSitemap = new Set(locs);
  const pass = [], fail = [];
  const check = async (u) => {
    const problems = [];
    if (!u.startsWith(base + '/')) problems.push(`not under ${base}`);
    let html = '';
    try {
      const res = await fetch(u, { redirect: 'manual' });
      if (res.status !== 200) problems.push(`HTTP ${res.status}${res.headers.get('location') ? ' -> ' + res.headers.get('location') : ''}`);
      else html = await res.text();
    } catch (e) { problems.push('fetch failed: ' + e.message); }
    if (html) {
      const title = text((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
      const desc = text((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
      const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
      const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
      if (/http-equiv="refresh"/i.test(html)) problems.push('redirect stub (inspect its target instead)');
      if (!title) problems.push('no <title>');
      else if (title.length > TITLE_MAX) problems.push(`<title> ${title.length} chars (live site not updated yet?)`);
      if (!desc) problems.push('no meta description');
      else if (desc.length > DESC_MAX) problems.push(`description ${desc.length} chars`);
      if (canonical && canonical !== u) problems.push('canonical is ' + canonical);
      if (/noindex/i.test(robots)) problems.push('noindex');
    }
    if (!inSitemap.has(u)) problems.push('not in local sitemap.xml');
    (problems.length ? fail : pass).push({ u, problems });
  };
  for (let i = 0; i < urls.length; i += 4) await Promise.all(urls.slice(i, i + 4).map(check));
  console.log(`checked ${urls.length} URL(s) from ${checkFile} against production`);
  if (fail.length) {
    console.log(`\nNOT READY (${fail.length}):`);
    for (const { u, problems } of fail) console.log(`  ${u}\n      ${problems.join('; ')}`);
  }
  console.log(`\nREADY for URL Inspection -> Request indexing, then "Validate fix" (${pass.length}):`);
  for (const { u } of pass) console.log('  ' + u);
  if (fail.length) process.exit(1);
}
