// build-learn-finders — the "where to learn" finder pages, one finder per _data/in/learn/<id>.yml.
//   VERIFY_DEPS=<deps> node scripts/build-learn-finders.mjs [--check]
//
// For every finder (meta in _data/in/learn/<id>.yml, listings in assets/data/learn/<id>.json from
// scripts/learn-src/<id>.mjs) it writes:
//   learn/<id>.html                   the whole list: hero, filter bar, first cards, load more, sources fold
//   learn/<id>/<state>.html           states with at least STATE_MIN listings (every card pre-rendered)
//   learn/<id>/<state>/<city>.html    cities with at least CITY_MIN listings, unless the city holds every
//                                     listing in its state (it would repeat the state page)
//   learn/index.html                  hub of live finders, grouped by learn_map family
//   _data/learn_index.yml             finders, their pages and counts + search entries (assets/search.json,
//                                     _includes/learn-link.html, seo-listing-renderer.html read it)
// Cards come from assets/js/learn-finder.js card() — the same function the browser uses to redraw them.
// Titles and descriptions carry live counts, so rerun after every data change; --check exits 1 when stale.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { fitTitle, fitDesc } from './lib/seo-fit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'));
const yaml = req('js-yaml');
const LF = createRequire(import.meta.url)('../assets/js/learn-finder.js');
const CHECK = process.argv.includes('--check');
const STATE_MIN = 3, CITY_MIN = 10;
const SHORT = 'Margdarshan';

const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const states = yaml.load(rd('_data/finder_states.yml'));
const stateName = Object.fromEntries(states.map((s) => [s.id, s.name]));
const families = yaml.load(rd('_data/in/learn_map.yml')).families;
const q = (s) => JSON.stringify(String(s));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (n) => Number(n).toLocaleString('en-IN');
const plural = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;
const andList = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}` : a.join(''));
const SEARCH_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
const EXT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>';

const dir = path.join(root, '_data/in/learn');
const finders = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.yml')).sort().map((f) => yaml.load(rd(`_data/in/learn/${f}`))) : [];
const seo = yaml.load(rd('_data/seo_landings.yml'));
const files = new Map();
const index = { finders: {}, search: [] };

for (const F of finders) {
  const rows = LF.sort(JSON.parse(rd(`assets/data/learn/${F.id}.json`)), F.types);
  const byState = {};
  for (const r of rows) ((byState[r.state] ||= { rows: [], cities: {} }).rows.push(r), (byState[r.state].cities[r.city] ||= []).push(r));
  const entry = (index.finders[F.id] = {
    name: F.name, short: F.short, family: F.family, href: `learn/${F.id}.html`, listings: rows.length,
    subjects: F.subjects.map((s) => s.href), keys: F.keys, states: {},
  });
  for (const s of states) {
    const st = byState[s.id];
    if (!st || st.rows.length < STATE_MIN) continue;
    const cities = {};
    for (const [city, list] of Object.entries(st.cities)) {
      if (list.length < CITY_MIN || list.length === st.rows.length) continue;
      cities[LF.slug(city)] = { name: city, n: list.length };
    }
    entry.states[s.id] = { name: s.name, n: st.rows.length, cities };
  }
  files.set(`learn/${F.id}.html`, page(F, rows, null, null, entry));
  for (const [sid, se] of Object.entries(entry.states)) {
    files.set(`learn/${F.id}/${sid}.html`, page(F, byState[sid].rows, sid, null, entry));
    for (const [cs, ce] of Object.entries(se.cities)) files.set(`learn/${F.id}/${sid}/${cs}.html`, page(F, byState[sid].cities[ce.name], sid, ce.name, entry));
    index.search.push({ t: `${F.phrase} in ${se.name}`, s: `${fmt(se.n)} verified places, with official links`, u: `learn/${F.id}/${sid}.html`, c: F.search_cat || 'colleges', k: `${F.short} ${se.name} where to learn colleges coaching list`.toLowerCase() });
  }
  index.search.push({ t: `Where to learn: ${F.name}`, s: `${fmt(rows.length)} verified places in India, filter by state and city`, u: `learn/${F.id}.html`, c: F.search_cat || 'colleges', k: `${F.short} where to learn colleges coaching institutes india list finder`.toLowerCase() });
}
files.set('learn/index.html', hub());
files.set('_data/learn_index.yml', ['# Generated by scripts/build-learn-finders.mjs — live "where to learn" finders, their state/city pages and counts.',
  '# Read by assets/search.json, _includes/learn-link.html and _includes/seo-listing-renderer.html. Do not edit by hand.',
  yaml.dump(index, { lineWidth: -1, noRefs: true, quotingType: '"' })].join('\n'));

function counts(rows) {
  const t = {}; for (const r of rows) t[r.type] = (t[r.type] || 0) + 1;
  return t;
}

function page(F, rows, sid, city, entry) {
  const sName = sid && stateName[sid];
  const place = city ? `${city}, ${sName}` : sName || 'India';
  const where = city || sName || 'India';
  const t = counts(rows);
  const gov = rows.filter((r) => r.ownership === 'Government').length;
  // "Medical college" → "medical colleges"; acronyms stay ("JEE coaching centres").
  const typeLine = F.types.filter((k) => t[k]).map((k) => {
    const w = k.replace(/^[A-Z][a-z]/, (c) => c.toLowerCase());
    return `${fmt(t[k])} ${t[k] === 1 ? w : k.endsWith('coaching') ? `${w} centres` : k.endsWith('y') ? `${w.slice(0, -1)}ies` : `${w}s`}`;
  });
  const bases = [`${F.phrase} in ${where}`, `${F.phrase_short} in ${where}`];
  const title = fitTitle(...bases.map((b) => `${b} | ${SHORT}`), ...bases, `${F.short} in ${where}`);
  const desc = fitDesc(`${fmt(rows.length)} verified places to learn in ${place}: ${andList(typeLine)}${gov ? ` (${fmt(gov)} government)` : ''}. Filter by city, type and ownership; every listing links to its official site.`);

  const crumb = city
    ? { parent_href: `learn/${F.id}/${sid}.html`, parent_label: `${F.short} in ${sName}`, current: city }
    : sid ? { parent_href: `learn/${F.id}.html`, parent_label: `${F.short} in India`, current: sName }
      : { parent_href: 'learn/', parent_label: 'Where to learn', current: F.short };
  const pre = sid ? rows : rows.slice(0, LF.PAGE);
  const cityList = sid ? Object.entries(entry.states[sid].cities).filter(([cs]) => !city || cs !== LF.slug(city)) : [];
  const stateList = Object.entries(entry.states).filter(([s]) => s !== sid);
  const ld = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: `${F.phrase} in ${place}`, numberOfItems: rows.length,
    itemListElement: pre.slice(0, 100).map((r, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': /college/i.test(r.type) ? 'CollegeOrUniversity' : 'EducationalOrganization', name: r.name, url: r.url, address: { '@type': 'PostalAddress', addressLocality: r.city, addressRegion: r.region || stateName[r.state], addressCountry: 'IN' } } })),
  };
  // Old verified-list pages for the same keys (colleges/<state>/<key>.html, coaching/…) link both ways.
  const old = [];
  if (sid) for (const [type, keys] of Object.entries(F.keys || {})) for (const k of keys) {
    const st = seo[type] && seo[type].states[sid];
    if (!st) continue;
    const cs = city && LF.slug(city);
    if (cs && st.cities[cs] && st.cities[cs].lists[k]) old.push([`${type}/${sid}/${cs}/${k}.html`, `${seo[type].labels[k].short} ${type === 'colleges' ? 'colleges' : 'coaching'} in ${city}`]);
    else if (st.lists[k]) old.push([`${type}/${sid}/${k}.html`, `${seo[type].labels[k].short} ${type === 'colleges' ? 'colleges' : 'coaching'} in ${sName}`]);
  }
  const hasMode = rows.some((r) => r.mode);
  const hasBranch = rows.some((r) => r.branches);
  const sel = (name, label) => `<label class="lf-field"><span>${label}</span><select name="${name}"><option value="">All</option></select></label>`;
  const statesJson = esc(JSON.stringify(Object.fromEntries(states.map((s) => [s.id, s.name]))));
  const lines = [
    '---',
    '# Generated by scripts/build-learn-finders.mjs from _data/in/learn/' + F.id + '.yml + assets/data/learn/' + F.id + '.json. Do not edit: change the data and rerun it.',
    `title: ${q(title)}`,
    `description: ${q(desc)}`,
    `og_title: ${q(fitTitle(...bases, `${F.short} in ${where}`))}`,
    'og_type: "website"',
    ...(F.stream ? [`stream: ${F.stream}`] : []),
    `learn_finder: ${F.id}`,
    'breadcrumb:',
    ...Object.entries(crumb).map(([k, v]) => `  ${k}: ${q(v)}`),
    '---',
    `<link rel="preload" href="assets/data/learn/${F.id}.json" as="fetch" crossorigin data-lf-json>`,
    `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    '<main id="main" class="sl-page lf-page">',
    '  <section class="page-hero sl-hero" aria-labelledby="lf-heading">',
    '    <div class="container page-hero-inner">',
    `      <span class="eyebrow">Where to learn · ${esc(where)}</span>`,
    `      <h1 id="lf-heading">${esc(F.phrase)} in ${esc(place)}</h1>`,
    `      <p>${sid ? `${plural(rows.length, 'verified place', 'verified places')} in ${esc(place)}: ${esc(andList(typeLine))}.` : esc(F.lead)} Every listing comes from an official register or the institute's own site, checked ${esc(F.checked)}. The order is not a ranking.</p>`,
    '      <dl class="sl-console">',
    `        <div><dt>Verified places</dt><dd>${fmt(rows.length)}</dd></div>`,
    ...F.types.map((k) => `        <div><dt>${esc(k)}</dt><dd>${fmt(t[k] || 0)}</dd></div>`),
    `        <div><dt>${city ? 'City' : sid ? 'Cities' : 'States'}</dt><dd>${city ? esc(city) : fmt(new Set(rows.map((r) => (sid ? r.city : r.state))).size)}</dd></div>`,
    `        <div class="sl-console-wide"><dt>Registers</dt><dd>${esc(F.sources.map((s) => s.name.split(' — ')[0].split(' (')[0]).join(' · '))}</dd></div>`,
    '      </dl>',
    '      <div class="sl-actions">',
    ...F.subjects.map((s, i) => `        <a class="${i ? 'btn-exam-secondary' : 'btn-exam-primary sl-finder-btn'}" href="${s.href}">${esc(s.label)}</a>`),
    ...(sid ? [`        <a class="btn-exam-secondary" href="learn/${F.id}.html">All of India</a>`] : []),
    '      </div>',
    '    </div>',
    '  </section>',
    '  <section class="sl-block" aria-labelledby="lf-list-heading">',
    `    <div class="container lf" data-lf data-lf-types="${esc(JSON.stringify(F.types))}" data-lf-states="${statesJson}"${sid ? ` data-lf-state="${sid}"` : ''}${city ? ` data-lf-city="${esc(city)}"` : ''}>`,
    `      <h2 id="lf-list-heading" class="sl-h2">${plural(rows.length, 'verified place', 'verified places')} in ${esc(place)}</h2>`,
    '      <form class="lf-bar" data-lf-filters role="search" aria-label="Filter the list" hidden>',
    `        <label class="lf-field lf-q"><span>Search</span><input type="search" name="q" placeholder="Name, city or area" autocomplete="off">${SEARCH_SVG}</label>`,
    ...(sid ? [] : [sel('state', 'State')]),
    ...(city ? [] : [sel('city', 'City')]),
    sel('type', 'Type'), sel('own', 'Ownership'),
    ...(hasBranch ? [sel('branch', 'Branch')] : []),
    ...(hasMode ? [sel('mode', 'Mode')] : []),
    '        <button type="reset" class="lf-reset">Clear</button>',
    '      </form>',
    `      <p class="lf-count" data-lf-count aria-live="polite">${sid ? `Showing all ${fmt(rows.length)}` : `Showing ${fmt(pre.length)} of ${fmt(rows.length)}`} verified places</p>`,
    '      <div class="cx-grid fx-results sl-grid lf-grid" data-lf-grid>',
    ...pre.map((r) => '        ' + LF.card(r, stateName)),
    '      </div>',
    '      <button type="button" class="btn-exam-secondary lf-more" data-lf-more hidden>Load more</button>',
    ...(sid ? [] : [`      <noscript><p class="sl-note">Turn on JavaScript to see all ${fmt(rows.length)} places, or open a state below.</p></noscript>`]),
    '    </div>',
    '  </section>',
    '  <section class="sl-block sl-related" aria-labelledby="lf-more-heading">',
    '    <div class="container">',
    '      <h2 id="lf-more-heading" class="sl-h2">Keep exploring</h2>',
    ...(cityList.length ? [`      <h3 class="sl-h3">${esc(F.short)} by city in ${esc(sName)}</h3>`, '      <ul class="sl-links">', ...cityList.map(([cs, c]) => `        <li><a href="learn/${F.id}/${sid}/${cs}.html">${esc(c.name)} <span>${fmt(c.n)}</span></a></li>`), '      </ul>'] : []),
    ...(!sid ? [`      <h3 class="sl-h3">${esc(F.short)} by state</h3>`, '      <ul class="sl-links">', ...stateList.map(([s, e]) => `        <li><a href="learn/${F.id}/${s}.html">${esc(e.name)} <span>${fmt(e.n)}</span></a></li>`), '      </ul>'] : []),
    ...(old.length ? ['      <h3 class="sl-h3">Same lists, one type at a time</h3>', '      <ul class="sl-links">', ...old.map(([h, l]) => `        <li><a href="${h}">${esc(l)}</a></li>`), '      </ul>'] : []),
    ...(sid ? [`      <h3 class="sl-h3">${esc(F.short)} in other states</h3>`, '      <ul class="sl-links">', ...stateList.map(([s, e]) => `        <li><a href="learn/${F.id}/${s}.html">${esc(e.name)} <span>${fmt(e.n)}</span></a></li>`), '      </ul>'] : []),
    `      <p class="sl-note">How this list is built: every place comes from an official register or the institute's own website; nothing is typed in by hand or ranked. State pages exist with ${STATE_MIN}+ places and city pages with ${CITY_MIN}+. Spotted a mistake? <a href="contact.html">Tell us</a>.</p>`,
    '    </div>',
    '  </section>',
    '  <section class="block mb sc-block" id="sources" aria-labelledby="sources-heading">',
    '    <div class="container">',
    '      <div class="section-head">',
    '        <span class="eyebrow">Official sources &amp; verification</span>',
    '        <h2 id="sources-heading">Where these listings come from</h2>',
    `        <p>Read on ${esc(F.checked)}. ${esc((F.gaps || []).join(' '))}</p>`,
    '      </div>',
    '      <ol class="cite-list">',
    ...F.sources.map((s) => `        <li id="src-${s.id}"><a class="source-link" href="${esc(s.url)}"${/^https?:/.test(s.url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${EXT} ${esc(s.name)}${/^https?:/.test(s.url) ? '<span class="sr-only"> (opens in a new tab)</span>' : ''}</a>${s.note ? ` <span class="cite-note">${esc(s.note)}</span>` : ''}</li>`),
    '      </ol>',
    '      {% include src-more.html %}',
    '    </div>',
    '  </section>',
    '</main>',
    '<script src="assets/js/learn-finder.js" defer></script>',
    '',
  ];
  return lines.join('\n');
}

function hub() {
  const live = Object.entries(index.finders);
  const groups = families.map((f) => [f.id, f]).filter(([fid]) => live.some(([, f]) => f.family === fid));
  const total = live.reduce((a, [, f]) => a + f.listings, 0);
  return [
    '---',
    '# Generated by scripts/build-learn-finders.mjs. Do not edit: add a finder in _data/in/learn/ and rerun it.',
    `title: ${q(fitTitle(`Where to Learn in India: Verified Colleges & Classes | ${SHORT}`, 'Where to Learn in India: Verified Colleges & Classes'))}`,
    `description: ${q(fitDesc(`${fmt(total)} verified places to learn in India, from official registers: ${live.map(([, f]) => f.short).join(', ')}. Filter by state and city.`))}`,
    'og_type: "website"',
    'breadcrumb:',
    '  parent_href: "india.html"',
    '  parent_label: "India"',
    '  current: "Where to learn"',
    '---',
    '<main id="main" class="sl-page lf-page">',
    '  <section class="page-hero sl-hero" aria-labelledby="lf-heading">',
    '    <div class="container page-hero-inner">',
    '      <span class="eyebrow">Where to learn · India</span>',
    '      <h1 id="lf-heading">Where to learn in India</h1>',
    `      <p>One list per subject of every place we could verify on an official register: ${plural(live.length, 'finder', 'finders')} so far, ${plural(total, 'verified place', 'verified places')}. More subjects are added one at a time.</p>`,
    '    </div>',
    '  </section>',
    ...groups.flatMap(([fid, fam]) => [
      `  <section class="sl-block" aria-labelledby="lf-fam-${fid}">`,
      '    <div class="container">',
      `      <h2 id="lf-fam-${fid}" class="sl-h2">${esc(fam.label)}</h2>`,
      '      <ul class="sl-links sl-links-lg">',
      ...live.filter(([, f]) => f.family === fid).map(([id, f]) => `        <li><a href="learn/${id}.html">${esc(f.name)} <span>${fmt(f.listings)}</span></a></li>`),
      '      </ul>',
      '    </div>',
      '  </section>',
    ]),
    '</main>',
    '',
  ].join('\n');
}

// ---- write / check ----
const existing = [];
const walk = (d) => {
  if (!fs.existsSync(path.join(root, d))) return;
  for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
    const r = d + '/' + e.name;
    if (e.isDirectory()) walk(r); else if (r.endsWith('.html')) existing.push(r);
  }
};
walk('learn');
const stale = existing.filter((f) => !files.has(f));
const changed = [...files].filter(([f, c]) => {
  const p = path.join(root, f);
  return !fs.existsSync(p) || fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') !== c;
}).map(([f]) => f);
const pages = [...files.keys()].filter((f) => f.endsWith('.html'));
for (const [id, f] of Object.entries(index.finders)) {
  const st = Object.keys(f.states).length, ct = Object.values(f.states).reduce((a, s) => a + Object.keys(s.cities).length, 0);
  console.log(`${id}: ${f.listings} listings, ${st} state pages, ${ct} city pages`);
}
console.log(`${pages.length} learn pages in total`);
if (CHECK) {
  if (changed.length || stale.length) {
    console.log(`OUT OF DATE: ${changed.length} file(s) to write, ${stale.length} stale page(s). Rerun without --check.`);
    for (const f of [...changed, ...stale].slice(0, 20)) console.log('  ' + f);
    process.exit(1);
  }
  console.log('up to date');
} else {
  for (const f of changed) {
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.writeFileSync(path.join(root, f), files.get(f));
  }
  console.log(`wrote ${changed.length} file(s)`);
  if (stale.length) console.log(`stale (no longer generated, not deleted): ${stale.join(', ')}`);
}
