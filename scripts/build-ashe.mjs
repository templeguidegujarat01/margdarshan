// Build UK pay JSON from the official ONS ASHE tables (one download per year, no extra tools needed).
//   node scripts/build-ashe.mjs --t14 <ashetable14YYYYprovisional.zip> --t15 <ashetable15YYYYprovisional.zip>
//        [--soc 2134,2412,2421] [--out _data/uk/ashe.json]
//
// Source: ONS Annual Survey of Hours and Earnings (ASHE).
//   Table 14 = occupation (SOC 2020, 4-digit), UK:      https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14
//   Table 15 = work region x occupation (4-digit):      https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/regionbyoccupation4digitsoc2010ashetable15
// Download the zips by hand (or curl with a User-Agent) and pass their paths. The zips hold .xlsx files,
// which are zips too; this script reads both with node:zlib, so no Python, Excel or unzip is needed.
//
// Output: per SOC code, full-time employee jobs, gross ANNUAL pay (sheet "Full-Time" of table .7a):
//   uk:      { jobs_k, median, p10, p25, p75, p90, cv_median }
//   regions: [{ region, jobs_k, median, cv_median }]   (only regions where ONS published a median)
// Rules: values are copied, never computed or rounded. ONS "x" (CV > 20%, unreliable) and ".." (disclosive)
// are left out. cv_median comes from the matching .7b CV table, so pages can warn on weak estimates
// (ONS: CV <= 5% precise, 5-10% reasonably precise, 10-20% use with caution).
// SOC list default: every `soc:` code in _data/uk/careers/*.yml.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
if (!arg('--t14') || !arg('--t15')) { console.error('usage: node scripts/build-ashe.mjs --t14 <table14.zip> --t15 <table15.zip>'); process.exit(2); }
const out = path.resolve(arg('--out') || path.join(root, '_data/uk/ashe.json'));
const socs = arg('--soc') ? arg('--soc').split(',') : [...new Set(fs.readdirSync(path.join(root, '_data/uk/careers'))
  .filter((f) => f.endsWith('.yml'))
  .flatMap((f) => [...fs.readFileSync(path.join(root, '_data/uk/careers', f), 'utf8').matchAll(/\bsoc:\s*"?(\d{4})"?/g)].map((m) => m[1])))];

// ---- minimal zip reader (central directory; stored or deflated entries) ----
function unzip(buf) {
  let e = buf.length - 22;
  while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error('not a zip file');
  const n = buf.readUInt16LE(e + 10);
  let p = buf.readUInt32LE(e + 16);
  const files = {};
  for (let i = 0; i < n; i++) {
    const method = buf.readUInt16LE(p + 10), size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28), extra = buf.readUInt16LE(p + 30), comment = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(start, start + size);
    files[name] = () => (method === 0 ? raw : zlib.inflateRawSync(raw));
    p += 46 + nameLen + extra + comment;
  }
  return files;
}

// ---- xlsx: rows of one named sheet as { A: '...', B: '...' } ----
function sheetRows(xlsxBuf, sheetName) {
  const z = unzip(xlsxBuf);
  const txt = (k) => z[k]().toString('utf8');
  const ss = [...txt('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)]
    .map((m) => [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''));
  const sheet = [...txt('xl/workbook.xml').matchAll(/<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].find((m) => m[1] === sheetName);
  if (!sheet) throw new Error(`sheet "${sheetName}" not found`);
  const target = [...txt('xl/_rels/workbook.xml.rels').matchAll(/<Relationship [^>]*>/g)].map((m) => m[0])
    .find((r) => r.includes(`Id="${sheet[2]}"`)).match(/Target="([^"]+)"/)[1].replace(/^\/?(xl\/)?/, '');
  return [...txt('xl/' + target).matchAll(/<row r="\d+"[^>]*>([\s\S]*?)<\/row>/g)].map((r) => {
    const o = {};
    for (const c of r[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const v = (c[3] || '').match(/<v>([\s\S]*?)<\/v>/);
      o[c[1]] = v ? (/t="s"/.test(c[2]) ? ss[+v[1]] : v[1]).trim() : '';
    }
    return o;
  });
}
const num = (v) => (v && /^-?\d+(\.\d+)?$/.test(v) ? +v : undefined);   // "x" / ".." / "" -> left out
const findXlsx = (zip, re) => { const k = Object.keys(zip).find((n) => re.test(n)); if (!k) throw new Error('no file matching ' + re); return zip[k](); };
// Columns of ASHE tables: A description, B code, C jobs (thousand), D median, H p10, J p25, O p75, Q p90.
const soc = (row) => (row.B || '').split(/\s+/).pop();

const t14 = unzip(fs.readFileSync(arg('--t14')));
const t15 = unzip(fs.readFileSync(arg('--t15')));
const nat = sheetRows(findXlsx(t14, /Table 14\.7a .*Annual pay - Gross/), 'Full-Time');
const natCv = sheetRows(findXlsx(t14, /Table 14\.7b .*Annual pay - Gross.*CV/), 'Full-Time');
const reg = sheetRows(findXlsx(t15, /\(4\) Table 15 \(4\)\.7a .*Annual pay - Gross/), 'Full-Time');
const regCv = sheetRows(findXlsx(t15, /\(4\) Table 15 \(4\)\.7b .*Annual pay - Gross.*CV/), 'Full-Time');
const title = (nat[0].A || '').replace(/\s+/g, ' ');
const year = (title.match(/(20\d\d)/) || [])[1];
const provisional = /provisional/i.test(Object.keys(t14).join(' '));

const result = { source: 'ONS Annual Survey of Hours and Earnings (ASHE), tables 14.7a/b and 15 (4).7a/b, full-time employee jobs, gross annual pay (£)', year: year ? +year : null, provisional, occupations: {} };
for (const code of socs) {
  const r = nat.find((x) => soc(x) === code);
  if (!r) { console.warn(`SOC ${code}: not in table 14`); continue; }
  const cv = natCv.find((x) => soc(x) === code) || {};
  const regions = [];
  reg.forEach((x) => {
    if (soc(x) !== code || num(x.D) === undefined) return;
    // The CV table has the same rows; match on description ("London, Solicitors and lawyers") + code.
    const c = regCv.find((y) => soc(y) === code && (y.A || '').trim() === x.A.trim()) || {};
    regions.push({ region: x.A.split(',')[0].trim(), jobs_k: num(x.C), median: num(x.D), cv_median: num(c.D) });
  });
  result.occupations[code] = {
    title: r.A.trim(),
    uk: { jobs_k: num(r.C), median: num(r.D), p10: num(r.H), p25: num(r.J), p75: num(r.O), p90: num(r.Q), cv_median: num(cv.D) },
    regions,
  };
  console.log(`SOC ${code} ${r.A.trim()}: UK median ${r.D}, ${regions.length} regions with a published median`);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(result, null, 1) + '\n');
console.log(`wrote ${path.relative(root, out)} (ASHE ${year}${provisional ? ' provisional' : ''})`);
