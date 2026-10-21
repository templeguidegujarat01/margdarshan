// USA Edition, States hub (USA Master Plan Phase 11 + 12, 2026-10-21): writes the page stubs for
//   us/states/index.html                 the hub, all 51 jurisdictions A to Z     (_includes/us-states-hub.html)
//   us/states/<slug>/index.html          one page per state with a data file      (_includes/us-state-page.html)
//   us/states/<slug>/licenses.html       that state's license rows (Phase 12)     (_includes/us-state-licenses.html)
// from _data/us/state_index.yml and _data/us/states/<slug>.yml.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-us-states.mjs [--check]
// --check only reports missing / stale stubs (and stub folders whose state has no data file); it never deletes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

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
title: "U.S. States: Diploma Rules, State Tests, In-State Tuition, Aid and Licensing Boards | Education Margdarshan USA"
description: "All 50 states and DC: high school diploma credits and state tests, public university and community college systems, in-state tuition rules, state grants, licensing boards, civil service and apprenticeship offices, from each state's own pages."
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
  const k12 = S.k12_test ? S.k12_test.name : 'state tests';
  put(`us/states/${slug}/index.html`, `---
title: "${esc(n)}: Diploma Requirements, ${esc(k12)}, In-State Tuition, Aid and State Jobs | Education Margdarshan USA"
description: "${esc(S.lede)}"
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
title: "${esc(n)} Licensing Boards: Nursing, CPA, Bar, Engineering, Trades and More | Education Margdarshan USA"
description: "What ${esc(n)}'s own licensing boards ask for: requirements, exams, fees and renewal for each license on this site, copied from each board's page."
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
