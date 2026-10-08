// Tiny dependency-free HTML helpers for the India page extractor (scripts/in-extract.mjs).
// Good enough for this site's own hand-written, well-formed page markup; not a general HTML parser.

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const TAG = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>/g;

/** Top-level child elements of an HTML fragment: [{ tag, attrs, cls, inner, outer }]. Text between them is ignored. */
export function children(html) {
  const out = [];
  let depth = 0, start = -1, startTag = null, innerStart = -1;
  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(html))) {
    if (m[0].startsWith('<!--')) continue;
    const [all, close, nameRaw, attrStr, selfClose] = m;
    const name = nameRaw.toLowerCase();
    const isVoid = VOID.has(name) || selfClose === '/';
    if (!close) {
      if (depth === 0) {
        if (isVoid) { out.push(el(name, attrStr, '', all)); continue; }
        start = m.index; startTag = { name, attrStr }; innerStart = m.index + all.length;
      }
      if (!isVoid) depth++;
    } else {
      depth--;
      if (depth === 0 && startTag) {
        out.push(el(startTag.name, startTag.attrStr, html.slice(innerStart, m.index), html.slice(start, m.index + all.length)));
        startTag = null;
      }
      if (depth < 0) throw new Error('unbalanced </' + name + '> near: ' + html.slice(Math.max(0, m.index - 80), m.index + 20));
    }
  }
  if (depth !== 0) throw new Error('unclosed <' + (startTag && startTag.name) + '>');
  return out;
}

function el(tag, attrStr, inner, outer) {
  const attrs = {};
  for (const a of attrStr.matchAll(/([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) attrs[a[1]] = a[2] ?? a[3] ?? a[4] ?? '';
  return { tag, attrs, cls: (attrs.class || '').split(/\s+/).filter(Boolean), inner, outer };
}

export const has = (e, c) => e && e.cls.includes(c);
/** First descendant-or-self element matching pred, searched breadth-first. */
export function find(html, pred) {
  let level = children(html);
  while (level.length) {
    const hit = level.find(pred);
    if (hit) return hit;
    level = level.flatMap((e) => children(e.inner));
  }
  return null;
}
export function findAll(html, pred) {
  const res = [];
  const walk = (h) => { for (const e of children(h)) { if (pred(e)) res.push(e); else walk(e.inner); } };
  walk(html);
  return res;
}
/** Inner HTML with SVGs removed and whitespace collapsed (what the YAML stores for rich text). */
export const clean = (h) => h.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/\s+/g, ' ').trim();
export const text = (h) => clean(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
