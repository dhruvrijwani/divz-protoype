/* Intellect · theme.js
   Entry module on every page: motion, header, menus, announcement bar, search,
   localization and page transitions. Feature modules load with their sections. */

import { $, $$, define, debounce, theme, openDialog, closeDialog, motionOn, parseHTML, toast } from '@theme/core';
import { initMotion, motionEnabled } from '@theme/motion';
import '@theme/cart';

const html = document.documentElement;
html.classList.toggle('motion-on', motionEnabled());

initMotion(document);
html.classList.add('js-ready');

// The announcement bar's height, so a full-screen first section can fit below it (base.css).
const announce = document.querySelector('announcement-bar');
if (announce) {
  const setAnnounce = () => html.style.setProperty('--announcement-h', `${announce.offsetHeight}px`);
  setAnnounce();
  new ResizeObserver(setAnnounce).observe(announce);
}

/* ---------- Smooth scrolling (desktop pointers only, never with reduced motion) ---------- */
async function initSmoothScroll() {
  const lerp = Number(html.dataset.smoothScroll);
  if (!lerp || !motionEnabled() || !matchMedia('(pointer: fine)').matches) return;
  const { default: Lenis } = await import('@theme/lenis');
  const lenis = new Lenis({
    lerp,
    autoRaf: true,
    anchors: { offset: -(parseFloat(getComputedStyle(html).getPropertyValue('--header-offset')) || 0) - 16 },
    allowNestedScroll: true,
    // Drawers, popups and anything marked data-lenis-prevent keep native scrolling.
    prevent: (node) => Boolean(node.closest?.('dialog, [data-lenis-prevent]')),
  });
  window.Theme.lenis = lenis;
  document.addEventListener('theme:dialog:open', () => lenis.stop());
  document.addEventListener('theme:dialog:close', () => {
    if (!html.classList.contains('is-locked')) lenis.start();
  });
}
('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(initSmoothScroll);

/* ---------- Cursor labels (desktop mouse only) ---------- */
if (html.dataset.cursorLabels === 'true' && motionEnabled() && matchMedia('(pointer: fine) and (hover: hover)').matches) {
  ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(() => import('@theme/cursor'));
}

/* ---------- Header ---------- */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.section = this.closest('.section-header') || this;
    this.mode = this.dataset.sticky || 'scroll-up';
    this.lastY = window.scrollY;
    this.bar = this.querySelector('.header__bar');
    if (this.mode === 'none') this.section.classList.add('is-static');

    this.measure = () => {
      const h = this.offsetHeight;
      const hidden = this.section.classList.contains('is-hidden');
      html.style.setProperty('--header-total', `${h}px`);
      html.style.setProperty('--header-offset', this.mode === 'none' || hidden ? '0px' : `${h}px`);
    };
    this.measure();
    new ResizeObserver(this.measure).observe(this);

    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();

    this.initMenus();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll() {
    const y = window.scrollY;
    this.section.classList.toggle('is-scrolled', y > 8);
    if (this.mode === 'scroll-up') {
      const goingDown = y > this.lastY + 4;
      const goingUp = y < this.lastY - 4;
      const past = y > (this.bar?.offsetHeight || 80) * 2;
      if (goingDown && past && !this.querySelector('.nav__item.is-open')) this.section.classList.add('is-hidden');
      else if (goingUp || !past) this.section.classList.remove('is-hidden');
      if (goingDown || goingUp) this.measure();
    }
    this.lastY = y;
  }

  initMenus() {
    const items = $$('.nav__item[data-has-panel]', this);
    let openTimer;
    let closeTimer;
    const open = (item) => {
      items.forEach((other) => other !== item && this.close(other));
      item.classList.add('is-open');
      item.querySelector(':scope > .nav__link')?.setAttribute('aria-expanded', 'true');
      this.section.classList.add('menu-open');
    };
    items.forEach((item) => {
      item.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(closeTimer);
        openTimer = setTimeout(() => open(item), this.querySelector('.nav__item.is-open') ? 0 : 90);
      });
      item.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(openTimer);
        closeTimer = setTimeout(() => this.close(item), 180);
      });
      item.addEventListener('focusin', () => open(item));
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) this.close(item);
      });
      // Touch: first tap opens the panel, second tap follows the link.
      item.querySelector(':scope > .nav__link')?.addEventListener('click', (e) => {
        if (matchMedia('(hover: none)').matches && !item.classList.contains('is-open')) {
          e.preventDefault();
          open(item);
        }
      });
    });
    this.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const item = this.querySelector('.nav__item.is-open');
      if (item) {
        this.close(item);
        item.querySelector('.nav__link')?.focus();
      }
    });
  }

  close(item) {
    item.classList.remove('is-open');
    item.querySelector(':scope > .nav__link')?.setAttribute('aria-expanded', 'false');
    if (!this.querySelector('.nav__item.is-open')) this.section.classList.remove('menu-open');
  }
}
define('site-header', SiteHeader);

/* ---------- Mobile menu panels ---------- */
class MenuDrawer extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (e) => {
      const forward = e.target.closest('[data-panel-open]');
      const back = e.target.closest('[data-panel-back]');
      if (forward) this.go(forward.dataset.panelOpen, 'forward');
      if (back) this.go(back.dataset.panelBack, 'back');
    });
    this.closest('dialog')?.addEventListener('dialog:close', () => this.go('menu-root', 'reset'));
  }

  go(id, direction) {
    const next = this.querySelector(`#${CSS.escape(id)}`);
    const current = this.querySelector('.menu-panel.is-active');
    if (!next || next === current) return;
    if (direction === 'reset') {
      $$('.menu-panel', this).forEach((p) => {
        p.classList.remove('is-active', 'is-left');
        if (p !== next) p.classList.add('is-right');
      });
      next.classList.remove('is-right');
      next.classList.add('is-active');
      return;
    }
    current?.classList.remove('is-active');
    current?.classList.add(direction === 'forward' ? 'is-left' : 'is-right');
    next.classList.remove('is-left', 'is-right');
    next.classList.add('is-active');
    next.querySelector('a, button')?.focus({ preventScroll: true });
  }
}
define('menu-drawer', MenuDrawer);

/* ---------- Announcement bar ---------- */
class AnnouncementBar extends HTMLElement {
  connectedCallback() {
    this.items = $$('.announcement__item', this);
    if (this.items.length < 2 || this.dataset.mode === 'marquee') return;
    this.index = 0;
    this.querySelector('[data-prev]')?.addEventListener('click', () => this.show(this.index - 1, true));
    this.querySelector('[data-next]')?.addEventListener('click', () => this.show(this.index + 1, true));
    this.addEventListener('pointerenter', () => this.stop());
    this.addEventListener('pointerleave', () => this.play());
    this.play();
  }
  show(i, user) {
    const leaving = this.items[this.index];
    leaving.classList.remove('is-active');
    leaving.classList.add('is-leaving');
    leaving.setAttribute('aria-hidden', 'true');
    setTimeout(() => leaving.classList.remove('is-leaving'), 500);
    this.index = (i + this.items.length) % this.items.length;
    this.items[this.index].classList.add('is-active');
    this.items[this.index].removeAttribute('aria-hidden');
    if (user) this.play();
  }
  play() {
    this.stop();
    const speed = Number(this.dataset.speed || 5) * 1000;
    this.timer = setInterval(() => this.show(this.index + 1), speed);
  }
  stop() {
    clearInterval(this.timer);
  }
  disconnectedCallback() {
    this.stop();
  }
}
define('announcement-bar', AnnouncementBar);

/* ---------- Predictive search ---------- */
class PredictiveSearch extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input[type="search"]');
    this.results = this.querySelector('[data-search-results]');
    this.idle = this.results?.innerHTML || '';
    this.cache = new Map();
    if (!this.input || this.dataset.enabled !== 'true') return;
    this.input.addEventListener('input', debounce(() => this.search(), 220));
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.results.querySelector('a')?.focus();
      }
    });
  }

  async search() {
    const q = this.input.value.trim();
    if (!q) {
      this.results.innerHTML = this.idle;
      return;
    }
    this.results.classList.add('is-loading');
    try {
      if (!this.cache.has(q)) {
        const url = `${theme.routes.predictiveSearch}?q=${encodeURIComponent(q)}&section_id=predictive-search&resources[limit]=6&resources[limit_scope]=each&resources[options][fields]=title,product_type,variants.title,vendor,tag`;
        const text = await fetch(url).then((r) => r.text());
        this.cache.set(q, parseHTML(text).querySelector('[data-predictive]')?.innerHTML || '');
      }
      if (this.input.value.trim() === q) {
        this.results.innerHTML = this.cache.get(q);
        initMotion(this.results);
      }
    } finally {
      this.results.classList.remove('is-loading');
    }
  }
}
define('predictive-search', PredictiveSearch);

/* ---------- Share ---------- */
class ShareButton extends HTMLElement {
  connectedCallback() {
    this.querySelector('button')?.addEventListener('click', async () => {
      const data = { title: this.dataset.title, url: this.dataset.url };
      if (navigator.share) {
        try { await navigator.share(data); } catch {}
        return;
      }
      await navigator.clipboard?.writeText(data.url);
      toast(theme.strings.copied);
    });
  }
}
define('share-button', ShareButton);

/* ---------- Product card swatches: preview on hover, choose on click ---------- */
const swapCardImage = (card, url) => {
  const img = card.querySelector('.card__img-1');
  if (!img || !url) return;
  if (!img.dataset.originalSrc) {
    img.dataset.originalSrc = img.currentSrc || img.src;
    img.dataset.originalSrcset = img.getAttribute('srcset') || '';
  }
  img.removeAttribute('srcset');
  img.src = url;
};
document.addEventListener('pointerover', (e) => {
  const swatch = e.target.closest?.('[data-card] [data-swatch-image]');
  if (swatch && e.pointerType === 'mouse') swapCardImage(swatch.closest('[data-card]'), swatch.dataset.swatchImage);
});
document.addEventListener('pointerout', (e) => {
  const swatch = e.target.closest?.('[data-card] [data-swatch]');
  if (!swatch || swatch.contains(e.relatedTarget)) return;
  const card = swatch.closest('[data-card]');
  const active = card.querySelector('[data-swatch].is-active');
  const img = card.querySelector('.card__img-1');
  if (active?.dataset.swatchImage) swapCardImage(card, active.dataset.swatchImage);
  else if (img?.dataset.originalSrc) {
    img.src = img.dataset.originalSrc;
    if (img.dataset.originalSrcset) img.setAttribute('srcset', img.dataset.originalSrcset);
  }
});
document.addEventListener('click', (e) => {
  const swatch = e.target.closest('[data-card] [data-swatch]');
  if (!swatch) return;
  e.preventDefault();
  const card = swatch.closest('[data-card]');
  card.dataset.colour = swatch.dataset.swatch;
  $$('[data-swatch]', card).forEach((s) => {
    s.classList.toggle('is-active', s === swatch);
    s.setAttribute('aria-pressed', String(s === swatch));
  });
  $$('.card__size', card).forEach((b) => (b.hidden = b.dataset.colour !== swatch.dataset.swatch));
  $$('[data-card-link]', card).forEach((a) => (a.href = swatch.dataset.url));
  if (swatch.dataset.swatchImage) swapCardImage(card, swatch.dataset.swatchImage);
});

/* ---------- Text that fills its container (footer wordmark) ---------- */
const fitText = (el) => {
  el.style.removeProperty('--fit-size');
  const width = el.clientWidth;
  const natural = (el.firstElementChild || el).getBoundingClientRect().width;
  if (!width || !natural) return;
  const size = parseFloat(getComputedStyle(el).fontSize);
  el.style.setProperty('--fit-size', `${Math.floor(size * (width / natural) * 0.995)}px`);
};
let lastWidths = new WeakMap();
const fitObserver = new ResizeObserver((entries) => entries.forEach((e) => {
  // Only refit when the width changes; refitting changes the height and would loop.
  if (lastWidths.get(e.target) === e.contentRect.width) return;
  lastWidths.set(e.target, e.contentRect.width);
  fitText(e.target);
}));
const observeFit = (root = document) => $$('[data-fit]', root).forEach((el) => fitObserver.observe(el));
observeFit();
document.fonts?.ready.then(() => $$('[data-fit]').forEach(fitText));

/* ---------- Localization (country / language) ---------- */
document.addEventListener('change', (e) => {
  if (e.target.matches('[data-localization-select]')) e.target.form.submit();
});

/* ---------- Page transitions: product image glides to the product page ---------- */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="/products/"]');
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey || !motionOn()) return;
  const media = link.closest('.card, [data-vt-scope]')?.querySelector('[data-vt-media]');
  if (media) media.style.viewTransitionName = 'product-media';
});
window.addEventListener('pageshow', () => {
  $$('.card [data-vt-media]').forEach((el) => (el.style.viewTransitionName = ''));
});

/* ---------- Theme editor ---------- */
if (window.Shopify?.designMode) {
  document.addEventListener('shopify:section:load', (e) => {
    initMotion(e.target);
    observeFit(e.target);
  });
  document.addEventListener('shopify:block:select', (e) => {
    const dialog = e.target.closest('dialog');
    if (dialog) openDialog(dialog);
    e.target.closest('[data-slide]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
  document.addEventListener('shopify:section:select', (e) => {
    const dialog = e.target.querySelector('dialog[data-editor-open]');
    if (dialog) openDialog(dialog);
  });
  document.addEventListener('shopify:section:deselect', (e) => {
    const dialog = e.target.querySelector('dialog[open]');
    if (dialog) closeDialog(dialog);
  });
}

export { theme };
