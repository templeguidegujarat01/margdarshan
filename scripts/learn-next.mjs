// learn-next — prints ONLY the next "where to learn" batch from _data/in/learn_map.yml, so a fresh
// session never has to read the whole map. Also flips status for finished subjects.
//
//   VERIFY_DEPS=<deps> node scripts/learn-next.mjs                      # next batch + progress
//   VERIFY_DEPS=<deps> node scripts/learn-next.mjs --set mbbs,neet-ug live mbbs   # status + finder
//   VERIFY_DEPS=<deps> node scripts/learn-next.mjs --set kathak building kathak
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const FILE = path.join(root, '_data/in/learn_map.yml');
const raw = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');
const map = yaml.load(raw);

// Most-searched first; everything else follows in learn_map order.
const PRIORITY = ['mbbs', 'cse', 'ca', 'cricket', 'football', 'kathak', 'bharatanatyam', 'nursing', 'llb', 'bcom',
  'upsc-civil-services', 'nda', 'bba', 'bpharm', 'bds', 'hindustani-music', 'carnatic-music', 'badminton', 'chess',
  'commercial-pilot', 'journey-hotel-manager', 'fashion-design', 'architect', 'bams', 'ssc-cgl', 'ibps-po', 'rrb-ntpc', 'swimming',
  'athletics', 'boxing', 'wrestling', 'shooting', 'kabaddi', 'hockey', 'tennis', 'table-tennis', 'journey-yoga-instructor'];

// Where the full list of places usually comes from, by family.
const REGISTERS = {
  'medical-health': 'NMC college list API, DCI, INC, PCI, NCISM, NCH, NCAHP, AIIMS/state health universities',
  engineering: 'AICTE approved-institutes dashboard (facilities.aicte-india.org), state CET seat matrices, NIRF',
  'computer-digital': 'AICTE (B.Tech/BCA/MCA), UGC universities list, NIELIT centres',
  'science-research': 'UGC universities + affiliated colleges, IISER/NISER/IISc sites, NIRF',
  'commerce-finance': 'UGC/state university affiliated colleges, ICAI/ICSI/ICMAI regional & branch offices, coaching brand locators',
  'business-management': 'AICTE (MBA/PGDM), UGC, NIRF management, coaching brand locators',
  law: 'BCI approved law colleges list, NLU consortium, coaching brand locators',
  humanities: 'UGC universities + affiliated colleges, NIRF',
  media: 'UGC universities, IIMC campuses, state university departments',
  'design-creative': 'COA (architecture), NIFT/NID campuses, AICTE design, UGC fine-arts colleges, coaching locators',
  teaching: 'NCTE recognised institutions (ncte.gov.in), state SCERT/DIET lists',
  'hospitality-travel': 'NCHMCT affiliated IHMs, AICTE hotel management, IITTM',
  'aviation-maritime': 'DGCA approved FTOs + AME institutes, DG Shipping approved MTIs, IMU campuses',
  agriculture: 'ICAR accredited agri universities + colleges, VCI recognised vet colleges',
  'defence-police': 'Sainik/RIMC schools, coaching brand locators (defence/police), state police training notices',
  'govt-jobs': 'coaching brand locators (UPSC/SSC/bank/railway), state govt free-coaching schemes (e.g. Dr Ambedkar/SC-ST centres)',
  'university-entrance': 'coaching brand locators (CUET), NTA exam cities only as context',
  'school-boards': 'board-affiliated school search (CBSE saras, state boards) — usually link, do not copy',
  'diploma-polytechnic': 'AICTE diploma institutes, state technical education boards (DTE/SBTE) lists',
  'iti-trades': 'NCVT MIS ITI locator (ncvtmis.gov.in) — trade-wise, state-wise',
  sports: 'SAI STC/NCOE/Khelo India centres + accredited academies, national federation affiliated academies/clubs, state sports dept hostels',
  'performing-arts': 'Sangeet Natak Akademi, university music/dance depts (UGC), Kalakshetra-type institutes, state academies, Bhatkhande/Gandharva affiliated centres',
};

const args = process.argv.slice(2);
if (args[0] === '--set') {
  const [ids, status, finder] = [args[1].split(','), args[2], args[3]];
  if (!['todo', 'building', 'live'].includes(status)) throw new Error('status must be todo | building | live');
  let out = raw, n = 0;
  for (const id of ids) {
    const re = new RegExp(`(\\n  - id: ${id.replace(/[/.]/g, '\\$&')}\\n(?:    .*\\n)*?    finder: ).*\\n    status: .*`);
    if (!re.test(out)) throw new Error(`no subject ${id}`);
    out = out.replace(re, `$1${finder ?? 'null'}\n    status: ${status}`); n++;
  }
  fs.writeFileSync(FILE, out);
  console.log(`set ${n} subject(s) -> ${status}${finder ? ` (finder ${finder})` : ''}`);
  process.exit(0);
}

const S = map.subjects;
const count = st => S.filter(s => s.status === st).length;
console.log(`progress: ${count('live')} live · ${count('building')} building · ${count('todo')} todo of ${S.length}`);
const building = S.filter(s => s.status === 'building');
if (building.length) {
  console.log('\nUNFINISHED (finish these first):');
  for (const s of building) console.log(`  ${s.id} -> finder ${s.finder} · ${s.page}`);
  process.exit(0);
}
const todo = S.filter(s => s.status === 'todo');
if (!todo.length) { console.log('ALL DONE'); process.exit(0); }
const rank = s => { const i = PRIORITY.indexOf(s.id); return i < 0 ? PRIORITY.length + S.indexOf(s) : i; };
const lead = [...todo].sort((a, b) => rank(a) - rank(b))[0];
// Same family and same finder keys (or same sport/art) = same list of places.
const key = s => [...s.colleges_keys, ...s.coaching_keys].join(',');
const sib = todo.filter(s => s !== lead && s.family === lead.family && (key(lead) ? key(s) === key(lead) : false));
const live = [...new Set(S.filter(s => s.status === 'live' && s.finder).map(s => s.finder))];
console.log(`\nNEXT FINDER (lead: ${lead.id}) · family ${lead.family}`);
for (const s of [lead, ...sib]) console.log(`  ${s.id} · ${s.kind} · ${s.name} · ${s.page} · keys [${key(s)}] · ${s.listings_now} now`);
console.log(`\nregisters: ${REGISTERS[lead.family]}`);
console.log(`live finders: ${live.length ? live.join(', ') : 'none yet'}`);
