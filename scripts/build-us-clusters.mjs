// USA Edition, Career Clusters architecture (Master Plan Phase 1, 2026-10-20): writes the page stubs for
//   us/clusters/index.html                     all 14 clusters             (_includes/us-clusters-index.html)
//   us/clusters/<slug>/index.html              one hub per `live` cluster  (_includes/us-cluster-hub.html)
//   us/careers/<slug>/index.html               generic career overview     (_includes/us-career-overview.html)
//   us/roadmaps/<slug>.html                    generic career roadmap      (_includes/intl-roadmap.html, `career: true`)
//   us/professional-licenses/<id>/index.html   license page for every _data/us/licenses.yml entry with a `page` block
//                                              (Phase 2 onward; the nine older license stubs are hand-written)
// from _data/us/clusters.yml and _data/us/careers/<cluster>.yml (one file per cluster, `list:` of careers; an
// entry with `pathway: <slug>` reuses the existing us/careers/<slug>/ pathway page and only gets a roadmap).
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-us-clusters.mjs [--check]
//   node scripts/build-us-clusters.mjs --crosswalk <Full_Framework_Crosswalk_SOC-Career-Clusters.xlsx>
// --crosswalk rewrites scripts/data/acte-soc-crosswalk.json from Advance CTE's official SOC crosswalk
// (careertech.org/resource/framework-crosswalk/, sheet "SOC - CC - Sub-Clusters"); scripts/check-us-data.mjs
// checks every career mapped in clusters.yml against that file. --check only reports missing / stale stubs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { fitTitle, fitDesc } from './lib/seo-fit.mjs';
import { xlsxRows } from './lib/unzip.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const XW = path.join(root, 'scripts/data/acte-soc-crosswalk.json');

if (arg('--crosswalk')) {
  const file = arg('--crosswalk');
  const rows = xlsxRows(file, 2);
  const head = rows.shift().map((h) => h.trim());
  if (head.join('|') !== 'SOC Code|Occupation Title|Career Cluster|Sub-Cluster') throw new Error(`unexpected header in sheet 2: ${head.join(' | ')}`);
  const out = {
    source: 'Advance CTE, National Career Clusters Framework Crosswalk: SOC, Cluster, and Sub-Cluster (sheet "SOC - CC - Sub-Clusters")',
    url: 'https://careertech.org/wp-content/uploads/2025/09/Full_Framework_Crosswalk_SOC-Career-Clusters.xlsx',
    page: 'https://careertech.org/resource/framework-crosswalk/',
    accessed: new Date().toISOString().slice(0, 10),
    columns: ['soc', 'title', 'cluster', 'sub_cluster'],
    rows: rows.filter((r) => /^\d{2}-\d{4}$/.test((r[0] || '').trim())).map((r) => r.slice(0, 4).map((c) => (c || '').trim())),
  };
  fs.mkdirSync(path.dirname(XW), { recursive: true });
  fs.writeFileSync(XW, JSON.stringify(out, null, 0).replace(/\],\[/g, '],\n[') + '\n');
  console.log(`wrote ${path.relative(root, XW)}: ${out.rows.length} SOC → cluster / sub-cluster rows`);
  process.exit(0);
}

const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const check = process.argv.includes('--check');
const load = (f) => yaml.load(fs.readFileSync(path.join(root, f), 'utf8'));
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:]$/, '') + '…');

const CL = load('_data/us/clusters.yml');
const careersDir = path.join(root, '_data/us/careers');
const careerFiles = fs.existsSync(careersDir) ? fs.readdirSync(careersDir).filter((f) => f.endsWith('.yml')).sort() : [];

let wrote = 0;
const stale = [];
const put = (rel, stub) => {
  const out = path.join(root, rel);
  const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').replace(/\r\n/g, '\n') : null;
  if (cur === stub) return;
  if (check) { stale.push(`${rel} ${cur === null ? 'missing' : 'out of date'}`); return; }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, stub);
  wrote++;
};

put('us/clusters/index.html', `---
title: "The 14 Career Clusters in the USA: Every Field, Its Sub-Clusters and Careers | Education Margdarshan USA"
description: "All 14 Career Clusters of the National Career Clusters Framework (Advance CTE, 2024) with their 72 sub-clusters, example programs of study and the career pages on this site for each one."
og_type: "website"
breadcrumb:
  current: "Career Clusters"
---
{% include us-clusters-index.html %}
`);

let hubs = 0;
for (const C of CL.clusters) {
  if (!C.live) continue;
  hubs++;
  put(`us/clusters/${C.slug}/index.html`, `---
title: "${esc(C.name)} Careers in the USA: Sub-Clusters, Pay and Routes | Education Margdarshan USA"
description: "${esc(clip(`The ${C.name} Career Cluster in the U.S.: ${C.sub_clusters.map((s) => s.name).join(', ')}. Career pages with BLS pay, job outlook, license and the route into each.`, 300))}"
og_type: "website"
cluster: ${C.slug}
breadcrumb:
  parent_href: "us/clusters/"
  parent_label: "Career Clusters"
  current: "${esc(C.name)}"
---
{% include us-cluster-hub.html %}
`);
}

let overviews = 0, roadmaps = 0;
for (const f of careerFiles) {
  const D = load(`_data/us/careers/${f}`);
  const cluster = f.replace(/\.yml$/, '');
  const C = CL.clusters.find((c) => c.slug === cluster);
  if (!C) { stale.push(`_data/us/careers/${f}: no cluster with slug "${cluster}" in clusters.yml`); continue; }
  for (const X of D.list || []) {
    const home = X.pathway ? `us/careers/${X.pathway}/` : `us/careers/${X.slug}/`;
    if (!X.pathway) {
      overviews++;
      // Longest pattern that fits 60 characters; very long names drop "USA", then any "(…)" part.
      const n = X.short;
      const title = fitTitle(`${n}: Pay & How to Become One | Margdarshan USA`, `${n}: Pay & Career Path | Margdarshan USA`,
        `${n} Career Guide | Margdarshan USA`, `${n} | Margdarshan USA`, `${n} | Margdarshan`, `${n.replace(/\s*\([^)]*\)/g, '')} | Margdarshan`);
      put(`us/careers/${X.slug}/index.html`, `---
title: "${esc(title)}"
description: "${esc(fitDesc(plain(X.does.text) + ' ' + plain(X.lede)))}"
og_type: "article"
cluster: ${cluster}
career: ${X.slug}
breadcrumb:
  parent_href: "us/clusters/${cluster}/"
  parent_label: "${esc(C.name)}"
  current: "${esc(X.short)}"
---
{% include us-career-overview.html %}
`);
    }
    if ((X.routes || []).length) {
      roadmaps++;
      put(`us/roadmaps/${X.slug}.html`, `---
title: "${esc(plain(X.title))} — Step-by-Step Roadmap | Education Margdarshan USA"
description: "${esc(clip(plain(X.lede), 300))}"
og_type: "article"
track: ${X.slug}
cluster: ${cluster}
career: true
breadcrumb:
  grand_href: "us/clusters/${cluster}/"
  grand_label: "${esc(C.name)}"
  parent_href: "${home}"
  parent_label: "${esc(X.short)}"
  current: "Roadmap"
---
{% include intl-roadmap.html %}
`);
    }
  }
}

let licPages = 0;
for (const [id, L] of Object.entries(load('_data/us/licenses.yml'))) {
  if (!L.page) continue;
  licPages++;
  put(`us/professional-licenses/${id}/index.html`, `---
title: "${esc(L.page.title)}"
description: "${esc(L.page.description)}"
license: ${id}
breadcrumb:
  parent_href: "us/professional-licenses/"
  parent_label: "Professional Licenses"
  current: "${esc(L.page.current)}"
---
{% include us-license-page.html %}
`);
}

for (const s of stale) console.error('  ' + s);
console.log(check
  ? `checked clusters index + ${hubs} cluster hub(s), ${overviews} career overview(s), ${roadmaps} career roadmap(s), ${licPages} license page(s): ${stale.length} problem(s)`
  : `wrote ${wrote} stub(s): clusters index + ${hubs} hub(s), ${overviews} career overview(s), ${roadmaps} roadmap(s), ${licPages} license page(s)`);
if (stale.length) process.exit(1);
