/* House of Zariva: one render function per page. Each page's <body data-page> picks it.
   Build labels (data-build) say which Intellect section or custom code makes each part;
   numbered pins (data-note) link to the notes in the presentation. */
(function () {
  'use strict';
  const { D, $, $$, esc, I, img, money } = Z;
  const page = document.body.dataset.page;
  const focus = (k) => `object-position:${D.focus[k] || '50% 50%'}`;
  const pic = (k, size = 1700, alt = '') => `<img src="${img(k, size)}" alt="${esc(alt)}" style="${focus(k)}">`;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const productsFor = (id) => D.products.filter((p) => p.type === 'hamper' && p.occasions.includes(id));

  /* ================================================================ HOME */
  function home(main) {
    const m = Z.lead();
    const s = m ? Z.momentState(m) : null;
    let heroText, heroImg, cta;
    if (m) {
      heroImg = m.image;
      const when = m.kind === 'sale' ? (s.active ? `Until ${Z.fmtLong(s.end)}` : `From ${Z.fmtLong(s.start)}`) : Z.fmtLong(s.start);
      let count = '';
      if (m.kind === 'sale') {
        count = s.active ? `<p>Fifteen percent off, <b>ends ${Z.fmtLong(s.end)}</b>.</p>` : `<p>Starts in <b>${s.toDate} ${s.toDate === 1 ? 'day' : 'days'}</b>. We’ll only say it once.</p>`;
      } else if (s.orderable) {
        const p = Math.max(6, Math.min(100, 100 - (s.toOrder / 30) * 100));
        count = `<p>Order within <b>${s.toOrder <= 0 ? 'today' : `${s.toOrder} ${s.toOrder === 1 ? 'day' : 'days'}`}</b> for delivery before ${esc(m.name)}.</p><div class="goldline"><div class="goldline__fill" style="--p:${p}%"></div></div>`;
      } else {
        count = `<p><b>Same-day delivery</b> in Sydney and Melbourne until the day before.</p>`;
      }
      heroText = `<p class="eyebrow rv"><span class="diamond"></span>${esc(m.name)} · ${when}</p>
        <h1 class="hero-title rv" style="--i:1">${m.headline}</h1>
        <p class="lead rv" style="--i:2">${esc(m.blurb)}</p>
        <div class="moment__count rv" style="--i:3">${count}</div>`;
      cta = `<a class="btn btn--plum" href="collection.html?c=${m.id}" data-set-moment="${m.id}">${m.kind === 'sale' ? 'See the Quiet Week' : `Send for ${esc(m.name)}`}</a><a class="link-arrow" href="#celebrate">Every occasion ${I.arrow}</a>`;
    } else {
      heroImg = 'exchange';
      heroText = `<p class="eyebrow rv"><span class="diamond"></span>Hampers, packed by hand in Sydney</p>
        <h1 class="hero-title rv" style="--i:1">For the people <em>worth the effort</em>.</h1>
        <p class="lead rv" style="--i:2">Each hamper is packed by hand, carries a card we write in ink, and arrives on the day you choose. Anywhere in Australia.</p>`;
      cta = `<a class="btn btn--plum" href="#celebrate">Find their hamper</a><a class="link-arrow" href="build.html">Build your own ${I.arrow}</a>`;
    }

    // What are we celebrating: dated moments first, then the always-on ones.
    const up = Z.upcoming().slice(0, 3);
    const row = (o, dated) => {
      const st = dated ? Z.momentState(o) : null;
      const n = productsFor(o.id).length;
      const when = dated
        ? (o.kind === 'sale' ? `<b>${Z.fmtShort(st.start)} to ${Z.fmtShort(st.end)}</b>15% off, once a year` : `<b>${Z.fmtLong(st.start)}</b>${st.orderable ? `Order by ${Z.fmt(st.orderBy)}` : 'Same-day in metro'}`)
        : `<b>${n} hampers</b>Any day`;
      return `<a class="occ__row" href="collection.html?c=${o.id}" data-set-moment="${o.id}" data-img="${o.image}" data-line="${esc(o.line)}">
        <span class="occ__thumb arch">${pic(o.image, 900)}</span>
        <span class="occ__name"><b>${esc(o.name)}</b><small>${esc(o.line)}</small></span>
        <span class="occ__when">${when}</span>
        <span class="occ__arrow">${I.arrow}</span></a>`;
    };
    const first = up[0] || D.always[0];

    // The hampers for the moment (or the most sent).
    const pool = m && m.kind !== 'sale' ? productsFor(m.id) : m ? productsFor('quiet-week') : D.products.filter((p) => p.best).sort((a, b) => a.best - b.best);
    const list = (pool.length >= 3 ? pool : D.products.filter((p) => p.best)).slice(0, 3);
    const gridHead = m ? (m.kind === 'sale' ? 'The Quiet Week' : `For ${esc(m.name)}`) : 'Most sent this week';
    const gridLink = m ? `collection.html?c=${m.id}` : 'collection.html?c=all';

    const reels = D.ugc.map((u) => {
      const p = Z.product(u.product);
      return `<article class="reel rv">
        <a class="reel__media media" href="product.html?p=${p.handle}" aria-label="${esc(p.title)}, filmed by ${esc(u.name)}">
          <video src="assets/video/${u.video}.mp4" poster="assets/video/${u.video}.jpg" muted loop playsinline preload="none"></video>
          ${p.loupe ? `<loupe-chip data-handle="${p.handle}" data-product="${esc(JSON.stringify(Z.loupeData(p)))}"></loupe-chip>` : `<span class="reel__play">${I.play} Unboxed</span>`}
        </a>
        <blockquote>“${esc(u.quote)}”</blockquote>
        <cite>${esc(u.name)}, ${esc(u.place)} · <a class="link" href="product.html?p=${p.handle}">${esc(p.title)}</a></cite>
      </article>`;
    }).join('');

    const g = Z.gift.get();
    main.innerHTML = `
    <section class="moment" data-note="3" data-build="custom" data-build-label="Moment hero: Intellect slideshow driven by the next Moment metaobject (arch image, countdown)">
      <div class="wrap moment__grid">
        <div class="moment__text">${heroText}<div class="moment__actions rv" style="--i:4">${cta}</div></div>
        <div class="moment__media"><div class="arch arch-open">${pic(heroImg)}</div></div>
      </div>
    </section>

    <section class="sec" id="celebrate" data-note="4" data-build="custom" data-build-label="Occasion index (Intellect collection index) listing Moments by date, then always-on occasions">
      <div class="wrap">
        <div class="head"><div class="head__text"><p class="eyebrow"><span class="diamond"></span>What are we celebrating?</p><h2 class="h2">Choose the moment. We’ll make sure it arrives.</h2></div></div>
        <div class="occ">
          <div>
            <div class="occ__list">${up.map((o) => row(o, true)).join('')}</div>
            <p class="eyebrow occ__sub">Any day</p>
            <div class="occ__list">${D.always.map((o) => row(o, false)).join('')}</div>
            <div class="who" data-note="5" data-build="native" data-build-label="Collection links by recipient (metafield filter in Search &amp; Discovery)"><span class="eyebrow">Who is it for?</span>${D.recipients.map((r) => `<a class="chip" href="collection.html?for=${r.id}" data-set-for="${r.id}"${g.for === r.id ? ' aria-pressed="true"' : ''}>${cap(r.name.replace('For ', ''))}</a>`).join('')}</div>
          </div>
          <div class="occ__stage" aria-hidden="true"><div class="arch arch--frame">${[...up, ...D.always].map((o, i) => `<img src="${img(o.image, 900)}" alt="" style="${focus(o.image)}" data-stage="${o.image}"${i === 0 ? ' class="is-on"' : ''}>`).join('')}</div><p data-stage-line>${esc(first.line)}</p></div>
        </div>
      </div>
    </section>

    <section class="sec" data-note="6" data-build="native" data-build-label="Intellect featured collection, the Moment’s collection. Arrival line from theme JS">
      <div class="wrap">
        <div class="head"><div class="head__text"><p class="eyebrow"><span class="diamond"></span>${gridHead}</p><h2 class="h2">${m && m.kind !== 'sale' ? `Hampers that arrive <em>before ${esc(m.name)}</em>.` : m ? 'Fifteen percent off, and nothing else to say.' : 'The ones people send most.'}</h2></div><a class="link-arrow" href="${gridLink}">See all ${pool.length || ''} ${I.arrow}</a></div>
        <div class="grid">${list.map(Z.card).join('')}${Z.byoTile()}</div>
      </div>
    </section>

    <section class="sec sec--lg band" data-note="7" data-build="custom" data-build-label="Three-step story (Intellect features section, images) with a live card writer">
      <div class="wrap">
        <div class="head"><div class="head__text"><p class="eyebrow"><span class="diamond"></span>How a Zariva hamper is made</p><h2 class="h2">From our studio to their door.</h2></div></div>
        <div class="steps">
          <div class="step rv"><div class="media ratio-45">${pic('pack-woman', 900)}</div><p class="step__n">01</p><h3>Packed by hand</h3><p>Every hamper is put together in our Sydney studio on the day it leaves, with things from more than 40 Australian makers.</p></div>
          <div class="step rv" style="--i:1" data-note="8">
            <div class="card-writer"><div class="notecard" aria-live="polite"><span data-p-to>Dear Maa,</span><span class="notecard__msg" data-p-msg>${esc(Z.greeting(Z.giftMoment()) || 'Happy birthday')}. Wish I could be there to light the first diya with you.</span><span class="notecard__from" data-p-from>Love, Anu</span></div>
            <label class="sr" for="try-msg">Try a message</label><input class="input" id="try-msg" placeholder="Type a message to see it written" maxlength="160"></div>
            <p class="step__n">02</p><h3>Written by hand</h3><p>Tell us what to say. We write it in ink on a cotton card, then seal the lid. Try it above.</p></div>
          <div class="step rv" style="--i:2"><div class="media ratio-45">${pic('open-woman', 900)}</div><p class="step__n">03</p><h3>There on the day</h3><p>Pick the day it arrives. Order by 1pm for dispatch the same day, and same-day delivery in Sydney and Melbourne.</p></div>
        </div>
      </div>
    </section>

    <section class="sec sec--lg" data-note="9" data-build="native" data-build-label="Intellect shoppable videos + Loupe video cards on three hampers">
      <div class="wrap">
        <div class="head"><div class="head__text"><p class="eyebrow"><span class="diamond"></span>Unboxed</p><h2 class="h2">In their words.</h2></div>
          <div class="score" data-build="app" data-build-label="Rating from the reviews app (reviews.rating metafields)"><b>${D.reviewStats.average}</b>${Z.stars(5)}<span>from ${D.reviewStats.count.toLocaleString('en-AU')} reviews</span></div></div>
        <div class="reels">${reels}</div>
      </div>
    </section>

    <section class="many" data-note="10" data-build="native" data-build-label="Intellect image-with-text section on the plum scheme (no image)">
      <div class="wrap">
        <div style="display:grid;gap:20px"><p class="eyebrow"><span class="diamond"></span>Gifting for many</p><h2 class="h2">A team, a client list, a whole family.</h2><p>From ten boxes to a thousand. We pack them together, put your logo on the ribbon, and send each one to its own door with its own card.</p>
          <div class="many__actions"><a class="btn btn--white" href="corporate.html">Corporate gifting</a><a class="link-arrow" href="concierge.html">Message the concierge ${I.arrow}</a></div></div>
        <ul class="many__facts"><li><span class="diamond"></span>Tiered pricing from 10 boxes</li><li><span class="diamond"></span>Your logo on the ribbon and card</li><li><span class="diamond"></span>One delivery list, one invoice</li><li><span class="diamond"></span>A proposal within one business day</li></ul>
      </div>
    </section>`;

    // Occasion stage: the arch photograph follows the row you're on.
    const stage = $('.occ__stage');
    $$('.occ__row').forEach((r) => r.addEventListener('mouseenter', () => {
      $$('.occ__row').forEach((x) => x.classList.toggle('is-active', x === r));
      $$('[data-stage]', stage).forEach((im) => im.classList.toggle('is-on', im.dataset.stage === r.dataset.img));
      $('[data-stage-line]', stage).textContent = r.dataset.line;
    }));
    $('.occ__row') && $('.occ__row').classList.add('is-active');
    cardTry();
    playInView();
  }

  function cardTry() {
    const input = $('#try-msg');
    if (!input) return;
    const msg = $('[data-p-msg]'), base = msg.textContent;
    input.addEventListener('input', () => { msg.innerHTML = input.value ? `${esc(input.value)}<span class="caret"></span>` : esc(base); });
  }
  function playInView() {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: 0.4 });
    $$('.reel video').forEach((v) => io.observe(v));
  }

  /* ================================================================ COLLECTION */
  function collection(main) {
    const c = Z.qs.get('c') || (Z.qs.get('for') ? '' : 'all');
    const who = Z.qs.get('for') || '';
    const m = Z.momentById(c);
    if (m) Z.gift.set({ moment: m.id });
    if (who) Z.gift.set({ for: who });
    const rec = D.recipients.find((r) => r.id === who);
    const st = m && Z.isDated(m) ? Z.momentState(m) : null;

    let base = D.products.filter((p) => p.type === 'hamper');
    if (m) base = base.filter((p) => p.occasions.includes(m.id));
    if (who && !m) base = base.filter((p) => p.for.includes(who));
    let title, blurb, eyebrow, arch = '';
    if (m) {
      title = m.name;
      blurb = m.blurb || m.line;
      eyebrow = st ? (m.kind === 'sale' ? `${Z.fmtLong(st.start)} to ${Z.fmtLong(st.end)}` : Z.fmtLong(st.start)) : 'Any day';
      arch = `<div class="arch arch-open">${pic(m.image, 900)}</div>`;
    } else if (rec) {
      title = rec.name; eyebrow = 'Who it’s for'; blurb = { her: 'Flowers, something sparkling and something she’ll keep.', him: 'Good whisky, better coffee and something for the barbecue.', baby: 'Soft, useful and lovely to unwrap, for the new arrival and the people looking after them.', family: 'Hampers to share across a table, for the whole house.', team: 'For clients and colleagues. Logo ribbons and tiered pricing from ten boxes.' }[who];
      arch = `<div class="arch arch-open">${pic({ her: 'h-bouquet-box', him: 'm-whisky-glasses', baby: 'b-newborn', family: 'h-picnic', team: 'c-journal' }[who], 900)}</div>`;
    } else { title = 'Every hamper'; eyebrow = 'All occasions'; blurb = 'Everything we make, for every occasion. Each one packed by hand in our Sydney studio and sent with a card written in ink.'; arch = `<div class="arch arch-open">${pic('basket-linen', 900)}</div>`; }

    let order = '';
    if (st && m.kind !== 'sale') {
      const p = Math.max(6, Math.min(100, 100 - (st.toOrder / 30) * 100));
      order = st.orderable ? `<div class="col-head__order"><p>Order by <b>${Z.fmtLong(st.orderBy)}</b> for delivery Australia-wide. Same-day in Sydney and Melbourne until ${Z.fmt(Z.addDays(st.start, -1))}.</p><div class="goldline"><div class="goldline__fill" style="--p:${p}%"></div></div></div>` : `<div class="col-head__order"><p><b>Same-day only now</b>, in Sydney and Melbourne metro.</p></div>`;
    }

    const state = { who: m ? who : '', budget: Z.qs.get('budget') || '', diet: '', baby: '', sort: 'featured' };
    main.innerHTML = `
      <section class="wrap col-head" data-note="3" data-build="native" data-build-label="Intellect collection banner: arch image (Character → Image shape: Arch), Moment dates">
        <div class="col-head__text"><p class="eyebrow rv"><span class="diamond"></span>${esc(eyebrow)}</p><h1 class="h1 rv" style="--i:1">${esc(title)}</h1><p class="lead rv" style="--i:2">${esc(blurb)}</p>${order}</div>
        ${arch}
      </section>
      <div class="toolbar" data-note="4" data-build="native" data-build-label="Intellect filters: Search &amp; Discovery (recipient and dietary metafields, price), sort">
        <div class="wrap">
          ${m ? D.recipients.filter((r) => base.some((p) => p.for.includes(r.id))).map((r) => `<button class="chip" type="button" data-f-who="${r.id}">${cap(r.name.replace('For ', ''))}</button>`).join('') : ''}
          ${c === 'new-baby' || who === 'baby' ? '<button class="chip" type="button" data-f-baby="girl">For a girl</button><button class="chip" type="button" data-f-baby="boy">For a boy</button>' : ''}
          <select class="select" data-f-budget aria-label="Budget"><option value="">Any budget</option><option value="under-100">Under $100</option><option value="100-200">$100 to $200</option><option value="200-plus">$200 and over</option></select>
          <button class="chip" type="button" data-f-diet="Alcohol-free">Alcohol-free</button>
          <select class="select" data-f-sort aria-label="Sort"><option value="featured">Featured</option><option value="low">Price, low to high</option><option value="high">Price, high to low</option><option value="new">Newest</option></select>
          <span class="toolbar__count" data-total></span>
        </div>
      </div>
      <section class="wrap" style="padding-bottom:var(--sec)"><div class="grid" data-grid data-note="5"></div></section>`;
    $('[data-f-budget]').value = state.budget;

    const draw = () => {
      let list = base.slice();
      if (state.who) list = list.filter((p) => p.for.includes(state.who));
      if (state.baby) list = list.filter((p) => (p.babyFor || ['any']).some((b) => b === state.baby || b === 'any'));
      if (state.diet) list = list.filter((p) => p.dietary.includes(state.diet) || (!p.alcohol && state.diet === 'Alcohol-free'));
      const price = (p) => Z.sale(p, Z.priceFor(p, Z.defaults(p)));
      if (state.budget === 'under-100') list = list.filter((p) => price(p) < 100);
      if (state.budget === '100-200') list = list.filter((p) => price(p) >= 100 && price(p) <= 200);
      if (state.budget === '200-plus') list = list.filter((p) => price(p) > 200);
      if (state.sort === 'low') list.sort((a, b) => price(a) - price(b));
      if (state.sort === 'high') list.sort((a, b) => price(b) - price(a));
      if (state.sort === 'new') list.sort((a, b) => (b.created || '').localeCompare(a.created || ''));
      if (state.sort === 'featured') list.sort((a, b) => (a.best || 99) - (b.best || 99));
      $('[data-total]').textContent = `${list.length} ${list.length === 1 ? 'hamper' : 'hampers'}`;
      const cards = list.map(Z.card);
      const promoAt = Math.min(5, cards.length);
      if (['corporate', 'christmas', 'thank-you'].includes(c) || who === 'team') cards.splice(promoAt, 0, `<div class="promo rv" data-build="custom" data-build-label="Promo tile inside the product grid (Intellect grid block)"><p class="eyebrow"><span class="diamond"></span>Sending 20 or more?</p><p class="h3" style="color:#fff">Tiered pricing, your logo on the ribbon, one invoice.</p><p>We’ll send a proposal within one business day.</p><a class="link-arrow" href="corporate.html" style="color:#fff">Corporate gifting ${I.arrow}</a></div>`);
      if (!m || m.kind !== 'sale') cards.push(Z.byoTile());
      $('[data-grid]').innerHTML = list.length ? cards.join('') : `<div class="empty" style="grid-column:1/-1"><p class="h3">Nothing matches all of that.</p><p class="muted">Try another budget, or let the concierge put one together.</p><a class="btn btn--line" href="concierge.html">Ask the concierge</a></div>`;
      Z.reveal($('[data-grid]'));
      window.PROTO && PROTO.refresh();
    };
    main.addEventListener('click', (e) => {
      const w = e.target.closest('[data-f-who]'), b = e.target.closest('[data-f-baby]'), d = e.target.closest('[data-f-diet]');
      if (w) { state.who = state.who === w.dataset.fWho ? '' : w.dataset.fWho; $$('[data-f-who]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.fWho === state.who))); draw(); }
      if (b) { state.baby = state.baby === b.dataset.fBaby ? '' : b.dataset.fBaby; $$('[data-f-baby]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.fBaby === state.baby))); draw(); }
      if (d) { state.diet = state.diet ? '' : d.dataset.fDiet; d.setAttribute('aria-pressed', String(!!state.diet)); draw(); }
    });
    $('[data-f-budget]').addEventListener('change', (e) => { state.budget = e.target.value; draw(); });
    $('[data-f-sort]').addEventListener('change', (e) => { state.sort = e.target.value; draw(); });
    draw();
  }

  /* ================================================================ PRODUCT */
  function product(main) {
    const p = Z.product(Z.qs.get('p')) || Z.product('the-diya-hamper');
    document.title = `${p.title} | House of Zariva`;
    const g = Z.gift.get();
    const gm = Z.giftMoment();
    const occ = Z.sendingFor(p) || ((gm && p.occasions.includes(gm.id)) ? gm : Z.momentById(p.occasions.find((o) => o !== 'quiet-week')) || null);
    const sel = Z.defaults(p);
    const state = { sel, noCard: false, to: g.card.to || '', msg: g.card.message || Z.greeting(occ) || '', from: g.card.from || '', date: '', postcode: Z.store.get('zariva:postcode', ''), hide: Z.cart.get().attrs.hidePrices };

    // Arrival days, with the Moment's own date marked when it's in the list.
    const os = occ && Z.isDated(occ) && occ.kind !== 'sale' ? Z.momentState(occ) : null;
    const dayList = () => Z.arrivalDays(os && os.orderable ? Math.max(12, Z.days(Z.today(), os.start) + 4) : 12, state.postcode);
    const defaultDate = () => {
      const ds = dayList();
      if (os && os.orderable) { const before = ds.filter((d) => d < os.start); return Z.iso(before[before.length - 1] || ds[0]); }
      return Z.iso(ds[0]);
    };
    state.date = Z.cart.get().attrs.date && dayList().some((d) => Z.iso(d) === Z.cart.get().attrs.date) ? Z.cart.get().attrs.date : defaultDate();

    const optHTML = () => p.options.map((o) => `<div class="field"><span class="lbl">${esc(o.name)}</span>
      ${o.swatch ? `<div class="swatches" role="radiogroup" aria-label="${esc(o.name)}">${o.values.map((v) => `<button type="button" class="swatch" role="radio" aria-checked="${state.sel[o.name] === v.v}" data-opt="${esc(o.name)}" data-val="${esc(v.v)}"><i style="background:${v.hex}"></i>${esc(v.v)}${v.add ? ` <small class="muted">+${money(v.add)}</small>` : ''}</button>`).join('')}</div>`
      : `<div class="opts" role="radiogroup" aria-label="${esc(o.name)}">${o.values.map((v) => { const out = (p.soldOut || []).includes(v.v); return `<button type="button" class="opt" role="radio" aria-checked="${state.sel[o.name] === v.v}" ${out ? 'aria-disabled="true"' : ''} data-opt="${esc(o.name)}" data-val="${esc(v.v)}"><span>${esc(v.v)}${v.note ? ` <small>· ${esc(v.note)}</small>` : ''}</span><small class="num">${out ? 'Sold out' : v.price ? money(Z.sale(p, v.price)) + (v.compare ? ` <s>${money(v.compare)}</s>` : '') : v.add ? `${v.add > 0 ? '+' : '−'}${money(Math.abs(v.add))}` : ''}</small></button>`; }).join('')}</div>`}</div>`).join('');

    const imgs = [...new Set(p.images)];
    const rv = D.reviews.filter((r) => r.product === p.handle);
    const related = D.products.filter((x) => x.type === 'hamper' && x.handle !== p.handle && occ && x.occasions.includes(occ.id)).slice(0, 4);
    const rel = related.length >= 2 ? related : D.products.filter((x) => x.type === 'hamper' && x.handle !== p.handle && x.best).slice(0, 4);

    main.innerHTML = `
      <div class="wrap pdp">
        <div class="gallery" data-note="3" data-build="native" data-build-label="Intellect product media: thumbnails. Loupe video card on hampers with a clip">
          <div class="gallery__main media">${imgs.map((k, i) => `<img src="${img(k, 1700)}" alt="${esc(p.title)}" style="${focus(k)};opacity:${i ? 0 : 1}" data-gimg="${i}">`).join('')}
            ${p.loupe ? `<loupe-chip data-handle="${p.handle}" data-product="${esc(JSON.stringify(Z.loupeData(p)))}" data-note="4"></loupe-chip>` : ''}</div>
          ${imgs.length > 1 ? `<div class="gallery__thumbs">${imgs.map((k, i) => `<button type="button" data-thumb="${i}" aria-current="${i === 0}" aria-label="Photo ${i + 1}"><img src="${img(k, 900)}" alt=""></button>`).join('')}</div>` : ''}
        </div>

        <div class="buy">
          <div class="buy__top">
            <p class="eyebrow"><span class="diamond"></span>${occ ? esc(occ.name) + ' · ' : ''}${Z.arriveLine(p)}</p>
            <h1 class="h2">${esc(p.title)}</h1>
            ${p.reviews ? `<a class="rating-line" href="#reviews">${Z.stars(p.rating)}<span>${p.rating} · ${p.reviews} reviews</span></a>` : ''}
            <p class="muted">${esc(p.blurb)}</p>
            <div class="buy__price" data-price></div>
            <p class="afterpay" data-build="app" data-build-label="Afterpay on-site messaging app">or 4 payments of <span data-quarter></span> with Afterpay</p>
          </div>

          <div class="gsteps" data-note="5" data-build="custom" data-build-label="Gift steps: Intellect Gift Mode, always on for Zariva (card = line properties, date = cart attribute)">
            <div class="gstep" data-step="1"><span class="gstep__mark"></span><div class="gstep__head"><h3>The hamper</h3><span data-sum-1></span></div>${p.options.length ? optHTML() : `<p class="small muted">One size, as pictured.</p>`}</div>
            <div class="gstep" data-step="2" id="card" data-note="6"><span class="gstep__mark"></span><div class="gstep__head"><h3>The card</h3><span>Written in ink, by hand</span></div>
              <div class="notecard" aria-live="polite"><span data-p-to></span><span class="notecard__msg" data-p-msg></span><span class="notecard__from" data-p-from></span></div>
              <div class="fields-2"><div class="field"><label for="c-to">To</label><input class="input" id="c-to" maxlength="40" placeholder="Maa" value="${esc(state.to)}"></div><div class="field"><label for="c-from">From</label><input class="input" id="c-from" maxlength="40" placeholder="Anu" value="${esc(state.from)}"></div></div>
              <div class="field"><label for="c-msg">Message</label><textarea class="textarea" id="c-msg" maxlength="250" placeholder="Write it the way you’d say it.">${esc(state.msg)}</textarea><span class="counter"><span data-left>250</span> characters left</span></div>
              <label class="check"><input type="checkbox" data-nocard>Send it without a card</label>
            </div>
            <div class="gstep" data-step="3" data-note="7"><span class="gstep__mark"></span><div class="gstep__head"><h3>Arrival</h3><span data-sum-3></span></div>
              <div class="field"><label for="pc">Their postcode</label><div class="postcode"><input class="input num" id="pc" inputmode="numeric" maxlength="4" placeholder="2000" value="${esc(state.postcode)}"><button class="btn btn--line" type="button" data-pc style="min-height:48px;padding:0 20px">Check</button></div><p class="postcode-note" data-pc-note></p></div>
              <div class="field"><span class="lbl">Choose the day it arrives</span><div class="dates" role="radiogroup" aria-label="Arrival day" data-dates></div></div>
              <label class="check" data-build="custom" data-build-label="Cart attribute: leave prices off the packing slip"><input type="checkbox" data-hide ${state.hide ? 'checked' : ''}>Leave the price off the packing slip</label>
            </div>
          </div>

          <div class="buy__add" data-note="8">
            <button class="btn btn--plum btn--block" type="button" data-add></button>
            <a class="shoppay" href="checkout.html" data-shoppay data-build="native" data-build-label="Shopify dynamic checkout button">Buy with <b>Shop Pay</b></a>
          </div>
          <ul class="trust"><li>${I.pen}Your card is written by hand, never printed</li><li>${I.box}Packed in our Sydney studio the day it leaves</li><li>${I.truck}Free delivery over $150. Same-day in Sydney and Melbourne</li></ul>
        </div>
      </div>

      <section class="sec band" data-note="9" data-build="custom" data-build-label="What’s inside: product metaobject list (item, maker, region)">
        <div class="wrap split" style="align-items:start">
          <div style="display:grid;gap:20px"><p class="eyebrow"><span class="diamond"></span>What’s inside</p><h2 class="h2">${esc(p.description.split('. ')[0])}.</h2><p class="muted">${esc(p.description.split('. ').slice(1).join('. '))}</p>${p.dietary.length ? `<p class="diet">${p.dietary.map((d) => `<span>${esc(d)}</span>`).join('')}</p>` : ''}</div>
          <div><ul class="inside">${p.inside.map(([a, b]) => `<li><span>${esc(a)}</span><span>${esc(b)}</span></li>`).join('')}</ul>
            <div class="acc" style="margin-top:28px">
              <details><summary>Delivery and order-by dates</summary><div class="acc__body"><p>Order by 1pm AEST for dispatch the same weekday. Standard delivery is 2 business days to capital cities and 3 to 5 to regional areas. Same-day delivery in Sydney and Melbourne metro, for orders by 11am.</p><p>${Z.upcoming().slice(0, 2).map((x) => { const s = Z.momentState(x); return `${esc(x.name)}: order by ${Z.fmtLong(s.orderBy)}.`; }).join(' ')}</p></div></details>
              <details><summary>Keeping it fresh</summary><div class="acc__body"><p>Sweets keep for two weeks in a cool place. Anything perishable is packed with ice bricks between November and March.</p></div></details>
              ${p.alcohol ? '<details><summary>About the alcohol</summary><div class="acc__body"><p>Contains alcohol. The person receiving it must be 18 or over and show ID on delivery. Every hamper with a pour has an alcohol-free choice.</p></div></details>' : ''}
              <details><summary>Returns</summary><div class="acc__body"><p>Food can’t be returned, but if anything arrives damaged we’ll replace it. Send a photo within two days.</p></div></details>
            </div></div>
        </div>
      </section>

      <section class="sec" id="reviews" data-note="10" data-build="app" data-build-label="Reviews app widget (Judge.me or Okendo), styled to the theme">
        <div class="wrap split" style="align-items:start">
          <div style="display:grid;gap:16px;align-content:start"><p class="eyebrow"><span class="diamond"></span>Reviews</p><h2 class="h2">${p.reviews ? `${p.rating} out of 5, from ${p.reviews} people.` : 'New this season.'}</h2><p class="muted">${p.reviews ? 'Every review is from someone who sent or received it.' : 'Reviews appear here once the first hampers have arrived.'}</p></div>
          <div class="reviews">${(rv.length ? rv : D.reviews.slice(0, 3)).slice(0, 4).map((r) => `<article class="review">${Z.stars(r.rating)}<h4>${esc(r.title)}</h4><p>${esc(r.body)}</p><footer><span>${esc(r.name)}, ${esc(r.place)}</span>${r.verified ? '<span>· Verified</span>' : ''}${!rv.length ? `<span>· on ${esc(Z.product(r.product).title)}</span>` : ''}</footer></article>`).join('')}</div>
        </div>
      </section>

      <section class="sec" style="padding-top:0" data-build="native" data-build-label="Intellect product recommendations: same Moment">
        <div class="wrap"><div class="head"><div class="head__text"><p class="eyebrow"><span class="diamond"></span>${occ ? `Also for ${esc(occ.name)}` : 'Also sent'}</p><h2 class="h2">You might send these too.</h2></div></div><div class="grid">${rel.map(Z.card).join('')}</div></div>
      </section>

      <div class="buybar" data-buybar data-build="native" data-build-label="Intellect smart buy bar" data-build-pos="tr"><div class="wrap"><div class="buybar__img media">${pic(p.images[0], 900)}</div><div class="buybar__t"><b>${esc(p.title)}</b><span data-bb-sub></span></div><button class="btn btn--plum" type="button" data-add-bar></button></div></div>`;

    // ---- behaviour
    const priceNow = () => Z.sale(p, Z.priceFor(p, state.sel));
    const steps = () => {
      const done = [true, state.noCard || state.msg.trim().length > 0, !!state.date];
      let current = done.indexOf(false);
      $$('.gstep').forEach((el, i) => { el.classList.toggle('is-done', done[i]); el.classList.toggle('is-current', i === current); });
    };
    const drawPrice = () => {
      const now = priceNow(), was = Z.priceFor(p, state.sel);
      $('[data-price]').innerHTML = `<strong class="num">${money(now)}</strong>${now !== was ? `<s class="num">${money(was)}</s><small>Quiet Week</small>` : ''}<small>GST included</small>`;
      $('[data-quarter]').textContent = money(now / 4);
      $('[data-add]').innerHTML = `Add to bag <span class="sep"></span> <span class="price num">${money(now)}</span>`;
      $('[data-add-bar]').innerHTML = `Add to bag <span class="sep"></span> <span class="price num">${money(now)}</span>`;
      $('[data-sum-1]').textContent = Object.values(state.sel).join(' · ');
    };
    const drawCard = () => {
      const show = !state.noCard;
      $('.notecard').style.opacity = show ? 1 : 0.35;
      const faint = (el, text, on) => { el.textContent = text; el.classList.toggle('is-faint', !on); };
      faint($('[data-p-to]'), `Dear ${state.to || '…'},`, !!state.to);
      faint($('[data-p-msg]'), state.msg || 'Your message, in our handwriting.', !!state.msg);
      faint($('[data-p-from]'), `With love, ${state.from || '…'}`, !!state.from);
      $('[data-left]').textContent = 250 - state.msg.length;
    };
    const drawDates = () => {
      const ds = dayList();
      $('[data-dates]').innerHTML = ds.map((d) => {
        const v = Z.iso(d);
        const isM = os && Z.iso(Z.addDays(os.start, -1)) === v;
        return `<button type="button" class="date${isM ? ' date--moment' : ''}" role="radio" aria-checked="${state.date === v}" data-date="${v}"${isM ? ` title="The day before ${esc(occ.name)}"` : ''}><span>${Z.fmt(d).split(' ')[0]}</span><b class="num">${d.getDate()}</b><span>${Z.fmt(d).split(' ')[2]}</span></button>`;
      }).join('');
      const d = Z.parse(state.date);
      $('[data-sum-3]').textContent = Z.fmtLong(d);
      $('[data-bb-sub]').textContent = `Arrives ${Z.fmtLong(d)}`;
      const on = $('[data-dates] [aria-checked="true"]');
      on && on.scrollIntoView({ block: 'nearest', inline: 'center' });
    };
    const drawPostcode = () => {
      const pc = state.postcode;
      const note = $('[data-pc-note]');
      if (!/^\d{4}$/.test(pc)) { note.innerHTML = 'Delivery to every state and territory.'; return; }
      note.innerHTML = Z.isSameDay(pc) ? `<b>Same-day delivery available</b> to ${pc} for orders by 11am.` : `Standard delivery to ${pc}: from <b>${Z.fmtLong(Z.earliest(pc))}</b>.`;
    };
    drawPrice(); drawCard(); drawDates(); drawPostcode(); steps();

    main.addEventListener('click', (e) => {
      const o = e.target.closest('[data-opt]');
      if (o && o.getAttribute('aria-disabled') !== 'true') { state.sel[o.dataset.opt] = o.dataset.val; $$(`[data-opt="${CSS.escape(o.dataset.opt)}"]`).forEach((x) => x.setAttribute('aria-checked', String(x === o))); drawPrice(); }
      const t = e.target.closest('[data-thumb]');
      if (t) { const i = t.dataset.thumb; $$('[data-gimg]').forEach((im) => (im.style.opacity = im.dataset.gimg === i ? 1 : 0)); $$('[data-thumb]').forEach((b) => b.setAttribute('aria-current', String(b === t))); }
      const dt = e.target.closest('[data-date]');
      if (dt) { state.date = dt.dataset.date; drawDates(); steps(); }
      if (e.target.closest('[data-pc]')) { state.postcode = $('#pc').value.trim(); Z.store.set('zariva:postcode', state.postcode); if (!dayList().some((d) => Z.iso(d) === state.date)) state.date = defaultDate(); drawPostcode(); drawDates(); }
      if (e.target.closest('[data-add], [data-add-bar]')) add(false);
      if (e.target.closest('[data-shoppay]')) { e.preventDefault(); add(true); }
    });
    $('#pc').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('[data-pc]').click(); });
    const bindField = (sel, key) => $(sel).addEventListener('input', (e) => { state[key] = e.target.value; drawCard(); steps(); });
    bindField('#c-to', 'to'); bindField('#c-msg', 'msg'); bindField('#c-from', 'from');
    $('[data-nocard]').addEventListener('change', (e) => { state.noCard = e.target.checked; drawCard(); steps(); });
    $('[data-hide]').addEventListener('change', (e) => { state.hide = e.target.checked; });

    function add(toCheckout) {
      Z.gift.set({ card: { to: state.to, message: state.msg, from: state.from } });
      Z.cart.attrs({ date: state.date, hidePrices: state.hide });
      const props = state.noCard ? { Card: 'No card' } : { To: state.to, Message: state.msg, From: state.from };
      Z.addProduct(p, { sel: { ...state.sel }, props, date: state.date, silent: toCheckout });
      if (toCheckout) location.href = 'checkout.html';
    }
    // Buy bar: appears once the add button has scrolled away.
    const bar = $('[data-buybar]'), btn = $('[data-add]');
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => bar.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 }).observe(btn);
  }

  /* ================================================================ CART */
  function cartPage(main) {
    const draw = () => {
      const c = Z.cart.get(), sub = Z.cart.subtotal();
      if (!c.lines.length) {
        main.innerHTML = `<div class="wrap"><div class="page-head"><h1 class="h1">Your bag is empty.</h1><p class="lead">Start with the occasion, or with who it’s for.</p><div><a class="btn btn--plum" href="index.html#celebrate">Find a hamper</a></div></div></div>`;
        return;
      }
      // Enough days to include the date chosen on the hamper (for example the day before Diwali).
      const chosen = c.attrs.date ? Z.parse(c.attrs.date) : null;
      const ds = Z.arrivalDays(chosen ? Math.max(10, Z.days(Z.earliest(), chosen) + 4) : 10);
      const date = c.attrs.date && ds.some((d) => Z.iso(d) === c.attrs.date) ? c.attrs.date : Z.iso(ds[0]);
      main.innerHTML = `<div class="wrap"><div class="page-head" style="padding-bottom:0"><h1 class="h1">Your bag</h1></div></div>
      <div class="wrap cart-page">
        <div>
          <div data-note="3" data-build="native" data-build-label="Intellect cart page: gift lines show the card (line item properties)">${Z.rewardHTML(sub)}${c.lines.map((l) => Z.lineHTML(l, true)).join('')}${Z.addressNote(c.lines)}</div>
          <div class="bag-extras" data-note="4" data-build="native" data-build-label="Cart attributes: delivery date, packing slip; cart note">
            <h4>Arrival</h4><div class="dates" data-cdates>${ds.map((d) => `<button type="button" class="date" role="radio" aria-checked="${Z.iso(d) === date}" data-cdate="${Z.iso(d)}"><span>${Z.fmt(d).split(' ')[0]}</span><b class="num">${d.getDate()}</b><span>${Z.fmt(d).split(' ')[2]}</span></button>`).join('')}</div>
            <label class="check"><input type="checkbox" data-chide ${c.attrs.hidePrices ? 'checked' : ''}>Leave prices off the packing slip</label>
            <div class="field"><label for="note">A note for the studio (optional)</label><textarea class="textarea" id="note" placeholder="Leave it with the neighbour at number 12, please.">${esc(c.attrs.note || '')}</textarea></div>
          </div>
        </div>
        <aside class="cart-panel" data-note="5">
          <div class="bag-sum"><div class="bag-sum__row"><span>Subtotal</span><span class="num">${money(sub)}</span></div><div class="bag-sum__row"><span>Delivery</span><span>${sub >= D.delivery.freeOver ? 'Free' : 'At checkout'}</span></div><div class="bag-sum__row"><span>Arrives</span><span>${Z.fmtLong(Z.parse(date))}</span></div>
            <div class="rule" style="margin:8px 0"></div><div class="bag-sum__total"><span>Total</span><strong class="num">${money(sub)}</strong></div><p class="small muted">GST included. Discount codes at checkout.</p></div>
          <a class="btn btn--plum btn--block" href="checkout.html">Checkout</a>
          <p class="afterpay" data-build="app" data-build-label="Afterpay on-site messaging">Or 4 payments of ${money(sub / 4)} with Afterpay.</p>
          <p class="small muted">Checkout is Shopify’s, with Shop Pay, Apple Pay, Google Pay, PayPal and Afterpay.</p>
        </aside>
      </div>`;
      Z.cart.attrs({ date });
      window.PROTO && PROTO.refresh();
    };
    draw();
    Z.bindBag(main);
    document.addEventListener('zariva:bag', draw);
    main.addEventListener('click', (e) => { const d = e.target.closest('[data-cdate]'); if (d) { Z.cart.attrs({ date: d.dataset.cdate }); draw(); } });
    main.addEventListener('change', (e) => { if (e.target.matches('[data-chide]')) Z.cart.attrs({ hidePrices: e.target.checked }); });
    main.addEventListener('input', (e) => { if (e.target.id === 'note') { const c = Z.cart.get(); c.attrs.note = e.target.value; Z.store.set('zariva:cart', c); } });
  }

  /* ================================================================ BUILD YOUR OWN */
  function build(main) {
    const state = { box: 'classic', items: [], group: 'All', to: '', msg: Z.greeting(Z.giftMoment()), from: '' };
    const box = () => D.boxes.find((b) => b.id === state.box);
    const groups = ['All', ...new Set(D.buildItems.map((i) => i.group))];
    main.innerHTML = `<div class="wrap"><div class="page-head" data-note="3"><p class="eyebrow"><span class="diamond"></span>Build your own</p><h1 class="h1">Their favourite things, in one box.</h1><p class="lead">Choose a box, fill it with what they love, and we’ll pack it, write the card and send it.</p></div></div>
      <div class="wrap byo-page">
        <div style="display:grid;gap:36px">
          <div style="display:grid;gap:14px" data-note="4" data-build="native" data-build-label="Intellect build-a-box: box sizes as variants of a bundle product"><p class="eyebrow">1 · Choose a box</p><div class="box-pick">${D.boxes.map((b) => `<button type="button" class="box-opt" role="radio" aria-checked="${b.id === state.box}" data-box="${b.id}"><b>${b.name}</b><span>${b.slots} things · box ${money(b.base)}</span></button>`).join('')}</div><p class="small muted" data-box-note></p></div>
          <div style="display:grid;gap:18px" data-note="5" data-build="native" data-build-label="Intellect build-a-box: items from a collection, added as one bundle"><div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap"><p class="eyebrow">2 · Fill it</p><div style="display:flex;gap:8px;flex-wrap:wrap">${groups.map((g) => `<button class="chip" type="button" data-group="${g}" aria-pressed="${g === 'All'}">${g}</button>`).join('')}</div></div><div class="items" data-items></div></div>
        </div>
        <aside class="boxview" data-note="6">
          <div class="boxview__arch"><div class="boxview__slots" data-slots></div><span class="rule-base"></span></div>
          <div class="bag-sum"><div class="bag-sum__row"><b style="font-weight:500" data-box-name></b><span class="num" data-box-price></span></div><ol data-box-list></ol></div>
          <div class="rule"></div>
          <p class="eyebrow">3 · The card</p>
          <div class="fields-2"><input class="input" placeholder="To" data-bt aria-label="To"><input class="input" placeholder="From" data-bf aria-label="From"></div>
          <textarea class="textarea" style="min-height:72px" data-bm aria-label="Message">${esc(state.msg)}</textarea>
          <button class="btn btn--plum btn--block" type="button" data-badd disabled></button>
          <p class="small muted" data-bhint></p>
        </aside>
      </div>`;
    const draw = () => {
      const b = box();
      $$('[data-box]').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.box === state.box)));
      $('[data-box-note]').textContent = b.note + '.';
      state.items = state.items.slice(0, b.slots);
      const chosen = state.items.map((id) => D.buildItems.find((i) => i.id === id));
      const total = b.base + chosen.reduce((a, i) => a + i.price, 0);
      $('[data-items]').innerHTML = D.buildItems.filter((i) => state.group === 'All' || i.group === state.group).map((i) => `<button type="button" class="item rv is-in" aria-pressed="${state.items.includes(i.id)}" data-item="${i.id}"><span class="media" style="position:relative">${pic(i.image, 900)}<span class="item__add">${I.plus}</span></span><b>${esc(i.name)}</b><span class="num">${money(i.price)}${i.alcohol ? ' · 18+' : ''}</span></button>`).join('');
      const slots = $('[data-slots]');
      slots.style.setProperty('--cols', b.slots > 5 ? 4 : b.slots);
      slots.innerHTML = Array.from({ length: b.slots }, (_, k) => `<div class="slot">${chosen[k] ? pic(chosen[k].image, 900) : '<span class="diamond" style="background:var(--line)"></span>'}</div>`).join('');
      $('[data-box-name]').textContent = `${b.name} box`;
      $('[data-box-price]').textContent = money(total);
      $('[data-box-list]').innerHTML = chosen.map((i) => `<li><span>${esc(i.name)}</span><span class="num">${money(i.price)}</span></li>`).join('');
      const left = b.slots - chosen.length;
      const btn = $('[data-badd]');
      btn.disabled = chosen.length === 0;
      btn.innerHTML = `Add to bag <span class="sep"></span> <span class="price num">${money(total)}</span>`;
      $('[data-bhint]').textContent = left > 0 ? `Room for ${left} more.` : 'Your box is full.';
    };
    draw();
    main.addEventListener('click', (e) => {
      const bx = e.target.closest('[data-box]'); if (bx) { state.box = bx.dataset.box; draw(); }
      const gr = e.target.closest('[data-group]'); if (gr) { state.group = gr.dataset.group; $$('[data-group]').forEach((x) => x.setAttribute('aria-pressed', String(x === gr))); draw(); }
      const it = e.target.closest('[data-item]');
      if (it) {
        const id = it.dataset.item;
        if (state.items.includes(id)) state.items = state.items.filter((x) => x !== id);
        else if (state.items.length < box().slots) state.items.push(id);
        else Z.toast('Your box is full. Choose a larger box, or take something out.');
        draw();
      }
      if (e.target.closest('[data-badd]')) {
        const b = box(), chosen = state.items.map((id) => D.buildItems.find((i) => i.id === id));
        Z.cart.add({ handle: 'build-your-own', title: `Your own ${b.name} box`, image: chosen[0].image, opts: { Box: b.name }, unit: b.base + chosen.reduce((a, i) => a + i.price, 0), qty: 1, props: { To: $('[data-bt]').value, Message: $('[data-bm]').value, From: $('[data-bf]').value }, build: { box: b.id, items: chosen.map((i) => i.name) }, kind: 'build' });
        Z.openBag();
      }
    });
  }

  /* ================================================================ CORPORATE */
  function corporate(main) {
    const list = D.products.filter((p) => p.occasions.includes('corporate')).slice(0, 4);
    main.innerHTML = `
      <section class="wrap split" style="padding-block:40px var(--sec)" data-note="1" data-build="native" data-build-label="Intellect image-with-text">
        <div style="display:grid;gap:20px"><p class="eyebrow"><span class="diamond"></span>Corporate gifting</p><h1 class="h1">Gifts that make a client <em>call to say thanks</em>.</h1><p class="lead">From ten boxes to a thousand. Your logo on the ribbon, each hamper sent to its own door with its own card, one invoice at the end.</p><div class="moment__actions"><a class="btn btn--plum" href="#enquire">Ask for a proposal</a><a class="link-arrow" href="concierge.html">Message the concierge ${I.arrow}</a></div></div>
        <div class="media ratio-45">${pic('c-journal')}</div>
      </section>
      <section class="sec band" data-note="2" data-build="custom" data-build-label="Tiered pricing: Shopify volume discounts (automatic discount by quantity)">
        <div class="wrap" style="display:grid;gap:32px"><div class="head" style="margin:0"><div class="head__text"><p class="eyebrow">Pricing</p><h2 class="h2">The more you send, the less each one costs.</h2></div></div>
          <div class="tiers"><div><span>10 to 49 boxes</span><b>5%</b><span>off every hamper</span></div><div><span>50 to 199</span><b>10%</b><span>off every hamper</span></div><div><span>200 and over</span><b>Quote</b><span>within one business day</span></div></div>
        </div>
      </section>
      <section class="sec" data-note="3">
        <div class="wrap split" style="align-items:start">
          <div style="display:grid;gap:16px"><p class="eyebrow">How it works</p><h2 class="h2">Three emails, and it’s done.</h2></div>
          <dl class="kv"><div><dt>1. Tell us</dt><dd>How many, the budget per gift, the date, and whether you’d like your logo on the ribbon.</dd></div><div><dt>2. We propose</dt><dd>Three hampers within one business day, with a photo of each and the price per box.</dd></div><div><dt>3. Send the list</dt><dd>Names, addresses and card messages in one spreadsheet. We pack, write every card and send each one.</dd></div><div><dt>Then</dt><dd>One invoice, and a delivery report so you know every box arrived.</dd></div></dl>
        </div>
      </section>
      <section class="sec" style="padding-top:0" data-build="native" data-build-label="Intellect featured collection: Corporate">
        <div class="wrap"><div class="head"><div class="head__text"><p class="eyebrow"><span class="diamond"></span>Chosen most by teams</p><h2 class="h2">A place to start.</h2></div><a class="link-arrow" href="collection.html?c=corporate">All corporate hampers ${I.arrow}</a></div><div class="grid">${list.map(Z.card).join('')}</div></div>
      </section>
      <section class="sec band" id="enquire" data-note="4" data-build="native" data-build-label="Intellect contact form (custom fields). Logo and list are emailed after the reply">
        <div class="wrap split" style="align-items:start">
          <div style="display:grid;gap:16px"><p class="eyebrow">Ask for a proposal</p><h2 class="h2">We’ll reply within one business day.</h2><p class="muted">Send your logo and the delivery list after we reply, so nothing sensitive sits in a web form.</p></div>
          <form class="form" onsubmit="event.preventDefault();this.innerHTML='<p class=&quot;h3&quot;>Thank you.</p><p class=&quot;muted&quot;>We’ll send three ideas by tomorrow.</p>'">
            <div class="fields-2"><div class="field"><label for="co-n">Your name</label><input class="input" id="co-n" required></div><div class="field"><label for="co-c">Company</label><input class="input" id="co-c" required></div></div>
            <div class="field"><label for="co-e">Email</label><input class="input" id="co-e" type="email" required></div>
            <div class="fields-2"><div class="field"><label for="co-q">How many</label><select class="select" id="co-q"><option>10 to 49</option><option>50 to 199</option><option>200 or more</option></select></div><div class="field"><label for="co-b">Budget per gift</label><select class="select" id="co-b"><option>Under $100</option><option>$100 to $200</option><option>Over $200</option></select></div></div>
            <div class="field"><label for="co-d">Arrive by</label><input class="input" id="co-d" type="date"></div>
            <div class="field"><label for="co-m">Anything else</label><textarea class="textarea" id="co-m" placeholder="Logo on the ribbon, alcohol-free, dietary needs…"></textarea></div>
            <button class="btn btn--plum" type="submit">Send</button>
          </form>
        </div>
      </section>`;
  }

  /* ================================================================ STORY */
  function story(main) {
    const states = [['NSW', 14, 'Harris Park, Byron Bay, Wollongong'], ['VIC', 11, 'Brunswick, Dandenong, Rutherglen'], ['SA', 6, 'Adelaide Hills, Barossa, Riverland'], ['TAS', 4, 'Leatherwood country, Hobart'], ['QLD', 3, 'Sunshine Coast hinterland'], ['WA', 2, 'Margaret River'], ['ACT', 1, 'Canberra'], ['NT', 1, 'Darwin']];
    main.innerHTML = `
      <section class="wrap split" style="padding-block:48px var(--sec)" data-note="1" data-build="todo" data-build-label="Founder’s story: replace with the client’s own words">
        <div style="display:grid;gap:20px"><p class="eyebrow"><span class="diamond"></span>Our studio</p><h1 class="h1">Gifting, <em>woven with tradition</em>.</h1><p class="lead">We started Zariva for the families who live far from home: the Diwali that can’t be shared in person, the birthday in another city, the new baby met over video call.</p><p class="muted">Every hamper is packed by hand in our Sydney studio, with things made by people we know, and a card we write ourselves.</p></div>
        <div class="arch arch-open" style="aspect-ratio:4/5">${pic('pack-woman')}</div>
      </section>
      <section class="sec band" data-note="2" data-build="native" data-build-label="Intellect rich text + features (no images)">
        <div class="wrap" style="display:grid;gap:32px"><div class="head" style="margin:0"><div class="head__text"><p class="eyebrow">Our makers</p><h2 class="h2">More than 40 makers, from every state.</h2></div></div>
          <ul class="makers">${states.map(([s, n, w]) => `<li><b>${n}</b><span>${s} · ${w}</span></li>`).join('')}</ul></div>
      </section>
      <section class="sec" data-note="3">
        <div class="wrap split split--rev">
          <div style="display:grid;gap:18px"><p class="eyebrow">The arch and the diamond</p><h2 class="h2">A doorway, and the gift inside it.</h2><p class="muted">Our mark is an Indian doorway holding one gold diamond. Every hamper is a visit you couldn’t make in person, so we treat it like one: something brought to the door, carefully.</p></div>
          <div class="media ratio-45">${pic('card-writing')}</div>
        </div>
      </section>`;
  }

  /* ================================================================ CONCIERGE */
  function concierge(main) {
    main.innerHTML = `
      <section class="wrap split" style="padding-block:48px var(--sec)" data-note="1" data-build="custom" data-build-label="Concierge: WhatsApp link (no app) + Intellect contact form">
        <div style="display:grid;gap:20px"><p class="eyebrow"><span class="diamond"></span>Gifting concierge</p><h1 class="h1">Tell us who. We’ll take it <em>from there</em>.</h1><p class="lead">Message the studio with who it’s for, the occasion, the day and roughly how much. We’ll suggest three hampers within the hour, write the card and send it.</p>
          <div class="moment__actions"><a class="btn btn--plum" href="#" data-build="todo" data-build-label="WhatsApp Business number">Message on WhatsApp</a><a class="link-arrow" href="#write">Or write to us ${I.arrow}</a></div>
          <p class="small muted">Monday to Saturday, 9am to 6pm AEST.</p></div>
        <div class="arch arch-open" style="aspect-ratio:4/5">${pic('card-hand')}</div>
      </section>
      <section class="sec band" id="write" data-note="2">
        <div class="wrap split" style="align-items:start">
          <dl class="kv" data-build="todo" data-build-label="Real phone, email and studio address"><div><dt>Phone</dt><dd>(02) 5550 1234</dd></div><div><dt>Email</dt><dd>studio@houseofzariva.com.au</dd></div><div><dt>Studio</dt><dd>Alexandria, Sydney. Click and collect by appointment.</dd></div><div><dt>Corporate</dt><dd><a class="link" href="corporate.html">Ask for a proposal</a></dd></div></dl>
          <form class="form" onsubmit="event.preventDefault();this.innerHTML='<p class=&quot;h3&quot;>Thank you.</p><p class=&quot;muted&quot;>We’ll reply within the hour, during studio hours.</p>'">
            <div class="fields-2"><div class="field"><label for="cn">Name</label><input class="input" id="cn" required></div><div class="field"><label for="ce">Email</label><input class="input" id="ce" type="email" required></div></div>
            <div class="field"><label for="cm">Who it’s for, the occasion and the day</label><textarea class="textarea" id="cm" required placeholder="My mother-in-law in Perth, for Diwali, around $150. She loves chai."></textarea></div>
            <button class="btn btn--plum" type="submit">Send</button>
          </form>
        </div>
      </section>`;
  }

  /* ================================================================ HELP */
  function help(main) {
    const up = Z.upcoming().slice(0, 5);
    main.innerHTML = `
      <div class="wrap"><div class="page-head" data-note="1"><p class="eyebrow"><span class="diamond"></span>Delivery and help</p><h1 class="h1">When it leaves, and when it arrives.</h1><p class="lead">Order by 1pm AEST on a weekday and your hamper leaves the studio the same day.</p></div></div>
      <section class="wrap" style="padding-bottom:var(--sec);display:grid;gap:48px">
        <dl class="kv" data-build="native" data-build-label="Intellect rich text; rates are Shopify shipping and local delivery settings" data-build-pos="tr"><div><dt>Standard</dt><dd>$12, free over $150. 2 business days to capital cities, 3 to 5 to regional areas.</dd></div><div><dt>Express</dt><dd>$18. Next business day to capital cities.</dd></div><div><dt>Same-day</dt><dd>$25. Sydney and Melbourne metro, for orders by 11am.</dd></div><div><dt>Click and collect</dt><dd>Free, from the Alexandria studio, by appointment.</dd></div></dl>
        <div data-note="2" data-build="custom" data-build-label="Order-by dates, generated from the Moment metaobjects">
          <p class="eyebrow" style="margin-bottom:14px">Order-by dates</p>
          <dl class="kv">${up.map((m) => { const s = Z.momentState(m); return `<div><dt>${esc(m.name)}, ${Z.fmtLong(s.start)}</dt><dd>${m.kind === 'sale' ? `Runs until ${Z.fmtLong(s.end)}.` : `Order by ${Z.fmtLong(s.orderBy)} for standard delivery. Same-day in Sydney and Melbourne until ${Z.fmtLong(Z.addDays(s.start, -1))}.`}</dd></div>`; }).join('')}</dl>
        </div>
        <div id="faq" data-note="3" data-build="native" data-build-label="Intellect FAQ section (adds FAQ structured data)">
          <p class="eyebrow" style="margin-bottom:14px">Questions</p>
          <div class="acc">
            <details open><summary>Can I choose the day it arrives?</summary><div class="acc__body"><p>Yes. Choose it on the hamper, or change it in your bag. We dispatch so it arrives on that day.</p></div></details>
            <details><summary>Who writes the card?</summary><div class="acc__body"><p>We do, by hand, in ink. You write the message; we never print it.</p></div></details>
            <details><summary>Can I send to more than one address?</summary><div class="acc__body"><p>Each order goes to one address. For several people, check out once per address, or ask the concierge to send them all from one list.</p></div></details>
            <details><summary>Will the price show?</summary><div class="acc__body"><p>Not if you tick “Leave the price off the packing slip”. The card and the box never show it.</p></div></details>
            <details><summary>What about alcohol?</summary><div class="acc__body"><p>Hampers with alcohol are delivered to someone 18 or over, with ID. Every one has an alcohol-free choice.</p></div></details>
          </div>
        </div>
      </section>`;
  }

  /* ================================================================ JOURNAL + ARTICLE */
  function journal(main) {
    const [first, ...rest] = D.journal;
    main.innerHTML = `
      <div class="wrap"><div class="page-head"><p class="eyebrow"><span class="diamond"></span>Journal</p><h1 class="h1">Notes on giving well.</h1></div></div>
      <section class="wrap" style="padding-bottom:var(--sec)" data-note="1" data-build="native" data-build-label="Intellect blog: newest post as the lead story, reading time">
        <a class="split rv" href="article.html?a=${first.handle}" style="margin-bottom:56px"><div class="media ratio-32">${pic(first.image)}</div><div style="display:grid;gap:14px"><p class="eyebrow">${esc(first.tag)} · ${Z.fmtLong(Z.parse(first.date))} · 4 min read</p><h2 class="h2">${esc(first.title)}</h2><p class="muted">${esc(first.excerpt)}</p><span class="link-arrow">Read ${I.arrow}</span></div></a>
        <div class="grid grid--3">${rest.map((a, i) => `<a class="card rv" style="--i:${i}" href="article.html?a=${a.handle}"><div class="media ratio-32">${pic(a.image, 900)}</div><p class="eyebrow">${esc(a.tag)}</p><h3 class="card-title" style="font-size:1.5rem">${esc(a.title)}</h3><p class="small muted">${esc(a.excerpt)}</p></a>`).join('')}</div>
      </section>`;
  }
  function article(main) {
    const a = D.journal.find((x) => x.handle === Z.qs.get('a')) || D.journal[0];
    const prods = a.products.map(Z.product).filter(Boolean);
    main.innerHTML = `
      <article>
        <div class="wrap"><div class="page-head" style="margin-inline:auto;text-align:center;justify-items:center"><p class="eyebrow"><span class="diamond"></span>${esc(a.tag)} · ${Z.fmtLong(Z.parse(a.date))} · 4 min read</p><h1 class="h1">${esc(a.title)}</h1><p class="lead">${esc(a.excerpt)}</p></div></div>
        <div class="wrap"><div class="media ratio-32" style="max-height:640px">${pic(a.image)}</div></div>
        <div class="wrap" style="padding-block:48px"><div class="prose" style="margin-inline:auto" data-build="todo" data-build-label="Article copy: sample text, to be written with the client">
          <p>The best gifts arrive at the right moment. For the occasions that matter most to families far from home, timing is half the gift.</p>
          <h2>Start with the day</h2><p>Work back from the day itself. For the festivals, we publish order-by dates in the <a class="link" href="help.html">delivery guide</a> and on every hamper, so you’re never guessing.</p>
          <h2>Then the person</h2><p>Think about how they’ll spend the day. Something to share across a table, or something just for them. The card matters more than the size of the box.</p>
          <p><b>The short version:</b> choose early, write the card in your own words, and let us worry about the rest.</p>
        </div></div>
      </article>
      <section class="sec band" data-note="1" data-build="native" data-build-label="Intellect article: Shop the story (blog post metafield custom.products)">
        <div class="wrap"><div class="head"><div class="head__text"><p class="eyebrow"><span class="diamond"></span>Shop the story</p><h2 class="h2">In this piece.</h2></div></div><div class="grid">${prods.map(Z.card).join('')}</div></div>
      </section>`;
  }

  /* ================================================================ SEARCH, ACCOUNT, 404 */
  function search(main) {
    const q = (Z.qs.get('q') || '').trim();
    const hits = D.products.filter((p) => (p.title + ' ' + p.blurb + ' ' + p.inside.map((x) => x.join(' ')).join(' ')).toLowerCase().includes(q.toLowerCase()));
    main.innerHTML = `<div class="wrap"><div class="page-head"><p class="eyebrow">Search</p><h1 class="h1">${q ? `“${esc(q)}”` : 'Search'}</h1><p class="lead">${hits.length} ${hits.length === 1 ? 'result' : 'results'}</p></div></div>
      <section class="wrap" style="padding-bottom:var(--sec)" data-note="1" data-build="native" data-build-label="Intellect search page + predictive search"><div class="grid">${hits.map(Z.card).join('')}</div></section>`;
  }
  function account(main) {
    main.innerHTML = `<div class="wrap" style="max-width:520px"><div class="page-head" data-note="1" data-build="native" data-build-label="Shopify customer accounts (one-time code, no password)"><p class="eyebrow"><span class="diamond"></span>Your account</p><h1 class="h1">Sign in.</h1><p class="lead">We’ll email you a six-digit code. No password to remember.</p>
      <form class="form" onsubmit="event.preventDefault();this.innerHTML='<p class=&quot;muted&quot;>We’ve sent a code to your email. (In the live store, Shopify handles this screen.)</p>'"><div class="field"><label for="ae">Email</label><input class="input" id="ae" type="email" required></div><button class="btn btn--plum" type="submit">Send code</button></form>
      <p class="small muted">Your orders, saved addresses and the cards you’ve sent live here.</p></div></div>`;
  }
  function notFound(main) {
    main.innerHTML = `<div class="wrap"><div class="page-head" style="padding-block:96px"><p class="eyebrow"><span class="diamond"></span>404</p><h1 class="h1">This door doesn’t open.</h1><p class="lead">The page has moved, or never existed.</p><div class="moment__actions"><a class="btn btn--plum" href="index.html">Back to the studio</a><a class="link-arrow" href="collection.html?c=all">Every hamper ${I.arrow}</a></div></div></div>`;
  }

  /* ---------- Shared clicks: a moment or a person chosen anywhere is carried on ---------- */
  document.addEventListener('click', (e) => {
    const m = e.target.closest('[data-set-moment]');
    if (m) Z.gift.set({ moment: m.dataset.setMoment });
    const f = e.target.closest('[data-set-for]');
    if (f) Z.gift.set({ for: f.dataset.setFor });
  });

  const PAGES = { home, collection, product, cart: cartPage, build, corporate, story, concierge, help, journal, article, search, account, '404': notFound };
  if (PAGES[page]) Z.boot(PAGES[page]);
})();
