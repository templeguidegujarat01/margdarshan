// Builds _data/nav_mega.yml: the link lists behind the India top menu's side flyouts.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-nav-mega.mjs [--check]
//
// A topnav node in _data/nav.yml with `mega: <key>` takes its columns from this file instead of
// hand-written `cols`, so the menu always lists every guide the hub page lists — add a career to a
// hub page and rerun this, and it shows up in the menu. Sources:
//   stream / career hub pages   each <h3 class="career-group-heading"> becomes a column, holding the
//                               career links (<a href="x.html"><strong>Label</strong>…) under it
//   _data/in/sports_atlas.yml   Olympic / Asian Games / Khelo India / job-quota nodes: sports with a deep
//                               page, filtered by their `at` codes, one column per sport family
//   _data/in/states/*.yml       one column per state exam cockpit (cockpit + every exam page)
//   state-pathways/, study-abroad/, niche-careers/ folders   regional and global guides
// Only links to pages that exist are written. --check exits 1 (and writes nothing) when the file on
// disk is out of date; scripts/check-in-data.mjs runs it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const CHECK = process.argv.includes('--check');
const OUT = path.join(root, '_data', 'nav_mega.yml');

const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const exists = (href) => fs.existsSync(path.join(root, href.split(/[?#]/)[0]));
const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();
const problems = [];

// ---- hub pages: career-group-heading columns
function hubCols(file) {
  const html = read(file);
  const parts = html.split(/<h3 class="career-group-heading"[^>]*>/).slice(1);
  if (!parts.length) problems.push(`${file}: no career-group-heading groups`);
  return parts.map((p) => {
    const label = decode(p.slice(0, p.indexOf('</h3>')));
    // The group ends where the next section or block starts.
    const body = p.split(/<\/section>|<h2[\s>]/)[0];
    const links = [];
    const seen = new Set();
    for (const m of body.matchAll(/<a href="([^"#?]+\.html)"[^>]*>\s*<strong>([\s\S]*?)<\/strong>(?:\s*<span>([\s\S]*?)<\/span>)?/g)) {
      const href = m[1];
      if (seen.has(href)) continue;
      if (!exists(href)) { problems.push(`${file}: "${label}" links missing page ${href}`); continue; }
      seen.add(href);
      const l = { label: decode(m[2]), href };
      if (m[3]) l.desc = decode(m[3]);
      links.push(l);
    }
    return { label, links };
  }).filter((c) => c.links.length);
}

const mega = {};
const hubs = {
  science: ['science.html', 'Science stream guide'],
  commerce: ['commerce.html', 'Commerce stream guide'],
  arts: ['arts.html', 'Arts stream guide'],
  diploma: ['diploma.html', 'Diploma guide'],
  iti: ['iti.html', 'ITI trade directory'],
  'high-paying': ['high-paying-careers.html', 'High-paying careers ranked'],
  'fast-track': ['fast-track-jobs.html', 'All fast-track jobs'],
  professional: ['professional-courses.html', 'All professional courses'],
  specialised: ['specialised-careers.html', 'All specialised careers'],
  'govt-careers': ['govt-exams.html', 'Government exams & jobs hub'],
};
for (const [key, [file, head]] of Object.entries(hubs)) mega[key] = { head: { label: head, href: file }, cols: hubCols(file) };

// ---- sports: atlas rows with a deep page, one column per family
const atlas = yaml.load(read('_data/in/sports_atlas.yml'));
const nav = yaml.load(read('_data/nav.yml'));
// Short menu labels already chosen for each sport page (the old domain flyout in nav.yml / sports.yml names).
const sportsData = yaml.load(read('_data/in/sports.yml'));
const shortName = {
  basketball: 'Basketball & 3x3', volleyball: 'Volleyball & beach', rugby: 'Rugby Sevens', 'baseball-softball': 'Baseball & Softball',
  'indian-traditional-sports': 'Indian traditional sports', 'table-tennis': 'Table Tennis', 'canoe-kayak': 'Canoe & Kayak',
  'sport-climbing': 'Sport Climbing', 'modern-pentathlon': 'Modern Pentathlon', 'water-polo': 'Water Polo',
  'artistic-swimming': 'Artistic Swimming', 'flag-football': 'Flag Football', 'kho-kho': 'Kho-Kho',
};
const sportSlugs = new Set(sportsData.sports.map((s) => s.slug));
function sportLabel(row) {
  return shortName[row.slug] || decode(row.name).replace(/\s*\(.*\)$/, '');
}
function sportCols(filter) {
  return atlas.families.map((f) => {
    const seen = new Set();
    const links = [];
    for (const row of f.sports) {
      if (!row.slug || seen.has(row.slug) || !filter(row)) continue;
      if (!sportSlugs.has(row.slug) || !exists(`${row.slug}.html`)) { problems.push(`sports_atlas: ${row.slug} has no page`); continue; }
      seen.add(row.slug);
      links.push({ label: sportLabel(row), href: `${row.slug}.html` });
    }
    return { label: decode(f.label), links };
  }).filter((c) => c.links.length);
}
const has = (code) => (row) => (row.at || []).includes(code);
mega['sport-olympic'] = { head: { label: 'Every sport A–Z with its events', href: 'all-sports.html' }, note: 'Sports on the Los Angeles 2028 Olympic programme', cols: sportCols(has('O')) };
mega['sport-asian'] = { head: { label: 'Every sport A–Z with its events', href: 'all-sports.html' }, note: 'Sports on the Asian Games (Aichi-Nagoya 2026) programme', cols: sportCols(has('AG')) };
mega['sport-khelo'] = { head: { label: 'Every sport A–Z with its events', href: 'all-sports.html' }, note: 'Sports played at the Khelo India Youth Games', cols: sportCols(has('KI')) };
mega['sport-quota'] = { head: { label: 'Sports-quota jobs guide', href: 'niche-careers/sports.html' }, note: 'Sports on the DoPT list for central government sports-quota jobs', cols: sportCols(has('Q')) };
mega['sport-all'] = { head: { label: 'Sports & Performing Arts Cockpit', href: 'sports-hub.html' }, note: 'Every sport guide, by family — each covers its world federation, world championships and India pathway', cols: sportCols(() => true) };
// Paralympic: no separate para guide yet, so this lists the guides of sports that also have a Paralympic
// version at LA28 (the para family rows in the atlas), and says so.
const paraOf = {
  'Para athletics': 'athletics', 'Para swimming': 'swimming', 'Para badminton': 'badminton', 'Para table tennis': 'table-tennis',
  'Para archery': 'archery', 'Shooting para sport': 'shooting', 'Para cycling': 'cycling', 'Para judo': 'judo',
  'Para taekwondo': 'taekwondo', 'Para canoe': 'canoe-kayak', 'Para rowing': 'rowing', 'Para triathlon': 'triathlon',
  'Para equestrian': 'equestrian', 'Para climbing': 'sport-climbing', 'Wheelchair basketball': 'basketball',
  'Wheelchair rugby': 'rugby', 'Wheelchair tennis': 'tennis', 'Wheelchair fencing': 'fencing', 'Blind football': 'football',
  'Sitting volleyball': 'volleyball',
};
const paraFamily = atlas.families.find((f) => f.id === 'para');
const paraText = paraFamily.sports.filter(has('P')).map((r) => decode(r.name)).join(' · ');
const paraLinks = [];
for (const [name, slug] of Object.entries(paraOf)) {
  const hit = paraText.toLowerCase().includes(name.toLowerCase().replace(/^(para|wheelchair) /, '')) && exists(`${slug}.html`);
  if (!hit) { problems.push(`paralympic map: ${name} → ${slug} not in atlas para rows or page missing`); continue; }
  paraLinks.push({ label: name, href: `${slug}.html` });
}
mega['sport-para'] = {
  head: { label: 'All 23 Paralympic sports & classes', href: 'all-sports.html#para' },
  note: 'Each link opens the guide for the main sport; its Paralympic version is on the LA28 programme',
  cols: [
    { label: 'Track, pool & racket', links: paraLinks.filter((l) => /athletics|swimming|badminton|table|tennis/i.test(l.label)) },
    { label: 'Target, combat & wheels', links: paraLinks.filter((l) => /archery|shooting|judo|taekwondo|fencing|cycling|rugby/i.test(l.label)) },
    { label: 'Water, horse & team', links: paraLinks.filter((l) => /canoe|rowing|triathlon|equestrian|climbing|basketball|football|volleyball/i.test(l.label)) },
  ].filter((c) => c.links.length),
};
const artsDomain = sportsData.domains.find((d) => d.id === 'arts');
mega['sport-arts'] = {
  head: { label: 'Performing arts in the cockpit', href: 'sports-hub.html#arts' },
  cols: [{ label: 'Classical dance & music', links: artsDomain.sports.filter((s) => exists(`${s}.html`)).map((s) => ({ label: decode(sportsData.sports.find((x) => x.slug === s).title.split(' — ')[0]), href: `${s}.html` })) }],
};

// ---- regional: state cockpits + state admission guides
const stateCols = [];
for (const f of fs.readdirSync(path.join(root, '_data/in/states')).filter((f) => f.endsWith('.yml')).sort()) {
  const s = yaml.load(read(`_data/in/states/${f}`));
  const id = s.state.id;
  const links = [{ label: `${decode(s.state.name)} cockpit`, href: `state/${id}/index.html` }];
  for (const e of s.exams) {
    const href = `state/${id}/${e.slug}.html`;
    if (!exists(href)) { problems.push(`${f}: exam page ${href} missing`); continue; }
    links.push({ label: decode(e.short || e.slug), href });
  }
  stateCols.push({ label: decode(s.state.name), links });
}
mega.states = { head: { label: 'All state pathways', href: 'state-pathways.html' }, cols: stateCols };
const titleName = (file, re) => { const m = read(file).match(/^title:\s*"([^"]+)"/m); return m ? decode(m[1]).replace(re, '').trim() : path.basename(file, '.html'); };
mega['state-admissions'] = {
  head: { label: 'All state pathways', href: 'state-pathways.html' },
  cols: [{ label: 'Entrance exams, quotas & scholarships', links: fs.readdirSync(path.join(root, 'state-pathways')).filter((f) => f.endsWith('.html')).sort()
    .map((f) => ({ label: titleName(`state-pathways/${f}`, /\s*Entrance Exams.*$/), href: `state-pathways/${f}` })) }],
};

// ---- global: study abroad + niche sectors + other editions
// Study abroad engine (2026-10-29): countries, visa guides, exams and India-side guides from _data/in/abroad*.
const AC = yaml.load(read('_data/in/abroad_common.yml'));
const abroadC = fs.readdirSync(path.join(root, '_data/in/abroad')).filter((f) => f.endsWith('.yml')).sort()
  .map((f) => yaml.load(read(`_data/in/abroad/${f}`)));
mega.abroad = {
  head: { label: 'Study abroad: all 15 countries', href: 'study-abroad/' },
  cols: [
    { label: 'Country guides', links: abroadC.map((c) => ({ label: c.name, href: `study-abroad/${c.id}.html`, desc: c.card.psw })) },
    { label: 'Student visas', links: abroadC.map((c) => ({ label: c.visa.name, href: `study-abroad/visas/${c.visa.slug}.html`, desc: c.name })) },
    { label: 'Exams', links: Object.entries(AC.exams).map(([k, e]) => ({ label: e.short, href: `study-abroad/exams/${k}.html`, desc: e.by })) },
    { label: 'India side', links: Object.entries(AC.guides).map(([k, g]) => ({ label: g.short, href: `study-abroad/${k}.html`, desc: g.eyebrow })) },
  ],
};
const niche = JSON.parse(read('_data/niche_pages.json'));
mega.niche = {
  head: { label: 'Niche careers hub', href: 'niche-careers.html' },
  cols: [{ label: 'Sector guides', links: Object.entries(niche.sectors).filter(([k]) => exists(`niche-careers/${k}.html`)).map(([k, v]) => ({ label: v.eyebrow, href: `niche-careers/${k}.html` })) }],
};

// Every mega key named in nav.yml must exist here, and every column must have links.
for (const it of nav.topnav) for (const n of it.nodes || []) if (n.mega && !mega[n.mega]) problems.push(`nav.yml node "${n.label}" names unknown mega key ${n.mega}`);
for (const [k, v] of Object.entries(mega)) if (!v.cols.length) problems.push(`${k}: no links`);

const out = '# GENERATED by scripts/build-nav-mega.mjs — do not edit by hand; edit the hub pages / data and rerun.\n'
  + '# Columns behind the India top menu flyouts (nav.yml topnav nodes with `mega: <key>`).\n'
  + yaml.dump(mega, { lineWidth: 200, noRefs: true });
if (problems.length) { console.error(problems.map((p) => '  ' + p).join('\n')); console.error(`build-nav-mega: ${problems.length} problem(s)`); process.exit(1); }
const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
const count = Object.values(mega).reduce((n, v) => n + v.cols.reduce((m, c) => m + c.links.length, 0), 0);
if (CHECK) {
  if (cur !== out) { console.error('build-nav-mega: _data/nav_mega.yml is out of date — run node scripts/build-nav-mega.mjs'); process.exit(1); }
  console.log(`build-nav-mega: up to date (${Object.keys(mega).length} flyouts, ${count} links)`);
} else {
  fs.writeFileSync(OUT, out);
  console.log(`build-nav-mega: wrote ${Object.keys(mega).length} flyouts, ${count} links`);
}
