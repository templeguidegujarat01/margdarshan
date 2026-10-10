// Builds assets/img/world-dots.svg — the monochrome dot-matrix world map on the global home page.
//   node scripts/build-world-map.mjs <land-110m.json> [step-degrees]
// Input: Natural Earth 1:110m land (public domain), as TopoJSON from the world-atlas package:
//   https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json
// Output: one <path> of zero-length round-capped strokes (one per dot), black on transparent.
// The page uses it as a CSS mask, so the dots take the theme colour (light and dark) — see .gw-map in main.css.
// Projection: plain equirectangular, longitude -180..180, latitude LAT_TOP..LAT_BOTTOM.
// It also prints the % position of each edition pin so the HTML pins line up with the dots.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [src, stepArg] = process.argv.slice(2);
if (!src) { console.error('usage: node scripts/build-world-map.mjs <land-110m.json> [step]'); process.exit(1); }
const STEP = Number(stepArg) || 2.5;
const LAT_TOP = 84, LAT_BOTTOM = -57;

// ---- TopoJSON -> list of rings in [lon, lat] ----
const topo = JSON.parse(fs.readFileSync(src, 'utf8'));
const { scale, translate } = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; });
});
const arcPts = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
const rings = [];
for (const g of topo.objects.land.geometries) {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
  for (const poly of polys) for (const ring of poly) {
    const pts = [];
    for (const a of ring) pts.push(...arcPts(a));
    rings.push(pts);
  }
}

// Even-odd point-in-polygon over every ring (holes such as the Caspian cancel out).
function onLand(lon, lat) {
  let inside = false;
  for (const r of rings) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

const W = 360 / STEP, H = Math.round((LAT_TOP - LAT_BOTTOM) / STEP);
let d = '', n = 0;
for (let row = 0; row < H; row++) {
  const lat = LAT_TOP - (row + 0.5) * STEP;
  for (let col = 0; col < W; col++) {
    const lon = -180 + (col + 0.5) * STEP;
    if (onLand(lon, lat)) { d += `M${col} ${row}h0`; n++; }
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-.5 -.5 ${W} ${H}" width="${W * 8}" height="${H * 8}"><path d="${d}" stroke="#000" stroke-width=".56" stroke-linecap="round"/></svg>\n`;
const out = path.join(root, 'assets/img/world-dots.svg');
fs.writeFileSync(out, svg);
console.log(`${n} dots, ${W}x${H} grid, ${(svg.length / 1024).toFixed(1)} KB -> ${path.relative(root, out)}`);
console.log(`aspect-ratio: ${W} / ${H}`);

// Pin positions as % of the map box (same projection as the dots).
const pins = { in: [78.9, 22.6], us: [-98.5, 39.5], uk: [-2.5, 53.5] };
for (const [id, [lon, lat]] of Object.entries(pins)) {
  const x = ((lon + 180) / 360) * 100, y = ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * 100;
  console.log(`pin ${id}: left ${x.toFixed(2)}%  top ${y.toFixed(2)}%`);
}
