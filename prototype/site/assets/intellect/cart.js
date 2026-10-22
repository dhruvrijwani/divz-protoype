/* Intellect · cart.js
   Cart API, the cart drawer, cart page line items, product forms (product page and
   quick add), free-shipping progress, upsells and the fly-to-cart moment. */

import { $, $$, define, emit, on, theme, debounce, formatMoney, openDialog, closeDialog, toast, parseHTML, motionOn, fetchSection } from '@theme/core';

const routes = theme.routes;

/** Section ids that show cart contents on this page (drawer and/or cart page). */
const cartSections = () => [...new Set($$('[data-cart-section]').map((el) => el.dataset.cartSection))];

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: body instanceof FormData ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status) {
    const message = data.description || data.message || theme.strings.cartError;
    throw Object.assign(new Error(message), { data });
  }
  return data;
}

export const Cart = {
  async get() {
    const res = await fetch(`${routes.cart}.js`, { headers: { Accept: 'application/json' } });
    return res.json();
  },

  async add(formData) {
    const sections = cartSections();
    if (sections.length) {
      formData.append('sections', sections.join(','));
      formData.append('sections_url', location.pathname);
    }
    const data = await post(`${routes.cartAdd}.js`, formData);
    await render(data.sections);
    emit('cart:added', { item: data });
    return data;
  },

  async change(line, quantity) {
    const sections = cartSections();
    const data = await post(`${routes.cartChange}.js`, { line, quantity, sections, sections_url: location.pathname });
    await render(data.sections, data);
    emit('cart:changed', { cart: data });
    return data;
  },

  async update(body) {
    const sections = cartSections();
    const data = await post(`${routes.cartUpdate}.js`, { ...body, sections, sections_url: location.pathname });
    if (body.updates || body.attributes) await render(data.sections, data);
    return data;
  },
};

/** Swap fresh cart HTML into every cart section and update header counts. */
async function render(sections, cart) {
  let count = cart?.item_count;
  if (sections) {
    for (const [id, html] of Object.entries(sections)) {
      if (!html) continue;
      const doc = parseHTML(html);
      const next = doc.querySelector('[data-cart-content]');
      $$(`[data-cart-section="${id}"]`).forEach((holder) => {
        const current = holder.querySelector('[data-cart-content]');
        if (current && next) {
          const scroller = holder.querySelector('.drawer__body');
          const top = scroller?.scrollTop;
          current.replaceWith(next.cloneNode(true));
          const newScroller = holder.querySelector('.drawer__body');
          if (newScroller && top) newScroller.scrollTop = top;
        }
      });
      const countEl = doc.querySelector('[data-item-count]');
      if (countEl && count === undefined) count = Number(countEl.dataset.itemCount);
    }
  }
  if (count === undefined) count = (await Cart.get()).item_count;
  setCount(count);
  renderedAt = Date.now();
}
let renderedAt = Date.now();

// Apps can change the cart without the theme knowing. Re-read it when the drawer opens after a while,
// and when the browser restores this page from its back/forward cache (for example coming back from checkout).
document.addEventListener('dialog:open', (e) => {
  if (e.target.id === 'CartDrawer' && Date.now() - renderedAt > 4000) refreshCart();
});
window.addEventListener('pageshow', (e) => {
  if (e.persisted) refreshCart();
});

/** Re-render every cart section from the server (after errors or external changes). */
export async function refreshCart() {
  const sections = {};
  await Promise.all(cartSections().map(async (id) => {
    const url = new URL(location.href);
    url.searchParams.set('section_id', id);
    sections[id] = await fetch(url).then((r) => r.text()).catch(() => '');
  }));
  await render(sections);
}

function setCount(count) {
  $$('[data-cart-count]').forEach((el) => {
    const changed = el.textContent.trim() !== String(count);
    el.querySelector('span') ? (el.querySelector('span').textContent = count) : (el.textContent = count);
    el.hidden = count === 0;
    if (changed && count > 0) {
      el.classList.remove('is-bumping');
      void el.offsetWidth;
      el.classList.add('is-bumping');
    }
  });
}

export function openCart() {
  const drawer = document.getElementById('CartDrawer');
  if (drawer) openDialog(drawer);
  else location.href = routes.cart;
}

/* ---------- Fly to cart ---------- */
function flyToCart(source) {
  const target = $$('[data-cart-icon]').find((el) => el.offsetParent !== null);
  if (!source || !target || !motionOn()) return Promise.resolve();
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width) return Promise.resolve();
  const size = Math.min(from.width, 140);
  const ghost = document.createElement('div');
  ghost.style.cssText = `position:fixed;z-index:300;left:${from.left + from.width / 2 - size / 2}px;top:${from.top + from.height / 2 - size / 2}px;width:${size}px;height:${size}px;pointer-events:none;`;
  const img = document.createElement('img');
  img.src = source.currentSrc || source.src;
  img.alt = '';
  img.style.cssText = `width:100%;height:100%;object-fit:cover;border-radius:${Math.max(6, size / 8)}px;box-shadow:0 18px 40px -16px rgb(0 0 0/.45)`;
  ghost.append(img);
  document.body.append(ghost);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const duration = 760;
  // X travels evenly while Y eases in, which bends the path into an arc.
  const x = ghost.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], { duration, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
  img.animate(
    [
      { transform: 'translateY(0) scale(1)', opacity: 1 },
      { transform: `translateY(${dy * 0.15 - 60}px) scale(.7)`, opacity: 1, offset: 0.35 },
      { transform: `translateY(${dy}px) scale(.12)`, opacity: 0.4 },
    ],
    { duration, easing: 'cubic-bezier(.5,0,.8,.6)', fill: 'forwards' }
  );
  return x.finished.then(() => ghost.remove());
}

/* ---------- Product form ---------- */
class ProductForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => this.onSubmit(e));
  }

  async onSubmit(e) {
    if (theme.cartType === 'page' && !this.hasAttribute('data-quick')) return;
    e.preventDefault();
    const button = e.submitter || this.form.querySelector('[type="submit"]');
    if (!button || button.disabled || button.classList.contains('is-loading')) return;
    this.setError('');
    button.classList.add('is-loading');
    button.setAttribute('aria-busy', 'true');
    const source = this.closest('dialog') ? null : this.closest('[data-product-root]')?.querySelector('[data-fly-source] img, .card__img-1, img');
    try {
      const fly = flyToCart(source);
      // Other features (Gift Mode, Personalisation) can add lines or attributes alongside.
      const data = new FormData(this.form, e.submitter?.name ? e.submitter : undefined);
      const hooks = { data, after: [] };
      this.dispatchEvent(new CustomEvent('product-form:submit', { bubbles: true, detail: hooks }));
      if (hooks.cancel) throw new Error(hooks.cancel);
      await Cart.add(data);
      for (const step of hooks.after) await step();
      if (button.classList.contains('card__size')) {
        button.classList.add('is-added');
        setTimeout(() => button.classList.remove('is-added'), 1400);
      }
      await fly;
      this.dispatchEvent(new CustomEvent('product-form:added', { bubbles: true }));
      const quickView = this.closest('dialog');
      if (quickView && quickView.id !== 'CartDrawer') closeDialog(quickView);
      if (theme.cartType === 'drawer' && theme.cartOpenOnAdd && document.getElementById('CartDrawer')) {
        setTimeout(openCart, quickView ? 380 : 0);
      } else {
        toast(`${theme.strings.addedToCart} <a href="${routes.cart}">${theme.strings.viewCart}</a>`);
      }
    } catch (err) {
      this.setError(err.message);
    } finally {
      button.classList.remove('is-loading');
      button.removeAttribute('aria-busy');
    }
  }

  setError(message) {
    const box = this.querySelector('[data-form-error]');
    if (!box) {
      if (message) toast(message);
      return;
    }
    box.hidden = !message;
    box.querySelector('[data-message]').textContent = message;
  }
}
define('product-form', ProductForm);

/* ---------- Quick view (products with options) ---------- */
let quickDialog;
document.addEventListener('click', async (e) => {
  const trigger = e.target.closest('[data-quick-view]');
  if (!trigger) return;
  e.preventDefault();
  if (!quickDialog) {
    quickDialog = document.createElement('dialog');
    quickDialog.className = `drawer quick-view ${document.body.dataset.drawerScheme || ''}`;
    quickDialog.id = 'QuickView';
    quickDialog.setAttribute('aria-label', trigger.getAttribute('aria-label') || '');
    document.body.append(quickDialog);
  }
  trigger.classList.add('is-loading');
  try {
    const [doc] = await Promise.all([fetchSection('quick-view', trigger.dataset.quickView), import('@theme/product')]);
    const content = doc.querySelector('[data-quick-view-content]');
    quickDialog.replaceChildren(...(content ? content.childNodes : []));
    window.Shopify?.PaymentButton?.init?.(); // dynamic checkout buttons in the quick view
    openDialog(quickDialog, trigger);
  } catch (err) {
    location.href = trigger.dataset.quickView;
  } finally {
    trigger.classList.remove('is-loading');
  }
});

/* ---------- Cart drawer ---------- */
class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-cart-toggle]');
      if (!opener || !this.dialog) return;
      e.preventDefault();
      openDialog(this.dialog, opener);
    });
    this.dialog?.addEventListener('dialog:open', () => {
      this.querySelector('cart-upsells')?.load();
    });
  }
}
define('cart-drawer', CartDrawer);

/* ---------- Line items (drawer and page) ---------- */
class CartItems extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (e) => {
      const remove = e.target.closest('[data-remove-line]');
      const step = e.target.closest('[data-qty-step]');
      if (remove) {
        e.preventDefault();
        this.update(Number(remove.dataset.removeLine), 0);
      } else if (step) {
        const input = step.closest('.qty').querySelector('input');
        const value = Math.max(0, Number(input.value) + Number(step.dataset.qtyStep));
        input.value = value;
        this.queue(Number(input.dataset.line), value);
      }
    });
    this.addEventListener('change', (e) => {
      if (e.target.matches('[data-line]')) this.queue(Number(e.target.dataset.line), Math.max(0, Number(e.target.value)));
    });
    this.queue = debounce((line, qty) => this.update(line, qty), 350);
  }

  async update(line, quantity) {
    const row = this.querySelector(`[data-line-row="${line}"]`);
    if (quantity === 0 && row && motionOn()) {
      const h = row.offsetHeight;
      row.animate(
        [{ opacity: 1, height: `${h}px`, transform: 'none' }, { opacity: 0, height: '0px', transform: 'translateX(24px)', paddingBlock: 0, marginBlock: 0 }],
        { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }
      );
    }
    this.classList.add('is-busy');
    try {
      await Cart.change(line, quantity);
    } catch (err) {
      toast(err.message);
      refreshCart();
    } finally {
      this.classList.remove('is-busy');
    }
  }
}
define('cart-items', CartItems);

/* ---------- Reward ladder ---------- */
// Amounts are set in the store currency; Shopify.currency.rate converts them for shoppers
// paying in another currency. Gift rewards are added with the private _reward property.
const LADDER_KEY = 'theme:ladder';
let giftBusy = false;

class RewardLadder extends HTMLElement {
  connectedCallback() {
    const rate = Number(window.Shopify?.currency?.rate || 1);
    this.tiers = JSON.parse(this.dataset.tiers || '[]').map((t) => ({ ...t, amount: Math.round(t.amount * rate) }));
    this.giftLines = JSON.parse(this.dataset.giftLines || '[]');
    this.total = Number(this.dataset.total);
    if (!this.tiers.length) return;
    this.max = Math.max(...this.tiers.map((t) => t.amount));

    const unlocked = this.tiers.filter((t) => this.total >= t.amount).map((t) => t.n);
    const previous = JSON.parse(sessionStorage.getItem(LADDER_KEY) || 'null');
    sessionStorage.setItem(LADDER_KEY, JSON.stringify({ unlocked, pct: this.pct() }));

    this.paint(previous?.pct ?? this.pct());
    this.message();
    if (previous) {
      unlocked.filter((n) => !previous.unlocked.includes(n)).forEach((n) => this.celebrate(n));
      previous.unlocked.filter((n) => !unlocked.includes(n)).forEach((n) => this.shake(n));
    }
    const next = this.tiers.find((t) => this.total < t.amount);
    window.Theme.ladder = next ? { remaining: next.amount - this.total, label: next.label } : null;
    document.dispatchEvent(new CustomEvent('theme:ladder', { detail: window.Theme.ladder }));
    this.syncGifts(unlocked);
  }

  pct() {
    return Math.min(100, (this.total / this.max) * 100);
  }

  paint(from) {
    const fill = this.querySelector('[data-ladder-fill]');
    const to = this.pct();
    fill.style.width = `${to}%`;
    if (motionOn() && Math.abs(from - to) > 0.5) {
      fill.animate([{ width: `${from}%` }, { width: `${to}%` }], { duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    this.tiers.forEach((t) => this.querySelector(`[data-node="${t.n}"]`)?.classList.toggle('is-unlocked', this.total >= t.amount));
  }

  message() {
    const text = this.querySelector('[data-ladder-text]');
    const next = this.tiers.find((t) => this.total < t.amount);
    text.innerHTML = next
      ? this.dataset.textNext.replace('[amount]', `<strong>${formatMoney(next.amount - this.total)}</strong>`).replace('[reward]', `<strong>${next.label}</strong>`)
      : this.dataset.textDone;
    this.classList.toggle('is-complete', !next);
  }

  celebrate(n) {
    const node = this.querySelector(`[data-node="${n}"]`);
    const tier = this.tiers.find((t) => t.n === n);
    if (!node) return;
    node.classList.add('is-new');
    setTimeout(() => node.classList.remove('is-new'), 1200);
    const live = this.querySelector('[data-ladder-text]');
    if (live && tier) live.setAttribute('aria-label', this.dataset.textUnlocked.replace('[reward]', tier.label));
    if (!motionOn()) return;
    const dot = node.querySelector('.ladder__dot');
    const colours = ['var(--accent)', 'var(--text)', '#f2c14e', '#7ec8a5'];
    for (let i = 0; i < 16; i += 1) {
      const p = document.createElement('span');
      p.className = 'ladder__spark';
      p.style.background = colours[i % colours.length];
      dot.append(p);
      const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
      const dist = 26 + Math.random() * 22;
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0.2)`, opacity: 0 },
        ],
        { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.16,1,.3,1)' }
      ).finished.then(() => p.remove());
    }
  }

  shake(n) {
    const node = this.querySelector(`[data-node="${n}"] .ladder__dot`);
    if (node && motionOn()) node.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 420 });
  }

  // Add the gift when its reward unlocks, take it out when the cart drops below.
  // If the shopper removes the gift themselves, don't put it back this session.
  async syncGifts(unlocked) {
    if (giftBusy) return;
    for (const tier of this.tiers.filter((t) => t.type === 'gift' && t.gift)) {
      const line = this.giftLines.find((g) => String(g.tier) === String(tier.n));
      const addedKey = `theme:gift-added:${tier.n}`;
      const dismissedKey = `theme:gift-dismissed:${tier.n}`;
      const isUnlocked = unlocked.includes(tier.n);
      if (isUnlocked && !line) {
        if (sessionStorage.getItem(addedKey)) {
          sessionStorage.setItem(dismissedKey, '1');
          sessionStorage.removeItem(addedKey);
          continue;
        }
        if (sessionStorage.getItem(dismissedKey)) continue;
        giftBusy = true;
        try {
          const data = new FormData();
          data.append('id', tier.gift);
          data.append('quantity', 1);
          data.append('properties[_reward]', tier.n);
          sessionStorage.setItem(addedKey, '1');
          await Cart.add(data);
        } catch {
          sessionStorage.removeItem(addedKey);
        } finally {
          giftBusy = false;
        }
        return;
      }
      if (!isUnlocked && line) {
        giftBusy = true;
        try {
          sessionStorage.removeItem(addedKey);
          await Cart.change(line.line, 0);
        } finally {
          giftBusy = false;
        }
        return;
      }
    }
  }
}
define('reward-ladder', RewardLadder);

/* ---------- Upsells (Shopify recommendations for the first cart item) ---------- */
const upsellCache = new Map();
class CartUpsells extends HTMLElement {
  connectedCallback() {
    if (this.closest('dialog')?.open || !this.closest('dialog')) this.load();
  }

  async load() {
    const id = this.dataset.productId;
    if (!id || this.dataset.loaded === id) return;
    this.dataset.loaded = id;
    try {
      if (!upsellCache.has(id)) {
        const url = `${routes.recommendations}?product_id=${id}&limit=8&intent=complementary&section_id=cart-upsells`;
        let html = await fetch(url).then((r) => r.text());
        let doc = parseHTML(html);
        if (!doc.querySelector('[data-upsell-item]')) {
          html = await fetch(url.replace('intent=complementary', 'intent=related')).then((r) => r.text());
          doc = parseHTML(html);
        }
        upsellCache.set(id, doc.querySelector('[data-upsells]')?.innerHTML || '');
      }
      const inCart = (this.dataset.exclude || '').split(',');
      this.innerHTML = upsellCache.get(id);
      this.querySelectorAll('[data-upsell-item]').forEach((el, i) => {
        if (inCart.includes(el.dataset.upsellItem) || i > 5) el.remove();
      });
      this.hidden = !this.querySelector('[data-upsell-item]');
      this.rank();
    } catch {
      this.hidden = true;
    }
  }
}
define('cart-upsells', CartUpsells);

// Put the cheapest product that unlocks the next reward first, and say what each one does.
CartUpsells.prototype.rank = function rank() {
  const next = window.Theme.ladder;
  const list = this.querySelector('.cart-upsells__list');
  if (!next || !theme.rankUpsells || !list) return;
  const items = $$('[data-upsell-item]', list);
  const unlocks = items.filter((i) => Number(i.dataset.price) >= next.remaining).sort((a, b) => a.dataset.price - b.dataset.price);
  const rest = items.filter((i) => !unlocks.includes(i)).sort((a, b) => b.dataset.price - a.dataset.price);
  [...unlocks, ...rest].forEach((item) => {
    list.append(item);
    const tag = item.querySelector('[data-upsell-tag]');
    if (!tag) return;
    tag.textContent = Number(item.dataset.price) >= next.remaining
      ? theme.strings.rewardUnlocks.replace('[reward]', next.label)
      : theme.strings.rewardCloser.replace('[amount]', formatMoney(Number(item.dataset.price))).replace('[reward]', next.label);
    tag.hidden = false;
  });
};
document.addEventListener('theme:ladder', () => $$('cart-upsells').forEach((u) => u.rank?.()));

/* ---------- Notes and terms ---------- */
document.addEventListener('input', debounce((e) => {
  if (e.target.matches('[data-cart-note]')) Cart.update({ note: e.target.value });
}, 500));

document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-cart-form]');
  if (!form) return;
  const terms = form.querySelector('[data-cart-terms]');
  if (terms && !terms.checked) {
    e.preventDefault();
    toast(theme.strings.termsRequired);
    terms.focus();
  }
});

on('cart:refresh', () => refreshCart());

// Public hooks for apps and custom code: window.Theme.cart.refresh() re-renders the cart, .open() opens it.
window.Theme = window.Theme || {};
window.Theme.cart = { refresh: refreshCart, open: openCart };
