// CA finder: every ICAI branch in India, read from the five regional councils' own branch lists, into
// scripts/learn-src/ca/data/icai.json.   node scripts/learn-src/ca/icai.mjs
//   NIRC  nirc.icai.org/branches-of-nirc/ + each branch page ("Address:" line)
//   WIRC  wirc-icai.org/wirc-branches (React app) → its GraphQL API admin.wirc-icai.org/graphql, getAllBranchV2Details
//   SIRC  sirc-icai.org/sirc-of-icai-in-<state>.php (one table per state: name, address, e-mail, website)
//   EIRC  eirc-icai.org/overview/branches-of-eirc; branches without a site open a modal: POST /branch-details
//         {_token (page csrf), id} with the page's session cookie, address in the first <p>
//   CIRC  circ.icai.org answers 406 to scripts, so its "Branch Contact Details" page is read from the Wayback
//         Machine (capture 2025-07-20): branch names, each linking to its contact PDF.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, text, sleep } from '../engineering/_lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
function save(src, meta, rows) {
  const f = path.join(here, 'data', `${src}.json`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify({ ...meta, n: rows.length, rows }) + '\n');
}

const UA = { headers: { 'user-agent': 'Mozilla/5.0' } };
const rows = [];
const add = (r) => rows.push({ ...r, address: r.address.replace(/&#(\d+);/g, (m, c) => String.fromCharCode(+c)).replace(/^Address\s*:\s*/i, '') });

// Branch name → city, where they differ (old names, districts, state-level branches).
const CITY = {
  Calicut: 'Kozhikode', Trichur: 'Thrissur', Trivandrum: 'Thiruvananthapuram', Quilon: 'Kollam', Palghat: 'Palakkad',
  Alleppey: 'Alappuzha', Bangalore: 'Bengaluru', Mangalore: 'Mangaluru', Mysore: 'Mysuru', Belgaum: 'Belagavi',
  Hubli: 'Hubballi', Gulbarga: 'Kalaburagi', Bellary: 'Ballari', Shimoga: 'Shivamogga', Tumkur: 'Tumakuru',
  Davangere: 'Davanagere', Tiruchirapalli: 'Tiruchirappalli', Pondicherry: 'Puducherry', Vizag: 'Visakhapatnam',
  Vijayawada: 'Vijayawada', 'GB Nagar': 'Greater Noida', Bulandshahar: 'Bulandshahr', 'Himachal Pradesh': 'Shimla',
  'Hanumangarh District': 'Hanumangarh', 'West Godavari District': 'Eluru', 'Vizianagaram District': 'Vizianagaram', Chengalpattu: 'Chennai', Muzzafarpur: 'Muzaffarpur', 'Ahilyanagar': 'Ahilyanagar', 'Pimpri Chinchwad': 'Pimpri-Chinchwad', 'Yamunanagar': 'Yamunanagar',
};
const cityOf = (n) => CITY[n] || n;

// ---- NIRC
const NIRC_STATE = {
  Ambala: 'haryana', Amritsar: 'punjab', Bahadurgarh: 'haryana', Bathinda: 'punjab', Bhiwani: 'haryana', Chandigarh: 'chandigarh',
  Faridabad: 'haryana', Gurugram: 'haryana', 'Himachal Pradesh': 'himachal-pradesh', Hisar: 'haryana', Jalandhar: 'punjab',
  'Jammu & Kashmir': 'jammu-kashmir', Karnal: 'haryana', Kaithal: 'haryana', Kurukshetra: 'haryana', Ludhiana: 'punjab',
  'Mandi Gobindgarh': 'punjab', Panipat: 'haryana', Patiala: 'punjab', Rewari: 'haryana', Rohtak: 'haryana', Sangrur: 'punjab',
  Sirsa: 'haryana', Sonepat: 'haryana', Yamunanagar: 'haryana',
};
{
  const h = (await get('https://nirc.icai.org/branches-of-nirc/', UA)).replace(/\s+/g, ' ');
  const seen = new Set();
  for (const m of h.matchAll(/<a href="(https:\/\/nirc\.icai\.org\/[a-z-]+\/)">\s*<span class="elementor-icon-list-icon">.*?<span class="elementor-icon-list-text">([^<]+)</g)) {
    const [, url, raw] = m; const n = text(raw);
    if (!NIRC_STATE[n] || seen.has(n)) continue;
    seen.add(n);
    const p = (await get(url, UA)).replace(/<[^>]*>/g, '\n').split('\n').map((s) => text(s)).filter(Boolean);
    const i = p.findIndex((s) => /^Address:?$/.test(s));
    let address = i >= 0 ? p[i + 1] : '';
    // The J&K branch is in Jammu; read the city off its address rather than assume it.
    const city = n === 'Jammu & Kashmir' ? (/srinagar/i.test(address) ? 'Srinagar' : 'Jammu') : n === 'Yamunanagar' ? 'Yamunanagar' : cityOf(n);
    add({ name: `ICAI ${n === 'Jammu & Kashmir' ? 'Jammu & Kashmir' : n} Branch (NIRC)`, council: 'NIRC', state: NIRC_STATE[n], city, address, url });
    await sleep(300);
  }
  for (const n of Object.keys(NIRC_STATE)) if (!seen.has(n)) console.warn('nirc: missing', n);
}

// ---- WIRC
{
  const r = await fetch('https://admin.wirc-icai.org/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json', referer: 'https://wirc-icai.org/', ...UA.headers },
    body: JSON.stringify({ query: '{ getAllBranchV2Details { branchV2 { name } name branchName addressInfo isActive } }' }),
    signal: AbortSignal.timeout(60000),
  });
  const d = (await r.json()).data.getAllBranchV2Details;
  const ST = { Maharashtra: 'maharashtra', Gujarat: 'gujarat', Goa: 'goa' };
  for (const b of d) {
    if (!b.isActive) continue;
    const n = text(b.name);
    const raw = /^[-\s]*$/.test(b.addressInfo || '') ? '' : text(b.addressInfo);
    // addressInfo runs on into e-mail / phone / website; keep the postal part, take a branch website if given.
    const site = (raw.match(/Website\s*:?\s*((?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.(?:org|in|com)\/?)/i) || [])[1];
    const address = raw.split(/\s*\b(?:(?:E-?mail|Email-Id|Phone|Telephone|Website)\b|T:)/i)[0]
      .replace(/^.*?Branch of (?:the )?(?:WIRC|Western India Regional Council)[^,]*?(?:Accountants of India|ICAI|\(WIRC\))\s*,?\s*/i, '')
      .replace(/^(?:The Institute of Chartered Accountants of India,\s*)?Address\s*:\s*/i, '').replace(/^The Institute of Chartered Accountants of India,\s*/i, '').replace(/[\s,.]+$/, '');
    add({ name: `ICAI ${n} Branch (WIRC)`, council: 'WIRC', state: ST[text(b.branchV2.name)], city: n === 'Goa' ? 'Panaji' : cityOf(n), address,
      url: site ? (site.startsWith('http') ? site : 'https://' + site) : 'https://wirc-icai.org/wirc-branches' });
  }
}

// ---- SIRC
{
  const PAGES = { 'andhra-pradesh': 'andhra-pradesh', karnataka: 'karnataka', kerala: 'kerala', pondicherrry: 'puducherry', tamilnadu: 'tamil-nadu', telgugana: 'telangana' };
  for (const [p, state] of Object.entries(PAGES)) {
    const url = `https://sirc-icai.org/sirc-of-icai-in-${p}.php`;
    const h = await get(url, UA);
    for (const seg of h.split(/<strong>/).slice(1)) {
      const n = text(seg.slice(0, seg.indexOf('</strong>'))).replace(/​/g, '');
      const td = seg.match(/<td[^>]*>([\s\S]*?)<\/td>/);
      if (!n || !td || !/mailto:|\d{6}/.test(td[1])) continue;
      const parts = td[1].split(/<br\s*\/?>/i).map((s) => text(s).replace(/^:\s*/, ''));
      const address = parts.filter((s) => s && !/@|map link/i.test(s) && !/^[\d\s,;\-–+()]+$/.test(s) && !/^(www\.)?[a-z0-9.-]+\.(org|in|com)(\/\S*)?$/i.test(s)).join(', ');
      const site = [...td[1].matchAll(/href="(https?:\/\/[^"]+)"/g)].map((x) => x[1]).find((u) => !/google\.|maps/.test(u));
      const st = n === 'Nizamabad' ? 'telangana' : state; // the Karnataka page repeats Nizamabad
      if (rows.some((r) => r.council === 'SIRC' && r.name.includes(` ${n} `))) continue;
      add({ name: `ICAI ${n.replace(/ District$/, '')} Branch (SIRC)`, council: 'SIRC', state: st, city: cityOf(n), address: address.replace(/,\s*[\d\s/,-]{8,}$/, ''), url: site || url });
    }
    await sleep(300);
  }
}

// ---- EIRC
{
  const PAGE = 'https://www.eirc-icai.org/overview/branches-of-eirc';
  const r0 = await fetch(PAGE, { ...UA, signal: AbortSignal.timeout(60000) });
  const cookie = (r0.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
  const h = (await r0.text()).replace(/\s+/g, ' ');
  const token = (h.match(/csrf-token" content="([^"]+)"/) || [])[1];
  const ST = {
    Asansol: 'west-bengal', Durgapur: 'west-bengal', Raniganj: 'west-bengal', Siliguri: 'west-bengal', Bhubaneswar: 'odisha', Cuttack: 'odisha',
    Rourkela: 'odisha', Sambalpur: 'odisha', Jharsuguda: 'odisha', Brahmapur: 'odisha', Dibrugarh: 'assam', Guwahati: 'assam', Tinsukia: 'assam',
  };
  for (const m of h.matchAll(/<li> ?<a href="([^"]*)"( class="branch-model" data-id="(\d+)")?[^>]*>([^<]+)<\/a>/g)) {
    const n = text(m[4]);
    if (!ST[n]) continue;
    let address = '';
    if (m[3]) {
      const j = await (await fetch('https://www.eirc-icai.org/branch-details', {
        method: 'POST', headers: { ...UA.headers, cookie, 'x-requested-with': 'XMLHttpRequest', 'content-type': 'application/x-www-form-urlencoded', referer: PAGE },
        body: `_token=${encodeURIComponent(token)}&id=${m[3]}`, signal: AbortSignal.timeout(60000),
      })).json();
      address = text((j.html.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || '').replace(/^.*?Branch of EIRC of ICAI,?\s*/i, '').replace(/^Address\s*[-:]\s*/i, '');
      await sleep(300);
    }
    add({ name: `ICAI ${n} Branch (EIRC)`, council: 'EIRC', state: ST[n], city: n === 'Brahmapur' ? 'Berhampur' : n, address, url: m[1].startsWith('http') ? m[1] : PAGE });
  }
}

// ---- CIRC (Wayback copy)
{
  const ST = {
    Agra: 'uttar-pradesh', Alwar: 'rajasthan', Aligarh: 'uttar-pradesh', Ajmer: 'rajasthan', Beawar: 'rajasthan', Bharatpur: 'rajasthan',
    Bulandshahar: 'uttar-pradesh', Bhilwara: 'rajasthan', Bilaspur: 'chhattisgarh', Bareilly: 'uttar-pradesh', Bhopal: 'madhya-pradesh',
    Bhilai: 'chhattisgarh', Bikaner: 'rajasthan', Chittorgarh: 'rajasthan', Dehradun: 'uttarakhand', Dhanbad: 'jharkhand', Indore: 'madhya-pradesh',
    'GB Nagar': 'uttar-pradesh', Ghaziabad: 'uttar-pradesh', Gorakhpur: 'uttar-pradesh', Gwalior: 'madhya-pradesh', Haridwar: 'uttarakhand',
    Haldwani: 'uttarakhand', Jamshedpur: 'jharkhand', Jaipur: 'rajasthan', Jabalpur: 'madhya-pradesh', Jhansi: 'uttar-pradesh', Jodhpur: 'rajasthan',
    Kota: 'rajasthan', Kishangarh: 'rajasthan', Lucknow: 'uttar-pradesh', Muzaffarnagar: 'uttar-pradesh', Mathura: 'uttar-pradesh',
    Meerut: 'uttar-pradesh', Moradabad: 'uttar-pradesh', Patna: 'bihar', Pali: 'rajasthan', Prayagraj: 'uttar-pradesh', Raipur: 'chhattisgarh',
    Ranchi: 'jharkhand', Kanpur: 'uttar-pradesh', Varanasi: 'uttar-pradesh', Udaipur: 'rajasthan', Ujjain: 'madhya-pradesh', Saharanpur: 'uttar-pradesh',
    Sikar: 'rajasthan', 'Sri Ganganagar': 'rajasthan', Shahjahanpur: 'uttar-pradesh', Satna: 'madhya-pradesh', Ratlam: 'madhya-pradesh',
    Rishikesh: 'uttarakhand', Rudrapur: 'uttarakhand', Roorkee: 'uttarakhand', Sagar: 'madhya-pradesh', Bhagalpur: 'bihar', Muzaffarpur: 'bihar',
    Gaya: 'bihar', Begusarai: 'bihar', Firozabad: 'uttar-pradesh', Noida: 'uttar-pradesh', Bokaro: 'jharkhand', Hazaribagh: 'jharkhand',
    Kashipur: 'uttarakhand', Mussoorie: 'uttarakhand', Sriganganagar: 'rajasthan', Bhiwadi: 'rajasthan', Jhunjhunu: 'rajasthan', Dewas: 'madhya-pradesh',
    Katni: 'madhya-pradesh', Rewa: 'madhya-pradesh', Korba: 'chhattisgarh', Durg: 'chhattisgarh', Rajnandgaon: 'chhattisgarh', Ambikapur: 'chhattisgarh',
    'Hanumangarh District': 'rajasthan', Mandsaur: 'madhya-pradesh', Muzzafarpur: 'bihar', Neemuch: 'madhya-pradesh', Rajsamand: 'rajasthan',
    Tonk: 'rajasthan', Raigarh: 'chhattisgarh', Darbhanga: 'bihar', Purnia: 'bihar', Purnea: 'bihar', Ayodhya: 'uttar-pradesh', Faizabad: 'uttar-pradesh', Etawah: 'uttar-pradesh', Hapur: 'uttar-pradesh',
  };
  const PAGE = 'https://circ.icai.org/branch-contact-details-2/';
  // Wayback rate-limits (429): the capture is kept in data/circ-wayback.html once read; delete it to re-read.
  const cache = path.join(here, 'data', 'circ-wayback.html');
  if (!fs.existsSync(cache)) fs.writeFileSync(cache, await get('http://web.archive.org/web/20250720144936id_/' + PAGE, UA));
  const h = fs.readFileSync(cache, 'utf8');
  for (const m of h.matchAll(/<p><a href="([^"]+\.pdf)"[^>]*>([^<]+)<\/a><\/p>/g)) {
    const n = text(m[2]);
    if (!ST[n]) { console.warn('circ: no state for', n); continue; }
    add({ name: `ICAI ${n} Branch (CIRC)`, council: 'CIRC', state: ST[n], city: cityOf(n), address: '', url: PAGE, pdf: m[1] });
  }
}

save('icai', { fetched: new Date().toISOString().slice(0, 10) }, rows);
const by = {}; for (const r of rows) by[r.council] = (by[r.council] || 0) + 1;
console.log('icai branches:', rows.length, JSON.stringify(by), 'no address:', rows.filter((r) => !r.address).length);
