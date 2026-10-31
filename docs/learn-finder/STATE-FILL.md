# State fill runbook — one finder × one state per run (read this, nothing else)

The prompt names a finder and a state, e.g. `STATE FILL: ca / gujarat`. Goal: add the local places the official
registers miss (standalone academies, private classes, regional colleges) to that finder, up to ~100 real ones,
so `learn/<finder>.html` (State + City dropdowns) and `learn/<finder>/<state>[/<city>].html` fill up.

## 0. Setup
- `npm install js-yaml@4 liquidjs` into `<scratchpad>/deps`; use `VERIFY_DEPS=<that dir>` everywhere.
- `node scripts/learn-state.mjs <finder> <state>` — the ONLY way to see what exists (counts per city, every
  existing name, allowed types). Don't open `assets/data/learn/*.json`, `_data/coaching.yml`, `_data/colleges.yml`.
- No finder yet ("NO FINDER")? Make it from the closest live one: copy `_data/in/learn/<near>.yml` meta (id, name,
  phrase, types, subjects, sources), write `scripts/learn-src/<finder>.mjs` that only does
  `rows = localRows('<finder>', [])` + the write/dup checks of `ca.mjs`. Don't add a "Where to learn" button
  anywhere until the finder has listings (finder-link-policy).
- Grep `docs/learn-finder/LOG.md` for the state/finder for fetch tricks. Don't read memory files.

## 1. Collect (5–8 biggest cities of the state; the state's student hubs first)
- Sources, in order: institute's own site / Instagram / YouTube channel → Google Maps or Justdial listing →
  Reddit (r/CAIndia, city subs) and YouTube student reviews for the note.
- A place counts only if one fetchable public page shows it exists in that city. Can't confirm = skip it.
- Honest count. 100 is a ceiling, not a target: 63 real beats 100 padded. Never invent area, results or ranks.
- `note` = one plain sentence that the `note_src` page actually says ("Runs CA Foundation weekend batches",
  "Students on r/CAIndia recommend its Inter Tax classes"). No best / top / No.1 / leading / premier.
- Batch fetches: a small node script in the scratchpad that fetches 20 URLs and prints title + 300 chars each,
  instead of one WebFetch per page.

## 2. Write `scripts/learn-src/local/<finder>/<state>.yml`
```yaml
# <finder> · <state> — hand-researched local places (docs/learn-finder/STATE-FILL.md)
checked: "YYYY-MM-DD"
rows:
  - name: "Exact name as on its board/site"
    city: Ahmedabad            # same spelling as learn-state.mjs prints
    area: "C.G. Road, Navrangpura"
    type: CA coaching          # must be in the finder's types (add a type to the yml if truly new)
    ownership: Private         # Government / Grant-in-Aid / Private
    note: "One sourced sentence."
    note_src: https://…        # page that backs the note
    url: https://…             # own site > official social page > Maps/Justdial listing
    url_label: Official website   # or "Instagram", "Google Maps", "Justdial"
```
Existing name + city is skipped automatically; append to the file on a repeat run, don't rewrite it.

## 3. Build + check
```
VERIFY_DEPS=<deps> node scripts/learn-src/<finder>.mjs     # validates every local row, rewrites the JSON
VERIFY_DEPS=<deps> node scripts/build-learn-finders.mjs
VERIFY_DEPS=<deps> node scripts/verify-site.mjs learn/<finder>.html learn/<finder>/<state>.html
node scripts/learn-state.mjs <finder> <state>               # new count per city
```
Spot-check 5 random rows' links. Don't run `verify-site --all`, don't re-read files after editing.

## 4. Finish
- One line in `docs/learn-finder/LOG.md`: date · finder/state · +N (per city) · sources · gaps · tricks.
- Commit `Learn finder: <finder> <state> state fill (+N)` and push to main.
- Reply in short Hinglish: added count per city, gaps, the page links, and the Gemini summary.
