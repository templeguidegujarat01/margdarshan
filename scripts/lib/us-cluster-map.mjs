// Which Career Cluster a USA page belongs to (USA Master Plan Phase 14: search `g` facet).
//   usClusterMap(root, yaml) -> Map(page path without #anchor -> cluster slug)
// A career's home cluster is where _data/us/clusters.yml places it (`career:`, `pathway:` or `trade:`); its career page,
// roadmap, program list and (pathways) colleges/salary pages all carry that cluster. Hubs carry their own slug.
// Read by scripts/check-search.mjs (every mapped search entry must carry the right `g`) and
// scripts/build-us-colleges.mjs (program-list search entries).
import fs from 'node:fs';
import path from 'node:path';

export function usClusterMap(root, yaml) {
  const load = (f) => yaml.load(fs.readFileSync(path.join(root, f), 'utf8'));
  const clusters = load('_data/us/clusters.yml').clusters;
  // pathway slug -> roadmap slug (the `slug` of its `pathway:` entry in _data/us/careers/<cluster>.yml)
  const rmOf = {};
  for (const C of clusters) {
    const f = `_data/us/careers/${C.slug}.yml`;
    if (!fs.existsSync(path.join(root, f))) continue;
    for (const x of load(f).list || []) if (x.pathway) rmOf[x.pathway] = x.slug;
  }
  const map = new Map();
  const put = (u, c) => { if (!map.has(u)) map.set(u, c); };
  for (const C of clusters) {
    put(`us/clusters/${C.slug}/`, C.slug);
    for (const E of C.careers || []) {
      if (E.career) {
        for (const u of [`us/careers/${E.career}/`, `us/roadmaps/${E.career}.html`, `us/colleges/fields/${E.career}/`]) put(u, C.slug);
      } else if (E.pathway) {
        for (const u of [`us/careers/${E.pathway}/`, `us/careers/${E.pathway}/colleges/`, `us/careers/${E.pathway}/salary/`]) put(u, C.slug);
        if (rmOf[E.pathway]) for (const u of [`us/roadmaps/${rmOf[E.pathway]}.html`, `us/colleges/fields/${rmOf[E.pathway]}/`]) put(u, C.slug);
      } else if (E.trade) {
        for (const u of [`us/cte/${E.trade}.html`, `us/cte/roadmaps/${E.trade}.html`, `us/colleges/fields/${E.trade}/`]) put(u, C.slug);
      }
    }
  }
  return map;
}
