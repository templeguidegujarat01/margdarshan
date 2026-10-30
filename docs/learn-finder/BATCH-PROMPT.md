# Learn finder runbook (read this, nothing else, at the start of a run)

Goal: one "where to learn" finder per subject group — EVERY verified place in India that teaches it
(colleges, coaching centres, academies, gurukuls, ITIs…), in a big-listing UI, with state/city SEO pages.

## 0. Setup (each fresh session)
- `npm install js-yaml@4 liquidjs` into `<this session's scratchpad>/deps`. Use `VERIFY_DEPS=<that dir>` everywhere.
- `node scripts/learn-next.mjs` tells you what to do. It prints UNFINISHED work first, otherwise the NEXT FINDER.

## 1. Token rules
- Do NOT read `_data/in/learn_map.yml`, `_data/colleges.yml`, `_data/coaching.yml`, `_data/search.yml` or other big
  files. Use `learn-next.mjs`, grep, or small node one-liners that print counts.
- Do NOT read memory files beyond MEMORY.md unless a step fails. Fetch tricks live in `docs/learn-finder/LOG.md` (grep it).
- Never hand-type listings. Fetch the register (API / JSON / CSV / HTML / PDF) and turn it into YAML with a script
  kept in `scripts/learn-src/<finder>.mjs`, so it can be rerun later.
- Don't re-read files after editing. Don't run `verify-site --all` (>10 min); run the targeted checks in step 5.

## 2. Size of a run
- One finder per run. If it ends below ~300 listings and the context is still light, take the next one (3 at most).
- If the context gets heavy partway: save the data, keep status `building`, commit, and stop. The next run resumes.

## 3. Collect (honest, complete)
- Start from the official register printed by `learn-next.mjs`, then add brand centre locators and federation or
  academy lists. Take EVERY entry; the aim is the full list (1,000+ when that many exist).
- Each listing: name, type, ownership, state, city, area/address, url (official), source id, checked date.
  Add fees, seats, approval no., affiliation, mode or timings only when the source shows them.
- No invented or guessed entries. No "best / No.1 / top" unless an official ranking (NIRF, NCOE) backs it.
  Print the true count ("412 verified kathak schools").
- Blocked source: try the Wayback / Edge tricks in LOG.md. Still blocked = record the gap, don't fill it.

## 4. Build
- Data: `_data/in/learn/<finder>.yml` (meta, sources, filters, the subjects it serves) +
  `assets/data/learn/<finder>.json` (listings, loaded by the page and filtered in the browser).
- If `scripts/build-learn-finders.mjs` doesn't exist yet, write it in the first run. It generates:
  - `learn/<finder>.html`: hero (what, how many places, which registers), sticky filter bar (state, city, type,
    ownership, fees, mode), search box, listing cards (name, city, badges, key facts, Official site button),
    load-more, sources fold. Site design system, India top menu, no sidebar, mobile-first, light and dark.
  - `learn/<finder>/<state>.html` (3+ listings) and `learn/<finder>/<state>/<city>.html` (10+ listings).
    Titles in the words people search: "Kathak classes in Ahmedabad", "Cricket academy in Pune",
    "MBBS colleges in Gujarat". Title <= 60 and desc <= 160 via `scripts/lib/seo-fit.mjs`.
  - `learn/index.html`: hub of live finders grouped by family.
  - It updates the sitemap and the search entries for these pages.
- Connect: each subject page served gets a "Where to learn" button to its finder (career control bar / context deck /
  sport and exam page). Never add one before verified listings exist. Link the old colleges-*/coaching-* pages both ways.

## 5. Finish
- `node scripts/learn-next.mjs --set <id,id> live <finder>`, then `build-learn-map.mjs`, `build-learn-finders.mjs`,
  `build-nav-mega.mjs`. Check with `build-learn-map.mjs --check` and `verify-site.mjs` on the changed pages.
- Spot-check 5 random listings against their source. Look at one finder page at 375px and 1280px.
- Add one line to `docs/learn-finder/LOG.md`: date · finder · subjects · count · sources · blocked · tricks.
- Commit + push. Reply in short Hinglish: finder, subjects, verified count, gaps, next finder, and the Gemini summary.
