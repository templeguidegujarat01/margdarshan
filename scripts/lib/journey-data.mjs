// Loads the Student Journey Blueprint data (2026-10-26 split layout) and puts it back together as one object, shaped
// like the old single journey_matrix.yml: { checked, classes, boards, careers: [...], general_money, money: [...], sources: [...] }.
//   _data/in/journey_common.yml  — classes, boards, `careers` (the id order), general_money, and the money items /
//                                  sources more than one career uses
//   _data/in/journey/<id>.yml    — one career: its own fields at the top level, plus `money_defs` and `sources`
//                                  (money items / sources only this career uses)
// Every id lives in exactly one file; a career may cite a source or money id from any file.
// Used by check-journey-matrix.mjs, build-journey-pages.mjs and split-journey-matrix.mjs. The pages do the same merge
// in Liquid (_includes/journey-data.html).
import fs from 'node:fs';
import path from 'node:path';

export const COMMON = path.join('_data', 'in', 'journey_common.yml');
export const DIR = path.join('_data', 'in', 'journey');

// `io` lets split-journey-matrix.mjs check its output before writing it: { read(rel) -> text, list() -> file names in DIR }.
export function loadJourney(root, yaml, io = {
  read: (rel) => fs.readFileSync(path.join(root, rel), 'utf8'),
  list: () => (fs.existsSync(path.join(root, DIR)) ? fs.readdirSync(path.join(root, DIR)) : []),
}) {
  const problems = [];
  const read = (rel) => {
    try { return yaml.load(io.read(rel)) || {}; }
    catch (e) { problems.push(`${rel.replace(/\\/g, '/')}: ${e.code === 'ENOENT' ? 'file missing' : 'YAML error: ' + e.message.split('\n')[0]}`); return null; }
  };
  const common = read(COMMON) || {};
  const order = Array.isArray(common.careers) ? common.careers : [];
  if (!order.length) problems.push('journey_common.yml: `careers` must list the career ids in order');
  const files = io.list().filter((f) => /\.ya?ml$/.test(f));
  for (const f of files) {
    const id = f.replace(/\.ya?ml$/, '');
    if (!order.includes(id)) problems.push(`journey/${f}: career "${id}" is not listed in journey_common.yml \`careers\``);
  }
  const D = { ...common, careers: [], money: [...(common.money || [])], sources: [...(common.sources || [])] };
  for (const id of order) {
    const rel = path.join(DIR, `${id}.yml`);
    const f = read(rel);
    if (!f) continue;
    const { money_defs: md, sources: src, ...career } = f;
    if (career.id !== id) problems.push(`journey/${id}.yml: id is "${career.id}", must match the file name`);
    D.careers.push(career);
    for (const x of md || []) D.money.push(x);
    for (const x of src || []) D.sources.push(x);
  }
  return { D, problems };
}
