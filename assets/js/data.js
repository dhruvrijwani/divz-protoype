/* Zariva prototype — catalogue data.
   In Shopify this lives in products, variants, collections, metafields/metaobjects
   (inside items, dietary, recipients) and a reviews app. All content here is sample content. */
window.ZARIVA_DATA = (function () {
  'use strict';

  const OCCASIONS = ['diwali', 'corporate-gifting', 'baby-shower', 'wedding-invitations', 'birthday-for-her', 'birthday-for-him', 'christmas'];

  const collections = {
    all: {
      title: 'All hampers', short: 'All hampers', image: 'hero-open',
      blurb: 'Every hamper we make, for every occasion. Each one is packed by hand in our Sydney studio and sent with a handwritten card.'
    },
    bestsellers: {
      title: 'Bestsellers', short: 'Bestsellers', image: 'basket-linen',
      blurb: 'The hampers Australians send most, updated each week from what leaves our studio.'
    },
    diwali: {
      title: 'Diwali', short: 'Diwali', line: 'Sweets, brass and light.', image: 'd-hands-diya', banner: 'd-row',
      blurb: 'Sweets, brass and light for the festival of lights, packed in marigold and sent across Australia.',
      note: 'Diwali is Sunday 8 November. Order by Monday 2 November for delivery Australia-wide.'
    },
    'corporate-gifting': {
      title: 'Corporate gifting', short: 'Corporate', line: 'For clients and teams.', image: 'exchange',
      blurb: 'Hampers for clients and teams, from ten boxes to a thousand. Your logo on the ribbon, one delivery list, one invoice.',
      note: 'Ordering 20 or more? We’ll send a quote within one business day.'
    },
    'baby-shower': {
      title: 'Baby shower', short: 'Baby shower', line: 'For the new arrival.', image: 'b-newborn',
      blurb: 'Soft, useful and lovely to unwrap, for the new arrival and the people looking after them.'
    },
    'wedding-invitations': {
      title: 'Wedding invitations', short: 'Weddings', line: 'Invitation boxes and favours.', image: 'w-stationery-fabric',
      blurb: 'Invitation boxes, favours and family trunks, assembled and posted for you.',
      note: 'Personalised orders over 50 boxes need three weeks. Talk to us before you print.'
    },
    'birthday-for-her': {
      title: 'Birthday for her', short: 'For her', line: 'Flowers and something to keep.', image: 'delivery-box',
      blurb: 'Flowers, something sparkling and something she’ll keep.'
    },
    'birthday-for-him': {
      title: 'Birthday for him', short: 'For him', line: 'Whisky, coffee and the barbecue.', image: 'm-whisky-glasses',
      blurb: 'Good whisky, better coffee and something for the barbecue.'
    },
    christmas: {
      title: 'Christmas', short: 'Christmas', line: 'Packed in kraft and pine.', image: 'x-wax-kraft',
      blurb: 'A summer Christmas, packed in kraft and pine. Pre-order now; we dispatch from 1 December.',
      note: 'Order by Friday 18 December for metro delivery before Christmas Day.'
    }
  };

  // object-position tweaks for photographs that are not centred
  const focus = {
    'hero': '30% 62%', 'hero-open': '28% 50%', 'd-hands-diya': '50% 62%', 'exchange': '50% 40%',
    'b-newborn': '40% 50%', 'delivery-box': '50% 70%', 'm-whisky-glasses': '35% 50%', 'x-wax-kraft': '50% 50%',
    'pack-woman': '45% 50%', 'card-writing': '60% 50%', 'open-woman': '50% 35%', 'receive-woman': '40% 40%',
    'w-stationery-fabric': '40% 50%', 'w-velvet-suite': '50% 12%', 'd-row': '50% 50%', 'basket-linen': '50% 50%', 'c-journal': '50% 60%'
  };

  const ALC = 'Contains alcohol. You must be 18 or over to buy it, and our courier may ask for ID on delivery.';

  const products = [
    /* ------------------------------------------------------------------ Diwali */
    {
      handle: 'the-diya-hamper', title: 'The Diya Hamper', type: 'Hamper', occasions: ['diwali'],
      recipients: ['Family', 'Her', 'Him'], price: 149, images: ['d-lamps-tray', 'd-katli'],
      rating: 4.9, reviews: 212, badge: 'Bestseller', best: 1, created: '2026-09-01',
      blurb: 'Brass diyas, saffron kaju katli and masala chai, packed with marigold for Diwali.',
      description: 'Our most-sent Diwali hamper. A pair of hand-beaten brass diyas sits on marigold tissue with saffron kaju katli made in Harris Park, rose and cardamom almonds and a loose-leaf masala chai. Light the diyas on the night, then keep them for years.',
      options: [{ name: 'Size', values: [{ v: 'Classic', note: '8 pieces' }, { v: 'Grand', note: '14 pieces, adds a brass thali', add: 80 }] }],
      inside: [['Hand-beaten brass diyas, pair', 'Moradabad, India'], ['Saffron kaju katli, 250g', 'Harris Park, NSW'], ['Rose & cardamom almonds, 150g', 'Dandenong, VIC'], ['Masala chai, loose leaf, 100g', 'Brunswick, VIC'], ['Marigold & oud soy candle', 'Byron Bay, NSW'], ['Handwritten card', 'Our studio']],
      dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free']
    },
    {
      handle: 'mithai-and-marigold-box', title: 'Mithai & Marigold Box', type: 'Hamper', occasions: ['diwali', 'wedding-invitations'],
      recipients: ['Family', 'Clients', 'Couples'], price: 79, images: ['d-sweets-marigold', 'd-katli-dark'],
      rating: 4.8, reviews: 156, best: 4, created: '2026-08-12',
      blurb: 'Twelve or twenty-four pieces of hand-made mithai in a gold-lined keepsake box.',
      description: 'Made fresh each week by a family kitchen in Harris Park: kaju katli, pista barfi, besan ladoo and coconut rolls, with a strand of dried marigolds for the door. Best enjoyed within ten days.',
      options: [{ name: 'Box', values: [{ v: '12 pieces' }, { v: '24 pieces', add: 50 }] }],
      inside: [['Kaju katli', 'Harris Park, NSW'], ['Pista barfi', 'Harris Park, NSW'], ['Besan ladoo', 'Harris Park, NSW'], ['Coconut rolls', 'Harris Park, NSW'], ['Dried marigold toran', 'Our studio']],
      dietary: ['Vegetarian', 'Contains nuts', 'Contains dairy', 'Alcohol-free']
    },
    {
      handle: 'festival-of-lights-trunk', title: 'Festival of Lights Trunk', type: 'Hamper', occasions: ['diwali'],
      recipients: ['Family', 'Clients'], price: 289, images: ['d-diya-platter', 'd-rangoli'],
      rating: 5.0, reviews: 41, badge: 'Limited', created: '2026-09-15',
      blurb: 'Our largest Diwali gift: a lidded trunk of mithai, dry fruit, brass and light.',
      description: 'For the family you’ll celebrate with. A linen-lined trunk holding a brass urli, six hand-painted clay diyas, a kilo of mixed mithai, salted pistachios, Medjool dates, Tasmanian saffron and two marigold candles. The trunk is made to be kept.',
      options: [
        { name: 'Ribbon', swatch: true, values: [{ v: 'Marigold', hex: '#E0892B' }, { v: 'Ivory', hex: '#F1EBDD' }] },
        { name: 'Size', values: [{ v: 'Classic', note: 'Serves 6–8' }, { v: 'Family', note: 'Serves 12+', add: 100 }] }
      ],
      soldOut: ['Family'],
      inside: [['Brass urli bowl', 'Moradabad, India'], ['Hand-painted clay diyas, set of six', 'Our studio'], ['Mixed mithai, 1kg', 'Harris Park, NSW'], ['Salted pistachios, 250g', 'Mildura, VIC'], ['Medjool dates, 250g', 'Riverland, SA'], ['Saffron, 0.5g', 'Huon Valley, TAS'], ['Marigold soy candles, pair', 'Byron Bay, NSW']],
      dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free']
    },
    {
      handle: 'saffron-and-chai-collection', title: 'Saffron & Chai Collection', type: 'Hamper', occasions: ['diwali'],
      recipients: ['Her', 'Him', 'Family'], price: 95, images: ['d-saffron', 'd-chai'],
      rating: 4.7, reviews: 64, created: '2026-07-30',
      blurb: 'Tasmanian saffron, masala chai and a pair of kulhad cups for slow mornings.',
      description: 'For the chai drinker. Hand-blended masala chai, a vial of Tasmanian saffron, raw cane jaggery and two clay kulhad cups, wrapped in a block-printed cotton tea towel.',
      inside: [['Masala chai, 150g', 'Brunswick, VIC'], ['Saffron, 0.5g', 'Huon Valley, TAS'], ['Cane jaggery, 200g', 'Imported'], ['Clay kulhad cups, pair', 'Our studio'], ['Block-printed tea towel', 'Jaipur, India']],
      dietary: ['Vegan', 'Alcohol-free']
    },
    {
      handle: 'the-laddoo-tin', title: 'The Laddoo Tin', type: 'Hamper', occasions: ['diwali'],
      recipients: ['Family', 'Team'], price: 59, images: ['d-laddoo-plate', 'd-laddoo-diya'],
      rating: 4.8, reviews: 27, badge: 'New', created: '2026-10-01',
      blurb: 'Besan and motichoor laddoos in a hand-painted tin that will end up holding buttons.',
      description: 'Sixteen laddoos made in small batches, in a tin painted in one of three festival colours. A small gift for neighbours, colleagues or the host who has everything.',
      options: [{ name: 'Tin', swatch: true, values: [{ v: 'Marigold', hex: '#E0892B' }, { v: 'Peacock', hex: '#1F6E73' }, { v: 'Rose', hex: '#C8607A' }] }],
      inside: [['Besan laddoo, eight', 'Dandenong, VIC'], ['Motichoor laddoo, eight', 'Dandenong, VIC'], ['Hand-painted tin', 'Our studio']],
      dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free']
    },
    {
      handle: 'diwali-dry-fruit-platter', title: 'Diwali Dry Fruit Platter', type: 'Hamper', occasions: ['diwali', 'corporate-gifting'],
      recipients: ['Family', 'Clients', 'Team'], price: 119, images: ['d-nuts-bowl', 'd-almonds'],
      rating: 4.8, reviews: 73, created: '2026-08-02',
      blurb: 'Australian almonds, pistachios, dates and cashews on a mango-wood platter.',
      description: 'A generous platter for the host’s table: Riverland almonds, Sunraysia pistachios, Medjool dates, roasted cashews and Mildura apricots, arranged on a mango-wood board they’ll keep using.',
      options: [{ name: 'Size', values: [{ v: 'Petite', note: '850g of fruit and nuts' }, { v: 'Grand', note: '1.6kg, larger board', add: 60 }] }],
      inside: [['Almonds, 200g', 'Riverland, SA'], ['Pistachios, 200g', 'Mildura, VIC'], ['Medjool dates, 250g', 'Riverland, SA'], ['Roasted cashews, 150g', 'Imported'], ['Dried apricots, 150g', 'Mildura, VIC'], ['Mango-wood platter', 'Saharanpur, India']],
      dietary: ['Vegan', 'Contains nuts', 'Alcohol-free']
    },
    {
      handle: 'golden-puja-hamper', title: 'Golden Puja Hamper', type: 'Hamper', occasions: ['diwali'],
      recipients: ['Family'], price: 169, images: ['d-diya-rangoli', 'd-marigold'],
      rating: 4.9, reviews: 38, created: '2026-08-21',
      blurb: 'A complete puja set with brass thali, diyas, incense and kesar peda for prasad.',
      description: 'Everything for Lakshmi puja on Diwali night: a brass thali with kumkum and haldi bowls, two diyas, sandalwood incense, cotton wicks and ghee, and a box of kesar peda for prasad.',
      inside: [['Brass puja thali set', 'Moradabad, India'], ['Brass diyas, pair', 'Moradabad, India'], ['Sandalwood incense', 'Mysuru, India'], ['Cotton wicks & ghee', 'Our studio'], ['Kesar peda, 250g', 'Harris Park, NSW']],
      dietary: ['Vegetarian', 'Contains dairy', 'Alcohol-free']
    },

    /* ------------------------------------------------------------------ Corporate */
    {
      handle: 'the-boardroom-box', title: 'The Boardroom Box', type: 'Hamper', occasions: ['corporate-gifting', 'christmas'],
      recipients: ['Clients', 'Team'], price: 159, images: ['crate', 'c-cheese'],
      rating: 4.9, reviews: 88, best: 9, created: '2026-06-10',
      blurb: 'Barossa shiraz, clothbound cheddar, lavosh and dark chocolate in a timber crate.',
      description: 'Our corporate bestseller. A timber crate with a bottle of Barossa shiraz (or a non-alcoholic sparkling), clothbound cheddar, rosemary lavosh, smoked almonds and 70% dark chocolate. Add your logo to the ribbon on orders of 20 or more.',
      options: [{ name: 'Pour', values: [{ v: 'Barossa shiraz' }, { v: 'Non-alcoholic sparkling', add: -10 }] }],
      inside: [['Shiraz, 750ml', 'Barossa Valley, SA'], ['Clothbound cheddar, 200g', 'Yarra Valley, VIC'], ['Rosemary lavosh', 'Hobart, TAS'], ['Smoked almonds, 150g', 'Riverland, SA'], ['Dark chocolate 70%, 100g', 'Daylesford, VIC'], ['Pine timber crate', 'Our studio']],
      dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free option'], alcohol: true
    },
    {
      handle: 'thank-you-team', title: 'Thank You, Team', type: 'Hamper', occasions: ['corporate-gifting', 'christmas'],
      recipients: ['Team'], price: 69, images: ['c-cookies-box', 'c-choc-open'],
      rating: 4.8, reviews: 64, best: 10, created: '2026-05-18',
      blurb: 'Cookies, chocolate and coffee to say thanks, one box per desk.',
      description: 'A smaller gift that still feels considered: brown butter cookies, a bar of single-origin chocolate, specialty coffee and a handwritten thank-you. Order in packs and we’ll deliver to one office or to every home address on your list.',
      options: [{ name: 'Pack', values: [{ v: 'Single box' }, { v: 'Pack of 5', price: 325, compare: 345 }, { v: 'Pack of 10', price: 620, compare: 690 }] }],
      inside: [['Brown butter cookies, six', 'Marrickville, NSW'], ['Single-origin chocolate, 80g', 'Daylesford, VIC'], ['Specialty coffee, 200g', 'Marrickville, NSW'], ['Handwritten thank-you card', 'Our studio']],
      dietary: ['Vegetarian', 'Alcohol-free']
    },
    {
      handle: 'the-executive-edit', title: 'The Executive Edit', type: 'Hamper', occasions: ['corporate-gifting', 'birthday-for-him'],
      recipients: ['Clients', 'Him'], price: 249, images: ['c-whisky-glass', 'c-choc-gold'],
      rating: 4.9, reviews: 31, created: '2026-07-04',
      blurb: 'Tasmanian single malt, a leather journal and hand-made truffles.',
      description: 'For the client you can’t afford to lose: 200ml of Tasmanian single malt (or a zero-proof spirit), a full-grain leather journal with a brass pen, and sixteen hand-made truffles in a gold-lined box.',
      options: [{ name: 'Pour', values: [{ v: 'Tasmanian single malt' }, { v: 'Zero-proof spirit', add: -30 }] }],
      inside: [['Single malt whisky, 200ml', 'Hobart, TAS'], ['Full-grain leather journal', 'Collingwood, VIC'], ['Brass pen', 'Imported'], ['Hand-made truffles, sixteen', 'Daylesford, VIC']],
      dietary: ['Vegetarian', 'Alcohol-free option'], alcohol: true
    },
    {
      handle: 'welcome-aboard-kit', title: 'Welcome Aboard Kit', type: 'Hamper', occasions: ['corporate-gifting'],
      recipients: ['Team'], price: 89, images: ['c-journal', 'c-grinder'],
      rating: 4.7, reviews: 22, badge: 'New', created: '2026-09-20',
      blurb: 'A first-day gift for new starters: a journal, a hand grinder and good coffee.',
      description: 'Make someone’s first week feel like a welcome. A linen journal, a ceramic hand grinder, 250g of house-blend beans and a handwritten note from their new team.',
      options: [{ name: 'Box', swatch: true, values: [{ v: 'Plum', hex: '#5A1E3C' }, { v: 'Bone', hex: '#E9E4D8' }] }],
      inside: [['Linen journal', 'Collingwood, VIC'], ['Ceramic hand grinder', 'Imported'], ['House-blend coffee beans, 250g', 'Marrickville, NSW'], ['Handwritten welcome note', 'Our studio']],
      dietary: ['Vegan', 'Alcohol-free']
    },
    {
      handle: 'client-appreciation-crate', title: 'Client Appreciation Crate', type: 'Hamper', occasions: ['corporate-gifting'],
      recipients: ['Clients'], price: 199, images: ['c-cheese-fruit', 'c-choc-box'],
      rating: 4.8, reviews: 19, created: '2026-06-28',
      blurb: 'A grazing crate of cheese, crackers, quince and truffles to share around the table.',
      description: 'Built for a boardroom table: two Australian cheeses, quince paste, fig and walnut crackers, Adelaide Hills olives and a box of truffles. Shared, it feeds eight.',
      inside: [['Triple-cream brie', 'King Island, TAS'], ['Vintage cheddar', 'Yarra Valley, VIC'], ['Quince paste', 'Mudgee, NSW'], ['Fig & walnut crackers', 'Daylesford, VIC'], ['Kalamata olives', 'Adelaide Hills, SA'], ['Truffles, nine', 'Daylesford, VIC']],
      dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free']
    },

    /* ------------------------------------------------------------------ Baby shower */
    {
      handle: 'hello-little-one', title: 'Hello, Little One', type: 'Hamper', occasions: ['baby-shower'],
      recipients: ['New parents'], price: 139, images: ['b-hamper', 'b-blanket-basket'],
      rating: 4.9, reviews: 97, badge: 'Bestseller', best: 5, created: '2026-04-02',
      blurb: 'An organic cotton blanket, muslin wraps and a hand-knitted bunny for a new arrival.',
      description: 'A gentle first gift: a cellular knit blanket in organic cotton, two muslin wraps, a hand-knitted bunny and a lavender balm for the parents. Choose the colour and everything inside matches.',
      options: [{ name: 'Colour', swatch: true, values: [{ v: 'Sage', hex: '#A9B7A0' }, { v: 'Blush', hex: '#E7C4BE' }, { v: 'Oat', hex: '#E6DCCB' }] }],
      inside: [['Organic cotton knit blanket', 'Geelong, VIC'], ['Muslin wraps, two', 'Our studio'], ['Hand-knitted bunny', 'Bellingen, NSW'], ['Lavender & calendula balm', 'Launceston, TAS'], ['Handwritten card', 'Our studio']],
      dietary: ['Alcohol-free']
    },
    {
      handle: 'new-mum-restore-box', title: 'New Mum Restore Box', type: 'Hamper', occasions: ['baby-shower', 'birthday-for-her'],
      recipients: ['New parents', 'Her'], price: 119, images: ['b-soap-flatlay', 'b-skincare-tray'],
      rating: 4.9, reviews: 54, created: '2026-05-09',
      blurb: 'Bath salts, body oil, nursing tea and chocolate, just for her.',
      description: 'The new parent needs looking after too. Magnesium bath salts, a nourishing body oil, a caffeine-free nursing tea, a silk eye mask and a bar of dark chocolate with sea salt.',
      inside: [['Magnesium bath salts', 'Byron Bay, NSW'], ['Nourishing body oil', 'Margaret River, WA'], ['Nursing tea', 'Adelaide, SA'], ['Silk eye mask', 'Imported'], ['Dark chocolate & sea salt', 'Daylesford, VIC']],
      dietary: ['Vegan', 'Alcohol-free']
    },
    {
      handle: 'cloud-nine-bundle', title: 'Cloud Nine Bundle', type: 'Hamper', occasions: ['baby-shower'],
      recipients: ['New parents'], price: 159, images: ['b-bear-box', 'b-bear-basket'],
      rating: 4.8, reviews: 36, created: '2026-03-15',
      blurb: 'A plush bear, a cable-knit blanket and a keepsake box for the first year.',
      description: 'A keepsake gift: an heirloom plush bear, a cable-knit cotton blanket, a set of first-year milestone cards and a timber box for the hospital bracelet and first curl.',
      options: [{ name: 'Colour', swatch: true, values: [{ v: 'Oat', hex: '#E6DCCB' }, { v: 'Blush', hex: '#E7C4BE' }] }],
      inside: [['Heirloom plush bear', 'Imported'], ['Cable-knit cotton blanket', 'Geelong, VIC'], ['Milestone cards, twelve', 'Our studio'], ['Timber keepsake box', 'Our studio']],
      dietary: ['Alcohol-free']
    },
    {
      handle: 'little-wattle-box', title: 'Little Wattle Box', type: 'Hamper', occasions: ['baby-shower'],
      recipients: ['New parents'], price: 99, images: ['b-clothes-basket', 'b-baby-card'],
      rating: 4.9, reviews: 18, badge: 'New', created: '2026-09-28',
      blurb: 'Organic bodysuits, knitted booties and a wattle-print bib in a woven basket.',
      description: 'Everyday basics, made beautifully: two organic cotton bodysuits (0–3 months), knitted booties, a wattle-print bib and a gentle baby wash, in a woven basket for the nursery.',
      inside: [['Organic cotton bodysuits, two', 'Geelong, VIC'], ['Knitted booties', 'Bellingen, NSW'], ['Wattle-print bib', 'Our studio'], ['Gentle baby wash', 'Byron Bay, NSW'], ['Woven basket', 'Imported']],
      dietary: ['Alcohol-free']
    },

    /* ------------------------------------------------------------------ Wedding invitations */
    {
      handle: 'the-invitation-box', title: 'The Invitation Box', type: 'Hamper', occasions: ['wedding-invitations'],
      recipients: ['Couples', 'Family'], price: 880, images: ['w-velvet-suite', 'w-suite-bed'],
      rating: 5.0, reviews: 46, created: '2026-02-11', unit: 'box',
      blurb: 'A keepsake box for your printed invitation, with mithai or chocolate and dried flowers.',
      description: 'Send your invitation the way your grandparents would have: with something sweet. Each box holds your printed invite (or ours), four pieces of mithai or chocolate, dried gypsophila and a wax seal with your initials. We assemble and post them, or deliver them to you in bulk.',
      options: [
        { name: 'Quantity', values: [{ v: '20 boxes', note: '$44 a box', units: 20 }, { v: '50 boxes', note: '$42 a box', price: 2100, units: 50 }, { v: '100 boxes', note: '$39 a box', price: 3900, units: 100 }] },
        { name: 'Finish', swatch: true, values: [{ v: 'Ivory', hex: '#F1EBDD' }, { v: 'Blush', hex: '#E7C4BE' }, { v: 'Sage', hex: '#A9B7A0' }] }
      ],
      inside: [['Rigid keepsake box with magnetic lid', 'Our studio'], ['Your invitation, or ours printed in Sydney', 'Alexandria, NSW'], ['Mithai or chocolate, four pieces', 'Harris Park, NSW'], ['Dried gypsophila', 'Our studio'], ['Wax seal with your initials', 'Our studio']],
      dietary: ['Vegetarian', 'Alcohol-free']
    },
    {
      handle: 'save-the-date-petite', title: 'Save the Date Petite', type: 'Hamper', occasions: ['wedding-invitations'],
      recipients: ['Couples'], price: 29, images: ['favours', 'w-favour-desserts'],
      rating: 4.8, reviews: 29, created: '2026-03-03',
      blurb: 'A small favour box with two truffles or mithai and a printed save-the-date card.',
      description: 'Our smallest box, for save-the-dates, place settings or thank-yous. Two pieces of chocolate or mithai, a printed card and a ribbon in your wedding colour. Most couples order between 50 and 200.',
      options: [{ name: 'Sweet', values: [{ v: 'Chocolate truffles' }, { v: 'Mithai' }] }],
      inside: [['Truffles or mithai, two pieces', 'Daylesford, VIC / Harris Park, NSW'], ['Printed save-the-date card', 'Alexandria, NSW'], ['Silk ribbon in your colour', 'Our studio']],
      dietary: ['Vegetarian', 'Alcohol-free']
    },
    {
      handle: 'the-shagun-trunk', title: 'The Shagun Trunk', type: 'Hamper', occasions: ['wedding-invitations', 'diwali'],
      recipients: ['Family', 'Couples'], price: 129, images: ['w-pink-seal', 'w-suite-flowers'],
      rating: 4.9, reviews: 33, created: '2026-04-19',
      blurb: 'A silk-lined trunk with saffron almonds, kaju katli and a hand-lettered shagun envelope.',
      description: 'For the families you’re inviting in person. A silk-lined trunk with saffron almonds, a box of kaju katli, a brass diya and a hand-lettered shagun envelope. We can add your invitation and a personalised tag.',
      options: [{ name: 'Finish', swatch: true, values: [{ v: 'Ivory', hex: '#F1EBDD' }, { v: 'Blush', hex: '#E7C4BE' }] }],
      inside: [['Silk-lined trunk', 'Our studio'], ['Saffron almonds, 200g', 'Riverland, SA'], ['Kaju katli, 250g', 'Harris Park, NSW'], ['Brass diya', 'Moradabad, India'], ['Hand-lettered shagun envelope', 'Our studio']],
      dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free']
    },
    {
      handle: 'bridesmaid-proposal-box', title: 'Bridesmaid Proposal Box', type: 'Hamper', occasions: ['wedding-invitations', 'birthday-for-her'],
      recipients: ['Her'], price: 89, images: ['pink-boxes', 'w-seal'],
      rating: 4.9, reviews: 24, created: '2026-05-25',
      blurb: 'Ask the question with a silk scrunchie, a rose candle and a mini sparkling.',
      description: 'A box for each of your people: a silk scrunchie, a rose and vanilla candle, a mini sparkling, a gold hair clip and a card that asks the question. Tell us what to say and we’ll write it out.',
      options: [{ name: 'Colour', swatch: true, values: [{ v: 'Blush', hex: '#E7C4BE' }, { v: 'Sage', hex: '#A9B7A0' }] }],
      inside: [['Silk scrunchie', 'Imported'], ['Rose & vanilla candle', 'Byron Bay, NSW'], ['Mini sparkling, 200ml', 'Adelaide Hills, SA'], ['Gold hair clip', 'Imported'], ['Handwritten card', 'Our studio']],
      dietary: ['Contains alcohol'], alcohol: true
    },

    /* ------------------------------------------------------------------ Birthday for her */
    {
      handle: 'the-protea-box', title: 'The Protea Box', type: 'Hamper', occasions: ['birthday-for-her'],
      recipients: ['Her'], price: 135, images: ['hero-open', 'hero'],
      rating: 4.9, reviews: 143, badge: 'Bestseller', best: 2, created: '2026-03-20',
      blurb: 'A fresh protea, rose bath salts and Melting Moments in a white keepsake box.',
      description: 'The box from our photographs. A fresh king protea stem, rose and orange bath salts, Melting Moment biscuits, a eucalyptus candle and dark chocolate, tied with olive grosgrain. Outside Sydney and Melbourne metro we swap the fresh stem for a dried native posy.',
      options: [{ name: 'Size', values: [{ v: 'Classic', note: '5 pieces' }, { v: 'Grand', note: '9 pieces, adds sparkling', add: 60 }] }],
      inside: [['Fresh protea or seasonal native stem', 'Sydney Flower Market, NSW'], ['Rose & orange bath salts', 'Blue Mountains, NSW'], ['Melting Moment biscuits', 'Adelaide, SA'], ['Eucalyptus & mint candle', 'Byron Bay, NSW'], ['Dark chocolate, 100g', 'Daylesford, VIC']],
      dietary: ['Vegetarian', 'Alcohol-free']
    },
    {
      handle: 'birthday-bloom', title: 'Birthday Bloom', type: 'Hamper', occasions: ['birthday-for-her'],
      recipients: ['Her'], price: 139, images: ['h-bouquet-box', 'h-bottle-bed'],
      rating: 4.8, reviews: 118, best: 6, created: '2026-02-28',
      blurb: 'Seasonal flowers in an open box with a candle, chocolate and an optional sparkling rosé.',
      description: 'Flowers that arrive already arranged, in a box that doubles as the vase. With a soy candle, a bar of Daylesford chocolate and, if you like, a chilled sparkling rosé from the Adelaide Hills.',
      options: [{ name: 'Make it sparkling', values: [{ v: 'No thanks' }, { v: 'Add sparkling rosé', add: 30 }] }],
      inside: [['Seasonal flowers in a vase box', 'Sydney Flower Market, NSW'], ['Soy candle', 'Byron Bay, NSW'], ['Milk chocolate & honeycomb', 'Daylesford, VIC'], ['Sparkling rosé, 750ml (optional)', 'Adelaide Hills, SA']],
      dietary: ['Vegetarian', 'Alcohol-free option'], alcohol: true
    },
    {
      handle: 'pamper-her', title: 'Pamper Her', type: 'Hamper', occasions: ['birthday-for-her'],
      recipients: ['Her'], price: 119, images: ['h-skincare-gift', 'h-skincare-wood'],
      rating: 4.8, reviews: 76, best: 11, created: '2026-01-19',
      blurb: 'An evening in: body wash, body cream, bath soak and a silk eye mask.',
      description: 'A spa evening in a box. Native botanical body wash and cream, a Kakadu plum bath soak, a silk eye mask and a candle, all made by small Australian skincare studios.',
      inside: [['Native botanical body wash', 'Byron Bay, NSW'], ['Body cream', 'Margaret River, WA'], ['Kakadu plum bath soak', 'Darwin, NT'], ['Silk eye mask', 'Imported'], ['Soy candle', 'Byron Bay, NSW']],
      dietary: ['Vegan', 'Alcohol-free']
    },
    {
      handle: 'the-long-lunch', title: 'The Long Lunch', type: 'Hamper', occasions: ['birthday-for-her', 'birthday-for-him'],
      recipients: ['Her', 'Him', 'Couples'], price: 169, images: ['h-picnic', 'h-cheese-board'],
      rating: 4.7, reviews: 52, created: '2026-02-02',
      blurb: 'A picnic basket of cheese, crackers, olives and a chilled white for a long afternoon.',
      description: 'Everything for a long afternoon somewhere green: a willow picnic basket, a cheese knife, two cheeses, crackers, olives, quince paste and an Adelaide Hills sauvignon blanc.',
      options: [{ name: 'Pour', values: [{ v: 'Sauvignon blanc' }, { v: 'Non-alcoholic', add: -15 }] }],
      inside: [['Willow picnic basket', 'Imported'], ['Cheese knife', 'Our studio'], ['Brie & vintage cheddar', 'King Island, TAS'], ['Crackers & olives', 'Adelaide Hills, SA'], ['Sauvignon blanc, 750ml', 'Adelaide Hills, SA']],
      dietary: ['Vegetarian', 'Alcohol-free option'], alcohol: true
    },
    {
      handle: 'little-luxuries', title: 'Little Luxuries', type: 'Hamper', occasions: ['birthday-for-her'],
      recipients: ['Her'], price: 79, images: ['basket-linen', 'h-candle-light'],
      rating: 4.9, reviews: 101, best: 7, created: '2026-01-07',
      blurb: 'A woven tray with a candle, a linen notebook and dried flowers, tied in silk.',
      description: 'Our smallest birthday gift and one of the most loved. A woven tray, a linen-bound notebook, an amber glass candle and a sprig of dried gypsophila, tied with ivory silk.',
      inside: [['Woven tray', 'Imported'], ['Linen-bound notebook', 'Collingwood, VIC'], ['Amber glass candle', 'Byron Bay, NSW'], ['Dried gypsophila', 'Our studio']],
      dietary: ['Alcohol-free']
    },

    /* ------------------------------------------------------------------ Birthday for him */
    {
      handle: 'whisky-and-wattleseed', title: 'Whisky & Wattleseed', type: 'Hamper', occasions: ['birthday-for-him'],
      recipients: ['Him'], price: 189, images: ['m-whisky-bottle', 'm-whisky-glasses'],
      rating: 4.9, reviews: 84, best: 8, created: '2026-03-08',
      blurb: 'Tasmanian single malt, wattleseed shortbread and two crystal tumblers.',
      description: 'A small-batch single malt from Hobart, two weighted tumblers, wattleseed shortbread and a block of dark chocolate with sea salt. Choose a bourbon or a zero-proof spirit if you’d rather.',
      options: [{ name: 'Pour', values: [{ v: 'Tasmanian single malt' }, { v: 'Kentucky bourbon', add: -10 }, { v: 'Zero-proof spirit', add: -40 }] }],
      inside: [['Single malt whisky, 500ml', 'Hobart, TAS'], ['Crystal tumblers, pair', 'Imported'], ['Wattleseed shortbread', 'Daylesford, VIC'], ['Dark chocolate & sea salt', 'Daylesford, VIC']],
      dietary: ['Vegetarian', 'Alcohol-free option'], alcohol: true
    },
    {
      handle: 'the-grill-master', title: 'The Grill Master', type: 'Hamper', occasions: ['birthday-for-him'],
      recipients: ['Him'], price: 109, images: ['m-grill', 'm-sausages'],
      rating: 4.7, reviews: 47, created: '2026-01-26',
      blurb: 'Smoked salt, a pepperberry rub, barbecue sauce and a waxed-canvas apron.',
      description: 'For the person who owns the barbecue. Tasmanian pepperberry rub, smoked salt flakes, a small-batch barbecue sauce, a basting brush and a waxed-canvas apron that gets better with every grease mark.',
      inside: [['Pepperberry rub', 'Launceston, TAS'], ['Smoked salt flakes', 'Murray River, SA'], ['Small-batch barbecue sauce', 'Byron Bay, NSW'], ['Basting brush', 'Our studio'], ['Waxed-canvas apron', 'Collingwood, VIC']],
      dietary: ['Vegan', 'Alcohol-free']
    },
    {
      handle: 'craft-and-crunch', title: 'Craft & Crunch', type: 'Hamper', occasions: ['birthday-for-him'],
      recipients: ['Him', 'Team'], price: 89, images: ['m-beer-row', 'm-beer-two'],
      rating: 4.6, reviews: 39, created: '2026-04-11',
      blurb: 'Four craft beers from small breweries, with salted macadamias and pretzels.',
      description: 'Four cans from independent Australian breweries, chosen each month, with salted macadamias, sourdough pretzels and a bottle opener. Choose pale ales, lagers or zero-alcohol.',
      options: [{ name: 'Beer', values: [{ v: 'Pale ale' }, { v: 'Lager' }, { v: 'Zero alcohol', add: -6 }] }],
      inside: [['Craft beer, four cans', 'Marrickville, NSW'], ['Salted macadamias', 'Bundaberg, QLD'], ['Sourdough pretzels', 'Brunswick, VIC'], ['Bottle opener', 'Our studio']],
      dietary: ['Vegan', 'Contains nuts', 'Alcohol-free option'], alcohol: true
    },
    {
      handle: 'coffee-and-co', title: 'Coffee & Co.', type: 'Hamper', occasions: ['birthday-for-him', 'corporate-gifting'],
      recipients: ['Him', 'Team', 'Her'], price: 79, images: ['c-beans', 'm-coffee-flatlay'],
      rating: 4.8, reviews: 58, created: '2026-02-14',
      blurb: 'Two specialty roasts, almond biscotti and a stoneware cup.',
      description: 'Two single-origin roasts from a Marrickville roaster, ground how they brew, with almond biscotti and a stoneware cup made in the Blue Mountains.',
      options: [{ name: 'Grind', values: [{ v: 'Whole beans' }, { v: 'Espresso' }, { v: 'Plunger' }] }],
      inside: [['Single-origin coffee, two × 200g', 'Marrickville, NSW'], ['Almond biscotti', 'Leichhardt, NSW'], ['Stoneware cup', 'Blue Mountains, NSW']],
      dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free']
    },

    /* ------------------------------------------------------------------ Christmas */
    {
      handle: 'a-very-aussie-christmas', title: 'A Very Aussie Christmas', type: 'Hamper', occasions: ['christmas'],
      recipients: ['Family', 'Clients', 'Couples'], price: 179, images: ['x-kraft-pine', 'x-cookie-box-pine'],
      rating: 4.9, reviews: 64, badge: 'New', best: 3, created: '2026-10-05',
      blurb: 'A summer Christmas: sparkling, shortbread, a pudding and mango chutney.',
      description: 'Christmas the way we do it here: in the heat, with something cold. Adelaide Hills sparkling, wattleseed shortbread, a mini plum pudding, mango and lime chutney, macadamia brittle and cherries in syrup, packed in kraft with a sprig of pine.',
      options: [{ name: 'Size', values: [{ v: 'Classic', note: '7 pieces' }, { v: 'Grand', note: '12 pieces', add: 80 }] }],
      inside: [['Sparkling, 750ml', 'Adelaide Hills, SA'], ['Wattleseed shortbread', 'Daylesford, VIC'], ['Mini plum pudding', 'Bowral, NSW'], ['Mango & lime chutney', 'Bowen, QLD'], ['Macadamia brittle', 'Bundaberg, QLD'], ['Cherries in syrup', 'Young, NSW']],
      dietary: ['Vegetarian', 'Contains nuts'], alcohol: true
    },
    {
      handle: 'the-bottlebrush-hamper', title: 'The Bottlebrush Hamper', type: 'Hamper', occasions: ['christmas'],
      recipients: ['Family', 'Clients'], price: 229, images: ['x-kraft-twine', 'x-cookies-orange'],
      rating: 4.8, reviews: 42, created: '2026-10-02',
      blurb: 'Our grand Christmas hamper: shiraz, cheese, gingerbread, fruit cake and bon bons.',
      description: 'A table’s worth of Christmas: Barossa shiraz, a wheel of brie, gingerbread stars, brandy fruit cake, candied orange, festive bon bons and a eucalyptus candle, tied in red and white twine.',
      inside: [['Shiraz, 750ml', 'Barossa Valley, SA'], ['Brie wheel', 'King Island, TAS'], ['Gingerbread stars', 'Daylesford, VIC'], ['Brandy fruit cake', 'Bowral, NSW'], ['Candied orange slices', 'Riverland, SA'], ['Christmas bon bons, four', 'Our studio']],
      dietary: ['Vegetarian'], alcohol: true
    },
    {
      handle: 'twelve-days-treat-box', title: 'Twelve Days Treat Box', type: 'Hamper', occasions: ['christmas'],
      recipients: ['Family', 'Team', 'Her'], price: 99, images: ['x-cookie-decor', 'x-cookie-tray'],
      rating: 4.8, reviews: 51, created: '2026-09-25',
      blurb: 'Twelve small festive treats, one to open each day before Christmas.',
      description: 'Twelve numbered parcels in a kraft box: gingerbread, pecan cookies, fudge, rocky road, a tiny candle and more. Start on 13 December and open one each morning.',
      inside: [['Twelve numbered treat parcels', 'Our studio'], ['Gingerbread & pecan cookies', 'Daylesford, VIC'], ['Fudge & rocky road', 'Bowral, NSW'], ['Mini soy candle', 'Byron Bay, NSW']],
      dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free']
    },
    {
      handle: 'festive-shortbread-tin', title: 'Festive Shortbread Tin', type: 'Hamper', occasions: ['christmas', 'corporate-gifting'],
      recipients: ['Team', 'Clients', 'Family'], price: 69, images: ['x-shortbread-brass', 'x-cookie-tin'],
      rating: 4.9, reviews: 69, best: 12, created: '2026-09-10',
      blurb: 'Butter shortbread stars and wattleseed fingers in a tin for the office kitchen.',
      description: 'Two dozen butter shortbread stars and wattleseed fingers, baked in Daylesford and packed in a reusable tin with a red silk ribbon. The easy answer for a whole office.',
      inside: [['Butter shortbread stars, twelve', 'Daylesford, VIC'], ['Wattleseed shortbread fingers, twelve', 'Daylesford, VIC'], ['Reusable tin', 'Our studio']],
      dietary: ['Vegetarian', 'Alcohol-free']
    },
    {
      handle: 'family-feast-hamper', title: 'Family Feast Hamper', type: 'Hamper', occasions: ['christmas'],
      recipients: ['Family'], price: 349, images: ['x-kraft-flatlay', 'x-kraft-seal'],
      rating: 4.9, reviews: 28, badge: 'Limited', created: '2026-10-08',
      blurb: 'Enough for Christmas lunch: glaze, chutneys, cheese, pudding and two bottles.',
      description: 'For the person hosting. A ham glaze, two chutneys, crackers, two cheeses, a plum pudding with brandy custard, shortbread, Barossa shiraz and Adelaide Hills sparkling. Feeds ten, with leftovers.',
      options: [{ name: 'Pour', values: [{ v: 'With shiraz & sparkling' }, { v: 'Without wine', add: -45 }] }],
      inside: [['Ham glaze', 'Bowral, NSW'], ['Mango & tomato chutneys', 'Bowen, QLD'], ['Brie & cheddar', 'King Island, TAS'], ['Plum pudding & brandy custard', 'Bowral, NSW'], ['Shiraz & sparkling', 'Barossa Valley & Adelaide Hills, SA']],
      dietary: ['Vegetarian', 'Alcohol-free option'], alcohol: true
    },
    {
      handle: 'christmas-cake-and-tawny', title: 'Christmas Cake & Tawny', type: 'Hamper', occasions: ['christmas'],
      recipients: ['Family', 'Him'], price: 89, images: ['x-cake-ribbon', 'x-wax-kraft'],
      rating: 4.8, reviews: 22, created: '2026-09-30',
      blurb: 'A brandy-fed fruit cake wrapped in lace, with a bottle of Rutherglen tawny.',
      description: 'A dark fruit cake, fed with brandy for six weeks and wrapped in paper lace, with a bottle of Rutherglen tawny to pour alongside.',
      options: [{ name: 'Pour', values: [{ v: 'Rutherglen tawny' }, { v: 'Without', add: -30 }] }],
      inside: [['Brandy fruit cake, 800g', 'Bowral, NSW'], ['Tawny, 500ml', 'Rutherglen, VIC']],
      dietary: ['Vegetarian', 'Contains nuts', 'Alcohol-free option'], alcohol: true
    },

    /* ------------------------------------------------------------------ Add-ons */
    { handle: 'dried-native-posy', title: 'Dried Native Posy', type: 'Add-on', occasions: [], recipients: ['Her'], price: 35, images: ['a-posy', 'a-posy'], rating: 4.9, reviews: 64, created: '2026-01-01', blurb: 'Banksia, eucalyptus and strawflower, dried to last for months.', description: 'A hand-tied posy of dried banksia, eucalyptus, strawflower and bunny tails. It lasts for months.', inside: [['Dried native posy', 'Our studio']], dietary: ['Alcohol-free'] },
    { handle: 'eucalyptus-mint-candle', title: 'Eucalyptus & Mint Candle', type: 'Add-on', occasions: [], recipients: ['Her', 'Him'], price: 39, images: ['a-candle', 'a-candle'], rating: 4.8, reviews: 112, created: '2026-01-01', blurb: 'Soy wax in amber glass with a 40-hour burn, poured in Byron Bay.', description: 'Soy wax in amber glass, poured in Byron Bay. About forty hours of eucalyptus and mint.', inside: [['Soy candle, 200g', 'Byron Bay, NSW']], dietary: ['Alcohol-free'] },
    { handle: 'adelaide-hills-sparkling', title: 'Adelaide Hills Sparkling', type: 'Add-on', occasions: [], recipients: ['Her', 'Him'], price: 35, images: ['a-sparkling', 'a-sparkling'], rating: 4.7, reviews: 58, created: '2026-01-01', blurb: 'A crisp chardonnay pinot noir sparkling, 750ml.', description: 'A crisp chardonnay pinot noir sparkling from the Adelaide Hills, packed chilled in summer.', inside: [['Sparkling, 750ml', 'Adelaide Hills, SA']], dietary: ['Contains alcohol'], alcohol: true },
    { handle: 'lavender-shortbread', title: 'Lavender Shortbread', type: 'Add-on', occasions: [], recipients: ['Her', 'Family'], price: 18, images: ['a-shortbread', 'a-shortbread'], rating: 4.9, reviews: 40, created: '2026-01-01', blurb: 'Twelve butter shortbread rounds with Tasmanian lavender.', description: 'Twelve butter shortbread rounds with Tasmanian lavender, baked in Daylesford.', inside: [['Lavender shortbread, twelve', 'Daylesford, VIC']], dietary: ['Vegetarian', 'Alcohol-free'] },
    { handle: 'leatherwood-honey', title: 'Tasmanian Leatherwood Honey', type: 'Add-on', occasions: [], recipients: ['Family', 'Him', 'Her'], price: 24, images: ['a-honey', 'a-honey'], rating: 5.0, reviews: 33, created: '2026-01-01', blurb: 'Raw leatherwood honey from the Tarkine, 250g.', description: 'Raw leatherwood honey from the Tarkine rainforest in north-west Tasmania. Floral, a little spicy, never heated.', inside: [['Leatherwood honey, 250g', 'Tarkine, TAS']], dietary: ['Vegetarian', 'Alcohol-free'] }
  ];

  products.forEach(p => { if (p.alcohol) p.alcoholNote = ALC; });

  /* ---------------------------------------------------------------- Reviews (sample content) */
  const R = (name, place, rating, title, body, product, date, extra) => Object.assign({ name, place, rating, title, body, product, date, verified: true, helpful: 1 + Math.floor((name.length * 7 + body.length) % 23) }, extra || {});
  const reviews = [
    R('Priya S.', 'Harris Park, NSW', 5, 'Felt like home', 'My parents are in Perth this year and I couldn’t fly over. The diyas arrived polished and the kaju katli tasted like the shop near my nani’s house. Mum video-called me holding the card.', 'the-diya-hamper', '2026-10-09', { photo: 'd-lamps-tray' }),
    R('Hannah K.', 'Bondi, NSW', 5, 'She cried (the good kind)', 'Ordered at 11am, delivered by 4pm to my sister’s flat. The flowers were fresh, the box was beautiful and the card was written in proper ink. Worth every cent.', 'birthday-bloom', '2026-10-07', { photo: 'h-bouquet-box' }),
    R('James O.', 'Surry Hills, NSW', 5, 'Sorted our client gifting in a day', 'We sent 64 Boardroom Boxes to clients in four states with our logo on the ribbon. One spreadsheet, one invoice, every box tracked. Two clients emailed to ask where they were from.', 'the-boardroom-box', '2026-10-03'),
    R('Mei L.', 'Box Hill, VIC', 5, 'The softest blanket', 'Bought Hello, Little One in sage for a colleague. Everything matched, the bunny is hand-knitted and the balm smells lovely. She said it was the nicest thing she received.', 'hello-little-one', '2026-09-30', { photo: 'b-hamper' }),
    R('Anjali R.', 'Point Cook, VIC', 5, 'Our first puja in the new house', 'Everything we needed was in the box, down to the cotton wicks. The peda was fresh. I’ve already ordered two more for my in-laws.', 'golden-puja-hamper', '2026-10-10'),
    R('Tom H.', 'Newtown, NSW', 5, 'Small box, big reaction', 'Little Luxuries for my partner’s birthday. Simple, beautifully put together, and the notebook is properly nice. Arrived in a padded outer box so nothing moved.', 'little-luxuries', '2026-09-21', { photo: 'basket-linen' }),
    R('Sarah P.', 'Paddington, QLD', 4, 'Lovely, one small thing', 'Whisky & Wattleseed went down a treat with my dad. I’d have liked tracking updates by SMS as well as email, but the gift itself was spot on.', 'whisky-and-wattleseed', '2026-09-18'),
    R('Grace O.', 'Hobart, TAS', 5, 'Christmas, sorted in October', 'Pre-ordered three Very Aussie Christmas hampers for the family. Chose the dispatch date and forgot about it. The shortbread alone is worth it.', 'a-very-aussie-christmas', '2026-10-06', { photo: 'x-kraft-pine' }),
    R('Rohan M.', 'Parramatta, NSW', 5, 'Our wedding invites, done properly', 'We sent 120 Invitation Boxes in blush with mithai. They assembled, sealed and posted every one. Our aunties are still talking about the wax seals.', 'the-invitation-box', '2026-08-29', { photo: 'w-velvet-suite' }),
    R('Emma T.', 'Fitzroy, VIC', 5, 'Office favourite', 'Ordered the shortbread tins for our end-of-year thank-yous. The wattleseed fingers disappeared first. The tins are now holding pens on every desk.', 'festive-shortbread-tin', '2026-09-12'),
    R('Sophie W.', 'Fremantle, WA', 5, 'Arrived in two days to Perth', 'I was worried about sending from interstate, but it arrived in two days, chilled, and everything was intact. Pamper Her was exactly what my best friend needed.', 'pamper-her', '2026-09-08', { photo: 'h-skincare-gift' }),
    R('Daniel C.', 'Glenelg, SA', 5, 'Great for a long lunch', 'Took the Long Lunch basket to the Adelaide Hills for my wife’s birthday. Everything we needed, including a proper cheese knife.', 'the-long-lunch', '2026-09-02', { photo: 'h-picnic' }),
    R('Aisha N.', 'Auburn, NSW', 5, 'Beautiful mithai', 'The sweets were fresh and not too sugary, which is rare. The marigold toran is now on our front door.', 'mithai-and-marigold-box', '2026-10-04'),
    R('Lucy B.', 'Northcote, VIC', 5, 'Exactly like the photos', 'The Protea Box looked like it had walked out of the website. The olive ribbon, the protea, all of it. My mum has kept the box for her letters.', 'the-protea-box', '2026-09-26', { photo: 'hero-open' }),
    R('Kunal D.', 'Dandenong, VIC', 5, 'Laddoos like home', 'Gave the peacock tin to my neighbours. They came back the next day asking where to buy one.', 'the-laddoo-tin', '2026-10-08', { photo: 'd-laddoo-plate' }),
    R('Olivia F.', 'Mosman, NSW', 5, 'The card got me', 'I typed a long, slightly emotional message and it came out handwritten in fountain pen. My grandmother read it twice.', 'little-luxuries', '2026-08-20'),
    R('Ben A.', 'Brunswick, VIC', 4, 'Good beer, good snacks', 'Craft & Crunch is good value and the macadamias were excellent. Would love a dark beer option.', 'craft-and-crunch', '2026-08-14'),
    R('Chloe G.', 'New Farm, QLD', 5, 'Best baby gift I’ve given', 'The Restore Box is for the mum, not the baby, and that’s why it worked. She said it was the first thing anyone had given just for her.', 'new-mum-restore-box', '2026-08-30', { photo: 'b-soap-flatlay' }),
    R('Vikram J.', 'Wentworthville, NSW', 5, 'Corporate Diwali done right', 'We sent dry fruit platters to 40 clients for Diwali. Packed beautifully and delivered the same week. Our MD is now a fan.', 'diwali-dry-fruit-platter', '2026-10-11'),
    R('Isabella R.', 'Kingston, ACT', 5, 'Easy to order for Canberra', 'Many hamper sites don’t deliver to Canberra properly. This arrived next day with a text when it was on its way.', 'birthday-bloom', '2026-07-28'),
    R('Nathan S.', 'Toowong, QLD', 5, 'Coffee lover approved', 'Got Coffee & Co. ground for plunger. Both roasts were fresh (roasted four days before) and the cup is lovely.', 'coffee-and-co', '2026-07-19'),
    R('Harriet M.', 'Unley, SA', 5, 'My bridesmaids loved them', 'Asked my four girls with the Bridesmaid Proposal Box in blush. They wrote the card exactly as I asked. Lots of happy tears.', 'bridesmaid-proposal-box', '2026-07-11', { photo: 'pink-boxes' }),
    R('Ravi P.', 'Blacktown, NSW', 5, 'Shagun trunks for the family', 'We gave the trunk to our closest family with the wedding invitation inside. It felt traditional and modern at once.', 'the-shagun-trunk', '2026-06-30'),
    R('Georgia L.', 'Manly, NSW', 5, 'New starters love it', 'We give the Welcome Aboard Kit on everyone’s first day now. It’s a small thing that makes people feel expected.', 'welcome-aboard-kit', '2026-09-24'),
    R('Matt W.', 'Carlton, VIC', 4, 'Solid gift for a client', 'The Executive Edit looked expensive in the right way. The truffles were excellent. Delivery took three days to regional VIC.', 'the-executive-edit', '2026-08-06'),
    R('Ella V.', 'Byron Bay, NSW', 5, 'The bear!', 'Cloud Nine Bundle in oat for my niece. The keepsake box is beautifully made. Lovely gift for a first grandchild.', 'cloud-nine-bundle', '2026-06-21', { photo: 'b-bear-box' }),
    R('Sam K.', 'Marrickville, NSW', 5, 'Our team thank-you', 'Ordered 30 Thank You, Team boxes to home addresses across Sydney. They handled the list and each card had the person’s name.', 'thank-you-team', '2026-09-15', { photo: 'c-cookies-box' }),
    R('Neha G.', 'Craigieburn, VIC', 5, 'Festival trunk is stunning', 'The Festival of Lights trunk is the most beautiful thing we’ve received for Diwali. The urli now sits on our coffee table.', 'festival-of-lights-trunk', '2026-10-05', { photo: 'd-diya-platter' }),
    R('Jack T.', 'Cronulla, NSW', 5, 'Dad’s barbecue gift', 'The apron is heavy-duty and the pepperberry rub is now on everything. Good to see Australian producers in there.', 'the-grill-master', '2026-07-02'),
    R('Amelia H.', 'Subiaco, WA', 5, 'Quick to Perth', 'Twelve Days Treat Box arrived in perfect condition. My kids now fight over who opens the next parcel.', 'twelve-days-treat-box', '2026-09-29', { photo: 'x-cookie-decor' }),
    R('Zara A.', 'Liverpool, NSW', 5, 'Chai lovers rejoice', 'The kulhad cups are adorable and the masala chai is the real thing, not a sweet powder.', 'saffron-and-chai-collection', '2026-08-25', { photo: 'd-chai' }),
    R('Patrick N.', 'Launceston, TAS', 3, 'Nice, but it arrived a day late', 'The hamper itself was lovely, but the courier missed the promised day. Customer service called me and refunded the delivery fee without me asking.', 'the-bottlebrush-hamper', '2026-07-15'),
    R('Ruby C.', 'Balmain, NSW', 5, 'Favourite save-the-dates', 'We ordered 150 petite boxes with mithai. Guests kept them on their fridges. Honestly the best part of our planning.', 'save-the-date-petite', '2026-05-30', { photo: 'favours' }),
    R('Leo F.', 'South Yarra, VIC', 5, 'Client crate was a hit', 'Sent the Client Appreciation Crate for a board meeting. Gone in an hour. Lovely presentation.', 'client-appreciation-crate', '2026-08-18'),
    R('Ivy Z.', 'Chatswood, NSW', 5, 'A Christmas cake worth sending', 'Fruit cake was moist and rich, and the tawny was a nice touch for my grandfather.', 'christmas-cake-and-tawny', '2026-10-01'),
    R('Noah B.', 'Bulimba, QLD', 5, 'Family feast for 12', 'Hosting Christmas for 12, and this covered our grazing table. Pre-ordered so it arrives on the 22nd.', 'family-feast-hamper', '2026-10-09')
  ];

  const reviewStats = { average: 4.9, count: 1284, dist: { 5: 1142, 4: 109, 3: 21, 2: 8, 1: 4 } };

  /* ---------------------------------------------------------------- UGC reels (sample stock footage) */
  const ugc = [
    { video: 'bouquet', product: 'birthday-bloom', name: 'Hannah', place: 'Bondi, NSW', quote: 'Ordered at eleven, on her doorstep by four. She cried, the good kind.' },
    { video: 'diya-hands', product: 'the-diya-hamper', name: 'Priya', place: 'Harris Park, NSW', quote: 'We lit the diyas the minute they arrived.' },
    { video: 'unboxing-family', product: 'hello-little-one', name: 'Mei', place: 'Box Hill, VIC', quote: 'My daughter unwrapped it before I could.' },
    { video: 'sparkling-pour', product: 'the-long-lunch', name: 'Jess', place: 'Glenelg, SA', quote: 'Long lunch, longer afternoon.' },
    { video: 'diwali-thali', product: 'golden-puja-hamper', name: 'Anjali', place: 'Point Cook, VIC', quote: 'Our first puja in the new house.' },
    { video: 'birthday-smile', product: 'pamper-her', name: 'Sophie', place: 'Fremantle, WA', quote: 'Two days to Perth and not a thing out of place.' },
    { video: 'gold-gifts', product: 'twelve-days-treat-box', name: 'Emma', place: 'Fitzroy, VIC', quote: 'Office Secret Santa, sorted.' },
    { video: 'handover', product: 'little-luxuries', name: 'Tom', place: 'Newtown, NSW', quote: 'Small box, big reaction.' },
    { video: 'kraft-wrap', product: 'a-very-aussie-christmas', name: 'Grace', place: 'Hobart, TAS', quote: 'Wrapped better than I ever could.' }
  ];

  return { OCCASIONS, collections, products, reviews, reviewStats, ugc, focus };
})();
