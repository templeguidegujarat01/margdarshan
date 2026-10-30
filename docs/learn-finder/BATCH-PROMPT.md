# "Where to learn" finder — batch prompt

Paste the block below each time. Change only the first line (how many subjects, or which ones).

```
LEARN FINDER BATCH — next 10 subjects   (or: "subjects: kathak, cricket, mbbs")

Read docs/learn-finder/BATCH-PROMPT.md and _data/in/learn_map.yml first.

1. PICK
   - Take the next subjects with status: todo (or the ones I named). Most-searched first
     (doctor, engineer, CA, cricket, kathak before niche ones).
   - Subjects that would list the same places share ONE finder (doctor + mbbs + neet-ug -> finder "mbbs";
     jee-main + cse -> "btech"). Set `finder:` on each, and if that finder is already live just link it.

2. COLLECT — every real place in India where this is taught, not a "top 10"
   - Go for ALL of them: the aim is the full list (up to 1,000+ when that many exist).
     Start from the official register and take every entry it lists:
     NMC / DCI / INC / PCI / NCISM / NCH (health) · AICTE (engineering, polytechnic, MBA, MCA) · COA (architecture)
     BCI (law) · NCTE (B.Ed / D.El.Ed) · NCVT MIS (ITI) · DGCA (flying schools, AME) · DG Shipping (maritime)
     NCHMCT / IHMs (hotel) · ICAR / VCI (agri, vet) · UGC / university departments (arts, science, music, dance)
     SAI (STCs, NCOEs, Khelo India centres, accredited academies) · national federations' affiliated academies
     Sangeet Natak Akademi / university performing-arts departments / state academies (dance, music)
     Coaching: each brand's own centre locator (one entry per real centre).
   - Each listing needs: name, type, ownership, state, city, address or area, official url, source id, checked date.
     Add fees, seats, intake, approval number, affiliation, timings only when the source shows them.
   - Never invent, guess or pad. No listing without a source. If a register is blocked, use Wayback / Edge tricks
     from memory, and say so; if still blocked, list what is verified and record the gap.
   - Write the honest count: "We found 412 verified kathak schools", not "1000".
   - No paid-style claims ("best", "No.1", "top"). Order by official rank where one exists (NIRF, NCOE status),
     otherwise by state then city. "Top N" headings only when an official ranking backs them.

3. DATA
   - One file per finder: _data/in/learn/<finder>.yml (meta, sources, filters, listings).
   - Big lists also go to assets/data/learn/<finder>.json so the page loads fast and filters in the browser.

4. PAGES (same design system as the site, India top menu, no sidebar, sources fold, system fonts)
   - learn/<finder>.html: hero (what you learn, how many places, which official registers), filter bar
     (state, city, type, ownership, fees band, mode), big listing cards (name, city, type badges, key facts,
     "Official site" button), map-free, mobile-first, pagination / "load more", search box.
   - learn/<finder>/<state>.html for each state with 3+ listings (SEO pages: "kathak classes in Gujarat").
     City pages learn/<finder>/<state>/<city>.html when a city has 10+.
   - Titles and descriptions in the words people search: "Kathak classes in Ahmedabad", "cricket academy in Pune",
     "MBBS colleges in Gujarat", "CA coaching in Delhi". Use fit-seo rules (title <= 60, desc <= 160).
   - learn/index.html: the hub, grouped by the 22 families in learn_map.yml, only live finders shown.

5. CONNECT
   - Every subject page in the batch gets a "Where to learn" button to its finder (control bar / context deck).
     Follow finder-link policy: no button until the finder has verified listings.
   - Add the finder pages to _data/search.yml, sitemap, and the menu (build-nav-mega.mjs).
   - Old colleges-*.html / coaching-*.html pages stay; link them both ways with the new finder.

6. CHECK, COMMIT, PUSH
   - Set status: live on the batch subjects, rerun scripts/build-learn-map.mjs, build-seo-landings.mjs,
     build-nav-mega.mjs, then verify-site (VERIFY_DEPS = js-yaml 4 + liquidjs deps in this session's scratchpad).
   - Spot-check 10 random listings against their source. Check pages at 375px and 1280px, light and dark.
   - Commit + push this batch. Save a memory note (sources that worked, blocked ones, counts).
   - End with: table of subject -> finder -> verified listings, gaps, and the Gemini handoff summary.
```
