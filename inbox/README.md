# inbox — yahan state-fill files upload karo

Is folder me `<topic>--<state>.yml` files daalo (jaise `cs-coaching--delhi.yml`), jo kisi bhi Claude chat ne
`docs/free-claude/PROMPT.md` se banayi ho. Commit karte hi GitHub Action **"Inbox build"** chalta hai:

1. har row aur har link check hota hai (fake / dead link wali row hat jaati hai),
2. rows `scripts/learn-src/local/<finder>/<state>.yml` me chali jaati hain,
3. pages, menu, search, career-page button sab dobara bante hain,
4. ek commit main par aata hai aur 2–5 minute me site update.

Upload ki hui file `inbox/done/` (ya kuch galat ho to `inbox/rejected/`) me chali jaati hai.
Har run ka result: `inbox/REPORT.md`. Poora guide: `docs/free-claude/README.md`.

Do not put anything else here: every `.yml`, `.yaml` or `.txt` file in this folder is read as a state fill.
