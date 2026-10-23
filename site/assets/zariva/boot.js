/* House of Zariva prototype: builds each page from Intellect's section templates, then starts the
   theme's own JavaScript, exactly as a Shopify page would load it. */
import './shopify-mock.js';
import * as C from './catalog.js';
import * as R from './render.js';
import { cartJSON, collectionBase, collectionState, collectionUrl } from './shopify-mock.js';

const page = document.body.dataset.page;
// Inside the presentation, an empty bag gets one sample gift so the bag and checkout can be reviewed.
(() => {
  if (window.parent === window || !['cart', 'checkout'].includes(page) && location.hash !== '#bag') return;
  let s = null; try { s = JSON.parse(localStorage.getItem('zariva:shopify-cart')); } catch (e) {}
  if (s && s.lines && s.lines.length) return;
  const diya = C.product('the-diya-hamper'), wrapP = C.product('gift-wrap'), posy = C.product('item-dried-native-posy');
  const lines = [
    { id: diya.variants[1].id, quantity: 1, properties: { To: 'Maa', From: 'Anu', Message: 'Happy Diwali. Light the first diya for me.' } },
    { id: wrapP.variants[0].id, quantity: 1, properties: { _wrap_for: diya.title } },
  ];
  try { localStorage.setItem('zariva:shopify-cart', JSON.stringify({ lines, note: '', attributes: { Gift: 'Yes', 'Hide prices': 'Yes' } })); } catch (e) {}
})();
const q = new URLSearchParams(location.search);

// Seasonal moment, as Intellect's moment snippet sets it up: the presentation's Christmas switch turns it on.
if (C.festive()) {
  document.documentElement.dataset.moment = C.festive();
  document.documentElement.dataset.momentLevel = 'festive';
  window.Theme = window.Theme || {};
  window.Theme.moment = { name: C.festive(), effect: true };
}
const wrap = (id, cls, html) => `<div id="shopify-section-${id}" class="shopify-section ${cls}">${html}</div>`;

/* ---------- Pages: a list of sections, as a JSON template would be ---------- */
function home() {
  const m = C.lead();
  const up = C.upcoming();
  const slides = [];
  if (m) {
    const s = C.momentState(m);
    slides.push({ image: m.image, caption: `${m.name} · ${m.kind === 'sale' ? (s.active ? `until ${C.fmtLong(s.end)}` : `from ${C.fmtLong(s.start)}`) : C.fmtLong(s.start)}`, heading: m.headline, text: s.orderable && m.kind !== 'sale' ? `Order by ${C.fmtLong(s.orderBy)} for delivery Australia-wide.` : m.blurb, label: m.kind === 'sale' ? 'See the Quiet Week' : `Send for ${m.name}`, link: `collection.html?c=${m.id}`, overlay: 0.35, note: 3 });
  } else {
    slides.push({ image: 'exchange', caption: 'Hampers, packed by hand in Sydney', heading: 'For the people <em>worth the effort</em>', text: 'Every hamper wrapped by hand, with a note written in ink.', label: 'Find their hamper', link: 'collection.html?c=all', overlay: 0.25 });
  }
  if (m) slides.push({ image: 'exchange', caption: 'Hampers, packed by hand in Sydney', heading: 'For the people <em>worth the effort</em>', text: 'Every hamper wrapped by hand, with a note written in ink.', label: 'Find their hamper', link: 'collection.html?c=all', overlay: 0.25 });
  slides.push({ image: 'crate', caption: 'Build your own', heading: 'Their favourite things, <em>in one box</em>', text: 'Choose a box, fill it, and we wrap it and write the note.', label: 'Build a box', link: 'build.html', overlay: 0.3 });

  // Shop by occasion: Intellect Collection list. The dated occasions come first, in date order, then the ones for any day.
  const TILE = { 'karva-chauth': 'd-marigold', diwali: 'd-laddoo-diya', 'quiet-week': 'basket-linen', christmas: 'x-cookie-box-pine', valentines: 'h-bouquet-box', 'mothers-day': 'open-woman', 'fathers-day': 'm-whisky-bottle', birthdays: 'hero-open', 'new-baby': 'b-clothes-basket', 'thank-you': 'h-candle-light', corporate: 'c-choc-gold' };
  const dated = up.slice(0, 4);
  const tiles = [...dated, ...C.always].slice(0, 8).map((x) => {
    const s = x.date ? C.momentState(x) : null;
    return { id: x.id, title: x.name, image: TILE[x.id] || x.image, href: `collection.html?c=${x.id}`, note: !s ? 'Any day' : x.kind === 'sale' ? `${C.fmtShort(s.start)} – ${C.fmtShort(s.end)}` : C.fmtShort(s.start) };
  });

  // The edits: one banner per collection, with its hampers underneath. Occasions within 50 days lead, then the ones for any day.
  const BANNER = { 'karva-chauth': 'd-row', diwali: 'd-rangoli', 'quiet-week': 'ribbon', christmas: 'wrap-hands', valentines: 'w-pink-seal', 'mothers-day': 'h-skincare-wood', 'fathers-day': 'm-whisky-glasses', birthdays: 'h-picnic', 'new-baby': 'b-newborn', 'thank-you': 'card-writing', corporate: 'c-choc-open' };
  let soon = up.filter((x) => { const s = C.momentState(x); return x.kind === 'sale' ? s.active || s.toDate <= 10 : s.toDate <= 50; });
  if (m && m.id === C.festive()) soon = [m, ...soon.filter((x) => x !== m)];
  soon = soon.slice(0, 2);
  const edits = [...soon, ...['birthdays', 'corporate', 'new-baby', 'thank-you'].map(C.occasion)].slice(0, 4);
  const edit = (x, i) => {
    const s = x.date ? C.momentState(x) : null;
    const caption = !s ? 'Any day' : x.kind === 'sale' ? `${C.fmtLong(s.start)} – ${C.fmtLong(s.end)}` : `${C.fmtLong(s.start)}${s.orderable ? ` · Order by ${C.fmtShort(s.orderBy)}` : ''}`;
    const link = x.id === 'corporate' ? 'corporate.html' : `collection.html?c=${x.id}`;
    return R.banner(`edit-${x.id}`, { image: BANNER[x.id] || x.image, caption, heading: R.esc(x.name), text: x.line || x.blurb, link, position: i % 2 ? 'bottom-right' : 'bottom-left' })
      + R.featured(`edit-${x.id}-list`, { list: C.inOccasion(x.id).slice(0, 6), carousel: true, spacing: 'sp-t-small sp-b-default' })
      + (x.id === 'corporate' ? R.press('clients', { caption: 'Sent for teams at', items: [
        { name: 'Harbourline Legal', quote: '“Two hundred clients, two hundred addresses, one invoice. Every note was handwritten.”' },
        { name: 'Wattle & Co', quote: '“Our team still talks about the Diwali boxes.”' },
        { name: 'Northgate Health', quote: '“Booked on a Tuesday, on every desk by Friday.”' },
        { name: 'Studio Ferrier', quote: '“The only client gift that got thank-you emails back.”' },
      ] }) : '');
  };
  const hampers = C.hampers();
  const band = (lo, hi) => hampers.filter((p) => p.priceMin >= lo * 100 && (!hi || p.priceMin <= hi * 100)).length;
  const reviews = ['the-diya-hamper', 'birthday-bloom', 'the-boardroom-box'].map((h) => C.reviews.find((r) => r.product === h)).filter(Boolean);
  return [
    R.slideshow(slides),
    R.features('trust', { items: [
      { icon: 'truck', title: 'Leaves the same day', text: 'Order by 1pm AEST on a weekday. Delivered Australia-wide.' },
      { icon: 'gift', title: 'Wrapped by hand', text: 'In our Sydney studio, with your note written in ink.' },
      { icon: 'star', title: `Rated ${C.reviewStats.average} by ${C.reviewStats.count.toLocaleString('en-AU')} senders`, text: 'Verified reviews from people who sent a hamper.' },
      { icon: 'lock', title: 'Secure checkout', text: 'Shop Pay, Apple Pay, Afterpay and every major card.' },
    ] }),
    R.collectionTiles('occasions', { heading: 'Shop by occasion', tiles }),
    R.budgetRow('budget', { heading: 'Shop by budget', links: [
      { label: 'Under $100', href: 'collection.html?c=all&filter.v.price.lte=99', count: band(0, 99) },
      { label: '$100 – $150', href: 'collection.html?c=all&filter.v.price.gte=100&filter.v.price.lte=150', count: band(100, 150) },
      { label: '$150+', href: 'collection.html?c=all&filter.v.price.gte=150', count: band(150) },
    ] }),
    ...edits.map(edit),
    R.testimonials('reviews', { caption: 'Reviews', heading: 'In their words', score: String(C.reviewStats.average), scoreLabel: `from ${C.reviewStats.count.toLocaleString('en-AU')} reviews`, items: reviews }),
  ].join('');
}

function collection() {
  const base = collectionBase(q);
  const m = C.occasion(q.get('c'));
  const who = C.recipients.find((r) => r.id === q.get('for'));
  let hero;
  if (m && m.date) { const s = C.momentState(m); hero = { caption: m.kind === 'sale' ? `${C.fmtLong(s.start)} – ${C.fmtLong(s.end)}` : `${C.fmtLong(s.start)}${s.orderable ? ` · Order by ${C.fmtLong(s.orderBy)}` : ''}`, title: m.name, text: m.blurb }; }
  else if (m) hero = { caption: 'Any day', title: m.name, text: m.line };
  else if (who) hero = { caption: 'Who it’s for', title: who.name, text: '' };
  else hero = { caption: 'Every occasion', title: 'All hampers', text: 'Each one wrapped by hand in our Sydney studio, with a note written in ink.' };
  document.title = `${hero.title} | House of Zariva`;
  return R.collectionHero(hero) + R.mainCollection(base, collectionState(q), collectionUrl(q));
}

function product() {
  const p = C.product(q.get('p')) || C.product('the-diya-hamper');
  document.title = `${p.title} | House of Zariva`;
  const m = C.sendingFor(p);
  const more = C.hampers().filter((x) => x.handle !== p.handle && (m ? x.occasions.includes(m.id) : x.best)).slice(0, 4);
  return wrap('product-main', 'section-main-product', R.mainProduct(p)) + R.featured('related', { caption: m ? `Also for ${m.name}` : 'Also sent', heading: 'You might send these too', list: more });
}

const cart = () => wrap('main-cart', 'section-main-cart', R.mainCart(cartJSON()));

function search() {
  const term = (q.get('q') || '').trim().toLowerCase();
  const list = C.hampers().filter((p) => (p.title + ' ' + p.blurb + ' ' + p.inside.map((x) => x.join(' ')).join(' ')).toLowerCase().includes(term));
  return R.collectionHero({ caption: 'Search', title: term ? `“${q.get('q')}”` : 'Search', text: `${list.length} ${list.length === 1 ? 'result' : 'results'}` }) + R.featured('results', { caption: '', heading: '', list });
}

function build() {
  return R.buildABox({ caption: 'Build your own', heading: 'Their favourite things, <em>in one box</em>', text: 'Choose a size, fill it with what they love. We wrap it and write the note.',
    items: C.products.filter((p) => p.type === 'item'), box: C.product('keepsake-box'), sizes: [[3, 0], [5, 5], [8, 10]], name: 'Zariva box', note: 'Each box is wrapped by hand in our Sydney studio.' });
}
function corporate() {
  return [
    R.split('corp-hero', { image: 'c-journal', caption: 'Corporate gifting', heading: 'Gifts that make a client <em>call to say thanks</em>', text: '<p>From ten boxes to a thousand. Your logo on the ribbon, each hamper to its own door with its own note, and one invoice.</p>', label: 'Ask for a proposal', link: '#enquire', layout: 'image-right' }),
    R.faq('corp-how', { caption: 'How it works', heading: 'Three emails, and it’s done', items: [['Tell us', 'How many, the budget per gift, the date, and whether you’d like your logo on the ribbon.'], ['We propose', 'Three hampers within one business day, with a photo and the price per box.'], ['Send the list', 'Names, addresses and messages in one spreadsheet. We pack, write every note and send each one.'], ['Pricing', '5% off from 10 boxes, 10% from 50, a quote from 200.']] }),
    R.featured('corp-list', { caption: 'Chosen by teams', heading: 'A place to start', link: 'collection.html?c=corporate', list: C.inOccasion('corporate').slice(0, 4) }),
    '<div id="enquire"></div>' + R.contactForm('corp-form', { heading: 'Ask for a proposal', text: 'We reply within one business day.', fields: ['Company', 'How many, and by when'] }),
  ].join('');
}
function concierge() {
  return R.split('conc', { image: 'card-hand', caption: 'Gifting concierge', heading: 'Tell us who. We’ll take it <em>from there</em>', text: '<p>Message the studio with who it’s for, the occasion, the day and roughly how much. We’ll suggest three hampers within the hour.</p><p class="muted">Monday to Saturday, 9am to 6pm AEST · (02) 5550 1234 · studio@houseofzariva.com.au</p>', label: 'Message on WhatsApp', link: '#', layout: 'image-right' })
    + R.contactForm('conc-form', { heading: 'Or write to us', text: 'Who it’s for, the occasion and the day.' });
}
function story() {
  return R.split('story', { image: 'pack-woman', caption: 'Our studio', heading: 'Gifting, <em>woven with tradition</em>', text: '<p>We started Zariva for families who live far from home: the Diwali that can’t be shared in person, the birthday in another city, the new baby met over video call.</p><p>Every hamper is wrapped by hand in our Sydney studio, with things made by more than 40 Australian makers.</p>' })
    + R.richText('mark', { caption: 'The arch and the diamond', heading: 'A doorway, and <em>the gift inside it</em>', text: '<p>Our mark is an Indian doorway holding one gold diamond. Every hamper is a visit you couldn’t make in person, so we treat it like one.</p>' });
}
function help() {
  const up = C.upcoming().slice(0, 4);
  return R.faq('delivery', { caption: 'Delivery', heading: 'When it leaves, and <em>when it arrives</em>', text: 'Order by 1pm AEST on a weekday and your hamper leaves the studio the same day.', items: [
    ['Standard, $12', '2 business days to capital cities, 3 to 5 to regional areas. Free over $150.'], ['Express, $18', 'Next business day to capital cities.'], ['Same-day, $25', 'Sydney and Melbourne metro, for orders by 11am.'],
    ...up.map((m) => { const s = C.momentState(m); return [`${m.name}, ${C.fmtLong(s.start)}`, m.kind === 'sale' ? `Runs until ${C.fmtLong(s.end)}.` : `Order by ${C.fmtLong(s.orderBy)} for standard delivery.`]; }),
  ] }) + R.faq('faq', { caption: 'Questions', heading: 'Before you send', items: [
    ['Can I choose the day it arrives?', 'Yes. Switch on Make it a gift and choose Arrive on a specific day.'], ['Who writes the note?', 'We do, by hand, in ink. You write the message.'],
    ['Can I send to more than one address?', 'Each order goes to one address. For several people, check out once per address, or ask the concierge.'], ['Will the price show?', 'Not if you keep Hide prices on the packing slip ticked.'],
  ] });
}
function account() {
  return R.contactForm('login', { heading: 'Sign in', text: 'We’ll email you a six-digit code. In the live store, Shopify’s customer accounts handle this.' }).replace('Message</label>', 'Code (optional)</label>');
}

function checkout() {
  const c = cartJSON();
  document.body.classList.add('z-checkout');
  const field = (id, label, type = 'text') => `<div class="field"><input class="field__input" id="co-${id}" type="${type}" placeholder=" "><label class="field__label" for="co-${id}">${label}</label></div>`;
  return `<section class="section scheme-scheme-1 sp-t-small sp-b-default"><div class="page-width"><div class="z-co">
    <div class="z-co__main">
      <a href="index.html" class="logo">${R.LOGO}</a>
      <div class="z-co__express"><a href="#" class="z-shoppay">Shop <b>Pay</b></a><a href="#" class="z-paypal"><b>PayPal</b></a><a href="#" class="z-gpay"><b>G Pay</b></a></div>
      <h2 class="h4">Contact</h2>${field('email', 'Email', 'email')}
      <h2 class="h4">Delivery</h2><div class="z-co__row">${field('first', 'First name')}${field('last', 'Last name')}</div>${field('addr', 'Address')}<div class="z-co__row">${field('suburb', 'Suburb')}${field('pc', 'Postcode')}</div>
      <h2 class="h4">Delivery method</h2><div class="z-co__rates" data-rates></div>
      <h2 class="h4">Payment</h2>${field('card', 'Card number')}<div class="z-co__row">${field('exp', 'MM / YY')}${field('cvc', 'Security code')}</div>
      <button type="button" class="btn btn--full" data-pay>${'<span class="btn__label"><span>Pay now · ' + C.money(c.total_price) + '</span></span>'}</button>
      <p class="caption">This is Shopify’s own checkout, branded in the checkout editor. Shown here so the journey is complete.</p>
    </div>
    <aside class="z-co__side"><ul class="cart-lines list-reset">${c.items.map((it) => `<li class="z-co__line"><span class="media ratio-portrait"><img src="${it.image}" alt=""></span><span><b>${R.esc(it.product_title)}</b><br><span class="text-sm muted">${[it.variant_title, ...Object.entries(it.properties).filter(([k]) => k[0] !== '_').map(([k, v]) => `${k}: ${v}`)].filter(Boolean).map(R.esc).join('<br>')}</span></span><span>${C.money(it.final_line_price)}</span></li>`).join('') || '<li class="muted">Your bag is empty.</li>'}</ul>
      <div class="cart-summary__total"><span>Total</span><span class="cart-summary__amount">${C.money(c.total_price)}</span></div><p class="text-sm muted">AUD, GST included.</p></aside>
  </div></div></section>`;
}

const PAGES = { home, collection, product, cart, search, build, corporate, concierge, story, help, account, checkout };

/* ---------- Presentation annotations: note pins and build labels, kept out of the Intellect markup ---------- */
const N = (sel, n, build, label) => ({ sel, n, build, label });
const ANNOTATE = {
  home: [
    N('.section-announcement', 0, 'custom', 'Intellect announcement bar; first message set by the next Moment'),
    N('.section-header', 1, 'native', 'Intellect header: logo centred, Occasions mega menu, Who it’s for dropdown'),
    N('.section-slideshow', 2, 'native', 'Intellect Slideshow: full-width banners, separate phone image; first slide from the next Moment'),
    N('.section-slideshow .slideshow__ui', 3, '', ''),
    N('#shopify-section-trust', 4, 'todo', 'Intellect Features (icons in a row): trust badges; rating and cut-off time to confirm'),
    N('#shopify-section-occasions', 5, 'native', 'Intellect Collection list: grid, title below; dated occasions first, from the Moments'),
    N('#shopify-section-budget', 6, 'custom', 'Budget row: links into the collection with Shopify price filters'),
    N('.section-hero', 7, 'native', 'Intellect Hero (full width) as an editorial banner, with a View all link'),
    N('.section-hero + .section-featured-collection', 8, 'native', 'Intellect Featured collection, carousel, no heading; arrival line is the Moment logic'),
    N('#shopify-section-clients', 9, 'todo', 'Intellect Press: client logos and quotes; names are placeholders until Zariva sends logos'),
    N('#shopify-section-reviews', 10, 'app', 'Intellect Testimonials; in the live store, reviews from a reviews app (Judge.me or Okendo)'),
    N('.section-footer', 11, 'native', 'Intellect footer: sign-up, menus, wordmark'),
    N('.z-ask', 12, 'custom', 'Floating WhatsApp concierge link (wa.me), every page except checkout'),
    N('.header__bar', 13, '', ''),
  ],
  collection: [
    N('.section-collection-header', 1, 'native', 'Intellect Collection banner (text); dates from the Moment'),
    N('.collection-toolbar', 2, 'native', 'Intellect filters drawer: Search & Discovery filters (recipient, price, dietary) and sort'),
    N('[data-product-grid] > li:first-child', 3, 'native', 'Intellect product card; arrival line + Loupe chip'),
  ],
  product: [
    N('.product__media', 1, 'native', 'Intellect gallery: thumbnails; Loupe video card on the first image'),
    N('.product__media loupe-chip', 2, '', ''),
    N('.product__title', 3, '', ''),
    N('.variant-picker', 4, 'native', 'Intellect variant picker: options on one line'),
    N('.product__buy', 5, 'native', 'Intellect buy buttons + Shopify dynamic checkout'),
    N('gift-mode', 6, 'native', 'Intellect Gift Mode block: wrap (a product), note (line properties), date and packing slip (cart attributes)'),
    N('delivery-estimate', 7, 'native', 'Intellect delivery estimate (1pm cut-off, AEST)'),
    N('.accordion', 8, 'custom', 'Collapsible tabs; What’s inside from a product metaobject list'),
    N('#shopify-section-related', 0, 'native', 'Intellect product recommendations'),
  ],
  cart: [
    N('.cart-lines', 1, 'native', 'Intellect cart page: the note shows as line properties'),
    N('.ladder', 2, 'native', 'Intellect reward ladder: free delivery at $150'),
    N('.cart-summary', 3, 'native', 'Intellect cart summary: studio note (cart note), Afterpay line'),
  ],
  build: [
    N('box-builder .box__products', 1, 'native', 'Intellect Build-a-box: items from a collection'),
    N('box-builder .box__sizes', 2, 'native', 'Box sizes with automatic discounts (Shopify)'),
    N('box-builder .box__crate', 3, '', ''),
  ],
  corporate: [
    N('#shopify-section-corp-hero', 1, 'native', 'Intellect Image with text'),
    N('#shopify-section-corp-how', 2, 'native', 'Intellect FAQ section'),
    N('#shopify-section-corp-form', 3, 'native', 'Intellect Contact form'),
  ],
  concierge: [N('#shopify-section-conc', 0, 'custom', 'Intellect Image with text; WhatsApp link'), N('#shopify-section-conc-form', 0, 'native', 'Intellect Contact form')],
  story: [N('#shopify-section-story', 0, 'todo', 'Founder’s story: to be written with the client'), N('#shopify-section-mark', 0, 'native', 'Intellect Rich text')],
  help: [N('#shopify-section-delivery', 0, 'custom', 'Intellect FAQ; order-by dates generated from Moments'), N('#shopify-section-faq', 0, 'native', 'Intellect FAQ section')],
  search: [N('#shopify-section-results', 0, 'native', 'Intellect search results + predictive search')],
  checkout: [N('.z-co__main', 1, 'native', 'Shopify Checkout, branded in the checkout editor'), N('.z-co__side', 2, '', '')],
};
function annotate() {
  for (const a of ANNOTATE[page] || []) {
    const el = document.querySelector(a.sel);
    if (!el) continue;
    if (a.n) el.setAttribute('data-note', a.n);
    if (a.build) { el.setAttribute('data-build', a.build); el.setAttribute('data-build-label', a.label); }
  }
}

/* ---------- Assemble ---------- */
const main = (PAGES[page] || home)();
if (page === 'checkout') document.body.insertAdjacentHTML('afterbegin', `<main id="MainContent" class="main">${main}</main>${R.cartDrawer(cartJSON())}`);
else document.body.insertAdjacentHTML('afterbegin', `${R.announcement()}${R.header(page === 'home' ? 'index.html' : '')}
  <main id="MainContent" class="main" role="main" tabindex="-1">${main}</main>
  ${R.footer()}${R.askUs()}${R.cartDrawer(cartJSON())}${R.searchModal()}
  <div class="toast-region" aria-live="polite"></div>`);
annotate();

// Shared choices: an occasion picked anywhere is remembered (prototype stand-in for a cart attribute).
document.addEventListener('click', (e) => {
  const m = e.target.closest('[data-set-moment]');
  if (m) { try { localStorage.setItem('zariva:moment', JSON.stringify(m.dataset.setMoment)); } catch (err) {} }
});

/* ---------- Loupe, as Intellect's loupe-config snippet sets it up ---------- */
window.LoupeConfig = {
  position: 'top-right', previews: 'auto', highlight: 'underline', afterAdd: 'stay', requireChoice: 'size',
  notes: ['Wrapped by hand, with a note written in ink', 'Free delivery over $150'],
  cart: {
    add: ({ variantId, quantity }) => Promise.resolve(window.ZarivaIntellect).then(({ Cart, openCart }) => {
      const data = new FormData();
      data.append('id', variantId);
      data.append('quantity', quantity || 1);
      return Cart.add(data).then((r) => { setTimeout(() => openCart && openCart(), 300); return r; });
    }),
  },
};

if (page === 'checkout') {
  const rates = document.querySelector('[data-rates]');
  const draw = () => { const pc = document.getElementById('co-pc').value; const same = /^(20|21|22|30|31)\d\d$/.test(pc); const free = cartJSON().total_price >= 15000; rates.innerHTML = [['Standard', '2 business days', free ? 'Free' : '$12'], ['Express', 'Next business day', '$18'], ['Same-day', same ? 'Order by 11am' : 'Sydney and Melbourne metro postcodes', same ? '$25' : '—']].map(([n, d, p], i) => `<label class="checkbox z-co__rate${!same && i === 2 ? ' is-disabled' : ''}"><input type="radio" name="rate" ${i ? '' : 'checked'} ${!same && i === 2 ? 'disabled' : ''}><span><b>${n}</b> · ${d}</span><span>${p}</span></label>`).join(''); };
  document.getElementById('co-pc').addEventListener('input', draw); draw();
  document.querySelector('[data-pay]').addEventListener('click', () => { fetch('cart/clear.js', { method: 'POST' }); document.querySelector('.z-co__main').innerHTML = `<a href="index.html" class="logo">${R.LOGO}</a><p class="caption">Order ZR-1048 confirmed</p><h1 class="h2">Thank you. We’ll take it from here.</h1><p class="muted">We’re writing the note now. You’ll get an email when it leaves the studio.</p><a href="index.html" class="btn"><span class="btn__label"><span>Back to the shop</span></span></a>`; });
}
