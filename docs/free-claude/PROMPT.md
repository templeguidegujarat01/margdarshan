<!--
  Owner: copy EVERYTHING below the line "COPY FROM HERE" into a NEW Claude chat (any account, free is fine,
  web search ON), then type your request on the very last line, e.g.   cs-coaching / delhi
  The topic list and the state list are filled in by scripts/build-learn-catalog.mjs — don't edit them by hand.
  Full guide (Hinglish): docs/free-claude/README.md
-->

==================== COPY FROM HERE ====================

# Task: list real places to learn — one topic, one Indian state

You are helping a free Indian career-guidance website (emargdarshan.com). It shows students where they can learn
a subject in their state: coaching centres, colleges, academies, classes. Every listing must be a REAL place that a
public web page shows. The last line of this message is my request: one **topic id** and one **state id**, for
example `cs-coaching / delhi`.

## What to do

1. Use web search a lot. Look in the state's capital and its 6–10 biggest cities first, then district towns.
   Good sources: the place's own website, its Instagram / Facebook / YouTube page, Google Maps, Justdial, Sulekha,
   Collegedunia, Shiksha, newspapers, Reddit / Quora threads, and official lists (government, regulator, university,
   state sports department, SAI, ICAI / ICSI / ICMAI branch pages).
2. List a place ONLY if a page you actually opened shows it exists in that city. Never invent a name, address,
   link, phone, result, rank or fee. Not sure → skip it. 40 real places beat 100 doubtful ones.
3. Aim for as many real places as you can find, up to 100. Include government and free options too (state-run
   free coaching, government colleges, SAI / state sports centres) with `ownership: Government`.
4. A brand with branches in several cities: one row per city, name like `"Brand Name — City"`.
5. `note` = ONE plain sentence that the `note_src` page actually says (what it teaches, which batches, for whom).
   Never use ranking words: best, top, leading, No. 1, premier, famous, renowned.
6. `url` = the place's own website, else its official social page, else its Google Maps / Justdial page.
   Full links starting with https:// that you saw — no shortened or guessed links. Our robot opens every link and
   throws away rows whose link does not exist.
7. `type` must be one of the types listed for the topic below (copy it exactly). `ownership` is one of:
   Government, Grant-in-Aid, Statutory body, Deemed, Private.
8. City names: the common English spelling (Ahmedabad, Vadodara, Bengaluru, Thiruvananthapuram).

## Output — exactly this

- ONE YAML code block, nothing else inside it. Its file name is `<topic>--<state>.yml` (two hyphens), e.g.
  `cs-coaching--delhi.yml`. Write the file name on the line just above the code block.
- If you can create files: ALSO create that file inside a folder named `inbox` and give me a ZIP of it
  (`inbox/cs-coaching--delhi.yml`).
- If you run out of room: stop after a complete row and write `PART 1 done — say "continue"`. When I say
  continue, give a NEW file `<topic>--<state>--2.yml` (then `--3`, …) with the same header and ONLY new rows.
- Then, below the code block, one short line: how many places per city, and which big cities you could not cover.

```yaml
topic: cs-coaching            # topic id from the list below, exactly
state: delhi                  # state id from the list below, exactly
checked: "2026-11-05"         # today's date
rows:
  - name: "Exact name as on its board or website"
    city: "New Delhi"
    area: "Laxmi Nagar, near metro station"       # locality / road as the page shows it
    type: "CS coaching"                           # one of the topic's types
    ownership: "Private"
    note: "Its website lists CSEET, Executive and Professional batches in Hindi and English."
    note_src: "https://the-page-that-says-that.example"
    url: "https://its-own-site-or-social-page.example"
    url_label: "Official website"                 # or Instagram / Facebook / Google Maps / Justdial
```

## Topic ids (use the id in backticks; types after it)

<!-- topics:start -->
### Coaching (exams & professional courses)

- `neet-coaching` — NEET-UG coaching — types: "NEET coaching"
- `jee-coaching` — JEE Main & Advanced coaching — types: "JEE coaching"
- `cuet-coaching` — CUET-UG coaching — types: "CUET coaching", "Official / govt centre"
- `ca-coaching` — CA coaching — types: "ICAI office", "CA coaching"
- `cs-coaching` — CS coaching — types: "CS coaching", "Official / govt centre"
- `cma-coaching` — CMA coaching — types: "CMA coaching", "Official / govt centre"
- `clat-coaching` — CLAT & AILET coaching — types: "CLAT coaching", "Official / govt centre"
- `design-coaching` — NIFT / NID Design Entrance coaching — types: "Design entrance coaching", "Official / govt centre"
- `nata-coaching` — NATA (B.Arch) coaching — types: "NATA coaching", "Official / govt centre"
- `ssc-coaching` — SSC coaching — types: "SSC coaching", "Official / govt centre"
- `banking-coaching` — Bank Exam coaching — types: "Bank exam coaching", "Official / govt centre"
- `upsc-coaching` — UPSC Civil Services coaching — types: "UPSC coaching", "Official / govt centre"
- `acca-coaching` — ACCA coaching — types: "ACCA coaching", "Official / govt centre"
- `cfa-coaching` — CFA coaching — types: "CFA coaching", "Official / govt centre"
- `frm-coaching` — FRM coaching — types: "FRM coaching", "Official / govt centre"
- `cpa-coaching` — US CPA coaching — types: "US CPA coaching", "Official / govt centre"
- `actuarial-coaching` — Actuarial Science (ACET) coaching — types: "Actuarial exam coaching", "Official / govt centre"
- `ipmat-coaching` — IPMAT & JIPMAT coaching — types: "IPMAT coaching", "Official / govt centre"
- `judiciary-coaching` — Judiciary Exam coaching — types: "Judiciary exam coaching", "Official / govt centre"
- `defence-coaching` — Defence Exam (NDA / CDS / AFCAT) coaching — types: "Defence exam coaching", "Official / govt centre"
- `hotel-coaching` — NCHMCT JEE coaching — types: "Hotel management entrance coaching", "Official / govt centre"
- `state-psc-coaching` — State PSC & state govt exam coaching — types: "State PSC coaching", "Official / govt centre"

### Colleges (degree, diploma, ITI)

- `mbbs-colleges` — MBBS colleges — types: "Medical college"
- `bds-colleges` — BDS colleges — types: "BDS college", "University"
- `bams-colleges` — BAMS colleges — types: "BAMS college", "University"
- `bhms-colleges` — BHMS colleges — types: "BHMS college", "University"
- `nursing-colleges` — B.Sc Nursing colleges — types: "B.Sc Nursing college", "University"
- `btech-colleges` — B.Tech colleges — types: "Engineering college"
- `bca-colleges` — BCA colleges — types: "BCA college", "University"
- `bdes-colleges` — B.Des colleges — types: "B.Des college", "University"
- `bpharm-colleges` — B.Pharm colleges — types: "B.Pharm college", "University"
- `bpt-colleges` — BPT colleges — types: "BPT college", "University"
- `ot-colleges` — BOT colleges — types: "BOT college", "University"
- `optometry-colleges` — B.Optom colleges — types: "B.Optom college", "University"
- `mlt-colleges` — B.Sc MLT colleges — types: "B.Sc MLT college", "University"
- `radiology-colleges` — B.Sc Radiology & Imaging colleges — types: "B.Sc Radiology & Imaging college", "University"
- `aslp-colleges` — BASLP colleges — types: "BASLP college", "University"
- `nutrition-colleges` — Nutrition & Dietetics colleges — types: "Nutrition & Dietetics college", "University"
- `biotech-colleges` — Biotechnology colleges — types: "Biotechnology college", "University"
- `genetics-colleges` — Genetics colleges — types: "Genetics college", "University"
- `microbiology-colleges` — Microbiology colleges — types: "Microbiology college", "University"
- `envsci-colleges` — Environmental Science colleges — types: "Environmental Science college", "University"
- `forensic-colleges` — Forensic Science colleges — types: "Forensic Science college", "University"
- `agri-colleges` — B.Sc Agriculture colleges — types: "B.Sc Agriculture college", "University"
- `bcom-colleges` — B.Com colleges — types: "B.Com college", "University"
- `bba-colleges` — BBA / BMS colleges — types: "BBA / BMS college", "University"
- `economics-colleges` — Economics & Data Analytics colleges — types: "Economics & Data Analytics college", "University"
- `actuarial-colleges` — Actuarial Science colleges — types: "Actuarial Science college", "University"
- `ba-colleges` — BA (Humanities) colleges — types: "BA college", "University"
- `bjmc-colleges` — BJMC / Journalism colleges — types: "BJMC / Journalism college", "University"
- `law-colleges` — BA LLB (Integrated Law) colleges — types: "BA LLB college", "University"
- `barch-colleges` — B.Arch colleges — types: "B.Arch college", "University"
- `bfa-colleges` — BFA / Visual Arts colleges — types: "BFA / Visual Arts college", "University"
- `performing-colleges` — Performing Arts colleges — types: "Performing Arts college", "University"
- `animation-colleges` — Animation & VFX colleges — types: "Animation & VFX college", "University"
- `photography-colleges` — Photography & Film colleges — types: "Photography & Film college", "University"
- `hotel-colleges` — Hotel Management (BHM) colleges — types: "Hotel Management college", "University"
- `tourism-colleges` — Travel & Tourism colleges — types: "Travel & Tourism college", "University"
- `bsw-colleges` — BSW colleges — types: "BSW college", "University"
- `libsci-colleges` — Library Science colleges — types: "Library Science college", "University"
- `bed-colleges` — B.Ed colleges — types: "B.Ed college", "University"
- `diploma-colleges` — Polytechnic Diploma colleges — types: "Polytechnic", "University"
- `iti-colleges` — ITI (all trades) colleges — types: "ITI", "University"
- `diploma-mech-colleges` — Mechanical Diploma colleges — types: "Polytechnic", "University"
- `diploma-civil-colleges` — Civil Diploma colleges — types: "Polytechnic", "University"
- `diploma-cse-colleges` — Computer / IT Diploma colleges — types: "Polytechnic", "University"
- `diploma-ee-colleges` — Electrical / Electronics Diploma colleges — types: "Polytechnic", "University"
- `dpharm-colleges` — D.Pharm colleges — types: "D.Pharm college", "University"
- `gnm-colleges` — GNM Nursing colleges — types: "GNM Nursing college", "University"
- `dmlt-colleges` — DMLT colleges — types: "DMLT college", "University"
- `dradio-colleges` — Radiography Diploma colleges — types: "Diploma institute", "University"
- `dhotel-colleges` — Hotel Management Diploma colleges — types: "Diploma institute", "University"
- `dagri-colleges` — Agriculture Diploma colleges — types: "Diploma institute", "University"
- `dfashion-colleges` — Fashion Design Diploma colleges — types: "Diploma institute", "University"
- `dinterior-colleges` — Interior Design Diploma colleges — types: "Diploma institute", "University"
- `danimation-colleges` — Diploma in Animation & Multimedia colleges — types: "Diploma institute", "University"
- `dbm-colleges` — Business Management Diploma colleges — types: "Diploma institute", "University"
- `dfood-colleges` — Food Technology Diploma colleges — types: "Diploma institute", "University"
- `iti-electrician-colleges` — ITI Electrician colleges — types: "ITI", "University"
- `iti-fitter-colleges` — ITI Fitter (CTS) colleges — types: "ITI", "University"
- `vet-colleges` — Veterinary (B.V.Sc) colleges — types: "Veterinary college", "University"
- `fisheries-colleges` — Fisheries (B.F.Sc) colleges — types: "Fisheries college", "University"
- `forestry-colleges` — B.Sc (Hons) Forestry colleges — types: "B.Sc (Hons) Forestry college", "University"
- `geology-colleges` — Geology colleges — types: "Geology college", "University"
- `statistics-colleges` — Statistics colleges — types: "Statistics college", "University"
- `foodtech-colleges` — Food Technology colleges — types: "Food Technology college", "University"
- `marine-colleges` — B.Tech Marine Engg / B.Sc Nautical Science colleges — types: "B.Tech Marine Engg / B.Sc Nautical Science college", "University"
- `pilot-colleges` — Commercial Pilot Training (DGCA-approved FTO) colleges — types: "Flying school", "University"
- `ame-colleges` — Aircraft Maintenance Engineering (AME) colleges — types: "AME institute", "University"
- `perfusion-colleges` — Perfusion Technology colleges — types: "Perfusion Technology college", "University"
- `bpo-colleges` — BPO (Prosthetics & Orthotics) colleges — types: "BPO college", "University"
- `nmt-colleges` — B.Sc Nuclear Medicine Technology colleges — types: "B.Sc Nuclear Medicine Technology college", "University"

### Sports

- `wrestling` — Wrestling academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `football` — Football academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `chess` — Chess academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `cricket` — Cricket academies & clubs — types: "High-performance centre", "State association", "Association academy", "District association", "Cricket club"
- `hockey` — Hockey academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `kabaddi` — Kabaddi academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `athletics` — Athletics academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `boxing` — Boxing academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `badminton` — Badminton academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `shooting` — Shooting academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `swimming` — Swimming academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `archery` — Archery academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `weightlifting` — Weightlifting academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `table-tennis` — Table Tennis academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `basketball` — Basketball academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `volleyball` — Volleyball academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `judo` — Judo academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `taekwondo` — Taekwondo academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `wushu` — Wushu academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `fencing` — Fencing academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `gymnastics` — Gymnastics academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `cycling` — Cycling academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `kho-kho` — Kho-Kho academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `tennis` — Tennis academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `squash` — Squash academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `rowing` — Rowing academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `canoe-kayak` — Canoe & Kayak academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `handball` — Handball academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `karate` — Karate academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `sepaktakraw` — Sepaktakraw academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `indian-traditional-sports` — Mallakhamb, Yogasana & Indian martial arts academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `golf` — Golf academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `equestrian` — Equestrian academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `sailing` — Sailing academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `triathlon` — Triathlon academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `rugby` — Rugby Sevens academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `sport-climbing` — Sport Climbing academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `surfing` — Surfing academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `skateboarding` — Skateboarding academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `modern-pentathlon` — Modern Pentathlon academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `diving` — Diving academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `water-polo` — Water Polo academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `artistic-swimming` — Artistic Swimming academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `baseball-softball` — Baseball & Softball academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `flag-football` — Flag Football academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `lacrosse` — Lacrosse academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `breaking` — Breaking academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `kurash` — Kurash academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `ju-jitsu` — Ju-Jitsu academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `mma` — MMA academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `powerlifting` — Powerlifting academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"
- `bodybuilding` — Bodybuilding academies & clubs — types: "SAI / govt centre", "Academy", "Club", "Association"

### Dance & music

- `kathak` — Kathak classes & institutes — types: "University department", "Institute", "Guru / private class"
- `bharatanatyam` — Bharatanatyam classes & institutes — types: "University department", "Institute", "Guru / private class"
- `hindustani-music` — Hindustani Music classes & institutes — types: "University department", "Institute", "Guru / private class"
- `carnatic-music` — Carnatic Music classes & institutes — types: "University department", "Institute", "Guru / private class"
<!-- topics:end -->

## State ids

<!-- states:start -->
`andaman-nicobar` (Andaman & Nicobar Islands) · `andhra-pradesh` (Andhra Pradesh) · `arunachal-pradesh` (Arunachal Pradesh) · `assam` (Assam) · `bihar` (Bihar) · `chandigarh` (Chandigarh) · `chhattisgarh` (Chhattisgarh) · `dnh-dd` (Dadra & Nagar Haveli and Daman & Diu) · `delhi` (Delhi NCR) · `goa` (Goa) · `gujarat` (Gujarat) · `haryana` (Haryana) · `himachal-pradesh` (Himachal Pradesh) · `jammu-kashmir` (Jammu & Kashmir) · `jharkhand` (Jharkhand) · `karnataka` (Karnataka) · `kerala` (Kerala) · `ladakh` (Ladakh) · `lakshadweep` (Lakshadweep) · `madhya-pradesh` (Madhya Pradesh) · `maharashtra` (Maharashtra) · `manipur` (Manipur) · `meghalaya` (Meghalaya) · `mizoram` (Mizoram) · `nagaland` (Nagaland) · `odisha` (Odisha) · `puducherry` (Puducherry) · `punjab` (Punjab) · `rajasthan` (Rajasthan) · `sikkim` (Sikkim) · `tamil-nadu` (Tamil Nadu) · `telangana` (Telangana) · `tripura` (Tripura) · `uttar-pradesh` (Uttar Pradesh) · `uttarakhand` (Uttarakhand) · `west-bengal` (West Bengal)
<!-- states:end -->

## My request (topic id / state id):

