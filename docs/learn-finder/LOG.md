# Learn finder log

One line per run: date · finder · subjects · verified count · sources used · blocked · fetch tricks.

- 2026-10-30 · mbbs · mbbs, neet-ug · 1,143 (850 MBBS colleges: 834 NMC + 16 INIs; 293 NEET centres) · NMC list API (already in colleges.yml), INI sites, brand locators (coaching.yml) · gaps: fees (state counselling notices), local NEET institutes w/o locator · tricks: NMC API = nmc.org.in/college-courses/list?page=N&per_page=100 + Referer of the NMC list page (plain curl gets 301); first run also wrote build-learn-finders.mjs + assets/js/learn-finder.js; headless Edge cannot go below ~500px wide, so compare against an existing page
