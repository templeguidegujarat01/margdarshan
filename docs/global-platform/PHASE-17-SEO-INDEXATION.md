# Phase 17 — SEO and indexation audit

Date: 2026-10-08. Two passes: (1) an on-page audit of all 480 rendered pages (title, description,
canonical, og:url, h1, image alt, `lang`, JSON-LD validity, BreadcrumbList targets, FAQ markup vs visible
FAQ, internal links, orphans, links to redirect stubs, click depth); (2) live checks against
emargdarshan.com (sitemap, status codes, redirects, canonical, robots).

## Indexation: healthy

| Check | Result |
| --- | --- |
| Indexable pages (index, not a redirect stub, not 404/verification) | 403 |
| Live `sitemap.xml` URLs | 403 — **exactly the indexable set** (0 missing, 0 extra) |
| Status of every sitemap URL | 403 × 200 |
| `http://` → `https://`, `www.` → apex, `/us` → `/us/` | 301 each |
| Unknown URL | 404 status |
| Redirect stubs (75, `jekyll-redirect-from`) | `noindex`, canonical to the target, meta refresh; excluded from the sitemap |
| Canonical / og:url | self-referencing on every indexable page; home is `https://emargdarshan.com/` |
| `noindex` pages | `/404.html`, `/design-system/` (intended) |
| Click depth from the home page | 1: 45 pages · 2: 201 · 3: 156 — every indexable page within 3 clicks |
| Orphans | 0 |
| robots.txt | allows all, points to the sitemap |
| `lang` | `en` (India), `en-US` (USA) on every page; no hreflang (editions are different content, not translations — correct) |

## On-page

- Every indexable page has a title, a description, exactly one `h1`, valid JSON-LD and (except the two edition
  homes) a BreadcrumbList whose URLs all exist. No images without `alt`. No broken internal links (the only
  hits were JavaScript template strings inside `<script>`).
- FAQPage JSON-LD on 22 govt exam pages lists 5–6 of the 7–9 visible questions. A subset of visible Q&A is valid.
  (Google has shown FAQ rich results only for well-known government and health sites since 2023, so this markup is
  harmless but brings little.)

## Fixed in this phase

**Social preview image.** No page had `og:image`, so links shared on WhatsApp, Facebook, X or LinkedIn showed no
picture. Added two 1200×630 brand cards (`assets/img/og-in.png` 149 KB, `og-us.png` 154 KB, under WhatsApp's
~300 KB limit), set per edition in `_data/regions.yml` (`og_image`, `og_image_alt`), overridable per page with
`og_image` front matter. The layout now emits `og:image`, width, height and alt, and `twitter:card` becomes
`summary_large_image`. Verified on all indexable pages: India pages get the India card, USA pages the USA card.

## Found, not changed (owner decisions)

1. **Long titles and descriptions.** Titles over 70 characters: India 273 of 323 (median 80), USA 77 of 80
   (median 87). Descriptions over 170: India 301 (median 221), USA 51 (median 179). Titles are keyword-first, so
   Google truncates the brand suffix or rewrites them; descriptions are often rewritten anyway. Shortening ~350
   titles is a content edit (India front matter is protected); a rule such as "≤ 60 characters before
   ` | Margdarshan`" could be applied edition by edition if the owner wants it.
2. **Links to redirect stubs** from `niche-careers.html` and `niche-careers/creative-arts.html`
   (`coaching-design.html`, `colleges-design.html`, `colleges-arts.html`): they work (one extra hop) but should
   point at the finder URLs. That folder is off-limits for automated edits.
3. **`/index.html` also answers 200** (GitHub Pages serves it). It canonicalises to `/`, so no duplicate-content
   risk.

## Verification

- `check-us-data.mjs` 0 problems; `verify-site.mjs --all` only the 4 known warnings; render 486 pages, 0 errors.
- Audit script and data are in the session scratchpad (`seo17.cjs`); it can be re-run on any render.

## Quality gate

1. **Researched:** all rendered pages and the live site (403 URLs fetched).
2. **Discovered:** no social image anywhere; indexation otherwise clean (sitemap = indexable set).
3. **Changed / 5. Files:** `_layouts/default.html`, `_data/regions.yml`, `assets/img/og-in.png`, `assets/img/og-us.png`.
6. **Could affect:** every page's `<head>` (social tags only). 7. **Tested:** see Verification.
8. **Unresolved:** the three items above. 9. **Better than the brief:** per-edition images from data, so a future
   country gets its own card with one line. 10. **Next (Phase 18):** final global QA.
