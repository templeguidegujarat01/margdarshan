// SERP lengths for generated page stubs (2026-10-22): <title> at most 60 characters, meta description at most 160.
// verify-site.mjs --all fails USA state and career pages that go over either limit.
export const TITLE_MAX = 60;
export const DESC_MAX = 160;

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
  const s = String(text).replace(/\s+/g, ' ').trim();
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
