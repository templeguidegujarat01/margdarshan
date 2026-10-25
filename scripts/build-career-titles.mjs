// Builds assets/data/career-titles.json — the ~10,000 career / job titles behind the
// "I want to be a/an …" search on journey-blueprint.html — from the raw list pasted out of a
// chat (scripts/data/career-titles-source.txt). The paste mixes numbered and unnumbered batches,
// category headers and chat lines; this keeps titles + their category and drops the rest.
//   node scripts/build-career-titles.mjs            build
//   node scripts/build-career-titles.mjs --check    build in memory and fail if the JSON is stale
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'scripts/data/career-titles-source.txt');
const OUT = path.join(root, 'assets/data/career-titles.json');

const raw = fs.readFileSync(SRC, 'utf8').replace(/^﻿/, '').split(/\r?\n/).map(s => s.trim());

const RANGE = /^(final\s+)?(batch:\s*)?\d[\d,]*\s*[–-]\s*\d[\d,]*\b/i;
const NUM = /^(\d{1,5})\.\s+(.+)$/;
function noise(s){
  if(RANGE.test(s)) return true;
  if(/^(ok\s+)?go(\s+on)?\b/i.test(s) || /^(keep|next|completed|fixed target|aur |this is|continuing|batch)/i.test(s)) return true;
  if(/[?:]$|[.!]$/.test(s) && !NUM.test(s)) return true;
  if(s.split(/\s+/).length > 11) return true;
  return false;
}
const tidy = s => s.replace(/\s*\(\d[\d,]*\s*[–-]\s*\d[\d,]*\)\s*$/, '').replace(/\s+/g, ' ').replace(/^[-•*]\s*/, '').trim();

const cats = [], catIx = new Map(), titles = [], seen = new Set();
let cat = 'Other', prevNum = null, dupes = 0;
function catId(c){ if(!catIx.has(c)){ catIx.set(c, cats.length); cats.push(c); } return catIx.get(c); }
function addTitle(t){
  t = tidy(t);
  if(!t || t.length > 90) return;
  const key = t.toLowerCase();
  if(seen.has(key)){ dupes++; return; }
  seen.add(key); titles.push([t, catId(cat)]);
}
// Next numbered line (skipping blanks), or null.
function nextNum(i){
  for(let j = i + 1; j < raw.length; j++){ if(!raw[j]) continue; const m = raw[j].match(NUM); return m ? +m[1] : null; }
  return null;
}

for(let i = 0; i < raw.length; i++){
  const s = raw[i];
  if(!s) continue;
  const m = s.match(NUM);
  if(m){
    const n = +m[1];
    const isTitle = (prevNum !== null && n === prevNum + 1) || nextNum(i) === n + 1;
    if(isTitle){ prevNum = n; addTitle(m[2]); }
    else { cat = tidy(m[2]); prevNum = null; }
    continue;
  }
  if(noise(s)){ continue; }
  prevNum = null;
  // Unnumbered batches: a category line runs straight into its first title; titles are followed by a blank line.
  const next = raw[i + 1] || '';
  if(next && !noise(next) || /\(\d{3,5}\s*[–-]\s*\d{3,5}\)$/.test(s)) cat = tidy(s);
  else addTitle(s);
}

const json = JSON.stringify({ note: 'Career titles for the Journey Blueprint search. Built by scripts/build-career-titles.mjs — do not edit.', cats, t: titles });
if(process.argv.includes('--check')){
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if(cur.trim() !== json){ console.error('career-titles.json is stale — run node scripts/build-career-titles.mjs'); process.exit(1); }
  console.log(`career-titles.json up to date (${titles.length} titles)`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, json + '\n');
  console.log(`${titles.length} titles, ${cats.length} categories, ${dupes} duplicates skipped → ${path.relative(root, OUT)}`);
}
