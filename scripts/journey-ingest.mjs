// journey-ingest — turn Journey Blueprint files made by any Claude chat (journey-next.html → _includes/journey-prompt.txt)
// into live career pages. The owner's guide: docs/free-claude/JOURNEY-README.md.
//   VERIFY_DEPS=<deps> node scripts/journey-ingest.mjs [--no-net] [--reject-all="<reason>"]
//
// The owner uploads journey--<id>.yml (a new career) or journey-alias--<built id>.yml (more job titles for a career
// that already has a blueprint) anywhere in the repo — loose, inside the extracted ZIP's folder, or the .zip itself.
// .github/workflows/journey-inbox.yml runs this, then the journey checks, and commits. For each upload:
//   new career  1. reads the YAML (a ``` fence around it is fine); the id must be new, the title must be one of the
//                  10,000 titles (assets/data/career-titles.json) and not already covered by a blueprint.
//               2. cleans it: HTML stripped from every text, state-by-state rows / state_uses / roadmap dropped
//                  (national tier), links to pages that do not exist dropped, page = journey-<id>.html, its own
//                  source / money ids renamed when another file already uses them, uncited sources dropped,
//                  also_titles + the title become exact search phrases ("=title").
//               3. opens every source url: a domain that does not exist or a 404 / 410 page rejects the file (a made-up
//                  link never reaches the site); 403 / timeouts are kept and listed as "not confirmed".
//               4. writes _data/in/journey/<id>.yml, adds the id to journey_common.yml `careers`, marks the title done in
//                  journey_queue.yml (or adds a done row), writes journey-<id>.html (build-journey-pages.mjs) and runs
//                  check-journey-matrix.mjs. Any problem → that upload's changes are undone and it goes to
//                  inbox/rejected/ with the reason.
//   alias       adds the titles (from the 10,000 list, not covered yet) as "=title" search phrases of the built career.
// Done uploads move to inbox/done/journey/ (journey-undo.mjs reads them back); the run is written to
// inbox/JOURNEY-REPORT.md and one line per upload to docs/free-claude/JOURNEY-LOG.md.
// --reject-all="<reason>": the workflow's safety net when a later check fails — every upload goes to inbox/rejected/.
// --no-net skips the link check (local testing only).
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns/promises';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { loadJourney } from './lib/journey-data.mjs';
import { unzip } from './lib/unzip.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const NET = !process.argv.includes('--no-net');
const INBOX = path.join(root, 'inbox');
const today = new Date().toISOString().slice(0, 10);
const rel = (p) => path.relative(root, p).replace(/\\/g, '/');
const COMMON = path.join(root, '_data/in/journey_common.yml');
const QUEUE = path.join(root, '_data/in/journey_queue.yml');
const JDIR = path.join(root, '_data/in/journey');
const CATEGORIES = ['engineering-science', 'medical', 'technology', 'commerce', 'arts', 'govt', 'diploma', 'iti', 'guides'];
const CLASSES = ['c8', 'c9', 'c10', 'c11', 'c12', 'ug', 'grad', 'work'];
// One-word phrases that fit hundreds of titles: as a `search` phrase they would send students to the wrong road.
const TOO_WIDE = new Set(['engineer', 'officer', 'manager', 'teacher', 'doctor', 'analyst', 'technician', 'designer', 'consultant', 'specialist',
  'assistant', 'executive', 'operator', 'worker', 'scientist', 'inspector', 'clerk', 'agent', 'nurse', 'developer', 'trainer', 'coordinator',
  'guide', 'pilot', 'driver', 'writer', 'artist', 'therapist', 'instructor', 'planner', 'editor', 'researcher', 'supervisor', 'administrator',
  'associate', 'expert', 'professional', 'coach', 'career', 'job', 'jobs', 'government job', 'sarkari naukri']);

const norm = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const TITLES = new Map(JSON.parse(fs.readFileSync(path.join(root, 'assets/data/career-titles.json'), 'utf8')).t.map((x) => [norm(x[0]), x[0]]));

// ---- find the uploads (same places inbox-ingest.mjs looks: inbox/ and anywhere outside the site's own folders)
const SKIP = new Set(['.git', '.github', 'node_modules', '_data', '_includes', '_layouts', '_archive', 'assets', 'scripts', 'docs', 'learn', 'coaching', 'colleges', 'roadmaps', 'us', 'uk', 'state', 'state-pathways', 'study-abroad', 'niche-careers', 'tables', 'redirects', 'design-system', '_site']);
const NAME = /^journey(-alias)?--[a-z0-9-]+?(--[^/]*)?\.(ya?ml|txt|zip)$/i;
const src = new Map(); // upload name → absolute path
(function walk(dir, depth) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if ((depth === 0 && SKIP.has(e.name)) || ['done', 'rejected', 'held', 'undone'].some((x) => p === path.join(INBOX, x)) || depth > 3) continue;
      walk(p, depth + 1);
    } else if (NAME.test(e.name) && !src.has(e.name)) src.set(e.name, p);
  }
})(root, 0);
const uploads = [...src.keys()].sort();
if (!uploads.length) { console.log('journey-ingest: no journey uploads'); process.exit(0); }

const moveUpload = (f, sub) => {
  const to = path.join(INBOX, sub);
  fs.mkdirSync(to, { recursive: true });
  fs.renameSync(src.get(f), path.join(to, `${today}--${f}`));
  // an extracted ZIP folder left empty by the move goes too
  for (let d = path.dirname(src.get(f)); d !== root && d !== INBOX && d.startsWith(root) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
};

const REJECT = (process.argv.find((a) => a.startsWith('--reject-all=')) || '').slice(13);
if (REJECT) {
  const lines = [`# Journey inbox report — ${today}`, '', `**Nothing was published.** The automatic checks failed after reading these files, so the site was left exactly as it was: ${REJECT}`, '',
    'The files are in inbox/rejected/. Open the failed run on the Actions tab, copy the red error, and give it plus the file to any Claude chat to fix; then upload the fixed file again.', ''];
  for (const f of uploads) { moveUpload(f, 'rejected'); lines.push(`- ${f}`); }
  fs.writeFileSync(path.join(INBOX, 'JOURNEY-REPORT.md'), lines.join('\n') + '\n');
  console.log(`journey-ingest: rejected ${uploads.length} upload(s): ${REJECT}`);
  process.exit(0);
}

// ---- helpers
// Link check: false = the page does not exist, true = loaded, null = could not confirm (kept, listed in the report).
const seenUrl = new Map();
function alive(u) {
  if (!NET) return Promise.resolve(true);
  if (!seenUrl.has(u)) seenUrl.set(u, (async () => {
    let host;
    try { host = new URL(u).hostname; } catch { return false; }
    try { await dns.lookup(host); } catch (e) { return ['ENOTFOUND', 'ENODATA'].includes(e.code) ? false : null; }
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 20000);
    try {
      const r = await fetch(u, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 (compatible; MargdarshanLinkCheck/1.0; +https://emargdarshan.com/editorial-policy.html)', accept: 'text/html,application/pdf,*/*' } });
      if (r.status === 404 || r.status === 410) return false;
      return r.ok ? true : null;
    } catch { return null; } finally { clearTimeout(t); }
  })());
  return seenUrl.get(u);
}
// Text from a chat: no HTML (the pages print data as-is), one line, trimmed.
const clean = (s) => String(s).replace(/<[^>]*>/g, ' ').replace(/[<>]/g, ' ').replace(/\{[{%]|[%}]\}/g, ' ').replace(/\s+/g, ' ').trim();
function cleanTree(v) {
  if (typeof v === 'string') return clean(v);
  if (Array.isArray(v)) return v.map(cleanTree);
  if (v && typeof v === 'object' && !(v instanceof Date)) { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = cleanTree(x); return o; }
  return v;
}
const pageExists = (href) => typeof href === 'string' && !/^(https?:|mailto:|#)/.test(href) && fs.existsSync(path.join(root, href.split(/[?#]/)[0]));
const asList = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]);
const run = (script, ...args) => spawnSync(process.execPath, [path.join(root, script), ...args], { cwd: root, env: process.env, encoding: 'utf8' });
const parseUpload = (f) => {
  let text;
  if (/\.zip$/i.test(f)) {
    const ents = Object.entries(unzip(src.get(f))).filter(([n, b]) => b && /\.(ya?ml|txt)$/i.test(n));
    if (ents.length !== 1) throw new Error(`the ZIP must hold exactly one .yml file (found ${ents.length})`);
    text = ents[0][1].toString('utf8');
  } else text = fs.readFileSync(src.get(f), 'utf8');
  text = text.replace(/^﻿/, '');
  const fence = text.match(/```(?:ya?ml)?\s*\n([\s\S]*?)\n```/);
  if (fence) text = fence[1];
  const d = yaml.load(text);
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('the file is not a YAML map (open it — is it the whole file?)');
  return d;
};

// What is built now (re-read after each accepted upload).
function current() {
  const { D } = loadJourney(root, yaml);
  const covered = new Map(); // norm title → career id
  for (const c of D.careers) for (const s of c.search || []) if (String(s).startsWith('=')) covered.set(norm(s.slice(1)), c.id);
  const Q = yaml.load(fs.readFileSync(QUEUE, 'utf8'));
  for (const q of Q.careers || []) if (q.status === 'done') covered.set(norm(q.title), q.blueprint);
  return { D, covered, ids: new Set(D.careers.map((c) => c.id)), money: new Set(D.money.map((m) => m.id)), sources: new Set(D.sources.map((s) => s.id)) };
}
const toTitle = (t) => TITLES.get(norm(t));
// a one-line search list written the way the hand-built files write it: ["a", "b"]
const flow = (list) => '[' + list.map((x) => JSON.stringify(x)).join(', ') + ']';

// A career file, written so a person can read it: header comment, keys in the usual order, `search` on one line
// (journey-ingest / journey-undo edit that line for aliases).
const ORDER = ['id', 'v', 'name', 'title', 'category', 'search', 'keywords', 'page', 'doubts_page', 'checked', 'inbox', 'gate', 'gate_source', 'core', 'journey',
  'board_note', 'board_source', 'exam', 'state_rules', 'multiverse', 'money', 'money_defs', 'sources'];
function writeCareer(c, upload) {
  const head = [
    `# Journey Blueprint — ${c.name}. Printed on journey-${c.id}.html.`,
    `# Made by a Claude chat from the free-Claude prompt (_includes/journey-prompt.txt) and published by scripts/journey-ingest.mjs`,
    `# on ${today} from the upload ${upload}. National road only (lean data tier). Undo: Actions → "Journey undo" → ${c.id}.`,
    '# Check: node scripts/check-journey-matrix.mjs',
  ];
  const body = [];
  for (const k of ORDER) {
    if (c[k] === undefined) continue;
    if (k === 'search') { body.push(`search: ${flow(c.search)}`); continue; }
    body.push(yaml.dump({ [k]: c[k] }, { lineWidth: -1, noRefs: true, quotingType: '"' }).trimEnd());
    if (k === 'money') body.push('');
  }
  fs.writeFileSync(path.join(JDIR, `${c.id}.yml`), head.join('\n') + '\n' + body.join('\n') + '\n');
}
// Add / remove a career id in journey_common.yml `careers` without touching the rest of the file.
function addToCommon(id) {
  const lines = fs.readFileSync(COMMON, 'utf8').split('\n');
  let i = lines.findIndex((l) => /^careers:\s*$/.test(l));
  if (i < 0) throw new Error('journey_common.yml has no careers: list');
  while (i + 1 < lines.length && /^ {2}- /.test(lines[i + 1])) i++;
  lines.splice(i + 1, 0, `  - ${id}`);
  fs.writeFileSync(COMMON, lines.join('\n'));
}
// Mark the title done in journey_queue.yml: its todo row if it has one, else a new row at the end.
function markQueue(title, id) {
  const text = fs.readFileSync(QUEUE, 'utf8');
  const lines = text.split('\n');
  const at = lines.findIndex((l) => /^ {2}- \{ rank:/.test(l) && l.includes(`title: ${JSON.stringify(title)}`) && /status: todo/.test(l));
  if (at > -1) { lines[at] = lines[at].replace(/status: todo\s*\}/, `status: done, blueprint: ${id}, batch: inbox }`); fs.writeFileSync(QUEUE, lines.join('\n')); return; }
  const ranks = [...text.matchAll(/^ {2}- \{ rank: (\d+),/gm)].map((m) => +m[1]);
  let last = lines.length - 1;
  while (last > 0 && !lines[last].trim()) last--;
  lines.splice(last + 1, 0, `  - { rank: ${Math.max(0, ...ranks) + 1}, title: ${JSON.stringify(title)}, status: done, blueprint: ${id}, batch: inbox, added: inbox }`);
  fs.writeFileSync(QUEUE, lines.join('\n'));
}
// Add exact-title phrases to a built career's one-line `search:` list.
function addSearch(id, titles) {
  const file = path.join(JDIR, `${id}.yml`);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const i = lines.findIndex((l) => /^search:\s*\[.*\]\s*$/.test(l));
  if (i < 0) throw new Error(`${id}.yml has no one-line search: [ … ] list`);
  const list = yaml.load(lines[i].replace(/^search:\s*/, ''));
  for (const t of titles) if (!list.includes('=' + t)) list.push('=' + t);
  lines[i] = 'search: ' + flow(list);
  fs.writeFileSync(file, lines.join('\n'));
}

// ---- one new career
async function career(f, d, now, notes) {
  let id = String(d.id || f.replace(/^journey--/, '').replace(/--.*$/, '').replace(/\.(ya?ml|txt|zip)$/i, '')).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!/^[a-z0-9]+(-[a-z0-9]+){0,5}$/.test(id) || id.length > 48) throw new Error(`id "${id}" must be 1–6 lowercase words joined by hyphens`);
  if (id === 'blueprint' || id === 'next') throw new Error(`id "${id}" is reserved`);
  if (now.ids.has(id) || fs.existsSync(path.join(root, `journey-${id}.html`))) throw new Error(`a blueprint with id "${id}" already exists — if it is the same road, ask the chat for FORMAT B (alias) instead`);
  const title = toTitle(d.title);
  if (!title) throw new Error(`title "${d.title}" is not one of the 10,000 titles — copy the request line from journey-next.html again`);
  if (now.covered.has(norm(title))) throw new Error(`"${title}" is already covered by the blueprint "${now.covered.get(norm(title))}"`);
  if (/coming soon/i.test(JSON.stringify(d))) throw new Error('the text says "coming soon" — write what exists today');

  const c = cleanTree(d);
  c.id = id; c.v = 2; c.title = title;
  c.category = CATEGORIES.includes(c.category) ? c.category : 'guides';
  c.page = `journey-${id}.html`; c.doubts_page = `journey-${id}.html`; c.checked = today; c.inbox = f;
  delete c.roadmap; delete c.state_uses; delete c.foundation; delete c.board_notes;
  const dropped = [];
  c.state_rules = asList(c.state_rules).filter((r) => r && !r.state);
  if (!c.state_rules.length) delete c.state_rules;
  const href = (o, where) => { if (o && o.href !== undefined && !pageExists(o.href)) { dropped.push(`${where} link ${o.href}`); delete o.href; } };
  if (c.exam) href(c.exam, 'exam');
  for (const r of c.state_rules || []) href(r, 'state_rules');
  for (const j of asList(c.journey)) for (const x of asList(j.exams)) href(x, 'exam window');
  c.multiverse = asList(c.multiverse).filter((m) => m && m.title);
  c.multiverse.forEach((m) => href(m, 'multiverse'));

  // search phrases: drop one-word phrases that fit many careers; add the title and also_titles as exact phrases
  const also = [];
  for (const t of asList(c.also_titles)) {
    const ok = toTitle(t);
    if (!ok) dropped.push(`also_title "${t}" (not in the 10,000 list)`);
    else if (now.covered.has(norm(ok))) dropped.push(`also_title "${ok}" (already covered by ${now.covered.get(norm(ok))})`);
    else if (norm(ok) !== norm(title) && !also.includes(ok)) also.push(ok);
  }
  delete c.also_titles;
  const search = [];
  for (const s of asList(c.search).map(String)) {
    const p = s.replace(/^=/, '').trim().toLowerCase();
    if (!p || TOO_WIDE.has(p) || p.split(/\s+/).length === 1 && p.length < 4) { if (p) dropped.push(`search phrase "${p}" (too wide)`); continue; }
    if (!search.includes(p)) search.push(p);
  }
  for (const t of [title, ...also]) search.push('=' + t);
  c.search = search;
  c.keywords = [...new Set(asList(c.keywords).map((k) => String(k).toLowerCase()).filter(Boolean))].slice(0, 40);
  if (!c.keywords.length) delete c.keywords;

  // own ids that another file already uses → <id>-<old>
  const ren = { source: {}, money: {} };
  for (const s of asList(c.sources)) if (now.sources.has(s.id)) { ren.source[s.id] = `${id}-${s.id}`; s.id = ren.source[s.id]; }
  for (const m of asList(c.money_defs)) if (now.money.has(m.id)) { ren.money[m.id] = `${id}-${m.id}`; m.id = ren.money[m.id]; }
  const rs = (v) => (Array.isArray(v) ? v.map(rs) : ren.source[v] || v);
  const rm = (v) => asList(v).map((x) => ren.money[x] || x);
  (function walkIds(o) {
    if (Array.isArray(o)) return o.forEach(walkIds);
    if (!o || typeof o !== 'object') return;
    for (const k of Object.keys(o)) {
      if (['source', 'gate_source', 'board_source'].includes(k)) o[k] = rs(o[k]);
      else if (k === 'money' && o !== c.money_defs) o[k] = rm(o[k]);
      else walkIds(o[k]);
    }
  })(c);
  // every money id used in a step is listed at the top level
  const used = new Set(asList(c.money));
  for (const j of asList(c.journey)) for (const m of asList(j.money)) used.add(m);
  c.money = [...used];
  // sources nobody cites are dropped (the checker fails on them)
  const cited = new Set();
  (function walkCite(o) {
    if (Array.isArray(o)) return o.forEach(walkCite);
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (['source', 'gate_source', 'board_source'].includes(k)) asList(v).forEach((x) => cited.add(x));
      else if (k !== 'sources') walkCite(v);
    }
  })(c);
  c.sources = asList(c.sources).filter((s) => { if (cited.has(s.id)) return true; dropped.push(`source ${s.id} (never cited)`); return false; });
  if (!c.money_defs || !asList(c.money_defs).length) delete c.money_defs;
  for (const s of c.sources) { s.url = String(s.url || '').replace(/^http:\/\//i, 'https://'); s.checked = s.checked instanceof Date ? s.checked.toISOString().slice(0, 10) : s.checked || today; }

  // links
  const bad = [], unsure = [];
  for (const s of c.sources) { const ok = await alive(s.url); if (ok === false) bad.push(`${s.id}: ${s.url}`); else if (ok === null) unsure.push(`${s.id}: ${s.url}`); }
  if (bad.length) throw new Error(`these source links do not exist (domain not found or page 404) — ask the chat for the real official links:\n  - ${bad.join('\n  - ')}`);

  // write, build the page, check — undo this upload's changes if the check fails
  const before = { common: fs.readFileSync(COMMON, 'utf8'), queue: fs.readFileSync(QUEUE, 'utf8') };
  const restore = () => {
    fs.writeFileSync(COMMON, before.common); fs.writeFileSync(QUEUE, before.queue);
    for (const p of [path.join(JDIR, `${id}.yml`), path.join(root, `journey-${id}.html`)]) if (fs.existsSync(p)) fs.unlinkSync(p);
  };
  try {
    writeCareer(c, f);
    addToCommon(id);
    markQueue(title, id);
    const b = run('scripts/build-journey-pages.mjs');
    if (b.status !== 0) throw new Error('page build failed:\n' + (b.stderr || b.stdout).trim());
    const k = run('scripts/check-journey-matrix.mjs');
    if (k.status !== 0) throw new Error('the career data check failed — give these lines to the chat and ask it to fix the file:\n' + (k.stderr || k.stdout).trim().split('\n').filter((l) => !/^journey: \d+ problem/.test(l)).join('\n'));
  } catch (e) { restore(); throw e; }

  const nd = asList(c.journey).reduce((n, j) => n + asList(j.doubts).length, 0);
  notes.push(`**Published:** journey-${id}.html — "${title}", ${asList(c.journey).length} stages, ${nd} doubts, ${c.sources.length} sources${also.length ? `; also covers: ${also.join(', ')}` : ''}.`);
  if (unsure.length) notes.push(`Links that blocked our robot (kept, open them once yourself):\n${unsure.map((u) => '  - ' + u).join('\n')}`);
  if (dropped.length) notes.push(`Taken out:\n${dropped.map((u) => '  - ' + u).join('\n')}`);
  return `${id} · "${title}" · ${nd} doubts${also.length ? ` · +${also.length} titles` : ''}`;
}

// ---- an alias upload: more titles for a built career
function alias(f, d, now, notes) {
  const id = String(d.alias_of || '').trim();
  if (!now.ids.has(id)) throw new Error(`alias_of "${id}" is not a built blueprint`);
  const add = [], skipped = [];
  for (const t of asList(d.titles)) {
    const ok = toTitle(t);
    if (!ok) skipped.push(`"${t}" (not in the 10,000 list)`);
    else if (now.covered.has(norm(ok))) skipped.push(`"${ok}" (already covered by ${now.covered.get(norm(ok))})`);
    else if (!add.includes(ok)) add.push(ok);
  }
  if (!add.length) throw new Error(`no new title to add${skipped.length ? ': ' + skipped.join(', ') : ''}`);
  addSearch(id, add);
  const k = run('scripts/check-journey-matrix.mjs');
  if (k.status !== 0) throw new Error('the career data check failed:\n' + (k.stderr || k.stdout).trim());
  notes.push(`**Added to journey-${id}.html search:** ${add.join(', ')}.${d.reason ? ' Reason given: ' + clean(d.reason) : ''}`);
  if (skipped.length) notes.push(`Skipped: ${skipped.join(', ')}`);
  return `alias → ${id} · +${add.length} titles`;
}

// ---- run
const report = [`# Journey inbox report — ${today}`, '', 'Written by scripts/journey-ingest.mjs (GitHub Action "Journey inbox"). Newest run only; every run is also one line per upload in docs/free-claude/JOURNEY-LOG.md.', ''];
const log = [];
let ok = 0;
for (const f of uploads) {
  report.push(`## ${f}`, '');
  const notes = [];
  try {
    const d = parseUpload(f);
    const now = current();
    const line = d.alias_of ? alias(f, d, now, notes) : await career(f, d, now, notes);
    moveUpload(f, 'done/journey');
    log.push(`- ${today} · ${f} · ${line}`);
    ok++;
  } catch (e) {
    moveUpload(f, 'rejected');
    notes.push(`**Rejected — nothing from this file was published.** ${e.message}`, '', `The file is in inbox/rejected/${today}--${f}. Give this reason and the file to a Claude chat, ask it to fix only that, and upload the fixed file.`);
    log.push(`- ${today} · ${f} · REJECTED: ${e.message.split('\n')[0]}`);
  }
  report.push(...notes, '');
}
// alias uploads change search phrases → the site search entries (and stubs) are rebuilt once at the end
if (ok) {
  const b = run('scripts/build-journey-pages.mjs');
  if (b.status !== 0) { console.error((b.stderr || b.stdout).trim()); process.exit(1); }
}
fs.mkdirSync(INBOX, { recursive: true });
fs.writeFileSync(path.join(INBOX, 'JOURNEY-REPORT.md'), report.join('\n'));
const LOG = path.join(root, 'docs/free-claude/JOURNEY-LOG.md');
if (!fs.existsSync(LOG)) fs.writeFileSync(LOG, '# Journey inbox log\n\nOne line per upload (scripts/journey-ingest.mjs, journey-undo.mjs). Newest at the bottom.\n\n');
fs.appendFileSync(LOG, log.join('\n') + '\n');
console.log(`journey-ingest: ${ok} of ${uploads.length} upload(s) published — see inbox/JOURNEY-REPORT.md`);
for (const l of log) console.log(l);
