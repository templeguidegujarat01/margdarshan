// Measure how long every page really is on a phone (information-architecture audit).
//   node scripts/measure-pages.mjs <renderedSiteDir> [outFile.json]
// <renderedSiteDir> = the site rendered to static HTML (e.g. by Jekyll's _site, or a liquidjs dump)
// with assets/ copied in. The script serves it on 127.0.0.1:8799, opens every .html page in headless
// Chrome at 390x844 (a common phone) and records:
//   screens   height of <main> divided by the viewport height (= how many thumb-scrolls)
//   sections  <section> count, h2 count, tables, FAQ items, words in <main>
// Redirect stubs (no <main> or "has moved" pages) are skipped. No dependencies; needs Chrome or Edge
// (set CHROME=<path to the browser executable> if it is not in the default location).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const [dir, outFile = 'page-measure.json'] = process.argv.slice(2);
if (!dir) { console.error('usage: node scripts/measure-pages.mjs <renderedSiteDir> [out.json]'); process.exit(1); }
const W = 390, H = 844, PORT = 8799, DBG = 9399;
const chrome = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => fs.existsSync(p));

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(dir, p), (e, b) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); s.end(b); });
}).listen(PORT);

const pages = [];
const walk = (d, rel = '') => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const r = rel ? rel + '/' + e.name : e.name;
  if (e.isDirectory()) { if (!['assets', 'profile'].includes(e.name)) walk(path.join(d, e.name), r); }
  else if (r.endsWith('.html') && !r.startsWith('redirects/') && !r.startsWith('google') && r !== '404.html') pages.push(r);
} };
walk(dir);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${DBG}`, '--user-data-dir=' + path.join(dir, 'profile'), '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const MEASURE = `(() => {
  const m = document.querySelector('main');
  if (!m || /has moved|Redirecting/i.test(m.textContent.slice(0, 200)) || m.textContent.trim().split(/\\s+/).length < 40) return null;
  document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible'));
  const t = m.cloneNode(true); t.querySelectorAll('script,style').forEach((e) => e.remove());
  return { screens: +(m.getBoundingClientRect().height / ${H}).toFixed(1), words: t.textContent.trim().split(/\\s+/).length,
    sections: m.querySelectorAll('section').length, h2: m.querySelectorAll('h2').length, tables: m.querySelectorAll('table').length,
    faq: m.querySelectorAll('.faq-item').length, overflow: document.documentElement.scrollWidth > innerWidth };
})()`;
const results = [];
try {
  let wsUrl;
  for (let i = 0; i < 50 && !wsUrl; i++) { try { wsUrl = (await (await fetch(`http://127.0.0.1:${DBG}/json`)).json()).find((x) => x.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(200); }
  ws = new WebSocket(wsUrl); await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
  for (const [i, p] of pages.entries()) {
    const url = `http://127.0.0.1:${PORT}/${p}`;
    await send('Page.navigate', { url });
    // Wait until this exact page has finished loading (never measure the previous page).
    for (let t = 0; t < 60; t++) {
      await sleep(100);
      const s = await send('Runtime.evaluate', { expression: 'location.href + "|" + document.readyState', returnByValue: true });
      if (s.result.value === url + '|complete') break;
    }
    await sleep(150);
    const r = await send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
    if (r.result.value) results.push({ page: p, ...r.result.value });
    if (i % 50 === 0) console.log(`${i}/${pages.length}`);
  }
} finally { ws && ws.close(); proc.kill(); server.close(); }
fs.writeFileSync(outFile, JSON.stringify(results, null, 1));
const sorted = results.slice().sort((a, b) => b.screens - a.screens);
console.log(`measured ${results.length} pages at ${W}x${H} -> ${outFile}`);
console.log('longest:'); for (const r of sorted.slice(0, 15)) console.log(`  ${String(r.screens).padStart(5)} screens  ${r.page}`);
console.log('overflowing:', results.filter((r) => r.overflow).map((r) => r.page).join(' ') || 'none');
