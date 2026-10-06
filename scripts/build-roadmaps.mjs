// Builds the deep roadmap pages from scripts/roadmap-src/*.mjs.
//   node scripts/build-roadmaps.mjs
// For every career in the sources it (1) writes _data/roadmaps/<slug>.json,
// (2) writes the roadmaps/<slug>.html page stub, and (3) idempotently adds the
// "See The Journey / Full Roadmap" button + link card to <slug>.html.
// Existing career-page content is never removed (the only replaced element is the
// old "See the Roadmap" hero anchor, which the new button supersedes).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'scripts', 'roadmap-src');
fs.mkdirSync(path.join(root, '_data', 'roadmaps'), { recursive: true });
fs.mkdirSync(path.join(root, 'roadmaps'), { recursive: true });

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';

function frontMatter(html) {
  const m = html.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = m ? m[1] : '';
  const get = (k) => (fm.match(new RegExp('^' + k + ':\\s*"?([^"\\r\\n]*)"?', 'm')) || [])[1] || '';
  const nested = (k) => (fm.match(new RegExp('^\\s+' + k + ':\\s*"?([^"\\r\\n]*)"?', 'm')) || [])[1] || '';
  return {
    stream: get('stream'),
    careers_href: nested('careers_href'),
    careers_label: nested('careers_label'),
    active_stream: nested('active_stream'),
    parent_href: nested('parent_href'),
    parent_label: nested('parent_label'),
  };
}

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.mjs') && !f.startsWith('_')).sort();
let count = 0;
const problems = [];
for (const f of files) {
  const list = (await import(pathToFileURL(path.join(srcDir, f)).href)).default;
  for (const c of list) {
    const pagePath = path.join(root, c.slug + '.html');
    if (!fs.existsSync(pagePath)) { problems.push('missing career page: ' + c.slug); continue; }
    if (/^(study-abroad|state-pathways|niche-careers)/.test(c.slug)) { problems.push('forbidden: ' + c.slug); continue; }
    for (const p of c.phases) if (!p.title || !p.summary || !p.points || p.points.length < 3) problems.push(c.slug + ': thin phase ' + p.title);
    if (/coming soon/i.test(JSON.stringify(c))) problems.push(c.slug + ': "coming soon" text');
    const page = fs.readFileSync(pagePath, 'utf8');
    const fm = frontMatter(page);
    const data = {
      name: c.name, title: c.title, intro: c.intro, glance: c.glance,
      phases: c.phases, sources: c.sources,
      back_href: c.slug + '.html', back_label: c.name,
    };
    fs.writeFileSync(path.join(root, '_data', 'roadmaps', c.slug + '.json'), JSON.stringify(data, null, 1) + '\n');

    const stub = `---
title: "${esc(c.title)} Roadmap — Step-by-Step Journey, Exams & Training | Margdarshan"
description: "${esc(c.name)} full roadmap for Indian students: ${esc(c.phases.map((p) => p.title).slice(0, 4).join(', '))} and more, with exams, eligibility and official links."
stream: "${fm.stream}"
header:
  careers_href: "${c.slug}.html"
  careers_label: "${esc(c.name)} guide"
  active_stream: "${fm.active_stream || fm.stream}"
breadcrumb:
  parent_href: "${c.slug}.html"
  parent_label: "${esc(c.name)}"
  current: "Full roadmap"
---
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "{{ site.url }}{{ site.baseurl }}/" },
    { "@type": "ListItem", "position": 2, "name": "${esc(c.name)}", "item": "{{ site.url }}{{ site.baseurl }}/${c.slug}.html" },
    { "@type": "ListItem", "position": 3, "name": "Full roadmap", "item": "{{ site.url }}{{ site.baseurl }}/roadmaps/${c.slug}.html" }
  ]
}
</script>
{% include roadmap-page.html key="${c.slug}" %}
`;
    fs.writeFileSync(path.join(root, 'roadmaps', c.slug + '.html'), stub);

    // ---- inject button + link card into the career page (idempotent) ----
    let out = page;
    if (!out.includes('btn-journey')) {
      const btn = `<a href="roadmaps/${c.slug}.html" class="btn btn-journey btn-page-link">📍 See The Journey / Full Roadmap</a>`;
      if (/class="page-hero-ctas"/.test(out)) {
        // supersede the old "See the Roadmap" anchor, otherwise prepend
        const old = /<a href="#roadmap" class="btn btn-primary btn-inpage-jump">[\s\S]*?<\/a>/;
        const heroIdx = out.indexOf('page-hero-ctas');
        const oldM = old.exec(out.slice(heroIdx, heroIdx + 900));
        if (oldM) out = out.slice(0, heroIdx) + out.slice(heroIdx).replace(old, btn);
        else out = out.replace(/(<div class="page-hero-ctas">)/, '$1\n        ' + btn);
      } else {
        const block = `<div class="page-hero-ctas">\n        ${btn}\n      </div>\n      `;
        if (/<div class="quickfacts">/.test(out)) out = out.replace('<div class="quickfacts">', block + '<div class="quickfacts">');
        else problems.push(c.slug + ': no hero anchor for button');
      }
    }
    if (!out.includes('rm-link-card')) {
      const i = out.indexOf('id="roadmap"');
      const end = i < 0 ? -1 : out.indexOf('</section>', i);
      if (end < 0) problems.push(c.slug + ': no #roadmap section');
      else {
        const lastDiv = out.lastIndexOf('</div>', end);
        const card = `\n      <div class="rm-link-card reveal"><div><strong>Want the exact step-by-step journey?</strong><p>Eligibility, exams and cycles, training and final qualification for ${c.name}, in order, with official links.</p></div><a href="roadmaps/${c.slug}.html" class="btn btn-journey btn-page-link">📍 See The Journey / Full Roadmap</a></div>\n    `;
        out = out.slice(0, lastDiv) + card.replace(/\s+$/, '\n    ') + out.slice(lastDiv);
      }
    }
    if (out !== page) fs.writeFileSync(pagePath, out);
    count++;
  }
}
console.log('built', count, 'roadmaps');
if (problems.length) { console.log('PROBLEMS:\n' + problems.join('\n')); process.exitCode = 1; }
