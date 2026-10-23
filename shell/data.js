/* House of Zariva: presentation data. Every page is built from our Intellect theme's own sections and
   scripts, in a Zariva theme style. Build labels say which Intellect section it is, or where we customise. */
window.SHELL = {
  client: { name: 'House of Zariva', logo: '', subtitle: 'Storefront prototype on Intellect' },
  domain: 'houseofzariva.com.au',
  compare: false,

  // The date switch: the site reshapes itself around the next occasion. Dates are samples.
  dates: [
    { v: '2026-10-21', label: '21 Oct', hint: 'Karva Chauth leads' },
    { v: '2026-11-01', label: '1 Nov', hint: 'Diwali leads' },
    { v: '2026-11-28', label: '28 Nov', hint: 'The Quiet Week is on' },
    { v: '2026-12-10', label: '10 Dec', hint: 'Christmas leads' },
    { v: '2027-02-20', label: '20 Feb', hint: 'Nothing close: the evergreen story leads' },
    { v: '2027-04-20', label: '20 Apr', hint: 'Mother’s Day leads' },
  ],

  // The Christmas switch: Intellect's Christmas moment (snow, Santa's sleigh, lights, holly), and Christmas leads the store.
  festive: { moment: 'christmas', label: 'Christmas' },

  kinds: { brand: 'Brand', gift: 'Gift', sales: 'Sales', trust: 'Trust', shopify: 'Shopify' },
  labels: {
    native: { tag: 'INTELLECT', means: 'our theme, as is', color: '#17683f' },
    custom: { tag: 'CUSTOM', means: 'customised for Zariva', color: '#b4530a' },
    app: { tag: 'APP', means: 'needs an app', color: '#5b33b8' },
    todo: { tag: 'NEEDS INPUT', means: 'from the client', color: '#a3231b' },
  },

  docs: [
    { id: 'brand', label: 'Brand', src: 'docs/brand.html' },
    { id: 'plan', label: 'Build plan', src: 'docs/plan.html' },
    { id: 'questions', label: 'Questions', src: 'docs/questions.html' },
  ],

  pages: [
    {
      id: 'home', label: 'Home', src: 'site/index.html',
      notes: [
        { n: 1, k: 'brand', t: 'Intellect’s header, in Zariva’s clothes', now: 'Logo centred, Occasions as a mega menu with the next occasion’s photograph, Who it’s for as a dropdown. Transparent over the banner, solid once you scroll.', why: 'Four ways in cover how people shop for gifts: by the day, by the person, by making it, or in bulk.' },
        { n: 2, k: 'gift', t: 'One banner, led by the calendar', now: 'Intellect’s slideshow: the next occasion first, then the brand and Build your own. Each banner can have its own phone image. Try the date switch above.', why: 'Nobody rebuilds the homepage for each festival. The client adds an occasion once, with its date, and the banner updates itself.' },
        { n: 3, k: 'brand', t: 'Quiet controls', now: 'Thin progress lines and arrows. Banners pause on hover and when off screen.', why: 'Movement without noise.' },
        { n: 4, k: 'trust', t: 'Trust badges', now: 'Intellect’s features section, icons in a row, under the banner: same-day dispatch, wrapped by hand, the rating, secure checkout. The rating and the 1pm cut-off are samples to confirm.', why: 'A first-time sender is trusting a stranger with a gift that has to arrive. Four answers before they ask.' },
        { n: 5, k: 'gift', t: 'Shop by occasion', now: 'Intellect’s collection list: a photograph and a name for each occasion. Dated occasions come first, in date order, with their day; then the ones for any day.', why: 'Occasion is how this business is organised. Eight doors, nothing else.' },
        { n: 6, k: 'sales', t: 'Shop by budget', now: 'One slim row under the occasions: Under $100, $100 – $150, $150+, each with its count. Each link opens all hampers with Shopify’s price filter already set.', why: 'After the occasion, budget is how most gift shoppers decide. Three bands that split the range into even thirds.' },
        { n: 7, k: 'brand', t: 'The edits: a banner, then its hampers', now: 'Intellect’s full-width banner for each collection, with a View all link: the occasions within the next 50 days, then Birthdays, Corporate and New baby. Four edits in all.', why: 'An editorial page, like a magazine: one photograph introduces each collection, and the hampers follow straight underneath.' },
        { n: 8, k: 'gift', t: 'Every hamper says when it arrives', now: 'Intellect’s featured collection as a carousel, no heading. “Arrives before Diwali” under each card, worked out from the date and the cut-off.', why: 'A gift’s one job is to arrive on time. Saying it answers the question before it’s asked.' },
        { n: 9, k: 'trust', t: 'Sent for teams at', now: 'Intellect’s press section after the corporate edit: client logos, each with one line from that client. The names are placeholders until Zariva sends real logos and permission to use them.', why: 'Corporate buyers buy what other companies already trust.' },
        { n: 10, k: 'trust', t: 'In their words', now: 'Intellect’s testimonials: the rating, and three reviews, each with the hamper that was sent. In the live store the reviews come from a reviews app (Judge.me or Okendo).', why: 'A stranger’s story about the same gift, sent to the same kind of person, is the strongest reason to buy it.' },
        { n: 11, k: 'trust', t: 'A footer that keeps the calendar', now: 'A note before each occasion, by email. Then occasions, help and the studio.', why: 'A reminder before each festival brings people back at exactly the moment they buy.' },
        { n: 12, k: 'sales', t: 'Not sure? Ask us', now: 'A WhatsApp button on every page (green circle on phones), opening a chat with the studio with the first line written. Hidden on Build your own, where the box panel sits.', why: 'Gift buyers often get stuck on who it’s for. A person answering in minutes closes the sale.' },
        { n: 13, k: 'brand', t: 'The Christmas switch', now: 'Intellect’s Christmas moment: snowfall, Santa’s sleigh on arrival and after every Add to bag, string lights under the header, holly on the cards, frosted buttons, and Christmas leads the banner, the announcement and the first edit. In the live store it switches itself on and off by date.', why: 'The store dresses for the season without a redesign, then undresses on 26 December.' },
      ],
    },
    {
      id: 'collection', label: 'Occasion', src: 'site/collection.html?c=diwali',
      notes: [
        { n: 1, k: 'gift', t: 'The occasion, its date and its order-by date', now: 'Intellect’s collection banner, text only, on white.', why: 'The date is the first thing a gift shopper needs.' },
        { n: 2, k: 'sales', t: 'Filters for gifts', now: 'Intellect’s filter drawer: who it’s for, price, dietary, sort. In Shopify these are Search & Discovery filters on product metafields.', why: 'Gift shoppers decide by person and budget.' },
        { n: 3, k: 'gift', t: 'Cards with an arrival line', now: 'Intellect’s card: second photo on hover, quick add, the arrival line, and Loupe where a clip exists.', why: 'Certainty about the date turns browsing into buying.' },
      ],
    },
    {
      id: 'product', label: 'Product', src: 'site/product.html?p=the-diya-hamper',
      notes: [
        { n: 1, k: 'brand', t: 'Photographs first', now: 'Intellect’s gallery with thumbnails; a swipeable carousel on phones.', why: 'A hamper is bought on how it looks opened.' },
        { n: 2, k: 'trust', t: 'Loupe: watch it unboxed', now: 'Tap the clip for the video, chapters, reviews and add to bag without leaving.', why: 'Answers “is it really this nice?” in ten seconds.' },
        { n: 3, k: 'gift', t: 'Short and to the point', now: 'Occasion and arrival line, name, price with Afterpay, rating. Nothing else above the options.', why: 'A premium page says less.' },
        { n: 4, k: 'sales', t: 'Options on one line', now: 'Sizes as pills, colours as swatches, the price change shown on the option.', why: 'One glance, one tap.' },
        { n: 5, k: 'sales', t: 'One plum button', now: 'Add to bag, and Shop Pay for one-tap checkout. A bar with the button follows once you scroll past.', why: 'The one plum thing on the screen is the one thing to do.' },
        { n: 6, k: 'gift', t: 'Make it a gift, when they want it', now: 'Intellect’s Gift Mode: switch it on and the photograph is wrapped in paper and ribbon. Choose the paper, write the note (with occasion starters), choose the day, hide the price.', why: 'The card is never forced. When it’s a gift, it feels like one.' },
        { n: 7, k: 'trust', t: 'When it arrives', now: 'Intellect’s delivery estimate from the 1pm cut-off.', why: 'The promise, stated plainly.' },
        { n: 8, k: 'trust', t: 'Details folded away', now: 'What’s inside with its makers, delivery and order-by dates, care and returns.', why: 'There when wanted, out of the way when not.' },
      ],
    },
    {
      id: 'cart', label: 'Bag', src: 'site/cart.html',
      views: [{ label: 'Page', src: 'site/cart.html' }, { label: 'Drawer', src: 'site/product.html?p=birthday-bloom#bag' }],
      notes: [
        { n: 1, k: 'gift', t: 'The note travels with the hamper', now: 'To, From and the message show under the hamper; the wrap is its own line.', why: 'The studio sees exactly what to write. Standard Shopify line properties.' },
        { n: 2, k: 'sales', t: 'One reward, free delivery', now: 'Intellect’s reward ladder set to a single step at $150.', why: 'Raises the basket without a discount.' },
        { n: 3, k: 'shopify', t: 'A note for the studio, then checkout', now: 'Cart note, subtotal, Afterpay line, one button.', why: 'Nothing new appears at checkout.' },
      ],
    },
    {
      id: 'checkout', label: 'Checkout', src: 'site/checkout.html',
      notes: [
        { n: 1, k: 'shopify', t: 'Shopify’s checkout, branded', now: 'Logo and plum in the checkout editor. Same-day appears only for Sydney and Melbourne metro postcodes.', why: 'Shopify’s checkout converts best. Changing its content needs Shopify Plus; branding doesn’t.' },
        { n: 2, k: 'gift', t: 'The order remembers the note', now: 'Each hamper with its message.', why: 'A last look that the words will be written.' },
      ],
    },
    {
      id: 'build', label: 'Build your own', src: 'site/build.html',
      notes: [
        { n: 1, k: 'sales', t: 'Their favourite things', now: 'Intellect’s build-a-box: items from a collection, added to the box with one tap.', why: 'Custom boxes carry a higher basket than fixed hampers.' },
        { n: 2, k: 'sales', t: 'Bigger box, bigger saving', now: '3, 5 or 8 things; 5% and 10% off through Shopify automatic discounts.', why: 'A visible reason to choose the larger box.' },
        { n: 3, k: 'brand', t: 'The box fills as you choose', now: 'Items fly into the box; the lid closes when it’s full.', why: 'The satisfying part, and it shows when you’re done.' },
      ],
    },
    {
      id: 'corporate', label: 'Corporate', src: 'site/corporate.html',
      notes: [
        { n: 1, k: 'sales', t: 'For the person ordering for a team', now: 'Logo on the ribbon, each hamper to its own door, one invoice.', why: 'Corporate buyers need to know the admin is handled.' },
        { n: 2, k: 'trust', t: 'Three emails, and it’s done', now: 'Intellect’s FAQ section as the process.', why: 'Removing the fear of a long process wins the order.' },
        { n: 3, k: 'shopify', t: 'A short form', now: 'Intellect’s contact form. Logos and lists come by email after the reply.', why: 'Shopify forms can’t take files, and address lists shouldn’t sit in a web form.' },
      ],
    },
    { id: 'concierge', label: 'Concierge', src: 'site/concierge.html', notes: [] },
    { id: 'story', label: 'Our studio', src: 'site/story.html', notes: [] },
    { id: 'help', label: 'Delivery and help', src: 'site/help.html', notes: [] },
    { id: 'search', label: 'Search', src: 'site/search.html?q=diya', notes: [] },
  ],
};
