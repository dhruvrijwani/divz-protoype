/* Intellect · product.js
   Variant picker (Shopify option values, combined listings), media gallery, lightbox,
   quantity steppers, pickup availability and complementary products. */

import { $$, define, emit, parseHTML, openDialog, motionOn, isDesktop, scrollToY, theme, formatMoney } from '@theme/core';
import { Cart } from '@theme/cart';
import { initMotion } from '@theme/motion';

/* ---------- Variant picker ---------- */
class VariantPicker extends HTMLElement {
  connectedCallback() {
    this.addEventListener('change', (e) => this.onChange(e.target));
  }

  selectedValueIds() {
    return $$('fieldset', this)
      .map((fs) => fs.querySelector('select')?.value || fs.querySelector('input:checked')?.value)
      .filter(Boolean);
  }

  async onChange(target) {
    const fieldset = target.closest('fieldset');
    const label = fieldset?.querySelector('[data-option-label]');
    const option = target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
    if (label) label.textContent = option.dataset.optionValue || option.textContent.split(' — ')[0].trim();

    const root = this.closest('[data-product-root]');
    const sectionId = this.dataset.sectionId;
    const productUrl = option.dataset.productUrl || this.dataset.productUrl;
    const focusedId = document.activeElement?.id;

    this.controller?.abort();
    this.controller = new AbortController();
    root.classList.add('is-updating');
    try {
      const url = `${productUrl}?section_id=${sectionId}&option_values=${this.selectedValueIds().join(',')}`;
      const doc = parseHTML(await fetch(url, { signal: this.controller.signal }).then((r) => r.text()));
      const variant = JSON.parse(doc.querySelector('[data-selected-variant]')?.textContent || 'null');

      if (productUrl !== this.dataset.productUrl) {
        // Combined listing: a different product, so swap the whole section.
        const next = doc.querySelector('[data-product-root]');
        if (next) {
          root.replaceWith(next);
          window.Shopify?.PaymentButton?.init?.();
          history.replaceState({}, '', variant ? `${productUrl}?variant=${variant.id}` : productUrl);
          if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
          emit('variant:change', { variant, sectionId, root: next });
        }
        return;
      }

      updateSection(root, doc, variant);
      if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
      if (variant && root.closest('.main')) {
        const u = new URL(location.href);
        u.searchParams.set('variant', variant.id);
        history.replaceState({}, '', u);
      }
      emit('variant:change', { variant, sectionId, root });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    } finally {
      root.classList.remove('is-updating');
    }
  }
}
define('variant-picker', VariantPicker);

/* ---------- Size chart: cm/in switch, and the shopper's selected size highlighted ---------- */
class SizeChart extends HTMLElement {
  connectedCallback() {
    this.base = this.dataset.unit === 'in' ? 'in' : 'cm';
    const unitRe = /\b(cm|in|inch|inches)\b/i;
    const heads = $$('thead th', this);
    this.cols = heads.map((th, i) => (unitRe.test(th.textContent) ? i : -1)).filter((i) => i > 0);
    heads.forEach((th) => (th.dataset.text = th.textContent));
    $$('tbody tr', this).forEach((tr) => [...tr.children].forEach((c) => (c.dataset.text = c.textContent)));
    const unitBox = $$('[data-unit-btn]', this);
    if (!this.cols.length) unitBox[0]?.parentElement.remove();
    unitBox.forEach((b) => b.addEventListener('click', () => this.show(b.dataset.unitBtn, true)));
    let saved = null;
    try { saved = localStorage.getItem('theme:size-unit'); } catch {}
    if (saved && saved !== this.base && this.cols.length) this.show(saved);
    this.closest('dialog')?.addEventListener('dialog:open', () => this.markCurrent());
  }

  show(unit, remember = false) {
    const convert = (text) => {
      if (unit === this.base) return text;
      return text.replace(/\d+(?:[.,]\d+)?/g, (n) => {
        const v = parseFloat(n.replace(',', '.'));
        const out = unit === 'in' ? Math.round((v / 2.54) * 2) / 2 : Math.round(v * 2.54);
        return String(out);
      });
    };
    $$('thead th', this).forEach((th, i) => {
      if (this.cols.includes(i)) th.textContent = unit === this.base ? th.dataset.text : th.dataset.text.replace(/\b(cm|in|inch|inches)\b/i, unit);
    });
    $$('tbody tr', this).forEach((tr) => [...tr.children].forEach((c, i) => {
      if (this.cols.includes(i)) c.textContent = convert(c.dataset.text);
    }));
    $$('[data-unit-btn]', this).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.unitBtn === unit)));
    if (remember) try { localStorage.setItem('theme:size-unit', unit); } catch {}
  }

  // Highlight the row for the size the shopper has picked on this product.
  markCurrent() {
    const root = this.closest('[data-product-root]') || this.closest('.shopify-section') || document;
    const picked = $$('[data-option-label]', root).map((l) => l.textContent.trim().toLowerCase());
    $$('tbody tr', this).forEach((tr) => {
      const on = picked.includes(tr.dataset.size);
      tr.classList.toggle('is-current', on);
      if (on) tr.firstElementChild.dataset.label = theme.strings.sizeSelected || '';
    });
  }
}
define('size-chart', SizeChart);

function updateSection(root, doc, variant) {
  ['[data-price-wrap]', '[data-inventory]', '[data-sku]', '[data-variant-picker]'].forEach((selector) => {
    const next = doc.querySelector(selector);
    const current = root.querySelector(selector);
    if (next && current) current.replaceWith(next);
  });

  const form = root.querySelector('[data-buy-buttons]');
  const nextForm = doc.querySelector('[data-buy-buttons]');
  if (form && nextForm) {
    const idInput = form.querySelector('[data-variant-id]');
    const nextId = nextForm.querySelector('[data-variant-id]');
    if (idInput && nextId) {
      idInput.value = nextId.value;
      idInput.disabled = nextId.disabled;
    }
    const button = form.querySelector('[data-add-button]');
    const nextButton = nextForm.querySelector('[data-add-button]');
    if (button && nextButton) {
      button.disabled = nextButton.disabled;
      const labelEl = button.querySelector('[data-add-label]');
      const nextLabel = nextButton.querySelector('[data-add-label]');
      if (labelEl && nextLabel && labelEl.textContent !== nextLabel.textContent) {
        labelEl.textContent = nextLabel.textContent;
        labelEl.dataset.text = nextLabel.textContent;
      }
    }
    form.querySelector('.buy-buttons__dynamic')?.classList.toggle('is-hidden', !variant?.available);
  }

  const pickup = root.querySelector('pickup-availability');
  if (pickup && variant) {
    pickup.dataset.variantId = variant.id;
    pickup.hidden = !variant.available;
    pickup.load();
  }

  if (variant?.featured_media) root.querySelector('media-gallery')?.showMedia(variant.featured_media.id, variant);
}

/* ---------- Media gallery ---------- */
class MediaGallery extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-gallery-track]');
    this.items = $$('.gallery__item', this);
    this.dots = $$('.gallery__dot', this);
    this.counter = this.querySelector('[data-gallery-current]');
    this.layout = this.dataset.layout;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && this.isHorizontal()) this.setActive(this.visibleItems().indexOf(entry.target));
        });
      },
      { root: this.track, threshold: 0.6 }
    );
    this.items.forEach((item) => this.observer.observe(item));

    this.querySelector('[data-gallery-prev]')?.addEventListener('click', () => this.step(-1));
    this.querySelector('[data-gallery-next]')?.addEventListener('click', () => this.step(1));
    this.addEventListener('click', (e) => {
      const thumb = e.target.closest('[data-thumb]');
      if (thumb) return this.scrollToItem(this.items.find((i) => i.dataset.mediaId === thumb.dataset.thumb));
      const zoom = e.target.closest('[data-zoom]') || (isDesktop() && e.target.closest('.gallery__item[data-media-type="image"] img'));
      if (zoom) this.openLightbox(e.target.closest('.gallery__item').dataset.mediaId);
    });

    const picker = this.closest('[data-product-root]')?.querySelector('variant-picker');
    if (this.dataset.hideVariants === 'true' && picker) {
      const variant = JSON.parse(picker.querySelector('[data-selected-variant]')?.textContent || 'null');
      this.filterByColour(variant);
    }
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  isHorizontal() {
    return !isDesktop() || this.layout === 'carousel' || this.layout === 'thumbs';
  }

  visibleItems() {
    return this.items.filter((i) => !i.hidden);
  }

  setActive(index) {
    if (index < 0) return;
    this.index = index;
    const items = this.visibleItems();
    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    this.dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    if (this.counter) this.counter.textContent = index + 1;
    const id = items[index]?.dataset.mediaId;
    $$('[data-thumb]', this).forEach((t) => t.classList.toggle('is-active', t.dataset.thumb === id));
    const prev = this.querySelector('[data-gallery-prev]');
    const next = this.querySelector('[data-gallery-next]');
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === items.length - 1;
    // Only the active video plays.
    this.items.forEach((item) => {
      const video = item.querySelector('video');
      if (!video) return;
      item.classList.contains('is-active') ? video.play().catch(() => {}) : video.pause();
    });
  }

  step(direction) {
    const items = this.visibleItems();
    this.scrollToItem(items[Math.max(0, Math.min(items.length - 1, (this.index || 0) + direction))]);
  }

  scrollToItem(item, smooth = true) {
    if (!item) return;
    if (this.isHorizontal()) {
      this.track.scrollTo({ left: item.offsetLeft - this.track.offsetLeft, behavior: smooth && motionOn() ? 'smooth' : 'auto' });
    }
    this.setActive(this.visibleItems().indexOf(item));
  }

  showMedia(mediaId, variant) {
    if (this.dataset.hideVariants === 'true') this.filterByColour(variant);
    const item = this.items.find((i) => i.dataset.mediaId === String(mediaId));
    if (!item) return;
    if (this.isHorizontal()) return this.scrollToItem(item);
    // Stacked and grid layouts: bring the variant's image to the top, with a soft crossfade.
    if (this.track.firstElementChild !== item) {
      this.track.prepend(item);
      this.items = $$('.gallery__item', this);
      if (motionOn()) item.animate([{ opacity: 0.2, transform: 'scale(1.02)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    const top = this.getBoundingClientRect().top;
    if (top < 0) scrollToY(window.scrollY + top - 100);
  }

  filterByColour(variant) {
    if (!variant) return;
    const values = new Set(
      $$('variant-picker [data-option-value]', this.closest('[data-product-root]')).map((i) => i.dataset.optionValue.toLowerCase())
    );
    const selected = variant.options.map((o) => o.toLowerCase());
    this.items.forEach((item) => {
      const alt = item.dataset.mediaAlt;
      item.hidden = Boolean(alt && values.has(alt) && !selected.includes(alt));
    });
    this.dots.forEach((dot, i) => (dot.hidden = i >= this.visibleItems().length));
  }

  openLightbox(mediaId) {
    const section = this.closest('[data-section-id]');
    const box = section && document.getElementById(`Lightbox-${section.dataset.sectionId}`);
    if (!box) return;
    openDialog(box);
    const target = box.querySelector(`[data-lightbox-id="${mediaId}"]`);
    requestAnimationFrame(() => target?.scrollIntoView({ block: 'start' }));
  }
}
define('media-gallery', MediaGallery);

/* ---------- Quantity steppers on the product form ---------- */
document.addEventListener('click', (e) => {
  const step = e.target.closest('[data-qty] [data-step]');
  if (!step) return;
  const input = step.closest('[data-qty]').querySelector('input');
  const inc = Number(input.step) || 1;
  const min = Number(input.min) || 1;
  const max = input.max ? Number(input.max) : Infinity;
  input.value = Math.min(max, Math.max(min, Number(input.value) + inc * Number(step.dataset.step)));
  input.dispatchEvent(new Event('change', { bubbles: true }));
});

/* ---------- Pickup availability ---------- */
class PickupAvailability extends HTMLElement {
  connectedCallback() {
    this.load();
  }
  async load() {
    if (this.hidden || !this.dataset.variantId) return;
    try {
      const url = `${this.dataset.baseUrl}variants/${this.dataset.variantId}/?section_id=pickup-availability`;
      const doc = parseHTML(await fetch(url).then((r) => r.text()));
      const content = doc.querySelector('[data-pickup]');
      this.innerHTML = content ? content.innerHTML : '';
    } catch {
      this.innerHTML = '';
    }
  }
}
define('pickup-availability', PickupAvailability);

/* ---------- Complementary products ---------- */
class ProductRecommendations extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('[data-recommendations-content]') || !this.dataset.url) return;
    const io = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      try {
        const doc = parseHTML(await fetch(this.dataset.url).then((r) => r.text()));
        const holder = doc.querySelector(`[data-block-id="${this.dataset.blockId}"] [data-recommendations-content]`) || doc.querySelector('[data-recommendations-content]');
        if (holder) {
          this.append(holder);
          initMotion(holder);
          if (motionOn()) holder.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
        }
      } catch {}
    }, { rootMargin: '400px 0px' });
    io.observe(this);
  }
}
define('product-recommendations', ProductRecommendations);

/* Gift card recipients: send the shopper's timezone offset. */
$$('[data-tz-offset]').forEach((input) => (input.value = new Date().getTimezoneOffset().toString()));

/* Remember this product for the "Recently viewed" section. */
const productRoot = document.querySelector('.main [data-product-root][data-product-url]');
if (productRoot) {
  try {
    const handle = productRoot.dataset.productUrl.split('/products/')[1]?.split(/[?#]/)[0];
    const list = JSON.parse(localStorage.getItem('theme:recent') || '[]').filter((h) => h !== handle);
    if (handle) localStorage.setItem('theme:recent', JSON.stringify([handle, ...list].slice(0, 16)));
  } catch {}
}

/* ---------- Delivery estimate ---------- */
// Works in the store's time zone: if it's before the cutoff on a dispatch day, the order
// ships today; otherwise on the next dispatch day. Arrival adds business days.
const DAY = 864e5;
class DeliveryEstimate extends HTMLElement {
  connectedCallback() {
    this.cutoff = Number(this.dataset.cutoff);
    const [h, m] = this.dataset.offset.replace(/^[+-]/, '').split(':').map(Number);
    this.offsetMs = (this.dataset.offset.startsWith('-') ? -1 : 1) * (h * 60 + (m || 0)) * 6e4;
    this.weekends = this.dataset.weekends === 'true';
    this.holidays = new Set((this.dataset.holidays || '').split(',').map((s) => s.trim()).filter(Boolean));
    this.fmt = new Intl.DateTimeFormat(this.dataset.locale || undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    this.update();
    this.timer = setInterval(() => this.update(), 1000);
  }
  disconnectedCallback() {
    clearInterval(this.timer);
  }
  // "Store time" as a UTC date whose fields read like the store's wall clock.
  storeNow() {
    return new Date(Date.now() + this.offsetMs);
  }
  isWorkday(d) {
    const day = d.getUTCDay();
    if (!this.weekends && (day === 0 || day === 6)) return false;
    return !this.holidays.has(d.toISOString().slice(0, 10));
  }
  addWorkdays(d, n) {
    const out = new Date(d);
    let left = n;
    while (left > 0) {
      out.setTime(out.getTime() + DAY);
      if (this.isWorkday(out)) left -= 1;
    }
    return out;
  }
  update() {
    const now = this.storeNow();
    const cutoffToday = new Date(now);
    cutoffToday.setUTCHours(this.cutoff, 0, 0, 0);
    let dispatch = new Date(now);
    let ms = cutoffToday - now;
    if (!(this.isWorkday(now) && ms > 0)) {
      dispatch = new Date(now);
      do dispatch.setTime(dispatch.getTime() + DAY);
      while (!this.isWorkday(dispatch));
      dispatch.setUTCHours(this.cutoff, 0, 0, 0);
      ms = dispatch - now;
    }
    const from = this.addWorkdays(dispatch, Number(this.dataset.min));
    const to = this.addWorkdays(dispatch, Number(this.dataset.max));
    const date = +from === +to ? this.fmt.format(from) : this.dataset.textRange.replace('[from]', this.fmt.format(from)).replace('[to]', this.fmt.format(to));
    const text = this.querySelector('[data-delivery-text]');
    if (ms < 6 * 36e5) {
      const hrs = Math.floor(ms / 36e5);
      const mins = Math.floor((ms % 36e5) / 6e4);
      const secs = Math.floor((ms % 6e4) / 1e3);
      const time = hrs > 0 ? `${hrs}h ${String(mins).padStart(2, '0')}m` : `${mins}m ${String(secs).padStart(2, '0')}s`;
      text.innerHTML = this.dataset.textCountdown.replace('[time]', `<strong>${time}</strong>`).replace('[date]', `<strong>${date}</strong>`);
    } else {
      text.innerHTML = this.dataset.textArrives.replace('[date]', `<strong>${date}</strong>`);
    }
    this.hidden = false;
  }
}
define('delivery-estimate', DeliveryEstimate);

/* ---------- Buy bar ---------- */
class BuyBar extends HTMLElement {
  connectedCallback() {
    this.root = document.querySelector(`[data-section-id="${this.dataset.sectionId}"][data-product-root]`);
    if (!this.root) return;
    this.smart = this.dataset.mode === 'smart';
    this.mainButton = () => this.root.querySelector('[data-add-button]');

    this.querySelector('[data-bar-add]')?.addEventListener('click', () => this.add());
    this.querySelector('[data-bar-select]')?.addEventListener('change', (e) => this.choose(e.target));
    document.addEventListener('theme:variant:change', (e) => this.sync(e.detail));

    const watch = this.root.querySelector('.buy-buttons') || this.mainButton();
    this.io = new IntersectionObserver(([entry]) => {
      const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      this.toggle(past);
    });
    if (watch) this.io.observe(watch);

    if (this.smart) {
      this.buildNav();
      this.progress = this.querySelector('[data-bar-progress]');
      this.onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (this.progress) this.progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      };
      window.addEventListener('scroll', this.onScroll, { passive: true });
    }
  }

  disconnectedCallback() {
    this.io?.disconnect();
    this.spy?.disconnect();
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
  }

  toggle(show) {
    if (show === this.classList.contains('is-visible')) return;
    this.classList.toggle('is-visible', show);
    this.toggleAttribute('inert', !show);
    document.documentElement.classList.toggle('has-buy-bar', show);
    if (show && this.smart && motionOn()) this.morph();
  }

  // A ghost of the main button flies into the bar's button.
  morph() {
    const from = this.mainButton()?.getBoundingClientRect();
    const target = this.querySelector('[data-bar-add]');
    if (!from || !target) return;
    requestAnimationFrame(() => {
      const to = target.getBoundingClientRect();
      if (!to.width) return;
      const ghost = document.createElement('div');
      ghost.className = 'buy-bar__ghost';
      ghost.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;
      document.body.append(ghost);
      ghost.animate(
        [
          { transform: 'none', opacity: 1 },
          { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`, opacity: 0.2 },
        ],
        { duration: 620, easing: 'cubic-bezier(.65,0,.35,1)' }
      ).finished.then(() => ghost.remove());
      target.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: 620 });
    });
  }

  add() {
    const form = this.root.querySelector('[data-buy-buttons] form');
    const main = this.mainButton();
    if (!form || main?.disabled) {
      this.root.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto' });
      return;
    }
    const barBtn = this.querySelector('[data-bar-add]');
    barBtn.classList.add('is-loading');
    const done = () => barBtn.classList.remove('is-loading');
    document.addEventListener('theme:cart:added', done, { once: true });
    setTimeout(done, 4000);
    form.requestSubmit(main || undefined);
  }

  // Pick the same options in the main picker, which re-renders price, stock and media.
  choose(select) {
    const option = select.selectedOptions[0];
    const values = (option.dataset.options || '').split('|');
    const picker = this.root.querySelector('variant-picker');
    if (!picker) return;
    let last = null;
    picker.querySelectorAll('fieldset').forEach((fs, i) => {
      const sel = fs.querySelector('select');
      if (sel) {
        const match = [...sel.options].find((o) => o.textContent.trim().split(' — ')[0] === values[i]);
        if (match) sel.value = match.value;
        last = sel;
        return;
      }
      const input = [...fs.querySelectorAll('input[type="radio"]')].find((r) => r.dataset.optionValue === values[i]);
      if (input) {
        input.checked = true;
        last = input;
      }
    });
    last?.dispatchEvent(new Event('change', { bubbles: true }));
  }

  sync({ variant, root }) {
    if (!variant || (root && root !== this.root && !this.root.contains(root))) return;
    const price = this.root.querySelector('[data-price-wrap] [data-price]');
    const barPrice = this.querySelector('[data-bar-price]');
    if (price && barPrice) barPrice.innerHTML = price.outerHTML;
    const label = this.querySelector('[data-bar-variant]');
    if (label) label.textContent = variant.title;
    const select = this.querySelector('[data-bar-select]');
    if (select) select.value = variant.id;
    const btn = this.querySelector('[data-bar-add]');
    if (btn) {
      btn.disabled = !variant.available;
      this.querySelector('[data-bar-label]').textContent = variant.available ? theme.strings.addToCart : theme.strings.soldOut;
    }
    const img = this.querySelector('.buy-bar__thumb img');
    if (img && variant.featured_media?.preview_image?.src) {
      img.removeAttribute('srcset');
      img.src = `${variant.featured_media.preview_image.src}${variant.featured_media.preview_image.src.includes('?') ? '&' : '?'}width=120`;
    }
  }

  // Links to the sections below the product, with a pill that follows the one in view.
  buildNav() {
    const nav = this.querySelector('[data-bar-nav]');
    if (!nav) return;
    const targets = $$('.main > .shopify-section').filter((s) => !s.contains(this.root) && s.querySelector('h2') && s.offsetHeight > 120).slice(0, 4);
    if (targets.length < 2) return;
    const pill = nav.querySelector('.buy-bar__pill');
    const links = targets.map((section) => {
      if (!section.id) section.id = `s-${Math.random().toString(36).slice(2, 8)}`;
      const a = document.createElement('a');
      a.href = `#${section.id}`;
      a.className = 'buy-bar__link';
      a.textContent = section.querySelector('h2').getAttribute('aria-label') || section.querySelector('h2').textContent.replace(/\s+/g, ' ').trim().slice(0, 24);
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const y = section.getBoundingClientRect().top + scrollY - 80;
        scrollToY(y);
      });
      nav.append(a);
      return a;
    });
    nav.hidden = false;
    const movePill = (a) => {
      if (!a) return (pill.style.opacity = '0');
      pill.style.opacity = '1';
      pill.style.width = `${a.offsetWidth}px`;
      pill.style.transform = `translateX(${a.offsetLeft}px)`;
      links.forEach((l) => l.classList.toggle('is-active', l === a));
    };
    this.spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) movePill(links[targets.indexOf(e.target)]);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => this.spy.observe(t));
  }
}
define('buy-bar', BuyBar);

/* ---------- Gift Mode ---------- */
class GiftMode extends HTMLElement {
  connectedCallback() {
    this.root = this.closest('[data-product-root]');
    this.toggle = this.querySelector('[data-gift-toggle]');
    this.panel = this.querySelector('[data-gift-panel]');
    this.fields = $$('[data-gift-to], [data-gift-from], [data-gift-message]', this);
    this.starters = (this.dataset.starterText || '').split(/\r?\n/);

    this.toggle.addEventListener('change', () => this.setOn(this.toggle.checked));
    this.addEventListener('input', () => this.preview());
    this.addEventListener('change', (e) => {
      if (e.target.name?.startsWith('gift-wrap-')) this.paintWrap();
      if (e.target.matches('[data-gift-date-toggle]')) this.toggleDates(e.target.checked);
    });
    this.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-occasion]');
      if (chip) this.typeStarter(Number(chip.dataset.occasion), chip);
    });

    this.onSubmit = (e) => {
      const form = e.target.querySelector?.('form');
      // form.id would return the input named "id", so read the attribute.
      if (!this.toggle.checked || form?.getAttribute('id') !== this.dataset.form) return;
      e.detail.after.push(() => this.addExtras());
      this.seal();
    };
    document.addEventListener('product-form:submit', this.onSubmit);
  }

  disconnectedCallback() {
    document.removeEventListener('product-form:submit', this.onSubmit);
    clearInterval(this.typing);
  }

  setOn(on) {
    this.fields.forEach((f) => (f.disabled = !on));
    this.root?.classList.toggle('is-gift', on);
    if (on) {
      this.panel.hidden = false;
      this.ensureWrap();
      this.paintWrap();
      this.preview();
      if (motionOn()) {
        this.panel.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' });
        $$('.gift__group', this.panel).forEach((g, i) => g.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 80 * i, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
      }
    } else {
      this.panel.hidden = true;
    }
    this.summary();
  }

  // Paper, ribbon, bow and a tag laid over the product photo.
  ensureWrap() {
    const host = this.root?.querySelector('.gallery__item.is-active .media, .gallery__item .media');
    if (!host || host.querySelector('.gift-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'gift-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <span class="gift-wrap__paper gift-wrap__paper--l"></span>
      <span class="gift-wrap__paper gift-wrap__paper--r"></span>
      <span class="gift-wrap__ribbon gift-wrap__ribbon--v"></span>
      <span class="gift-wrap__ribbon gift-wrap__ribbon--h"></span>
      <svg class="gift-wrap__bow" viewBox="0 0 120 70"><path d="M60 35C42 8 14 4 10 18c-4 14 22 22 50 17Zm0 0c18-27 46-31 50-17 4 14-22 22-50 17Z"/><path d="M60 35 44 66l9-2 7 6M60 35l16 31-9-2-7 6"/><circle cx="60" cy="35" r="7"/></svg>
      <span class="gift-wrap__tag"><span data-tag-text></span></span>`;
    host.append(wrap);
    this.wrapEl = wrap;
  }

  paintWrap() {
    const input = this.querySelector('input[name^="gift-wrap-"]:checked');
    if (!this.wrapEl) return;
    const color = input?.dataset.wrapColor || '#c8a77c';
    this.wrapEl.style.setProperty('--paper', color.startsWith('url') ? '#c8a77c' : color);
    this.wrapEl.style.setProperty('--paper-img', input?.dataset.wrapImage ? `url("${input.dataset.wrapImage}")` : 'none');
    this.summary();
  }

  preview() {
    const to = this.querySelector('[data-gift-to]')?.value.trim();
    const from = this.querySelector('[data-gift-from]')?.value.trim();
    const msg = this.querySelector('[data-gift-message]');
    this.querySelector('[data-card-to]').textContent = to || '…';
    this.querySelector('[data-card-from]').textContent = from || '…';
    const cardMsg = this.querySelector('[data-card-msg]');
    if (msg?.value.trim()) cardMsg.textContent = msg.value;
    const count = this.querySelector('[data-gift-count]');
    if (count && msg) count.textContent = `${msg.value.length} / ${msg.maxLength}`;
    const tag = this.wrapEl?.querySelector('[data-tag-text]');
    if (tag) tag.textContent = to ? theme.strings.giftFor.replace('[name]', to) : theme.strings.giftWrapped;
  }

  typeStarter(index, chip) {
    const msg = this.querySelector('[data-gift-message]');
    const text = this.starters[index]?.trim();
    if (!msg || !text) return;
    $$('[data-occasion]', this).forEach((c) => c.classList.toggle('is-active', c === chip));
    clearInterval(this.typing);
    if (!motionOn()) {
      msg.value = text;
      this.preview();
      return;
    }
    msg.value = '';
    let i = 0;
    this.typing = setInterval(() => {
      msg.value = text.slice(0, ++i);
      this.preview();
      if (i >= text.length) clearInterval(this.typing);
    }, 18);
  }

  toggleDates(on) {
    const box = this.querySelector('[data-gift-dates]');
    if (!box) return;
    box.hidden = !on;
    if (on && !box.children.length) {
      const fmt = new Intl.DateTimeFormat(this.dataset.locale || undefined, { weekday: 'short', day: 'numeric', month: 'short' });
      const day = new Date();
      day.setDate(day.getDate() + Number(this.dataset.leadDays || 2));
      let made = 0;
      while (made < 14) {
        if (!(this.dataset.skipSundays === 'true' && day.getDay() === 0)) {
          const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
          const [wd, ...rest] = fmt.format(day).replace(',', '').split(' ');
          box.insertAdjacentHTML('beforeend', `<label class="gift__date"><input type="radio" name="gift-date-${this.dataset.form}" value="${iso}" ${made === 0 ? 'checked' : ''}><span class="caption">${wd}</span><span>${rest.join(' ')}</span></label>`);
          made += 1;
        }
        day.setDate(day.getDate() + 1);
      }
      if (motionOn()) $$('.gift__date', box).forEach((d, i) => d.animate([{ opacity: 0, transform: 'translateX(12px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 25, fill: 'backwards', easing: 'cubic-bezier(.16,1,.3,1)' }));
    }
    this.summary();
  }

  summary() {
    const el = this.querySelector('[data-gift-summary]');
    if (!el) return;
    if (!this.toggle.checked) return (el.textContent = '');
    const wrap = this.querySelector('input[name^="gift-wrap-"]:checked');
    const date = this.querySelector('[data-gift-dates]:not([hidden]) input:checked');
    const parts = [];
    if (wrap) parts.push(`${wrap.dataset.wrapTitle}${Number(wrap.dataset.wrapPrice) ? ` (+${formatMoney(Number(wrap.dataset.wrapPrice))})` : ''}`);
    if (this.querySelector('[data-gift-hide]')?.checked) parts.push(theme.strings.giftHidden);
    if (date) parts.push([...date.closest('label').querySelectorAll('span')].map((s) => s.textContent).join(' '));
    el.textContent = parts.join(' · ');
  }

  seal() {
    if (!motionOn() || !this.wrapEl) return;
    this.wrapEl.querySelector('.gift-wrap__tag')?.animate([{ transform: 'rotate(-8deg) scale(1)' }, { transform: 'rotate(-2deg) scale(1.18)' }, { transform: 'rotate(-8deg) scale(1)' }], { duration: 600, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  }

  async addExtras() {
    const wrap = this.querySelector('input[name^="gift-wrap-"]:checked');
    if (wrap && !wrap.disabled) {
      const data = new FormData();
      data.append('id', wrap.value);
      data.append('quantity', 1);
      data.append('properties[_wrap_for]', this.root?.querySelector('h1')?.textContent.trim() || '');
      await Cart.add(data).catch(() => {});
    }
    const attributes = { Gift: 'Yes' };
    const hide = this.querySelector('[data-gift-hide]');
    if (hide) attributes['Hide prices'] = hide.checked ? 'Yes' : 'No';
    const date = this.querySelector('[data-gift-dates]:not([hidden]) input:checked');
    if (date) attributes['Delivery date'] = date.value;
    await Cart.update({ attributes }).catch(() => {});
  }
}
define('gift-mode', GiftMode);

/* ---------- Personalisation ---------- */
class PersonaliseBlock extends HTMLElement {
  connectedCallback() {
    this.root = this.closest('[data-product-root]');
    this.toggle = this.querySelector('[data-personalise-toggle]');
    this.input = this.querySelector('[data-personalise-text]');
    this.inputs = $$('input', this).filter((i) => i !== this.toggle);
    this.allowed = new RegExp(`[^${this.dataset.pattern || 'A-Za-z0-9 .&\'-'}]`, 'g');

    this.toggle.addEventListener('change', () => this.setOn(this.toggle.checked));
    this.input.addEventListener('input', () => this.typed());
    this.addEventListener('change', (e) => {
      if (e.target !== this.toggle) this.paint(true);
    });
    this.onSubmit = (e) => {
      const form = e.target.querySelector?.('form');
      if (!this.toggle.checked || form?.getAttribute('id') !== this.dataset.form) return;
      if (!this.input.value.trim()) {
        this.error(theme.strings.personaliseEmpty);
        this.input.focus();
        e.detail.cancel = theme.strings.personaliseEmpty;
        return;
      }
      if (this.dataset.feeVariant) {
        e.detail.after.push(() => {
          const data = new FormData();
          data.append('id', this.dataset.feeVariant);
          data.append('quantity', 1);
          data.append('properties[_personalised]', this.input.value.trim());
          return Cart.add(data).catch(() => {});
        });
      }
    };
    document.addEventListener('product-form:submit', this.onSubmit);
  }

  disconnectedCallback() {
    document.removeEventListener('product-form:submit', this.onSubmit);
  }

  setOn(on) {
    this.inputs.forEach((i) => (i.disabled = !on));
    this.querySelector('[data-personalise-panel]').hidden = !on;
    this.root?.classList.toggle('is-personalised', on);
    if (on) {
      this.ensureStamp();
      this.paint();
      this.input.focus({ preventScroll: true });
    }
  }

  ensureStamp() {
    const host = this.root?.querySelector('.gallery__item.is-active .media, .gallery__item .media');
    if (!host || host.querySelector('.stamp')) {
      this.stamp = host?.querySelector('.stamp');
      return;
    }
    this.stamp = document.createElement('div');
    this.stamp.className = 'stamp';
    this.stamp.setAttribute('aria-hidden', 'true');
    this.stamp.innerHTML = '<span class="stamp__text"></span>';
    host.append(this.stamp);
  }

  typed() {
    const clean = this.input.value.replace(this.allowed, '');
    if (clean !== this.input.value) {
      this.input.value = clean;
      this.error(theme.strings.personaliseChars);
    } else this.error('');
    this.querySelector('[data-personalise-count]').textContent = `${this.input.value.length} / ${this.input.maxLength}`;
    $$('[data-sample]', this).forEach((s) => (s.textContent = this.input.value.slice(0, 3) || 'Aa'));
    this.paint(true);
  }

  paint(pressed) {
    if (!this.stamp) return;
    const text = this.input.value.trim();
    const font = this.querySelector('[data-font]:checked')?.dataset.font || 'heading';
    const finish = this.querySelector('[data-finish]:checked')?.dataset.finish || 'gold';
    const place = this.querySelector('[data-place]:checked')?.dataset.place || 'center';
    const y = Number(this.dataset.y) + (place === 'top' ? -22 : place === 'bottom' ? 22 : 0);
    this.stamp.style.setProperty('--x', `${this.dataset.x}%`);
    this.stamp.style.setProperty('--y', `${y}%`);
    this.stamp.dataset.font = font;
    this.stamp.dataset.finish = finish;
    const el = this.stamp.querySelector('.stamp__text');
    el.textContent = text;
    // Long names shrink to fit instead of overflowing.
    el.style.setProperty('--fit', Math.min(1, 9 / Math.max(text.length, 1)).toFixed(3));
    this.stamp.classList.toggle('is-empty', !text);
    if (pressed && text && motionOn()) {
      el.animate([{ transform: 'translate(-50%, -50%) scale(1.06)', filter: 'brightness(1.4)' }, { transform: 'translate(-50%, -50%) scale(1)', filter: 'none' }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
      this.stamp.classList.remove('is-sweeping');
      void this.stamp.offsetWidth;
      this.stamp.classList.add('is-sweeping');
    }
  }

  error(message) {
    const box = this.querySelector('[data-personalise-error]');
    box.hidden = !message;
    box.textContent = message;
  }
}
define('personalise-block', PersonaliseBlock);
