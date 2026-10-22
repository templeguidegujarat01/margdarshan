// USA Edition, States hub (USA Master Plan Phase 11 + 12, 2026-10-21): writes the page stubs for
//   us/states/index.html                 the hub, all 51 jurisdictions A to Z     (_includes/us-states-hub.html)
//   us/states/<slug>/index.html          one page per state with a data file      (_includes/us-state-page.html)
//                                        (all 51 since 2026-10-22; boards-tier files get a licensing-boards title)
//   us/states/<slug>/licenses.html       that state's license rows (Phase 12)     (_includes/us-state-licenses.html)
// from _data/us/state_index.yml and _data/us/states/<slug>.yml.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-us-states.mjs [--check]
// --check only reports missing / stale stubs (and stub folders whose state has no data file); it never deletes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { fitTitle, fitDesc } from './lib/seo-fit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const check = process.argv.includes('--check');
const IDX = yaml.load(fs.readFileSync(path.join(root, '_data/us/state_index.yml'), 'utf8'));
const dataDir = path.join(root, '_data/us/states');
const built = fs.readdirSync(dataDir).filter((f) => f.endsWith('.yml')).map((f) => f.slice(0, -4));
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

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

put('us/states/index.html', `---
title: "U.S. States: Diploma, Tuition, Aid, Boards | Margdarshan USA"
description: "All 50 states and DC: diploma credits and state tests, public colleges, in-state tuition rules, state grants and licensing boards, from each state's own pages."
og_type: "website"
breadcrumb:
  current: "States"
---
{% include us-states-hub.html %}
`);

for (const slug of built) {
  const row = IDX.list.find((r) => r.slug === slug);
  if (!row) { stale.push(`_data/us/states/${slug}.yml has no row in state_index.yml`); continue; }
  const S = yaml.load(fs.readFileSync(path.join(dataDir, slug + '.yml'), 'utf8'));
  const n = S.name;
  // Boards-tier states (50-state portal, 2026-10-22) have no diploma block yet: the page is their licensing boards.
  const title = S.diploma
    ? fitTitle(`${n}: Diploma, Tests, Tuition & Aid | Margdarshan USA`, `${n}: Diploma, Tuition & Aid | Margdarshan USA`, `${n} Career & Aid Guide | Margdarshan USA`)
    : fitTitle(`${n} Licensing Boards: Bar, Medical, CPA | Margdarshan USA`, `${n} State Licensing Boards | Margdarshan USA`);
  put(`us/states/${slug}/index.html`, `---
title: "${esc(title)}"
description: "${esc(fitDesc(S.lede))}"
og_type: "article"
state: ${slug}
breadcrumb:
  parent_href: "us/states/"
  parent_label: "States"
  current: "${esc(n)}"
---
{% include us-state-page.html %}
`);
  if (S.licenses) {
    put(`us/states/${slug}/licenses.html`, `---
title: "${esc(fitTitle(`${n} License Rules by Board | Margdarshan USA`, `${n} License Rules | Margdarshan USA`))}"
description: "${esc(fitDesc(`What ${n}'s own licensing boards ask for: requirements, exams, fees and renewal for each license on this site, copied from each board's page.`))}"
og_type: "article"
state: ${slug}
breadcrumb:
  parent_href: "us/states/${slug}/"
  parent_label: "${esc(n)}"
  current: "Licenses"
---
{% include us-state-licenses.html %}
`);
  }
}

const dir = path.join(root, 'us/states');
if (fs.existsSync(dir)) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory() && !built.includes(d.name)) stale.push(`us/states/${d.name}/ has no _data/us/states/${d.name}.yml (make it a redirect_to stub)`);
  }
}

for (const s of stale) console.error('  ' + s);
console.log(check
  ? `checked states hub + ${built.length} state(s): ${stale.length} problem(s)`
  : `wrote ${wrote} stub(s): states hub + ${built.length} state page(s)`);
if (stale.length) process.exit(1);
