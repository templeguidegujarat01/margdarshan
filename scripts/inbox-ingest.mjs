// inbox-ingest — turn state-fill files made by any Claude chat (docs/free-claude/PROMPT.md) into finder data.
//   VERIFY_DEPS=<deps> node scripts/inbox-ingest.mjs [--no-net]
//
// The owner uploads <topic>--<state>[--anything].yml files into inbox/ on GitHub; .github/workflows/inbox.yml runs
// this, then scripts/rebuild-learn.mjs, and commits. For each file it:
//   1. reads `topic` + `state` (file header, else the file name) and finds the topic in docs/free-claude/topics.yml
//      (build-learn-catalog.mjs); unknown topic or state → the file goes to inbox/rejected/ with the reason.
//   2. creates _data/in/learn/<finder>.yml from the topic's meta when that finder does not exist yet (its pages,
//      menu entries, search entries and the career-page button then appear on the rebuild by themselves).
//   3. cleans every row: required name / city / note / url; type outside the topic's list → its default type;
//      ownership words → Government / Grant-in-Aid / Statutory body / Deemed / Private; http → https; ranking
//      words (best, top, leading …) taken out of the note; a city spelled like an existing one reuses that spelling.
//   4. drops rows already listed (same name + city in this finder) and rows whose url / note_src does not exist
//      (DNS failure, 404, 410) — a made-up link never reaches the site. Sites that block robots (403, 429,
//      timeouts) are kept and marked "not confirmed" in the report.
//   5. appends the good rows to scripts/learn-src/local/<finder>/<state>.yml (the same files a Claude Code state
//      fill writes, docs/learn-finder/STATE-FILL.md), moves the upload to inbox/done/, and writes inbox/REPORT.md
//      plus one line per file in docs/learn-finder/LOG.md.
// --no-net skips step 4's link check (local testing only).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const NET = !process.argv.includes('--no-net');
const INBOX = path.join(root, 'inbox');
const today = new Date().toISOString().slice(0, 10);
const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const topics = yaml.load(rd('docs/free-claude/topics.yml')).topics;
const states = yaml.load(rd('_data/finder_states.yml'));
const norm = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const STATE_ALIAS = { 'delhi': 'delhi', 'new delhi': 'delhi', 'delhi ncr': 'delhi', 'nct of delhi': 'delhi', 'orissa': 'odisha', 'pondicherry': 'puducherry', 'j and k': 'jammu-kashmir', 'jammu and kashmir': 'jammu-kashmir', 'up': 'uttar-pradesh', 'mp': 'madhya-pradesh', 'tn': 'tamil-nadu', 'wb': 'west-bengal', 'uk': 'uttarakhand' };
function findState(v) {
  const n = norm(v);
  if (!n) return null;
  if (STATE_ALIAS[n]) return STATE_ALIAS[n];
  const s = states.find((x) => x.id === n.replace(/ /g, '-') || norm(x.name) === n || norm(x.id) === n);
  return s ? s.id : null;
}
function findTopic(v) {
  const n = norm(v).replace(/ /g, '-');
  if (!n) return null;
  return topics.find((t) => t.id === n)
    || topics.find((t) => t.kind === 'coaching' && (t.keys.coaching || []).includes(n.replace(/-/g, '_')))
    || topics.find((t) => t.kind === 'colleges' && (t.keys.colleges || []).includes(n.replace(/-/g, '_')))
    || topics.find((t) => t.finder === n)
    || topics.find((t) => norm(t.label) === norm(v)) || null;
}

const HYPE = /\b(best|top(?:-rated)?|no\.?\s*1|number one|#1|leading|premier|finest|renowned|famous)\b\s*/gi;
const OWN = [[/statutory|icai|icsi|icmai/i, 'Statutory body'], [/grant|aided/i, 'Grant-in-Aid'], [/deemed/i, 'Deemed'],
  [/gov|public|state[- ]run|central|sai\b|municipal|psu/i, 'Government'], [/.*/, 'Private']];
const ownership = (v) => (v ? OWN.find(([re]) => re.test(String(v)))[1] : 'Private');
const LABEL = [[/instagram\.com/, 'Instagram'], [/facebook\.com|fb\.com/, 'Facebook'], [/youtube\.com|youtu\.be/, 'YouTube'],
  [/justdial\.com/, 'Justdial'], [/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/, 'Google Maps'], [/sulekha\.com/, 'Sulekha'],
  [/collegedunia\.com/, 'Collegedunia'], [/shiksha\.com/, 'Shiksha'], [/linkedin\.com/, 'LinkedIn']];
const https = (u) => {
  const s = String(u || '').trim();
  if (!s) return '';
  const v = /^https?:\/\//i.test(s) ? s.replace(/^http:\/\//i, 'https://') : `https://${s.replace(/^\/+/, '')}`;
  try { return new URL(v).href; } catch { return ''; }
};
// Duplicate check: names compared without bracket parts ("ICAI Calicut Branch (SIRC)" = "ICAI Calicut Branch"),
// cities by their current name (Ernakulam / Cochin = Kochi, Calicut = Kozhikode …). An office-type row (ICAI
// office, …) is one per city: a second one in the same city is the same office under another name.
const CITY_SAME = { ernakulam: 'kochi', cochin: 'kochi', calicut: 'kozhikode', trivandrum: 'thiruvananthapuram', alleppey: 'alappuzha',
  quilon: 'kollam', trichur: 'thrissur', palghat: 'palakkad', cannanore: 'kannur', bombay: 'mumbai', madras: 'chennai', calcutta: 'kolkata',
  bangalore: 'bengaluru', baroda: 'vadodara', poona: 'pune', mysore: 'mysuru', mangalore: 'mangaluru', gurgaon: 'gurugram', banaras: 'varanasi',
  benares: 'varanasi', allahabad: 'prayagraj', trichy: 'tiruchirappalli', tiruchirapalli: 'tiruchirappalli', vizag: 'visakhapatnam',
  pondicherry: 'puducherry', belgaum: 'belagavi', hubli: 'hubballi', gulbarga: 'kalaburagi', shimoga: 'shivamogga' };
const cityKey = (c) => { const n = String(c || '').toLowerCase().replace(/[^a-z]+/g, ''); return CITY_SAME[n] || n; };
const key = (name, city) => `${String(name).toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '')}|${cityKey(city)}`;
const OFFICE = /office/i;
const titleCity = (c) => String(c).trim().replace(/\s+/g, ' ').replace(/\b[a-z]/g, (x) => x.toUpperCase());

// Link check: false = the page does not exist (row dropped), true = loaded, null = could not confirm (kept).
const seenUrl = new Map();
async function alive(u) {
  if (!NET) return true;
  if (seenUrl.has(u)) return seenUrl.get(u);
  const p = (async () => {
    const host = new URL(u).hostname;
    try { await dns.lookup(host); } catch (e) { return ['ENOTFOUND', 'ENODATA'].includes(e.code) ? false : null; }
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(u, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 (compatible; MargdarshanLinkCheck/1.0; +https://emargdarshan.com/editorial-policy.html)', accept: 'text/html,*/*' } });
      if (r.status === 404 || r.status === 410) return false;
      return r.ok ? true : null;
    } catch { return null; } finally { clearTimeout(t); }
  })();
  seenUrl.set(u, p);
  return p;
}

// Uploads are looked for in inbox/ AND anywhere else in the repo (the owner drags an extracted ZIP onto
// github.com: the file may land at the root or inside the ZIP's own folder). Outside inbox/ only names like
// <topic-id>--<state-id>[--n].yml with a known topic count, and the site's own folders are never searched.
const SKIP = new Set(['.git', '.github', 'node_modules', '_data', '_includes', '_layouts', '_archive', 'assets', 'scripts', 'docs', 'learn', 'coaching', 'colleges', 'roadmaps', 'us', 'uk', 'state', 'state-pathways', 'study-abroad', 'niche-careers', 'tables', 'redirects', 'design-system']);
const NAME = /^([a-z0-9-]+?)--([a-z-]+)(--[^/]*)?\.(ya?ml|txt)$/i;
const src = new Map(); // file name → absolute path
(function walk(dir, depth) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if ((depth === 0 && SKIP.has(e.name)) || p === path.join(INBOX, 'done') || p === path.join(INBOX, 'rejected') || p === path.join(INBOX, 'held') || p === path.join(INBOX, 'undone') || depth > 3) continue;
      walk(p, depth + 1);
    } else if (/\.(ya?ml|txt)$/i.test(e.name) && (dir === INBOX || (NAME.test(e.name) && findTopic(e.name.match(NAME)[1])))) {
      if (!src.has(e.name)) src.set(e.name, p);
    }
  }
})(root, 0);
const files = [...src.keys()].sort();
if (!files.length) { console.log('inbox-ingest: inbox is empty'); process.exit(0); }

// --reject-all="<reason>": the workflow's safety net. When the rebuild or the site checks fail after an ingest, the
// Action throws every change away (git reset) and runs this: each upload goes to inbox/rejected/ untouched, the
// reason goes in REPORT.md, and only that is committed, so the live site never changes on a failed run.
const REJECT = (process.argv.find((a) => a.startsWith('--reject-all=')) || '').slice(13);
if (REJECT) {
  const lines = [`# Inbox report — ${today}`, '', `**Nothing was published.** The automatic checks failed after reading these files, so the site was left exactly as it was: ${REJECT}`, '',
    'The files are in inbox/rejected/. Open the failed run on the Actions tab, copy the red error, and give it plus the file to any Claude chat (or Claude Code) to fix; then upload the fixed file again.', ''];
  for (const f of files) {
    fs.mkdirSync(path.join(INBOX, 'rejected'), { recursive: true });
    fs.renameSync(src.get(f), path.join(INBOX, 'rejected', `${today}--${f}`));
    lines.push(`- ${f}`);
  }
  fs.writeFileSync(path.join(INBOX, 'REPORT.md'), lines.join('\n') + '\n');
  console.log(`inbox-ingest: rejected ${files.length} file(s): ${REJECT}`);
  process.exit(0);
}

// Near-duplicates (a name that looks like a place already listed in the same city, e.g. "JK Shah" vs
// "JK Shah Classes — Kochi") are not published: they go to inbox/held/ with the name they look like.
const GENERIC = new Set(['the', 'of', 'and', 'for', 'in', 'classes', 'class', 'institute', 'institution', 'academy', 'coaching', 'centre', 'center',
  'school', 'college', 'branch', 'pvt', 'ltd', 'private', 'limited', 'india', 'education', 'educational', 'tutorials', 'tutorial', 'study', 'studies',
  'campus', 'office', 'official', 'ca', 'cs', 'cma', 'by', 'sir']);
const tokens = (name, city) => new Set(String(name).toLowerCase().replace(/\([^)]*\)/g, ' ').split(/[^a-z0-9]+/)
  .filter((w) => w && !GENERIC.has(w) && w !== cityKey(city) && cityKey(w) !== cityKey(city)));
const looksSame = (a, b) => { if (!a.size || !b.size) return false; let n = 0; for (const w of a) if (b.has(w)) n++; return n / Math.min(a.size, b.size) >= 0.8; };
const report = [`# Inbox report — ${today}`, '', 'Written by scripts/inbox-ingest.mjs (GitHub Action "Inbox build"). Newest run only; every run is also one line per file in docs/learn-finder/LOG.md.', ''];
const log = [];
const move = (f, sub) => {
  fs.mkdirSync(path.join(INBOX, sub), { recursive: true });
  fs.renameSync(src.get(f), path.join(INBOX, sub, `${today}--${f}`));
  // an extracted ZIP folder left empty by the move goes too (git drops empty folders anyway)
  for (let d = path.dirname(src.get(f)); d !== root && d !== INBOX && d.startsWith(root) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
};

for (const f of files) {
  report.push(`## ${f}`, '');
  let d;
  try {
    // Chats sometimes wrap the YAML in a ``` fence; take what is inside it.
    const raw = fs.readFileSync(src.get(f), 'utf8').replace(/^﻿/, '');
    const fenced = raw.match(/```(?:ya?ml)?\s*\n([\s\S]*?)```/);
    d = yaml.load(fenced ? fenced[1] : raw) || {};
  } catch (e) {
    report.push(`- REJECTED: not valid YAML (${e.message.split('\n')[0]}). Ask the chat to resend the file exactly in the format of docs/free-claude/PROMPT.md.`, '');
    move(f, 'rejected'); continue;
  }
  const [fTopic, fState] = f.replace(/\.(ya?ml|txt)$/i, '').split('--');
  const T = findTopic(d.topic || fTopic);
  const sid = findState(d.state || fState);
  if (!T || !sid) {
    report.push(`- REJECTED: ${!T ? `unknown topic "${d.topic || fTopic}" (use an id from the topic list in docs/free-claude/PROMPT.md)` : ''}${!T && !sid ? '; ' : ''}${!sid ? `unknown state "${d.state || fState}" (use a state id like gujarat, delhi, tamil-nadu)` : ''}.`, '');
    move(f, 'rejected'); continue;
  }
  const fid = T.finder;
  const metaFile = path.join(root, `_data/in/learn/${fid}.yml`);
  let created = false;
  if (!fs.existsSync(metaFile)) {
    if (!T.meta) { report.push(`- REJECTED: topic ${T.id} names finder ${fid}, which has no meta. Rerun scripts/build-learn-catalog.mjs.`, ''); move(f, 'rejected'); continue; }
    const M = T.meta;
    const meta = {
      id: fid, family: M.family, ...(M.stream ? { stream: M.stream } : {}), search_cat: M.search_cat,
      name: M.name, short: M.short, phrase: M.phrase, phrase_short: M.phrase_short, search_words: M.search_words,
      lead: M.lead, checked: today, generic: true,
      subjects: M.subjects, keys: T.keys, types: T.types,
      sources: [...(M.sources || []), { id: 'local', name: "Local institutes' own pages and public listings", url: 'editorial-policy.html', note: 'Added state by state; every card links the public page that was checked (Source button).' }],
      gaps: ['Local places are added one state at a time, so some states and cities have few listings yet.', 'Fees are not listed: ask each place for its current fee and batch dates in writing.'],
    };
    fs.writeFileSync(metaFile, `# "Where to learn" finder: ${M.name} (learn/${fid}.html and its state/city pages).\n`
      + `# Created by scripts/inbox-ingest.mjs from docs/free-claude/topics.yml on ${today}. Listings: scripts/learn-src/generic.mjs\n`
      + `# (old ${Object.entries(T.keys).map(([k, v]) => `${k} keys ${v.join(', ')}`).join('; ') || 'keys: none'}) + scripts/learn-src/local/${fid}/<state>.yml.\n`
      + '# Hand-edit this file (meta, sources, subjects); never the JSON.\n'
      + yaml.dump(meta, { lineWidth: 160, noRefs: true, quotingType: '"' }));
    created = true;
  }
  const types = yaml.load(fs.readFileSync(metaFile, 'utf8')).types;
  const defType = types.includes(T.default_type) ? T.default_type : types[0];

  // What this finder already lists (built JSON + every local file), for duplicates and city spellings.
  const have = new Set(), cityName = {};
  const jsonFile = path.join(root, `assets/data/learn/${fid}.json`);
  const old = fs.existsSync(jsonFile) ? JSON.parse(fs.readFileSync(jsonFile, 'utf8')) : [];
  const localDir = path.join(root, 'scripts/learn-src/local', fid);
  const localNow = fs.existsSync(localDir) ? fs.readdirSync(localDir).filter((x) => x.endsWith('.yml'))
    .flatMap((x) => (yaml.load(fs.readFileSync(path.join(localDir, x), 'utf8')).rows || []).map((r) => ({ ...r, state: x.replace(/\.yml$/, '') }))) : [];
  const offices = new Set(), near = [];
  for (const r of [...old, ...localNow]) {
    have.add(key(r.name, r.city));
    if (r.state === sid) near.push({ name: r.name, city: cityKey(r.city), t: tokens(r.name, r.city) });
    if (OFFICE.test(r.type || '') && r.state === sid) offices.add(`${r.type}|${cityKey(r.city)}`);
    if (r.state === sid && r.city) cityName[norm(r.city)] = r.city;
  }

  const out = [], drop = [], soft = [], held = [];
  const rows = Array.isArray(d.rows) ? d.rows : Array.isArray(d) ? d : [];
  for (const r0 of rows) {
    const r = r0 || {};
    const name = String(r.name || '').trim().replace(/\s+/g, ' ');
    const city = r.city ? cityName[norm(r.city)] || titleCity(r.city) : '';
    const url = https(r.url), src = https(r.note_src || r.source || r.url);
    let note = String(r.note || '').replace(HYPE, '').replace(/\s+/g, ' ').trim();
    if (note) note = note[0].toUpperCase() + note.slice(1);
    const miss = [!name && 'name', !city && 'city', !url && 'url', note.length < 12 && 'note'].filter(Boolean);
    if (miss.length) { drop.push(`${name || '(no name)'} — missing ${miss.join(', ')}`); continue; }
    const type = T.types.includes(r.type) && types.includes(r.type) ? r.type : defType;
    if (have.has(key(name, city))) { drop.push(`${name} (${city}) — already listed`); continue; }
    if (OFFICE.test(type) && offices.has(`${type}|${cityKey(city)}`)) { drop.push(`${name} (${city}) — this city's ${type} is already listed`); continue; }
    const tk = tokens(name, city), twin = near.find((x) => x.city === cityKey(city) && looksSame(tk, x.t));
    if (twin) { held.push({ ...r0, reason: `looks like "${twin.name}", already listed in ${city}` }); continue; }
    have.add(key(name, city));
    near.push({ name, city: cityKey(city), t: tk });
    if (OFFICE.test(type)) offices.add(`${type}|${cityKey(city)}`);
    const host = new URL(url).hostname.replace(/^www\./, '');
    out.push({
      name, city, area: String(r.area || '').trim().replace(/\s+/g, ' ') || city, type, ownership: ownership(r.ownership),
      note, note_src: src, url, url_label: String(r.url_label || '').trim() || (LABEL.find(([re]) => re.test(url)) || [, host === 'instagram.com' ? 'Instagram' : 'Official website'])[1],
      checked: String(d.checked || today),
      ...(Array.isArray(r.mode) && r.mode.length ? { mode: r.mode.map(String) } : {}),
      ...(Array.isArray(r.batches) && r.batches.length ? { batches: r.batches.map(String) } : {}),
    });
  }
  // Link check, 8 at a time.
  const ok = [];
  for (let i = 0; i < out.length; i += 8) {
    const part = out.slice(i, i + 8);
    const res = await Promise.all(part.map(async (r) => [await alive(r.url), r.note_src === r.url ? null : await alive(r.note_src)]));
    part.forEach((r, j) => {
      const [a, b] = res[j];
      if (a === false) { drop.push(`${r.name} (${r.city}) — url does not exist: ${r.url}`); return; }
      if (b === false) { r.note_src = r.url; soft.push(`${r.name} — note_src missing, used url instead`); }
      if (a === null) soft.push(`${r.name} — site did not answer the robot check (kept): ${r.url}`);
      ok.push(r);
    });
  }

  if (ok.length) {
    fs.mkdirSync(localDir, { recursive: true });
    const lf = path.join(localDir, `${sid}.yml`);
    const head = fs.existsSync(lf) ? '' : `# ${fid} · ${sid} — hand-researched local places (docs/learn-finder/STATE-FILL.md, docs/free-claude/)\nchecked: "${today}"\nrows:\n`;
    const body = yaml.dump(ok, { lineWidth: 200, noRefs: true, quotingType: '"', forceQuotes: true }).replace(/^/gm, '  ').replace(/\s+$/, '') + '\n';
    const prev = fs.existsSync(lf) ? fs.readFileSync(lf, 'utf8') : '';
    fs.writeFileSync(lf, head + prev + (prev && !prev.endsWith('\n') ? '\n' : '') + `  # ── free-Claude inbox ${today} (${f})\n` + body);
  }
  if (held.length) {
    fs.mkdirSync(path.join(INBOX, 'held'), { recursive: true });
    fs.writeFileSync(path.join(INBOX, 'held', `${today}--${f}`), `# Held back from ${f}: each looks like a place already on the site. Not published.\n`
      + '# If one really is a different place, fix its name (or city) here and upload this file again.\n'
      + yaml.dump({ topic: T.id, state: sid, checked: String(d.checked || today), rows: held }, { lineWidth: 200, noRefs: true, quotingType: '"' }));
  }
  const byCity = {}; for (const r of ok) byCity[r.city] = (byCity[r.city] || 0) + 1;
  report.push(`- Topic **${T.id}** → finder \`${fid}\`${created ? ' (NEW finder created)' : ''}, state **${sid}**`,
    `- Added **${ok.length}** of ${rows.length} rows${ok.length ? `: ${Object.entries(byCity).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${n}`).join(', ')}` : ''}`,
    `- Page after the build: https://emargdarshan.com/learn/${fid}/${sid}.html (a state page needs 3+ places, a city page 10+)`,
    ...(drop.length ? ['', `Dropped (${drop.length}):`, ...drop.map((x) => `  - ${x}`)] : []),
    ...(held.length ? ['', `Held back, NOT on the site (${held.length}) — inbox/held/${today}--${f}:`, ...held.map((x) => `  - ${x.name} — ${x.reason}`)] : []),
    ...(soft.length ? ['', `Notes (${soft.length}):`, ...soft.map((x) => `  - ${x}`)] : []), '');
  log.push(`${today} · ${fid}/${sid} · +${ok.length}${ok.length ? ` (${Object.entries(byCity).map(([c, n]) => `${c} ${n}`).join(', ')})` : ''} · free-Claude inbox ${f} · dropped ${drop.length}${held.length ? ` · held ${held.length}` : ""}`);
  move(f, ok.length ? 'done' : 'rejected');
  console.log(`inbox-ingest: ${f} → ${fid}/${sid}: +${ok.length}, dropped ${drop.length}${created ? ' (new finder)' : ''}`);
}
fs.writeFileSync(path.join(INBOX, 'REPORT.md'), report.join('\n') + '\n');
if (log.length) fs.appendFileSync(path.join(root, 'docs/learn-finder/LOG.md'), log.map((l) => `- ${l}`).join('\n') + '\n');
