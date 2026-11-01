// rebuild-learn — everything that follows from the "where to learn" data, in the right order, in one command.
//   VERIFY_DEPS=<deps> node scripts/rebuild-learn.mjs
//
// Run after any change under scripts/learn-src/local/, _data/in/learn/, _data/coaching.yml or _data/colleges.yml.
// The inbox GitHub Action (.github/workflows/inbox.yml) runs it after scripts/inbox-ingest.mjs.
//   1. each finder's JSON: scripts/learn-src/<id>.mjs, or learn-src/generic.mjs <id> when there is none
//      (finders with a register fetcher only re-read their cached data files; nothing is fetched)
//   2. build-learn-finders   learn/ pages + _data/learn_index.yml (routes, counts, search entries)
//   3. build-seo-landings    old colleges/ + coaching/ list pages; a key a finder owns becomes a redirect there
//   4. build-learn-catalog   docs/free-claude/topics.yml + the prompt's topic table (live finders)
//   5. build-nav-mega        India menu columns, with the state pages under each finder key
//   6. build-asset-version   ?v= so browsers fetch the new menu fragment
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (script, ...args) => {
  console.log(`\n> node ${script} ${args.join(' ')}`.trimEnd());
  const r = spawnSync(process.execPath, [path.join(root, script), ...args], { stdio: 'inherit', env: process.env, cwd: root });
  if (r.status !== 0) { console.error(`rebuild-learn: ${script} failed (exit ${r.status})`); process.exit(r.status || 1); }
};
const ids = fs.readdirSync(path.join(root, '_data/in/learn')).filter((f) => f.endsWith('.yml')).map((f) => f.replace(/\.yml$/, '')).sort();
for (const id of ids) {
  if (fs.existsSync(path.join(root, `scripts/learn-src/${id}.mjs`))) run(`scripts/learn-src/${id}.mjs`);
  else run('scripts/learn-src/generic.mjs', id);
}
run('scripts/build-learn-finders.mjs');
run('scripts/build-seo-landings.mjs');
run('scripts/build-learn-catalog.mjs');
run('scripts/build-nav-mega.mjs');
run('scripts/build-asset-version.mjs');
console.log('\nrebuild-learn: done');
