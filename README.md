# Education Margdarshan

Free career guidance for students, live at **[emargdarshan.com](https://emargdarshan.com)**.
Every page explains one career, course, exam, college list or sport in plain English and links each fact to its
official source. Free, with no sign-up.

| Edition | Start page | What it covers |
|---|---|---|
| India | `india.html` | 152 career guides, entrance and government exams, state exam hubs, sports, colleges and coaching finders, journey blueprints, roadmaps |
| USA | `us/` | Career clusters, careers with BLS pay, licensing and exams, all 50 states + DC, colleges, trades |
| UK | `uk/` (beta) | GCSE → A level / apprenticeship → degree routes, careers with ASHE pay |
| Study abroad | `study-abroad/` | 15 countries for Indian students: costs, visas, tests |

## How the site is built

- **Jekyll on GitHub Pages.** A push to `main` rebuilds the site in a few minutes. There is no build server and
  no npm project; the only plugin is `jekyll-redirect-from`.
- **One shell for every page.** `_layouts/default.html` owns the `<head>`, top menu, breadcrumb, footer and scripts.
  A page supplies front matter plus its own `<main>`.
- **Data first.** Most pages are rendered from YAML in `_data/` through a template in `_includes/`
  (for example `_data/in/careers/ca.yml` + `_includes/in-career.html` → `ca.html`).
- **Generated files.** Menus, roadmaps, finder pages, SEO list pages, journey pages and the asset hash are written by
  the scripts in `scripts/`. A generated file says so at the top; change its data and rerun the script instead of
  editing it.
- **One stylesheet, one script.** `assets/css/main.css` (system fonts, light and dark themes) and
  `assets/js/site.js`. Both carry `?v=<hash>` from `_data/asset_version.yml`.

## Checks

The scripts need only `js-yaml@4` and `liquidjs@10`:

```sh
npm install --prefix /tmp/deps --no-save js-yaml@4 liquidjs@10
export VERIFY_DEPS=/tmp/deps

node scripts/verify-site.mjs --all      # renders every page: links, JSON-LD, FAQ, sitemap, titles (≈ 9 min)
node scripts/check-in-data.mjs          # India data
node scripts/check-us-data.mjs          # USA data
node scripts/check-search.mjs           # site search index
node scripts/build-asset-version.mjs    # rerun after editing main.css, site.js or the menus
```

Each `build-*.mjs` script also takes `--check` (except `build-roadmaps.mjs`), which fails if its output is stale.

## Adding content without a developer

Two GitHub Actions turn files made in any Claude chat into live pages, with every link checked first. If a check
fails, nothing is published and the upload is parked in `inbox/rejected/`.

- **Where-to-learn lists** (one subject × one state): `docs/free-claude/README.md`, workflow `.github/workflows/inbox.yml`.
- **Journey blueprints** (one career, class by class): `docs/free-claude/JOURNEY-README.md`, workflow
  `.github/workflows/journey-inbox.yml`.

Both have an "undo" workflow that removes one upload.

## More

- `docs/OWNER-HANDBOOK.md`: where each kind of data lives, what each script does, what to watch in Search Console,
  and the pending list.
- `docs/learn-finder/`, `docs/us-edition/`, `docs/global-editions/`: notes for those parts of the site.
