/* "Where to learn" finders (learn/<finder>.html and its state / city pages, scripts/build-learn-finders.mjs).
   The page ships its first cards already rendered (same card() as below, run by the builder in Node), then
   this script loads the finder's JSON (<link data-lf-json>), keeps the page's scope (data-lf-state /
   data-lf-city on .lf) and redraws the list from the filter bar: state, city, type, ownership, branch, mode, search.
   Filters live in the URL (?state=&city=&type=&own=&branch=&mode=&q=) so a filtered list can be shared.
   No JS = the pre-rendered cards stay, with a link to the full list. */
(function (root) {
  'use strict';
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var PIN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  var EXT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>';
  var OWN = ['Government', 'Grant-in-Aid', 'Deemed', 'Private'];
  var slug = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); };
  var fmt = function (n) { return Number(n).toLocaleString('en-IN'); };

  // One listing card. states = { id: name }. Same markup classes as _includes/finder-card.html.
  function card(r, states) {
    var facts = '';
    var fact = function (dt, dd) { facts += '<div><dt>' + dt + '</dt><dd>' + dd + '</dd></div>'; };
    if (r.seats) fact('Seats', esc(r.seats) + (r.as_of ? ' (' + esc(r.as_of) + ')' : ''));
    if (r.admission) fact('Admission', esc(r.admission));
    if (r.batches) fact('Batches', '<ul class="fx-chips">' + r.batches.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>');
    if (r.branches) fact('Branches', '<ul class="fx-chips">' + r.branches.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>');
    if (r.mode) fact('Offers', '<ul class="fx-chips">' + r.mode.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>');
    fact('Checked', esc(r.checked) + ' · ' + esc(r.src_label || (r.source === 'nmc' ? 'NMC list' : 'official site')));
    var own = r.ownership ? '<span class="cx-tag fx-own fx-own-' + slug(r.ownership) + '">' + esc(r.ownership) + '</span>' : '';
    return '<article class="cx-college-card fx-card lf-card">' +
      '<div class="fx-card-top">' + own + '<span class="fx-subtag">' + esc(r.type) + '</span>' +
      '<span class="fx-loc">' + PIN + esc(r.city) + ', ' + esc(states[r.state] || r.state) + '</span></div>' +
      '<h3>' + esc(r.name) + '</h3>' + (r.about ? '<p>' + esc(r.about) + '</p>' : '') +
      '<dl class="fx-facts">' + facts + '</dl>' +
      '<div class="fx-actions"><a class="btn-exam-primary" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' +
      esc(r.url_label || 'Official website') + ' ' + EXT + '<span class="sr-only"> (opens in a new tab)</span></a>' +
      (r.src_url ? '<a class="btn-exam-secondary" href="' + esc(r.src_url) + '" target="_blank" rel="noopener noreferrer">Source ' + EXT + '<span class="sr-only"> (' + esc(r.src_label) + ', opens in a new tab)</span></a>' : '') +
      (r.body_url ?'<a class="btn-exam-secondary" href="' + esc(r.body_url) + '" target="_blank" rel="noopener noreferrer">Counselling &amp; fees ' + EXT + '<span class="sr-only"> (' + esc(r.body) + ', opens in a new tab)</span></a>' : '') +
      '</div></article>';
  }
  // Order shown everywhere: the finder's type order, then Government → Private, then A–Z. Not a ranking.
  function sort(rows, types) {
    var t = function (r) { var i = types.indexOf(r.type); return i < 0 ? 99 : i; };
    var o = function (r) { var i = OWN.indexOf(r.ownership); return i < 0 ? 99 : i; };
    return rows.slice().sort(function (a, b) { return t(a) - t(b) || o(a) - o(b) || a.name.localeCompare(b.name); });
  }
  var api = { card: card, sort: sort, slug: slug, OWN: OWN, PAGE: 24 };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  function init(box) {
    var link = document.querySelector('link[data-lf-json]');
    var grid = box.querySelector('[data-lf-grid]');
    var more = box.querySelector('[data-lf-more]');
    var count = box.querySelector('[data-lf-count]');
    var form = box.querySelector('[data-lf-filters]');
    var states = JSON.parse(box.getAttribute('data-lf-states') || '{}');
    var types = JSON.parse(box.getAttribute('data-lf-types') || '[]');
    var fixState = box.getAttribute('data-lf-state') || '';
    var fixCity = box.getAttribute('data-lf-city') || '';
    if (!link || !grid || !form) return;
    var all = [], shown = 0, list = [];
    var el = function (n) { return form.querySelector('[name="' + n + '"]'); };
    var fill = function (sel, vals, label) {
      if (!sel) return;
      var cur = sel.value;
      sel.innerHTML = '<option value="">' + label + '</option>' + vals.map(function (v) {
        return '<option value="' + esc(v[0]) + '">' + esc(v[1]) + ' (' + fmt(v[2]) + ')</option>';
      }).join('');
      sel.value = vals.some(function (v) { return v[0] === cur; }) ? cur : '';
    };
    var tally = function (rows, key) {
      var m = {};
      rows.forEach(function (r) { [].concat(key(r) || []).forEach(function (k) { if (k) m[k] = (m[k] || 0) + 1; }); });
      return m;
    };
    function options() {
      var st = el('state') ? el('state').value : fixState;
      var base = all.filter(function (r) { return !st || r.state === st; });
      if (el('state')) {
        var s = tally(all, function (r) { return r.state; });
        fill(el('state'), Object.keys(s).sort(function (a, b) { return (states[a] || a).localeCompare(states[b] || b); })
          .map(function (k) { return [k, states[k] || k, s[k]]; }), 'All states');
      }
      if (el('city')) {
        var c = tally(base, function (r) { return r.city; });
        fill(el('city'), Object.keys(c).sort().map(function (k) { return [slug(k), k, c[k]]; }), 'All cities');
      }
      var t = tally(base, function (r) { return r.type; });
      fill(el('type'), types.filter(function (k) { return t[k]; }).map(function (k) { return [slug(k), k, t[k]]; }), 'All types');
      var o = tally(base, function (r) { return r.ownership; });
      fill(el('own'), OWN.filter(function (k) { return o[k]; }).map(function (k) { return [slug(k), k, o[k]]; }), 'Any ownership');
      if (el('branch')) {
        var b = tally(base, function (r) { return r.branches; });
        fill(el('branch'), Object.keys(b).sort(function (x, y) { return (x === 'Other branches') - (y === 'Other branches') || x.localeCompare(y); })
          .map(function (k) { return [slug(k), k, b[k]]; }), 'Any branch');
      }
      if (el('mode')) {
        var m = tally(base, function (r) { return r.mode; });
        fill(el('mode'), Object.keys(m).sort().map(function (k) { return [slug(k), k, m[k]]; }), 'Any mode');
      }
    }
    function apply(push) {
      var v = function (n) { return el(n) ? el(n).value : ''; };
      var st = el('state') ? v('state') : fixState, ct = el('city') ? v('city') : slug(fixCity);
      var q = v('q').trim().toLowerCase();
      list = all.filter(function (r) {
        return (!st || r.state === st) && (!ct || slug(r.city) === ct) && (!v('type') || slug(r.type) === v('type')) &&
          (!v('own') || slug(r.ownership || '') === v('own')) && (!v('mode') || (r.mode || []).map(slug).indexOf(v('mode')) >= 0) &&
          (!v('branch') || (r.branches || []).map(slug).indexOf(v('branch')) >= 0) &&
          (!q || (r.name + ' ' + r.city + ' ' + (r.about || '')).toLowerCase().indexOf(q) >= 0);
      });
      shown = 0; grid.innerHTML = ''; draw();
      if (push) {
        var p = new URLSearchParams();
        ['state', 'city', 'type', 'own', 'branch', 'mode', 'q'].forEach(function (n) { if (el(n) && el(n).value.trim()) p.set(n, el(n).value.trim()); });
        history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '') + location.hash);
      }
    }
    function draw() {
      grid.insertAdjacentHTML('beforeend', list.slice(shown, shown + api.PAGE).map(function (r) { return card(r, states); }).join(''));
      shown = Math.min(list.length, shown + api.PAGE);
      if (count) count.textContent = list.length ? 'Showing ' + fmt(shown) + ' of ' + fmt(list.length) + ' verified ' + (list.length === 1 ? 'place' : 'places') : 'No verified place matches these filters yet. Clear a filter to see more.';
      if (more) more.hidden = shown >= list.length;
    }
    fetch(link.href).then(function (r) { return r.json(); }).then(function (rows) {
      all = sort(rows.filter(function (r) { return (!fixState || r.state === fixState) && (!fixCity || r.city === fixCity); }), types);
      var p = new URLSearchParams(location.search);
      options();
      ['state', 'city', 'type', 'own', 'branch', 'mode', 'q'].forEach(function (n) { if (el(n) && p.get(n)) { el(n).value = p.get(n); if (n === 'state') options(); } });
      form.hidden = false; box.classList.add('is-live');
      apply(false);
      form.addEventListener('change', function (e) { if (e.target.name === 'state') { if (el('city')) el('city').value = ''; options(); } apply(true); });
      var tmr;
      form.addEventListener('input', function (e) { if (e.target.name === 'q') { clearTimeout(tmr); tmr = setTimeout(function () { apply(true); }, 180); } });
      form.addEventListener('submit', function (e) { e.preventDefault(); apply(true); });
      form.addEventListener('reset', function () { setTimeout(function () { options(); apply(true); }, 0); });
      if (more) more.addEventListener('click', draw);
    }).catch(function () { /* keep the pre-rendered cards */ });
  }
  document.querySelectorAll('[data-lf]').forEach(init);
})(this);
