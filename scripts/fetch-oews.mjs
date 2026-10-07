// Pull BLS OEWS state data (latest year) from the BLS Public Data API v1 for USA career pages.
//   node scripts/fetch-oews.mjs emp    <soc6,soc6,...>   employment (datatype 01) in all 50 states + DC
//   node scripts/fetch-oews.mjs wage   <soc6,soc6,...>   annual median (13) and mean (04) for each top-5 state
//   node scripts/fetch-oews.mjs report <soc6,soc6,...>   print top-5 states as JSON for _data/us/occupation_details.yml
// Free tier: 25 requests/day, 25 series/request (emp ≈ 2.1 requests per occupation, wage ≈ 0.4).
// Results are cached in ./oews-cache.json (run from a scratch folder, not committed).
import fs from 'node:fs';
const OCC = Object.fromEntries((process.argv[3] || '').split(',').filter(Boolean).map((c) => [c, c]));
if (!Object.keys(OCC).length) { console.error('usage: node fetch-oews.mjs emp|wage|report <soc6,...>'); process.exit(1); }
const ST = { '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware', '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine', '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota', '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska', '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico', '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio', '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington', '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming' };
const sid = (st, occ, dt) => `OEUS${st}00000000000${occ}${dt}`;
const out = fs.existsSync('oews-cache.json') ? JSON.parse(fs.readFileSync('oews-cache.json', 'utf8')) : { values: {}, log: [] };
let requests = 0;
async function fetchSeries(ids) {
  requests++;
  const r = await fetch('https://api.bls.gov/publicAPI/v1/timeseries/data/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seriesid: ids, latest: true }) });
  const j = await r.json();
  if (j.status !== 'REQUEST_SUCCEEDED') { const m = j.status + ' ' + (j.message || []).join('; '); out.log.push(m); fs.writeFileSync('oews-cache.json', JSON.stringify(out, null, 1)); console.error(m); process.exit(2); }
  for (const s of j.Results.series) { const d = s.data.find((x) => x.year === '2025'); if (d) out.values[s.seriesID] = d.value; }
  fs.writeFileSync('oews-cache.json', JSON.stringify(out, null, 1));
}
const step = process.argv[2];
if (step === 'emp') {
  const ids = []; for (const o of Object.keys(OCC)) for (const s of Object.keys(ST)) { const id = sid(s, o, '01'); if (!(id in out.values)) ids.push(id); }
  for (let i = 0; i < ids.length; i += 25) await fetchSeries(ids.slice(i, i + 25));
} else if (step === 'wage') {
  const ids = [];
  for (const o of Object.keys(OCC)) {
    const top = Object.keys(ST).map((s) => [s, +out.values[sid(s, o, '01')] || 0]).sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [s] of top) for (const dt of ['13', '04']) ids.push(sid(s, o, dt));
  }
  const need = ids.filter((id) => !(id in out.values));
  for (let i = 0; i < need.length; i += 25) await fetchSeries(need.slice(i, i + 25));
} else if (step === 'report') {
  const rep = {};
  for (const [o, name] of Object.entries(OCC)) {
    const top = Object.keys(ST).map((s) => [s, +out.values[sid(s, o, '01')] || 0]).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const n = Object.keys(ST).filter((s) => out.values[sid(s, o, '01')] !== undefined).length;
    if (n < 51 && !out.values[sid('56', o, '01')] && !out.values[sid('55', o, '01')]) console.error('warning: ' + o + ' may be incomplete (' + n + ' states fetched)');
    rep[o] = { name, top: top.map(([s, e]) => ({ state: ST[s], jobs: e, median: out.values[sid(s, o, '13')], mean: out.values[sid(s, o, '04')] })), statesWithData: Object.keys(ST).filter((s) => out.values[sid(s, o, '01')]).length };
  }
  console.log(JSON.stringify(rep, null, 1));
}
console.log('requests this run:', requests);
