# Phase 2 — Global UX Research + Design System Proposal

Date: 2026-10-07 · Builds on `PHASE-1-AUDIT.md`.
**Live preview:** `https://emargdarshan.com/design-system/` (`design-system/index.html`). It is noindex,
not in the sitemap, not in search and not linked from the nav. It renders every proposed component with
real `_data/us` data, in light and dark, and from 375 px up.

Nothing on existing pages changed: the full-site render is byte-identical to the Phase 1 baseline
except for the new preview page. Every preview style is scoped to `.ds-preview` and uses new `md-*`
class names.

---

## 1. Research → principles

| Source / reference | What it says | What Margdarshan takes from it |
|---|---|---|
| Nielsen Norman Group, *Progressive Disclosure* | Show "only a few of the most important options" first; **at most 2 disclosure levels**, because beyond that "users often get lost"; label controls so users know what they will find. | One disclosure level inside a page (a "Show 2 more" / source chip), and one more level = a separate page (Salary). Never accordion inside accordion. Disclosure labels say what they reveal ("Show 2 more", "Salary by state"), not "Read more". |
| MDN, Popover API | Baseline **2025** ("newly available"); some older devices vary; hidden popovers are `display:none`. | Source chips use native `<details>`. It works in every browser, including the older Android browsers common in India, with no JS. JS only adds "one open at a time", outside-click and Escape. |
| W3C WCAG 2.2, SC 2.5.8 Target Size (AA) | Pointer targets at least **24×24 CSS px** (with exceptions); 2.5.5 Enhanced is stricter. | Source chips are 28 px tall. Selects, disclosure toggles and sub-nav links are 44 px tall. |
| dataviz method (stat tiles, hero figures) | Big standalone numbers use the body sans with **proportional figures**; **tabular figures only in columns**; no decorative serif or display face for numbers; one hero figure per view; text uses text tokens, not series colour. | Stat values move from JetBrains Mono to Hind 700. Table columns get `tabular-nums`. The percentile bar uses one hue (gold) plus a neutral median tick, with the values printed as text. |
| BLS OOH / O\*NET page structure (studied, not copied) | OOH splits each occupation into tabs (Summary, What they do, Work environment, How to become one, Pay, Outlook …); O\*NET leads with a summary, then detail reports. | The summary-first pattern is right, but tabs hide content from scanning and from search engines. Margdarshan uses an answer-first header plus a short overview page, and gives deep data its own URL (Salary) only when the data earns it. |
| BLS Public Data API (checked live) | OEWS May 2025 national **25th and 75th** percentiles are available (series `OEUN…12` / `…14`); software developers: 10th $82,460 · 25th $105,210 · median $135,980 · 75th $171,980 · 90th $214,670; OEWS employment 1,687,890; mean $148,100. 10th, median and 90th match the stored `occupation_details.yml` values. | The five-number pay range is feasible for every occupation from one official source, which confirms the Phase 4 schema direction. |

**Design principles (the "feel" answer):** premium comes from *restraint and rhythm*, not decoration:
1. **Answer first.** Every page shows what it is, the key numbers and the next step in the first phone screen.
2. **Three tiers per page:** primary (header + stats), secondary (roadmap, top roles), supporting (tables, FAQ, notes) — and they *look* different.
3. **Provenance on the number, not in a bibliography.** A small chip next to the figure.
4. **Fewer, calmer sizes.** 7 type steps, one spacing scale, 4 breakpoints.
5. **No library for visuals.** CSS and inline SVG only; values always also in text.
6. **Same brand.** Ink, gold, Fraunces, Hind stay; the brand is not the problem — the inconsistency is.

---

## 2. Typography

| Token | Size | Face / weight | Use |
|---|---|---|---|
| `--fs-display` | clamp(32 → 44 px) | Fraunces 600, lh 1.1 | Page title (h1) |
| `--fs-h2` | clamp(24 → 32 px) | Fraunces 600, lh 1.2 | Section heading |
| `--fs-h3` | 19 px | **Hind 700** | Card / sub-heading (sans for UI clarity) |
| `--fs-body` | 17 px | Hind 400, lh 1.6, max 68ch | Reading text |
| `--fs-small` | 15 px | Hind 400 | Notes, table cells, secondary text |
| `--fs-label` | 13 px | Hind 600, sentence case | Labels, metadata. **Minimum text size.** |
| `--fs-stat` | clamp(24 → 30 px) | Hind 700, proportional figures | Key numbers |

- Uppercase only for the eyebrow (one per section). Labels move from UPPERCASE mono to sentence case.
- Today there are 56 font sizes; Phase 5 maps them onto these 7 (plus 12 px for chips only).
- JetBrains Mono: proposed to be dropped (saves one font family request). Mono stays available for
  code only if a future page needs it. **Owner decision.**
- Font loading (Phase 5): metric-matched fallback `@font-face` (`size-adjust`, `ascent-override`) for
  Fraunces → Georgia and Hind → system sans to cut font-swap layout shift.

## 3. Spacing, grid, breakpoints

- **Spacing scale (4-based):** `--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 24 · `--sp-6` 32 · `--sp-7` 48 · `--sp-8` 64 px.
- **Section rhythm:** `--section-y` = clamp(40 → 64 px). It replaces the five conflicting `.block`
  paddings (4.5 / 4.2 / 4 / 3.4 rem, defined in five places in `main.css`).
- **Container:** keep 1180 px; prose measure 68ch.
- **Breakpoints (4):** 640 (large phone → two columns), 768 (tablet), 1024 (desktop shell, sidebar
  rail), 1440 (wide; "On this page" column). These replace about 25 ad-hoc values.
- **Grid:** no 12-column framework. Use content grids: `auto-fit/minmax` for equal items and named
  Bento templates (`2fr 1fr`) for hierarchy.

## 4. Color, borders, radius, elevation

- **Colors:** current tokens kept as they are (ink, gold, teal, paper, surface, text, text-muted, line).
  New tokens: `--surface-2` (raised: inputs, open chips, secondary tiles), `--line-strong` (interactive
  borders), `--pos` (positive outlook; always paired with a sign and text, never colour alone).
- **Radius:** keep `--radius-sm` 9 · `--radius-md` 16 · `--radius-lg` 24 + pill. Phase 5 replaces the 17
  other ad-hoc radius values with these tokens.
- **Shadows:** keep the 3 tokens; use shadow only for floating layers (pop-over, sheet, drawer,
  dropdown). Cards use borders, not shadows: calmer, and identical in both themes.

## 5. Dark mode strategy

Not an inversion. Elevation is expressed by **lighter surfaces**, not stronger shadows:
`--paper` #0B1A22 → `--surface` #122633 → `--surface-2` #183142, borders white at 14% / 22%.
Accents shift to their brighter dark-mode steps (gold #E8A33D, `--pos` #5FC3A8) for contrast on navy.
Checked in the preview: source pop-over, stat tiles, roadmap markers, comparison table, select.
Phase 16 runs a measured contrast pass on every token pair.

## 6. Components

| Component | Pattern | Notes |
|---|---|---|
| **`md-answer`** (answer-first header) | eyebrow · h1 · one-sentence answer (≤ 3 lines) · 4 stat tiles · one primary button + one text link | Replaces the hero with its 6-line intro and two stacked full-width buttons. On a 375 px phone the stats appear in the first screen. |
| **`md-stat`** | label (sentence case) · value · optional note · optional source chip | One tile type for India and USA (₹ or $ from `regions.yml → currency_symbol`). |
| **`md-src`** (source chip) | `<details>`: summary "BLS · May 2025" → pop-over with source, publisher, data period, checked date and an official link. Desktop: anchored pop-over that flips to the right edge if needed. **Phones: bottom sheet with a dimmed backdrop.** | Replaces the bottom "Where these facts come from" section and the repeated "Source:" sentences. The page ends with one data-note line linking to a single methodology page (Phase 7). Accessible: native disclosure, Escape returns focus to the chip. |
| **`md-paybar`** | 10/25/50/75/90 percentile range: track = 10th → 90th, gold band = middle half, dark tick = median; the five values are printed below as a `<dl>` | No chart library. The bar is `aria-hidden`; the text carries the data. |
| **`md-geo`** | `<select>` United States → states (→ metros later) updates median / mean / jobs (`aria-live`) | The HTML ships national figures + top states (crawlable, works without JS); the full 50-state and metro set would come from a small JSON file (static data API, Phase 4 decision). |
| **`md-road`** (roadmap v2) | One `<ol>`, any number of steps; step kinds: `stage`, `gate` (exam, rounded-square marker), `branch` (two pills, e.g. M.D. → USMLE / D.O. → COMLEX-USA), `license` (filled marker), `optional` (dashed marker). **≤ 5 steps: horizontal from 1024 px; longer routes stay vertical everywhere.** | Replaces the fixed 5-step `roadmap-flow` for new pages; the old include keeps working for India. Text stays selectable; the counter numbers are CSS. |
| **`md-cmp`** (comparison) | ≤ 6 rows; a row both sides share is shown once across both columns; on phones each row becomes a two-column card | No sideways scrolling, no 30-row tables. |
| **`md-bento` / `md-tile`** | `2fr 1fr` template: one primary tile spans two rows, two supporting tiles | Used only where the hierarchy is real. |
| **`md-more`** | `<details>` "Show N more" | The single in-page disclosure level. |
| **`md-subnav`** | Overview · Salary · Colleges, horizontal scroll on phones, `aria-current` | Shown only when a career really has subpages. Not a second sidebar. |

**Card system:** one base (`background: --surface; border: 1px --line; radius --radius-md`) shared by
`md-stat`, `md-tile`, `md-pay` and the existing `.cx-card` family. Existing India card classes keep
their names. Phase 5 makes them share the base instead of renaming them.

**Icon strategy:** keep inline SVG (24 viewBox, 2–2.4 stroke, `currentColor`, `aria-hidden`), as the
site does today. No icon font or sprite request. Size always set in markup (no layout shift).

**Filter strategy:** native `<select>` for single choices (accessible, mobile-native picker), chips for
2–6 toggles, search box only above 30 items. Filters go in one row above the data they change. Results
update in place with `aria-live`; URL query parameters keep a filter shareable (as the colleges finder
already does).

**Mobile strategy:** designed at 375 px first. Stats in 2 columns, roadmap vertical, comparison as row
cards, source as bottom sheet, sub-nav scrolls sideways, every control at least 24 px (44 px for
primary controls). Verified in the preview: no horizontal overflow at 375 px, light and dark.

---

## 7. What should NOT change

- Brand colours, logo, Fraunces + Hind, gold accent, the calm green-grey paper.
- App shell: sidebar rail and drawer, top bar, search overlay, region switcher (`<details>`), breadcrumb.
- `.table-simple` + `.table-wrap` (already robust).
- The region engine, URL structure, `md-region` and the other `md-` storage keys.
- India page content and URLs; generated roadmap pages (edit their sources only).
- The existing class names used by about 398 India pages: new primitives are added next to them, and
  old classes are only re-based onto shared tokens.

## 8. How this reaches production (Phase 5 plan)

1. Move the tokens from `.ds-preview` to `:root` / `[data-theme="dark"]` in `main.css`. Additive only.
2. Add the `md-*` component CSS to a clearly marked "Global components" section of `main.css` (still
   one cached file).
3. Re-base duplicated rules (5× `.page-hero`, 5× `.block`) onto the tokens. **Visible change on India
   pages:** run the full render diff and screenshots for the representative India pages before and after.
4. Fix `.reveal` (only hidden when JS is running), move `scripts.html` into `assets/js/site.js` (defer),
   and add font fallbacks.
5. Remove the `/design-system/` preview or keep it as the living style guide (owner choice).

## 9. Quality gate (Phase 2)

1. **Researched:** NN/g progressive disclosure, MDN Popover API support, WCAG 2.2 target size, the
   dataviz method for stat tiles and figures, BLS/O\*NET page structure, the BLS Public Data API
   (percentiles).
2. **Discovered:** 25th/75th percentiles are available from the official API; Popover is too new for
   the India audience, so `<details>` is the safer base; `.page-hero` and `.block` are each defined
   five times with different values.
3. **Changed:** added the preview page `design-system/index.html` and this document.
4. **Why:** decisions about type, sources and roadmap are easier to make on real rendered components.
5. **Files:** `design-system/index.html` (new, noindex), `docs/global-platform/PHASE-2-DESIGN-SYSTEM.md` (new).
6. **Could affect:** nothing existing. Full render diff vs the Phase 1 baseline: only the new page differs.
7. **Tested:** `verify-site.mjs --all` (only the 4 known pre-existing warnings); headless Chrome at
   1440 (light and dark) and 375 px: no overflow; source chip opens as an anchored pop-over (desktop)
   and a bottom sheet (phone); Escape closes it; the state selector shows California $174,410 /
   $186,770 / 284,390 from data; no console errors.
8. **Unresolved / owner decisions:**
   - Drop JetBrains Mono (numbers in Hind) — yes or no?
   - h3 in Hind (sans) instead of Fraunces — yes or no? (This affects the look of India pages in Phase 5.)
   - Source chips + one methodology page instead of per-page source lists — approve?
   - Keep `/design-system/` as a living style guide after Phase 5, or remove it?
   - Phase 1 questions still open: career model (overview + optional salary/colleges pages), static
     JSON data API, deleting the 2 unused includes.
9. **Better than the brief:** `<details>` chips instead of a JS popover or modal; one in-page
   disclosure level (NN/g); vertical-only roadmaps for long regulated routes instead of a cramped
   horizontal line; the comparison table merges identical cells.
10. **Before Phase 3:** the IA phase will turn the "one page vs hub" rule into explicit, testable
    criteria and a URL map for India, USA and a future third country.

Known preview limitation: on phones the back-to-top button sits over the bottom sheet's corner. It
will get a higher sheet z-index or be hidden while a sheet is open in the production version.
