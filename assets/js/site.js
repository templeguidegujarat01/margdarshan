---
# Site-wide JavaScript. Until Phase 5 of the global-platform work this was inlined into every page
# by _includes/scripts.html (~59 KB per page, never cached). It is now one cached file.
# Liquid here reads only site-level data, so the output is the same for every page; the page-specific
# folder prefix ("" or "../" per level) comes from the data-root attribute on the <script> tag.
# Each former <script> block runs in its own try/catch so one failing block cannot stop the others,
# exactly as when they were separate <script> elements.
layout: null
sitemap: false
---
var SCRIPT_ROOT = (document.currentScript && document.currentScript.getAttribute('data-root')) || '';

/* ===== Block 1: shell: theme, sidebar, edition, search, FAQ, progress, reveal, read-more ===== */
try {
(function(){
  "use strict";
  var root = document.documentElement;
  var MD_ROOT = SCRIPT_ROOT; /* "" on top-level pages, "../" per folder level below that (from the <script data-root> attribute) */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme){
    if(!themeToggle) return;
    if(theme === 'dark'){ root.setAttribute('data-theme','dark'); themeToggle.setAttribute('aria-pressed','true'); }
    else { root.removeAttribute('data-theme'); themeToggle.setAttribute('aria-pressed','false'); }
  }
  var saved = null;
  try { saved = localStorage.getItem('md-theme'); } catch(e){}
  if(saved){ applyTheme(saved); }
  else if(window.matchMedia('(prefers-color-scheme: dark)').matches){ applyTheme('dark'); }
  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('md-theme', next); } catch(e){}
    });
  }

  /* ---------- App sidebar ----------
     Desktop (>= 1024px): fixed rail; the ☰ button collapses it to an icon
     rail (html[data-sidebar="collapsed"], remembered, set pre-paint in the
     layout <head>). Below 1024px it is a slide-over drawer opened from the
     topbar button: the page behind is scroll-locked (html.nav-locked) and the
     drawer closes on Escape, scrim tap, any link tap, or growing to desktop
     width, so the lock can never get stuck. Group headers and items with
     sub-pages collapse independently; closed groups are remembered. */
  var sidebar = document.getElementById('sidebar');
  var sbScrim = document.getElementById('sidebarScrim');
  var menuToggle = document.getElementById('menuToggle');
  var sbCollapse = document.getElementById('sidebarCollapse');
  var desktopMq = window.matchMedia('(min-width: 1024px)');
  function store(k, v){ try { if(v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e){} }
  function sbDrawerOpen(){ return sidebar && sidebar.classList.contains('is-open'); }
  function setDrawer(open){
    if(!sidebar) return;
    sidebar.classList.toggle('is-open', open);
    root.classList.toggle('nav-locked', open);
    if(sbScrim){ sbScrim.hidden = !open; sbScrim.classList.toggle('is-open', open); }
    if(menuToggle){
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    // Drawer is a dialog-like layer on small screens only.
    if(!desktopMq.matches){ if(open) sidebar.removeAttribute('inert'); else sidebar.setAttribute('inert',''); }
    // While the drawer is open on small screens, the page behind it is inert: Tab stays inside the
    // drawer (it has its own close button) and screen readers do not wander into the covered page.
    var behind = [document.querySelector('.app-main'), document.getElementById('backToTop'), document.getElementById('feedbackOpen'), document.querySelector('.skip-link')];
    behind.forEach(function(el){
      if(!el) return;
      if(open && !desktopMq.matches) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  function syncSidebarMode(){
    if(!sidebar) return;
    if(desktopMq.matches){ setDrawer(false); sidebar.removeAttribute('inert'); }
    else { root.removeAttribute('data-sidebar'); if(!sbDrawerOpen()) sidebar.setAttribute('inert',''); }
    syncCollapseBtn();
  }
  function syncCollapseBtn(){
    if(!sbCollapse) return;
    var rail = root.getAttribute('data-sidebar') === 'collapsed';
    sbCollapse.setAttribute('aria-expanded', rail ? 'false' : 'true');
    sbCollapse.setAttribute('aria-label', desktopMq.matches ? (rail ? 'Expand sidebar' : 'Collapse sidebar') : 'Close menu');
  }
  if(sidebar){
    if(menuToggle) menuToggle.addEventListener('click', function(){ setDrawer(!sbDrawerOpen()); if(sbDrawerOpen()){ var f = sidebar.querySelector('a[href]'); if(f) f.focus(); } });
    if(sbScrim) sbScrim.addEventListener('click', function(){ setDrawer(false); });
    var sbClose = sidebar.querySelector('.sb-close');
    if(sbClose) sbClose.addEventListener('click', function(){ setDrawer(false); if(menuToggle) menuToggle.focus(); });
    if(sbCollapse) sbCollapse.addEventListener('click', function(){
      if(!desktopMq.matches){ setDrawer(false); if(menuToggle) menuToggle.focus(); return; }
      var rail = root.getAttribute('data-sidebar') !== 'collapsed';
      if(rail) root.setAttribute('data-sidebar','collapsed'); else root.removeAttribute('data-sidebar');
      store('md-sidebar', rail ? 'collapsed' : null);
      syncCollapseBtn();
    });
    sidebar.addEventListener('click', function(e){
      if(!desktopMq.matches && e.target.closest('a[href]')) setDrawer(false);
    });
    if(desktopMq.addEventListener) desktopMq.addEventListener('change', syncSidebarMode); else desktopMq.addListener(syncSidebarMode);
    // Back/forward cache can restore a page with the drawer open.
    window.addEventListener('pageshow', function(){ setDrawer(false); syncSidebarMode(); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && sbDrawerOpen() && !desktopMq.matches){ setDrawer(false); if(menuToggle) menuToggle.focus(); }
    });
    syncSidebarMode();

    // Collapsible groups (remembered) and expandable items.
    var closedGroups = [];
    var hasSavedGroups = false;
    try { var savedGroups = localStorage.getItem('md-sb-closed'); hasSavedGroups = savedGroups !== null; closedGroups = JSON.parse(savedGroups || '[]'); } catch(e){}
    if(!Array.isArray(closedGroups)) closedGroups = [];
    function setGroup(g, open){
      g.classList.toggle('is-open', open);
      var b = g.querySelector('.sb-group-btn');
      if(b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    sidebar.querySelectorAll('.sb-group').forEach(function(g){
      var id = g.getAttribute('data-group');
      var gBtn = g.querySelector('.sb-group-btn');
      if(!gBtn) return; // e.g. the edition switch is a plain list with no toggle
      var holdsCurrent = !!g.querySelector('[aria-current], .is-trail');
      // A group holding the current page always starts open. On phones, first-time
      // visitors get every other group collapsed so the drawer isn't one long scroll.
      if(!holdsCurrent && (closedGroups.indexOf(id) !== -1 || (!hasSavedGroups && !desktopMq.matches))) setGroup(g, false);
      gBtn.addEventListener('click', function(){
        var open = !g.classList.contains('is-open');
        setGroup(g, open);
        var i = closedGroups.indexOf(id);
        if(open && i !== -1) closedGroups.splice(i, 1);
        if(!open && i === -1) closedGroups.push(id);
        store('md-sb-closed', JSON.stringify(closedGroups));
      });
    });
    sidebar.querySelectorAll('.sb-expand').forEach(function(b){
      b.addEventListener('click', function(){
        var item = b.closest('.sb-item');
        var open = !item.classList.contains('is-open');
        item.classList.toggle('is-open', open);
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    // Keep the current page in view inside the scrolling nav.
    var curLink = sidebar.querySelector('[aria-current="page"]');
    var sbScroll = sidebar.querySelector('.sb-scroll');
    if(curLink && sbScroll){
      var cr = curLink.getBoundingClientRect(), sr = sbScroll.getBoundingClientRect();
      if(cr.bottom > sr.bottom || cr.top < sr.top) sbScroll.scrollTop += cr.top - sr.top - sr.height / 3;
    }
  }

  /* ---------- Country edition (_data/regions.yml) ----------
     The page's edition is decided server-side from its URL (html[data-region]),
     so a /us/ page is always USA whatever is stored. This only remembers the
     visitor's edition: the edition of any edition page they open, or the one
     they pick in the switcher. Region-neutral pages (legal, 404) had the saved
     edition applied before paint by the layout; here they also get
     aria-current on the switcher and a breadcrumb "home" link that points at
     that edition's home (the logo always goes to the global home). */
  var REGION_KEY = '{{ site.data.regions.storage_key }}';
  var REGION_HOMES = { {%- for rid in site.data.regions.list -%}{{ rid | jsonify }}: {{ site.data.regions[rid].home | jsonify }}{% unless forloop.last %}, {% endunless %}{%- endfor -%} };
  var pageRegion = root.getAttribute('data-region');
  if(!root.hasAttribute('data-region-neutral')){
    if(REGION_HOMES[pageRegion]) store(REGION_KEY, pageRegion);   /* the global home (region "global") is not an edition: keep the last one */
  } else if(REGION_HOMES[pageRegion]){
    document.querySelectorAll('.region-opt').forEach(function(a){
      if(a.getAttribute('data-region-set') === pageRegion) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    var regionHome = MD_ROOT + REGION_HOMES[pageRegion];
    document.querySelectorAll('.breadcrumb ol > li:first-child > a').forEach(function(a){ a.setAttribute('href', regionHome); });
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('[data-region-set]');
    if(a && REGION_HOMES[a.getAttribute('data-region-set')]) store(REGION_KEY, a.getAttribute('data-region-set'));
  });

  /* Edition dropdown (<details>, works without JS). Adds: close on outside
     click / Escape (before the drawer's own Escape), Up/Down/Home/End between
     options, focus on the current option when opened from the keyboard. */
  var regionDd = document.getElementById('regionDd');
  if(regionDd){
    var regionBtn = regionDd.querySelector('summary');
    var regionOpts = function(){ return Array.prototype.slice.call(regionDd.querySelectorAll('.region-opt')); };
    var closeRegionDd = function(focusBtn){ regionDd.open = false; if(focusBtn) regionBtn.focus(); };
    var regionByKey = false;
    regionBtn.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' ') regionByKey = true;
      if((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !regionDd.open){ e.preventDefault(); regionByKey = true; regionDd.open = true; }
    });
    regionDd.addEventListener('toggle', function(){
      if(regionDd.open && regionByKey){
        var opts = regionOpts();
        var cur = regionDd.querySelector('.region-opt[aria-current="true"]') || opts[0];
        if(cur) cur.focus();
      }
      regionByKey = false;
    });
    regionDd.addEventListener('keydown', function(e){
      if(!regionDd.open) return;
      if(e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); closeRegionDd(true); return; }
      var opts = regionOpts();
      var i = opts.indexOf(document.activeElement);
      var next = -1;
      if(e.key === 'ArrowDown') next = i < 0 ? 0 : (i + 1) % opts.length;
      else if(e.key === 'ArrowUp') next = i <= 0 ? opts.length - 1 : i - 1;
      else if(e.key === 'Home') next = 0;
      else if(e.key === 'End') next = opts.length - 1;
      if(next > -1 && opts[next]){ e.preventDefault(); opts[next].focus(); }
    });
    document.addEventListener('click', function(e){
      if(regionDd.open && !regionDd.contains(e.target)) closeRegionDd(false);
    });
    regionDd.addEventListener('focusout', function(e){
      if(regionDd.open && e.relatedTarget && !regionDd.contains(e.relatedTarget)) closeRegionDd(false);
    });
    window.addEventListener('pageshow', function(){ regionDd.open = false; });
  }

  /* ---------- Inline navbar search (_includes/nav-search.html) ----------
     On every page, in the top bar: the visitor types straight into the bar and ranked results drop down
     under it, each tagged India / USA / UK. The index (assets/search.json, built from _data/search.yml) is
     fetched the first time the box gets focus. On an edition page that edition ranks first; the global home
     boosts none. Up/Down move, Enter opens the highlighted (or first) result, Escape closes, "/" or
     Ctrl/Cmd+K focuses the box. This replaced the full-screen search overlay (former career-search.html, deleted) on
     2026-10-10; every old opener (data-search-open buttons, #search, "Search all careers" links, the India
     home hub box) now focuses this box instead. */
  /* Search helpers shared by the overlay below and the global home's inline header search. */
  // "B.Com (Hons)" -> "b com hons"; dots dropped so "bcom" also matches.
  function norm(s){ return (s || '').toLowerCase().replace(/&/g, ' and ').replace(/\./g, '').replace(/[^a-z0-9+]+/g, ' ').trim(); }

  function score(e, q, words){
    var total = 0;
    for(var i = 0; i < words.length; i++){
      var w = words[i], best = 0;
      if((' ' + e.t).indexOf(' ' + w) !== -1) best = 30;
      else if(w.length > 2 && e.t.indexOf(w) !== -1) best = 18;
      else if((' ' + e.k).indexOf(' ' + w) !== -1) best = e.k.indexOf(w) === 0 ? 18 : 14;
      else if((' ' + e.s).indexOf(' ' + w) !== -1) best = 8;
      else if(w.length > 2 && (e.k + ' ' + e.s).indexOf(w) !== -1) best = 4;
      if(!best) return 0;          // every word has to match somewhere
      total += best;
    }
    if(e.t === q) total += 100;
    else if(e.t.indexOf(q) === 0) total += 50;
    else if(e.t.replace(/ /g, '').indexOf(q.replace(/ /g, '')) === 0) total += 40;
    return total;
  }

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function mark(text, words){
    var out = esc(text);
    words.forEach(function(w){
      if(w.length < 2) return;
      out = out.replace(new RegExp('(^|[^a-z0-9])(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '$1<mark>$2</mark>');
    });
    return out;
  }

  var navForm = document.getElementById('navSearchForm');
  if(navForm){
    var nsInput = document.getElementById('navSearch');
    var nsPop = document.getElementById('navSearchPop');
    var nsList = document.getElementById('navSearchList');
    var nsHead = document.getElementById('navSearchHead');
    var nsNote = document.getElementById('navSearchNote');
    var NS_MAX = 8;
    var NS_CATS = {};
    {{ site.data.search.categories | jsonify }}.forEach(function(c){ NS_CATS[c.id] = c.label; });
    var NS_ED = { usa: 'USA', uk: 'UK' };                         // search.yml category -> edition tag; anything else is India
    var NS_HOME_CAT = { 'in': 'india', us: 'usa', uk: 'uk' }[root.getAttribute('data-region')] || null;   // null on the global home
    var nsIndex = null, nsLoading = false, nsFailed = false, nsActive = -1;
    var RECENT_KEY = 'md-recent-search';
    var getRecent = function(){ try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch(err){ return []; } };
    var rememberResult = function(a){
      var item = { t: a.getAttribute('data-t'), u: (a.getAttribute('href') || '').replace(MD_ROOT, ''), c: a.getAttribute('data-c') };
      if(!item.t) return;
      var list = getRecent().filter(function(r){ return r.u !== item.u; });
      list.unshift(item);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6))); } catch(err){}
    };
    var edTag = function(c){ return NS_ED[c] || 'India'; };
    var optionHtml = function(d, j, words){
      return '<li><a role="option" id="nsr-' + j + '" aria-selected="false" class="nav-sr" href="' + esc(MD_ROOT + d.u) + '" data-t="' + esc(d.t) + '" data-c="' + esc(d.c || '') + '">' +
        '<span class="nav-sr-ed">' + esc(edTag(d.c)) + '</span>' +
        '<span class="nav-sr-main"><strong>' + mark(d.t, words) + '</strong>' + (d.s ? '<span>' + mark(d.s, words) + '</span>' : '') + '</span></a></li>';
    };

    var nsLoad = function(){
      if(nsIndex || nsLoading) return;
      nsLoading = true;
      fetch(MD_ROOT + 'assets/search.json').then(function(r){ if(!r.ok) throw r; return r.json(); }).then(function(data){
        nsIndex = data.map(function(d){ return { d: d, t: norm(d.t), s: norm(d.s), k: norm(d.k) + ' ' + norm(NS_CATS[d.c]) }; });
        nsLoading = false;
        if(document.activeElement === nsInput) nsRender();
      }).catch(function(){ nsLoading = false; nsFailed = true; if(document.activeElement === nsInput) nsRender(); });
    };
    var nsShow = function(open){
      nsPop.hidden = !open;
      nsInput.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(!open){ nsActive = -1; nsInput.removeAttribute('aria-activedescendant'); }
    };
    var nsSetActive = function(i){
      var opts = nsList.querySelectorAll('[role="option"]');
      if(!opts.length || i < 0){ nsActive = -1; nsInput.removeAttribute('aria-activedescendant'); opts.forEach(function(o){ o.setAttribute('aria-selected', 'false'); }); return; }
      nsActive = (i + opts.length) % opts.length;
      opts.forEach(function(o, j){ o.setAttribute('aria-selected', j === nsActive ? 'true' : 'false'); });
      nsInput.setAttribute('aria-activedescendant', opts[nsActive].id);
      opts[nsActive].scrollIntoView({ block: 'nearest' });
    };
    var nsRender = function(){
      var q = norm(nsInput.value);
      if(!q){
        // Empty box: recently viewed pages (this browser only), else nothing.
        var recent = getRecent();
        nsHead.hidden = !recent.length;
        nsList.innerHTML = recent.map(function(r, j){ return optionHtml({ t: r.t, u: r.u, c: r.c }, j, []); }).join('');
        nsNote.textContent = '';
        nsShow(recent.length > 0);
        nsSetActive(-1);
        return;
      }
      nsHead.hidden = true;
      nsShow(true);
      if(!nsIndex){
        nsList.innerHTML = '';
        nsNote.textContent = nsFailed ? 'Search could not load. Please check your connection and try again.' : 'Loading…';
        if(!nsFailed) nsLoad();
        return;
      }
      var words = q.split(' ');
      var hits = [];
      nsIndex.forEach(function(e, i){
        var sc = score(e, q, words);
        if(!sc) return;
        // Edition pages rank their own edition first (India = every category that is not usa / uk).
        if(NS_HOME_CAT && (NS_HOME_CAT === 'india' ? !NS_ED[e.d.c] : e.d.c === NS_HOME_CAT)) sc += 100;
        hits.push({ e: e, sc: sc, i: i });
      });
      hits.sort(function(a, b){ return b.sc - a.sc || a.i - b.i; });
      nsList.innerHTML = hits.slice(0, NS_MAX).map(function(h, j){ return optionHtml(h.e.d, j, words); }).join('');
      nsNote.textContent = !hits.length ? 'No match for “' + nsInput.value.trim() + '”. Try a shorter word, a course (BCA), an exam (NEET, SAT) or a job (doctor, solicitor).'
        : hits.length > NS_MAX ? 'Top ' + NS_MAX + ' of ' + hits.length + ' results. Type more to narrow it down.'
        : hits.length + (hits.length === 1 ? ' result' : ' results');
      nsSetActive(hits.length ? 0 : -1);
    };
    // Any other "search" control on a page (buttons with data-search-open, "Search all careers" links, the
    // India home hub box) now just puts the caret in this box. Closing the menu drawer first keeps it visible.
    var focusNavSearch = function(text){
      if(typeof setDrawer === 'function') setDrawer(false);
      if(typeof text === 'string') nsInput.value = text;
      nsInput.focus();   // same tick as the click / keystroke, so phones keep the keyboard open
      nsRender();
    };
    window.mdFocusSearch = focusNavSearch;

    nsInput.addEventListener('input', nsRender);
    nsInput.addEventListener('focus', function(){ nsLoad(); nsRender(); });
    nsInput.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown'){ e.preventDefault(); if(nsPop.hidden) nsRender(); else nsSetActive(nsActive + 1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); nsSetActive(nsActive - 1); }
      else if(e.key === 'Escape'){ if(!nsPop.hidden){ e.preventDefault(); nsShow(false); } else if(nsInput.value){ e.preventDefault(); nsInput.value = ''; } }
    });
    navForm.addEventListener('submit', function(e){
      e.preventDefault();
      var opts = nsList.querySelectorAll('[role="option"]');
      var pick = opts[nsActive] || (norm(nsInput.value) ? opts[0] : null);
      if(pick && !nsPop.hidden){ rememberResult(pick); window.location.href = pick.href; return; }
      nsInput.focus();
      nsRender();
    });
    nsList.addEventListener('click', function(e){ var a = e.target.closest('.nav-sr'); if(a) rememberResult(a); });
    document.addEventListener('click', function(e){ if(!navForm.contains(e.target)) nsShow(false); });
    navForm.addEventListener('focusout', function(e){ if(e.relatedTarget && !navForm.contains(e.relatedTarget)) nsShow(false); });
    document.addEventListener('keydown', function(e){
      var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if((e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) || ((e.key || '').toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))){
        e.preventDefault();
        focusNavSearch();
      }
    });
    window.addEventListener('pageshow', function(){ nsShow(false); });

    document.querySelectorAll('[data-search-open]').forEach(function(el){ el.addEventListener('click', function(e){ e.preventDefault(); focusNavSearch(); }); });
    // "Search all careers" links (india.html#careers from other pages; #careers on pages with no such section).
    var careersIsSearch = !document.getElementById('careers');
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest(careersIsSearch ? 'a[href="#careers"], a[href="india.html#careers"]' : 'a[href="india.html#careers"]');
      if(!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      focusNavSearch();
    });
    var hashOpens = function(){ return window.location.hash === '#search' || (careersIsSearch && window.location.hash === '#careers'); };
    if(hashOpens()) focusNavSearch();
    window.addEventListener('hashchange', function(){ if(hashOpens()) focusNavSearch(); });

    // India home hub box (india.html #hubSearchForm): the first keystroke moves the text into the top bar box,
    // so there is one result list.
    var hubForm = document.getElementById('hubSearchForm');
    if(hubForm){
      var hubInput = hubForm.querySelector('input');
      var hubHandoff = function(){ var v = hubInput.value; hubInput.value = ''; focusNavSearch(v); };
      hubInput.addEventListener('input', function(){ if(hubInput.value) hubHandoff(); });
      hubForm.addEventListener('submit', function(e){ e.preventDefault(); hubHandoff(); });
    }
  }

  /* Global home "Select Study Destination" menu (<details>, works without JS): close on outside click /
     Escape, Up/Down between options, and tag the edition this browser last opened (no layout shift:
     the tag sits inside the closed menu). */
  var gwDest = document.getElementById('gwDest');
  if(gwDest){
    var gwDestBtn = gwDest.querySelector('summary');
    var gwOpts = Array.prototype.slice.call(gwDest.querySelectorAll('.region-opt'));
    var lastEd = null;
    try { lastEd = localStorage.getItem(REGION_KEY); } catch(err){}
    gwOpts.forEach(function(a){
      if(a.getAttribute('data-region-set') === lastEd){ var tag = a.querySelector('.gw-dest-last'); if(tag) tag.hidden = false; }
    });
    document.addEventListener('click', function(e){ if(gwDest.open && !gwDest.contains(e.target)) gwDest.open = false; });
    gwDest.addEventListener('keydown', function(e){
      if(!gwDest.open) return;
      if(e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); gwDest.open = false; gwDestBtn.focus(); return; }
      var i = gwOpts.indexOf(document.activeElement), next = -1;
      if(e.key === 'ArrowDown') next = i < 0 ? 0 : (i + 1) % gwOpts.length;
      else if(e.key === 'ArrowUp') next = i <= 0 ? gwOpts.length - 1 : i - 1;
      if(next > -1){ e.preventDefault(); gwOpts[next].focus(); }
    });
    gwDest.addEventListener('focusout', function(e){ if(gwDest.open && e.relatedTarget && !gwDest.contains(e.relatedTarget)) gwDest.open = false; });
    window.addEventListener('pageshow', function(){ gwDest.open = false; });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function(faqItem){
    var btn = faqItem.querySelector('.faq-q');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var isOpen = faqItem.getAttribute('data-open') === 'true';
      var panel = faqItem.querySelector('.faq-a');
      if(isOpen){
        faqItem.setAttribute('data-open','false');
        btn.setAttribute('aria-expanded','false');
        if(panel) panel.style.maxHeight = null;
      } else {
        faqItem.setAttribute('data-open','true');
        btn.setAttribute('aria-expanded','true');
        if(panel) panel.style.maxHeight = panel.scrollHeight + 24 + 'px';
      }
    });
  });

  /* ---------- Scroll progress + back to top ---------- */
  var progressBar = document.getElementById('progressBar');
  var backToTop = document.getElementById('backToTop');
  function onScroll(){
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if(progressBar) progressBar.style.width = pct + '%';
    if(backToTop) backToTop.classList.toggle('is-visible', scrollTop > 500);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  if(backToTop){
    backToTop.addEventListener('click', function(){
      window.scrollTo({top:0, behavior: reduceMotion ? 'auto' : 'smooth'});
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  /* The CSS failsafe reveals everything 2.5 s after load unless html.md-ready is set. If this script
     arrived later than that (slow network), the failsafe has already shown the content: keep it shown. */
  var revealLate = window.performance && performance.now() > 2400;
  root.classList.add('md-ready');
  if(revealEls.length){
    if(reduceMotion || revealLate || !('IntersectionObserver' in window)){
      revealEls.forEach(function(el){ el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
        });
      }, {threshold:.12});
      revealEls.forEach(function(el){ observer.observe(el); });
    }
  }

  /* ---------- Read More / Read Less for long plain-text prose blocks ----------
     Auto-detects genuine long-form paragraph sections (e.g. "What is CA?")
     without touching tables, lists, FAQs, myth/fact, pros/cons, cards or
     roadmaps, since those never use a bare .prose block containing only
     <p> tags. Height is measured from real line-height so it works at any
     font-size/viewport instead of a fixed pixel cutoff. */
  function initReadMore(){
    var LINES_VISIBLE = 3;      // collapsed preview height
    var LINE_THRESHOLD = 5;     // only collapse if longer than this
    var blocks = document.querySelectorAll('.prose');
    blocks.forEach(function(block){
      // Only target plain paragraph content: skip anything with lists,
      // tables, or other structured/nested content.
      if(block.querySelector('ul,ol,table,div')) return;
      var paras = block.querySelectorAll('p');
      if(!paras.length) return;

      var lineHeight = parseFloat(getComputedStyle(block).lineHeight);
      if(!lineHeight || isNaN(lineHeight)){
        lineHeight = parseFloat(getComputedStyle(block).fontSize) * 1.5;
      }
      var fullHeight = block.scrollHeight;
      var thresholdHeight = lineHeight * LINE_THRESHOLD;
      if(fullHeight <= thresholdHeight) return; // short block, leave untouched

      var collapsedHeight = lineHeight * LINES_VISIBLE;
      block.classList.add('js-readmore');
      block.style.maxHeight = collapsedHeight + 'px';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'readmore-btn';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="rm-label">Read more</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
      block.insertAdjacentElement('afterend', btn);

      btn.addEventListener('click', function(){
        var expanded = block.classList.toggle('is-expanded');
        var label = btn.querySelector('.rm-label');
        if(expanded){
          block.style.maxHeight = fullHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
          if(label) label.textContent = 'Read less';
        } else {
          block.style.maxHeight = collapsedHeight + 'px';
          btn.setAttribute('aria-expanded', 'false');
          if(label) label.textContent = 'Read more';
          block.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest'});
        }
      });
    });
  }
  if(document.readyState === 'complete'){ initReadMore(); }
  else { window.addEventListener('load', initReadMore); }
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Folded supporting sections on India pathway and exam pages (global-platform Phase 15) =====
   main.css hides everything after .section-head in these sections while JS runs (no layout shift on
   load). This adds the Show/Hide button and window.mdFoldOpen(el), which revealTarget() calls so links,
   the "On this page" nav and #hash arrivals open the section they point into. Browsers without :has()
   never hide anything, so no buttons are added there. */
try {
(function(){
  "use strict";
  var main = document.getElementById('main');
  if(!main || !window.CSS || !CSS.supports || !CSS.supports('selector(:has(*))')) return;
  var sel = null;
  if(main.querySelector('#quick') && main.querySelector('#roadmap')) sel = '#subjects,#higher,#proscons,#future,#difficulty,#skills,section[aria-labelledby="myth-heading"],section[aria-labelledby="tips-heading"],section[aria-labelledby="comparison"]';
  else if(main.querySelector('#pattern') && main.querySelector('#syllabus')) sel = '#syllabus,#prep,section[aria-labelledby="comparison"]';
  if(!sel) return;
  var n = 0;
  function setOpen(sec, open){
    var btn = sec.querySelector(':scope > .container > .md-fold-btn');
    sec.classList.toggle('is-unfolded', open);
    if(!btn) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var h2 = sec.querySelector('.section-head h2');
    if(h2) btn.setAttribute('aria-label', (open ? 'Hide details: ' : 'Show details: ') + h2.textContent.trim());
    var label = btn.querySelector('.rm-label');
    if(label) label.textContent = open ? 'Hide details' : 'Show details';
    // Content that was display:none never started its scroll-reveal; show it now.
    if(open) sec.querySelectorAll('.reveal:not(.is-visible)').forEach(function(r){ r.classList.add('is-visible'); });
    if(open) window.dispatchEvent(new Event('md:unfold'));
  }
  main.querySelectorAll(sel).forEach(function(sec){
    if(sec.tagName !== 'SECTION') return;
    var head = sec.querySelector(':scope > .container > .section-head');
    if(!head) return;
    if(!sec.id) sec.id = 'fold-' + (++n);
    var h2 = head.querySelector('h2');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'readmore-btn md-fold-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', sec.id);
    if(h2) btn.setAttribute('aria-label', 'Show details: ' + h2.textContent.trim());
    btn.innerHTML = '<span class="rm-label">Show details</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    head.insertAdjacentElement('afterend', btn);
    // A stale cached main.css without the fold rule leaves the content visible: then no button.
    var first = btn.nextElementSibling;
    if(!first || getComputedStyle(first).display !== 'none'){ btn.remove(); return; }
    sec.classList.add('is-folded');
    btn.addEventListener('click', function(){ setOpen(sec, !sec.classList.contains('is-unfolded')); });
  });
  window.mdFoldOpen = function(el){
    var sec = el && el.closest && el.closest('section.is-folded');
    if(sec && !sec.classList.contains('is-unfolded')) setOpen(sec, true);
  };
  // Hash changes that do not go through a link click (address bar, back/forward).
  window.addEventListener('hashchange', function(){
    var id = window.location.hash.slice(1), el = null;
    try { el = id && document.getElementById(decodeURIComponent(id)); } catch(e){}
    if(el) window.mdFoldOpen(el);
  });
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Keyboard access to wide tables (global-platform Phase 16, WCAG 2.1.1) =====
   A .table-wrap that scrolls sideways gets tabindex="0" and role="region" named after its table caption or
   the nearest heading, so keyboard users can focus it and scroll with the arrow keys. Re-checked on resize. */
try {
(function(){
  "use strict";
  var wraps = document.querySelectorAll('.table-wrap');
  if(!wraps.length) return;
  function nameFor(w){
    var cap = w.querySelector('caption');
    if(cap && cap.textContent.trim()) return cap.textContent.trim();
    var sec = w.closest('section, .feature-card, .md-tile');
    var h = sec && sec.querySelector('h2, h3');
    return 'Table' + (h ? ': ' + h.textContent.trim() : '');
  }
  function update(){
    wraps.forEach(function(w){
      var scrolls = w.scrollWidth > w.clientWidth + 1;
      if(scrolls && !w.hasAttribute('tabindex')){
        w.setAttribute('tabindex', '0'); w.setAttribute('role', 'region'); w.setAttribute('aria-label', nameFor(w));
        w.setAttribute('data-kbd-scroll', '');
      } else if(!scrolls && w.hasAttribute('data-kbd-scroll')){
        w.removeAttribute('tabindex'); w.removeAttribute('role'); w.removeAttribute('aria-label'); w.removeAttribute('data-kbd-scroll');
      }
    });
  }
  update();
  var t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(update, 200); }, {passive:true});
  window.addEventListener('load', update);
  window.addEventListener('md:unfold', update);
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Accessible names that contain the visible label (global-platform Phase 16, WCAG 2.5.3) =====
   About 576 India links show "View guide" but are named "Read the CA guide", so a voice-control user who
   says "click View guide" gets no match. The page HTML is protected, so the name is adjusted here:
   "Read the CA guide" becomes "View guide: CA"; any other mismatch becomes "<visible text>: <old name>". */
try {
(function(){
  "use strict";
  document.querySelectorAll('a[aria-label], button[aria-label]').forEach(function(el){
    if(el.children.length && el.querySelector('svg') && !el.textContent.trim()) return;
    var vis = el.textContent.replace(/s+/g, ' ').trim();
    var lab = el.getAttribute('aria-label');
    if(!vis || !lab || lab.toLowerCase().indexOf(vis.toLowerCase()) !== -1) return;
    var m = lab.match(/^Read the (.+) guide$/i);
    el.setAttribute('aria-label', vis + ': ' + (m ? m[1] : lab));
  });
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Comparison accordions (.md-matrix) =====
   Closed in the HTML so phones (< 640px) see one text line instead of a long table. On wider
   screens open them on load; before printing open them all. */
try {
(function(){
  "use strict";
  var mx = document.querySelectorAll('details.md-matrix');
  if(!mx.length) return;
  if(window.matchMedia && window.matchMedia('(min-width: 640px)').matches) mx.forEach(function(d){ d.open = true; });
  window.addEventListener('beforeprint', function(){ mx.forEach(function(d){ d.open = true; }); });
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Source chips (.md-src, global design system) =====
   Native <details>, so they open and close without JS. This adds: one open at a time, close on
   outside click and on Escape (focus returns to the chip), and flip the pop-over to the right edge
   when it would overflow the viewport (phones use a bottom sheet in CSS instead). */
try {
(function(){
  "use strict";
  var chips = document.querySelectorAll('.md-src');
  if(!chips.length) return;
  chips.forEach(function(d){
    d.addEventListener('toggle', function(){
      if(!d.open) return;
      chips.forEach(function(o){ if(o !== d) o.open = false; });
      var pop = d.querySelector('.md-src-pop');
      d.removeAttribute('data-align');
      if(pop && pop.getBoundingClientRect().right > document.documentElement.clientWidth - 8) d.setAttribute('data-align', 'end');
    });
  });
  document.addEventListener('click', function(e){ chips.forEach(function(d){ if(d.open && !d.contains(e.target)) d.open = false; }); });
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    chips.forEach(function(d){ if(d.open){ d.open = false; d.querySelector('summary').focus(); } });
  });
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Block 2: career groups, in-page anchors, on-this-page nav, scroll-spy ===== */
try {
(function(){
  "use strict";

  /* ---------- Collapsible career groups (accordion bars) ----------
     Stream hub pages (science, commerce, arts, diploma, iti, govt-exams) only write
     plain markup:  <h3 class="career-group-heading" data-icon="…">Title</h3>
     followed by    <ul class="career-grid">…career-item links…</ul>
     This turns every such pair into a full-width accordion bar (number
     badge, icon, title, count, chevron); clicking the bar slides its list
     open, clicking again slides it closed. Collapsed lists stay in the DOM
     (CSS grid-row collapse, not display:none), so every career link stays
     crawlable. Optional: data-unit="trades" on the section changes the
     "N careers" label. */
  var cgIcons = {
    finance:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h4"/>',
    business:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    law:'<path d="M12 3v18M7 21h10M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>',
    markets:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-6"/><path d="M15 8h5v5"/>',
    economics:'<path d="M21 12a9 9 0 1 1-9-9v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    engineering:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    computer:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    medical:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    lab:'<path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3"/><path d="M7 15h10"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    mind:'<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    education:'<path d="M12 3l10 5-10 5L2 8z"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/>',
    media:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
    language:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
    government:'<path d="M3 21h18M4 10h16M12 3l9 5H3z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
    design:'<path d="M12 19l7-7 3 3-7 7z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
    arts:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    travel:'<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    library:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    factory:'<path d="M2 20h20V9l-6 4V9l-6 4V4H2z"/><path d="M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/>',
    architecture:'<path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/>',
    agriculture:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    hospitality:'<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><path d="M6 1v3M10 1v3M14 1v3"/>',
    electrical:'<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>',
    tools:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    vehicle:'<rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    construction:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    electronics:'<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
    hvac:'<path d="M14 14.8V4.5a2.5 2.5 0 0 0-5 0v10.3a4.5 4.5 0 1 0 5 0z"/>',
    textile:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
    bank:'<path d="M3 21h18M3 10h18M12 3l9 7H3z"/><path d="M5 10v11M19 10v11M9.5 14h5M9.5 17.5h5"/>',
    train:'<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M12 3v8M8 21l2-4M16 21l-2-4"/><circle cx="8.5" cy="14" r=".6"/><circle cx="15.5" cy="14" r=".6"/>'
  };
  function cgSvg(paths, size, width){
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + width + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var cgChevron = cgSvg('<path d="M6 9l6 6 6-6"/>', 16, 2.4);
  var cgArrow = cgSvg('<path d="M5 12h14M13 6l6 6-6 6"/>', 14, 2.4);
  function cgPad(n){ return (n < 10 ? '0' : '') + n; }

  var cgGroups = [];

  function cgSetOpen(g, open){
    g.wrap.classList.toggle('is-open', open);
    g.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function cgFind(el){
    var wrap = el && el.closest('.career-group');
    for(var i = 0; i < cgGroups.length; i++){ if(cgGroups[i].wrap === wrap) return cgGroups[i]; }
    return null;
  }

  document.querySelectorAll('h3.career-group-heading').forEach(function(h, i){
    var list = h.nextElementSibling;
    if(!list || !list.classList.contains('career-grid')) return;
    if(!h.id) h.id = 'career-group-' + (i + 1);
    var panelId = h.id + '-panel';
    var title = h.textContent.trim();
    var section = h.closest('section');
    var unit = (section && section.getAttribute('data-unit')) || 'careers';
    var itemEls = list.querySelectorAll('.career-item');
    var count = itemEls.length;
    var countLabel = count + ' ' + (count === 1 ? unit.replace(/s$/, '') : unit);

    var wrap = document.createElement('div');
    wrap.className = 'career-group';
    h.parentNode.insertBefore(wrap, h);

    var head = document.createElement('div');
    head.className = 'career-group-head';
    wrap.appendChild(head);

    var num = document.createElement('span');
    num.className = 'career-group-num';
    num.setAttribute('aria-hidden', 'true');
    head.appendChild(num);

    var icon = document.createElement('span');
    icon.className = 'career-group-icon';
    icon.innerHTML = cgSvg(cgIcons[h.getAttribute('data-icon')] || cgIcons.business, 18, 2);
    head.appendChild(icon);

    // Heading text moves into a real <button> inside the <h3> (accessible
    // accordion pattern); h3.textContent stays the plain title for the
    // "On this page" sidebar.
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'career-group-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', panelId);
    toggle.textContent = title;
    h.textContent = '';
    h.appendChild(toggle);
    head.appendChild(h);

    var countEl = document.createElement('span');
    countEl.className = 'career-group-count';
    countEl.textContent = countLabel;
    head.appendChild(countEl);

    var chev = document.createElement('span');
    chev.className = 'career-group-chevron';
    chev.innerHTML = cgChevron;
    head.appendChild(chev);

    var panel = document.createElement('div');
    panel.className = 'career-group-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', h.id);
    var inner = document.createElement('div');
    inner.className = 'career-group-inner';
    panel.appendChild(inner);
    wrap.appendChild(panel);
    list.classList.remove('reveal');
    inner.appendChild(list);

    itemEls.forEach(function(item){
      var a = item.querySelector('a');
      if(!a || a.querySelector('.career-cta')) return;
      var cta = document.createElement('span');
      cta.className = 'career-cta';
      cta.setAttribute('aria-hidden', 'true');
      cta.innerHTML = 'Explore' + cgArrow;
      a.appendChild(cta);
    });

    var g = { wrap: wrap, toggle: toggle, num: num };
    cgGroups.push(g);
    toggle.addEventListener('click', function(){ cgSetOpen(g, !wrap.classList.contains('is-open')); });
  });

  // Bars that sit together in one parent form a block: wrap them in
  // .career-groups and number them 01, 02… within that block.
  var cgBlocks = [];
  cgGroups.forEach(function(g){
    var last = cgBlocks[cgBlocks.length - 1];
    if(last && last.parent === g.wrap.parentNode){ last.groups.push(g); }
    else { cgBlocks.push({ parent: g.wrap.parentNode, groups: [g] }); }
  });
  cgBlocks.forEach(function(block){
    var stack = document.createElement('div');
    stack.className = 'career-groups';
    block.parent.insertBefore(stack, block.groups[0].wrap);
    block.groups.forEach(function(g, idx){
      g.num.textContent = cgPad(idx + 1);
      stack.appendChild(g.wrap);
    });
  });

  /* ---------- In-page anchor scrolling ----------
     Every #anchor jump (sidebar, mobile panel, quicknav, links in copy,
     an incoming URL hash) goes through scrollToTarget(): first open any
     collapsed container around the target, then smooth-scroll it to sit
     just below the sticky header. The stop position comes from CSS
     scroll-margin-top (--scroll-offset in main.css), so JS never
     hardcodes header heights. */
  var reduceMotion = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false;
  var rootEl = document.documentElement;

  // Sticky .quicknav-bar sits under the header below 1200px; publish its
  // real height so --scroll-offset clears it exactly.
  var quicknavBar = document.querySelector('.quicknav-bar');
  function measureQuicknav(){
    if(quicknavBar && quicknavBar.offsetHeight) rootEl.style.setProperty('--quicknav-h', quicknavBar.offsetHeight + 'px');
  }
  measureQuicknav();
  window.addEventListener('resize', measureQuicknav, {passive:true});

  // Open whatever is hiding the target: career-group bar, <details>,
  // FAQ answer, or a "Read more" prose block.
  function revealTarget(el){
    if(window.mdStageReveal) window.mdStageReveal(el);
    if(window.mdFoldOpen) window.mdFoldOpen(el);
    var g = cgFind(el);
    if(g && !g.wrap.classList.contains('is-open')) cgSetOpen(g, true);
    for(var d = el.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')){ d.open = true; }
    var faq = el.closest('.faq-item');
    if(faq && faq.getAttribute('data-open') !== 'true' && el.closest('.faq-a')){
      var q = faq.querySelector('.faq-q');
      if(q) q.click();
    }
    var rm = el.closest('.prose.js-readmore');
    if(rm && !rm.classList.contains('is-expanded')){
      var rmBtn = rm.nextElementSibling;
      if(rmBtn && rmBtn.classList.contains('readmore-btn')) rmBtn.click();
    }
    // A not-yet-revealed .reveal ancestor is still translated 14px down;
    // settle it instantly so the scroll lands on its final position.
    var rv = el.closest('.reveal');
    if(rv && !rv.classList.contains('is-visible')){
      rv.style.transition = 'none';
      rv.classList.add('is-visible');
      void rv.offsetHeight;
      rv.style.transition = '';
    }
  }

  var scrollLockUntil = 0;   // while > now, scroll-spy keeps the clicked link active
  var scrollToken = 0;       // a newer jump cancels the previous one's settle step
  function scrollToTarget(el, smooth){
    var token = ++scrollToken;
    revealTarget(el);
    var behavior = (smooth && !reduceMotion) ? 'smooth' : 'instant';
    scrollLockUntil = Date.now() + (behavior === 'smooth' ? 1200 : 150);
    // One frame so opened containers / a just-closed mobile panel lay out first.
    window.requestAnimationFrame(function(){
      el.scrollIntoView({behavior: behavior, block: 'start'});
      // Fonts, images or a late layout shift can nudge the target while
      // the smooth scroll runs; snap the last few px once it settles.
      var settled = false;
      function settle(){
        if(settled) return;
        settled = true;
        window.removeEventListener('scrollend', settle);
        if(token !== scrollToken) return;
        var want = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        var drift = el.getBoundingClientRect().top - want;
        var atBottom = window.innerHeight + window.scrollY >= rootEl.scrollHeight - 2;
        if(Math.abs(drift) > 3 && Math.abs(drift) < 80 && !(drift > 0 && atBottom)){
          window.scrollBy({top: drift, behavior: 'instant'});
        }
        scrollLockUntil = 0;
        if(typeof updateActive === 'function') updateActive();
      }
      if('onscrollend' in window) window.addEventListener('scrollend', settle);
      setTimeout(settle, behavior === 'smooth' ? 1100 : 60);
    });
  }

  // #main (skip link) keeps its own behaviour.
  function targetFromHash(hash){
    if(!hash || hash.length < 2 || hash === '#main') return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch(e){ return null; }
  }

  // Generic in-page links (quicknav, links in copy). Sidebar / mobile
  // panel links are handled by handleNavClick below, which runs first.
  document.addEventListener('click', function(e){
    if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href^="#"]');
    if(!a) return;
    var target = targetFromHash(a.getAttribute('href'));
    if(!target) return;
    e.preventDefault();
    if(history.pushState) history.pushState(null, '', a.getAttribute('href'));
    scrollToTarget(target, true);
  });

  var updateActive = null;   // assigned once the "On this page" nav exists

  // Arriving with #hash in the URL: the browser jumps before this script
  // has opened groups / rebuilt the layout, so redo the jump once loaded.
  function scrollToInitialHash(){
    var target = targetFromHash(window.location.hash);
    if(target) scrollToTarget(target, false);
  }
  if(window.location.hash){
    var initialTarget = targetFromHash(window.location.hash);
    if(initialTarget) revealTarget(initialTarget);
    if(document.readyState === 'complete') window.requestAnimationFrame(scrollToInitialHash);
    else window.addEventListener('load', scrollToInitialHash);
  }

  /* ---------- "On this page" navigation ----------
     Auto-generated, site-wide, from the page's own headings whenever
     there's enough content to be worth navigating — this is the ONLY
     condition; the existing .quicknav-bar (where present) is left exactly
     as it is and the two coexist. Any page with 4+ real h2[id] sections
     (or h3.career-group-heading categories) gets the sidebar/mobile-toggle
     automatically, including pages added in the future. */
  var main = document.getElementById('main');
  if(!main || main.hasAttribute('data-no-page-nav')) return;   /* full-width pages opt out (global home) */

  var headingEls = Array.prototype.filter.call(
    main.querySelectorAll('h2[id], h3.career-group-heading[id]'),
    function(h){ return h.textContent.trim().length > 0; }
  );
  if(headingEls.length < 4) return;

  // The sidebar is about to be built for this page. Mark any existing
  // .quicknav-bar so CSS can hide it at the same breakpoint the sidebar
  // shows at — the two must never both be visible at once. Pages with no
  // sidebar (fewer than 4 headings) leave .quicknav-bar untouched.
  if(quicknavBar) quicknavBar.classList.add('has-sidebar-nav');

  var items = headingEls.map(function(h){ return { id: h.id, text: h.textContent.trim() }; });

  function buildList(){
    var ol = document.createElement('ol');
    items.forEach(function(item){
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + item.id;
      a.textContent = item.text;
      li.appendChild(a);
      ol.appendChild(li);
    });
    return ol;
  }

  // Move everything after the page's hero (its first element) into a
  // .page-nav-content wrapper, then rebuild that plus a .page-nav sidebar
  // as a real two-column grid (.page-nav-layout). This keeps the nav a
  // proper grid column — never a floating box that can drift over content
  // — and lets the grid collapse to a single column below 1200px.
  var heroEl = main.firstElementChild;
  var contentWrap = document.createElement('div');
  contentWrap.className = 'page-nav-content';
  var node = heroEl ? heroEl.nextElementSibling : main.firstElementChild;
  while(node){
    var next = node.nextElementSibling;
    contentWrap.appendChild(node);
    node = next;
  }

  var layout = document.createElement('div');
  layout.className = 'page-nav-layout';
  layout.appendChild(contentWrap);

  // Desktop / tablet sidebar (grid column, sticky within it)
  var nav = document.createElement('nav');
  nav.className = 'page-nav';
  nav.setAttribute('aria-label', 'On this page');
  var navHeading = document.createElement('h2');
  navHeading.textContent = 'On this page';
  nav.appendChild(navHeading);
  nav.appendChild(buildList());
  layout.appendChild(nav);

  main.appendChild(layout);

  // Mobile compact toggle — only added when this page has no existing
  // .quicknav-bar. Pages that already have one keep using it at every
  // width below the sidebar breakpoint, so mobile never shows two nav
  // systems at once; the sidebar (desktop-only) is the only new UI those
  // pages gain.
  if(!quicknavBar){
    var mWrap = document.createElement('div');
    mWrap.className = 'page-nav-mobile';
    mWrap.innerHTML = '<button type="button" class="page-nav-mobile-toggle" aria-expanded="false" aria-controls="pageNavMobilePanel">' +
      '<span>On this page</span>' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      '</button><div class="page-nav-mobile-panel" id="pageNavMobilePanel"></div>';
    contentWrap.insertBefore(mWrap, contentWrap.firstChild);
    var mPanel = mWrap.querySelector('.page-nav-mobile-panel');
    mPanel.appendChild(buildList());
    var mBtn = mWrap.querySelector('.page-nav-mobile-toggle');
    mBtn.addEventListener('click', function(){
      var open = mPanel.classList.toggle('is-open');
      mBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function handleNavClick(e){
    var a = e.target.closest('a[href^="#"]');
    if(!a) return;
    var target = targetFromHash(a.getAttribute('href'));
    if(!target) return;
    e.preventDefault();
    // Close the mobile panel first: it sits above the content, so the
    // target's position is only final once the panel has collapsed.
    if(mPanel) mPanel.classList.remove('is-open');
    if(mBtn) mBtn.setAttribute('aria-expanded', 'false');
    if(history.pushState) history.pushState(null, '', a.getAttribute('href'));
    // Land on the START of the section (its top edge), not mid-way at the heading.
    var pi = headingEls.indexOf(target);
    var dest = pi > -1 ? spyPoints[pi] : target;
    forcedId = target.id;
    setActive(target.id);
    scrollToTarget(dest, true);
  }
  nav.addEventListener('click', handleNavClick);
  if(mPanel) mPanel.addEventListener('click', handleNavClick);

  /* Active-section highlight (scroll-spy) — sidebar, mobile panel and,
     below 1200px, the quicknav chips. The active section is the last
     heading whose top has passed the sticky-header line; at the very
     bottom of the page the last visible heading wins, so short final
     sections still light up. */
  var spyLinks = [];   // { a, id } for sidebar + mobile panel
  nav.querySelectorAll('a').forEach(function(a){ spyLinks.push({ a: a, id: a.getAttribute('href').slice(1) }); });
  if(mPanel) mPanel.querySelectorAll('a').forEach(function(a){ spyLinks.push({ a: a, id: a.getAttribute('href').slice(1) }); });
  // Quicknav chips usually point at the <section>, not the heading.
  var chipLinks = [];
  if(quicknavBar){
    quicknavBar.querySelectorAll('a[href^="#"]').forEach(function(a){
      var t = targetFromHash(a.getAttribute('href'));
      if(t) chipLinks.push({ a: a, target: t });
    });
  }
  var activeId = null;
  var forcedId = null;   // clicked item stays lit (even if the last sections cannot reach the top) until the reader scrolls themselves
  ["wheel","touchmove","keydown"].forEach(function(ev){ window.addEventListener(ev, function(){ forcedId = null; }, {passive:true}); });

  function keepVisible(container, link, horizontal){
    if(!container || !link.offsetParent) return;
    var c = container.getBoundingClientRect(), l = link.getBoundingClientRect(), pad = 24;
    if(horizontal){
      if(container.scrollWidth <= container.clientWidth) return;
      if(l.left < c.left + pad) container.scrollLeft -= (c.left + pad - l.left);
      else if(l.right > c.right - pad) container.scrollLeft += (l.right - (c.right - pad));
    } else {
      if(container.scrollHeight <= container.clientHeight) return;
      if(l.top < c.top + pad) container.scrollTop -= (c.top + pad - l.top);
      else if(l.bottom > c.bottom - pad) container.scrollTop += (l.bottom - (c.bottom - pad));
    }
  }

  function setActive(id){
    if(id === activeId) return;
    activeId = id;
    var heading = id ? document.getElementById(id) : null;
    spyLinks.forEach(function(s){
      var on = s.id === id;
      s.a.classList.toggle('is-active', on);
      if(on){ s.a.setAttribute('aria-current', 'location'); if(nav.contains(s.a)) keepVisible(nav, s.a, false); }
      else s.a.removeAttribute('aria-current');
    });
    // Chip for the active section, or the nearest one before it when that
    // section has no chip of its own (e.g. Myths, category bars).
    var chipOn = null;
    if(heading){
      chipLinks.forEach(function(c){
        if(c.target === heading || c.target.contains(heading) ||
           (c.target.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING)) chipOn = c;
      });
    }
    chipLinks.forEach(function(c){
      var on = c === chipOn;
      c.a.classList.toggle('is-active', on);
      if(on) c.a.setAttribute('aria-current', 'location'); else c.a.removeAttribute('aria-current');
    });
    if(chipOn) keepVisible(chipOn.a.closest('.quicknav') || chipOn.a.parentElement, chipOn.a, true);
  }

  // Where each section "starts" for the spy: an h2 that opens a
  // <section id> is measured from that section's top (quicknav chips jump
  // there, above the heading's padding); anything else from itself.
  var spyPoints = headingEls.map(function(h){
    var sec = h.tagName === 'H2' ? h.closest('section[id]') : null;
    return (sec && sec.querySelector('h2[id]') === h) ? sec : h;
  });
  // Each point's own scroll-margin (career-group bars sit 1rem lower),
  // re-read on resize since --scroll-offset changes at 1200px.
  var spyMargins = [];
  function readSpyMargins(){
    spyMargins = spyPoints.map(function(p){ return parseFloat(getComputedStyle(p).scrollMarginTop) || 0; });
  }
  readSpyMargins();
  window.addEventListener('resize', readSpyMargins, {passive:true});

  updateActive = function(){
    if(Date.now() < scrollLockUntil) return;
    if(forcedId){ setActive(forcedId); return; }
    var current = null, lastVisible = null;
    headingEls.forEach(function(h, i){
      if(!h.getClientRects().length) return;   // hidden heading
      if(spyPoints[i].getBoundingClientRect().top <= spyMargins[i] + 12) current = h;
      if(h.getBoundingClientRect().top < window.innerHeight) lastVisible = h;
    });
    if(window.innerHeight + window.scrollY >= rootEl.scrollHeight - 2 && lastVisible) current = lastVisible;
    setActive(current ? current.id : null);
  };

  var spyQueued = false;
  function queueSpy(){
    if(spyQueued) return;
    spyQueued = true;
    window.requestAnimationFrame(function(){ spyQueued = false; updateActive(); });
  }
  window.addEventListener('scroll', queueSpy, {passive:true});
  window.addEventListener('resize', queueSpy, {passive:true});
  updateActive();
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Block 3: salary ranking ===== */
try {
(function(){
  "use strict";
  /* ---------- Salary ranking: show top rows, expand on demand ----------
     Stream hubs mark the ranking table with .rank-collapse; CSS hides rows
     after the first 5 until the wrapper gets .is-expanded, so the collapsed
     state is painted on first render (no layout shift). The toggle button
     sits right after the wrapper in the markup. */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-rank-toggle]').forEach(function(btn){
    var wrap = document.getElementById(btn.getAttribute('aria-controls'));
    if(!wrap) return;
    var label = btn.querySelector('[data-rank-label]');
    var rows = wrap.querySelectorAll('tbody tr').length;
    var unit = wrap.getAttribute('data-rank-unit') || 'careers';
    var moreText = 'Show all ' + rows + ' ' + unit + ' — full salary ranking';
    btn.addEventListener('click', function(){
      var open = wrap.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(label) label.textContent = open ? 'Show less — top 5 only' : moreText;
      if(!open && wrap.getBoundingClientRect().top < 0){
        wrap.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'});
      }
    });
  });
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Block 4: breadcrumb trail ===== */
try {
(function(){
  "use strict";
  /* ---------- Breadcrumb trail: Home > Science > CSE > JEE Main > Coaching ----------
     Career and exam pages decorate their links to exam pages and to the coaching / college
     finders with the path taken so far:  ?from=<stream>&via=<career page>&exam=<exam page>.
     A page opened with those params rebuilds its breadcrumb from them (labels come from
     assets/crumb-map.json). Without params nothing changes, so plain visits and no-JS keep
     the static breadcrumb. */
  var ol = document.querySelector('.crumb-bar .breadcrumb ol');
  var main = document.getElementById('main');
  if(!ol || !main) return;
  var EXAMS = {{ site.data.explorer.exam_pages | jsonify }};
  var STREAMS = ['science', 'commerce', 'arts', 'diploma', 'iti', 'govt-exams'];
  var SLUG = /^[a-z0-9-]+$/;
  var q = new URLSearchParams(window.location.search);
  function param(k){ var v = q.get(k); return v && SLUG.test(v) ? v : ''; }
  var slug = (window.location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  var items = ol.querySelectorAll('li');
  if(items.length < 2) return;
  var parentA = items.length > 2 ? items[1].querySelector('a') : null;
  var parentSlug = parentA ? parentA.getAttribute('href').replace(/[?#].*$/, '').replace(/\.html$/, '') : '';
  var onExam = EXAMS.indexOf(slug) > -1;

  var from = param('from'), via = param('via'), exam = param('exam');
  var hasTrail = !!(from || via || exam);
  /* A career page (its crumb parent is a stream hub) starts its own trail. */
  if(!from && !via && STREAMS.indexOf(parentSlug) > -1){ from = parentSlug; via = slug; }

  /* ---- 1. carry the trail on outgoing links ---- */
  if((from && via) || onExam){
    main.querySelectorAll('a[href]').forEach(function(a){
      var m = /^([a-z0-9-]+)\.html(\?[^#]*)?(#.*)?$/.exec(a.getAttribute('href'));
      if(!m || m[1] === slug) return;
      var t = m[1];
      var finder = t === 'coaching' || t === 'colleges' || /^(coaching|colleges)-/.test(t);
      if(!finder && EXAMS.indexOf(t) < 0) return;
      var add = [], have = m[2] || '';
      /* on an exam page the finder opens for THIS exam, replacing any generic exam key already in the link */
      if(finder && onExam) have = have.replace(/([?&])exam=[^&]*&?/, '$1').replace(/[?&]$/, '');
      function put(k, v){ if(v && have.indexOf(k + '=') < 0) add.push(k + '=' + v); }
      if(from && via){ put('from', from); put('via', via); }
      if(finder && onExam) put('exam', slug);
      if(!add.length) return;
      a.setAttribute('href', t + '.html' + (have ? have + '&' : '?') + add.join('&') + (m[3] || ''));
    });
  }

  /* ---- 2. rebuild the breadcrumb when this page was opened with a trail ---- */
  if(!hasTrail) return;
  fetch(SCRIPT_ROOT + 'assets/crumb-map.json', { credentials: 'same-origin' }) /* prefix: works on nested pages too */
    .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(map){
      var trail = [], seen = {};
      seen[slug] = true;
      function add(s, href){
        if(!s || seen[s] || !map[s]) return;
        seen[s] = true;
        trail.push({ label: map[s].l, href: href });
      }
      var tp = (from && via ? '?from=' + from : '');
      add(from, from + '.html');
      add(via, via + '.html' + tp);
      add(exam, exam + '.html' + (from && via ? '?from=' + from + '&via=' + via : ''));
      if(parentA && parentSlug){ if(!seen[parentSlug]){ seen[parentSlug] = true; trail.push({ label: parentA.textContent, href: parentA.getAttribute('href') }); } }
      var current = items[items.length - 1];
      var frag = document.createDocumentFragment();
      frag.appendChild(items[0]);
      trail.forEach(function(t){
        var li = document.createElement('li'), a = document.createElement('a');
        a.href = t.href; a.textContent = t.label;
        li.appendChild(a); frag.appendChild(li);
      });
      frag.appendChild(current);
      ol.innerHTML = '';
      ol.appendChild(frag);
    })
    .catch(function(){ /* keep the static breadcrumb */ });
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Block 5: feedback overlay + header edition dropdown ===== */
try {
(function(){
  "use strict";
  /* Floating Feedback button (_includes/feedback.html): without JS it is a link to contact.html;
     here it opens the <dialog> instead. Browsers without <dialog> keep the plain link. */
  var fab = document.getElementById('feedbackOpen');
  var dlg = document.getElementById('feedbackDialog');
  if(fab && dlg && typeof dlg.showModal === 'function'){
    fab.setAttribute('role', 'button');
    fab.addEventListener('click', function(e){
      e.preventDefault();
      dlg.showModal();
      var close = dlg.querySelector('[data-fb-close]');
      if(close) close.focus();
    });
    fab.addEventListener('keydown', function(e){ if(e.key === ' '){ e.preventDefault(); fab.click(); } });
    dlg.addEventListener('click', function(e){
      if(e.target === dlg || (e.target.closest && e.target.closest('[data-fb-close]'))) dlg.close();
    });
    dlg.addEventListener('close', function(){ fab.focus(); });
    var copy = dlg.querySelector('[data-fb-copy]');
    var status = dlg.querySelector('.fb-status');
    if(copy){
      if(!navigator.clipboard){ copy.hidden = true; }
      else copy.addEventListener('click', function(){
        navigator.clipboard.writeText(copy.getAttribute('data-fb-copy')).then(function(){
          if(status) status.textContent = 'Email address copied.';
        }, function(){
          if(status) status.textContent = 'Could not copy. Please select the address above.';
        });
      });
    }
  }

  /* Header edition dropdown (_includes/header-edition.html): close on outside click and Escape. */
  var hd = document.getElementById('hdEdition');
  if(hd){
    document.addEventListener('click', function(e){ if(hd.open && !hd.contains(e.target)) hd.open = false; });
    hd.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && hd.open){ e.preventDefault(); e.stopPropagation(); hd.open = false; hd.querySelector('summary').focus(); }
    });
    window.addEventListener('pageshow', function(){ hd.open = false; });
  }
})();
} catch (e) { if (window.console) console.error(e); }

/* ===== Stage filter on India pathway pages (_includes/in-career.html, .stage-bar) =====
   "Where are you now?" — the reader picks a stage; sections that matter less at that stage are hidden
   (with their "On this page" links), up to three sections are promoted as "Start here", and one next-step
   page is suggested. The choice is kept in this browser (md-stage) so every career page opens the same way.
   Nothing is removed: "Show them" brings the hidden sections back, and any link or #hash that points into a
   hidden section opens it (window.mdStageReveal, called by revealTarget). Section ids are the same on all
   122 pathway pages (quick, what, who, eligibility, subjects, admission, roadmap, exam, fees, salary, jobs,
   higher, future, proscons, faq …); ids a page does not have are skipped. */
try {
(function(){
  "use strict";
  var bar = document.querySelector('[data-stage-bar]');
  var main = document.getElementById('main');
  if(!bar || !main) return;
  var ROOT = SCRIPT_ROOT;
  var KEY = 'md-stage';
  var STAGES = {
    school: { name: 'Class 10 or below', focus: ['what', 'who', 'subjects', 'eligibility'],
      hide: ['admission', 'fees', 'higher', 'exam', 'pattern', 'syllabus', 'papers', 'passing', 'exemptions', 'specialisations', 'mobility'],
      next: { href: 'after-10th.html', label: 'Choosing a stream after Class 10' } },
    hs: { name: 'Class 11–12', focus: ['eligibility', 'admission', 'exam', 'roadmap', 'fees'],
      hide: ['higher'],
      next: { href: 'after-12th.html', label: 'All courses after Class 12' } },
    grad: { name: 'In college', focus: ['higher', 'jobs', 'salary'],
      hide: ['who', 'subjects'],
      next: { href: 'study-abroad.html', label: 'Master’s and study-abroad routes' } },
    pro: { name: 'Graduate / working', focus: ['higher', 'jobs', 'salary', 'future'],
      hide: ['who', 'subjects', 'admission', 'fees'],
      next: { href: 'govt-exams.html', label: 'Government exams open to graduates' } }
  };
  var opts = bar.querySelectorAll('.stage-opt');
  var out = bar.querySelector('.stage-out');
  function sec(id){ var s = document.getElementById(id); return s && s.tagName === 'SECTION' && main.contains(s) ? s : null; }
  function nameOf(s){
    var chip = document.querySelector('.quicknav a[href="#' + s.id + '"]');
    var h = s.querySelector('h2');
    return ((chip && chip.textContent) || (h && h.textContent) || s.id).trim();
  }
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  // "On this page" links (sidebar, mobile panel, quicknav chips) that point at a section or its heading.
  function linksFor(s){
    var ids = [s.id], h = s.querySelector('h2[id]');
    if(h) ids.push(h.id);
    var found = [];
    ids.forEach(function(id){
      document.querySelectorAll('.page-nav a[href="#' + id + '"], .page-nav-mobile a[href="#' + id + '"], .quicknav a[href="#' + id + '"]').forEach(function(a){ found.push(a); });
    });
    return found;
  }
  function showSec(s){
    s.classList.remove('stage-off');
    linksFor(s).forEach(function(a){ a.classList.remove('stage-off-link'); });
  }
  function apply(stage, announce){
    var cfg = STAGES[stage] || null;
    opts.forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-stage') === (cfg ? stage : '') ? 'true' : 'false'); });
    main.querySelectorAll('section.stage-off').forEach(showSec);
    main.querySelectorAll('section.stage-focus').forEach(function(s){ s.classList.remove('stage-focus'); });
    document.documentElement.toggleAttribute('data-stage', !!cfg);
    if(!cfg){ out.innerHTML = announce ? '<p class="stage-note">Showing every section.</p>' : ''; window.dispatchEvent(new Event('md:unfold')); return; }
    var hidden = cfg.hide.map(sec).filter(Boolean);
    hidden.forEach(function(s){
      s.classList.add('stage-off');
      linksFor(s).forEach(function(a){ a.classList.add('stage-off-link'); });
    });
    var focus = cfg.focus.map(sec).filter(Boolean).slice(0, 3);
    focus.forEach(function(s){ s.classList.add('stage-focus'); });
    var html = '<div class="stage-row"><span class="stage-row-label">Start here</span>' +
      focus.map(function(s){ return '<a class="stage-jump" href="#' + s.id + '">' + esc(nameOf(s)) + '</a>'; }).join('') +
      '<a class="stage-jump stage-next" href="' + esc(ROOT + cfg.next.href) + '">' + esc(cfg.next.label) + ' →</a></div>';
    if(hidden.length){
      html += '<p class="stage-note">Hidden for ' + esc(cfg.name) + ': ' + hidden.map(function(s){ return esc(nameOf(s)); }).join(', ') +
        '. <button type="button" class="stage-showall">Show them</button></p>';
    }
    out.innerHTML = html;
    window.dispatchEvent(new Event('md:unfold'));   // other blocks re-measure (wide tables, scroll-spy)
  }
  function choose(stage){
    try { if(stage) localStorage.setItem(KEY, stage); else localStorage.removeItem(KEY); } catch(e){}
    apply(stage, true);
  }
  opts.forEach(function(b){ b.addEventListener('click', function(){ choose(b.getAttribute('data-stage')); }); });
  out.addEventListener('click', function(e){
    if(e.target.closest('.stage-showall')){ choose(''); return; }
    var a = e.target.closest('a.stage-jump[href^="#"]');
    if(!a) return;
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if(!t) return;
    e.preventDefault();
    if(history.pushState) history.pushState(null, '', a.getAttribute('href'));
    if(window.mdFoldOpen) window.mdFoldOpen(t.querySelector('.section-head') || t);
    t.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  window.mdStageReveal = function(el){
    var s = el && el.closest && el.closest('section.stage-off');
    if(s) showSec(s);
    return !!s;
  };
  window.addEventListener('hashchange', function(){
    var id = window.location.hash.slice(1), el = null;
    try { el = id && document.getElementById(decodeURIComponent(id)); } catch(e){}
    // The browser could not jump while the section was hidden: jump now that it is shown.
    if(el && window.mdStageReveal(el)) el.scrollIntoView({ block: 'start' });
  });
  var saved = '';
  try { saved = localStorage.getItem(KEY) || ''; } catch(e){}
  bar.hidden = false;
  apply(STAGES[saved] ? saved : '', false);
  // Arriving with #hash into a section this stage hides: open it.
  if(window.location.hash){
    var h0 = null;
    try { h0 = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch(e){}
    if(h0) window.mdStageReveal(h0);
  }
})();
} catch (e) { if (window.console) console.error(e); }
