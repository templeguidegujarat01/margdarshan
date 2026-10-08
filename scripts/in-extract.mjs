// Phase B migration tool: turns a hand-written India career page into a data sheet for the shared
// template, so the page itself shrinks to its front matter + one include line.
//
//   node scripts/in-extract.mjs <slug>                 -> writes _data/in/careers/<slug>.yml (preview)
//   node scripts/in-extract.mjs <slug> --write-page    -> also rewrites <slug>.html to the short form
//   add --force to overwrite an existing data sheet (it would lose hand-added journey/sources!)
//
// Every component on the page must be recognised; anything unknown stops the run with an error
// instead of being dropped, so no text can silently disappear. After extracting, check the result:
//   render the site before/after and compare (see docs/global-platform/ARCH-PHASE-B.md).
// The journey table, specialisations and source list are editorial: add them by hand afterwards.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { children, has, clean, text } from './lib/html-tree.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));  // --out=<dir>: write the sheet elsewhere (dry runs)
const force = args.includes('--force'), writePage = args.includes('--write-page');
if (!slug) { console.error('usage: node scripts/in-extract.mjs <slug> [--write-page] [--force]'); process.exit(2); }
const pagePath = path.join(root, slug + '.html');
const outArg = args.find((a) => a.startsWith('--out='));
const dataPath = outArg ? path.resolve(outArg.slice(6), slug + '.yml') : path.join(root, '_data', 'in', 'careers', slug + '.yml');
const raw = fs.readFileSync(pagePath, 'utf8');
if (/include in-career\.html/.test(raw)) { console.error(slug + '.html already uses the data template'); process.exit(1); }
if (fs.existsSync(dataPath) && !force) { console.error(dataPath + ' exists (use --force to overwrite it)'); process.exit(1); }

const fail = (msg, e) => { throw new Error(slug + ': ' + msg + (e ? '\n  ' + e.outer.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').replace(/\s+/g, ' ').slice(0, 300) : '')); };
const fmM = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
if (!fmM) fail('no front matter');
const body = raw.slice(fmM[0].length);

// ---- JSON-LD: keep the WebPage name/description (Breadcrumb and FAQ are rebuilt from data) ----
const ld = {};
for (const m of body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  const j = JSON.parse(m[1].replace(/\{\{[^}]*\}\}/g, ''));
  if (j['@type'] === 'WebPage') { ld.name = j.name; ld.description = j.description; }
  else if (j['@type'] === 'BreadcrumbList') {
    // keep the last crumb's schema name when it is longer than the visible breadcrumb (front matter `current`)
    const last = j.itemListElement[j.itemListElement.length - 1].name;
    const cur = (fmM[0].match(/^\s+current:\s*"?(.*?)"?\s*$/m) || [])[1];
    if (last !== cur) ld.crumb = last;
  } else if (!['BreadcrumbList', 'FAQPage'].includes(j['@type'])) fail('unexpected JSON-LD type ' + j['@type']);
}

const main = children(body).find((e) => e.tag === 'main');
if (!main) fail('no <main>');
const D = { slug };
const top = children(main.inner);

// ---- hero ----
const hero = top.find((e) => has(e, 'page-hero'));
const heroIn = children(children(hero.inner).find((e) => has(e, 'page-hero-inner')).inner);
const H = {};
let heroInner = children(hero.inner).find((e) => has(e, 'page-hero-inner')).inner;
for (const e of heroIn) {
  if (has(e, 'eyebrow')) H.eyebrow = clean(e.inner);
  else if (e.tag === 'h1') H.title = clean(e.inner);
  else if (has(e, 'meta-row')) {
    H.meta = [];
    for (const s of children(e.inner)) {
      const t = clean(s.inner);
      if (t === '·') continue;
      if (/<svg/.test(s.inner)) H.read_time = t; else H.meta.push(t);
    }
  } else if (e.tag === 'p') (H.intro ??= []).push(clean(e.inner));
  else if (has(e, 'page-hero-ctas')) {
    for (const a of children(e.inner)) {
      if (has(a, 'btn-journey')) { D.roadmap = a.attrs.href; continue; }
      if (a.tag !== 'a' || !has(a, 'btn')) fail('unknown hero button', a);
      const l = { href: a.attrs.href, label: clean(a.inner) };
      if (a.attrs.class !== 'btn btn-ghost btn-page-link') l.class = a.attrs.class;
      (H.links ??= []).push(l);
    }
  } else if (has(e, 'quickfacts')) {
    H.quickfacts = children(e.inner).map((q) => { const [l, v] = children(q.inner); return { label: clean(l.inner), value: clean(v.inner) }; });
  } else fail('unknown hero element', e);
}
const hub = heroInner.match(/\{%-?\s*include hub-ctas\.html([\s\S]*?)-?%\}/);
if (hub) {
  H.hub = {};
  const rest = hub[1].replace(/([\w-]+)="([^"]*)"/g, (x, k, v) => { H.hub[k] = v; return ''; });
  if (rest.trim()) fail('hub-ctas params not understood: ' + rest.trim());
}
D.hero = H;
if (Object.keys(ld).length) D.ld = ld;

// ---- "On this page" bar ----
const qn = top.find((e) => has(e, 'quicknav-bar'));
if (qn) D.nav = [...qn.inner.matchAll(/<a href="([^"]+)">([^<]*)<\/a>/g)].map((m) => ({ href: m[1], label: m[2] }));

// ---- sections ----
const ICONS = {
  stream: { 'M9 3h6': 'science', 'x="3" y="7"': 'commerce', 'circle cx="12" cy="12" r="9"/><circle cx="9"': 'arts' },
  elig: { 'M12 3l9 4.5': 'cap', 'x="3" y="4"': 'calendar' },
};
const iconOf = (kind, h) => { for (const [k, v] of Object.entries(ICONS[kind])) if (h.includes(k)) return v; fail('unknown ' + kind + ' icon: ' + h.slice(0, 200)); };
const eligItems = (h) => children(h).map((li) => {
  const m = li.inner.match(/^\s*<span class="elig-tick" aria-hidden="true">✓<\/span><span class="elig-body">([\s\S]*)<\/span>\s*$/);
  if (!m) fail('unknown eligibility item', li);
  return clean(m[1]);
});
const lis = (h) => children(h).filter((x) => x.tag === 'li').map((x) => clean(x.inner));
// default class of each part kind in the template; a different class list is kept as `class:`
const DEF = {
  note: 'table-note', streams: 'card-grid cols-3 reveal', overview: 'overview-body reveal', fit: 'fit-check-container',
  prose: 'prose reveal', elig_list: 'prose reveal', elig_cards: 'eligibility-grid', table: 'table-wrap', steps: 'journey-list step-path-flow reveal',
  roadmap_card: 'rm-link-card reveal', chips: 'chip-grid reveal', salary: 'salary-cards reveal', proscons: 'proscons', myths: 'myth-grid reveal',
  myth_items: 'myth-grid reveal', compare: 'compare-cta reveal', related: 'related-grid related-grid-4 reveal', faq: 'faq-list reveal', exam_cards: 'exam-card-grid reveal',
  note_box: 'note reveal', warn_box: 'warn reveal', source_link: 'source-link', cx_link: 'cx-link', subhead: 'block-subhead',
};
const part = (kind, value, e) => {
  const p = { [kind]: value };
  const c = e.attrs.class || '';
  if (DEF[kind] === undefined) fail('no default class for part kind ' + kind);
  if (c !== DEF[kind]) p.class = c;
  return p;
};
function parsePart(e) {
  const c = e.cls;
  if (has(e, 'block-subhead')) return part('subhead', clean(e.inner), e);
  if (e.tag === 'p' && has(e, 'table-note')) return part('note', clean(e.inner), e);
  if (has(e, 'card-grid')) {
    return part('streams', children(e.inner).map((card) => {
      if (!has(card, 'info-card')) fail('unknown card in card-grid', card);
      const badge = card.inner.match(/<span class="stat-badge is-tag fit-([a-z]+)">([^<]*)<\/span>/);
      const h4 = card.inner.match(/<h4>([\s\S]*?)<\/h4>/);
      if (!badge || !h4) fail('stream card not understood', card);
      return { label: clean(h4[1]), fit: badge[2], tone: badge[1], icon: iconOf('stream', card.inner) };
    }), e);
  }
  if (has(e, 'overview-body')) {
    const o = {};
    for (const k of children(e.inner)) {
      if (k.tag === 'ul') o.points = lis(k.inner);
      else if (k.tag === 'details') { const ul = children(k.inner).find((x) => x.tag === 'ul'); o.more = lis(ul.inner); }
      else fail('unknown overview child', k);
    }
    return part('overview', o, e);
  }
  if (has(e, 'fit-check-container')) {
    const grid = children(e.inner)[0]; const o = {};
    for (const a of children(grid.inner)) {
      const ul = children(a.inner).find((x) => x.tag === 'ul');
      o[has(a, 'fit-card--match') ? 'match' : 'mismatch'] = lis(ul.inner);
    }
    return part('fit', o, e);
  }
  if (has(e, 'prose')) {
    const kids = children(e.inner);
    if (kids.length === 1 && has(kids[0], 'eligibility-list')) {
      return part('elig_list', eligItems(kids[0].inner), e);
    }
    return part('prose', kids.map((k) => {
      if (k.tag === 'p') return clean(k.inner);
      if (k.tag === 'ul' && !k.cls.length) {
        // items may start with a tick icon (then `ticks: true`); all or none
        const items = children(k.inner).filter((x) => x.tag === 'li');
        const ticked = items.filter((x) => /^\s*<svg[^>]*><path d="M20 6L9 17l-5-5"\/><\/svg>/.test(x.inner)).length;
        if (ticked && ticked !== items.length) fail('list mixes ticked and plain items', k);
        return ticked ? { list: lis(k.inner), ticks: true } : { list: lis(k.inner) };
      }
      if (k.tag === 'ul' && k.attrs.class === 'eligibility-list') return { elig: eligItems(k.inner) };
      fail('unknown prose child', k);
    }), e);
  }
  if (has(e, 'eligibility-grid')) {
    return part('elig_cards', children(e.inner).map((a) => {
      if (!has(a, 'elig-card') || a.attrs.class !== 'elig-card reveal') fail('unknown eligibility card', a);
      const ul = children(a.inner).find((x) => x.tag === 'ul');
      return { icon: iconOf('elig', a.inner), title: clean(a.inner.match(/<h3>([\s\S]*?)<\/h3>/)[1]), points: lis(ul.inner) };
    }), e);
  }
  if (has(e, 'table-wrap')) {
    const t = children(e.inner);
    if (t.length !== 1 || t[0].tag !== 'table' || t[0].attrs.class !== 'table-simple') fail('unknown table shape', e);
    const parts = children(t[0].inner);
    const head = parts.find((x) => x.tag === 'thead'), tb = parts.find((x) => x.tag === 'tbody');
    if (parts.length !== 2 || !head || !tb) fail('table needs exactly thead + tbody', e);
    // a cell is a string, or { text, rowspan, colspan } when it spans rows/columns
    const row = (tr) => children(tr.inner).map((td) => {
      const extra = Object.keys(td.attrs).filter((k) => k !== 'rowspan' && k !== 'colspan');
      if (extra.length) fail('table cell attribute not supported: ' + extra.join(','), td);
      if (!td.attrs.rowspan && !td.attrs.colspan) return clean(td.inner);
      const c = { text: clean(td.inner) };
      if (td.attrs.rowspan) c.rowspan = +td.attrs.rowspan;
      if (td.attrs.colspan) c.colspan = +td.attrs.colspan;
      return c;
    });
    const hr = children(head.inner); if (hr.length !== 1) fail('one header row expected', e);
    const rows = children(tb.inner).map((tr) => { const cells = children(tr.inner); if (cells.some((c) => c.tag !== 'td')) fail('only td cells supported in body', tr); return row(tr); });
    return part('table', { head: row(hr[0]), rows }, e);
  }
  if (has(e, 'journey-list')) {
    return part('steps', children(e.inner).map((li) => ({ title: clean(li.inner.match(/<h3>([\s\S]*?)<\/h3>/)[1]), text: clean(li.inner.match(/<p>([\s\S]*?)<\/p>/)[1]) })), e);
  }
  if (has(e, 'rm-link-card')) {
    const exp = `<div><strong>Want the exact step-by-step journey?</strong><p>Eligibility, exams and cycles, training and final qualification for `;
    if (!clean(e.inner).startsWith(exp)) fail('unknown roadmap card text', e);
    const name = clean(e.inner).slice(exp.length).split(', in order')[0];
    return part('roadmap_card', name, e);
  }
  if (has(e, 'chip-grid')) {
    return part('chips', children(e.inner).map((it) => {
      const m = it.inner.match(/^\s*<strong>([\s\S]*?)<\/strong>([\s\S]*)$/);
      if (!has(it, 'item') || !m) fail('unknown chip', it);
      return { label: clean(m[1]), text: clean(m[2]) };
    }), e);
  }
  if (has(e, 'salary-cards')) {
    return part('salary', children(e.inner).map((s) => {
      const [l, v, p] = children(s.inner);
      if (!p || l.tag !== 'span' || v.tag !== 'strong' || p.tag !== 'p') fail('unknown salary card', s);
      return { label: clean(l.inner), value: clean(v.inner), text: clean(p.inner) };
    }), e);
  }
  if (has(e, 'proscons')) {
    const o = {};
    for (const c2 of children(e.inner)) o[has(c2, 'pros') ? 'pros' : 'cons'] = lis(children(c2.inner).find((x) => x.tag === 'ul').inner);
    return part('proscons', o, e);
  }
  if (has(e, 'myth-grid') && has(children(e.inner)[0], 'myth-item')) {
    // older "Mistake / Better approach" variant: two paragraphs per item
    return part('myth_items', children(e.inner).map((d) => {
      const [m, f] = children(d.inner);
      if (!has(d, 'myth-item') || !has(m, 'myth') || !has(f, 'fact')) fail('unknown myth item', d);
      return { myth: clean(m.inner), fact: clean(f.inner) };
    }), e);
  }
  if (has(e, 'myth-grid')) {
    return part('myths', children(e.inner).map((d) => ({
      myth: clean(d.inner.match(/<span class="myth-title">([\s\S]*?)<\/span>/)[1]),
      fact: clean(d.inner.match(/<span class="fact-badge">FACT<\/span>\s*<p>([\s\S]*?)<\/p>/)[1]),
    })), e);
  }
  if (has(e, 'compare-cta')) {
    const a = e.inner.match(/<a class="btn btn-primary btn-page-link" href="([^"]+)">([\s\S]*?)<\/a>/);
    return part('compare', { title: clean(e.inner.match(/<h3>([\s\S]*?)<\/h3>/)[1]), text: clean(e.inner.match(/<p>([\s\S]*?)<\/p>/)[1]), href: a[1], label: clean(a[2]) }, e);
  }
  if (has(e, 'related-grid')) {
    return part('related', children(e.inner).map((r) => {
      const m = r.inner.match(/^\s*<strong>([\s\S]*?)<\/strong><span>([\s\S]*?)<\/span><a class="btn btn-ghost btn-page-link" href="([^"]+)" aria-label="([^"]*)">View guide<\/a>\s*$/);
      if (!m) fail('unknown related card', r);
      const o = { name: clean(m[1]), sub: clean(m[2]), href: m[3] };
      if (m[4] !== 'Read the ' + m[1] + ' guide') o.aria = m[4];
      return o;
    }), e);
  }
  if (has(e, 'faq-list')) {
    return part('faq', children(e.inner).map((it) => {
      const q = children(it.inner).find((x) => has(x, 'faq-q')), a = children(it.inner).find((x) => has(x, 'faq-a'));
      return { q: clean(q.inner), a: clean(a.inner) };
    }), e);
  }
  if (has(e, 'exam-card-grid')) {
    return part('exam_cards', children(e.inner).map((card) => {
      const o = {};
      for (const k of children(card.inner)) {
        if (k.tag === 'h3') o.title = clean(k.inner);
        else if (k.tag === 'p') o.text = clean(k.inner);
        else if (has(k, 'exam-card-actions')) o.actions = children(k.inner).map((a) => ({ kind: has(a, 'btn-exam-primary') ? 'primary' : 'secondary', href: a.attrs.href, label: clean(a.inner) }));
        else fail('unknown exam card child', k);
      }
      return o;
    }), e);
  }
  if (has(e, 'note') || has(e, 'warn')) {
    const span = children(e.inner).find((x) => x.tag === 'span');
    return part(has(e, 'note') ? 'note_box' : 'warn_box', clean(span.inner), e);
  }
  if (e.tag === 'a' && has(e, 'source-link')) return part('source_link', { href: e.attrs.href, label: clean(e.inner) }, e);
  if (e.tag === 'a' && has(e, 'cx-link')) return part('cx_link', { href: e.attrs.href, label: clean(e.inner) }, e);
  fail('unknown component', e);
}

D.sections = [];
for (const sec of top) {
  if (has(sec, 'page-hero') || has(sec, 'quicknav-bar')) continue;
  if (sec.tag !== 'section') fail('unknown top-level element in <main>', sec);
  const S = {};
  if (sec.attrs.id) S.id = sec.attrs.id;
  S.hid = sec.attrs['aria-labelledby'];
  const blockCls = sec.attrs.class;
  if (blockCls === 'block block-alt') S.alt = true; else if (blockCls !== 'block') fail('unknown section class ' + blockCls, sec);
  const cont = children(sec.inner);
  if (cont.length !== 1 || cont[0].attrs.class !== 'container') fail('section must hold one .container', sec);
  const kids = children(cont[0].inner);
  const head = kids[0];
  if (!has(head, 'section-head')) fail('section without .section-head', sec);
  if (head.attrs.class !== 'section-head reveal') S.head_class = head.attrs.class;
  for (const k of children(head.inner)) {
    if (has(k, 'eyebrow')) S.eyebrow = clean(k.inner);
    else if (k.tag === 'h2') { S.heading = clean(k.inner); if (k.attrs.id !== S.hid) fail('h2 id differs from aria-labelledby', sec); }
    else if (k.tag === 'p') { if (S.intro) fail('two intro paragraphs', sec); S.intro = clean(k.inner); }
    else fail('unknown section-head child', k);
  }
  S.parts = kids.slice(1).map(parsePart);
  D.sections.push(S);
}

// ---- YAML out (strings JSON-quoted: valid YAML, exact characters) ----
const q = (s) => JSON.stringify(String(s));
function y(v, ind) {
  const pad = ' '.repeat(ind);
  if (Array.isArray(v)) return v.map((x) => {
    if (x && typeof x === 'object' && !Array.isArray(x)) {
      const lines = y(x, ind + 2).split('\n');
      return pad + '- ' + lines[0].trimStart() + (lines.length > 1 ? '\n' + lines.slice(1).join('\n') : '');
    }
    if (Array.isArray(x)) return pad + '-\n' + y(x, ind + 2);
    return pad + '- ' + scalar(x);
  }).join('\n');
  return Object.entries(v).map(([k, x]) => {
    if (x && typeof x === 'object') {
      if (Array.isArray(x) && !x.length) return pad + k + ': []';
      return pad + k + ':\n' + y(x, ind + 2);
    }
    return pad + k + ': ' + scalar(x);
  }).join('\n');
}
const scalar = (x) => (typeof x === 'boolean' || typeof x === 'number' ? String(x) : q(x));

const header = `# ${slug} — India career data sheet, read by _includes/in-career.html (page: ${slug}.html).
# First generated from the old hand-written page by scripts/in-extract.mjs; edit this file from now on.
# Text may contain simple HTML (<strong>, <a href="...">). Keep the indentation exactly as it is.
# Sections render in the order listed; each section is a list of "parts" (paragraphs, tables, cards ...).
# Editorial blocks to add by hand: journey (top table), sources (citation list), source: ids on facts.
`;
fs.mkdirSync(path.dirname(dataPath), { recursive: true });
fs.writeFileSync(dataPath, header + y(D, 0) + '\n');
console.log('wrote', path.relative(root, dataPath), '-', D.sections.length, 'sections,', D.sections.reduce((n, s) => n + s.parts.length, 0), 'parts');

if (writePage) {
  let fm = fmM[0];
  if (!/^career:/m.test(fm)) fm = fm.replace(/^(title:.*\r?\n)/m, `$1career: "${slug}"\n`);
  const stub = `{%- comment -%}
  This page is built from data. To change its text, edit _data/in/careers/${slug}.yml (not this file).
  The template is _includes/in-career.html. The roadmap button (btn-journey) and the roadmap
  link card (rm-link-card) also come from the template, so scripts/build-roadmaps.mjs finds both
  names here and leaves this file alone.
{%- endcomment -%}
{% include in-career.html career=page.career %}
`;
  fs.writeFileSync(pagePath, fm + stub);
  console.log('rewrote', slug + '.html');
}
