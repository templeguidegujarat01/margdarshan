// Minimal ZIP / XLSX / CSV readers for the official data pipelines (no npm dependencies).
// Handles the files the pipelines download: NCES IPEDS complete data files (.zip with one CSV),
// the NCES CIP-SOC crosswalk and BLS OEWS tables (.xlsx = zip of XML parts).
import fs from 'node:fs';
import zlib from 'node:zlib';

/** Return { name: Buffer } for every file in a zip archive (stored or deflated entries). */
export function unzip(file) {
  const b = Buffer.isBuffer(file) ? file : fs.readFileSync(file);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) if (b.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('not a zip file');
  const count = b.readUInt16LE(eocd + 10);
  let p = b.readUInt32LE(eocd + 16);
  const out = {};
  for (let n = 0; n < count; n++) {
    if (b.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
    const method = b.readUInt16LE(p + 10), csize = b.readUInt32LE(p + 20);
    const nlen = b.readUInt16LE(p + 28), xlen = b.readUInt16LE(p + 30), clen = b.readUInt16LE(p + 32);
    const local = b.readUInt32LE(p + 42);
    const name = b.toString('utf8', p + 46, p + 46 + nlen);
    const start = local + 30 + b.readUInt16LE(local + 26) + b.readUInt16LE(local + 28);
    const raw = b.subarray(start, start + csize);
    if (!name.endsWith('/')) out[name] = method === 0 ? raw : method === 8 ? zlib.inflateRawSync(raw) : null;
    p += 46 + nlen + xlen + clen;
  }
  return out;
}

/** Parse CSV text (RFC 4180 quotes) into an array of objects keyed by the header row. */
export function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift().map((h) => h.trim());
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

/** Read the first CSV inside an IPEDS-style zip. */
export function csvFromZip(file) {
  const parts = unzip(file);
  const name = Object.keys(parts).find((n) => /\.csv$/i.test(n) && !/_rv\.csv$/i.test(n)) || Object.keys(parts).find((n) => /\.csv$/i.test(n));
  let buf = parts[name];
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) buf = buf.subarray(3); // UTF-8 BOM
  return parseCsv(buf.toString('latin1'));
}

const xmlDecode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const colIndex = (ref) => { let n = 0; for (const ch of ref.replace(/\d+$/, '')) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };

/** Read one worksheet of an .xlsx into an array of row arrays (strings). sheet = 1-based index. */
export function xlsxRows(file, sheet = 1) {
  const parts = unzip(file);
  const shared = [];
  const ss = parts['xl/sharedStrings.xml']?.toString('utf8') || '';
  for (const si of ss.matchAll(/<si>([\s\S]*?)<\/si>/g)) shared.push(xmlDecode([...si[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')));
  const xml = parts[`xl/worksheets/sheet${sheet}.xml`].toString('utf8');
  const rows = [];
  for (const r of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const c of r[1].matchAll(/<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const v = (c[3] || '').match(/<v>([\s\S]*?)<\/v>/)?.[1];
      const inline = (c[3] || '').match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1];
      row[colIndex(c[1])] = / t="s"/.test(c[2]) ? shared[+v] : xmlDecode(v ?? inline ?? '');
    }
    rows.push(Array.from(row, (x) => x ?? ''));
  }
  return rows;
}
