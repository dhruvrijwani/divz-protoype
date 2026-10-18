/* Zariva prototype — core runtime.
   Theme-level behaviour you would ship in a Shopify theme's global JS:
   header + mega menu, drawers, predictive search, cart (Cart AJAX API in Shopify), quick add,
   reels player, shared renderers. */
(function () {
  'use strict';
  const D = window.ZARIVA_DATA;
  const ZARIVA = (window.ZARIVA = window.ZARIVA || {});
  document.documentElement.classList.add('js');

  /* ------------------------------------------------------------------ utils */
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n, dec) => {
    const fixed = dec || Math.round(n * 100) % 100 !== 0;
    return (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-AU', { minimumFractionDigits: fixed ? 2 : 0, maximumFractionDigits: fixed ? 2 : 0 });
  };
  const params = () => new URLSearchParams(location.search);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable: keep in memory */ } }
  };
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ------------------------------------------------------------------ icons */
  const sv = (d, extra) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra || ''}>${d}</svg>`;
  const I = {
    search: sv('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
    user: sv('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c1.4-3.7 4.3-5.6 7.5-5.6s6.1 1.9 7.5 5.6"/>'),
    bag: sv('<path d="M5.2 8.5h13.6l-1 12H6.2z"/><path d="M9 8.5V6.8a3 3 0 0 1 6 0v1.7"/>'),
    menu: sv('<path d="M3.5 9h17M3.5 15h17"/>'),
    close: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
    chev: sv('<path d="M6 9.5l6 6 6-6"/>'),
    left: sv('<path d="M14.5 6l-6 6 6 6"/>'),
    right: sv('<path d="M9.5 6l6 6-6 6"/>'),
    plus: sv('<path d="M12 5.5v13M5.5 12h13"/>'),
    minus: sv('<path d="M5.5 12h13"/>'),
    check: sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    star: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
    truck: sv('<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7"/><circle cx="6.5" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>'),
    pen: sv('<path d="M4 20h4L19.5 8.5l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    gift: sv('<rect x="3.5" y="9" width="17" height="11.5"/><path d="M2.5 6h19v3h-19zM12 6v14.5"/><path d="M12 6C10.5 2.5 6.5 3 7.5 6M12 6c1.5-3.5 5.5-3 4.5 0"/>'),
    leaf: sv('<path d="M5 19.5C5 11 11 5 19.5 4.5 19.5 13 13.5 19 5 19.5z"/><path d="M5 19.5l8-8"/>'),
    clock: sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    pin: sv('<path d="M12 21s-6.5-5.7-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.3-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
    mail: sv('<rect x="3" y="5.5" width="18" height="13"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>'),
    phone: sv('<path d="M5.5 3.5h3.5l1.8 4.6-2.3 1.4a11 11 0 0 0 6 6l1.4-2.3 4.6 1.8v3.5a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2z"/>'),
    lock: sv('<rect x="5" y="10.5" width="14" height="10"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
    filter: sv('<path d="M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9"/><circle cx="15" cy="7.5" r="2"/><circle cx="9" cy="16.5" r="2"/>'),
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5.5v13l10.5-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7 5.5h3.5v13H7zM13.5 5.5H17v13h-3.5z"/></svg>',
    instagram: sv('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>'),
    tiktok: sv('<path d="M14 3.5v11a3.6 3.6 0 1 1-3.6-3.6"/><path d="M14 3.5c.4 2.6 2.4 4.6 5 4.8"/>'),
    pinterest: sv('<circle cx="12" cy="12" r="8.5"/><path d="M10.6 20.2l1.7-7.4"/><path d="M11.4 15.2c.6.7 1.4 1 2.3 1 2.3 0 3.8-2.1 3.8-4.6 0-2.7-2.1-4.6-5-4.6-3.2 0-5.2 2.2-5.2 4.8 0 1.2.5 2.3 1.3 2.8"/>'),
    facebook: sv('<path d="M14.5 8.5h2.8V4.8h-2.8a4 4 0 0 0-4 4v2.4H8v3.6h2.5v6.4h3.8v-6.4h2.8l.6-3.6h-3.4V9.3c0-.5.3-.8.8-.8z"/>'),
    tag: '<svg viewBox="0 0 24 34" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><path d="M6 1h12l5 6v26H1V7z"/><circle cx="12" cy="8" r="2.2"/></svg>',
    info: sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>'),
    box: sv('<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9"/>'),
    recycle: sv('<path d="M7 9.5L9.6 5a2 2 0 0 1 3.4 0l1.6 2.7"/><path d="M17.5 12l2 3.6a2 2 0 0 1-1.7 3H14"/><path d="M10 18.6H6.3a2 2 0 0 1-1.8-3L6.2 13"/><path d="M14.6 7.7l.4-2.6M14.6 7.7l-2.6-.3M14 18.6l2 1.8M14 18.6l2-1.8M6.2 13l-2.5-.8M6.2 13l.8 2.5"/>')
  };
  const starsHTML = (r, cls) => {
    const full = Math.round(r);
    return `<span class="stars ${cls || ''}" aria-label="${r} out of 5 stars">${Array.from({ length: 5 }, (_, i) => `<span style="opacity:${i < full ? 1 : .25}">${I.star}</span>`).join('')}</span>`;
  };

  /* ------------------------------------------------------------------ images */
  const IMG = 'assets/img/';
  function img(key, o) {
    o = o || {};
    if (!key) return '';
    const pos = D.focus[key] ? ` style="object-position:${D.focus[key]}"` : '';
    return `<img class="${o.cls || ''}" src="${IMG}${key}-900.jpg" srcset="${IMG}${key}-900.jpg 900w, ${IMG}${key}-1700.jpg 1700w" sizes="${o.sizes || '(max-width: 760px) 50vw, 25vw'}" alt="${esc(o.alt || '')}" ${o.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${pos}>`;
  }

  /* ------------------------------------------------------------------ catalogue helpers */
  const PMAP = {};
  D.products.forEach(p => { PMAP[p.handle] = p; });
  const product = h => PMAP[h];
  const valueOf = (p, name, v) => { const o = (p.options || []).find(x => x.name === name); return o && o.values.find(x => x.v === v); };
  function combos(p) {
    let res = [{}];
    (p.options || []).forEach(o => { const next = []; res.forEach(r => o.values.forEach(v => next.push(Object.assign({}, r, { [o.name]: v.v })))); res = next; });
    return res;
  }
  function isSoldOut(p, sel) { return (p.soldOut || []).some(v => Object.values(sel || {}).includes(v)); }
  function defaultSel(p) {
    const avail = combos(p).find(s => !isSoldOut(p, s));
    return Object.assign({}, avail || combos(p)[0]);
  }
  function variantPrice(p, sel) {
    let base = p.price, compare = null, add = 0;
    (p.options || []).forEach(o => {
      const val = valueOf(p, o.name, sel[o.name]);
      if (!val) return;
      if (val.price != null) base = val.price;
      if (val.compare) compare = val.compare;
      if (val.add) add += val.add;
    });
    return { price: base + add, compare: compare ? compare + add : null };
  }
  function priceRange(p) {
    const ps = combos(p).map(s => variantPrice(p, s).price);
    return { min: Math.min.apply(null, ps), max: Math.max.apply(null, ps) };
  }
  const variantTitle = (p, sel) => (p.options || []).map(o => sel[o.name]).filter(Boolean).join(', ');
  function inCollection(handle) {
    if (handle === 'all') return D.products.slice();
    if (handle === 'bestsellers') return D.products.filter(p => p.best).sort((a, b) => a.best - b.best);
    return D.products.filter(p => p.occasions.includes(handle));
  }

  /* ------------------------------------------------------------------ cart (Shopify: /cart/add.js, /cart/change.js) */
  const FREE_SHIP = 150;
  const Cart = {
    key: 'zariva-cart-v1',
    state: null,
    load() { this.state = store.get(this.key, { items: [], note: '', attrs: {} }); this.state.items = (this.state.items || []).filter(i => PMAP[i.handle]); },
    save() { store.set(this.key, this.state); document.dispatchEvent(new CustomEvent('cart:change')); },
    add(handle, sel, qty, card) {
      const id = handle + '|' + JSON.stringify(sel || {}) + '|' + (card ? JSON.stringify(card) : '');
      const ex = this.state.items.find(i => i.id === id);
      if (ex) ex.qty += qty || 1; else this.state.items.push({ id, handle, sel: sel || {}, qty: qty || 1, card: card || null });
      this.save();
    },
    setQty(id, q) {
      const it = this.state.items.find(i => i.id === id);
      if (!it) return;
      if (q <= 0) this.state.items = this.state.items.filter(i => i.id !== id); else it.qty = Math.min(q, 999);
      this.save();
    },
    remove(id) { this.setQty(id, 0); },
    clear() { this.state = { items: [], note: '', attrs: {} }; this.save(); },
    lines() {
      return this.state.items.map(i => {
        const p = PMAP[i.handle];
        const vp = variantPrice(p, i.sel);
        return Object.assign({}, i, { p, price: vp.price, compare: vp.compare, total: vp.price * i.qty, variant: variantTitle(p, i.sel) });
      });
    },
    count() { return this.state.items.reduce((n, i) => n + i.qty, 0); },
    subtotal() { return this.lines().reduce((n, l) => n + l.total, 0); }
  };
  Cart.load();
  window.addEventListener('storage', e => { if (e.key === Cart.key) { Cart.load(); document.dispatchEvent(new CustomEvent('cart:change')); } });

  /* ------------------------------------------------------------------ shared renderers */
  function cardHTML(p, o) {
    o = o || {};
    const r = priceRange(p);
    const hasOpts = (p.options || []).length > 0;
    let priceHtml = r.min !== r.max ? `From ${money(r.min)}` : money(r.min);
    // bulk products (e.g. invitation boxes) read better as a per-box price
    const unitOpt = (p.options || []).find(o => o.values.some(v => v.units));
    if (unitOpt) {
      const per = Math.min.apply(null, unitOpt.values.map(v => variantPrice(p, Object.assign(defaultSel(p), { [unitOpt.name]: v.v })).price / v.units));
      priceHtml = `From ${money(per)} a box`;
    }
    const badge = p.badge ? `<span class="badge ${p.badge === 'Limited' ? 'badge--gold' : ''}">${esc(p.badge)}</span>` : '';
    const second = p.images[1] && p.images[1] !== p.images[0] ? img(p.images[1], { cls: 'card__img card__img--2', sizes: o.sizes }) : '';
    return `<article class="card">
      <div class="card__top">
      <a class="card__media" href="product.html?p=${p.handle}" tabindex="-1" aria-hidden="true">
        ${img(p.images[0], { cls: 'card__img card__img--1', sizes: o.sizes, alt: p.title })}${second}${badge}
      </a>
      <button class="card__quick" type="button" data-quick="${p.handle}" aria-label="${hasOpts ? 'Choose options for' : 'Add to bag:'} ${esc(p.title)}">${I.plus}<span>${hasOpts ? 'Choose options' : 'Add to bag'}</span></button>
      </div>
      <div class="card__info">
        <h3 class="card__title"><a href="product.html?p=${p.handle}">${esc(p.title)}</a></h3>
        <div class="card__row"><span class="card__price price">${priceHtml}</span><span class="card__rating">${I.star}${p.rating.toFixed(1)} <span class="visually-hidden">stars from</span>(${p.reviews})</span></div>
      </div>
    </article>`;
  }

  function reviewHTML(r, o) {
    o = o || {};
    const p = PMAP[r.product];
    return `<article class="review">
      <div class="review__head">${starsHTML(r.rating)}<span class="review__date">${fmtDate(r.date)}</span></div>
      <h3 class="review__title">${esc(r.title)}</h3>
      <p class="review__body">${esc(r.body)}</p>
      ${r.photo ? `<div class="review__photos"><button type="button" data-lightbox="${r.photo}" aria-label="View photo from ${esc(r.name)}">${img(r.photo, { sizes: '84px' })}</button></div>` : ''}
      <div class="review__by"><b>${esc(r.name)}</b><span>${esc(r.place)}</span>${r.verified ? `<span class="verified">${I.check}Verified buyer</span>` : ''}</div>
      ${o.product !== false && p ? `<div class="review__product">${img(p.images[0], { sizes: '32px' })}<span>Reviewed <a href="product.html?p=${p.handle}">${esc(p.title)}</a></span></div>` : ''}
      <div class="helpful">Helpful? <button type="button" data-helpful="${r.helpful}" aria-pressed="false">Yes (${r.helpful})</button></div>
    </article>`;
  }

  function reelHTML(u, i) {
    const p = PMAP[u.product];
    return `<button type="button" class="reel" data-reel="${i}" aria-label="Play ${esc(u.name)}’s video of ${esc(p.title)}">
      <video muted loop playsinline preload="none" poster="assets/video/${u.video}.jpg" data-src="assets/video/${u.video}.mp4"></video>
      <span class="reel__top"><span>${esc(u.name)}, ${esc(u.place.split(',')[0])}</span><span class="reel__play">${I.play}</span></span>
      <span class="reel__product"><span class="m">${img(p.images[0], { sizes: '44px' })}</span><span><span class="n">${esc(p.title)}</span><br><span class="p">${(priceRange(p).min !== priceRange(p).max ? 'From ' : '') + money(priceRange(p).min)}</span></span></span>
    </button>`;
  }

  function optionsHTML(p, sel, scope) {
    return (p.options || []).map((o, oi) => {
      const lid = `${scope}-opt-${oi}`;
      if (o.swatch) {
        return `<div class="opt" role="group" aria-labelledby="${lid}">
          <div class="opt__label" id="${lid}">${esc(o.name)} <span>${esc(sel[o.name])}</span></div>
          <div class="swatches">${o.values.map(v => {
            const s = Object.assign({}, sel, { [o.name]: v.v });
            const sold = isSoldOut(p, s);
            return `<button type="button" class="swatch ${sold ? 'is-soldout' : ''}" aria-pressed="${sel[o.name] === v.v}" aria-label="${esc(v.v)}${sold ? ', sold out' : ''}" title="${esc(v.v)}" data-opt="${esc(o.name)}" data-val="${esc(v.v)}" style="--sw:${v.hex}"><i></i></button>`;
          }).join('')}</div></div>`;
      }
      return `<div class="opt" role="group" aria-labelledby="${lid}">
        <div class="opt__label" id="${lid}">${esc(o.name)}</div>
        <div class="opt__buttons">${o.values.map(v => {
          const s = Object.assign({}, sel, { [o.name]: v.v });
          const vp = variantPrice(p, s);
          const sold = isSoldOut(p, s);
          return `<button type="button" class="opt-btn ${sold ? 'is-soldout' : ''}" aria-pressed="${sel[o.name] === v.v}" data-opt="${esc(o.name)}" data-val="${esc(v.v)}">
            <span class="opt-btn__top"><b>${esc(v.v)}</b><span class="price">${money(vp.price)}</span></span>
            ${sold ? '<small>Sold out</small>' : (v.note ? `<small>${esc(v.note)}</small>` : '')}
          </button>`;
        }).join('')}</div></div>`;
    }).join('');
  }

  function afterpayHTML(price) {
    return `<p class="afterpay-line">or 4 interest-free payments of ${money(price / 4, true)} with <span class="afterpay-pill">afterpay</span></p>`;
  }

  /* ------------------------------------------------------------------ logo: an arch holding one gold diamond, HOUSE OF over the wordmark */
  const ARCH = '<svg class="logo__arch" viewBox="0 0 24 30" fill="none" aria-hidden="true"><path d="M3.5 29.5V12.2a8.5 8.5 0 0 1 17 0v17.3" stroke="currentColor" stroke-width="1.4"/><path class="logo__diamond" d="M12 14.4l2.5 3-2.5 3-2.5-3z"/></svg>';
  const logoHTML = () => '<span class="logo__lockup">' + ARCH + '<span class="logo__of">House of</span><span class="logo__word">Zariva</span></span>';

  /* ------------------------------------------------------------------ chrome: top (announcement + header) */
  const OCC = D.OCCASIONS;
  function navCount(h) { const n = inCollection(h).length; return `${n} hamper${n === 1 ? '' : 's'}`; }

  function topHTML() {
    const page = document.body.dataset.page;
    const cur = (pg, c) => page === pg && (!c || params().get('c') === c) ? ' aria-current="page"' : '';
    const msgs = [
      'Diwali is Sunday 8 November. <a href="collection.html?c=diwali">Order by 2 November</a> for delivery Australia-wide.',
      'Complimentary delivery on orders over $150.',
      'Same-day delivery across Sydney and Melbourne metro when you order by 1pm.',
      'Christmas pre-orders are open. <a href="collection.html?c=christmas">Choose your dispatch date</a>.'
    ];
    const occList = OCC.map(h => `<a href="collection.html?c=${h}">${esc(D.collections[h].title)}<span class="mega__count">${navCount(h)}</span></a>`).join('');
    return `
<a class="skip-link" href="#main">Skip to content</a>
<div class="announce" role="region" aria-label="Announcements">
  <div class="announce__track">
    <button class="announce__nav announce__nav--prev" type="button" aria-label="Previous announcement">${I.left}</button>
    ${msgs.map((m, i) => `<p class="announce__msg${i === 0 ? ' is-active' : ''}" ${i ? 'aria-hidden="true"' : ''}><span>${m}</span></p>`).join('')}
    <button class="announce__nav announce__nav--next" type="button" aria-label="Next announcement">${I.right}</button>
  </div>
</div>
<header class="header" id="header">
  <div class="header__inner">
    <div class="header__left">
      <button class="icon-btn header__burger" type="button" aria-label="Open menu" aria-controls="menu-drawer" aria-expanded="false" data-open="menu-drawer">${I.menu}</button>
      <nav class="nav" aria-label="Primary">
        <a class="nav__link" href="collection.html?c=all"${cur('collection', 'all')}>Shop all</a>
        <a class="nav__link" href="collection.html?c=bestsellers"${cur('collection', 'bestsellers')}>Bestsellers</a>
        <button class="nav__link" type="button" aria-expanded="false" aria-controls="mega" data-mega>Occasions ${I.chev}</button>
      </nav>
    </div>
    <a class="logo" href="index.html" aria-label="House of Zariva, home">${logoHTML()}</a>
    <div class="header__right">
      <nav class="nav nav--right" aria-label="Secondary">
        <a class="nav__link nav__link--opt" href="about.html"${cur('about')}>About</a>
        <a class="nav__link nav__link--opt" href="reviews.html"${cur('reviews')}>Reviews</a>
        <a class="nav__link" href="contact.html"${cur('contact')}>Contact</a>
      </nav>
      <button class="icon-btn" type="button" aria-label="Search" aria-controls="search" aria-expanded="false" data-open="search">${I.search}</button>
      <a class="icon-btn header__account" href="account.html" aria-label="Account">${I.user}</a>
      <button class="icon-btn header__cart" type="button" aria-controls="cart-drawer" aria-expanded="false" data-open="cart-drawer"><span class="visually-hidden" data-cart-label>Bag</span>${I.bag}<span class="cart-count" aria-hidden="true">0</span></button>
    </div>
  </div>
  <div class="mega" id="mega" data-mega-panel>
    <div class="mega__inner">
      <nav class="mega__list" aria-label="Occasions">${occList}</nav>
      <div class="mega__features">
        <a class="mega-card" href="collection.html?c=diwali">
          <div class="mega-card__media">${img('d-hands-diya', { sizes: '30vw', alt: '' })}</div>
          <div><p class="mega-card__title">The Diwali edit</p><p class="mega-card__text">Order by Monday 2 November for delivery before Diwali.</p></div>
        </a>
        <a class="mega-card" href="collection.html?c=christmas">
          <div class="mega-card__media">${img('x-wax-kraft', { sizes: '30vw', alt: '' })}</div>
          <div><p class="mega-card__title">Christmas pre-orders</p><p class="mega-card__text">Choose a dispatch date from 1 December and we’ll take it from there.</p></div>
        </a>
      </div>
    </div>
  </div>
</header>`;
  }

  /* ------------------------------------------------------------------ chrome: bottom (footer + overlays) */
  function bottomHTML() {
    const occLinks = OCC.map(h => `<li><a href="collection.html?c=${h}">${esc(D.collections[h].title)}</a></li>`).join('');
    return `
<footer class="footer on-dark">
  <div class="container">
    <div class="footer__top">
      <div class="footer__news">
        <h2 class="t-h2">Seasonal edits, first.</h2>
        <p>Early access to the Diwali and Christmas collections, and a note when a new maker joins us. Four or five emails a year.</p>
        <form class="news-form" data-news novalidate>
          <label class="visually-hidden" for="news-email">Email address</label>
          <input id="news-email" type="email" placeholder="Email address" autocomplete="email" required>
          <button type="submit">Subscribe</button>
        </form>
        <p class="news-done" data-news-done hidden>You’re on the list. Watch for our Diwali edit.</p>
      </div>
      <div class="footer__cols">
        <div><h3>Shop</h3><ul><li><a href="collection.html?c=all">All hampers</a></li><li><a href="collection.html?c=bestsellers">Bestsellers</a></li><li><a href="collection.html?c=all&type=Add-on">Add-ons</a></li><li><a href="search.html">Search</a></li></ul></div>
        <div><h3>Occasions</h3><ul>${occLinks}</ul></div>
        <div><h3>Help</h3><ul><li><a href="contact.html">Contact us</a></li><li><a href="faq.html#delivery">Shipping & delivery</a></li><li><a href="faq.html#orders">Orders & changes</a></li><li><a href="faq.html#returns">Returns & refunds</a></li><li><a href="faq.html">FAQs</a></li></ul></div>
        <div><h3>Zariva</h3><ul><li><a href="about.html">Our story</a></li><li><a href="reviews.html">Reviews</a></li><li><a href="contact.html?topic=corporate">Corporate enquiries</a></li><li><a href="account.html">Your account</a></li></ul></div>
      </div>
    </div>
    <div class="footer__mid">
      <p class="footer__ack">${I.leaf}<span>We pack every hamper on Gadigal land. We acknowledge the Traditional Custodians of the lands across Australia where our makers grow, bake and pour, and pay our respects to Elders past and present.</span></p>
      <div class="footer__social">
        <a href="#" aria-label="Zariva on Instagram">${I.instagram}</a><a href="#" aria-label="Zariva on TikTok">${I.tiktok}</a><a href="#" aria-label="Zariva on Pinterest">${I.pinterest}</a><a href="#" aria-label="Zariva on Facebook">${I.facebook}</a>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© 2026 Zariva Pty Ltd. Prices in AUD and include GST.</span>
      <div class="pay-icons" aria-label="Payment methods we accept"><span>Visa</span><span>Mastercard</span><span>Amex</span><span>PayPal</span><span>Apple Pay</span><span>Google Pay</span><span>Shop Pay</span><span>Afterpay</span></div>
    </div>
  </div>
  <div class="footer__word" aria-hidden="true"><span>Zariva</span></div>
</footer>

<div class="scrim" data-scrim></div>

<aside class="drawer drawer--left" id="menu-drawer" aria-label="Menu" aria-hidden="true" tabindex="-1">
  <div class="drawer__head"><span class="logo logo--sm">${logoHTML()}</span><button class="icon-btn" type="button" data-close aria-label="Close menu">${I.close}</button></div>
  <div class="drawer__body">
    <nav class="mnav" aria-label="Mobile">
      <a href="collection.html?c=all">Shop all ${I.right}</a>
      <a href="collection.html?c=bestsellers">Bestsellers ${I.right}</a>
      <details open><summary>Occasions ${I.chev}</summary><div>${OCC.map(h => `<a href="collection.html?c=${h}">${esc(D.collections[h].title)}</a>`).join('')}</div></details>
      <a href="about.html">About ${I.right}</a>
      <a href="reviews.html">Reviews ${I.right}</a>
      <a href="contact.html">Contact ${I.right}</a>
    </nav>
    <div class="mnav__meta">
      <a href="account.html">${I.user} Sign in or create an account</a>
      <a href="faq.html#delivery">${I.truck} Shipping & delivery</a>
      <a href="tel:0255504321">${I.phone} (02) 5550 4321</a>
    </div>
  </div>
</aside>

<aside class="drawer drawer--right" id="cart-drawer" aria-label="Your bag" aria-hidden="true" tabindex="-1">
  <div class="drawer__head"><h2 class="drawer__title">Your bag <span class="t-meta" data-cart-heading-count></span></h2><button class="icon-btn" type="button" data-close aria-label="Close bag">${I.close}</button></div>
  <div class="drawer__body" data-cart-body></div>
  <div class="drawer__foot" data-cart-foot></div>
</aside>

<div class="search" id="search" role="dialog" aria-modal="true" aria-label="Search" aria-hidden="true">
  <form class="search__bar" action="search.html" role="search">
    ${I.search}
    <label class="visually-hidden" for="search-input">Search hampers</label>
    <input class="search__input" id="search-input" name="q" type="search" placeholder="Search hampers, occasions or makers" autocomplete="off" data-autofocus>
    <button class="icon-btn" type="button" data-close aria-label="Close search">${I.close}</button>
  </form>
  <div class="search__results" data-search-results></div>
</div>

<div class="modal" id="quick" role="dialog" aria-modal="true" aria-label="Quick add" aria-hidden="true">
  <div class="modal__scrim" data-close></div>
  <div class="modal__panel" data-quick-panel></div>
</div>

<div class="modal reel-modal" id="reel" role="dialog" aria-modal="true" aria-label="Customer video" aria-hidden="true">
  <div class="modal__scrim" data-close></div>
  <div class="modal__panel" data-reel-panel></div>
</div>

<div class="modal lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Photo" aria-hidden="true">
  <div class="modal__scrim" data-close></div>
  <div class="modal__panel"><button class="icon-btn modal__close" type="button" data-close aria-label="Close photo">${I.close}</button><div data-lightbox-body></div></div>
</div>

<div class="toast" role="status" aria-live="polite" data-toast></div>`;
  }

  /* ------------------------------------------------------------------ overlays: open / close / focus trap */
  let openEl = null, opener = null;
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  function open(id, from) {
    const el = document.getElementById(id);
    if (!el) return;
    if (openEl && openEl !== el) close(true);
    openEl = el; opener = from || document.activeElement;
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    if (el.classList.contains('drawer')) $('[data-scrim]').classList.add('is-open');
    document.body.classList.add('is-locked');
    $$(`[aria-controls="${id}"]`).forEach(b => b.setAttribute('aria-expanded', 'true'));
    if (id === 'cart-drawer') renderCartDrawer();
    setTimeout(() => {
      const target = el.querySelector('[data-autofocus]') || el.querySelector('button[data-close]') || el;
      target.focus({ preventScroll: true });
    }, 60);
  }
  function close(silent) {
    if (!openEl) return;
    const el = openEl;
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
    $('[data-scrim]').classList.remove('is-open');
    document.body.classList.remove('is-locked');
    $$(`[aria-controls="${el.id}"]`).forEach(b => b.setAttribute('aria-expanded', 'false'));
    $$('video', el).forEach(v => v.pause());
    openEl = null;
    if (!silent && opener && opener.focus) opener.focus({ preventScroll: true });
  }
  ZARIVA.open = open; ZARIVA.close = close;

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (openEl) close(); else closeMega(); }
    if (e.key === 'Tab' && openEl) {
      const f = $$(FOCUSABLE, openEl).filter(x => x.offsetParent !== null || x === document.activeElement);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ------------------------------------------------------------------ toast */
  let toastT;
  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.innerHTML = I.check + '<span>' + msg + '</span>';
    t.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('is-on'), 2600);
  }
  ZARIVA.toast = toast;

  /* ------------------------------------------------------------------ mega menu */
  let megaT;
  function openMega() { clearTimeout(megaT); $('[data-mega-panel]').classList.add('is-open'); $('[data-mega]').setAttribute('aria-expanded', 'true'); }
  function closeMega() { const p = $('[data-mega-panel]'); if (!p) return; p.classList.remove('is-open'); $('[data-mega]').setAttribute('aria-expanded', 'false'); }
  function initMega() {
    const btn = $('[data-mega]'), panel = $('[data-mega-panel]');
    if (!btn) return;
    const fine = matchMedia('(hover: hover)').matches;
    btn.addEventListener('click', () => (panel.classList.contains('is-open') ? closeMega() : openMega()));
    if (fine) {
      [btn, panel].forEach(el => {
        el.addEventListener('mouseenter', () => { clearTimeout(megaT); megaT = setTimeout(openMega, 90); });
        el.addEventListener('mouseleave', () => { clearTimeout(megaT); megaT = setTimeout(closeMega, 220); });
      });
    }
    panel.addEventListener('focusout', e => { if (!panel.contains(e.relatedTarget) && e.relatedTarget !== btn) closeMega(); });
    document.addEventListener('click', e => { if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) closeMega(); });
  }

  /* ------------------------------------------------------------------ announcement */
  function initAnnounce() {
    const msgs = $$('.announce__msg');
    if (msgs.length < 2) return;
    let i = 0, timer;
    const show = n => {
      msgs[i].classList.remove('is-active'); msgs[i].setAttribute('aria-hidden', 'true');
      i = (n + msgs.length) % msgs.length;
      msgs[i].classList.add('is-active'); msgs[i].removeAttribute('aria-hidden');
    };
    const start = () => { if (!reduceMotion()) timer = setInterval(() => show(i + 1), 5200); };
    const stop = () => clearInterval(timer);
    $('.announce__nav--prev').addEventListener('click', () => { stop(); show(i - 1); start(); });
    $('.announce__nav--next').addEventListener('click', () => { stop(); show(i + 1); start(); });
    const bar = $('.announce');
    bar.addEventListener('mouseenter', stop); bar.addEventListener('mouseleave', start);
    bar.addEventListener('focusin', stop); bar.addEventListener('focusout', start);
    start();
  }

  /* ------------------------------------------------------------------ header state */
  function initHeader() {
    const h = $('#header');
    if (!h) return;
    const onScroll = () => h.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------ cart UI */
  function updateCartCount(bump) {
    const n = Cart.count();
    $$('.cart-count').forEach(c => {
      c.textContent = n;
      c.classList.toggle('has-items', n > 0);
      if (bump) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
    });
    const lbl = $('[data-cart-label]');
    if (lbl) lbl.textContent = `Bag, ${n} item${n === 1 ? '' : 's'}`;
  }
  function freeBarHTML(sub) {
    const left = Math.max(0, FREE_SHIP - sub);
    const pct = Math.min(1, sub / FREE_SHIP);
    return `<div class="free-bar"><p>${left > 0 ? `You’re <b>${money(left)}</b> away from complimentary delivery.` : 'Your order has <b>complimentary delivery</b>.'}</p><div class="free-bar__track" role="progressbar" aria-valuemin="0" aria-valuemax="${FREE_SHIP}" aria-valuenow="${Math.min(sub, FREE_SHIP)}" aria-label="Progress to complimentary delivery"><div class="free-bar__fill" style="transform:scaleX(${pct})"></div></div></div>`;
  }
  function lineHTML(l, o) {
    o = o || {};
    const card = l.card && l.card.msg ? `<p class="line-item__card" title="${esc(l.card.msg)}"><span>${l.card.to ? esc(l.card.to) + ', ' : ''}${esc(l.card.msg)}${l.card.from ? ' — ' + esc(l.card.from) : ''}</span></p>` : '';
    return `<div class="line-item" data-line="${esc(l.id)}">
      <a class="line-item__media" href="product.html?p=${l.handle}">${img(l.p.images[0], { sizes: o.big ? '120px' : '88px', alt: l.p.title })}</a>
      <div>
        <a class="line-item__title" href="product.html?p=${l.handle}">${esc(l.p.title)}</a>
        ${l.variant ? `<p class="line-item__opts">${esc(l.variant)}</p>` : ''}
        ${card}
        <div class="line-item__actions">
          <div class="qty qty--small"><button type="button" data-dec aria-label="Decrease quantity">${I.minus}</button><input type="number" min="0" value="${l.qty}" aria-label="Quantity of ${esc(l.p.title)}" data-qty-input><button type="button" data-inc aria-label="Increase quantity">${I.plus}</button></div>
          <button type="button" class="line-item__remove" data-remove>Remove</button>
        </div>
      </div>
      <div class="line-item__price price">${l.compare ? `<s class="price--compare">${money(l.compare * l.qty)}</s><br>` : ''}${money(l.total)}</div>
    </div>`;
  }
  function upsellHTML(excl) {
    const adds = D.products.filter(p => p.type === 'Add-on' && !excl.includes(p.handle)).slice(0, 4);
    if (!adds.length) return '';
    return `<div class="upsell"><h3>Finish the gift</h3><div class="upsell__row">${adds.map(p => `
      <div class="mini"><a class="mini__media" href="product.html?p=${p.handle}">${img(p.images[0], { sizes: '56px', alt: p.title })}</a>
      <div><p class="mini__title">${esc(p.title)}</p><p class="mini__price">${money(p.price)}</p><button type="button" class="mini__add" data-add-simple="${p.handle}">Add</button></div></div>`).join('')}</div></div>`;
  }
  function renderCartDrawer() {
    const body = $('[data-cart-body]'), foot = $('[data-cart-foot]');
    if (!body) return;
    const lines = Cart.lines(), sub = Cart.subtotal(), n = Cart.count();
    $('[data-cart-heading-count]').textContent = n ? `(${n})` : '';
    if (!lines.length) {
      body.innerHTML = `<div class="empty-state"><p class="t-h3">Your bag is empty.</p><p class="t-muted">Start with an occasion, or see what’s leaving the studio most this week.</p><a class="btn" href="collection.html?c=bestsellers">Shop bestsellers</a><a class="link" href="collection.html?c=diwali">Browse the Diwali edit</a></div>`;
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = freeBarHTML(sub) + lines.map(l => lineHTML(l)).join('') + upsellHTML(lines.map(l => l.handle));
    foot.innerHTML = `<div class="cart-totals"><div class="cart-totals__row cart-totals__row--total"><span>Subtotal</span><span class="price">${money(sub, true)}</span></div><small>GST included. Delivery and any discounts are calculated at checkout.</small></div>
      <a class="btn btn--block" href="checkout.html">${I.lock} Checkout</a>
      <a class="btn btn--secondary btn--block" href="cart.html">View bag and choose a delivery date</a>
      ${afterpayHTML(sub)}`;
  }
  ZARIVA.renderCartDrawer = renderCartDrawer;

  // line-item controls (drawer and cart page)
  document.addEventListener('click', e => {
    const line = e.target.closest('[data-line]');
    if (line) {
      const id = line.dataset.line;
      const it = Cart.state.items.find(i => i.id === id);
      if (!it) return;
      if (e.target.closest('[data-inc]')) Cart.setQty(id, it.qty + 1);
      else if (e.target.closest('[data-dec]')) Cart.setQty(id, it.qty - 1);
      else if (e.target.closest('[data-remove]')) Cart.remove(id);
    }
    const simple = e.target.closest('[data-add-simple]');
    if (simple) {
      const p = PMAP[simple.dataset.addSimple];
      Cart.add(p.handle, defaultSel(p), 1, null);
      toast(`${esc(p.title)} added to your bag.`);
    }
  });
  document.addEventListener('change', e => {
    const inp = e.target.closest('[data-qty-input]');
    const line = e.target.closest('[data-line]');
    if (inp && line) Cart.setQty(line.dataset.line, parseInt(inp.value, 10) || 0);
  });
  document.addEventListener('cart:change', () => {
    updateCartCount(true);
    if (openEl && openEl.id === 'cart-drawer') renderCartDrawer();
  });

  // add-to-bag shared action
  function addToBag(handle, sel, qty, card, btn) {
    const p = PMAP[handle];
    if (isSoldOut(p, sel)) return;
    Cart.add(handle, sel, qty, card);
    if (btn) {
      const html = btn.innerHTML;
      btn.classList.add('is-added');
      btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px">${I.check.replace('class="icon"', 'class="icon btn__check"')} Added to bag</span>`;
      setTimeout(() => { btn.classList.remove('is-added'); btn.innerHTML = html; }, 1800);
    }
    setTimeout(() => open('cart-drawer', btn), btn ? 450 : 0);
  }
  ZARIVA.addToBag = addToBag;

  /* ------------------------------------------------------------------ quick add */
  function renderQuick(p, sel) {
    const panel = $('[data-quick-panel]');
    const vp = variantPrice(p, sel);
    const sold = isSoldOut(p, sel);
    panel.innerHTML = `<button class="icon-btn modal__close" type="button" data-close aria-label="Close">${I.close}</button>
      <div class="quick">
        <div class="quick__media">${img(p.images[0], { sizes: '(max-width: 760px) 100vw, 460px', alt: p.title })}</div>
        <div class="quick__info">
          <h2 class="t-h3">${esc(p.title)}</h2>
          <div class="pinfo__price"><span class="price" style="font-size:20px">${money(vp.price)}</span>${vp.compare ? `<s class="price price--compare">${money(vp.compare)}</s>` : ''}</div>
          <p class="t-small">${esc(p.blurb)}</p>
          <div class="stack-m" data-quick-opts>${optionsHTML(p, sel, 'q')}</div>
          <button class="btn btn--block btn--split" type="button" data-quick-add ${sold ? 'disabled' : ''}><span>${sold ? 'Sold out' : 'Add to bag'}</span><span class="price">${money(vp.price)}</span></button>
          <p class="t-small t-muted">A handwritten card is included. Write your message on the <a class="link" href="product.html?p=${p.handle}">full hamper page</a>, or add it in your bag later.</p>
        </div>
      </div>`;
    panel.onclick = e => {
      const b = e.target.closest('[data-opt]');
      if (b) { sel[b.dataset.opt] = b.dataset.val; renderQuick(p, sel); const again = panel.querySelector(`[data-opt="${CSS.escape(b.dataset.opt)}"][data-val="${CSS.escape(b.dataset.val)}"]`); if (again) again.focus(); return; }
      const add = e.target.closest('[data-quick-add]');
      if (add) { Cart.add(p.handle, Object.assign({}, sel), 1, null); close(true); setTimeout(() => open('cart-drawer'), 120); }
    };
  }
  document.addEventListener('click', e => {
    const q = e.target.closest('[data-quick]');
    if (!q) return;
    e.preventDefault();
    const p = PMAP[q.dataset.quick];
    if (!p) return;
    if (!(p.options || []).length) { addToBag(p.handle, {}, 1, null, null); return; }
    renderQuick(p, defaultSel(p));
    open('quick', q);
  });

  /* ------------------------------------------------------------------ predictive search */
  function searchProducts(q) {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const words = t.split(/\s+/);
    return D.products.map(p => {
      const hay = [p.title, p.blurb, p.description, p.occasions.map(o => D.collections[o].title).join(' '), (p.inside || []).map(i => i.join(' ')).join(' '), (p.recipients || []).join(' '), (p.dietary || []).join(' ')].join(' ').toLowerCase();
      let score = 0;
      words.forEach(w => { if (p.title.toLowerCase().includes(w)) score += 5; if (hay.includes(w)) score += 1; else score -= 10; });
      return { p, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.p);
  }
  ZARIVA.searchProducts = searchProducts;
  const hl = (text, q) => {
    const safe = esc(text);
    const w = q.trim().split(/\s+/).filter(Boolean).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return w.length ? safe.replace(new RegExp('(' + w.join('|') + ')', 'ig'), '<mark>$1</mark>') : safe;
  };
  function renderSearch(q) {
    const box = $('[data-search-results]');
    if (!box) return;
    const popular = ['Diwali', 'Whisky', 'Baby', 'Corporate', 'Christmas', 'Flowers', 'Mithai'];
    if (!q.trim()) {
      const best = inCollection('bestsellers').slice(0, 4);
      box.innerHTML = `<div class="search__col"><h3>Popular searches</h3><ul>${popular.map(s => `<li><a href="search.html?q=${encodeURIComponent(s)}">${s}</a></li>`).join('')}</ul></div>
        <div class="search__col"><h3>Bestsellers</h3><div class="search__products">${best.map(p => searchCard(p)).join('')}</div></div>`;
      return;
    }
    const res = searchProducts(q);
    const cols = Object.keys(D.collections).filter(h => D.collections[h].title.toLowerCase().includes(q.trim().toLowerCase()));
    box.innerHTML = `<div class="search__col"><h3>Occasions</h3><ul>${(cols.length ? cols : D.OCCASIONS.slice(0, 4)).map(h => `<li><a href="collection.html?c=${h}">${hl(D.collections[h].title, q)}</a></li>`).join('')}</ul></div>
      <div class="search__col"><h3>${res.length ? `Hampers (${res.length})` : 'No hampers match'}</h3>${res.length ? `<div class="search__products">${res.slice(0, 4).map(p => searchCard(p, q)).join('')}</div>` : `<p class="t-muted">Nothing matches “${esc(q)}”. Try an occasion like Diwali, or a word like whisky or flowers.</p>`}</div>
      ${res.length > 4 ? `<div class="search__foot"><a class="btn btn--secondary" href="search.html?q=${encodeURIComponent(q)}">See all ${res.length} results</a></div>` : ''}`;
  }
  function searchCard(p, q) {
    const r = priceRange(p);
    return `<a class="search__product" href="product.html?p=${p.handle}"><span class="m">${img(p.images[0], { sizes: '200px', alt: '' })}</span><span class="n">${q ? hl(p.title, q) : esc(p.title)}</span><span class="p">${r.min !== r.max ? 'From ' : ''}${money(r.min)}</span></a>`;
  }
  function initSearch() {
    const input = $('#search-input');
    if (!input) return;
    renderSearch('');
    input.addEventListener('input', debounce(() => renderSearch(input.value), 120));
  }

  /* ------------------------------------------------------------------ reels: autoplay in view + player */
  const reelIO = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      const v = en.target;
      if (en.isIntersecting && !reduceMotion()) {
        if (!v.src) v.src = v.dataset.src;
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      } else v.pause();
    });
  }, { threshold: 0.35 }) : null;
  function observeReels(root) { $$('.reel video', root).forEach(v => reelIO && reelIO.observe(v)); }
  ZARIVA.observeReels = observeReels;
  let reelList = D.ugc, reelIdx = 0;
  function renderReel(i) {
    reelIdx = (i + reelList.length) % reelList.length;
    const u = reelList[reelIdx], p = PMAP[u.product];
    const r = priceRange(p);
    $('[data-reel-panel]').innerHTML = `<button class="icon-btn modal__close" type="button" data-close aria-label="Close video">${I.close}</button>
      <div class="reel-player">
        <div class="reel-player__video"><video src="assets/video/${u.video}.mp4" poster="assets/video/${u.video}.jpg" muted loop playsinline autoplay></video>
          <button class="icon-btn" type="button" data-reel-toggle aria-label="Pause video" style="position:absolute;left:12px;bottom:12px;background:rgba(255,255,255,.85);color:var(--ink)">${I.pause}</button></div>
        <div class="reel-player__info">
          <div class="stack-m">
            <p class="t-meta" style="color:rgba(255,255,255,.7)">${esc(u.name)}, ${esc(u.place)}</p>
            <p class="t-quote">“${esc(u.quote)}”</p>
          </div>
          <div class="stack-m">
            <a class="reel-product" href="product.html?p=${p.handle}"><span class="reel-product__media">${img(p.images[0], { sizes: '84px', alt: '' })}</span><span><span class="reel-product__title">${esc(p.title)}</span><br><span class="t-small" style="opacity:.75">${r.min !== r.max ? 'From ' : ''}${money(r.min)}</span></span></a>
            <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn--light" type="button" data-quick="${p.handle}">${(p.options || []).length ? 'Choose options' : 'Add to bag'}</button><a class="btn btn--ghost-light" href="product.html?p=${p.handle}">View hamper</a></div>
            <div style="display:flex;gap:8px;justify-content:flex-end"><button class="slider__btn" style="border-color:rgba(255,255,255,.4)" type="button" data-reel-prev aria-label="Previous video">${I.left}</button><button class="slider__btn" style="border-color:rgba(251,251,248,.4)" type="button" data-reel-next aria-label="Next video">${I.right}</button></div>
          </div>
        </div>
      </div>`;
    const v = $('[data-reel-panel] video');
    if (reduceMotion()) { v.removeAttribute('autoplay'); v.pause(); }
  }
  document.addEventListener('click', e => {
    const r = e.target.closest('[data-reel]');
    if (r) {
      const list = r.closest('[data-reel-list]');
      reelList = list && list._reels ? list._reels : D.ugc;
      renderReel(parseInt(r.dataset.reel, 10));
      open('reel', r);
      return;
    }
    if (e.target.closest('[data-reel-next]')) renderReel(reelIdx + 1);
    if (e.target.closest('[data-reel-prev]')) renderReel(reelIdx - 1);
    const tg = e.target.closest('[data-reel-toggle]');
    if (tg) {
      const v = $('[data-reel-panel] video');
      if (v.paused) { v.play(); tg.innerHTML = I.pause; tg.setAttribute('aria-label', 'Pause video'); }
      else { v.pause(); tg.innerHTML = I.play; tg.setAttribute('aria-label', 'Play video'); }
    }
    const lb = e.target.closest('[data-lightbox]');
    if (lb) {
      $('[data-lightbox-body]').innerHTML = `<img src="${IMG}${lb.dataset.lightbox}-1700.jpg" alt="${esc(lb.getAttribute('aria-label') || '')}">`;
      open('lightbox', lb);
    }
    const hp = e.target.closest('[data-helpful]');
    if (hp && hp.getAttribute('aria-pressed') !== 'true') {
      hp.setAttribute('aria-pressed', 'true');
      hp.textContent = `Thanks (${parseInt(hp.dataset.helpful, 10) + 1})`;
    }
  });

  /* ------------------------------------------------------------------ sliders */
  function initSlider(root) {
    const track = $('.slider__track', root);
    const prev = $('[data-prev]', root), next = $('[data-next]', root);
    if (!track || !prev) return;
    const step = () => { const c = track.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 300; };
    const sync = () => { prev.disabled = track.scrollLeft < 8; next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8; };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', debounce(sync, 60), { passive: true });
    window.addEventListener('resize', debounce(sync, 120));
    sync();
  }
  ZARIVA.initSlider = initSlider;
  const sliderHead = (title, sub, link) => `<div class="section-head"><div class="section-head__text"><h2 class="t-h2">${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div><div style="display:flex;align-items:center;gap:24px">${link || ''}<div class="slider__nav"><button class="slider__btn" type="button" data-prev aria-label="Scroll back">${I.left}</button><button class="slider__btn" type="button" data-next aria-label="Scroll forward">${I.right}</button></div></div></div>`;

  /* ------------------------------------------------------------------ one-time reveals */
  function initReveals(root) {
    const els = $$('.occ__list, .image-reveal', root);
    if (!('IntersectionObserver' in window) || reduceMotion()) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('is-revealed');
        io.unobserve(el);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.85 && r.bottom > 0) return; // already on screen: leave as is
      el.classList.add('will-reveal');
      io.observe(el);
    });
  }
  ZARIVA.initReveals = initReveals;

  /* ------------------------------------------------------------------ occasion index (home: list + arch stage) */
  function occasionIndexHTML() {
    const rows = D.OCCASIONS.map((h, i) => {
      const c = D.collections[h];
      return `<li style="--i:${i}"><a class="occ__row${i === 0 ? ' is-active' : ''}" href="collection.html?c=${h}" data-occ-row="${i}">
        <span class="occ__thumb" aria-hidden="true">${img(c.image, { sizes: '72px', alt: '' })}</span>
        <span class="occ__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <span class="occ__txt"><span class="occ__name">${esc(c.title)}</span><span class="occ__line">${esc(c.line || '')}</span></span>
        <span class="occ__count">${navCount(h)}</span>
        <span class="occ__arrow" aria-hidden="true">${I.right}</span>
      </a></li>`;
    }).join('');
    const stage = D.OCCASIONS.map((h, i) => `<span class="occ__frame${i === 0 ? ' is-active' : ''}">${img(D.collections[h].image, { sizes: '(max-width: 1023px) 1px, 40vw', alt: '' })}</span>`).join('');
    return { rows, stage };
  }
  function initOccasions(root) {
    const rows = $$('[data-occ-row]', root), frames = $$('.occ__frame', root);
    if (!rows.length) return;
    const show = i => {
      rows.forEach((r, j) => r.classList.toggle('is-active', j === i));
      frames.forEach((f, j) => f.classList.toggle('is-active', j === i));
    };
    rows.forEach((r, i) => {
      r.addEventListener('mouseenter', () => show(i));
      r.addEventListener('focus', () => show(i));
    });
  }

  /* ------------------------------------------------------------------ newsletter */
  function initNews() {
    $$('[data-news]').forEach(f => f.addEventListener('submit', e => {
      e.preventDefault();
      const inp = f.querySelector('input');
      if (!inp.value || !/^\S+@\S+\.\S+$/.test(inp.value)) { inp.setAttribute('aria-invalid', 'true'); inp.focus(); inp.placeholder = 'Enter an email like name@example.com'; inp.value = ''; return; }
      f.hidden = true;
      const done = f.parentElement.querySelector('[data-news-done]');
      if (done) done.hidden = false;
    }));
  }

  /* ------------------------------------------------------------------ public API */
  Object.assign(ZARIVA, {
    D, $, $$, esc, money, params, store, I, img, starsHTML, fmtDate, debounce, reduceMotion,
    product, PMAP, combos, isSoldOut, defaultSel, variantPrice, priceRange, variantTitle, inCollection, navCount,
    Cart, FREE_SHIP, cardHTML, reviewHTML, reelHTML, optionsHTML, afterpayHTML, lineHTML, freeBarHTML, occasionIndexHTML, initOccasions, logoHTML, sliderHead,
    pages: ZARIVA.pages || {},
    top() { document.currentScript.insertAdjacentHTML('beforebegin', topHTML()); },
    bottom() { document.currentScript.insertAdjacentHTML('beforebegin', bottomHTML()); },
    boot() {
      initHeader(); initAnnounce(); initMega(); initSearch(); initNews();
      updateCartCount(false);
      document.addEventListener('click', e => {
        const o = e.target.closest('[data-open]');
        if (o) { e.preventDefault(); open(o.dataset.open, o); return; }
        if (e.target.closest('[data-close]') || e.target.matches('[data-scrim]')) close();
      });
      const page = document.body.dataset.page;
      if (ZARIVA.pages[page]) ZARIVA.pages[page]();
      observeReels(document);
      initReveals(document);
      $$('.slider').forEach(initSlider);
    }
  });
})();
