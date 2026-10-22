// Offline QA for the Jekyll site using liquidjs (no Ruby needed).
//   VERIFY_DEPS=<dir containing node_modules with liquidjs + js-yaml> node scripts/verify-site.mjs [--all]
// Renders every roadmaps/*.html (and, with --all, every top-level page) through the real layout and checks:
//   - Liquid renders without error, 0 unresolved {{ }} / {% %}
//   - every JSON-LD block parses
//   - every internal href/src (page, asset, #anchor) resolves
//   - duplicate ids, unbalanced <details>/<section>/<div>
//   - no "coming soon" placeholder text
//   - no typed arrow inside a .btn-page-link button (the CSS draws one; 2026-10-20)
//   - FAQPage JSON-LD: one per page, each item a Question with a name and an Answer with text
//   - with --all: sitemap.xml (rendered from the real template) lists every indexable page once, each <loc>
//     equal to that page's canonical, no noindex/redirect URLs; <title> unique across indexable pages (2026-10-22)
//   - with --all: no orphan USA page (every us/** page that is not a redirect is linked from another page;
//     USA Master Plan Phase 14, 2026-10-21)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'));
const { Liquid } = req('liquidjs');
const yaml = req('js-yaml');
const all = process.argv.includes('--all');

// ---- site data ----
const config = yaml.load(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
// Nested folders load like Jekyll: _data/in/careers/llb.yml -> site.data.in.careers.llb
const loadData = (dir) => {
  const out = {};
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) out[f.name] = loadData(p);
    else if (f.name.endsWith('.json')) out[f.name.slice(0, -5)] = JSON.parse(fs.readFileSync(p, 'utf8'));
    else if (/\.ya?ml$/.test(f.name)) out[f.name.replace(/\.ya?ml$/, '')] = yaml.load(fs.readFileSync(p, 'utf8'));
  }
  return out;
};
const data = loadData(path.join(root, '_data'));
const site = { ...config, data };
const engine = new Liquid({ root: [path.join(root, '_includes'), path.join(root, '_layouts')], extname: '.html', jekyllInclude: true, jekyllWhere: true, strictVariables: false });
engine.registerFilter('absolute_url', (v) => (config.url || '') + (config.baseurl || '') + (String(v).startsWith('/') ? v : '/' + v));
engine.registerFilter('relative_url', (v) => (config.baseurl || '') + v);
engine.registerFilter('jsonify', (v) => JSON.stringify(v));
engine.registerFilter('date_to_xmlschema', (v) => String(v));
engine.registerFilter('markdownify', (v) => v);
engine.registerFilter('slugify', (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-'));
engine.registerFilter('number_of_words', (v) => String(v).split(/\s+/).length);

const fmRe = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const urlSet = new Set();
const walk = (d, rel = '') => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['.git', 'node_modules', '_site'].includes(e.name)) continue;
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) walk(path.join(d, e.name), r); else urlSet.add(r);
  }
};
walk(root);
const permalinkIndex = new Set(['index.html']);

const targets = [...urlSet].filter((f) => f.endsWith('.html') && !f.startsWith('_') && !f.startsWith('redirects/') && (all ? true : f.startsWith('roadmaps/')));
const errors = [];
const err = (f, m) => errors.push(f + ': ' + m);

// ---- Jekyll compatibility lint (liquidjs is more lenient than GitHub Pages' Jekyll 3 / Liquid 4) ----
// Include parameters must match Jekyll's own VALID_SYNTAX, or the GitHub Pages build fails
// (e.g. `n=data[key]` renders here but is "Invalid syntax for include tag" in Jekyll; assign it first).
const JEKYLL_PARAM = /([\w-]+)\s*=\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|([\w.-]+))/;
const JEKYLL_PARAMS_FULL = new RegExp(`^\\s*(?:${JEKYLL_PARAM.source}(?=\\s|$)\\s*)*$`);
for (const f of [...urlSet].filter((x) => x.endsWith('.html') && !x.startsWith('docs/'))) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  for (const m of src.matchAll(/\{%-?\s*include\s+([^\s%]+)([^%]*?)-?%\}/g)) {
    if (!JEKYLL_PARAMS_FULL.test(m[2])) err(f, `include ${m[1]}: parameters "${m[2].trim()}" are not valid Jekyll include syntax (assign complex values to a variable first)`);
  }
}
const idCache = {};
const inbound = new Map();     // page -> how many OTHER pages link to it (orphan check)
const redirects = new Set();
const seo = new Map();         // --all: rendered page -> { title, canonical, noindex } for the sitemap + title checks

// The `page` object Jekyll gives a file: _config.yml `defaults` (scope.path is a folder prefix, "" = all),
// then its own front matter, then url (Jekyll serves folder/index.html at folder/).
function pageOf(f, fm) {
  const defaults = {};
  for (const d of config.defaults || []) {
    const p = (d.scope && d.scope.path) || '';
    if (p === '' || f === p || f.startsWith(p.replace(/\/$/, '') + '/')) Object.assign(defaults, d.values);
  }
  const url = f.endsWith('/index.html') ? '/' + f.slice(0, -'index.html'.length) : '/' + f;
  return { ...defaults, ...fm, url };
}

async function render(f) {
  const raw = fs.readFileSync(path.join(root, f), 'utf8');
  const m = raw.match(fmRe);
  // Like Jekyll: a file without front matter is copied as-is (e.g. the Google verification file),
  // and jekyll-redirect-from replaces a `redirect_to` page with its own bare redirect page.
  if (!m) return raw;
  const fm = yaml.load(m[1]) || {};
  if (fm.redirect_to) redirects.add(f);
  if (fm.redirect_to) return `<!DOCTYPE html><html lang="en-US"><meta charset="utf-8"><title>Redirecting…</title><link rel="canonical" href="${fm.redirect_to}"><meta http-equiv="refresh" content="0; url=${fm.redirect_to}"><a href="${fm.redirect_to}">Click here if you are not redirected.</a></html>`;
  const body = m ? raw.slice(m[0].length) : raw;
  const page = pageOf(f, fm);
  const content = await engine.parseAndRender(body, { site, page });
  const layout = fm.layout || 'default';
  if (layout === 'none') return content;
  return engine.parseAndRender(fs.readFileSync(path.join(root, '_layouts', layout + '.html'), 'utf8'), { site, page, content, layout: {} });
}
async function idsOf(f) {
  if (idCache[f]) return idCache[f];
  let html = '';
  try { html = await render(f); } catch { html = fs.readFileSync(path.join(root, f), 'utf8'); }
  return (idCache[f] = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1])));
}

let n = 0;
for (const f of targets) {
  n++;
  let html;
  try { html = await render(f); } catch (e) { err(f, 'render error: ' + e.message.split('\n')[0]); continue; }
  if (/\{\{|\{%/.test(html)) err(f, 'unresolved liquid tags');
  if (/coming soon/i.test(html)) err(f, '"coming soon" text');
  // .btn-page-link draws its own "→" (main.css ::after), so a typed arrow in its text shows "→ →".
  for (const a of html.matchAll(/<a\b[^>]*class="[^"]*\bbtn-page-link\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (/→|&rarr;|&#8594;|&#x2192;|»|&raquo;/i.test(a[1])) err(f, `typed arrow inside .btn-page-link (CSS already adds one): "${a[1].replace(/<[^>]+>/g, '').trim().slice(0, 60)}"`);
  }
  let faqPages = 0;
  for (const b of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let ld;
    try { ld = JSON.parse(b[1]); } catch (e) { err(f, 'invalid JSON-LD: ' + e.message); continue; }
    // FAQPage rich result: one per page, every item a Question with a name and an Answer with text.
    for (const node of [ld].flat().flatMap((x) => x['@graph'] || [x])) {
      if (node['@type'] !== 'FAQPage') continue;
      faqPages++;
      if (!Array.isArray(node.mainEntity) || !node.mainEntity.length) err(f, 'FAQPage JSON-LD has no mainEntity questions');
      for (const q of node.mainEntity || []) {
        if (q['@type'] !== 'Question' || !String(q.name || '').trim() || !q.acceptedAnswer || q.acceptedAnswer['@type'] !== 'Answer' || !String(q.acceptedAnswer.text || '').trim())
          err(f, 'FAQPage item is not a Question with a name and an Answer with text: ' + String(q.name || '').slice(0, 60));
      }
    }
  }
  if (faqPages > 1) err(f, `${faqPages} FAQPage JSON-LD blocks (Google allows one per page)`);
  if (all && !redirects.has(f) && /^\s*<!DOCTYPE html/i.test(html)) {
    const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
    seo.set(f, {
      title: ((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim(),
      canonical: (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '',
      noindex: /noindex/i.test(robots),
    });
  }
  html = html.replace(/<script[\s\S]*?<\/script>/g, '');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) err(f, 'duplicate ids: ' + [...new Set(dup)].slice(0, 5).join(', '));
  for (const tag of ['details', 'section', 'main', 'ol', 'ul', 'dl']) {
    const o = (html.match(new RegExp('<' + tag + '[\\s>]', 'g')) || []).length, c = (html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (o !== c) err(f, `unbalanced <${tag}> ${o}/${c}`);
  }
  const dopen = (html.match(/<div[\s>]/g) || []).length, dclose = (html.match(/<\/div>/g) || []).length;
  if (dopen !== dclose) err(f, `unbalanced <div> ${dopen}/${dclose}`);
  // internal links
  const dir = path.posix.dirname(f);
  for (const a of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    let h = a[1].trim();
    if (!h || /^(https?:|mailto:|tel:|javascript:|data:|\/\/)/.test(h)) continue;
    if (h.includes('{{')) continue;
    const [pathPart, hash] = h.split('#');
    let target = f;
    if (pathPart) {
      const clean = pathPart.split('?')[0];
      target = clean.startsWith('/') ? clean.slice(1) : path.posix.normalize(path.posix.join(dir, clean));
      if (target === '' || target.endsWith('/')) target += 'index.html';
      if (!urlSet.has(target) && !urlSet.has(target + '.html')) { err(f, 'broken link: ' + h); continue; }
      const tf = urlSet.has(target) ? target : target + '.html';
      if (tf !== f && !redirects.has(f)) inbound.set(tf, (inbound.get(tf) || 0) + 1);
    }
    if (hash && target.endsWith('.html') && urlSet.has(target)) {
      const ids2 = target === f ? new Set(ids) : await idsOf(target);
      if (!ids2.has(hash)) err(f, 'missing anchor: ' + h);
    }
  }
}
if (all) for (const f of targets) if (f.startsWith('us/') && !redirects.has(f) && !inbound.get(f)) err(f, 'orphan page: no other page links to it');

// ---- --all: sitemap.xml + titles (2026-10-22) ----
// Renders the real sitemap.xml template against a Jekyll-like site.html_pages, then checks every <loc> is an
// indexable page whose canonical is that exact URL, and every indexable page is listed exactly once.
if (all) {
  const excluded = (config.exclude || []).map((x) => x.replace(/\/$/, ''));
  const htmlPages = [];
  for (const f of [...urlSet].filter((x) => x.endsWith('.html'))) {
    if (/(^|\/)[_.]/.test(f) || excluded.some((x) => f === x || f.startsWith(x + '/'))) continue;
    const fm = fs.readFileSync(path.join(root, f), 'utf8').match(fmRe);
    if (fm) htmlPages.push({ ...pageOf(f, yaml.load(fm[1]) || {}), file: f });
  }
  const smSrc = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const sm = await engine.parseAndRender(smSrc.slice(smSrc.match(fmRe)[0].length), { site: { ...site, html_pages: htmlPages }, page: {} });
  if (!sm.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) err('sitemap.xml', 'does not start with the XML declaration');
  if (/&(?!amp;|lt;|gt;|quot;|apos;)/.test(sm)) err('sitemap.xml', 'unescaped & in a URL');
  const locs = [...sm.matchAll(/<url><loc>([^<]*)<\/loc><\/url>/g)].map((x) => x[1]);
  if ((sm.match(/<url>/g) || []).length !== locs.length) err('sitemap.xml', 'malformed <url> entries');
  if (locs.length > 50000) err('sitemap.xml', `${locs.length} URLs (limit 50,000 per sitemap file)`);
  const byCanonical = new Map([...seo].map(([f, s]) => [s.canonical, f]));
  const seen = new Set();
  for (const loc of locs) {
    if (seen.has(loc)) err('sitemap.xml', 'duplicate <loc> ' + loc);
    seen.add(loc);
    const f = byCanonical.get(loc);
    if (!f) err('sitemap.xml', 'lists a URL that is no page\'s canonical: ' + loc);
    else if (seo.get(f).noindex) err('sitemap.xml', 'lists a noindex page: ' + loc);
  }
  const inPages = new Set(htmlPages.map((p) => p.file));
  const skip = new Set([...seo.keys()].filter((f) => !inPages.has(f)).concat(htmlPages.filter((p) => p.sitemap === false || p.url === '/404.html').map((p) => p.file)));
  for (const [f, s] of seo) if (!s.noindex && !skip.has(f) && !seen.has(s.canonical) && !/google[0-9a-f]+\.html$/.test(f)) err(f, 'indexable page missing from sitemap.xml');
  // Titles must be unique across indexable pages (duplicates compete in search results).
  const byTitle = new Map();
  for (const [f, s] of seo) if (!s.noindex && !skip.has(f)) byTitle.set(s.title, [...(byTitle.get(s.title) || []), f]);
  for (const [t, fs2] of byTitle) {
    if (!t) err(fs2[0], 'empty <title>');
    else if (fs2.length > 1) err(fs2[0], `duplicate <title> on ${fs2.length} pages (${fs2.slice(1, 4).join(', ')}): ${t.slice(0, 80)}`);
  }
  console.log(`sitemap.xml: ${locs.length} URLs`);
}
console.log(`checked ${n} pages`);
if (errors.length) { console.log(errors.join('\n')); console.log(`\n${errors.length} problem(s)`); process.exit(1); }
console.log('OK: 0 problems');
