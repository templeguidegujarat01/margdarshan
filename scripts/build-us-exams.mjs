// USA Edition, Exams hub (USA Master Plan Phase 9, 2026-10-21): writes the page stubs for
//   us/exams/index.html          the hub, exams grouped by stage   (_includes/us-exams-hub.html)
//   us/exams/<slug>/index.html   one page per exam                 (_includes/us-exam-page.html, `exam: <slug>`)
// from _data/us/exams.yml. The older us/tests/ overview page (tests.yml) is not touched and stays live.
//   VERIFY_DEPS=<dir containing node_modules with js-yaml> node scripts/build-us-exams.mjs [--check]
// --check only reports missing / stale stubs (and stubs for exams that no longer exist).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const check = process.argv.includes('--check');
const EX = yaml.load(fs.readFileSync(path.join(root, '_data/us/exams.yml'), 'utf8'));
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

put('us/exams/index.html', `---
title: "U.S. Exams by Stage: SAT, ACT, AP, GED, TOEFL, GRE, GMAT, LSAT, MCAT, USMLE, NCLEX | Education Margdarshan USA"
description: "Every U.S. exam from grade 3 to graduate school and licensing, grouped by stage, with a page per exam: who takes it, format, scoring, fees and fee waivers, 2026-27 dates and official practice from the exam owner."
og_type: "website"
breadcrumb:
  current: "Exams"
---
{% include us-exams-hub.html %}
`);

let pages = 0;
for (const [slug, E] of Object.entries(EX.exams)) {
  pages++;
  put(`us/exams/${slug}/index.html`, `---
title: "${esc(E.page.title)} | Education Margdarshan USA"
description: "${esc(E.page.description)}"
og_type: "article"
exam: ${slug}
breadcrumb:
  parent_href: "us/exams/"
  parent_label: "Exams"
  current: "${esc(E.short)}"
---
{% include us-exam-page.html %}
`);
}

// A stub folder whose exam left exams.yml would keep serving an empty page: report it (never delete it here).
const dir = path.join(root, 'us/exams');
if (fs.existsSync(dir)) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory() && !EX.exams[d.name]) stale.push(`us/exams/${d.name}/ has no exams.yml entry (make it a redirect_to stub)`);
  }
}

for (const s of stale) console.error('  ' + s);
console.log(check
  ? `checked exams hub + ${pages} exam page(s): ${stale.length} problem(s)`
  : `wrote ${wrote} stub(s): exams hub + ${pages} exam page(s)`);
if (stale.length) process.exit(1);
