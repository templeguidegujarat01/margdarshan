// Fits every indexable page's front-matter title, og_title and twitter_title (<= 60) and description (<= 160) with scripts/lib/seo-fit.mjs
// (2026-10-23). Generators (build-seo-landings, build-roadmaps, build-us-*, …) already call the same helpers, so
// this only changes hand-written pages; a title or description that already fits is left as it is.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/fit-seo.mjs [--check]
// --check writes nothing and exits 1 if any page would change. A title the helper cannot shorten (no " — " /
// ": " list to drop) is reported: write a shorter one by hand in that page's front matter.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { shrinkTitle, fitDesc } from './lib/seo-fit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'));
const yaml = req('js-yaml');
const check = process.argv.includes('--check');

const config = yaml.load(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
const excluded = (config.exclude || []).map((x) => x.replace(/\/$/, ''));
const fmRe = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const files = [];
const walk = (d, rel = '') => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['.git', 'node_modules', '_site'].includes(e.name)) continue;
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) walk(path.join(d, e.name), r); else if (r.endsWith('.html')) files.push(r);
  }
};
walk(root);

// Replace a top-level `key:` (and any indented continuation lines) with one double-quoted line.
const setKey = (fm, key, value) => {
  const nl = fm.includes('\r\n') ? '\r\n' : '\n';
  const lines = fm.split(/\r?\n/);
  const i = lines.findIndex((l) => l.startsWith(key + ':'));
  let j = i + 1;
  while (j < lines.length && /^\s+\S/.test(lines[j])) j++;
  lines.splice(i, j - i, `${key}: ${JSON.stringify(value)}`);
  return lines.join(nl);
};

let changed = 0;
const failed = [];
for (const f of files) {
  if (/(^|\/)[_.]/.test(f) || f.startsWith('redirects/') || excluded.some((x) => f === x || f.startsWith(x + '/'))) continue;
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  const m = src.match(fmRe);
  if (!m) continue;
  const fm = yaml.load(m[1]) || {};
  if (fm.redirect_to || /noindex/.test(fm.robots || '') || fm.sitemap === false) continue;
  let out = m[1];
  // og_title / twitter_title (social previews) get the same 60-character cut as the <title>.
  for (const key of ['title', 'og_title', 'twitter_title']) {
    if (typeof fm[key] !== 'string') continue;
    let t;
    try { t = shrinkTitle(fm[key]); } catch (e) { failed.push(`${f} (${key}): ${e.message}`); }
    if (t && t !== fm[key]) out = setKey(out, key, t);
  }
  if (typeof fm.description === 'string') {
    const d = fitDesc(fm.description);
    if (d !== fm.description && d !== fm.description.replace(/\s+/g, ' ').trim()) out = setKey(out, 'description', d);
  }
  if (out === m[1]) continue;
  changed++;
  if (check) console.log('would change: ' + f);
  else fs.writeFileSync(path.join(root, f), src.replace(m[1], () => out));
}
console.log(`${check ? 'would change' : 'changed'} ${changed} page(s)`);
if (failed.length) console.log(failed.join('\n'));
if (failed.length || (check && changed)) process.exit(1);
