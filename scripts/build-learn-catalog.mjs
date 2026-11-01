// build-learn-catalog — every India "where to learn" topic a state fill can name, in one list.
//   VERIFY_DEPS=<deps> node scripts/build-learn-catalog.mjs [--check]
//
// A topic is what the owner types under the free-Claude prompt ("CS coaching / Delhi" → cs-coaching / delhi).
// It writes:
//   docs/free-claude/topics.yml   machine list read by scripts/inbox-ingest.mjs: per topic its finder id (a live
//                                 finder that already owns the key, else a new finder named after the topic), the
//                                 old colleges / coaching key it takes over, allowed types, default type, the
//                                 guide pages it belongs to, and the meta a new finder yml is made from.
//   docs/free-claude/PROMPT.md    the topic table between <!-- topics:start --> and <!-- topics:end -->, and the
//                                 state ids (_data/finder_states.yml) between <!-- states:start / end -->.
// Topics come from the data, so a new coaching exam, college course, sport or art page shows up on the next run:
//   <key>-coaching   every exam key in _data/coaching.yml
//   <key>-colleges   every course key in _data/colleges.yml (underscores become hyphens)
//   <sport-slug>     every sport and art subject in _data/in/learn_map.yml
//   + EXTRA below (topics with no old key, e.g. state PSC coaching).
// --check exits 1 when either file is out of date (rerun after adding keys, sports or finders).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = createRequire(path.join(process.env.VERIFY_DEPS || root, 'x.js'))('js-yaml');
const CHECK = process.argv.includes('--check');
const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const load = (f) => yaml.load(rd(f));

const coaching = load('_data/coaching.yml');
const colleges = load('_data/colleges.yml');
const explorer = load('_data/explorer.yml');
const seo = load('_data/seo_landings.yml');
const map = load('_data/in/learn_map.yml');
const live = fs.readdirSync(path.join(root, '_data/in/learn')).filter((f) => f.endsWith('.yml')).map((f) => load(`_data/in/learn/${f}`));

// Short names used inside type names ("CS coaching", "B.Com college").
const COACH_TYPE = {
  defence: 'Defence exam', design: 'Design entrance', ipmat: 'IPMAT', actuarial: 'Actuarial exam', banking: 'Bank exam',
  judiciary: 'Judiciary exam', clat: 'CLAT', nata: 'NATA', cpa: 'US CPA', hotel: 'Hotel management entrance', upsc: 'UPSC',
  cuet: 'CUET', ssc: 'SSC', neet: 'NEET', jee: 'JEE',
};
const COLLEGE_TYPE = (k, short) => (/^iti/.test(k) ? 'ITI' : /^diploma/.test(k) ? 'Polytechnic' : k === 'pilot' ? 'Flying school'
  : k === 'ame' ? 'AME institute' : /^d[a-z]/.test(k) && /Diploma/.test(short) ? 'Diploma institute' : `${short.replace(/\s*\(.*\)$/, '')} college`);
const PALETTE = { science: 'science', commerce: 'commerce', arts: 'arts', 'diploma-iti': 'diploma', govt: 'govt-exams' };
const streamOf = (hub, k) => {
  const s = explorer.streams.find((x) => (x[hub] || []).includes(k));
  return s ? (k.startsWith('iti') ? 'iti' : PALETTE[s.id]) : null;
};
const FAMILY_BY_STREAM = { science: 'science-research', commerce: 'commerce-finance', arts: 'humanities', diploma: 'diploma-polytechnic', iti: 'iti-trades', 'govt-exams': 'govt-jobs' };
// Guide pages a key belongs to: the page named after the key first, then exams, then careers (3 at most).
const KIND_ORDER = { exam: 0, 'govt-exam': 1, career: 2, blueprint: 3 };
function subjectsFor(field, k) {
  const list = map.subjects.filter((s) => (s[field] || []).includes(k) && fs.existsSync(path.join(root, s.page)));
  list.sort((a, b) => (b.page === `${k}.html`) - (a.page === `${k}.html`) || (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9) || a.name.localeCompare(b.name));
  return list.slice(0, 3).map((s) => ({ id: s.id, label: `${s.name.split(' — ')[0]} guide`, href: s.page, family: s.family }));
}
const ownerOf = (kind, k) => live.find((F) => ((F.keys || {})[kind] || []).includes(k));

const topics = [];
function add(t) {
  const F = t.finder_live;
  delete t.finder_live;
  // A live finder that mixes colleges and coaching (MBBS + NEET) offers each topic only its own type.
  const mixed = F && Object.values(F.keys || {}).filter((v) => (v || []).length).length > 1;
  const def = F ? (t.kind === 'coaching' ? F.types.find((x) => /coaching/i.test(x)) : t.kind === 'colleges' ? F.types.find((x) => !/coaching/i.test(x)) : null) || F.types[F.types.length - 1] : t.types[0];
  topics.push({
    id: t.id, label: t.label, kind: t.kind,
    finder: F ? F.id : t.id, live: !!F,
    keys: t.keys,
    types: F ? (mixed ? [def] : F.types) : t.types,
    default_type: def,
    ...(F ? {} : { meta: t.meta }),
  });
}

for (const [k, ex] of Object.entries(coaching.exams)) {
  const short = (seo.coaching.labels[k] || {}).short || ex.tag;
  const subs = subjectsFor('coaching_keys', k);
  const stream = streamOf('coaching', k);
  add({
    id: `${k}-coaching`, label: `${short} coaching`, kind: 'coaching', keys: { coaching: [k] }, finder_live: ownerOf('coaching', k),
    types: [`${COACH_TYPE[k] || short} coaching`, 'Official / govt centre'],
    meta: {
      family: (subs[0] && subs[0].family) || FAMILY_BY_STREAM[stream] || 'govt-jobs', stream, search_cat: 'coaching',
      name: `${short} coaching centres`, short: `${short} coaching`, phrase: `${short} Coaching Centres`, phrase_short: `${short} Coaching`,
      search_words: `${k} ${ex.subject || ''} coaching classes tuition institute`,
      lead: `${short} coaching centres in India: brand branches read from each brand's official centre pages, and local institutes checked one by one on a public page (each card links it). Nothing here is ranked.`,
      subjects: subs.map(({ family, ...s }) => s),
      sources: [{ id: 'brands', name: "Coaching brands' official centre locators and branch pages", url: `coaching.html?exam=${k}`, note: 'Centres already in the coaching finder, each from its brand\'s own centre list.' }],
    },
  });
}
for (const [k, c] of Object.entries(colleges.courses)) {
  const L = seo.colleges.labels[k] || {};
  const short = L.short || c.label;
  const subs = subjectsFor('colleges_keys', k);
  const stream = streamOf('colleges', k);
  const phrase = (L.phrase || `${c.label} Colleges & Universities`).replace(/&amp;/g, '&');
  add({
    id: `${k.replace(/_/g, '-')}-colleges`, label: `${short} colleges`, kind: 'colleges', keys: { colleges: [k] }, finder_live: ownerOf('colleges', k),
    types: [COLLEGE_TYPE(k, short), 'University'],
    meta: {
      family: (subs[0] && subs[0].family) || FAMILY_BY_STREAM[stream] || 'humanities', stream, search_cat: 'colleges',
      name: phrase, short: `${short} colleges`, phrase, phrase_short: `${short} Colleges`,
      search_words: `${k.replace(/_/g, ' ')} ${c.label} college colleges university admission`,
      lead: `${phrase} in India: colleges from the college finder, each checked on its official website, and more colleges added state by state from official and public pages (each card links its source). Nothing here is ranked.`,
      subjects: subs.map(({ family, ...s }) => s),
      sources: [{ id: 'colleges', name: 'Official college websites and regulator lists', url: `colleges.html?course=${k}`, note: 'Colleges already in the college finder, each checked on its official site.' }],
    },
  });
}
for (const s of map.subjects.filter((x) => x.kind === 'sport' || x.kind === 'art')) {
  if (!fs.existsSync(path.join(root, s.page))) continue;
  const sport = s.kind === 'sport';
  const F = live.find((x) => x.id === s.id || (x.subjects || []).some((y) => y.href === s.page));
  add({
    id: s.id, label: sport ? `${s.name} academies & clubs` : `${s.name} classes & institutes`, kind: s.kind, keys: {}, finder_live: F,
    types: sport ? ['SAI / govt centre', 'Academy', 'Club', 'Association'] : ['University department', 'Institute', 'Guru / private class'],
    meta: {
      family: s.family, search_cat: 'guides',
      name: sport ? `${s.name} academies, clubs & SAI centres` : `${s.name} classes, institutes & university departments`,
      short: sport ? `${s.name} academies` : `${s.name} classes`,
      phrase: sport ? `${s.name} Academies & Clubs` : `${s.name} Classes & Institutes`,
      phrase_short: sport ? `${s.name} Academies` : `${s.name} Classes`,
      search_words: sport ? `${s.name} academy academies club clubs coaching training ground` : `${s.name} class classes guru institute school learn`,
      lead: sport ? `Places to train in ${s.name} in India: SAI and state sports centres, academies, clubs and associations, each checked on a public page (each card links it). Nothing here is ranked.`
        : `Places to learn ${s.name} in India: university departments, institutes and gurus' classes, each checked on a public page (each card links it). Nothing here is ranked.`,
      subjects: [{ id: s.id, label: `${s.name} guide`, href: s.page }],
      sources: [],
    },
  });
}
// Topics with no old colleges / coaching key.
const EXTRA = [
  {
    id: 'state-psc-coaching', label: 'State PSC & state govt exam coaching', kind: 'coaching', keys: {},
    types: ['State PSC coaching', 'Official / govt centre'],
    meta: {
      family: 'govt-jobs', stream: 'govt-exams', search_cat: 'coaching', name: 'State PSC & state exam coaching centres', short: 'State PSC coaching',
      phrase: 'State PSC Coaching Centres', phrase_short: 'State PSC Coaching', search_words: 'psc gpsc mpsc uppsc bpsc rpsc state exam govt job coaching classes',
      lead: 'Coaching for state public service commission and state government exams, including free state-run centres, each checked on a public page (each card links it). Nothing here is ranked.',
      subjects: [{ id: 'state-psc', label: 'State PSC guide', href: 'state-psc.html' }], sources: [],
    },
  },
];
for (const t of EXTRA) add({ ...t, finder_live: null });

const ids = new Set();
for (const t of topics) { if (ids.has(t.id)) throw new Error(`duplicate topic id ${t.id}`); ids.add(t.id); }

const out = '# GENERATED by scripts/build-learn-catalog.mjs — every topic a free-Claude state fill can name. Do not edit.\n'
  + '# Read by scripts/inbox-ingest.mjs. finder = the learn/<finder>/ pages the rows go to; live = that finder exists now.\n'
  + yaml.dump({ topics }, { lineWidth: 200, noRefs: true });

// Topic table for the prompt: id | what | allowed types (one line each, grouped by kind).
const GROUP = { coaching: 'Coaching (exams & professional courses)', colleges: 'Colleges (degree, diploma, ITI)', sport: 'Sports', art: 'Dance & music' };
const table = Object.entries(GROUP).flatMap(([kind, head]) => [
  '', `### ${head}`, '',
  ...topics.filter((t) => t.kind === kind).map((t) => `- \`${t.id}\` — ${t.label} — types: ${t.types.map((x) => `"${x}"`).join(', ')}`),
]).join('\n');
const promptFile = path.join(root, 'docs/free-claude/PROMPT.md');
let prompt = fs.existsSync(promptFile) ? fs.readFileSync(promptFile, 'utf8').replace(/\r\n/g, '\n') : '';
const re = /(<!-- topics:start -->)[\s\S]*?(<!-- topics:end -->)/;
const stateList = yaml.load(rd('_data/finder_states.yml')).map((s) => `\`${s.id}\` (${s.name})`).join(' · ');
const reS = /(<!-- states:start -->)[\s\S]*?(<!-- states:end -->)/;
let newPrompt = re.test(prompt) ? prompt.replace(re, () => `<!-- topics:start -->\n${table.trim()}\n<!-- topics:end -->`) : prompt;
newPrompt = reS.test(newPrompt) ? newPrompt.replace(reS, () => `<!-- states:start -->\n${stateList}\n<!-- states:end -->`) : newPrompt;

const cur = fs.existsSync(path.join(root, 'docs/free-claude/topics.yml')) ? rd('docs/free-claude/topics.yml').replace(/\r\n/g, '\n') : '';
const n = (k) => topics.filter((t) => t.kind === k).length;
console.log(`build-learn-catalog: ${topics.length} topics (${n('coaching')} coaching, ${n('colleges')} colleges, ${n('sport')} sports, ${n('art')} arts), ${topics.filter((t) => t.live).length} with a live finder`);
if (CHECK) {
  if (cur !== out || newPrompt !== prompt) { console.error('build-learn-catalog: docs/free-claude is out of date — rerun without --check'); process.exit(1); }
  console.log('up to date');
} else {
  fs.mkdirSync(path.join(root, 'docs/free-claude'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs/free-claude/topics.yml'), out);
  if (newPrompt !== prompt) fs.writeFileSync(promptFile, newPrompt);
}
