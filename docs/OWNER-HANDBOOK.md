# Owner Handbook — Education Margdarshan

Ye file aapke liye hai: jab Claude nahi hoga, tab site samajhne, check karne aur chhote kaam karne ke liye.
Last written: 30 Oct 2026 (India cleanup run).

---

## 1. Site ka structure (ek nazar mein)

Site **Jekyll** se bani hai aur **GitHub Pages** pe chalti hai (`emargdarshan.com`). Har commit + push ke baad GitHub
apne aap site dobara banata hai (2-5 minute).

| Hissa | Kahan hai | Kitne pages |
|---|---|---|
| Global gateway (country chuno) | `index.html` | 1 |
| India home | `india.html` | 1 |
| India career guides | `<career>.html` (data: `_data/in/careers/<career>.yml`, template `_includes/in-career.html`) | 152 |
| Entrance / govt exam pages | `jee-main.html`, `neet-ug.html` … (template `_includes/national-exam.html`) | 35 |
| State exam hubs | `state/<state>/` (data: `_data/in/states/<state>.yml`) | 101 |
| Sports + performing arts | `<sport>.html` (data: `_data/in/sports.yml`) | 56 |
| Roadmaps | `roadmaps/<slug>.html` | 208 |
| Journey pages | `journey-<career>.html` (data: `_data/in/journey/`) | 78 |
| College / coaching finders | `colleges.html`, `coaching.html` (data: `_data/colleges.yml`, `_data/coaching.yml`) | 2 |
| SEO list pages | `colleges/<state>/…`, `coaching/<state>/…` | 1,440 |
| Where-to-learn finders (4 live) | `learn/` (MBBS, Engineering, CA, Cricket) | 155 |
| Study abroad | `study-abroad/` | 44 |
| Company pages | `about`, `team`, `editorial-policy`, `help`, `contact`, `accessibility`, `privacy-policy`, `terms-and-conditions`, `disclaimer`, `cookie-policy` | 10 |
| India site map | `site-map.html` (top menu se apne aap banta hai) | 1 |
| USA / UK editions | `us/`, `uk/` | ~1,000 |

**Har page ka shell** (top bar, menu, breadcrumb, footer) ek hi file se aata hai: `_layouts/default.html`.

### Footer (30 Oct 2026 se)
- Brand + 3 promises | **Related to this page** (sirf India: jo page khula hai uske hisaab se — CA kholo to CMA, CS…;
  sirf links, koi button nahi — 31 Oct 2026) | Explore India | Company | Legal | editions bar.
- Company/Legal/Explore ke links: `_data/company.yml` mein. Naya company link jodna ho to wahi file badlo.
- "Related to this page" ka logic: `_includes/context-deck.html` (top menu ke columns se banta hai).

### Author / byline
- Har India guide ke end mein "By Margdarshan Editorial Desk · Updated … · How we check facts · Report a mistake" box.
- Google ke liye JSON-LD mein bhi author = Margdarshan Editorial Desk, publisher = Education Margdarshan.
- **Apna naam dikhana ho** to `_data/company.yml` mein `founder: name / role / bio` teeno bharo. Team page pe founder
  card apne aap aa jayega. (Koi naam khud se nahi likha gaya hai.)

### Top menu (speed ke liye)
- Menu ke bade flyout panels ab har page mein nahi hote; ek file `assets/menu-in.html` se pehli baar hover/touch pe
  aate hain aur cache ho jaate hain. Menu ka data: `_data/nav.yml` (`topnav`) + `_data/nav_mega.yml` (generated).

---

## 2. Kaunsa data kahan rehta hai

| Data | File | Kaun likhta hai |
|---|---|---|
| Career guide text | `_data/in/careers/<id>.yml` | hand (facts sirf official source se) |
| Colleges | `_data/colleges.yml` | scripts / official lists |
| Coaching centres | `_data/coaching.yml` | scripts / official pages |
| Top menu columns | `_data/nav_mega.yml` | `scripts/build-nav-mega.mjs` (hub pages se) |
| SEO list pages index | `_data/seo_landings.yml` | `scripts/build-seo-landings.mjs` |
| Learn finders | `_data/learn_index.yml`, `assets/data/learn/*.json` | `scripts/build-learn-finders.mjs` |
| Search box | `_data/search.yml` → `assets/search.json` | hand + generators |
| "Last updated" dates | `_data/last_updated.yml` | `scripts/build-last-updated.mjs` (git history se) |
| CSS/JS version | `_data/asset_version.yml` | `scripts/build-asset-version.mjs` |
| Company facts, footer links, Help FAQ | `_data/company.yml` | hand |

**Rule:** colleges, coaching, facts kabhi haath se mat bharo. Galat fact mile to official source dekh ke data file
theek karo, ya gap list (neeche) mein likho.

---

## 3. Kaunsa script kya karta hai

Sab scripts ke liye pehle deps chahiye (liquidjs + js-yaml):
`VERIFY_DEPS=<folder jisme node_modules ho>` — absolute path do.

| Script | Kaam | Kab chalana |
|---|---|---|
| `node scripts/verify-site.mjs --all` | poori site render + links, JSON-LD, sitemap, titles check (10-25 min) | bade change ke baad |
| `node scripts/verify-site.mjs --only=ca.html` | ek page check | chhote change ke baad |
| `node scripts/check-in-data.mjs` | India data + menu check | data badalne ke baad |
| `node scripts/check-search.mjs` | search index check | search.yml badalne ke baad |
| `node scripts/build-nav-mega.mjs [--check]` | top menu columns | hub page badalne ke baad |
| `node scripts/build-seo-landings.mjs [--check]` | colleges/ coaching/ list pages | colleges/coaching data ke baad |
| `node scripts/build-learn-finders.mjs [--check]` | learn/ pages | learn data ke baad |
| `node scripts/build-asset-version.mjs [--check]` | CSS/JS ka ?v= | main.css / site.js / menu badalne ke baad |
| `node scripts/build-last-updated.mjs` | "Last updated" dates | **har commit se theek pehle** |
| `node scripts/gsc-revalidate.mjs --out urls.txt` | sitemap ki saari URLs list | Search Console ke liye |
| `node scripts/gsc-revalidate.mjs --check export.csv` | Search Console export ke URLs live check | "Validate fix" se pehle |

`learn-next.mjs` abhi **mat chalao** — learn finders paused hain.

---

## 4. Search Console aur Analytics mein kya dekhna hai

**Search Console (har hafte):**
1. **Pages → Not indexed**: "Page with redirect" normal hai (purane `colleges-*.html` / `coaching-*.html` stubs).
   "Not found (404)" aaye to URL note karo — redirect stub banana padega.
2. **Sitemaps**: `sitemap.xml` status "Success" ho. URL count ~3,480+ (30 Oct 2026).
3. **Core Web Vitals**: 30 Oct ko India pages 70-85% halke hue (menu lazy). 2-4 hafte mein "Good URLs" badhne chahiye.
4. **Enhancements → FAQ / Breadcrumbs**: errors 0 hone chahiye.
5. **Performance**: kaunsi query pe click aa rahe — un pages ko pehle update karo.

Naye pages (30 Oct): `help.html`, `team.html`, `editorial-policy.html`, `accessibility.html`, `site-map.html` —
inhe URL Inspection se "Request indexing" kar sakte ho. Poori list: `docs/gsc-resubmit-2026-10-30.txt`.

**Analytics (GA4, G-QJBL4452FF):** top pages, mobile vs desktop, kahan se log aate hain. Footer ke
"Related to this page" links se clicks badhne chahiye (pages per session).

---

## 5. Warnings kab aayengi

| Kab | Kya | Kya karna |
|---|---|---|
| **29 Jan 2027** | 16 study-abroad sheets ka `review_by` beet jayega (`check-abroad-data` WARNING) | official visa/fee pages dobara padho, `review_by` aage karo |
| **9 Apr 2027** | `_data/mobility.yml` review_by | same |
| Har exam cycle | exam pages ki dates (`_data/in/national_exams.yml`, `_data/in/states/*.yml`) | naya notice aate hi date + `checked` update |
| Har saal | footer © year apne aap badalta hai (build time) | kuch nahi |

---

## 6. Pending kaam (jab Claude dobara mile)

**Learn finders:** football aur baaki subjects (`docs/learn-finder/BATCH-PROMPT.md`, `LOG.md`). Abhi sirf MBBS,
Engineering, CA, Cricket live.

**Gaps / P2-P3 (30 Oct audit):**
- ~400 internal links ab bhi purane redirect stubs (`colleges-btech.html`, `coaching-jee.html` …) pe jaate hain. Kaam
  karte hain (redirect), par seedha `colleges.html?course=…` pe bhejna better hai. Dhyan: career sheets ke `hero.hub`
  mein ye naam "finder keys" hain — unhe mat badalna, sirf visible links.
- `learn/engineering/<state>.html` pages 0.6-1.2 MB ke hain (har college ka card). Pagination ya city-split.
- 73 learn city pages india.html se 4 click door hain.
- `main.css` mein ~120 hard-coded colours; dheere dheere tokens pe laana.
- 22 thin state index pages (`colleges/<state>/`, `coaching/<state>/`) — lists hain, 404 se bachne ke liye rakhe.
- Menu descriptions mein "2027 notice out / date out" jaisi lines — next cycle pe update.
- Company pages (team/editorial/help) USA/UK footer mein bhi hain, par USA/UK pages pe byline box abhi nahi.
