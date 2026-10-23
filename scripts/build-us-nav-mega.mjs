// Builds _data/us/nav_mega.yml: the link lists behind the USA top menu's mega panels
// (_includes/in-header-hubs.html with edition "us", items from _data/nav_us.yml `topnav`).
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-us-nav-mega.mjs [--check]
//
// A topnav node with `mega: <key>` takes its columns from this file; the Career Clusters menu (`clusters: true`)
// draws one rail node per live cluster of _data/us/clusters.yml and takes key cluster-<slug>. Sources:
//   _data/us/clusters.yml        cluster-<slug>: one column per sub-cluster, holding that cluster's career pages
//                                (pathway → pathways.yml title, trade → cte_careers.yml short, career →
//                                careers/<cluster>.yml short); desc = the entry education its own data gives
//   _data/us/state_index.yml     states: the 51 state pages, one column per U.S. Census Bureau region
//   _data/us/exams.yml           exams: one column per stage, every exam page in it
//   _data/us/licenses.yml        licenses: every license page, split into health and other professions
//   _data/us/cte_careers.yml     trades: every trade page
// Only links to pages that exist are written. --check exits 1 (and writes nothing) when the file on disk is
// out of date; scripts/check-us-data.mjs runs it. Rerun after adding a career, exam, license or trade.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const CHECK = process.argv.includes('--check');
const OUT = path.join(root, '_data', 'us', 'nav_mega.yml');

const load = (f) => yaml.load(fs.readFileSync(path.join(root, '_data', 'us', f), 'utf8'));
// A folder URL ("us/x/") is a page when its index.html exists.
const exists = (href) => {
  const p = href.split(/[?#]/)[0];
  return fs.existsSync(path.join(root, p.endsWith('/') ? p + 'index.html' : p));
};
const problems = [];
const link = (label, href, desc, where) => {
  if (!exists(href)) { problems.push(`${where}: missing page ${href}`); return null; }
  const l = { label, href };
  if (desc) l.desc = desc;
  return l;
};

const clusters = load('clusters.yml').clusters;
const pathways = load('pathways.yml').list;
const occupations = load('occupations.yml');
const cte = load('cte_careers.yml').list;
const trades = load('home.yml').trades;
const mega = {};

// ---- career clusters: one column per sub-cluster (Advance CTE order), careers in clusters.yml order
for (const C of clusters) {
  if (!C.live) continue;
  const careers = (C.careers || []).length ? load(`careers/${C.slug}.yml`) : null;
  const bySub = new Map();
  for (const E of C.careers || []) {
    let l = null;
    if (E.pathway) {
      const P = pathways.find((p) => p.slug === E.pathway);
      if (!P) { problems.push(`clusters.yml ${C.slug}: unknown pathway ${E.pathway}`); continue; }
      l = link(P.title, `us/careers/${P.slug}/`, occupations[P.lead]?.education, C.slug);
    } else if (E.trade) {
      const T = cte.find((t) => t.slug === E.trade);
      if (!T) { problems.push(`clusters.yml ${C.slug}: unknown trade ${E.trade}`); continue; }
      l = link(T.short, `us/cte/${T.slug}.html`, trades.find((h) => h.roadmap === E.trade)?.entry, C.slug);
    } else if (E.career) {
      const X = careers?.list.find((x) => x.slug === E.career);
      if (!X) { problems.push(`clusters.yml ${C.slug}: unknown career ${E.career}`); continue; }
      l = link(X.short, `us/careers/${X.slug}/`, X.metrics?.entry, C.slug);
    }
    if (!l) continue;
    if (!bySub.has(E.sub)) bySub.set(E.sub, []);
    bySub.get(E.sub).push(l);
  }
  const cols = C.sub_clusters.map((s) => ({ label: s.name, links: bySub.get(s.xw || s.name) || bySub.get(s.name) || [] }))
    .filter((c) => c.links.length);
  // A career whose sub name matches no sub-cluster still gets listed, under its own sub name.
  const named = new Set(cols.map((c) => c.label));
  for (const [sub, links] of bySub) if (!named.has(sub) && !C.sub_clusters.some((s) => s.xw === sub)) cols.push({ label: sub, links });
  mega[`cluster-${C.slug}`] = {
    head: { label: `${C.name} hub`, href: `us/clusters/${C.slug}/` },
    note: `${cols.reduce((n, c) => n + c.links.length, 0)} career pages`,
    cols,
  };
}

// ---- states: the four Census Bureau regions (DC is in the South region)
const REGIONS = [
  ['Northeast', ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA']],
  ['Midwest', ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD']],
  ['South', ['DE', 'DC', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX']],
  ['West', ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA']],
];
const states = load('state_index.yml').list;
const placed = new Set(REGIONS.flatMap(([, a]) => a));
for (const S of states) if (!placed.has(S.abbr)) problems.push(`state_index.yml: ${S.abbr} is in no Census region`);
mega.states = {
  head: { label: 'All 50 states and DC', href: 'us/states/' },
  note: 'U.S. Census Bureau regions',
  cols: REGIONS.map(([label, abbrs]) => ({
    label,
    links: states.filter((s) => abbrs.includes(s.abbr)).sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => link(s.name, `us/states/${s.slug}/`, s.abbr, 'states')).filter(Boolean),
  })),
};

// ---- exams: one column per stage that has exam pages
const EX = load('exams.yml');
mega.exams = {
  head: { label: 'All exams by stage', href: 'us/exams/' },
  cols: EX.stages.map((st) => ({
    label: st.title.split(':')[0],
    // desc = who runs the exam (its short name already heads the cell)
    links: st.exams.map((id) => link(EX.exams[id].short || EX.exams[id].name, `us/exams/${id}/`, EX.exams[id].by, 'exams')).filter(Boolean),
  })).filter((c) => c.links.length),
};

// ---- license pages: health licenses first, then every other profession
const LIC = load('licenses.yml');
const HEALTH = new Set(['medicine', 'nursing', 'practical-nursing', 'pharmacy', 'dentistry', 'physical-therapy', 'psychology', 'counseling', 'social-work', 'emt', 'veterinary']);
const licLinks = (pick) => Object.entries(LIC).filter(([id, L]) => L && typeof L === 'object' && L.short && pick(id) && exists(`us/professional-licenses/${id}/`))
  .map(([id, L]) => link(L.short, `us/professional-licenses/${id}/`, L.name, 'licenses'));
mega.licenses = {
  head: { label: 'All licensed professions', href: 'us/professional-licenses/' },
  cols: [
    { label: 'Health & care', links: licLinks((id) => HEALTH.has(id)) },
    { label: 'Law, business, building & more', links: licLinks((id) => !HEALTH.has(id)) },
  ],
};

// ---- trades
mega.trades = {
  head: { label: 'Trades & CTE hub', href: 'us/cte/' },
  cols: [{ label: 'Skilled trades', links: cte.map((T) => link(T.short, `us/cte/${T.slug}.html`, trades.find((h) => h.roadmap === T.slug)?.entry, 'trades')).filter(Boolean) }],
};

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
const text = '# GENERATED by scripts/build-us-nav-mega.mjs — do not edit by hand; edit the USA data and rerun.\n'
  + '# Columns behind the USA top menu mega panels (nav_us.yml topnav nodes with `mega: <key>`, and the Career\n'
  + '# Clusters menu, which takes cluster-<slug> for each live cluster).\n'
  + yaml.dump(mega, { lineWidth: -1, noRefs: true });
const old = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r/g, '') : '';
if (CHECK) {
  if (old !== text) { console.error('_data/us/nav_mega.yml is out of date: run scripts/build-us-nav-mega.mjs'); process.exit(1); }
  console.log('_data/us/nav_mega.yml is up to date');
} else {
  fs.writeFileSync(OUT, text);
  const n = Object.values(mega).reduce((s, m) => s + m.cols.reduce((t, c) => t + c.links.length, 0), 0);
  console.log(`wrote _data/us/nav_mega.yml: ${Object.keys(mega).length} panels, ${n} links`);
}
