/* Zariva prototype — page modules (one per Shopify template). */
(function () {
  'use strict';
  const X = window.ZARIVA;
  const { D, $, $$, esc, money, params, I, img } = X;
  const pages = X.pages;

  /* =================================================================== shared bits */
  const occLink = h => `<a href="collection.html?c=${h}">${esc(D.collections[h].title)}</a>`;
  function sydneyNow() {
    const parts = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const get = t => (parts.find(p => p.type === t) || {}).value;
    return { day: get('weekday'), h: parseInt(get('hour'), 10), m: parseInt(get('minute'), 10) };
  }
  function cutoffText() {
    const n = sydneyNow();
    const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(n.day);
    const mins = 13 * 60 - (n.h * 60 + n.m);
    if (weekday && mins > 0) return `Order within <b>${Math.floor(mins / 60)}h ${mins % 60}m</b> for same-day dispatch.`;
    const next = { Fri: 'Monday', Sat: 'Monday', Sun: 'Monday' }[n.day] || 'tomorrow';
    return `Order now for dispatch <b>${next}</b> morning.`;
  }
  const inRange = (n, ranges) => ranges.some(([a, b]) => n >= a && n <= b);
  function postcodeZone(pc) {
    const n = parseInt(pc, 10);
    if (!/^\d{4}$/.test(pc)) return null;
    if (inRange(n, [[2000, 2249], [2555, 2574], [2740, 2786]])) return { zone: 'syd', text: 'Same-day delivery available in Sydney metro when you order by 1pm.' };
    if (inRange(n, [[3000, 3207], [3335, 3341], [3427, 3442], [3750, 3810], [3910, 3920], [3975, 3978]])) return { zone: 'mel', text: 'Same-day delivery available in Melbourne metro when you order by 1pm.' };
    if (inRange(n, [[4000, 4207], [5000, 5199], [6000, 6199], [7000, 7099], [2600, 2620], [2900, 2914], [800, 832]])) return { zone: 'cap', text: 'Express delivery in 1–2 business days.' };
    if (n >= 200 && n <= 9999) return { zone: 'reg', text: 'Standard delivery in 2–5 business days.' };
    return null;
  }
  X.postcodeZone = postcodeZone;

  const CARD_SAMPLES = {
    diwali: { to: 'Nani and Nana', msg: 'Happy Diwali! Wishing you a year full of light and sweetness. We’ll call on the night.', from: 'Priya and Dev' },
    'corporate-gifting': { to: 'the team at Harbourline', msg: 'Thank you for a wonderful year of working together. Here’s to the next one.', from: 'Everyone at Northwind' },
    'baby-shower': { to: 'Emma and Josh', msg: 'Congratulations! We can’t wait to meet the little one.', from: 'Aunty Mei' },
    'wedding-invitations': { to: 'Uncle Raj and Aunty Neeta', msg: 'We would love you to celebrate with us. Your invitation is inside.', from: 'Rohan and Ananya' },
    'birthday-for-her': { to: 'Mia', msg: 'Happy birthday! Can’t wait to celebrate with you this weekend.', from: 'Sam' },
    'birthday-for-him': { to: 'Dad', msg: 'Happy birthday. Enjoy this one slowly, and save me a glass.', from: 'Lucy and Tom' },
    christmas: { to: 'the Wilsons', msg: 'Merry Christmas! Wishing you a long, lazy summer break.', from: 'Grace and family' }
  };
  const cardSample = occ => CARD_SAMPLES[occ] || CARD_SAMPLES['birthday-for-her'];
  X.cardSample = cardSample;

  function bindCardWriter(root, state, onChange, sample) {
    sample = sample || cardSample();
    const to =$('[data-card-to]', root), msg = $('[data-card-msg]', root), from = $('[data-card-from]', root);
    const pTo = $('.gift-card__to', root), pMsg = $('.gift-card__msg', root), pFrom = $('.gift-card__from', root);
    const counter = $('[data-card-count]', root);
    const max = msg ? parseInt(msg.getAttribute('maxlength'), 10) : 250;
    const paint = () => {
      state.to = to ? to.value.trim() : ''; state.msg = msg ? msg.value.trim() : ''; state.from = from ? from.value.trim() : '';
      if (pTo) { pTo.textContent = `Dear ${state.to || sample.to},`; pTo.classList.toggle('is-placeholder', !state.to); }
      pMsg.innerHTML = state.msg ? esc(state.msg).replace(/\n/g, '<br>') + '<span class="caret" aria-hidden="true"></span>' : esc(sample.msg);
      pMsg.classList.toggle('is-placeholder', !state.msg);
      if (pFrom) { pFrom.textContent = `Love, ${state.from || sample.from}`; pFrom.classList.toggle('is-placeholder', !state.from); }
      if (counter && msg) counter.textContent = `${msg.value.length} / ${max}`;
      // shrink the handwriting a little for long messages so it fits the card
      const len = state.msg.length;
      pMsg.style.fontSize = len > 180 ? '15px' : len > 120 ? '17px' : '';
      if (onChange) onChange();
    };
    [to, msg, from].forEach(el => el && el.addEventListener('input', paint));
    paint();
  }
  const giftCardHTML = s => `<div class="gift-card" aria-hidden="true"><p class="gift-card__to is-placeholder">Dear ${esc(s.to)},</p><p class="gift-card__msg is-placeholder">${esc(s.msg)}</p><p class="gift-card__from is-placeholder">Love, ${esc(s.from)}</p></div>`;

  /* =================================================================== HOME */
  pages.home = function () {
    // 1. hero unwrap (first visit per session, or ?unwrap to replay for a demo)
    const html = document.documentElement;
    if (params().has('unwrap') && !X.reduceMotion()) html.classList.add('is-unwrapping');
    if (html.classList.contains('is-unwrapping')) {
      const heroImg = $('.hero__media > img');
      let started = false;
      const go = () => {
        if (started) return; started = true;
        requestAnimationFrame(() => html.classList.add('unwrap-go'));
        try { sessionStorage.setItem('zariva-unwrapped', '1'); } catch (e) {}
        setTimeout(() => html.classList.remove('is-unwrapping', 'unwrap-go'), 3400);
      };
      if (heroImg.complete) setTimeout(go, 350); else { heroImg.addEventListener('load', () => setTimeout(go, 200)); setTimeout(go, 1600); }
    }

    // 2. occasion index
    const occ = X.occasionIndexHTML();
    $('[data-occ-list]').innerHTML = occ.rows;
    $('[data-occ-stage]').innerHTML = occ.stage;
    X.initOccasions(document);

    // 3. bestsellers
    $('[data-best-head]').outerHTML = X.sliderHead('<span id="best-h">Bestsellers</span>', 'What’s leaving our studio most this week.', '<a class="link" href="collection.html?c=bestsellers">Shop all bestsellers</a>');
    $('[data-reels-head]').outerHTML = X.sliderHead('<span id="ugc-h">Unboxed by you</span>', 'Videos from people who sent and received our hampers. Tag <b>#zarivaunboxed</b> to share yours.', '');
    $('[data-home-stars]').innerHTML = X.starsHTML(D.reviewStats.average, 'stars--lg');
    $('[data-bestsellers]').innerHTML = X.inCollection('bestsellers').slice(0, 8).map(p => X.cardHTML(p, { sizes: '(max-width: 760px) 72vw, (max-width: 1200px) 33vw, 25vw' })).join('');

    // 4. Diwali countdown + minis
    const diwali = new Date('2026-11-08T00:00:00+11:00');
    const days = Math.ceil((diwali - new Date()) / 86400000);
    const cd = $('[data-countdown]');
    if (cd) { if (days > 0) cd.innerHTML = `<b>${days}</b><span>day${days === 1 ? '' : 's'} until Diwali</span>`; else cd.remove(); }
    const minis = ['the-diya-hamper', 'mithai-and-marigold-box', 'festival-of-lights-trunk'].map(X.product);
    $('[data-diwali-minis]').innerHTML = minis.map(p => {
      const r = X.priceRange(p);
      return `<a href="product.html?p=${p.handle}"><span class="m">${img(p.images[0], { sizes: '64px', alt: '' })}</span><span class="n">${esc(p.title)}<span class="s">${esc(p.blurb.split(',')[0])}</span></span><span class="p price">${r.min !== r.max ? 'From ' : ''}${money(r.min)}</span></a>`;
    }).join('');

    // 5. reels
    const reelWrap = $('[data-reels]');
    reelWrap.innerHTML = D.ugc.map((u, i) => X.reelHTML(u, i)).join('');
    reelWrap.closest('[data-reel-list]')._reels = D.ugc;

    // 6. card demo
    const demo = $('[data-card-demo]');
    if (demo) bindCardWriter(demo, {});

    // 7. review quotes
    const picks = ['the-diya-hamper', 'the-boardroom-box', 'birthday-bloom'].map(h => D.reviews.find(r => r.product === h));
    $('[data-quotes]').innerHTML = picks.map(r => {
      const p = X.product(r.product);
      return `<figure class="quote">${X.starsHTML(r.rating)}<blockquote>“${esc(r.body.split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.'))}”</blockquote>
        <figcaption class="quote__by"><span class="m">${img(p.images[0], { sizes: '48px', alt: '' })}</span><span><span class="n">${esc(r.name)}, ${esc(r.place)}</span><br><a class="s link" href="product.html?p=${p.handle}">${esc(p.title)}</a></span></figcaption></figure>`;
    }).join('');
    $('[data-review-total]').textContent = D.reviewStats.count.toLocaleString('en-AU');
  };

  /* =================================================================== COLLECTION */
  const SORTS = [['featured', 'Featured'], ['best', 'Best selling'], ['new', 'Newest'], ['price-asc', 'Price, low to high'], ['price-desc', 'Price, high to low'], ['az', 'Alphabetically, A–Z']];
  const PRICE_BUCKETS = [['0-100', 'Under $100'], ['100-200', '$100 to $200'], ['200-99999', '$200 and over']];
  pages.collection = function () {
    const q = params();
    let handle = q.get('c') || 'all';
    if (!D.collections[handle]) handle = 'all';
    const c = D.collections[handle];
    document.title = `${c.title} | Zariva`;
    const base = X.inCollection(handle);
    const state = {
      sort: q.get('sort') || 'featured',
      price: q.get('price') || '',
      occ: (q.get('occ') || '').split(',').filter(Boolean),
      rec: (q.get('rec') || '').split(',').filter(Boolean),
      type: q.get('type') || '',
      diet: (q.get('diet') || '').split(',').filter(Boolean),
      avail: q.get('avail') === '1',
      shown: 12
    };

    // header
    const isOcc = D.OCCASIONS.includes(handle);
    $('[data-coll-hero]').innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span>${isOcc ? '<span>Occasions</span><span aria-hidden="true">/</span>' : ''}<span aria-current="page">${esc(c.title)}</span></nav>
      <div class="coll-hero">
        <div class="coll-hero__text">
          <h1 class="t-h1">${esc(c.title)}</h1>
          <p class="t-lead">${esc(c.blurb)}</p>
          ${c.note ? `<p class="coll-hero__note"><span class="diamond" aria-hidden="true"></span>${esc(c.note)}</p>` : ''}
        </div>
        <div class="coll-hero__arch" aria-hidden="true">${X.img(c.image, { sizes: '(max-width: 1023px) 1px, 30vw', alt: '', eager: true })}</div>
      </div>`;

    // filters drawer
    const facetCount = (fn) => base.filter(fn).length;
    const recipients = [...new Set(base.flatMap(p => p.recipients || []))].sort();
    const diets = ['Vegetarian', 'Vegan', 'Alcohol-free', 'Alcohol-free option', 'Contains nuts'].filter(d => base.some(p => (p.dietary || []).includes(d)));
    const drawer = document.createElement('aside');
    drawer.className = 'drawer drawer--right'; drawer.id = 'filters'; drawer.setAttribute('aria-label', 'Filters'); drawer.setAttribute('aria-hidden', 'true'); drawer.tabIndex = -1;
    drawer.innerHTML = `
      <div class="drawer__head"><h2 class="drawer__title">Filter</h2><button class="icon-btn" type="button" data-close aria-label="Close filters">${I.close}</button></div>
      <form class="drawer__body" data-filter-form>
        <details class="facet" open><summary>Price ${I.chev}</summary><div class="facet__body">
          ${PRICE_BUCKETS.map(([v, l]) => { const [a, b] = v.split('-').map(Number); return `<label class="check"><input type="radio" name="price" value="${v}"><span>${l}</span><small>${facetCount(p => X.priceRange(p).min >= a && X.priceRange(p).min < b)}</small></label>`; }).join('')}
          <label class="check"><input type="radio" name="price" value=""><span>Any price</span></label>
        </div></details>
        ${!isOcc ? `<details class="facet" open><summary>Occasion ${I.chev}</summary><div class="facet__body">${D.OCCASIONS.map(h => `<label class="check"><input type="checkbox" name="occ" value="${h}"><span>${esc(D.collections[h].title)}</span><small>${facetCount(p => p.occasions.includes(h))}</small></label>`).join('')}</div></details>` : ''}
        <details class="facet" open><summary>Who it’s for ${I.chev}</summary><div class="facet__body">${recipients.map(r => `<label class="check"><input type="checkbox" name="rec" value="${esc(r)}"><span>${esc(r)}</span><small>${facetCount(p => (p.recipients || []).includes(r))}</small></label>`).join('')}</div></details>
        ${handle === 'all' ? `<details class="facet"><summary>Product type ${I.chev}</summary><div class="facet__body">${['Hamper', 'Add-on'].map(t => `<label class="check"><input type="radio" name="type" value="${t}"><span>${t === 'Hamper' ? 'Hampers' : 'Add-ons'}</span><small>${facetCount(p => p.type === t)}</small></label>`).join('')}<label class="check"><input type="radio" name="type" value=""><span>Everything</span></label></div></details>` : ''}
        <details class="facet"><summary>Dietary ${I.chev}</summary><div class="facet__body">${diets.map(d => `<label class="check"><input type="checkbox" name="diet" value="${d}"><span>${d}</span><small>${facetCount(p => (p.dietary || []).includes(d))}</small></label>`).join('')}</div></details>
        <details class="facet"><summary>Availability ${I.chev}</summary><div class="facet__body"><label class="check"><input type="checkbox" name="avail" value="1"><span>In stock only</span></label></div></details>
      </form>
      <div class="drawer__foot drawer__foot--split"><button class="btn btn--secondary" type="button" data-clear>Clear all</button><button class="btn" type="button" data-close data-apply>Show results</button></div>`;
    document.body.appendChild(drawer);
    const form = $('[data-filter-form]', drawer);

    function syncForm() {
      $$('input', form).forEach(inp => {
        if (inp.name === 'price') inp.checked = inp.value === state.price;
        if (inp.name === 'type') inp.checked = inp.value === state.type;
        if (inp.name === 'occ') inp.checked = state.occ.includes(inp.value);
        if (inp.name === 'rec') inp.checked = state.rec.includes(inp.value);
        if (inp.name === 'diet') inp.checked = state.diet.includes(inp.value);
        if (inp.name === 'avail') inp.checked = state.avail;
      });
    }
    form.addEventListener('change', () => {
      const fd = new FormData(form);
      state.price = fd.get('price') || ''; state.type = fd.get('type') || '';
      state.occ = fd.getAll('occ'); state.rec = fd.getAll('rec'); state.diet = fd.getAll('diet'); state.avail = fd.get('avail') === '1';
      state.shown = 12; render();
    });
    drawer.addEventListener('click', e => {
      if (e.target.closest('[data-clear]')) { Object.assign(state, { price: '', occ: [], rec: [], type: '', diet: [], avail: false, shown: 12 }); syncForm(); render(); }
    });

    // toolbar
    const quickChips = isOcc ? PRICE_BUCKETS.map(([v, l]) => `<button type="button" class="chip" data-chip-price="${v}" aria-pressed="false">${l}</button>`).join('')
      : D.OCCASIONS.map(h => `<button type="button" class="chip" data-chip-occ="${h}" aria-pressed="false">${esc(D.collections[h].short)}</button>`).join('');
    $('[data-toolbar]').innerHTML = `<div class="container toolbar__inner">
      <button class="filter-btn" type="button" data-open="filters" aria-controls="filters" aria-expanded="false">${I.filter}Filter<span class="n" data-filter-n hidden></span></button>
      <div class="toolbar__chips" role="group" aria-label="${isOcc ? 'Filter by price' : 'Filter by occasion'}">${quickChips}</div>
      <div class="toolbar__right"><span class="toolbar__count" data-count aria-live="polite"></span>
        <div class="sort"><label for="sort">Sort by</label><select id="sort" data-sort>${SORTS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div></div>
    </div>`;
    const sortSel = $('[data-sort]');
    sortSel.value = state.sort;
    sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });
    $('[data-toolbar]').addEventListener('click', e => {
      const cp = e.target.closest('[data-chip-price]');
      if (cp) { state.price = state.price === cp.dataset.chipPrice ? '' : cp.dataset.chipPrice; state.shown = 12; syncForm(); render(); }
      const co = e.target.closest('[data-chip-occ]');
      if (co) { const h = co.dataset.chipOcc; state.occ = state.occ.includes(h) ? state.occ.filter(x => x !== h) : state.occ.concat(h); state.shown = 12; syncForm(); render(); }
    });

    function filtered() {
      let list = base.filter(p => {
        const r = X.priceRange(p);
        if (state.price) { const [a, b] = state.price.split('-').map(Number); if (!(r.min >= a && r.min < b)) return false; }
        if (state.occ.length && !state.occ.some(o => p.occasions.includes(o))) return false;
        if (state.rec.length && !state.rec.some(o => (p.recipients || []).includes(o))) return false;
        if (state.diet.length && !state.diet.every(d => (p.dietary || []).includes(d))) return false;
        if (state.type && p.type !== state.type) return false;
        if (state.avail && X.combos(p).every(s => X.isSoldOut(p, s))) return false;
        return true;
      });
      const by = {
        featured: (a, b) => (a.type === 'Add-on') - (b.type === 'Add-on') || (a.best || 99) - (b.best || 99),
        best: (a, b) => (a.best || 99) - (b.best || 99) || b.reviews - a.reviews,
        new: (a, b) => b.created.localeCompare(a.created),
        'price-asc': (a, b) => X.priceRange(a).min - X.priceRange(b).min,
        'price-desc': (a, b) => X.priceRange(b).min - X.priceRange(a).min,
        az: (a, b) => a.title.localeCompare(b.title)
      };
      if (!(handle === 'bestsellers' && state.sort === 'featured')) list.sort(by[state.sort] || by.featured);
      return list;
    }

    function activeChips() {
      const chips = [];
      if (state.price) chips.push(['price', state.price, (PRICE_BUCKETS.find(b => b[0] === state.price) || [])[1]]);
      state.occ.forEach(o => chips.push(['occ', o, D.collections[o].title]));
      state.rec.forEach(o => chips.push(['rec', o, o]));
      state.diet.forEach(o => chips.push(['diet', o, o]));
      if (state.type) chips.push(['type', state.type, state.type === 'Hamper' ? 'Hampers' : 'Add-ons']);
      if (state.avail) chips.push(['avail', '1', 'In stock']);
      return chips;
    }

    function render() {
      const list = filtered();
      const chips = activeChips();
      $('[data-count]').textContent = `${list.length} ${list.length === 1 ? 'hamper' : 'hampers'}`;
      const n = $('[data-filter-n]');
      n.hidden = !chips.length; n.textContent = chips.length;
      $$('[data-chip-price]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.chipPrice === state.price)));
      $$('[data-chip-occ]').forEach(b => b.setAttribute('aria-pressed', String(state.occ.includes(b.dataset.chipOcc))));
      $('[data-active]').innerHTML = chips.length ? chips.map(([k, v, l]) => `<button type="button" class="chip" data-unset="${k}" data-v="${esc(v)}">${esc(l)} ${I.close.replace('class="icon"', 'class="icon chip__x"')}</button>`).join('') + '<button type="button" class="link" data-unset="all">Clear all</button>' : '';

      const grid = $('[data-grid]');
      if (!list.length) {
        grid.innerHTML = `<div class="no-results"><p class="t-h3">No hampers match those filters.</p><p class="t-muted">Remove a filter or two, or browse everything we make.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn" type="button" data-unset="all">Clear filters</button><a class="btn btn--secondary" href="collection.html?c=all">Shop all hampers</a></div></div>`;
        $('[data-more]').innerHTML = '';
      } else {
        const shown = list.slice(0, state.shown);
        const cards = shown.map(p => X.cardHTML(p, { sizes: '(max-width: 760px) 50vw, (max-width: 1200px) 33vw, 25vw' }));
        const promo = {
          'corporate-gifting': ['Ordering for 20 or more?', 'Logo ribbons, one delivery list and a single invoice. We’ll quote within a business day.', 'contact.html?topic=corporate', 'Get a corporate quote'],
          'wedding-invitations': ['Invitations for 100 guests?', 'We assemble, seal and post every box. Send us your guest list and invitation file.', 'contact.html?topic=wedding', 'Plan your invitation boxes'],
          diwali: ['Diwali gifts for clients?', 'Dry fruit platters and mithai boxes with your logo on the ribbon, from 20 boxes.', 'contact.html?topic=corporate', 'Talk to our team']
        }[handle];
        if (promo && cards.length > 3) cards.splice(3, 0, `<aside class="promo-tile"><h2 class="t-h3">${promo[0]}</h2><p>${promo[1]}</p><a class="btn btn--light" href="${promo[2]}">${promo[3]}</a></aside>`);
        grid.innerHTML = cards.join('');
        $('[data-more]').innerHTML = list.length > state.shown
          ? `<div class="load-more"><p>Showing ${shown.length} of ${list.length}</p><div class="load-more__bar"><i style="transform:scaleX(${shown.length / list.length})"></i></div><button class="btn btn--secondary" type="button" data-load-more>Load more hampers</button></div>`
          : (list.length > 12 ? `<div class="load-more"><p>Showing all ${list.length}</p></div>` : '');
      }
      // keep the URL shareable, as Shopify's filter URLs are
      const u = new URLSearchParams();
      u.set('c', handle);
      if (state.sort !== 'featured') u.set('sort', state.sort);
      if (state.price) u.set('price', state.price);
      if (state.occ.length) u.set('occ', state.occ.join(','));
      if (state.rec.length) u.set('rec', state.rec.join(','));
      if (state.diet.length) u.set('diet', state.diet.join(','));
      if (state.type) u.set('type', state.type);
      if (state.avail) u.set('avail', '1');
      history.replaceState(null, '', 'collection.html?' + u.toString());
    }

    document.addEventListener('click', e => {
      const un = e.target.closest('[data-unset]');
      if (un) {
        const k = un.dataset.unset, v = un.dataset.v;
        if (k === 'all') Object.assign(state, { price: '', occ: [], rec: [], type: '', diet: [], avail: false });
        else if (k === 'price' || k === 'type') state[k] = '';
        else if (k === 'avail') state.avail = false;
        else state[k] = state[k].filter(x => x !== v);
        state.shown = 12; syncForm(); render();
      }
      if (e.target.closest('[data-load-more]')) { state.shown += 12; render(); }
    });

    syncForm();
    render();
  };

  /* =================================================================== PRODUCT */
  pages.product = function () {
    const p = X.product(params().get('p'));
    const main = $('[data-pdp]');
    if (!p) {
      main.innerHTML = `<div class="container nf"><h1 class="t-h1">We couldn’t find that hamper.</h1><p class="t-lead">It may have sold out for the season. Try our bestsellers, or search for what you had in mind.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="collection.html?c=bestsellers">Shop bestsellers</a><button class="btn btn--secondary" type="button" data-open="search">Search</button></div></div>`;
      return;
    }
    document.title = `${p.title} | Zariva`;
    const sel = X.defaultSel(p);
    const card = { on: true, to: '', msg: '', from: '' };
    const occ = p.occasions[0];
    const isAddon = p.type === 'Add-on';
    const sample = cardSample(occ);
    const gallery = [p.images[0], p.images[1] !== p.images[0] ? p.images[1] : null, isAddon ? null : 'ribbon', isAddon ? null : 'card-hand'].filter(Boolean);
    const myReviews = D.reviews.filter(r => r.product === p.handle);
    const otherReviews = D.reviews.filter(r => r.product !== p.handle && p.occasions.some(o => X.product(r.product).occasions.includes(o)));
    const reviewsList = myReviews.concat(otherReviews).slice(0, 6);

    // recently viewed (theme feature, stored per browser)
    const rv = X.store.get('zariva-recent', []).filter(h => h !== p.handle);
    X.store.set('zariva-recent', [p.handle].concat(rv).slice(0, 8));

    main.innerHTML = `
    <div class="container">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span>${occ ? `<a href="collection.html?c=${occ}">${esc(D.collections[occ].title)}</a><span aria-hidden="true">/</span>` : '<a href="collection.html?c=all&type=Add-on">Add-ons</a><span aria-hidden="true">/</span>'}<span aria-current="page">${esc(p.title)}</span></nav>
      <div class="pdp">
        <div class="gallery-wrap">
          <div class="gallery" data-gallery aria-label="Product images">
            ${gallery.map((k, i) => `<button type="button" class="gallery__item" data-lightbox="${k}" aria-label="Enlarge image ${i + 1} of ${gallery.length}">${img(k, { sizes: '(max-width: 1023px) 100vw, 58vw', alt: i === 0 ? p.title : '', eager: i === 0 })}</button>`).join('')}
          </div>
          <div class="gallery__dots" data-dots>${gallery.map((_, i) => `<button type="button" aria-label="Image ${i + 1}" class="${i === 0 ? 'is-active' : ''}"></button>`).join('')}</div>
        </div>
        <div class="pinfo">
          ${p.occasions.length ? `<div class="pinfo__occ">${p.occasions.map(occLink).join('')}</div>` : ''}
          <h1 class="t-h1 pinfo__title">${esc(p.title)}</h1>
          <a class="pinfo__rating" href="#reviews">${X.starsHTML(p.rating)}<span>${p.rating.toFixed(1)} from ${p.reviews} reviews</span></a>
          <div class="pinfo__price" data-price></div>
          <p class="pinfo__blurb">${esc(p.description)}</p>
          <div class="stack-m" data-opts></div>
          ${isAddon ? '' : `
          <div class="writer" data-writer>
            <div class="writer__head"><label class="check"><input type="checkbox" data-card-on checked><span>Write my card</span></label><small>Complimentary, handwritten in ink</small></div>
            <div class="writer__body" data-writer-body>
              <div class="writer__row">
                <div class="field"><label for="card-to">To</label><input class="input" id="card-to" data-card-to maxlength="40" placeholder="${esc(sample.to)}"></div>
                <div class="field"><label for="card-from">From</label><input class="input" id="card-from" data-card-from maxlength="40" placeholder="${esc(sample.from)}"></div>
              </div>
              <div class="field"><label for="card-msg">Your message</label><textarea class="textarea" id="card-msg" data-card-msg maxlength="250" placeholder="${esc(sample.msg)}"></textarea><span class="counter" data-card-count>0 / 250</span></div>
              <div class="writer__preview">${giftCardHTML(sample)}</div>
            </div>
          </div>`}
          <div class="delivery-box">
            <div class="delivery-box__row">${I.clock}<span data-cutoff>${cutoffText()}</span></div>
            <div class="delivery-box__row">${I.truck}<span>Same-day in Sydney and Melbourne metro. Express 1–2 days to other capitals. Complimentary over ${money(X.FREE_SHIP)}.</span></div>
            <form class="postcode" data-postcode novalidate><label class="visually-hidden" for="pc">Postcode</label><input class="input" id="pc" inputmode="numeric" maxlength="4" placeholder="Postcode" autocomplete="postal-code"><button class="btn btn--secondary btn--small" type="submit">Check delivery</button></form>
            <p class="postcode-result" data-postcode-result aria-live="polite"></p>
          </div>
          <div class="buy-stack">
            <div class="buy-row">
              <div class="qty"><button type="button" data-q-dec aria-label="Decrease quantity">${I.minus}</button><input type="number" min="1" value="1" aria-label="Quantity" data-q><button type="button" data-q-inc aria-label="Increase quantity">${I.plus}</button></div>
              <button class="btn btn--block btn--split" type="button" data-atc></button>
            </div>
            <button class="btn btn--shoppay btn--block" type="button" data-buynow>Buy with <b>Shop Pay</b></button>
            <a class="more-pay" href="#" data-buynow-alt>More payment options</a>
            <div data-afterpay></div>
          </div>
          <ul class="trust">
            <li>${I.pen}Card written by hand</li>
            <li>${I.box}Packed in our studio</li>
            <li>${I.recycle}Recyclable packaging</li>
          </ul>
          <div class="acc">
            <details><summary>Delivery and dispatch <span class="pm" aria-hidden="true"></span></summary><div class="acc__body"><ul>
              <li>Order by 1pm AEST on weekdays for same-day dispatch.</li>
              <li>Same-day delivery in Sydney and Melbourne metro ($25, or free over ${money(X.FREE_SHIP)} on standard).</li>
              <li>Express 1–2 business days to Brisbane, Adelaide, Perth, Hobart, Canberra and Darwin.</li>
              <li>Choose a future delivery date in your bag. Christmas orders dispatch from 1 December.</li>
            </ul></div></details>
            <details><summary>Packaging <span class="pm" aria-hidden="true"></span></summary><div class="acc__body"><p>Every hamper is packed in a rigid FSC-certified box with recycled paper shred and tied with grosgrain ribbon. The outer shipping carton is recyclable and padded with paper, not plastic.</p></div></details>
            <details><summary>Dietary and allergens <span class="pm" aria-hidden="true"></span></summary><div class="acc__body"><p>${(p.dietary || []).map(esc).join(', ')}. Our studio handles nuts, gluten, dairy and sesame. Ask us before ordering if you need a swap for an allergy.</p></div></details>
            ${p.alcohol ? `<details><summary>Buying alcohol <span class="pm" aria-hidden="true"></span></summary><div class="acc__body"><p>${esc(p.alcoholNote)} Liquor licence LIQP700000000 (placeholder).</p></div></details>` : ''}
          </div>
        </div>
      </div>
    </div>

    ${isAddon ? '' : `<section class="section" aria-labelledby="inside-h">
      <div class="container inside">
        <div class="inside__aside">
          <h2 class="t-h2" id="inside-h">What’s inside</h2>
          <p class="t-muted">Contents for the selected size. We may swap an item for one of equal or greater value when a maker runs out, and we’ll tell you before we do.</p>
          <div class="diet">${(p.dietary || []).map(d => `<span>${esc(d)}</span>`).join('')}</div>
          <div class="media image-reveal">${img(p.images[1] || p.images[0], { sizes: '(max-width: 1023px) 100vw, 33vw', alt: '' })}</div>
        </div>
        <ul class="inside__list">${(p.inside || []).map(([n, w]) => `<li><span class="n">${esc(n)}</span><span class="w">${esc(w)}</span></li>`).join('')}</ul>
      </div>
    </section>`}

    <section class="section section--mist" aria-labelledby="ugc-h" data-reel-list>
      <div class="container slider">
        ${X.sliderHead('<span id="ugc-h">Unboxed by you</span>', 'Videos our customers sent us. Tag <b>#zarivaunboxed</b> and we might share yours.', '')}
        <div class="slider__track reels__track" data-pdp-reels></div>
      </div>
    </section>

    <section class="section" id="reviews" aria-labelledby="rev-h">
      <div class="container reviews-wrap">
        <div class="reviews-side">
          <h2 class="t-h2" id="rev-h">Reviews</h2>
          <div class="rating-summary"><b>${p.rating.toFixed(1)}</b><div>${X.starsHTML(p.rating, 'stars--lg')}<p>${p.reviews} reviews of this hamper</p></div></div>
          <div class="dist">${[5, 4, 3, 2, 1].map(s => { const n = Math.round(p.reviews * (D.reviewStats.dist[s] / D.reviewStats.count)); return `<button type="button" aria-pressed="false" disabled><span>${s} star${s > 1 ? 's' : ''}</span><span class="bar"><i style="width:${(n / p.reviews * 100).toFixed(1)}%"></i></span><span>${n}</span></button>`; }).join('')}</div>
          <a class="btn btn--secondary" href="reviews.html#write">Write a review</a>
        </div>
        <div>
          ${myReviews.length ? '' : '<p class="t-muted" style="margin-bottom:24px">Reviews from people who sent similar hampers:</p>'}
          ${reviewsList.map(r => X.reviewHTML(r, { product: r.product !== p.handle })).join('')}
          <a class="link" href="reviews.html" style="display:inline-block;margin-top:24px;font-weight:500">Read all ${D.reviewStats.count.toLocaleString('en-AU')} reviews</a>
        </div>
      </div>
    </section>

    ${isAddon ? '' : `<section class="section section--tight section--mist" aria-labelledby="addons-h">
      <div class="container">
        <div class="section-head"><div class="section-head__text"><h2 class="t-h2" id="addons-h">Finish the gift</h2><p>Small things we can tuck into the same box.</p></div></div>
        <div class="grid">${D.products.filter(x => x.type === 'Add-on').slice(0, 4).map(x => X.cardHTML(x, { sizes: '(max-width: 760px) 50vw, 25vw' })).join('')}</div>
      </div>
    </section>`}

    <section class="section" aria-labelledby="related-h">
      <div class="container slider">
        ${X.sliderHead('<span id="related-h">You may also like</span>', '', occ ? `<a class="link" href="collection.html?c=${occ}">All ${esc(D.collections[occ].title.toLowerCase())} hampers</a>` : '')}
        <div class="slider__track">${D.products.filter(x => x.handle !== p.handle && x.type === 'Hamper' && (occ ? x.occasions.includes(occ) : true)).concat(X.inCollection('bestsellers')).filter((x, i, a) => a.indexOf(x) === i && x.handle !== p.handle).slice(0, 8).map(x => X.cardHTML(x, { sizes: '(max-width: 760px) 72vw, 25vw' })).join('')}</div>
      </div>
    </section>

    <div class="sticky-buy" data-sticky aria-hidden="true">
      <div class="sticky-buy__inner">
        <div class="sticky-buy__media">${img(p.images[0], { sizes: '48px', alt: '' })}</div>
        <div class="sticky-buy__text"><p class="sticky-buy__t">${esc(p.title)}</p><p class="sticky-buy__v" data-sticky-v></p></div>
        <button class="btn btn--split" type="button" data-atc tabindex="-1"></button>
      </div>
    </div>`;

    // reels on PDP: this product first, then same occasion, then the rest
    const reels = D.ugc.slice().sort((a, b) => {
      const s = u => (u.product === p.handle ? 2 : 0) + (X.product(u.product).occasions.some(o => p.occasions.includes(o)) ? 1 : 0);
      return s(b) - s(a);
    });
    $('[data-pdp-reels]').innerHTML = reels.map((u, i) => X.reelHTML(u, i)).join('');
    $('[data-reel-list]')._reels = reels;

    // ---- state rendering
    const renderState = () => {
      const vp = X.variantPrice(p, sel);
      const sold = X.isSoldOut(p, sel);
      const units = (p.options || []).map(o => (o.values.find(v => v.v === sel[o.name]) || {}).units).find(Boolean);
      $('[data-price]').innerHTML = `<span class="price">${money(vp.price)}</span>${vp.compare ? `<s class="price price--compare">${money(vp.compare)}</s>` : ''}<span class="gst">${units ? `${money(vp.price / units)} a box, ` : ''}GST included</span>`;
      $('[data-afterpay]').innerHTML = X.afterpayHTML(vp.price);
      $('[data-opts]').innerHTML = X.optionsHTML(p, sel, 'pdp');
      $$('[data-atc]').forEach(b => {
        b.disabled = sold;
        b.innerHTML = sold ? '<span>Sold out</span><span>Back in late October</span>' : `<span>Add to bag</span><span class="price">${money(vp.price * qty())}</span>`;
      });
      $('[data-buynow]').disabled = sold;
      const v = X.variantTitle(p, sel);
      $('[data-sticky-v]').textContent = v ? `${v}, ${money(vp.price)}` : money(vp.price);
    };
    const qInput = $('[data-q]');
    const qty = () => Math.max(1, parseInt(qInput.value, 10) || 1);
    $('[data-q-inc]').addEventListener('click', () => { qInput.value = qty() + 1; renderState(); });
    $('[data-q-dec]').addEventListener('click', () => { qInput.value = Math.max(1, qty() - 1); renderState(); });
    qInput.addEventListener('change', renderState);
    $('[data-opts]').addEventListener('click', e => {
      const b = e.target.closest('[data-opt]');
      if (!b) return;
      sel[b.dataset.opt] = b.dataset.val;
      renderState();
      const again = $(`[data-opts] [data-opt="${CSS.escape(b.dataset.opt)}"][data-val="${CSS.escape(b.dataset.val)}"]`);
      if (again) again.focus();
    });

    // card writer
    const writer = $('[data-writer]');
    if (writer) {
      bindCardWriter(writer, card, null, sample);
      const on = $('[data-card-on]', writer);
      on.addEventListener('change', () => { card.on = on.checked; $('[data-writer-body]').hidden = !on.checked; });
    }
    const cardPayload = () => (writer && card.on && (card.msg || card.to || card.from) ? { to: card.to, msg: card.msg, from: card.from } : null);

    $$('[data-atc]').forEach(b => b.addEventListener('click', () => X.addToBag(p.handle, Object.assign({}, sel), qty(), cardPayload(), b)));
    const buyNow = e => {
      e.preventDefault();
      if (X.isSoldOut(p, sel)) return;
      try { sessionStorage.setItem('zariva-buynow', JSON.stringify({ handle: p.handle, sel, qty: qty(), card: cardPayload() })); } catch (err) {}
      location.href = 'checkout.html?buynow=1';
    };
    $('[data-buynow]').addEventListener('click', buyNow);
    $('[data-buynow-alt]').addEventListener('click', buyNow);

    // postcode check
    $('[data-postcode]').addEventListener('submit', e => {
      e.preventDefault();
      const v = $('#pc').value.trim();
      const out = $('[data-postcode-result]');
      const z = postcodeZone(v);
      out.className = 'postcode-result' + (z ? ' ok' : '');
      out.textContent = z ? z.text : 'Enter a four-digit Australian postcode, like 2000.';
    });
    setInterval(() => { const c = $('[data-cutoff]'); if (c) c.innerHTML = cutoffText(); }, 30000);

    // mobile gallery dots
    const gal = $('[data-gallery]'), dots = $$('[data-dots] button');
    gal.addEventListener('scroll', X.debounce(() => {
      const i = Math.round(gal.scrollLeft / gal.clientWidth);
      dots.forEach((d, j) => d.classList.toggle('is-active', i === j));
    }, 50), { passive: true });
    dots.forEach((d, i) => d.addEventListener('click', () => gal.scrollTo({ left: i * gal.clientWidth, behavior: 'smooth' })));

    // sticky add to bag once the main button leaves the viewport
    const mainAtc = $('.buy-stack [data-atc]'), sticky = $('[data-sticky]');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        const show = !en.isIntersecting && en.boundingClientRect.top < 0;
        sticky.classList.toggle('is-on', show);
        sticky.setAttribute('aria-hidden', String(!show));
        $('[data-atc]', sticky).tabIndex = show ? 0 : -1;
      }).observe(mainAtc);
    }
    renderState();
  };

  /* =================================================================== CART PAGE */
  pages.cart = function () {
    const root = $('[data-cart-page]');
    const C = X.Cart;
    const minDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
    function render() {
      const lines = C.lines(), sub = C.subtotal();
      if (!lines.length) {
        root.innerHTML = `<div class="empty-state" style="padding-block:40px 120px"><h1 class="t-h1">Your bag is empty.</h1><p class="t-lead">Start with an occasion, or see what’s leaving the studio most this week.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="collection.html?c=bestsellers">Shop bestsellers</a><a class="btn btn--secondary" href="collection.html?c=all">Shop all hampers</a></div></div>`;
        return;
      }
      const a = C.state.attrs || {};
      root.innerHTML = `
        <h1 class="t-h1" style="margin-bottom:8px">Your bag</h1>
        <p class="t-muted" style="margin-bottom:32px">${C.count()} item${C.count() === 1 ? '' : 's'}. Each hamper is packed by hand on the day it leaves us.</p>
        <div class="cart-page">
          <div>
            ${X.freeBarHTML(sub)}
            <div>${lines.map(l => X.lineHTML(l, { big: true })).join('')}</div>
            <a class="link" href="collection.html?c=all" style="display:inline-block;margin-top:24px">Continue shopping</a>
          </div>
          <aside class="summary" aria-label="Order summary">
            <h2 class="t-h4">Order summary</h2>
            <div class="field"><label for="ddate">Delivery date <span class="t-muted" style="font-weight:400">optional</span></label><input class="input" type="date" id="ddate" min="${minDate()}" value="${esc(a.deliveryDate || '')}"><span class="field-hint">We’ll hold your order and dispatch it to arrive on this day. Leave empty to send as soon as possible.</span></div>
            <div class="field"><label for="cnote">Note for our studio <span class="t-muted" style="font-weight:400">optional</span></label><textarea class="textarea" id="cnote" style="min-height:90px" placeholder="Leave at the front desk, it’s a surprise, please call on arrival…">${esc(C.state.note || '')}</textarea></div>
            <label class="check"><input type="checkbox" id="hideprice" ${a.hidePrices ? 'checked' : ''}><span>This is a gift: leave prices off the packing slip</span></label>
            <hr>
            <div class="cart-totals"><div class="cart-totals__row"><span>Subtotal</span><span class="price">${money(sub, true)}</span></div>
              <div class="cart-totals__row"><span>Delivery</span><span>${sub >= X.FREE_SHIP ? 'Complimentary' : 'Calculated at checkout'}</span></div>
              <div class="cart-totals__row cart-totals__row--total"><span>Estimated total</span><span class="price">${money(sub, true)}</span></div>
              <small>GST included.</small></div>
            <a class="btn btn--block" href="checkout.html">${I.lock} Checkout</a>
            <div class="express" style="grid-template-columns:1fr 1fr"><button type="button" class="btn btn--shoppay" data-express style="min-height:46px;border-radius:0">Shop Pay</button><button type="button" class="btn" data-express style="--btn-bg:#FFC439;--btn-bd:#FFC439;--btn-fg:#003087;min-height:46px;font-style:italic;font-weight:700">PayPal</button></div>
            ${X.afterpayHTML(sub)}
          </aside>
        </div>
        <section class="section section--tight" aria-labelledby="cart-addons-h">
          <div class="section-head"><div class="section-head__text"><h2 class="t-h2" id="cart-addons-h">Finish the gift</h2><p>Add something small. It goes in the same box.</p></div></div>
          <div class="grid">${D.products.filter(x => x.type === 'Add-on').slice(0, 4).map(x => X.cardHTML(x, { sizes: '(max-width: 760px) 50vw, 25vw' })).join('')}</div>
        </section>`;
      const save = () => {
        C.state.note = $('#cnote').value;
        C.state.attrs = { deliveryDate: $('#ddate').value, hidePrices: $('#hideprice').checked };
        X.store.set(C.key, C.state);
      };
      ['#cnote', '#ddate', '#hideprice'].forEach(s => $(s).addEventListener('change', save));
      $('#cnote').addEventListener('input', X.debounce(save, 300));
      $$('[data-express]').forEach(b => b.addEventListener('click', () => X.toast('Express wallets connect once the store is live on Shopify.')));
    }
    document.addEventListener('cart:change', render);
    render();
  };

  /* =================================================================== CHECKOUT (Shopify-hosted in production) */
  pages.checkout = function () {
    let lines;
    const buyNow = params().has('buynow') && (() => { try { return JSON.parse(sessionStorage.getItem('zariva-buynow')); } catch (e) { return null; } })();
    if (buyNow && X.product(buyNow.handle)) {
      const p = X.product(buyNow.handle), vp = X.variantPrice(p, buyNow.sel);
      lines = [{ id: 'buynow', handle: p.handle, p, sel: buyNow.sel, qty: buyNow.qty, card: buyNow.card, price: vp.price, total: vp.price * buyNow.qty, variant: X.variantTitle(p, buyNow.sel) }];
    } else lines = X.Cart.lines();
    const root = $('[data-checkout]');
    if (!lines.length) {
      root.innerHTML = `<div class="co__main" style="grid-column:1/-1;justify-content:center"><div class="co__main-inner" style="padding-top:80px"><a class="logo" href="index.html" aria-label="House of Zariva">${X.logoHTML()}</a><h1 class="t-h2" style="margin-top:40px">Your bag is empty.</h1><p class="t-muted" style="margin:12px 0 24px">Add a hamper to check out.</p><a class="btn" href="collection.html?c=bestsellers">Shop bestsellers</a></div></div>`;
      return;
    }
    const sub = lines.reduce((n, l) => n + l.total, 0);
    const st = { ship: null, discount: 0, code: '' };
    const SHIP = [
      { id: 'std', name: 'Standard', note: '2–5 business days, tracked', price: sub >= X.FREE_SHIP ? 0 : 12 },
      { id: 'exp', name: 'Express', note: '1–2 business days', price: 18 },
      { id: 'same', name: 'Same-day courier', note: 'Sydney and Melbourne metro, order by 1pm', price: 25, metro: true }
    ];
    const states = ['Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'];
    const field = (id, label, opts) => {
      opts = opts || {};
      return `<div class="field ${opts.cls || ''}"><label class="visually-hidden" for="${id}">${label}</label><input class="input" id="${id}" name="${id}" placeholder="${label}${opts.optional ? ' (optional)' : ''}" ${opts.required === false || opts.optional ? '' : 'required'} autocomplete="${opts.ac || 'on'}" ${opts.type ? `type="${opts.type}"` : ''} ${opts.attrs || ''}><span class="field-error" hidden></span></div>`;
    };
    root.innerHTML = `
      <div class="co__main">
        <div class="co__main-inner">
          <div class="co__header"><a class="logo" href="index.html" aria-label="House of Zariva, back to the store">${X.logoHTML()}</a><a class="icon-btn" href="cart.html" aria-label="Back to your bag">${I.bag}</a></div>
          <p class="proto-note">Prototype checkout. In production this page is Shopify Checkout with Zariva branding (logo, colours, fonts). Nothing you enter is sent anywhere.</p>
          <form data-co-form novalidate>
            <div class="co__block"><p class="t-meta" style="text-align:center;margin-bottom:12px">Express checkout</p>
              <div class="express"><button type="button" class="sp" data-express>Shop Pay</button><button type="button" class="pp" data-express>PayPal</button><button type="button" class="gp" data-express>G Pay</button></div>
              <div class="or">or</div></div>
            <div class="co__block"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2>Contact</h2><a class="link t-small" href="account.html">Sign in</a></div>
              <div class="co__grid">${field('email', 'Email', { cls: 'full', type: 'email', ac: 'email' })}
              <label class="check full t-small"><input type="checkbox" checked><span>Email me with news and offers</span></label></div></div>
            <div class="co__block"><h2>Delivery</h2>
              <div class="co__grid">
                <div class="field full"><label class="visually-hidden" for="country">Country/Region</label><select class="select" id="country"><option>Australia</option></select></div>
                ${field('first', 'First name', { ac: 'given-name' })}${field('last', 'Last name', { ac: 'family-name' })}
                ${field('company', 'Company', { cls: 'full', optional: true, ac: 'organization' })}
                ${field('address', 'Address', { cls: 'full', ac: 'address-line1' })}
                ${field('apt', 'Apartment, suite, etc.', { cls: 'full', optional: true, ac: 'address-line2' })}
                <div class="co__grid co__grid--3 full">${field('suburb', 'Suburb', { ac: 'address-level2' })}<div class="field"><label class="visually-hidden" for="state">State/territory</label><select class="select" id="state" name="state" required><option value="">State/territory</option>${states.map(s => `<option>${s}</option>`).join('')}</select><span class="field-error" hidden></span></div>${field('postcode', 'Postcode', { ac: 'postal-code', attrs: 'inputmode="numeric" maxlength="4"' })}</div>
                ${field('phone', 'Phone, for the courier', { cls: 'full', type: 'tel', ac: 'tel' })}
                <label class="check full t-small"><input type="checkbox"><span>Save this information for next time</span></label>
              </div></div>
            <div class="co__block"><h2>Shipping method</h2><div data-ship></div></div>
            <div class="co__block"><h2>Payment</h2><p class="co__pay-note">All transactions are secure and encrypted.</p>
              <div class="pay-opts" data-pay>
                <div class="pay-opt is-selected"><label><input type="radio" name="pay" value="card" checked class="visually-hidden"><span class="grow">Credit card</span><span class="pay-icons" style="gap:4px"><span style="background:#F2F2F2;color:#1A1F71">VISA</span><span style="background:#F2F2F2;color:#EB001B">MC</span><span style="background:#F2F2F2;color:#2E77BC">AMEX</span></span></label>
                  <div class="pay-opt__body">${field('cc', 'Card number', { ac: 'cc-number', attrs: 'inputmode="numeric"' })}<div class="co__grid">${field('exp', 'Expiration date (MM / YY)', { ac: 'cc-exp' })}${field('cvc', 'Security code', { ac: 'cc-csc', attrs: 'inputmode="numeric" maxlength="4"' })}</div>${field('ccname', 'Name on card', { ac: 'cc-name' })}<label class="check t-small"><input type="checkbox" checked><span>Use delivery address as billing address</span></label></div></div>
                <div class="pay-opt"><label><input type="radio" name="pay" value="pp" class="visually-hidden"><span class="grow">PayPal</span></label><div class="pay-opt__body"><p class="t-small">After clicking “Pay now”, you’ll be redirected to PayPal to complete your purchase.</p></div></div>
                <div class="pay-opt"><label><input type="radio" name="pay" value="ap" class="visually-hidden"><span class="grow">Afterpay</span><span class="afterpay-pill">afterpay</span></label><div class="pay-opt__body"><p class="t-small">Four interest-free payments of ${money(sub / 4, true)}, every two weeks. You’ll be redirected to Afterpay.</p></div></div>
                <div class="pay-opt"><label><input type="radio" name="pay" value="zip" class="visually-hidden"><span class="grow">Zip, own it now, pay later</span></label><div class="pay-opt__body"><p class="t-small">You’ll be redirected to Zip to complete your purchase.</p></div></div>
              </div></div>
            <button class="btn btn--block co__paybtn" type="submit" data-pay-btn>Pay now</button>
            <nav class="co__policies" aria-label="Policies"><a href="faq.html#returns">Refund policy</a><a href="faq.html#delivery">Shipping policy</a><a href="faq.html#privacy">Privacy policy</a><a href="faq.html#terms">Terms of service</a></nav>
          </form>
        </div>
      </div>
      <aside class="co__side" aria-label="Order summary" data-co-side>
        <div class="co__side-inner">
          <button class="co-summary-toggle" type="button" aria-expanded="false" data-co-toggle><span>${I.bag.replace('class="icon"', 'class="icon" style="width:18px;height:18px;display:inline;vertical-align:-3px;margin-right:6px"')}Show order summary</span><b data-co-total-top></b></button>
          <div class="co-summary-body">
            ${lines.map(l => `<div class="co-line"><span class="co-line__media">${img(l.p.images[0], { sizes: '64px', alt: '' })}<span class="co-line__qty">${l.qty}</span></span><span><span class="co-line__t">${esc(l.p.title)}</span><br><span class="co-line__v">${esc(l.variant || '')}${l.card && l.card.msg ? `${l.variant ? '<br>' : ''}Card: “${esc(l.card.msg.slice(0, 48))}${l.card.msg.length > 48 ? '…' : ''}”` : ''}</span></span><span class="co-line__p">${money(l.total, true)}</span></div>`).join('')}
            <form class="discount" data-discount novalidate><label class="visually-hidden" for="code">Discount code or gift card</label><input class="input" id="code" placeholder="Discount code or gift card"><button class="btn btn--secondary" type="submit">Apply</button></form>
            <p class="field-error" data-code-msg hidden></p>
            <div class="co-totals" data-totals></div>
          </div>
        </div>
      </aside>`;

    // shipping methods appear once a postcode is entered (as in Shopify)
    const shipBox = $('[data-ship]');
    function renderShip() {
      const pc = $('#postcode').value.trim();
      const z = postcodeZone(pc);
      if (!z) { shipBox.innerHTML = '<p class="t-small t-muted" style="padding:16px;background:#F8F4F5;border-radius:6px">Enter your delivery address to see shipping methods.</p>'; st.ship = null; renderTotals(); return; }
      const avail = SHIP.filter(s => !s.metro || z.zone === 'syd' || z.zone === 'mel');
      if (!st.ship || !avail.find(s => s.id === st.ship)) st.ship = avail[0].id;
      shipBox.innerHTML = `<div class="ship-opts" role="radiogroup" aria-label="Shipping method">${avail.map(s => `<label class="ship-opt ${st.ship === s.id ? 'is-selected' : ''}"><span class="check" style="pointer-events:none"><input type="radio" name="ship" value="${s.id}" ${st.ship === s.id ? 'checked' : ''}></span><span class="grow">${s.name}<small>${s.note}</small></span><b>${s.price ? money(s.price, true) : 'Free'}</b></label>`).join('')}</div>`;
      renderTotals();
    }
    shipBox.addEventListener('change', e => { if (e.target.name === 'ship') { st.ship = e.target.value; renderShip(); } });
    $('#postcode').addEventListener('input', X.debounce(renderShip, 200));

    function renderTotals() {
      const ship = st.ship ? SHIP.find(s => s.id === st.ship).price : null;
      const disc = Math.round(sub * st.discount * 100) / 100;
      const total = sub - disc + (ship || 0);
      $('[data-totals]').innerHTML = `
        <div><span>Subtotal</span><span>${money(sub, true)}</span></div>
        ${disc ? `<div><span>Discount <span class="t-muted">(${esc(st.code)})</span></span><span>${money(-disc, true)}</span></div>` : ''}
        <div><span>Shipping</span><span>${ship == null ? '<span class="t-muted">Enter address</span>' : ship ? money(ship, true) : 'Free'}</span></div>
        <div class="total"><span>Total</span><span><small>AUD</small>${money(total, true)}</span></div>
        <div class="tax"><span>Including ${money(total / 11, true)} in GST</span></div>`;
      $('[data-co-total-top]').textContent = money(total, true);
      return total;
    }

    $('[data-discount]').addEventListener('submit', e => {
      e.preventDefault();
      const code = $('#code').value.trim().toUpperCase();
      const msg = $('[data-code-msg]');
      if (code === 'WELCOME10') { st.discount = 0.1; st.code = code; msg.hidden = false; msg.style.color = 'var(--ok)'; msg.textContent = 'WELCOME10 applied: 10% off your first order.'; }
      else { st.discount = 0; st.code = ''; msg.hidden = false; msg.style.color = ''; msg.textContent = code ? 'Enter a valid discount code or gift card. Try WELCOME10.' : 'Enter a discount code or gift card.'; }
      renderTotals();
    });
    $('[data-pay]').addEventListener('change', e => {
      if (e.target.name !== 'pay') return;
      $$('.pay-opt').forEach(o => o.classList.toggle('is-selected', o.contains(e.target)));
    });
    $$('[data-express]').forEach(b => b.addEventListener('click', () => X.toast('Express wallets connect once the store is live on Shopify.')));
    const side = $('[data-co-side]');
    $('[data-co-toggle]').addEventListener('click', e => {
      const openNow = side.classList.toggle('is-open');
      e.currentTarget.setAttribute('aria-expanded', String(openNow));
      e.currentTarget.querySelector('span').lastChild.textContent = openNow ? 'Hide order summary' : 'Show order summary';
    });

    const MSG = { email: 'Enter an email', first: 'Enter a first name', last: 'Enter a last name', address: 'Enter an address', suburb: 'Enter a suburb', state: 'Select a state or territory', postcode: 'Enter a four-digit postcode', phone: 'Enter a phone number so the courier can reach you', cc: 'Enter a card number', exp: 'Enter an expiry date', cvc: 'Enter the security code', ccname: 'Enter the name on the card' };
    $('[data-co-form]').addEventListener('submit', e => {
      e.preventDefault();
      const payCard = $('input[name=pay]:checked').value === 'card';
      let firstBad = null;
      Object.keys(MSG).forEach(id => {
        const el = $('#' + id);
        if (!el) return;
        const f = el.closest('.field'), err = f.querySelector('.field-error');
        const isCardField = ['cc', 'exp', 'cvc', 'ccname'].includes(id);
        let bad = !el.value.trim() && !(isCardField && !payCard);
        if (id === 'email' && el.value && !/^\S+@\S+\.\S+$/.test(el.value)) bad = true;
        if (id === 'postcode' && el.value && !postcodeZone(el.value.trim())) bad = true;
        f.classList.toggle('is-invalid', bad);
        if (err) { err.hidden = !bad; err.textContent = MSG[id]; }
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }
      const btn = $('[data-pay-btn]');
      btn.disabled = true; btn.textContent = 'Processing…';
      setTimeout(() => thankYou(), 1300);
    });

    function thankYou() {
      const total = renderTotals();
      const name = $('#first').value.trim();
      const order = 'ZA' + (1040 + Math.floor(Math.random() * 900));
      const shipName = SHIP.find(s => s.id === st.ship).name;
      const ST = { 'Australian Capital Territory': 'ACT', 'New South Wales': 'NSW', 'Northern Territory': 'NT', Queensland: 'QLD', 'South Australia': 'SA', Tasmania: 'TAS', Victoria: 'VIC', 'Western Australia': 'WA' };
      const addr = `${$('#address').value}, ${$('#suburb').value} ${ST[$('#state').value] || $('#state').value} ${$('#postcode').value}`;
      if (!buyNow) X.Cart.clear();
      $('[data-discount]').hidden = true; $('[data-code-msg]').hidden = true;
      try { sessionStorage.removeItem('zariva-buynow'); } catch (e) {}
      $('.co__main-inner').innerHTML = `
        <div class="co__header"><a class="logo" href="index.html" aria-label="House of Zariva">${X.logoHTML()}</a></div>
        <div class="ty">
          <div class="ty__head"><span class="ty__check">${I.check}</span><div><p class="t-meta">Order #${order}</p><h1 class="t-h3">Thank you, ${esc(name)}.</h1></div></div>
          <div class="ty__map" role="img" aria-label="Delivery location"></div>
          <div class="ty__box"><h3>Your order is confirmed</h3><p>We’ve emailed your confirmation to ${esc($('#email').value)}. Our studio will pack your hamper by hand, and we’ll send tracking details when it leaves us.</p></div>
          <div class="ty__box"><h3>Order details</h3>
            <div class="co__grid" style="gap:18px"><div><p class="t-meta">Delivering to</p><p>${esc(addr)}</p></div><div><p class="t-meta">Shipping method</p><p>${esc(shipName)}</p></div><div><p class="t-meta">Payment</p><p>${money(total, true)} AUD</p></div><div><p class="t-meta">Handwritten cards</p><p>${lines.filter(l => l.card && l.card.msg).length || 'Blank card included'}</p></div></div></div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap"><p class="t-small">Need help? <a class="link" href="contact.html">Contact us</a></p><a class="btn" href="index.html">Continue shopping</a></div>
        </div>`;
      window.scrollTo({ top: 0 });
    }
    renderShip();
  };

  /* =================================================================== SEARCH */
  pages.search = function () {
    const q = (params().get('q') || '').trim();
    const input = $('[data-sp-input]');
    input.value = q;
    const res = q ? X.searchProducts(q) : [];
    document.title = q ? `Search: ${q} | Zariva` : 'Search | Zariva';
    $('[data-sp-title]').textContent = q ? `${res.length} result${res.length === 1 ? '' : 's'} for “${q}”` : 'Search';
    const grid = $('[data-sp-grid]');
    if (q && res.length) grid.innerHTML = `<div class="grid">${res.map(p => X.cardHTML(p)).join('')}</div>`;
    else grid.innerHTML = `<div class="stack-m"><p class="t-lead">${q ? `Nothing matches “${esc(q)}”. Try an occasion, or one of these:` : 'Try an occasion, a person, or something you know they love:'}</p><div style="display:flex;gap:8px;flex-wrap:wrap">${['Diwali', 'Christmas', 'Whisky', 'Baby', 'Flowers', 'Mithai', 'Coffee', 'Corporate'].map(s => `<a class="chip" href="search.html?q=${encodeURIComponent(s)}">${s}</a>`).join('')}</div></div>
      <section class="section section--tight" style="padding-bottom:0"><h2 class="t-h2" style="margin-bottom:32px">Bestsellers</h2><div class="grid">${X.inCollection('bestsellers').slice(0, 4).map(p => X.cardHTML(p)).join('')}</div></section>`;
  };

  /* =================================================================== REVIEWS PAGE */
  pages.reviews = function () {
    const S = D.reviewStats;
    const st = { occ: '', stars: 0, photos: false, sort: 'recent', shown: 12 };
    $('[data-rev-summary]').innerHTML = `
      <div class="rev-summary__score"><b>${S.average.toFixed(1)}</b>${X.starsHTML(S.average, 'stars--lg')}<p>From ${S.count.toLocaleString('en-AU')} reviews</p></div>
      <div class="dist" data-dist>${[5, 4, 3, 2, 1].map(s => `<button type="button" data-star="${s}" aria-pressed="false"><span>${s} star${s > 1 ? 's' : ''}</span><span class="bar"><i style="width:${(S.dist[s] / S.count * 100).toFixed(1)}%"></i></span><span>${S.dist[s].toLocaleString('en-AU')}</span></button>`).join('')}</div>
      <div class="stack-s"><button class="btn" type="button" data-write>Write a review</button><p class="t-small t-muted" style="max-width:16em">Reviews come from verified orders. We publish every one, good or bad.</p></div>`;
    const withPhotos = D.reviews.filter(r => r.photo);
    $('[data-photo-strip]').innerHTML = withPhotos.map(r => `<button type="button" data-lightbox="${r.photo}" aria-label="Photo from ${esc(r.name)}">${img(r.photo, { sizes: '200px' })}</button>`).join('');
    const occs = D.OCCASIONS;
    $('[data-rev-filters]').innerHTML = `
      <div class="rev-filters__chips" role="group" aria-label="Filter by occasion"><button type="button" class="chip" data-occ="" aria-pressed="true">All</button>${occs.map(h => `<button type="button" class="chip" data-occ="${h}" aria-pressed="false">${esc(D.collections[h].short)}</button>`).join('')}</div>
      <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><label class="check t-small"><input type="checkbox" data-photos><span>With photos</span></label>
        <div class="sort"><label for="rsort">Sort by</label><select id="rsort" data-rsort><option value="recent">Most recent</option><option value="high">Highest rated</option><option value="low">Lowest rated</option><option value="helpful">Most helpful</option></select></div></div>`;
    function list() {
      let l = D.reviews.filter(r => {
        const p = X.product(r.product);
        if (st.occ && !p.occasions.includes(st.occ)) return false;
        if (st.stars && r.rating !== st.stars) return false;
        if (st.photos && !r.photo) return false;
        return true;
      });
      const by = { recent: (a, b) => b.date.localeCompare(a.date), high: (a, b) => b.rating - a.rating || b.date.localeCompare(a.date), low: (a, b) => a.rating - b.rating || b.date.localeCompare(a.date), helpful: (a, b) => b.helpful - a.helpful };
      return l.sort(by[st.sort]);
    }
    function render() {
      const l = list();
      $$('[data-occ]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.occ === st.occ)));
      $$('[data-star]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.star === st.stars)));
      $('[data-rev-list]').innerHTML = l.length ? l.slice(0, st.shown).map(r => X.reviewHTML(r)).join('') : '<p class="t-lead" style="column-span:all">No reviews match those filters yet. Try another occasion or star rating.</p>';
      $('[data-rev-more]').innerHTML = l.length > st.shown ? `<div class="load-more"><p>Showing ${st.shown} of ${l.length}</p><button class="btn btn--secondary" type="button" data-rmore>Show more reviews</button></div>` : '';
      $('[data-rev-count]').textContent = l.length ? `Showing ${Math.min(st.shown, l.length)} of ${l.length} recent reviews` : '';
    }
    document.addEventListener('click', e => {
      const o = e.target.closest('[data-occ]'); if (o) { st.occ = o.dataset.occ; st.shown = 12; render(); }
      const s = e.target.closest('[data-star]'); if (s) { st.stars = st.stars === +s.dataset.star ? 0 : +s.dataset.star; st.shown = 12; render(); }
      if (e.target.closest('[data-rmore]')) { st.shown += 12; render(); }
      if (e.target.closest('[data-write]')) openWrite(e.target.closest('[data-write]'));
    });
    $('[data-photos]').addEventListener('change', e => { st.photos = e.target.checked; render(); });
    $('[data-rsort]').addEventListener('change', e => { st.sort = e.target.value; render(); });
    render();

    // write-a-review modal (Judge.me / Shopify Product Reviews form in production)
    const modal = document.createElement('div');
    modal.className = 'modal'; modal.id = 'write'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Write a review'); modal.setAttribute('aria-hidden', 'true');
    document.body.appendChild(modal);
    function openWrite(from) {
      let rating = 0;
      modal.innerHTML = `<div class="modal__scrim" data-close></div><div class="modal__panel" style="width:min(620px,100%)"><button class="icon-btn modal__close" type="button" data-close aria-label="Close">${I.close}</button>
        <form class="form-panel" data-wform novalidate>
          <h2 class="t-h3">Write a review</h2>
          <div class="field"><label for="wp">Which hamper did you send or receive?</label><select class="select" id="wp">${D.products.filter(p => p.type === 'Hamper').map(p => `<option value="${p.handle}">${esc(p.title)}</option>`).join('')}</select></div>
          <div class="field"><span class="field-label" id="wr-l">Your rating</span><div class="star-input" role="group" aria-labelledby="wr-l">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-rate="${n}" aria-label="${n} star${n > 1 ? 's' : ''}" aria-pressed="false">${I.star}</button>`).join('')}</div><span class="field-error" data-rerr hidden>Choose a star rating.</span></div>
          <div class="field"><label for="wt">Title</label><input class="input" id="wt" placeholder="Sum it up in a few words" maxlength="80"></div>
          <div class="field"><label for="wb">Your review</label><textarea class="textarea" id="wb" placeholder="What did you send, and how did it land?"></textarea></div>
          <div class="writer__row"><div class="field"><label for="wn">Name</label><input class="input" id="wn" autocomplete="name"></div><div class="field"><label for="we">Email</label><input class="input" id="we" type="email" autocomplete="email"></div></div>
          <div class="field"><label for="wph">Add photos <span class="t-muted" style="font-weight:400">optional</span></label><input id="wph" type="file" accept="image/*" multiple></div>
          <button class="btn" type="submit">Submit review</button>
        </form></div>`;
      modal.querySelector('[data-wform]').addEventListener('click', e => {
        const b = e.target.closest('[data-rate]');
        if (!b) return;
        rating = +b.dataset.rate;
        $$('[data-rate]', modal).forEach(x => { x.classList.toggle('is-on', +x.dataset.rate <= rating); x.setAttribute('aria-pressed', String(+x.dataset.rate === rating)); });
      });
      modal.querySelector('[data-wform]').addEventListener('submit', e => {
        e.preventDefault();
        if (!rating) { $('[data-rerr]', modal).hidden = false; return; }
        e.target.innerHTML = `<div class="form-success"><span class="ty__check">${I.check}</span><h2 class="t-h3">Thanks for your review.</h2><p>We’ll publish it once we’ve matched it to your order, usually within a day.</p><button class="btn btn--secondary" type="button" data-close>Close</button></div>`;
      });
      X.open('write', from);
    }
    if (location.hash === '#write') setTimeout(() => openWrite(), 300);
  };

  /* =================================================================== CONTACT */
  pages.contact = function () {
    const topic = params().get('topic');
    const sel = $('#topic');
    if (topic && sel) sel.value = { corporate: 'Corporate gifting', wedding: 'Wedding orders', order: 'An existing order' }[topic] || sel.value;
    const form = $('[data-contact]');
    form.addEventListener('submit', e => {
      e.preventDefault();
      let bad = null;
      [['#cname', 'Enter your name'], ['#cemail', 'Enter an email so we can reply'], ['#cmsg', 'Tell us a little about what you need']].forEach(([s, m]) => {
        const el = $(s), f = el.closest('.field'), err = f.querySelector('.field-error');
        const isBad = !el.value.trim() || (s === '#cemail' && !/^\S+@\S+\.\S+$/.test(el.value));
        f.classList.toggle('is-invalid', isBad); err.hidden = !isBad; err.textContent = m;
        if (isBad && !bad) bad = el;
      });
      if (bad) { bad.focus(); return; }
      const first = $('#cname').value.trim().split(' ')[0];
      form.innerHTML = `<div class="form-success"><span class="ty__check">${I.check}</span><h2 class="t-h2">Thanks, ${esc(first)}. We’ve got your message.</h2><p class="t-lead">A real person from our studio will reply within one business day${sel.value === 'Corporate gifting' ? ', with a quote if you’ve given us numbers' : ''}.</p><a class="btn btn--secondary" href="collection.html?c=all">Keep browsing</a></div>`;
    });
  };

  /* =================================================================== ACCOUNT */
  pages.account = function () {
    const root = $('[data-account]');
    const signedIn = () => X.store.get('zariva-account', null);
    function render() {
      const acc = signedIn();
      if (acc) {
        root.innerHTML = `<h1 class="t-h2">Hello, ${esc(acc.first || 'there')}.</h1>
          <p class="t-muted">Signed in as ${esc(acc.email)}.</p>
          <div><h2 class="t-h4" style="margin-bottom:12px">Your orders</h2><ul class="orders">
            <li><span>#ZA1031<br><span class="t-small t-muted">The Diya Hamper, Grand</span></span><span class="status">Packing</span><span class="price">$229.00</span></li>
            <li><span>#ZA0987<br><span class="t-small t-muted">Birthday Bloom</span></span><span class="status">Delivered</span><span class="price">$169.00</span></li>
          </ul></div>
          <div><h2 class="t-h4" style="margin-bottom:12px">Saved addresses</h2><p class="t-small">Mum, 14 Wattle St, Parramatta NSW 2150<br>Office, Level 3, 88 George St, Sydney NSW 2000</p></div>
          <button class="btn btn--secondary" type="button" data-signout>Sign out</button>`;
        $('[data-signout]').addEventListener('click', () => { X.store.set('zariva-account', null); render(); });
        return;
      }
      root.innerHTML = `<div class="tabs" role="tablist"><button role="tab" aria-selected="true" data-tab="in" id="t-in" aria-controls="p-in">Sign in</button><button role="tab" aria-selected="false" data-tab="up" id="t-up" aria-controls="p-up">Create account</button></div>
        <form class="stack-m" id="p-in" role="tabpanel" aria-labelledby="t-in" data-acc-form novalidate>
          <div class="field"><label for="ae">Email</label><input class="input" id="ae" type="email" autocomplete="email"><span class="field-error" hidden></span></div>
          <div class="field"><label for="ap">Password</label><input class="input" id="ap" type="password" autocomplete="current-password"><span class="field-error" hidden></span></div>
          <button class="btn btn--block" type="submit">Sign in</button>
          <a class="link t-small" href="#" data-forgot>Forgot your password?</a>
        </form>
        <form class="stack-m" id="p-up" role="tabpanel" aria-labelledby="t-up" data-acc-form hidden novalidate>
          <div class="writer__row"><div class="field"><label for="af">First name</label><input class="input" id="af" autocomplete="given-name"></div><div class="field"><label for="al">Last name</label><input class="input" id="al" autocomplete="family-name"></div></div>
          <div class="field"><label for="ae2">Email</label><input class="input" id="ae2" type="email" autocomplete="email"><span class="field-error" hidden></span></div>
          <div class="field"><label for="ap2">Password</label><input class="input" id="ap2" type="password" autocomplete="new-password"><span class="field-hint">At least 8 characters.</span><span class="field-error" hidden></span></div>
          <label class="check t-small"><input type="checkbox" checked><span>Send me early access to seasonal edits</span></label>
          <button class="btn btn--block" type="submit">Create account</button>
        </form>`;
      $$('[data-tab]', root).forEach(t => t.addEventListener('click', () => {
        $$('[data-tab]', root).forEach(x => x.setAttribute('aria-selected', String(x === t)));
        $('#p-in').hidden = t.dataset.tab !== 'in'; $('#p-up').hidden = t.dataset.tab !== 'up';
      }));
      $('[data-forgot]').addEventListener('click', e => { e.preventDefault(); X.toast('We’ve sent a reset link to your email, if it matches an account.'); });
      $$('[data-acc-form]', root).forEach(f => f.addEventListener('submit', e => {
        e.preventDefault();
        const email = f.querySelector('input[type=email]'), pw = f.querySelector('input[type=password]');
        let ok = true;
        [[email, /^\S+@\S+\.\S+$/.test(email.value), 'Enter an email like name@example.com'], [pw, pw.value.length >= (f.id === 'p-up' ? 8 : 1), f.id === 'p-up' ? 'Use at least 8 characters' : 'Enter your password']].forEach(([el, good, m]) => {
          const fld = el.closest('.field'), err = fld.querySelector('.field-error');
          fld.classList.toggle('is-invalid', !good); err.hidden = good; err.textContent = m;
          if (!good) ok = false;
        });
        if (!ok) return;
        const first = f.id === 'p-up' ? $('#af').value.trim() : email.value.split('@')[0].replace(/[^a-z]/gi, ' ').trim().split(' ')[0];
        X.store.set('zariva-account', { email: email.value.trim(), first: first ? first[0].toUpperCase() + first.slice(1) : '' });
        render();
      }));
    }
    render();
  };

  /* =================================================================== FAQ: highlight the section in view */
  pages.faq = function () {
    const links = $('.faq__nav a');
    if (links[0]) links[0].classList.add('is-active');
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id)); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.faq__group').forEach(g => io.observe(g));
  };
})();
