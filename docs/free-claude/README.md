# Free Claude se state-wise pages bharna (owner guide, Hinglish)

Ek line me: **kisi bhi Claude account (free bhi) ko `PROMPT.md` + ek line `cs-coaching / delhi` do → wo ek `.yml`
file dega → woh file GitHub ke `inbox/` folder me upload karo → 2–5 minute me site par page, menu, search,
career-page button sab apne aap.** Koi code, koi Node, koi Claude Code nahi chahiye.

## Ek subject + ek state ka ek hi page (yeh system kaise kaam karta hai)

| Kahan se aaye | Kahan pahunche |
|---|---|
| Menu: Commerce → Coaching → Professional courses → **CA** → "CA coaching in Gujarat" | `learn/ca/gujarat.html` (seedha state page) |
| CA career page ka button **"CA coaching in India"** | `learn/ca.html?pick=state` (State box ready, state chuno → poori list, phir city filter) |
| Coaching Finder me Commerce → CA | wahi `learn/ca.html?pick=state` |
| Search: "ca coaching gujarat" | `learn/ca/gujarat.html` |
| Purana link `coaching/gujarat/ca.html` | redirect → `learn/ca/gujarat.html` |

Jis subject ka "learn finder" ban gaya (abhi: CA, MBBS+NEET, Engineering+JEE, Cricket), uske saare purane pages,
menu links aur buttons apne aap naye page par chale jaate hain. Baaki subjects (CS, CMA, B.Com, UPSC …) abhi purane
verified pages dikhate hain; jaise hi aap us topic ki **pehli** file upload karoge, uska naya finder banega
(purana data + aapki nayi rows) aur sab jagah wahi dikhega. Menu me sirf woh states aate hain jinka page bana hai
(3+ places = state page, 10+ places ek city me = city page).

## Har baar ke steps (5–10 minute aapka kaam)

1. **Prompt copy karo**: GitHub par `docs/free-claude/PROMPT.md` kholo → "Raw" → sab copy (topic list wala hissa
   bhi). Ya phone me bookmark: `https://github.com/templeguidegujarat01/margdarshan/blob/main/docs/free-claude/PROMPT.md`
2. **Naya Claude chat** kholo (claude.ai, koi bhi account). Web search ON rakho (chat box ke settings/tools me).
3. Prompt paste karo, aur sabse neeche ek line likho: `cs-coaching / delhi` (topic id / state id, dono
   prompt ki list se). Send.
4. Claude search karega aur ek YAML code block dega (file name upar likha hoga, jaise `cs-coaching--delhi.yml`).
   Agar wo "PART 1 done — say continue" bole to `continue` likho → `cs-coaching--delhi--2.yml` milega. Har part
   alag file hai, sab upload karo.
5. **GitHub par upload (ZIP wala tareeka)**: ZIP download karo → computer par **Extract** karo → github.com par
   apna `margdarshan` repo kholo (main page, kisi folder ke andar nahi) → upar **Add file → Upload files** → extract
   hua **poora folder / saari files** drag karo → neeche **Commit changes**. File `inbox` me jaaye ya bahar,
   robot `<topic>--<state>.yml` naam wali file kahin se bhi utha leta hai.
   ZIP na mile to: `inbox` folder → **Add file → Create new file** → naam `cs-coaching--delhi.yml` → code block
   ka text paste → Commit.
6. **Check**: repo ka **Actions** tab → "Inbox build" green ✔ (1–3 min). Phir `inbox/REPORT.md` kholo: kitni rows
   aayi, kaunsi hati (fake link / duplicate). 2–5 min baad page live:
   `https://emargdarshan.com/learn/<finder>/<state>.html`.
   Red ✘ aaye to Actions me us run ko kholo, error copy karke kisi bhi Claude chat ko do (ya Pro aane par Claude Code ko).

Ek hi topic+state dobara karna ho (aur jagah add karne)? Site ka us state ka page kholo, naam copy karo, aur
prompt ke end me likho: `ALREADY LISTED (skip these): <naam>` — phir request line. Duplicate (same naam + city)
waise bhi robot hata deta hai.

## Robot kya check karta hai (taaki galat data site par na jaaye)

- Har `url` / `note_src` khol ke dekhta hai: domain hi nahi hai ya page 404 → row hat jaati hai (Claude ne link
  banaya ho to bhi pakda jaata hai). Jo site robots ko block karti hai (403) wo rakhi jaati hai, report me note.
- "best / top / leading / No. 1" jaise shabd note se hata deta hai. Galat `type` → topic ka default type.
- Same naam + city pehle se hai → skip. City ki spelling pehle wali jaisi kar deta hai.
- Topic ya state galat → file `inbox/rejected/` me, reason REPORT.md me.
- Yeh check **link asli hai ya nahi** pakadta hai, **jagah sach me wahan hai ya nahi** nahi. Isliye kabhi-kabhi
  2–3 random cards khol ke dekh lena (Source button).

## 2 mahine ka plan (Pro ke bina)

**Claude free kitna kar payega (andaza, guarantee nahi):** free plan me har ~5 ghante me limited messages milte
hain, aur web search wale lambe kaam jaldi limit khatam karte hain. Ek chat me realistic: **40–80 asli jagah**
(1–3 parts). Ek account se din me **2–3 state fills**. Aap + 5 dost = 6 accounts →
**roz ~12–18 files → 2 mahine me ~700–1,000 topic×state files**, yaani ~40,000+ nayi listings tak (agar har file
me ~50 asli aaye). Kul combos 148 topics × 36 states ≈ 5,300 hain, isliye **priority se chalo**:

1. **Hafta 1–2 (sabse zyada search hone wale)**: `neet-coaching`, `jee-coaching`, `ca-coaching`, `cs-coaching`,
   `cma-coaching`, `upsc-coaching`, `ssc-coaching`, `banking-coaching`, `state-psc-coaching`, `defence-coaching`
   × top 12 states: uttar-pradesh, maharashtra, bihar, rajasthan, west-bengal, madhya-pradesh, tamil-nadu,
   karnataka, gujarat, delhi, andhra-pradesh, telangana.
2. **Hafta 3–4**: `clat-coaching`, `cuet-coaching`, `ipmat-coaching`, `judiciary-coaching` + colleges
   `bcom-colleges`, `bba-colleges`, `nursing-colleges`, `bpharm-colleges`, `bca-colleges`, `law-colleges`
   × same 12 states.
3. **Hafta 5–6**: sports (`football`, `badminton`, `chess`, `swimming`, `athletics`, `wrestling`, `kabaddi`,
   `hockey`, `boxing`, `cricket`) + arts (`kathak`, `bharatanatyam`, `hindustani-music`, `carnatic-music`) ×
   12 states; aur pehle wale topics × agle 10 states (kerala, odisha, punjab, haryana, jharkhand, assam,
   chhattisgarh, uttarakhand, himachal-pradesh, jammu-kashmir).
4. **Hafta 7–8**: diploma/ITI topics (`diploma-colleges`, `iti-colleges`, …) aur jo states/cities kam reh gaye
   (REPORT.md me "could not cover" wale shehar) — unke liye wahi topic dobara (ALREADY LISTED ke saath).

**Dosto ke saath batwara**: ek shared sheet (Google Sheet) rakho: columns `topic | state | kisne li | file
upload hui? | rows`. Har dost ek row "claim" kare, taaki do log ek hi combo na karein. Sab upload aap khud karo
(ya dost ko repo me collaborator bana do — Settings → Collaborators).

**Rozana routine (aapka ~30 min)**: dosto ki files lo → har file `inbox` me Create new file → Commit → Actions
green dekho → REPORT.md me rows count sheet me likho.

## Jab Claude Pro wapas aaye

- Claude Code me bas likho: `inbox me jo rejected/ hai unko theek karo` ya `STATE FILL: <finder> / <state>`
  (purana runbook `docs/learn-finder/STATE-FILL.md` same files likhta hai).
- Thoda quality check: `inbox/done/` ki files dekh ke random links verify, aur "Source" button wale cards.

## Technical (Claude Code / developer ke liye)

- Topics: `docs/free-claude/topics.yml` (generated, `scripts/build-learn-catalog.mjs`). Topic → finder: live
  finder jo key own karta hai (ca-coaching → `ca`, neet-coaching → `mbbs`), warna topic id hi finder id.
- `scripts/inbox-ingest.mjs` → `scripts/learn-src/local/<finder>/<state>.yml` (+ naya `_data/in/learn/<finder>.yml`
  meta from topic) → `scripts/rebuild-learn.mjs` (learn-src or `learn-src/generic.mjs`, build-learn-finders,
  build-seo-landings, build-learn-catalog, build-nav-mega, build-asset-version).
- GitHub Action: `.github/workflows/inbox.yml` (push to `inbox/*.yml` or `scripts/learn-src/local/**`, or
  "Run workflow"). Needs Actions enabled; it commits with GITHUB_TOKEN and then calls the Pages build API.
- One page per subject × state: `_data/learn_index.yml` `routes` (key → finder) drive the menu 4th column,
  `career-control.html` button, `explorer.html` redirect and `build-seo-landings.mjs` redirect stubs.
