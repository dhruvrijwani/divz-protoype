/* Presentation layer for prototype pages: build labels, note pins, and the bridge to the shell.
   Not part of the client's design. Load it last on every page:  <script src="assets/proto.js"></script>
   Markup it reads:
     <body data-page="home">                    the page id in shell/data.js
     data-note="3"                              pin 3, linked to note 3
     data-note-key="header"                     for shared parts; map per page with window.PROTO_NOTES = { header: 2 }
     data-build="native|custom|app|todo"        outline and tag the element...
     data-build-label="Image banner: ..."       ...with this text
     data-build-pos="tr|bl|br"                  move the tag off the top left if it covers something
   If the page renders content after load (drawers, product grids), call PROTO.refresh() afterwards. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var PAGE = document.body.getAttribute('data-page') || '';
  var SHELL_URL = window.PROTO_SHELL_URL || '../index.html';
  var LABELS = {
    native: { tag: 'NATIVE', color: '#17683f' }, custom: { tag: 'CUSTOM', color: '#b4530a' },
    app: { tag: 'APP', color: '#5b33b8' }, todo: { tag: 'NEEDS INPUT', color: '#a3231b' }
  };
  var state = { build: /build/.test(location.hash), notes: /notes/.test(location.hash) };
  var inShell = window.parent !== window;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function refresh() {
    document.body.classList.toggle('is-build', state.build);
    document.body.classList.toggle('is-notes', state.notes);
    if (state.build) {
      $$('[data-build]').forEach(function (el) {
        if ($(':scope > .bl', el)) return;
        var kind = el.getAttribute('data-build'), L = LABELS[kind] || { tag: kind, color: '#333' };
        var s = document.createElement('span');
        s.className = 'bl'; s.style.background = L.color;
        s.innerHTML = '<b>' + esc(L.tag) + '</b><i>' + esc(el.getAttribute('data-build-label') || '') + '</i>';
        var pos = el.getAttribute('data-build-pos') || 'tl';
        if (pos.charAt(0) === 'b') { s.style.top = 'auto'; s.style.bottom = '0'; }
        if (pos.charAt(1) === 'r') { s.style.left = 'auto'; s.style.right = '0'; }
        el.style.setProperty('--bl-color', L.color);
        var cs = getComputedStyle(el);
        if (cs.position === 'static') el.classList.add('bl-host');
        // sit the label on the top edge, like a tab, unless the host clips its children or is at the very top of the page
        var top = el.getBoundingClientRect().top + window.scrollY;
        if (cs.overflow === 'visible' && cs.position !== 'fixed' && cs.position !== 'sticky' && top > 60 && pos.charAt(0) !== 'b') s.classList.add('bl--tab');
        el.appendChild(s);
      });
    }
    if (state.notes) {
      var NK = window.PROTO_NOTES || {};
      $$('[data-note-key]').forEach(function (el) { var n = NK[el.getAttribute('data-note-key')]; if (n) el.setAttribute('data-note', n); });
      $$('[data-note]').forEach(function (el) {
        var n = el.getAttribute('data-note');
        if (!/^\d+$/.test(n) || $(':scope > .pin', el)) return;
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'pin'; b.textContent = n; b.setAttribute('data-pin', n); b.setAttribute('aria-label', 'Note ' + n);
        if (getComputedStyle(el).position === 'static') el.classList.add('bl-host');
        el.appendChild(b);
      });
    }
  }

  function focusNote(n) {
    var el = $('[data-note="' + n + '"]'); if (!el) return;
    $$('.is-hot').forEach(function (x) { x.classList.remove('is-hot'); });
    var r = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top - Math.max(90, (window.innerHeight - Math.min(r.height, window.innerHeight * .6)) / 3), behavior: 'smooth' });
    el.classList.add('is-hot'); var pin = $(':scope > .pin', el); if (pin) pin.classList.add('is-hot');
    setTimeout(function () { el.classList.remove('is-hot'); if (pin) pin.classList.remove('is-hot'); }, 2400);
  }

  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'proto:state') {
      state.build = !!d.build; state.notes = !!d.notes;
      if (d.labels) Object.keys(d.labels).forEach(function (k) { LABELS[k] = d.labels[k]; });
      refresh();
    }
    if (d.type === 'proto:focus') focusNote(d.n);
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-pin], [data-proto-x]');
    if (!t) return;
    if (t.hasAttribute('data-pin')) {
      // a pin sits on top of links and buttons: it must not trigger them
      e.preventDefault(); e.stopPropagation();
      try { parent.postMessage({ type: 'proto:pin', n: +t.getAttribute('data-pin') }, '*'); } catch (err) {}
      return;
    }
    var pr = t.closest('.proto'); if (pr) pr.parentNode.removeChild(pr);
    try { sessionStorage.setItem('proto-notice-ok', '1'); } catch (err) {}
  }, true);

  /* Opened on its own (not inside the presentation), a page says what it is.
     A deployed prototype of a real site should never be mistaken for the site. */
  if (!inShell) {
    var seen = false; try { seen = sessionStorage.getItem('proto-notice-ok') === '1'; } catch (e) {}
    if (!seen) document.body.insertAdjacentHTML('afterbegin', '<div class="proto" role="note"><span>' + esc(window.PROTO_NOTICE || 'Design prototype for review. This is not the live site, and nothing can be bought here.') + '</span><a href="' + SHELL_URL + '">Open the presentation</a><button type="button" data-proto-x aria-label="Dismiss this notice">×</button></div>');
  }

  window.PROTO = { refresh: refresh };
  refresh();
  // tells the shell which page loaded, so the tabs follow a viewer who clicks through
  try { if (inShell) parent.postMessage({ type: 'proto:ready', page: PAGE }, '*'); } catch (err) {}
})();
