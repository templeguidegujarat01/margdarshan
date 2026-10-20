// Shared check for `crossborder` tracks (USA: _data/us/pathways.yml, UK: _data/uk/careers/<sheet>.yml), used by
// scripts/check-us-data.mjs and scripts/check-uk-data.mjs. A track is a standalone roadmap page rendered by
// _includes/intl-roadmap.html from the stub <ed>/roadmaps/<slug>.html (written by scripts/build-intl-roadmaps.mjs).
import fs from 'node:fs';
import path from 'node:path';

const KINDS = ['start', 'stage', 'exam', 'licence', 'goal'];
const isDate = (d) => d instanceof Date || /^\d{4}-\d{2}-\d{2}$/.test(String(d));
const day = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d));

/**
 * @param {object} o  { root, ed: 'us'|'uk', tracks, where, hasSrc(id) → bool, err(where, msg), sheet? (uk) , seen: Set of slugs across the edition,
 *                     dir? (stub folder, default <ed>/roadmaps; USA trades use us/cte/roadmaps) }
 */
export function checkCrossborder({ root, ed, tracks, where, hasSrc, err, sheet, seen, dir }) {
  const today = new Date().toISOString().slice(0, 10);
  const src = (w, id) => { if (!id) err(w, 'missing source'); else if (!hasSrc(id)) err(w, `unknown source "${id}"`); };
  for (const [i, X] of (tracks || []).entries()) {
    const w = `${where}.crossborder[${X?.slug || i}]`;
    if (!/^[a-z0-9-]+$/.test(X.slug || '')) { err(w, 'bad or missing slug'); continue; }
    if (seen.has(X.slug)) err(w, `duplicate slug "${X.slug}" in the ${ed} edition`);
    seen.add(X.slug);
    for (const k of ['title', 'eyebrow', 'lede', 'for']) if (!X[k]) err(w, `missing ${k}`);
    if (!isDate(X.checked)) err(w, 'missing checked date');
    if (!isDate(X.review_by)) err(w, 'missing review_by date');
    else if (today > day(X.review_by)) err(w, `review_by ${day(X.review_by)} has passed: re-read every source, then move checked and review_by forward`);
    if (!(X.routes || []).length) err(w, 'needs at least one route');
    const ids = new Set();
    for (const R of X.routes || []) {
      const rw = `${w}.routes[${R.id}]`;
      if (!/^[a-z0-9-]+$/.test(R.id || '')) err(rw, 'bad or missing id');
      if (ids.has(R.id)) err(rw, 'duplicate route id');
      ids.add(R.id);
      for (const k of ['title', 'tag', 'who']) if (!R[k]) err(rw, `missing ${k}`);
      const steps = R.steps || [];
      if (steps.length < 3) err(rw, 'needs at least 3 steps');
      steps.forEach((s, j) => {
        if (!s.title || !s.tag) err(`${rw}.steps[${j}]`, 'missing title/tag');
        if (typeof s.text !== 'string') err(`${rw}.steps[${j}]`, 'text must be a string ("" for none)');
        if (!KINDS.includes(s.kind)) err(`${rw}.steps[${j}]`, `kind must be ${KINDS.join(' | ')}`);
        src(`${rw}.steps[${j}]`, s.source);
      });
      if (steps.length && steps[steps.length - 1].kind !== 'goal') err(rw, 'the last step must be kind: goal');
      (R.facts || []).forEach((f, j) => { if (!f.k || !f.v) err(`${rw}.facts[${j}]`, 'missing k/v'); src(`${rw}.facts[${j}]`, f.source); });
    }
    (X.watch || []).forEach((x, j) => { if (!x.text) err(`${w}.watch[${j}]`, 'missing text'); src(`${w}.watch[${j}]`, x.source); });
    const stub = `${dir || ed + '/roadmaps'}/${X.slug}.html`;
    const f = path.join(root, stub);
    if (!fs.existsSync(f)) { err(w, `${stub} is missing (run scripts/build-intl-roadmaps.mjs)`); continue; }
    const fm = fs.readFileSync(f, 'utf8');
    if (!new RegExp(`^track:\\s*${X.slug}\\s*$`, 'm').test(fm)) err(w, `${stub} must say track: ${X.slug}`);
    if (sheet && !new RegExp(`^sheet:\\s*${sheet}\\s*$`, 'm').test(fm)) err(w, `${stub} must say sheet: ${sheet}`);
    if (!fm.includes('{% include intl-roadmap.html %}')) err(w, `${stub} must include intl-roadmap.html`);
  }
}

/** Every <ed>/roadmaps/*.html stub (or one in `dir`) must belong to a track (no orphan pages). A `redirect_to` stub
 *  (an old URL kept alive, e.g. us/roadmaps/<trade>.html after the 2026-10-20 Trades & CTE split) is not a page. */
export function checkOrphanRoadmaps({ root, ed, seen, err, dir: rel }) {
  rel = rel || `${ed}/roadmaps`;
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html'))) {
    if (/^redirect_to:/m.test(fs.readFileSync(path.join(dir, f), 'utf8'))) continue;
    if (!seen.has(f.replace(/\.html$/, ''))) err(`${rel}/${f}`, 'no crossborder track with this slug');
  }
}
