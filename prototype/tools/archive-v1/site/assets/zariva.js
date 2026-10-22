/* House of Zariva: storefront engine for the prototype.
   Moments calendar, delivery dates, the gift (moment, person, card, arrival) carried page to page,
   the bag, shared header and footer, search, Loupe. Stand-ins for what Intellect + Shopify do:
   see docs/plan.html for the Shopify version of each part. */
(function () {
  'use strict';
  const D = window.ZARIVA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const qs = new URLSearchParams(location.search);

  /* ---------- Dates ---------- */
  const parse = (s) => new Date(s + 'T12:00:00');
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAYS_L = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MON_L = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmt = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  const fmtLong = (d) => `${DAYS_L[d.getDay()]} ${d.getDate()} ${MON_L[d.getMonth()]}`;
  const fmtShort = (d) => `${d.getDate()} ${MON[d.getMonth()]}`;
  const days = (a, b) => Math.round((b - a) / 864e5);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const addBiz = (d, n) => { let x = new Date(d); while (n > 0) { x = addDays(x, 1); if (x.getDay() !== 0 && x.getDay() !== 6) n -= 1; } return x; };
  // Prototype "today": set from the presentation's date switch, or ?today=YYYY-MM-DD.
  const today = () => parse(qs.get('today') || store.get('zariva:today', null) || D.today);

  /* ---------- Delivery ---------- */
  const SAME_DAY = [[2000, 2234], [3000, 3207]]; // Sydney and Melbourne metro (sample ranges)
  const isSameDay = (pc) => SAME_DAY.some(([a, b]) => +pc >= a && +pc <= b);
  const isMetro = (pc) => /^(2[0-2]|3[0-2]|4[0-1]|5[0-1]|6[0-1])/.test(String(pc));
  function dispatchDay() {
    let d = today();
    while (d.getDay() === 0 || d.getDay() === 6) d = addDays(d, 1);
    return d;
  }
  // Earliest arrival for standard delivery (2 business days metro, 4 regional).
  function earliest(pc) {
    const metro = pc ? isMetro(pc) : true;
    return addBiz(dispatchDay(), metro ? 2 : 4);
  }
  // Delivery days a shopper can choose (weekdays), from the earliest possible.
  function arrivalDays(n = 10, pc) {
    const out = [];
    let d = pc && isSameDay(pc) ? today() : earliest(pc);
    while (out.length < n) { if (d.getDay() !== 0) out.push(d); d = addDays(d, 1); }
    return out;
  }

  /* ---------- Moments ---------- */
  const momentById = (id) => D.moments.find((m) => m.id === id) || D.always.find((m) => m.id === id) || null;
  const isDated = (m) => !!(m && m.date);
  function momentState(m, t = today()) {
    const start = parse(m.date), end = parse(m.end || m.date), orderBy = parse(m.orderBy || m.date);
    return {
      toDate: days(t, start), toOrder: days(t, orderBy), active: m.kind === 'sale' ? t >= start && t <= end : false,
      orderable: t <= orderBy, past: t > end, start, end, orderBy,
    };
  }
  const upcoming = (t = today()) => D.moments.filter((m) => !momentState(m, t).past).sort((a, b) => parse(a.date) - parse(b.date));
  // The moment the site leads with: the next one close enough to plan for. Sale weeks lead only
  // from ten days before. Nothing within 50 days: the site leads with the evergreen story.
  function lead(t = today()) {
    for (const m of upcoming(t)) {
      const s = momentState(m, t);
      if (m.kind === 'sale') { if (s.active || s.toDate <= 10) return m; continue; }
      if (s.toDate <= 50) return m;
      return null;
    }
    return null;
  }
  const quietActive = () => { const q = momentById('quiet-week'); return q ? momentState(q).active : false; };

  /* ---------- Products ---------- */
  const product = (h) => D.products.find((p) => p.handle === h);
  const img = (key, size = 900) => `assets/img/${key}-${size}.jpg`;
  const money = (n) => '$' + (Math.round(n * 100) / 100).toLocaleString('en-AU', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const onSale = (p) => quietActive() && p.occasions.includes('quiet-week');
  const sale = (p, amount) => (onSale(p) ? Math.round(amount * 0.85) : amount);
  // Price for a set of chosen option values (by option name).
  function priceFor(p, sel = {}) {
    let price = p.price;
    for (const o of p.options) {
      const v = o.values.find((x) => x.v === sel[o.name]) || o.values[0];
      if (v.price) price = v.price;
      if (v.add) price += v.add;
    }
    return price;
  }
  const defaults = (p) => Object.fromEntries(p.options.map((o) => [o.name, (o.values.find((v) => !(p.soldOut || []).includes(v.v)) || o.values[0]).v]));
  const forProduct = (p) => D.products;

  /* ---------- The gift: moment, person, card and arrival, carried from page to page ---------- */
  const gift = {
    get() { return store.get('zariva:gift', { moment: null, for: null, card: { to: '', message: '', from: '' } }); },
    set(patch) { const g = { ...gift.get(), ...patch }; store.set('zariva:gift', g); renderStrip(); return g; },
    clear() { store.set('zariva:gift', { moment: null, for: null, card: { to: '', message: '', from: '' } }); renderStrip(); },
  };
  // What the shopper is sending for: their chosen moment, or the moment the site leads with.
  const giftMoment = () => momentById(gift.get().moment) || lead();
  // The occasion a hamper is sent for: the shopper's chosen one if the hamper belongs to it,
  // otherwise the hamper's own next dated occasion that can still be ordered for.
  function sendingFor(p) {
    const m = giftMoment();
    if (isDated(m) && m.kind !== 'sale' && p.occasions.includes(m.id) && momentState(m).orderable) return m;
    return upcoming().find((x) => x.kind !== 'sale' && p.occasions.includes(x.id) && momentState(x).orderable && momentState(x).toDate <= 50) || null;
  }
  function arriveLine(p) {
    const m = sendingFor(p);
    return m ? `Arrives before ${m.name}` : `Arrives ${fmt(earliest())}`;
  }
  const greeting = (m) => ({
    'karva-chauth': 'Happy Karva Chauth', diwali: 'Happy Diwali', christmas: 'Merry Christmas', valentines: 'Happy Valentine’s Day',
    'mothers-day': 'Happy Mother’s Day', 'fathers-day': 'Happy Father’s Day', birthdays: 'Happy birthday', 'new-baby': 'Welcome to the world, little one',
    'thank-you': 'Thank you',
  })[m?.id] || '';

  /* ---------- Bag (Shopify: cart lines with line item properties + cart attributes) ---------- */
  const cart = {
    get() { return store.get('zariva:cart', { lines: [], attrs: { date: '', hidePrices: false, note: '' } }); },
    save(c) { store.set('zariva:cart', c); renderBag(); updateCount(); },
    add(line) {
      const c = cart.get();
      const key = JSON.stringify([line.handle, line.opts, line.props, line.build]);
      const same = c.lines.find((l) => l.key === key);
      if (same) same.qty += line.qty || 1;
      else c.lines.push({ ...line, key, qty: line.qty || 1, id: Date.now() + Math.random() });
      if (line.date) c.attrs.date = line.date;
      cart.save(c);
      return c;
    },
    qty(id, n) { const c = cart.get(); const l = c.lines.find((x) => x.id === id); if (l) l.qty = Math.max(0, n); c.lines = c.lines.filter((x) => x.qty > 0); cart.save(c); },
    remove(id) { const c = cart.get(); c.lines = c.lines.filter((x) => x.id !== id); cart.save(c); },
    attrs(patch) { const c = cart.get(); c.attrs = { ...c.attrs, ...patch }; cart.save(c); },
    count() { return cart.get().lines.reduce((a, l) => a + l.qty, 0); },
    subtotal() { return cart.get().lines.reduce((a, l) => a + l.unit * l.qty, 0); },
  };

  /* ---------- Icons ---------- */
  const I = {
    search: '<svg class="ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    user: '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c1.2-3.8 4.1-5.6 7.5-5.6s6.3 1.8 7.5 5.6"/></svg>',
    bag: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 8.5h14l-1.1 12H6.1z"/><path d="M8.8 8.5V7a3.2 3.2 0 0 1 6.4 0v1.5"/></svg>',
    menu: '<svg class="ico" viewBox="0 0 24 24"><path d="M3.5 8h17M3.5 16h17"/></svg>',
    close: '<svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    arrow: '<svg class="ico" viewBox="0 0 24 24"><path d="M4 12h15M14 7l5 5-5 5"/></svg>',
    plus: '<svg class="ico" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
    truck: '<svg class="ico" viewBox="0 0 24 24"><path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>',
    pen: '<svg class="ico" viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/></svg>',
    leaf: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19l7-7"/></svg>',
    box: '<svg class="ico" viewBox="0 0 24 24"><path d="M3.5 8.5h17v12h-17zM2.5 5h19v3.5h-19zM12 5v15.5"/></svg>',
    chat: '<svg class="ico" viewBox="0 0 24 24"><path d="M4 18.5V6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8z"/></svg>',
    play: '<svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor"><path d="M3 1.5v9l7-4.5z"/></svg>',
    star: '<svg viewBox="0 0 12 12"><path d="M6 .8l1.6 3.4 3.7.4-2.8 2.5.8 3.7L6 9 2.7 10.8l.8-3.7L.7 4.6l3.7-.4z"/></svg>',
  };
  const stars = (n = 5) => `<span class="stars" aria-label="${n} out of 5">${I.star.repeat(Math.round(n))}</span>`;
  const LOGO_MARK = '<svg viewBox="0 0 18 22" aria-hidden="true"><path d="M1.5 21.5V9a7.5 7.5 0 0 1 15 0v12.5" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M9 9.7l2 2.5-2 2.5-2-2.5z" fill="#B38B4D"/></svg>';
  const logo = (cls = '') => `<a href="index.html" class="logo ${cls}" aria-label="House of Zariva, home">${LOGO_MARK}<span class="logo__house">HOUSE OF</span><span class="logo__name">ZARIVA</span></a>`;

  /* ---------- Product card ---------- */
  function card(p, i = 0) {
    const sel = defaults(p);
    const base = priceFor(p, sel), now = sale(p, base);
    const from = p.options.some((o) => o.values.some((v) => v.add || v.price)) ? 'From ' : '';
    const badge = onSale(p) ? '<span class="card__badge card__badge--sale">Quiet Week</span>' : p.badge ? `<span class="card__badge">${esc(p.badge)}</span>` : '';
    const imgs = (p.images[1] && p.images[1] !== p.images[0]) ? [p.images[0], p.images[1]] : [p.images[0]];
    return `<article class="card rv" style="--i:${i % 4}" data-handle="${p.handle}">
      <div class="card__media media">
        ${imgs.map((k) => `<img src="${img(k)}" alt="" loading="lazy" style="object-position:${D.focus[k] || '50% 50%'}">`).join('')}
        ${badge}
        ${p.loupe ? `<loupe-chip data-handle="${p.handle}" data-product="${esc(JSON.stringify(loupeData(p)))}"></loupe-chip>` : ''}
        <div class="card__quick"><button type="button" data-quick="${p.handle}">${p.options.length ? 'Choose and add' : 'Add to bag'}</button></div>
      </div>
      <div class="card__info">
        <h3 class="card__title"><a href="product.html?p=${p.handle}">${esc(p.title)}</a></h3>
        <div class="card__meta"><span class="card__price num">${from}${money(now)}${now !== base ? ` <s>${money(base)}</s>` : ''}</span></div>
        <p class="card__arrive"><span class="diamond"></span>${arriveLine(p)}</p>
      </div>
    </article>`;
  }
  const byoTile = () => `<a class="byo rv" href="build.html" data-build="custom" data-build-label="Build-a-box (Intellect) entry tile in the grid" data-build-pos="br"><span class="byo__arch" aria-hidden="true"></span><span><b>Build your own</b><p>Choose a box, fill it with what they love. From $55.</p></span></a>`;

  /* ---------- Loupe data (Intellect: loupe-product-data.liquid prints this shape) ---------- */
  const vid = (h, i) => { let n = 7; for (const c of h) n = (n * 31 + c.charCodeAt(0)) % 9e6; return n * 100 + i; };
  function variantsOf(p) {
    const combos = p.options.reduce((acc, o) => acc.flatMap((a) => o.values.map((v) => [...a, v.v])), [[]]);
    return combos.map((vals, i) => {
      const sel = Object.fromEntries(p.options.map((o, k) => [o.name, vals[k]]));
      const price = sale(p, priceFor(p, sel));
      return { id: vid(p.handle, i), options: vals, sel, available: !vals.some((v) => (p.soldOut || []).includes(v)), price: price * 100, priceLabel: money(price), image: img(p.images[0], 900) };
    });
  }
  function loupeData(p) {
    const l = p.loupe, vs = variantsOf(p);
    const price = sale(p, priceFor(p, defaults(p)));
    return {
      v: 1, id: vid(p.handle, 99), handle: p.handle, title: p.title, url: `product.html?p=${p.handle}`, available: true,
      price: price * 100, priceLabel: money(price), compareAtPrice: 0, compareAtLabel: '', image: img(p.images[0], 900),
      description: p.description, rating: { value: p.rating, max: 5, count: p.reviews },
      clip: { src: `assets/video/${l.clip.video}.mp4`, hd: '', poster: `assets/video/${l.clip.video}.jpg`, duration: 0, creator: l.clip.creator, label: l.clip.label },
      features: l.features, reviews: l.reviews,
      options: p.options.map((o) => ({ name: o.name, values: o.values.map((v) => ({ name: v.v, swatch: v.hex ? { color: v.hex, image: null } : null })) })),
      variants: vs.map(({ sel, ...v }) => v), selectedVariantId: (vs.find((v) => v.available) || vs[0]).id,
    };
  }
  function setupLoupe() {
    window.Shopify = window.Shopify || {};
    window.Shopify.actions = { openCart: () => openBag() };
    window.LoupeConfig = {
      position: 'top-right', previews: 'auto', highlight: 'underline', afterAdd: 'auto', requireChoice: 'none',
      notes: ['Every hamper carries a card written in ink', 'Free delivery over $150'],
      cart: {
        add({ variantId, quantity, product: lp }) {
          const p = product(lp.handle);
          const v = variantsOf(p).find((x) => x.id === Number(variantId)) || variantsOf(p)[0];
          addProduct(p, { sel: v.sel, qty: quantity || 1, silent: true });
          return Promise.resolve({ ok: true });
        },
      },
    };
    const s = document.createElement('script');
    s.src = 'assets/loupe/loupe-loader.js';
    document.head.append(s);
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'assets/loupe/loupe.css';
    document.head.append(css);
  }

  /* ---------- Add to bag ---------- */
  function addProduct(p, { sel = defaults(p), qty = 1, props, date, silent } = {}) {
    const g = gift.get();
    const m = sendingFor(p) || giftMoment();
    const card = props || { To: g.card.to || '', Message: g.card.message || greeting(m), From: g.card.from || '' };
    cart.add({ handle: p.handle, title: p.title, image: p.images[0], opts: sel, unit: sale(p, priceFor(p, sel)), qty, props: p.type === 'addon' ? {} : card, kind: p.type, date });
    if (!silent) openBag();
    toast(`${p.title} is in your bag`);
  }

  /* ---------- Shared chrome ---------- */
  function announceText() {
    const m = lead();
    if (!m) return 'Every hamper is packed by hand in our Sydney studio, with a card written in ink.';
    const s = momentState(m);
    if (m.kind === 'sale') return s.active ? `The Quiet Week: 15% off selected hampers until ${fmtLong(s.end)}.` : `The Quiet Week starts ${fmtLong(s.start)}. Fifteen percent off, five days.`;
    if (s.orderable) return `${m.name} is ${fmtLong(s.start)}. <a class="link" href="collection.html?c=${m.id}">Order by ${fmtLong(s.orderBy)}</a> for delivery Australia-wide.`;
    return `${m.name} is ${fmtLong(s.start)}. Same-day delivery in Sydney and Melbourne until the day before.`;
  }
  function megaOccasions() {
    const up = upcoming().slice(0, 4);
    const m = lead() || up[0];
    return `<div class="mega" id="mega-occ" role="region" aria-label="Occasions"><div class="wrap mega__grid">
      <div><p class="eyebrow" style="margin-bottom:14px"><span class="diamond"></span>Coming up</p><div class="mega__list">
        ${up.map((x) => { const s = momentState(x); return `<a href="collection.html?c=${x.id}"><span>${esc(x.name)}</span><small>${x.kind === 'sale' ? `${fmtShort(s.start)} to ${fmtShort(s.end)}` : fmtShort(s.start)}</small></a>`; }).join('')}
      </div></div>
      <div><p class="eyebrow" style="margin-bottom:14px">Any day</p><div class="mega__list">
        ${D.always.map((x) => `<a href="collection.html?c=${x.id}"><span>${esc(x.name)}</span><small>${esc(x.line.split(',')[0].replace(/\.$/, ''))}</small></a>`).join('')}
      </div></div>
      ${m ? `<a class="mega__feature" href="collection.html?c=${m.id}"><div class="arch"><img src="${img(m.image)}" alt="" style="object-position:${D.focus[m.image] || '50% 50%'}"></div><span class="small muted">${esc(m.line)}</span></a>` : ''}
    </div></div>`;
  }
  function megaWho() {
    return `<div class="mega" id="mega-who" role="region" aria-label="Who it's for"><div class="wrap mega__grid" style="grid-template-columns:1fr 1fr 1fr">
      <div><p class="eyebrow" style="margin-bottom:14px">Who it’s for</p><div class="mega__list">
        ${D.recipients.map((r) => `<a href="collection.html?for=${r.id}"><span>${r.name}</span><small>${D.products.filter((p) => p.for.includes(r.id)).length}</small></a>`).join('')}
      </div></div>
      <div><p class="eyebrow" style="margin-bottom:14px">By budget</p><div class="mega__list">
        <a href="collection.html?c=all&budget=under-100"><span>Under $100</span><small></small></a>
        <a href="collection.html?c=all&budget=100-200"><span>$100 to $200</span><small></small></a>
        <a href="collection.html?c=all&budget=200-plus"><span>$200 and over</span><small></small></a>
      </div></div>
      <a class="mega__feature" href="build.html"><div class="arch" style="max-height:260px"><img src="${img('basket-linen')}" alt=""></div><span class="small muted">Or build your own, from $55.</span></a>
    </div></div>`;
  }
  function header() {
    const m = lead();
    return `
    <div class="announce" data-note-key="announce" data-build="custom" data-build-label="Announcement bar (Intellect), text set by the next Moment" data-build-pos="tr"><div class="wrap"><span class="diamond"></span><span>${announceText()}</span></div></div>
    <header class="site-header" data-note-key="header" data-build="native" data-build-label="Intellect header: logo centred, mega menus with a promo card">
      <div class="wrap site-header__inner">
        <div style="display:flex;align-items:center">
          <button class="icon-btn menu-btn" type="button" data-open="menu" aria-label="Menu">${I.menu}</button>
          <ul class="nav">
            <li><button type="button" data-mega="mega-occ" aria-expanded="false">Occasions</button></li>
            <li><button type="button" data-mega="mega-who" aria-expanded="false">Who it’s for</button></li>
            <li><a href="build.html">Build your own</a></li>
            <li><a href="corporate.html">Corporate</a></li>
          </ul>
        </div>
        ${logo()}
        <div class="header-actions">
          <button class="icon-btn" type="button" data-open="search" aria-label="Search">${I.search}</button>
          <a class="icon-btn" href="account.html" aria-label="Account" style="display:none" data-desktop>${I.user}</a>
          <button class="icon-btn" type="button" data-open="bag" aria-label="Bag">${I.bag}<span class="bag-count num" data-count="0"></span></button>
        </div>
      </div>
      ${megaOccasions()}${megaWho()}
    </header>
    <div class="gift-strip" id="gift-strip" hidden data-note-key="gift" data-build="custom" data-build-label="Gift strip: the chosen moment and person (cart attributes), carried to every page"></div>
    <div class="drawer" id="menu" aria-hidden="true"><div class="drawer__scrim" data-close></div><div class="drawer__panel" role="dialog" aria-label="Menu">
      <div class="drawer__head">${logo()}<button class="icon-btn" type="button" data-close aria-label="Close">${I.close}</button></div>
      <div class="drawer__body mnav">
        <div class="mnav__group"><p class="eyebrow"><span class="diamond"></span>Coming up</p>${upcoming().slice(0, 3).map((x) => `<a href="collection.html?c=${x.id}"><span>${esc(x.name)}</span><small>${fmtShort(parse(x.date))}</small></a>`).join('')}</div>
        <div class="mnav__group"><p class="eyebrow">Any day</p>${D.always.map((x) => `<a href="collection.html?c=${x.id}"><span>${esc(x.name)}</span><small></small></a>`).join('')}</div>
        <div class="mnav__group"><p class="eyebrow">Who it’s for</p>${D.recipients.map((r) => `<a href="collection.html?for=${r.id}"><span>${r.name}</span><small></small></a>`).join('')}</div>
        <div class="mnav__group"><a href="build.html"><span>Build your own</span><small></small></a><a href="corporate.html"><span>Corporate gifting</span><small></small></a><a href="concierge.html"><span>Gifting concierge</span><small></small></a></div>
        <div class="mnav__group" style="border:0"><a href="account.html"><small>Account</small><small></small></a><a href="help.html"><small>Delivery and help</small><small></small></a><a href="story.html"><small>Our studio</small><small></small></a></div>
      </div></div></div>
    <div class="search" id="search" aria-hidden="true" role="dialog" aria-label="Search">
      <div class="search__bar"><div class="wrap" style="display:flex;align-items:center;gap:16px">${I.search}<input type="search" placeholder="Search hampers, occasions, makers" aria-label="Search" data-search-input><button class="icon-btn" type="button" data-close aria-label="Close search">${I.close}</button></div></div>
      <div class="wrap search__res" data-search-res></div>
    </div>
    <div class="drawer drawer--right" id="bag" aria-hidden="true"><div class="drawer__scrim" data-close></div><div class="drawer__panel" role="dialog" aria-label="Your bag" data-note-key="bag" data-build="native" data-build-label="Intellect cart drawer: reward ladder, gift lines, add-ons">
      <div class="drawer__head"><h2 class="h3" style="font-size:1.5rem">Your bag <span class="num muted" data-bag-n></span></h2><button class="icon-btn" type="button" data-close aria-label="Close">${I.close}</button></div>
      <div class="drawer__body" data-bag-body></div>
      <div class="drawer__foot" data-bag-foot></div>
    </div></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  }
  function footer() {
    return `<footer class="site-footer" data-note-key="footer" data-build="native" data-build-label="Intellect footer: sign-up, menus, payment icons">
      <div class="wrap footer__top">
        <div class="footer__signup">
          ${logo('logo--light')}
          <p class="h3" style="margin-top:28px">The calendar, by email.</p>
          <p style="color:rgba(255,255,255,.65)">A short note before each occasion, with its order-by date. Nothing else.</p>
          <form class="footer__form" onsubmit="event.preventDefault();this.innerHTML='<p style=&quot;padding:14px 0&quot;>Thank you. We’ll write before the next occasion.</p>'"><input type="email" required placeholder="Email address" aria-label="Email address"><button type="submit">Sign up</button></form>
        </div>
        <div class="footer__cols">
          <div><h4>Send</h4><ul>${upcoming().slice(0, 3).map((x) => `<li><a href="collection.html?c=${x.id}">${esc(x.name)}</a></li>`).join('')}${D.always.slice(0, 3).map((x) => `<li><a href="collection.html?c=${x.id}">${esc(x.name)}</a></li>`).join('')}<li><a href="build.html">Build your own</a></li></ul></div>
          <div><h4>Help</h4><ul><li><a href="help.html">Delivery and order-by dates</a></li><li><a href="help.html#faq">Questions</a></li><li><a href="concierge.html">Gifting concierge</a></li><li><a href="account.html">Your account</a></li></ul></div>
          <div><h4>Studio</h4><ul><li><a href="story.html">Our studio</a></li><li><a href="corporate.html">Corporate gifting</a></li><li><a href="journal.html">Journal</a></li><li><a href="concierge.html">Contact</a></li></ul></div>
        </div>
      </div>
      <div class="wrap footer__ack"><p data-build="todo" data-build-label="Acknowledgement of Country: confirm studio location and Country">We pack every hamper on Gadigal land. We acknowledge the Traditional Custodians of the lands across Australia where our makers grow, bake and pour, and pay our respects to Elders past and present.</p>
        <div class="pay" aria-label="Ways to pay"><span>Visa</span><span>Mastercard</span><span>Amex</span><span>PayPal</span><span>Apple Pay</span><span>Google Pay</span><span>Shop Pay</span><span>Afterpay</span></div></div>
      <div class="wrap footer__base"><span>© 2026 House of Zariva. Prices in AUD and include GST.</span><span><a href="help.html">Delivery</a> · <a href="help.html#faq">Privacy</a> · <a href="help.html#faq">Terms</a></span></div>
    </footer>`;
  }

  /* ---------- Gift strip ---------- */
  function renderStrip() {
    const el = $('#gift-strip');
    if (!el || !document.body.hasAttribute('data-strip')) return;
    const g = gift.get();
    const m = momentById(g.moment);
    const who = D.recipients.find((r) => r.id === g.for);
    if (!m && !who) { el.hidden = true; return; }
    const parts = [];
    if (m) parts.push(`<b>${esc(m.name)}</b>`);
    if (who) parts.push(`<b>${who.name.replace('For ', 'for ')}</b>`);
    let arrive = '';
    if (isDated(m) && m.kind !== 'sale') { const s = momentState(m); arrive = s.orderable ? `Arrives before ${fmtLong(s.start)}` : ''; }
    el.innerHTML = `<div class="wrap"><span class="diamond"></span><span>Sending ${parts.join(' <span class="gift-strip__dot">·</span> ')}</span>${arrive ? `<span class="gift-strip__dot">·</span><span>${arrive}</span>` : ''}<button type="button" class="gift-strip__change link small" data-gift-clear>Change</button></div>`;
    el.hidden = false;
  }

  /* ---------- Bag drawer ---------- */
  function rewardHTML(sub) {
    const free = D.delivery.freeOver;
    const left = Math.max(0, free - sub);
    const p = Math.min(100, (sub / free) * 100);
    return `<div class="bag-reward" data-build="native" data-build-label="Intellect reward ladder: free delivery at $150">
      <p>${left > 0 ? `<b>${money(left)}</b> away from free delivery.` : '<b>Free delivery</b> is on this order.'}</p>
      <div class="goldline"><div class="goldline__fill" style="--p:${p}%"></div></div></div>`;
  }
  function lineHTML(l, page = false) {
    const p = product(l.handle);
    const opts = Object.entries(l.opts || {}).map(([k, v]) => `${k}: ${v}`).join(' · ');
    const to = l.props && l.props.To ? `<p class="gift-line__to"><span class="diamond"></span>To ${esc(l.props.To)}</p>` : '';
    const msg = l.props && l.props.Message ? `<p class="gift-line__card">${esc(l.props.Message)}${l.props.From ? `<br>— ${esc(l.props.From)}` : ''}</p>` : '';
    const build = l.build ? `<p class="gift-line__opts">${l.build.items.map((i) => esc(i)).join(', ')}</p>` : '';
    return `<div class="gift-line" data-line="${l.id}">
      <a class="media" href="${p ? `product.html?p=${l.handle}` : 'build.html'}"><img src="${img(l.image)}" alt=""></a>
      <div class="gift-line__body">
        <div class="gift-line__top"><a href="${p ? `product.html?p=${l.handle}` : 'build.html'}">${esc(l.title)}</a><span class="num small">${money(l.unit * l.qty)}</span></div>
        ${opts ? `<p class="gift-line__opts">${esc(opts)}</p>` : ''}${build}${to}${msg}
        <div class="gift-line__foot"><div class="qty"><button type="button" data-qty="-1" aria-label="One fewer">${I.minus}</button><span class="num">${l.qty}</span><button type="button" data-qty="1" aria-label="One more">${I.plus}</button></div>
        <span>${l.kind !== 'addon' ? `<a class="text-btn link" href="${p ? `product.html?p=${l.handle}#card` : 'build.html'}">Edit card</a> &nbsp; ` : ''}<button type="button" class="text-btn link" data-remove>Remove</button></span></div>
      </div></div>`;
  }
  const addonsHTML = () => {
    const have = new Set(cart.get().lines.map((l) => l.handle));
    const list = D.products.filter((p) => p.type === 'addon' && !have.has(p.handle));
    if (!list.length) return '';
    return `<div class="bag-extras" data-build="native" data-build-label="Intellect cart upsells: add-ons collection, ranked to reach free delivery"><h4>Add a little more</h4><div class="addons">${list.map((p) => `<div class="addon"><div class="media"><img src="${img(p.images[0])}" alt=""></div><b>${esc(p.title)}</b><span class="num">${money(p.price)}</span><button type="button" data-addon="${p.handle}">Add</button></div>`).join('')}</div></div>`;
  };
  function addressNote(lines) {
    const people = new Set(lines.map((l) => (l.props && l.props.To || '').trim().toLowerCase()).filter(Boolean));
    if (people.size < 2) return '';
    return `<div class="address-note" data-build="custom" data-build-label="Shopify ships one order to one address: the bag says so"><span class="diamond" style="margin-top:6px"></span><p><b>Sending to ${people.size} people?</b> Each order goes to one address. Check out once per address, or <a class="link" href="concierge.html">ask the concierge</a> to send them all for you.</p></div>`;
  }
  function renderBag() {
    const body = $('[data-bag-body]'), foot = $('[data-bag-foot]');
    if (!body) return;
    const c = cart.get(), sub = cart.subtotal();
    $('[data-bag-n]').textContent = c.lines.length ? `(${cart.count()})` : '';
    if (!c.lines.length) {
      body.innerHTML = `<div class="bag-empty"><p class="h3">Your bag is empty.</p><p class="muted">Start with the occasion, or who it’s for.</p><a class="btn btn--plum" href="collection.html?c=${(lead() || D.always[0]).id}">${lead() ? `Send for ${esc(lead().name)}` : 'See every hamper'}</a></div>`;
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = rewardHTML(sub) + c.lines.map((l) => lineHTML(l)).join('') + addressNote(c.lines) + addonsHTML();
    const date = c.attrs.date ? `Arriving ${fmtLong(parse(c.attrs.date))}` : `Arrives from ${fmt(earliest())}`;
    foot.innerHTML = `<div class="bag-sum"><div class="bag-sum__row"><span class="muted">${date}</span><a class="text-btn link" href="cart.html">Change</a></div>
      <div class="bag-sum__total"><span>Subtotal</span><strong class="num">${money(sub)}</strong></div>
      <p class="small muted">GST included. Delivery and discount codes at checkout. Or 4 payments of ${money(sub / 4)} with Afterpay.</p></div>
      <div style="display:grid;gap:10px;margin-top:16px"><a class="btn btn--plum btn--block" href="checkout.html">Checkout</a><a class="btn btn--line btn--block" href="cart.html">View bag</a></div>`;
    window.PROTO && PROTO.refresh();
  }
  function bindBag(root) {
    root.addEventListener('click', (e) => {
      const line = e.target.closest('[data-line]');
      const q = e.target.closest('[data-qty]');
      if (q && line) { const l = cart.get().lines.find((x) => String(x.id) === line.dataset.line); cart.qty(l.id, l.qty + Number(q.dataset.qty)); onBagChange(); }
      if (e.target.closest('[data-remove]') && line) { cart.remove(cart.get().lines.find((x) => String(x.id) === line.dataset.line).id); onBagChange(); }
      const a = e.target.closest('[data-addon]');
      if (a) { addProduct(product(a.dataset.addon), { silent: true }); onBagChange(); }
    });
  }
  const onBagChange = () => document.dispatchEvent(new CustomEvent('zariva:bag'));
  function updateCount() { $$('.bag-count').forEach((el) => { const n = cart.count(); el.textContent = n || ''; el.dataset.count = n; }); }

  /* ---------- Drawers, mega menus, search ---------- */
  let lastFocus = null;
  function open(id) {
    const el = document.getElementById(id);
    if (!el) return;
    closeMega();
    lastFocus = document.activeElement;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    if (id === 'bag') renderBag();
    setTimeout(() => (el.querySelector('input, [data-close]') || el).focus({ preventScroll: true }), 50);
  }
  function close(el) {
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    if (!$('.drawer.is-open, .search.is-open')) document.body.classList.remove('is-locked');
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  const openBag = () => open('bag');
  function closeMega() { $$('.mega.is-open').forEach((m) => m.classList.remove('is-open')); $$('[data-mega]').forEach((b) => b.setAttribute('aria-expanded', 'false')); }
  function bindChrome() {
    document.addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]');
      if (o) { e.preventDefault(); open(o.dataset.open); return; }
      const c = e.target.closest('[data-close]');
      if (c) { close(c.closest('.drawer, .search')); return; }
      const mg = e.target.closest('[data-mega]');
      if (mg) {
        const panel = document.getElementById(mg.dataset.mega), was = panel.classList.contains('is-open');
        closeMega();
        if (!was) { panel.classList.add('is-open'); mg.setAttribute('aria-expanded', 'true'); }
        return;
      }
      if (!e.target.closest('.mega')) closeMega();
      if (e.target.closest('[data-gift-clear]')) { gift.clear(); location.href = 'index.html#celebrate'; }
      const quick = e.target.closest('[data-quick]');
      if (quick) {
        const p = product(quick.dataset.quick);
        if (p.options.length) location.href = `product.html?p=${p.handle}`;
        else addProduct(p);
      }
    });
    $$('.nav [data-mega]').forEach((b) => b.parentElement.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) { closeMega(); document.getElementById(b.dataset.mega).classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); } }));
    $('.site-header').addEventListener('mouseleave', () => closeMega());
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeMega();
      $$('.drawer.is-open, .search.is-open').forEach(close);
    });
    if (matchMedia('(min-width: 900px)').matches) $$('[data-desktop]').forEach((el) => (el.style.display = ''));
    // Header hides on scroll down, returns on scroll up.
    let y0 = scrollY;
    addEventListener('scroll', () => {
      const y = scrollY, hdr = $('.site-header');
      const hide = y > 240 && y > y0 && !$('.mega.is-open');
      hdr.classList.toggle('is-hidden', hide);
      document.body.classList.toggle('is-header-hidden', hide);
      y0 = y;
    }, { passive: true });
    bindBag($('#bag'));
    // Search
    const input = $('[data-search-input]'), res = $('[data-search-res]');
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      const hits = q ? D.products.filter((p) => (p.title + ' ' + p.blurb + ' ' + p.inside.map((x) => x.join(' ')).join(' ')).toLowerCase().includes(q)).slice(0, 4) : D.products.filter((p) => p.best).slice(0, 4);
      const occ = [...D.moments, ...D.always].filter((m) => !q || m.name.toLowerCase().includes(q)).slice(0, 5);
      res.innerHTML = `<div class="search__sugg"><p class="eyebrow" style="margin-bottom:10px">${q ? 'Occasions' : 'Coming up'}</p>${occ.map((m) => `<a href="collection.html?c=${m.id}">${esc(m.name)}</a>`).join('') || '<p class="muted small">No occasions match.</p>'}</div>
        <div><p class="eyebrow" style="margin-bottom:16px">${q ? `Hampers for “${esc(q)}”` : 'Most sent this week'}</p>${hits.length ? `<div class="grid">${hits.map(card).join('')}</div>` : '<p class="muted">Nothing matches yet. Try “diya”, “whisky” or “baby”.</p>'}${q ? `<p style="margin-top:24px"><a class="link-arrow" href="search.html?q=${encodeURIComponent(q)}">See all results ${I.arrow}</a></p>` : ''}</div>`;
      reveal(res);
      if (window.Loupe) window.Loupe.scan && window.Loupe.scan();
    };
    input.addEventListener('input', draw);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) location.href = `search.html?q=${encodeURIComponent(input.value.trim())}`; });
    draw();
  }

  /* ---------- Reveal on scroll ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  function reveal(root = document) { $$('.rv:not(.is-in), .arch-open:not(.is-in)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('is-in'))); }

  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('is-on'), 2200);
  }

  /* ---------- Presentation bridge: the date switch ---------- */
  addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === 'proto:date' && d.date && d.date !== store.get('zariva:today', D.today)) {
      store.set('zariva:today', d.date);
      location.reload();
    }
  });

  /* ---------- Boot ---------- */
  // In the presentation, an empty bag is filled with two sample gifts so the bag can be reviewed.
  function seedSample() {
    if (window.parent === window || cart.get().lines.length) return;
    if (document.body.dataset.page !== 'cart' && location.hash !== '#bag') return;
    const a = product('the-diya-hamper'), b = product('birthday-bloom'), c = product('dried-native-posy');
    cart.add({ handle: a.handle, title: a.title, image: a.images[0], opts: { Size: 'Grand' }, unit: sale(a, priceFor(a, { Size: 'Grand' })), qty: 1, props: { To: 'Maa', Message: 'Happy Diwali, Maa. Light the first diya for me.', From: 'Anu' }, kind: 'hamper' });
    cart.add({ handle: b.handle, title: b.title, image: b.images[0], opts: defaults(b), unit: sale(b, priceFor(b, defaults(b))), qty: 1, props: { To: 'Priya', Message: 'Happy birthday. Wish I was there to celebrate.', From: 'Anu' }, kind: 'hamper' });
    cart.add({ handle: c.handle, title: c.title, image: c.images[0], opts: {}, unit: c.price, qty: 1, props: {}, kind: 'addon' });
  }

  function boot(render) {
    seedSample();
    document.body.insertAdjacentHTML('afterbegin', header());
    const main = $('main');
    if (render) render(main);
    document.body.insertAdjacentHTML('beforeend', footer());
    bindChrome();
    renderStrip();
    updateCount();
    renderBag();
    reveal();
    setupLoupe();
    document.addEventListener('zariva:bag', () => { updateCount(); renderBag(); });
    // #bag opens the drawer (the presentation's Bag tab uses it).
    if (location.hash === '#bag') setTimeout(() => open('bag'), 300);
    window.PROTO && PROTO.refresh();
  }

  window.Z = {
    D, $, $$, esc, store, qs, I, stars, logo, LOGO_MARK,
    parse, iso, fmt, fmtLong, fmtShort, days, addDays, addBiz, today,
    isSameDay, isMetro, earliest, arrivalDays,
    momentById, isDated, momentState, upcoming, lead, quietActive,
    product, img, money, onSale, sale, priceFor, defaults, variantsOf, loupeData,
    gift, giftMoment, sendingFor, arriveLine, greeting, cart, addProduct, openBag, open, toast,
    card, byoTile, reveal, boot, renderBag, lineHTML, rewardHTML, addressNote, onBagChange, bindBag, forProduct,
  };
})();
