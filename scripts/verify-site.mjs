// Offline QA for the Jekyll site using liquidjs (no Ruby needed).
//   VERIFY_DEPS=<dir containing node_modules with liquidjs + js-yaml> node scripts/verify-site.mjs [--all]
// Renders every roadmaps/*.html (and, with --all, every top-level page) through the real layout and checks:
//   - Liquid renders without error, 0 unresolved {{ }} / {% %}
//   - every JSON-LD block parses
//   - every internal href/src (page, asset, #anchor) resolves
//   - duplicate ids, unbalanced <details>/<section>/<div>
//   - no "coming soon" placeholder text
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

async function render(f) {
  const raw = fs.readFileSync(path.join(root, f), 'utf8');
  const m = raw.match(fmRe);
  // Like Jekyll: a file without front matter is copied as-is (e.g. the Google verification file),
  // and jekyll-redirect-from replaces a `redirect_to` page with its own bare redirect page.
  if (!m) return raw;
  const fm = yaml.load(m[1]) || {};
  if (fm.redirect_to) return `<!DOCTYPE html><html lang="en-US"><meta charset="utf-8"><title>Redirecting…</title><link rel="canonical" href="${fm.redirect_to}"><meta http-equiv="refresh" content="0; url=${fm.redirect_to}"><a href="${fm.redirect_to}">Click here if you are not redirected.</a></html>`;
  const body = m ? raw.slice(m[0].length) : raw;
  // Apply _config.yml `defaults` like Jekyll: scope.path is a folder prefix ("" = all); front matter wins.
  const defaults = {};
  for (const d of config.defaults || []) {
    const p = (d.scope && d.scope.path) || '';
    if (p === '' || f === p || f.startsWith(p.replace(/\/$/, '') + '/')) Object.assign(defaults, d.values);
  }
  // Jekyll serves folder/index.html at folder/.
  const url = f.endsWith('/index.html') ? '/' + f.slice(0, -'index.html'.length) : '/' + f;
  const page = { ...defaults, ...fm, url };
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
  for (const b of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(b[1]); } catch (e) { err(f, 'invalid JSON-LD: ' + e.message); }
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
    }
    if (hash && target.endsWith('.html') && urlSet.has(target)) {
      const ids2 = target === f ? new Set(ids) : await idsOf(target);
      if (!ids2.has(hash)) err(f, 'missing anchor: ' + h);
    }
  }
}
console.log(`checked ${n} pages`);
if (errors.length) { console.log(errors.join('\n')); console.log(`\n${errors.length} problem(s)`); process.exit(1); }
console.log('OK: 0 problems');
