// Regenerates every raster brand asset from the E+D gradient mark (same drawing as
// _includes/logo-mark.html and assets/img/favicon.svg):
//   assets/img/favicon-48.png, favicon-192.png, favicon-512.png, apple-touch-icon.png,
//   favicon.ico (16 + 32 + 48, PNG-in-ICO), assets/img/og-in.png, og-us.png (1200x630).
// Renders with a local Edge/Chrome through playwright-core (no image libraries needed):
//   BRAND_DEPS=<dir containing node_modules/playwright-core> node scripts/build-brand-assets.mjs
// The OG cards load Fraunces + Hind from Google Fonts, so run it online.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(process.env.BRAND_DEPS || root, 'x.js'));
const { chromium } = req('playwright-core');
const img = (f) => path.join(root, 'assets/img', f);

const INK = '#0F2A3D';
const GRAD = 'linear-gradient(135deg,#00A3FF 0%,#00E5A3 100%)';
const GLYPH = `<path d="M9 8.5H16A7.5 7.5 0 0 1 16 23.5H9Z" stroke="${INK}" stroke-width="3.2"/><path d="M9 16H15.5" stroke="${INK}" stroke-width="3.2"/>`;
// rounded = transparent corners (browser tab icons); square = full-bleed (iOS applies its own mask)
const mark = (px, rounded = true) =>
  `<svg width="${px}" height="${px}" viewBox="0 0 32 32" fill="none" style="display:block;background:${GRAD};border-radius:${rounded ? '24%' : '0'}">${GLYPH}</svg>`;

const EDITIONS = [
  { file: 'og-in.png', badge: 'India Edition', title: 'Free career guidance for Indian students', sub: 'Streams, courses, exams and colleges after Class 10 and Class 12', domain: 'emargdarshan.com' },
  { file: 'og-us.png', badge: 'USA Edition', title: 'Careers, colleges and licenses in the U.S.', sub: 'Built on official data: BLS, NCES IPEDS, state boards and USCIS', domain: 'emargdarshan.com/us/' },
];
const og = (e) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Hind:wght@500;600&display=block">
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:${INK};font-family:Hind,sans-serif;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(520px 420px at 1010px 120px,rgba(0,163,255,.30),transparent 70%),radial-gradient(460px 380px at 1130px 560px,rgba(0,229,163,.18),transparent 70%)}
svg.wave{position:absolute;left:0;top:0}
.wrap{position:absolute;left:84px;top:72px;right:84px}
.brand{display:flex;align-items:center;gap:22px}
.name{font-family:Fraunces,serif;font-weight:700;font-size:50px;color:#fff;letter-spacing:-.5px;line-height:1}
.pill{margin-left:12px;padding:10px 20px 7px;border-radius:999px;border:2px solid rgba(0,229,163,.75);color:#00E5A3;font-weight:600;font-size:22px;line-height:1}
h1{margin-top:66px;font-family:Fraunces,serif;font-weight:700;font-size:64px;line-height:1.08;color:#fff;max-width:960px}
p{margin-top:26px;font-size:28px;color:#A9C4CF}
.domain{position:absolute;left:84px;bottom:82px;font-weight:600;font-size:26px;background:${GRAD};-webkit-background-clip:text;background-clip:text;color:transparent}
</style></head><body><div class="glow"></div>
<svg class="wave" width="1200" height="630"><defs><linearGradient id="w" x1="0" x2="1"><stop offset="0" stop-color="#00A3FF" stop-opacity=".15"/><stop offset="1" stop-color="#00E5A3" stop-opacity=".7"/></linearGradient></defs><path d="M0 522C220 505 380 530 560 470S900 405 1080 460 1180 430 1200 410" fill="none" stroke="url(#w)" stroke-width="3"/></svg>
<div class="wrap"><div class="brand">${mark(76)}<span class="name">Education Margdarshan</span><span class="pill">${e.badge}</span></div>
<h1>${e.title}</h1><p>${e.sub}</p></div><div class="domain">${e.domain}</div></body></html>`;

const ico = (pngs) => {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach(({ size, buf }, i) => {
    const o = 6 + 16 * i;
    head.writeUInt8(size % 256, o); head.writeUInt8(size % 256, o + 1);
    head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(buf.length, o + 8); head.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.buf)]);
};

const browser = await chromium.launch({ channel: process.env.BRAND_CHANNEL || 'msedge' });
const page = await browser.newPage({ deviceScaleFactor: 1 });
const shot = async (html, w, h, opts = {}) => {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return page.screenshot({ clip: { x: 0, y: 0, width: w, height: h }, omitBackground: !!opts.transparent });
};
const iconHtml = (px, rounded) => `<!doctype html><body style="margin:0;background:transparent">${mark(px, rounded)}</body>`;

const out = {};
for (const px of [16, 32, 48, 192, 512]) out[px] = await shot(iconHtml(px, true), px, px, { transparent: true });
fs.writeFileSync(img('favicon-48.png'), out[48]);
fs.writeFileSync(img('favicon-192.png'), out[192]);
fs.writeFileSync(img('favicon-512.png'), out[512]);
fs.writeFileSync(path.join(root, 'favicon.ico'), ico([16, 32, 48].map((size) => ({ size, buf: out[size] }))));
fs.writeFileSync(img('apple-touch-icon.png'), await shot(iconHtml(180, false), 180, 180));
for (const e of EDITIONS) fs.writeFileSync(img(e.file), await shot(og(e), 1200, 630));
await browser.close();
console.log('wrote favicon.ico, favicon-48/192/512.png, apple-touch-icon.png, ' + EDITIONS.map((e) => e.file).join(', '));
