/* House of Zariva prototype: a stand-in for the parts of Shopify that Intellect's own scripts call.
   It answers the Cart AJAX API (cart.js, add, change, update) and Section Rendering requests
   (?section_id=…) from the browser, using the same templates as the pages, so the theme's real
   JavaScript (cart drawer, Gift Mode, buy bar, quick view, filters, search) runs unchanged.
   Prototype only: in the live store, Shopify itself answers these. */
import * as C from './catalog.js';
import * as R from './render.js';

window.Theme = {
  routes: { root: './', cart: 'cart.html', cartAdd: 'cart/add', cartChange: 'cart/change', cartUpdate: 'cart/update', search: 'search.html', predictiveSearch: 'search/suggest', recommendations: 'recommendations/products' },
  moneyFormat: '${{amount}}', moneyWithCurrencyFormat: '${{amount}} AUD', showCurrencyCode: false,
  cartType: 'drawer', cartOpenOnAdd: true, rankUpsells: true,
  strings: {
    addToCart: 'Add to bag', sizeSelected: 'Selected', added: 'Added', soldOut: 'Sold out', unavailable: 'Unavailable',
    cartError: 'Something went wrong. Please try again.', addedToCart: 'Added to your bag.', viewCart: 'View bag',
    rewardCloser: '[amount] closer to [reward]', rewardUnlocks: 'Unlocks [reward]', giftFor: 'For [name]', giftWrapped: 'Gift wrapped',
    giftHidden: 'Hide prices on the packing slip', personaliseEmpty: 'Add your text, or switch personalisation off.', personaliseChars: 'Some characters were removed.',
    codeCopied: 'Copied [code]', termsRequired: 'Please accept the terms to check out.', copied: 'Link copied',
  },
};

/* ---------- Cart state (Shopify keeps this server side) ---------- */
const KEY = 'zariva:shopify-cart';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { lines: [], note: '', attributes: {} }; } catch (e) { return { lines: [], note: '', attributes: {} }; } };
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
export function cartJSON(s = load()) {
  const items = s.lines.map((l, i) => {
    const hit = C.variantById(l.id);
    const { product: p, variant: v } = hit;
    return {
      key: `${l.id}:${i}`, id: v.id, variant_id: v.id, product_id: p.id, quantity: l.quantity, properties: l.properties || {},
      product_title: p.title, title: p.hasOnlyDefault ? p.title : `${p.title} - ${v.title}`, variant_title: p.hasOnlyDefault ? null : v.title,
      url: p.type === 'wrap' ? '#' : p.url, image: C.img(p.images[0]), price: v.price, original_price: v.compare_at_price || v.price,
      line_price: v.price * l.quantity, final_line_price: v.price * l.quantity, original_line_price: (v.compare_at_price || v.price) * l.quantity,
      options_with_values: p.options.map((o, k) => ({ name: o.name, value: v.options[k] })), product_has_only_default_variant: p.hasOnlyDefault, handle: p.handle,
    };
  });
  return { token: 'prototype', note: s.note, attributes: s.attributes, currency: 'AUD', items, item_count: items.reduce((a, i) => a + i.quantity, 0), total_price: items.reduce((a, i) => a + i.final_line_price, 0), requires_shipping: true };
}
const sectionsFor = (ids) => Object.fromEntries((ids || []).map((id) => [id, renderSection(id)]));

function addLine(s, id, quantity = 1, properties = {}) {
  const hit = C.variantById(id);
  if (!hit) throw new Error('This hamper is no longer available.');
  if (!hit.variant.available) throw new Error(`${hit.product.title} is sold out.`);
  const props = Object.fromEntries(Object.entries(properties).filter(([, v]) => v !== '' && v != null));
  const same = s.lines.find((l) => l.id === Number(id) && JSON.stringify(l.properties || {}) === JSON.stringify(props));
  if (same) same.quantity += Number(quantity) || 1;
  else s.lines.push({ id: Number(id), quantity: Number(quantity) || 1, properties: props });
  return s.lines.indexOf(same || s.lines[s.lines.length - 1]);
}

/* ---------- Section rendering ---------- */
function renderSection(id, url = new URL(location.href)) {
  const cart = cartJSON();
  const handle = (url.pathname.match(/\/products\/([^/?]+)/) || [])[1];
  const p = handle ? C.product(handle) : null;
  const variantFrom = (prod) => {
    const vals = (url.searchParams.get('option_values') || '').split(',').filter(Boolean).map(Number);
    return (vals.length && prod.variants.find((v) => vals.every((x) => v.valueIds.includes(x)))) || prod.firstAvailable;
  };
  switch (id) {
    case 'cart-drawer': return R.cartDrawer(cart);
    case 'main-cart': return `<div id="shopify-section-main-cart" class="shopify-section">${R.mainCart(cart)}</div>`;
    case 'product-main': return `<div id="shopify-section-product-main" class="shopify-section">${R.mainProduct(p, variantFrom(p), 'product-main')}</div>`;
    case 'quick-view': return R.quickView(p, variantFrom(p));
    case 'product-card': return `<div data-card-wrap>${R.card(p, 0)}</div>`;
    case 'predictive-search': return R.predictive(url.searchParams.get('q') || '');
    case 'cart-upsells': {
      const exclude = new Set(cart.items.map((i) => i.product_id));
      const intent = url.searchParams.get('intent');
      const pool = intent === 'related' ? C.hampers() : C.products.filter((x) => x.type === 'addon');
      return R.cartUpsells(pool.filter((x) => !exclude.has(x.id)).slice(0, 6));
    }
    case 'main-collection': {
      const st = collectionState(url.searchParams);
      return R.mainCollection(collectionBase(url.searchParams), st, collectionUrl(url.searchParams));
    }
    default: return `<div id="shopify-section-${id}"></div>`;
  }
}

/* ---------- Collections (filters arrive as Shopify's filter.* parameters) ---------- */
export function collectionBase(q) {
  const c = q.get('c') || (q.get('for') ? '' : 'all');
  if (q.get('for') && !c) return C.forWho(q.get('for'));
  if (!c || c === 'all') return C.hampers();
  return C.inOccasion(c);
}
export function collectionState(q) {
  return {
    who: q.getAll('filter.p.m.custom.recipients'), diet: q.getAll('filter.p.m.custom.dietary'),
    min: Number(q.get('filter.v.price.gte')) || 0, max: Number(q.get('filter.v.price.lte')) || 0, sort: q.get('sort_by') || 'manual',
  };
}
export const collectionUrl = (q) => `collection.html?${q.get('c') ? `c=${q.get('c')}` : q.get('for') ? `for=${q.get('for')}` : 'c=all'}`;

/* ---------- fetch ---------- */
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const html = (text) => new Response(text, { status: 200, headers: { 'Content-Type': 'text/html' } });
async function readBody(init) {
  const b = init.body;
  if (!b) return {};
  if (b instanceof FormData) {
    const out = { properties: {}, sections: '' };
    for (const [k, v] of b) {
      const it = k.match(/^items\[(\d+)\]\[(id|quantity)\]$/);
      const ip = k.match(/^items\[(\d+)\]\[properties\]\[(.+)\]$/);
      const m = k.match(/^properties\[(.+)\]$/);
      if (it || ip) {
        out.items = out.items || [];
        const i = Number((it || ip)[1]);
        out.items[i] = out.items[i] || { properties: {} };
        if (it) out.items[i][it[2]] = v; else out.items[i].properties[ip[2]] = v;
      } else if (m) out.properties[m[1]] = v;
      else out[k] = v;
    }
    return out;
  }
  return typeof b === 'string' ? JSON.parse(b) : b;
}
const realFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  const path = url.pathname;
  const sid = url.searchParams.get('section_id');
  try {
    if (/\/cart(\.html)?\.js$/.test(path)) return json(cartJSON());
    if (path.endsWith('/cart/add.js')) {
      const body = await readBody(init);
      const s = load();
      const items = body.items || [{ id: body.id, quantity: body.quantity, properties: body.properties }];
      const added = items.map((it) => addLine(s, it.id, it.quantity, it.properties || {}));
      save(s);
      const cart = cartJSON(s);
      const ids = (body.sections ? String(body.sections).split(',') : []);
      const item = cart.items[added[added.length - 1]];
      return json(body.items ? { items: added.map((i) => cart.items[i]), sections: sectionsFor(ids) } : { ...item, sections: sectionsFor(ids) });
    }
    if (path.endsWith('/cart/change.js')) {
      const body = await readBody(init);
      const s = load();
      const idx = body.line ? Number(body.line) - 1 : s.lines.findIndex((l, i) => `${l.id}:${i}` === body.id);
      if (idx > -1) { if (Number(body.quantity) <= 0) s.lines.splice(idx, 1); else s.lines[idx].quantity = Number(body.quantity); }
      save(s);
      return json({ ...cartJSON(s), sections: sectionsFor(body.sections) });
    }
    if (path.endsWith('/cart/update.js')) {
      const body = await readBody(init);
      const s = load();
      if (body.attributes) s.attributes = { ...s.attributes, ...body.attributes };
      if (body.note !== undefined) s.note = body.note;
      if (body.updates) Object.entries(body.updates).forEach(([k, q]) => { const l = s.lines.find((x, i) => `${x.id}:${i}` === k || String(x.id) === k); if (l) l.quantity = Number(q); });
      s.lines = s.lines.filter((l) => l.quantity > 0);
      save(s);
      return json({ ...cartJSON(s), sections: sectionsFor(body.sections) });
    }
    if (path.endsWith('/cart/clear.js')) { save({ lines: [], note: '', attributes: {} }); return json(cartJSON()); }
    if (sid) return html(renderSection(sid, url));
  } catch (err) {
    return json({ status: 422, message: err.message, description: err.message }, 422);
  }
  return realFetch(input, init);
};

/* ---------- The presentation's date switch ---------- */
addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'proto:date' && d.date) {
    let cur = null;
    try { cur = JSON.parse(localStorage.getItem('zariva:today')); } catch (err) {}
    if (cur !== d.date) { try { localStorage.setItem('zariva:today', JSON.stringify(d.date)); } catch (err) {} location.reload(); }
  }
  if (d.type === 'proto:festive') {
    let cur = '';
    try { cur = JSON.parse(localStorage.getItem('zariva:festive')) || ''; } catch (err) {}
    if (cur !== (d.moment || '')) {
      try {
        localStorage.setItem('zariva:festive', JSON.stringify(d.moment || ''));
        if (d.moment) sessionStorage.removeItem(`theme:moment-intro:${d.moment}`); // Santa flies in again when it is switched on
      } catch (err) {}
      location.reload();
    }
  }
});
