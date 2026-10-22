/* House of Zariva on Intellect: markup templates.
   Each function returns the same HTML the Intellect section or snippet renders in Shopify
   (captured from the theme in tools/ref), filled with Zariva's content. The page boot and the
   Shopify stand-in (shopify-mock.js) both use these, so what the scripts re-render matches. */
import { icon } from './icons.js';
import * as C from './catalog.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sec = (id, cls, html) => `<div id="shopify-section-${id}" class="shopify-section ${cls}">${html}</div>`;
const pic = (key, w = 900, attrs = '') => `<img src="${C.img(key, w)}" alt="" loading="lazy" style="object-position:${C.focus[key] || 'center'}" ${attrs}>`;
const btnInner = (label) => `<span class="btn__label"><span data-text="${esc(label)}">${esc(label)}</span></span>`;

/* ---------- Snippets ---------- */
export function price(p, v = p.firstAvailable, { from = false, cls = '' } = {}) {
  const isFrom = from && p.priceVaries;
  const current = isFrom ? p.priceMin : v.price;
  const compare = isFrom ? 0 : v.compare_at_price;
  const sale = compare > current;
  return `<div class="price${sale ? ' price--sale' : ''}${cls ? ' ' + cls : ''}" data-price>${isFrom ? '<span class="price__from">From</span>' : ''}<span class="price__current">${C.money(current)}</span>${sale ? `<s class="price__compare">${C.money(compare)}</s>` : ''}</div>`;
}
export function badges(p, v = p.firstAvailable) {
  const b = [];
  if (v.compare_at_price > v.price) b.push('<span class="badge badge--sale">Quiet Week</span>');
  else if (p.badge) b.push(`<span class="badge">${esc(p.badge)}</span>`);
  return `<div class="badges" data-badges>${b.join('')}</div>`;
}
const arrive = (p) => { const m = C.sendingFor(p); return m ? `Arrives before ${m.name}` : ''; };

export function card(p, i = 0, sectionId = 'grid') {
  const v = p.firstAvailable;
  const [a, b] = p.images;
  const sizeOpt = p.options.length === 1 ? p.options[0] : null;
  let quick = '';
  if (p.hasOnlyDefault) {
    quick = `<div class="card__quick card__quick--button"><product-form data-quick><form method="post" action="/cart/add" class="shopify-product-form"><input type="hidden" name="id" value="${v.id}"><button type="submit" class="btn btn--ghost">${btnInner('Add to bag')}</button></form></product-form></div>`;
  } else if (sizeOpt && !sizeOpt.swatch) {
    quick = `<product-form class="card__sizes" data-quick><form method="post" action="/cart/add" class="shopify-product-form"><p class="card__sizes-label caption"><span>Add to bag</span></p><div class="card__sizes-list" role="group" aria-label="Add ${esc(p.title)} to bag">${p.variants.map((x) => `<button type="submit" name="id" value="${x.id}" class="card__size"${x.available ? '' : ' disabled'} aria-label="Add ${esc(p.title)}, ${esc(x.title)}">${esc(x.title)}</button>`).join('')}</div><input type="hidden" name="section-id" value="${sectionId}"></form></product-form>
      <div class="card__quick card__quick--fab card__sizes-fab"><button type="button" class="btn btn--ghost" data-quick-view="${p.path}" aria-label="Choose options for ${esc(p.title)}" aria-haspopup="dialog">${icon('plus')}<span class="btn__label">Choose options</span></button></div>`;
  } else {
    quick = `<div class="card__quick card__quick--fab"><button type="button" class="btn btn--ghost" data-quick-view="${p.path}" aria-label="Choose options for ${esc(p.title)}" aria-haspopup="dialog">${icon('plus')}<span class="btn__label">Choose options</span></button></div>`;
  }
  const when = arrive(p);
  return `<div class="card card--stacked" style="--card-align: left; --card-items: flex-start; --adapt-ratio: 0.8; --i: ${i % 8};" data-product-root data-card data-reveal>
    <div class="card__media">
      <a href="${p.url}" class="media hover-zoom ratio-portrait" data-card-link tabindex="-1" aria-hidden="true">${pic(a, 900, `class="card__img-1" alt="${esc(p.title)}"`)}${b && b !== a ? pic(b, 900, 'class="card__img-2"') : ''}</a>
      ${badges(p).replace('class="badges"', 'class="badges card__badges"')}
      ${p.loupe ? `<loupe-chip data-handle="${p.handle}" data-product="${esc(JSON.stringify(loupeData(p)))}"></loupe-chip>` : ''}
      ${quick}
    </div>
    <div class="card__info"><div class="card__row"><h3 class="card__title"><a href="${p.url}" class="card__link" data-card-link>${esc(p.title)}</a></h3></div>${price(p, v, { from: true })}${when ? `<p class="card__note caption">${when}</p>` : ''}</div>
  </div>`;
}

/* ---------- Loupe data (Intellect: loupe-product-data.liquid) ---------- */
export function loupeData(p) {
  const l = p.loupe;
  return {
    v: 1, id: p.id, handle: p.handle, title: p.title, url: p.url, available: true,
    price: p.firstAvailable.price, priceLabel: C.money(p.firstAvailable.price), compareAtPrice: 0, compareAtLabel: '', image: C.img(p.images[0]),
    description: p.description, rating: p.reviews ? { value: p.rating, max: 5, count: p.reviews } : null,
    clip: { src: `assets/video/${l.clip.video}.mp4`, hd: '', poster: `assets/video/${l.clip.video}.jpg`, duration: 0, creator: l.clip.creator, label: l.clip.label },
    features: l.features, reviews: l.reviews,
    options: p.options.map((o) => ({ name: o.name, values: o.values.map((v) => ({ name: v.name, swatch: v.hex ? { color: v.hex, image: null } : null })) })),
    variants: p.variants.map((v) => ({ id: v.id, options: v.options, available: v.available, price: v.price, priceLabel: C.money(v.price), compareAtPrice: v.compare_at_price, compareAtLabel: v.compare_at_price ? C.money(v.compare_at_price) : '', image: C.img(p.images[0]) })),
    selectedVariantId: p.firstAvailable.id,
  };
}

/* ---------- Header group ---------- */
export function announcement() {
  const m = C.lead();
  const msgs = [];
  if (m) {
    const s = C.momentState(m);
    if (m.kind === 'sale') msgs.push(s.active ? `The Quiet Week: 15% off selected hampers until ${C.fmtLong(s.end)}` : `The Quiet Week starts ${C.fmtLong(s.start)}`);
    else msgs.push(s.orderable ? `${m.name} is ${C.fmtLong(s.start)}. Order by ${C.fmtLong(s.orderBy)} for delivery Australia-wide` : `${m.name} is ${C.fmtLong(s.start)}. Same-day delivery in Sydney and Melbourne`);
  }
  msgs.push('Every hamper wrapped by hand, with a note written in ink');
  msgs.push('Free delivery over $150');
  return sec('announcement', 'section-announcement', `<announcement-bar class="announcement announcement--rotate scheme-scheme-1" data-mode="rotate" data-speed="5" role="region" aria-label="Announcements"><div class="page-width"><div class="announcement__track">${msgs.map((t, i) => `<p class="announcement__item${i ? '' : ' is-active'}"${i ? ' aria-hidden="true"' : ''}>${esc(t)}</p>`).join('')}</div></div></announcement-bar>`);
}

export const LOGO = `<span class="z-logo" aria-label="House of Zariva"><svg class="z-logo__mark" viewBox="0 0 18 22" aria-hidden="true"><path d="M1.5 21.5V9a7.5 7.5 0 0 1 15 0v12.5" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M9 9.7l2 2.5-2 2.5-2-2.5z" fill="#B38B4D"/></svg><span class="z-logo__house">House of</span><span class="z-logo__name">Zariva</span></span>`;

export function header(current = '') {
  const up = C.upcoming().slice(0, 4);
  const m = C.lead() || up[0];
  const occ = `<li class="nav__item nav__item--mega" data-has-panel>
    <a href="collection.html?c=all" class="nav__link" aria-expanded="false" aria-haspopup="true"><span class="link">Occasions</span>${icon('chevron', 'nav__chevron')}</a>
    <div class="mega scheme-scheme-1"><div class="page-width"><div class="mega__inner" style="grid-template-columns: repeat(2, minmax(0, 1fr)) auto;">
      <div class="mega__col" style="--i: 0"><a href="collection.html?c=all" class="mega__heading h6"><span class="link">Coming up</span></a><ul class="mega__list list-reset" role="list">${up.map((x) => `<li><a href="collection.html?c=${x.id}">${esc(x.name)} <span class="muted">· ${C.fmtShort(C.parse(x.date))}</span></a></li>`).join('')}</ul></div>
      <div class="mega__col" style="--i: 1"><a href="collection.html?c=all" class="mega__heading h6"><span class="link">Any day</span></a><ul class="mega__list list-reset" role="list">${C.always.map((x) => `<li><a href="collection.html?c=${x.id}">${esc(x.name)}</a></li>`).join('')}</ul></div>
      ${m ? `<div class="mega__promos"><a href="collection.html?c=${m.id}" class="mega__promo mega__col" style="--i: 2"><div class="media hover-zoom ratio-portrait">${pic(m.image)}</div><span class="h5">${esc(m.name)}</span><span class="caption">${esc(m.line)}</span></a></div>` : ''}
    </div></div></div></li>`;
  const who = `<li class="nav__item nav__item--dropdown" data-has-panel><a href="collection.html?c=all" class="nav__link" aria-expanded="false" aria-haspopup="true"><span class="link">Who it’s for</span>${icon('chevron', 'nav__chevron')}</a><ul class="dropdown list-reset scheme-scheme-1" role="list">${C.recipients.map((r) => `<li><a href="collection.html?for=${r.id}">${esc(r.name)}</a></li>`).join('')}</ul></li>`;
  const plain = (href, label) => `<li class="nav__item"><a href="${href}" class="nav__link"${current === href ? ' aria-current="page"' : ''}><span class="link">${label}</span></a></li>`;
  const html = `<site-header class="header-bar" data-sticky="scroll-up" ${current === 'index.html' ? 'data-transparent' : ''} style="--overlay-text: #FFFFFF;">
    <div class="header__bar scheme-scheme-1"><div class="page-width"><div class="header header--logo-center">
      <div class="header__start">
        <button type="button" class="icon-btn header__menu-toggle" data-open-dialog="MenuDrawer" aria-haspopup="dialog" aria-label="Menu">${icon('menu')}</button>
        <a href="search.html" class="icon-btn header__search-mobile" data-open-dialog="SearchModal" aria-label="Search">${icon('search')}</a>
        <nav class="nav" aria-label="Main navigation"><ul class="nav__list list-reset" role="list">${occ}${who}${plain('build.html', 'Build your own')}${plain('corporate.html', 'Corporate')}</ul></nav>
      </div>
      <div class="header__logo"><a href="index.html" class="logo">${LOGO}</a></div>
      <div class="header__end">
        <a href="search.html" class="icon-btn header__search-desktop" data-open-dialog="SearchModal" aria-label="Search">${icon('search')}</a>
        <a href="account.html" class="icon-btn header__account" aria-label="Account">${icon('account')}</a>
        <a href="cart.html" class="icon-btn" data-cart-toggle aria-haspopup="dialog" data-cart-icon aria-label="Bag">${icon('cart')}<span class="cart-count" data-cart-count hidden><span>0</span></span></a>
      </div>
    </div></div></div>
  </site-header>
  <dialog id="MenuDrawer" class="drawer drawer--left menu-drawer scheme-scheme-1" aria-label="Menu">
    <div class="drawer__header"><a href="index.html" class="logo">${LOGO}</a><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon('close')}</button></div>
    <menu-drawer class="menu-drawer__panels">
      <div class="menu-panel is-active" id="menu-root"><ul class="menu-panel__list list-reset" role="list" data-stagger>
        <li style="--i: 0"><button type="button" class="menu-panel__link" data-panel-open="menu-1" aria-expanded="false">Occasions${icon('chevron-right')}</button></li>
        <li style="--i: 1"><button type="button" class="menu-panel__link" data-panel-open="menu-2" aria-expanded="false">Who it’s for${icon('chevron-right')}</button></li>
        <li style="--i: 2"><a href="build.html" class="menu-panel__link">Build your own</a></li>
        <li style="--i: 3"><a href="corporate.html" class="menu-panel__link">Corporate</a></li>
        <li style="--i: 4"><a href="concierge.html" class="menu-panel__link">Gifting concierge</a></li>
      </ul><div class="menu-panel__footer"><a href="account.html" class="text-btn">${icon('account')}Account</a></div></div>
      <div class="menu-panel is-right" id="menu-1"><button type="button" class="menu-panel__back" data-panel-back="menu-root">${icon('chevron-right')}Back</button><ul class="menu-panel__list list-reset" role="list"><li><a href="collection.html?c=all" class="menu-panel__link">Every hamper</a></li>${up.map((x) => `<li><a href="collection.html?c=${x.id}" class="menu-panel__link">${esc(x.name)}</a></li>`).join('')}${C.always.map((x) => `<li><a href="collection.html?c=${x.id}" class="menu-panel__link">${esc(x.name)}</a></li>`).join('')}</ul></div>
      <div class="menu-panel is-right" id="menu-2"><button type="button" class="menu-panel__back" data-panel-back="menu-root">${icon('chevron-right')}Back</button><ul class="menu-panel__list list-reset" role="list">${C.recipients.map((r) => `<li><a href="collection.html?for=${r.id}" class="menu-panel__link">${esc(r.name)}</a></li>`).join('')}</ul></div>
    </menu-drawer>
  </dialog>`;
  return sec('header', 'section-header', html);
}

export function searchModal() {
  const chips = C.upcoming().slice(0, 3).map((m) => `<li><a href="collection.html?c=${m.id}" class="chip">${esc(m.name)}</a></li>`).join('') + C.always.slice(0, 2).map((m) => `<li><a href="collection.html?c=${m.id}" class="chip">${esc(m.name)}</a></li>`).join('');
  return `<dialog id="SearchModal" class="drawer drawer--top search-modal scheme-scheme-1" aria-label="Search"><predictive-search class="drawer__body" data-enabled="true"><div class="page-width">
    <form action="search.html" method="get" role="search" class="search-modal__form">${icon('search')}<label for="SearchModalInput" class="visually-hidden">Search</label><input id="SearchModalInput" class="search-modal__input" type="search" name="q" placeholder="Search hampers, occasions, makers" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon('close')}</button></form>
    <div class="search-modal__results" data-search-results aria-live="polite"><div class="predictive__group"><p class="caption predictive__heading">Coming up</p><ul class="predictive__chips list-reset" role="list">${chips}</ul></div></div>
  </div></predictive-search></dialog>`;
}

export function footer() {
  const col = (title, links) => `<div class="footer__block" data-reveal><p class="footer__heading h6">${title}</p><ul class="footer__links list-reset" role="list">${links.map(([h, t]) => `<li><a href="${h}" class="link">${esc(t)}</a></li>`).join('')}</ul></div>`;
  return sec('footer', 'section-footer', `<footer class="footer section scheme-scheme-3"><div class="page-width">
    <div class="footer__grid" style="--footer-cols: minmax(0, 1.7fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);">
      <div class="footer__block footer__block--wide" data-reveal><div class="footer__newsletter"><p class="h3">A note before each <em>occasion</em></p><div class="rte muted"><p>The order-by date, a day early. Nothing else.</p></div><form class="newsletter-form" onsubmit="event.preventDefault();this.innerHTML='<p>Thank you. We’ll write before the next occasion.</p>'"><div class="field"><input id="FooterNewsletter-email" type="email" class="field__input" placeholder=" " required><label class="field__label" for="FooterNewsletter-email">Email address</label><button type="submit" class="newsletter-form__submit" aria-label="Subscribe">${icon('arrow')}</button></div></form></div></div>
      ${col('Send', [...C.upcoming().slice(0, 2).map((m) => [`collection.html?c=${m.id}`, m.name]), ...C.always.map((m) => [`collection.html?c=${m.id}`, m.name])])}
      ${col('Help', [['help.html', 'Delivery and order-by dates'], ['help.html#faq', 'Questions'], ['concierge.html', 'Gifting concierge'], ['account.html', 'Account']])}
      ${col('Studio', [['story.html', 'Our studio'], ['corporate.html', 'Corporate gifting'], ['build.html', 'Build your own'], ['journal.html', 'Journal']])}
    </div>
    <div class="footer__wordmark" aria-hidden="true" data-fit data-reveal><span>House of Zariva</span></div>
    <div class="footer__bottom"><div class="footer__bottom-start"><span>&copy; 2026 House of Zariva. Prices in AUD, GST included.</span></div><div class="footer__bottom-end"><span class="caption">We pack on Gadigal land.</span></div></div>
  </div></footer>`);
}

/* ---------- Home sections ---------- */
export function slideshow(slides) {
  const s = (x, i) => `<div class="slideshow__slide slide--light${x.mobile ? ' has-mobile' : ''}${i ? '' : ' is-active'}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${slides.length}" data-tone="light" style="--overlay: ${x.overlay ?? 0.3};">
      <div class="slide__media slide__media--desktop media">${x.video ? `<video src="assets/video/${x.video}.mp4" poster="assets/video/${x.video}.jpg" muted loop playsinline preload="none"${i ? '' : ' autoplay'}></video>` : pic(x.image, 1700, i ? '' : 'fetchpriority="high" loading="eager"')}</div>
      ${x.mobile ? `<div class="slide__media slide__media--mobile media">${pic(x.mobile, 900)}</div>` : ''}
      <div class="slide__scrim" aria-hidden="true"></div>
      <div class="slide__content slide__content--${x.position || 'bottom-left'} slide__content-m--bottom page-width"><div class="slide__inner content content--left" style="--content-w: 760px;">
        <p class="caption content__caption" style="--i: 0">${esc(x.caption)}</p>
        <${i ? 'h2' : 'h1'} class="h0 content__heading" style="--i: 1">${x.heading}</${i ? 'h2' : 'h1'}>
        ${x.text ? `<div class="rte content__text" style="--i: 2"><p>${esc(x.text)}</p></div>` : ''}
        <div class="content__buttons" style="--i: 3"><a href="${x.link}" class="btn">${btnInner(x.label)}</a></div>
      </div></div>
    </div>`;
  return sec('slideshow', 'section-slideshow', `<section class="section slideshow slideshow--full scheme-scheme-1 sp-t-none sp-b-none" style="--ss-h: 100svh; --ss-h-m: 100svh; --ss-ratio: 2; --ss-ratio-m: 0.8; --ss-dur: 6s;" data-overlay-header>
    <div class="slideshow__frame"><slide-show class="slideshow__stage" data-autoplay="6" data-pause-hover="true" data-transition="fade" role="region" aria-roledescription="carousel" aria-label="Occasions" tabindex="-1">
      ${slides.map(s).join('')}
      <div class="slideshow__ui slideshow__ui--bars page-width"><div class="slideshow__dots">${slides.map((x, i) => `<button type="button" class="slideshow__dot" data-slide-to="${i}" aria-label="Go to slide ${i + 1}" aria-current="${i === 0}"><i></i></button>`).join('')}</div>
      <div class="slideshow__arrows"><button type="button" class="slideshow__arrow slideshow__arrow--prev" data-slide-prev aria-label="Previous slide">${icon('arrow')}</button><button type="button" class="slideshow__arrow" data-slide-next aria-label="Next slide">${icon('arrow')}</button></div></div>
    </slide-show></div></section>`);
}

export function collectionIndex(rows, caption) {
  return sec('index', 'section-index', `<section class="section index scheme-scheme-1 sp-t-default sp-b-default"><div class="page-width"><p class="caption index__caption" data-reveal>${esc(caption)}</p><index-list class="index__list"><ul class="list-reset" role="list">
    ${rows.map((r, i) => `<li class="index__row" data-reveal style="--i: ${i}"><a href="${r.href}" class="index__link" data-index-image="${C.img(r.image)}" data-set-moment="${r.id}"><span class="index__num label">${String(i + 1).padStart(2, '0')}</span><span class="index__title h1">${esc(r.name)}<sup class="count">${r.count}</sup></span><span class="index__note caption">${esc(r.note)}</span><span class="index__arrow">${icon('arrow')}</span><span class="index__thumb media ratio-portrait">${pic(r.image, 900)}</span></a></li>`).join('')}
  </ul><div class="index__float media ratio-portrait" aria-hidden="true"><img alt="" decoding="async" width="600" height="750"></div></index-list></div></section>`);
}

export function featured(id, { caption, heading, link, linkLabel = 'View all', list, scheme = 'scheme-1', count }) {
  return sec(id, 'section-featured-collection', `<section class="section featured-collection ${'scheme-' + scheme} sp-t-default sp-b-default"><div class="page-width"><div style="--cols: 4;">
    <div class="section-head"><div class="section-head__text"><p class="caption" data-reveal>${esc(caption)}</p><h2 class="h2" data-split>${heading}${count ? `<sup class="count">${count}</sup>` : ''}</h2></div>${link ? `<div class="section-head__actions"><a href="${link}" class="btn btn--secondary btn--sm" data-reveal>${btnInner(linkLabel)}</a></div>` : ''}</div>
    <ul class="grid product-grid list-reset" role="list" style="--cols: 4; --cols-tablet: 3; --cols-mobile: 2;">${list.map((p, i) => `<li>${card(p, i, id)}</li>`).join('')}</ul>
  </div></div></section>`);
}

export function reels(items) {
  return sec('reels', 'section-reels', `<section class="section reels-section reels--carousel scheme-scheme-1 sp-t-default sp-b-default"><div class="page-width"><video-reels data-section-id="reels" data-autoplay="view"><slider-component class="slider" style="--cols: 4;">
    <div class="section-head"><div class="section-head__text"><p class="caption" data-reveal>Unboxed</p><h2 class="h2" data-split>In their words</h2></div></div>
    <ul class="reels slider__track list-reset" role="list" style="--cols: 4;" data-slider-track>
      ${items.map((u, i) => { const p = C.product(u.product); return `<li class="reel" data-reel data-index="${i}" data-reveal style="--i: ${i}">
        <button type="button" class="reel__media media" data-reel-open aria-label="Play video from ${esc(u.name)}"><video playsinline muted loop preload="none" class="reel__video" poster="assets/video/${u.video}.jpg"><source src="assets/video/${u.video}.mp4" type="video/mp4"></video><span class="reel__shade" aria-hidden="true"></span><span class="reel__creator caption"><span class="reel__avatar" aria-hidden="true">${esc(u.name[0])}</span>${esc(u.name)}</span><span class="reel__play" aria-hidden="true">${icon('play')}</span></button>
        <a href="${p.url}" class="reel__product" data-product-root><span class="reel__product-img media ratio-portrait">${pic(p.images[0], 900)}</span><span class="reel__product-text"><span class="reel__product-title">${esc(p.title)}</span>${price(p, p.firstAvailable, { from: true })}</span></a>
        <template data-reel-sheet><div class="reel-sheet" data-product-root><a href="${p.url}" class="reel-sheet__img media ratio-portrait">${pic(p.images[0], 900)}</a><div class="reel-sheet__info"><a href="${p.url}" class="reel-sheet__title">${esc(p.title)}</a>${price(p, p.firstAvailable, { from: true })}</div><button type="button" class="btn btn--sm" data-quick-view="${p.path}">Choose</button></div></template>
      </li>`; }).join('')}
    </ul>
    <div class="slider__foot"><div class="slider__progress" aria-hidden="true"><span data-slider-progress></span></div><div class="slider__nav"><button type="button" class="slider__btn slider__btn--prev" data-slider-prev aria-label="Previous">${icon('arrow')}</button><button type="button" class="slider__btn" data-slider-next aria-label="Next">${icon('arrow')}</button></div></div>
  </slider-component></video-reels></div></section>`);
}

export function split(id, { image, caption, heading, text, label, link, layout = 'image-left', scheme = 'scheme-1' }) {
  return sec(id, 'section-image-with-text', `<section class="section split scheme-${scheme} sp-t-default sp-b-default"><div class="page-width"><div class="split__grid split--${layout} split--img-medium split--middle">
    <div class="split__media"><div class="media media--feature ratio-portrait" data-reveal-media data-parallax-soft>${pic(image, 1700)}</div></div>
    <div class="split__content content content--left"><p class="caption content__caption" data-reveal style="--i: 0">${esc(caption)}</p><h2 class="h2 content__heading" data-split>${heading}</h2><div class="rte content__text" data-reveal style="--i: 2">${text}</div>${label ? `<div class="content__buttons" data-reveal style="--i: 3"><a href="${link}" class="btn">${btnInner(label)}</a></div>` : ''}</div>
  </div></div></section>`);
}

export function richText(id, { caption, heading, text, label, link, scheme = 'scheme-1' }) {
  return sec(id, 'section-rich-text', `<section class="section rich-text scheme-${scheme} sp-t-default sp-b-default"><div class="page-width page-width--narrow"><div class="content content--center">${caption ? `<p class="caption content__caption" data-reveal>${esc(caption)}</p>` : ''}<h2 class="h2 content__heading" data-split>${heading}</h2>${text ? `<div class="rte content__text" data-reveal>${text}</div>` : ''}${label ? `<div class="content__buttons" data-reveal><a href="${link}" class="btn btn--secondary">${btnInner(label)}</a></div>` : ''}</div></div></section>`);
}

/* ---------- Collection ---------- */
export function collectionHero({ caption, title, text }) {
  return sec('collection-header', 'section-collection-header', `<section class="section collection-hero collection-hero--text collection-hero--left scheme-scheme-1 sp-t-small sp-b-small"><div class="page-width"><div class="collection-hero__grid"><div class="collection-hero__inner">${caption ? `<p class="caption" data-reveal>${esc(caption)}</p>` : ''}<h1 class="h1" data-split>${esc(title)}</h1>${text ? `<div class="rte muted collection-hero__text" data-reveal><p>${esc(text)}</p></div>` : ''}</div></div></div></section>`);
}

export const SORTS = [['manual', 'Featured'], ['price-ascending', 'Price, low to high'], ['price-descending', 'Price, high to low'], ['created-descending', 'Newest']];
export function filterList(base, state) {
  let list = base.slice();
  if (state.who.length) list = list.filter((p) => state.who.some((w) => p.for.includes(w)));
  if (state.diet.length) list = list.filter((p) => state.diet.every((d) => d === 'Alcohol-free' ? !p.alcohol || p.dietary.includes('Alcohol-free') : p.dietary.includes(d)));
  if (state.min) list = list.filter((p) => p.priceMin >= state.min * 100);
  if (state.max) list = list.filter((p) => p.priceMin <= state.max * 100);
  if (state.sort === 'price-ascending') list.sort((a, b) => a.priceMin - b.priceMin);
  if (state.sort === 'price-descending') list.sort((a, b) => b.priceMin - a.priceMin);
  if (state.sort === 'created-descending') list.sort((a, b) => (b.created || '').localeCompare(a.created || ''));
  return list;
}
export function mainCollection(base, state, baseUrl) {
  const list = filterList(base, state);
  const opt = (name, value, label, checked, n) => `<li><label class="checkbox facet__option${n ? '' : ' is-disabled'}"><input type="checkbox" name="${name}" value="${esc(value)}" ${checked ? 'checked' : ''} ${n ? '' : 'disabled'}><span>${esc(label)} <span class="facet__n">(${n})</span></span></label></li>`;
  const facet = (id, title, body) => `<details class="facet" id="Facet-${id}" open><summary class="facet__summary"><span>${title}</span><span class="accordion__icon" aria-hidden="true"></span></summary><div class="facet__body">${body}</div></details>`;
  const sorts = SORTS.map(([v, l]) => `<option value="${v}"${state.sort === v ? ' selected' : ''}>${l}</option>`).join('');
  const chips = [...state.who.map((w) => [`filter.p.m.custom.recipients`, w, C.recipients.find((r) => r.id === w).name]), ...state.diet.map((d) => ['filter.p.m.custom.dietary', d, d])];
  return sec('main-collection', 'section-main-collection', `<section class="section collection-results scheme-scheme-1 sp-t-none sp-b-default facets-layout--drawer" data-section-id="main-collection">
    <facet-results class="page-width" data-section-id="main-collection" data-pagination="load_more">
      <div class="collection-toolbar"><div class="collection-toolbar__start"><button type="button" class="collection-toolbar__filter text-btn" data-open-dialog="Facets-main" aria-haspopup="dialog">${icon('filter')}<span>Filter</span></button><p class="collection-toolbar__count text-sm muted" data-result-count>${list.length} ${list.length === 1 ? 'hamper' : 'hampers'}</p></div>
        <div class="collection-toolbar__end"><div class="select collection-toolbar__sort"><label class="visually-hidden" for="ToolbarSort">Sort by</label><select id="ToolbarSort" class="select__select" data-toolbar-sort>${sorts}</select>${icon('chevron')}</div></div></div>
      <div class="collection-active" data-facets-active>${chips.length ? `<div class="active-filters">${chips.map(([n, v, l]) => `<a href="${baseUrl}" class="chip active-filter" data-facet-remove="${n}" data-value="${esc(v)}">${esc(l)}${icon('close', 'icon--sm')}</a>`).join('')}<a href="${baseUrl}" class="text-btn" data-facet-clear>Clear all</a></div>` : ''}</div>
      <div class="collection-body">
        <dialog id="Facets-main" class="drawer drawer--left facets-drawer scheme-scheme-1" aria-labelledby="FacetsTitle"><div class="drawer__header"><h2 class="drawer__title h4" id="FacetsTitle">Filter and sort</h2><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon('close')}</button></div>
          <form class="facets drawer__body" data-facet-form id="FacetForm-main">${(() => { const k = new URLSearchParams(baseUrl.split("?")[1]); const [n, v] = [...k][0] || []; return n && v !== "all" ? `<input type="hidden" name="${n}" value="${esc(v)}">` : ""; })()}<div class="facets__sort"><label class="facets__label h6" for="SortBy">Sort by</label><div class="select"><select id="SortBy" class="select__select" name="sort_by" data-sort>${sorts}</select>${icon('chevron')}</div></div>
            <div data-facet-filters>
              ${facet('who', 'Who it’s for', `<ul class="facet__list list-reset" role="list">${C.recipients.map((r) => opt('filter.p.m.custom.recipients', r.id, r.name, state.who.includes(r.id), base.filter((p) => p.for.includes(r.id)).length)).join('')}</ul>`)}
              ${facet('price', 'Price', `<div class="facet__price"><div class="field"><input class="field__input" id="PriceMin" type="number" inputmode="decimal" name="filter.v.price.gte" value="${state.min || ''}" placeholder=" " min="0"><label class="field__label" for="PriceMin">From ($)</label></div><span aria-hidden="true">–</span><div class="field"><input class="field__input" id="PriceMax" type="number" inputmode="decimal" name="filter.v.price.lte" value="${state.max || ''}" placeholder=" " min="0"><label class="field__label" for="PriceMax">To ($)</label></div></div>`)}
              ${facet('diet', 'Dietary', `<ul class="facet__list list-reset" role="list">${['Alcohol-free', 'Vegetarian', 'Contains nuts'].map((d) => opt('filter.p.m.custom.dietary', d, d, state.diet.includes(d), base.filter((p) => d === 'Alcohol-free' ? !p.alcohol : p.dietary.includes(d)).length)).join('')}</ul>`)}
            </div></form>
          <div class="drawer__footer facets__footer"><a href="${baseUrl}" class="btn btn--secondary" data-facet-clear>Clear all</a><button type="button" class="btn" data-close-dialog><span class="btn__label"><span data-text="View ${list.length} results" data-results-label>View ${list.length} results</span></span></button></div>
        </dialog>
        <div class="collection-grid-wrap" data-results>${list.length ? `<ul id="ProductGrid-main" class="grid product-grid list-reset" role="list" style="--cols: 4; --cols-tablet: 3; --cols-mobile: 2;" data-product-grid>${list.map((p, i) => `<li>${card(p, i, 'main-collection')}</li>`).join('')}</ul>` : '<div class="empty-state"><p class="h3">Nothing matches all of that.</p><p class="muted">Try fewer filters, or ask the concierge.</p></div>'}</div>
      </div>
    </facet-results></section>`);
}

/* ---------- Product ---------- */
const STARTERS = [['Diwali', 'Happy Diwali. Light the first diya for me.'], ['Karva Chauth', 'For the fast, and the moonrise after. With all my love.'], ['Birthday', 'Happy birthday. Wish I could be there to celebrate with you.'], ['New baby', 'Welcome to the world, little one.'], ['Thank you', 'Thank you, truly. This is a small way of saying it.']];
export const WRAPS = [['Ivory', '#F3EFEA', 0], ['Blush', '#E9D6DC', 0], ['Kraft', '#C8A77C', 0], ['Plum silk', '#3E1129', 800]];

export function variantPicker(p, v, sid) {
  if (p.hasOnlyDefault) return '';
  return `<variant-picker class="variant-picker variant-picker--buttons" data-section-id="${sid}" data-product-url="${p.path}" data-variant-picker>${p.options.map((o) => {
    const sel = v.options[o.position - 1];
    return `<fieldset class="variant-picker__option${o.swatch ? ' variant-picker__option--swatch' : ''}"><legend class="variant-picker__legend"><span>${esc(o.name)}</span><span class="variant-picker__value" data-option-label>${esc(sel)}</span></legend><div class="variant-picker__values">${o.values.map((val, k) => {
      const id = `${sid}-${o.position}-${k + 1}`;
      const avail = p.variants.some((x) => x.options[o.position - 1] === val.name && x.available);
      return `<input type="radio" class="visually-hidden" id="${id}" name="${sid}-${o.name.toLowerCase().replace(/\W+/g, '-')}" value="${val.id}" ${sel === val.name ? 'checked' : ''} data-option-value="${esc(val.name)}">${o.swatch
        ? `<label for="${id}" class="swatch-btn variant-picker__swatch${avail ? '' : ' is-unavailable'}" title="${esc(val.name)}"><span class="swatch" style="--size: 30px; --swatch: ${val.hex}"></span><span class="visually-hidden">${esc(val.name)}</span></label>`
        : `<label for="${id}" class="variant-picker__pill${avail ? '' : ' is-unavailable'}">${esc(val.name)}${val.add ? ` <span class="muted">+${C.money(val.add * 100)}</span>` : ''}</label>`}`;
    }).join('')}</div></fieldset>`;
  }).join('')}<script type="application/json" data-selected-variant>${JSON.stringify({ id: v.id, title: v.title, options: v.options, price: v.price, compare_at_price: v.compare_at_price, available: v.available, featured_media: null })}</script></variant-picker>`;
}
export function buyButtons(p, v, sid, { dynamic = true } = {}) {
  const fid = `ProductForm-${sid}`;
  return `<product-form class="buy-buttons" data-buy-buttons><form method="post" action="/cart/add" id="${fid}" class="buy-buttons__form" novalidate>
    <input type="hidden" name="id" value="${v.id}" data-variant-id ${v.available ? '' : 'disabled'}>
    <div class="buy-buttons__row"><div class="qty" data-qty><button type="button" data-step="-1" aria-label="Decrease quantity">${icon('minus')}</button><input type="number" name="quantity" inputmode="numeric" value="1" min="1" step="1" aria-label="Quantity"><button type="button" data-step="1" aria-label="Increase quantity">${icon('plus')}</button></div>
      <button type="submit" name="add" class="btn buy-buttons__add" ${v.available ? '' : 'disabled'} data-add-button><span class="btn__label"><span data-text="${v.available ? 'Add to bag' : 'Sold out'}" data-add-label>${v.available ? 'Add to bag' : 'Sold out'}</span></span></button></div>
    ${dynamic ? `<div class="buy-buttons__dynamic${v.available ? '' : ' is-hidden'}"><div class="shopify-payment-button"><a href="checkout.html" class="shopify-payment-button__button shopify-payment-button__button--unbranded z-shoppay">Buy with <b>Shop Pay</b></a></div></div>` : ''}
    <div class="form-message form-message--error" data-form-error role="alert" hidden>${icon('error', 'icon--sm')}<span data-message></span></div>
  </form></product-form>`;
}
export function giftMode(sid) {
  const fid = `ProductForm-${sid}`;
  return `<gift-mode class="gift" data-form="${fid}" data-starter-text="${esc(STARTERS.map((s) => s[1]).join('\n'))}" data-lead-days="2" data-skip-sundays="true" data-locale="en-AU">
    <label class="gift__switch"><input type="checkbox" data-gift-toggle><span class="gift__switch-track" aria-hidden="true"><span></span></span><span class="gift__switch-text"><span class="gift__switch-title">${icon('gift', 'icon--sm')}Make it a gift</span><span class="caption">Wrapped by hand, with a note written in ink</span></span></label>
    <div class="gift__panel" data-gift-panel hidden>
      <fieldset class="gift__group"><legend class="gift__legend">Wrapping</legend><div class="gift__wraps">${WRAPS.map(([name, hex, price], i) => `<label class="gift__wrap"><input type="radio" name="gift-wrap-${sid}" value="${C.product('gift-wrap').variants[i].id}" ${i ? '' : 'checked'} data-wrap-title="${name}" data-wrap-price="${price}" data-wrap-color="${hex}"><span class="gift__wrap-swatch media" style="--paper: ${hex};"></span><span class="gift__wrap-name">${name}</span><span class="caption">${price ? '+' + C.money(price) : 'Free'}</span></label>`).join('')}</div></fieldset>
      <fieldset class="gift__group"><legend class="gift__legend">Note card</legend><div class="gift__note-grid"><div class="gift__fields">
        <div class="gift__row"><div class="field"><input class="field__input" id="GiftTo-${sid}" type="text" name="properties[To]" form="${fid}" maxlength="40" placeholder=" " data-gift-to disabled><label class="field__label" for="GiftTo-${sid}">To</label></div><div class="field"><input class="field__input" id="GiftFrom-${sid}" type="text" name="properties[From]" form="${fid}" maxlength="40" placeholder=" " data-gift-from disabled><label class="field__label" for="GiftFrom-${sid}">From</label></div></div>
        <div class="gift__chips" role="group" aria-label="Occasion">${STARTERS.map((s, i) => `<button type="button" class="chip" data-occasion="${i}">${s[0]}</button>`).join('')}</div>
        <div class="field"><textarea class="field__input" id="GiftMsg-${sid}" name="properties[Message]" form="${fid}" maxlength="200" placeholder=" " data-gift-message disabled></textarea><label class="field__label" for="GiftMsg-${sid}">Message</label><span class="gift__count caption" data-gift-count>0 / 200</span></div>
      </div><figure class="gift__card" aria-hidden="true"><span class="gift__card-to">Dear <span data-card-to>…</span>,</span><span class="gift__card-msg" data-card-msg>Your message appears here, written on the card.</span><span class="gift__card-from">— <span data-card-from>…</span></span></figure></div></fieldset>
      <fieldset class="gift__group"><legend class="gift__legend">Delivery</legend><label class="checkbox"><input type="checkbox" data-gift-hide checked><span>Hide prices on the packing slip</span></label><label class="checkbox"><input type="checkbox" data-gift-date-toggle><span>Arrive on a specific day</span></label><div class="gift__dates" data-gift-dates hidden role="radiogroup" aria-label="Arrive on a specific day"></div></fieldset>
      <p class="gift__summary caption" data-gift-summary aria-live="polite"></p>
    </div>
  </gift-mode>`;
}
const delivery = (compact = false) => `<delivery-estimate class="delivery${compact ? ' delivery--compact' : ''}" data-cutoff="13" data-offset="+11:00" data-min="2" data-max="4" data-weekends="false" data-holidays="2026-12-25, 2026-12-26, 2027-01-01, 2027-01-26" data-locale="en-AU" data-text-countdown="Order within [time] to get it [date]" data-text-arrives="Arrives [date]" data-text-range="[from] – [to]" hidden>${icon('truck')}<span class="delivery__text" data-delivery-text></span></delivery-estimate>`;

export function mainProduct(p, v = p.firstAvailable, sid = 'product-main') {
  const imgs = [...new Set(p.images)];
  const m = C.sendingFor(p);
  const acc = (title, body, open = false) => `<details class="accordion" data-reveal style="--i: 8"${open ? ' open' : ''}><summary class="accordion__summary"><span>${title}</span><span class="accordion__icon" aria-hidden="true"></span></summary><div class="accordion__content rte">${body}</div></details>`;
  const inside = `<ul class="z-inside">${p.inside.map(([a, b]) => `<li><span>${esc(a)}</span><span class="muted">${esc(b)}</span></li>`).join('')}</ul>${p.dietary.length ? `<p class="caption">${p.dietary.map(esc).join(' · ')}</p>` : ''}`;
  return `<section class="section product-section scheme-scheme-1 sp-t-small sp-b-default" data-product-root data-section-id="${sid}" data-product-id="${p.id}" data-product-url="${p.path}">
    <div class="page-width"><div class="product product--thumbs product--media-large">
      <div class="product__media"><media-gallery class="gallery gallery--thumbs" data-layout="thumbs" data-hide-variants="false">
        <div class="gallery__track" data-gallery-track>${imgs.map((k, i) => `<div class="gallery__item${i ? '' : ' is-active'}" data-media-id="${p.id + i}" data-media-type="image"><div class="media ratio-portrait" style="--adapt-ratio: 0.8">${pic(k, 1700, i ? '' : 'loading="eager" fetchpriority="high"')}</div>${i === 0 && p.loupe ? `<loupe-chip data-handle="${p.handle}" data-product="${esc(JSON.stringify(loupeData(p)))}"></loupe-chip>` : ''}</div>`).join('')}
          <span class="gallery__counter" aria-hidden="true"><span data-gallery-current>1</span> / ${imgs.length}</span>
          <div class="gallery__dots" aria-hidden="true">${imgs.map((_, i) => `<span class="gallery__dot${i ? '' : ' is-active'}"></span>`).join('')}</div>
          <div class="slider__nav gallery__arrows"><button type="button" class="slider__btn slider__btn--prev" data-gallery-prev aria-label="Previous">${icon('arrow')}</button><button type="button" class="slider__btn" data-gallery-next aria-label="Next">${icon('arrow')}</button></div>
        </div>
        ${imgs.length > 1 ? `<div class="gallery__thumbs" role="list">${imgs.map((k, i) => `<button type="button" class="gallery__thumb${i ? '' : ' is-active'}" data-thumb="${p.id + i}" role="listitem" aria-label="Show image ${i + 1}">${pic(k, 900)}</button>`).join('')}</div>` : ''}
      </media-gallery></div>
      <div class="product__info-wrap"><div class="product__info is-sticky">
        ${m ? `<p class="caption" data-reveal style="--i: 0">${esc(m.name)} · Arrives before ${C.fmtLong(C.momentState(m).start)}</p>` : ''}
        <h1 class="product__title h2" data-reveal style="--i: 0">${esc(p.title)}</h1>
        <div class="product__price" data-reveal style="--i: 1"><div class="product__price-row" data-price-wrap>${price(p, v, { cls: 'price--lg' })}${badges(p, v)}</div><p class="product__tax text-sm muted">GST included. Or 4 payments of ${C.money(Math.round(v.price / 4))} with Afterpay.</p></div>
        ${p.reviews ? `<a href="#reviews" class="rating product__rating" data-reveal style="--i: 2" aria-label="Rated ${p.rating} out of 5"><span class="rating__stars" style="--rating: ${p.rating}; --rating-max: 5;"></span><span>${p.rating} · ${p.reviews} reviews</span></a>` : ''}
        <div data-reveal style="--i: 3">${variantPicker(p, v, sid)}</div>
        <div class="product__buy" data-reveal style="--i: 4">${buyButtons(p, v, sid)}</div>
        <div data-reveal style="--i: 5">${giftMode(sid)}</div>
        <div data-reveal style="--i: 6">${delivery()}</div>
        ${acc('What’s inside', `<p>${esc(p.description)}</p>${inside}`)}
        ${acc('Delivery and order-by dates', `<p>Order by 1pm AEST on a weekday for dispatch the same day. 2 business days to capital cities, 3 to 5 regional. Same-day in Sydney and Melbourne metro for orders by 11am. Free over $150.</p>${C.upcoming().slice(0, 2).map((x) => `<p>${esc(x.name)}: order by ${C.fmtLong(C.momentState(x).orderBy)}.</p>`).join('')}`)}
        ${acc('Care and returns', `<p>Sweets keep for two weeks somewhere cool. If anything arrives damaged, send us a photo within two days and we’ll replace it.${p.alcohol ? ' Contains alcohol: the person receiving it must be 18 or over.' : ''}</p>`)}
      </div></div>
    </div></div>
    <buy-bar class="buy-bar buy-bar--smart buy-bar--bottom scheme-scheme-1" data-mode="smart" data-section-id="${sid}" inert>
      <div class="buy-bar__progress" aria-hidden="true"><span data-bar-progress></span></div>
      <div class="buy-bar__inner page-width"><div class="buy-bar__product"><span class="buy-bar__thumb media ratio-square">${pic(p.images[0], 900)}</span><span class="buy-bar__text"><span class="buy-bar__title">${esc(p.title)}</span><span class="buy-bar__meta"><span data-bar-price>${price(p, v)}</span>${p.hasOnlyDefault ? '' : `<span class="buy-bar__variant caption" data-bar-variant>${esc(v.title)}</span>`}</span></span></div>
        <nav class="buy-bar__nav" aria-label="Sections" data-bar-nav hidden><span class="buy-bar__pill" aria-hidden="true"></span></nav>
        <div class="buy-bar__actions">${p.hasOnlyDefault ? '' : `<div class="select buy-bar__select"><label class="visually-hidden" for="BarVariant-${sid}">Choose an option</label><select id="BarVariant-${sid}" class="select__select" data-bar-select>${p.variants.map((x) => `<option value="${x.id}" data-options="${esc(x.options.join('|'))}"${x.id === v.id ? ' selected' : ''}${x.available ? '' : ' disabled'}>${esc(x.title)}</option>`).join('')}</select>${icon('chevron')}</div>`}<button type="button" class="btn buy-bar__add" data-bar-add><span class="btn__label" data-bar-label>Add to bag</span></button></div>
        <div class="buy-bar__delivery">${delivery(true)}</div>
      </div>
    </buy-bar>
  </section>`;
}

export function quickView(p, v = p.firstAvailable) {
  return `<div data-quick-view-content><div class="drawer__header"><p class="drawer__title h5">Quick view</p><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon('close')}</button></div>
    <div class="drawer__body quick-view__body" data-product-root data-section-id="quick-view" data-stagger>
      <media-gallery class="gallery gallery--carousel quick-view__gallery" data-layout="carousel" data-hide-variants="false"><div class="gallery__track" data-gallery-track>${[...new Set(p.images)].map((k, i) => `<div class="gallery__item${i ? '' : ' is-active'}" data-media-id="${p.id + i}" data-media-type="image"><div class="media ratio-portrait">${pic(k, 900)}</div></div>`).join('')}</div></media-gallery>
      <div class="quick-view__info stack" style="--stack: 18px"><div><h2 class="h3">${esc(p.title)}</h2></div><div data-price-wrap class="product__price-row">${price(p, v, { cls: 'price--lg' })}${badges(p, v)}</div>
        ${variantPicker(p, v, 'quick-view')}${buyButtons(p, v, 'quick-view', { dynamic: false })}<a href="${p.url}" class="text-btn">View details${icon('arrow')}</a></div>
    </div></div>`;
}

/* ---------- Cart ---------- */
const ladder = (cart) => `<reward-ladder class="ladder" data-total="${cart.total_price}" data-tiers="${esc(JSON.stringify([{ n: 1, amount: 15000, label: 'Free delivery', type: 'shipping', gift: null }]))}" data-gift-lines="[]" data-text-next="Add [amount] for [reward]" data-text-done="Free delivery is on" data-text-unlocked="Unlocked: [reward]">
  <p class="ladder__text" data-ladder-text aria-live="polite">&nbsp;</p>
  <div class="ladder__track" role="progressbar" aria-valuemin="0" aria-valuemax="15000" aria-valuenow="${cart.total_price}"><span class="ladder__fill" data-ladder-fill></span><span class="ladder__node ladder__node--end" style="--at: 100%;" data-node="1"><span class="ladder__dot"><span class="ladder__icon">${icon('truck')}</span><span class="ladder__check">${icon('check')}</span></span><span class="ladder__label">Free delivery</span></span></div>
</reward-ladder>`;
export function cartLine(item, line) {
  const props = Object.entries(item.properties || {}).filter(([k, v]) => v && k[0] !== '_');
  return `<li class="cart-line" data-line-row="${line}">
    <a href="${item.url}" class="cart-line__media media" tabindex="-1" aria-hidden="true"><img src="${item.image}" alt="" loading="lazy"></a>
    <div class="cart-line__info"><div class="cart-line__head"><div><a href="${item.url}" class="cart-line__title">${esc(item.product_title)}</a></div><div class="cart-line__price">${item.original_line_price > item.final_line_price ? `<s class="price__compare">${C.money(item.original_line_price)}</s>` : ''}<span>${C.money(item.final_line_price)}</span></div></div>
      <dl class="cart-line__meta">${item.product_has_only_default_variant ? '' : item.options_with_values.map((o) => `<div><dt>${esc(o.name)}:</dt> <dd>${esc(o.value)}</dd></div>`).join('')}${props.map(([k, v]) => `<div><dt>${esc(k)}:</dt> <dd>${esc(v)}</dd></div>`).join('')}</dl>
      <div class="cart-line__actions"><div class="qty qty--sm"><button type="button" data-qty-step="-1" aria-label="Decrease quantity of ${esc(item.product_title)}">${icon('minus')}</button><input type="number" inputmode="numeric" value="${item.quantity}" min="0" step="1" data-line="${line}" aria-label="Quantity of ${esc(item.product_title)}"><button type="button" data-qty-step="1" aria-label="Increase quantity of ${esc(item.product_title)}">${icon('plus')}</button></div><button type="button" class="cart-line__remove link" data-remove-line="${line}">Remove</button></div>
    </div></li>`;
}
const summary = (cart, id) => `<form action="checkout.html" method="get" class="cart-summary" data-cart-form novalidate>
  <details class="cart-summary__note"><summary>Add a note for the studio ${icon('chevron')}</summary><div class="field"><textarea id="CartNote-${id}" class="field__input" name="note" placeholder=" " data-cart-note>${esc(cart.note || '')}</textarea><label class="field__label" for="CartNote-${id}">Order note</label></div></details>
  ${cart.attributes && cart.attributes['Delivery date'] ? `<p class="text-sm z-cart-attr">${icon('truck', 'icon--sm')}Arriving ${esc(cart.attributes['Delivery date'])}</p>` : ''}
  <div class="cart-summary__total"><span>Subtotal</span><span class="cart-summary__amount">${C.money(cart.total_price)}</span></div>
  <p class="cart-summary__note-text text-sm muted">GST included. Delivery and discount codes at checkout. Or 4 payments of ${C.money(Math.round(cart.total_price / 4))} with Afterpay.</p>
  <a href="checkout.html" class="btn btn--full cart-summary__checkout">${icon('lock')}<span class="btn__label"><span data-text="Check out">Check out</span></span></a></form>`;
export function cartDrawerContent(cart) {
  const first = cart.items[0];
  return `<div class="cart-drawer__content" data-cart-content data-item-count="${cart.item_count}">
    <div class="drawer__header"><h2 class="drawer__title h4" id="CartDrawerTitle">Your bag <span class="cart-drawer__count">(${cart.item_count})</span></h2><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon('close')}</button></div>
    ${cart.item_count ? `<div class="cart-drawer__progress">${ladder(cart)}</div>
    <div class="drawer__body"><cart-items><ul class="cart-lines list-reset" role="list" data-stagger>${cart.items.map((it, i) => cartLine(it, i + 1)).join('')}</ul></cart-items><cart-upsells class="cart-upsells" data-product-id="${first.product_id}" data-exclude="${cart.items.map((i) => i.product_id).join(',')}" hidden></cart-upsells></div>
    <div class="drawer__footer">${summary(cart, 'drawer')}</div>`
    : `<div class="drawer__body cart-drawer__empty"><div class="empty-state"><p class="h3">Your bag is empty.</p><p class="muted">Start with the occasion, or who it’s for.</p><a href="collection.html?c=all" class="btn">${btnInner('See every hamper')}</a></div></div>`}
  </div>`;
}
export const cartDrawer = (cart) => sec('cart-drawer', '', `<cart-drawer data-cart-section="cart-drawer"><dialog id="CartDrawer" class="drawer cart-drawer scheme-scheme-1" aria-labelledby="CartDrawerTitle">${cartDrawerContent(cart)}</dialog></cart-drawer>`);
export function mainCart(cart) {
  return `<section class="section cart-page scheme-scheme-1 sp-t-small sp-b-default" data-cart-section="main-cart"><div class="page-width" data-cart-content data-item-count="${cart.item_count}">
    <div class="cart-page__head"><h1 class="h1" data-split>Your bag</h1>${cart.item_count ? `<a href="collection.html?c=all" class="text-btn">Continue shopping${icon('arrow')}</a>` : ''}</div>
    ${cart.item_count ? `<div class="cart-page__grid"><cart-items><ul class="cart-lines list-reset" role="list">${cart.items.map((it, i) => cartLine(it, i + 1)).join('')}</ul></cart-items><aside class="cart-page__summary" aria-label="Order summary">${ladder(cart)}${summary(cart, 'page')}</aside></div>`
    : `<div class="empty-state"><p class="h3">Your bag is empty.</p><p class="muted">Start with the occasion, or who it’s for.</p><a href="collection.html?c=all" class="btn">${btnInner('See every hamper')}</a></div>`}
  </div></section>`;
}
export function cartUpsells(list) {
  return `<div data-upsells>${list.length ? `<p class="cart-upsells__heading h6">Add a little more</p><ul class="cart-upsells__list list-reset" role="list">${list.map((p) => `<li class="upsell" data-upsell-item="${p.id}" data-price="${p.priceMin}" data-product-root><a href="${p.url}" class="upsell__media media ratio-portrait">${pic(p.images[0], 900)}</a><div class="upsell__info"><span class="upsell__tag caption" data-upsell-tag hidden></span><a href="${p.url}" class="upsell__title">${esc(p.title)}</a>${price(p, p.firstAvailable, { from: true })}${p.hasOnlyDefault ? `<product-form data-quick><form method="post" action="/cart/add"><input type="hidden" name="id" value="${p.firstAvailable.id}"><button type="submit" class="upsell__add link link--underlined">Add</button></form></product-form>` : `<button type="button" class="upsell__add link link--underlined" data-quick-view="${p.path}">Choose</button>`}</div></li>`).join('')}</ul>` : ''}</div>`;
}
export function predictive(q) {
  const s = q.toLowerCase();
  const products = C.hampers().filter((p) => (p.title + ' ' + p.blurb + ' ' + p.inside.map((x) => x.join(' ')).join(' ')).toLowerCase().includes(s));
  const occ = [...C.moments, ...C.always].filter((m) => m.name.toLowerCase().includes(s));
  if (!products.length && !occ.length) return `<div data-predictive><p class="predictive__empty muted">No results for “${esc(q)}”.</p></div>`;
  return `<div data-predictive><div class="predictive">
    <div class="predictive__side">${occ.length ? `<div class="predictive__group"><p class="caption predictive__heading">Occasions</p><ul class="list-reset predictive__links" role="list">${occ.slice(0, 5).map((m) => `<li><a href="collection.html?c=${m.id}" class="link">${esc(m.name)}</a></li>`).join('')}</ul></div>` : ''}</div>
    ${products.length ? `<div class="predictive__group predictive__products"><p class="caption predictive__heading">Hampers</p><ul class="list-reset predictive__grid" role="list">${products.slice(0, 4).map((p, i) => `<li data-reveal style="--i: ${i}"><a href="${p.url}" class="predictive__product"><span class="media ratio-portrait hover-zoom">${pic(p.images[0], 900)}</span><span class="predictive__title">${esc(p.title)}</span>${price(p, p.firstAvailable, { from: true })}</a></li>`).join('')}</ul></div>` : ''}
  </div><a href="search.html?q=${encodeURIComponent(q)}" class="predictive__all text-btn">See all results for “${esc(q)}”${icon('arrow')}</a></div>`;
}

/* ---------- Build-a-box (Intellect sections/build-a-box.liquid) ---------- */
export function buildABox({ caption, heading, text, items, box, sizes, name = 'Zariva box', note }) {
  const strings = { progress: '[count] of [size] filled.', more: 'Add [left] more to save [discount]%.', full: 'Your box is full. You save [discount]%.', add: 'Add box to bag · [price]', fill: 'Fill your box', blocked: 'Your box is full. Remove an item or choose a bigger box', remove: 'Remove [title]' };
  return sec('box', 'section-build-a-box', `<section class="section box-section scheme-scheme-1 sp-t-small sp-b-default"><div class="page-width">
    <div class="section-head"><div class="section-head__text"><p class="caption" data-reveal>${esc(caption)}</p><h1 class="h1" data-split>${heading}</h1><div class="rte" data-reveal><p>${esc(text)}</p></div></div></div>
    <box-builder class="box" data-section-id="box" data-box-variant="${box.firstAvailable.id}" data-name="${esc(name)}" ${Object.entries(strings).map(([k, v]) => `data-text-${k}="${esc(v)}"`).join(' ')}>
      <div class="box__products"><ul class="box__grid list-reset" role="list">${items.map((p, i) => `<li class="box-item" data-box-product="${p.id}" data-reveal style="--i: ${i % 8}">
        <div class="box-item__media media ratio-square">${pic(p.images[0], 900, 'class="box-item__img"')}<span class="box-item__count" data-count hidden>×<span>0</span></span></div>
        <div class="box-item__info"><span class="box-item__title">${esc(p.title)}</span>${price(p)}</div>
        <button type="button" class="btn btn--secondary btn--sm box-item__add" data-box-add data-variant="${p.firstAvailable.id}" data-price="${p.firstAvailable.price}" data-title="${esc(p.title)}" data-image="${C.img(p.images[0])}">${icon('plus', 'icon--sm')}Add to box</button>
      </li>`).join('')}</ul></div>
      <aside class="box__panel" data-box-panel aria-label="${esc(name)}">
        <div class="box__sizes" role="radiogroup" aria-label="Box size"><span class="box__size-pill" aria-hidden="true"></span>${sizes.map(([n, d], i) => `<button type="button" class="box__size${i ? '' : ' is-active'}" role="radio" aria-checked="${!i}" data-size="${n}" data-discount="${d}"><span>${n}</span>${d ? `<span class="caption">−${d}%</span>` : ''}</button>`).join('')}</div>
        <div class="box__crate" data-box-crate><div class="box__lid" aria-hidden="true"><span class="box__ribbon"></span><span class="box__tag">${esc(name)}</span></div><ol class="box__slots list-reset" data-slots></ol></div>
        <div class="box__meter"><span data-meter></span></div>
        <p class="box__progress" data-progress aria-live="polite"></p>
        <dl class="box__totals"><div><dt>Items</dt><dd data-items-total>$0</dd></div><div class="box__saving"><dt>Box saving</dt><dd data-saving>$0</dd></div><div class="box__total"><dt>Box total</dt><dd data-box-total>$0</dd></div></dl>
        <button type="button" class="btn btn--full box__add" data-box-submit disabled><span class="btn__label" data-box-submit-label>Fill your box</span></button>
        <button type="button" class="box__reopen link link--underlined text-sm" data-box-reopen hidden>Open the box to change items</button>
        <p class="caption box__note">${esc(note)}</p>
      </aside>
      <button type="button" class="box__tray" data-box-tray aria-expanded="false"><span class="box__tray-slots" data-tray-slots></span><span class="box__tray-text" data-tray-text></span></button>
    </box-builder></div></section>`);
}

/* ---------- Contact form and FAQ ---------- */
export function contactForm(id, { heading, text, fields = [] }) {
  return sec(id, 'section-contact-form', `<section class="section contact scheme-scheme-1 sp-t-default sp-b-default"><div class="page-width page-width--narrow">
    <div class="section-head section-head--center"><div class="section-head__text"><h2 class="h2" data-split>${heading}</h2>${text ? `<div class="rte" data-reveal><p>${esc(text)}</p></div>` : ''}</div></div>
    <form class="contact__form" onsubmit="event.preventDefault();this.innerHTML='<p class=&quot;form-message form-message--success&quot;>Thank you. We’ll reply within one business day.</p>'"><div class="contact__grid">
      <div class="field"><input class="field__input" type="text" id="${id}-name" placeholder=" " autocomplete="name"><label class="field__label" for="${id}-name">Name</label></div>
      <div class="field"><input class="field__input" type="email" id="${id}-email" placeholder=" " required autocomplete="email"><label class="field__label" for="${id}-email">Email</label></div>
      ${fields.map((f, i) => `<div class="field contact__wide"><input class="field__input" type="text" id="${id}-f${i}" placeholder=" "><label class="field__label" for="${id}-f${i}">${esc(f)}</label></div>`).join('')}
      <div class="field contact__wide"><textarea class="field__input" id="${id}-msg" placeholder=" "></textarea><label class="field__label" for="${id}-msg">Message</label></div>
    </div><button type="submit" class="btn">${btnInner('Send')}</button></form>
  </div></section>`);
}
export function faq(id, { caption, heading, text, items }) {
  return sec(id, 'section-faq', `<section class="section faq scheme-scheme-1 sp-t-default sp-b-default"><div class="page-width"><div class="faq__grid">
    <div class="faq__intro"><p class="caption" data-reveal>${esc(caption)}</p><h2 class="h2" data-split>${heading}</h2>${text ? `<div class="rte muted" data-reveal><p>${esc(text)}</p></div>` : ''}</div>
    <div class="faq__list">${items.map(([q, a], i) => `<details class="accordion" data-reveal style="--i: ${i % 8}"><summary class="accordion__summary"><span>${esc(q)}</span><span class="accordion__icon" aria-hidden="true"></span></summary><div class="accordion__content rte"><p>${a}</p></div></details>`).join('')}</div>
  </div></div></section>`);
}
