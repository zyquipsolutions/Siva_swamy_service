/* Siva Swamy Services — site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* ---------- loader ---------- */
  function hideLoader() { root.classList.add('loaded'); setTimeout(function () { root.classList.remove('loading'); }, 500); }
  if (root.classList.contains('loading')) {
    if (document.readyState === 'complete') setTimeout(hideLoader, 250);
    else window.addEventListener('load', function () { setTimeout(hideLoader, 250); });
    setTimeout(hideLoader, 2500); // never block longer than 2.5s
  }

  /* ---------- header + mobile drawer ---------- */
  var header = $('.site-header');
  var drawer = $('#drawer');
  var menuBtn = $('.menu-btn');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (!drawer || !menuBtn) return;
    if (open) {
      drawer.style.top = header.getBoundingClientRect().bottom + 'px';
      drawer.hidden = false;
      requestAnimationFrame(function () { drawer.classList.add('open'); });
    } else {
      drawer.classList.remove('open');
      setTimeout(function () { if (!drawer.classList.contains('open')) drawer.hidden = true; }, 250);
    }
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100) setMenu(false); });
  }

  /* "More" dropdown: close on outside click / Escape */
  var more = $('.nav-more details');
  if (more) {
    document.addEventListener('click', function (e) { if (more.open && !more.contains(e.target)) more.open = false; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && more.open) { more.open = false; $('summary', more).focus(); } });
  }

  /* ---------- service index: live image preview (desktop) ---------- */
  $$('.svc-index.has-preview').forEach(function (idx) {
    var rows = $$('.svc-row', idx);
    var figs = $$('.svc-preview figure', idx);
    var activate = function (slug) {
      rows.forEach(function (r) { r.classList.toggle('is-active', r.dataset.slug === slug); });
      figs.forEach(function (f) { f.classList.toggle('on', f.dataset.slug === slug); });
    };
    rows.forEach(function (r) {
      r.addEventListener('mouseenter', function () { activate(r.dataset.slug); });
      r.addEventListener('focus', function () { activate(r.dataset.slug); });
    });
    if (rows[0]) activate(rows[0].dataset.slug);
  });

  /* ---------- subtle reveal ---------- */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var targets = $$('.sec .sec-head, .svc-cards, .timeline, .process-photo, .stat-row, .why-grid, .area-cols, .price-table, .masonry, .desk-in, .values, .offer-grid, .svc-sec-img, .brand-grid, .g-preview, .post-list');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (t) {
      if (t.getBoundingClientRect().top > window.innerHeight) { t.classList.add('reveal'); io.observe(t); }
    });
  }

  /* ---------- pricing picker ---------- */
  var tabs = $$('.price-nav [role="tab"]');
  if (tabs.length) {
    var select = function (slug, focus) {
      tabs.forEach(function (t) {
        var on = t.dataset.slug === slug;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      $$('.price-panel').forEach(function (p) { if (p.dataset.slug === slug) p.removeAttribute('data-hidden'); else p.setAttribute('data-hidden', ''); });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        select(t.dataset.slug);
        history.replaceState(null, '', '#' + t.dataset.slug);
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
      t.addEventListener('keydown', function (e) {
        var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        var n = tabs[(i + d + tabs.length) % tabs.length];
        select(n.dataset.slug, true);
      });
    });
    var initial = location.hash.slice(1);
    select(tabs.some(function (t) { return t.dataset.slug === initial; }) ? initial : tabs[0].dataset.slug);
  }

  /* ---------- area search ---------- */
  var q = $('#area-q');
  if (q) {
    var result = $('#area-result');
    var chips = $$('.area-cols [data-area]');
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase();
      var matches = 0;
      chips.forEach(function (c) {
        var hit = v && c.dataset.area.indexOf(v) !== -1;
        c.classList.toggle('is-match', !!hit);
        c.parentElement.classList.toggle('is-hidden', !!v && !hit);
        if (hit) matches++;
      });
      if (!v) { result.textContent = ''; result.className = 'area-result'; }
      else if (matches) { result.textContent = 'Yes, we cover ' + (matches === 1 ? 'this area' : matches + ' matching areas') + '. Book a visit below or message us to confirm.'; result.className = 'area-result ok'; }
      else { result.textContent = 'Not on our list yet. Message us on WhatsApp and we\'ll confirm if we can reach you.'; result.className = 'area-result no'; }
    });
  }

  /* ---------- gallery: studio filters ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gGrid = $('#g-grid');
  var chips = $$('.g-filter .g-chip');
  if (gGrid && chips.length) {
    var gItems = $$('.g-item', gGrid);
    var gCount = $('#g-count');
    var applyFilter = function (key) {
      var parts = key.split(':'), type = parts[0], val = parts.slice(1).join(':');
      var match = function (li) { return type === 'all' || (type === 'cat' ? li.dataset.cat === val : li.dataset.work === val); };
      var shown = 0;
      gItems.forEach(function (li) {
        var keep = match(li);
        if (keep) shown++;
        if (reduce) { li.hidden = !keep; return; }
        if (keep && li.hidden) { li.hidden = false; li.classList.add('g-enter'); requestAnimationFrame(function () { requestAnimationFrame(function () { li.classList.remove('g-enter'); }); }); }
        else if (!keep && !li.hidden) { li.classList.add('g-leave'); setTimeout(function () { li.hidden = true; li.classList.remove('g-leave'); }, 160); }
      });
      var label = $('.g-chip[aria-pressed="true"]');
      gCount.textContent = key === 'all' ? 'Showing all ' + shown + ' photos' : 'Showing ' + shown + ' ' + (shown === 1 ? 'photo' : 'photos') + ': ' + label.firstChild.textContent.trim();
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
        applyFilter(c.dataset.filter);
      });
    });
  }

  /* ---------- studio lightbox (gallery page + home preview) ---------- */
  var lb = $('#studio-lb');
  if (lb && lb.showModal) {
    var list = [], idx = 0, opener = null;
    var lbImg = $('.lb-media img', lb);
    var showItem = function (i) {
      idx = (i + list.length) % list.length;
      var b = list[idx];
      lbImg.classList.add('is-swapping');
      var next = new Image();
      next.onload = next.onerror = function () { lbImg.src = next.src; lbImg.alt = b.dataset.title + ': ' + b.dataset.desc; lbImg.classList.remove('is-swapping'); };
      next.src = b.dataset.full || $('img', b).currentSrc;
      $('#lb-title').textContent = b.dataset.title;
      $('#lb-desc').textContent = b.dataset.desc;
      $('#lb-cat').textContent = b.dataset.cat;
      $('#lb-work').textContent = b.dataset.work;
      $('#lb-count').textContent = (idx + 1) + ' / ' + list.length;
    };
    var openLb = function (btn) {
      list = $$('.g-item:not([hidden]) .g-card');
      opener = btn; showItem(list.indexOf(btn));
      document.documentElement.classList.add('lb-open');
      lb.showModal();
      $('.lb-x', lb).focus();
    };
    $$('.g-card').forEach(function (btn) { btn.addEventListener('click', function () { openLb(btn); }); });
    $('.lb-x', lb).addEventListener('click', function () { lb.close(); });
    $('#lb-prev').addEventListener('click', function () { showItem(idx - 1); });
    $('#lb-next').addEventListener('click', function () { showItem(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { document.documentElement.classList.remove('lb-open'); if (opener) opener.focus(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') showItem(idx - 1); if (e.key === 'ArrowRight') showItem(idx + 1); });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) showItem(idx + (dx < 0 ? 1 : -1)); tx = null; });
  }

  /* ---------- reviews page: Google reviews, filters, new-review notifications ---------- */
  var rvGrid = $('#rv-grid');
  if (rvGrid) (function () {
    var cfg = {};
    try { cfg = JSON.parse(rvGrid.dataset.config); } catch (e) {}
    var summary = $('#rv-summary'), statusEl = $('#rv-status'), emptyEl = $('#rv-empty'), attrib = $('#rv-attrib'), updated = $('#rv-updated');
    var toast = $('#rv-toast'), modal = $('#rv-modal');
    var KEYWORDS = { 'kitchen-chimney': /chimney|suction|exhaust/i, 'water-heater': /water heater|geyser|\bheater\b|boiler/i, 'kitchen-hob': /\bhobs?\b|stove|burner|ignition/i, 'kitchen-hood': /\bhoods?\b/i };
    var CAT_NAMES = { 'kitchen-chimney': 'Kitchen Chimney', 'water-heater': 'Water Heater', 'kitchen-hob': 'Kitchen Hob', 'kitchen-hood': 'Kitchen Hood' };
    var known = {}, byId = {}, current = 'all', modalOpener = null, pendingToast = null;

    var store = {
      seen: function () { try { return JSON.parse(localStorage.getItem('ssr-seen') || 'null'); } catch (e) { return null; } },
      setSeen: function (ids) { try { localStorage.setItem('ssr-seen', JSON.stringify(ids.slice(0, 60))); } catch (e) {} },
      notified: function (id) { try { return JSON.parse(sessionStorage.getItem('ssr-notified') || '[]').indexOf(id) > -1; } catch (e) { return false; } },
      markNotified: function (id) { try { var a = JSON.parse(sessionStorage.getItem('ssr-notified') || '[]'); a.push(id); sessionStorage.setItem('ssr-notified', JSON.stringify(a.slice(-60))); } catch (e) {} },
    };
    function make(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function stars(n) {
      var s = make('span', 'rv-stars'); n = Math.max(0, Math.min(5, Math.round(n || 0)));
      s.setAttribute('role', 'img'); s.setAttribute('aria-label', n + ' out of 5 stars');
      s.textContent = '★★★★★'.slice(0, n); var off = make('span', 'rv-stars-off', '★★★★★'.slice(0, 5 - n)); s.appendChild(off); return s;
    }
    function catsFor(text) { return Object.keys(KEYWORDS).filter(function (k) { return KEYWORDS[k].test(text || ''); }); }

    function googleCard(r) {
      var cats = catsFor(r.text);
      var li = make('li', 'rv-item'); li.dataset.cat = cats.length ? cats.join(' ') : 'general'; li.dataset.id = r.id; li.dataset.src = 'google';
      var card = make('article', 'rv-card is-google'); li.appendChild(card);
      var top = make('div', 'rv-top'); top.appendChild(r.rating ? stars(r.rating) : make('span')); top.appendChild(make('span', 'rv-badge rv-badge-google', 'Google')); card.appendChild(top);
      card.appendChild(make('blockquote', 'rv-text', r.text || '(Rating only, no written review)'));
      if ((r.text || '').length > 260) { var more = make('button', 'rv-more', 'Read full review'); more.type = 'button'; more.addEventListener('click', function () { openModal(r, more); }); card.appendChild(more); }
      var who = make('footer', 'rv-who');
      var av;
      if (r.photoUri) { av = make('img', 'rv-avatar'); av.src = r.photoUri; av.alt = ''; av.loading = 'lazy'; av.referrerPolicy = 'no-referrer'; av.width = 44; av.height = 44; }
      else av = make('span', 'rv-avatar', (r.author || 'G').charAt(0));
      av.setAttribute('aria-hidden', 'true'); who.appendChild(av);
      var box = make('div'); var h = make('h3', 'rv-name');
      if (r.authorUri) { var a = make('a', null, r.author); a.href = r.authorUri; a.target = '_blank'; a.rel = 'noopener nofollow'; h.appendChild(a); } else h.textContent = r.author;
      box.appendChild(h); box.appendChild(make('p', 'rv-service', cats.map(function (c) { return CAT_NAMES[c]; }).join(' · ') || 'Google review'));
      who.appendChild(box);
      if (r.relativeTime) who.appendChild(make('span', 'rv-date', r.relativeTime));
      card.appendChild(who);
      var src = make('p', 'rv-src'); var sa = make('a', null, 'View on Google'); sa.href = r.reviewUri || cfg.mapsUrl; sa.target = '_blank'; sa.rel = 'noopener'; src.appendChild(sa); card.appendChild(src);
      return li;
    }

    function counts() {
      var items = $$('.rv-item', rvGrid);
      $('#rvc-all').textContent = items.length;
      Object.keys(CAT_NAMES).forEach(function (k) {
        var n = items.filter(function (li) { return li.dataset.cat.split(' ').indexOf(k) > -1; }).length;
        var chip = $('.rv-filter [data-filter="' + k + '"]'); $('#rvc-' + k).textContent = n;
        chip.hidden = n === 0;   // only offer a category when reviews genuinely mention it
        if (n === 0 && current === k) setFilter('all');
      });
      $('.rv-filter').hidden = items.length === 0;
    }
    function setFilter(k) {
      current = k;
      $$('.rv-filter .g-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === k)); });
      $$('.rv-item', rvGrid).forEach(function (li) { li.hidden = k !== 'all' && li.dataset.cat.split(' ').indexOf(k) < 0; });
    }
    $$('.rv-filter .g-chip').forEach(function (c) { c.addEventListener('click', function () { setFilter(c.dataset.filter); }); });

    function skeletons(on) {
      $$('.rv-skel-card', rvGrid).forEach(function (n) { n.remove(); });
      if (!on) return;
      for (var i = 0; i < 3; i++) { var li = make('li', 'rv-item rv-skel-card'); li.setAttribute('aria-hidden', 'true'); li.innerHTML = '<div class="rv-card"><span class="rv-skel rv-skel-short"></span><span class="rv-skel"></span><span class="rv-skel"></span><span class="rv-skel rv-skel-short"></span></div>'; rvGrid.appendChild(li); }
    }

    function renderSummary(d) {
      summary.setAttribute('aria-busy', 'false'); summary.innerHTML = '';
      var box = make('div', 'rv-summary-state');
      if (d && d.rating != null && d.userRatingCount != null) {
        box.appendChild(make('p', 'rv-sum-label', 'Google rating'));
        var big = make('p', 'rv-sum-big'); big.appendChild(make('b', null, Number(d.rating).toFixed(1))); big.appendChild(stars(d.rating)); box.appendChild(big);
        box.appendChild(make('p', 'rv-sum-count', 'Based on ' + d.userRatingCount + ' Google review' + (d.userRatingCount === 1 ? '' : 's')));
      } else {
        box.appendChild(make('p', 'rv-sum-label', 'Google reviews'));
        box.appendChild(make('p', 'rv-sum-count', 'Read our latest reviews and rating on Google Maps.'));
      }
      var link = make('a', 'btn btn-accent btn-sm', 'Read All Reviews on Google'); link.href = (d && d.mapsUri) || cfg.mapsUrl; link.target = '_blank'; link.rel = 'noopener';
      box.appendChild(link); summary.appendChild(box);
    }

    function fallback() {
      skeletons(false); renderSummary(null);
      var hasCards = $$('.rv-item', rvGrid).length > 0;
      emptyEl.hidden = false;
      if (hasCards) emptyEl.classList.add('is-compact');
      counts();
    }

    function apply(d, initial) {
      skeletons(false);
      var list = (d.reviews || []).filter(function (r) { return r && r.id; });
      list.sort(function (a, b) { return (b.publishTime || '').localeCompare(a.publishTime || ''); });
      var ids = list.map(function (r) { return r.id; });
      // deleted reviews: remove cards Google no longer returns
      $$('.rv-item[data-src="google"]', rvGrid).forEach(function (li) { if (ids.indexOf(li.dataset.id) < 0) { li.remove(); delete known[li.dataset.id]; } });
      var prevSeen = initial ? store.seen() : null;
      var fresh = [];
      var firstStatic = rvGrid.firstElementChild;
      list.forEach(function (r) {
        byId[r.id] = r;
        if (known[r.id]) return;               // duplicates ignored
        known[r.id] = true;
        var li = googleCard(r);
        if (initial) rvGrid.insertBefore(li, firstStatic);
        else { li.classList.add('is-new'); rvGrid.insertBefore(li, rvGrid.firstElementChild); fresh.push(r); }
      });
      if (initial && Array.isArray(prevSeen)) fresh = list.filter(function (r) { return prevSeen.indexOf(r.id) < 0; });
      store.setSeen(ids);
      renderSummary(d);
      attrib.hidden = list.length === 0;
      if (d.fetchedAt) { var t = new Date(d.fetchedAt); if (!isNaN(t)) updated.textContent = 'Last updated ' + t.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) + '.'; }
      emptyEl.hidden = $$('.rv-item', rvGrid).length > 0;
      counts(); setFilter(current);
      var toNotify = fresh.filter(function (r) { return !store.notified(r.id); })[0];
      if (toNotify) showToast(toNotify, false);
    }

    function load(initial) {
      if (!cfg.endpoint) { fallback(); return; }
      if (initial) skeletons(true);
      fetch(cfg.endpoint, { headers: { Accept: 'application/json' }, cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (d) { if (!d || !d.ok || !Array.isArray(d.reviews)) throw new Error('bad'); apply(d, initial); statusEl.textContent = ''; })
        .catch(function () { if (initial) fallback(); /* later refresh failures keep what is already shown */ });
    }

    // notification toast
    function showToast(r, isSample) {
      pendingToast = { r: r, sample: isSample };
      $('.rv-toast-title', toast).textContent = isSample ? 'Sample notification (preview only)' : 'New customer review';
      var txt = (r.author || r.name) + ' · ' + (r.rating ? r.rating + '★' : '') + ' · ' + (r.text || '').slice(0, 90) + ((r.text || '').length > 90 ? '…' : '');
      $('#rv-toast-text').textContent = txt;
      toast.hidden = false; requestAnimationFrame(function () { toast.classList.add('show'); });
      if (!isSample) store.markNotified(r.id); else try { sessionStorage.setItem('ssr-sample-toast', '1'); } catch (e) {}
    }
    function hideToast() { toast.classList.remove('show'); setTimeout(function () { toast.hidden = true; }, reduce ? 0 : 250); }
    $('#rv-toast-x').addEventListener('click', hideToast);
    toast.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideToast(); });
    $('#rv-toast-view').addEventListener('click', function () {
      var t = pendingToast; hideToast(); if (!t) return;
      var li = $('.rv-item[data-id="' + (t.r.id || '') + '"]', rvGrid);
      if (li) { setFilter('all'); li.classList.add('is-highlight'); li.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); setTimeout(function () { li.classList.remove('is-highlight'); }, 3500); }
      openModal(t.r, $('#rv-toast-view'), t.sample);
    });

    // review modal
    function openModal(r, opener, isSample) {
      if (!modal.showModal) return;
      modalOpener = opener || null;
      var c = $('#rv-modal-content'); c.innerHTML = '';
      var head = make('header', 'rv-head');
      var n = make('h2', 'rv-name', r.author || r.name); n.id = 'rv-modal-name';
      var who = make('div'); who.appendChild(n); var meta = make('p', 'rv-meta'); if (r.rating) meta.appendChild(stars(r.rating)); meta.appendChild(make('span', null, r.relativeTime || r.date || '')); who.appendChild(meta);
      head.appendChild(make('span', 'rv-avatar', (r.author || r.name || 'G').charAt(0))); head.appendChild(who);
      head.appendChild(make('span', 'rv-badge ' + (isSample ? 'rv-badge-sample' : 'rv-badge-google'), isSample ? 'Sample' : 'Google'));
      c.appendChild(head); c.appendChild(make('p', 'rv-text rv-text-full', r.text || ''));
      if (!isSample) { var a = make('a', 'btn btn-ghost btn-sm', 'View on Google'); a.href = r.reviewUri || cfg.mapsUrl; a.target = '_blank'; a.rel = 'noopener'; c.appendChild(a); }
      document.documentElement.classList.add('lb-open'); modal.showModal(); $('.rv-modal-x', modal).focus();
    }
    if (modal) {
      $('.rv-modal-x', modal).addEventListener('click', function () { modal.close(); });
      modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
      modal.addEventListener('close', function () { document.documentElement.classList.remove('lb-open'); if (modalOpener && document.contains(modalOpener)) modalOpener.focus(); });
    }

    // initial load + polite periodic refresh while the page is visible
    load(true);
    var every = Math.max(10, cfg.refreshMinutes || 15) * 60000, last = Date.now();
    setInterval(function () { if (document.visibilityState === 'visible' && cfg.endpoint) { last = Date.now(); load(false); } }, every);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && cfg.endpoint && Date.now() - last > every) { last = Date.now(); load(false); } });

    // preview build only: demonstrate the notification with a clearly labelled sample (never in production)
    if (cfg.preview) {
      var seenSample = false; try { seenSample = sessionStorage.getItem('ssr-sample-toast') === '1'; } catch (e) {}
      var sampleLi = $('.rv-item .is-sample', rvGrid);
      if (!seenSample && sampleLi) setTimeout(function () {
        var card = sampleLi; var r = { id: card.parentNode.dataset.id, name: $('.rv-name', card).textContent, rating: $$('.rv-stars', card)[0].getAttribute('aria-label').charAt(0) * 1, text: $('.rv-text', card).textContent, date: ($('.rv-date', card) || {}).textContent || '' };
        showToast(r, true);
      }, 3000);
    }
  })();

  /* ---------- booking form ---------- */
  var form = $('#book-form');
  if (!form) return;

  var KEY = form.dataset.key;
  var WA = form.dataset.wa;
  var status = $('#form-status');
  var success = $('#book-success');
  var mapLink = form.elements['Map_location'];

  // prefill appliance from ?appliance=
  var pre = new URLSearchParams(location.search).get('appliance');
  if (pre) { var sel = form.elements['Appliance']; for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === pre) sel.selectedIndex = i; }
  var need = new URLSearchParams(location.search).get('need');
  if (need) { if (need === 'Service') need = 'Maintenance'; var ss = form.elements['Service']; for (var k = 0; k < ss.options.length; k++) if (ss.options[k].text === need) ss.selectedIndex = k; }
  var dateIn = form.elements['Preferred_date'];
  if (dateIn) { var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); dateIn.min = t.toISOString().slice(0, 10); }

  function setErr(id, field, msg) {
    $('#' + id).textContent = msg || '';
    field.closest('.field').classList.toggle('invalid', !!msg);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) field.setAttribute('aria-describedby', id); else field.removeAttribute('aria-describedby');
  }
  function cleanMobile(v) { var d = v.replace(/\D/g, ''); if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2); if (d.length === 11 && d[0] === '0') d = d.slice(1); return d; }
  function validate() {
    var f = form.elements, ok = true, first = null;
    var checks = [
      ['e-name', f['Name'], f['Name'].value.trim().length < 2 ? 'Enter your name.' : ''],
      ['e-mobile', f['Mobile'], /^[6-9]\d{9}$/.test(cleanMobile(f['Mobile'].value)) ? '' : 'Enter a valid 10 digit mobile number.'],
      ['e-loc', f['Location'], f['Location'].value.trim().length < 3 ? 'Enter your address or pick it on the map.' : ''],
      ['e-app', f['Appliance'], f['Appliance'].value ? '' : 'Choose the appliance.'],
      ['e-svc', f['Service'], f['Service'].value ? '' : 'Choose the service you need.'],
    ];
    checks.forEach(function (c) { setErr(c[0], c[1], c[2]); if (c[2]) { ok = false; first = first || c[1]; } });
    if (first) first.focus();
    return ok;
  }
  function data(via) {
    var f = form.elements;
    return {
      Name: f['Name'].value.trim(),
      Mobile: cleanMobile(f['Mobile'].value),
      Location: f['Location'].value.trim(),
      Appliance: f['Appliance'].value,
      Service: f['Service'].value,
      Preferred_date: f['Preferred_date'].value || '(no preference)',
      Details: f['Problem'].value.trim() || '(none)',
      Map_location: mapLink.value || '(not pinned)',
      Page: location.href,
      Sent_via: via,
    };
  }
  function send(d) {
    if (!KEY || KEY.indexOf('YOUR-') === 0) return Promise.reject(new Error('setup'));
    var payload = Object.assign({
      access_key: KEY,
      subject: 'New service request: ' + d.Appliance + ', ' + d.Service + ', ' + d.Name,
      from_name: form.dataset.site + ' website',
      botcheck: form.elements['botcheck'].checked,
    }, d);
    return fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.success) throw new Error(j.message || 'failed'); return j; });
  }
  function busy(on) {
    $('#btn-book').disabled = on; $('#btn-wa').disabled = on;
    $('#btn-book').textContent = on ? 'Sending…' : 'Send service request';
    status.className = 'form-status full' + (on ? ' busy' : '');
    status.textContent = on ? 'Sending your request…' : '';
  }
  function showError(msg) { status.className = 'form-status full error'; status.textContent = msg; }
  function showSuccess(d, via) {
    var esc = function (s) { var x = document.createElement('div'); x.textContent = s; return x.innerHTML; };
    success.innerHTML = '<span class="tick"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      '<h2>Thanks, ' + esc(d.Name.split(' ')[0]) + '!</h2>' +
      '<p>Your request (' + esc(d.Appliance) + ', ' + esc(d.Service.toLowerCase()) + ') has been sent. We\'ll contact you on <strong>' + esc(d.Mobile) + '</strong> to discuss it and confirm availability.</p>' +
      '<p class="muted">Your visit is confirmed only after we speak with you.</p>' +
      '<button type="button" class="btn btn-ghost" id="book-again">Send another request</button>';
    form.hidden = true; success.hidden = false; success.focus();
    $('#book-again').addEventListener('click', function () { form.reset(); mapLink.value = ''; resetHint(); success.hidden = true; form.hidden = false; form.elements['Name'].focus(); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var d = data('Website form');
    busy(true);
    send(d).then(function () { busy(false); showSuccess(d, 'form'); })
      .catch(function (err) {
        busy(false);
        showError(err.message === 'setup'
          ? 'Online requests aren\'t connected yet, so nothing was sent. Please use "Send on WhatsApp" or call ' + (form.dataset.phone || 'us') + '.'
          : 'Your request didn\'t go through, so nothing was sent. Check your connection and try again, or use "Send on WhatsApp".');
      });
  });

  $('#btn-wa').addEventListener('click', function () {
    if (!validate()) return;
    var d = data('WhatsApp');
    var msg = 'Hi, I\'d like to request a service.\n\nName: ' + d.Name + '\nPhone: ' + d.Mobile + '\nAppliance: ' + d.Appliance + '\nService: ' + d.Service +
      '\nLocation: ' + d.Location + (mapLink.value ? '\nMap: ' + mapLink.value : '') + '\nPreferred date: ' + d.Preferred_date + '\nDetails: ' + d.Details;
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    // Not a confirmation: the customer still has to press Send inside WhatsApp.
    status.className = 'form-status full info';
    status.textContent = 'WhatsApp has opened with your details. Press Send in WhatsApp to deliver your request. It is not sent until you do.';
  });

  ['Name', 'Mobile', 'Location', 'Appliance', 'Service'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () { var el = this.closest('.field'); if (el.classList.contains('invalid')) validate(); });
  });

  /* ---------- map picker (Leaflet + OpenStreetMap, loaded on demand) ---------- */
  var dlg = $('#map-dialog');
  var hint = $('#loc-hint');
  var hintText = hint.textContent;
  function resetHint() { hint.textContent = hintText; hint.className = 'hint'; }
  var map, marker, picked = null, leafletReady = null;

  function loadLeaflet() {
    if (leafletReady) return leafletReady;
    leafletReady = new Promise(function (res, rej) {
      var css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    return leafletReady;
  }
  function placeMarker(lat, lng) {
    picked = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) };
    if (!marker) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', function () { var p = marker.getLatLng(); placeMarker(p.lat, p.lng); });
    } else marker.setLatLng([lat, lng]);
    $('#md-use').disabled = false;
    $('#md-addr').textContent = 'Finding address…';
    reverse(picked).then(function (a) { picked.address = a; $('#md-addr').textContent = a || 'Location pinned'; });
  }
  function reverse(p) {
    return fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=' + p.lat + '&lon=' + p.lng, { headers: { 'Accept-Language': 'en' } })
      .then(function (r) { return r.json(); }).then(function (j) { return j.display_name || ''; }).catch(function () { return ''; });
  }
  function gps() {
    if (!navigator.geolocation) { $('#md-addr').textContent = 'Location access isn\'t available in this browser. Tap the map instead.'; return; }
    $('#md-addr').textContent = 'Getting your location…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      map.setView([pos.coords.latitude, pos.coords.longitude], 17);
      placeMarker(pos.coords.latitude, pos.coords.longitude);
    }, function () { $('#md-addr').textContent = 'Location permission was denied. Tap the map to set it.'; }, { enableHighAccuracy: true, timeout: 10000 });
  }

  $('#loc-btn').addEventListener('click', function () {
    if (!dlg.showModal) { hint.textContent = 'The map picker isn\'t supported in this browser. Please type your address.'; return; }
    dlg.showModal();
    $('#md-addr').textContent = 'Loading map…';
    Promise.all([loadLeaflet(), fetch('/assets/geo.json').then(function (r) { return r.json(); }).catch(function () { return { lat: 13.0827, lng: 80.2707 }; })])
      .then(function (r) {
        var g = r[1];
        if (!map) {
          map = L.map('map').setView([g.lat, g.lng], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
          map.on('click', function (e) { placeMarker(e.latlng.lat, e.latlng.lng); });
        }
        setTimeout(function () { map.invalidateSize(); }, 50);
        if (!picked) $('#md-addr').textContent = 'Tap the map, or use your current location.';
      })
      .catch(function () { $('#md-addr').textContent = 'The map couldn\'t load. Please type your address instead.'; });
  });
  $('#md-gps').addEventListener('click', function () { if (map) gps(); });
  $('.md-close', dlg).addEventListener('click', function () { dlg.close(); });
  $('#md-use').addEventListener('click', function () {
    if (!picked) return;
    var link = 'https://www.google.com/maps?q=' + picked.lat + ',' + picked.lng;
    mapLink.value = link;
    var loc = form.elements['Location'];
    if (picked.address) loc.value = picked.address;
    else if (!loc.value.trim()) loc.value = 'Pinned location: ' + picked.lat + ', ' + picked.lng;
    hint.innerHTML = '✓ Map location attached. <a href="' + link + '" target="_blank" rel="noopener">Check it</a>';
    hint.className = 'hint ok';
    setErr('e-loc', loc, '');
    dlg.close();
    loc.focus();
  });
})();
