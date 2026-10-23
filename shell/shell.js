/* Presentation shell: tabs, device toggle, today / new / side by side, notes, build labels.
   Client-agnostic. Everything about the client lives in shell/data.js. */
(function () {
  'use strict';
  var S = window.SHELL, PAGES = S.pages, DOCS = S.docs || [];
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var tabsEl = $('tabs'), stage = $('stage'), main = $('main'), tools = $('tools');
  var DIM = { mobile: { w: 390, h: 844 }, desktop: { w: 1440, h: 900 } };
  var KIND = S.kinds || {};
  var LABELS = S.labels || {};
  var FIRST = (DOCS[0] || PAGES[0]).id;

  var DATES = S.dates || [];
  var FESTIVE = S.festive || null; // { moment: 'christmas', label: 'Christmas' }: a switch that turns the seasonal moment on
  var state = { tab: FIRST, device: 'mobile', view: 'new', notes: true, build: false, sub: 0, date: DATES.length ? DATES[0].v : '', festive: false };
  (function readHash() {
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
      var p = kv.split('='); if (!(p[0] in state)) return;
      state[p[0]] = (p[0] === 'notes' || p[0] === 'build' || p[0] === 'festive') ? p[1] === '1' : (p[0] === 'sub' ? +p[1] || 0 : p[1]);
    });
    if (!find(state.tab)) state.tab = FIRST;
    if (S.compare === false) state.view = 'new';
  })();
  function writeHash() {
    try { history.replaceState(null, '', '#tab=' + state.tab + '&device=' + state.device + '&view=' + state.view + '&notes=' + (state.notes ? 1 : 0) + '&build=' + (state.build ? 1 : 0) + (state.sub ? '&sub=' + state.sub : '') + (state.date ? '&date=' + state.date : '') + (state.festive ? '&festive=1' : '')); } catch (e) {}
  }
  function find(id) { return PAGES.concat(DOCS).filter(function (x) { return x.id === id; })[0]; }
  function isDoc(id) { return DOCS.some(function (d) { return d.id === id; }); }
  function cur() { return find(state.tab); }
  function newSrc(p) { return p.views ? p.views[Math.min(state.sub, p.views.length - 1)].src : p.src; }
  // Tab order: the lead document (Brand), then the pages, then the remaining documents.
  function order() { return DOCS.length ? [DOCS[0]].concat(PAGES, DOCS.slice(1)) : PAGES.slice(); }

  /* ---------- static chrome from data.js ---------- */
  (function renderChrome() {
    var c = S.client || {};
    document.title = (c.name ? c.name + ' ' : '') + (c.subtitle || 'redesign');
    $('brand').innerHTML = (c.logo ? '<img src="' + c.logo + '" alt="' + (c.name || '') + '">' : '<b>' + (c.name || '') + '</b>') +
      (c.subtitle ? '<span>' + c.subtitle + '</span>' : '');
    $('legend').innerHTML = Object.keys(LABELS).map(function (k) {
      return '<i style="background:' + LABELS[k].color + '">' + LABELS[k].tag + '</i> ' + LABELS[k].means;
    }).join(' ');
  })();

  /* ---------- tabs ---------- */
  function tabBtn(x) { return '<button class="tab' + (x.id === state.tab ? ' is-on' : '') + '" type="button" data-tab="' + x.id + '">' + x.label + '</button>'; }
  function renderTabs() {
    var lead = DOCS.length ? tabBtn(DOCS[0]) + '<span class="tabs__sep"></span>' : '';
    var rest = DOCS.length > 1 ? '<span class="tabs__sep"></span><span class="tabs__label">Documents</span>' + DOCS.slice(1).map(tabBtn).join('') : '';
    tabsEl.innerHTML = lead + '<span class="tabs__label">Pages</span>' + PAGES.map(tabBtn).join('') + rest;
    var on = tabsEl.querySelector('.is-on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  /* ---------- stage ---------- */
  function deviceHTML(kind, label, cap) {
    var d = state.device;
    return '<div class="col" data-col="' + kind + '">' +
      (label ? '<p class="col__label"><b>' + label + '</b></p>' : '') +
      '<div class="device device--' + (d === 'mobile' ? 'phone' : 'desk') + '">' +
        (d === 'desktop' ? '<div class="device__chrome"><i></i><i></i><i></i><span>' + (S.domain || '') + '</span></div>' : '') +
        '<div class="device__view" data-view="' + kind + '"></div>' +
      '</div>' +
      (cap ? '<p class="col__cap">' + cap + '</p>' : '') +
    '</div>';
  }
  function placeholder(title, text) { return '<div class="missing"><div><b>' + title + '</b><p>' + (text || '') + '</p></div></div>'; }
  function fillOld(view, p) {
    var b = p.before || { kind: 'none' }, d = state.device;
    if (b.kind === 'none') { view.innerHTML = placeholder('Not on the site today', b.caption); return; }
    if (b.kind === 'frame') { view.innerHTML = '<iframe title="' + p.label + ', today" src="' + b.src + '"></iframe>'; return; }
    var img = 'before/' + b.name + '-' + d + '.jpg';
    view.innerHTML = '<div class="shot"><img src="' + img + '" alt="' + p.label + ' today, ' + d + '"></div>';
    view.querySelector('img').addEventListener('error', function () {
      view.innerHTML = placeholder('No screenshot yet', b.kind === 'missing' ? b.caption : 'Save it as ' + img + '.');
    });
  }
  function fillNew(view, p) {
    view.innerHTML = '<iframe title="' + p.label + ', new design" src="' + newSrc(p) + '"></iframe>';
    view.querySelector('iframe').addEventListener('load', sendState);
  }
  function renderStage() {
    var p = cur();
    if (isDoc(state.tab)) {
      stage.className = 'stage stage--doc';
      stage.innerHTML = '<iframe title="' + p.label + '" src="' + p.src + '"></iframe>';
      return;
    }
    stage.className = 'stage';
    var both = state.view === 'both', b = p.before || {};
    // a 'missing' caption shows inside the placeholder instead, so it is not repeated underneath
    var cap = (b.caption && b.kind !== 'missing' && b.kind !== 'none') ? b.caption : '';
    stage.innerHTML = (state.view !== 'new' ? deviceHTML('old', both ? 'Today' : '', cap) : '') + (state.view !== 'old' ? deviceHTML('new', both ? 'New' : '', '') : '');
    var o = stage.querySelector('[data-view="old"]'), n = stage.querySelector('[data-view="new"]');
    if (o) fillOld(o, p);
    if (n) fillNew(n, p);
    layout();
  }
  // Pages render at true device width (390 or 1440) and are scaled down to fit, so the
  // responsive breakpoints the client sees are the real ones, not a squeezed approximation.
  function layout() {
    if (isDoc(state.tab)) return;
    var views = stage.querySelectorAll('.device__view'); if (!views.length) return;
    var d = DIM[state.device], cols = views.length;
    var availW = stage.clientWidth - 48 - (cols - 1) * 28;
    var hasLabel = !!stage.querySelector('.col__label'), hasCap = !!stage.querySelector('.col__cap');
    var availH = stage.clientHeight - 48 - (hasLabel ? 34 : 0) - (hasCap ? 46 : 0);
    var scale, h;
    if (state.device === 'desktop') {
      scale = Math.min(1, (availW / cols) / d.w);
      h = Math.round(Math.max(480, Math.min(2400, (availH - 28) / scale)));
    } else {
      h = Math.max(620, Math.min(d.h, availH - 18));
      scale = Math.min(1, (availH - 18) / h, (availW / cols) / d.w);
    }
    Array.prototype.forEach.call(views, function (v) {
      v.style.width = Math.round(d.w * scale) + 'px'; v.style.height = Math.round(h * scale) + 'px';
      var inner = v.firstElementChild; if (!inner || inner.classList.contains('missing')) return;
      inner.style.width = d.w + 'px'; inner.style.height = h + 'px'; inner.style.transform = 'scale(' + scale + ')';
    });
  }

  /* ---------- notes ---------- */
  function renderNotes() {
    var p = cur(), show = state.notes && !isDoc(state.tab) && p.notes && p.notes.length;
    main.classList.toggle('has-notes', !!show);
    if (!show) return;
    $('notes-sub').textContent = p.label + ': ' + p.notes.length + (S.compare === false ? ' notes' : ' changes') + '. Tap one to see it on the page.';
    $('notes-list').innerHTML = p.notes.map(function (n) {
      return '<li class="note" data-n="' + n.n + '"><button class="note__btn" type="button" data-note="' + n.n + '"><span class="note__n">' + n.n + '</span><span>' +
        '<span class="note__t">' + n.t + '</span>' + (KIND[n.k] ? '<span class="note__kind">' + KIND[n.k] + '</span>' : '') +
        '<span class="note__body">' + (n.was ? '<span><b>Today</b>' + n.was + '</span><span><b>New</b>' + n.now + '</span>' : '<span><b>What it is</b>' + n.now + '</span>') + '<span class="why"><b>Why it matters</b>' + n.why + '</span></span>' +
      '</span></button></li>';
    }).join('');
    $('notes-list').scrollTop = 0;
  }
  function hot(n, scroll) {
    $$('.note').forEach(function (li) {
      var on = +li.getAttribute('data-n') === n; li.classList.toggle('is-hot', on);
      if (on && scroll) li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  /* ---------- tools ---------- */
  function renderTools() {
    var doc = isDoc(state.tab), p = cur();
    tools.hidden = doc;
    if (doc) return;
    $('seg-view').hidden = S.compare === false;
    var ds = $('seg-date');
    if (ds) { ds.hidden = !DATES.length; ds.innerHTML = DATES.map(function (x) { return '<button type="button" data-date="' + x.v + '"' + (x.v === state.date ? ' class="is-on"' : '') + ' title="' + (x.hint || '') + '">' + x.label + '</button>'; }).join(''); }
    $$('[data-device]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-device') === state.device); });
    $$('button[data-view]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-view') === state.view); });
    var sub = $('seg-sub');
    sub.hidden = !p.views;
    if (p.views) sub.innerHTML = p.views.map(function (v, i) { return '<button type="button" data-sub="' + i + '"' + (i === state.sub ? ' class="is-on"' : '') + '>' + v.label + '</button>'; }).join('');
    $('sw-notes').checked = state.notes; $('sw-build').checked = state.build;
    if (FESTIVE) { $('festive-switch').hidden = false; $('festive-label').textContent = FESTIVE.label; $('sw-festive').checked = state.festive; }
    $('legend').classList.toggle('is-on', state.build);
    $('open-new').href = newSrc(p) + (state.build ? '#build' : '');
  }

  /* ---------- bridge to the pages (site/assets/proto.js) ---------- */
  function newFrame() { var v = stage.querySelector('[data-view="new"] iframe'); return v && v.contentWindow; }
  function sendState() { var w = newFrame(); if (w) { w.postMessage({ type: 'proto:state', build: state.build, notes: state.notes, labels: LABELS }, '*'); if (state.date) w.postMessage({ type: 'proto:date', date: state.date }, '*'); if (FESTIVE) w.postMessage({ type: 'proto:festive', moment: state.festive ? FESTIVE.moment : '' }, '*'); } }
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'proto:ready') {
      sendState();
      if (d.page && d.page !== state.tab && find(d.page) && !isDoc(state.tab) && e.source === newFrame()) {
        // the viewer clicked through to another page inside the prototype: follow them
        state.tab = d.page; state.sub = 0; writeHash(); renderTabs(); renderTools(); renderNotes();
        var o = stage.querySelector('[data-view="old"]'); if (o) { fillOld(o, cur()); layout(); }
      }
    }
    if (d.type === 'proto:pin') hot(d.n, true);
  });

  function go(patch) {
    var rebuild = false, k;
    for (k in patch) { if (state[k] !== patch[k]) { state[k] = patch[k]; if (k !== 'notes' && k !== 'build' && k !== 'festive') rebuild = true; } }
    if (patch.tab !== undefined) state.sub = patch.sub || 0;
    writeHash(); renderTabs(); renderTools(); renderNotes();
    if (rebuild) renderStage(); else { layout(); sendState(); }
  }

  document.addEventListener('click', function (e) {
    var dt = e.target.closest('[data-date]');
    if (dt) { state.date = dt.getAttribute('data-date'); writeHash(); renderTools(); sendState(); return; }
    var t = e.target.closest('[data-tab], [data-device], button[data-view], [data-sub], [data-note]');
    if (!t) return;
    if (t.hasAttribute('data-tab')) return go({ tab: t.getAttribute('data-tab') });
    if (t.hasAttribute('data-device')) return go({ device: t.getAttribute('data-device') });
    if (t.hasAttribute('data-sub')) return go({ sub: +t.getAttribute('data-sub') });
    if (t.hasAttribute('data-view')) return go({ view: t.getAttribute('data-view') });
    if (t.hasAttribute('data-note')) {
      var n = +t.getAttribute('data-note'); hot(n, false);
      // on Today there is nothing to point at: switch to New, then focus once the page has loaded
      if (state.view === 'old') { go({ view: 'new' }); setTimeout(function () { var w = newFrame(); if (w) w.postMessage({ type: 'proto:focus', n: n }, '*'); }, 900); return; }
      var w = newFrame(); if (w) w.postMessage({ type: 'proto:focus', n: n }, '*');
    }
  });
  $('sw-notes').addEventListener('change', function (e) { go({ notes: e.target.checked }); });
  $('sw-build').addEventListener('change', function (e) { go({ build: e.target.checked }); });
  $('sw-festive').addEventListener('change', function (e) { go({ festive: e.target.checked }); });
  document.addEventListener('keydown', function (e) {
    if (/input|textarea|select/i.test(e.target.tagName)) return;
    var all = order(), i = all.map(function (x) { return x.id; }).indexOf(state.tab);
    if (e.key === 'ArrowRight' && i < all.length - 1) go({ tab: all[i + 1].id });
    if (e.key === 'ArrowLeft' && i > 0) go({ tab: all[i - 1].id });
  });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 80); });

  renderTabs(); renderTools(); renderNotes(); renderStage(); writeHash();
})();
