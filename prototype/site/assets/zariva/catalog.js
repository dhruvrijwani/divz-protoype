/* House of Zariva: the catalogue as Shopify would hold it (products, options, variants with ids),
   plus the Moments calendar. Data comes from data.js (window.ZARIVA). Sample content. */
const Z = window.ZARIVA;

/* ---------- Dates ---------- */
export const parse = (s) => new Date(s + 'T12:00:00');
export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const fmtLong = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
export const fmtShort = (d) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
export const days = (a, b) => Math.round((b - a) / 864e5);
const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
export const today = () => parse(new URLSearchParams(location.search).get('today') || read('zariva:today') || Z.today);

/* ---------- Moments: the occasion the site leads with ---------- */
export const moments = Z.moments;
export const always = Z.always;
export const recipients = Z.recipients;
export function momentState(m, t = today()) {
  const start = parse(m.date), end = parse(m.end || m.date), orderBy = parse(m.orderBy || m.date);
  return { start, end, orderBy, toDate: days(t, start), toOrder: days(t, orderBy), active: m.kind === 'sale' && t >= start && t <= end, orderable: t <= orderBy, past: t > end };
}
export const upcoming = (t = today()) => moments.filter((m) => !momentState(m, t).past).sort((a, b) => parse(a.date) - parse(b.date));
export function lead(t = today()) {
  for (const m of upcoming(t)) {
    const s = momentState(m, t);
    if (m.kind === 'sale') { if (s.active || s.toDate <= 10) return m; continue; }
    return s.toDate <= 50 ? m : null;
  }
  return null;
}
export const occasion = (id) => moments.find((m) => m.id === id) || always.find((m) => m.id === id) || null;
export const quietActive = () => { const q = occasion('quiet-week'); return q ? momentState(q).active : false; };

/* ---------- Products, with Shopify-style ids ---------- */
const hash = (s) => { let n = 7; for (const c of s) n = (n * 31 + c.charCodeAt(0)) % 9e6; return n; };
export const img = (key, w = 900) => `assets/img/${key}-${w > 900 ? 1700 : 900}.jpg`;
export const money = (cents) => '$' + (cents / 100).toLocaleString('en-AU', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 });

function build(p) {
  const id = hash(p.handle) * 10;
  const options = p.options.map((o, i) => ({
    name: o.name, position: i + 1, swatch: !!o.swatch,
    values: o.values.map((v, k) => ({ name: v.v, id: id * 100 + (i + 1) * 10 + k, hex: v.hex || null, note: v.note || '', add: v.add || 0, price: v.price || 0, compare: v.compare || 0 })),
  }));
  const combos = options.reduce((acc, o) => acc.flatMap((a) => o.values.map((v) => [...a, v])), [[]]);
  const onSale = quietActive() && p.occasions.includes('quiet-week');
  const variants = combos.map((vals, k) => {
    let price = p.price;
    for (const v of vals) { if (v.price) price = v.price; if (v.add) price += v.add; }
    const full = Math.round(price * 100);
    return {
      id: id * 1000 + k + 1, title: vals.map((v) => v.name).join(' / ') || 'Default Title', options: vals.map((v) => v.name), valueIds: vals.map((v) => v.id),
      price: onSale ? Math.round(full * 0.85 / 100) * 100 : full, compare_at_price: onSale ? full : (vals.find((v) => v.compare) ? Math.round(vals.find((v) => v.compare).compare * 100) : 0),
      available: !vals.some((v) => (p.soldOut || []).includes(v.name)),
    };
  });
  return {
    ...p, id, options, variants, onSale,
    url: `product.html?p=${p.handle}`, path: `/products/${p.handle}`,
    hasOnlyDefault: options.length === 0,
    firstAvailable: variants.find((v) => v.available) || variants[0],
    priceMin: Math.min(...variants.map((v) => v.price)),
    priceVaries: new Set(variants.map((v) => v.price)).size > 1,
  };
}
export const products = Z.products.map(build);
export const product = (h) => products.find((p) => p.handle === h);
export const variantById = (id) => { for (const p of products) { const v = p.variants.find((x) => x.id === Number(id)); if (v) return { product: p, variant: v }; } return null; };
export const hampers = () => products.filter((p) => p.type === 'hamper');
export const inOccasion = (id) => hampers().filter((p) => p.occasions.includes(id));
export const forWho = (id) => hampers().filter((p) => p.for.includes(id));
export const { reviews, reviewStats, ugc, journal, buildItems, boxes, focus, delivery } = Z;
export const sendingFor = (p) => upcoming().find((m) => m.kind !== 'sale' && p.occasions.includes(m.id) && momentState(m).orderable && momentState(m).toDate <= 50) || null;
export const greeting = (m) => ({ 'karva-chauth': 'Happy Karva Chauth', diwali: 'Happy Diwali', christmas: 'Merry Christmas', valentines: 'Happy Valentine’s Day', 'mothers-day': 'Happy Mother’s Day', 'fathers-day': 'Happy Father’s Day' })[m?.id] || '';
