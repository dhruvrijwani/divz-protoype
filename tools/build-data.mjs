// Builds site/assets/data.js for the Zariva prototype from the first prototype's catalogue,
// re-sorted into the new occasion model (dated moments + always-on occasions) and recipients.
// All content is sample content. Run from prototype/: node tools/build-data.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SRC = path.resolve('../source/hamper-prototype/assets/js/data.js');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(SRC, 'utf8'), ctx);
const OLD = ctx.window.ZARIVA_DATA;

/* ---------- Moments: dated occasions. The site always leads with the next one. ----------
   In Shopify each is an entry of a "Moment" metaobject: name, date, order-by date, collection,
   arch image, line, and (for sale weeks) an end date. Dates are samples for the client to confirm. */
const moments = [
  { id: 'karva-chauth', name: 'Karva Chauth', date: '2026-10-29', orderBy: '2026-10-26', image: 'd-hands-diya',
    line: 'For the fast, and the moonrise after.',
    headline: 'For the fast, and <em>the moonrise</em> after.',
    blurb: 'Sargi for the morning, something golden for the evening. Sent to arrive the day before.' },
  { id: 'diwali', name: 'Diwali', date: '2026-11-08', orderBy: '2026-11-04', image: 'd-lamps-tray',
    line: 'Sweets, brass and light.',
    headline: 'Light, sweets, and the people <em>you miss</em>.',
    blurb: 'Brass diyas, saffron mithai and chai, packed in marigold and sent across Australia.' },
  { id: 'quiet-week', name: 'The Quiet Week', kind: 'sale', date: '2026-11-27', end: '2026-12-01', orderBy: '2026-12-01', image: 'basket-linen',
    line: 'Fifteen percent off, five days, no noise.',
    headline: 'Five days. <em>Fifteen percent.</em> No countdown clocks.',
    blurb: 'Our once-a-year offer, from Black Friday to Tuesday. Fifteen percent off a short list of hampers, while they last.' },
  { id: 'christmas', name: 'Christmas', date: '2026-12-25', orderBy: '2026-12-18', image: 'x-kraft-pine',
    line: 'Packed in kraft and pine.',
    headline: 'A summer Christmas, <em>packed in pine</em>.',
    blurb: 'Kraft, pine and a Rutherglen tawny. We dispatch from 1 December.' },
  { id: 'valentines', name: 'Valentine’s Day', date: '2027-02-14', orderBy: '2027-02-10', image: 'h-bouquet-box',
    line: 'Flowers, and something to keep.',
    headline: 'Say it with <em>more than flowers</em>.',
    blurb: 'Fresh flowers, a bottle and a card written in ink.' },
  { id: 'mothers-day', name: 'Mother’s Day', date: '2027-05-09', orderBy: '2027-05-05', image: 'open-woman',
    line: 'For the one who packed your lunches.',
    headline: 'For the one who <em>packed your lunches</em>.',
    blurb: 'Slow mornings, good tea and something only for her.' },
  { id: 'fathers-day', name: 'Father’s Day', date: '2027-09-05', orderBy: '2027-09-01', image: 'm-whisky-glasses',
    line: 'Whisky, coffee and the barbecue.',
    headline: 'Whisky, coffee and <em>the barbecue</em>.',
    blurb: 'Things he’ll actually use, from makers he’d like.' },
];

/* Always-on occasions: no date, always in the list. */
const always = [
  { id: 'birthdays', name: 'Birthdays', image: 'h-bouquet-box', line: 'For her, for him, for the day itself.' },
  { id: 'new-baby', name: 'New baby', image: 'b-newborn', line: 'For the new arrival, and the people looking after them.' },
  { id: 'thank-you', name: 'Thank you', image: 'card-hand', line: 'When a card isn’t quite enough.' },
  { id: 'corporate', name: 'Corporate', image: 'c-journal', line: 'For clients and teams, from ten boxes to a thousand.' },
];

const recipients = [
  { id: 'her', name: 'For her' }, { id: 'him', name: 'For him' }, { id: 'baby', name: 'For a baby' },
  { id: 'family', name: 'For the family' }, { id: 'team', name: 'For a team' },
];

/* ---------- Products ---------- */
const dropped = new Set(['the-invitation-box', 'save-the-date-petite']);
const mapOcc = { 'diwali': 'diwali', 'corporate-gifting': 'corporate', 'baby-shower': 'new-baby', 'birthday-for-her': 'birthdays', 'birthday-for-him': 'birthdays', 'christmas': 'christmas' };
const extraOcc = {
  'the-shagun-trunk': ['diwali', 'thank-you'], 'bridesmaid-proposal-box': ['birthdays', 'thank-you'],
  'thank-you-team': ['thank-you'], 'little-luxuries': ['thank-you', 'mothers-day', 'valentines'], 'the-protea-box': ['thank-you', 'valentines'],
  'coffee-and-co': ['thank-you', 'fathers-day'], 'pamper-her': ['mothers-day'], 'new-mum-restore-box': ['mothers-day'],
  'birthday-bloom': ['valentines', 'mothers-day'], 'the-long-lunch': ['valentines'], 'whisky-and-wattleseed': ['fathers-day'],
  'the-grill-master': ['fathers-day'], 'the-executive-edit': ['fathers-day'], 'craft-and-crunch': ['fathers-day'],
  'mithai-and-marigold-box': ['karva-chauth'], 'saffron-and-chai-collection': ['karva-chauth'],
};
const forWho = (p) => {
  const set = new Set();
  for (const r of p.recipients || []) {
    const k = r.toLowerCase();
    if (k === 'her') set.add('her');
    else if (k === 'him') set.add('him');
    else if (k.includes('baby') || k.includes('parent')) set.add('baby');
    else if (k.includes('team') || k.includes('client') || k.includes('colleague')) set.add('team');
    else if (k.includes('family') || k.includes('host') || k.includes('couple')) set.add('family');
  }
  if (p.occasions.includes('baby-shower')) set.add('baby');
  if (p.occasions.includes('corporate-gifting')) set.add('team');
  if (p.occasions.includes('birthday-for-her')) set.add('her');
  if (p.occasions.includes('birthday-for-him')) set.add('him');
  return [...set];
};

const products = OLD.products.filter((p) => !dropped.has(p.handle)).map((p) => {
  const occ = new Set((p.occasions || []).map((o) => mapOcc[o]).filter(Boolean));
  (extraOcc[p.handle] || []).forEach((o) => occ.add(o));
  const out = {
    handle: p.handle, title: p.title, type: p.type === 'Add-on' ? 'addon' : 'hamper',
    occasions: [...occ], for: forWho(p), price: p.price, images: p.images,
    rating: p.rating, reviews: p.reviews, badge: p.badge || '', best: p.best || 0, created: p.created,
    blurb: p.blurb, description: p.description, options: p.options || [], inside: p.inside || [], dietary: p.dietary || [],
  };
  if (p.soldOut) out.soldOut = p.soldOut;
  if (p.alcohol) out.alcohol = true;
  if (p.handle === 'hello-little-one') out.babyFor = ['girl', 'boy', 'any'];
  if (p.handle === 'cloud-nine-bundle') out.babyFor = ['girl', 'any'];
  if (p.handle === 'little-wattle-box') out.babyFor = ['boy', 'any'];
  if (p.handle === 'new-mum-restore-box') out.babyFor = ['any'];
  return out;
});

// Karva Chauth hampers (new). Photographs are stand-ins from the existing library.
const kc = [
  { handle: 'the-sargi-basket', title: 'The Sargi Basket', price: 89, images: ['d-almonds', 'd-nuts-bowl'], for: ['her', 'family'], badge: 'New',
    blurb: 'Dry fruits, pheni and fresh fruit for the morning before the fast.',
    description: 'Everything for sargi, the meal before sunrise. Saffron pheni, rose almonds, dates and a pot of chai, packed so it can be laid out in the dark without a sound.',
    options: [{ name: 'Size', values: [{ v: 'For one', note: '6 pieces' }, { v: 'For the family', note: '10 pieces', add: 50 }] }],
    inside: [['Saffron pheni, 200g', 'Harris Park, NSW'], ['Rose & cardamom almonds, 150g', 'Dandenong, VIC'], ['Medjool dates, 250g', 'Riverland, SA'], ['Masala chai, 100g', 'Brunswick, VIC'], ['Handwritten card', 'Our studio']],
    dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free'] },
  { handle: 'moonrise-thali', title: 'Moonrise Thali', price: 139, images: ['d-diya-rangoli', 'd-hands-diya'], for: ['her'], badge: 'New',
    blurb: 'A brass thali, diya and sieve for the evening puja, with mithai to break the fast.',
    description: 'For the evening. A hand-beaten brass thali with its diya, a channi for the moonrise and a karwa, with kaju katli and pistachio barfi to break the fast together.',
    options: [{ name: 'Finish', swatch: true, values: [{ v: 'Brass', hex: '#B38B4D' }, { v: 'Silver tone', hex: '#C9C6C2', add: 20 }] }],
    inside: [['Brass puja thali with diya', 'Moradabad, India'], ['Channi and karwa', 'Moradabad, India'], ['Kaju katli, 250g', 'Harris Park, NSW'], ['Pistachio barfi, 200g', 'Harris Park, NSW'], ['Handwritten card', 'Our studio']],
    dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free'] },
  { handle: 'the-shringaar-box', title: 'The Shringaar Box', price: 119, images: ['pink-boxes', 'w-pink-seal'], for: ['her'], badge: '',
    blurb: 'Bangles, mehndi and a silk pouch, for getting ready.',
    description: 'For getting ready. Glass bangles in her colour, natural mehndi cones, a sindoor box in carved wood and a silk pouch to keep them in afterwards.',
    options: [{ name: 'Bangles', swatch: true, values: [{ v: 'Red', hex: '#A3232E' }, { v: 'Plum', hex: '#5A1E3C' }, { v: 'Gold', hex: '#B38B4D' }] }],
    inside: [['Glass bangles, set of 12', 'Firozabad, India'], ['Natural mehndi cones, 4', 'Wollongong, NSW'], ['Carved sindoor box', 'Saharanpur, India'], ['Silk pouch', 'Our studio'], ['Handwritten card', 'Our studio']],
    dietary: ['Not edible'] },
  { handle: 'for-the-pair', title: 'For the Pair', price: 169, images: ['d-katli-dark', 'd-chai'], for: ['her', 'him'], badge: '',
    blurb: 'Two cups, one pot and mithai, for after the moon is seen.',
    description: 'For both of you, after the moon is seen. Two hand-thrown kulhads, a pot of saffron chai, kaju katli and a candle for the window.',
    options: [],
    inside: [['Hand-thrown kulhads, pair', 'Byron Bay, NSW'], ['Saffron chai, 100g', 'Brunswick, VIC'], ['Kaju katli, 250g', 'Harris Park, NSW'], ['Sandalwood soy candle', 'Byron Bay, NSW'], ['Handwritten card', 'Our studio']],
    dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free'] },
].map((p, i) => ({ type: 'hamper', occasions: ['karva-chauth'], rating: 4.8, reviews: 0, best: 0, created: '2026-10-0' + (i + 1), ...p }));
products.unshift(...kc);

// Gift wrap: a product with one variant per paper, added alongside a hamper by Intellect's Gift Mode.
products.push({ handle: 'gift-wrap', title: 'Gift wrap', type: 'wrap', occasions: [], for: [], price: 0, images: ['pink-boxes', 'pink-boxes'], rating: 0, reviews: 0, badge: '', best: 0, created: '2026-01-01',
  blurb: 'Wrapped by hand in the studio.', description: 'Paper, ribbon and a sealed tag.', inside: [], dietary: [],
  options: [{ name: 'Paper', values: [{ v: 'Ivory' }, { v: 'Blush' }, { v: 'Kraft' }, { v: 'Plum silk', add: 8 }] }] });

// Build your own: each item is its own product (Intellect's build-a-box adds them as cart lines), plus the box.
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const itemSrc = [
  ['Saffron kaju katli, 250g', 24, 'd-katli'], ['Rose & cardamom almonds', 18, 'd-almonds'], ['Besan laddoo, six', 16, 'd-laddoo-plate'],
  ['Single-origin chocolate', 14, 'c-choc-gold'], ['Lavender shortbread', 18, 'a-shortbread'], ['Leatherwood honey', 24, 'a-honey'],
  ['Masala chai, 100g', 16, 'd-chai'], ['Single-origin coffee', 22, 'c-beans'], ['Kashmiri saffron, 1g', 28, 'd-saffron'],
  ['Brass diya, pair', 32, 'd-hands-diya'], ['Marigold & oud candle', 39, 'a-candle'], ['Dried native posy', 35, 'a-posy'],
];
for (const [title, price, image] of itemSrc) products.push({ handle: 'item-' + slug(title), title, type: 'item', occasions: [], for: [], price, images: [image, image], rating: 0, reviews: 0, badge: '', best: 0, created: '2026-01-01', blurb: '', description: '', options: [], inside: [], dietary: [] });
products.push({ handle: 'keepsake-box', title: 'Keepsake box', type: 'box', occasions: [], for: [], price: 20, images: ['basket-linen', 'basket-linen'], rating: 0, reviews: 0, badge: '', best: 0, created: '2026-01-01', blurb: '', description: '', options: [], inside: [], dietary: [] });

// The Quiet Week: 15% off these, only between its dates (applied at run time).
const quiet = ['the-diya-hamper', 'birthday-bloom', 'whisky-and-wattleseed', 'hello-little-one', 'the-long-lunch', 'a-very-aussie-christmas', 'the-boardroom-box', 'pamper-her'];
for (const p of products) if (quiet.includes(p.handle)) p.occasions.push('quiet-week');

/* ---------- Loupe: video cards on three hampers (sample clips, features and reviews) ---------- */
const loupe = {
  'the-diya-hamper': {
    clip: { video: 'diya-hands', creator: 'Priya, Harris Park', label: 'Unboxed' },
    features: [
      { title: 'Hand-beaten brass', body: 'Each diya is beaten by hand in Moradabad, so no two are quite the same.', highlight: 'no two are quite the same', at: 0 },
      { title: 'Marigold, not plastic', body: 'Real dried marigold in place of shred. It keeps its colour for weeks.', highlight: 'keeps its colour for weeks', at: 3 },
      { title: 'The card, in ink', body: 'We write your message by hand before the lid goes on.', highlight: 'by hand', at: 6 },
    ],
    reviews: [
      { quote: 'The diyas arrived polished and the kaju katli tasted like the shop near my nani’s house.', author: 'Priya S.', highlight: 'arrived polished', helpful: 12, verified: true },
      { quote: 'Sent to my parents in Perth. Mum video-called me holding the card.', author: 'Arjun M.', highlight: 'holding the card', helpful: 9, verified: true },
      { quote: 'Heavier and more beautiful than the photos. We kept the brass on the mantel.', author: 'Neha R.', highlight: 'kept the brass', helpful: 6, verified: true },
    ],
  },
  'birthday-bloom': {
    clip: { video: 'bouquet', creator: 'Hannah, Bondi', label: 'Same day' },
    features: [
      { title: 'Cut that morning', body: 'Flowers come from the market the morning they leave the studio.', highlight: 'the morning they leave', at: 0 },
      { title: 'Packed upright', body: 'The bouquet travels in water, so it arrives standing.', highlight: 'arrives standing', at: 4 },
    ],
    reviews: [
      { quote: 'Ordered at eleven, on her doorstep by four. She cried, the good kind.', author: 'Hannah K.', highlight: 'on her doorstep by four', helpful: 15, verified: true },
      { quote: 'The card was written in proper ink. That’s what got her.', author: 'Liam P.', highlight: 'proper ink', helpful: 7, verified: true },
    ],
  },
  'hello-little-one': {
    clip: { video: 'unboxing-family', creator: 'Mei, Box Hill', label: 'Unboxed' },
    features: [
      { title: 'Organic cotton', body: 'The wrap and the bodysuit are GOTS-certified organic cotton.', highlight: 'organic cotton', at: 0 },
      { title: 'Something for the parents', body: 'A balm and a tea for whoever is doing the 3am feed.', highlight: 'the 3am feed', at: 5 },
    ],
    reviews: [
      { quote: 'My daughter unwrapped it before I could. Every piece has been used.', author: 'Mei L.', highlight: 'Every piece has been used', helpful: 11, verified: true },
      { quote: 'Soft colours, nothing plastic, and a note for the parents too.', author: 'Sarah T.', highlight: 'nothing plastic', helpful: 5, verified: true },
    ],
  },
};
for (const [h, l] of Object.entries(loupe)) Object.assign(products.find((p) => p.handle === h), { loupe: l });

/* ---------- Build your own: items a shopper can choose ---------- */
const buildItems = [
  ['Saffron kaju katli, 250g', 24, 'd-katli', 'Sweet'], ['Rose & cardamom almonds', 18, 'd-almonds', 'Sweet'], ['Besan laddoo, 6', 16, 'd-laddoo-plate', 'Sweet'],
  ['Single-origin chocolate', 14, 'c-choc-gold', 'Sweet'], ['Lavender shortbread', 18, 'a-shortbread', 'Sweet'], ['Leatherwood honey', 24, 'a-honey', 'Pantry'],
  ['Masala chai, 100g', 16, 'd-chai', 'Pantry'], ['Single-origin coffee', 22, 'c-beans', 'Pantry'], ['Kashmiri saffron, 1g', 28, 'd-saffron', 'Pantry'],
  ['Brass diya, pair', 32, 'd-hands-diya', 'Keep'], ['Marigold & oud candle', 39, 'a-candle', 'Keep'], ['Dried native posy', 35, 'a-posy', 'Keep'],
  ['Linen tea towel', 26, 'basket-linen', 'Keep'], ['Adelaide Hills sparkling', 35, 'a-sparkling', 'Pour'], ['Barossa shiraz', 32, 'c-whisky-glass', 'Pour'],
].map(([name, price, image, group], i) => ({ id: 'b' + (i + 1), name, price, image, group, alcohol: group === 'Pour' }));
const boxes = [
  { id: 'petite', name: 'Petite', slots: 3, base: 15, note: 'Three things, in a small arch-lidded box' },
  { id: 'classic', name: 'Classic', slots: 5, base: 20, note: 'Five things. Our most chosen size' },
  { id: 'grand', name: 'Grand', slots: 8, base: 30, note: 'Eight things, in the large keepsake box' },
];

/* ---------- Journal (blog posts) ---------- */
const journal = [
  { handle: 'what-to-send-for-karva-chauth', title: 'What to send for Karva Chauth', date: '2026-10-12', image: 'd-hands-diya', tag: 'Karva Chauth',
    excerpt: 'Sargi in the morning, something golden for the evening, and the timing that matters most.', products: ['the-sargi-basket', 'moonrise-thali', 'for-the-pair'] },
  { handle: 'a-diwali-hamper-for-every-budget', title: 'A Diwali hamper for every budget', date: '2026-10-05', image: 'd-row', tag: 'Diwali',
    excerpt: 'From a $59 tin of laddoos to the family trunk, and how to choose between them.', products: ['the-laddoo-tin', 'the-diya-hamper', 'festival-of-lights-trunk'] },
  { handle: 'corporate-gifts-in-december', title: 'Corporate gifts in December, without the scramble', date: '2026-09-28', image: 'crate', tag: 'Corporate',
    excerpt: 'When to order, how logo ribbons work, and why one delivery list saves a week.', products: ['the-boardroom-box', 'thank-you-team', 'client-appreciation-crate'] },
  { handle: 'welcoming-a-new-baby', title: 'Welcoming a new baby, gently', date: '2026-09-14', image: 'b-newborn', tag: 'New baby',
    excerpt: 'What new parents actually use, and what to leave out.', products: ['hello-little-one', 'new-mum-restore-box', 'little-wattle-box'] },
];

const reviews = OLD.reviews.filter((r) => products.some((p) => p.handle === r.product));
const ugc = OLD.ugc.filter((u) => products.some((p) => p.handle === u.product));

const out = `/* House of Zariva prototype: catalogue and moments. Generated by tools/build-data.mjs; edit there.
   All products, prices, makers, reviews and dates are SAMPLE CONTENT for the client to replace.
   In Shopify: moments are a "Moment" metaobject, products/variants are native, inside-items and makers
   are a product metaobject list, recipients and dietary are metafields used by Search & Discovery filters. */
window.ZARIVA = ${JSON.stringify({
  today: '2026-10-21',
  delivery: { cutoffHour: 13, freeOver: 150, rates: { standard: 12, express: 18, sameDay: 25 }, sameDayCities: ['Sydney', 'Melbourne'] },
  moments, always, recipients, products, loupe: Object.keys(loupe), buildItems, boxes, journal,
  reviews, reviewStats: OLD.reviewStats, ugc, focus: OLD.focus,
}, null, 1)};
`;
fs.writeFileSync(path.resolve('site/assets/zariva/data.js'), out);
console.log(`products ${products.length}, moments ${moments.length}, reviews ${reviews.length}, ugc ${ugc.length}`);
