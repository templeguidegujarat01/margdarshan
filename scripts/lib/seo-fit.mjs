// SERP lengths for every indexable page (2026-10-22, sitewide 2026-10-23): <title> at most 60 characters,
// meta description at most 160. verify-site.mjs --all fails any page that goes over either limit.
// Generators call these on their titles/descriptions; scripts/fit-seo.mjs applies the same rules to
// hand-written front matter, so rerunning a generator gives the same text.
export const TITLE_MAX = 60;
export const DESC_MAX = 160;

const unamp = (s) => String(s).replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// First candidate that fits; throws if none does, so a long name fails the build instead of shipping.
export const fitTitle = (...candidates) => {
  const t = candidates.find((c) => c.length <= TITLE_MAX);
  if (!t) throw new Error(`no title fits ${TITLE_MAX} characters: ${candidates[candidates.length - 1]}`);
  return t;
};

// Sentences, without splitting after initials or abbreviations ("U.S.", "D.C.", "vs.").
const sentences = (s) => {
  const out = [];
  for (const x of s.split(/(?<=[.!?])\s+(?=[A-Z0-9"])/)) {
    if (out.length && /(?:\b[A-Z]\.|\b(?:vs|e\.g|i\.e|St|No|Dr)\.)$/.test(out[out.length - 1])) out[out.length - 1] += ' ' + x;
    else out.push(x);
  }
  return out;
};

// Cut at the last clause break (", " "; " " — ") that keeps most of the room, else at a word, and mark it with "…".
const clipClause = (s, n) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  const clause = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf('; '), cut.lastIndexOf(' — '));
  const at = clause >= n * 0.6 ? clause : cut.lastIndexOf(' ');
  return cut.slice(0, at).replace(/[\s,;:—-]+$/, '') + '…';
};

// Whole sentences while they fit; if that leaves the description short (or empty), fill the rest with a clipped clause.
export const fitDesc = (text, n = DESC_MAX) => {
  const s = unamp(text);
  if (s.length <= n) return s;
  let out = '';
  for (const x of sentences(s)) {
    const next = out ? out + ' ' + x : x;
    if (next.length > n) break;
    out = next;
  }
  const room = n - out.length - (out ? 1 : 0);
  if (out.length >= 120 || room < 40) return out;
  const rest = s.slice(out.length).trim();
  return (out ? out + ' ' : '') + clipClause(rest, room);
};

// "Education Margdarshan USA" -> "Margdarshan USA": the short brand keeps room for the page's own words.
export const shortBrand = (b) => String(b).replace(/^Education\s+/, '');

// A long composite title "Head — a, b, c & d | Brand" made to fit: the short brand, then the later
// " — " / ": " parts dropped one list item at a time (the last kept item joined with " & "), then
// "(…)" notes dropped; the brand stays unless it costs more than 10 characters of the page's own words.
// Titles that already fit come back unchanged, so it is safe to rerun.
export const shrinkTitle = (title, ...extra) => {
  const t = unamp(title);
  if (t.length <= TITLE_MAX) return t;
  const bar = t.lastIndexOf(' | ');
  const base = bar > 0 ? t.slice(0, bar) : t;
  const brand = bar > 0 ? shortBrand(t.slice(bar + 3)) : '';
  const parts = base.split(/(\s+[—–]\s+|:\s+)/);
  const segs = [];
  for (let i = 0; i < parts.length; i += 2) segs.push({ sep: i ? parts[i - 1] : '', text: parts[i] });
  const bases = [];
  for (let n = segs.length; n >= 1; n--) {
    const head = segs.slice(0, n - 1).map((s) => s.sep + s.text).join('');
    const last = segs[n - 1];
    const items = n > 1 ? last.text.split(/(, and |, | & )/) : [last.text];
    const count = (items.length + 1) / 2;
    for (let k = count; k >= 1; k--) {
      let s = items[0];
      for (let j = 1; j < k; j++) s += (j === k - 1 && k < count ? ' & ' : items[2 * j - 1]) + items[2 * j];
      bases.push(head + last.sep + s);
    }
  }
  // Last resort before the extras: the same without "(…)" notes such as "(IPEDS 2023-24)".
  bases.push(...bases.map((b) => b.replace(/ \([^)]*\)/g, '')).filter((b) => !bases.includes(b)));
  // Keep the brand unless it costs more than 10 characters of the page's own words.
  const plainFit = bases.find((b) => b.length <= TITLE_MAX);
  const branded = brand && bases.find((b) => `${b} | ${brand}`.length <= TITLE_MAX);
  if (branded && (!plainFit || branded.length >= plainFit.length - 10)) return `${branded} | ${brand}`;
  return fitTitle(...bases, ...extra);
};

// Roadmap stub <title>: the full track title if it fits, else without "(…)" parts, else the job's short name.
export const fitRoadmapTitle = (title, short, brand) => {
  const b = shortBrand(brand), bare = title.replace(/ \([^)]*\)/g, '');
  const head = short || title.split(': ')[0];
  return fitTitle(`${title} — Roadmap | ${b}`, `${title} — Roadmap`, `${bare} — Roadmap`, `${head}: Step-by-Step Roadmap | ${b}`,
    `${head} Roadmap | ${b}`, `${head} Roadmap`, `${bare} | ${b}`, bare);
};
