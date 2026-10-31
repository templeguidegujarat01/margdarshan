// learn-src/local — hand-researched local places for any "where to learn" finder, one file per finder + state:
//   scripts/learn-src/local/<finder>/<state>.yml   (see docs/learn-finder/STATE-FILL.md)
// Each learn-src/<finder>.mjs calls localRows() after its register rows, so state fills survive register reruns.
// Rows already in the register list (same name + city) are skipped, not doubled.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const key = (r) => `${r.name}|${r.city}`.toLowerCase().replace(/[^a-z0-9|]+/g, '');
const HYPE = /\b(best|top|no\.?\s*1|number one|#1|leading|premier)\b/i;
const host = (u) => new URL(u).hostname.replace(/^www\./, '');

export function localRows(finder, existing = []) {
  const dir = path.join(root, 'scripts/learn-src/local', finder);
  if (!fs.existsSync(dir)) return [];
  const meta = yaml.load(fs.readFileSync(path.join(root, `_data/in/learn/${finder}.yml`), 'utf8'));
  const seen = new Set(existing.map(key));
  const out = [], errs = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.yml')).sort()) {
    const d = yaml.load(fs.readFileSync(path.join(dir, file), 'utf8'));
    const state = file.replace(/\.yml$/, '');
    for (const r of d.rows || []) {
      const at = `${file}: ${r.name || '(no name)'}`;
      for (const f of ['name', 'city', 'area', 'type', 'note', 'note_src', 'url']) if (!r[f]) errs.push(`${at} — missing ${f}`);
      if (r.type && !meta.types.includes(r.type)) errs.push(`${at} — type "${r.type}" not in ${finder}.yml types`);
      if (HYPE.test(r.note || '')) errs.push(`${at} — ranking word in note`);
      for (const u of [r.url, r.note_src]) if (u && !/^https:\/\//.test(u)) errs.push(`${at} — url must be https: ${u}`);
      if (seen.has(key(r))) { console.warn(`  skip duplicate: ${at}`); continue; }
      seen.add(key(r));
      out.push({
        name: r.name, type: r.type, ownership: r.ownership || 'Private', state, city: r.city,
        about: `${r.area}. ${r.note}`, url: r.url, url_label: r.url_label || 'Official website',
        source: `local:${host(r.note_src)}`, src_label: r.src_label || host(r.note_src), src_url: r.note_src,
        checked: r.checked || d.checked,
        ...(r.mode ? { mode: r.mode } : {}), ...(r.batches ? { batches: r.batches } : {}),
      });
    }
  }
  if (errs.length) throw new Error(`local ${finder}:\n  ` + errs.join('\n  '));
  return out;
}
